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

_HMAC_BUDGET_SALT = b"sota_budget_pool_salt"
_HMAC_POOL_SALTS: dict[str, bytes] = {
    "openrouter": b"sota_openrouter_pool_salt",
    "gemini": b"sota_gemini_pool_salt",
    "decision": b"sota_decision_pool_salt",
    "media": b"sota_media_pool_salt",
}

POOL_SHORT: dict[str, str] = {
    "OpenRouter Tier 1": "OR·T1",
    "OpenRouter Tier 2": "OR·T2",
    "OpenRouter Tier 3": "OR·T3",
    "OpenRouter Tier 4": "OR·T4",
    "OpenRouter Dedicadas": "OR·Ded",
    "Pool Decision": "Decision",
    "Gemini Texto": "Gemini",
    "Multimodal AI Studio": "Med·AI",
    "Multimodal OpenRouter": "Med·OR",
    "Ollama Cloud": "Ollama",
    "Providers Pendentes/Extras": "Extras",
    "Ecossistema/Outros": "Eco",
}

POOL_DOCS: dict[str, tuple[str, str]] = {
    "OpenRouter Tier 1": ("Core Cognitivo (Opus/ChatGPT6/Gemini4)", "0-tolerancia; nunca degrada"),
    "OpenRouter Tier 2": ("Superagentes & Pesquisa (Jules/Stitch/Exa/Hermes)", "Degrada -> Tier 4 / Tier 1"),
    "OpenRouter Tier 3": ("Frota Especialista & Batch", "Alto throughput; degrada -> Ollama Local"),
    "OpenRouter Tier 4": ("Subagentes Dedicados + Ponte Legada", "Degrada -> Tier 3"),
    "OpenRouter Dedicadas": ("Credenciais por condutor + OPENROUTER_API_KEY", "OPENROUTER_API_KEY = TIER4_KEY_1"),
    "Pool Decision": ("System-1 Gemini Decisions API", "Laya -> gemini-decision-1; proj 913870412920"),
    "Gemini Texto": ("Pool Flash-Lite (5 chaves + aliases Flash)", "Cota compartilhada no proj 913870412920"),
    "Multimodal AI Studio": ("TTS / Video / Image / Translate (direto)", "1o na ordem MEDIA_POOL_PROVIDER"),
    "Multimodal OpenRouter": ("TTS / Video / Image / Translate (fallback)", "2o na ordem MEDIA_POOL_PROVIDER"),
    "Ollama Cloud": ("OLLAMA_API_KEY + OLLAMA_CLOUD_KEY (backup)", "ollama.com/api (Bearer); local :11434"),
    "Providers Pendentes/Extras": ("Anthropic / OpenAI", "Nao provisionadas (pend-2026-11-10)"),
    "Ecossistema/Outros": ("GitHub, Devin, Stitch, Jules, Exa, DBs, Local", "Bridges MCP, deploy e auth local"),
}

ROLE_HINTS: dict[str, str] = {
    "OPENROUTER_API_KEY": "Ponte legada (= TIER4_KEY_1; isola Tier 1)",
    "OPENROUTER_ANTIGRAVITY_KEY": "Dedicada condutor Antigravity",
    "OPENROUTER_DEVIN_KEY": "Dedicada condutor Devin",
    "OPENROUTER_HERMES_KEY": "Dedicada condutor Hermes Agent",
    "OLLAMA_API_KEY": "Primaria Ollama Cloud",
    "OLLAMA_CLOUD_KEY": "Backup legada Ollama_Keys",
    "GEMINI_API_KEY": "Fallback geral (= GEMINI_API_KEY_1)",
    "SOTA_SITE_TOKEN": "Token loopback local (:17043/.env)",
    "SOTA_OPENAI_API_KEY": "Auth proxy local Hermes/SOTA (:18434)",
    "WEBHOOK_OPENROUTER_SECRET": "Assinatura webhook (whsec_*)",
    "GOOGLE_OAUTH_CLIENT_SECRET": "OAuth Desktop client 'Gemini'",
    "HF_TOKEN": "HuggingFace Hub (MCP + TimesFM/ST)",
}


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
        cur = con.execute("SELECT value FROM system_state WHERE key='keys_last_audit'")
        row = cur.fetchone()
        if row and row[0]:
            try:
                parsed = json.loads(row[0])
                meta["last_audit_ts"] = parsed.get("timestamp")
                meta["last_audit_summary"] = f"{parsed.get('online_keys', '?')}/{parsed.get('total_keys', '?')} online"
            except json.JSONDecodeError:
                pass

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
        meta["provider_totals"] = {
            str(p): {"total": int(t), "ok": int(o or 0), "avg_ms": float(ms) if ms is not None else None}
            for p, t, o, ms in prov_rows
        }

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
            stat: DbStat = {
                "attempts": int(att),
                "successes": int(ok_cnt or 0),
                "avg_latency_ms": float(avg_ms) if avg_ms is not None else None,
                "last_status": str(prov),
            }
            fp_map[f"{prov}:{khash}"] = stat

        for var_name, secret in env_map.items():
            for prov in ("openrouter", "gemini", "ollama", "local"):
                fp = _budget_fingerprint(prov, secret)
                for candidate_hash in (fp, f"{prov}:sha256:{fp}"):
                    if candidate_hash in fp_map:
                        by_var[var_name] = fp_map[candidate_hash]
                        break
                    pref = f"{prov}:{candidate_hash}"
                    if pref in fp_map:
                        by_var[var_name] = fp_map[pref]
                        break
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
        pool in ("Pool Decision", "Gemini Texto", "Multimodal AI Studio")
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
                async with session.get(
                    "https://openrouter.ai/api/v1/auth/key",
                    headers={"Authorization": f"Bearer {secret}"},
                ) as resp:
                    ms = round((time.monotonic() - t0) * 1000.0, 1)
                    if resp.status == 200:
                        data = await resp.json(content_type=None)
                        info = data.get("data", {}) if isinstance(data, dict) else {}
                        rem = info.get("limit_remaining")
                        is_free = info.get("is_free_tier")
                        extra = "free" if is_free else (f"rem={rem}" if rem is not None else "paid")
                        return {"status_label": "200 OK", "ok": True, "latency_ms": ms, "detail": extra}
                    return {"status_label": f"HTTP {resp.status}", "ok": False, "latency_ms": ms, "detail": "auth err"}

            if kind == "aistudio":
                async with session.get(
                    "https://generativelanguage.googleapis.com/v1beta/models",
                    params={"pageSize": "1", "key": secret},
                ) as resp:
                    ms = round((time.monotonic() - t0) * 1000.0, 1)
                    if resp.status == 200:
                        return {"status_label": "200 OK", "ok": True, "latency_ms": ms, "detail": "AI Studio"}
                    return {"status_label": f"HTTP {resp.status}", "ok": False, "latency_ms": ms, "detail": "key/quota"}

            if kind == "hf":
                async with session.get(
                    "https://huggingface.co/api/whoami-v2",
                    headers={"Authorization": f"Bearer {secret}"},
                ) as resp:
                    ms = round((time.monotonic() - t0) * 1000.0, 1)
                    if resp.status == 200:
                        data = await resp.json(content_type=None)
                        who = data.get("name", "ok") if isinstance(data, dict) else "ok"
                        return {"status_label": "200 OK", "ok": True, "latency_ms": ms, "detail": f"@{who}"}
                    return {"status_label": f"HTTP {resp.status}", "ok": False, "latency_ms": ms, "detail": "hf err"}

            if kind == "ollama_cloud":
                async with session.get(
                    "https://ollama.com/api/tags",
                    headers={"Authorization": f"Bearer {secret}"},
                ) as resp:
                    ms = round((time.monotonic() - t0) * 1000.0, 1)
                    ok = resp.status == 200
                    return {
                        "status_label": f"{resp.status} {'OK' if ok else 'ERR'}",
                        "ok": ok,
                        "latency_ms": ms,
                        "detail": "ollama.com",
                    }

            if kind == "github":
                async with session.get(
                    "https://api.github.com/user",
                    headers={"Authorization": f"Bearer {secret}", "User-Agent": "sota-key-audit"},
                ) as resp:
                    ms = round((time.monotonic() - t0) * 1000.0, 1)
                    ok = resp.status == 200
                    return {
                        "status_label": f"{resp.status} {'OK' if ok else 'ERR'}",
                        "ok": ok,
                        "latency_ms": ms,
                        "detail": "GitHub",
                    }

            if kind == "local_http":
                async with session.get(secret) as resp:
                    ms = round((time.monotonic() - t0) * 1000.0, 1)
                    ok = resp.status in (200, 401, 403)
                    return {
                        "status_label": f"UP ({resp.status})" if ok else f"HTTP {resp.status}",
                        "ok": ok,
                        "latency_ms": ms,
                        "detail": "local",
                    }
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
        t.append("●", style="bold green")
    elif sync in ("HKCU_ONLY", "HKLM_ONLY"):
        t.append("▲", style="bold yellow")
    elif sync == "DIFF_VALUES":
        t.append("✖", style="bold red")
    else:
        t.append("?", style="yellow")
    t.append("/", style="dim")
    if proc == "MATCH":
        t.append("●", style="green")
    elif proc == "STALE_OR_DIFF":
        t.append("◐", style="yellow")
    else:
        t.append("○", style="dim")
    return t


def _fmt_short_mask(mask: str) -> str:
    if len(mask) <= 14:
        return mask
    return f"{mask[:6]}…{mask[-4:]}"


def _fmt_latency(ms: float | None) -> Text:
    if ms is None:
        return Text("—", style="dim")
    if ms < 350:
        return Text(f"{ms:.0f} ms", style="bold green")
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
    return " · ".join(parts)


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

    total_vars = sum(s["TotalVars"] for s in summary)
    total_synced = sum(s["Synced"] for s in summary)
    total_invalid = sum(s["InvalidFmt"] for s in summary)
    fails = sum(1 for a in anomalies if a["Severity"] == "FAIL")
    warns = sum(1 for a in anomalies if a["Severity"] == "WARN")
    infos = sum(1 for a in anomalies if a["Severity"] == "INFO")

    try:
        ts_fmt = datetime.fromisoformat(payload["Timestamp"]).strftime("%Y-%m-%d %H:%M:%S")
    except ValueError:
        ts_fmt = payload["Timestamp"]

    # Header
    mode_tag = "[bold green]LIVE HTTP PROBE (0 tokens)[/]" if live_mode else "[bold cyan]OFFLINE + TELEMETRIA DB[/]"
    header = Panel(
        Text.from_markup(
            f"[bold bright_white]SOTA KEY POOL & CREDENTIAL OBSERVATORY[/]  ·  {mode_tag}\n"
            f"[dim]Timestamp:[/] {ts_fmt}  ·  [dim]Escopo:[/] HKCU + HKLM + Process  ·  "
            f"[dim]Segurança:[/] Zero texto claro (prefixo/sufixo + sha8)"
        ),
        border_style="bright_cyan",
        box=box.ROUNDED,
    )
    console.print()
    console.print(header)

    # KPI Cards
    sync_color = "green" if total_synced == total_vars else "yellow"
    card_reg = Panel(
        f"[bold {sync_color}]{total_synced}/{total_vars}[/] sincronizadas\n"
        f"[dim]Pools ativos:[/] {len(summary)}  ·  [dim]Fmt inválido:[/] {total_invalid}",
        title="[bold cyan]Registro HKCU/HKLM[/]",
        border_style="cyan",
        box=box.ROUNDED,
    )

    if live_mode and live_vars:
        ok_cnt = sum(1 for r in live_vars.values() if r["ok"] is True)
        lats = [r["latency_ms"] for r in live_vars.values() if r["latency_ms"] is not None]
        avg_ms = (sum(lats) / len(lats)) if lats else 0.0
        card_health = Panel(
            f"[bold green]{ok_cnt}/{len(live_vars)}[/] chaves HTTP 200\n"
            f"[dim]Latência média probe:[/] [bold]{avg_ms:.0f} ms[/]",
            title="[bold green]Saúde & Latência Live[/]",
            border_style="green",
            box=box.ROUNDED,
        )
    else:
        prov_totals = db_meta.get("provider_totals") or {}
        or_tot = prov_totals.get("openrouter", {}) if isinstance(prov_totals, dict) else {}
        gm_tot = prov_totals.get("gemini", {}) if isinstance(prov_totals, dict) else {}
        card_health = Panel(
            f"[dim]DB Gemini:[/] {gm_tot.get('ok', 0)}/{gm_tot.get('total', 0)} ok "
            f"({gm_tot.get('avg_ms') or '—'} ms)\n"
            f"[dim]DB OpenRouter:[/] {or_tot.get('ok', 0)}/{or_tot.get('total', 0)} ok "
            f"({or_tot.get('avg_ms') or '—'} ms)",
            title="[bold blue]Telemetria Histórica (DB)[/]",
            border_style="blue",
            box=box.ROUNDED,
        )

    hyg_color = "green" if (fails == 0 and warns == 0) else ("red" if fails > 0 else "yellow")
    hyg_label = "HOMEOSTASE OK" if (fails == 0 and warns == 0) else f"{fails} FAIL · {warns} WARN"
    card_hyg = Panel(
        f"[bold {hyg_color}]{hyg_label}[/]\n[dim]FAIL:[/] {fails}  ·  [dim]WARN:[/] {warns}  ·  [dim]INFO:[/] {infos}",
        title="[bold magenta]Higiene & Alertas[/]",
        border_style=hyg_color,
        box=box.ROUNDED,
    )
    console.print(Columns([card_reg, card_health, card_hyg], equal=True, expand=True))

    # Local services bar (when --live)
    if local_results:
        srv_parts = []
        for label, res in local_results.items():
            dot = "[green]●[/]" if res["ok"] else "[dim red]○[/]"
            lat = f" {res['latency_ms']:.0f}ms" if res["latency_ms"] is not None else ""
            srv_parts.append(f"{dot} [bold]{label}[/] [dim]({res['status_label']}{lat})[/]")
        console.print(
            Panel("   ".join(srv_parts), title="[bold]Serviços Locais[/]", border_style="dim", box=box.ROUNDED)
        )

    # Pool Summary Table
    t_pool = Table(
        title="[bold bright_cyan]Topologia & Saúde por Pool[/]",
        box=box.SIMPLE_HEAVY,
        header_style="bold bright_white on grey15",
        show_lines=False,
        expand=True,
    )
    t_pool.add_column("Pool", style="bold cyan", no_wrap=True)
    t_pool.add_column("Vars", justify="right")
    t_pool.add_column("Sync", justify="right")
    t_pool.add_column("Fmt", justify="center")
    t_pool.add_column("Saúde / Latência", justify="center")
    t_pool.add_column("Função & Política de Failover", style="white")

    for s in summary:
        p_name = s["Pool"]
        role_desc, policy = POOL_DOCS.get(p_name, ("Pool de credenciais", "—"))
        sync_cell = (
            f"[green]{s['Synced']}/{s['TotalVars']}[/]"
            if s["Synced"] == s["TotalVars"]
            else f"[yellow]{s['Synced']}/{s['TotalVars']}[/]"
        )
        fmt_cell = "[green]OK[/]" if s["InvalidFmt"] == 0 else f"[red]{s['InvalidFmt']} ERR[/]"

        p_entries = [e for e in entries if e["Pool"] == p_name]
        if live_mode:
            probed = [live_vars[e["Variable"]] for e in p_entries if e["Variable"] in live_vars]
            if probed:
                ok_p = sum(1 for r in probed if r["ok"])
                lats = [r["latency_ms"] for r in probed if r["latency_ms"] is not None]
                med_ms = f"{sum(lats) / len(lats):.0f}ms" if lats else "—"
                health_cell = (
                    f"[green]{ok_p}/{len(probed)} OK[/] · {med_ms}"
                    if ok_p == len(probed)
                    else f"[yellow]{ok_p}/{len(probed)} OK[/] · {med_ms}"
                )
            else:
                health_cell = "[dim]offline/local[/]"
        else:
            db_hits = [db_stats[e["Variable"]] for e in p_entries if e["Variable"] in db_stats]
            if db_hits:
                att = sum(d["attempts"] for d in db_hits)
                ok_d = sum(d["successes"] for d in db_hits)
                lats = [d["avg_latency_ms"] for d in db_hits if d["avg_latency_ms"] is not None]
                avg_d = f"{sum(lats) / len(lats):.0f}ms" if lats else "—"
                pct = int(round(100.0 * ok_d / att)) if att else 0
                health_cell = f"[cyan]DB {pct}%[/] ({ok_d}/{att}) · {avg_d}"
            else:
                health_cell = "[green]READY[/] [dim](offline)[/]"

        t_pool.add_row(p_name, str(s["TotalVars"]), sync_cell, fmt_cell, health_cell, f"{role_desc} [dim]· {policy}[/]")

    console.print(t_pool)

    # Detailed Inventory Table
    if not anomalies_only:
        t_inv = Table(
            title="[bold bright_cyan]Inventário Mascarado, Estado & Latência[/]",
            caption="[dim]Reg/Proc: ●/● = HKCU==HKLM & Processo atual · ◐ = Processo antigo · ○ = Unset no processo atual[/]",
            box=box.ROUNDED,
            header_style="bold bright_white on grey15",
            padding=(0, 1),
            expand=True,
        )
        t_inv.add_column("Pool", style="cyan", no_wrap=True)
        t_inv.add_column("Variável", style="bold white", no_wrap=True)
        t_inv.add_column("Chave", style="dim", no_wrap=True)
        t_inv.add_column("sha8", style="magenta", no_wrap=True)
        t_inv.add_column("R/P", justify="center", no_wrap=True)
        t_inv.add_column("Saúde", justify="center", no_wrap=True)
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
            db_res = db_stats.get(var_name)

            if live_res is not None:
                h_style = "bold green" if live_res["ok"] else "bold red"
                health_txt = Text(live_res["status_label"], style=h_style)
                lat_txt = _fmt_latency(live_res["latency_ms"])
            elif db_res is not None:
                att = db_res["attempts"]
                ok_c = db_res["successes"]
                pct = int(round(100.0 * ok_c / att)) if att else 0
                h_style = "green" if pct >= 80 else ("yellow" if pct >= 40 else "red")
                health_txt = Text(f"DB {pct}% ({ok_c}/{att})", style=h_style)
                lat_txt = _fmt_latency(db_res["avg_latency_ms"])
            else:
                health_txt = (
                    Text("READY", style="green") if row["FormatValid"] is not False else Text("FMT ERR", style="red")
                )
                lat_txt = Text("—", style="dim")

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
        console.print(t_inv)

    # Didactic Infrastructure & Quota Notes
    infra_panel = Panel(
        Text.from_markup(
            "[bold cyan]Regras de Cota:[/] AI Studio/GCP ([bold]GEMINI_*[/], [bold]DECISION_API_*[/]) divide quota por projeto "
            f"([bold]{env_map.get('GCP_PROJECT_ID', 'original-498419')}[/] / {env_map.get('GCP_PROJECT_NUMBER', '913870412920')}); "
            "OpenRouter isola quota por chave.\n"
            f"[bold cyan]Runtime Local (RX 570):[/] KV=[bold]{env_map.get('OLLAMA_KV_CACHE_TYPE', '—')}[/] · "
            f"MaxLoaded=[bold]{env_map.get('OLLAMA_MAX_LOADED_MODELS', '—')}[/] · "
            f"Ctx=[bold]{env_map.get('OLLAMA_CONTEXT_LENGTH', '—')}[/] · "
            f"FA=[bold]{env_map.get('OLLAMA_FLASH_ATTENTION', '—')}[/] · "
            f"MediaOrder=[bold]{env_map.get('MEDIA_POOL_PROVIDER', 'aistudio->openrouter')}[/]\n"
            "[bold cyan]Comandos:[/] [bold white]audit-keys[/] (offline+DB) · [bold white]audit-keys -Live[/] (sonda HTTP + latência ms) · "
            "[bold white]audit-keys -Pool Tier1[/] · [bold white]audit-keys -AnomaliesOnly[/] · [bold white]audit-keys -Json[/]"
        ),
        title="[bold bright_white]Arquitetura, Hardware & Uso Rápido[/]",
        border_style="dim cyan",
        box=box.ROUNDED,
    )
    console.print(infra_panel)

    # Anomalies Panel
    if not anomalies:
        console.print(
            Panel(
                "[bold green]Homeostase Total:[/] nenhuma divergência HKCU/HKLM, formato inválido ou duplicata indevida.",
                title="[bold green]Anomalias e Alertas[/]",
                border_style="green",
                box=box.ROUNDED,
            )
        )
    else:
        t_anom = Table(
            title="[bold yellow]Anomalias e Alertas[/]",
            box=box.ROUNDED,
            header_style="bold white on grey15",
            expand=True,
        )
        t_anom.add_column("Sev", justify="center", no_wrap=True)
        t_anom.add_column("Variável", style="bold white", no_wrap=True)
        t_anom.add_column("Pool", style="cyan", no_wrap=True)
        t_anom.add_column("Detalhe", style="white")
        for a in sorted(anomalies, key=lambda x: (x["Severity"], x["Pool"], x["Variable"])):
            sev = a["Severity"]
            sev_style = "bold red" if sev == "FAIL" else ("bold yellow" if sev == "WARN" else "bold cyan")
            t_anom.add_row(Text(sev, style=sev_style), a["Variable"], a["Pool"], a["Issue"])
        console.print(t_anom)


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
