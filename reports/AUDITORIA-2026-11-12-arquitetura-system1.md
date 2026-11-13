---
id: auditoria-2026-11-12-arquitetura-system1
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor:
  "Devin (SWE-2 Flash) [Tier 1] -- sessao
  devin-swe2-site-2026-11-12-s1-remediacao"
criado_em: "2026-11-12T20:00:00-03:00"
atualizado_em: "2026-11-12T20:00:00-03:00"
commit: HEAD
title: "Auditoria — arquitetura System-1 (Laya → Gemini Decision 1)"
type: audit
status: active
owner: devin-swe2-flash
updated_at: 2026-11-12
verificado:
  - "Suíte focada System-1/System-2: 132 testes verdes no momento da auditoria"
  - "Cascata decide_s1: Laya local -> gemini-decision-1 com fallback honesto"
  - "Proveniência §4 presente em laya_bridge e decision_pool (HMAC, sem segredo
    em claro)"
  - "Invariante: System-1 sem autoridade sobre custo/modelo (routing_policy)"
nao_verificado:
  - "Inferência remota real do microserviço Laya :8192 (serviço fora do ar na
    medição)"
  - "Comportamento sob carga concorrente de predict_batch"
---

# Auditoria — arquitetura System-1 do ecossistema

**Data:** 2026-11-12 · **Condutor:** Devin (SWE-2 Flash) [Tier 1] **Escopo:**
eixo System-1 — decisões baratas tipadas (noul/choice/score) e o sinal de
intenção que alimenta roteamento, prior de ruína (Etapa 0 PMev) e adaptação de
solvers. System-2 (`llm/system2_local.py`) coberto como par.

## 1. Mapa da arquitetura

```
                 ┌─────────────────────────────────────────────────┐
   texto/estado  │  llm/laya_bridge.py                             │
   ────────────► │  ├─ LayaRouter.route()      primitive, zero-dl  │
                 │  ├─ laya_predict/predict_batch  trained, GPU-gated│
                 │  ├─ HeuristicRouter          fallback sem deps   │
                 │  └─ ruin_priority_*          Etapa 0 PMev        │
                 └───────┬───────────────────────┬─────────────────┘
                         │ metadados_s1          │ DecisionResult
        ┌────────────────┼───────────────────────┼──────────────────┐
        ▼                ▼                       ▼                  ▼
 core/arbitrator   llm/orchestrator      engine/llm_api.py   api/v1/handlers.py
 (metadata         (compor_advisory_s1   (advisory em todo    (/ask-oracle, tree,
  intencao_s1)      em toda task LLM)     call_* provider)    pluribus, deepstack)
        │                │                       │                  │
        └────────────────┴───────────┬───────────┴──────────────────┘
                                     ▼
              llm/gemini_decisions.py::decide_s1  (cascata)
                Laya local ──fallback_used──► Gemini Decision 1
                multimodal/prefer_cloud ──► direto nuvem
                                     │
                                     ▼
              llm/decision_pool.py (DECISION_API_1..9 + fallback
              GEMINI_API_KEY; round-robin, breaker 401/403/429/5xx,
              quota-por-projeto no 429, telemetria sha8)

   engine/stitch_bridge.py::classify_stitch_operation ──► decide_s1
   llm/laya_solver_adapter.py ──► modula 16 solvers/frameworks
   frontend: /api/sota/laya/{predict,solve,status} ──► :8192 microserviço
             (scripts/ops/homologar_laya_gpu.py --serve, FastAPI)
             └─ timeout 800ms ──► simulatePredict TS (fallback honesto)
             frontend/src/lib/laya.ts ──► ruin_priority + adapters TS
             + speculativeSolve (S1 especulativo <10ms, settle S2)
```

## 2. Pontos fortes (verificados em código)

- **Proveniência §4 em toda saída** — `Provenia` (10 campos) viaja em
  `LayaPrediction`, `DecisionResult`, `LayaSolverBridgeResult` e no payload TS.
  `fallback_used`/`engine_id` distinguem `laya-s1-trained`, `gemini-decision-1`,
  `laya-s1-fallback`, `laya-s1-predict-fallback`, `heuristic-script-detector`,
  `laya-s1-predict-ts-simulation`.
- **Lazy import disciplinado** — `laya`/torch nunca no nível de módulo;
  `llm.laya_bridge` permanece livre de torch (teste dedicado).
- **Cascata honesta** — `decide_s1` escala para nuvem quando Laya está em
  fallback, quando answers vêm incompletas (nunca fabrica decisão), e falha
  explicitamente quando não há motor nenhum. `0`/`0.0` contam como resposta
  válida; só `None`/ausente dispara escalação.
- **Pool decision maduro** — round-robin com breaker, cooldown 429/5xx,
  revogação 401/403, `has_credentials` evita reload que apagaria bloqueios, 429
  aborta failover quando todas as chaves restantes são do mesmo projeto
  (`project_of`), telemetria HMAC-sha8 sem vazar chave.
- **System-2 coerente** — `system2_local` tem admissão por RAM disponível
  (`/api/ps` + reclaimable), VRAM via registro Windows, loop asyncio
  compartilhado para o fallback cloud, proveniência em `meta`.
- **Cobertura de testes** — 9 arquivos dedicados; suíte focada executada em
  2026-11-12: **132 passed, 0 erros, 0 warnings** (guard SOTA verde).
- **Invariantes de governança respeitadas** — S1 é advisory/observacional: não
  toca decisão de modelo/custo ($) nem os 10 teoremas PMev; modula apenas prior
  de ruína [1.0, 1.30] e thresholds, com `CHICO_S1_LAYA=0` desativável.

## 3. Achados e riscos

### A. Duplicação Python↔TypeScript dos moduladores de solver (médio)

`llm/laya_solver_adapter.py::_SOLVER_MODULATORS` e
`frontend/src/lib/laya.ts::SOLVER_ADAPTERS` são implementações paralelas do
mesmo contrato. Divergência já presente:

- solver desconhecido: Python normaliza para `universal-importer`; TS mantém a
  chave crua e o adapter lookup falha silenciosamente (só `s1_confidence_score`
  é emitido) — `target_solver` diverge.
- TS não replica `_modulate_generic_framework` (libratus/antevisao/
  systems-theory/universal-importer caem fora do mapa TS).

Recomendação: ou gerar o mapa TS a partir do Python (codegen/fixture), ou
restringir o uso TS a solvers explicitamente cobertos e documentar a lista.

### B. Dois caches de Router Laya no mesmo processo (baixo-médio)

`LayaRouter._router` (atributo de classe, route()) e `_PREDICT_ROUTER` (global
de módulo, predict()) são instâncias separadas de `laya.router.Router`. Se ambos
os caminhos forem exercidos no mesmo processo (ex.: orchestrator advisory +
/predict), o checkpoint 322M pode ser carregado duas vezes. Unificar sob um
único cache.

### C. `is_multimodal_input` agressivo (baixo)

Qualquer `dict` conta como multimodal → vai direto à nuvem, mesmo
`{"text": "..."}`. Correto para blocos de conteúdo, mas um dict textual puro
paga chamada paga desnecessariamente. Refinar para detectar blocos não-texto de
fato.

### D. Simulação TS sob status SUCCESS (baixo, por design)

`/api/sota/laya/predict` devolve `status: SUCCESS` com
`provenia.engine_id='laya-s1-predict-ts-simulation'` quando o upstream :8192
falha/estoura 800ms. Honesto na proveniência, mas consumidores que não
inspecionam `provenia.fallback_used` recebem heurística como se fosse
inferência. Aceitável se o contrato §4 for obrigatório — já é — mas vale alerta
nos consumidores.

### E. `decide_s1` em host CPU-only sem env (baixo)

Sem GPU e sem `CHICO_LAYA_PREDICT_ALLOW_CPU=1`, `laya_predict` retorna fallback
heurístico → `decide_s1` devolve `laya-s1-fallback` quando não há chave Gemini.
Decisão "válida" porém fraca. O microserviço :8192 (`--serve` seta
`CHICO_LAYA_PREDICT_ALLOW_CPU=1`) é o caminho real neste host (RX 570 Polaris
não tem CUDA/ROCm) — e ele **não é consumido pela cascata `decide_s1`**, que
fala in-process com `laya_predict`. Ou seja: a cascata Laya local nunca usa o
microserviço GPU/CPU dedicado; só o frontend fala com :8192. Avaliar um
`LAYA_SERVICE_URL` client-side no `decide_s1` para unificar.

### F. Validação de questions assimétrica (baixo)

`decide()` normaliza via `normalize_questions`; `decide_s1` passa o dict cru a
`laya_predict`, que não valida shape. Perguntas malformadas falham na nuvem mas
podem passar batido na Laya (ou vice-versa). Normalizar uma vez no topo de
`decide_s1`.

### G. Superfície de exposição do S1 (observação)

O backend aiohttp não expõe rota HTTP para `decide_s1`/`laya_predict` — S1 só é
alcançável via `stitch_bridge` (in-process), handlers de solver e o microserviço
:8192. Se a intenção é S1 como serviço, falta o endpoint; se é advisory interno,
o desenho está coerente.

## 4. Verificações executadas

- `pytest tests/test_laya_*.py test_gemini_decisions.py test_decision_pool.py test_system2_local.py test_stitch_bridge.py -q --tb=short`
  → **132 passed, 0 failed, 0 warnings** (2026-11-12, guard SOTA verde).
- Leitura integral: `llm/laya_bridge.py`, `llm/gemini_decisions.py`,
  `llm/decision_pool.py`, `llm/system2_local.py`, `llm/laya_solver_adapter.py`,
  `engine/stitch_bridge.py` (cascata), `engine/llm_api.py` (advisory),
  `core/arbitrator.py`, `llm/orchestrator.py`, `llm/routing_policy.py` (Etapa
  0), `api/v1/handlers.py` (consumidores), `frontend/src/lib/laya.ts`,
  `frontend/src/app/api/sota/laya/predict/route.ts`,
  `scripts/ops/homologar_laya_gpu.py` (microserviço), pool carregado ao vivo:
  **3 dedicadas + 2 fallback decision, 5 gemini, 7/5/5 openrouter**.

## 5. Síntese

A arquitetura System-1 é madura e honesta: proveniência obrigatória, cascata
local→nuvem com escalonamento explícito, pool com circuit breaker consciente de
quota-por-projeto, e S1 deliberadamente sem autoridade sobre modelo/custo — só
prior, threshold e adaptação de solver. Os riscos concentrados são de **paridade
TS↔Python** (A), **duplo cache de Router** (B) e a **cisão de caminho** entre a
cascata in-process e o microserviço :8192 (E) — este último é o candidato
natural a próxima evolução, pois o serviço dedicado já existe e está homologado.
