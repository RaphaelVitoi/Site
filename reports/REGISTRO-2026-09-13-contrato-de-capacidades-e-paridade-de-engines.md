---
id: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Codex GPT-5.6 Sol <noreply@openai.com>"
criado_em: 2026-09-13T08:17:27-03:00
atualizado_em: 2026-09-13T08:17:27-03:00
classes: [interno, medido, pmev, teoria-dos-jogos, engines, proveniencia, paridade]
caminhos:
  - api/v1/handlers.py
  - api/v1/middleware.py
  - api/v1/server.py
  - core/game_theory_schemas.py
  - data/engine_capabilities.json
  - data/engine_parity_scenarios.json
  - docs/architecture/ENGINE_CAPABILITY_INTEGRATION_PLAN.md
  - engine/canonical_poker_theory.py
  - engine/capability_registry.py
  - engine/game_theory_solvers.py
  - frontend/src/components/simulator/panels/CfrRegretPanel.tsx
  - frontend/src/components/simulator/panels/PluribusMultiwayPanel.tsx
  - frontend/src/components/simulator/workers/cfr.worker.ts
  - frontend/src/lib/canonicalTheoryEngine.ts
  - frontend/src/lib/cfrDiagnostics.ts
  - frontend/src/lib/engineCapabilities.ts
  - frontend/src/lib/engineExecutionGateway.ts
  - frontend/src/lib/pluribusMultiwayEngine.ts
  - frontend/src/lib/timesfm-client.ts
  - frontend/src/tests/simulator/canonicalTheoryEngine.test.ts
  - frontend/src/tests/simulator/cfrDiagnostics.test.ts
  - frontend/src/tests/simulator/engineCapabilities.test.ts
  - frontend/src/tests/simulator/engineExecutionGateway.test.ts
  - frontend/src/tests/simulator/engineParity.test.ts
  - frontend/src/tests/simulator/pluribusMultiwayEngine.test.ts
  - frontend/src/tests/simulator/timesfmConvergence.test.ts
  - tests/test_api_game_theory_handlers.py
  - tests/test_canonical_poker_theory.py
  - tests/test_engine_capability_registry.py
  - tests/test_engine_parity_scenarios.py
  - tests/test_fronteira_produto_operador.py
  - tests/test_timesfm_engine.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  head: 72670ac61039947fb2611327a64200d303f607c6
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.6'
verificado:
  - >-
    AUTORIA E DIRECAO: Raphael Vitoi e o autor conceitual da PMev, da arquitetura
    teorica, dos requisitos de integracao e da direcao de produto. Codex GPT-5.6
    Sol executou este incremento sob aprovacao direta do Tier 0; assinaturas
    anteriores de Astra, Gemini e Claude permanecem intactas.
  - >-
    FONTE UNICA: data/engine_capabilities.json declara nove capacidades, seus
    niveis reais, runtimes, parametros causais e reservados, unidades, premissas,
    limites, consumidores, rotas e fallback. Pydantic e TypeScript validam o
    mesmo arquivo e falham fechado em id duplicado ou papel de parametro sobreposto.
  - >-
    CONSUMO REAL: GET /api/v1/engine-capabilities foi registrado, admitido na
    faixa fail-closed de produto e testado sem converter manifesto estatico em
    prova de runtime. Os paineis Pluribus e CFR consomem labels e limites do manifesto.
  - >-
    PROVENIENCIA DE EXECUCAO: respostas HTTP de Pluribus, DeepStack, ReBeL,
    Claudico, Chen/Ankenman, Janda e TimesFM carregam engine_id, nivel de
    implementacao, runtime usado, modelo usado/pretendido, pesos, fallback,
    premissas, limites e unidades.
  - >-
    CFR E TIMESFM: o painel deixou de sintetizar quatro pontos de regret a partir
    de equity e kappa. O worker emite mean-positive-regret-proxy medido; equity
    entrou no hash e no calculo do cenario. O gateway tenta TimesFM e declara
    fallback analitico, pesos, modelo efetivo e razao de falha.
  - >-
    PARIDADE E INPUT: um corpus compartilhado cobre PMev multiway, Chen/Ankenman,
    Janda MDF, sizing e proporcoes de blefe nos dois runtimes. Funcoes canonicas
    diretas agora rejeitam zero, negativos e NaN em vez de fabricar epsilon.
  - >-
    STACKS E HORIZONTE: active_stacks e depth_streets passaram de reservados a
    causais no adaptador Pluribus. O menor stack limita call/raise; streets futuras
    acrescentam exposicao residual e passivo de horizonte explicitamente heuristico.
    River rejeita horizonte maior que uma street, e Python/TypeScript compartilham
    um cenario de paridade com custos, SPR, passivo e EVs.
  - >-
    GATEWAY P1.4 INICIADO: um envelope tipado registra tentativas local, API e WASM,
    runtime efetivo e fallback. TypeScript local e HTTP com Bearer JWT possuem
    executores reais; WASM permanece indisponivel ate receber implementacao real.
  - >-
    MEDICAO FOCAL: 42 testes Python e 17 testes frontend aprovados, seguidos por
    25 testes Python e 18 frontend apos o endurecimento canonico. Ruff, TypeScript
    principal, TypeScript worker e git diff --check passaram sem erro ou warning.
  - >-
    HIGIENE PYTHON: depois de o gate integral detectar quatro arquivos staged fora
    do formato, Ruff format corrigiu somente esses alvos; os 11 arquivos Python
    staged passam format --check e lint, e record_gate/diff --check passam.
nao_verificado:
  - >-
    A primeira chamada do gate integral scripts/ops/suite_verde.py reprovou antes
    da coleta: C:/Python314/python.exe nao tinha o plugin pytest-cov exigido pelo
    pyproject.toml. Nenhum marcador verde foi gravado; a repeticao pelo Python do
    ambiente bloqueado do projeto sera evidenciada separadamente no handoff.
  - >-
    A primeira suite integral pelo ambiente bloqueado concluiu com 1197 aprovados,
    4 falhas e 1 pulado. As quatro falhas eram efeitos do mesmo retorno 1 do gate
    CWV interno: quatro arquivos Python staged fora do formato Ruff. Nenhum
    marcador verde foi gravado; a formatacao foi corrigida antes da nova medicao.
  - >-
    Pre-commit, pre-push, CI remoto, browser visual, A11y e CWV nao foram
    executados neste incremento inicial.
  - >-
    Os pesos TimesFM nao foram carregados nesta sessao; o teste do gateway usa
    resposta hermetica e a UI preserva fallback analitico quando o runtime nao responde.
  - >-
    A aproximacao de horizonte nao possui arvore explicita de boards e acoes, reach
    contrafactual ou blueprint. O executor WASM do gateway ainda nao existe e nao
    foi simulado como ativo.
revisoes_de_ancora:
  - registro: auditoria-2026-09-05-trabalho-assistido-do-gemini-no-ide
    caminhos: [api/v1/server.py]
    parecer: >-
      A tabela de rotas recebeu apenas GET /api/v1/engine-capabilities, leitura
      estatica e sem socket, processo ou estado adicional. As rotas, ciclo de
      vida e integracoes medidas naquela auditoria permanecem inalteradas.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos: [api/v1/handlers.py]
    parecer: >-
      O helper de proveniencia e o handler do manifesto mantem tipagem PEP 585/604,
      retorno aiohttp explicito e erro interno padronizado. Ruff e os testes
      focalizados passaram sem supressoes novas.
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos: [api/v1/handlers.py, api/v1/middleware.py, api/v1/server.py]
    parecer: >-
      A nova rota e leitura estatica inocua, entrou explicitamente em
      ROTAS_DE_PRODUTO e tem teste positivo e contraprova fail-closed. O tratamento
      de erro interno, ciclo de vida e separacao operador/produto permanecem.
  - registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
    caminhos: [api/v1/handlers.py, api/v1/middleware.py, tests/test_fronteira_produto_operador.py]
    parecer: >-
      A faixa JWT foi ampliada por uma unica rota de manifesto sem I/O operacional.
      Rotas de arquivo, fila, estado, ingestao, buckets e oraculo continuam fechadas.
  - registro: registro-2026-09-12-ativacao-solvers-teoria-dos-jogos-e-multiway-pmev
    caminhos:
      - api/v1/handlers.py
      - api/v1/server.py
      - core/game_theory_schemas.py
      - frontend/src/components/simulator/panels/PluribusMultiwayPanel.tsx
      - frontend/src/lib/pluribusMultiwayEngine.ts
      - frontend/src/tests/simulator/pluribusMultiwayEngine.test.ts
      - tests/test_api_game_theory_handlers.py
    parecer: >-
      As capacidades anteriores foram preservadas e classificadas com maior
      precisao: o adaptador permanece funcional, mas deixa de alegar Nash ou
      convergencia completa sem blueprint, search e alcance contrafactual. Stacks
      e horizonte agora alteram custos e EVs por uma heuristica declarada, sem
      promover o molde a solver completo.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - engine/game_theory_solvers.py
      - tests/test_game_theory_solvers.py
    parecer: >-
      A integracao historica dos motores permanece preservada. O adaptador
      Pluribus agora valida estado, limita exposicao pelo menor stack e aplica
      horizonte causal explicitamente heuristico; nao reclassifica a implementacao
      antiga como solver completo nem altera as demais familias do handoff.
  - registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
    caminhos:
      - api/v1/handlers.py
      - api/v1/server.py
      - engine/canonical_poker_theory.py
      - frontend/src/components/simulator/panels/CfrRegretPanel.tsx
      - frontend/src/lib/canonicalTheoryEngine.ts
      - frontend/src/lib/timesfm-client.ts
      - frontend/src/tests/simulator/canonicalTheoryEngine.test.ts
      - frontend/src/tests/simulator/timesfmConvergence.test.ts
      - tests/test_api_game_theory_handlers.py
      - tests/test_canonical_poker_theory.py
      - tests/test_timesfm_engine.py
    parecer: >-
      Formulas validas permanecem numericamente identicas no corpus compartilhado.
      A mudanca rejeita apenas entradas impossiveis, acrescenta proveniencia e
      substitui historico sintetico por metrica observada do worker.
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos: [api/v1/handlers.py, frontend/src/lib/timesfm-client.ts]
    parecer: >-
      A separacao model_used versus intended_model foi preservada e ampliada com
      weights_loaded e fallback_used na resposta e no consumidor do painel.
  - registro: registro-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras
    caminhos:
      - frontend/src/components/simulator/panels/CfrRegretPanel.tsx
      - frontend/src/components/simulator/panels/PluribusMultiwayPanel.tsx
    parecer: >-
      O saneamento anterior permanece. As mudancas atuais sao tipadas, removem
      LaTeX cru, impedem input numerico impossivel e tornam status/rotulos honestos.
---

# Contrato de capacidades e paridade de engines

## Resultado do incremento

O Site passou de um conjunto de integracoes nomeadas para uma malha com identidade
computacional explicita. O manifesto nao decide a teoria futura nem congela outputs:
ele define a interface em que novas formulacoes PMev, solvers, modelos, WASM e
fallbacks podem ser comparados sem apagar os baselines existentes.

## Ordem executada

1. Manifesto unico e registros tipados.
2. Descoberta por API e acesso fail-closed de produto.
3. Consumo do manifesto na UI.
4. Historico CFR medido no worker.
5. Gateway TimesFM com proveniencia e fallback.
6. Proveniencia anexada às respostas HTTP.
7. Corpus compartilhado e primeira paridade Python/TypeScript.
8. Rejeicao consistente de inputs impossiveis.
9. Causalidade de stack efetivo e horizonte no adaptador Pluribus.
10. Gateway local/API/WASM iniciado com ledger de tentativas e fallback.

## Continuidade

A proxima fase conecta um executor WASM real ou o declara permanentemente fora da
rota, expande o corpus para outputs completos e substitui a heuristica de horizonte
por arvore explicita quando essa capacidade existir. Somente depois entram a
auditoria visual integral, os dez `otherstacks` HRC e o framework PMev denso.
