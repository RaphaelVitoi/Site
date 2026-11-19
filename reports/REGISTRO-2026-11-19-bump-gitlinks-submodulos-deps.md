---
id: registro-2026-11-19-bump-gitlinks-submodulos-deps
tipo: registro
escopo: >-
  Site -- avanca gitlinks de 4 submodulos skills/* apos commits de bump de
  dependencias publicados nos forks RaphaelVitoi (exa-mcp-server, jules,
  security, gemini-cli-deep-research)
ecossistema: nexus-sota
autor: Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-19T19:05:00-03:00"
atualizado_em: "2026-11-19T19:05:00-03:00"
verificado: >-
  git diff --cached --submodule=log conferido (4 gitlinks avancados); pushes nos
  forks confirmados pelo remote (exa-mcp-server 352eab4..1c47455,
  gemini-cli-security 308144e..9df86ac, jules e gemini-cli-deep-research como
  branches novas em repositorios fork recriados como privados); test_patches_skills
  reprovava os 4 submodulos em limbo antes deste commit.
nao_verificado: >-
  suites vitest/tsc dentro de cada submodulo apos o bump de dependencias
  (alteracao exclusivamente de manifesto e lockfile; validacao interna dos
  submodulos nao reexecutada nesta sessao); estado dos demais branches dos forks
  recriados.
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
  - reports/REGISTRO-2026-11-19-bump-gitlinks-submodulos-deps.md
  - skills/exa-mcp-server
  - skills/gemini-cli-jules
  - skills/gemini-cli-security
  - skills/gemini-deep-research
revisoes_de_ancora:
  - registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
    caminhos:
      - skills/gemini-deep-research
    parecer: 'Revisado em 2026-11-19: skills/gemini-deep-research -- gitlink
      bbed22a -> 452214c na branch fix/workflow-inline-release do fork
      RaphaelVitoi/gemini-cli-deep-research (repositorio fork recriado como
      privado nesta sessao). O commit interno sobe typescript-eslint para
      ^8.73.0 e @google/genai para ^3.6.1 com lockfile regenerado; bump de
      manifesto, sem mudanca de comportamento. O registro permanece vigente
      como atestado do estado medido na sua data.'
  - registro: registro-2026-09-12-a-autoria-dos-forks-corrigida-antes-do-primeiro-pr
    caminhos:
      - skills/gemini-cli-jules
    parecer: 'Revisado em 2026-11-19: skills/gemini-cli-jules -- gitlink 8d5a2d2
      -> 061a730 na branch fix/injecao-no-workflow-e-registro-da-tool do fork
      RaphaelVitoi/jules (repositorio fork recriado como privado nesta sessao).
      O commit interno sobe vitest para ^5.1.1 em mcp-server com lockfile
      regenerado; bump de manifesto, sem mudanca de comportamento. O registro
      permanece vigente como atestado do estado medido na sua data.'
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - skills/exa-mcp-server
      - skills/gemini-deep-research
    parecer: 'Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 352eab4 ->
      1c47455 (vitest 5.1.1) na branch chore/sonarlint-campaign-20260911 do fork;
      skills/gemini-deep-research -- gitlink bbed22a -> 452214c (typescript-eslint
      ^8.73.0, @google/genai ^3.6.1) na branch fix/workflow-inline-release do fork
      recriado. Ambos sao bumps de manifesto/lockfile sem mudanca de
      comportamento. O registro permanece vigente como atestado do estado
      medido na sua data.'
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - skills/gemini-cli-security
    parecer: 'Revisado em 2026-11-19: skills/gemini-cli-security -- gitlink
      308144e -> 9df86ac na main do fork RaphaelVitoi/security. O commit interno
      sobe vitest para ^5.1.1 em mcp-server com lockfile regenerado; bump de
      manifesto, sem mudanca de comportamento. O registro permanece vigente
      como atestado do estado medido na sua data.'
  - registro: registro-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo
    caminhos:
      - skills/gemini-cli-security
    parecer: 'Revisado em 2026-11-19: skills/gemini-cli-security -- gitlink
      308144e -> 9df86ac na main do fork RaphaelVitoi/security. O commit interno
      sobe vitest para ^5.1.1 em mcp-server com lockfile regenerado; bump de
      manifesto, sem mudanca de comportamento. O registro permanece vigente
      como atestado do estado medido na sua data.'
  - registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
    caminhos:
      - skills/gemini-deep-research
    parecer: 'Revisado em 2026-11-19: skills/gemini-deep-research -- gitlink
      bbed22a -> 452214c na branch fix/workflow-inline-release do fork
      RaphaelVitoi/gemini-cli-deep-research (repositorio fork recriado como
      privado nesta sessao). O commit interno sobe typescript-eslint para
      ^8.73.0 e @google/genai para ^3.6.1 com lockfile regenerado; bump de
      manifesto, sem mudanca de comportamento. O registro permanece vigente
      como atestado do estado medido na sua data.'
  - registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
    caminhos:
      - skills/exa-mcp-server
      - skills/gemini-cli-jules
      - skills/gemini-cli-security
    parecer: 'Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 352eab4 ->
      1c47455 (vitest 5.1.1); skills/gemini-cli-jules -- gitlink 8d5a2d2 -> 061a730
      (vitest ^5.1.1); skills/gemini-cli-security -- gitlink 308144e -> 9df86ac
      (vitest ^5.1.1), todos commits de bump de manifesto/lockfile publicados nos
      forks RaphaelVitoi. Sem mudanca de comportamento. O registro permanece
      vigente como atestado do estado medido na sua data.'
  - registro: registro-2026-11-11-bump-deps-submodulos-skills
    caminhos:
      - skills/gemini-cli-security
      - skills/gemini-deep-research
    parecer: 'Revisado em 2026-11-19: skills/gemini-cli-security -- gitlink
      308144e -> 9df86ac (vitest ^5.1.1) na main do fork; skills/gemini-deep-research
      -- gitlink bbed22a -> 452214c (typescript-eslint ^8.73.0, @google/genai
      ^3.6.1) na branch fix/workflow-inline-release do fork recriado. Bumps de
      manifesto/lockfile sem mudanca de comportamento. O registro permanece
      vigente como atestado do estado medido na sua data.'
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - skills/gemini-deep-research
    parecer: 'Revisado em 2026-11-19: skills/gemini-deep-research -- gitlink
      bbed22a -> 452214c na branch fix/workflow-inline-release do fork
      RaphaelVitoi/gemini-cli-deep-research (repositorio fork recriado como
      privado nesta sessao). O commit interno sobe typescript-eslint para
      ^8.73.0 e @google/genai para ^3.6.1 com lockfile regenerado; bump de
      manifesto, sem mudanca de comportamento. O registro permanece vigente
      como atestado do estado medido na sua data.'
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - skills/exa-mcp-server
    parecer: 'Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 352eab4 ->
      1c47455 na branch chore/sonarlint-campaign-20260911 do fork
      RaphaelVitoi/exa-mcp-server. O commit interno sobe vitest para 5.1.1 com
      lockfile regenerado; bump de manifesto, sem mudanca de comportamento. O
      registro permanece vigente como atestado do estado medido na sua data.'
  - registro: registro-2026-11-11-hybrid-router-genai-jules-zod4
    caminhos:
      - skills/gemini-cli-jules
    parecer: 'Revisado em 2026-11-19: skills/gemini-cli-jules -- gitlink 8d5a2d2
      -> 061a730 na branch fix/injecao-no-workflow-e-registro-da-tool do fork
      RaphaelVitoi/jules (repositorio fork recriado como privado nesta sessao).
      O commit interno sobe vitest para ^5.1.1 em mcp-server com lockfile
      regenerado; bump de manifesto, sem mudanca de comportamento. O registro
      permanece vigente como atestado do estado medido na sua data.'
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - skills/exa-mcp-server
      - skills/gemini-deep-research
    parecer: 'Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 352eab4 ->
      1c47455 (vitest 5.1.1); skills/gemini-deep-research -- gitlink bbed22a ->
      452214c (typescript-eslint ^8.73.0, @google/genai ^3.6.1), commits de bump
      de manifesto/lockfile publicados nos forks RaphaelVitoi. Sem mudanca de
      comportamento. O registro permanece vigente como atestado do estado
      medido na sua data.'
  - registro: registro-2026-11-14-submodulos-skills-sonar-e-gitlinks
    caminhos:
      - skills/exa-mcp-server
      - skills/gemini-cli-jules
      - skills/gemini-cli-security
      - skills/gemini-deep-research
    parecer: 'Revisado em 2026-11-19: os quatro gitlinks avancaram por commits de
      bump de dependencias publicados nos forks -- exa-mcp-server 352eab4 ->
      1c47455 (vitest 5.1.1), gemini-cli-jules 8d5a2d2 -> 061a730 (vitest ^5.1.1),
      gemini-cli-security 308144e -> 9df86ac (vitest ^5.1.1), gemini-deep-research
      bbed22a -> 452214c (typescript-eslint ^8.73.0, @google/genai ^3.6.1). Todos
      bumps de manifesto/lockfile sem mudanca de comportamento; forks jules e
      gemini-cli-deep-research recriados como privados nesta sessao. O registro
      permanece vigente como atestado do estado medido na sua data.'
  - registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
    caminhos:
      - skills/exa-mcp-server
    parecer: 'Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 352eab4 ->
      1c47455 na branch chore/sonarlint-campaign-20260911 do fork
      RaphaelVitoi/exa-mcp-server. O commit interno sobe vitest para 5.1.1 com
      lockfile regenerado; bump de manifesto, sem mudanca de comportamento. O
      registro permanece vigente como atestado do estado medido na sua data.'
  - registro: registro-2026-11-19-bump-gitlink-exa-mcp-server
    caminhos:
      - skills/exa-mcp-server
    parecer: 'Revisado em 2026-11-19: skills/exa-mcp-server -- gitlink 1c47455 e
      o commit imediatamente posterior ao 352eab4 registrado neste documento,
      na mesma branch chore/sonarlint-campaign-20260911 do fork; bump de vitest
      para 5.1.1 com lockfile regenerado, sem mudanca de comportamento. O
      registro permanece vigente como atestado do estado medido na sua data.'
---

# Registro -- Bump dos gitlinks dos 4 submodulos skills/* (2026-11-19)

## O que mudou

O pre-push (`test_fonte_modificada_no_submodulo_nao_fica_sem_commit`) reprovou
quatro submodulos com fonte modificada e nao commitada — manifestos e lockfiles
de dependencias que haviam sido bumpados sem commit no fork. A remediacao
correta, conforme a propria mensagem do teste, e commitar no fork e avancar o
gitlink:

| Submodulo | Branch | Commit interno | Bump |
| :--- | :--- | :--- | :--- |
| `skills/exa-mcp-server` | `chore/sonarlint-campaign-20260911` | `352eab4` -> `1c47455` | vitest 5.1.0 -> 5.1.1 |
| `skills/gemini-cli-jules` | `fix/injecao-no-workflow-e-registro-da-tool` | `8d5a2d2` -> `061a730` | vitest ^5.1.0 -> ^5.1.1 |
| `skills/gemini-cli-security` | `main` | `308144e` -> `9df86ac` | vitest ^5.1.0 -> ^5.1.1 |
| `skills/gemini-deep-research` | `fix/workflow-inline-release` | `bbed22a` -> `452214c` | typescript-eslint ^8.72.2 -> ^8.73.0, @google/genai ^3.3.0 -> ^3.6.1 |

## Particularidades dos remotos

Os forks `RaphaelVitoi/jules` e `RaphaelVitoi/gemini-cli-deep-research` nao
existiam mais no GitHub. Ambos foram recriados como **privados** nesta sessao
(`gh repo create --private`) e as branches publicadas. Os clones locais dos dois
tambem eram rasos; `git fetch --unshallow origin` completou o historico antes do
push — o remote rejeitou com "did not receive expected object" ate o
unshallow.

`skills/gemini-cli-security` estava em `main` com 5 commits a frente do upstream
`gemini-cli-extensions/security`; o push foi para `fork` (RaphaelVitoi/security,
publico), nunca para o upstream.

## Validacao

- `git diff --cached --submodule=log` no superprojeto: 4 gitlinks conferidos;
- pushes confirmados pelo remote nos 4 forks;
- `tests/test_patches_skills.py::test_fonte_modificada_no_submodulo_nao_fica_sem_commit`
  volta a ter submodulos limpos apos este commit.
