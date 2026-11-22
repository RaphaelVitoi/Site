"""Observatorio unificado de pools, chaves e roteamento SOTA (HKCU/HKLM + Pool Managers + DB + Live Probe).

Consolidacao backend/CLI sem exposicao de segredos: devolve exclusivamente
mascaras, fingerprints sha8, metricas de saude em memoria, estatisticas do SQLite
e sondas HTTP read-only opcionais (0 tokens LLM).
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from functools import lru_cache
import hashlib
import hmac
import json
import logging
import os
from pathlib import Path
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
_REGISTRY_PATH = Path(__file__).resolve().parents[1] / "data" / "credential_registry.json"


@lru_cache(maxsize=1)
def _load_credential_registry() -> dict[str, Any]:
    """Carrega o manifesto canonico de credenciais e pools (SSOT)."""
    return json.loads(_REGISTRY_PATH.read_text(encoding="utf-8"))


def _build_registry_state() -> tuple[
    frozenset[str],
    frozenset[str],
    re.Pattern[str],
    re.Pattern[str],
    tuple[frozenset[str], ...],
    dict[str, tuple[str, str]],
    tuple[str, ...],
    tuple[tuple[str, re.Pattern[str], re.Pattern[str] | None], ...],
    dict[str, str],
]:
    reg = _load_credential_registry()
    system_ignore = frozenset(str(v) for v in reg.get("system_ignore_vars", ()))
    non_secret = frozenset(str(v) for v in reg.get("non_secret_exact", ()))
    secret_val_re = re.compile(str(reg["secret_value_regex"]))
    secret_name_re = re.compile(str(reg["secret_name_regex"]))
    alias_groups = tuple(frozenset(str(x) for x in grp) for grp in reg.get("expected_alias_groups", ()))

    pool_policies: dict[str, tuple[str, str]] = {}
    pool_order: list[str] = []
    pool_matchers: list[tuple[str, re.Pattern[str], re.Pattern[str] | None]] = []
    for p in reg.get("pools", ()):
        name = str(p["name"])
        pool_order.append(name)
        pool_policies[name] = (str(p["role"]), str(p["policy"]))
        m_rx = str(p.get("match_regex", "") or "")
        f_rx = str(p.get("format_regex", "") or "")
        if m_rx:
            pool_matchers.append((name, re.compile(m_rx), re.compile(f_rx) if f_rx else None))

    role_hints = {str(k): str(v) for k, v in reg.get("role_hints", {}).items()}
    return (
        system_ignore,
        non_secret,
        secret_val_re,
        secret_name_re,
        alias_groups,
        pool_policies,
        tuple(pool_order),
        tuple(pool_matchers),
        role_hints,
    )


(
    _SYSTEM_IGNORE,
    _NON_SECRET_EXACT,
    _SECRET_VALUE_RE,
    _SECRET_NAME_RE,
    _EXPECTED_ALIAS_GROUPS,
    _POOL_POLICIES,
    _POOL_ORDER,
    _POOL_MATCHERS,
    _ROLE_HINTS,
) = _build_registry_state()

_POOL_DECISION = "Pool Decision"
_POOL_GEMINI_TEXT = "Gemini Texto"
_POOL_MEDIA_AI = "Multimodal AI Studio"
_STATUS_200_OK = "200 OK"


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
    for pool_name, match_rx, fmt_rx in _POOL_MATCHERS:
        if match_rx.match(name):
            return pool_name, fmt_rx
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
