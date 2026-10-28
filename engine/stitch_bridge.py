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
from typing import Any, Final
import urllib.error
import urllib.request

logger = logging.getLogger(__name__)

STITCH_MCP_URL: Final[str] = "https://stitch.googleapis.com/mcp"
STITCH_ERROR_NOT_CONFIGURED: Final[str] = "StitchClient nao configurado: STITCH_API_KEY ausente."
STITCH_PROJECTS_PREFIX: Final[str] = "projects/"

MODEL_TIER_MAPPING: Final[dict[str, str]] = {
    "BALANCED": "GEMINI_3_8_FLASH",
    "SPEED": "GEMINI_3_5_FLASH_LITE",
    "GEMINI_3_8_FLASH": "GEMINI_3_8_FLASH",
    "GEMINI_3_5_FLASH_LITE": "GEMINI_3_5_FLASH_LITE",
    "GEMINI_3_FLASH": "GEMINI_3_FLASH",
    "GEMINI_3_1_PRO": "GEMINI_3_1_PRO",
}


@dataclass
class StitchProject(dict[str, Any]):
    """Representacao hibrida (dataclass + dict) de um projeto Stitch.

    Garante compatibilidade total com acessos por atributo (.project_id, .title, .name)
    e acessos indexados por chave (proj['title'], proj.get('createTime')), bem como
    isinstance(proj, dict) para serializacao JSON nativa.
    """

    name: str
    title: str
    visibility: str = "PRIVATE"
    create_time: str = ""
    update_time: str = ""
    project_type: str = "PROJECT_DESIGN"
    origin: str = "STITCH"

    def __post_init__(self) -> None:
        for f in self.__dataclass_fields__:
            self[f] = getattr(self, f)
        self["createTime"] = self.create_time
        self["updateTime"] = self.update_time
        self["projectType"] = self.project_type

    @property
    def project_id(self) -> str:
        """Extrai o identificador numerico do projeto."""
        return self.name.split("/")[-1] if "/" in self.name else self.name

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> StitchProject:
        """Instancia StitchProject a partir de dicionario JSON-RPC de forma defensiva."""
        inst = cls(
            name=str(data.get("name", "")),
            title=str(data.get("title", "")),
            visibility=str(data.get("visibility", "PRIVATE")),
            create_time=str(data.get("createTime") or data.get("create_time", "")),
            update_time=str(data.get("updateTime") or data.get("update_time", "")),
            project_type=str(data.get("projectType") or data.get("project_type", "PROJECT_DESIGN")),
            origin=str(data.get("origin", "STITCH")),
        )
        for k, v in data.items():
            inst[k] = v
        return inst


@dataclass
class StitchScreen(dict[str, Any]):
    """Representacao hibrida (dataclass + dict) de uma tela gerada no Stitch.

    Oferece atributos fortemente tipados (.id, .device_type, .screenshot_url, .html_url)
    e compatibilidade estrita com APIs baseadas em dicionario (.get('deviceType')).
    """

    name: str
    id: str
    title: str = ""
    device_type: str = "DESKTOP"
    screenshot_url: str | None = None
    html_url: str | None = None

    def __post_init__(self) -> None:
        for f in self.__dataclass_fields__:
            self[f] = getattr(self, f)
        self["deviceType"] = self.device_type
        self["screenshotUrl"] = self.screenshot_url
        self["htmlUrl"] = self.html_url

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> StitchScreen:
        """Instancia StitchScreen a partir de dicionario JSON-RPC de forma defensiva."""
        raw_name = str(data.get("name", ""))
        raw_id = str(data.get("id", "")) or (raw_name.split("/")[-1] if "/" in raw_name else "")
        screenshot_val = data.get("screenshotUrl") or data.get("screenshot_url")
        html_val = data.get("htmlUrl") or data.get("html_url")
        inst = cls(
            name=raw_name,
            id=raw_id,
            title=str(data.get("title", "")),
            device_type=str(data.get("deviceType") or data.get("device_type", "DESKTOP")),
            screenshot_url=str(screenshot_val) if screenshot_val is not None else None,
            html_url=str(html_val) if html_val is not None else None,
        )
        for k, v in data.items():
            inst[k] = v
        return inst


class StitchClient:
    """Cliente JSON-RPC hermetico para o servidor MCP do Google Cloud Stitch."""

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str = STITCH_MCP_URL,
        timeout: float = 30.0,
    ) -> None:
        if not base_url.startswith("https://"):
            raise ValueError("StitchClient exige base_url https: urlopen tambem abriria file: e esquemas custom.")
        self._api_key = api_key or os.getenv("STITCH_API_KEY", "")
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
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)

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
            logger.exception("[STITCH] Erro HTTP %d na chamada %s: %s", e.code, tool_name, err_msg)
            raise RuntimeError(f"Erro HTTP ({e.code}) no Stitch MCP: {err_msg}") from e
        except Exception:
            logger.exception("[STITCH] Falha de conexao com Stitch MCP")
            raise

    def list_projects(self, filter_view: str = "owned") -> list[StitchProject]:
        """Lista os projetos Stitch disponiveis."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        res = self._call_tool("list_projects", {"filter": f"view={filter_view}"})
        projects = res.get("projects")
        if isinstance(projects, list):
            return [StitchProject.from_dict(p) for p in projects if isinstance(p, dict)]
        return []

    def get_project(self, project_name_or_id: str) -> StitchProject:
        """Recupera detalhes de um projeto Stitch."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        formatted_name = (
            project_name_or_id
            if project_name_or_id.startswith(STITCH_PROJECTS_PREFIX)
            else f"{STITCH_PROJECTS_PREFIX}{project_name_or_id}"
        )
        res = self._call_tool("get_project", {"name": formatted_name})
        return StitchProject.from_dict(res)

    def create_project(self, title: str) -> StitchProject:
        """Cria um novo projeto Stitch."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        res = self._call_tool("create_project", {"title": title})
        return StitchProject.from_dict(res)

    def delete_project(self, project_name_or_id: str) -> bool:
        """Exclui um projeto Stitch."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        formatted_name = (
            project_name_or_id
            if project_name_or_id.startswith(STITCH_PROJECTS_PREFIX)
            else f"{STITCH_PROJECTS_PREFIX}{project_name_or_id}"
        )
        try:
            self._call_tool("delete_project", {"name": formatted_name})
            return True
        except Exception as e:
            logger.warning("[STITCH] delete_project falhou para %s: %s", formatted_name, e)
            return False

    def list_screens(self, project_id: str) -> list[StitchScreen]:
        """Lista todas as telas criadas dentro de um projeto Stitch."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        clean_id = project_id.replace(STITCH_PROJECTS_PREFIX, "")
        res = self._call_tool("list_screens", {"projectId": clean_id})
        screens = res.get("screens")
        if isinstance(screens, list):
            return [StitchScreen.from_dict(s) for s in screens if isinstance(s, dict)]
        return []

    def get_screen(self, screen_name: str) -> StitchScreen:
        """Recupera especificacoes detalhadas de uma tela."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        res = self._call_tool("get_screen", {"name": screen_name})
        return StitchScreen.from_dict(res)

    def download_file(self, file_resource_name: str) -> dict[str, object]:
        """Baixa o conteudo de um arquivo (HTML ou screenshot) gerado pelo Stitch."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        return self._call_tool("download_file", {"name": file_resource_name})

    def generate_screen_from_text(
        self,
        project_id: str,
        prompt: str,
        model_tier: str | None = None,
        device_type: str = "DESKTOP",
        design_system: str | None = None,
    ) -> dict[str, object]:
        """Dispara a geracao de uma nova tela no Stitch.

        Suporta selecao de modelo via enums oficiais do portao Stitch MCP:
        - Balanced: GEMINI_3_8_FLASH (padrao na UI)
        - Speed: GEMINI_3_5_FLASH_LITE
        Se omitido, o modelo padrao e resolvido pelo proprio servidor Stitch.
        """
        clean_id = project_id.replace(STITCH_PROJECTS_PREFIX, "")
        args: dict[str, object] = {
            "projectId": clean_id,
            "prompt": prompt,
            "deviceType": device_type,
        }
        if model_tier:
            resolved_model = MODEL_TIER_MAPPING.get(model_tier.upper(), model_tier)
            args["modelId"] = resolved_model
        if design_system:
            args["designSystem"] = design_system
        return self._call_tool("generate_screen_from_text", args)

    def edit_screens(
        self,
        project_id: str,
        screen_ids: list[str],
        prompt: str,
        model_tier: str | None = None,
        device_type: str = "DESKTOP",
    ) -> dict[str, object]:
        """Edita telas existentes dentro de um projeto via instrucao em texto."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        clean_id = project_id.replace(STITCH_PROJECTS_PREFIX, "")
        clean_screen_ids = [
            s.replace(f"{STITCH_PROJECTS_PREFIX}{clean_id}/screens/", "").replace("screens/", "") for s in screen_ids
        ]
        args: dict[str, object] = {
            "projectId": clean_id,
            "selectedScreenIds": clean_screen_ids,
            "prompt": prompt,
            "deviceType": device_type,
        }
        if model_tier:
            resolved_model = MODEL_TIER_MAPPING.get(model_tier.upper(), model_tier)
            args["modelId"] = resolved_model
        return self._call_tool("edit_screens", args)

    def generate_variants(
        self,
        project_id: str,
        screen_ids: list[str],
        prompt: str,
        variant_count: int = 3,
        creative_range: str = "EXPLORE",
        aspects: list[str] | None = None,
        model_tier: str | None = None,
        device_type: str = "DESKTOP",
    ) -> dict[str, object]:
        """Gera variantes de telas existentes dentro de um projeto Stitch."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        clean_id = project_id.replace(STITCH_PROJECTS_PREFIX, "")
        clean_screen_ids = [
            s.replace(f"{STITCH_PROJECTS_PREFIX}{clean_id}/screens/", "").replace("screens/", "") for s in screen_ids
        ]
        variant_options: dict[str, object] = {
            "variantCount": min(max(1, variant_count), 5),
            "creativeRange": creative_range,
        }
        if aspects:
            variant_options["aspects"] = aspects

        args: dict[str, object] = {
            "projectId": clean_id,
            "selectedScreenIds": clean_screen_ids,
            "prompt": prompt,
            "variantOptions": variant_options,
            "deviceType": device_type,
        }
        if model_tier:
            resolved_model = MODEL_TIER_MAPPING.get(model_tier.upper(), model_tier)
            args["modelId"] = resolved_model
        return self._call_tool("generate_variants", args)

    def list_design_systems(self, project_id: str) -> list[dict[str, object]]:
        """Lista sistemas de design associados ao projeto."""
        clean_id = project_id.replace(STITCH_PROJECTS_PREFIX, "")
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
        clean_id = project_id.replace(STITCH_PROJECTS_PREFIX, "")
        b64_content = base64.b64encode(design_md_text.encode("utf-8")).decode("utf-8")
        return self._call_tool(
            "upload_design_md",
            {
                "projectId": clean_id,
                "designMdBase64": b64_content,
            },
        )

    def create_design_system_from_design_md(
        self,
        project_id: str,
        screen_instance_id: str,
        source_screen: str,
        device_type: str = "DESKTOP",
    ) -> dict[str, object]:
        """Cria um sistema de design a partir de um DESIGN.md previamente enviado."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        clean_proj_id = project_id.replace(STITCH_PROJECTS_PREFIX, "")
        return self._call_tool(
            "create_design_system_from_design_md",
            {
                "projectId": clean_proj_id,
                "selectedScreenInstance": {
                    "id": screen_instance_id,
                    "sourceScreen": source_screen,
                },
                "deviceType": device_type,
            },
        )

    def apply_design_system(
        self,
        project_id: str,
        asset_id: str,
        selected_screen_instances: list[dict[str, str]],
    ) -> dict[str, object]:
        """Aplica um sistema de design a uma lista de instancias de tela."""
        if not self.is_configured:
            raise ValueError(STITCH_ERROR_NOT_CONFIGURED)
        clean_proj_id = project_id.replace(STITCH_PROJECTS_PREFIX, "")
        clean_asset_id = asset_id.replace("assets/", "")
        return self._call_tool(
            "apply_design_system",
            {
                "projectId": clean_proj_id,
                "assetId": clean_asset_id,
                "selectedScreenInstances": selected_screen_instances,
            },
        )
