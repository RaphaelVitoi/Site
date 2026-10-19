"""Interceptador e Filtro Dinamico de Ferramentas MCP System-1.

Mascara schemas de ferramentas irrelevantes para o prompt atual utilizando
o sinal rapido (<0.5ms) da Laya S1, reduzindo a sobrecarga de tokens de contexto
e evitando alucinacoes de chamada de ferramentas.

Padrao SOTA: Pure ASCII, PEP 585/604, Tipagem Estrita Python 3.12+, Zero-Any.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
import json
import logging
from pathlib import Path
import re
import time
from typing import Any

from llm.laya_bridge import classificar_intencao

logger = logging.getLogger(__name__)

SITE_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_TELEMETRY_PATH = SITE_ROOT / "data" / "mcp_tool_telemetry.jsonl"

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
    overhead_us: float = 0.0
    bytes_original: int = 0
    bytes_retained: int = 0
    bytes_saved_pct: float = 0.0


def registrar_telemetria_poda(
    telemetria: ToolPruningTelemetry,
    prompt: str = "",
    telemetry_path: Path | None = None,
) -> None:
    """Registra evento de poda em ledger append-only JSONL."""
    alvo = telemetry_path or DEFAULT_TELEMETRY_PATH
    try:
        alvo.parent.mkdir(parents=True, exist_ok=True)
        registro = {
            "timestamp": datetime.now(UTC).isoformat(),
            "prompt_preview": prompt[:120].strip(),
            "orig_count": telemetria.tools_original_count,
            "ret_count": telemetria.tools_retained_count,
            "pruned_count": telemetria.pruned_count,
            "pruned_pct": telemetria.pruned_pct,
            "bytes_original": telemetria.bytes_original,
            "bytes_retained": telemetria.bytes_retained,
            "bytes_saved_pct": telemetria.bytes_saved_pct,
            "overhead_us": round(telemetria.overhead_us, 1),
            "active_categories": telemetria.active_categories,
            "s1_choice": telemetria.s1_choice,
            "s1_noul": telemetria.s1_noul,
        }
        with open(alvo, "a", encoding="utf-8") as f:
            f.write(json.dumps(registro, ensure_ascii=True) + "\n")
    except Exception as e:
        logger.debug("[mcp-s1-telemetry] Falha ao registrar telemetria: %s", e)


def obter_telemetria_sessao(
    horas: float = 24.0,
    max_registros: int = 500,
    telemetry_path: Path | None = None,
) -> list[dict[str, Any]]:
    """Recupera registros de telemetria recentes da janela de sessao."""
    alvo = telemetry_path or DEFAULT_TELEMETRY_PATH
    if not alvo.exists():
        return []

    agora = datetime.now(UTC)
    registros: list[dict[str, Any]] = []

    try:
        with open(alvo, encoding="utf-8") as f:
            for linha in f:
                linha = linha.strip()
                if not linha:
                    continue
                try:
                    obj = json.loads(linha)
                    ts_str = str(obj.get("timestamp", ""))
                    if ts_str:
                        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                        delta_horas = (agora - ts).total_seconds() / 3600.0
                        if delta_horas <= horas:
                            registros.append(obj)
                except (json.JSONDecodeError, ValueError):
                    continue
    except Exception as e:
        logger.debug("[mcp-s1-telemetry] Falha ao ler telemetria: %s", e)
        return []

    return registros[-max_registros:]


def calcular_estatisticas_telemetria(registros: list[dict[str, Any]]) -> dict[str, float | int]:
    """Calcula metricas agregadas ponderadas a partir dos registros de telemetria."""
    if not registros:
        return {
            "total_eventos": 0,
            "total_bytes_orig": 0,
            "total_bytes_ret": 0,
            "economia_media_tokens_pct": 0.0,
            "overhead_medio_us": 0.0,
        }

    total_orig = sum(int(r.get("bytes_original", 0)) for r in registros)
    total_ret = sum(int(r.get("bytes_retained", 0)) for r in registros)

    if total_orig > 0:
        economia_pct = round(((total_orig - total_ret) / total_orig) * 100.0, 2)
    else:
        pcts = [float(r.get("bytes_saved_pct", 0.0)) for r in registros]
        economia_pct = round(sum(pcts) / len(pcts), 2) if pcts else 0.0

    overheads = [float(r.get("overhead_us", 0.0)) for r in registros if float(r.get("overhead_us", 0.0)) > 0]
    overhead_medio = round(sum(overheads) / len(overheads), 1) if overheads else 0.0

    return {
        "total_eventos": len(registros),
        "total_bytes_orig": total_orig,
        "total_bytes_ret": total_ret,
        "economia_media_tokens_pct": economia_pct,
        "overhead_medio_us": overhead_medio,
    }


def _extrair_nome_ferramenta(tool_def: dict[str, Any]) -> str:
    """Extrai o identificador ou nome da declaracao de ferramenta."""
    if "name" in tool_def:
        return str(tool_def["name"]).lower()
    if "function" in tool_def and isinstance(tool_def["function"], dict):
        return str(tool_def["function"].get("name", "")).lower()
    return ""


def _resolver_categorias_ativas(prompt: str, s1_choice: str) -> set[str]:
    """Mapeamento semantico de intencao para categorias de ferramentas ativas."""
    categorias: set[str] = {"filesystem_read"}
    if _RESEARCH_KEYWORDS.search(prompt) or s1_choice in {"simple", "moderate"}:
        categorias.add("web_research")
    if _WRITE_KEYWORDS.search(prompt) or s1_choice == "complex":
        categorias.add("filesystem_write")
    if _UI_KEYWORDS.search(prompt):
        categorias.add("browser_ui")
    if _DB_KEYWORDS.search(prompt):
        categorias.add("database_data")
    if _CLOUD_KEYWORDS.search(prompt):
        categorias.add("cloud_async")
    if len(categorias) == 1:
        categorias.update(["web_research", "filesystem_write"])
    return categorias


def _filtrar_ferramentas_permitidas(tools: list[dict[str, Any]], permitidas: set[str]) -> list[dict[str, Any]]:
    """Filtra ferramentas mantendo desconhecidas (fail-open) e permitidas."""
    filtradas: list[dict[str, Any]] = []
    for tool_def in tools:
        nome = _extrair_nome_ferramenta(tool_def)
        eh_conhecida = any(nome in names or any(k in nome for k in names) for names in TOOL_CATEGORIES.values())
        if not eh_conhecida or any(k in nome for k in permitidas):
            filtradas.append(tool_def)
    return filtradas or tools


def interceptar_e_podar_ferramentas_s1(
    tools: list[dict[str, Any]] | None,
    prompt: str,
    intencao_s1: dict[str, Any] | None = None,
    registrar_telemetria: bool = True,
    telemetry_path: Path | None = None,
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
            overhead_us=0.0,
            bytes_original=0,
            bytes_retained=0,
            bytes_saved_pct=0.0,
        )
        return [], telem

    t0 = time.perf_counter()

    # Identificacao de intencao S1
    intent = intencao_s1 or classificar_intencao(prompt).metadados_s1()
    s1_choice = str(intent.get("choice", "moderate"))
    s1_noul = float(intent.get("noul", 0.5))

    categorias_ativas = _resolver_categorias_ativas(prompt, s1_choice)
    ferramentas_permitidas = {tool_name for cat in categorias_ativas for tool_name in TOOL_CATEGORIES.get(cat, set())}
    ferramentas_filtradas = _filtrar_ferramentas_permitidas(tools, ferramentas_permitidas)

    t1 = time.perf_counter()
    overhead_us = (t1 - t0) * 1_000_000

    orig = len(tools)
    ret = len(ferramentas_filtradas)
    pruned = orig - ret
    pruned_pct = round((pruned / orig * 100.0), 2) if orig > 0 else 0.0

    try:
        bytes_orig = len(json.dumps(tools).encode("utf-8"))
        bytes_ret = len(json.dumps(ferramentas_filtradas).encode("utf-8"))
        bytes_saved_pct = round(((bytes_orig - bytes_ret) / bytes_orig * 100.0), 2) if bytes_orig > 0 else 0.0
    except (TypeError, ValueError):
        bytes_orig = 0
        bytes_ret = 0
        bytes_saved_pct = pruned_pct

    telemetria = ToolPruningTelemetry(
        tools_original_count=orig,
        tools_retained_count=ret,
        pruned_count=pruned,
        pruned_pct=pruned_pct,
        active_categories=sorted(categorias_ativas),
        s1_choice=s1_choice,
        s1_noul=s1_noul,
        overhead_us=round(overhead_us, 1),
        bytes_original=bytes_orig,
        bytes_retained=bytes_ret,
        bytes_saved_pct=bytes_saved_pct,
    )

    if registrar_telemetria:
        registrar_telemetria_poda(telemetria, prompt=prompt, telemetry_path=telemetry_path)

    logger.debug(
        "[mcp-s1-prune] Poda S1 aplicada: %d -> %d ferramentas (%.1f%% podadas, %.1fus) em %s",
        orig,
        ret,
        pruned_pct,
        overhead_us,
        categorias_ativas,
    )
    return ferramentas_filtradas, telemetria
