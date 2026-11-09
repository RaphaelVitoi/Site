# pylint: disable=broad-exception-caught, import-outside-toplevel, line-too-long
"""
Google Antigravity SDK SOTA Bridge - Ecosystem Orchestration Layer
Versao: v8.0 GOLD (Strict Typing, Autonomous & Interactive Modes, Multi-Backend)

Harmoniza o SDK oficial (google-antigravity 0.1.23+) com:
1. Google AI Studio (Hosted Gemini 3.8 Flash via GEMINI_API_KEY)
2. Gemini Enterprise Platform / Vertex AI (ADC & Express Mode)
3. On-Device Local Models (LiteRTAgentConfig - Gemma 4 / LocalOpenAIAgentConfig)
4. Modelos Locais Otimizados Ollama (:11434 - Qwen Code Surgical, PMev Math, Poetics, Gemma 4)
5. Gateway MCP Compartilhado (:8933 / :8931 e nucleo_compartilhado.json)
6. Suite de Skills (.agents/skills, antigravity/builtin/skills, plugins)
7. Subagentes Customizados Declarativos (~/.gemini/agents/*.md)
8. Antigravity IDE & Antigravity CLI (agy 1.5.2+)
"""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable
import contextlib
from dataclasses import dataclass, field
from importlib.metadata import version as pkg_version
import json
import logging
import os
from pathlib import Path
import re
import shutil
import subprocess  # noqa: S404  # Record-Id: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
import sys
import time
from typing import Any, Final
import urllib.error
import urllib.request

from dotenv import load_dotenv
import google.antigravity
from google.antigravity import (
    Agent,
    AgentBehavior,
    CapabilitiesConfig,
    LiteRTAgentConfig,
    LiteRTBackend,
    LocalAgentConfig,
    LocalOpenAIAgentConfig,
    policy,
    types,
)

# Resolve RAIZ_DIR (~/.gemini) e SITE_DIR (~/.gemini/Site) independentemente de onde o modulo reside
_THIS_DIR = Path(__file__).resolve().parent
if _THIS_DIR.name == "ops" and _THIS_DIR.parent.name == "scripts":
    if _THIS_DIR.parent.parent.name == "Site":
        SITE_DIR = _THIS_DIR.parent.parent
        RAIZ_DIR = SITE_DIR.parent
    else:
        RAIZ_DIR = _THIS_DIR.parent.parent
        SITE_DIR = RAIZ_DIR / "Site"
else:
    SITE_DIR = _THIS_DIR.parent
    RAIZ_DIR = SITE_DIR.parent

# Carga de arquivos de ambiente com precedencia estrita
load_dotenv(SITE_DIR / ".env.local")
load_dotenv(SITE_DIR / ".env")
load_dotenv(RAIZ_DIR / ".env")

logger = logging.getLogger("antigravity_sdk_bridge")

HOME = Path.home()
NUCLEO_PATH = RAIZ_DIR / "nucleo" / "nucleo_compartilhado.json"
GEMINI_CLI_SETTINGS = RAIZ_DIR / "settings.json"
AGY_CLI_SETTINGS = RAIZ_DIR / "antigravity-cli" / "settings.json"
AGY_DEFAULT_BIN = Path(os.environ.get("LOCALAPPDATA", str(HOME / "AppData/Local"))) / "agy" / "bin" / "agy.exe"
REF_RE = re.compile(r"\$\{([A-Z0-9_]+)\}")

# Catalogo canonico de modelos locais otimizados servidos no daemon Ollama (:11434)
LOCAL_OPTIMIZED_MODELS: Final[dict[str, str]] = {
    "qwen-code-surgical": "qwen-code-surgical:latest",
    "qwen-pmev-math": "qwen-pmev-math:latest",
    "qwen-poetics": "qwen-poetics:latest",
    "gemma4-e4b": "gemma4:e4b",
    "gemma4-12b": "gemma4:12b",
    "gemma4-e2b": "gemma4:e2b",
    "gemma4": "gemma4:latest",
    "qwen-coder-7b": "qwen2.5-coder:7b-instruct-q5_K_M",
    "qwen-coder-1.5b": "qwen2.5-coder:1.5b",
    "qwen-coder-0.5b": "qwen2.5-coder:0.5b",
}


def resolve_local_model_tag(alias_or_tag: str) -> str:
    """Resolve alias simplificado para a tag exata no daemon Ollama."""
    cleaned = (alias_or_tag or "").strip()
    if not cleaned:
        return LOCAL_OPTIMIZED_MODELS["qwen-code-surgical"]
    if cleaned in LOCAL_OPTIMIZED_MODELS:
        return LOCAL_OPTIMIZED_MODELS[cleaned]
    normalized = cleaned.replace("_", "-").lower()
    if normalized in LOCAL_OPTIMIZED_MODELS:
        return LOCAL_OPTIMIZED_MODELS[normalized]
    for tag in LOCAL_OPTIMIZED_MODELS.values():
        if cleaned.lower() == tag.lower():
            return tag
    return cleaned


def fetch_ollama_runtime_status(base_url: str = "http://127.0.0.1:11434") -> dict[str, Any]:
    """Consulta o daemon Ollama via /api/tags e /api/ps para auditar modelos instalados e em memoria."""
    status: dict[str, Any] = {
        "online": False,
        "base_url": base_url,
        "installed_models": [],
        "active_in_memory": [],
        "error": None,
    }
    if not base_url.startswith(("http://", "https://")):
        status["error"] = f"Esquema de URL invalido para Ollama: {base_url}"
        return status

    # 1. Tags (modelos instalados no disco)
    try:
        req = urllib.request.Request(f"{base_url}/api/tags", headers={"User-Agent": "Antigravity-Bridge/1.0"})  # noqa: S310  # Record-Id: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
        with urllib.request.urlopen(req, timeout=3.0) as resp:  # noqa: S310  # Record-Id: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
            data = json.loads(resp.read().decode("utf-8"))
            status["installed_models"] = [
                {
                    "name": m.get("name"),
                    "size_gb": round(m.get("size", 0) / (1024**3), 2),
                    "modified_at": m.get("modified_at"),
                }
                for m in data.get("models", [])
                if isinstance(m, dict) and "name" in m
            ]
            status["online"] = True
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        status["error"] = f"Falha de conexao com Ollama ({e})"
        return status
    except Exception as e:
        status["error"] = f"Erro ao processar /api/tags: {e}"
        return status

    # 2. PS (modelos ativos atualmente em VRAM/RAM)
    try:
        req_ps = urllib.request.Request(f"{base_url}/api/ps", headers={"User-Agent": "Antigravity-Bridge/1.0"})  # noqa: S310  # Record-Id: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
        with urllib.request.urlopen(req_ps, timeout=3.0) as resp_ps:  # noqa: S310  # Record-Id: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
            ps_data = json.loads(resp_ps.read().decode("utf-8"))
            status["active_in_memory"] = [
                {
                    "name": m.get("name"),
                    "size_mb": round(m.get("size", 0) / (1024**2), 1),
                    "size_vram_mb": round(m.get("size_vram", 0) / (1024**2), 1),
                    "expires_at": m.get("expires_at"),
                }
                for m in ps_data.get("models", [])
                if isinstance(m, dict) and "name" in m
            ]
    except Exception as e:
        logger.debug(f"Aviso ao consultar /api/ps: {e}")

    return status


def warmup_local_model(
    model: str = "qwen-code-surgical",
    base_url: str = "http://127.0.0.1:11434",
    keep_alive: str = "1h",
    timeout_seconds: float = 60.0,
) -> dict[str, Any]:
    """Pre-carrega o modelo local na RAM/VRAM do Ollama com keep_alive para eliminar latencia no primeiro token."""
    tag = resolve_local_model_tag(model)
    if not base_url.startswith(("http://", "https://")):
        return {
            "success": False,
            "model": tag,
            "keep_alive": keep_alive,
            "elapsed_seconds": 0.0,
            "done": False,
            "error": f"Esquema de URL invalido para Ollama: {base_url}",
        }

    payload = json.dumps({"model": tag, "prompt": "", "keep_alive": keep_alive}).encode("utf-8")
    req = urllib.request.Request(  # noqa: S310  # Record-Id: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
        f"{base_url}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json", "User-Agent": "Antigravity-Bridge/1.0"},
        method="POST",
    )
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:  # noqa: S310  # Record-Id: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
            data = json.loads(resp.read().decode("utf-8"))
            elapsed = time.perf_counter() - t0
            return {
                "success": True,
                "model": tag,
                "keep_alive": keep_alive,
                "elapsed_seconds": round(elapsed, 2),
                "done": data.get("done", True),
                "error": None,
            }
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        elapsed = time.perf_counter() - t0
        return {
            "success": False,
            "model": tag,
            "keep_alive": keep_alive,
            "elapsed_seconds": round(elapsed, 2),
            "done": False,
            "error": str(e),
        }


def resolve_env_or_registry(name: str, default: str = "") -> str:
    """Resolve variavel de ambiente do processo, HKCU ou HKLM."""
    val = (os.getenv(name) or "").strip()
    if val:
        return val
    try:
        import winreg  # noqa: PLC0415

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
    except ImportError:
        pass
    return default


def _expand_refs(text: str) -> str:
    """Expande referencias ${VAR} utilizando ambiente e chaves de registro."""
    return REF_RE.sub(lambda m: resolve_env_or_registry(m.group(1), m.group(0)), text)


def find_agy_cli() -> Path | None:
    """Localiza o executavel `agy` (Antigravity CLI)."""
    which_hit = shutil.which("agy")
    if which_hit:
        return Path(which_hit)
    if AGY_DEFAULT_BIN.is_file():
        return AGY_DEFAULT_BIN
    return None


def candidate_skill_roots() -> list[Path]:
    """Retorna os caminhos candidatos onde diretorios de skills residem."""
    candidates: list[Path] = [
        SITE_DIR / ".agents" / "skills",
        RAIZ_DIR / "antigravity" / "builtin" / "skills",
        RAIZ_DIR / "tools" / "mcp-runtime" / "node_modules" / "chrome-devtools-mcp" / "skills",
    ]
    plugins_dir = RAIZ_DIR / "config" / "plugins"
    if plugins_dir.is_dir():
        for skill_dir in plugins_dir.glob("*/skills"):
            if skill_dir.is_dir():
                candidates.append(skill_dir)
    return candidates


def _has_valid_subagent_frontmatter(md_file: Path) -> bool:
    """Verifica se o arquivo Markdown possui frontmatter YAML valido de subagente (name e description)."""
    try:
        text = md_file.read_text(encoding="utf-8")
    except OSError:
        return False
    match = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n", text, re.S)
    if not match:
        return False
    frontmatter = match.group(1)
    has_name = bool(re.search(r"(?m)^name\s*:\s*\S+", frontmatter))
    has_desc = bool(re.search(r"(?m)^description\s*:\s*\S+", frontmatter))
    return has_name and has_desc


def discover_custom_subagents(agents_dirs: tuple[Path, ...] | None = None) -> list[str]:
    """Descobre definicoes de subagentes customizados (.md) em ~/.gemini/agents e Site/.gemini/agents."""
    subagents: list[str] = []
    search_dirs = agents_dirs if agents_dirs is not None else (RAIZ_DIR / "agents", SITE_DIR / ".gemini" / "agents")
    for agents_dir in search_dirs:
        if not agents_dir.is_dir():
            continue
        for md_file in sorted(agents_dir.glob("*.md")):
            if md_file.is_file() and _has_valid_subagent_frontmatter(md_file) and md_file.stem not in subagents:
                subagents.append(md_file.stem)
    return subagents


def discover_enabled_builtin_subagents(settings_path: Path | None = None) -> list[str]:
    """Le ~/.gemini/settings.json (agents.overrides) e retorna os subagentes nativos habilitados."""
    target = settings_path if settings_path is not None else GEMINI_CLI_SETTINGS
    if not target.is_file():
        return []
    try:
        data = json.loads(target.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return []
    overrides = data.get("agents", {}).get("overrides", {})
    if not isinstance(overrides, dict):
        return []
    return [name for name, cfg in overrides.items() if isinstance(cfg, dict) and cfg.get("enabled") is True]


def discover_skill_directories() -> list[str]:
    """Descobre os diretorios canonicamente indexados contendo skills (SKILL.md)."""
    valid_paths: list[str] = []
    for parent in candidate_skill_roots():
        if not parent.is_dir():
            continue
        has_skills = any((child / "SKILL.md").is_file() for child in parent.iterdir() if child.is_dir())
        if has_skills and str(parent) not in valid_paths:
            valid_paths.append(str(parent))

    return valid_paths


def _parse_valid_port(raw_port: Any, default: int = 8933) -> int:
    """Valida e converte a porta do gateway para inteiro no intervalo 1..65535."""
    if isinstance(raw_port, bool) or raw_port is None:
        return default
    try:
        port = int(str(raw_port).strip())
    except (TypeError, ValueError):
        return default
    return port if 1 <= port <= 65535 else default


def get_shared_gateway_base(raw: dict[str, Any] | None = None) -> str:
    """Deriva a URL base do gateway MCP a partir de nucleo_compartilhado.json."""
    default_url = "http://127.0.0.1:8933/servers"  # NOSONAR
    if raw is None:
        if not NUCLEO_PATH.is_file():
            return default_url
        try:
            raw = json.loads(NUCLEO_PATH.read_text(encoding="utf-8-sig"))
        except Exception as exc:
            logger.warning(f"Falha ao ler gateway MCP em {NUCLEO_PATH}: {exc}")
            return default_url

    if not isinstance(raw, dict):
        return default_url
    mcp_cfg = raw.get("mcp")
    if not isinstance(mcp_cfg, dict):
        return default_url
    gateway = mcp_cfg.get("gateway")
    if not isinstance(gateway, dict):
        return default_url

    raw_host = gateway.get("host")
    host = str(raw_host).strip() if raw_host is not None and str(raw_host).strip() else "127.0.0.1"
    port = _parse_valid_port(gateway.get("port"), default=8933)
    return f"http://{host}:{port}/servers"  # NOSONAR


def _build_single_mcp_server(
    name: str,
    cfg: dict[str, Any],
    gateway_base: str,
) -> types.McpStreamableHttpServer | types.McpStdioServer | None:
    """Instancia um servidor MCP tipado a partir de sua definicao de transporte."""
    transporte = str(cfg.get("transporte", ""))
    if transporte == "stdio":
        return types.McpStreamableHttpServer(
            name=name,
            url=f"{gateway_base}/{name}/mcp",
        )
    if transporte == "http":
        url = _expand_refs(str(cfg.get("url", "")))
        raw_headers = cfg.get("headers")
        headers: dict[str, str] = {}
        if isinstance(raw_headers, dict):
            for hk, hv in raw_headers.items():
                headers[str(hk)] = _expand_refs(str(hv))
        return types.McpStreamableHttpServer(
            name=name,
            url=url,
            headers=headers if headers else None,
        )
    return None


def _read_nucleo_raw() -> dict[str, Any] | None:
    """Carrega o dicionario JSON do nucleo compartilhado."""
    if not NUCLEO_PATH.is_file():
        logger.warning(f"Nucleo compartilhado nao encontrado em {NUCLEO_PATH}")
        return None
    try:
        loaded = json.loads(NUCLEO_PATH.read_text(encoding="utf-8-sig"))
        return loaded if isinstance(loaded, dict) else None
    except Exception:
        logger.exception("Erro ao carregar nucleo_compartilhado.json")
        return None


def load_mcp_servers_from_nucleo(
    only_names: set[str] | None = None,
    raw: dict[str, Any] | None = None,
) -> list[types.McpStreamableHttpServer | types.McpStdioServer]:
    """Converte os servidores MCP compartilhados do nucleo em objetos tipados do Antigravity SDK."""
    active_raw = raw if raw is not None else _read_nucleo_raw()
    if not isinstance(active_raw, dict):
        return []

    mcp_cfg = active_raw.get("mcp")
    compartilhados = mcp_cfg.get("compartilhados") if isinstance(mcp_cfg, dict) else None
    if not isinstance(compartilhados, dict):
        return []

    gateway_base = get_shared_gateway_base(active_raw)
    servers: list[types.McpStreamableHttpServer | types.McpStdioServer] = []

    for name, cfg in compartilhados.items():
        if only_names is not None and name not in only_names:
            continue
        if isinstance(cfg, dict) and (srv := _build_single_mcp_server(name, cfg, gateway_base)) is not None:
            servers.append(srv)

    return servers


def get_default_safety_policies(allow_run_command: bool = False) -> list[policy.Policy]:
    """Retorna o conjunto canonico de politicas de seguranca Chico SOTA."""
    if allow_run_command:
        return [policy.allow_all()]
    return [
        policy.deny("run_command", reason="Comandos shell requerem confirmacao explicita"),
        policy.allow_all(),
    ]


@dataclass
class AntigravityRunResult:
    """Resultado tipado da execucao de um agente Antigravity SDK."""

    text: str
    thoughts: list[str] = field(default_factory=list)
    tool_calls: list[Any] = field(default_factory=list)
    usage_metadata: types.UsageMetadata | None = None
    stop_reason: str | None = None


class AntigravityAgentBridge:
    """Ponte de alto nivel para execucao, auditoria e streaming via Google Antigravity SDK."""

    def __init__(
        self,
        default_model: str = "gemini-3.8-flash",
        system_instructions: str = "Operando sob Protocolo Chico SOTA v8.0 GOLD. Zero filler, Shannon efficiency.",
        autonomous: bool = True,
        load_skills: bool = True,
        load_mcp: bool = True,
    ) -> None:
        self.default_model = default_model
        self.system_instructions = system_instructions
        self.autonomous = autonomous
        self.load_skills = load_skills
        self.load_mcp = load_mcp

    def build_hosted_config(
        self,
        model: str | None = None,
        api_key: str | None = None,
        allow_run_command: bool = False,
        custom_tools: list[Callable[..., Any]] | None = None,
    ) -> LocalAgentConfig:
        """Cria configuracao Hosted (Google AI Studio) via API Key."""
        resolved_key = (
            api_key or resolve_env_or_registry("GEMINI_API_KEY") or resolve_env_or_registry("GOOGLE_API_KEY") or None
        )
        behavior = AgentBehavior.AUTONOMOUS if self.autonomous else AgentBehavior.INTERACTIVE
        skills_paths = discover_skill_directories() if self.load_skills else None
        mcp_servers = load_mcp_servers_from_nucleo() if self.load_mcp else None

        return LocalAgentConfig(
            model=model or self.default_model,
            api_key=resolved_key,
            system_instructions=self.system_instructions,
            skills_paths=skills_paths,
            mcp_servers=mcp_servers,
            tools=custom_tools,
            policies=get_default_safety_policies(allow_run_command=allow_run_command),
            capabilities=CapabilitiesConfig(agent_behavior=behavior),
        )

    def build_vertex_config(
        self,
        model: str | None = None,
        project: str | None = None,
        location: str = "us-central1",
        express_api_key: str | None = None,
        allow_run_command: bool = False,
    ) -> LocalAgentConfig:
        """Cria configuracao Gemini Enterprise Platform / Vertex AI (Standard ADC ou Express)."""
        behavior = AgentBehavior.AUTONOMOUS if self.autonomous else AgentBehavior.INTERACTIVE
        skills_paths = discover_skill_directories() if self.load_skills else None
        mcp_servers = load_mcp_servers_from_nucleo() if self.load_mcp else None

        if express_api_key:
            return LocalAgentConfig(
                model=model or self.default_model,
                vertex=True,
                api_key=express_api_key,
                system_instructions=self.system_instructions,
                skills_paths=skills_paths,
                mcp_servers=mcp_servers,
                policies=get_default_safety_policies(allow_run_command=allow_run_command),
                capabilities=CapabilitiesConfig(agent_behavior=behavior),
            )

        resolved_project = (
            project
            or resolve_env_or_registry("GOOGLE_CLOUD_PROJECT")
            or resolve_env_or_registry("GOOGLE_GENAI_PROJECT")
        )
        if not resolved_project:
            raise ValueError(
                "Para Standard Mode (Vertex AI), e necessario definir 'project' ou a variavel de ambiente GOOGLE_CLOUD_PROJECT."
            )
        return LocalAgentConfig(
            model=model or self.default_model,
            vertex=True,
            project=resolved_project,
            location=location,
            system_instructions=self.system_instructions,
            skills_paths=skills_paths,
            mcp_servers=mcp_servers,
            policies=get_default_safety_policies(allow_run_command=allow_run_command),
            capabilities=CapabilitiesConfig(agent_behavior=behavior),
        )

    def build_litert_config(
        self,
        model_path: str,
        backend: LiteRTBackend | str = LiteRTBackend.GPU,
        enable_speculative_decoding: bool = False,
        allow_run_command: bool = False,
    ) -> LiteRTAgentConfig:
        """Cria configuracao LiteRT para execucao on-device pura (Gemma 4, etc.)."""
        behavior = AgentBehavior.AUTONOMOUS if self.autonomous else AgentBehavior.INTERACTIVE
        skills_paths = discover_skill_directories() if self.load_skills else None
        mcp_servers = load_mcp_servers_from_nucleo() if self.load_mcp else None

        return LiteRTAgentConfig(
            model_path=str(Path(model_path).expanduser().resolve()),
            backend=backend,
            enable_speculative_decoding=enable_speculative_decoding,
            system_instructions=self.system_instructions,
            skills_paths=skills_paths,
            mcp_servers=mcp_servers,
            policies=get_default_safety_policies(allow_run_command=allow_run_command),
            capabilities=CapabilitiesConfig(agent_behavior=behavior),
        )

    def build_local_openai_config(
        self,
        model: str = "gemma4:e4b",
        base_url: str = "http://127.0.0.1:11434/v1",
        lightweight: bool = True,
        allow_run_command: bool = False,
    ) -> LocalOpenAIAgentConfig:
        """Cria configuracao Local OpenAI-compatible (Strata MoE :8080, Ollama :11434)."""
        behavior = AgentBehavior.AUTONOMOUS if self.autonomous else AgentBehavior.INTERACTIVE
        skills_paths = discover_skill_directories() if self.load_skills else None
        mcp_servers = load_mcp_servers_from_nucleo() if self.load_mcp else None

        cfg = LocalOpenAIAgentConfig(
            model=model,
            base_url=base_url,
            system_instructions=self.system_instructions,
            skills_paths=skills_paths,
            mcp_servers=mcp_servers,
            policies=get_default_safety_policies(allow_run_command=allow_run_command),
            capabilities=CapabilitiesConfig(agent_behavior=behavior),
        )
        return cfg.lightweight() if lightweight else cfg

    def build_local_ollama_config(
        self,
        model: str = "qwen-code-surgical",
        base_url: str = "http://127.0.0.1:11434/v1",
        lightweight: bool = True,
        allow_run_command: bool = False,
    ) -> LocalOpenAIAgentConfig:
        """Cria configuracao especializada para o daemon Ollama com resolucao de alias local."""
        tag = resolve_local_model_tag(model)
        return self.build_local_openai_config(
            model=tag,
            base_url=base_url,
            lightweight=lightweight,
            allow_run_command=allow_run_command,
        )

    async def run_prompt(
        self,
        prompt: str,
        config: LocalAgentConfig | LiteRTAgentConfig | LocalOpenAIAgentConfig | None = None,
    ) -> AntigravityRunResult:
        """Executa um prompt assincrono completo via Antigravity SDK e retorna o resultado consolidado."""
        active_config = config or self.build_hosted_config()
        async with Agent(config=active_config) as agent:
            response = await agent.chat(prompt)
            full_text = await response.text()

            thoughts: list[str] = []
            with contextlib.suppress(Exception):
                raw_thoughts = getattr(response, "thoughts", None)
                if raw_thoughts is not None:
                    if hasattr(raw_thoughts, "__aiter__"):
                        async for t in raw_thoughts:
                            thoughts.append(str(t))
                    elif isinstance(raw_thoughts, (list, tuple, set)):
                        for t in raw_thoughts:
                            thoughts.append(str(t))

            stop_reason = None
            with contextlib.suppress(Exception):
                stop_reason = str(response.stop_reason) if response.stop_reason else None

            usage = None
            with contextlib.suppress(Exception):
                usage = response.usage_metadata

            return AntigravityRunResult(
                text=full_text,
                thoughts=thoughts,
                tool_calls=[],
                usage_metadata=usage,
                stop_reason=stop_reason,
            )

    async def stream_prompt(
        self,
        prompt: str,
        config: LocalAgentConfig | LiteRTAgentConfig | LocalOpenAIAgentConfig | None = None,
    ) -> AsyncIterator[str]:
        """Transmite tokens do modelo em tempo real com fechamento deterministico do contexto."""
        active_config = config or self.build_hosted_config()
        stack = contextlib.AsyncExitStack()
        try:
            agent = await stack.enter_async_context(Agent(config=active_config))
            response = await agent.chat(prompt)
            async for chunk in response:
                if isinstance(chunk, str):
                    yield chunk
                elif hasattr(chunk, "text") and chunk.text:
                    yield chunk.text
        finally:
            await stack.aclose()

    @staticmethod
    def audit_ecosystem() -> dict[str, Any]:
        """Produz um diagnostico completo e auditavel do ecossistema Antigravity."""
        agy_bin = find_agy_cli()
        cli_version = "missing"
        if agy_bin:
            try:
                proc = subprocess.run(
                    [str(agy_bin), "--version"],
                    capture_output=True,
                    text=True,
                    check=False,
                    timeout=5,
                )
                cli_version = proc.stdout.strip() or proc.stderr.strip()
            except subprocess.TimeoutExpired:
                cli_version = "error: timeout ao obter versao"
            except Exception as e:
                cli_version = f"error: {e}"

        skills = discover_skill_directories()
        mcp_servers = load_mcp_servers_from_nucleo()

        sdk_version = getattr(google.antigravity, "__version__", None)
        if not sdk_version:
            try:
                sdk_version = pkg_version("google-antigravity")
            except Exception:
                sdk_version = "unknown"

        pkg_root = Path(google.antigravity.__file__).parent
        localharness_exe = pkg_root / "bin" / "localharness.exe"

        key_status = {
            k: bool(resolve_env_or_registry(k))
            for k in (
                "GEMINI_API_KEY",
                "GOOGLE_CLOUD_PROJECT",
                "STITCH_API_KEY",
                "JULES_API_KEY",
                "GITHUB_PERSONAL_ACCESS_TOKEN",
                "RENDER_API_KEY",
                "OLLAMA_API_KEY",
            )
        }

        total_skills = sum(
            len([c for c in Path(d).iterdir() if c.is_dir() and (c / "SKILL.md").is_file()]) for d in skills
        )
        custom_subagents = discover_custom_subagents()
        builtin_enabled = discover_enabled_builtin_subagents()

        # Auditoria de Modelos Locais Otimizados no Ollama
        ollama_status = fetch_ollama_runtime_status()
        installed_names = [str(m.get("name", "")) for m in ollama_status["installed_models"]]
        active_names = [str(m.get("name", "")) for m in ollama_status["active_in_memory"]]
        catalog_coverage = {
            alias: {
                "tag": tag,
                "installed": tag in installed_names,
                "active_in_memory": tag in active_names,
            }
            for alias, tag in LOCAL_OPTIMIZED_MODELS.items()
        }

        return {
            "sdk": {
                "package": "google-antigravity",
                "version": sdk_version,
                "localharness_binary": str(localharness_exe),
                "localharness_exists": localharness_exe.is_file(),
                "localharness_size_bytes": localharness_exe.stat().st_size if localharness_exe.is_file() else 0,
            },
            "cli": {
                "binary": str(agy_bin) if agy_bin else None,
                "version": cli_version,
                "settings_file": str(AGY_CLI_SETTINGS),
                "settings_present": AGY_CLI_SETTINGS.is_file(),
            },
            "skills": {
                "discovered_directories_count": len(skills),
                "total_skills_count": total_skills,
                "paths": skills,
            },
            "subagents": {
                "custom_count": len(custom_subagents),
                "custom_names": custom_subagents,
                "builtin_enabled": builtin_enabled,
            },
            "mcp": {
                "shared_gateway": get_shared_gateway_base(),
                "bridged_servers_count": len(mcp_servers),
                "servers": [s.name for s in mcp_servers],
            },
            "local_models": {
                "ollama_online": ollama_status["online"],
                "base_url": ollama_status["base_url"],
                "installed_count": len(ollama_status["installed_models"]),
                "active_in_memory_count": len(ollama_status["active_in_memory"]),
                "active_models": ollama_status["active_in_memory"],
                "catalog": catalog_coverage,
                "error": ollama_status["error"],
            },
            "auth": key_status,
        }


# Instancia singleton para consumo no Site e scripts
default_bridge = AntigravityAgentBridge()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Google Antigravity SDK SOTA Bridge")
    parser.add_argument("--audit", action="store_true", help="Auditoria completa do ecossistema")
    parser.add_argument("--prompt", type=str, help="Executa prompt de teste via SDK")
    parser.add_argument("--stream", action="store_true", help="Stream tokens em tempo real")
    parser.add_argument("--local", type=str, help="Executa prompt utilizando modelo local Ollama (alias ou tag)")
    parser.add_argument("--warmup-local", type=str, help="Pre-aquece modelo local Ollama na RAM/VRAM")
    parser.add_argument("--list-local", action="store_true", help="Lista status dos modelos locais no daemon Ollama")

    args = parser.parse_args()

    if args.list_local:
        status = fetch_ollama_runtime_status()
        print(json.dumps(status, indent=2, ensure_ascii=False))
        sys.exit(0)

    if args.warmup_local:
        warmup_res = warmup_local_model(args.warmup_local)
        print(json.dumps(warmup_res, indent=2, ensure_ascii=False))
        sys.exit(0 if warmup_res.get("success") else 1)

    if args.audit or (not args.prompt and not args.stream and not args.local):
        report = AntigravityAgentBridge.audit_ecosystem()
        print(json.dumps(report, indent=2, ensure_ascii=False))
        sys.exit(0)

    if args.prompt:
        if args.local:
            cfg = default_bridge.build_local_ollama_config(model=args.local)
        else:
            cfg = default_bridge.build_hosted_config()

        if args.stream:

            async def _stream() -> None:
                async for token in default_bridge.stream_prompt(args.prompt, config=cfg):
                    print(token, end="", flush=True)
                print()

            asyncio.run(_stream())
        else:

            async def _run() -> None:
                res = await default_bridge.run_prompt(args.prompt, config=cfg)
                print(res.text)

            asyncio.run(_run())
