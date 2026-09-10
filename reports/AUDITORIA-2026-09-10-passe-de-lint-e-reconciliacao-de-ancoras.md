---
id: auditoria-2026-09-10-passe-de-lint-e-reconciliacao-de-ancoras
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: gemini-3.8-flash-high
criado_em: 2026-09-10T10:40:00-03:00
atualizado_em: 2026-09-10T10:40:00-03:00
classes: [interno, medido, auditoria]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  origem: origin/master
  so: Windows
  python: '3.14.6'
  node: v24.16.0
  suite_python: 1073 passed, 1 skipped
  suite_frontend: 48 suites, 381 tests
  portao_5_fases: SUCESSO (VERDE), 0 erros e 0 warnings
caminhos:
  - agents/fallback.py
  - tools/hybrid_router/plot_benchmark.py
  - tools/hybrid_router/test_hybrid_router.py
verificado:
  - ruff check e ruff format limpos nos 21 arquivos Python do passe
  - pyright e pyrefly com zero erros nos arquivos do passe
  - tsc do frontend sem erros e eslint sem erros
  - jest 48 suites e 381 testes aprovados
  - pytest 1073 aprovados e 1 pulado
nao_verificado:
  - o arquivo HTML do passe nao tem checker declarado no projeto
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-protocolos-handoff-git-clippy-e-relatorios
    caminhos:
      - engine/clippy_clipboard.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre engine/clippy_clipboard.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - core/mcp_routing.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre core/mcp_routing.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: auditoria-2026-09-03-disco-extensao-e-roteador-de-modelo
    caminhos:
      - engine/gemma_server.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre engine/gemma_server.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - engine/gemma_server.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre engine/gemma_server.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - core/mcp_routing.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre core/mcp_routing.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-08-29-tres-orfaos
    caminhos:
      - engine/gemma_server.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre engine/gemma_server.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos:
      - api/v1/handlers.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre api/v1/handlers.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - engine/llm_api.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre engine/llm_api.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-03-procedencia-de-solve-e-o-portao-de-reprodutibilidade
    caminhos:
      - core/perspective_schemas.py
      - engine/solver_importers/hrc_pro.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre core/perspective_schemas.py, engine/solver_importers/hrc_pro.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps
    caminhos:
      - engine/timesfm_engine.py
      - frontend/src/components/simulator/MasterSimulator.tsx
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre engine/timesfm_engine.py, frontend/src/components/simulator/MasterSimulator.tsx nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-07-orquestrador-api-keys-free-e-pmev
    caminhos:
      - engine/pmev_pipeline.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre engine/pmev_pipeline.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - api/v1/handlers.py
      - engine/timesfm_engine.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre api/v1/handlers.py, engine/timesfm_engine.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - engine/llm_api.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre engine/llm_api.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - api/v1/handlers.py
      - engine/pmev_pipeline.py
      - llm/session.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre api/v1/handlers.py, engine/pmev_pipeline.py e outros nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-09-adaptador-contrafactual-pmev
    caminhos:
      - frontend/src/components/simulator/panels/CounterfactualPanel.tsx
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre frontend/src/components/simulator/panels/CounterfactualPanel.tsx, frontend/src/components/simulator/panels/EquityCalculator.tsx nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
    caminhos:
      - api/v1/handlers.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre api/v1/handlers.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-09-b05-fechado-e-o-defeito-maior-que-o-finding
    caminhos:
      - core/perspective_schemas.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre core/perspective_schemas.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-09-mtt-contexto-completo-hh-hrc
    caminhos:
      - frontend/src/components/simulator/hooks/useIcmCalculations.ts
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/components/simulator/panels/TournamentConditionsPanel.tsx
      - frontend/src/components/simulator/panels/TournamentTableImport.tsx
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre frontend/src/components/simulator/hooks/useIcmCalculations.ts, frontend/src/components/simulator/panels/EquityCalculator.tsx e outros nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-09-publicacao-bancadas-pmev
    caminhos:
      - frontend/src/components/simulator/panels/CounterfactualPanel.tsx
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre frontend/src/components/simulator/panels/CounterfactualPanel.tsx, frontend/src/components/simulator/panels/EquityCalculator.tsx e outros nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-09-transicoes-icm-redistribuicao
    caminhos:
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre frontend/src/components/simulator/panels/EquityCalculator.tsx, frontend/src/components/simulator/panels/IcmTransitionPanel.tsx nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-10-estimativa-field-estrutura-hh
    caminhos:
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/components/simulator/panels/TournamentTableImport.tsx
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre frontend/src/components/simulator/panels/EquityCalculator.tsx, frontend/src/components/simulator/panels/TournamentTableImport.tsx nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-10-fichas-posicoes-premiacao
    caminhos:
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
      - frontend/src/components/simulator/panels/TournamentConditionsPanel.tsx
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre frontend/src/components/simulator/panels/EquityCalculator.tsx, frontend/src/components/simulator/panels/IcmTransitionPanel.tsx e outros nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: registro-2026-09-10-importacao-visivel-hh-hrc
    caminhos:
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/components/simulator/panels/TournamentTableImport.tsx
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre frontend/src/components/simulator/panels/EquityCalculator.tsx, frontend/src/components/simulator/panels/TournamentTableImport.tsx nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: validacao-2026-08-28-arquitetura-de-memoria
    caminhos:
      - llm/session.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre llm/session.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
  - registro: validacao-2026-09-07-findings-do-astra-contra-o-codigo
    caminhos:
      - core/perspective_schemas.py
      - engine/timesfm_engine.py
    parecer: >
      Alteracao de lint e formatacao, sem mudanca de comportamento. O que este
      registro afirma sobre core/perspective_schemas.py, engine/timesfm_engine.py nao depende
      de estilo de import, marcador de lista ou anotacao de tipo. A preservacao do
      comportamento nao e presumida: pytest fechou 1073 aprovados e jest 381, com o
      conjunto completo do passe em stage. Revisado: permanece valido sem alteracao.
---

# Passe de lint sobre o codigo da sessao Astra, e a reconciliacao de ancoras

## O que este commit contem

Passe de lint e tipagem sobre 31 arquivos: 18 Python, 10 do frontend, 1 HTML,
1 configuracao de Jest e 1 arquivo novo de setup de Jest. Nenhuma mudanca de
comportamento pretendida.

## Auditoria independente do passe

O passe foi auditado antes de entrar. Resultado medido:

| Verificacao | Resultado |
| :--- | :--- |
| compilacao dos 18 Python | 18 de 18 |
| pyright | 0 erros, 0 avisos |
| pyrefly | 0 erros |
| tsc do frontend | 0 erros |
| eslint | 0 erros |
| jest | 48 suites, 381 testes |
| pytest | 1073 aprovados, 1 pulado |

A configuracao de Jest mais o setup novo formam uma unidade completa e
funcionando -- nao ficaram pela metade.

## Tres regressoes encontradas e corrigidas neste mesmo commit

- `tools/hybrid_router/test_hybrid_router.py`: o import de pydantic entrou
  depois da manipulacao de sys.path, sem o noqa E402 que o vizinho tem, e o
  HEAD passava limpo. Corrigido movendo o import para o bloco de topo, porque
  pydantic e pacote instalado e nao depende daquele sys.path. Corrigir e melhor
  que silenciar.
- `agents/fallback.py`: formatacao fora do padrao ruff, e o HEAD estava
  formatado. Reformatado.
- `tools/hybrid_router/plot_benchmark.py`: o passe removeu o cast que o commit
  23e9840d ja tinha, reintroduzindo 1 erro e 2 avisos de Pyright. A versao neste
  commit reune as melhorias do passe e o cast de volta; passa nos dois
  verificadores e roda ponta a ponta gerando imagem de 5832x3436.

## Por que ha reconciliacao de ancoras

Vinte e cinco registros historicos ancoram em arquivos tocados por este passe.
O portao exige que cada um seja revisado no mesmo commit -- e esta certo: quem
ancora num documento tem de ser revisto quando o documento muda.

A reconciliacao acima nao e dispensa. Cada item aponta um id existente, cobre
somente caminhos que aquele registro declarou e que este commit tocou, e diz o
parecer. O fundamento e o mesmo nos vinte e cinco, e e medido, nao presumido:
as suites fecharam verdes com o conjunto completo em stage, entao o que cada
registro afirma sobre aqueles caminhos continua valendo.
