---
title: "Digest Devin Release Notes — sinais estrategicos para o ecossistema local"
type: memory
status: active
created_at: 2026-11-13
source: "docs.devin.ai/release-notes/overview (fev–nov/2026)"
tags: [devin, release-notes, strategy, skills, mcp, api]
---

# Digest de Release Notes Devin — o que muda para nos

Curadoria dos ~9 meses de release notes. Regra: so entra o que altera
decisao local. UI polish, Slack/Teams formatting e fixes menores ficam de
fora por definicao.

## Sinais estruturais (mudam arquitetura)

1. **Playbooks → Skills** (23/out): playbooks viram skills 1:1; API de
   playbooks le/escreve skills; contas novas pos-24/out nascem sem
   playbooks. **Implicacao:** `devin_playbook_manage` e `devin_knowledge_manage`
   estao em migracao para skills — preferir o modelo skill em tudo que
   criarmos do lado Devin. Nossas skills locais ja estao no formato alvo.
2. **Knowledge → Skills** (18/set): notas de knowledge viram skills num
   plugin `knowledge` por escopo; migration automatica, rolling. A aba
   Knowledge fica read-only apos migracao. **Implicacao:** o conceito
   "Database Knowledge" do DANA e afins migra para skills tambem —
   `data-analyst-sota` ja e skill, esta no lado certo.
3. **Plugins** = bundles de skills+rules+hooks+MCPs instalaveis com
   governanca (required/optional/forbidden por camada). **Implicacao:**
   e o equivalente Devin do nosso `.agents/skills/` + nucleo MCP —
   quando precisarmos distribuir um pacote, o formato plugin e a rota.
4. **MCP tool permissions** (12/nov): cada tool de cada MCP pode ser
   Allow / Needs approval / Block no Customize; enterprise limita por org.
   **Implicacao:** granularidade por tool que nosso nucleo ainda nao tem
   — candidato futuro se quisermos ACL por tool no `sincronizar_nucleo`.

## Sinais de API (afetam scripts locais)

5. **v3 API oficial** (fev/2026) — ja usamos (`devin_session_insights.py`).
6. **PATs GA** — nosso `DEVIN_API_TOKEN` e o caminho certo; service users
   so valem a pena para automacao compartilhada/CI.
7. **`idempotency_key` em create session** — repeticao retorna a sessao
   original; 409 se em progresso. Usar em qualquer criacao automatica
   via `devin-managed-ops` para nao duplicar sessao em retry.
8. **`memory_enabled: false` no create** — desliga memory por sessao e
   filhas. Usar para sessoes de automacao/schedule onde memory pessoal
   nao deve ser lida/escrita (a doc de Memory ja dizia que automacoes
   nao tocam memory drive; agora ha flag explicita).
9. **Session size = ACU-only** (15/jul) — o eixo 8 do avaliador reporta
   size; interpretar como consumo ACU, nao como volume de trabalho.
   `acus_consumed: 0.0` em sessao Free e consistente com isso.
10. **Devin Review auto-fix pre-posting** (30/set): findings de Review em
    PR de sessao ativa vao para a sessao primeiro; so os nao-resolvidos
    viram comentarios. Menos ruido de review — relevante se monitorarmos
    PRs via `devin-managed-ops`.
11. **Resume window 14 dias** (9/out, era 30) — sessoes dormem e morrem
    para resume em 2 semanas; trabalho longo deve persistir em commits,
    nao em estado de sessao.

## Sinais de produto (referencia, nao acao)

- **Devin Coach** (14/ago): sugestoes de prompt no input — o nosso
  `improved_prompt` do Session Insights cobre o pos-sessao; o Coach e o
  equivalente pre-envio, so existe na UI.
- **Voice live model** (16/set): voice mode melhorou; continua sendo
  superficie humana (§0 de `devin-managed-ops`).
- **Devin Oncall GA** (19/out): responders de PagerDuty/incidentes —
  fora do escopo solo atual; registrar para quando houver integracao.
- **SWE-2 research preview** (21/set): model picker com effort
  Medium/High/Max; nosso harness ja roda SWE-2 Flash — o preview e a
  mesma familia.
- **57+ MCPs hosted no marketplace** + OAuth discovery via 401 — nosso
  nucleo compartilhado ja cobre os MCPs que usamos; marketplace so
  importa se adotarmos conector novo (entra pelo catalogo, nao por host).

## O que NAO mudou (confirmacao)

- Session Insights segue sob demanda com `generate` endpoint — nossa
  integracao esta alinhada.
- Memory dreaming nightly existe e pode ser desligado por org — nosso
  "dreaming debt" local e analogia deliberada, nao paridade forcada.
- ACU continua sendo a moeda; nada no release notes torna sessao Devin
  gratuita — reforca o decisor local-first dos skills `*-sota`.
