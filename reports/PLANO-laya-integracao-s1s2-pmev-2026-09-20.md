---
id: plano-laya-integracao-s1s2-pmev-2026-09-20
tipo: plano
escopo: Site
ecossistema: nexus-sota
autor: "Hermes Agent [Tier 0] -- sessao 2026-09-20"
criado_em: 2026-09-20T20:30:00-03:00
atualizado_em: 2026-09-20T20:30:00-03:00
classes: [interno, integracao, pmev, systemic, parity, s1s2, dependencias, arquitetura]
caminhos:
  - pyproject.toml
  - uv.lock
  - engine/vitoi_perspective_engine.py
  - engine/cognitive.py
  - engine/sota_triad_mesh.py
  - engine/dream_timesfm_forecaster.py
  - engine/game_theory_solvers.py
  - llm/routing_policy.py
  - llm/model_registry.py
  - docs/architecture/ENGINE_CAPABILITY_INTEGRATION_PLAN.md
  - frontend/src/lib/rpDeriver.ts
  - frontend/src/lib/perspectiva.ts
  - frontend/src/lib/montecarlo.ts
  - frontend/src/lib/nashSolver.ts
  - frontend/src/lib/pluribusWasmAdapter.ts
  - frontend/src/lib/bayesianRangeEngine.ts
  - frontend/src/lib/dynamicFoldEquityEngine.ts
  - frontend/src/lib/icmMatrix.ts
  - frontend/src/lib/engine/generated/vitoi_equity_engine_bg.wasm.d.ts
  - frontend/src/components/simulator/solver/nashSolver.ts
  - frontend/src/components/simulator/solver/vitoi.ts
  - data/engine_capabilities.json
  - tests/test_vitoi_perspective_engine.py
  - llm/laya_bridge.py
  - tests/test_laya_bridge.py
  - core/arbitrator.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: 3.14.6
verificado:
  - >-
    FONTE UNICA SINCRONIZADA: pyproject.toml declara laya>=0.3.4 +
    accelerate>=1.15.0 (bloco SISTEMA 1, ASCII-puro); uv lock --check =
    235 packages, sem drift; uv.lock inclui laya v0.3.4 + accelerate v1.15.0
    + huggingface-hub. Pinos preservados (transformers 5.15.1, torch 2.13.0,
    chromadb 1.5.9, anyio 4.13.0, numpy 2.4.6, safetensors 0.8.0).
  - >-
    pip-audit contra o venv: 7 CVEs PREEXISTENTES (anyio 4.13.0 x2, chromadb
    1.5.9 x5). ZERO novas introduzidas pela clausura de laya/accelerate/
    huggingface_hub/safetensors/transformers/torch/numpy. Clausura verificada
    aberta. anyio 4.13.0 e chromadb 1.5.9 sao preexistentes (nao introduzidos
    por laya) -- CVEs nao sao atribuídas a esta mudanca.
  - >-
    SMOKE TEST route() (zero-download, transformers 5.15.1) VERIFICADO EM REPL:
    detection.language e NULO (idioma correto vem de `model`); detection.script
    = latin|devanagari|han; non_latin_fraction 0..1; model = english|multilingual.
    en->english/small-english, devanagari/han->multilingual. Confere README.
  - >-
    FASE 1 IMPLEMENTADA E VERDE: llm/laya_bridge.py (LayaRouter, zero-download
    route(), provenia §4, HeuristicRouter fallback, lazy import torch-free).
    11/11 tests tests/test_laya_bridge.py passam (route()==README; provena;
    fallback; negativo; determinismo; serializacao).
  - >-
    CONSUMIDOR REAL: core/arbitrator.py::_registrar_intencao_s1 enriquece
    Task.metadata.intencao_s1 dentro de extract_optimal_task (path LIVE, nao-$).
    `import core.arbitrator` e VERIFIED-TRUE TORCH-FREE (torch nao carregado no
    import -- lazy design validado). 138 passed (laya_bridge + core_coverage +
    auditoria_backend_2026_09_16 + vitoi); ZERO regressao em testes de metadata;
    uv lock --check OK.
  - >-
    MANIFESTO registrado: data/engine_capabilities.json ganha a capacidade
    laya-s1-router (family: system1, implementation_level: primitive, provenia §4;
    consumer_paths verificadas: llm/laya_bridge.py, core/arbitrator.py,
    llm/routing_policy.py, frontend/src/lib/rpDeriver.ts,
    frontend/src/components/simulator/hooks/useQuantumEngine.ts).
nao_verificado:
  - >-
    Nao rodei a suite completa (suite_verde.py) nem o CWV gate (exige CDP 9222/9223
    Chrome Dev ativo). A sub-suite afetada (laya_bridge + core_coverage +
    auditoria_backend_2026_09_16 + vitoi) foi verde (138 passed, 0 warnings, 0 erros).
  - >-
    Forward pass heavy de laya (predict, 421M, ~33ms/T4 ou ~464ms CPU) NAO testado
    -- requer download de checkpoint + GPU; proibido nesta sessao CPU-only
    (Tier 6 Edge AI). Preterido para Phase 4 (noul/score/choice).
  - >-
    Path de modelo/custo $ (llm/routing_policy.py::avaliacao_uso_condicional_pro
    + nano_intent_router) e Tier 0: o wiring Phase 1 e APENAS metadado observacional
    (intencao_s1), NUNCA escolhe modelo nem altera custo. Wiring direto ao $ exige
    aprovacao Tier 0 (Phase 2).
  - >-
    Frontend TS parity + app/api/sota/laya/route.ts sao Phase 3 -- nao implementados.
  - >-
    Versoes especificas de TimesFM (2.0/2.5/3.0) e solvers CRF+/Libratus/DeepStack
    sao escopo declarado pelo usuario, nao verificados em codigo ainda. MC/Nash/
    Pluribus/Bayesian/ICM/TimesFM existem em codigo (caminhos verificados).
referencias_nao_resolviveis:
  - app/api/sota/laya/route.ts
  - app/api/sota/pmev-heatmap/route.ts
  - pmev-pdf/route.ts
  - laya/router.py
pendencias:
  # Phase 1 (CONCLUIDA e verde -- veja verificado acima)
  # - llm/laya_bridge.py [feito] | tests/test_laya_bridge.py [feito]
  # - core/arbitrator.py::_registrar_intencao_s1 [feito] | manifest laya [feito]
  # Phase 2 (Tier 0 -- aprovacao necessaria; envolve path $ ou prior PMev)
  - id: s1-routing-policy-wiring
    o_que: "wiring direto de prior S1 em llm/routing_policy.py::avaliacao_uso_condicional_pro com complexidade_formal + fracao_escalada -- exige aprovacao Tier 0 ($)"
    dono: Tier 0 ($) requerido
  - id: etapa0-s1-prior-de-ruina
    o_que: "Etapa 0 S1 em engine/vitoi_perspective_engine.py (prefiltro -> prior de ruina, Teorema 2) -- modula prior; 10 teoremas inalterados; paridade noul [0,1] TS<->py"
    dono: Tier 0 ($) requerido
  # Phase 3 (frontend parity -- Tier 1 autorizado pela escalada)
  - id: frontend-parity-nextjs-route
    o_que: "expor app/api/sota/laya/route.ts (Next.js) + consumo parity rpDeriver.ts + components/simulator/hooks/useQuantumEngine.ts + monteCarlo.ts/bayesianRangeEngine.ts"
    dono: Tier 1 (autorizado pela escalada)
  # Phase 4 (GPU-gated, Tier 6 Edge AI)
  - id: laya-predict-full-s1-gpu
    o_que: "laya predict() full S1 (choice/score/noul) -- apenas hosts GPU local; feedback TimesFM/solvers"
    dono: Tier 6 (GPU-gated Edge AI)
  # Phase 5 (escopo amplo)
  - id: laya-classification-generica
    o_que: "laya classification -> CRF+/Libratus/DeepStack/Systems/Shannon/Antevisao/Prospect via interface generica"
    dono: abrangente (escopo amplo)
---

# Plano de integracao S1S2...n — laya no ecossistema Site (sistemico, fractal, autopoietico)

**Governança:** segue `docs/architecture/ENGINE_CAPABILITY_INTEGRATION_PLAN.md`
(invariantes, contrato mínimo de provença §4, régua de capacidade §5, estratégia de teste §6).

Este plano foi **revisado para visão sistêmica** a pedido do Tier 0: o ecossistema é
autopoietico/fractal e a fronteira backend x frontend é de **paridade**, não de muro.
O frontend não é UI — contém motores matemáticos reais (WASM/TS): `monteCarlo.ts`,
`nashSolver.ts`, `pluribusWasmAdapter.ts`, `bayesianRangeEngine.ts`,
`dynamicFoldEquityEngine.ts`, `rpDeriver.ts`, `perspectiva.ts`, `icmMatrix.ts`,
`engine/generated/vitoi_equity_engine_bg.wasm`. Portanto laya integra-se como nó S1
em uma **malha bidirecional** com TimesFM, o zoológico de solvers e os frameworks
multidisciplinares — fortalecendo parte↔parte, parte↔todo, todo↔parte, todo↔todo.

## 1. Princípio sistêmico (autopoieSE / fractal / paridade)

```text
                    [Cosmovisao / Modus / GI]   (governanca)
                              |
        --- [S1 laya] <--> [S2 PMev] <--> [TimesFM] <--> [Solvers] <--> [Frameworks] ---
       |                       |                    |              |              |
  backend (.py)          frontend (TS/WASM)     api/sota/*      paridade       paridade
       |                       |                    |              |              |
   routing_policy.py      rpDeriver.ts          /laya/route.ts   unidades       unidades
        --- fortalecimento bidirecional: cada nó fortalece o todo; cada conexão fortalece os nós adjacentes ---
```

- **AutopoieSE:** cada subsistema se autodiferencia mas se auto-refere. laya (S1) não
  decide o resultado do S2 — modula priors; o S2 não substitui o S1 — delega a triagem.
- **Fractalidade:** a mesma 3-camada (triagem rápida → deliberação exata → forecast)
  se aplica em cada nivel: `routing_policy` (laya→roi/roi_do_escalonamento),
  `vitoi_perspective_engine` (laya→teoremas/10), `rpDeriver` (laya→barreira de ruína),
  `bayesianRangeEngine` (laya→noul como evidência bayesiana), `monteCarlo` (laya→seed+amostras).
- **Paridade backend x frontend:** Python e TypeScript compartilham cenários, unidades e
  tolerâncias (invariante do plano-padrão-ouro §5). laya publica priors em escala [0,1]
  e em ms — idênticos no runtime `.py` e no consumidor `rpDeriver.ts`. O WASM
  (`vitoi_equity_engine_bg.wasm`) e o backend `.py` executam o mesmo corpus de paridade
  (testes existentes de paridade Python↔TS↔WASM já verdes).

## 2. O nó S1 de laya na malha (o que laya é)

`laya v0.3.4` (NandhaKishorM/laya, Apache-2.0, torch/transformers). Primitives:
`choice`, `score`, `noul` (calibrated probability). `Router().route()` = **zero-download**
(puro-Python, script/language detection, <0.5 ms). `predict()` = full single forward pass
(~33 ms/T4, ~464 ms CPU) — GPU-gated. presets: `router_questions`, `guard_questions`,
`moderation_questions`, `triage_questions`. laya é **System 1 não-autorregrado**:
fast, stochastic, single-pass — o oposto do S2 PMev (exact, deterministic, symbolic).

## 3. Matrix de integração bidirecional (parte↔parte, parte↔todo)

| Componente (verificado em código / declarado pelo usuário) | como laya o fortalece | como ele fortalece laya |
|---|---|---|
| **`llm/routing_policy.py`** `avaliacao_uso_condicional_pro` + `nano_intent_router` | laya.`noul` vira prior em `complexidade_formal`; `triage_score` na `fracao_escalada`; `guard_questions` pruneia ferramentas perigosas | routing policy feed (faixa/ROI) vira `router_questions` de laya — laya aprende qual faixa consumiu |
| **`engine/vitoi_perspective_engine.py`** (10 teoremas, Etapas 1-3) | Etapa 0: `route()` → script/idioma + prior sobre barreira de ruína não-ergódica (Teorema 2, BF<1) | PMev `outcome` vira sinal de `score`/`choice` para laya (feedback de qual teorema prevaleceu) |
| **`engine/dream_timesfm_forecaster.py`** (TimesFM) | laya.S1 triagem de regime (drift vs. stable) antes do forecast | TimesFM forecast de drift vira contexto de janela para `laya.predict()` (anticipação) |
| **`engine/cognitive.py`** (mente coletiva / grafos causais) | `agent_trace_observability` alimenta arestas de evidência; guard/moderation viram arestas S1 | grafo causal fortalece laya com evidência acumulada (noul calibrado por histórico) |
| **Frontend `frontend/src/lib/rpDeriver.ts`** (exact-equilibrium) | `triage_score` (noul) modular o termo de barreira de ruína antes da derivação S2 | derivação S2 publicada on-chain vira prior para laya (frontend como sensor S1) |
| **Frontend `frontend/src/lib/bayesianRangeEngine.ts` + `frontend/src/lib/montecarlo.ts`** | `noul` vira evidence weight bayesiano; laya.`route()` seta seed de amostragem | amostras MC convergem → signal para `score`/`choice` (laya ajusta calibragem) |
| **Frontend `frontend/src/components/simulator/solver/nashSolver.ts`** (Nash) + `frontend/src/lib/pluribusWasmAdapter.ts`** | laya.classifica regime de jogo (zero-sum, partidas de poeira, multiway) → engine certo | Nash equilibrium + Pluribus strategy vira feedback de `choice`/`score` (qual teorema de jogo) |
| **Frameworks (usuário): Game Theory, Systems Theory, Shannon, Antevisão, Bayesian/Predictive, Prospect Theory** | laya.classification (tipo) → framework apropriado; `noul` modular risk-priors de cada framework | output de cada framework vira signal de `score`/`noul` de laya (calibragem contínua) |
| **Solvers (usuário): MC, CRF+, Pluribus, Libratus, DeepStack** | laya.router_questions → qual solver alocar; `triage_score` seta horizon. MC/Nash/Pluribus (verificado); CRF+/Libratus/DeepStack (escopo declarado) | solver output vira feedback de `predict()` (qual checkpoint usar) |

**Escopo verificado vs. declarado pelo usuário:** MC/Nash/Pluribus/Bayesian/ICM/TimesFM
existem em código (arquivo em `caminhos`); CRF+, Libratus, DeepStack, Systems Theory,
Shannon, Antevisão, Prospect Theory são **escopo declarado** — laya deve ser projetado
para integrar a eles (interface genérica de classificação), não a pular.

## 4. Provença mínima exigida (§4 do plano-padrão-ouro)

Toda saída de laya carrega: `engine_id`, `implementation_level`, `runtime_used`,
`model_used`, `intended_model`, `weights_loaded`, `fallback_used`, `assumptions`,
`limitations`, `units`.

| campo | valor |
|---|---|
| engine_id | `laya-s1` |
| implementation_level | `primitive` (route) / `trained-model` (predict) / `heuristic` (presets) |
| model_used | `laya` (421M) / nenhum (route) |
| model_used vs intended_model | distintos quando CPU degrada para `HeuristicRouter` (fallback declarado) |
| weights_loaded | `false` (route) / `true` (GPU predict) |
| runtime_used | transformers 5.x sobre torch 2.13.0 (CPU); GPU sob Tier 6 |
| fallback_used | `false`; CPU/GPU-ausente → `HeuristicRouter` declarada |
| limitations | CPU ~464 ms/predict; GPU ~33 ms/T4; route < 0.5 ms, zero download |
| units | ms; escala [0,1] para noul/score/triage |

## 5. Arquitetura de consumo — backend + frontend (paridade)

### 5.1 Backend: `llm/laya_bridge.py` (novo consumidor — Phase 1, IMPLEMENTADO)
`LayaRouter.classificar_intencao(state: str|dict) -> LayaIntent` retorna proveniância §4
com os sinais zero-download REAIS de `laya.Router().route()` (verificado em REPL):
`{idioma, script, is_english, modelo_sugerido, nao_latin_fraction_pct, reason, provenia}`.
Nota: `detection.language` vem NULO — `idioma` vem de `model` (english/multilingual).
Zero-download (`route()`): <0,5 ms, sem download/weights. O nível `trained-model`
(`predict()` → choice/score/noul) é GPU-gated, Phase 4. IMPORT LAZY: `from laya.router
import Router` roda dentro dos métodos — `import core.arbitrator` é torch-free (torch
carrega só no primeiro `classificar_intencao`, cached; ~1,5s warmup).
CONSUMIDOR REAL (Phase 1): `core/arbitrator.py::_registrar_intencao_s1` anexa
`Task.metadata["intencao_s1"]` em `extract_optimal_task` — path LIVE, NÃO-$ (decisão de
modelo/custo é fonte-única em `llm/routing_policy.py`, Tier 0). Advisory/passthrough
(try/except); fallback `HeuristicRouter`; desativável via `CHICO_S1_LAYA=0`. NÃO wired a
`plano_de_ferramentas` (sem consumidor — invariante antientropia p. 459) nem a
`avaliacao_uso_condicional_pro` (Tier 0, $).

### 5.2 Backend: `engine/vitoi_perspective_engine.py` (Etapa 0 S1 — Phase 2)
Etapas existem 1-3; **Etapa 0 proposta**: `laya.Router().route()` detecta script/idioma +
guard; `noul` vira prior sobre barreira de ruína (Teorema 2, p. 20/p. 25). S1 não decide
o valor PMev — modula o prior. 10 teoremas preservados.

### 5.3 Backend API: `api/v1/` + `app/api/sota/`
Novo membro da familia `app/api/sota/{pmev-heatmap, pmev-pdf, timesfm-forecast, …, laya/route.ts}`:
`/api/sota/laya/route.ts` → HTTP autenticado → `api/v1/handlers.py` → `llm/laya_bridge.py`.
Proveniência §4 em toda resposta (invariante P0.6 — já concluída no plano-padrão-ouro).

### 5.4 Frontend (parity): consome S1 priors, não roda torch (correto)
- `frontend/src/lib/rpDeriver.ts` (exact-equilibrium): `triage_score` como prior de barreira
  de ruína. Escala [0,1] = idêntico ao backend (invariante §5).
- `frontend/src/components/simulator/hooks/useQuantumEngine.ts`: `model_route` de laya
  aloca precision-budget / qubit basis (S1 decide budget, não resultado).
- `frontend/src/lib/montecarlo.ts`, `frontend/src/lib/bayesianRangeEngine.ts`, `frontend/src/lib/nashSolver.ts`: consomem `noul`
  como evidence weight / seed (paridade de teste com o WASM + backend Python).
- `app/api/sota/pmev-heatmap/route.ts`, `pmev-pdf/route.ts`: prepend do prior S1 no pipeline S2.

## 6. Régua de capacidade (§5 do plano-padrão-ouro)

| capability | nível | justificativa |
|---|---|---|
| `laya.Router().route()` | `primitive` | zero-download, <0.5 ms |
| `laya.predict()` (full S1) | `trained-model` | checkpoint 421M |
| guard/triage (presets) | `heuristic` | regras sobre score S1 |
| laya como prior de ruína | `primitive` | não decide, modula (parâmetro reservado) |
| PMev (VitoiPerspectiveEngine) | `full-solver` | árvore/info/alcance/criteriários resolvidos |
| TimesFM | `trained-model` | forecast |
| Nash/MC/Pluribus (WASM+TS) | `simulation`/`full-solver` | seed + seed de amostragem declarados |

laya só conta se tem consumidor real (invariante §7). `route()` tem consumidor desde
Phase 1; `predict()` só no path GPU (Phase 4) — portanto declara `intended_model` vs
`model_used` distintos quando GPU ausente (degradação observável, nunca silenciosa).

## 7. Estratégia de teste (§6 + paridade)

- [ ] Estrutural do manifesto: `data/engine_capabilities.json` valida entrada laya.
- [ ] Unitário de `llm/laya_bridge.py`: `route()` == README (en/hi/de); idempotente, offline.
- [ ] Negativo: input impossível (script vazio/None) rejeitado (invariante §8).
- [ ] **Paridade S1:** mesmo input → `noul`/`triage_score` estáveis (seed) em Python e TS
  (invariante §5 — backend x frontend compartilham unidades/tolerâncias).
- [ ] **Paridade PMev:** `tests/test_vitoi_perspective_engine.py` continua 25 passed após
  Etapa 0; laya prior não altera os 10 teoremas (invariante §3: parâmetro causal altera
  resultado; S1 prior é parâmetro causal — teste a convergência).
- [ ] **Paridade WASM:** mesmo corpus entre `.py`, `rpDeriver.ts` e `vitoi_equity_engine_bg.wasm`.
- [ ] Fallback: CPU/GPU ausente → `HeuristicRouter`, saída com `fallback_used: true`.
- [ ] TipoCheck frontend + Visual Identity SOTA GOLD sem regressão (zero tolerância).
- [ ] Gate integral `suite_verde.py` antes de commit autorizado (§1).

## 8. Ordem padrão-ouro (fases)

| Fase | Entrega | Dependência | Critério |
|---|---|---|---|
| 0 (feita) | Fontes de verdade sincronizadas | — | uv lock --check OK; 0 CVE novas; suite PMev verde |
| 1 (concluída) | `llm/laya_bridge.py` + `tests/test_laya_bridge.py` + `core/arbitrator.py::_registrar_intencao_s1` + manifesto | 0 | route()==README (REPL-verificado); consumer REAL em `extract_optimal_task` (metadata `intencao_s1`); 138 passed; `import core.arbitrator` torch-free; 0 regressão |
| 2 | Etapa 0 S1 em `engine/vitoi_perspective_engine.py` | 1 | prior S1 modula ruína; 25 tests PMev verdes; paridade noul [0,1] TS↔py |
| 3 | `/api/sota/laya/route.ts` + consumo rpDeriver.ts/useQuantumEngine.ts | 2 | frontend consome prior; typecheck green; visual GOLD intacto |
| 4 (GPU) | laya `predict()` full S1 + feedback TimesFM/solvers | 3 | apenas Tier 6 Edge AI (GPU local); nunca este CPU host |
| 5 (escopo amplo) | laya classification → CRF+/Libratus/DeepStack/Systems/Shannon/Antevisão/Prospect (interfaces genéricas) | 4 | escopo declarado, integrado sem forçar engines não-verificadas |

## 9. Riscos (declarados, não dissimulados)

1. **transformers 5.x + laya:** `route()` verificado OK. `predict()` NÃO testado (download de checkpoint + GPU proibidos nesta sessão).
2. **CPU latency:** ~464 ms inviável para path síncrono de engenharia — `route()` priorizado; `predict()` para triagem offline.
3. **Antientropia (RESOLVIDA na Phase 1):** laya instalada sem consumidor (achado 7 desta sessão). RESOLVIDO: `core/arbitrator.py::_registrar_intencao_s1` é o consumidor REAL live (anexa `Task.metadata.intencao_s1` em `extract_optimal_task`). Invariante preservada: `plano_de_ferramentas` continua sem consumidor (não forçado).
4. **Paridade de unidades:** exigir que `noul` de laya (escala [0,1]) e os priors de ruína de PMev (TB<1) coexistam sem quebra semântica — teste de paridade (§7) é o selo.
5. **Escopo declarado vs. verificado:** CRF+/Libratus/DeepStack/Systems/Shannon/Antevisão/Prospect são escopo do usuário, não verificado em código — integrar à interface genérica, não forçar implementação.

## 10. Anexos — arquivos reais consultados

- `laya/router.py` (venv): `Router.route()` linha 241 — puro-Python, zero-download.
- `llm/routing_policy.py`: `avaliacao_uso_condicional_pro` (p. 428), `plano_de_ferramentas` (p. 669), `nano_intent_router` (p. 340), `Rota.fallback` sem consumidor (p. 459-460).
- `engine/vitoi_perspective_engine.py`: Etapas 1-3, 10 teoremas, `premio_de_risco_canonico` (p. 25).
- `engine/cognitive.py`, `engine/sota_triad_mesh.py`, `engine/dream_timesfm_forecaster.py`, `engine/game_theory_solvers.py`.
- `docs/architecture/ENGINE_CAPABILITY_INTEGRATION_PLAN.md` (precedente de plano; invariantes §4/§5/§6).
- Frontend: `frontend/src/lib/rpDeriver.ts`, `frontend/src/lib/perspectiva.ts`, `frontend/src/lib/montecarlo.ts`, `frontend/src/lib/nashSolver.ts`, `frontend/src/lib/pluribusWasmAdapter.ts`, `frontend/src/lib/bayesianRangeEngine.ts`, `frontend/src/lib/dynamicFoldEquityEngine.ts`, `frontend/src/lib/icmMatrix.ts`, `frontend/src/lib/engine/generated/vitoi_equity_engine_bg.wasm`, `frontend/src/components/simulator/solver/{nashSolver,vitoi}.ts`, `frontend/src/components/simulator/hooks/useQuantumEngine.ts`.
- `pyproject.toml`, `uv.lock` (modificados esta sessão — fonte única de dependências).
