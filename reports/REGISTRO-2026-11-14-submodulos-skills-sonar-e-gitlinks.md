---
id: registro-2026-11-14-submodulos-skills-sonar-e-gitlinks
tipo: registro
escopo: Site -- avanca gitlinks dos submodulos skills/exa-mcp-server, skills/gemini-cli-jules, skills/gemini-cli-security
  e skills/gemini-deep-research para commits publicados nos respectivos forks RaphaelVitoi
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-14T18:23:00-03:00'
atualizado_em: '2026-11-14T18:23:00-03:00'
classes:
  - interno
  - medido
  - governanca
  - resiliencia
config_medida:
  congelada_em: '2026-11-14'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-14'
caminhos:
  - reports/REGISTRO-2026-11-14-submodulos-skills-sonar-e-gitlinks.md
  - skills/exa-mcp-server
  - skills/gemini-cli-jules
  - skills/gemini-cli-security
  - skills/gemini-deep-research
revisoes_de_ancora:
  - registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
    caminhos:
      - skills/gemini-deep-research
    parecer: skills/gemini-deep-research -- avanca gitlink de 736e536c para bbed22a5 na branch fix/workflow-inline-release
      do fork RaphaelVitoi/gemini-cli-deep-research removendo async redundante em skills/gemini-deep-research/src/index.ts
      (tsc, eslint e 47 testes jest verdes)
  - registro: registro-2026-09-12-a-autoria-dos-forks-corrigida-antes-do-primeiro-pr
    caminhos:
      - skills/gemini-cli-jules
    parecer: skills/gemini-cli-jules -- avanca gitlink de 9f4bfa34 para 8d5a2d2d na branch fix/injecao-no-workflow-e-registro-da-tool
      do fork RaphaelVitoi/jules removendo import ExecFileException nao utilizado em skills/gemini-cli-jules/mcp-server/src/jules.ts
      (tsc e 2 testes vitest verdes)
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - skills/exa-mcp-server
      - skills/gemini-deep-research
    parecer: skills/exa-mcp-server -- avanca gitlink de 65c333c7 para 123c1913 na branch chore/sonarlint-campaign-20260911
      do fork RaphaelVitoi/exa-mcp-server apos commit de limpeza TS/MCP (tsc e 158 testes vitest verdes);
      skills/gemini-deep-research -- avanca gitlink de 736e536c para bbed22a5 na branch fix/workflow-inline-release
      do fork RaphaelVitoi/gemini-cli-deep-research removendo async redundante em skills/gemini-deep-research/src/index.ts
      (tsc, eslint e 47 testes jest verdes)
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - skills/gemini-cli-security
    parecer: skills/gemini-cli-security -- avanca gitlink de fe75cc70 para 308144e1 na branch main do
      fork RaphaelVitoi/security padronizando imports node:, z.enum(VulnerabilityType) e helpers em skills/gemini-cli-security/mcp-server/src
      (tsc e 72 testes vitest verdes)
  - registro: registro-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo
    caminhos:
      - skills/gemini-cli-security
    parecer: skills/gemini-cli-security -- avanca gitlink de fe75cc70 para 308144e1 na branch main do
      fork RaphaelVitoi/security padronizando imports node:, z.enum(VulnerabilityType) e helpers em skills/gemini-cli-security/mcp-server/src
      (tsc e 72 testes vitest verdes)
  - registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
    caminhos:
      - skills/gemini-deep-research
    parecer: skills/gemini-deep-research -- avanca gitlink de 736e536c para bbed22a5 na branch fix/workflow-inline-release
      do fork RaphaelVitoi/gemini-cli-deep-research removendo async redundante em skills/gemini-deep-research/src/index.ts
      (tsc, eslint e 47 testes jest verdes)
  - registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
    caminhos:
      - skills/exa-mcp-server
      - skills/gemini-cli-jules
      - skills/gemini-cli-security
    parecer: skills/exa-mcp-server -- avanca gitlink de 65c333c7 para 123c1913 na branch chore/sonarlint-campaign-20260911
      do fork RaphaelVitoi/exa-mcp-server apos commit de limpeza TS/MCP (tsc e 158 testes vitest verdes);
      skills/gemini-cli-jules -- avanca gitlink de 9f4bfa34 para 8d5a2d2d na branch fix/injecao-no-workflow-e-registro-da-tool
      do fork RaphaelVitoi/jules removendo import ExecFileException nao utilizado em skills/gemini-cli-jules/mcp-server/src/jules.ts
      (tsc e 2 testes vitest verdes); skills/gemini-cli-security -- avanca gitlink de fe75cc70 para 308144e1
      na branch main do fork RaphaelVitoi/security padronizando imports node:, z.enum(VulnerabilityType)
      e helpers em skills/gemini-cli-security/mcp-server/src (tsc e 72 testes vitest verdes)
  - registro: registro-2026-11-11-bump-deps-submodulos-skills
    caminhos:
      - skills/gemini-cli-security
      - skills/gemini-deep-research
    parecer: skills/gemini-cli-security -- avanca gitlink de fe75cc70 para 308144e1 na branch main do
      fork RaphaelVitoi/security padronizando imports node:, z.enum(VulnerabilityType) e helpers em skills/gemini-cli-security/mcp-server/src
      (tsc e 72 testes vitest verdes); skills/gemini-deep-research -- avanca gitlink de 736e536c para
      bbed22a5 na branch fix/workflow-inline-release do fork RaphaelVitoi/gemini-cli-deep-research removendo
      async redundante em skills/gemini-deep-research/src/index.ts (tsc, eslint e 47 testes jest verdes)
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - skills/gemini-deep-research
    parecer: skills/gemini-deep-research -- avanca gitlink de 736e536c para bbed22a5 na branch fix/workflow-inline-release
      do fork RaphaelVitoi/gemini-cli-deep-research removendo async redundante em skills/gemini-deep-research/src/index.ts
      (tsc, eslint e 47 testes jest verdes)
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - skills/exa-mcp-server
    parecer: skills/exa-mcp-server -- avanca gitlink de 65c333c7 para 123c1913 na branch chore/sonarlint-campaign-20260911
      do fork RaphaelVitoi/exa-mcp-server apos commit de limpeza TS/MCP (tsc e 158 testes vitest verdes)
  - registro: registro-2026-11-11-hybrid-router-genai-jules-zod4
    caminhos:
      - skills/gemini-cli-jules
    parecer: skills/gemini-cli-jules -- avanca gitlink de 9f4bfa34 para 8d5a2d2d na branch fix/injecao-no-workflow-e-registro-da-tool
      do fork RaphaelVitoi/jules removendo import ExecFileException nao utilizado em skills/gemini-cli-jules/mcp-server/src/jules.ts
      (tsc e 2 testes vitest verdes)
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - skills/exa-mcp-server
      - skills/gemini-deep-research
    parecer: skills/exa-mcp-server -- avanca gitlink de 65c333c7 para 123c1913 na branch chore/sonarlint-campaign-20260911
      do fork RaphaelVitoi/exa-mcp-server apos commit de limpeza TS/MCP (tsc e 158 testes vitest verdes);
      skills/gemini-deep-research -- avanca gitlink de 736e536c para bbed22a5 na branch fix/workflow-inline-release
      do fork RaphaelVitoi/gemini-cli-deep-research removendo async redundante em skills/gemini-deep-research/src/index.ts
      (tsc, eslint e 47 testes jest verdes)
verificado:
  - 'exa-mcp-server: npm run typecheck (exit 0) e vitest run (13 files, 158 passed); push fork HEAD ->
    chore/sonarlint-campaign-20260911 (123c191)'
  - 'gemini-cli-jules/mcp-server: tsc --noEmit (exit 0) e vitest run (2 files, 2 passed); push fork HEAD
    -> fix/injecao-no-workflow-e-registro-da-tool (8d5a2d2)'
  - 'gemini-cli-security/mcp-server: npm run typecheck (exit 0) e vitest run (14 files, 72 passed); push
    fork HEAD -> main (308144e)'
  - 'gemini-deep-research: npm run typecheck, npm run lint e jest (3 suites, 47 passed); push fork HEAD
    -> fix/workflow-inline-release (bbed22a)'
  - 'Site: pytest tests/test_patches_skills.py (5 passed in 1.38s) com gitlinks avancados e submodulos
    limpos'
nao_verificado:
  - Suite completa pytest e build Next.js aguardam pre-commit e pre-push da entrega no superprojeto Site
---

# Reconciliacao de Ancoras -- Gitlinks dos Submodulos em `skills/`

## 1. Commits Publicados nos Forks `RaphaelVitoi`
- `skills/exa-mcp-server`: `65c333c..123c191` em `chore/sonarlint-campaign-20260911` (`RaphaelVitoi/exa-mcp-server`) -- limpeza de tipagem TS, `top-level await`, `Object.hasOwn` e helper `skills/exa-mcp-server/tests/helpers/fakeMcpServer.ts`.
- `skills/gemini-cli-jules`: `9f4bfa3..8d5a2d2` em `fix/injecao-no-workflow-e-registro-da-tool` (`RaphaelVitoi/jules`) -- remocao do import nao utilizado `ExecFileException` em `skills/gemini-cli-jules/mcp-server/src/jules.ts`.
- `skills/gemini-cli-security`: `fe75cc7..308144e` em `main` (`RaphaelVitoi/security`) -- padronizacao `node:*`, `z.enum(VulnerabilityType)` e helpers em `skills/gemini-cli-security/mcp-server/src`.
- `skills/gemini-deep-research`: `736e536..bbed22a` em `fix/workflow-inline-release` (`RaphaelVitoi/gemini-cli-deep-research`) -- remocao de `async` redundante em callbacks sincronos de `skills/gemini-deep-research/src/index.ts`.
