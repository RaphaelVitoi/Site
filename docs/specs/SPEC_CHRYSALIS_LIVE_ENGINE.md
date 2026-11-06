---
title: "Spec — Chrysalis Live Engine (adapter externo + porte limpo da logica)"
type: technical
status: active
owner: site-governance
updated_at: 2026-11-05
---

# Spec — Chrysalis Live Engine (adapter externo + porte limpo da logica)

**Governanca e autoria:** Raphael Vitoi (Tier 0)  
**Upstream:** `ProjectChrysalis/Chrysalis-Engine` (AGPL-3.0-only, Bun/Hono/pi)  
**Porte:** `engine/chrysalis_bridge.py`, `frontend/src/lib/chrysalis.ts`,
`frontend/src/app/api/sota/chrysalis/route.ts`, skill
`.agents/skills/chrysalis-live-editing/SKILL.md`

## 1. Objetivo no contexto do ecossistema

O `Site` ja possui gravidade de engines matematicas (P0/P1 do
`ENGINE_CAPABILITY_INTEGRATION_PLAN.md`) e pontes externas (`engine/jules_bridge.py`,
`engine/exa_bridge.py`). A Chrysalis preenche a lacuna que falta: **agente que
edita e inspeciona o proprio app em vivo** (texto, controles, viewport, skills
`inspect.js`/`edit.js`, undo por revisao, modos Plan/Accept/Full, `/compact`,
helpers read-only). A integracao aqui e **adaptacao otimizada e declarada**,
nao fork silencioso: logica portada clean-room, servico AGPL externo, e
contrato registrado com proveniencia.

Escada de tratamento (raiz §8.6): o delta e **MELHORAR** (bridge como
adapter reutilizavel, no padrao Jules/Exa) + **FUNDIR** (logica do agente
fundida aos padroes vigentes: dataclass hibrida, urllib, proveniencia §4).
**Nao EXCLUI** nada nem vendored AGPL: excluir o upstream seria perda de
capacidade registrada; copiar AGPL para dentro do Site contaminaria a
licenca do `Site` sem ordem legal do Tier 0.

## 2. Inventario upstream (medido na documentacao anexada e README)

| Vetor | Fato medido | Risco se copiado |
| :--- | :--- | :--- |
| Licenca | AGPL-3.0-only; repo publico | Contaminar o `Site` sem ordem |
| Runtime | Bun, Hono, React, pi-ai/pi-agent-core (MIT), QuickJS-ng sandbox | Dois runtimes sem fronteira |
| Servico | Kit local `http://127.0.0.1:8788`, `lan: false`, `chrysalis api GET /v1/apps` | CID_OPEN + LAN = superficie |
| Workspace | Git, `persona.md`, `commands/`, `notes/`, `AGENTS.md` por app | — |
| Agent | `app_inspect`, `skill_inspect`/`skill_edit`, undo por revisao, Plan/Accept/Full, `/compact`, helpers | Logica portavel |
| Sandbox | `chrysalis-sandbox` GPL-2.0 (files de runtime distribuidos) | Nao portar |

**Arquivo licenca do Site (medido):** no escopo inspecionado nao ha
`LICENSE` no `Site/` (publico no GitHub nao e, por si, open source legal).
Este delta nao cria `LICENSE` nem relicencia nada; a decisao legal e do
Tier 0 (pendencia §7).

## 3. Arquitetura do porte

```text
Site (FastAPI/Next.js, nao-AGPL)
  -> engine/chrysalis_bridge.py      (adapter HTTP, urllib, dataclass hibrida)
  -> frontend/src/lib/chrysalis.ts   (paridade TS: revisao, path, modo, fronteira)
  -> frontend/src/app/api/sota/chrysalis/route.ts
       GET  /api/sota/chrysalis  -> sonda GET /v1/apps (documentado)
       POST /api/sota/chrysalis  -> plano de edicao: path + modo + revisao -> undo_id
  -> servico externo Chrysalis (AGPL, processo separado)  http://127.0.0.1:8788
```

***Consumidor real (antientropia §6.5):*** a rota Next.js e consumida pelo
produto (saude/descoberta do servico + validacao de plano no runtime);
o bridge Python e o counterpart server-side do mesmo contrato. Wiring
FastAPI (`main.py`/`api/`) nao e tocado aqui — nao criar consumidor
fantasma nem editar manifesto sem ordem (pendencia §7).

### 3.1 Logica portada (clean-room, semantica upstream)

1. **Revisao otimista:** `compute_revision = SHA256(conteudo)`; edicao
   exige `expected_revision == current`, senao 409-semantico. Undo ID =
   `SHA256(path + 0x00 + new_content + 0x00 + expected_revision)`.
2. **Undo com recusa:** plano posterior sobrescreve undo anterior —
   `validate_edit` recusa revisao defasada, nunca salva por cima.
3. **Modos:** `plan` (read-only, bloqueia mutacao), `accept` (exige
   `approved=true`), `full` (sob lock serial monocratico).
4. **Path do workspace:** normaliza `\` -> `/`; recusa vazio, absoluto,
   `..`, `:`, dispositivo Windows (`CON`, `COM1`..`LPT9`), final `.`/` `.
5. **Fronteira URL:** apenas loopback HTTP (`127.0.0.1`/`localhost`) ou
   HTTPS; `file:` e HTTP externo rejeitados (mesmo padrao Exa).
6. **`/compact`:** `build_compaction_summary(goal, progress, decisions,
   next_steps, files_read, files_changed)` — mensagens recentes intactas
   e resumo por append (re-compactacao atualiza, nao duplica).
7. **Helpers read-only:** `delegate_readonly` / `delegateReadonly` forca
   Plan e devolve `PLAN_ENFORCED` sem mutar — helper nao toca arquivo
   nem pergunta, por construcao.

### 3.2 Contratos

* `GET /v1/apps` (upstream, documentado): lista apps; parse defensivo
  `apps: [...]` ou `items: [...]`.
* Saia de saude Python `ChrysalisHealth.to_dict()` e Next `GET` carregam
  a proveniencia §4 (ver §5).
* `POST /api/sota/chrysalis {workspace_path, content, new_content,
  expected_revision, mode, approved}` -> `200 {path, revision, undo_id}`
  | `403` (modo) | `400` (path/modo) | `409` (revisao defasada).

## 4. Seguranca e operacao (operadores)

* `CHRYSALIS_SERVICE_URL` opcional (ambiente ou `HKCU`/`HKLM`, nunca `.env`
  versionado — raiz §3/§6.4). Padrao loopback; `lan` permanece `false`
  no `config.yaml` upstream.
* Citra: sem chaves de modelo neste bridge; servico local usa suas
  proprias conexoes (Settings > API connections no upstream) e nao expoe
  ao Site as chaves do workspace.
* Phillips: rede terceiros (clone, curl, MCP) continua sob aprovacao
  exata de mudança (`Accept`) — o agente sempre mostra o delta exato e
  aguarda aprovacao para server settings (p.ex. `lan`), como o upstream.
* Concurrencia: o lock do Site e monocratico (Lei). Dois frontiers nao
  editam o mesmo workspace conectado; concorrencia so com 0% de
  conectividade (worktrees disjuntas).

## 5. Proveniencia §4 (toda resposta)

```text
engine_id: chrysalis-live-engine-adapter
implementation_level: adapter
runtime_used: python-urllib | nextjs-typescript
model_used: ""
intended_model: ""
weights_loaded: false
fallback_used: true quando servico OFFLINE/validacao local; false quando ONLINE provado
assumptions: [chrysalis-service-external-agpl, http-only-boundary]
limitations: [not-a-chrysalis-engine-copy, chat-endpoint-pending-live-probe]
units: [http-status, apps-count, revision-sha256]
```

`adapter` nunca e anunciado como `full-solver` nem como copia da engine.

## 6. Apps operadores sugeridos (Store Chrysalis, criacao futura)

| App | Funcao | Reuso CC |
| :--- | :--- | :--- |
| PMev Solver Studio | Cenarios multiway + proveniencia | `pmev-game-theory-engine` |
| ICM Lab | Simulador ICM/PMev + quiz | `icmQuizGenerator` |
| Article Studio | Ensaios + TTS + voice | `useSotaSpeech` |

## 7. Pendencias (Δcrit — ordem do Tier 0)

1. **Δcrit-nome/fork:** nome do repositorio aberto adaptado e licenca
   legal (o `Site` nao tem `LICENSE` medido). Sem ordem, nao criar repo
   remoto nem adicionar `LICENSE`.
2. **Δcrit-sonda-viva:** endpoint de chat/run do servico so e alegado
   apos sonda viva contra instancia em `127.0.0.1:8788`; hoje e
   `chat-endpoint-pending-live-probe`.
3. **Δcrit-manifesto:** registrar `chrysalis-live-engine-adapter` em
   `data/engine_capabilities.json` e wiring FastAPI — exige ordem; editar
   o manifesto sem paridade TS/Python quebraria P0.1.
4. **Δcrit-gate:** `tests/test_chrysalis_bridge.py` rodado hermetico —
   `12 passed` (guard SOTA verde, 0 erros) em
   `Site/.venv` com `TMPDIR=hermes/cache/scratch` e `--basetemp` isolado
   (o `conftest.py` falha por `PermissionError WinError 5` no
   `Temp/pytest-of-rapha`, causa de ambiente, nao de contrato).
   Suite integral e typecheck **nao rodados**; gate de 5 fases roda
   apenas no commit (§1).
5. **Sem commit/push** (raiz §3): trabalho em staged local, pronto para
   `git add` sob ordem.
