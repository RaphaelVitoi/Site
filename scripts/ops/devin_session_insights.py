"""CLI para consulta de Session Insights da API v3 do Devin Cloud.

Consome os endpoints oficiais:
  POST /v3/organizations/{org_id}/sessions/{devin_id}/insights/generate
  GET  /v3/organizations/{org_id}/sessions/{devin_id}/insights

Emite painel Markdown compativel com o handoff (reports/HANDOFF-*.md)
quando a sessao avaliada foi uma sessao Devin Cloud, servindo como
eixo externo opcional do session-impact-evaluator.

Credenciais (nunca em texto claro, ver Set-EcosystemCredential.ps1):
  DEVIN_API_TOKEN  - service user ou PAT com ViewOrgSessions /
                     ManageOrgSessions
  DEVIN_ORG_ID     - organizacao (prefixo org-)
  DEVIN_API_BASE   - opcional, default https://api.devin.ai

Padrao SOTA: Pure ASCII, PEP 585/604, Python 3.12+, Zero-Any.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import sys
import time
import urllib.error
import urllib.request

try:
    import winreg
except ImportError:
    winreg = None  # type: ignore[assignment]

SITE_ROOT = Path(__file__).resolve().parent.parent.parent
DEVIN_API_BASE_DEFAULT = "https://api.devin.ai"
DEVIN_ID_PREFIX = "devin-"


def _env_or_reg(name: str, default: str = "") -> str:
    val = (os.getenv(name) or "").strip()
    if val:
        return val
    if winreg is not None:
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
    return default


def _normalizar_devin_id(raw: str) -> str:
    raw = raw.strip()
    if "/sessions/" in raw:
        raw = raw.rsplit("/sessions/", 1)[-1].split("/")[0].split("?")[0]
    if not raw.startswith(DEVIN_ID_PREFIX):
        raw = f"{DEVIN_ID_PREFIX}{raw}"
    return raw


def _request(method: str, url: str, token: str, payload: dict[str, object] | None = None) -> dict[str, object]:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/json")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"HTTP {exc.code} em {method} {url}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Falha de rede em {method} {url}: {exc.reason}") from exc
    parsed = json.loads(body) if body.strip() else {}
    if not isinstance(parsed, dict):
        raise RuntimeError(f"Resposta inesperada (nao-JSON objeto) de {url}")
    return parsed


def _insights_url(base: str, org_id: str, devin_id: str, suffix: str = "") -> str:
    return f"{base.rstrip('/')}/v3/organizations/{org_id}/sessions/{devin_id}/insights{suffix}"


def gerar_insights(base: str, org_id: str, devin_id: str, token: str) -> dict[str, object]:
    """Dispara geracao under demand e retorna o payload inicial."""
    url = _insights_url(base, org_id, devin_id, "/generate")
    return _request("POST", url, token, payload={})


def obter_insights(base: str, org_id: str, devin_id: str, token: str) -> dict[str, object]:
    url = _insights_url(base, org_id, devin_id)
    return _request("GET", url, token)


def aguardar_analise(
    base: str,
    org_id: str,
    devin_id: str,
    token: str,
    timeout_s: float,
    intervalo_s: float,
) -> dict[str, object]:
    """Faz polling do GET ate analysis_status sair de 'started'/None."""
    deadline = time.monotonic() + timeout_s
    ultimo: dict[str, object] = {}
    while time.monotonic() < deadline:
        ultimo = obter_insights(base, org_id, devin_id, token)
        status = ultimo.get("analysis_status")
        if status in (None, "completed", "failed"):
            return ultimo
        time.sleep(intervalo_s)
    ultimo["_timeout"] = True
    return ultimo


def _como_dict(val: object) -> dict[str, object]:
    return val if isinstance(val, dict) else {}


def _como_lista_dicts(val: object) -> list[dict[str, object]]:
    return [x for x in val if isinstance(x, dict)] if isinstance(val, list) else []


def _como_lista(val: object) -> list[object]:
    return val if isinstance(val, list) else []


def _ou_na(mapa: dict[str, object], chave: str) -> object:
    return mapa.get(chave) or "N/A"


def _formatar_top_issues(issues: list[dict[str, object]]) -> list[str]:
    if not issues:
        return []
    linhas: list[str] = ["**Issues (top impacto):**", ""]
    ordenadas = sorted(
        issues,
        key=lambda i: {"high": 0, "medium": 1}.get(str(i.get("impact", "")).lower(), 2),
    )
    for iss in ordenadas[:5]:
        rotulo = iss.get("label") or iss.get("title") or "issue"
        linhas.append(f"- [{str(iss.get('impact', '?')).upper()}] {rotulo}: {str(iss.get('description', ''))[:200]}")
    linhas.append("")
    return linhas


def gerar_painel_markdown(dados: dict[str, object]) -> str:
    """Gera painel Markdown no formato do handoff para sessoes Devin Cloud."""
    analysis = _como_dict(dados.get("analysis"))
    issues = _como_lista_dicts(analysis.get("issues"))
    timeline = _como_lista(analysis.get("timeline"))
    action_items = _como_lista(analysis.get("action_items"))
    skill_usage = _como_dict(analysis.get("skill_usage"))
    suggested = analysis.get("suggested_prompt") or {}

    alto = sum(1 for i in issues if str(i.get("impact", "")).lower() == "high")
    medio = sum(1 for i in issues if str(i.get("impact", "")).lower() == "medium")
    skills_used = len(_como_lista(skill_usage.get("used") or skill_usage.get("items")))
    skills_misleading = len(_como_lista(skill_usage.get("misleading") or skill_usage.get("misleading_items")))

    md: list[str] = [
        "### Painel de Insights Devin Cloud (Session Insights API v3)",
        "",
        "| Metrica | Valor Medido | Status / Observacao |",
        "| :--- | :--- | :--- |",
        (
            f"| **ACU Consumido** | **{dados.get('acus_consumed', 'N/A')}** |"
            f" Modo: {_ou_na(dados, 'devin_mode')} | Origem: {_ou_na(dados, 'origin')} |"
        ),
        (
            f"| **Mensagens** | **{dados.get('num_user_messages', 'N/A')} user / {dados.get('num_devin_messages', 'N/A')} devin** |"
            " Correcao frequente sugere prompt subespecificado |"
        ),
        (
            f"| **Tamanho da Sessao** | **{str(dados.get('session_size', 'N/A')).upper()}** |"
            f" Categoria: {_ou_na(dados, 'category')} | Status analise: {_ou_na(dados, 'analysis_status')} |"
        ),
        (
            f"| **Issues Detectadas** | **{len(issues)}** ({alto} altas / {medio} medias) |"
            f" Timeline: {len(timeline)} eventos |"
        ),
        (
            f"| **Action Items** | **{len(action_items)}** |"
            " machine_setup / repo_config / knowledge / prompt_improvement |"
        ),
        (
            f"| **Skills/Notes** | **{skills_used} usados / {skills_misleading} enganosos** |"
            " Knowledge Usage da sessao |"
        ),
        (
            f"| **Suggested Prompt** | **{'disponivel' if suggested else 'ausente'}** |"
            " Improved Prompt para sessoes futuras |"
        ),
        "",
    ]
    md.extend(_formatar_top_issues(issues))
    return "\n".join(md)


def main() -> int:
    parser = argparse.ArgumentParser(description="Consulta Session Insights da API v3 do Devin Cloud para uma sessao.")
    parser.add_argument(
        "--session",
        type=str,
        required=True,
        help="ID da sessao Devin (devin-... ou URL completa de app.devin.ai/sessions/...)",
    )
    parser.add_argument("--generate", action="store_true", help="Dispara geracao de insights se ainda nao existir")
    parser.add_argument("--poll-timeout", type=float, default=120.0, help="Timeout de polling em segundos")
    parser.add_argument("--poll-interval", type=float, default=5.0, help="Intervalo de polling em segundos")
    parser.add_argument("--markdown", action="store_true", help="Gera painel Markdown para o handoff")
    parser.add_argument("--json", action="store_true", help="Imprime o payload JSON completo")
    args = parser.parse_args()

    token = _env_or_reg("DEVIN_API_TOKEN")
    org_id = _env_or_reg("DEVIN_ORG_ID")
    base = _env_or_reg("DEVIN_API_BASE", DEVIN_API_BASE_DEFAULT)
    if not base.startswith("https://"):
        print("ERRO: DEVIN_API_BASE deve usar https://", file=sys.stderr)
        return 1

    if not token:
        print("ERRO: DEVIN_API_TOKEN ausente (env ou HKCU/HKLM Environment).", file=sys.stderr)
        print("      Use scripts/ops/Set-EcosystemCredential.ps1 -Nome DEVIN_API_TOKEN", file=sys.stderr)
        return 1
    if not org_id:
        print("ERRO: DEVIN_ORG_ID ausente (env ou HKCU/HKLM Environment).", file=sys.stderr)
        return 1

    devin_id = _normalizar_devin_id(args.session)

    try:
        if args.generate:
            resp = gerar_insights(base, org_id, devin_id, token)
            print(f"[generate] status={resp.get('status')}", file=sys.stderr)

        dados = aguardar_analise(base, org_id, devin_id, token, args.poll_timeout, args.poll_interval)
    except RuntimeError as exc:
        print(f"ERRO: {exc}", file=sys.stderr)
        return 1

    if dados.get("_timeout"):
        print(
            f"AVISO: analise ainda em andamento apos {args.poll_timeout}s "
            "(analysis_status=started). Tente novamente em instantes.",
            file=sys.stderr,
        )

    if args.json:
        dados.pop("_timeout", None)
        print(json.dumps(dados, indent=2, ensure_ascii=False))
    elif args.markdown:
        print(gerar_painel_markdown(dados))
    else:
        dados.pop("_timeout", None)
        print(
            f"Sessao {devin_id} | size={dados.get('session_size')} | "
            f"category={dados.get('category')} | analysis_status={dados.get('analysis_status')} | "
            f"acus={dados.get('acus_consumed')} | "
            f"msgs={dados.get('num_user_messages')}u/{dados.get('num_devin_messages')}d"
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
