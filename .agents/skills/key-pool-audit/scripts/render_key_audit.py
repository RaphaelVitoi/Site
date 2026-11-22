"""Renderizador Rich moderno e didatico para a skill key-pool-audit.

Le o JSON mascarado emitido por Audit-KeyPools.ps1 via stdin, enriquece com
telemetria local (tasks.db::key_usage_metrics) e, quando --live e informado,
executa sondas HTTP somente-leitura (0 tokens LLM) lendo credenciais direto
do winreg em memoria, sem jamais imprimir ou gravar segredos em claro.
"""

from __future__ import annotations

import argparse
import asyncio
from datetime import datetime
import hashlib
import hmac
import json
from pathlib import Path
import re
import socket
import sqlite3
import ssl
import sys
import time
from typing import TypedDict

import aiohttp
import certifi
from rich import box
from rich.columns import Columns
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

SITE_ROOT = Path(__file__).resolve().parents[4]
TASKS_DB = SITE_ROOT / "queue" / "tasks.db"
CREDENTIAL_REGISTRY_PATH = SITE_ROOT / "data" / "credential_registry.json"

_HMAC_BUDGET_SALT = b"sota_budget_pool_salt"
_HMAC_POOL_SALTS: dict[str, bytes] = {
    "openrouter": b"sota_openrouter_pool_salt",
    "gemini": b"sota_gemini_pool_salt",
    "decision": b"sota_decision_pool_salt",
    "media": b"sota_media_pool_salt",
}

_POOL_DECISION = "Pool Decision"
_POOL_GEMINI_TEXT = "Gemini Texto"
_POOL_MEDIA_AI = "Multimodal AI Studio"
_STATUS_200_OK = "200 OK"
_STYLE_BOLD_GREEN = "bold green"
_STYLE_BOLD_RED = "bold red"


def _load_registry_display_maps() -> tuple[dict[str, str], dict[str, tuple[str, str]], dict[str, str]]:
    reg = json.loads(CREDENTIAL_REGISTRY_PATH.read_text(encoding="utf-8"))
    pool_short = {str(p["name"]): str(p.get("short", p["name"])) for p in reg.get("pools", ())}
    pool_docs = {str(p["name"]): (str(p["role"]), str(p["policy"])) for p in reg.get("pools", ())}
    role_hints = {str(k): str(v) for k, v in reg.get("role_hints", {}).items()}
    return pool_short, pool_docs, role_hints


POOL_SHORT, POOL_DOCS, ROLE_HINTS = _load_registry_display_maps()


class PoolSummaryRow(TypedDict):
    Pool: str
    TotalVars: int
    Synced: int
    InvalidFmt: int


class AnomalyRow(TypedDict):
    Severity: str
    Variable: str
    Pool: str
    Issue: str


class AuditEntryRow(TypedDict):
    Variable: str
    Pool: str
    IsSecret: bool
    HKCU_Mask: str
    HKCU_Len: int
    HKCU_Sha8: str
    HKLM_Mask: str
    HKLM_Len: int
    HKLM_Sha8: str
    Sync: str
    Process: str
    FormatValid: bool | None
    IsDummy: bool


class AuditPayload(TypedDict):
    Timestamp: str
    Note: str
    Summary: list[PoolSummaryRow]
    Anomalies: list[AnomalyRow]
    Entries: list[AuditEntryRow]


class DbStat(TypedDict):
    attempts: int
    successes: int
    avg_latency_ms: float | None
    last_status: str


class LiveResult(TypedDict):
    status_label: str
    ok: bool | None
    latency_ms: float | None
    detail: str


def _read_winreg_secrets() -> dict[str, str]:
    """Le valores atuais direto do winreg em memoria (nunca serializa para JSON/stdout)."""
    out: dict[str, str] = {}
    if sys.platform != "win32":
        return out
    import winreg  # noqa: PLC0415

    hives = (
        (winreg.HKEY_LOCAL_MACHINE, r"SYSTEM\CurrentControlSet\Control\Session Manager\Environment"),
        (winreg.HKEY_CURRENT_USER, r"Environment"),
    )
    for root, subkey in hives:
        try:
            with winreg.OpenKey(root, subkey) as key:
                idx = 0
                while True:
                    try:
                        name, val, _ = winreg.EnumValue(key, idx)
                        idx += 1
                        if name and isinstance(val, str) and val.strip():
                            out[name] = val.strip()
                    except OSError:
                        break
        except OSError:
            continue
    return out


def _budget_fingerprint(provider: str, key: str) -> str:
    msg = f"{provider}:{key}".encode()
    return hmac.new(_HMAC_BUDGET_SALT, msg, hashlib.sha256).hexdigest()[:24]


def _pool_sha8(pool_kind: str, key: str) -> str:
    salt = _HMAC_POOL_SALTS[pool_kind]
    return hmac.new(salt, key.encode("utf-8"), hashlib.sha256).hexdigest()[:8]


def _read_last_audit_meta(con: sqlite3.Connection, meta: dict[str, object]) -> None:
    cur = con.execute("SELECT value FROM system_state WHERE key='keys_last_audit'")
    row = cur.fetchone()
    if not row or not row[0]:
        return
    try:
        parsed = json.loads(row[0])
        meta["last_audit_ts"] = parsed.get("timestamp")
        meta["last_audit_summary"] = f"{parsed.get('online_keys', '?')}/{parsed.get('total_keys', '?')} online"
    except json.JSONDecodeError:
        pass


def _query_provider_totals(con: sqlite3.Connection) -> dict[str, dict[str, object]]:
    prov_rows = con.execute(
        """
        SELECT provider,
               COUNT(*) AS total,
               SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS ok,
               ROUND(AVG(CASE WHEN latency_ms > 0 THEN latency_ms END), 1) AS avg_ms
        FROM key_usage_metrics
        GROUP BY provider
        """
    ).fetchall()
    return {
        str(p): {"total": int(t), "ok": int(o or 0), "avg_ms": float(ms) if ms is not None else None}
        for p, t, o, ms in prov_rows
    }


def _query_fingerprint_map(con: sqlite3.Connection) -> dict[str, DbStat]:
    fp_rows = con.execute(
        """
        SELECT provider,
               key_hash,
               COUNT(*) AS attempts,
               SUM(CASE WHEN status='success' THEN 1 ELSE 0 END) AS successes,
               ROUND(AVG(CASE WHEN latency_ms > 0 THEN latency_ms END), 1) AS avg_ms,
               MAX(timestamp) AS max_ts
        FROM key_usage_metrics
        GROUP BY provider, key_hash
        """
    ).fetchall()
    fp_map: dict[str, DbStat] = {}
    for prov, khash, att, ok_cnt, avg_ms, _max_ts in fp_rows:
        fp_map[f"{prov}:{khash}"] = {
            "attempts": int(att),
            "successes": int(ok_cnt or 0),
            "avg_latency_ms": float(avg_ms) if avg_ms is not None else None,
            "last_status": str(prov),
        }
    return fp_map


def _match_env_to_fp_map(env_map: dict[str, str], fp_map: dict[str, DbStat]) -> dict[str, DbStat]:
    by_var: dict[str, DbStat] = {}
    for var_name, secret in env_map.items():
        for prov in ("openrouter", "gemini", "ollama", "local"):
            fp = _budget_fingerprint(prov, secret)
            for candidate_hash in (fp, f"{prov}:sha256:{fp}", f"{prov}:{fp}", f"{prov}:{prov}:sha256:{fp}"):
                stat = fp_map.get(candidate_hash)
                if stat is not None:
                    by_var[var_name] = stat
                    break
    return by_var


def _load_db_stats(env_map: dict[str, str]) -> tuple[dict[str, DbStat], dict[str, object]]:
    """Carrega estatisticas agregadas de key_usage_metrics e ultimo keys_last_audit."""
    by_var: dict[str, DbStat] = {}
    meta: dict[str, object] = {"provider_totals": {}, "last_audit_ts": None, "last_audit_summary": None}
    if not TASKS_DB.exists():
        return by_var, meta

    try:
        con = sqlite3.connect(str(TASKS_DB), timeout=2.0)
    except sqlite3.Error:
        return by_var, meta

    try:
        _read_last_audit_meta(con, meta)
        meta["provider_totals"] = _query_provider_totals(con)
        fp_map = _query_fingerprint_map(con)
        by_var = _match_env_to_fp_map(env_map, fp_map)
    except sqlite3.Error:
        pass
    finally:
        con.close()

    return by_var, meta


def _probe_target_for_var(var_name: str, pool: str, value: str) -> tuple[str, str] | None:
    """Mapeia variavel para tipo de sonda HTTP read-only (0 tokens LLM)."""
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


def _format_openrouter_detail(info: dict[str, object]) -> str:
    if info.get("is_free_tier"):
        return "free"
    rem = info.get("limit_remaining")
    return f"rem={rem}" if rem is not None else "paid"


async def _probe_openrouter(session: aiohttp.ClientSession, secret: str, t0: float) -> LiveResult:
    async with session.get(
        "https://openrouter.ai/api/v1/auth/key",
        headers={"Authorization": f"Bearer {secret}"},
    ) as resp:
        ms = round((time.monotonic() - t0) * 1000.0, 1)
        if resp.status != 200:
            return {"status_label": f"HTTP {resp.status}", "ok": False, "latency_ms": ms, "detail": "auth err"}
        data = await resp.json(content_type=None)
        info = data.get("data", {}) if isinstance(data, dict) else {}
        detail = _format_openrouter_detail(info if isinstance(info, dict) else {})
        return {"status_label": _STATUS_200_OK, "ok": True, "latency_ms": ms, "detail": detail}


async def _probe_hf(session: aiohttp.ClientSession, secret: str, t0: float) -> LiveResult:
    async with session.get(
        "https://huggingface.co/api/whoami-v2",
        headers={"Authorization": f"Bearer {secret}"},
    ) as resp:
        ms = round((time.monotonic() - t0) * 1000.0, 1)
        if resp.status != 200:
            return {"status_label": f"HTTP {resp.status}", "ok": False, "latency_ms": ms, "detail": "hf err"}
        data = await resp.json(content_type=None)
        who = data.get("name", "ok") if isinstance(data, dict) else "ok"
        return {"status_label": _STATUS_200_OK, "ok": True, "latency_ms": ms, "detail": f"@{who}"}


async def _probe_aistudio(session: aiohttp.ClientSession, secret: str, t0: float) -> LiveResult:
    async with session.get(
        "https://generativelanguage.googleapis.com/v1beta/models",
        params={"pageSize": "1", "key": secret},
    ) as resp:
        ms = round((time.monotonic() - t0) * 1000.0, 1)
        if resp.status == 200:
            return {"status_label": _STATUS_200_OK, "ok": True, "latency_ms": ms, "detail": "AI Studio"}
        return {"status_label": f"HTTP {resp.status}", "ok": False, "latency_ms": ms, "detail": "key/quota"}


async def _probe_bearer_status(
    session: aiohttp.ClientSession,
    url: str,
    secret: str,
    detail: str,
    t0: float,
    extra_headers: dict[str, str] | None = None,
) -> LiveResult:
    headers = {"Authorization": f"Bearer {secret}", **(extra_headers or {})}
    async with session.get(url, headers=headers) as resp:
        ms = round((time.monotonic() - t0) * 1000.0, 1)
        ok = resp.status == 200
        return {
            "status_label": f"{resp.status} {'OK' if ok else 'ERR'}",
            "ok": ok,
            "latency_ms": ms,
            "detail": detail,
        }


async def _probe_local_http(session: aiohttp.ClientSession, url: str, t0: float) -> LiveResult:
    async with session.get(url) as resp:
        ms = round((time.monotonic() - t0) * 1000.0, 1)
        ok = resp.status in (200, 401, 403)
        return {
            "status_label": f"UP ({resp.status})" if ok else f"HTTP {resp.status}",
            "ok": ok,
            "latency_ms": ms,
            "detail": "local",
        }


async def _probe_one(
    session: aiohttp.ClientSession,
    semaphore: asyncio.Semaphore,
    kind: str,
    secret: str,
) -> LiveResult:
    async with semaphore:
        t0 = time.monotonic()
        try:
            if kind == "openrouter":
                return await _probe_openrouter(session, secret, t0)
            if kind == "aistudio":
                return await _probe_aistudio(session, secret, t0)
            if kind == "hf":
                return await _probe_hf(session, secret, t0)
            if kind == "ollama_cloud":
                return await _probe_bearer_status(session, "https://ollama.com/api/tags", secret, "ollama.com", t0)
            if kind == "github":
                return await _probe_bearer_status(
                    session,
                    "https://api.github.com/user",
                    secret,
                    "GitHub",
                    t0,
                    {"User-Agent": "sota-key-audit"},
                )
            if kind == "local_http":
                return await _probe_local_http(session, secret, t0)
        except TimeoutError:
            return {"status_label": "TIMEOUT", "ok": False, "latency_ms": None, "detail": ">8s"}
        except aiohttp.ClientError as exc:
            return {"status_label": "OFFLINE", "ok": False, "latency_ms": None, "detail": type(exc).__name__}
        return {"status_label": "N/A", "ok": None, "latency_ms": None, "detail": ""}


async def _run_live_probes(
    entries: list[AuditEntryRow],
    env_map: dict[str, str],
) -> tuple[dict[str, LiveResult], dict[str, LiveResult]]:
    """Sonda todas as chaves unicas elegiveis e endpoints locais em paralelo."""
    unique_targets: dict[tuple[str, str], list[str]] = {}
    for row in entries:
        if not row["IsSecret"]:
            continue
        var_name = row["Variable"]
        val = env_map.get(var_name, "")
        target = _probe_target_for_var(var_name, row["Pool"], val)
        if target is not None:
            unique_targets.setdefault(target, []).append(var_name)

    local_urls = {
        "Ollama :11434": "http://127.0.0.1:11434/api/tags",
        "API/Gemma :17042": "http://127.0.0.1:17042/health",
        "Gemma :17043": "http://127.0.0.1:17043/health",
        "Hermes :18434": f"{env_map.get('SOTA_OPENAI_URL', 'http://127.0.0.1:18434').rstrip('/')}/v1/models",
    }

    ssl_ctx = ssl.create_default_context(cafile=certifi.where())
    ssl_ctx.minimum_version = ssl.TLSVersion.TLSv1_2
    connector = aiohttp.TCPConnector(ssl=ssl_ctx, family=socket.AF_INET)
    timeout = aiohttp.ClientTimeout(total=8.0)
    semaphore = asyncio.Semaphore(8)

    var_results: dict[str, LiveResult] = {}
    local_results: dict[str, LiveResult] = {}

    async with aiohttp.ClientSession(connector=connector, timeout=timeout, trust_env=True) as session:
        key_items = list(unique_targets.items())
        key_tasks = [_probe_one(session, semaphore, k_kind, k_sec) for (k_kind, k_sec), _ in key_items]
        local_items = list(local_urls.items())
        local_tasks = [_probe_one(session, semaphore, "local_http", url) for _, url in local_items]

        all_res = await asyncio.gather(*(key_tasks + local_tasks))
        for idx, ((_target), vars_list) in enumerate(key_items):
            res = all_res[idx]
            for vn in vars_list:
                var_results[vn] = res
        offset = len(key_items)
        for idx, (label, _url) in enumerate(local_items):
            local_results[label] = all_res[offset + idx]

    return var_results, local_results


def _fmt_reg_proc_badge(sync: str, proc: str) -> Text:
    t = Text()
    if sync == "SYNCED":
        t.append("\u25cf", style=_STYLE_BOLD_GREEN)
    elif sync in ("HKCU_ONLY", "HKLM_ONLY"):
        t.append("\u25b2", style="bold yellow")
    elif sync == "DIFF_VALUES":
        t.append("\u2716", style=_STYLE_BOLD_RED)
    else:
        t.append("?", style="yellow")
    t.append("/", style="dim")
    if proc == "MATCH":
        t.append("\u25cf", style="green")
    elif proc == "STALE_OR_DIFF":
        t.append("\u25d0", style="yellow")
    else:
        t.append("\u25cb", style="dim")
    return t


def _fmt_short_mask(mask: str) -> str:
    if len(mask) <= 14:
        return mask
    return f"{mask[:6]}\u2026{mask[-4:]}"


def _fmt_latency(ms: float | None) -> Text:
    if ms is None:
        return Text("\u2014", style="dim")
    if ms < 350:
        return Text(f"{ms:.0f} ms", style=_STYLE_BOLD_GREEN)
    if ms < 1000:
        return Text(f"{ms:.0f} ms", style="yellow")
    return Text(f"{ms:.0f} ms", style="red")


def _role_note(row: AuditEntryRow, env_map: dict[str, str], live: LiveResult | None) -> str:
    var_name = row["Variable"]
    parts: list[str] = []
    if var_name in ROLE_HINTS:
        parts.append(ROLE_HINTS[var_name])
    elif row["Pool"].startswith("OpenRouter Tier "):
        parts.append(f"len={row['HKCU_Len'] or row['HKLM_Len']}")
    elif var_name.startswith("GEMINI_FLASH_KEY_"):
        idx = var_name.rsplit("_", 1)[-1]
        parts.append(f"Alias = GEMINI_API_KEY_{idx}")
    if live and live["detail"]:
        parts.append(live["detail"])
    if not parts and var_name in env_map:
        parts.append(f"len={row['HKCU_Len'] or row['HKLM_Len']}")
    return " \u00b7 ".join(parts)


def _hygiene_color(fails: int, warns: int) -> str:
    if fails == 0 and warns == 0:
        return "green"
    return "red" if fails > 0 else "yellow"


def _db_pct_style(pct: int) -> str:
    if pct >= 80:
        return "green"
    return "yellow" if pct >= 40 else "red"


def _anomaly_severity_style(sev: str) -> str:
    if sev == "FAIL":
        return _STYLE_BOLD_RED
    if sev == "WARN":
        return "bold yellow"
    return "bold cyan"


def _build_header_panel(timestamp: str, live_mode: bool) -> Panel:
    try:
        ts_fmt = datetime.fromisoformat(timestamp).strftime("%Y-%m-%d %H:%M:%S")
    except ValueError:
        ts_fmt = timestamp
    mode_tag = "[bold green]LIVE HTTP PROBE (0 tokens)[/]" if live_mode else "[bold cyan]OFFLINE + TELEMETRIA DB[/]"
    return Panel(
        Text.from_markup(
            f"[bold bright_white]SOTA KEY POOL & CREDENTIAL OBSERVATORY[/]  \u00b7  {mode_tag}\n"
            f"[dim]Timestamp:[/] {ts_fmt}  \u00b7  [dim]Escopo:[/] HKCU + HKLM + Process  \u00b7  "
            f"[dim]Seguran\u00e7a:[/] Zero texto claro (prefixo/sufixo + sha8)"
        ),
        border_style="bright_cyan",
        box=box.ROUNDED,
    )


def _build_health_card(
    live_mode: bool,
    live_vars: dict[str, LiveResult],
    db_meta: dict[str, object],
) -> Panel:
    if live_mode and live_vars:
        ok_cnt = sum(1 for r in live_vars.values() if r["ok"] is True)
        lats = [r["latency_ms"] for r in live_vars.values() if r["latency_ms"] is not None]
        avg_ms = (sum(lats) / len(lats)) if lats else 0.0
        return Panel(
            f"[bold green]{ok_cnt}/{len(live_vars)}[/] chaves HTTP 200\n"
            f"[dim]Lat\u00eancia m\u00e9dia probe:[/] [bold]{avg_ms:.0f} ms[/]",
            title="[bold green]Sa\u00fade & Lat\u00eancia Live[/]",
            border_style="green",
            box=box.ROUNDED,
        )
    prov_totals = db_meta.get("provider_totals") or {}
    or_tot = prov_totals.get("openrouter", {}) if isinstance(prov_totals, dict) else {}
    gm_tot = prov_totals.get("gemini", {}) if isinstance(prov_totals, dict) else {}
    return Panel(
        f"[dim]DB Gemini:[/] {gm_tot.get('ok', 0)}/{gm_tot.get('total', 0)} ok "
        f"({gm_tot.get('avg_ms') or '\u2014'} ms)\n"
        f"[dim]DB OpenRouter:[/] {or_tot.get('ok', 0)}/{or_tot.get('total', 0)} ok "
        f"({or_tot.get('avg_ms') or '\u2014'} ms)",
        title="[bold blue]Telemetria Hist\u00f3rica (DB)[/]",
        border_style="blue",
        box=box.ROUNDED,
    )


def _build_kpi_columns(
    summary: list[PoolSummaryRow],
    anomalies: list[AnomalyRow],
    db_meta: dict[str, object],
    live_vars: dict[str, LiveResult],
    live_mode: bool,
) -> Columns:
    total_vars = sum(s["TotalVars"] for s in summary)
    total_synced = sum(s["Synced"] for s in summary)
    total_invalid = sum(s["InvalidFmt"] for s in summary)
    fails = sum(1 for a in anomalies if a["Severity"] == "FAIL")
    warns = sum(1 for a in anomalies if a["Severity"] == "WARN")
    infos = sum(1 for a in anomalies if a["Severity"] == "INFO")

    sync_color = "green" if total_synced == total_vars else "yellow"
    card_reg = Panel(
        f"[bold {sync_color}]{total_synced}/{total_vars}[/] sincronizadas\n"
        f"[dim]Pools ativos:[/] {len(summary)}  \u00b7  [dim]Fmt inv\u00e1lido:[/] {total_invalid}",
        title="[bold cyan]Registro HKCU/HKLM[/]",
        border_style="cyan",
        box=box.ROUNDED,
    )
    card_health = _build_health_card(live_mode, live_vars, db_meta)
    hyg_color = _hygiene_color(fails, warns)
    hyg_label = "HOMEOSTASE OK" if (fails == 0 and warns == 0) else f"{fails} FAIL \u00b7 {warns} WARN"
    card_hyg = Panel(
        f"[bold {hyg_color}]{hyg_label}[/]\n[dim]FAIL:[/] {fails}  \u00b7  [dim]WARN:[/] {warns}  \u00b7  [dim]INFO:[/] {infos}",
        title="[bold magenta]Higiene & Alertas[/]",
        border_style=hyg_color,
        box=box.ROUNDED,
    )
    return Columns([card_reg, card_health, card_hyg], equal=True, expand=True)


def _render_local_services_bar(console: Console, local_results: dict[str, LiveResult]) -> None:
    if not local_results:
        return
    srv_parts = []
    for label, res in local_results.items():
        dot = "[green]\u25cf[/]" if res["ok"] else "[dim red]\u25cb[/]"
        lat = f" {res['latency_ms']:.0f}ms" if res["latency_ms"] is not None else ""
        srv_parts.append(f"{dot} [bold]{label}[/] [dim]({res['status_label']}{lat})[/]")
    console.print(
        Panel("   ".join(srv_parts), title="[bold]Servi\u00e7os Locais[/]", border_style="dim", box=box.ROUNDED)
    )


def _resolve_pool_health_cell(
    p_entries: list[AuditEntryRow],
    live_mode: bool,
    live_vars: dict[str, LiveResult],
    db_stats: dict[str, DbStat],
) -> str:
    if live_mode:
        probed = [live_vars[e["Variable"]] for e in p_entries if e["Variable"] in live_vars]
        if not probed:
            return "[dim]offline/local[/]"
        ok_p = sum(1 for r in probed if r["ok"])
        lats = [r["latency_ms"] for r in probed if r["latency_ms"] is not None]
        med_ms = f"{sum(lats) / len(lats):.0f}ms" if lats else "\u2014"
        color = "green" if ok_p == len(probed) else "yellow"
        return f"[{color}]{ok_p}/{len(probed)} OK[/] \u00b7 {med_ms}"

    db_hits = [db_stats[e["Variable"]] for e in p_entries if e["Variable"] in db_stats]
    if not db_hits:
        return "[green]READY[/] [dim](offline)[/]"
    att = sum(d["attempts"] for d in db_hits)
    ok_d = sum(d["successes"] for d in db_hits)
    lats = [d["avg_latency_ms"] for d in db_hits if d["avg_latency_ms"] is not None]
    avg_d = f"{sum(lats) / len(lats):.0f}ms" if lats else "\u2014"
    pct = int(round(100.0 * ok_d / att)) if att else 0
    return f"[cyan]DB {pct}%[/] ({ok_d}/{att}) \u00b7 {avg_d}"


def _build_pool_summary_table(
    summary: list[PoolSummaryRow],
    entries: list[AuditEntryRow],
    live_mode: bool,
    live_vars: dict[str, LiveResult],
    db_stats: dict[str, DbStat],
) -> Table:
    t_pool = Table(
        title="[bold bright_cyan]Topologia & Sa\u00fade por Pool[/]",
        box=box.SIMPLE_HEAVY,
        header_style="bold bright_white on grey15",
        show_lines=False,
        expand=True,
    )
    t_pool.add_column("Pool", style="bold cyan", no_wrap=True)
    t_pool.add_column("Vars", justify="right")
    t_pool.add_column("Sync", justify="right")
    t_pool.add_column("Fmt", justify="center")
    t_pool.add_column("Sa\u00fade / Lat\u00eancia", justify="center")
    t_pool.add_column("Fun\u00e7\u00e3o & Pol\u00edtica de Failover", style="white")

    for s in summary:
        p_name = s["Pool"]
        role_desc, policy = POOL_DOCS.get(p_name, ("Pool de credenciais", "\u2014"))
        sync_color = "green" if s["Synced"] == s["TotalVars"] else "yellow"
        sync_cell = f"[{sync_color}]{s['Synced']}/{s['TotalVars']}[/]"
        fmt_cell = "[green]OK[/]" if s["InvalidFmt"] == 0 else f"[red]{s['InvalidFmt']} ERR[/]"
        p_entries = [e for e in entries if e["Pool"] == p_name]
        health_cell = _resolve_pool_health_cell(p_entries, live_mode, live_vars, db_stats)
        t_pool.add_row(
            p_name, str(s["TotalVars"]), sync_cell, fmt_cell, health_cell, f"{role_desc} [dim]\u00b7 {policy}[/]"
        )
    return t_pool


def _resolve_inventory_health_cells(
    row: AuditEntryRow,
    live_res: LiveResult | None,
    db_res: DbStat | None,
) -> tuple[Text, Text]:
    if live_res is not None:
        h_style = _STYLE_BOLD_GREEN if live_res["ok"] else _STYLE_BOLD_RED
        return Text(live_res["status_label"], style=h_style), _fmt_latency(live_res["latency_ms"])
    if db_res is not None:
        att = db_res["attempts"]
        ok_c = db_res["successes"]
        pct = int(round(100.0 * ok_c / att)) if att else 0
        return Text(f"DB {pct}% ({ok_c}/{att})", style=_db_pct_style(pct)), _fmt_latency(db_res["avg_latency_ms"])
    health_txt = Text("READY", style="green") if row["FormatValid"] is not False else Text("FMT ERR", style="red")
    return health_txt, Text("\u2014", style="dim")


def _build_inventory_table(
    entries: list[AuditEntryRow],
    live_vars: dict[str, LiveResult],
    db_stats: dict[str, DbStat],
    env_map: dict[str, str],
) -> Table:
    t_inv = Table(
        title="[bold bright_cyan]Invent\u00e1rio Mascarado, Estado & Lat\u00eancia[/]",
        caption="[dim]Reg/Proc: \u25cf/\u25cf = HKCU==HKLM & Processo atual \u00b7 \u25d0 = Processo antigo \u00b7 \u25cb = Unset no processo atual[/]",
        box=box.ROUNDED,
        header_style="bold bright_white on grey15",
        padding=(0, 1),
        expand=True,
    )
    t_inv.add_column("Pool", style="cyan", no_wrap=True)
    t_inv.add_column("Vari\u00e1vel", style="bold white", no_wrap=True)
    t_inv.add_column("Chave", style="dim", no_wrap=True)
    t_inv.add_column("sha8", style="magenta", no_wrap=True)
    t_inv.add_column("R/P", justify="center", no_wrap=True)
    t_inv.add_column("Sa\u00fade", justify="center", no_wrap=True)
    t_inv.add_column("Lat", justify="right", no_wrap=True)
    t_inv.add_column("Papel / Info", style="dim")

    secret_rows = sorted(
        (r for r in entries if r["IsSecret"]),
        key=lambda r: (r["Pool"], re.sub(r"\d+", lambda m: m.group(0).zfill(4), r["Variable"])),
    )
    for row in secret_rows:
        var_name = row["Variable"]
        mask = row["HKCU_Mask"] if row["HKCU_Mask"] != "<unset>" else row["HKLM_Mask"]
        sha8 = row["HKCU_Sha8"] or row["HKLM_Sha8"]
        live_res = live_vars.get(var_name)
        health_txt, lat_txt = _resolve_inventory_health_cells(row, live_res, db_stats.get(var_name))
        t_inv.add_row(
            POOL_SHORT.get(row["Pool"], row["Pool"]),
            var_name,
            _fmt_short_mask(mask),
            sha8,
            _fmt_reg_proc_badge(row["Sync"], row["Process"]),
            health_txt,
            lat_txt,
            _role_note(row, env_map, live_res),
        )
    return t_inv


def _build_infra_panel(env_map: dict[str, str]) -> Panel:
    return Panel(
        Text.from_markup(
            "[bold cyan]Regras de Cota:[/] AI Studio/GCP ([bold]GEMINI_*[/], [bold]DECISION_API_*[/]) divide quota por projeto "
            f"([bold]{env_map.get('GCP_PROJECT_ID', 'original-498419')}[/] / {env_map.get('GCP_PROJECT_NUMBER', '913870412920')}); "
            "OpenRouter isola quota por chave.\n"
            f"[bold cyan]Runtime Local (RX 570):[/] KV=[bold]{env_map.get('OLLAMA_KV_CACHE_TYPE', '\u2014')}[/] \u00b7 "
            f"MaxLoaded=[bold]{env_map.get('OLLAMA_MAX_LOADED_MODELS', '\u2014')}[/] \u00b7 "
            f"Ctx=[bold]{env_map.get('OLLAMA_CONTEXT_LENGTH', '\u2014')}[/] \u00b7 "
            f"FA=[bold]{env_map.get('OLLAMA_FLASH_ATTENTION', '\u2014')}[/] \u00b7 "
            f"MediaOrder=[bold]{env_map.get('MEDIA_POOL_PROVIDER', 'aistudio->openrouter')}[/]\n"
            "[bold cyan]Comandos:[/] [bold white]audit-keys[/] (offline+DB) \u00b7 [bold white]audit-keys -Live[/] (sonda HTTP + lat\u00eancia ms) \u00b7 "
            "[bold white]audit-keys -Pool Tier1[/] \u00b7 [bold white]audit-keys -AnomaliesOnly[/] \u00b7 [bold white]audit-keys -Json[/]"
        ),
        title="[bold bright_white]Arquitetura, Hardware & Uso R\u00e1pido[/]",
        border_style="dim cyan",
        box=box.ROUNDED,
    )


def _render_anomalies_section(console: Console, anomalies: list[AnomalyRow]) -> None:
    if not anomalies:
        console.print(
            Panel(
                "[bold green]Homeostase Total:[/] nenhuma diverg\u00eancia HKCU/HKLM, formato inv\u00e1lido ou duplicata indevida.",
                title="[bold green]Anomalias e Alertas[/]",
                border_style="green",
                box=box.ROUNDED,
            )
        )
        return
    t_anom = Table(
        title="[bold yellow]Anomalias e Alertas[/]",
        box=box.ROUNDED,
        header_style="bold white on grey15",
        expand=True,
    )
    t_anom.add_column("Sev", justify="center", no_wrap=True)
    t_anom.add_column("Vari\u00e1vel", style="bold white", no_wrap=True)
    t_anom.add_column("Pool", style="cyan", no_wrap=True)
    t_anom.add_column("Detalhe", style="white")
    for a in sorted(anomalies, key=lambda x: (x["Severity"], x["Pool"], x["Variable"])):
        t_anom.add_row(
            Text(a["Severity"], style=_anomaly_severity_style(a["Severity"])), a["Variable"], a["Pool"], a["Issue"]
        )
    console.print(t_anom)


def _render_dashboard(
    payload: AuditPayload,
    db_stats: dict[str, DbStat],
    db_meta: dict[str, object],
    live_vars: dict[str, LiveResult],
    local_results: dict[str, LiveResult],
    env_map: dict[str, str],
    *,
    anomalies_only: bool,
    live_mode: bool,
) -> None:
    console = Console()
    summary = payload["Summary"]
    anomalies = payload["Anomalies"]
    entries = payload["Entries"]

    console.print()
    console.print(_build_header_panel(payload["Timestamp"], live_mode))
    console.print(_build_kpi_columns(summary, anomalies, db_meta, live_vars, live_mode))
    _render_local_services_bar(console, local_results)
    console.print(_build_pool_summary_table(summary, entries, live_mode, live_vars, db_stats))
    if not anomalies_only:
        console.print(_build_inventory_table(entries, live_vars, db_stats, env_map))
    console.print(_build_infra_panel(env_map))
    _render_anomalies_section(console, anomalies)


def main() -> int:
    parser = argparse.ArgumentParser(description="Rich dashboard renderer for key-pool-audit.")
    parser.add_argument("--live", action="store_true", help="Run read-only HTTP auth probes for health & latency.")
    parser.add_argument("--anomalies-only", action="store_true", help="Render compact summary + anomalies.")
    args = parser.parse_args()

    raw = sys.stdin.read().lstrip("\ufeff").strip()
    if not raw:
        print("Nenhum dado JSON recebido via stdin.", file=sys.stderr)
        return 1
    parsed_raw = json.loads(raw)
    for list_key in ("Summary", "Anomalies", "Entries"):
        val = parsed_raw.get(list_key)
        if val is None:
            parsed_raw[list_key] = []
        elif isinstance(val, dict):
            parsed_raw[list_key] = [val]
    payload: AuditPayload = parsed_raw

    env_map = _read_winreg_secrets()
    db_stats, db_meta = _load_db_stats(env_map)

    live_vars: dict[str, LiveResult] = {}
    local_results: dict[str, LiveResult] = {}
    if args.live:
        live_vars, local_results = asyncio.run(_run_live_probes(payload["Entries"], env_map))

    _render_dashboard(
        payload,
        db_stats,
        db_meta,
        live_vars,
        local_results,
        env_map,
        anomalies_only=args.anomalies_only,
        live_mode=args.live,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
