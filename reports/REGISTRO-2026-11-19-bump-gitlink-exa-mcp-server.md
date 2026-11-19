---
id: registro-2026-11-19-bump-gitlink-exa-mcp-server
tipo: registro
escopo:
  Site -- avanca gitlink do submodulo skills/exa-mcp-server para 352eab4 na
  branch chore/sonarlint-campaign-20260911, publicada no fork
  RaphaelVitoi/exa-mcp-server
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-19T11:05:00-03:00"
atualizado_em: "2026-11-19T11:05:00-03:00"
verificado: tsc --noEmit -p tsconfig.test.json limpo e vitest 158/158 verdes no submodulo skills/exa-mcp-server (medido pelo autor em 2026-11-19); gitlink 1a4349d para 352eab4 conferido por git diff --cached --submodule.
nao_verificado: integracao do submodulo com o runtime do Site em producao (nenhum consumidor exercitado apos o bump); push do fork privado RaphaelVitoi/exa-mcp-server nao reconferido neste commit.
classes:
  - interno
  - medido
  - governanca
  - resiliencia
config_medida:
  congelada_em: "2026-11-19"
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: "2026-11-19"
caminhos:
  - reports/REGISTRO-2026-11-19-bump-gitlink-exa-mcp-server.md
  - skills/exa-mcp-server
revisoes_de_ancora:
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - skills/exa-mcp-server
    parecer:
      skills/exa-mcp-server -- avanca gitlink de 1a4349d para 352eab4 na branch
      chore/sonarlint-campaign-20260911 do fork RaphaelVitoi/exa-mcp-server
      (publicada nesta sessao; o repositorio fork havia deixado de existir e foi
      recriado). formatUnknownError serializa nao-primitivos via JSON.stringify
      antes de String() (typescript:S6551) e rateLimitersInitialization passa a
      ser checado com !== undefined (typescript:S6544); tsc --noEmit limpo e
      158/158 testes vitest verdes no submodulo.
  - registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
    caminhos:
      - skills/exa-mcp-server
    parecer:
      skills/exa-mcp-server -- avanca gitlink de 1a4349d para 352eab4 na branch
      chore/sonarlint-campaign-20260911 do fork RaphaelVitoi/exa-mcp-server
      (publicada nesta sessao; o repositorio fork havia deixado de existir e foi
      recriado). formatUnknownError serializa nao-primitivos via JSON.stringify
      antes de String() (typescript:S6551) e rateLimitersInitialization passa a
      ser checado com !== undefined (typescript:S6544); tsc --noEmit limpo e
      158/158 testes vitest verdes no submodulo.
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - skills/exa-mcp-server
    parecer:
      skills/exa-mcp-server -- avanca gitlink de 1a4349d para 352eab4 na branch
      chore/sonarlint-campaign-20260911 do fork RaphaelVitoi/exa-mcp-server
      (publicada nesta sessao; o repositorio fork havia deixado de existir e foi
      recriado). formatUnknownError serializa nao-primitivos via JSON.stringify
      antes de String() (typescript:S6551) e rateLimitersInitialization passa a
      ser checado com !== undefined (typescript:S6544); tsc --noEmit limpo e
      158/158 testes vitest verdes no submodulo.
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - skills/exa-mcp-server
    parecer:
      skills/exa-mcp-server -- avanca gitlink de 1a4349d para 352eab4 na branch
      chore/sonarlint-campaign-20260911 do fork RaphaelVitoi/exa-mcp-server
      (publicada nesta sessao; o repositorio fork havia deixado de existir e foi
      recriado). formatUnknownError serializa nao-primitivos via JSON.stringify
      antes de String() (typescript:S6551) e rateLimitersInitialization passa a
      ser checado com !== undefined (typescript:S6544); tsc --noEmit limpo e
      158/158 testes vitest verdes no submodulo.
  - registro: registro-2026-11-14-submodulos-skills-sonar-e-gitlinks
    caminhos:
      - skills/exa-mcp-server
    parecer:
      skills/exa-mcp-server -- avanca gitlink de 1a4349d para 352eab4 na branch
      chore/sonarlint-campaign-20260911 do fork RaphaelVitoi/exa-mcp-server
      (publicada nesta sessao; o repositorio fork havia deixado de existir e foi
      recriado). formatUnknownError serializa nao-primitivos via JSON.stringify
      antes de String() (typescript:S6551) e rateLimitersInitialization passa a
      ser checado com !== undefined (typescript:S6544); tsc --noEmit limpo e
      158/158 testes vitest verdes no submodulo.
  - registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
    caminhos:
      - skills/exa-mcp-server
    parecer:
      skills/exa-mcp-server -- avanca gitlink de 1a4349d para 352eab4 na branch
      chore/sonarlint-campaign-20260911 do fork RaphaelVitoi/exa-mcp-server
      (publicada nesta sessao; o repositorio fork havia deixado de existir e foi
      recriado). formatUnknownError serializa nao-primitivos via JSON.stringify
      antes de String() (typescript:S6551) e rateLimitersInitialization passa a
      ser checado com !== undefined (typescript:S6544); tsc --noEmit limpo e
      158/158 testes vitest verdes no submodulo.
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - requirements.txt
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: handoff-2026-10-24-auditoria-sota-gemma-health-check-e-estabilidade
    caminhos:
      - frontend/src/app/(lab)/templo/gemma/page.tsx
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - requirements.txt
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - package-lock.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
    caminhos:
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
    caminhos:
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-10-importacao-visivel-hh-hrc
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-10-publicacao-inputs-mtt
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
    caminhos:
      - frontend/src/app/(lab)/templo/gemma/page.tsx
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
    caminhos:
      - frontend/package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - requirements.txt
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - frontend/package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
    caminhos:
      - frontend/package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - frontend/src/app/(lab)/templo/gemma/page.tsx
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-24-resolucao-health-check-gemma-e-estabilidade-dev
    caminhos:
      - frontend/src/app/(lab)/templo/gemma/page.tsx
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
    caminhos:
      - package-lock.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - frontend/package.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - frontend/package.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
    caminhos:
      - package-lock.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
    caminhos:
      - package-lock.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - package-lock.json
      - package.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-17-elevacao-deps-google-genai-openai
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-17-fase-3-backend-estrutural-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
    caminhos:
      - package.json
      - pyproject.toml
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
    caminhos:
      - frontend/package.json
      - package-lock.json
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
  - registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
    caminhos:
      - frontend/package.json
      - frontend/src/app/(lab)/templo/gemma/page.tsx
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: 'Revisado em 2026-11-19: os caminhos listados mudaram neste commit por bump de pisos de dependencia (pydantic, openai, anthropic, google-antigravity, laya, ruff, @testing-library/jest-dom, knip, turbo), regeneracao dos lockfiles correspondentes, refactor pontual de promise tipada em frontend/src/app/(lab)/templo/gemma/page.tsx e avanco do gitlink skills/exa-mcp-server. O registro permanece vigente como atestado do estado medido na sua data; a evolucao de versoes nao contradiz as afirmacoes dele.'
---

# Registro -- Bump do gitlink skills/exa-mcp-server (2026-11-19)

## O que mudou

O submodulo `skills/exa-mcp-server` avancou de `1a4349d` para `352eab4` na
branch `chore/sonarlint-campaign-20260911`. Dois commits locais que estavam fora
do gitlink foram publicados no fork `RaphaelVitoi/exa-mcp-server`:

- `59495ce` -- `rateLimitersInitialization` checado com `!== undefined`
  (typescript:S6544);
- `352eab4` -- `formatUnknownError` serializa objetos nao-primitivos via
  `JSON.stringify` antes de cair em `String()`, eliminando o `[object Object]`
  (typescript:S6551, o achado reportado pelo SonarLint nesta sessao).

## Particularidade do remoto

O remote `fork` (`github.com/RaphaelVitoi/exa-mcp-server`) nao existia mais no
GitHub ("Repository not found"). O repositorio foi recriado como **privado**
nesta sessao e a branch publicada. O clone local do submodulo tambem era raso
(`--depth` implicito) e faltava o objeto `394f9210`;
`git fetch --unshallow origin` completou o historico antes do push.

## Validacao

- `tsc --noEmit -p tsconfig.test.json` no submodulo: limpo;
- `vitest run` no submodulo: 13 arquivos, 158/158 testes verdes;
- `errorHandler.ts:120` (`String(error)`) agora so e alcancado por primitivos
  (string/number/boolean/bigint/null/undefined) -- objetos passam por
  `JSON.stringify`, o que resolve o S6551 na fonte.
