"""
Pontes de Integracao SOTA v8.0 GOLD para a malha de Agentes Customizados e Subagentes:
- RAGFlowBridge: Agentic RAG (/api/v1/retrieval) com citacoes rastreaveis.
- N8NBridge: Orquestracao de webhooks e workflows (/webhook, /api/v1/workflows).
- MeshCapabilities: Snapshot de disponibilidade real (Hermes, OpenRouter :free, Ollama, RAGFlow, n8n).
"""

from __future__ import annotations

import base64
from collections.abc import Mapping
from dataclasses import dataclass
from datetime import UTC, datetime
from functools import lru_cache
import hashlib
import ipaddress
import logging
import os
import re
import shutil
import threading
import time
from typing import Any
from urllib.parse import urlsplit

try:
    import winreg
except ImportError:
    winreg = None  # type: ignore[assignment]

import aiohttp

from utils.text import enforce_pure_ascii

logger = logging.getLogger(__name__)

_KEYRING_SALT: bytes = b"chico_sota_mesh_keyring_v1"
_SAFE_PATH_RE = re.compile(r"^[A-Za-z0-9_/-]+$")
_SAFE_ID_RE = re.compile(r"^[A-Za-z0-9_-]+$")
_JSON_CONTENT_TYPE = "application/json"
_RAGFLOW_DEPTH_PRESETS: dict[str, tuple[int, float]] = {
    "low": (3, 0.35),
    "medium": (5, 0.25),
    "high": (8, 0.20),
    "ultra": (12, 0.15),
}


def _env_or_reg(name: str, default: str = "") -> str:
    """Resolve variavel em os.environ com fallback seguro para Registro do Windows (HKCU -> HKLM)."""
    val = (os.environ.get(name) or "").strip()
    if val:
        return val
    allow_reg = "PYTEST_CURRENT_TEST" not in os.environ or os.environ.get("CHICO_REGISTRY_ENV_FALLBACK") == "1"
    if allow_reg and winreg is not None:
        for root, subkey in (
            (winreg.HKEY_CURRENT_USER, "Environment"),
            (winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment"),
        ):
            try:
                with winreg.OpenKey(root, subkey) as reg_key:
                    raw_val, _ = winreg.QueryValueEx(reg_key, name)
                    if raw_val and str(raw_val).strip():
                        return str(raw_val).strip()
            except OSError:
                continue
    return default


@lru_cache(maxsize=256)
def _key_sha8(secret: str) -> str:
    """Fingerprint scrypt truncado para auditoria e rotacao sem expor segredos."""
    return hashlib.scrypt(secret.encode("utf-8"), salt=_KEYRING_SALT, n=1024, r=8, p=1, dklen=16).hex()[:8]


class ServiceKeyRing:
    """Pool rotacional de credenciais HKCU/HKLM com circuit breaker (401/403 revoga, 429 cooldown)."""

    def __init__(self, service_name: str, base_vars: tuple[str, ...], max_slots: int = 20) -> None:
        self.service_name = service_name
        self.base_vars = base_vars
        self.max_slots = max_slots
        self._lock = threading.Lock()
        self._cursor = 0
        self._revoked: set[str] = set()
        self._cooldown_until: dict[str, float] = {}

    def reset(self) -> None:
        with self._lock:
            self._cursor = 0
            self._revoked.clear()
            self._cooldown_until.clear()

    def candidates(self) -> list[str]:
        seen: set[str] = set()
        ordered: list[str] = []

        def _add(raw: str) -> None:
            cleaned = raw.strip()
            if cleaned and cleaned not in seen:
                seen.add(cleaned)
                ordered.append(cleaned)

        for var_name in self.base_vars:
            _add(_env_or_reg(var_name))
            for idx in range(1, self.max_slots + 1):
                _add(_env_or_reg(f"{var_name}_{idx}"))
            csv_raw = _env_or_reg(f"{var_name}S")
            if csv_raw:
                for part in csv_raw.split(","):
                    _add(part)
        return ordered

    def active_keys(self) -> list[str]:
        all_keys = self.candidates()
        if not all_keys:
            return []
        now = time.monotonic()
        with self._lock:
            expired = [fp for fp, until in self._cooldown_until.items() if now >= until]
            for fp in expired:
                self._cooldown_until.pop(fp, None)

            active = [
                k for k in all_keys if (fp := _key_sha8(k)) not in self._revoked and fp not in self._cooldown_until
            ]
            if not active:
                active = [k for k in all_keys if _key_sha8(k) not in self._revoked]
            if not active:
                return []
            start = self._cursor % len(active)
            return active[start:] + active[:start]

    def primary_key(self) -> str:
        keys = self.active_keys()
        if keys:
            return keys[0]
        raw = self.candidates()
        return raw[0] if raw else ""

    def mark_success(self, key: str) -> None:
        fp = _key_sha8(key)
        with self._lock:
            self._cooldown_until.pop(fp, None)
            self._cursor += 1

    def mark_unauthorized(self, key: str) -> None:
        fp = _key_sha8(key)
        with self._lock:
            self._revoked.add(fp)
            self._cooldown_until.pop(fp, None)
            self._cursor += 1
        logger.warning("[KEYRING:%s] Chave sha8=%s rejeitada (401/403); rotacionando.", self.service_name, fp)

    def mark_rate_limited(self, key: str, cooldown_s: float = 60.0) -> None:
        fp = _key_sha8(key)
        with self._lock:
            self._cooldown_until[fp] = time.monotonic() + max(5.0, cooldown_s)
            self._cursor += 1

    def mark_transient_error(self, key: str, cooldown_s: float = 15.0) -> None:
        fp = _key_sha8(key)
        with self._lock:
            self._cooldown_until[fp] = time.monotonic() + max(2.0, cooldown_s)
            self._cursor += 1

    def telemetry(self) -> dict[str, Any]:
        all_keys = self.candidates()
        now = time.monotonic()
        with self._lock:
            sha8s = [_key_sha8(k) for k in all_keys]
            revoked = sum(1 for fp in sha8s if fp in self._revoked)
            cooled = sum(1 for fp in sha8s if fp not in self._revoked and self._cooldown_until.get(fp, 0.0) > now)
        return {
            "total": len(all_keys),
            "active": max(0, len(all_keys) - revoked - cooled),
            "revoked": revoked,
            "sha8s": sha8s,
        }


_RAGFLOW_RING = ServiceKeyRing("ragflow", ("RAGFLOW_API_KEY",))
_N8N_RING = ServiceKeyRing("n8n", ("N8N_API_KEY",))
_NEO4J_RING = ServiceKeyRing("neo4j_aura", ("NEO4J_AURA_BEARER_TOKEN", "NEO4J_AURA_API_KEY"))
_DEVIN_RING = ServiceKeyRing("devin", ("DEVIN_API_TOKEN", "DEVIN_API_KEY"))
_VERCEL_RING = ServiceKeyRing("vercel", ("VERCEL_TOKEN",))
_DOCKER_RING = ServiceKeyRing("docker", ("DOCKER_PAT", "DOCKER_TOKEN"))


def _parse_csv_env(name: str) -> tuple[str, ...]:
    raw = _env_or_reg(name)
    if not raw:
        return ()
    return tuple(part.strip() for part in raw.split(",") if part.strip())


def _is_safe_service_url(raw_url: str) -> bool:
    """Valida scheme HTTP(S) e bloqueia alvos link-local/metadata (SSRF guard)."""
    candidate = raw_url.strip()
    if not candidate:
        return False
    parsed = urlsplit(candidate)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        return False
    host = parsed.hostname.lower()
    if host in ("localhost", "127.0.0.1", "::1"):
        return True
    try:
        ip_obj = ipaddress.ip_address(host)
        if ip_obj.is_link_local or ip_obj.is_multicast:
            return False
    except ValueError:
        pass
    return parsed.scheme == "https" or host.endswith(".local")


@dataclass(frozen=True, slots=True)
class RAGFlowCitation:
    """Trecho fundamentado retornado pelo RAGFlow com pontuacao e origem."""

    doc_id: str
    document_name: str
    similarity: float
    content: str


@dataclass(frozen=True, slots=True)
class RAGFlowRetrievalResult:
    """Resultado consolidado de recuperacao agentica do RAGFlow."""

    configured: bool
    ok: bool
    citations: tuple[RAGFlowCitation, ...] = ()
    error: str = ""

    def format_context_block(self, max_chars: int = 2400) -> str:
        """Formata citacoes rastreaveis em bloco Pure ASCII para injecao no prompt."""
        if not self.citations:
            return ""
        lines = ["[RAGFLOW GROUNDED CITATIONS]"]
        used = len(lines[0])
        for idx, cit in enumerate(self.citations, start=1):
            snippet = enforce_pure_ascii(" ".join(cit.content.split()))
            if len(snippet) > 360:
                snippet = f"{snippet[:357]}..."
            doc_label = enforce_pure_ascii(cit.document_name or cit.doc_id or "dataset")
            entry = f"[RF-{idx}] {doc_label} (score={cit.similarity:.3f}): {snippet}"
            if used + len(entry) + 1 > max_chars:
                break
            lines.append(entry)
            used += len(entry) + 1
        return "\n".join(lines) if len(lines) > 1 else ""


async def _ragflow_retrieval_attempt(
    session: aiohttp.ClientSession,
    url: str,
    payload: dict[str, Any],
    api_key: str,
) -> tuple[Any, str]:
    """Uma tentativa de retrieval; (body, "") em sucesso ou (None, erro) para rotacionar."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": _JSON_CONTENT_TYPE,
    }
    async with session.post(url, json=payload, headers=headers) as resp:
        if resp.status in (401, 403):
            _RAGFLOW_RING.mark_unauthorized(api_key)
            return None, f"HTTP {resp.status}"
        if resp.status == 429:
            _RAGFLOW_RING.mark_rate_limited(api_key)
            return None, "HTTP 429"
        if resp.status != 200:
            _RAGFLOW_RING.mark_transient_error(api_key)
            return None, f"HTTP {resp.status}"
        body = await resp.json()
        json_code = body.get("code") if isinstance(body, Mapping) else None
        if json_code == 403:
            _RAGFLOW_RING.mark_rate_limited(api_key, cooldown_s=300.0)
            return None, "plan_upgrade_required (code=403)"
        _RAGFLOW_RING.mark_success(api_key)
        return body, ""


def _ragflow_citations_from_body(body: Any, top_k: int) -> tuple[RAGFlowCitation, ...]:
    """Converte os chunks brutos do retrieval em citacoes tipadas."""
    raw_chunks = ((body.get("data") or {}).get("chunks") or []) if isinstance(body, Mapping) else []
    citations: list[RAGFlowCitation] = []
    for chunk in raw_chunks[:top_k]:
        if not isinstance(chunk, Mapping):
            continue
        text = str(chunk.get("content") or chunk.get("content_with_weight") or "").strip()
        if not text:
            continue
        try:
            score = float(chunk.get("similarity") or chunk.get("vector_similarity") or 0.0)
        except (TypeError, ValueError):
            score = 0.0
        citations.append(
            RAGFlowCitation(
                doc_id=str(chunk.get("document_id") or chunk.get("doc_id") or ""),
                document_name=str(chunk.get("document_keyword") or chunk.get("docnm_kwd") or "dataset"),
                similarity=score,
                content=text,
            )
        )
    return tuple(citations)


class RAGFlowBridge:
    """Cliente assincrono fino para Agentic Retrieval do RAGFlow (local ou cloud)."""

    @staticmethod
    def api_base() -> str:
        return _env_or_reg("RAGFLOW_API_BASE", "http://127.0.0.1:9380").rstrip("/")

    @staticmethod
    def api_key() -> str:
        return _RAGFLOW_RING.primary_key()

    @staticmethod
    def default_dataset_ids() -> tuple[str, ...]:
        return _parse_csv_env("RAGFLOW_DATASET_IDS")

    @classmethod
    def is_configured(cls, dataset_ids: tuple[str, ...] | list[str] | None = None) -> bool:
        keys = _RAGFLOW_RING.active_keys() or _RAGFLOW_RING.candidates()
        datasets = tuple(dataset_ids) if dataset_ids else cls.default_dataset_ids()
        return bool(keys and datasets and _is_safe_service_url(cls.api_base()))

    @classmethod
    async def retrieve_grounded_context(
        cls,
        query: str,
        *,
        dataset_ids: tuple[str, ...] | list[str] | None = None,
        thinking_depth: str = "medium",
        timeout_seconds: float = 4.0,
    ) -> RAGFlowRetrievalResult:
        """Consulta /api/v1/retrieval com rotacao de chaves e profundidade ajustavel."""
        resolved_ids = tuple(s for d in (dataset_ids or cls.default_dataset_ids()) if (s := d.strip()))
        candidate_keys = _RAGFLOW_RING.active_keys()
        if not candidate_keys or not resolved_ids or not query.strip():
            return RAGFlowRetrievalResult(configured=False, ok=False)

        base = cls.api_base()
        if not _is_safe_service_url(base):
            return RAGFlowRetrievalResult(configured=True, ok=False, error="unsafe_ragflow_base_url")

        top_k, sim_threshold = _RAGFLOW_DEPTH_PRESETS.get(thinking_depth.lower(), (5, 0.25))
        payload: dict[str, Any] = {
            "question": query[:2000],
            "dataset_ids": list(resolved_ids),
            "page": 1,
            "page_size": top_k,
            "similarity_threshold": sim_threshold,
            "vector_similarity_weight": 0.3,
            "top_k": top_k * 2,
            "highlight": False,
        }
        timeout = aiohttp.ClientTimeout(total=max(0.5, float(timeout_seconds)), sock_connect=1.5)
        body: Any = None
        last_error = ""
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                for api_key in candidate_keys:
                    body, last_error = await _ragflow_retrieval_attempt(
                        session, f"{base}/api/v1/retrieval", payload, api_key
                    )
                    if body is not None:
                        break
        except Exception as exc:  # noqa: BLE001
            logger.debug("[RAGFLOW BRIDGE] Falha na consulta de retrieval: %s", exc)
            return RAGFlowRetrievalResult(configured=True, ok=False, error=type(exc).__name__)

        if body is None:
            return RAGFlowRetrievalResult(configured=True, ok=False, error=last_error or "retrieval_failed")

        return RAGFlowRetrievalResult(
            configured=True,
            ok=True,
            citations=_ragflow_citations_from_body(body, top_k),
        )


@dataclass(frozen=True, slots=True)
class N8NDispatchResult:
    """Resultado auditavel de disparo de webhook ou workflow no n8n."""

    configured: bool
    dispatched: bool
    target: str = ""
    status_code: int = 0
    error: str = ""


async def _post_n8n_with_key_rotation(
    session: aiohttp.ClientSession,
    target_url: str,
    payload: dict[str, Any],
    keys_to_try: list[str],
) -> N8NDispatchResult:
    """POST com rotacao de X-N8N-API-KEY; para no primeiro 2xx ou erro irrecuperavel."""
    last_status = 0
    for key_cand in keys_to_try:
        headers: dict[str, str] = {"Content-Type": _JSON_CONTENT_TYPE}
        if key_cand:
            headers["X-N8N-API-KEY"] = key_cand
        async with session.post(target_url, json=payload, headers=headers) as resp:
            last_status = resp.status
            if 200 <= resp.status < 300:
                if key_cand:
                    _N8N_RING.mark_success(key_cand)
                return N8NDispatchResult(
                    configured=True,
                    dispatched=True,
                    target=target_url,
                    status_code=resp.status,
                )
            if key_cand and resp.status in (401, 403):
                _N8N_RING.mark_unauthorized(key_cand)
                continue
            if key_cand and resp.status == 429:
                _N8N_RING.mark_rate_limited(key_cand)
                continue
            break
    return N8NDispatchResult(
        configured=True,
        dispatched=False,
        target=target_url,
        status_code=last_status,
        error=f"HTTP {last_status}",
    )


class N8NBridge:
    """Cliente assincrono seguro para automacoes n8n (webhooks e workflows REST)."""

    @staticmethod
    def api_base() -> str:
        return _env_or_reg("N8N_API_BASE", "http://127.0.0.1:5678").rstrip("/")

    @staticmethod
    def webhook_base() -> str:
        explicit = _env_or_reg("N8N_WEBHOOK_BASE").rstrip("/")
        if explicit:
            return explicit
        if _env_or_reg("N8N_API_BASE"):
            return f"{N8NBridge.api_base()}/webhook"
        return ""

    @staticmethod
    def api_key() -> str:
        return _N8N_RING.primary_key()

    @classmethod
    def is_configured(cls) -> bool:
        has_webhook = bool(cls.webhook_base() and _is_safe_service_url(cls.webhook_base()))
        has_api = bool(_env_or_reg("N8N_API_BASE") and cls.api_key() and _is_safe_service_url(cls.api_base()))
        return has_webhook or has_api

    @classmethod
    async def dispatch_event(
        cls,
        payload: Mapping[str, Any],
        *,
        webhook_path: str | None = None,
        workflow_id: str | None = None,
        timeout_seconds: float = 5.0,
    ) -> N8NDispatchResult:
        """Dispara webhook (prioritario) ou workflow n8n por ID com rotacao de X-N8N-API-KEY."""
        resolved_webhook = (webhook_path or _env_or_reg("N8N_DEFAULT_WEBHOOK_PATH")).lstrip("/")
        resolved_workflow = (workflow_id or "").strip()

        target_url, early_result = cls._resolve_dispatch_target(resolved_webhook, resolved_workflow)
        if early_result is not None:
            return early_result

        enriched_payload = {
            "timestamp": datetime.now(UTC).isoformat(),
            "source": "chico_sota_mesh",
            **dict(payload),
        }
        keys_to_try = _N8N_RING.active_keys() or [""]
        timeout = aiohttp.ClientTimeout(total=max(0.5, float(timeout_seconds)), sock_connect=1.5)
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                return await _post_n8n_with_key_rotation(session, target_url, enriched_payload, keys_to_try)
        except Exception as exc:  # noqa: BLE001
            logger.debug("[N8N BRIDGE] Falha no disparo para '%s': %s", target_url, exc)
            return N8NDispatchResult(
                configured=True,
                dispatched=False,
                target=target_url,
                error=type(exc).__name__,
            )

    @classmethod
    def _resolve_dispatch_target(
        cls, resolved_webhook: str, resolved_workflow: str
    ) -> tuple[str, N8NDispatchResult | None]:
        """Resolve webhook (prioritario) ou workflow para URL; result != None indica saida antecipada."""
        if resolved_webhook:
            base = cls.webhook_base()
            if not base or not _is_safe_service_url(base):
                return "", N8NDispatchResult(configured=False, dispatched=False)
            if ".." in resolved_webhook or not _SAFE_PATH_RE.fullmatch(resolved_webhook):
                return "", N8NDispatchResult(configured=True, dispatched=False, error="invalid_webhook_path")
            return f"{base}/{resolved_webhook}", None
        if resolved_workflow:
            base = cls.api_base()
            if not cls.api_key() or not _is_safe_service_url(base):
                return "", N8NDispatchResult(configured=False, dispatched=False)
            if not _SAFE_ID_RE.fullmatch(resolved_workflow):
                return "", N8NDispatchResult(configured=True, dispatched=False, error="invalid_workflow_id")
            return f"{base}/api/v1/workflows/{resolved_workflow}/execute", None
        return "", N8NDispatchResult(configured=cls.is_configured(), dispatched=False)


@dataclass(frozen=True, slots=True)
class Neo4jQueryResult:
    """Resultado de consulta Cypher na Neo4j Aura Query API v2 (Memoria L4 Grafo)."""

    configured: bool
    ok: bool
    rows: tuple[dict[str, Any], ...] = ()
    error: str = ""

    def format_context_block(self, max_chars: int = 1800) -> str:
        """Formata relacoes/nos do grafo em bloco Pure ASCII para injecao no prompt."""
        if not self.rows:
            return ""
        lines = ["[NEO4J AURA GRAPH CONTEXT]"]
        used = len(lines[0])
        for idx, row in enumerate(self.rows, start=1):
            parts = [f"{k}={row[k]}" for k in row if row[k] not in (None, "", [], {})]
            summary = enforce_pure_ascii(" | ".join(parts))
            if len(summary) > 320:
                summary = f"{summary[:317]}..."
            entry = f"[G-{idx}] {summary}"
            if used + len(entry) + 1 > max_chars:
                break
            lines.append(entry)
            used += len(entry) + 1
        return "\n".join(lines) if len(lines) > 1 else ""


class Neo4jAuraBridge:
    """Cliente assincrono fino para Neo4j Aura Query API v2 e Aura MCP (Zero Bolt local)."""

    _OAUTH_URL = "https://api.neo4j.io/oauth/token"
    _token_cache: tuple[str, float] = ("", 0.0)

    @staticmethod
    def instance_id() -> str:
        return _env_or_reg("NEO4J_AURA_INSTANCE_ID")

    @staticmethod
    def database_name() -> str:
        return _env_or_reg("NEO4J_AURA_DATABASE", "neo4j") or "neo4j"

    @classmethod
    def query_url(cls) -> str:
        explicit = _env_or_reg("NEO4J_AURA_QUERY_URL")
        if explicit:
            return explicit.replace("{databaseName}", cls.database_name())
        inst = cls.instance_id()
        if inst and _SAFE_ID_RE.fullmatch(inst):
            return f"https://{inst}.databases.neo4j.io/db/{cls.database_name()}/query/v2"
        return ""

    @classmethod
    def mcp_url(cls) -> str:
        explicit = _env_or_reg("NEO4J_AURA_MCP_URL")
        if explicit:
            return explicit.rstrip("/")
        inst = cls.instance_id()
        if inst and _SAFE_ID_RE.fullmatch(inst):
            return f"https://{inst}.mcp-instances.neo4j.io"
        return ""

    @classmethod
    def _has_auth(cls) -> bool:
        has_token = bool(_NEO4J_RING.active_keys() or _NEO4J_RING.candidates())
        has_oauth = bool(_env_or_reg("NEO4J_AURA_CLIENT_ID") and _env_or_reg("NEO4J_AURA_CLIENT_SECRET"))
        has_basic = bool(_env_or_reg("NEO4J_AURA_USERNAME") and _env_or_reg("NEO4J_AURA_PASSWORD"))
        return has_token or has_oauth or has_basic

    @classmethod
    def is_configured(cls) -> bool:
        url = cls.query_url()
        return bool(url and _is_safe_service_url(url) and cls._has_auth())

    @classmethod
    async def _resolve_auth_header(cls, session: aiohttp.ClientSession) -> str:
        static_token = _NEO4J_RING.primary_key()
        if static_token:
            return f"Bearer {static_token}"

        user = _env_or_reg("NEO4J_AURA_USERNAME")
        pwd = _env_or_reg("NEO4J_AURA_PASSWORD")
        if user and pwd:
            encoded = base64.b64encode(f"{user}:{pwd}".encode()).decode("ascii")
            return f"Basic {encoded}"

        cid = _env_or_reg("NEO4J_AURA_CLIENT_ID")
        csec = _env_or_reg("NEO4J_AURA_CLIENT_SECRET")
        if not (cid and csec):
            return ""

        cached_token, expires_at = cls._token_cache
        if cached_token and time.monotonic() < expires_at:
            return f"Bearer {cached_token}"

        basic = base64.b64encode(f"{cid}:{csec}".encode()).decode("ascii")
        try:
            async with session.post(
                cls._OAUTH_URL,
                headers={"Authorization": f"Basic {basic}", "Content-Type": "application/x-www-form-urlencoded"},
                data="grant_type=client_credentials",
            ) as resp:
                if resp.status != 200:
                    return ""
                token_body = await resp.json()
                access_token = str(token_body.get("access_token") or "").strip()
                expires_in = int(token_body.get("expires_in") or 300)
                if access_token:
                    cls._token_cache = (access_token, time.monotonic() + max(30, expires_in - 30))
                    return f"Bearer {access_token}"
        except Exception as exc:  # noqa: BLE001
            logger.debug("[NEO4J AURA BRIDGE] Falha no OAuth2 token exchange: %s", exc)
        return ""

    @classmethod
    async def execute_cypher(
        cls,
        statement: str,
        parameters: Mapping[str, Any] | None = None,
        *,
        timeout_seconds: float = 5.0,
    ) -> Neo4jQueryResult:
        """Executa statement Cypher parametrizado na Aura Query API v2."""
        url = cls.query_url()
        if not url or not _is_safe_service_url(url) or not cls._has_auth() or not statement.strip():
            return Neo4jQueryResult(configured=False, ok=False)

        timeout = aiohttp.ClientTimeout(total=max(0.5, float(timeout_seconds)), sock_connect=1.5)
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                auth_header = await cls._resolve_auth_header(session)
                if not auth_header:
                    return Neo4jQueryResult(configured=True, ok=False, error="auth_failed")
                headers = {
                    "Authorization": auth_header,
                    "Content-Type": _JSON_CONTENT_TYPE,
                    "Accept": _JSON_CONTENT_TYPE,
                }
                payload = {"statement": statement, "parameters": dict(parameters or {})}
                async with session.post(url, json=payload, headers=headers) as resp:
                    if resp.status not in (200, 202):
                        return Neo4jQueryResult(configured=True, ok=False, error=f"HTTP {resp.status}")
                    body = await resp.json()
        except Exception as exc:  # noqa: BLE001
            logger.debug("[NEO4J AURA BRIDGE] Falha em Query API v2: %s", exc)
            return Neo4jQueryResult(configured=True, ok=False, error=type(exc).__name__)

        data_obj = body.get("data") if isinstance(body, Mapping) else None
        if not isinstance(data_obj, Mapping):
            return Neo4jQueryResult(configured=True, ok=True, rows=())
        fields = [str(f) for f in (data_obj.get("fields") or ())]
        values = data_obj.get("values") or ()
        rows = tuple(dict(zip(fields, row, strict=False)) for row in values if isinstance(row, (list, tuple)))
        return Neo4jQueryResult(configured=True, ok=True, rows=rows)

    @classmethod
    async def query_graph_context(
        cls,
        topic: str,
        *,
        limit: int = 5,
        timeout_seconds: float = 4.0,
    ) -> Neo4jQueryResult:
        """Consulta read-only de nos e relacoes multi-hop relevantes para o topico."""
        q_clean = enforce_pure_ascii(topic or "").strip()[:160].lower()
        if not q_clean:
            return Neo4jQueryResult(configured=cls.is_configured(), ok=False)
        tokens = [t for t in re.findall(r"[a-z0-9_]{3,}", q_clean) if t not in {"para", "como", "with", "that"}][:4]
        term = tokens[0] if tokens else q_clean[:40]
        cypher = (
            "MATCH (n) "
            "WHERE any(k IN keys(n) WHERE toLower(toString(n[k])) CONTAINS $q) "
            "OPTIONAL MATCH (n)-[r]-(m) "
            "RETURN labels(n) AS labels, coalesce(n.name, n.title, n.id, '') AS node, "
            "type(r) AS rel, coalesce(m.name, m.title, m.id, '') AS neighbor "
            "LIMIT $limit"
        )
        return await cls.execute_cypher(
            cypher,
            parameters={"q": term, "limit": max(1, min(15, limit))},
            timeout_seconds=timeout_seconds,
        )


class DevinBridge:
    """Cliente assincrono com rotacao HKCU/HKLM para Devin API v3."""

    @staticmethod
    def api_base() -> str:
        return _env_or_reg("DEVIN_API_BASE", "https://api.devin.ai").rstrip("/")

    @staticmethod
    def org_id() -> str:
        return _env_or_reg("DEVIN_ORG_ID")

    @classmethod
    def is_configured(cls) -> bool:
        return bool((_DEVIN_RING.active_keys() or _DEVIN_RING.candidates()) and _is_safe_service_url(cls.api_base()))

    @classmethod
    async def check_self(cls, *, timeout_seconds: float = 5.0) -> dict[str, Any]:
        keys = _DEVIN_RING.active_keys()
        base = cls.api_base()
        if not keys or not _is_safe_service_url(base):
            return {"configured": False, "ok": False}

        timeout = aiohttp.ClientTimeout(total=max(0.5, float(timeout_seconds)), sock_connect=1.5)
        last_status = 0
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                for token in keys:
                    headers = {"Authorization": f"Bearer {token}", "Accept": _JSON_CONTENT_TYPE}
                    async with session.get(f"{base}/v3/self", headers=headers) as resp:
                        last_status = resp.status
                        if resp.status == 200:
                            _DEVIN_RING.mark_success(token)
                            data = await resp.json()
                            return {
                                "configured": True,
                                "ok": True,
                                "org_id": data.get("org_id", ""),
                                "user_name": data.get("user_name", ""),
                                "key_sha8": _key_sha8(token),
                            }
                        if resp.status in (401, 403):
                            _DEVIN_RING.mark_unauthorized(token)
                            continue
                        if resp.status == 429:
                            _DEVIN_RING.mark_rate_limited(token)
                            continue
                        _DEVIN_RING.mark_transient_error(token)
        except Exception as exc:  # noqa: BLE001
            return {"configured": True, "ok": False, "error": type(exc).__name__}
        return {"configured": True, "ok": False, "status_code": last_status}


class VercelBridge:
    """Cliente assincrono com rotacao HKCU/HKLM para Vercel REST API."""

    @staticmethod
    def api_base() -> str:
        return _env_or_reg("VERCEL_API_BASE", "https://api.vercel.com").rstrip("/")

    @staticmethod
    def user_id() -> str:
        return _env_or_reg("VERCEL_USER_ID")

    @staticmethod
    def username() -> str:
        return _env_or_reg("VERCEL_USERNAME")

    @classmethod
    def is_configured(cls) -> bool:
        return bool((_VERCEL_RING.active_keys() or _VERCEL_RING.candidates()) and _is_safe_service_url(cls.api_base()))

    @classmethod
    async def check_user(cls, *, timeout_seconds: float = 5.0) -> dict[str, Any]:
        keys = _VERCEL_RING.active_keys()
        base = cls.api_base()
        if not keys or not _is_safe_service_url(base):
            return {"configured": False, "ok": False}

        timeout = aiohttp.ClientTimeout(total=max(0.5, float(timeout_seconds)), sock_connect=1.5)
        last_status = 0
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                for token in keys:
                    headers = {"Authorization": f"Bearer {token}", "Accept": _JSON_CONTENT_TYPE}
                    async with session.get(f"{base}/v2/user", headers=headers) as resp:
                        last_status = resp.status
                        if resp.status == 200:
                            _VERCEL_RING.mark_success(token)
                            body = await resp.json()
                            user = body.get("user") or {}
                            return {
                                "configured": True,
                                "ok": True,
                                "id": user.get("id", ""),
                                "username": user.get("username", ""),
                                "key_sha8": _key_sha8(token),
                            }
                        if resp.status in (401, 403):
                            _VERCEL_RING.mark_unauthorized(token)
                            continue
                        if resp.status == 429:
                            _VERCEL_RING.mark_rate_limited(token)
                            continue
                        _VERCEL_RING.mark_transient_error(token)
        except Exception as exc:  # noqa: BLE001
            return {"configured": True, "ok": False, "error": type(exc).__name__}
        return {"configured": True, "ok": False, "status_code": last_status}


def get_mesh_capability_snapshot() -> dict[str, Any]:
    """Snapshot deterministico das pontes ativas para Agentes Customizados e Subagentes."""
    return {
        "hermes_cli": bool(shutil.which("hermes")),
        "ragflow": RAGFlowBridge.is_configured(),
        "n8n": N8NBridge.is_configured(),
        "neo4j_aura": Neo4jAuraBridge.is_configured(),
        "neo4j_mcp": bool(Neo4jAuraBridge.mcp_url()),
        "devin": DevinBridge.is_configured(),
        "vercel": VercelBridge.is_configured(),
        "docker_registry": bool(_DOCKER_RING.candidates()),
        "openrouter_free_pool": bool(_env_or_reg("OPENROUTER_API_KEY") or _env_or_reg("OPENROUTER_TIER4_KEY_1")),
        "rotation_pools": {
            "ragflow": _RAGFLOW_RING.telemetry(),
            "n8n": _N8N_RING.telemetry(),
            "neo4j_aura": _NEO4J_RING.telemetry(),
            "devin": _DEVIN_RING.telemetry(),
            "vercel": _VERCEL_RING.telemetry(),
            "docker": _DOCKER_RING.telemetry(),
        },
    }


_N8N_INTEGRATION_LINE = (
    "- n8n Automation Bridge ativo; entregue resumo objetivo e estruturado para consumo via webhook/workflow."
)


def _desc_wants_integrations(desc_l: str) -> dict[str, bool]:
    """Classifica a descricao normalizada em intencoes de integracao (qualquer-match)."""
    return {
        "workflow": any(k in desc_l for k in ("n8n", "webhook", "workflow", "automacao")),
        "graph": any(k in desc_l for k in ("neo4j", "cypher", "aura", "grafo", "knowledge graph")),
        "devin": any(k in desc_l for k in ("devin", "acu", "session insight")),
        "vercel": any(k in desc_l for k in ("vercel", "deploy", "preview")),
    }


def _explicit_integration_requests(meta: Mapping[str, Any]) -> dict[str, bool]:
    """Flags explicitas de integracao vindas dos metadados da missao."""
    return {
        "n8n": bool(meta.get("n8n_webhook_path") or meta.get("n8n_workflow_id")),
        "ragflow": bool(meta.get("use_ragflow") or meta.get("ragflow_dataset_ids")),
        "neo4j": bool(meta.get("use_neo4j")),
    }


def _integration_usage(
    explicit: Mapping[str, bool],
    wants: Mapping[str, bool],
    ragflow_citations_count: int,
    neo4j_rows_count: int,
) -> dict[str, bool]:
    """Resolve quais integracoes entram no bloco (ativo E pedido ou evidenciado)."""
    return {
        "ragflow": RAGFlowBridge.is_configured() and (explicit["ragflow"] or ragflow_citations_count > 0),
        "neo4j": Neo4jAuraBridge.is_configured() and (explicit["neo4j"] or wants["graph"] or neo4j_rows_count > 0),
        "n8n": N8NBridge.is_configured() and (explicit["n8n"] or wants["workflow"]),
        "devin": DevinBridge.is_configured() and wants["devin"],
        "vercel": VercelBridge.is_configured() and wants["vercel"],
    }


def _ragflow_integration_line(citations_count: int) -> str:
    return (
        f"- RAGFlow Agentic Retrieval ativo ({citations_count} citacoes carregadas); "
        "ancore afirmacoes em [RF-N] quando aplicavel."
    )


def _neo4j_integration_line(rows_count: int) -> str:
    mcp_hint = f" | MCP={Neo4jAuraBridge.mcp_url()}" if Neo4jAuraBridge.mcp_url() else ""
    return (
        f"- Neo4j Aura L4 Graph ativo ({rows_count} relacoes carregadas{mcp_hint}); "
        "cite [G-N] para raciocinio multi-hop."
    )


def _devin_integration_line() -> str:
    return (
        f"- Devin API v3 Bridge ativo (pool={_DEVIN_RING.telemetry()['active']} chaves, "
        f"org={DevinBridge.org_id() or 'auto'})."
    )


def _vercel_integration_line() -> str:
    return (
        f"- Vercel REST Bridge ativo (pool={_VERCEL_RING.telemetry()['active']} tokens, "
        f"user={VercelBridge.username() or VercelBridge.user_id()})."
    )


def build_agent_integrations_block(
    description: str,
    metadata: Mapping[str, Any] | None = None,
    *,
    ragflow_citations_count: int = 0,
    neo4j_rows_count: int = 0,
) -> str:
    """Injeta contexto enxuto de integracoes ativas apenas quando configuradas ou solicitadas."""
    meta = metadata if isinstance(metadata, Mapping) else {}
    wants = _desc_wants_integrations(enforce_pure_ascii(description or "").lower())
    explicit = _explicit_integration_requests(meta)
    usage = _integration_usage(explicit, wants, ragflow_citations_count, neo4j_rows_count)

    if not any(usage.values()):
        return ""

    lines = ["\n\n[INTEGRACOES DA MALHA SOTA ATIVAS]"]
    if usage["ragflow"]:
        lines.append(_ragflow_integration_line(ragflow_citations_count))
    if usage["neo4j"]:
        lines.append(_neo4j_integration_line(neo4j_rows_count))
    if usage["n8n"]:
        lines.append(_N8N_INTEGRATION_LINE)
    if usage["devin"]:
        lines.append(_devin_integration_line())
    if usage["vercel"]:
        lines.append(_vercel_integration_line())
    if shutil.which("hermes"):
        lines.append("- Hermes-Agent CLI disponivel no host para handoff de execucao autonoma.")
    return enforce_pure_ascii("\n".join(lines))
