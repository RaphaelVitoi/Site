---
name: data-analyst-sota
description: "Analista de dados SOTA local — equivalente ao Data Analyst Agent (DANA) do Devin Cloud, executado na malha propria com MCPs de banco, BigQuery, TimesFM e notebooks. Use para queries SQL, analise de dados, metricas, series temporais e visualizacoes sem custo de nuvem e sem sair do ecossistema."
argument-hint: "[pergunta de dados ou escopo da analise]"
allowed-tools:
  - read
  - grep
  - glob
  - exec
triggers:
  - user
  - model
metadata:
  hermes:
    tags: ["data", "analyst", "dana", "sql", "bigquery", "visualization"]
    category: data-science
    related_skills: ["mcp-toolbox-database", "timesfm-forecasting", "poker-pmev-knowledge-engine", "devin-managed-ops"]
---

# Data Analyst SOTA — o DANA local do ecossistema

Referencia: docs.devin.ai/work-with-devin/data-analyst-agent (DANA). O DANA
exige plano pago e envia dados para a nuvem Devin. **Este skill entrega a
mesma capacidade na malha local**: custo zero, dados privados, auditavel —
e sem o teto de plano.

## 0. Decisor: DANA cloud vs. malha local

| Necessidade | Rota |
| :--- | :--- |
| Pergunta sobre dados do Site/ecossistema (SQLite locais, FTS5, telemetria) | **sempre local** (este skill) |
| BigQuery / dados GCP | local via skills `bigquery-*` + MCP Toolbox |
| Postgres/Supabase/Neon | local via `mcp-server-neon`, `supabase*` MCPs |
| Forecasting de series temporais | local via `timesfm-forecasting` (zero-shot, local) |
| DANA cloud | SOMENTE se o dado ja vive na org Devin e o plano for pago — caso contrario nunca |

Regra de ouro: **dado que pode ficar local, fica local.** O DANA existe
para quem nao tem malha; voce tem.

## 1. Fontes de dados disponiveis (medidas na sessao)

- `mcp-toolbox-for-databases` (Gateway :8933) — SQLite `discovery_tree.db`,
  `dream_history.db` e qualquer fonte declarada em `config/tools.yaml`.
  Runbook: skill `mcp-toolbox-database`.
- `mcp-server-neon`, `supabase`, `supabase-write` — Postgres/Supabase.
- Skills `bigquery-*` (~20 em `~/.copilot/skills`) — analytics GCP completo.
- `poker-pmev-knowledge-engine` — corpus Poker/PMev indexado SQLite FTS5.
- `memory/notepad_memory.py`, `memory_rag.py` — memoria agentica consultavel.
- `data/task_queue.db`, `reports/agent-calibration/*.jsonl` — telemetria
  operacional do proprio ecossistema.

## 2. Disciplina de prompt (herdada do DANA, adaptada)

O DANA falha com prompts vagos — a mesma régua vale aqui:

- **Metrica especifica:** "7-day active users" → definir exatamente o que
  conta como ativo. Nunca "usuarios ativos" sem definicao.
- **Periodo explicito:** sempre declarar range; relativo assume UTC.
- **Formato de saida:** tabela, grafico (matplotlib/seaborn local) ou
  resumo — pedir explicitamente.
- **Logica de negocio upfront:** churn, retencao, LTV — definir a formula
  no prompt para evitar ambiguidade.
- **Comparacao obrigatoria:** periodo atual vs. anterior ou vs. mesmo
  periodo do ano passado; desvio >15% e sinal, nao ruido.
- **Validar o SQL:** sempre mostrar a query usada — o revisor humano
  confere joins/filtros/agregacoes.

## 3. Fluxo de execucao

1. **Classificar a pergunta** — lookup, agregacao, join cross-source,
   serie temporal, anomalia, ou multi-step.
2. **Escolher a fonte** — §1; preferir a mais proxima do dado (SQLite
   local > Neon > Supabase > BigQuery > payload externo).
3. **Declarar a query** — SQL parametrizado, nunca string concatenada
   com entrada do usuario (§3 governanca raiz: consulta parametrizada).
4. **Executar** — via MCP da fonte ou `.venv/Scripts/python.exe` +
   sqlite3/psycopg conforme o caso.
5. **Visualizar se pedido** — matplotlib/seaborn local; TimesFM para
   forecast quando a pergunta for preditiva.
6. **Persistir aprendizado** — schema novo, regra de negocio descoberta,
   caveat de qualidade de dado → nota em `Site/memory/` (equivalente
   local do "Database Knowledge" do DANA) ou skill update.

## 4. Saida padrao (formato DANA adaptado)

```
## Analise
<resposta em linguagem simples>

## Query
```sql
<sql exato usado>
```

## Numeros-chave
<metricas principais>

## Insights
<padroes, anomalias, desvios vs. comparacao>
```

## 5. Proibicoes

- Nunca enviar dados privados do ecossistema para API externa de analise
  sem autorizacao do Tier 0 — o argumento de venda do DANA ("seus dados
  vao para a nuvem") e aqui um motivo para NAO usa-lo.
- Nunca rodar SQL destrutivo (DROP/TRUNCATE/DELETE sem WHERE) — skill
  `accidental-data-loss-prevention` e piso de seguranca.
- Nao criar grafico sem dados medidos — visualizacao de placeholder e
  proibida (§8 governanca: evidencia antes de alegacao).
