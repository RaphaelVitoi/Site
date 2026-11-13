---
name: devin-managed-ops
description: "Orquestracao avancada do Devin Cloud: managed Devins paralelos, analise de sessoes, ciclo de vida de skills, gestao de knowledge e schedules, via UI ou Devin MCP. Use quando a tarefa exigir fan-out de sessoes Devin, aprendizado pos-sessao em escala, ou automacao recorrente no Devin."
argument-hint: "[capacidade: parallel|analyze|skill|knowledge|schedule|mcp]"
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
    tags: ["devin", "orchestration", "managed-devins", "knowledge", "schedules", "mcp"]
    category: devops
    related_skills: ["devin-session-insights", "devin-session-supervision", "devin-desktop-customizations", "session-impact-evaluator", "site-session-handoff", "sota-tactical-orchestrator-nanostack"]
---

# Devin Managed Ops — capacidades avancadas adaptadas ao CHICO

Referencia: docs.devin.ai/work-with-devin/advanced-capabilities. Cada
capacidade Devin tem um equivalente ou decisor local no ecossistema — o skill
existe para escolher a rota certa, nao para usar Devin por default.

## 0. Modalidades de conduzir uma sessao Devin

Quatro portas de entrada, custos e alcances diferentes — escolher a porta
faz parte da otimizacao, nao e detalhe de UI:

| Modalidade | Onde | Custo | Melhor para |
| :--- | :--- | :--- | :--- |
| **Voice mode** | botao de waveform na home/session (mic do SO) | mesmo ACU da sessao | ideacao hands-free, pressure-test de abordagem, handoff verbal; conversa fica no historico da sessao |
| **UI webapp/Desktop** | app.devin.ai / Devin Desktop | mesmo ACU | sessao interativa rica, revisar diffs, aprovar testes |
| **Devin CLI** | `devin` no terminal | mesma conta | `devin --cloud`, `/handoff` local↔cloud, sessoes no fluxo do terminal |
| **Devin MCP / API v3** | tools `devin_*` / REST | idem, mas **programatico** | fan-out, schedules, knowledge/skills CRUD, insights em escala — unico caminho auditavel por script |

Regras:

- Voice e UI sao **superficies humanas** — nada nelas e reproduzivel por
  automacao. Todo procedimento que precisar rodar sem voce presente deve
  descer para MCP/API (§6) ou CLI.
- Voice mode nao muda o modelo de custo: ACU corre igual. Serve para
  pensar alto, nao para economizar.
- Transcricao da chamada vira historico da sessao — vale como insumo de
  `devin-session-insights` depois, como qualquer mensagem.

## 1. Managed Devins (fan-out paralelo)

Devin coordena sessoes-filhas, cada uma em VM isolada, com prompt, skills,
tags e **ACU limit** proprios. O coordenador scopa, monitora, resolve
conflitos e consolida.

**Quando fan-out Devin e a rota certa:**

- Trabalho que atravessa multiplos repos/VMs e se beneficia de isolamento
  total (migracoes em massa, cobertura de testes em N modulos, research
  paralelo independente).
- O prompt de cada filho e autonomo o suficiente para nao precisar de
  coordenacao fina no meio.

**Quando NAO fan-out (rotas locais equivalentes):**

| Necessidade | Rota CHICO equivalente |
| :--- | :--- |
| Subtarefa read-only de exploracao | `subagent_explore` (custo zero, contexto isolado) |
| Subtarefa com escrita no mesmo repo | `subagent_general` — paralelo real, sem VM extra |
| Orquestracao deterministica local | `sota-tactical-orchestrator-nanostack` (/think→/ship) |
| Pesquisa/nuvem assincrona | Trio Tier 2: Jules / Exa / Stitch (skills proprios) |
| Lint/testes hermeticos massivos | Tier 6 local (Ollama/llama.cpp) — custo zero |

**Regras de ouro do fan-out:**

- Todo filho nasce com **ACU limit explicito** — sem teto, uma sessao
  travada queima cota indefinidamente.
- Work packages devem ser disjuntos (sem overlap de arquivos) — o
  coordenador resolve conflito, mas conflito evitado e mais barato.
- Fan-out por **pacote de trabalho**, nao por arquivo — 50 arquivos
  independentes = poucos filhos, nao 50.
- Resultado consolidado volta pelo fluxo normal: handoff +
  `session-impact-evaluator` por sessao relevante.

## 2. Analisar sessoes (session outcomes)

Duas rotas, em ordem de custo:

1. **Session Insights (preferida, gratis):** use o skill
   `devin-session-insights` — API v3, painel padrao, issues/timeline/
   suggested_prompt estruturados.
2. **"Investigate with Devin" / analise livre:** quando o insight
   automatico nao basta — pergunte de forma especifica ("por que escolheu
   essa abordagem?", "onde gastou os 42 ACUs?"). Especificidade e a
   alavanca: "o que aconteceu?" produz ruido; "quais dead ends e qual
   prompt os evitaria?" produz skill.

Saida obrigatoria da analise: ou vira linha no HANDOFF, ou vira insumo
para skill novo/atualizado (§3), ou vira pendencia em `record_gate`.
Analise que nao gera nenhuma das tres e desperdicio.

## 3. Criar/melhorar skills a partir de sessoes

O ciclo canonico: **sessao bem-sucedida → skill reutilizavel**.

- Multiplas sessoes com o mesmo padrao = candidatas fortes. Forneca 2+
  exemplos quando pedir ao Devin para destilar.
- Skill novo mora em `.agents/skills/<nome>/SKILL.md` (repo) — nunca so
  na Customize page, a menos que deva valer para toda a org.
- Skill melhorado: aponte as sessoes onde falhou + as que sucederam;
  diff de comportamento e o insumo, nao opiniao.
- **Revisao humana obrigatoria antes de adotar** — o Devin propoe o
  SKILL.md; a governanca do Site decide (Target Lock, portoes, assinaturas).
- Todo skill novo deve passar pelo mesmo criterio dos existentes:
  description que dispare auto-invocacao correta + frontmatter completo
  (`allowed-tools` quando couber, `triggers` quando houver efeito
  colateral externo).

## 4. Gerenciar knowledge

> **Nota de migracao (release notes 18/set e 23/out/2026):** Knowledge e
> Playbooks estao sendo migrados para **Skills** no Devin — notas viram
> skills num plugin `knowledge`, playbooks viram skills 1:1, e contas
> novas pos-24/out nascem sem playbooks. `devin_knowledge_manage` e
> `devin_playbook_manage` seguem funcionando durante a transicao, mas
> **todo artefato novo deve ser criado como skill**, nao como nota ou
> playbook. Digesto completo: `Site/memory/devin-release-digest-2026-11.md`.

Devin mantem knowledge notes por org (dedup, consolidacao, criacao a
partir do codebase). Equivalente local: `Site/memory/**`,
`~/.gemini/memoria` e as regras em `CLAUDE.md`/`AGENTS.md`.

**Regra de ouro compartilhada (local e nuvem):** knowledge/skill
enganosa degrada TODAS as sessoes que a recuperam — a aba "Misleading
Knowledge" do Session Insights e o detector. Periodicamente:

- Deduplicar antes de consolidar (ruido primeiro).
- Resolver conflitos explicitamente (duas fontes dizendo coisas
  opostas e pior que nenhuma).
- Lembrar que `~/.gemini` proibe forks de governanca — o mesmo criterio
  se aplica a knowledge entries duplicadas.

## 5. Schedules (sessoes recorrentes)

Devin agenda sessoes por cron. Equivalente local medido no Site:
`autopoietic_daily_cycle.py`, `Register-AgentCalibrationDailyTask.ps1`,
tarefas em `core/task_queue.py`.

**Decisor:** se a recorrencia precisa de LLM em VM/cloud e artefatos
fora do repo → schedule Devin. Se e rotina deterministica/local →
mantenha no agendador local (mais barato, auditavel, versionado).

Cuidado: sessoes de automacao **nao leem nem escrevem memory** do Devin
(segundo a doc de Memory) — schedules nao alimentam o memory drive.

## 6. Devin MCP (controle programatico)

**Status 2026-11-13: registrado na fonte única.** O servidor `devin`
(`https://mcp.devin.ai/mcp`, PAT + `X-Org-Id` via `${DEVIN_API_TOKEN}`/
`${DEVIN_ORG_ID}` do HKCU) foi promovido a `mcp.compartilhados` em
`nucleo_compartilhado.json` e renderizado para todos os hospedeiros pelo
`sincronizar_nucleo.py --aplicar` (11 alvos, contrato 11/11 verde). Também
consta em `%APPDATA%/devin/mcp_config.json` (Devin Desktop, config própria
do hospedeiro — sem renderer no núcleo).

O Devin MCP expoe tudo acima como tools — o initialize validado retorna um
toolset maior que o documentado: `devin_session_create/interact/search/
events`, `devin_session_insights`, `devin_playbook_manage`,
`devin_knowledge_manage`, `devin_schedule_manage`, `devin_automation_manage`,
`devin_review_manage`, `devin_mcp_server_manage`, `devin_code_scan_manage`,
`devin_user_list`, `devin_list_integrations`, `devin_find_setting` e as
ferramentas de wiki (`read_wiki_*`, `ask_wiki_question`,
`list_available_repos`). É a rota para orquestrar o Devin **de dentro de
outro agente** (ex.: um condutor Tier 1 disparando frota Devin).

- Setup e tool reference: docs.devin.ai/work-with-devin/devin-mcp.
- Antes de configurar um novo MCP no ecossistema, respeitar a fonte unica
  de MCPs do `~/.gemini/CLAUDE.md` §7 — não registrar copia por condutor.
- Permissoes espelham as features: `Use Devin Sessions`, `Manage
  Playbooks` (skills), `Manage Knowledge`, `Manage Schedules`.

## Proibicoes

- Nao disparar fan-out ou schedules sem ACU/teto de custo definido.
- Nao criar skills na org do Devin sem espelho local em `.agents/skills/`
  quando o procedimento for reutilizavel no Site — duas fontes de verdade
  divergem (licao dos forks de governanca).
- Nao usar managed Devins para trabalho que subagent local resolve —
  VM isolada e ACU sao para isolamento real, nao para paralelismo trivial.
