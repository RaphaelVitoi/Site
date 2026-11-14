---
id: registro-2026-11-14-stitch-skills-tsconfig-e-refatoracoes-sonar
tipo: registro
escopo: Site -- tsconfig/tipagem .agents/skills, remocao de exclude **/skills/** em settings.json e refatoracoes Sonar/Pyrefly
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-14T14:01:00-03:00'
atualizado_em: '2026-11-14T14:01:00-03:00'
classes:
  - interno
  - medido
  - governanca
  - otimizacao
config_medida:
  congelada_em: '2026-11-14'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-14'
caminhos:
  - .agents/skills/tsconfig.json
  - .agents/skills/types/skill-targets.d.ts
  - .agents/skills/types/stubs-remotion/examples/ScreenSlide.d.ts
  - .agents/skills/types/stubs-remotion/screens.d.json.ts
  - .agents/skills/types/stubs-rn/src/theme.d.ts
  - .vscode/settings.json
  - llm/laya_bridge.py
  - llm/system2_local.py
  - reports/REGISTRO-2026-11-14-stitch-skills-tsconfig-e-refatoracoes-sonar.md
  - tests/test_ollama_cloud.py
revisoes_de_ancora:
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- remove **/skills/** dos excludes do SonarLint (mantendo skills/** e demais exclusoes) e preserva files.autoSave off sem alterar CWV ou hooks.
  - registro: auditoria-2026-09-22-paridade-config-identidade
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- remove **/skills/** dos excludes do SonarLint e atualiza files.autoSave para off sem alterar paridade de identidade.
  - registro: auditoria-2026-09-24-laya-multilingual-s1
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- extrai helpers _extract_tokens_from_usage, _build_remote_predict_body e _record_service_failure_cooldown (S3776) preservando contratos.
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- extrai helpers internos preservando assinaturas publicas de laya_predict e laya_predict_batch.
  - registro: handoff-2026-09-22-paridade-config-identidade
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- remove **/skills/** dos excludes do SonarLint e atualiza files.autoSave para off sem afetar identidade ou gateways.
  - registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- ajuste restrito a sonarlint.analysisExcludes/Standalone e files.autoSave; configuracoes MCP inalteradas.
  - registro: handoff-2026-09-23-sincronia-editor-calibracao-e-gate
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- remove **/skills/** dos excludes do SonarLint e calibra files.autoSave off preservando regras e paths.
  - registro: handoff-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- refatoracao de complexidade cognitiva (_extract_tokens_from_usage, _build_remote_predict_body, _record_service_failure_cooldown) sem mudar protocolos de homologacao.
  - registro: handoff-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- extracao de helpers mantendo integracao S1 e testes verdes.
  - registro: handoff-2026-11-10-boot-persistente-mesh-mcp-e-cockpit
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- ajuste pontual em sonarlint excludes e files.autoSave off sem alterar boot persistente ou mesh MCP.
  - registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
    caminhos:
      - .vscode/settings.json
      - llm/laya_bridge.py
      - llm/system2_local.py
    parecer: .vscode/settings.json -- remove **/skills/** do SonarLint e define files.autoSave off; llm/laya_bridge.py -- extrai helpers para reduzir S3776; llm/system2_local.py -- extrai _CONTENT_TYPE_JSON e remove int(resp.status) redundante mantendo comportamento S1/S2.
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- refatoracao puramente estrutural preservando o contrato S1-S2 PMev.
  - registro: registro-2026-09-04-otimizacao-settings-seguranca-e-io
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- mantidas travas de seguranca e I/O; alterados apenas sonarlint excludes (**/skills/**) e files.autoSave.
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- regras de markdownlint intactas; alterados apenas sonarlint excludes e files.autoSave.
  - registro: registro-2026-09-09-configuracoes-ide-e-calibracao-diaria
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- ajuste deliberado em sonarlint excludes e files.autoSave off mantendo restante da calibracao IDE.
  - registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- ajuste pontual em sonarlint excludes e files.autoSave sem impacto multimodal.
  - registro: registro-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- remove **/skills/** dos excludes do SonarLint para auditar .agents/skills e preserva regras de linter.
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- remove **/skills/** dos excludes do SonarLint e atualiza files.autoSave para off.
  - registro: registro-2026-09-14-saneamento-linter-e-tipagem-tests-e-skills
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- amplia cobertura SonarLint para .agents/skills e mantem files.autoSave off.
  - registro: registro-2026-09-23-evolucao-pendencias-laya-e-tarefas
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- extrai helpers _extract_tokens_from_usage, _build_remote_predict_body e _record_service_failure_cooldown sem novas pendencias.
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- refatoracao de legibilidade preservando compatibilidade ASCII e CLI.
  - registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- helpers extraidos mantendo fluxos de GPU e solver bridge intactos.
  - registro: registro-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- preservado roteamento multilingual S1 apos extracao de helpers.
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- eliminada complexidade cognitiva excessiva (S3776) alinhada ao saneamento IDE.
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- ajuste de excludes SonarLint e files.autoSave off mantendo tipagem e paths do workspace.
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- exposicao intencional de .agents/skills ao SonarLint mantendo regras ativas e zero exclusao indevida.
  - registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- ajuste em excludes SonarLint e files.autoSave mantendo conformidade Prettier.
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- remove **/skills/** dos excludes para monitorar .agents/skills diretamente no editor.
  - registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- alteracao pontual em excludes SonarLint e files.autoSave preservando integridade do quality gate.
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- alteracao em excludes SonarLint e files.autoSave mantendo baseline limpo.
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- ajuste pontual em excludes SonarLint e files.autoSave sem impacto nas dependencias Monte Carlo.
  - registro: registro-2026-10-31-refatoracao-cfr-tipagem-e-higiene
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- ajuste em excludes SonarLint e files.autoSave preservando regras de tipagem.
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- habilita auditoria SonarLint sobre .agents/skills e mantem files.autoSave off.
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- ajuste pontual em excludes SonarLint e files.autoSave preservando integracao Jules/linters.
  - registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- ajuste em excludes SonarLint e files.autoSave sem alterar configuracoes Antigravity SDK.
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - .vscode/settings.json
    parecer: .vscode/settings.json -- preservados extraPaths do Pylance; ajustados apenas excludes SonarLint e files.autoSave.
  - registro: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
    caminhos:
      - llm/system2_local.py
    parecer: llm/system2_local.py -- extrai constante _CONTENT_TYPE_JSON (S1192) e remove int() redundante mantendo intacta a arquitetura llama-vulkan S1/S2.
  - registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
    caminhos:
      - llm/system2_local.py
    parecer: llm/system2_local.py -- mantem refactors Sonar previos adicionando _CONTENT_TYPE_JSON e limpeza de conversao redundante.
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - .vscode/settings.json
      - llm/system2_local.py
    parecer: .vscode/settings.json -- ajuste em excludes SonarLint e files.autoSave; llm/system2_local.py -- constante _CONTENT_TYPE_JSON e remocao de int(resp.status) redundante.
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- decomposicao complementar com helpers privados para fechar S3776 sem alterar assinaturas.
  - registro: registro-2026-11-14-refino-laya-tracker-e-furb110
    caminhos:
      - llm/laya_bridge.py
    parecer: llm/laya_bridge.py -- preservada simplificacao FURB110 junto com os novos helpers privados (_extract_tokens_from_usage, _build_remote_predict_body, _record_service_failure_cooldown).
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - tests/test_ollama_cloud.py
    parecer: tests/test_ollama_cloud.py -- cria corrotinas fora dos blocos pytest.raises (python:S5778) mantendo os 3 testes de circuit-breaker HTTP 402 e cobertura inalterada.
verificado:
  - ruff check, ruff format --check e pyright (0 erros, 0 warnings) em llm/laya_bridge.py, llm/system2_local.py e tests/test_ollama_cloud.py
  - prettier --check aprovado em .agents/skills/tsconfig.json, .agents/skills/types/skill-targets.d.ts, types/stubs-remotion e types/stubs-rn
  - tsc -p .agents/skills/tsconfig.json com 0 erros e npm run typecheck (frontend) com saida 0
  - pytest tests/test_laya_bridge.py tests/test_system2_local.py tests/test_ollama_cloud.py -- 47 passed in 23.10s (0 erros, 0 warnings)
nao_verificado:
  - Suite integral (executada via pre-commit/pre-push via suite_verde.py e npm run sota:audit) antes deste registro ser gravado
---

# Reconciliacao de Ancoras, Tipagem `.agents/skills` e Refatoracoes Sonar

1. **`.agents/skills/` (TypeScript isolado):** Criados `.agents/skills/tsconfig.json` e `.agents/skills/types/` (`skill-targets.d.ts`, `stubs-remotion/` e `stubs-rn/`) para tipar exemplos/templates multi-stack sem poluir `frontend/package.json`.
2. **`.vscode/settings.json`:** Removido `**/skills/**` dos excludes do SonarLint (mantendo `skills/**`) e calibrado `files.autoSave` para `off`.
3. **`llm/laya_bridge.py`, `llm/system2_local.py`, `tests/test_ollama_cloud.py`:** Extraidos helpers privados para reduzir complexidade cognitiva (`S3776`), constante `_CONTENT_TYPE_JSON` (`S1192`), remocao de `int()` redundante (Pyrefly) e isolamento das chamadas em `pytest.raises` (`S5778`).
4. **Reconciliacao:** Reconcilia as 42 ancoras vigentes sobre `.vscode/settings.json`, `llm/laya_bridge.py`, `llm/system2_local.py` e `tests/test_ollama_cloud.py`.
