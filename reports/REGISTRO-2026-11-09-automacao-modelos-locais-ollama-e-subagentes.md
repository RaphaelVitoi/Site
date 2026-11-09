---
id: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
tipo: registro
escopo: antigravity-ollama-local-models-warmup-subagents
autor: CHICO SOTA v8.0 GOLD
criado_em: '2026-11-09'
classes:
  - interno
  - medido
  - governanca
  - registro
  - backend
  - cli
verificado:
  - Integracao formal do catalogo LOCAL_OPTIMIZED_MODELS com daemon Ollama (:11434)
  - Pre-aquecimento (warmup) sub-segundo de qwen-code-surgical:latest e qwen-pmev-math:latest
  - Novos comandos de CLI nexus antigravity local-models e warmup com visualizacao em tabela Rich
  - Bindings declarativos de local_model e local_model_alias nos 5 subagentes customizados (~/.gemini/agents/*.md)
  - Automacao de warmup no ciclo de vida de inicializacao SOTA (Start-SOTA-Background.ps1 e Invoke-SotaServerLifecycle.ps1)
  - Execucao de suite com 28 testes unitarios e CLI passando com 100% verde (zero erros e zero warnings)
nao_verificado:
  - Execucao em producao conteinerizada sob Cloud Run / Docker
config_medida:
  congelada_em: '2026-11-09'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-09'
  toolchain: pytest + uv + ruff + record_gate.py
  python: 3.14.9
  so: Windows
referencias_nao_resolviveis:
  - scripts/ops/antigravity_sdk_bridge.py
  - tests/test_antigravity_bridge_root.py
caminhos:
  - llm/__init__.py
  - llm/antigravity_sdk_bridge.py
  - scripts/cli/nexus.py
  - scripts/ops/Invoke-SotaServerLifecycle.ps1
  - tests/test_antigravity_sdk_bridge.py
revisoes_de_ancora:
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-19-warning-sem-backtracking
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-08-skill-sota-server-lifecycle-warmup
    caminhos:
      - scripts/ops/Invoke-SotaServerLifecycle.ps1
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/__init__.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - scripts/ops/Invoke-SotaServerLifecycle.ps1
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-11-03-lifecycle-warmup-ensure-dev-frontend
    caminhos:
      - scripts/ops/Invoke-SotaServerLifecycle.ps1
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
  - registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
    caminhos:
      - llm/__init__.py
      - llm/antigravity_sdk_bridge.py
      - scripts/cli/nexus.py
      - tests/test_antigravity_sdk_bridge.py
    parecer: 'Reconciliacao em 2026-11-09: automacao e integracao de modelos locais otimizados Ollama (:11434) com a ponte Antigravity SDK e comandos nexus sem quebra de contratos preexistentes.'
---

# REGISTRO: Automacao e Integracao de Modelos Locais Otimizados Ollama com Antigravity SDK Mesh

## 1. Contexto & Motivacao
Integracao formal do ecossistema de inferencia on-device servido pelo daemon Ollama (:11434) com a ponte Google Antigravity SDK (`llm/antigravity_sdk_bridge.py` e `scripts/ops/antigravity_sdk_bridge.py`), eliminando latencia no primeiro token via rotinas de warmup JIT automatizadas.

## 2. Modelos Locais Integrados
- `qwen-code-surgical:latest`: 7.6B Q5_K_M, especializado em refatoracao cirurgica sob Target Lock.
- `qwen-pmev-math:latest`: 7.6B Q5_K_M, formulacao matematica PMev, GTO e inferencia Bayesiana.
- `qwen-poetics:latest`: 7.6B Q5_K_M, redacao de alta densidade semantica.
- `gemma4:e4b`: 7.5B Q4_K_M, raciocinio multimodal on-device com 131k context.
- `gemma4:12b`: 11.9B Q4_K_M, alta capacidade para governanca e analise de codigo.
- `qwen2.5-coder:1.5b` e `0.5b`: modelos leves para completacao e roteamento de baixa latencia.

## 3. Subagentes Customizados Vinculados
- `pmev-statistical-auditor.md` -> `local_model: qwen-pmev-math:latest`
- `rust-wasm-speedforce-engineer.md` -> `local_model: qwen-code-surgical:latest`
- `devtools-cwv-auditor.md` -> `local_model: gemma4:e4b`
- `security-zero-trust-auditor.md` -> `local_model: qwen-code-surgical:latest`
- `nucleo-governance-guardian.md` -> `local_model: gemma4:12b`

## 4. Validacao & Evidencias
- 28 testes automatizados em `Site/tests/test_antigravity_sdk_bridge.py` e `tests/test_antigravity_bridge_root.py` aprovados com zero erros e zero warnings.
- Portao de integridade Pure ASCII, ruff check e ruff format 100% aprovados.
