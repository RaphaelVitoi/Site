---
name: chrysalis-live-editing
description: "Use ao integrar, operar ou revisar a Chrysalis Live Engine (agente que edita apps em vivo, skills inspect/edit com revisao, undo e modos Plan/Accept/Full) no Site/PMev."
metadata:
  hermes:
    tags: ['chrysalis', 'live-editing', 'agent', 'skills']
    category: software-development
    related_skills: ['pmev-game-theory-engine', 'google-jules-cloud']
---

# SKILL: Chrysalis Live Engine — agente que edita o app enquanto ele esta aberto

## 1. Kernels do upstream (o que se porta, e o que nao)

Upstream: `ProjectChrysalis/Chrysalis-Engine` (AGPL-3.0-only, Bun + Hono +
pi-agent-core + QuickJS sandbox). A engine AGPL permanece **servico externo**;
o Site fala com ela so via HTTP. Esta skill porta a **logica** (clean-room),
nao a expressao AGPL. Implementacao canonica: `engine/chrysalis_bridge.py`,
`frontend/src/lib/chrysalis.ts`, `frontend/src/app/api/sota/chrysalis/route.ts`.
Spec: `docs/specs/SPEC_CHRYSALIS_LIVE_ENGINE.md`.

| Kernel upstream | Porte no ecossistema |
| :--- | :--- |
| Agent edita workspace git em vivo; app atualiza sem perder estado | Bridge HTTP + validacao offline de plano (revisao/undo) |
| `app_inspect` (texto/controles/viewport, screenshot quando cabivel) | `GET /api/sota/chrysalis` (sonda `GET /v1/apps`) + skill `inspect` declarativo |
| Skills `.agents/skills/<name>/SKILL.md` + `inspect.js`/`edit.js` | Esta skill + `validate_workspace_path` / `EditPlan` (revisao obrigatoria) |
| Undo com revisao: stale record e recusado; commits so com arquivos alterados | `validate_edit`: `expected_revision != current` -> 409-semantico; undo ID = SHA256(plano x revisao) |
| Modos Plan (read-only) / Accept (permissao) / Full (sem perguntar) | `enforce_mode`/`enforceMode`: Plan bloqueia mutacao; Accept exige `approved=true` |
| Shell no browser (sandbox), undo total, `/compact`, helpers read-only | Shell fica no servico externo; `/compact` -> `build_compaction_summary`; helpers -> Plan forcado |

## 2. Regras operacionais (obrigatorias)

1. **Fronteira loopback:** `CHRYSALIS_SERVICE_URL` (padrao `http://127.0.0.1:8788`)
   aceita apenas loopback HTTP ou HTTPS. `file:` e HTTP externo sao rejeitados.
   Nunca ampliar `lan`/`allowedHosts`/CORS/CDP para expor a engine (raiz §3).
2. **Sem copia AGPL:** nada do repositorio AGPL e vendored para `Site/`.
   Fork integral, se um dia ordenado pelo Tier 0, e repositorio separado (AGPL
   preservado), nao pasta dentro do Site.
3. **Entrada impossivel e rejeitada:** dispositivo Windows, `:`, `.`/` ` final,
   `..`, e revisao defasada sao recusados com erro tipado — nunca normalizados
   em silencio (ENGINE plan §8, invariante 8).
4. **Modo antes de mutar:** Plan e read-only por construcao; Accept exige
   aprovacao explicita; Full segue sob lock monocratico (Lei de Concorrencia).
5. **Proveniencia §4:** toda resposta carrega `engine_id`,
   `implementation_level: adapter`, `fallback_used`, `limitations`
   (`not-a-chrysalis-engine-copy`, `chat-endpoint-pending-live-probe`).
   `adapter` nunca e anunciado como `full-solver`.

## 3. Workspace e apps PMev sugeridos

Layout upstream — `persona.md` (regras permanentes), `commands/` (`/review`),
`notes/` (planos/specs; primeira linha diz o topico), `AGENTS.md` por app —
mapeia para a taxonomia do Site: `reports/` (registro), `docs/` (permanente),
`.agents/skills/` (procedimento). Apps candidatos a Store Chrysalis:

* **PMev Solver Studio** — notebook de cenarios multiway com proveniencia.
* **ICM Lab** — simulador ICM/PMev com quiz (paridade com `icmQuizGenerator`).
* **Article Studio** — editor de artigos da biblioteca com TTS (`useSotaSpeech`).

Nenhum app e criado por esta skill: ela declara o contrato; a criacao segue
a escada (corrigir > melhorar > fundir > arquivar > excluir) e o portao §1.

## 4. Pendencias (nao ocultas)

* Endpoint de chat/run do servico **sem sonda viva** — nao alegar delegacao.
* Registro em `data/engine_capabilities.json` e wiring FastAPI **pendentes**
  de ordem do Tier 0 (manifestar nao e editar manifesto).
* Fork remoto (`RaphaelVitoi/...`) e nome/licenca **pendentes** de ordem.
