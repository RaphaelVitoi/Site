# pylint: disable=broad-exception-caught, import-outside-toplevel, line-too-long
"""
Google Antigravity SDK SOTA Bridge - Ecosystem Orchestration Layer
Versao: v8.0 GOLD (Strict Typing, Autonomous & Interactive Modes, Multi-Backend)

Harmoniza o SDK oficial (google-antigravity 0.1.23+) com:
1. Google AI Studio (Hosted Gemini 3.8 Flash via GEMINI_API_KEY)
2. Gemini Enterprise Platform / Vertex AI (ADC & Express Mode)
3. On-Device Local Models (LiteRTAgentConfig - Gemma 4 / LocalOpenAIAgentConfig)
4. Gateway MCP Compartilhado (:8933 / :8931 e nucleo_compartilhado.json)
5. Suite de Skills (.agents/skills, antigravity/builtin/skills, plugins)
6. Antigravity IDE & Antigravity CLI (agy 1.5.2+)
"""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Sequence
from dataclasses import dataclass, field
import json
import logging
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from typing import Any, Callable

from dotenv import load_dotenv

# Carrega arquivos de ambiente com precedencia estrita
SITE_DIR = Path(__file__).resolve().parent.parent
RAIZ_DIR = SITE_DIR.parent

# Carga de arquivos de ambiente
load_dotenv(SITE_DIR / ".env.local")
load_dotenv(SITE_DIR / ".env")
load_dotenv(RAIZ_DIR / ".env")

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

logger = logging.getLogger("antigravity_sdk_bridge")

HOME = Path.home()
NUCLEO_PATH = RAIZ_DIR / "nucleo" / "nucleo_compartilhado.json"
AGY_CLI_SETTINGS = RAIZ_DIR / "antigravity-cli" / "settings.json"
AGY_DEFAULT_BIN = Path(os.environ.get("LOCALAPPDATA", str(HOME / "AppData/Local"))) / "agy" / "bin" / "agy.exe"
REF_RE = re.compile(r"\$\{([A-Z0-9_]+)\}")


def resolve_env_or_registry(name: str, default: str = "") -> str:
    """Resolve variavel de ambiente do processo, HKCU ou HKLM."""
    val = (os.getenv(name) or "").strip()
    if val:
        return val
    try:
        import winreg

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


def discover_skill_directories() -> list[str]:
    """Descobre os diretorios canonicamente indexados contendo skills (SKILL.md)."""
    candidate_parents: list[Path] = [
        SITE_DIR / ".agents" / "skills",
        RAIZ_DIR / "antigravity" / "builtin" / "skills",
    ]

    plugins_dir = RAIZ_DIR / "config" / "plugins"
    if plugins_dir.is_dir():
        for skill_dir in plugins_dir.glob("*/skills"):
            if skill_dir.is_dir():
                candidate_parents.append(skill_dir)

    valid_paths: list[str] = []
    for parent in candidate_parents:
        if not parent.is_dir():
            continue
        # Verifica se o diretorio possui pastas com SKILL.md
        has_skills = any((child / "SKILL.md").is_file() for child in parent.iterdir() if child.is_dir())
        if has_skills and str(parent) not in valid_paths:
            valid_paths.append(str(parent))

    return valid_paths


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


def load_mcp_servers_from_nucleo(
    only_names: set[str] | None = None,
) -> list[types.McpStreamableHttpServer | types.McpStdioServer]:
    """Converte os servidores MCP compartilhados do nucleo em objetos tipados do Antigravity SDK."""
    if not NUCLEO_PATH.is_file():
        logger.warning(f"Nucleo compartilhado nao encontrado em {NUCLEO_PATH}")
        return []

    try:
        raw = json.loads(NUCLEO_PATH.read_text(encoding="utf-8-sig"))
    except Exception:
        logger.exception("Erro ao carregar nucleo_compartilhado.json")
        return []

    gateway = raw.get("mcp", {}).get("gateway", {})
    gateway_host = gateway.get("host", "127.0.0.1")
    gateway_port = gateway.get("port", 8933)
    gateway_base = f"http://{gateway_host}:{gateway_port}/servers"

    compartilhados: dict[str, dict[str, Any]] = raw.get("mcp", {}).get("compartilhados", {})
    servers: list[types.McpStreamableHttpServer | types.McpStdioServer] = []

    for name, cfg in compartilhados.items():
        if only_names is not None and name not in only_names:
            continue
        srv = _build_single_mcp_server(name, cfg, gateway_base)
        if srv is not None:
            servers.append(srv)

    return servers


def get_default_safety_policies(allow_run_command: bool = False) -> list[policy.Policy]:
    """Retorna o conjunto canonico de politicas de seguranca Chico SOTA."""
    if allow_run_command:
        return [policy.allow_all()]
    return [
        policy.deny("run_command", reason="Comandos shell requerem confirmacao explicita"),
        policy.allow("*"),
    ]


@dataclass
class AntigravityRunResult:
    """Resultado estruturado da execucao de um agente Antigravity."""

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

        resolved_project = project or resolve_env_or_registry("GOOGLE_CLOUD_PROJECT", "original-498419")
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
            try:
                raw_thoughts = getattr(response, "thoughts", None)
                if raw_thoughts is not None:
                    if hasattr(raw_thoughts, "__aiter__"):
                        async for t in raw_thoughts:
                            thoughts.append(str(t))
                    elif isinstance(raw_thoughts, (list, tuple, set)):
                        for t in raw_thoughts:
                            thoughts.append(str(t))
            except Exception:
                pass

            stop_reason = None
            try:
                stop_reason = str(response.stop_reason) if response.stop_reason else None
            except Exception:
                pass

            usage = None
            try:
                usage = response.usage_metadata
            except Exception:
                pass

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
        """Transmite tokens do modelo em tempo real sem latencia adicional."""
        active_config = config or self.build_hosted_config()
        async with Agent(config=active_config) as agent:
            response = await agent.chat(prompt)
            async for chunk in response:
                if isinstance(chunk, str):
                    yield chunk
                elif hasattr(chunk, "text") and chunk.text:
                    yield chunk.text

    @staticmethod
    def audit_ecosystem() -> dict[str, Any]:
        """Produz um diagnostico completo e auditavel do ecossistema Antigravity."""
        agy_bin = find_agy_cli()
        cli_version = "missing"
        if agy_bin:
            try:
                proc = subprocess.run([str(agy_bin), "--version"], capture_output=True, text=True, check=False)
                cli_version = proc.stdout.strip() or proc.stderr.strip()
            except Exception as e:
                cli_version = f"error: {e}"

        skills = discover_skill_directories()
        mcp_servers = load_mcp_servers_from_nucleo()

        # Verifica presenca do binario localharness.exe
        import google.antigravity

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

        return {
            "sdk": {
                "package": "google-antigravity",
                "version": getattr(google.antigravity, "__version__", "0.1.23"),
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
            "mcp": {
                "shared_gateway": "http://127.0.0.1:8933/servers",
                "bridged_servers_count": len(mcp_servers),
                "servers": [s.name for s in mcp_servers],
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

    args = parser.parse_args()

    if args.audit or (not args.prompt and not args.stream):
        report = AntigravityAgentBridge.audit_ecosystem()
        print(json.dumps(report, indent=2, ensure_ascii=False))
        sys.exit(0)

    if args.prompt:
        if args.stream:

            async def _stream():
                async for token in default_bridge.stream_prompt(args.prompt):
                    print(token, end="", flush=True)
                print()

            asyncio.run(_stream())
        else:

            async def _run():
                res = await default_bridge.run_prompt(args.prompt)
                print(res.text)

            asyncio.run(_run())
