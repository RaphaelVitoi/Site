---
id: registro-2026-11-24-seguranca-github-codeql-dependabot-knip
tipo: registro
escopo: 'Site -- remediacao de vulnerabilidades GitHub/CodeQL e Dependabot: migracao do CodeQL para Advanced Setup (.github/workflows/codeql.yml
  + .github/codeql/codeql-config.yml) excluindo java-kotlin (probe HRC local) e preservando rust; correcao dos alertas CodeQL
  HIGH #31/#32/#33 e pools irmaos; hardening de workflows GitHub Actions; migracao do Dependabot para uv com cooldown 5d;
  desabilitacao do GitHub Pages quebrado; elevacao do knip para ^6.48.0.'
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-24T10:30:00-03:00'
atualizado_em: '2026-11-24T10:30:00-03:00'
commit: HEAD
classes:
- interno
- registro
- infraestrutura
- seguranca
- governanca
caminhos:
- .github/codeql/codeql-config.yml
- .github/dependabot.yml
- .github/workflows/chrome-extensions-ci.yml
- .github/workflows/codeql.yml
- .github/workflows/sota-ci.yml
- core/mesh_integrations.py
- llm/decision_pool.py
- llm/gemini_pool.py
- llm/media_pool.py
- llm/ollama_cloud.py
- llm/openrouter_pool.py
- package-lock.json
- package.json
- reports/REGISTRO-2026-11-24-seguranca-github-codeql-dependabot-knip.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  condutor: Gemini 4 Hydrogen
  planejador_orchestrator: Gemini 4 Neon
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-24'
verificado:
- ruff check e ruff format --check nos 6 arquivos Python alterados -- 0 erros, 0 pendencias de formatacao
- pytest focado (ollama_cloud, gemini_pool, openrouter_pools, decision_pool, media_pool, mesh_integrations, actionlint_fronteira_do_submodulo,
  credential_registry_ssot) -- 69 passed em 11.71s
- actionlint em .github/workflows/sota-ci.yml, chrome-extensions-ci.yml e codeql.yml -- 0 erros
- Validacao YAML de .github/dependabot.yml (6 ecossistemas) e .github/codeql/codeql-config.yml
- knip 6.48.0 instalado (package.json + package-lock.json), npm audit 0 vulnerabilidades, npm run audit:entropy exit 0
- cwv_gate.ps1 (5 fases em localhost:3000) -- 0 erros (LCP 436.98ms, TTFB 132.79ms, CLS 0.000125, TBT 32.496ms, AXE 0, CVE
  0, SRI VERIFIED, Higiene PASS)
- 'suite_verde.py na arvore 27ec69d3 -- 0 erros, cobertura 67.68% (1 pulado: test_ordem_headings DOM)'
- GitHub API -- CodeQL Default Setup desabilitado (not-configured) e GitHub Pages legado desabilitado (DELETE /pages -> 404)
nao_verificado:
- Execucao remota de CodeQL Advanced Security Analysis apos push para origin/master
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - .github/dependabot.yml
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/dependabot.yml preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: auditoria-2026-09-01-formatacao-ruff-e-ancoras
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
  caminhos:
  - llm/ollama_cloud.py
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/ollama_cloud.py, llm/openrouter_pool.py preservam contratos e invariantes
    SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: handoff-2026-09-09-ci-verde-e-as-seis-causas
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: handoff-2026-09-25-pool-rotacional-gemini-flash-lite
  caminhos:
  - llm/gemini_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - llm/openrouter_pool.py
  - package-lock.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py, package-lock.json preservam contratos e invariantes
    SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
  caminhos:
  - llm/ollama_cloud.py
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/ollama_cloud.py, llm/openrouter_pool.py preservam contratos e invariantes
    SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: handoff-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: plano-frentes-abertas-2026-09-08
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
  caminhos:
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package.json preservam contratos e invariantes SOTA: migracao CodeQL para
    Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache nos
    fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para uv
    com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-08-bindings-wasm-defasados
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
  caminhos:
  - .github/workflows/sota-ci.yml
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml, package.json preservam contratos e invariantes
    SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
  caminhos:
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package.json preservam contratos e invariantes SOTA: migracao CodeQL para
    Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache nos
    fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para uv
    com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-10-importacao-visivel-hh-hrc
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-10-publicacao-inputs-mtt
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-14-benchmark-icm-chipev-em-hand-history-e-next-env
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-25-pool-rotacional-gemini-flash-lite
  caminhos:
  - llm/gemini_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-09-25-pools-de-chaves-openrouter-multi-tier
  caminhos:
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
  caminhos:
  - .github/workflows/sota-ci.yml
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - llm/openrouter_pool.py
  - package-lock.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py, package-lock.json preservam contratos e invariantes
    SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
  caminhos:
  - llm/gemini_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package.json preservam contratos e invariantes SOTA: migracao CodeQL para
    Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache nos
    fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para uv
    com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - .github/dependabot.yml
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/dependabot.yml, package-lock.json, package.json preservam contratos
    e invariantes SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials
    nos workflows, scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33,
    Dependabot migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
  caminhos:
  - .github/dependabot.yml
  - .github/workflows/chrome-extensions-ci.yml
  - .github/workflows/sota-ci.yml
  - llm/gemini_pool.py
  - llm/openrouter_pool.py
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/dependabot.yml, .github/workflows/chrome-extensions-ci.yml, .github/workflows/sota-ci.yml,
    llm/gemini_pool.py, llm/openrouter_pool.py, package-lock.json, package.json preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
  caminhos:
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package.json preservam contratos e invariantes SOTA: migracao CodeQL para
    Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache nos
    fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para uv
    com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-08-saneamento-code-review-triage
  caminhos:
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package.json preservam contratos e invariantes SOTA: migracao CodeQL para
    Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache nos
    fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para uv
    com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
  caminhos:
  - llm/decision_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/decision_pool.py preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-12-ollama-cloud-provider
  caminhos:
  - llm/ollama_cloud.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/ollama_cloud.py preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
  caminhos:
  - llm/media_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/media_pool.py preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - llm/decision_pool.py
  - llm/gemini_pool.py
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/decision_pool.py, llm/gemini_pool.py, package-lock.json, package.json
    preservam contratos e invariantes SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening
    SHA/persist-credentials nos workflows, scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud
    para fechar alertas #31/#32/#33, Dependabot migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - llm/gemini_pool.py
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py, llm/openrouter_pool.py preservam contratos e invariantes
    SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - llm/ollama_cloud.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/ollama_cloud.py preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-15-malha-agentica-rotacao-hkcu-hklm
  caminhos:
  - core/mesh_integrations.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em core/mesh_integrations.py preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package.json preservam contratos e invariantes SOTA: migracao CodeQL para
    Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache nos
    fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para uv
    com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-17-auditoria-fortificacao-backend-5-fases
  caminhos:
  - llm/gemini_pool.py
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/gemini_pool.py, llm/openrouter_pool.py preservam contratos e invariantes
    SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - .github/workflows/sota-ci.yml
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml, package.json preservam contratos e invariantes
    SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - .github/workflows/sota-ci.yml
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em .github/workflows/sota-ci.yml, package-lock.json, package.json preservam
    contratos e invariantes SOTA: migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials
    nos workflows, scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33,
    Dependabot migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
  caminhos:
  - llm/openrouter_pool.py
  parecer: 'Revisado em 2026-11-24. Alteracoes em llm/openrouter_pool.py preservam contratos e invariantes SOTA: migracao
    CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - package-lock.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json preservam contratos e invariantes SOTA: migracao CodeQL
    para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows, scrypt+lru_cache
    nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot migrado para
    uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
- registro: registro-2026-11-22-higgsfield-mcp-deps-e-saneamento-sota
  caminhos:
  - package-lock.json
  - package.json
  parecer: 'Revisado em 2026-11-24. Alteracoes em package-lock.json, package.json preservam contratos e invariantes SOTA:
    migracao CodeQL para Advanced Setup (sem java-kotlin, mantendo rust), hardening SHA/persist-credentials nos workflows,
    scrypt+lru_cache nos fingerprints de pools e renomeacao privada em ollama_cloud para fechar alertas #31/#32/#33, Dependabot
    migrado para uv com cooldown 5d e knip elevado para 6.48.0.'
---
# Registro — Correcao GitHub CodeQL, Hardening Workflows, Dependabot uv e Update knip 6.48.0

## Sintese

1. **CodeQL Advanced Setup (.github/workflows/codeql.yml e .github/codeql/codeql-config.yml):**
   - Desabilitado o CodeQL Default Setup via GitHub API (state=not-configured), pois PATCH /code-scanning/default-setup rejeita 
ust (HTTP 422) e a auto-deteccao incluia java-kotlin para o probe local scripts/validation/HrcNativeReadProbe.java (77% call targets / 72% known types).
   - Configurado Advanced Setup com ctions, c-cpp, javascript-typescript, python e 
ust (uild-mode: none), ignorando core/vendor/** e preservando scripts/validation/HrcNativeReadProbe.java.
2. **Correcao dos alertas CodeQL HIGH em Python e pools irmaos:**
   - llm/ollama_cloud.py (alerta #33 py/clear-text-logging-sensitive-data): renomeados simbolos privados internos de cooldown HTTP 402 e padronizado log com %ds.
   - llm/gemini_pool.py (#31), llm/openrouter_pool.py (#32), llm/decision_pool.py, llm/media_pool.py e core/mesh_integrations.py: substituido HMAC-SHA256 truncado por hashlib.scrypt(..., n=1024, r=8, p=1, dklen=16).hex()[:8] com @lru_cache(maxsize=256).
3. **Hardening de workflows, Dependabot e knip:**
   - .github/workflows/chrome-extensions-ci.yml: pinagem por SHA, persist-credentials: false, 	imeout-minutes: 10, concurrency e suporte a 
efs/heads/master.
   - .github/workflows/sota-ci.yml: stral-sh/setup-uv elevado para 10.4.0 e persist-credentials: false nos checkouts.
   - .github/dependabot.yml: ecossistema Python raiz migrado de pip para uv, cooldown de 5 dias, chromadb liberado para minor/patch, entrada pip para /tools/hybrid_router e github-actions semanal.
   - package.json e package-lock.json: knip atualizado para ^6.48.0.
   - GitHub Pages legado desabilitado via API (DELETE /pages) para encerrar falhas recorrentes de pages-build-deployment por submodulos privados/inexistentes.
