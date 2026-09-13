---
id: handoff-2026-09-13-rearquitetura-computacional-pmev
tipo: handoff
escopo: Site
autor: 'Raphael Vitoi, com Gemini 3.8 Flash'
criado_em: '2026-09-13T12:55:00-03:00'
classes: [interno, pmev, engines, continuidade]
caminhos:
  - engine/pmev_spec.py
  - engine/pmev_operators.py
  - engine/pmev_pipeline.py
  - engine/pmev_falsification.py
  - engine/pmev_postflop_matrix.py
  - shared/types/pmev.ts
  - tests/test_pmev_compositional.py
  - docs/research/pmev/ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md
verificado:
  - Rearquitetura completa entregue em codigo limpo, testado e tipado.
  - 34 testes PMev passando com 100% verde no pytest.
  - Pyright (0 erros, 0 warnings), Ruff (0 erros), TypeScript (tsc exit code 0), Markdownlint (exit code 0).
nao_verificado:
  - Calibracao numerica integral em Hand Histories (bloqueada -- Fase 4 DADOS INSUFICIENTES).
---

# Handoff — Rearquitetura Computacional do Arcabouco PMev

## Estado do Repositorio Entregue

1. **Arcabouco Operacional:**
   A cadeia de operadores $f_1 \dots f_5$ esta materializada em `engine/pmev_operators.py`
   com regularizacao Tikhonov/Dirichlet e particionamento de Bellman ($\gamma = 1$)
   sem dupla contagem.
2. **Motores de Falsificacao:**
   Testes formais para $H_4$, $H_7$, $H_9$ e $H_{12}$ estao ativos e testados em
   `engine/pmev_falsification.py`.
3. **Contratos Isomorficos:**
   `engine/pmev_spec.py` e `shared/types/pmev.ts` sincronizados em `Measured<T>`.
4. **Bancada de Testes:**
   34 testes verdes em `tests/test_pmev_spec.py`, `tests/test_pmev_controlled_experiments.py`
   e `tests/test_pmev_compositional.py`.

## Ordem de Continuidade para a Proxima Sessao

1. **Integracao Visual no Frontend (Next.js):**
   Conectar os componentes de UI em `frontend/src/components/simulator/` aos novos
   tipos de `shared/types/pmev.ts`, exibindo envelopes de incerteza `Measured<T>` e
   decomposicao de operadores em vez de rotulos estaticos.
2. **Extensao da Matriz de Evidencia Pos-Flop da Aula 1.2:**
   Promover progressivamente os 97 nos do corpus autoral para `EvidencePair` homologados
   conforme solvers gerem os dumps abertos com $\epsilon \le 0,1\%$ e checksums.
3. **Ingestao Curada do Data Lake de Hand Histories:**
   Iniciar a preparacao do dataset de 3.804 Hand Histories para futura avaliacao de
   Brier score e log-loss na probabilidade de ruina (Fase 3 da bancada).
