"""Modulo de integracao e ponte SOTA entre Site (PMev/Frontend) e Google Stitch MCP.

Permite a geracao generativa de interfaces, prototipagem rapida de componentes UX/UI,
sincronizacao de Design Systems e consulta de projetos e telas via Google Cloud Stitch.
"""

from __future__ import annotations

import base64
from dataclasses import dataclass
import json
import logging
import os
from typing import Final
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

STITCH_MCP_URL: Final[str] = "https://stitch.googleapis.com/mcp"
DEFAULT_STITCH_API_KEY: Final[str] = "AQ.Ab8RN6IuGpd7fad2pSZ5BS48KTCwBMVdJtsThMYT8GMaVghAmw"


# Tiers de modelos do Google Stitch (SOTA 2026)
# Na UI oficial do Stitch (stitch.withgoogle.com):
# - Balanced (Padrao): Gemini 3.8 Flash (alta fidelidade visual e raciocinio espacial)
# - Speed: Gemini 3.5 Flash-Lite (colaboracao rapida e baixa latencia)
STITCH_MODEL_BALANCED: Final[str] = "BALANCED"  # Gemini 3.8 Flash
STITCH_MODEL_SPEED: Final[str] = "SPEED"        # Gemini 3.5 Flash-Lite


@dataclass(frozen=True, slots=True)
class StitchProject:
    """Representacao imutavel de um projeto Stitch."""

    name: str
    title: str
    visibility: str = "PRIVATE"
    create_time: str = ""
    update_time: str = ""
    project_type: str = "PROJECT_DESIGN"
    origin: str = "STITCH"

    @property
    def project_id(self) -> str:
        """Extrai o identificador numerico do projeto."""
        return self.name.split("/")[-1] if "/" in self.name else self.name


@dataclass(frozen=True, slots=True)
class StitchScreen:
    """Representacao de uma tela gerada no Stitch."""

    name: str
    id: str
    title: str = ""
    device_type: str = "DESKTOP"
    screenshot_url: str | None = None
    html_url: str | None = None


class StitchClient:
    """Cliente JSON-RPC hermetico para o servidor MCP do Google Cloud Stitch."""

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str = STITCH_MCP_URL,
        timeout: float = 30.0,
    ) -> None:
        self._api_key = api_key or os.getenv("STITCH_API_KEY") or DEFAULT_STITCH_API_KEY
        self._base_url = base_url
        self._timeout = timeout

    @property
    def is_configured(self) -> bool:
        """Verifica se a chave de API esta presente."""
        return bool(self._api_key)

    def _get_headers(self) -> dict[str, str]:
        """Gera cabecalhos de autenticacao para a chamada ao Stitch MCP."""
        return {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self._api_key,
            "User-Agent": "Nexus-Site-StitchBridge/1.0",
        }

    def _call_tool(self, tool_name: str, arguments: dict[str, object] | None = None) -> dict[str, object]:
        """Executa uma chamada MCP tools/call para o Stitch."""
        if not self.is_configured:
            raise ValueError("StitchClient nao configurado: STITCH_API_KEY ausente.")

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments or {},
            },
        }

        req = urllib.request.Request(
            self._base_url,
            data=json.dumps(payload).encode("utf-8"),
            headers=self._get_headers(),
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self._timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if "error" in data:
                    err = data["error"]
                    logger.error("[STITCH] Erro JSON-RPC: %s", err)
                    raise RuntimeError(f"Erro no Stitch MCP ({err.get('code')}): {err.get('message')}")

                result = data.get("result", {})
                # Se houver structuredContent, priorizar
                if "structuredContent" in result and isinstance(result["structuredContent"], dict):
                    return result["structuredContent"]

                # Senao decodificar do content[0].text
                contents = result.get("content", [])
                if contents and isinstance(contents, list) and isinstance(contents[0], dict):
                    raw_text = contents[0].get("text", "{}")
                    try:
                        parsed = json.loads(raw_text)
                        if isinstance(parsed, dict):
                            return parsed
                    except json.JSONDecodeError:
                        return {"raw_text": raw_text}

                return {}
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="replace")
            logger.error("[STITCH] Erro HTTP %d na chamada %s: %s", e.code, tool_name, err_msg)
            raise RuntimeError(f"Erro HTTP ({e.code}) no Stitch MCP: {err_msg}") from e
        except Exception as e:
            logger.error("[STITCH] Falha de conexao com Stitch MCP: %s", e)
            raise

    def list_projects(self, filter_view: str = "owned") -> list[dict[str, object]]:
        """Lista os projetos Stitch disponiveis."""
        if not self.is_configured:
            raise ValueError("StitchClient nao configurado: STITCH_API_KEY ausente.")
        res = self._call_tool("list_projects", {"filter": f"view={filter_view}"})
        projects = res.get("projects")
        if isinstance(projects, list):
            return [p for p in projects if isinstance(p, dict)]
        return []

    def get_project(self, project_name_or_id: str) -> dict[str, object]:
        """Recupera detalhes de um projeto Stitch."""
        if not self.is_configured:
            raise ValueError("StitchClient nao configurado: STITCH_API_KEY ausente.")
        formatted_name = (
            project_name_or_id
            if project_name_or_id.startswith("projects/")
            else f"projects/{project_name_or_id}"
        )
        return self._call_tool("get_project", {"name": formatted_name})

    def create_project(self, title: str) -> dict[str, object]:
        """Cria um novo projeto Stitch."""
        if not self.is_configured:
            raise ValueError("StitchClient nao configurado: STITCH_API_KEY ausente.")
        return self._call_tool("create_project", {"title": title})

    def delete_project(self, project_name_or_id: str) -> bool:
        """Exclui um projeto Stitch."""
        if not self.is_configured:
            raise ValueError("StitchClient nao configurado: STITCH_API_KEY ausente.")
        formatted_name = (
            project_name_or_id
            if project_name_or_id.startswith("projects/")
            else f"projects/{project_name_or_id}"
        )
        try:
            self._call_tool("delete_project", {"name": formatted_name})
            return True
        except Exception as e:
            logger.warning("[STITCH] delete_project falhou para %s: %s", formatted_name, e)
            return False

    def list_screens(self, project_id: str) -> list[dict[str, object]]:
        """Lista todas as telas criadas dentro de um projeto Stitch."""
        if not self.is_configured:
            raise ValueError("StitchClient nao configurado: STITCH_API_KEY ausente.")
        clean_id = project_id.replace("projects/", "")
        res = self._call_tool("list_screens", {"projectId": clean_id})
        screens = res.get("screens")
        if isinstance(screens, list):
            return [s for s in screens if isinstance(s, dict)]
        return []

    def get_screen(self, screen_name: str) -> dict[str, object]:
        """Recupera especificacoes detalhadas de uma tela."""
        return self._call_tool("get_screen", {"name": screen_name})

    def generate_screen_from_text(
        self,
        project_id: str,
        prompt: str,
        model_tier: str = STITCH_MODEL_BALANCED,
        device_type: str = "DESKTOP",
        design_system: str | None = None,
    ) -> dict[str, object]:
        """Dispara a geracao de uma nova tela no Stitch.
        
        Modelos Suportados no Stitch:
        - BALANCED (Padrao): Gemini 3.8 Flash (equilibrio ideal entre velocidade e alta qualidade visual)
        - SPEED: Gemini 3.5 Flash-Lite (colaboracao rapida e baixa latencia)
        
        Nota de Descontinuacao: Gemini 3 Flash e 3.1 Pro foram descontinuados no Stitch de producao.
        """
        clean_id = project_id.replace("projects/", "")
        args: dict[str, object] = {
            "projectId": clean_id,
            "prompt": prompt,
            "deviceType": device_type,
        }
        # Repassar enum se for solicitado explicitamente um valor legado pelo gateway
        if model_tier in ("GEMINI_3_FLASH", "GEMINI_3_1_PRO"):
            args["modelId"] = model_tier
        if design_system:
            args["designSystem"] = design_system
        return self._call_tool("generate_screen_from_text", args)

    def list_design_systems(self, project_id: str) -> list[dict[str, object]]:
        """Lista sistemas de design associados ao projeto."""
        clean_id = project_id.replace("projects/", "")
        try:
            res = self._call_tool("list_design_systems", {"projectId": clean_id})
            ds = res.get("designSystems")
            if isinstance(ds, list):
                return [d for d in ds if isinstance(d, dict)]
            return []
        except Exception as e:
            logger.warning("[STITCH] list_design_systems falhou para %s: %s", clean_id, e)
            return []

    def upload_design_md(self, project_id: str, design_md_text: str) -> dict[str, object]:
        """Faz o upload base64 de um documento DESIGN.md para o projeto Stitch."""
        clean_id = project_id.replace("projects/", "")
        b64_content = base64.b64encode(design_md_text.encode("utf-8")).decode("utf-8")
        return self._call_tool("upload_design_md", {
            "projectId": clean_id,
            "designMdBase64": b64_content,
        })
