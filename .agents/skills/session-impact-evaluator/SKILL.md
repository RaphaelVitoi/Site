---
name: session-impact-evaluator
description:
  "Avaliacao objetiva (quantitativa, qualitativa e narrativa) de impacto de
  sessao, agnostica entre modelos Tier 1, 2 e 3."
metadata:
  hermes:
    tags: ["session", "impact", "evaluator", "analysis", "handoff"]
    category: devops
    related_skills: ["site-session-handoff", "devin-session-insights"]
allowed-tools:
  - read
  - grep
  - glob
  - exec
---

# SOTA Session Impact Evaluator (Agnóstico Tiers 1-2-3)

Esta skill define o protocolo padrão-ouro para **avaliação factual,
quantitativa, qualitativa e narrativa do impacto produzido ao longo de uma
sessão de trabalho**, aplicável uniformemente a qualquer condutor agêntico dos
**Tiers 1, 2 e 3** (Claude, Gemini, ChatGPT/Codex, Devin, Laya, Gemma/Ollama),
sob a égide do coletivo **CHICO** e a ausência estrita de feudos funcionais (§0
e §7 do `Site/CLAUDE.md`).

> [!IMPORTANT] **Zero alucinação na narrativa:** toda prosa gerada sintetiza
> exclusivamente fatos medidos nos artefatos locais (`git`, CWV, `record_gate`,
> ledger, `saude_da_malha`, SQLite, pools e memória) combinados a observações
> explicitamente declaradas pelo condutor/Tier 0 via `--marcos`,
> `--dificuldades` e `--conclusoes`. Campos explícitos recebem o rótulo
> `[Declarado]`; evidências automáticas recebem `[Medido]` ou `[Git]`.

## 1. Princípio Democrático e Universalidade

Nenhum modelo ou fornecedor possui monopólio ou feudo funcional sobre a medição
de integridade do ecossistema. A fonte única da identidade dos condutores ativos
mora em `data/agent_identities.json` (com os Tiers 1, 2 e modelos locais Tier
3).

Todos os condutores executam a mesma ferramenta CLI determinística em Python
3.12+ isolada no `.venv`:

```powershell
.venv/Scripts/python.exe scripts/ops/avaliar_impacto_sessao.py --pendencias-inicio <N> --horas 12 --markdown
```

## 2. Momento de Execução: O Final Anunciado da Sessão

Esta skill deve ser disparada **compulsoriamente no encerramento anunciado de
cada sessão de trabalho** — isto é, quando o Tier 0 ou o condutor declara o
fechamento formal dos trabalhos e a preparação do relatório de Handoff ou resumo
executivo final.

- Ela **fornece o lastro quantitativo, o diagnóstico qualitativo e o resumo
  escrito** incorporáveis na Seção de Resultados do `reports/HANDOFF-*.md` ou em
  relatórios diretos ao Tier 0.

## 3. Os 11 Eixos Quantitativos Medidos

A ferramenta afere concretamente, a partir de fontes locais e determinísticas:

1. **Entregas Git na Janela (`--horas`, padrão `12.0h`):** commits consolidados,
   autores/condutores distintos, arquivos únicos tocados, inserções/deleções,
   áreas impactadas (`--numstat`), branch atual e itens `dirty` no working tree.
2. **Qualidade Frontend CWV, A11y, CVE & Suite Verde
   (`reports/cwv/cwv_report_*.md` + `.git/sota-suite-verde`):** `LCP_MS`, `CLS`,
   `TBT_MS`, `TTFB_MS`, `MAX_HEAP_MB`, `AXE_VIOLATIONS`, `AXE_INCOMPLETE`, CVEs
   críticas/altas/Python e validade do marcador verde no `HEAD` atual.
3. **Economia de Contexto & Tool Calling S1 (`llm/mcp_tool_interceptor.py`):**
   telemetria viva da sessão (`data/mcp_tool_telemetry.jsonl`) ou benchmark de
   regime (`--forcar-benchmark`) com warmup descartável (<500 $\mu\text{s}$).
4. **Latência de Decisão & Ingress Fast-Path S1 (`core/arbitrator.py`):**
   latência de triagem $\mathcal{O}(1)$ em ms e $\mu\text{s}$.
5. **Passivo de Governança & Pendências (`scripts/ops/record_gate.py`):**
   pendências abertas/vencidas no corpus, variação percentual relativa a
   `--pendencias-inicio`, e identificação explícita dos IDs e donos abertos.
6. **Ledger de Calibração, Suficiência (§8.3) & TimesFM
   (`reports/agent-calibration/`):** integridade SHA-256 do ledger append-only e
   leitura do snapshot `daily/YYYY-MM-DD.json` de hoje com fallback automático
   ao último snapshot diário disponível (`data_referencia`), evitando falsos
   zeros antes da execução diária das 23:59 e reportando `sessoes_faltantes`,
   `eligible_feedback_count` e status do `timesfm_forecast`.
7. **Fila de Tarefas Assíncronas SQLite (`core/task_queue.py`):** contagem de
   `completed`, `pending`, `running`, `failed` e taxa de resolução.
8. **Saúde da Malha (`scripts/ops/saude_da_malha.py`):** coleta todos os sinais
   de observabilidade (alertas graves e notas informativas de instrumentos
   parados ou portão aberto).
9. **Integridade dos Pools OpenRouter (`llm/openrouter_pool.py`):** contagem
   dinâmica de chaves totais/ativas, distribuição T1..T4, bloqueios (429),
   revogações (401/403) e score médio.
10. **Eficiência Econômica, Cotas Pro & Identidades (`data/ollama_models.json` +
    `data/agent_identities.json`):** primazia das assinaturas Pro Tier 1
    (`Faixa.FLAT_FEE`), frota Ollama local quantizada (modelos `:cloud`
    descontinuados em 2026-11-10), llama.cpp/Hermes Agent e contagem real de
    identidades canônicas Tier 1 / Tier 2.
11. **Memória Agêntica Local & Devin Session Insights (`memory/`,
    `~/.gemini/memoria`, API v3):** volume de notas Markdown, estado git e
    cadência de dreaming do repo `~/.gemini/memoria`, além de ingestão opcional
    de Devin Insights (`--devin-session`, `--devin-insights <json>`,
    `--devin-generate`).

## 4. Diagnóstico Qualitativo por Eixo

Com base estrita nos dados medidos acima, `analisar_sinais_qualitativos`
classifica a postura geral (`OTIMO`, `ESTAVEL`, `ATENCAO`, `CRITICO`) e seis
eixos qualitativos (`entrega_git`, `qualidade_cwv`, `governanca_malha`,
`calibracao_timesfm`, `infra_mcp_pools`, `memoria_dreaming`), separando:

- **Fortalezas observadas** (gates verdes, entrega limpa, S1/memória nominais);
- **Dificuldades e atritos detectados** (working tree sujo, pendências com IDs
  abertos, alertas graves na malha, TimesFM `INSUFFICIENT_HISTORY`, falhas na
  fila/pools, repo de memória dirty ou issues altas Devin);
- **Próximos passos factuais** implicados diretamente pelos atritos medidos.

## 5. Resumo Escrito da Sessão (Prosa Estruturada)

Por padrão, `--markdown` (e o painel de console) entrega:

1. **Painel Quantitativo** (tabela com os 11 eixos);
2. **Diagnostico Qualitativo por Eixo** (postura geral + evidências);
3. **Resumo Escrito da Sessao**, contendo quatro subseções prontas para leitura
   ou colagem em Handoff:
   - `Sintese Executiva` (texto corrido unindo entregas git, performance S1/CWV,
     governança, ledger e postura qualitativa);
   - `Marcos e Entregas` (commits da janela `[Git]` + `--marcos` `[Declarado]`);
   - `Dificuldades e Atritos` (atritos automáticos `[Medido]` + `--dificuldades`
     `[Declarado]`);
   - `Conclusoes e Proximos Passos` (ações derivadas `[Medido]` + `--conclusoes`
     `[Declarado]`).

## 6. Como Executar e Opções CLI

```powershell
# Avaliacao completa (quantitativa + qualitativa + narrativa) em Markdown:
.venv/Scripts/python.exe scripts/ops/avaliar_impacto_sessao.py `
  --pendencias-inicio 1 `
  --horas 12 `
  --marcos "Evolucao da skill de impacto de sessao com prosa e matriz qualitativa" `
  --dificuldades "Lastro diario ancora em D-1 antes das 23:59 e TimesFM aguarda 4 pontos" `
  --conclusoes "Validacao verde; pronto para commit e push no master" `
  --markdown
```

Outras flags úteis:

- `--so-tabela`: emite apenas a tabela quantitativa no modo `--markdown`.
- `--json`: imprime o payload estruturado completo (incluindo `atividade_git`,
  `qualidade_cwv`, `saude_malha`, `qualitativo` e `narrativa`).
- `--forcar-benchmark`: mede capacidade pura do interceptor S1 descartando
  telemetria viva.
- `--devin-session <id>` / `--devin-insights <caminho.json>` /
  `--devin-generate`: integra métricas de sessão Devin Cloud sem bloquear o
  fluxo local caso indisponível.

### Fechamento no Git

Após revisar ou incorporar a saída ao `reports/HANDOFF-*.md`, rode o pre-flight
`scripts/ops/record_gate.py` e finalize o commit com a assinatura canônica do
modelo condutor.
