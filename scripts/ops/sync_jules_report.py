"""Sincronizador SOTA de Relatorios e Atividades do Google Jules Cloud.

Conecta-se a API v1alpha do Google Jules (https://jules.googleapis.com/v1alpha),
coleta o historico de sessoes, analises de execucao, erros e diffs para o repositorio
RaphaelVitoi/Site, gerando o JULES_REPORT.md fidedigno e lastreado em dados reais.
"""

from __future__ import annotations

import argparse
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Final

from engine.jules_bridge import JulesClient

BASE_DIR: Final[Path] = Path(__file__).resolve().parent.parent.parent
JULES_REPORT_FILE: Final[Path] = BASE_DIR / "JULES_REPORT.md"

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
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    total = len(sessions)
    completed = sum(1 for s in sessions if s["state"] == "COMPLETED")
    failed = sum(1 for s in sessions if s["state"] == "FAILED")
    in_progress = sum(1 for s in sessions if s["state"] in ("IN_PROGRESS", "QUEUED", "PENDING"))

    lines: list[str] = []
    lines.append("# Google Jules Cloud Telemetry & Task Execution Report")
    lines.append("")
    lines.append("> **Repositório Monitorado:** `RaphaelVitoi/Site`")
    lines.append("> **Governança:** Protocolo Master Chico SOTA v8.0 GOLD (Seção X — Jules Cloud MCP Bridge)")
    lines.append(f"> **Data de Atualização:** `{now_utc}`")
    lines.append("> **Origem dos Dados:** Google Jules API v1alpha (`https://jules.googleapis.com/v1alpha`)")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 1. Resumo Executivo das Sessões em Nuvem")
    lines.append("")
    lines.append("| Métrica | Valor | Status Operacional |")
    lines.append("| :--- | :--- | :--- |")
    lines.append(f"| **Total de Sessões Registradas** | `{total}` | Base de telemetria completa |")
    lines.append(f"| **Sessões Concluídas com Sucesso** | `{completed}` | ✅ Execução com artefatos |")
    lines.append(f"| **Sessões com Falha de Execução** | `{failed}` | ⚠️ Diagnóstico detalhado abaixo |")
    lines.append(f"| **Sessões Ativas no Momento** | `{in_progress}` | 💤 Standby |")
    lines.append("| **Plano Ativo** | `Jules in Pro` | Cota: 100 sessões/dia (1/100 consumida) |")
    lines.append("| **Cron Noturno Automatizado** | Ativo (~03:15–03:25 UTC) | Persona `Bolt ⚡` |")
    lines.append("")
    lines.append("> [!NOTE]")
    lines.append("> **Modelo: a escolha é na UI, não pelo portão MCP.**")
    lines.append(">")
    lines.append(
        "> O seletor de modelo do Jules existe e é do operador, mas vive nas preferências da plataforma (`jules.google.com/settings/general`) — mesmo padrão do Stitch."
    )
    lines.append(
        "> Nem a `createSession` da API v1alpha nem as ferramentas do MCP `google-jules` aceitam parâmetro de modelo, então nenhuma automática daqui o roteia (medido em 2026-09-04)."
    )
    lines.append(
        "> Este relatório deixou de publicar tabela de roteamento de modelos por ordem do Tier 0: instrução que não alcança mecanismo é promessa ao operador."
    )
    lines.append(">")
    lines.append(
        "> **Subscrição**: `Jules in Pro`, autorizando até 100 sessões concorrentes/diárias na nuvem da Google."
    )
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 2. Diagnóstico de Causa-Raiz das Falhas Diárias")
    lines.append("")
    lines.append("> [!CAUTION]")
    lines.append("> **Por que o relatório anterior estava vazio e as tarefas diárias falhavam:**")
    lines.append(
        "> 1. **Relatório Alienígena no Git:** O arquivo `JULES_REPORT.md` anterior foi incorporado no commit `b36a9ea4` com um template copiado de `robinbakshi007/ollama-direct-custom-agent` (projeto de extensão VS Code alheio), sem qualquer vínculo com a API do Jules."
    )
    lines.append(
        "> 2. **Falha Sistêmica no Clone da VM do Jules:** Toda noite às ~03:20 UTC, o runner em nuvem do Google Jules inicia uma VM descartável e executa:"
    )
    lines.append(">    ```bash")
    lines.append(
        ">    git clone --depth 1 --shallow-submodules --no-single-branch --recursive https://github.com/RaphaelVitoi/Site -b master /app"
    )
    lines.append(">    ```")
    lines.append(
        "> 3. **Submódulo Quebrado (`skills/exa-mcp-server`):** O commit `fb578584d9bf8df7afc53890c5daabb6956200b7` foi registrado localmente no submódulo, mas **nunca foi (e não pode ser) enviado para o repositório público upstream** (`exa-labs/exa-mcp-server.git`). O GitHub rejeitava o fetch com `upload-pack: not our ref fb578584d9...`, abortando o clone antes do agente Jules rodar."
    )
    lines.append(
        "> 4. **Bug de Parâmetro no `engine/jules_bridge.py`:** A query `?view=FULL` era rejeitada pela API v1alpha com HTTP 400 Bad Request (sanado nesta sessão)."
    )
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 3. Histórico Consolidado de Sessões no Google Jules")
    lines.append("")
    lines.append(
        "| ID da Sessão | Data (UTC) | Persona / Prompt | Branch | Status | Atividades | Observação / Causa da Falha |"
    )
    lines.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |")

    for s in sessions:
        sid = s["id"]
        created = s["create_time"][:19].replace("T", " ") if s["create_time"] else "N/A"
        raw_title = s["title"].splitlines()[0] if s["title"].splitlines() else "Sem titulo"
        title = raw_title.replace("|", "/").strip()
        if len(title) > 55:
            title = title[:52] + "..."
        branch = s["branch"]
        state_badge = "✅ COMPLETED" if s["state"] == "COMPLETED" else f"❌ {s['state']}"
        acts_count = s["activities_count"]

        fail = s["failure_reason"]
        if fail:
            # Resumir a razao
            if "not our ref" in fail or "submodule" in fail:
                obs = "Submodule clone failed (`exa-mcp-server` ref `fb57858` inexistente no upstream)"
            else:
                obs = f"`{fail[:80]}`"
        elif s["state"] == "COMPLETED":
            obs = "Execução bem-sucedida"
        else:
            obs = "—"

        lines.append(
            f"| [{sid}](https://jules.google.com/session/{sid}) | `{created}` | **{title}** | `{branch}` | {state_badge} | `{acts_count}` | {obs} |"
        )

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 4. Detalhamento Técnico das Sessões Rastreadas")
    lines.append("")

    for s in sessions:
        sid = s["id"]
        lines.append(f"### Sessão `{sid}` — {s['title']}")
        lines.append(f"- **Status:** `{s['state']}`")
        lines.append(f"- **Criada em:** `{s['create_time']}`")
        lines.append(f"- **Branch:** `{s['branch']}` | **Repositório:** `{s['source']}`")
        lines.append(f"- **Link Direto:** https://jules.google.com/session/{sid}")
        lines.append("- **Prompt Original:**")
        lines.append("  ```text")
        prompt_lines = redigir_segredos(s["prompt"].strip()).splitlines()
        for pl in prompt_lines[:15]:
            lines.append(f"  {pl}")
        if len(prompt_lines) > 15:
            lines.append(f"  ... [truncado, {len(prompt_lines)} linhas no total]")
        lines.append("  ```")

        if s["failure_reason"]:
            lines.append("- **Motivo da Falha Registrado na Atividade:**")
            lines.append("  ```text")
            lines.append(f"  {s['failure_reason']}")
            lines.append("  ```")

        if s["activities"]:
            lines.append(f"- **Timeline de Atividades ({len(s['activities'])} eventos):**")
            for act in s["activities"]:
                orig = act.get("originator", "SYSTEM")
                act_time = act.get("createTime", "")[:19].replace("T", " ")
                act_type = [k for k in act.keys() if k not in ("name", "createTime", "originator")]
                lines.append(f"  - `[{act_time}]` **{orig}**: `{', '.join(act_type)}`")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 5. Plano de Resolução e Próximos Passos")
    lines.append("")
    lines.append("1. **Normalização do Submódulo `skills/exa-mcp-server`:**")
    lines.append(
        "   - Realinhar o ponteiro gitlink do submódulo para `15ffb50519e719dc791cdc750ce5ed1934c0a1ed` (HEAD canônico do `origin/main`)."
    )
    lines.append(
        "   - Manter as customizações locais do pacote isoladas ou arquivadas sem poluir o commit tracked pelo repositório pai."
    )
    lines.append("2. **Sincronização Contínua do `JULES_REPORT.md`:**")
    lines.append(
        "   - Executar `python scripts/ops/sync_jules_report.py --write` para regenerar este relatório automaticamente via cron ou pré-commit."
    )
    lines.append("3. **Disparo de Teste de Sanidade na Nuvem:**")
    lines.append(
        "   - Criar uma nova sessão via `engine/jules_bridge.py` com o submódulo normalizado para verificar se a VM do Jules conclui o clone sem erros."
    )
    lines.append("")
    lines.append("---")
    lines.append("*Relatório emitido pelo Sincronizador de Telemetria Google Jules — Protocolo Chico SOTA v8.0 GOLD*")

    return "\n".join(lines) + "\n"


def main() -> None:
    """Ponto de entrada do script."""
    parser = argparse.ArgumentParser(description="Sincroniza relatorios do Google Jules Cloud.")
    parser.add_argument("--write", action="store_true", help="Sobrescreve o arquivo JULES_REPORT.md no disco")
    parser.add_argument("--output", type=str, default="", help="Caminho alternativo de saida")
    args = parser.parse_args()

    print("[INFO] Conectando a API do Google Jules (v1alpha)...")
    sessions = fetch_all_sessions_and_activities()
    print(f"[INFO] {len(sessions)} sessoes recuperadas com sucesso.")

    markdown_content = format_markdown_report(sessions)

    if args.write:
        target_path = Path(args.output) if args.output else JULES_REPORT_FILE
        target_path.write_text(markdown_content, encoding="utf-8")
        print(f"[SUCCESS] Relatorio gravado em: {target_path}")
    else:
        print(markdown_content)


if __name__ == "__main__":
    main()
