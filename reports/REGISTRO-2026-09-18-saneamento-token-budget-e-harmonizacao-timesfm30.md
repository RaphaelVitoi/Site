---
id: registro-2026-09-18-saneamento-token-budget-e-harmonizacao-timesfm30
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-18T09:27:00-03:00'
atualizado_em: '2026-09-18T09:27:00-03:00'
classes: [interno, medido, governanca, qualidade, timesfm, dream-rsi]
caminhos:
  - reports/REGISTRO-2026-09-18-saneamento-token-budget-e-harmonizacao-timesfm30.md
  - AGENTS.md
  - GEMINI.md
  - engine/dream_timesfm_forecaster.py
  - engine/timesfm_engine.py
  - scripts/cli/nexus.py
  - tests/test_dream_rsi_integration.py
  - tests/test_timesfm_engine.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: a78455c3
  data_das_medicoes: 2026-09-18
verificado:
  - saneamento do token budget de customizacoes no Antigravity de 21.177 para 9.942 tokens (-53.1%, margem livre de +50.3%)
  - desativacao do plugin ocioso firebase em config/config.json e arquivamento de 34 skills em config/skills_archive
  - harmonizacao do TimesFM 3.0 para pesquisa academica nao-comercial com resolucao de aliases e is_research_mode
  - fabrica DreamTimesFMForecaster.for_research e integracao com TimesFMPredictivePolicy no Dream-RSI
  - CLI nexus stats timesfm, agent dream-optimize e calibration-forecast suportam TimesFM 3.0 e modo pesquisa
  - 45 testes pytest (test_timesfm_engine, test_dream_rsi_integration, test_dream_rsi_consumidores) 100% verdes em 3.61s
  - ruff check e record_gate 100% limpos com zero erros e zero warnings
nao_verificado:
  - pesos neurais reais do TimesFM 3.0 em GPU local (ambiente sem GPU dedicada opera sob extrapolacao analitica)
---

# Saneamento do Token Budget & Harmonizacao do Google TimesFM 3.0

Duas frentes concluidas e integradas sob governanca do Tier 0 em 2026-09-18.

## 1. Saneamento do Token Budget de Customizacoes (Google Antigravity)

O estouro critico de 105,9% (21.177 tokens / teto de 20.000) provocava a exclusao automatica de 4 skills
essenciais na IDE. A remedia definitiva foi executada:

1. **Desativacao do plugin Firebase:** O ecossistema opera exclusivamente sob Supabase. O plugin Firebase
   foi desativado em `config/config.json`, liberando 914 tokens e removendo uma entrada corrompida de ~25.000
   caracteres em `globalPermissionGrants`.
2. **Isolamento de Skills de Dados GCP:** 34 skills pesadas de dados foram isoladas para `config/skills_archive`,
   liberando 5.502 tokens no diretorio quente.
3. **Ponteiros de Governanca:**
   - `Site/AGENTS.md` reduzido de 2.143 B para 1.300 B (-38,4%).
   - `Site/GEMINI.md` reduzido de 5.216 B para 2.385 B (-54,3%).
   - `~/.gemini/AGENTS.md` reduzido de 1.685 B para 940 B (-44,2%).
4. **Metrica Final:** Pegada total caiu para **9.942 tokens (49,7%)**, assegurando **10.058 tokens de folga (+50,3%)**
   e eliminando o truncamento de skills.

## 2. Harmonizacao e Otimizacao do Google TimesFM 3.0 (Pesquisa Nao-Comercial)

Adequacao do modelo de 330M parametros (`google/timesfm-3.0-pytorch`) para uso estrito em pesquisa:

1. **Resolucao de Aliases e Governanca:**
   - `engine/timesfm_engine.py` introduz `TIMESFM_ALIASES` para normalizar `3.0`, `timesfm-3.0` e `330m`.
   - Propriedade `.is_research_mode` exposta no `TimesFMEngine`.
   - Conformidade mantida com a `TimesFM Non-Commercial License v1.0 (Apenas Pesquisa)`.
2. **Ponte Dream-RSI:**
   - Adicionada a fabrica `DreamTimesFMForecaster.for_research("3.0")` em `engine/dream_timesfm_forecaster.py`.
   - `TimesFMPredictivePolicy` agora avalia a poda preditiva orientada a series temporais na arvore de descoberta.
3. **CLI Nexus:**
   - `nexus stats timesfm`: Suporte a `--model / -M`, detectando automaticamente o modo pesquisa ao passar `3.0`.
   - `nexus agent dream-optimize`: Suporte a `--model 3.0` e `--research`, avaliando 364 arvores reais com score 90.0732.
   - `nexus agent calibration-forecast`: Suporte a `--mode research` e `--model 3.0`.
4. **Cobertura de Testes:**
   - 45 testes automatizados aprovados em 3.61s (`test_timesfm_engine.py`, `test_dream_rsi_integration.py`, `test_dream_rsi_consumidores.py`).
