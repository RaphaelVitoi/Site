---
id: registro-2026-11-19-fix-s6551-errorhandler-exa-mcp
tipo: registro
escopo: >-
  Site -- avanca gitlink de skills/exa-mcp-server para b1f770b apos commit de
  correcao do achado residual typescript:S6551 em formatUnknownError
  (skills/exa-mcp-server/src/utils/errorHandler.ts), publicado no fork
  RaphaelVitoi/exa-mcp-server
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-19T19:35:00-03:00"
atualizado_em: "2026-11-19T19:35:00-03:00"
verificado: >-
  tsc --noEmit -p tsconfig.test.json limpo e vitest 8/8 verdes em
  tests/unit/utils/errorHandler.test.ts no submodulo (medido nesta sessao);
  String(error) eliminado de formatUnknownError -- string retorna direto,
  number/boolean/bigint usam toString(), null/undefined retornam literais,
  objetos seguem em JSON.stringify; saida preservada para todos os primitivos.
nao_verificado: >-
  varredura SonarLint completa do submodulo apos a correcao (apenas o achado
  reportado na linha 120 foi tratado); suites dos demais submodulos nao
  reexecutadas.
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
  - reports/REGISTRO-2026-11-19-fix-s6551-errorhandler-exa-mcp.md
  - skills/exa-mcp-server
revisoes_de_ancora:
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 1c47455 ->
      b1f770b na branch chore/sonarlint-campaign-20260911 do fork
      RaphaelVitoi/exa-mcp-server. O commit interno elimina o String(error)
      residual de formatUnknownError (typescript:S6551) preservando a saida para
      primitivos; tsc limpo e 8/8 testes do errorHandler verdes. O registro
      permanece vigente como atestado do estado medido na sua data."
  - registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 1c47455 ->
      b1f770b na branch chore/sonarlint-campaign-20260911 do fork
      RaphaelVitoi/exa-mcp-server. O commit interno elimina o String(error)
      residual de formatUnknownError (typescript:S6551) preservando a saida para
      primitivos; tsc limpo e 8/8 testes do errorHandler verdes. O registro
      permanece vigente como atestado do estado medido na sua data."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 1c47455 ->
      b1f770b na branch chore/sonarlint-campaign-20260911 do fork
      RaphaelVitoi/exa-mcp-server. O commit interno elimina o String(error)
      residual de formatUnknownError (typescript:S6551) preservando a saida para
      primitivos; tsc limpo e 8/8 testes do errorHandler verdes. O registro
      permanece vigente como atestado do estado medido na sua data."
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 1c47455 ->
      b1f770b na branch chore/sonarlint-campaign-20260911 do fork
      RaphaelVitoi/exa-mcp-server. O commit interno elimina o String(error)
      residual de formatUnknownError (typescript:S6551) preservando a saida para
      primitivos; tsc limpo e 8/8 testes do errorHandler verdes. O registro
      permanece vigente como atestado do estado medido na sua data."
  - registro: registro-2026-11-14-submodulos-skills-sonar-e-gitlinks
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 1c47455 ->
      b1f770b na branch chore/sonarlint-campaign-20260911 do fork
      RaphaelVitoi/exa-mcp-server. O commit interno elimina o String(error)
      residual de formatUnknownError (typescript:S6551) preservando a saida para
      primitivos; tsc limpo e 8/8 testes do errorHandler verdes. O registro
      permanece vigente como atestado do estado medido na sua data."
  - registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 1c47455 ->
      b1f770b na branch chore/sonarlint-campaign-20260911 do fork
      RaphaelVitoi/exa-mcp-server. O commit interno elimina o String(error)
      residual de formatUnknownError (typescript:S6551) preservando a saida para
      primitivos; tsc limpo e 8/8 testes do errorHandler verdes. O registro
      permanece vigente como atestado do estado medido na sua data."
  - registro: registro-2026-11-19-bump-gitlink-exa-mcp-server
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink b1f770b e o
      commit imediatamente posterior ao 1c47455 registrado nesta mesma sessao,
      na branch chore/sonarlint-campaign-20260911 do fork; correcao do
      String(error) residual (typescript:S6551) sem mudanca de saida. O registro
      permanece vigente como atestado do estado medido na sua data."
  - registro: registro-2026-11-19-bump-gitlinks-submodulos-deps
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink b1f770b, um
      commit a frente do 1c47455 registrado no documento de bump de gitlinks;
      correcao do String(error) residual (typescript:S6551) em
      formatUnknownError, sem mudanca de saida. O registro permanece vigente
      como atestado do estado medido na sua data."
---

# Registro -- Fix residual S6551 em errorHandler do exa-mcp-server (2026-11-19)

## O que mudou

O SonarLint reportou `typescript:S6551` na linha 120 de
`skills/exa-mcp-server/src/utils/errorHandler.ts` do submodulo
`skills/exa-mcp-server`: o `String(error)` residual dentro do ramo de primitivos
de `formatUnknownError`. O commit `352eab4` havia serializado objetos via
`JSON.stringify`, mas o `String(error)` continuava no codigo e o detector seguia
apontando.

A correcao elimina a chamada: `string` retorna direto, `number`/`boolean`/
`bigint` usam `toString()`, `null`/`undefined` retornam os literais `"null"` e
`"undefined"` (saida identica a `String()`), e objetos seguem em
`JSON.stringify`. Nenhum caminho produz `[object Object]`.

## Validacao

- `tsc --noEmit -p tsconfig.test.json` no submodulo: limpo;
- `vitest run tests/unit/utils/errorHandler.test.ts`: 8/8 verdes;
- push para `fork` (`RaphaelVitoi/exa-mcp-server`), branch
  `chore/sonarlint-campaign-20260911`: `1c47455..b1f770b`.
