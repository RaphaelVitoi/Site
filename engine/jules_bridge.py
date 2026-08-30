"""Modulo de integracao e ponte SOTA entre Site (PMev/Engine), Antigravity 2.0 e Google Jules.

Permite a delegacao de simulacoes massivas de Teoria dos Jogos PMev,
migracoes de repositorio e geracao de testes em background para VMs isoladas do Jules.
"""
from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Final

logger = logging.getLogger(__name__)

JULES_API_BASE: Final[str] = "https://jules.googleapis.com/v1alpha"


@dataclass(frozen=True, slots=True)
class JulesSessionRequest:
    """Parametros para criacao de sessao assincrona no Google Jules."""

    source: str
    prompt: str
    branch: str = "main"
    auto_approve_plan: bool = False

    def to_payload(self) -> dict[str, object]:
        """Converte para o formato de payload da API v1alpha do Jules."""
        return {
            "sourceContext": {
                "source": self.source,
                "githubRepoContext": {
                    "branch": self.branch,
                },
            },
            "prompt": self.prompt,
            "autoApprovePlan": self.auto_approve_plan,
        }


@dataclass(frozen=True, slots=True)
class JulesSessionStatus:
    """Status consolidado de uma sessao em execucao no Google Jules."""

    session_id: str
    state: str
    create_time: str
    update_time: str
    pr_url: str | None = None
    activities: list[dict[str, object]] | None = None


@dataclass(frozen=True, slots=True)
class JulesDiffResult:
    """Resultado do diff e patch consolidado emitido pelo Jules."""

    session_id: str
    diff_content: str
    files_changed: list[str]


class JulesClient:
    """Cliente HTTP/REST hermetico e seguro para comunicacao com a API do Google Jules."""

    def __init__(
        self,
        api_key: str | None = None,
        project_id: str | None = None,
        timeout: float = 30.0,
    ) -> None:
        self._api_key = api_key or os.getenv("JULES_API_KEY", "")
        self._project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT", "original-498419")
        self._timeout = timeout

    @property
    def is_configured(self) -> bool:
        """Verifica se a chave de API e o projeto estao configurados."""
        return bool(self._api_key and self._project_id)

    def _get_headers(self) -> dict[str, str]:
        """Gera os headers autenticados para a chamada a API."""
        return {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self._api_key,
            "User-Agent": "Nexus-Site-PMev-JulesBridge/1.0",
        }

    def create_session(self, request: JulesSessionRequest) -> JulesSessionStatus:
        """Cria e inicia uma sessao de execucao na nuvem no Jules."""
        if not self.is_configured:
            raise ValueError("JulesClient nao configurado: JULES_API_KEY ou GOOGLE_CLOUD_PROJECT ausente.")

        url = f"{JULES_API_BASE}/sessions"
        payload_bytes = json.dumps(request.to_payload()).encode("utf-8")
        req = urllib.request.Request(url, data=payload_bytes, headers=self._get_headers(), method="POST")

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return JulesSessionStatus(
                    session_id=data.get("name", "").split("/")[-1] or data.get("sessionId", "unknown"),
                    state=data.get("state", "STATE_UNSPECIFIED"),
                    create_time=data.get("createTime", ""),
                    update_time=data.get("updateTime", ""),
                    pr_url=data.get("githubPullRequestUrl"),
                    activities=data.get("activities", []),
                )
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="replace")
            logger.error("[JULES] Erro HTTP %d ao criar sessao: %s", e.code, err_msg)
            raise RuntimeError(f"Erro na API do Jules ({e.code}): {err_msg}") from e
        except Exception as e:
            logger.error("[JULES] Falha de conexao com a API do Jules: %s", e)
            raise

    def get_session_status(self, session_id: str, include_activities: bool = True) -> JulesSessionStatus:
        """Consulta o status e o progresso atual de uma sessao."""
        if not self.is_configured:
            raise ValueError("JulesClient nao configurado: JULES_API_KEY ausente.")

        url = f"{JULES_API_BASE}/sessions/{session_id}"
        if include_activities:
            url += "?view=FULL"

        req = urllib.request.Request(url, headers=self._get_headers(), method="GET")

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return JulesSessionStatus(
                    session_id=session_id,
                    state=data.get("state", "STATE_UNSPECIFIED"),
                    create_time=data.get("createTime", ""),
                    update_time=data.get("updateTime", ""),
                    pr_url=data.get("githubPullRequestUrl"),
                    activities=data.get("activities", []),
                )
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="replace")
            logger.error("[JULES] Erro HTTP %d ao consultar sessao %s: %s", e.code, session_id, err_msg)
            raise RuntimeError(f"Erro na consulta do Jules ({e.code}): {err_msg}") from e

    def approve_plan(self, session_id: str, activity_id: str, action: str = "APPROVE") -> bool:
        """Aprova ou rejeita uma atividade de planejamento do Jules."""
        if not self.is_configured:
            raise ValueError("JulesClient nao configurado: JULES_API_KEY ausente.")

        url = f"{JULES_API_BASE}/sessions/{session_id}/activities/{activity_id}:action"
        payload = json.dumps({"action": action}).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers=self._get_headers(), method="POST")

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                return resp.status in (200, 204)
        except urllib.error.HTTPError as e:
            logger.error("[JULES] Erro HTTP %d ao aprovar plano %s: %s", e.code, activity_id, e.reason)
            return False

    def get_diff(self, session_id: str) -> JulesDiffResult:
        """Coleta o diff unificado gerado pela sessao do Jules."""
        if not self.is_configured:
            raise ValueError("JulesClient nao configurado: JULES_API_KEY ausente.")

        url = f"{JULES_API_BASE}/sessions/{session_id}/diff"
        req = urllib.request.Request(url, headers=self._get_headers(), method="GET")

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return JulesDiffResult(
                    session_id=session_id,
                    diff_content=data.get("patch", ""),
                    files_changed=data.get("filesChanged", []),
                )
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="replace")
            logger.error("[JULES] Erro HTTP %d ao obter diff: %s", e.code, err_msg)
            raise RuntimeError(f"Erro ao obter diff do Jules ({e.code}): {err_msg}") from e

    def list_sources(self, page_size: int = 10, page_token: str = "") -> list[dict[str, object]]:
        """Lista repositorios e fontes conectadas ao Jules via GitHub App."""
        if not self.is_configured:
            return [{"name": "sources/github/RaphaelVitoi/Site", "type": "GITHUB_REPO"}]

        url = f"{JULES_API_BASE}/sources?pageSize={page_size}"
        if page_token:
            url += f"&pageToken={page_token}"
        req = urllib.request.Request(url, headers=self._get_headers(), method="GET")

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                sources = data.get("sources")
                if isinstance(sources, list):
                    return sources
                return [{"name": "sources/github/RaphaelVitoi/Site", "type": "GITHUB_REPO"}]
        except Exception as e:
            logger.warning("[JULES] list_sources retornou excecao: %s", e)
            return [{"name": "sources/github/RaphaelVitoi/Site", "type": "GITHUB_REPO"}]

