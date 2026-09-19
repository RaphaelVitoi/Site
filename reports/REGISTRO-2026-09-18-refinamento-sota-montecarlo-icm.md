---
id: registro-2026-09-18-refinamento-sota-montecarlo-icm
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-18T17:35:00-03:00'
atualizado_em: '2026-09-18T17:35:00-03:00'
classes: [interno, medido, qualidade, frontend, matematico]
caminhos:
  - docs/architecture/MAPA_SIMULADOR_MONTE_CARLO_ICM.md
  - frontend/src/components/simulator/workers/icm.worker.ts
  - frontend/src/lib/icmWorkerPool.ts
  - frontend/src/lib/montecarlo.ts
  - frontend/src/lib/perspectiva.ts
  - frontend/src/tests/simulator/icmWorkerPool.test.ts
  - frontend/src/tests/simulator/montecarlo.test.ts
  - reports/REGISTRO-2026-09-18-refinamento-sota-montecarlo-icm.md
revisoes_de_ancora:
  - registro: registro-2026-09-18-harmonizacao-e-merge-montecarlo-semente-explicita
    caminhos:
      - frontend/src/lib/icmWorkerPool.ts
      - frontend/src/lib/montecarlo.ts
      - frontend/src/lib/perspectiva.ts
    parecer: >
      Evolucao do simulador Monte Carlo com estimador de variancia amostral real,
      eliminacao de NaN no agregador paralelo do worker pool, conservacao estrita de
      massa com stacks zero e emissao da matriz de colocacao completa.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro, Python 3.12+ (.venv), Node.js v22+
  data_das_medicoes: 2026-09-18
verificado:
  - incorporacao integral do documento de arquitetura em docs/architecture/MAPA_SIMULADOR_MONTE_CARLO_ICM.md
  - implementacao do estimador de variancia amostral real s^2 e erro padrao SE = s / sqrt(N) em montecarlo.ts
  - eliminacao definitiva de NaN no agregador paralelo icmWorkerPool.ts via combinacao exata de variancias dos workers
  - correcao da semantica de stack zero em montecarlo.ts aplicando convencao terminal canonica (100% de conservacao da premiacao)
  - emissao da matriz de colocacao completa P(jogador i termina em colocacao j) consumida em calculateMapaICM (N > 10)
  - todas as 95 suites de teste Jest frontend (653 testes) aprovadas com zero erros e zero warnings
  - suite de 1595 testes Pytest backend (1594 passed, 1 skipped) 100% aprovada
  - tsc --build e eslint limpos com zero erros e zero avisos
  - pre-flight de governanca record_gate.py executado e aprovado
nao_verificado:
  - execucao do dev server CDP na porta 9222/9223 durante a gravacao deste commit
---

# Refinamento SOTA do Simulador Monte Carlo ICM: Variancia Real, Prevencao de NaN e Matriz de Colocacao

Este registro formaliza a auditoria, otimizacao matematica e integracao no ecossistema do simulador Monte Carlo ICM (`frontend/src/lib/montecarlo.ts`) e de seus consumidores (`icmWorkerPool.ts`, `icm.worker.ts`, `perspectiva.ts`).

## 1. Problemas Diagnosticados e Solucoes Implementadas

1. **Estimador de Variancia Real vs. Cota de Bernoulli:**
   - A formula anterior `P * sqrt(p*(1-p)/N)` atuava como um limite superior frouxo (3 a 6 vezes mais largo que o desvio empirico medido).
   - Solucao: Acumulacao da soma de quadrados dos payoffs `sumSquares[i]` a cada iteracao, computando a variancia amostral corrigida de Bessel `s^2 = (sumSquares - N*mean^2) / (N - 1)` e o erro padrao `SE = s / sqrt(N)`.

2. **Eliminacao de NaN no Agregador Paralelo (`icmWorkerPool.ts`):**
   - No modo padrao de navegador (`WORKER_POOL`), o agregador aplicava `sqrt(p*(1-p)/N)` sobre a equity monetaria `p`. Para valores `> 1`, `p*(1-p) < 0` gerava `NaN`.
   - Solucao: Combinacao exata das variancias dos workers: `Var(X_comb) = sum(n_w^2 * se_w^2) / n_total^2` e `SE = sqrt(Var(X_comb))`, garantindo valores finitos e validos em qualquer escala monetaria.

3. **Conservacao Estrita de Massa com Stacks Zero:**
   - Em cenarios como `[100, 100, 0]` com premios `[70, 20, 10]`, a guarda `remainingTotalChips <= 0` encerrava o laco prematuramente, perdendo 10 unidades de premio.
   - Solucao: Aplicacao da convencao terminal canonica do kernel exato (`icmMatrix.ts`): jogadores ativos disputam os premios do topo; premios residuais sao distribuidos equitativamente entre os jogadores com stack zero.

4. **Matriz de Colocacao Completa:**
   - A ordem de chegada completa sorteada a cada iteracao agora alimenta `placementCounts[i][j]`, devolvendo `placementDistribution: number[][]` em `MonteCarloIcmResult`.
   - O fallback para $N > 10$ em `calculateMapaICM` consome diretamente essa distribuicao para preencher `positionProbs`, substituindo o antigo preenchimento artificial com zeros.

5. **Registro Arquitetural Canônico:**
   - Documento completo preservado em `docs/architecture/MAPA_SIMULADOR_MONTE_CARLO_ICM.md`.

## 2. Resultados de Validacao

- **TypeScript / Linter:** `tsc --build` e `eslint` sem erros e sem warnings.
- **Jest:** 95 suites e 653 testes aprovados (100% verde).
- **Pytest:** 1594 testes aprovados, 1 skipped justificado (100% verde).
- **Portao de Registro:** `record_gate.py` APROVADO.
