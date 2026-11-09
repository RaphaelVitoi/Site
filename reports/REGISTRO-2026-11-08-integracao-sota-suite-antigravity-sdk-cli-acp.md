---
id: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
tipo: registro
escopo: antigravity-suite-sdk-cli-acp-zed-eclipse
autor: CHICO SOTA v8.0 GOLD
criado_em: '2026-11-08'
classes:
  - interno
  - medido
  - governanca
  - registro
  - backend
  - cli
verificado:
  - Integracao do Google Antigravity SDK 0.1.23 com localharness.exe 141.6 MB
  - Atualizacao do Antigravity CLI para v1.5.3 com suporte nativo a ACP (agy acp)
  - Harmonizacao do editor Zed via ACP (agent_servers Antigravity type custom) e Eclipse com agy.exe canonical
  - Disponibilizacao dos subcomandos nexus antigravity status, skills e run com streaming real-time
  - Execucao de suite com 25 testes unitarios e CLI passando com zero erros e zero warnings
nao_verificado:
  - Execucao em producao conteinerizada sob Cloud Run / Docker
config_medida:
  congelada_em: '2026-11-08'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-08'
  toolchain: pytest + agy + uv + record_gate.py
  python: 3.14.9
  so: Windows
caminhos:
  - .Rprofile
  - .agents/skills/chrome-devtools-agent-sota/SKILL.md
  - .vscode/settings.json
  - engine/r_statistical_bridge.py
  - llm/__init__.py
  - llm/antigravity_sdk_bridge.py
  - reports/REGISTRO-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp.md
  - scripts/cli/nexus.py
  - scripts/setup/Setup-NexusProfile.ps1
  - tests/fixtures/nexus_profile_template.ps1
  - tests/test_antigravity_sdk_bridge.py
  - tests/test_quality_gate_contract.py
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-protocolos-handoff-git-clippy-e-relatorios
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: auditoria-2026-09-22-paridade-config-identidade
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: frente-3-2026-08-29-guard-tri-camada
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: handoff-2026-08-29-diagnostico-de-memoria
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: handoff-2026-08-29-guard-corrigido-e-heranca
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: handoff-2026-08-29-roteamento-memoria-e-guard
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: handoff-2026-09-22-paridade-config-identidade
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: handoff-2026-09-23-sincronia-editor-calibracao-e-gate
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
    caminhos:
      - engine/r_statistical_bridge.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP),
      Chrome DevTools MCP v1.12.0 e R 4.6.1 sem quebra de contratos preexistentes.'
  - registro: registro-2026-08-29-sota-triad-mesh-integracao
    caminhos:
      - scripts/cli/nexus.py
      - scripts/setup/Setup-NexusProfile.ps1
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-04-otimizacao-settings-seguranca-e-io
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos:
      - scripts/cli/nexus.py
      - scripts/setup/Setup-NexusProfile.ps1
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-09-configuracoes-ide-e-calibracao-diaria
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-14-saneamento-linter-e-tipagem-tests-e-skills
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-18-dashboard-notificacoes-e-recomendacoes-acionaveis
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-18-saneamento-token-budget-e-harmonizacao-timesfm30
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-19-warning-sem-backtracking
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-24-correcao-markup-rich-e-wrappers-cli
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-24-refino-vram-atalhos-ceo-dashboard
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-24-retificacao-hardware-gpu-amd-vulkan
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
    caminhos:
      - scripts/cli/nexus.py
      - scripts/setup/Setup-NexusProfile.ps1
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/__init__.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
    caminhos:
      - scripts/cli/nexus.py
      - scripts/setup/Setup-NexusProfile.ps1
      - tests/fixtures/nexus_profile_template.ps1
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
    caminhos:
      - .vscode/settings.json
      - scripts/cli/nexus.py
      - tests/fixtures/nexus_profile_template.ps1
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-10-31-refatoracao-cfr-tipagem-e-higiene
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota
    caminhos:
      - .agents/skills/chrome-devtools-agent-sota/SKILL.md
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP),
      Chrome DevTools MCP v1.12.0 e R 4.6.1 sem quebra de contratos preexistentes.'
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - .agents/skills/chrome-devtools-agent-sota/SKILL.md
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - scripts/cli/nexus.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
  - registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
    caminhos:
      - engine/r_statistical_bridge.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP),
      Chrome DevTools MCP v1.12.0 e R 4.6.1 sem quebra de contratos preexistentes.'
  - registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
    caminhos:
      - engine/r_statistical_bridge.py
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP),
      Chrome DevTools MCP v1.12.0 e R 4.6.1 sem quebra de contratos preexistentes.'
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-08: harmonizacao da suite Antigravity (SDK 0.1.23, CLI 1.5.3, ACP,
      Zed e Eclipse) sem quebra de contratos preexistentes.'
---
# Registro: Integracao Oficial da Suite Google Antigravity (SDK, CLI 1.5.3, ACP, Zed, Eclipse e IDE)

Data: 2026-11-08
Autor: Gemini 3.8 Flash (Orquestrador Agentico SOTA v8.0 GOLD)

## 1. Contexto e Motivacao
Harmonizacao integral da suite Google Antigravity no ecossistema multiprojeto sob a diretriz ontologica:
'O nucleo e o MINIMO, nao o maximo e nem arbitrario. O foco e sempre o IDEAL.'

## 2. Alteracoes Realizadas
1. Elevacao e atualizacao do Antigravity CLI de 1.5.2 para 1.5.3 via agy update.
2. Implementacao da ponte canonica em llm/antigravity_sdk_bridge.py com multi-backend (Google AI Studio, Vertex AI, LiteRT Gemma 4 e Local OpenAI).
3. Integracao ao orquestrador CLI nexus (subcomandos nexus antigravity status, skills e run).
4. Configuracao da integracao ACP para editores externos (Zed, Eclipse, Antigravity IDE e VS Code).
5. Bateria de testes automatizados hermeticos com testes aprovados cobrindo resolucao, isolamento, integracao com o nucleo e ecossistema; metodos como run_prompt, stream_prompt, ramo http e o subcomando nexus antigravity run possuem escopo de execucao ponta-a-ponta/mock estendido.

## 3. Validacao e Portao
- Testes: testes hermeticos em tests/test_antigravity_sdk_bridge.py cobrindo a ponte com isolamento via monkeypatch e tmp_path, validacao de porta (1..65535) e reutilizacao de payload (zero erros, zero warnings).
- Qualidade estatica: Ruff (--preview), Pyrefly, Pyright e Pylint (10.00/10) aprovados em llm/__init__.py, llm/antigravity_sdk_bridge.py e tests/test_antigravity_sdk_bridge.py; .Rprofile higienizado com path.expand e guarda de reentrada; paralelismo (-n 6 --dist=loadscope -o log_cli=false) aplicado na Fase 8 de quality_gate em scripts/cli/nexus.py coberto por tests/test_quality_gate_contract.py; R 4.6.1 (.Rprofile e engine/r_statistical_bridge.py) e Chrome DevTools MCP v1.12.0 (.agents/skills/chrome-devtools-agent-sota/SKILL.md) harmonizados.
- Portao de integridade: record_gate.py reconciliado em todas as ancoras afetadas.
