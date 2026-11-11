---
id: registro-2026-11-11-bump-deps-submodulos-skills
tipo: registro
escopo: "Site -- bump de dependencias nos submodulos skills/gemini-deep-research e skills/gemini-cli-security (gitlinks)"
ecossistema: nexus-sota
autor: "Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-11T09:10:00-03:00"
atualizado_em: "2026-11-11T09:10:00-03:00"
classes: [interno, medido, governanca, dependencias]
config_medida:
  congelada_em: "2026-11-11"
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: 2026-11-11
caminhos:
  - skills/gemini-cli-security
  - skills/gemini-deep-research
  - reports/REGISTRO-2026-11-11-bump-deps-submodulos-skills.md
revisoes_de_ancora:
- registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
  caminhos:
  - skills/gemini-deep-research
  parecer: "Reconciliacao SOTA 2026-11-11: gitlink de skills/gemini-deep-research avancado de 3f59a0c para 8a81c88 (commit chore(deps) no fork RaphaelVitoi/gemini-cli-deep-research, branch fix/workflow-inline-release). Escopo do submodulo: bumps de toolchain e runtime com TypeScript mantido em ^6.0.3 por incompatibilidade de typescript-eslint/ts-jest com TS 7. Nenhuma ancora de workflow ou contrato alterada."
- registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
  caminhos:
  - skills/gemini-deep-research
  parecer: "Reconciliacao SOTA 2026-11-11: gitlink de skills/gemini-deep-research avancado de 3f59a0c para 8a81c88. O saneamento de warnings e o inlining do release.yml registrados neste documento permanecem intactos; o bump nao toca workflows, scripts de build ou configuracao de lint."
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - skills/gemini-cli-security
  parecer: "Reconciliacao SOTA 2026-11-11: gitlink de skills/gemini-cli-security avancado de fe4a943 para 79be7b6 (commit chore(deps) em mcp-server no fork RaphaelVitoi/security, main). O ponteiro canonico corrigido neste registro segue valido; o bump atualiza manifestos, lockfile e tsconfig do pacote mcp-server sem tocar workflows ou a integracao Dependabot."
- registro: registro-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo
  caminhos:
  - skills/gemini-cli-security
  parecer: "Reconciliacao SOTA 2026-11-11: gitlink de skills/gemini-cli-security avancado de fe4a943 para 79be7b6. O suporte a workflow_dispatch no gemini-review.yml homologado neste registro nao foi alterado; a mudanca fica confinada a mcp-server/{package.json,package-lock.json,tsconfig.json,src/*.test.ts}."
- registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
  caminhos:
  - skills/gemini-deep-research
  parecer: "Reconciliacao SOTA 2026-11-11: gitlink de skills/gemini-deep-research avancado de 3f59a0c para 8a81c88. Otimizacoes de backend, SonarLint, pyright e headings registradas neste documento sao ortogonais ao bump de dependencias do submodulo."
pendencias_resolvidas: []
verificado:
  - "npm install + npm audit fix nos dois submodulos; package-lock regenerados"
  - "gemini-deep-research: tsc --noEmit, build.mjs, eslint src/, jest 47/47 verdes apos audit fix"
  - "gemini-cli-security/mcp-server: tsc build+--noEmit, vitest 72/72 verdes, npm audit 0 vulnerabilidades"
  - "PyPI JSON API: typer latest = 0.29.1 (warning uv-pypi do IDE e indice stale)"
  - "git push fork: deep-research 3f59a0c..8a81c88 e security bdd0566..79be7b6 publicados"
nao_verificado:
  - "npm audit do submodulo gemini-deep-research: apos npm audit fix restam 29 advisories moderados/baixos em dependencias dev transitivas (cadeia jest/glob/minimatch e typescript-eslint) sem correcao nao-breaking disponivel; npm audit fix --force exigiria downgrades quebradores (jest 25, eslint 9) e nao foi aplicado."
  - "Warning uv-pypi do IDE sobre typer (latest 0.29.0) confirmado como indice stale: PyPI reporta 0.29.1 publicada em 2026-11-11; pyproject/uv.lock permanecem corretos em >=0.29.1."
---

# Bump de dependencias nos submodulos skills/gemini-deep-research e skills/gemini-cli-security

Dois gitlinks avancados neste commit, cada um com commit proprio ja publicado no
fork correspondente:

- `skills/gemini-deep-research`: 3f59a0c -> 8a81c88
  (`chore(deps): bump toolchain e runtime para latest compativel`, branch
  `fix/workflow-inline-release`, fork RaphaelVitoi/gemini-cli-deep-research).
  Bumps: @types/node 26.6.6, esbuild 0.28.2, eslint 10.14.0, jest 30.5.2,
  prettier 3.9.10, ts-jest 29.4.15, typescript-eslint 8.72.2,
  @allenhutchison/gemini-utils 1.3.0, @google/genai 3.1.0,
  @modelcontextprotocol/sdk 1.32.2, zod 4.6.7. TypeScript mantido em ^6.0.3:
  typescript-eslint e ts-jest nao suportam TS 7. Validacao: typecheck, build
  (esbuild), lint e 47/47 testes jest verdes.
- `skills/gemini-cli-security`: fe4a943 -> 79be7b6
  (`chore(deps): bump mcp-server para TS7/NodeNext, zod4 e SDK 1.32`, main,
  fork RaphaelVitoi/security). Bumps: @types/node 26.6.6, typescript 7.0.2,
  @modelcontextprotocol/sdk 1.32.2, zod 4.6.7. tsconfig migrado para
  module/moduleResolution NodeNext com types:["node"]; imports relativos dos
  testes ganharam extensao .js exigida pelo NodeNext ESM. Validacao: build,
  typecheck e 72/72 testes vitest verdes; npm audit limpo.

## Reconciliacao de ancoras

5 registros vigentes ancorados nos caminhos tocados receberam
`revisoes_de_ancora` neste commit.

## Nao verificado / ressalvas

- `npm audit` do gemini-deep-research: apos `npm audit fix` (38 -> 29
  advisories) restam 29 moderados/baixos em dependencias dev transitivas
  (cadeia jest/glob/minimatch e typescript-eslint) sem correcao nao-breaking;
  `--force` exigiria downgrades quebradores (jest 25, eslint 9).
- Warning `uv-pypi` do IDE sobre typer ("latest 0.29.0"): indice stale.
  PyPI confirma 0.29.1 publicada em 2026-11-11; pyproject/uv.lock corretos.
