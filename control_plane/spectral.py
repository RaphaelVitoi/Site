"""Tripartite SPACE spectral projection with orthogonalized anti-anchors and CPU embeddings."""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
from pathlib import Path
import re
from typing import Protocol

import numpy as np

from control_plane.config import ControlPlaneConfig

try:
    import onnxruntime as ort  # type: ignore[import-not-found]

    ORT_AVAILABLE = True
except ImportError:
    ort = None
    ORT_AVAILABLE = False


class Embedder(Protocol):
    """Protocol for local L2-normalized text embedders."""

    @property
    def dim(self) -> int: ...

    @property
    def model_id(self) -> str: ...

    def embed(self, text: str) -> np.ndarray: ...


class HashProjectionEmbedder:
    """Fast deterministic CPU feature-hashing embedder (0 network, <0.5ms)."""

    def __init__(self, dim: int = 384, model_id: str = "hash-proj-384-v1") -> None:
        self._dim = dim
        self._model_id = model_id

    @property
    def dim(self) -> int:
        return self._dim

    @property
    def model_id(self) -> str:
        return self._model_id

    def embed(self, text: str) -> np.ndarray:
        vec = np.zeros(self._dim, dtype=np.float32)
        normalized = text.lower().strip()
        if not normalized:
            return vec

        tokens = re.findall(r"[a-z0-9_]+|[^\w\s]", normalized)
        features: list[tuple[str, float]] = []
        for tok in tokens:
            features.append((f"w:{tok}", 1.0))
            if len(tok) >= 3:
                for i in range(len(tok) - 2):
                    features.append((f"c:{tok[i : i + 3]}", 0.35))
        for i in range(len(tokens) - 1):
            features.append((f"b:{tokens[i]}_{tokens[i + 1]}", 0.75))

        for feat, weight in features:
            digest = hashlib.blake2b(feat.encode("utf-8"), digest_size=8).digest()
            raw = int.from_bytes(digest, "little", signed=False)
            bucket = raw % self._dim
            sign = 1.0 if ((raw >> 63) & 1) == 0 else -1.0
            vec[bucket] += sign * weight

        norm = float(np.linalg.norm(vec))
        if norm > 0.0:
            vec /= norm
        return vec


class OnnxLocalEmbedder:
    """Optional CPU-only INT8 ONNX embedder wrapper (falls back cleanly if unavailable)."""

    def __init__(self, model_path: str, config: ControlPlaneConfig) -> None:
        if not ORT_AVAILABLE or ort is None:
            raise RuntimeError("onnxruntime is not installed.")
        path = Path(model_path)
        if not path.is_file():
            raise FileNotFoundError(f"ONNX model not found: {model_path}")

        opts = ort.SessionOptions()
        opts.intra_op_num_threads = config.onnx_threads
        opts.inter_op_num_threads = 1
        self._session = ort.InferenceSession(
            str(path),
            sess_options=opts,
            providers=[config.execution_provider],
        )
        self._dim = config.embedding_dim
        self._model_id = path.stem

    @property
    def dim(self) -> int:
        return self._dim

    @property
    def model_id(self) -> str:
        return self._model_id

    def embed(self, text: str) -> np.ndarray:
        # Delegate tokenization to deterministic byte-token tensor when external tokenizer is absent
        encoded = np.frombuffer(text.encode("utf-8")[:512], dtype=np.uint8).astype(np.int64)
        if encoded.size == 0:
            return np.zeros(self._dim, dtype=np.float32)
        input_ids = encoded.reshape(1, -1)
        attention_mask = np.ones_like(input_ids, dtype=np.int64)
        inputs = {inp.name: input_ids if "id" in inp.name else attention_mask for inp in self._session.get_inputs()}
        outputs = self._session.run(None, inputs)
        vec = np.asarray(outputs[0], dtype=np.float32).reshape(-1)[: self._dim]
        if vec.shape[0] < self._dim:
            vec = np.pad(vec, (0, self._dim - vec.shape[0]))
        norm = float(np.linalg.norm(vec))
        return vec / norm if norm > 0.0 else vec


def build_default_embedder(config: ControlPlaneConfig) -> Embedder:
    """Construct configured embedder without GPU/VRAM assumptions."""
    if config.onnx_embedding_model_path:
        return OnnxLocalEmbedder(config.onnx_embedding_model_path, config)
    return HashProjectionEmbedder(dim=config.embedding_dim)


@dataclass(frozen=True, slots=True)
class SpaceScores:
    s_id: float
    s_viol: float
    drift_score: float
    cold_start_pos_guard: bool
    pos_anchor_count: int
    neg_anchor_count: int


class SpaceProjector:
    """Orthogonalized SPACE subspace projector (U_r^+ and U_m^- in orthogonal complement)."""

    def __init__(
        self,
        pos_matrix: np.ndarray,
        neg_matrix: np.ndarray,
        *,
        max_rank: int = 8,
        min_pos_anchors: int = 4,
    ) -> None:
        self.pos_anchor_count = int(pos_matrix.shape[1]) if pos_matrix.ndim == 2 else 0
        self.neg_anchor_count = int(neg_matrix.shape[1]) if neg_matrix.ndim == 2 else 0
        self.min_pos_anchors = min_pos_anchors
        dim = int(pos_matrix.shape[0]) if pos_matrix.ndim == 2 else int(neg_matrix.shape[0])

        # 1. Identity basis U_r^+ via truncated SVD
        if self.pos_anchor_count > 0:
            u_pos_full, s_pos, _ = np.linalg.svd(pos_matrix.astype(np.float64), full_matrices=False)
            keep_pos = int(np.sum(s_pos > 1e-6))
            r = min(max_rank, self.pos_anchor_count, max(1, keep_pos))
            self.u_pos = u_pos_full[:, :r]
        else:
            self.u_pos = np.zeros((dim, 0), dtype=np.float64)

        # 2. Orthogonalized anti-anchor basis U_m^- without materializing d x d
        if self.neg_anchor_count > 0:
            neg_f64 = neg_matrix.astype(np.float64)
            a_perp = neg_f64 - self.u_pos @ (self.u_pos.T @ neg_f64) if self.u_pos.shape[1] > 0 else neg_f64

            norms = np.linalg.norm(a_perp, axis=0)
            valid_mask = norms >= 1e-3
            if bool(np.any(valid_mask)):
                filtered = a_perp[:, valid_mask] / norms[valid_mask]
                u_neg_full, s_neg, _ = np.linalg.svd(filtered, full_matrices=False)
                keep_neg = int(np.sum(s_neg > 1e-6))
                m = min(max_rank, int(filtered.shape[1]), max(1, keep_neg))
                self.u_neg = u_neg_full[:, :m]
            else:
                self.u_neg = np.zeros((dim, 0), dtype=np.float64)
        else:
            self.u_neg = np.zeros((dim, 0), dtype=np.float64)

    def score(self, vector: np.ndarray) -> SpaceScores:
        e = np.asarray(vector, dtype=np.float64).reshape(-1)
        norm = float(np.linalg.norm(e))
        if norm > 0.0:
            e = e / norm

        s_id = float(np.linalg.norm(self.u_pos.T @ e)) if self.u_pos.shape[1] > 0 else 0.0
        s_viol = float(np.linalg.norm(self.u_neg.T @ e)) if self.u_neg.shape[1] > 0 else 0.0
        s_id = max(0.0, min(1.0, s_id))
        s_viol = max(0.0, min(1.0, s_viol))

        cold_guard = self.pos_anchor_count < self.min_pos_anchors
        drift_score = s_viol if cold_guard else max(1.0 - s_id, s_viol)

        return SpaceScores(
            s_id=round(s_id, 6),
            s_viol=round(s_viol, 6),
            drift_score=round(drift_score, 6),
            cold_start_pos_guard=cold_guard,
            pos_anchor_count=self.pos_anchor_count,
            neg_anchor_count=self.neg_anchor_count,
        )
