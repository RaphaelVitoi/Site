# -*- coding: utf-8 -*-
"""SOTA Test Suite for C++ SIMD Quantum Tensor Engine Bridge.

Direct pytest mapping of the high-performance AVX2/nanobind tensor bridge.
Protocolo Chico SOTA v8.0 GOLD.
"""

import sys
from pathlib import Path
from typing import Any
import numpy as np
import pytest

# Assegura que a raiz do projeto esteja no sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Imports defensivos de topo de módulo para conformidade estrita de AST
try:
    import core.quantum_tensor_engine as _qte_core
except ImportError:
    _qte_core = None

try:
    import quantum_tensor_engine as _qte_root
except ImportError:
    _qte_root = None

from core.tensor_engine.src.test_tensor_bridge import run_benchmark


@pytest.fixture(name="tensor_module", scope="module")
def fixture_tensor_module() -> Any:
    """Carrega o motor C++ de aceleração tensorial nanobind."""
    engine = _qte_core or _qte_root
    if engine is None:
        pytest.skip("Módulo quantum_tensor_engine não compilado no ambiente.")
    return engine


def numpy_icm_distortion(
    fold: np.ndarray,
    _call: np.ndarray,
    raise_: np.ndarray,
    ip_rp: np.ndarray,
    oop_rp: np.ndarray,
    pot: np.ndarray,
    topologic_aggression: float,
    active_players: int,
    street_idx: int,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Modelo analítico NumPy de distorção de ICM como baseline."""
    _ = _call  # Garante uso semântico do parâmetro no baseline de assinatura
    inv_7_5 = np.float32(1.0 / 7.5)
    gravity = np.maximum(np.log(pot * inv_7_5), np.float32(0.0)).astype(np.float32)
    damping = np.float32(1.0) / (np.float32(1.0) + gravity * np.float32(0.12))
    eff_agg = np.float32(1.0) + (np.float32(topologic_aggression) - np.float32(1.0)) * damping

    pressure = (oop_rp + ip_rp) * np.float32(0.5)
    drift_base = np.float32(0.004) * (np.float32(street_idx) + np.float32(1.0))
    drift_penalty = raise_ * (pressure * drift_base * (np.float32(1.0) + gravity * np.float32(0.5)))

    raise_shift = (
        raise_ * (eff_agg - np.float32(1.0))
        - drift_penalty
        - (pressure * (np.float32(0.003) * np.float32(active_players)))
    )
    n_raise = np.maximum(raise_ + raise_shift, np.float32(0.0)).astype(np.float32)

    max_fold = np.float32(0.88) - np.minimum(gravity * np.float32(0.05), np.float32(0.3))
    fold_shift = fold * (pressure * np.float32(0.012)) + np.maximum(raise_ - n_raise, np.float32(0.0))
    n_fold = np.minimum(np.maximum(fold + fold_shift, np.float32(0.0)), max_fold).astype(np.float32)
    n_call = np.maximum(np.float32(1.0) - n_fold - n_raise, np.float32(0.0)).astype(np.float32)

    total = n_fold + n_call + n_raise
    mask = total > np.float32(0.0)

    with np.errstate(divide="ignore", invalid="ignore"):
        inv_total = np.float32(1.0) / total

    n_fold = np.where(mask, n_fold * inv_total, np.float32(1.0)).astype(np.float32)
    n_call = np.where(mask, n_call * inv_total, np.float32(0.0)).astype(np.float32)
    n_raise = np.where(mask, n_raise * inv_total, np.float32(0.0)).astype(np.float32)

    return n_fold, n_call, n_raise


def test_perspective_simd_isometry(tensor_module: Any) -> None:
    """Valida a isometria exata do cálculo de perspectiva C++ SIMD vs NumPy."""
    n_elements = 100_000
    rng = np.random.default_rng(42)
    equity = rng.random(n_elements, dtype=np.float32)
    pot = rng.random(n_elements, dtype=np.float32)
    human_noise = 0.05

    res_numpy = (equity * pot) * (1.0 - human_noise)
    res_cpp = tensor_module.calculate_perspective_simd(equity, pot, human_noise)

    assert isinstance(res_cpp, np.ndarray)
    assert res_cpp.shape == (n_elements,)
    assert res_cpp.dtype == np.float32
    np.testing.assert_allclose(res_numpy, res_cpp, rtol=1e-5, atol=1e-5)


def test_icm_distortion_simd_isometry(tensor_module: Any) -> None:
    """Valida a convergência e simetria do resolvedor SIMD de ICM."""
    n_elements = 100_000
    rng = np.random.default_rng(42)

    fold_arr = rng.uniform(0.1, 0.5, n_elements).astype(np.float32)
    call_arr = rng.uniform(0.1, 0.4, n_elements).astype(np.float32)
    raise_arr = (np.float32(1.0) - fold_arr - call_arr).astype(np.float32)
    ip_rp = rng.uniform(1.0, 5.0, n_elements).astype(np.float32)
    oop_rp = rng.uniform(1.0, 5.0, n_elements).astype(np.float32)
    pot_size = rng.uniform(10.0, 100.0, n_elements).astype(np.float32)

    top_agg = 1.2
    players = 3
    street = 2

    np_f, np_c, np_r = numpy_icm_distortion(
        fold_arr, call_arr, raise_arr, ip_rp, oop_rp, pot_size, top_agg, players, street
    )

    cpp_f, cpp_c, cpp_r = tensor_module.solve_icm_distortion_simd(
        fold_arr, call_arr, raise_arr, ip_rp, oop_rp, pot_size, top_agg, players, street
    )

    # Simetria e tolerância numérica AVX2 Fast-Math
    np.testing.assert_allclose(np_f, cpp_f, rtol=5e-3, atol=5e-3)
    np.testing.assert_allclose(np_c, cpp_c, rtol=5e-3, atol=5e-3)
    np.testing.assert_allclose(np_r, cpp_r, rtol=5e-3, atol=5e-3)

    # Conservação estrita de probabilidade (sum == 1.0)
    total_prob = cpp_f + cpp_c + cpp_r
    np.testing.assert_allclose(total_prob, np.ones(n_elements, dtype=np.float32), rtol=1e-4, atol=1e-4)


def test_tensor_bridge_standalone_runner() -> None:
    """Garante que o script de benchmark standalone roda sem exceções."""
    run_benchmark()
