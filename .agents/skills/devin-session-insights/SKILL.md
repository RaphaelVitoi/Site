---
name: devin-session-insights
description: "Integra Session Insights do Devin Cloud (API v3) ao painel de impacto de sessao. Use quando a sessao avaliada foi executada no Devin Cloud/Desktop, ou quando o usuario pedir analise pos-sessao de uma sessao Devin (devin-...)."
argument-hint: "[devin-session-id ou 'ultimo']"
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
    tags: ["devin", "insights", "session", "impact", "handoff"]
    category: devops
    related_skills: ["session-impact-evaluator", "site-session-handoff", "devin-managed-ops", "devin-session-supervision"]
---

# Devin Session Insights — ponte API v3 ↔ painel de impacto

Procedimento para ingerir analise pos-sessao do Devin Cloud e correlaciona-la
ao `session-impact-evaluator`. Referencia: docs.devin.ai/product-guides/
session-insights e /product-guides/memory.

## Quando usar

- A sessao de trabalho que esta sendo encerrada rodou no **Devin Cloud/Desktop**
  (sessao `devin-...`), e nao num harness local.
- O usuario pede explicitamente analise de uma sessao Devin pelo ID ou URL.

## Credenciais (uma vez por maquina)

```powershell
.\scripts\ops\Set-EcosystemCredential.ps1 -Nome DEVIN_API_TOKEN   # service user ou PAT
.\scripts\ops\Set-EcosystemCredential.ps1 -Nome DEVIN_ORG_ID      # org-...
```

Permissoes do token: `ViewOrgSessions` (leitura) e `ManageOrgSessions`
(apenas se for disparar `--generate`). Nunca cole o token no chat.

## Procedimento

1. **Identificar a sessao Devin.** O ID vem da URL
   `https://app.devin.ai/sessions/devin-...` ou do titulo da sessao.
   Sem ID explicito, pergunte ao usuario — nao adivinhe.

2. **Consultar insights (fetch live):**

   ```powershell
   .venv\Scripts\python.exe scripts\ops\devin_session_insights.py `
     --session devin-<id> --generate --markdown
   ```

   `--generate` dispara a analise se ainda nao existir (leva ~1 min; o script
   faz polling ate `analysis_status` sair de `started`). Sem `--generate`,
   apenas le o que ja existe (L/XL geram automaticamente no teardown).

3. **Alternativa offline:** se ja houver um JSON exportado, use
   `--devin-insights <caminho.json>` no avaliador (passo 4).

4. **Incorporar ao painel de impacto** (obrigatorio no handoff de sessao
   Devin):

   ```powershell
   .venv\Scripts\python.exe scripts\ops\avaliar_impacto_sessao.py `
     --pendencias-inicio <N> --markdown --devin-session devin-<id>
   ```

   ou, com payload salvo:

   ```powershell
   .venv\Scripts\python.exe scripts\ops\avaliar_impacto_sessao.py `
     --pendencias-inicio <N> --markdown --devin-insights <caminho.json>
   ```

   O eixo 8 imprime `Memoria Agentica Local` sempre e `Devin Session
   Insights` quando ha dados. Copie as linhas geradas para a secao de
   Resultados do `reports/HANDOFF-*.md`.

## Interpretacao (régua do ecossistema)

- **Session size L/XL** = flag de sessao nao-saudavel no padrao Devin —
  correlacione com escopo amplo e proponha decomposicao no handoff.
- **ACU alto + poucas mensagens** = agente errou e se recuperou sozinho;
  cheque `issues` e `timeline` do JSON para a causa raiz.
- **Muitas mensagens + ACU baixo** = correcao manual frequente; o
  `suggested_prompt` do payload e a correcao pronta — registre no handoff.
- **`skills_enganosos` > 0** = knowledge/skill do Devin induziu erro —
  equivalente local: revisar o SKILL.md correspondente em `.agents/skills/`
  ou `.devin/skills/` (mesma logica do "Misleading Knowledge" da doc).
- **`action_items` tipo `repo_config`/`machine_setup`** = viram candidatos
  a skill novo ou a regra em `CLAUDE.md` — nunca ficam so no relatorio.

## Paridade Memory ↔ memoria local

O eixo 8 mede `Site/memory/**/*.md` + `~/.gemini/memoria` (repo git) como
análogo do Devin Memory/Dreaming. `dirty files` + `ultimo commit` do repo
`~/.gemini/memoria` sao o proxy local de "divida de dreaming": se velho,
houve notas sem consolidacao — registrar como pendencia no handoff.

## Proibicoes

- Nunca imprima, logue ou commite `DEVIN_API_TOKEN`.
- Nao trate falha do eixo Devin como falha do painel: `nao_configurado` e
  `indisponivel` sao estados legitimos (eixo externo, best-effort).
- Nao crie skills a partir de `suggested_prompt` sem revisao humana —
  o prompt melhorado e insumo, nao decisao.
