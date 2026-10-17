"""Sincronizador SOTA de Relatorios e Atividades do Google Jules Cloud.

Conecta-se a API v1alpha do Google Jules (https://jules.googleapis.com/v1alpha),
coleta o historico de sessoes, analises de execucao, erros e diffs para o repositorio
RaphaelVitoi/Site, gerando o JULES_REPORT.md fidedigno e lastreado em dados reais.
"""

from __future__ import annotations

import argparse
from datetime import UTC, datetime
from pathlib import Path
import re
from typing import Any, Final

from engine.jules_bridge import JulesClient

BASE_DIR: Final[Path] = Path(__file__).resolve().parent.parent.parent
JULES_REPORT_FILE: Final[Path] = BASE_DIR / "reports" / "integrations" / "JULES_REPORT.md"

# ---------------------------------------------------------------------------
# Redacao de segredo -- a fronteira entre texto de terceiro e arquivo versionado
# ---------------------------------------------------------------------------
#
# ESTE MODULO REPUBLICA O PROMPT ORIGINAL DE CADA SESSAO, e o prompt e texto que
# alguem digitou. Em 2026-09-03 uma sessao foi criada colando o settings.json
# inteiro do Antigravity IDE -- e aquele arquivo carregava
# `agenticAssistant.geminiApiKey` e `qwen-code.apiKey`. O relatorio gerado foi
# commitado e empurrado com quatro ocorrencias de duas chaves em texto claro.
#
# O PROMPT VIVE DO LADO DO GOOGLE JULES. Sanear o .md a mao apaga a copia e
# deixa a fonte intacta: a proxima sincronizacao traz a chave de volta. A
# correcao tem de estar AQUI, no ponto exato em que o texto cruza para dentro de
# um arquivo versionado.
#
# ISTO NAO SUBSTITUI REVOGACAO. Chave que apareceu em texto claro esta
# comprometida, e o que este modulo controla e apenas a REPUBLICACAO.

#: Prefixo das chaves do ecossistema Google observadas neste ambiente.
_SEGREDO_PREFIXADO: Final[str] = r"AQ\.[A-Za-z0-9_\-]{20,}"

#: Valor com forma de credencial: longo e do charset de token.
_VALOR_DE_SEGREDO: Final[str] = r"[A-Za-z0-9_\-.]{24,}"

#: Campo cujo NOME anuncia credencial. O nome sozinho nunca basta -- veja abaixo.
_CAMPO_DE_SEGREDO: Final[str] = r"[\w.\-]*(?:api[_-]?key|apikey|secret|token|password)"

# O DISCRIMINANTE E A FORMA DO VALOR, NAO O NOME DO CAMPO. `"provider": "api-key"`
# tem 'key' no nome e e configuracao legivel; redigir por nome transformaria
# configuracao em ruido. Por isso todo padrao exige valor longo.
_ATRIBUICAO_DE_SEGREDO: Final[re.Pattern[str]] = re.compile(
    r"(?P<prefixo>[\"']?" + _CAMPO_DE_SEGREDO + r"[\"']?\s*[:=]\s*[\"']?)"
    r"(?P<valor>" + _VALOR_DE_SEGREDO + r")",
    re.IGNORECASE,
)

#: Deteccao, para o guard de regressao sobre o arquivo ja publicado.
CHAVES_SUSPEITAS: Final[re.Pattern[str]] = re.compile(
    _SEGREDO_PREFIXADO + r"|(?:[\"']?" + _CAMPO_DE_SEGREDO + r"[\"']?\s*[:=]\s*[\"']?)" + _VALOR_DE_SEGREDO,
    re.IGNORECASE,
)

MARCADOR_REDIGIDO: Final[str] = "[REDIGIDO]"


def redigir_segredos(texto: str) -> str:
    """Substitui o VALOR de credenciais, preservando o nome do campo.

    Redige o valor e nao a linha inteira porque as duas informacoes tem destinos
    diferentes: saber QUE havia uma chave ali e auditoria, saber QUAL era e o
    vazamento. Apagar a linha destruiria a primeira para conter a segunda.

    Duas passadas, e a ordem importa: a atribuicao nomeada primeiro, para que o
    nome do campo sobreviva; o prefixo conhecido depois, para alcancar a chave
    solta que nao esteja atribuida a campo nenhum.
    """
    saida = _ATRIBUICAO_DE_SEGREDO.sub(lambda m: m.group("prefixo") + MARCADOR_REDIGIDO, texto)
    return re.sub(_SEGREDO_PREFIXADO, MARCADOR_REDIGIDO, saida)


def fetch_all_sessions_and_activities() -> list[dict[str, Any]]:
    """Obtem todas as sessoes e suas respectivas atividades detalhadas."""
    client = JulesClient()
    raw_sessions = client.list_sessions(page_size=50)

    enriched_sessions: list[dict[str, Any]] = []
    for s in raw_sessions:
        session_name = str(s.get("name", ""))
        session_id = session_name.rsplit("/", maxsplit=1)[-1]

        # Buscar atividades da sessao
        activities = client.get_activities(session_id)

        # Identificar falha e razao se houver
        failure_reason = None
        for act in activities:
            if isinstance(act, dict) and "sessionFailed" in act:
                fail_data = act["sessionFailed"]
                if isinstance(fail_data, dict):
                    failure_reason = str(fail_data.get("reason", "Unknown failure"))
                break

        # Verificar se gerou PR ou diff
        pr_url = s.get("githubPullRequestUrl")

        source_name = "sources/github/RaphaelVitoi/Site"
        branch_name = "master"
        source_ctx = s.get("sourceContext")
        if isinstance(source_ctx, dict):
            raw_source = source_ctx.get("source")
            if raw_source:
                source_name = str(raw_source)
            repo_ctx = source_ctx.get("githubRepoContext")
            if isinstance(repo_ctx, dict):
                raw_branch = repo_ctx.get("startingBranch")
                if raw_branch:
                    branch_name = str(raw_branch)

        enriched_sessions.append(
            {
                "id": session_id,
                "title": s.get("title", "Sem titulo"),
                "state": s.get("state", "STATE_UNSPECIFIED"),
                "create_time": s.get("createTime", ""),
                "update_time": s.get("updateTime", ""),
                "prompt": s.get("prompt", ""),
                "source": source_name,
                "branch": branch_name,
                "pr_url": pr_url,
                "failure_reason": failure_reason,
                "activities_count": len(activities),
                "activities": activities,
            }
        )

    # Ordenar cronologicamente inverso (mais recente primeiro)
    enriched_sessions.sort(key=lambda x: x["create_time"], reverse=True)
    return enriched_sessions


def format_markdown_report(sessions: list[dict[str, Any]]) -> str:
    """Formata os dados consolidados do Google Jules no padrao SOTA Markdown."""
    now_utc = datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S UTC")

    total = len(sessions)
    completed = sum(1 for s in sessions if s["state"] == "COMPLETED")
    failed = sum(1 for s in sessions if s["state"] == "FAILED")
    in_progress = sum(1 for s in sessions if s["state"] in ("IN_PROGRESS", "QUEUED", "PENDING"))

    lines: list[str] = [
        "# Google Jules Cloud Telemetry & Task Execution Report",
        "",
        "> **Reposit\u00f3rio Monitorado:** `RaphaelVitoi/Site`",
        "> **Governan\u00e7a:** Protocolo Master Chico SOTA v8.0 GOLD (Se\u00e7\u00e3o X \u2014 Jules Cloud MCP Bridge)",
        f"> **Data de Atualiza\u00e7\u00e3o:** `{now_utc}`",
        "> **Origem dos Dados:** Google Jules API v1alpha (`https://jules.googleapis.com/v1alpha`)",
        "",
        "---",
        "",
        "## 1. Resumo Executivo das Sess\u00f5es em Nuvem",
        "",
        "| M\u00e9trica | Valor | Status Operacional |",
        "| :--- | :--- | :--- |",
        f"| **Total de Sess\u00f5es Registradas** | `{total}` | Base de telemetria completa |",
        f"| **Sess\u00f5es Conclu\u00eddas com Sucesso** | `{completed}` | \u2705 Execu\u00e7\u00e3o com artefatos |",
        f"| **Sess\u00f5es com Falha de Execu\u00e7\u00e3o** | `{failed}` | \u26a0\ufe0f Diagn\u00f3stico detalhado abaixo |",
        f"| **Sess\u00f5es Ativas no Momento** | `{in_progress}` | \U0001f4a4 Standby |",
        "| **Plano / cota** | N\u00e3o expostos por este endpoint | Consulte a conta no momento da opera\u00e7\u00e3o |",
        "| **Agendamento externo** | N\u00e3o verificado | O hist\u00f3rico de sess\u00f5es n\u00e3o prova estado do cron |",
        "",
        "> [!NOTE]",
        "> **Modelo: a escolha \u00e9 na UI, n\u00e3o pelo port\u00e3o MCP.**",
        ">",
        "> O seletor de modelo do Jules existe e \u00e9 do operador, mas vive nas prefer\u00eancias da plataforma (`jules.google.com/settings/general`) \u2014 mesmo padr\u00e3o do Stitch.",
        "> Nem a `createSession` da API v1alpha nem as ferramentas do MCP `google-jules` aceitam par\u00e2metro de modelo, ent\u00e3o nenhuma autom\u00e1tica daqui o roteia (medido em 2026-09-04).",
        "> Este relat\u00f3rio deixou de publicar tabela de roteamento de modelos por ordem do Tier 0: instru\u00e7\u00e3o que n\u00e3o alcan\u00e7a mecanismo \u00e9 promessa ao operador.",
        ">",
        "> Plano, limites da conta e automa\u00e7\u00f5es externas n\u00e3o s\u00e3o inferidos do hist\u00f3rico retornado pela API.",
        "",
        "---",
        "",
        "## 2. Diagn\u00f3stico de Causa-Raiz das Falhas Di\u00e1rias",
        "",
        "> [!CAUTION]",
        "> **Por que o relat\u00f3rio anterior estava vazio e as tarefas di\u00e1rias falhavam:**",
        "> 1. **Relat\u00f3rio Alien\u00edgena no Git:** O arquivo `JULES_REPORT.md` anterior foi incorporado no commit `b36a9ea4` com um template copiado de `robinbakshi007/ollama-direct-custom-agent` (projeto de extens\u00e3o VS Code alheio), sem qualquer v\u00ednculo com a API do Jules.",
        "> 2. **Falha Sist\u00eamica no Clone da VM do Jules:** Toda noite \u00e0s ~03:20 UTC, o runner em nuvem do Google Jules inicia uma VM descart\u00e1vel e executa:",
        ">    ```bash",
        ">    git clone --depth 1 --shallow-submodules --no-single-branch --recursive https://github.com/RaphaelVitoi/Site -b master /app",
        ">    ```",
        "> 3. **Subm\u00f3dulo Quebrado (`skills/exa-mcp-server`):** O commit `fb578584d9bf8df7afc53890c5daabb6956200b7` foi registrado localmente no subm\u00f3dulo, mas **nunca foi (e n\u00e3o pode ser) enviado para o reposit\u00f3rio p\u00fablico upstream** (`exa-labs/exa-mcp-server.git`). O GitHub rejeitava o fetch com `upload-pack: not our ref fb578584d9...`, abortando o clone antes do agente Jules rodar.",
        "> 4. **Bug de Par\u00e2metro no `engine/jules_bridge.py`:** A query `?view=FULL` era rejeitada pela API v1alpha com HTTP 400 Bad Request (sanado nesta sess\u00e3o).",
        "",
        "---",
        "",
        "## 3. Hist\u00f3rico Consolidado de Sess\u00f5es no Google Jules",
        "",
        "| ID da Sess\u00e3o | Data (UTC) | Persona / Prompt | Branch | Status | Atividades | Observa\u00e7\u00e3o / Causa da Falha |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |",
    ]

    for s in sessions:
        sid = s["id"]
        created = s["create_time"][:19].replace("T", " ") if s["create_time"] else "N/A"
        raw_title = s["title"].splitlines()[0] if s["title"].splitlines() else "Sem titulo"
        title = raw_title.replace("|", "/").strip()
        if len(title) > 55:
            title = title[:52] + "..."
        branch = s["branch"]
        state_badge = "\u2705 COMPLETED" if s["state"] == "COMPLETED" else f"\u274c {s['state']}"
        acts_count = s["activities_count"]

        fail = s["failure_reason"]
        if fail:
            # Resumir a razao
            if "not our ref" in fail or "submodule" in fail:
                obs = "Submodule clone failed (`exa-mcp-server` ref `fb57858` inexistente no upstream)"
            else:
                obs = f"`{fail[:80]}`"
        elif s["state"] == "COMPLETED":
            obs = "Execu\u00e7\u00e3o bem-sucedida"
        else:
            obs = "\u2014"

        lines.append(
            f"| [{sid}](https://jules.google.com/session/{sid}) | `{created}` | **{title}** | `{branch}` | {state_badge} | `{acts_count}` | {obs} |"
        )

    lines.extend(
        [
            "",
            "---",
            "",
            "## 4. Detalhamento Tecnico das Sessoes Rastreadas",
            "",
        ]
    )

    for s in sessions:
        sid = s["id"]
        lines.extend(
            [
                f"### Sess\u00e3o `{sid}` \u2014 {s['title']}",
                f"- **Status:** `{s['state']}`",
                f"- **Criada em:** `{s['create_time']}`",
                f"- **Branch:** `{s['branch']}` | **Reposit\u00f3rio:** `{s['source']}`",
                f"- **Link Direto:** https://jules.google.com/session/{sid}",
                "- **Prompt Original:**",
                "  ```text",
            ]
        )
        prompt_lines = redigir_segredos(s["prompt"].strip()).splitlines()
        lines.extend([f"  {pl}" for pl in prompt_lines[:15]])
        if len(prompt_lines) > 15:
            lines.append(f"  ... [truncado, {len(prompt_lines)} linhas no total]")
        lines.append("  ```")

        if s["failure_reason"]:
            lines.extend(
                [
                    "- **Motivo da Falha Registrado na Atividade:**",
                    "  ```text",
                    f"  {s['failure_reason']}",
                    "  ```",
                ]
            )

        if s["activities"]:
            lines.append(f"- **Timeline de Atividades ({len(s['activities'])} eventos):**")
            lines.extend(
                [
                    f"  - `[{act.get('createTime', '')[:19].replace('T', ' ')}]` **{act.get('originator', 'SYSTEM')}**: `{', '.join(k for k in act if k not in ('name', 'createTime', 'originator'))}`"
                    for act in s["activities"]
                ]
            )
        lines.append("")
    lines.extend(
        [
            "---",
            "",
            "## 5. Plano de Resolu\u00e7\u00e3o e Pr\u00f3ximos Passos",
            "",
            "1. **Normaliza\u00e7\u00e3o do Subm\u00f3dulo `skills/exa-mcp-server`:**",
            "2. **Sincroniza\u00e7\u00e3o Cont\u00ednua do `JULES_REPORT.md`:**",
            "3. **Disparo de Teste de Sanidade na Nuvem:**",
            "",
            "---",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> None:
    """Ponto de entrada do script."""
    parser = argparse.ArgumentParser(description="Sincroniza relatorios do Google Jules Cloud.")
    parser.add_argument("--write", action="store_true", help="Sobrescreve reports/integrations/JULES_REPORT.md")
    parser.add_argument("--output", type=str, default="", help="Caminho alternativo de saida")
    args = parser.parse_args()

    print("[INFO] Conectando a API do Google Jules (v1alpha)...")
    sessions = fetch_all_sessions_and_activities()
    print(f"[INFO] {len(sessions)} sessoes recuperadas com sucesso.")

    markdown_content = format_markdown_report(sessions)

    if args.write:
        target_path = Path(args.output) if args.output else JULES_REPORT_FILE
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_text(markdown_content, encoding="utf-8")
        print(f"[SUCCESS] Relatorio gravado em: {target_path}")
    else:
        print(markdown_content)


if __name__ == "__main__":
    main()
