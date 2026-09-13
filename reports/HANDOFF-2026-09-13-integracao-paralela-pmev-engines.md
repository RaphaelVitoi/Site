---
id: handoff-2026-09-13-integracao-paralela-pmev-engines
tipo: handoff
escopo: Site
autor: 'Raphael Vitoi, com auditorias Hermes e Sol (Codex)'
criado_em: '2026-09-13T12:00:00-03:00'
classes: [interno, pmev, engines, continuidade]
caminhos:
  - docs/research/pmev/ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md
  - reports/REGISTRO-2026-09-13-curadoria-drive-poker-e-pmev.md
  - reports/AUDITORIA-2026-09-13-integracao-paralela-pmev-engines.md
  - reports/HANDOFF-2026-09-13-integracao-paralela-pmev-engines.md
  - docs/research/materials/icmteoriaadicionalpt1.txt
  - docs/research/materials/icmteoriaadicionalpt2.txt
  - docs/research/pmev/ENTENDENDO_ICM_HEURISTICAS_LEDGER.md
  - docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md
verificado:
  - Duas auditorias reconciliadas em um contrato composicional com limites epistemicos.
  - Python local 3.14.6 e nenhum arquivo staged no corte de encerramento.
  - Divergencia entre planejamento e verificacao real na Triad Mesh identificada.
  - Markdownlint direcionado aos quatro documentos integrados com exit code 0.
nao_verificado:
  - Suite integral, pre-commit, commit e push; dispensados pelo Tier 0 neste encerramento.
  - Reproducao independente dos EvidencePair e execucao de solvers externos.
  - tests/test_record_index.py inconclusivo por lock entre duas invocacoes concorrentes; nao e evidencia de regressao.
---

# Handoff — integração paralela PMev e engines

## Estado entregue na IDE

- Curadoria paralela preservada como corpus, com limites de verificação
  explícitos.
- Díptico autoral (Entendendo o ICM e suas Heurísticas + Aula 1.2) e manuscritos
  teóricos adicionais (icmteoriaadicional pt1 e pt2) devidamente absorvidos e
  indexados.
- Arquitetura de seis camadas convertida em pipeline composicional testável.
- Fórmula multiplicativa genérica de ruína rejeitada e substituída por esperança
  total sobre estados terminais.
- Targets percentuais de Hermes rebaixados a propostas sem baseline.
- Separação formal entre corpus, hipótese, cenário, `EvidencePair`, gateway,
  runtime e benchmark.
- Nenhum commit e nenhum push executados por decisão explícita do Tier 0.

## Ordem vinculante da retomada

1. **Triad Mesh:** substituir `verified=True` e `convergence_rate=1.0` sintéticos
   por estados derivados de recibos reais; teste negativo obrigatório.
2. **Registro de hipóteses:** criar fonte estruturada única H1–H12 e gerar as
   representações documentais, evitando duplicação divergente.
3. **Contrato de cenário:** tipar unidades, regime, stacks, payouts, ranges,
   solver/build, e-Nash, seed, horizonte e política dos agentes.
4. **EvidencePair:** promover primeiro os 7 pares locais; manter os 97
   nós/figuras como inventário até reprodução.
5. **Baseline:** provar `PMev-0 = ICMev`; manter o modelo aditivo como baseline
   versionado.
6. **Composição:** introduzir um operador por vez com redução, ablação e
   propagação de incerteza.
7. **Paridade:** usar os mesmos fixtures em Python e TypeScript; mover a WASM
   somente kernels puros medidos.
8. **Skill de conhecimento:** fechar formato declarado versus implementado,
   exit codes, cache por conteúdo, raízes de escrita e privacidade.
9. **Benchmark:** derivar targets de amostra elegível usando OOS, Brier/log-loss,
   regret, caudas, p50/p95/p99 e memória.
10. **Gate mínimo:** antes do futuro commit, rodar apenas a bateria sine qua non
    do lote e então o portão obrigatório, sem transferir verde entre conteúdos.

## Primeiro corte recomendado

O menor incremento íntegro combina os itens 1–3: corrigir a semântica de estado
da Triad, criar o schema de hipótese/cenário e testar falha fechada. Ele não
depende de solvers pesados, não calibra coeficientes e prepara todas as engines
posteriores sem contaminar o núcleo com resultados inventados.

## Regra de parada

Se faltarem build, e-Nash, unidade, seed ou fonte, preservar o valor como
ilegível/não verificado. Para calibração, usar literalmente:
**dados insuficientes — nenhuma calibração planejada**.
