---
id: registro-2026-09-14-saneamento-linters-pmev-e-engines
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: gemini@antigravity
criado_em: '2026-09-14T09:42:00-03:00'
atualizado_em: '2026-09-14T09:42:00-03:00'
classes: [interno, medido, linters, pmev, frontend, governanca]
session_id: c52459ad-d683-434d-9246-6dc82e4cff73
conductor_model: gemini-3.8-flash
conductor_vehicle: antigravity-ide
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.12'
  congelada_em: '2026-09-14'
caminhos:
  - .agents/skills/poker-pmev-knowledge-engine/scripts/drive_common.mjs
  - .agents/skills/poker-pmev-knowledge-engine/scripts/drive_search.mjs
  - .agents/skills/poker-pmev-knowledge-engine/scripts/universal_reader.py
  - engine/pmev_scenario.py
  - frontend/next.config.js
  - frontend/src/app/(public)/biblioteca/estruturas-de-torneio/page.tsx
  - frontend/src/app/(public)/biblioteca/insolvencia-das-pot-odds/page.tsx
  - frontend/src/app/(public)/biblioteca/nos-de-calibragem/page.tsx
  - frontend/src/app/(public)/biblioteca/toy-games/page.tsx
  - frontend/src/lib/bayesianRangeEngine.ts
  - frontend/src/lib/pluribusMultiwayEngine.ts
  - frontend/src/lib/server/dashboard-orchestrator.ts
  - frontend/src/lib/server/gemma-relay.ts
  - frontend/src/lib/timesfm-client.ts
  - scripts/llm_inference/run_inference.py
  - scripts/ops/get_dashboard_telemetry.py
  - tools/hybrid_router/benchmark.py
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - frontend/src/lib/server/dashboard-orchestrator.ts
    parecer: Tipagem parcial defensiva de process.env para viabilizar injecao controlada em testes unitarios sem quebra de contrato.
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - frontend/src/app/(public)/biblioteca/estruturas-de-torneio/page.tsx
      - frontend/src/app/(public)/biblioteca/nos-de-calibragem/page.tsx
    parecer: Saneamento Sonar de barras de escape LaTeX usando String.raw literais.
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - frontend/src/lib/pluribusMultiwayEngine.ts
    parecer: Saneamento Sonar adicionando modificadores readonly e desaninhando operacao ternaria em if-else.
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos:
      - scripts/llm_inference/run_inference.py
    parecer: Substituicao de construcao dict(msg) por msg.copy() para resolver colisoes de sobrecarga no Pylance.
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - frontend/src/lib/timesfm-client.ts
    parecer: Simplificacao de unioes com type aliases, construtor new Array e desaninhamento de ternarios.
  - registro: registro-2026-09-12-ativacao-solvers-teoria-dos-jogos-e-multiway-pmev
    caminhos:
      - frontend/src/lib/bayesianRangeEngine.ts
      - frontend/src/lib/pluribusMultiwayEngine.ts
    parecer: Refatoracao de generateTextureAwareLikelihood com helpers puros por acao tatica e reducao de complexidade cognitiva de 51 para abaixo de 5.
  - registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
    caminhos:
      - frontend/next.config.js
      - frontend/src/lib/timesfm-client.ts
    parecer: Parametrizacao de allowedDevOrigins via variavel de ambiente e ajustes de linters Sonar.
  - registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
    caminhos:
      - frontend/src/lib/pluribusMultiwayEngine.ts
      - frontend/src/lib/timesfm-client.ts
    parecer: Saneamento estatico em conformidade com o padrao Sonar e paridade de interfaces.
  - registro: registro-2026-09-13-pmev-contratos-baselines-composicao-e-skill
    caminhos:
      - engine/pmev_scenario.py
    parecer: Desacoplamento de acesso a membros polimorficos atraves de funcao auxiliar pura tipada evitando falsos positivos no Astroid do Pylint.
verificado:
  - engine/pmev_scenario.py avaliado com 10.00/10 no Pylint, zero erros no Pyright e All checks passed no Ruff
  - suite de testes canonica e pmev_scenario aprovadas com 26 testes verdes em 0.55s
  - frontend test suites com 58 suites e 434 testes aprovados (100% verde)
  - scripts mjs de drive_common e drive_search validados com node --check e regras Sonar
  - universal_reader.py com acesso seguro a iter_rows e tipagem Iterable[Any]
nao_verificado:
  - execucao do cwv_gate completo com dev server ativo nesta fase de commit
---

# Registro 2026-09-14: Saneamento Geral de Linters, PMEV e Motores

## 1. Contexto e Motivacao

Saneamento cirurgico de inconformidades apontadas por Pylint, Pyright, Ruff, ESLint e SonarLint em modulos do ecossistema PMev, scripts de suporte de skills e componentes de frontend.

## 2. Principais Alteracoes

- `engine/pmev_scenario.py`: Introduzida funcao auxiliar `_read_value(reading: Read[T]) -> T` eliminando falso positivo de `no-member` do Astroid sem violar Ruff B009.
- `.agents/skills/poker-pmev-knowledge-engine/scripts/`: Corrigidos `drive_common.mjs`, `drive_search.mjs` e `universal_reader.py`.
- `frontend/src/lib/bayesianRangeEngine.ts`: Modularizada decomposicao tatica para reducao drastica de complexidade cognitiva.
- `frontend/next.config.js`: Parametrizacao de IP local via `process.env.ALLOWED_DEV_ORIGINS`.
- `frontend/src/lib/server/`: Tipagem flexivel de `environment: Partial<NodeJS.ProcessEnv>` para viabilizar testes.
