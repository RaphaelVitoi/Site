---
id: auditoria-2026-11-15-translategemma-timesfm-laya-roi
tipo: auditoria
escopo: Auditoria tecnica e de ROI para harmonizacao TranslateGemma 4B, TimesFM 2.5 XReg / 3.0 330M, recalibracao Laya 0.4.34 e correcao SHA-256 do ledger
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-15T15:42:00-03:00'
atualizado_em: '2026-11-15T15:42:00-03:00'
classes:
  - interno
  - medido
  - governanca
  - auditoria
config_medida:
  congelada_em: '2026-11-15'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-15'
  session_id: dee6e961-2afd-455c-b785-0e2341aa78d9
  conductor_model: gemini-4-hydrogen
  conductor_vehicle: antigravity
  supervision_mode: assistida
caminhos:
  - llm/translategemma.py
  - data/laya_poker_calibration.json
  - models/laya_s1_lora/adapter_manifest.json
  - reports/AUDITORIA-2026-11-15-translategemma-timesfm-laya-roi.md
verificado:
  - "TranslateGemma 4B executou ao vivo via Ollama (:11434) em nexus translate --tgt pt --local-only --json (2853.83 ms, weights_loaded=true, preserved_terms=['BTN'], cost_usd=0.0)"
  - "TimesFM 2.5 200M XReg (jax/jaxlib 0.12.0.1) e TimesFM 3.0 330M (weights_loaded=true, cache local google/timesfm-3.0-pytorch) executaram previsoes com covariaveis ao vivo; COMMERCIAL_PRODUCTION bloqueia TimesFM 3.0 com TimesFMGovernanceError"
  - "Laya 0.4.34 recalibrado em 100 trios reais de dream_history.db e daemon :8192 ativo respondendo 200 OK em /health, /predict e /solve"
  - "Suite direcionada de 14 modulos backend (264 passed em 67.47s), frontend Jest (111 suites, 743 tests), test_agent_calibration_feedback.py (4 passed), ruff check/format e pyright (0 errors)"
  - "CWV Quality Gate 5 fases verde em localhost:3000 + CDP :9223 (LCP 348.82 ms, CLS 0.000188, TBT 32.496 ms, TTFB 121.125 ms, MAX_HEAP 19.54 MB, 0 AXE violations, 0 CVE crit/high, SRI verified, Higiene 0 erros)"
nao_verificado:
  - "Efeitos de treinamento completo multi-epoca com GPU CUDA para Laya LoRA (--calibrate-only utilizado em CPU para evitar overfitting em 100 trios)"
  - "Consumo vivo de fallback cloud Aistudio/OpenRouter de TranslateGemma fora de mocks unitarios (evitado gasto desnecessario mantendo custo zero no Ollama local)"
---

# Auditoria Tecnica e de ROI -- Sessao `dee6e961-2afd-455c-b785-0e2341aa78d9`

## 1. Matriz de Observacao, Evidencia, Impacto e Confianca

| Fato Observado | Evidencia Direta | Impacto / ROI no Ecossistema | Confianca |
| :--- | :--- | :--- | :--- |
| TranslateGemma 4B ausente de runtime integrado | Novo modulo `llm/translategemma.py` + 7 consumidores (`system2_local.py`, `antigravity_sdk_bridge.py`, `laya_bridge.py`, `memory_rag.py`, `api/v1/handlers.py` + `api/v1/server.py`, `scripts/cli/nexus.py`, `data/ollama_models.json`) | Roteamento zero-custo (`\$0.00`) para traducao de texto/imagem multimodal e normalizacao multilingue pre-S1/RAG mantendo jargoes de poker/codigo intactos | Alta (executado ao vivo no Ollama `:11434` e testado em `tests/test_translategemma.py`) |
| TimesFM 2.5 XReg sem backend JAX e TimesFM 3.0 sem snapshot local | Instalado `jax==0.12.0.1` + `jaxlib==0.12.0.1` + snapshot local `google/timesfm-3.0-pytorch`; covariaveis unificadas e gate `RESEARCH_BENCHMARK` vs `COMMERCIAL_PRODUCTION` em `engine/timesfm_engine.py` | Ativa regressao exogena XReg real para series de EV/bankroll em producao (Apache 2.0 via 2.5) e libera pesquisa PMev de ponta (330M via 3.0) sem risco de violacao da licenca nao-comercial | Alta (pesos carregados e bloqueio comercial testados ao vivo) |
| Corpus SQLite vazio e manifest Laya com `"ece_after": NaN` | `seed_pmev_corpus_into_sqlite` semeou 100 trios reais em `data/dream_history.db`; `laya==0.4.34` recalibrou temperaturas (`[1.4930962324142456, 1.0, 5.0]`) em `data/laya_poker_calibration.json`; guarda `math.isfinite` em `scripts/ops/treinar_laya_s1_lora.py` sanou `models/laya_s1_lora/adapter_manifest.json` (`ece_after: null`); daemon `:8192` reiniciado | Elimina erro de parse JSON em `models/laya_s1_lora/adapter_manifest.json`, ancora decisoes S1 em dados reais HRC/aula12/PMev e reduz atrito de complexidade/tipagem para zero alertas `ruff` e `pyright` | Alta (validado no servidor `:8192` e via parser JSON) |
| Corrupcao silenciosa de hash SHA-256 para notas decimais nao-binarias (`9.3`) | Descoberto ao registrar o feedback `9.3` no ledger: `[decimal]9.3` serializava `9.300000000000000710542735760` em `scripts/ops/Register-AgentCalibrationFeedback.ps1` enquanto `scripts/ops/Test-AgentCalibrationLedger.ps1` relia como `[double]9.3`; corrigido via normalizacao `[int]`/`[double]` + novo teste em `tests/test_agent_calibration_feedback.py` | Evita corrupcao silenciosa da cadeia de custodia SHA-256 do ledger de calibracao para qualquer nota decimal nao-binaria (`9.1`, `9.3`, `9.7`, `9.8`) | Alta (reproduzido, corrigido e coberto por teste de regressao) |

## 2. Separacao Estrita: Fato Medido vs Inferencia

- **Fato Medido:** `scripts/ops/cwv_gate.ps1` falhou na primeira execucao apenas em `LCP_MS` (`7135ms`) e `TTFB_MS` (`6483ms`) quando `:3000` ainda estava frio / concorrente com `uv build`, passando imediatamente apos aquecimento na segunda execucao (`LCP 348.82ms`, `TTFB 121.125ms`, 0 erros, 0 warnings).
- **Inferencia (marcada):** O ganho de acuracia pratica em spot de poker apos calibracao de temperatura S1 em `data/laya_poker_calibration.json` deve melhorar a separacao entre confianca e abstencao em fronteiras ambiguas; medicao empírica longitudinal depende do acumulo de hand histories reais avaliados pelo operador.
- **Nao Verificado:** Caminho cloud Pago/Quota (`aistudio` / `openrouter`) do fallback de `TranslateGemma` foi exercitado apenas via mocks em `tests/test_translategemma.py`, preservando cota comercial para uso real em producao.
