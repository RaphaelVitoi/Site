---
id: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
tipo: handoff
escopo: Site -- expurgo integral de modelos legados e obsoletos (gemini-2.x, deepseek-r1, llama-3.1-8b, granite, deepseek-chat, haiku), harmonizacao dos modelos Qwen por papel cognitivo, consolidacao da triade agentica Tier 2 (Jules, Stitch, Exa), integracao do Hermes Agent Desktop, atualizacao da matriz holografica com os 19 agentes e registro de calibracao 9.5
ecossistema: nexus-sota
autor: antigravity
criado_em: '2026-09-30T00:26:00-03:00'
atualizado_em: '2026-09-30T00:26:00-03:00'
commit: HEAD
classes: [interno, medido, backend, llm, roteamento, governanca, calibracao, handoff]
caminhos:
  - reports/HANDOFF-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao.md
  - core/config.py
  - data/routing_map.json
  - data/system_config.json
  - docs/reports/HOLOGRAPHIC_ROUTING_MATRIX.md
  - engine/gemma_server.py
  - engine/llm_api.py
  - frontend/src/app/api/v1/rag/route.ts
  - llm/free_router.py
  - llm/orchestrator.py
  - llm/routing.py
  - scripts/cli/nexus.py
  - scripts/start_model.ps1
  - tests/test_roteamento_especialidade.py
  - tests/test_task_routing.py
  - tests/test_llm_layer_sota.py
  - tests/test_gemma_server_sota.py
  - tools/hybrid_router/app.py
  - tools/hybrid_router/compose.yaml
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: ccea4505-5546-46e8-b13a-87991e1b1942
  session_started_at: '2026-09-30T00:00:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-30
verificado:
  - "expurgo completo de modelos legados: zero ocorrencias ativas de granite, deepseek-r1:free, deepseek-chat, deepseek-coder:1.3b, claude-3-5-haiku, mistral:free, llama-3.1-8b e gemini-2.x"
  - "matriz holografica de roteamento atualizada com todos os 19 agentes canonicos (incluindo @sequenciador, @historian e @gemma4) e esteira de handoff completa"
  - "família Qwen cirurgicamente especializada: qwen2.5-coder:1.5b (infilling/FIM <50ms), gemini-3.5-flash-lite (triagem primaria), qwen-code-surgical:latest e qwen 7b q5 (linting/diffs), qwen-pmev-math (matematica ICM) e qwen-poetics (prosa PT-BR)"
  - "triade Tier 2 por assinatura (Google Labs Jules, Google Cloud Stitch, Exa Knowledge Engine) 100% validada e conectada (28/28 testes em test_sota_triad_mesh e test_jules_bridge)"
  - "Hermes Agent Desktop integrado: reconhecimento de space-bunny-alpha e hermes/ com custo 0.0 e alocacao na faixa FAST_OPERATIONS"
  - "bateria de testes verdes: test_roteamento_especialidade (23 passed), test_task_routing (11 passed), test_llm_layer_sota (22 passed), test_routing_policy (54 passed), test_sota_triad_mesh + jules (28 passed), test_architectural_stress (20 passed), test_gemma_server_sota (8 passed), test_hybrid_router (8 passed), test_hook_commit_msg + provenance (99 passed)"
  - "feedback de calibracao registrado no ledger: sequence 88, score 9.5 (justificativa: atencao as periferias e expurgo de obsoletos), hash chain validada em 89 registros (tail: 26dc09ad)"
  - "evidencia diaria gerada via Write-AgentCalibrationDailyEvidence.ps1: portao estrutural ABERTO (3 sessoes distintas acumuladas)"
  - "avaliar_impacto_sessao: -39.46% economia de tokens MCP, ingress fast-path 0.0518 ms, 16 chaves OpenRouter ativas, 0 pendencias"
  - "ruff check: 100% limpo em todo o repositorio"
nao_verificado:
  - "CI remoto do GitHub nao foi executado localmente; sera acionado no push"
  - "docker build da imagem de producao nao executado localmente devido a ausencia de Docker daemon no host Windows"
---

# Handoff — Expurgo de Modelos Obsoletos, Harmonização Qwen e Calibração

## 1. Contexto e Ponto de Partida

A sessão foi iniciada com foco no saneamento estrutural do roteamento e na eliminação definitiva de modelos obsoletos e descontinuados que ainda ocupavam espaço nas periferias e fallbacks do ecossistema.

Medição inicial revelou resquícios inoperantes:
- `meta-llama/llama-3.1-8b-instruct:free` (100% de erro no OpenRouter e ausente no host);
- `gemini-2.x` (descontinuados pela Google);
- `deepseek/deepseek-r1:free` e `deepseek/deepseek-chat` (obsoletos/instáveis);
- `granite3.3:8b` e `ibm/granite-3.3-8b-instruct` (resíduos legados em mapas locais);
- `deepseek-coder:1.3b` (superado por Qwen 2.5);
- `claude-3-5-haiku-20241022` e `mistralai/mistral-small-3.1-24b-instruct:free`.

Além disso, a matriz holografica de roteamento (`docs/reports/HOLOGRAPHIC_ROUTING_MATRIX.md`) estava incompleta, cobrindo apenas 16 dos 19 agentes (faltavam `@sequenciador`, `@historian` e `@gemma4`).

---

## 2. Ações Executadas e Soluções Implementadas

### A. Expurgo Cirúrgico de Modelos Obsoletos
1. **`core/config.py`:** Fallback de `deep_thinking` atualizado para `(MODEL_GEMINI_FLASH, "gemma4:31b-cloud", "poolside/laguna-s-2.1:free")`.
2. **`data/routing_map.json` & `data/system_config.json`:** Remoção total de `deepseek/deepseek-r1:free` e substituição por `poolside/laguna-s-2.1:free` e `meta-llama/llama-3.3-70b-instruct:free`.
3. **`engine/gemma_server.py`:** Expurgo de `granite` e `deepseek` de `CLOUD_MODEL_MAP`, `OLLAMA_MODEL_MAP`, `MODEL_INFERENCE_PARAMS`, `_resolve_heuristica` e `vram_map`. Modernizado com `laguna`, `gpt_oss`, `qwen-code-surgical` e `qwen-pmev-math`.
4. **`engine/llm_api.py`:** Substituição de `deepseek/deepseek-chat` por `poolside/laguna-s-2.1:free`.
5. **`llm/orchestrator.py`:** Substituição de `mistralai/mistral-small-3.1-24b-instruct:free` por `poolside/laguna-xs-2.1:free`.
6. **`frontend/src/app/api/v1/rag/route.ts`:** Endpoint de síntese atualizado de `gemini-2.5-flash` para `gemini-3.7-flash`.
7. **`tools/hybrid_router/app.py` & `compose.yaml`:** Atualização do default para `gemini-3.7-flash`.
8. **`scripts/cli/nexus.py` & `scripts/start_model.ps1`:** Substituição de `granite` por `laguna` e `qwen 7b q5`.

### B. Especialização Funcional da Família Qwen
- **Autocomplete, Infilling (FIM) & Edições Pontuais:** `qwen2.5-coder:1.5b` (local Ollama / llama.cpp Duo porta 8083, <50ms de latência, custo 0.0).
- **Triagem Primária de Alta Vazão:** `gemini-3.5-flash-lite` (>200 tok/s, 1M context, parsing JSON estrito do `@dispatcher`). Retaguarda local: `qwen2.5-coder:0.5b` e `ai9stars_G9v3-3B`.
- **Linting & Cirurgia SEARCH/REPLACE:** `qwen-code-surgical:latest` e `qwen2.5-coder:7b-instruct-q5_K_M` (diffs de 120-150 linhas sem alucinações).
- **Matemática, ICM & PMev:** `qwen-pmev-math:latest` acoplado a `gemma4:31b-cloud`.
- **Prosa e Redação PT-BR:** `qwen-poetics:latest` + `Ling-3.0-tiny`.

### C. Tríade Agêntica Tier 2 por Assinatura (Jules · Stitch · Exa)
- Integração plena e verificação de DAG em `tests/test_sota_triad_mesh.py` e `tests/test_jules_bridge.py` (28/28 testes verdes).
- Devin contextualizado como superagente autônomo Tier 2 com motor SWA-1.6.

### D. Hermes Agent Desktop & Matriz Holográfica
- Localização da instalação em `AppData/Local/hermes` e reconhecimento dos condutores `stealth/space-bunny-alpha` e família MOA Laguna.
- Matriz holográfica atualizada com 100% dos 19 agentes:
  - `@sequenciador` (Prioridade 2, `fast_operations`, pipeline de ordenação);
  - `@historian` (Prioridade 2, `deep_thinking`, memória epistêmica e telemetria);
  - `@gemma4` (Prioridade 3, `fast_operations`, oráculo multimodal e inferência de borda).

---

## 3. Avaliação de Impacto da Sessão

```markdown
### Painel de Avaliacao de Impacto da Sessao (Agnostico Tier 1-2-3)

| Metrica de Impacto | Valor Medido | Status / Observacao |
| :--- | :--- | :--- |
| **Economia de Tokens MCP (S1)** | **-39.46%** | Poda dinamica de schemas irrelevantes |
| **Ingress Fast-Path S1** | **0.0518 ms** (51.8 us) | Triagem O(1) de tarefas sem compilar grafo |
| **Passivo de Pendencias** | **0 abertas** (reducao: 0.0%) | Resolucao formal via M.O. 13.F |
| **Integridade do Ledger** | **89 registros** (tail: `26dc09ad`) | Portao acumulado: 3 sessoes |
| **Resolucao de Tarefas SQLite** | **100.0%** (0/0) | 0 pendencias residuais ou falhas |
| **Pools OpenRouter Multi-Tier** | **16 chaves** (16 ativas, score: 80.0) | T1: 3 | T2: 3 | T3: 5 | T4: 5 (0 bloq / 0 rev) |
| **Eficiencia Economica & Infra** | **14 cloud / 13 locais** | Cotas Pro Tier 1 prioritarias (Faixa.FLAT_FEE) |
```

---

## 4. Calibração e Auditoria de Feedback

- **Score atribuído:** `9.5`
- **Feedback qualitativo (verbatim):**
  > "Tiro 0.5 por não ter olhado as periferias e visto a obviedade: modelos obsoletos e descontinuados ainda ocupando espaço e função no nosso ecossistema."
- **Registro no Ledger:** Gravado na sequência 88 (`26dc09ad590b501d01554273210e36ae00847ebc8d8c2f8238e4da1fc701a082`).
- **Verificação:** `Test-AgentCalibrationLedger.ps1` validou 89 registros íntegros com tail correspondente.
- **Portão Estrutural de Calibração:** Atingiu 3 sessões distintas acumuladas, abrindo formalmente o portão de evidência (`structural_gate_passed: true`). Evidência registrada em `reports/agent-calibration/daily/2026-09-30.json`.
