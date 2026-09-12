---
id: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Antigravity SOTA v8.0 Gold -- sessao 605d3774-d2f3-4277-8f43-f686af721631"
criado_em: 2026-09-12T16:15:00-03:00
atualizado_em: 2026-09-12T16:15:00-03:00
classes: [interno, medido, teoria-dos-jogos, chen-ankenman, janda, cfr, a-star]
caminhos:
  - api/v1/handlers.py
  - api/v1/server.py
  - core/canonical_theory_schemas.py
  - engine/canonical_poker_theory.py
  - engine/timesfm_engine.py
  - engine/__init__.py
  - frontend/next.config.js
  - frontend/package.json
  - frontend/src/components/simulator/panels/CfrRegretPanel.tsx
  - frontend/src/lib/canonicalTheoryEngine.ts
  - frontend/src/lib/timesfm-client.ts
  - frontend/src/tests/content/editorial-registry.test.ts
  - frontend/src/tests/simulator/canonicalTheoryEngine.test.ts
  - frontend/src/tests/simulator/timesfmConvergence.test.ts
  - tests/test_api_game_theory_handlers.py
  - tests/test_canonical_poker_theory.py
  - tests/test_timesfm_engine.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.6'
verificado:
  - >-
    INTEGRACAO ANALITICA DE CHEN & ANKENMAN (2006) E MATTHEW JANDA (2013):
    Implementados em engine/canonical_poker_theory.py os solucionadores analiticos fechados:
    Clairvoyance Game [0, 1] e Jogo AKQ (Chen & Ankenman Caps. 11, 13, 15) com equacoes exatas
    de alpha, s* e valor do jogo; MDF, Dimensionamento Geometrico Multi-Rua e Razoes de Blefe
    por rua (Janda Partes 1, 3, 5, 12, 14) com validacao estrita Pydantic v2 (Zero-Any).
  - >-
    EXPOSICAO REST V1 ASSINCRONA:
    Rotas sob /api/v1/canonical/* registradas em api/v1/server.py e handlers em api/v1/handlers.py
    com validacao estrita e resposta JSON documentada.
  - >-
    MOTOR CLIENT-SIDE E COUPLING NO HUD DO SIMULADOR:
    canonicalTheoryEngine.ts implementa calculos em TypeScript com latencia zero.
    CfrRegretPanel.tsx exibe o Dimensionamento Geometrico Canonico de Janda e a taxa
    constante de pote (% Pot / Street) ao lado do pathfinding A*, alem de badge com MDF e Alpha.
  - >-
    SUITE DE TESTES E HOMEOSTASE TOTAL APROVADA:
    Backend: 27/27 testes aprovados (test_canonical_poker_theory.py, test_game_theory_solvers.py,
    test_api_game_theory_handlers.py) em 2.71s, ruff check limpo e pyright com 0 erros e 0 warnings.
    Frontend: 50/50 suites e 398/398 testes aprovados em 5.78s, tsc e eslint limpos.
nao_verificado:
  - nenhuma verificacao omitida no escopo deste registro.
revisoes_de_ancora:
  - registro: auditoria-2026-09-05-trabalho-assistido-do-gemini-no-ide
    caminhos:
      - api/v1/server.py
    parecer: >
      Adicao de 5 novas rotas analiticas sob /api/v1/canonical/* mantendo estrita conformidade
      arquitetural e preservando rotas de telemetria e ciclo de vida do servidor. Revisado: permanece valido.
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos:
      - api/v1/handlers.py
      - api/v1/server.py
    parecer: >
      Adicionados handlers de teoria canonica sob o padrao assincrono com tratamento de erro
      padronizado e esquemas Pydantic v2 sem alterar a fronteira HTTP. Revisado: permanece valido.
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - api/v1/handlers.py
      - engine/timesfm_engine.py
      - frontend/src/lib/timesfm-client.ts
    parecer: >
      Expansao do motor TimesFM com projecoes de convergencia CFR+ e deriva de oponentes,
      preservando integralmente o rastreamento rigoroso de procedencia dos pesos e metadados. Revisado: permanece valido.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - frontend/package.json
    parecer: >
      Ajuste estrito da flag -p 3000 no script dev para evitar colisoes de portas de rede
      em ambiente local, sem introduzir dependencias ou alterar governanca de pacotes. Revisado: permanece valido.
  - registro: registro-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps
    caminhos:
      - engine/timesfm_engine.py
    parecer: >
      Extensao das funcoes de dominio de series temporais com forecast_cfr_convergence e
      forecast_opponent_drift com tipagem PEP 585/604 e Pydantic v2. Revisado: permanece valido.
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - frontend/package.json
    parecer: >
      Configuracao isolada do script dev (-p 3000) sem impacto em dependencias ou adaptacoes do modelo. Revisado: permanece valido.
  - registro: registro-2026-09-10-importacao-visivel-hh-hrc
    caminhos:
      - frontend/package.json
    parecer: >
      Ajuste de porta do script dev do Next.js preservando componentes e integracoes de importacao de hand histories. Revisado: permanece valido.
  - registro: registro-2026-09-10-publicacao-inputs-mtt
    caminhos:
      - frontend/package.json
    parecer: >
      Ajuste pontual do script dev sem afetar a publicacao de inputs MTT. Revisado: permanece valido.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - frontend/package.json
    parecer: >
      Travamento da porta canonica 3000 no script dev para assegurar estabilidade operacional do frontend. Revisado: permanece valido.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - frontend/package.json
    parecer: >
      Fixacao de porta no script dev do Next.js sem alteracao nas metricas de performance e integridade. Revisado: permanece valido.
  - registro: validacao-2026-09-07-findings-do-astra-contra-o-codigo
    caminhos:
      - engine/timesfm_engine.py
    parecer: >
      Adicao de funcoes estocasticas de convergencia mantendo o cumprimento do finding B04 e a declaracao
      explicita da procedencia analitica quando sem pesos carregados. Revisado: permanece valido.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - api/v1/handlers.py
    parecer: >
      Manutencao rigorosa de tipagem PEP 585/604, validada por Pyright (0 erros e 0 warnings).
      Revisado: permanece valido.
  - registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
    caminhos:
      - api/v1/handlers.py
    parecer: >
      Adicao de endpoints publicos analiticos sem violacao de politicas de autenticacao. Revisado: permanece valido.
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - frontend/src/tests/content/editorial-registry.test.ts
    parecer: >
      Ajuste do teste unitario do registro editorial para reconhecer a publicacao
      explicita do artigo genealogia-dos-solvers-claudico-a-pluribus, elevando o acervo
      de 15 para 16 itens. A integridade estrutural das demais fontes permanece preservada.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - engine/__init__.py
    parecer: >
      Adicao de exportacoes dos novos solucionadores canonicos no __all__ de engine/__init__.py
      mantendo total retrocompatibilidade e integridade de exportacoes anteriores.
  - registro: registro-2026-09-12-ativacao-solvers-teoria-dos-jogos-e-multiway-pmev
    caminhos:
      - api/v1/handlers.py
      - api/v1/server.py
      - tests/test_api_game_theory_handlers.py
    parecer: >
      Extensao cumulativa com 5 novos testes de integracao para os endpoints canonicos de
      Chen & Ankenman e Matthew Janda. Todos os 27 testes da suite passaram sem erros.
---

# Integracao da Teoria Canonica de Poker: Chen & Ankenman (2006) e Matthew Janda (2013)

## 1. Contexto e Motivacao
Apos a ativacao dos solucionadores computacionais modernos (Pluribus, Libratus, DeepStack, ReBeL),
identificou-se a necessidade de integrar as solucoes analiticas em forma fechada das duas principais
obras da literatura de poker racional:
- *The Mathematics of Poker* (Bill Chen & Jerrod Ankenman, 2006, 367 p.)
- *Applications of No-Limit Hold'em* (Matthew Janda, 2013, 508 p.)

## 2. Implementacoes Realizadas

### 2.1 Backend (Python 3.14 & Pydantic v2)
1. **Solucionadores Analiticos (`engine/canonical_poker_theory.py`):**
   - `ChenClairvoyanceSolver`: Solucao analitica do jogo continuo [0, 1] de meia-rua (Cap. 11).
   - `ChenAKQGameSolver`: Solucao fechada do jogo discreto AKQ (Caps. 13 e 15).
   - `ChenIndifferenceCalculator`: Verificador formal de indiferenca para blefe e call.
   - `JandaMDFCalculator`: Minimum Defense Frequency e responsabilidade defensiva multiway (Partes 1 e 12).
   - `JandaGeometricBetSizing`: Dimensionamento geometrico multi-rua para all-in no river (Partes 3 e 14).
   - `JandaStreetBluffValueRatio`: Razoes balanceadas de blefe/valor por rua (Parte 5).
2. **Esquemas Estritos (`core/canonical_theory_schemas.py`):**
   - Modelos com `allow_inf_nan=False`, tipagem estrita PEP 585/604 e Zero-Any.
3. **Handlers e Rotas REST (`api/v1/handlers.py`, `api/v1/server.py`):**
   - Registrados 5 novos endpoints em `/api/v1/canonical/*`.

### 2.2 Frontend (Next.js & React 19)
1. **Motor Client-Side (`frontend/src/lib/canonicalTheoryEngine.ts`):**
   - Implementacao TypeScript para execucao instantanea no browser.
2. **Coupling no HUD (`frontend/src/components/simulator/panels/CfrRegretPanel.tsx`):**
   - Exibicao da taxa geometrica de Janda (% Pot / Street) ao lado do pathfinding A*, alem de indicadores de MDF e Alpha.
3. **Suites de Testes (`frontend/src/tests/simulator/canonicalTheoryEngine.test.ts`):**
   - Cobertura completa de testes para os calculos analiticos client-side.

## 3. Evidencias de Medicao e Homeostase
- **Pytest:** 27/27 testes aprovados em 2.71s (0 erros, 0 warnings).
- **Python Quality:** `ruff check` limpo, `pyright` com 0 erros e 0 warnings.
- **Frontend Jest:** 50/50 suites e 398/398 testes aprovados em 5.78s.
- **Frontend Typecheck & Lint:** `tsc --noEmit` e `eslint` 100% limpos.
