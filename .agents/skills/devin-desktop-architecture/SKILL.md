---
name: devin-desktop-architecture
description: "Arquitetura do Devin Desktop — ACP (Agent Client Protocol), Agent Command Center, Fast Context (SWE-grep) e delegacao local→cloud. Use para entender como agentes externos/plataforma se conectam ao Desktop, ou quando uma capacidade do Desktop parecer faltar localmente."
argument-hint: "[contexto: acp|command-center|fast-context|delegation]"
allowed-tools:
  - read
  - grep
  - exec
triggers:
  - user
  - model
metadata:
  hermes:
    tags: ["devin", "desktop", "acp", "fast-context", "architecture", "swe-grep"]
    category: devops
    related_skills: ["devin-managed-ops", "devin-desktop-customizations", "code-scan-sota"]
---

# Devin Desktop — arquitetura medida contra o ecossistema local

Referencia: docs.devin.ai/desktop/{acp-custom,devin,agent-command-center,
context-awareness/fast-context}. Quatro pecas; tres ja tem equivalente
local exato — o trabalho e saber disso antes de reinventar.

## 1. ACP — Agent Client Protocol

Devin Desktop hospeda **agentes externos** como subprocessos locais,
falando JSON-RPC sobre stdio. Metodo minimo: `initialize`,
`session/new`, `session/prompt`, `session/cancel`; updates via
`session/update` (chunks, tool_call, plan); `session/request_permission`
para aprovacao; `elicitation/create` para perguntas estruturadas.
Limitacoes medidas pela doc: sem session modes (usar session config
option `select` id `"mode"`), sem terminal capability do cliente
(agente roda subprocessos proprios), fs via client `readTextFile`/
`writeTextFile`.

**Decisor:** ACP e a porta para colocar um agente custom DENTRO do
Desktop. Nao temos caso de uso — nossos agentes ja rodam nos proprios
harnesses com mais ferramentas. **So considerar se** surgir necessidade
de um agente nicho aparecendo na UI unificada; o custo e implementar o
subset JSON-RPC acima com libs oficiais (Rust/TS/Python/Kotlin/Java).
Registry local + `Reload ACP Connections` para iterar sem restart.

## 2. Agent Command Center

View unificada de agentes locais (editor) + cloud (VMs Devin) no Desktop
2.0: add-to-chat (`Cmd+L`), duplicate session, rules no @-menu, mensagens
em fila editaveis, sessoes travadas durante run, notificacao nativa OS
unica por sessao (`devin.agentNotifications`).

**Equivalente local:** nao ha — e superficie de produto. O que ela faz
pelas sessoes (status, fila, notificacao) nosso ecossistema cobre por
`record_gate` + `session-impact-evaluator` + handoff docs. Nenhuma acao.

## 3. Fast Context = nosso `code_search`

A doc descreve: subagente especializado que faz retrieval com
**grep/read/glob em paralelo**, ate 8 tool calls por turno, max 4 turnos,
modelos SWE-grep/SWE-grep-mini treinados para isso — "delega retrieval
ao subagente para conservar contexto do agente principal".

**Isso e literalmente a tool `code_search` deste harness** ("search
subagent... runs parallel grep and readfile calls over multiple turns")
e o profile `subagent_explore`. Validacao: a arquitetura que a Cognition
escolheu para o Desktop e a que ja usamos — nao ha nada a portar.
Unica licao: manter queries de busca especificas (eles tambem limitam o
toolset do subagente a grep/read/glob — exatamente nosso profile).

## 4. Devin in Devin Desktop (delegacao local→cloud)

- Cloud Devin incluído nos planos self-serve do Desktop; consome a
  **mesma quota** do Desktop. $50 credits ao conectar GitHub.
- Fluxo: trabalhar plano com agente local → delegar implementacao ao
  cloud → revisar PR no editor sem sair.
- Sessions sincronizam com webapp (send queue server-side, participant
  names, copy link); queda de conexao → banner "Remote ACP disconnected".

**Equivalente:** `devin-managed-ops` ja cobre — fan-out via MCP/API,
steering via `devin-session-supervision`, analise via
`devin-session-insights`. O "delegate" do Desktop e a versao UI do
mesmo fluxo; a nossa e programatica e portanto mais barata de operar em
escala.

## 5. Proibicoes

- Nao implementar agente ACP "para testar" — superficie sem caso de uso.
- Nao confundir Fast Context com busca semantica/embeddings — e grep
  inteligente paralelo; nosso code_search ja e isso.
- Nao assumir que sessoes Desktop e webapp sao estados separados —
  sao a mesma sessao (fila server-side); insumo correto para
  `devin-session-insights`.
