---
id: registro-2026-09-18-harmonizacao-icm-worker-webpage
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-18T17:45:00-03:00'
atualizado_em: '2026-09-18T17:45:00-03:00'
classes: [interno, medido, qualidade, frontend, interface, operacao]
caminhos:
  - frontend/src/components/simulator/workers/icm.worker.ts
  - reports/REGISTRO-2026-09-18-harmonizacao-icm-worker-webpage.md
revisoes_de_ancora:
  - registro: registro-2026-09-18-refinamento-sota-montecarlo-icm
    caminhos:
      - frontend/src/components/simulator/workers/icm.worker.ts
    parecer: >
      Multiplexacao transparente de mensagens no icm.worker.ts, restaurando suporte
      a IcmTableRequest da UI (useIcmCalculations/EquityCalculator) e mantendo
      simultaneamente o suporte a IcmWorkerRequest do IcmWorkerPool.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro, Python 3.12+ (.venv), Node.js v22+
  data_das_medicoes: 2026-09-18
verificado:
  - unificacao do protocolo do icm.worker.ts para atender tanto chamadas de tabela (UI) quanto lotes Monte Carlo
  - inspecao e confirmacao em tempo real via Chrome DevTools MCP da renderizacao da tabela de equidade em /biblioteca/teto-equidade-river-icm
  - 95 suites de testes Jest (653 testes) aprovadas com zero erros e zero avisos
  - compilacao TypeScript estrita tsc code 0
  - eslint limpo sem violacoes
  - portao de pre-flight record_gate.py executado e aprovado
nao_verificado:
  - nenhum item
---

# Harmonizacao e Integracao Webpage: Desacoplamento e Multiplexacao do ICM Worker

Este registro formaliza a resolucao de incompatibilidade no contrato de mensagens do Web Worker ICM (`frontend/src/components/simulator/workers/icm.worker.ts`), restabelecendo a interoperabilidade fluida entre a UI (`useIcmCalculations.ts` / `EquityCalculator.tsx`) e o pool paralelo (`IcmWorkerPool.ts`).

## 1. Contexto e Diagnostico

Durante as iteracoes anteriores de adicao do `IcmWorkerPool`, o arquivo `icm.worker.ts` havia sido tipado exclusivamente para `IcmWorkerRequest` (`{ stacks, prizes, iterations, seed, simulationId }`).

No entanto, os componentes de bancada e simulador da interface web (`EquityCalculator.tsx` em `/simulador` e `/biblioteca/teto-equidade-river-icm`), atraves do hook `useIcmCalculations.ts`, despachavam `IcmTableRequest` (`{ id, players, prizes, selection, conditions }`) para o mesmo worker.

### Sintoma Diagnosticado
- A mensagem da UI continha `players`, mas nao `stacks`.
- A checagem inicial `!Array.isArray(stacks)` lancava um `TypeError`.
- O erro era devolvido sem o campo `id` correspondente ao `activeJob.current`, resultando no descarte silencioso da resposta pelo hook.
- Consequentemente, a tabela de equidade e o sumario na webpage permaneciam vazios/em carregamento indefinido.

## 2. Solucao SOTA Implementada

No arquivo `frontend/src/components/simulator/workers/icm.worker.ts`:
1. **Roteamento Inteligente de Mensagens:**
   - Detecta assinaturas com `players` e `selection` -> despacha para `processTableIcmRequest(data)` com transferencia Zero-Copy de `ArrayBuffer` (`response.payload.buffer`).
   - Detecta assinaturas com `stacks` e/ou `type` (`CALCULATE` / `PING`) -> executa o lote estocastico paralelo `calculateIcmMonteCarlo` para o `IcmWorkerPool`.
2. **Propagacao Segura de Erros:**
   - Em caso de falha de parsing de tabela, propaga o `id` da requisicao para que a interface capture o erro deterministicamente.

## 3. Validacao End-to-End no Navegador

Utilizando o MCP Chrome DevTools:
- Navegacao automatizada para `http://localhost:3000/biblioteca/teto-equidade-river-icm`.
- Confirmada a liquidacao imediata do calculo pelo Web Worker.
- Inspecao do snapshot do DOM confirmou a exibicao de:
  - `ICM exato · 2 stacks avaliados`
  - Tabela com linhas completas (Jogador 1: 40.000 fichas, 42.1% prop, 47.63% ICM Eq, +5.5 p.p. delta; Jogador 2: 55.000 fichas, 57.9% prop, 52.37% ICM Eq, -5.5 p.p. delta).
