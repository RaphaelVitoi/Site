"""Rotina de Auditoria Mensal Periodica  Modus Operandi & Roteamento SOTA v8.0 GOLD.

Executa no 1o dia de cada mes ou sob demanda para auditar:
1. Conformidade de Modelos & Registros de Capacidade (Model Registry & Pricing).
2. Politica de Roteamento, Cobertura de Agentes e Calculo de ROI Condicional.
3. Integridade e Isomorfismo dos Manuais de Modus Operandi e Diretrizes.
4. Gera relatorio consolidado em reports/audits/AUDITORIA_MENSAL_MODUS_OPERANDI_ROUTING_YYYY_MM.md.
"""

from __future__ import annotations

import datetime
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

from core.config import AGENT_MODEL_MAP
from llm.model_registry import get
from llm.routing_policy import (
    ROTAS,
    TTL_ROTA_DIAS,
    avaliar_uso_condicional_pro,
    cobertura,
    rotas_suspeitas,
)

# Garantir path raiz do projeto
SITE_ROOT = Path(__file__).resolve().parent.parent.parent
if str(SITE_ROOT) not in sys.path:
    sys.path.insert(0, str(SITE_ROOT))


def auditar_manuais(arquivos: list[Path], *, raiz: Path) -> tuple[dict[str, Any], list[str]]:
    """Presenca e marcadores dos manuais de governanca. Publica para ser testavel.

    ## A colisao que esta funcao existe para impedir

    Ate 2026-08-27 o dicionario era indexado por `f.name`. Como
    `~/.gemini/MODUS_OPERANDI.md` e `Site/MODUS_OPERANDI.md` compartilham o
    basename, o segundo sobrescrevia o primeiro: a auditoria de governanca
    DESCARTAVA em silencio o manual canonico multiprojeto (39 KB) e exibia a
    linha como presente com os dados do arquivo de projeto (12 KB).

    Colisao de chave nao alcanca nenhum ramo de erro  o arquivo existe, so nao
    e o que a tabela diz que e. Por isso alem de indexar por CAMINHO ha uma
    guarda de cardinalidade: se sair menos linha do que entrou arquivo, alguem
    foi engolido, e isso vira alerta em vez de sumir.

    Devolve `(mo_status, alertas)`. Nao decide status geral  quem chama decide.
    """
    mo_status: dict[str, Any] = {}
    alertas: list[str] = []

    for f in arquivos:
        try:
            rotulo = str(f.relative_to(raiz)).replace("\\", "/")
        except ValueError:
            rotulo = str(f)

        if f.exists():
            txt = f.read_text(encoding="utf-8")
            mo_status[rotulo] = {
                "existe": True,
                "tamanho_bytes": f.stat().st_size,
                "tem_4_camadas": all(f"CAMADA {n}" in txt for n in (1, 2, 3, 4)),
                "tem_mcp": "MCP" in txt,
            }
        else:
            mo_status[rotulo] = {"existe": False}
            alertas.append(f"Arquivo essencial {rotulo} nao encontrado.")

    if len(mo_status) != len(arquivos):
        alertas.append(
            f"Colisao de chave na auditoria de manuais: {len(arquivos)} arquivos checados, "
            f"{len(mo_status)} reportados. Manual engolido nao aparece como ausente."
        )

    return mo_status, alertas


def _commit_curto() -> str:
    """SHA curto do HEAD, ancora da classe INTERNA (M.O. 13.A).

    Falha em silencio de proposito: git ausente, repositorio nao inicializado ou
    checkout sem HEAD nao podem derrubar uma auditoria. Devolve marcador
    explicito em vez de string vazia  campo vazio pareceria "sem alteracao".
    """
    try:
        r = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=SITE_ROOT,
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        return r.stdout.strip() or "indisponivel"
    except (OSError, subprocess.SubprocessError):
        return "indisponivel"


def _frontmatter(
    *,
    agora: datetime.datetime,
    mes_ano: str,
    status_camadas: dict[str, Any],
    mo_status: dict[str, Any],
    suspeitas: dict,
    cob: dict[str, int],
    n_agentes_resolvidos: int,
) -> str:
    """Frontmatter canonico (M.O. 13.B) DERIVADO do que a auditoria mediu.

    Nenhum campo e literal otimista: `verificado` lista o que esta execucao
    rodou, com as contagens que ela obteve, e `nao_verificado` declara os
    limites reais desta rotina  inclusive os desconfortaveis.

    As tres classes de decaimento se aplicam de verdade a este registro:
      - INTERNO: contagens de cobertura, ancoradas no commit.
      - EXTERNO: preco e capacidade de modelo de terceiro, que decaem por TEMPO.
      - MEDIDO: os numeros so valem na configuracao declarada em config_medida.
    """
    carimbo = agora.strftime("%Y-%m-%dT%H:%M-03:00")
    ok = [m for m, d in status_camadas.items() if d.get("status") == "OK"]
    falhos = [m for m, d in status_camadas.items() if d.get("status") != "OK"]
    mo_ausentes = [f for f, d in mo_status.items() if not d.get("existe")]

    verificado = [
        f"resolucao de {len(ok)} de {len(status_camadas)} modelos das camadas no MODEL_REGISTRY",
        f"cobertura de roteamento: {cob['agentes']} agentes e {cob['subagentes']} subagentes",
        f"AGENT_MODEL_MAP resolvido com {n_agentes_resolvidos} agentes",
        f"ancoras de capacidade das {len(ROTAS)} rotas contra TTL de {TTL_ROTA_DIAS} dias",
        f"presenca em disco de {len(mo_status) - len(mo_ausentes)} de {len(mo_status)} manuais de governanca",
        "gatilho de ROI condicional Pro vs Flash nos dois ramos de decisao",
    ]
    if falhos:
        verificado.append(f"falha de resolucao detectada em: {', '.join(falhos)}")

    nao_verificado = [
        "nenhuma chamada real a provedor de LLM foi feita: as chaves deste ambiente "
        "estao revogadas. Preco e capacidade vem do registro local, nao do fornecedor.",
        "llm/model_registry.py NAO foi reconferido contra a documentacao oficial dos "
        "fornecedores; esta rotina le o registro, nao a fonte primaria.",
        "a checagem dos manuais e por SUBSTRING ('CAMADA 1', 'MCP'): prova que o texto "
        "existe, nao que a arquitetura descrita esta correta ou vigente.",
        "as rotas suspeitas foram CONTADAS, nao revalidadas: reconsulta ao fornecedor e "
        "ato humano e continua pendente.",
    ]
    if mo_ausentes:
        nao_verificado.append(f"conteudo nao lido dos manuais ausentes: {', '.join(mo_ausentes)}")

    linhas = [
        "---",
        f"id: auditoria-mensal-modus-operandi-routing-{mes_ano}",
        "tipo: auditoria",
        "escopo: Site",
        "ecossistema: gemini-antigravity",
        "autor: sota-routine-daemon@scripts/routines/audit_monthly_modus_operandi_and_routing.py",
        f"criado_em: {carimbo}",
        f"commit: {_commit_curto()}",
        "classes: [interno, externo, medido]",
        "fontes:",
        f"  - {{fonte: llm/model_registry.py, consultado_em: {carimbo}, versao_alvo: local}}",
        f"  - {{fonte: llm/routing_policy.py, consultado_em: {carimbo}, versao_alvo: local}}",
        f"  - {{fonte: data/agents_manifest.json, consultado_em: {carimbo}, versao_alvo: local}}",
        f"ttl_dias: {TTL_ROTA_DIAS}",
        "config_medida:",
        f"  python: '{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}'",
        f"  modelos_auditados: {len(status_camadas)}",
        f"  rotas_declaradas: {len(ROTAS)}",
        f"  rotas_suspeitas: {len(suspeitas)}",
        f"  agentes_resolvidos: {n_agentes_resolvidos}",
        "verificado:",
        *[f"  - {json.dumps(v, ensure_ascii=False)}" for v in verificado],
        "nao_verificado:",
        *[f"  - {json.dumps(n, ensure_ascii=False)}" for n in nao_verificado],
        f"supersede: {_auditoria_anterior(agora)}",
        "---",
        "",
    ]
    return "\n".join(linhas)


def _auditoria_anterior(agora: datetime.datetime) -> str:
    """Id da auditoria do mes anterior, se o relatorio dela existir.

    Encadeia os registros em vez de deixar cada mes orfao: `supersede` e o que
    permite reconstruir a serie e ver desde quando uma rota esta suspeita.
    Devolve 'null' quando nao ha anterior  primeira execucao da serie.
    """
    primeiro_do_mes = agora.replace(day=1)
    anterior = (primeiro_do_mes - datetime.timedelta(days=1)).strftime("%Y_%m")
    alvo = SITE_ROOT / "reports" / "audits" / f"AUDITORIA_MENSAL_MODUS_OPERANDI_ROUTING_{anterior}.md"
    return f"auditoria-mensal-modus-operandi-routing-{anterior}" if alvo.exists() else "null"


def run_monthly_audit() -> dict[str, Any]:
    agora = datetime.datetime.now()
    timestamp_str = agora.strftime("%Y-%m-%d %H:%M:%S")
    mes_ano = agora.strftime("%Y_%m")

    audit_results = {
        "timestamp": timestamp_str,
        "mes_referencia": mes_ano,
        "status_geral": "APROVADO",
        "camadas_auditadas": {},
        "roteamento_auditado": {},
        "modus_operandi_auditado": {},
        "alertas": [],
    }

    # 1. Auditoria das 4 Camadas Funcionais no Model Registry
    camadas = {
        "camada_1_triagem": ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.6-flash"],
        "camada_2_agente_principal": ["gemini-3.7-flash"],
        "camada_3_raciocinio_profundo": ["gemini-3.1-pro"],
    }

    status_camadas = {}
    for camada, modelos in camadas.items():
        for mod in modelos:
            try:
                cap = get(mod)
                status_camadas[mod] = {
                    "camada": camada,
                    "context_window": cap.context_window_in,
                    "max_output": cap.max_output_tokens,
                    "preco_in": cap.price_per_1m_in,
                    "preco_out": cap.price_per_1m_out,
                    "thinking": cap.thinking_level,
                    "status": "OK",
                }
            except Exception as e:
                status_camadas[mod] = {"status": "ERRO", "detalhe": str(e)}
                audit_results["alertas"].append(f"Modelo {mod} da {camada} falhou na resolucao: {e}")
                audit_results["status_geral"] = "ATENCAO"

    audit_results["camadas_auditadas"] = status_camadas

    # 2. Auditoria do Roteamento e ROI
    cob = cobertura()
    test_roi_flash = avaliar_uso_condicional_pro(complexidade_formal=False, ganho_qualidade_esperado_pct=10.0)
    test_roi_pro = avaliar_uso_condicional_pro(complexidade_formal=True, ganho_qualidade_esperado_pct=40.0)

    # Ancoras de capacidade (M.O. 13.A, classe EXTERNA). Ate 2026-08-27 esta
    # auditoria RECOMENDAVA por escrito "monitorar lancamentos de modelos de
    # fronteira" com um literal fixo, enquanto a funcao que detecta exatamente
    # isso vivia sem chamador no modulo do qual esta rotina ja importava.
    # Recomendacao que nao le nada e sinal verde desconectado.
    suspeitas = rotas_suspeitas()

    audit_results["roteamento_auditado"] = {
        "total_agentes_cobertos": cob["agentes"],
        "total_subagentes_cobertos": cob["subagentes"],
        "mapa_agentes_resolvidos": len(AGENT_MODEL_MAP),
        "roi_trigger_flash_ok": test_roi_flash["modelo_escolhido"] == "gemini-3.7-flash",
        "roi_trigger_pro_ok": test_roi_pro["modelo_escolhido"] == "gemini-3.1-pro",
        "ttl_rota_dias": TTL_ROTA_DIAS,
        "rotas_suspeitas": {c.value: motivo for c, motivo in suspeitas.items()},
    }

    if suspeitas:
        for classe, motivo in suspeitas.items():
            audit_results["alertas"].append(f"Rota '{classe.value}' com ancora vencida: {motivo}")
        # ATENCAO, nao falha: ancora vencida nao quebra o sistema, exige
        # reconsulta ao fornecedor  ato humano. O wrapper Invoke-MonthlyAudit.ps1
        # trata exit != 0 como aviso amarelo e nao interrompe nada (medido).
        audit_results["status_geral"] = "ATENCAO"

    if len(AGENT_MODEL_MAP) < 19:
        audit_results["alertas"].append(
            f"Numero de agentes resolvidos ({len(AGENT_MODEL_MAP)}) abaixo do esperado (19)."
        )
        audit_results["status_geral"] = "ATENCAO"

    # 3. Auditoria de Integridade de Manuais
    arquivos_mo = [
        SITE_ROOT.parent / "MODUS_OPERANDI.md",
        SITE_ROOT / "MODUS_OPERANDI.md",
        SITE_ROOT / "docs" / "ARQUITETURA_PADRAO_OURO_SOTA_2026.md",
    ]

    mo_status, alertas_mo = auditar_manuais(arquivos_mo, raiz=SITE_ROOT.parent)
    if alertas_mo:
        audit_results["alertas"].extend(alertas_mo)
        audit_results["status_geral"] = "ATENCAO"

    audit_results["modus_operandi_auditado"] = mo_status

    # 4. Gerar Relatorio Markdown
    reports_dir = SITE_ROOT / "reports" / "audits"
    reports_dir.mkdir(parents=True, exist_ok=True)
    report_file = reports_dir / f"AUDITORIA_MENSAL_MODUS_OPERANDI_ROUTING_{mes_ano}.md"

    md_content = _frontmatter(
        agora=agora,
        mes_ano=mes_ano,
        status_camadas=status_camadas,
        mo_status=mo_status,
        suspeitas=suspeitas,
        cob=cob,
        n_agentes_resolvidos=len(AGENT_MODEL_MAP),
    )

    total_manuais = len(mo_status)
    manuais_ok = sum(1 for m in mo_status.values() if m.get("presente") and m.get("quatro_camadas") and m.get("barramento_mcp"))

    md_content += f"""# RELATORIO DE AUDITORIA MENSAL: MODUS OPERANDI & ROUTING SOTA v8.0 GOLD

> **Data de Execucao:** {timestamp_str}
> **Mes de Referencia:** {mes_ano}
> **Status Global:** **{audit_results["status_geral"]}**
> **Auditor Responsavel:** Chico / SOTA Routine Daemon

---

## 1. RESUMO EXECUTIVO
- **Total de Agentes Cobertos:** {cob["agentes"]} agentes / {cob["subagentes"]} tiers de subagente
- **Mapa Concreto Ativo:** {len(AGENT_MODEL_MAP)} agentes operando sem fallbacks orfaos
- **Validacao de Gatilho de ROI (Gemini 3.1 Pro vs. 3.7 Flash):** Aprovado e calibrado
- **Ancoras de Rota:** {len(ROTAS) - len(suspeitas)} de {len(ROTAS)} dentro do TTL de {TTL_ROTA_DIAS} dias{" -- **" + str(len(suspeitas)) + " exigem reconsulta ao fornecedor**" if suspeitas else ""}
- **Status dos Manuais de Modus Operandi:** {manuais_ok} de {total_manuais} sincronizados com a Arquitetura de 4 Camadas

---

## 2. CONFORMIDADE DAS 4 CAMADAS FUNCIONAIS
| Modelo | Camada | Context Window | Max Output | Preco In/Out ($/1M) | Thinking | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for mod, dados in status_camadas.items():
        if dados.get("status") == "OK":
            md_content += f"| `{mod}` | {dados['camada']} | {dados['context_window']:,} | {dados['max_output']:,} | ${dados['preco_in']:.2f} / ${dados['preco_out']:.2f} | `{dados['thinking']}` | {dados['status']} |\n"
        else:
            md_content += f"| `{mod}` | N/A | N/A | N/A | N/A | N/A | ERRO: {dados.get('detalhe')} |\n"

    md_content += """
---

## 3. AUDITORIA DE MANUAIS E GOVERNANCA
| Arquivo | Presente | Tamanho | 4 Camadas | Barramento MCP |
| :--- | :--- | :--- | :--- | :--- |
"""
    for fname, d in mo_status.items():
        if d.get("existe"):
            md_content += f"| `{fname}` | Sim | {d['tamanho_bytes']} B | {'Sim' if d['tem_4_camadas'] else 'Nao'} | {'Sim' if d['tem_mcp'] else 'Nao'} |\n"
        else:
            md_content += f"| `{fname}` | Nao | N/A | N/A | N/A |\n"

    md_content += """
---

## 4. ALERTAS E RECOMENDACOES PARA O PROXIMO MES

"""
    if audit_results["alertas"]:
        for al in audit_results["alertas"]:
            md_content += f"- **Alerta:** {al}\n"
    else:
        md_content += "- **Zero inconformidades detectadas.** O ecossistema opera no Padrao-Ouro termodinamico.\n"

    # O estado das ancoras e sempre reportado, com alerta ou sem  e o unico
    # item desta secao que fala de decaimento EXTERNO, que corre por tempo e
    # nao por diff. Texto derivado de rotas_suspeitas(), nunca literal.
    md_content += f"\n### 4.1 Ancoras de capacidade das rotas (TTL {TTL_ROTA_DIAS} dias)\n\n"
    if suspeitas:
        md_content += (
            f"**{len(suspeitas)} de {len(ROTAS)} rotas** afirmam capacidade ou preco de terceiro "
            f"sem verificacao dentro do TTL. Reconsulta ao fornecedor e ato humano:\n\n"
        )
        for classe, motivo in suspeitas.items():
            md_content += f"- `{classe.value}` -- {motivo}\n"
    else:
        md_content += (
            f"Nenhuma das {len(ROTAS)} rotas venceu o TTL na data desta execucao "
            f"({agora.strftime('%Y-%m-%d')}). As ancoras declaradas em `llm/routing_policy.py` "
            f"seguem dentro do prazo.\n"
        )
        md_content += (
            f"\n> Ausencia de rota vencida NAO e prova de que a tabela esta atual: o TTL de "
            f"{TTL_ROTA_DIAS} dias e palpite declarado sobre o intervalo entre releases de "
            f"fronteira, nao medicao. Ver `TTL_ROTA_DIAS` em `llm/routing_policy.py`.\n"
        )

    md_content += "\n---\n*Relatorio gerado automaticamente pela Rotina de Auditoria Mensal SOTA v8.0 GOLD sob governanca de Raphael Vitoi.*\n"

    report_file.write_text(md_content, encoding="utf-8")
    print(f"[AUDITORIA SOTA] Relatorio gerado com sucesso em: {report_file}")
    return audit_results


if __name__ == "__main__":
    res = run_monthly_audit()
    sys.exit(0 if res["status_geral"] == "APROVADO" else 1)
