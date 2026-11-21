"""Observatorio unificado de pools, chaves e roteamento SOTA (HKCU/HKLM + Pool Managers + DB + Live Probe).

Consolidacao backend/CLI sem exposicao de segredos: devolve exclusivamente
mascaras, fingerprints sha8, metricas de saude em memoria, estatisticas do SQLite
e sondas HTTP read-only opcionais (0 tokens LLM).
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime
import hashlib
import hmac
import logging
import os
import re
import socket
import ssl
import sys
import time
from typing import TYPE_CHECKING, Any, TypedDict

import aiohttp
import certifi

if TYPE_CHECKING:
    from database.queue_manager import QueueManager

logger = logging.getLogger(__name__)

_HMAC_BUDGET_SALT = b"sota_budget_pool_salt"

_SYSTEM_IGNORE = frozenset(
    {
        "Path",
        "PATHEXT",
        "ComSpec",
        "OS",
        "NUMBER_OF_PROCESSORS",
        "PROCESSOR_ARCHITECTURE",
        "PROCESSOR_IDENTIFIER",
        "PROCESSOR_LEVEL",
        "PROCESSOR_REVISION",
        "TEMP",
        "TMP",
        "USERNAME",
        "USERDOMAIN",
        "DriverData",
        "OneDrive",
        "OneDriveConsumer",
        "VBOX_MSI_INSTALL_PATH",
        "windir",
        "CUDA_PATH",
        "CUDA_PATH_V12_8",
        "NVCUDASAMPLES_ROOT",
        "NVM_HOME",
        "NVM_SYMLINK",
        "PNPM_HOME",
        "CARGO_HOME",
        "RUSTUP_HOME",
        "PYTHONIOENCODING",
        "PYTHONUTF8",
        "PSModulePath",
        "GOPATH",
        "HERMES_HOME",
        "IDENTITY_ENDPOINT",
        "IMDS_ENDPOINT",
        "ZES_ENABLE_SYSMAN",
    }
)

_NON_SECRET_EXACT = frozenset(
    {
        "GCP_PROJECT_ID",
        "GCP_PROJECT_NUMBER",
        "GCP_ACCOUNT_EMAIL",
        "GOOGLE_CLOUD_PROJECT",
        "GOOGLE_CLOUD_PROJECT_NUMBER",
        "GOOGLE_OAUTH_CLIENT_ID",
        "GITHUB_USER",
        "GITHUB_PROFILE_URL",
        "DOCKER_USER",
        "VERCEL_USER_ID",
        "VERCEL_USERNAME",
        "DEVIN_ORG_ID",
        "RAGFLOW_API_BASE",
        "OLLAMA_EMAIL",
        "OLLAMA_USER",
        "OLLAMA_CONTEXT_LENGTH",
        "OLLAMA_FLASH_ATTENTION",
        "OLLAMA_KEEP_ALIVE",
        "OLLAMA_KV_CACHE_TYPE",
        "OLLAMA_MAX_LOADED_MODELS",
        "OLLAMA_VULKAN",
        "LLAMA_ARG_FIT",
        "LLAMA_ARG_FIT_TARGET",
        "SOTA_VRAM_GB",
        "SOTA_OPENAI_AUTH_HEADER",
        "SOTA_OPENAI_MODEL",
        "SOTA_OPENAI_URL",
        "CHICO_LAYA_PREDICT_ALLOW_CPU",
        "NEO4J_AURA_DATABASE",
        "NEO4J_AURA_INSTANCE_ID",
        "NEO4J_AURA_MCP_URL",
        "NEO4J_AURA_PROJECT_ID",
        "NEO4J_AURA_PROJECT_NAME",
        "NEO4J_AURA_QUERY_URL",
        "NEO4J_AURA_URI",
        "NEO4J_AURA_CLIENT_ID",
        "NEO4J_AURA_AGENT_CLIENT_ID",
        "MEDIA_POOL_PROVIDER",
    }
)

_SECRET_VALUE_RE = re.compile(
    r"^(sk-or-v1-|sk-|AQ\.|AIza|ghp_|github_pat_|sbp_|hf_|vcp_|rnd_|whsec_|GOCSPX-|dckr_pat_|ragflow-|cog_|api-key-)"
)
_SECRET_NAME_RE = re.compile(r"(KEY|TOKEN|SECRET|PAT|PASS|PWD|CRED|DECISION_API)")
_OPENROUTER_RX = re.compile(r"^sk-or-v1-[0-9a-fA-F]{64}$")
_AISTUDIO_RX = re.compile(r"^(AQ\.|AIza)\S{20,}$")
_OLLAMA_RX = re.compile(r"^[0-9a-fA-F]+\.\S+$")

_EXPECTED_ALIAS_GROUPS: tuple[frozenset[str], ...] = (
    frozenset({"OPENROUTER_API_KEY", "OPENROUTER_TIER4_KEY_1"}),
    frozenset({"GEMINI_API_KEY", "GEMINI_API_KEY_1", "GEMINI_FLASH_KEY_1"}),
    frozenset({"GEMINI_API_KEY_2", "GEMINI_FLASH_KEY_2"}),
    frozenset({"GEMINI_API_KEY_3", "GEMINI_FLASH_KEY_3"}),
    frozenset({"GEMINI_API_KEY_4", "GEMINI_FLASH_KEY_4"}),
    frozenset({"GEMINI_API_KEY_5", "GEMINI_FLASH_KEY_5"}),
    frozenset({"JULES_API_KEY", "GOOGLE_JULES_API_KEY"}),
    frozenset({"STITCH_API_KEY", "GOOGLE_STITCH_API_KEY"}),
    frozenset({"GITHUB_TOKEN", "GH_TOKEN", "GITHUB_PAT_CLASSIC", "GITHUB_PERSONAL_ACCESS_TOKEN"}),
    frozenset({"DEVIN_API_KEY", "DEVIN_API_KEY_1", "DEVIN_API_TOKEN_2"}),
    frozenset({"DEVIN_API_TOKEN", "DEVIN_API_TOKEN_1", "DEVIN_API_KEY_2"}),
    frozenset({"DOCKER_PAT", "DOCKER_PAT_1"}),
    frozenset({"RAGFLOW_API_KEY", "RAGFLOW_API_KEY_1"}),
    frozenset({"VERCEL_TOKEN", "VERCEL_TOKEN_1"}),
    frozenset({"NEO4J_AURA_API_KEY", "NEO4J_AURA_API_KEY_1"}),
)

_POOL_DECISION = "Pool Decision"
_POOL_GEMINI_TEXT = "Gemini Texto"
_POOL_MEDIA_AI = "Multimodal AI Studio"
_STATUS_200_OK = "200 OK"

_POOL_POLICIES: dict[str, tuple[str, str]] = {
    "OpenRouter Tier 1": ("Core Cognitivo (Opus/ChatGPT6/Gemini4)", "0-tolerancia; nunca degrada"),
    "OpenRouter Tier 2": ("Superagentes & Pesquisa", "Degrada -> Tier 4 / Tier 1"),
    "OpenRouter Tier 3": ("Frota Especialista & Batch", "Alto throughput; degrada -> Ollama Local"),
    "OpenRouter Tier 4": ("Subagentes Dedicados + Ponte Legada", "Degrada -> Tier 3"),
    "OpenRouter Dedicadas": ("Credenciais por condutor + ponte legada", "OPENROUTER_API_KEY = TIER4_KEY_1"),
    _POOL_DECISION: ("System-1 Gemini Decisions API", "Laya -> gemini-decision-1; proj 913870412920"),
    _POOL_GEMINI_TEXT: ("Pool Flash-Lite (5 unicas + aliases)", "Cota compartilhada no proj 913870412920"),
    _POOL_MEDIA_AI: ("TTS / Video / Image / Translate (direto)", "1o na ordem MEDIA_POOL_PROVIDER"),
    "Multimodal OpenRouter": ("TTS / Video / Image / Translate (fallback)", "2o na ordem MEDIA_POOL_PROVIDER"),
    "Ollama Cloud": ("OLLAMA_API_KEY + OLLAMA_CLOUD_KEY (backup)", "ollama.com/api (Bearer); local :11434"),
    "Providers Pendentes/Extras": ("Anthropic / OpenAI", "Nao provisionadas"),
    "Ecossistema/Outros": ("GitHub, Devin, Stitch, Jules, Exa, DBs, Local", "Bridges MCP, deploy e auth local"),
}

_POOL_ORDER: tuple[str, ...] = tuple(_POOL_POLICIES.keys())

_ROLE_HINTS: dict[str, str] = {
    "OPENROUTER_API_KEY": "Ponte legada (= TIER4_KEY_1; isola Tier 1)",
    "OPENROUTER_ANTIGRAVITY_KEY": "Dedicada condutor Antigravity",
    "OPENROUTER_DEVIN_KEY": "Dedicada condutor Devin",
    "OPENROUTER_HERMES_KEY": "Dedicada condutor Hermes Agent",
    "OLLAMA_API_KEY": "Primaria Ollama Cloud",
    "OLLAMA_CLOUD_KEY": "Backup legada OLLAMA_KEYS",
    "GEMINI_API_KEY": "Fallback geral (= GEMINI_API_KEY_1)",
    "SOTA_SITE_TOKEN": "Token loopback local (:17043/.env)",
    "SOTA_OPENAI_API_KEY": "Auth proxy local Hermes/SOTA (:18434)",
    "WEBHOOK_OPENROUTER_SECRET": "Assinatura webhook (whsec_*)",
    "GOOGLE_OAUTH_CLIENT_SECRET": "OAuth Desktop client 'Gemini'",
    "HF_TOKEN": "HuggingFace Hub (MCP + TimesFM/ST)",
}


class ObservatoryAnomaly(TypedDict):
    severity: str
    variable: str
    pool: str
    issue: str


class ObservatoryEntry(TypedDict):
    pool: str
    variable: str
    mask: str
    sha8: str
    sync: str
    process: str
    format_valid: bool | None
    health_label: str
    health_ok: bool | None
    latency_ms: float | None
    role_hint: str


class ObservatoryPoolSummary(TypedDict):
    pool: str
    total_vars: int
    synced: int
    invalid_fmt: int
    role: str
    policy: str
    health_label: str
    avg_latency_ms: float | None


def _sha8(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:8] if value else ""


def _budget_fingerprint(provider: str, value: str) -> str:
    msg = f"{provider}:{value}".encode()
    return hmac.new(_HMAC_BUDGET_SALT, msg, hashlib.sha256).hexdigest()[:24]


def _is_secret_var(name: str, value: str | None) -> bool:
    if name in _NON_SECRET_EXACT:
        return False
    if value and _SECRET_VALUE_RE.match(value):
        return True
    return bool(_SECRET_NAME_RE.search(name))


def _mask_value(name: str, value: str | None) -> str:
    if value is None:
        return "<unset>"
    if not value:
        return "<empty>"
    if not _is_secret_var(name, value):
        return value
    if len(value) >= 20:
        return f"{value[:10]}...{value[-4:]}"
    return f"<masked len={len(value)}>"


def _classify_pool(name: str) -> tuple[str, re.Pattern[str] | None]:
    if re.match(r"^OPENROUTER_TIER1_KEY_\d+$", name):
        return "OpenRouter Tier 1", _OPENROUTER_RX
    if re.match(r"^OPENROUTER_TIER2_KEY_\d+$", name):
        return "OpenRouter Tier 2", _OPENROUTER_RX
    if re.match(r"^OPENROUTER_TIER3_KEY_\d+$", name):
        return "OpenRouter Tier 3", _OPENROUTER_RX
    if re.match(r"^OPENROUTER_TIER4_KEY_\d+$", name):
        return "OpenRouter Tier 4", _OPENROUTER_RX
    if re.match(r"^OPENROUTER_(ANTIGRAVITY|DEVIN|HERMES|API)_KEY$", name):
        return "OpenRouter Dedicadas", _OPENROUTER_RX
    if re.match(r"^DECISION_API_\d+$", name):
        return _POOL_DECISION, _AISTUDIO_RX
    if re.match(r"^GEMINI_(API|FLASH)_KEY(_\d+)?$", name):
        return _POOL_GEMINI_TEXT, _AISTUDIO_RX
    if re.match(r"^GEMINI_(TTS|VIDEO|IMAGE|TRANSLATE)_KEY(_\d+)?$", name):
        return _POOL_MEDIA_AI, _AISTUDIO_RX
    if re.match(r"^OPENROUTER_GEMINI_(TTS|VIDEO|IMAGE|TRANSLATE)_KEY(_\d+)?$", name):
        return "Multimodal OpenRouter", _OPENROUTER_RX
    if re.match(r"^OLLAMA_(API|CLOUD)_KEY$", name):
        return "Ollama Cloud", _OLLAMA_RX
    if re.match(r"^(ANTHROPIC|CLAUDE|OPENAI)_", name):
        return "Providers Pendentes/Extras", None
    return "Ecossistema/Outros", None


def _read_winreg_hive(root: int, subkey: str) -> dict[str, str]:
    out: dict[str, str] = {}
    if sys.platform != "win32":
        return out
    import winreg  # noqa: PLC0415

    try:
        with winreg.OpenKey(root, subkey) as key:
            idx = 0
            while True:
                try:
                    name, val, _ = winreg.EnumValue(key, idx)
                    idx += 1
                    if name and name not in _SYSTEM_IGNORE:
                        out[name] = "" if val is None else str(val)
                except OSError:
                    break
    except OSError:
        pass
    return out


def _read_registry_pair() -> tuple[dict[str, str], dict[str, str]]:
    if sys.platform != "win32":
        return {}, {}
    import winreg  # noqa: PLC0415

    hkcu = _read_winreg_hive(winreg.HKEY_CURRENT_USER, "Environment")
    hklm = _read_winreg_hive(
        winreg.HKEY_LOCAL_MACHINE,
        r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment",
    )
    return hkcu, hklm


def _probe_target(var_name: str, pool: str, value: str) -> tuple[str, str] | None:
    if not value:
        return None
    if value.startswith("sk-or-v1-"):
        return ("openrouter", value)
    if value.startswith(("AQ.", "AIza")) and (
        pool in (_POOL_DECISION, _POOL_GEMINI_TEXT, _POOL_MEDIA_AI)
        or var_name in ("GOOGLE_JULES_API_KEY", "JULES_API_KEY", "GOOGLE_STITCH_API_KEY", "STITCH_API_KEY")
    ):
        return ("aistudio", value)
    if var_name == "HF_TOKEN":
        return ("hf", value)
    if var_name in ("OLLAMA_API_KEY", "OLLAMA_CLOUD_KEY"):
        return ("ollama_cloud", value)
    if var_name in ("GITHUB_TOKEN", "GITHUB_PAT_FINE_GRAINED"):
        return ("github", value)
    return None


_PROBE_ENDPOINTS: dict[str, tuple[str, str, str]] = {
    "aistudio": ("https://generativelanguage.googleapis.com/v1beta/models", "AI Studio", "key/quota"),
    "hf": ("https://huggingface.co/api/whoami-v2", "HF", "hf"),
    "ollama_cloud": ("https://ollama.com/api/tags", "ollama.com", "ollama"),
    "github": ("https://api.github.com/user", "GitHub", "github"),
}


async def _probe_openrouter_key(
    session: aiohttp.ClientSession,
    secret: str,
    t0: float,
) -> tuple[str, bool, float | None, str]:
    async with session.get(
        "https://openrouter.ai/api/v1/auth/key",
        headers={"Authorization": f"Bearer {secret}"},
    ) as resp:
        ms = round((time.monotonic() - t0) * 1000.0, 1)
        if resp.status != 200:
            return f"HTTP {resp.status}", False, ms, "auth err"
        data = await resp.json(content_type=None)
        info = data.get("data", {}) if isinstance(data, dict) else {}
        note = "free" if info.get("is_free_tier") else "paid"
        return _STATUS_200_OK, True, ms, note


async def _probe_standard_key(
    session: aiohttp.ClientSession,
    kind: str,
    secret: str,
    t0: float,
) -> tuple[str, bool, float | None, str]:
    spec = _PROBE_ENDPOINTS.get(kind)
    if spec is None:
        return "N/A", False, None, ""
    url, ok_note, err_note = spec
    if kind == "aistudio":
        req_cm = session.get(url, params={"pageSize": "1", "key": secret})
    else:
        headers = {"Authorization": f"Bearer {secret}"}
        if kind == "github":
            headers["User-Agent"] = "sota-observatory"
        req_cm = session.get(url, headers=headers)
    async with req_cm as resp:
        ms = round((time.monotonic() - t0) * 1000.0, 1)
        if resp.status == 200:
            return _STATUS_200_OK, True, ms, ok_note
        return f"HTTP {resp.status}", False, ms, err_note


async def _probe_single(
    session: aiohttp.ClientSession,
    sem: asyncio.Semaphore,
    kind: str,
    secret: str,
) -> tuple[str, bool, float | None, str]:
    async with sem:
        t0 = time.monotonic()
        try:
            if kind == "openrouter":
                return await _probe_openrouter_key(session, secret, t0)
            return await _probe_standard_key(session, kind, secret, t0)
        except TimeoutError:
            return "TIMEOUT", False, None, ">8s"
        except aiohttp.ClientError as exc:
            return "OFFLINE", False, None, type(exc).__name__


async def _run_live_probes(
    items: list[tuple[str, str, str]],
) -> dict[str, tuple[str, bool, float | None, str]]:
    unique_targets: dict[tuple[str, str], list[str]] = {}
    for var_name, pool, val in items:
        target = _probe_target(var_name, pool, val)
        if target is not None:
            unique_targets.setdefault(target, []).append(var_name)
    if not unique_targets:
        return {}

    ssl_ctx = ssl.create_default_context(cafile=certifi.where())
    ssl_ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    connector = aiohttp.TCPConnector(ssl=ssl_ctx, family=socket.AF_INET)
    timeout = aiohttp.ClientTimeout(total=8.0)
    sem = asyncio.Semaphore(8)

    out: dict[str, tuple[str, bool, float | None, str]] = {}
    async with aiohttp.ClientSession(connector=connector, timeout=timeout, trust_env=True) as session:
        targets = list(unique_targets.items())
        results = await asyncio.gather(*(_probe_single(session, sem, k, s) for (k, s), _ in targets))
        for idx, (_target, names) in enumerate(targets):
            for vn in names:
                out[vn] = results[idx]
    return out


def _compute_sync_state(u: str | None, m: str | None) -> str:
    if u is not None and m is not None and u == m:
        return "BOTH_EMPTY" if not u else "SYNCED"
    if u is not None and m is None:
        return "HKCU_ONLY"
    if m is not None and u is None:
        return "HKLM_ONLY"
    return "DIFF_VALUES"


def _compute_proc_state(p: str | None, primary: str) -> str:
    if p is None:
        return "UNSET"
    return "MATCH" if p == primary else "STALE_OR_DIFF"


async def _load_db_health_map(manager: QueueManager | None) -> dict[str, dict[str, Any]]:
    db_report_by_hash: dict[str, dict[str, Any]] = {}
    if manager is None:
        return db_report_by_hash
    try:
        for row in await manager.get_key_health_report(window_minutes=1440):
            db_report_by_hash[f"{row['provider']}:{row['key_hash']}"] = row
    except Exception as exc:  # noqa: BLE001
        logger.debug("Falha ao consultar get_key_health_report: %s", exc)
    return db_report_by_hash


def _load_openrouter_runtime_count() -> int:
    try:
        from llm.openrouter_pool import openrouter_pool_manager  # noqa: PLC0415

        return len(openrouter_pool_manager.get_telemetry_summary())
    except Exception as exc:  # noqa: BLE001
        logger.debug("Telemetria em memoria de openrouter_pool indisponivel: %s", exc)
        return 0


def _collect_entry_anomalies(
    name: str,
    pool: str,
    is_secret: bool,
    sync: str,
    fmt_ok: bool | None,
) -> list[ObservatoryAnomaly]:
    found: list[ObservatoryAnomaly] = []
    if sync == "DIFF_VALUES":
        found.append(
            {
                "severity": "FAIL" if is_secret else "WARN",
                "variable": name,
                "pool": pool,
                "issue": "Valor HKCU difere de HKLM",
            }
        )
    elif sync in ("HKCU_ONLY", "HKLM_ONLY") and is_secret:
        found.append(
            {
                "severity": "WARN",
                "variable": name,
                "pool": pool,
                "issue": f"Espelhamento incompleto ({sync})",
            }
        )
    if fmt_ok is False:
        found.append(
            {
                "severity": "FAIL",
                "variable": name,
                "pool": pool,
                "issue": "Formato invalido para o pool",
            }
        )
    return found


def _collect_duplicate_anomalies(sha_to_vars: dict[str, list[tuple[str, str]]]) -> list[ObservatoryAnomaly]:
    found: list[ObservatoryAnomaly] = []
    for s8, occ in sha_to_vars.items():
        if len(occ) <= 1:
            continue
        var_set = {v for v, _ in occ}
        if any(var_set.issubset(grp) for grp in _EXPECTED_ALIAS_GROUPS):
            continue
        pools_seen = sorted({p for _, p in occ})
        found.append(
            {
                "severity": "FAIL" if len(pools_seen) == 1 else "WARN",
                "variable": ", ".join(sorted(var_set)),
                "pool": " / ".join(pools_seen),
                "issue": f"Chave duplicada/compartilhada (sha8={s8})",
            }
        )
    return found


def _lookup_db_stat(primary: str, db_report_by_hash: dict[str, dict[str, Any]]) -> dict[str, Any] | None:
    if not primary:
        return None
    for prov in ("openrouter", "gemini", "ollama", "local"):
        fp = _budget_fingerprint(prov, primary)
        stat = db_report_by_hash.get(f"{prov}:{fp}") or db_report_by_hash.get(f"{prov}:{prov}:sha256:{fp}")
        if stat is not None:
            return stat
    return None


def _resolve_entry_health(
    name: str,
    primary: str,
    fmt_ok: bool | None,
    live_res: tuple[str, bool, float | None, str] | None,
    db_stat: dict[str, Any] | None,
) -> tuple[str, bool | None, float | None, str]:
    base_hint = _ROLE_HINTS.get(name, f"len={len(primary)}" if primary else "empty")
    if live_res is not None:
        health_label, health_ok, latency_ms, note = live_res
        role_hint = f"{base_hint} \u00b7 {note}" if note else base_hint
        return health_label, health_ok, latency_ms, role_hint
    if db_stat is not None:
        att = int(db_stat.get("attempts", 0))
        ok_c = int(db_stat.get("successes", 0))
        pct = round(100.0 * ok_c / att) if att else 0
        raw_lat = db_stat.get("avg_latency_ms")
        latency_ms = round(float(raw_lat), 1) if raw_lat is not None else None
        return f"DB {pct}% ({ok_c}/{att})", pct >= 70, latency_ms, base_hint
    return "READY", fmt_ok, None, base_hint


def _format_pool_health_label(
    ok_cnt: int,
    total: int,
    has_live: bool,
    has_lats: bool,
) -> str:
    if has_live:
        return f"{ok_cnt}/{total} OK"
    if has_lats:
        return f"DB {ok_cnt}/{total} OK"
    return "READY (offline)"


def _build_pool_summaries(
    entries: list[ObservatoryEntry],
    has_live: bool,
) -> list[ObservatoryPoolSummary]:
    summaries: list[ObservatoryPoolSummary] = []
    for p_name in _POOL_ORDER:
        p_entries = [e for e in entries if e["pool"] == p_name]
        if not p_entries:
            continue
        synced = sum(1 for e in p_entries if e["sync"] == "SYNCED")
        invalid = sum(1 for e in p_entries if e["format_valid"] is False)
        lats = [e["latency_ms"] for e in p_entries if e["latency_ms"] is not None]
        avg_lat = round(sum(lats) / len(lats), 1) if lats else None
        ok_cnt = sum(1 for e in p_entries if e["health_ok"] is True)
        role_desc, policy = _POOL_POLICIES[p_name]
        summaries.append(
            {
                "pool": p_name,
                "total_vars": len(p_entries),
                "synced": synced,
                "invalid_fmt": invalid,
                "role": role_desc,
                "policy": policy,
                "health_label": _format_pool_health_label(ok_cnt, len(p_entries), has_live, bool(lats)),
                "avg_latency_ms": avg_lat,
            }
        )
    return summaries


def _scan_registry_entries(
    all_names: list[str],
    flt: str,
    hkcu: dict[str, str],
    hklm: dict[str, str],
) -> tuple[
    dict[str, str],
    list[tuple[str, str, str]],
    list[tuple[str, str, bool, str | None, str | None, str | None, bool | None]],
    list[ObservatoryAnomaly],
    dict[str, list[tuple[str, str]]],
]:
    raw_values: dict[str, str] = {}
    probe_items: list[tuple[str, str, str]] = []
    entries_meta: list[tuple[str, str, bool, str | None, str | None, str | None, bool | None]] = []
    anomalies: list[ObservatoryAnomaly] = []
    sha_to_vars: dict[str, list[tuple[str, str]]] = {}

    for name in all_names:
        pool, rx = _classify_pool(name)
        if flt and flt not in pool.lower() and flt not in name.lower():
            continue
        u = hkcu.get(name)
        m = hklm.get(name)
        p = os.environ.get(name)
        primary = u if (u is not None and u != "") else (m or "")
        is_secret = _is_secret_var(name, u) or _is_secret_var(name, m)
        fmt_ok = bool(rx.match(primary)) if (rx and primary) else None
        sync = _compute_sync_state(u, m)

        anomalies.extend(_collect_entry_anomalies(name, pool, is_secret, sync, fmt_ok))
        if is_secret and primary:
            raw_values[name] = primary
            probe_items.append((name, pool, primary))
            sha_to_vars.setdefault(_sha8(primary), []).append((name, pool))
        entries_meta.append((name, pool, is_secret, u, m, p, fmt_ok))

    return raw_values, probe_items, entries_meta, anomalies, sha_to_vars


async def collect_observatory_snapshot(
    manager: QueueManager | None = None,
    *,
    live: bool = False,
    pool_filter: str = "",
) -> dict[str, Any]:
    """Coleta snapshot completo e mascarado dos pools, registro, managers e DB."""
    hkcu, hklm = _read_registry_pair()
    all_names = sorted({*hkcu.keys(), *hklm.keys()}, key=lambda s: re.sub(r"\d+", lambda m: m.group(0).zfill(4), s))
    flt = pool_filter.strip().lower()
    db_report_by_hash = await _load_db_health_map(manager)

    raw_values, probe_items, entries_meta, anomalies, sha_to_vars = _scan_registry_entries(all_names, flt, hkcu, hklm)
    anomalies.extend(_collect_duplicate_anomalies(sha_to_vars))
    live_map = await _run_live_probes(probe_items) if live else {}
    openrouter_runtime_keys = _load_openrouter_runtime_count()

    entries: list[ObservatoryEntry] = []
    for name, pool, is_secret, u, m, p, fmt_ok in entries_meta:
        if not is_secret:
            continue
        primary = raw_values.get(name, "")
        sync = _compute_sync_state(u, m)
        proc = _compute_proc_state(p, primary)
        db_stat = _lookup_db_stat(primary, db_report_by_hash)
        health_label, health_ok, latency_ms, role_hint = _resolve_entry_health(
            name, primary, fmt_ok, live_map.get(name), db_stat
        )
        entries.append(
            {
                "pool": pool,
                "variable": name,
                "mask": _mask_value(name, primary or u or m),
                "sha8": _sha8(primary),
                "sync": sync,
                "process": proc,
                "format_valid": fmt_ok,
                "health_label": health_label,
                "health_ok": health_ok,
                "latency_ms": latency_ms,
                "role_hint": role_hint,
            }
        )

    summaries = _build_pool_summaries(entries, bool(live and live_map))
    total_vars = len(entries)
    total_synced = sum(1 for e in entries if e["sync"] == "SYNCED")
    all_lats = sorted(e["latency_ms"] for e in entries if e["latency_ms"] is not None)
    p95_lat = all_lats[max(0, min(len(all_lats) - 1, int((len(all_lats) - 1) * 0.95)))] if all_lats else None

    return {
        "timestamp": datetime.now(UTC).isoformat(),
        "mode": "live" if live else "offline",
        "total_vars": total_vars,
        "total_synced": total_synced,
        "anomalies_count": len(anomalies),
        "fails_count": sum(1 for a in anomalies if a["severity"] == "FAIL"),
        "warns_count": sum(1 for a in anomalies if a["severity"] == "WARN"),
        "p95_latency_ms": p95_lat,
        "openrouter_runtime_keys": openrouter_runtime_keys,
        "summaries": summaries,
        "entries": entries,
        "anomalies": anomalies,
    }
