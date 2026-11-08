"""Modulo de integracao e ponte SOTA entre Site (PMev/Engine) e Chrysalis.

Cliente HTTP hermetico para a engine externa ProjectChrysalis/Chrysalis-Engine
(AGPL-3.0-only, Bun + Hono + pi-agent-core, servico local em
``http://127.0.0.1:8788`` por padrao).

FRONTEIRA DE LICENCA (AGPL): este modulo NAO contem codigo AGPL copiado.
A engine AGPL permanece um processo externo; o Site fala com ele SOMENTE
via HTTP (``GET /v1/apps``, documentado no README upstream como
``./chrysalis api GET /v1/apps``). A logica do agente (edicao com
revisao otimista, undo, modos Plan/Accept/Full, inspecao de skills,
compactacao, helpers read-only) foi reimplementada clean-room em Python
nativo, com a mesma semantica e sem reutilizar expressao AGPL.

Convencao: urllib.request, dataclass hibrida (dataclass + dict) e
credencial apenas por ambiente/HKCU, no mesmo padrao de
``engine/jules_bridge.py`` e ``engine/exa_bridge.py``.
"""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
import logging
import os
import re
from typing import Any, Final
import urllib.error
import urllib.request

try:
    import winreg
except ImportError:
    winreg = None  # type: ignore[assignment]

logger = logging.getLogger(__name__)

__all__ = [
    "AgentMode",
    "CHRYSALIS_DEFAULT_BASE_URL",
    "CHRYSALIS_ERROR_STALE_REVISION",
    "ChrysalisApp",
    "ChrysalisClient",
    "ChrysalisHealth",
    "ChrysalisUndoResult",
    "EditPlan",
    "build_compaction_summary",
    "compute_revision",
    "validate_workspace_path",
]

CHRYSALIS_DEFAULT_BASE_URL: Final[str] = "http://127.0.0.1:8788"
CHRYSALIS_SERVICE_URL_ENV: Final[str] = "CHRYSALIS_SERVICE_URL"
CHRYSALIS_ERROR_STALE_REVISION: Final[str] = "Chrysalis: revisao defasada (409)."

#: Nomes de dispositivo reservados no Windows (regra upstream).
_WINDOWS_DEVICE_NAMES: Final[frozenset[str]] = frozenset(
    {
        "CON",
        "PRN",
        "AUX",
        "NUL",
        "COM1",
        "COM2",
        "COM3",
        "COM4",
        "COM5",
        "COM6",
        "COM7",
        "COM8",
        "COM9",
        "LPT1",
        "LPT2",
        "LPT3",
        "LPT4",
        "LPT5",
        "LPT6",
        "LPT7",
        "LPT8",
        "LPT9",
    }
)


class AgentMode(str):
    """Modos de permissao do agente, espelhando Plan/Accept/Full upstream."""

    PLAN = "plan"
    ACCEPT = "accept"
    FULL = "full"


@dataclass
class ChrysalisApp(dict[str, Any]):
    """Representacao hibrida (dataclass + dict) de um app da Store Chrysalis."""

    id: str
    name: str = ""
    updated: bool = False

    def __post_init__(self) -> None:
        for f in self.__dataclass_fields__:
            self[f] = getattr(self, f)
        self["updated"] = self.updated

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ChrysalisApp:
        """Instancia defensivamente a partir de JSON de ``GET /v1/apps``."""
        raw_id = str(data.get("id", ""))
        raw_name = str(data.get("name", ""))
        raw_updated = data.get("updated", False)
        inst = cls(id=raw_id, name=raw_name, updated=bool(raw_updated))
        for k, v in data.items():
            inst[k] = v
        return inst


@dataclass
class ChrysalisHealth:
    """Saude do servico externo, com proveniencia S4 declarada."""

    status: str  # ONLINE | OFFLINE
    apps_count: int = 0
    base_url: str = CHRYSALIS_DEFAULT_BASE_URL
    reason: str = ""
    fallback_used: bool = True

    def to_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "apps_count": self.apps_count,
            "base_url": self.base_url,
            "reason": self.reason,
            "provenia": {
                "engine_id": "chrysalis-live-engine-adapter",
                "implementation_level": "adapter",
                "runtime_used": "python-urllib",
                "model_used": "",
                "intended_model": "",
                "weights_loaded": False,
                "fallback_used": self.fallback_used,
                "assumptions": ["chrysalis-service-external-agpl", "http-only-boundary"],
                "limitations": ["not-a-chrysalis-engine-copy", "chat-endpoint-pending-live-probe"],
                "units": ["http-status", "apps-count"],
            },
        }


@dataclass
class EditPlan:
    """Plano de edicao com revisao otimista (semantica upstream de undo)."""

    path: str
    new_content: str
    expected_revision: str
    mode: str = AgentMode.ACCEPT
    approved: bool = False

    def to_payload(self) -> dict[str, object]:
        return {
            "path": self.path,
            "new_content": self.new_content,
            "expected_revision": self.expected_revision,
            "mode": self.mode,
            "approved": self.approved,
        }


@dataclass
class ChrysalisUndoResult:
    """Recibo de edicao aceita: undo ID derivado do conteudo plano x revisao."""

    path: str
    revision: str
    undo_id: str


def compute_revision(content: str) -> str:
    """Token de revisao SHA-256 hex do conteudo (optimista, upstream)."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def validate_workspace_path(path: str) -> str:
    """Valida e normaliza caminho do workspace; rejeita impossivel (S8.2).

    Regras upstream: nomes de dispositivo Windows, dois-pontos e
    ponto final / espaco a direita sao recusados; ``..`` nao sai do
    workspace. Retorna caminho POSIX normalizado ou levanta ValueError.
    """
    if path != path.strip():
        raise ValueError(f"final de nome invalido (ponto/espaco): {path!r}")
    candidate = path.replace("\\", "/").strip()
    if not candidate:
        raise ValueError("workspace_path vazio.")
    if candidate.startswith("/") or ":" in candidate or ".." in candidate.split("/"):
        raise ValueError(f"workspace_path fora do workspace ou invalido: {path!r}")
    parts = [p for p in candidate.split("/") if p not in ("", ".")]
    if not parts:
        raise ValueError(f"workspace_path fora do workspace ou invalido: {path!r}")
    for part in parts:
        stem = part.split(".", 1)[0].upper()
        if stem in _WINDOWS_DEVICE_NAMES:
            raise ValueError(f"nome de dispositivo Windows recusado: {part!r}")
        if part.endswith((".", " ")):
            raise ValueError(f"final de nome invalido (ponto/espaco): {part!r}")
    return "/".join(parts)


def enforce_mode(mode: str, *, mutation: bool, approved: bool) -> None:
    """Aplica Plan/Accept/Full: Plan bloqueia mutacao, Accept exige aprovacao."""
    if mode not in (AgentMode.PLAN, AgentMode.ACCEPT, AgentMode.FULL):
        raise ValueError(f"mode invalido: {mode!r} (esperado plan|accept|full)")
    if not mutation:
        return
    if mode == AgentMode.PLAN:
        raise PermissionError("Plan e read-only: mutacao bloqueada.")
    if mode == AgentMode.ACCEPT and not approved:
        raise PermissionError("Accept exige aprovacao explicita antes de mutar.")


def build_compaction_summary(
    goal: str,
    progress: str,
    decisions: list[str],
    next_steps: list[str],
    files_read: list[str],
    files_changed: list[str],
) -> dict[str, Any]:
    """Resumo de compactacao ``/compact`` (goal, progress, decisions, next)."""
    return {
        "goal": goal,
        "progress": progress,
        "decisions": decisions,
        "next_steps": next_steps,
        "files_read": files_read,
        "files_changed": files_changed,
    }


def _env_or_reg(name: str, default: str = "") -> str:
    """Ambiente os.environ, com fallback HKCU/HKLM (doutrina S3.1)."""
    val = (os.getenv(name) or "").strip()
    if val:
        return val
    if winreg is not None:
        for root, subkey in (
            (winreg.HKEY_CURRENT_USER, "Environment"),
            (winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment"),
        ):
            try:
                with winreg.OpenKey(root, subkey) as key:
                    reg_val, _ = winreg.QueryValueEx(key, name)
                    if reg_val and str(reg_val).strip():
                        return str(reg_val).strip()
            except OSError:
                continue
    return default


def _validate_base_url(base_url: str) -> str:
    """Loopback HTTP ou qualquer HTTPS; rejeita file: e HTTP externo."""
    cleaned = base_url.strip().rstrip("/")
    if cleaned.startswith("file:"):
        raise ValueError("ChrysalisBridge rejeita file: (urlopen abriria qualquer esquema).")
    if re.match(r"^https://[^/]+$", cleaned) or re.match(r"^https://[^/]+/.+", cleaned):
        return cleaned
    if re.match(r"^http://(127\.0\.0\.1|localhost)(:\d+)?(/.*)?$", cleaned):
        return cleaned
    raise ValueError(f"base_url invalido: {base_url!r} (loopback HTTP ou HTTPS).")


class ChrysalisClient:
    """Cliente HTTP/REST hermetico para o servico local Chrysalis."""

    def __init__(self, base_url: str | None = None, timeout: float = 10.0) -> None:
        raw = (
            base_url if base_url is not None else (_env_or_reg(CHRYSALIS_SERVICE_URL_ENV) or CHRYSALIS_DEFAULT_BASE_URL)
        )
        self._base_url = _validate_base_url(raw)
        self._timeout = float(timeout)

    @property
    def base_url(self) -> str:
        return self._base_url

    @property
    def is_configured(self) -> bool:
        """Servico local nao exige chave; configurado = URL valida."""
        return bool(self._base_url)

    def _get_headers(self) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Nexus-Site-ChrysalisBridge/1.0",
        }

    def _url_for_path(self, path: str) -> str:
        if not path.startswith("/v1/"):
            raise ValueError(f"path fora da fronteira /v1/: {path!r}")
        if ".." in path or "://" in path or path.startswith("/v1//") or "?" in path or "#" in path:
            raise ValueError(f"path invalido: {path!r}")
        return f"{self._base_url}{path}"

    def api_request(self, method: str, path: str, payload: dict[str, object] | None = None) -> dict[str, Any]:
        """GET/POST generico sob /v1/; entrada impossivel e rejeitada."""
        url = self._url_for_path(path)
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = urllib.request.Request(url, data=data, headers=self._get_headers(), method=method.upper())
        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                body = resp.read().decode("utf-8")
                parsed = json.loads(body) if body.strip() else {}
                return parsed if isinstance(parsed, dict) else {"raw_text": body}
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="replace")
            logger.exception("[CHRYSALIS] Erro HTTP %d em %s %s: %s", e.code, method, path, err_msg)
            raise RuntimeError(f"Erro do servico Chrysalis ({e.code}) em {method} {path}: {err_msg}") from e

    def list_apps(self) -> list[ChrysalisApp]:
        """``GET /v1/apps`` -- endpoint documentado no README upstream."""
        data = self.api_request("GET", "/v1/apps")
        raw_apps = data.get("apps", data)
        if isinstance(raw_apps, list):
            return [ChrysalisApp.from_dict(a) for a in raw_apps if isinstance(a, dict)]
        if isinstance(raw_apps, dict):
            items = raw_apps.get("items", [])
            if isinstance(items, list):
                return [ChrysalisApp.from_dict(a) for a in items if isinstance(a, dict)]
        return []

    def get_health(self) -> ChrysalisHealth:
        """Sonda ``GET /v1/apps``; indisponivel vira OFFLINE, nunca excecao."""
        try:
            apps = self.list_apps()
            return ChrysalisHealth(status="ONLINE", apps_count=len(apps), base_url=self._base_url, fallback_used=False)
        except Exception as e:
            return ChrysalisHealth(status="OFFLINE", apps_count=0, base_url=self._base_url, reason=str(e))

    def probe_capabilities(self) -> dict[str, bool]:
        """Sonda endpoints documentados/candidatos do servico; mede, nao alega.

        Retorna disponibilidade por path. Endpoint de chat/run so e considerado
        disponivel se a sonda retornar 2xx; caso contrario permanece falso e
        a limitacao ``chat-endpoint-pending-live-probe`` segue valida.
        """
        candidates = (
            "/v1/health",
            "/v1/apps",
            "/v1/store",
            "/v1/agent",
            "/v1/run",
            "/v1/chat",
        )
        result: dict[str, bool] = {}
        for path in candidates:
            try:
                self.api_request("GET", path)
                result[path] = True
            except Exception:
                result[path] = False
        return result

    def validate_edit(self, plan: EditPlan, *, current_revision: str, mutation: bool = True) -> ChrysalisUndoResult:
        """Valida plano offline contra revisao atual (sem HTTP).

        Ordem upstream: caminho -> modo -> revisao. Revisao defasada
        e rejeitada em 409-semantico (stale record), nunca silenciosamente
        normalizada. O undo ID amarra plano x revisao esperada.
        """
        normalized = validate_workspace_path(plan.path)
        enforce_mode(plan.mode, mutation=mutation, approved=plan.approved)
        if plan.expected_revision != current_revision:
            raise RuntimeError(CHRYSALIS_ERROR_STALE_REVISION)
        undo_id = compute_revision(f"{normalized}\x00{plan.new_content}\x00{plan.expected_revision}")
        new_revision = compute_revision(plan.new_content)
        return ChrysalisUndoResult(path=normalized, revision=new_revision, undo_id=undo_id)

    def delegate_readonly(self, task: str) -> dict[str, Any]:
        """Helper read-only: Plan forcado, mutacao bloqueada por construcao.

        Contrato upstream: helpers leem/buscam e reportam, nao tocam
        arquivos nem perguntam. Aqui o gate e o proprio modo Plan.
        """
        enforce_mode(AgentMode.PLAN, mutation=False, approved=False)
        return {"task": task, "status": "PLAN_ENFORCED", "mode": AgentMode.PLAN}
