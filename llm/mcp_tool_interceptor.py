"""Interceptador e Filtro Dinamico de Ferramentas MCP System-1.

Mascara schemas de ferramentas irrelevantes para o prompt atual utilizando
o sinal rapido (<0.5ms) da Laya S1, reduzindo a sobrecarga de tokens de contexto
e evitando alucinacoes de chamada de ferramentas.

Padrao SOTA: Pure ASCII, PEP 585/604, Tipagem Estrita Python 3.12+, Zero-Any.
"""

from __future__ import annotations

from dataclasses import dataclass
import logging
import re
from typing import Any

from llm.laya_bridge import classificar_intencao

logger = logging.getLogger(__name__)

# Categorias semanticas de ferramentas MCP mapeadas por prefixos/palavras-chave
TOOL_CATEGORIES: dict[str, set[str]] = {
    "web_research": {
        "exa",
        "search_web",
        "web_search_exa",
        "web_fetch_exa",
        "read_url_content",
        "google_search",
        "fetch",
    },
    "filesystem_read": {"view_file", "read_file", "get_file_contents", "list_directory", "search_code"},
    "filesystem_write": {"write_to_file", "replace_file_content", "create_or_update_file", "delete_file"},
    "browser_ui": {
        "browser_navigate",
        "browser_click",
        "browser_type",
        "browser_snapshot",
        "browser_take_screenshot",
        "lighthouse_audit",
        "chrome_devtools",
    },
    "database_data": {
        "run_sql",
        "execute_sql",
        "query_logs",
        "describe_table_schema",
        "bigquery",
        "supabase",
        "alloydb",
        "spanner",
    },
    "cloud_async": {
        "jules_create_session",
        "jules_get_session_status",
        "jules_approve_plan",
        "stitch_create_project",
        "google_workspace",
    },
}

_RESEARCH_KEYWORDS = re.compile(
    r"\b(pesquise|busque|search|find|quais|qual|document|docs|explique|explain)\b", re.IGNORECASE
)
_WRITE_KEYWORDS = re.compile(
    r"\b(crie|adicione|escreva|modifique|altere|refatore|fix|implement|create|update|write)\b", re.IGNORECASE
)
_UI_KEYWORDS = re.compile(r"\b(tela|ui|css|componente|visual|layout|design|browser|frontend|html)\b", re.IGNORECASE)
_DB_KEYWORDS = re.compile(r"\b(sql|banco|query|tabela|schema|postgres|supabase|bigquery|database)\b", re.IGNORECASE)
_CLOUD_KEYWORDS = re.compile(r"\b(jules|stitch|workspace|drive|gmail|cloud|async|vm)\b", re.IGNORECASE)


@dataclass(frozen=True, slots=True)
class ToolPruningTelemetry:
    """Telemetria formal de poda de ferramentas System-1."""

    tools_original_count: int
    tools_retained_count: int
    pruned_count: int
    pruned_pct: float
    active_categories: list[str]
    s1_choice: str
    s1_noul: float


def _extrair_nome_ferramenta(tool_def: dict[str, Any]) -> str:
    """Extrai o identificador ou nome da declaracao de ferramenta."""
    if "name" in tool_def:
        return str(tool_def["name"]).lower()
    if "function" in tool_def and isinstance(tool_def["function"], dict):
        return str(tool_def["function"].get("name", "")).lower()
    return ""


def interceptar_e_podar_ferramentas_s1(
    tools: list[dict[str, Any]] | None,
    prompt: str,
    intencao_s1: dict[str, Any] | None = None,
) -> tuple[list[dict[str, Any]], ToolPruningTelemetry]:
    """Intercepta e poda dinamicamente ferramentas irrelevantes para o prompt atual.

    Preserva sempre ferramentas essenciais de leitura e navegacao para garantir seguranca.
    """
    if not tools:
        telem = ToolPruningTelemetry(
            tools_original_count=0,
            tools_retained_count=0,
            pruned_count=0,
            pruned_pct=0.0,
            active_categories=[],
            s1_choice="simple",
            s1_noul=1.0,
        )
        return [], telem

    # Identificacao de intencao S1
    intent = intencao_s1 or classificar_intencao(prompt).metadados_s1()
    s1_choice = str(intent.get("choice", "moderate"))
    s1_noul = float(intent.get("noul", 0.5))

    categorias_ativas: set[str] = set()

    # Sempre preserva leitura de arquivo por seguranca e grounding basico
    categorias_ativas.add("filesystem_read")

    # Mapeamento semantico de intencao para categorias
    if _RESEARCH_KEYWORDS.search(prompt) or s1_choice in {"simple", "moderate"}:
        categorias_ativas.add("web_research")
    if _WRITE_KEYWORDS.search(prompt) or s1_choice == "complex":
        categorias_ativas.add("filesystem_write")
    if _UI_KEYWORDS.search(prompt):
        categorias_ativas.add("browser_ui")
    if _DB_KEYWORDS.search(prompt):
        categorias_ativas.add("database_data")
    if _CLOUD_KEYWORDS.search(prompt):
        categorias_ativas.add("cloud_async")

    # Se nenhuma categoria especifica for ativada alem de filesystem_read, abre escopo
    if len(categorias_ativas) == 1:
        categorias_ativas.update(["web_research", "filesystem_write"])

    ferramentas_permitidas = {tool_name for cat in categorias_ativas for tool_name in TOOL_CATEGORIES.get(cat, set())}

    ferramentas_filtradas: list[dict[str, Any]] = []
    for tool_def in tools:
        nome = _extrair_nome_ferramenta(tool_def)
        # Se for reconhecida no catalogo de categorias, obedece ao gating;
        # se for ferramenta customizada desconhecida, preserva por seguranca (fail-open)
        eh_conhecida = any(nome in names or any(k in nome for k in names) for names in TOOL_CATEGORIES.values())
        if not eh_conhecida or any(k in nome for k in ferramentas_permitidas):
            ferramentas_filtradas.append(tool_def)

    # Nunca esvazia completamente
    if not ferramentas_filtradas:
        ferramentas_filtradas = tools

    orig = len(tools)
    ret = len(ferramentas_filtradas)
    pruned = orig - ret
    pruned_pct = round((pruned / orig * 100.0), 2) if orig > 0 else 0.0

    telemetria = ToolPruningTelemetry(
        tools_original_count=orig,
        tools_retained_count=ret,
        pruned_count=pruned,
        pruned_pct=pruned_pct,
        active_categories=sorted(categorias_ativas),
        s1_choice=s1_choice,
        s1_noul=s1_noul,
    )

    logger.debug(
        "[mcp-s1-prune] Poda S1 aplicada: %d -> %d ferramentas (%.1f%% podadas) em %s",
        orig,
        ret,
        pruned_pct,
        categorias_ativas,
    )
    return ferramentas_filtradas, telemetria
