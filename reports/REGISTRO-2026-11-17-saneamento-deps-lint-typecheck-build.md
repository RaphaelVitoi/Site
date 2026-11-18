---
id: registro-2026-11-17-saneamento-deps-lint-typecheck-build
tipo: registro
escopo: Site -- elevacao fastapi/openai/anthropic, sincronia requirements.txt, saneamento Pyright/Ruff/SonarLint/Tailwind/Mermaid/Markdownlint
  e validacao de build Next.js
ecossistema: nexus-sota
autor: Antigravity (Gemini 4 Hydrogen) <raphavitoi@gmail.com>
criado_em: '2026-11-17T22:00:00-03:00'
atualizado_em: '2026-11-17T22:08:00-03:00'
commit: HEAD
classes:
- interno
- medido
- governanca
- registro
caminhos:
- .vscode/settings.json
- docs/GOVERNANCA_PIRAMIDAL_SOTA.md
- engine/pmev_operators.py
- frontend/src/app/(lab)/simulador/loading.tsx
- frontend/src/components/simulator/ui/ToolContent.tsx
- memory/feedback/feedback_20261115_calibracao_arvore_zoomout_selo_gemini4.md
- pyproject.toml
- requirements.txt
- tests/test_estado_global_limitado_fase3.py
- uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-17'
verificado:
- 'npm run check:fast: ruff check . (All checks passed), pyright --project pyproject.toml (0 errors, 0 warnings, 0 informations),
  eslint . (ok), tsc --build tsconfig.json (ok).'
- 'npm run lint:md: markdownlint em todos os .md sem erros.'
- 'npm run build: tsc -b tsconfig.worker.json e next build (70/70 paginas estaticas geradas, exit 0).'
- 'pytest tests/test_estado_global_limitado_fase3.py -q: 6 passed.'
- 'pytest tests/test_requirements_sync.py -q: 4 passed.'
- 'pytest -k pmev -q: 207 passed, 2104 deselected.'
nao_verificado:
- skills/exa-mcp-server tsc --noEmit sem node_modules locais no submodulo (validacao limitada as linhas editadas)
- testes E2E visuais Playwright (nao alterados nem exigidos por este escopo)
referencias_nao_resolviveis: []
revisoes_de_ancora:
- registro: auditoria-2026-09-13-rearquitetura-computacional-pmev
  caminhos:
  - engine/pmev_operators.py
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: anotacao de tipo explicita self.p_ruin: NDArray[np.float64]
    em BarrierAbsorptionOperator. O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0). O escopo medido
    e os contratos originais deste registro permanecem validos.'
- registro: handoff-2026-09-13-rearquitetura-computacional-pmev
  caminhos:
  - engine/pmev_operators.py
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: anotacao de tipo explicita self.p_ruin: NDArray[np.float64]
    em BarrierAbsorptionOperator. O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: handoff-2026-09-23-sincronia-editor-calibracao-e-gate
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: handoff-2026-11-10-boot-persistente-mesh-mcp-e-cockpit
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: handoff-2026-11-14-decision1-laya-s1-s2-e-ancoras
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-09-04-otimizacao-settings-seguranca-e-io
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-09-09-configuracoes-ide-e-calibracao-diaria
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-09-13-pmev-contratos-baselines-composicao-e-skill
  caminhos:
  - engine/pmev_operators.py
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: anotacao de tipo explicita self.p_ruin: NDArray[np.float64]
    em BarrierAbsorptionOperator. O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-09-13-rearquitetura-computacional-pmev
  caminhos:
  - engine/pmev_operators.py
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: anotacao de tipo explicita self.p_ruin: NDArray[np.float64]
    em BarrierAbsorptionOperator. O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-09-14-saneamento-linter-e-tipagem-tests-e-skills
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: sincronizacao do lockfile via uv lock/sync --all-extras para
    fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os contratos originais deste registro permanecem
    validos.'
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: sincronizacao do lockfile via uv lock/sync --all-extras para
    fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os contratos originais deste registro permanecem
    validos.'
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux;
    bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0; sincronizacao do lockfile via uv lock/sync
    --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os contratos originais deste registro
    permanecem validos.'
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - .vscode/settings.json
  - docs/GOVERNANCA_PIRAMIDAL_SOTA.md
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux;
    formatacao de rotulos Mermaid FLEET e INTEGRATORS em linha unica com \n. O escopo medido e os contratos originais deste
    registro permanecem validos.'
- registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: sincronizacao do lockfile via uv lock/sync --all-extras para
    fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os contratos originais deste registro permanecem
    validos.'
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux;
    bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0; espelho de runtime sincronizado com pyproject.toml
    (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao do lockfile via uv lock/sync --all-extras para fastapi
    0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux;
    bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0. O escopo medido e os contratos originais
    deste registro permanecem validos.'
- registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux;
    bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0; sincronizacao do lockfile via uv lock/sync
    --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os contratos originais deste registro
    permanecem validos.'
- registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux;
    bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0; sincronizacao do lockfile via uv lock/sync
    --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os contratos originais deste registro
    permanecem validos.'
- registro: registro-2026-11-10-google-genai-3-1-0
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-12-review-sweeps-endurecimento-sota
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
  caminhos:
  - .vscode/settings.json
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux;
    bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0; sincronizacao do lockfile via uv lock/sync
    --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os contratos originais deste registro
    permanecem validos.'
- registro: registro-2026-11-14-stitch-skills-tsconfig-e-refatoracoes-sonar
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    sincronizacao do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo
    medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-15-calibracao-presencial-gemini4-c1-c8
  caminhos:
  - memory/feedback/feedback_20261115_calibracao_arvore_zoomout_selo_gemini4.md
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: correcao MD032 e MD038 (crases duplas no exemplo de selo).
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-15-clangd-vscode-compile-commands
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-15-start-vulkan-daemon-e-license-plaintext
  caminhos:
  - .vscode/settings.json
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: ajuste local de formatador jsonc e flag chatgpt.runCodexInWindowsSubsystemForLinux.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-17-elevacao-deps-google-genai-openai
  caminhos:
  - pyproject.toml
  - requirements.txt
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); sincronizacao
    do lockfile via uv lock/sync --all-extras para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os
    contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
  caminhos:
  - frontend/src/app/(lab)/simulador/loading.tsx
  - frontend/src/components/simulator/ui/ToolContent.tsx
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: substituicao de aspect-[16/10] pela classe canonica aspect-16/10;
    isolamento de ScenarioCockpitProps via Omit e desestruturacao explicita em ToolContent (S6767). O escopo medido e os contratos
    originais deste registro permanecem validos.'
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - pyproject.toml
  - requirements.txt
  - tests/test_estado_global_limitado_fase3.py
  - uv.lock
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0); tipagem Iterator[None]
    na fixture e unificacao da assercao final sem yoda condition; sincronizacao do lockfile via uv lock/sync --all-extras
    para fastapi 0.163.2, openai 3.54.0 e anthropic 2.10.0. O escopo medido e os contratos originais deste registro permanecem
    validos.'
- registro: registro-2026-11-17-fase-4-governanca-estrutural-sota
  caminhos:
  - docs/GOVERNANCA_PIRAMIDAL_SOTA.md
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: formatacao de rotulos Mermaid FLEET e INTEGRATORS em linha
    unica com \n. O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
  caminhos:
  - pyproject.toml
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0.
    O escopo medido e os contratos originais deste registro permanecem validos.'
- registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
  caminhos:
  - pyproject.toml
  - requirements.txt
  parecer: 'Revisado em 2026-11-17 contra o diff deste commit: bump de piso minimo de fastapi>=0.163.2, openai>=3.54.0 e anthropic>=2.10.0;
    espelho de runtime sincronizado com pyproject.toml (fastapi>=0.163.2, openai>=3.54.0, anthropic>=2.10.0). O escopo medido
    e os contratos originais deste registro permanecem validos.'
---

# Registro de Saneamento, Elevacao de Deps e Build

Registro de reconciliacao de ancoras para as alteracoes validadas em `check:fast`, `lint:md`, `build` e `pytest`.
