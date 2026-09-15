---
id: handoff-2026-09-14-estruturas-canonicas-e-estados-coerentes-de-hh
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-14T22:10:00-03:00'
atualizado_em: '2026-09-14T22:10:00-03:00'
classes: [interno, medido, handoff, pmev, calibracao]
session_id: 2e4e2bd0-7571-49e4-bd33-1a04752a1609
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  congelada_em: '2026-09-14'
  session_started_at: '2026-09-14T23:04:26Z'
  feedback_score: 9.5
  feedback_sequence: 72
  tool_calls: 203
  tool_errors: 9
  tool_error_method: is_error
caminhos:
  - engine/pmev_hh_canon.py
  - data/pmev_canonical_structures.json
  - tests/test_pmev_hh_canon.py
  - reports/agent-calibration/feedback-ledger.jsonl
pendencias_resolvidas:
  - pend-2026-09-13-benchmark-cruzamento-hh
verificado:
  - feedback do Tier 0 gravado literal no ledger na sequencia 72, nota 9.5, cauda 78b38626
  - cruzamento por ID interno -- 1085 torneios PS distintos na Drive (177 arquivos duplicados por hash), 298 com resumo contra 2 pelo nome
  - os 4057 resumos da Drive e os 830 da base DB Duckriver sao reconstrucoes do PokerTracker 4; Place 0 e Won 0 marcam jogador nao observado
  - uniao Drive e Duckriver -- 4861 torneios PS com maos, 646 com resumo, 42 com estrutura de premios completa, 28 sem bounty nem satelite
  - os 28 se reduzem a tres logicas de premio -- STT 9 (50/30/20), SNG de 45 com 7 pagos, Spin 3-max winner-take-all
  - familia herdada por buy-in e max de mesa; stack inicial 1500 medido em 187 de 191 torneios 9-max
  - estado ICM so com field completo medido (soma das fichas = field x inicial) -- 8991 de 8991 maos STT 9, 4515 de 27162 no SNG de 45, 2380 em Spins; 15886 estados reais, zero incoerentes
  - ante lido so dentro do bloco da propria mao; a janela fixa anterior atribuia ante a Spins
  - gerador -- 80000 estados em 4 familias, zero violacoes; Spin reduz ICM a ChipEV exato
  - 12 testes sinteticos novos, 39 de PMev verdes; ruff e pyright sem achados
nao_verificado:
  - benchmark do item 9 (OOS, Brier, regret) -- o gerador ainda nao tem consumidor fora dos testes
  - calibracao da concentracao do gerador -- com 20, a divergencia ICM x ChipEV p50 dos gerados (9.9%) passa a dos reais (6.2%) no STT 9
  - Spin $23.50 excluido por stack inicial nao medido; o 12o canonico da Drive (3746394538) nao foi baixado
  - next-env.d.ts, adiado pelo Tier 0 para o fim da sessao, nao tratado
---

# Handoff — estruturas canônicas e estados coerentes de hand history

Sessão `2e4e2bd0-7571-49e4-bd33-1a04752a1609`, Claude Opus 5 no Claude Code, assistida
pelo Tier 0. Commits `6e2fc5e3` (correções pós-auditoria) e este.

## Nota do Tier 0

**9.5/10.** *"gostei da sessao, mas faltou um pouco mais de engenhosidade."*

O ponto é concreto. A medição chegou a "só 28 torneios elegíveis" e parou numa
recomendação de buscar resumos oficiais. O reenquadramento veio do Tier 0: a estrutura
dos 28 é canônica e os estados das mãos se adaptam a ela. "Dados insuficientes" era uma
restrição de desenho, e eu a tratei como fim da linha.

## O que a sessão entregou

| Frente | Resultado |
| :--- | :--- |
| Auditoria de 12 a 14/09 | handoff ASCII sem perda silenciosa, aviso de Tier na Assinatura, react-player 3, Prisma sem aninhamento divergente |
| Hand histories PS | cruzamento pelo ID interno; resumos do PT4 caracterizados como reconstrução |
| PMev | 3 lógicas canônicas de prêmio, 15.886 estados reais coerentes, gerador ilimitado ancorado neles |

## Onde os dados moram

Nenhuma mão nem nome de jogador entra no repositório. O catálogo versionado tem só
números. As mãos da Drive e da base DB Duckriver ficam em arquivos locais, e quem
retomar precisa baixá-las de novo. A Duckriver reúne bases de terceiros.

## Prompt de continuação

> Retome a PMev no `Site` a partir deste handoff. `engine/pmev_hh_canon.py` gera estados
> ICM coerentes a partir das três estruturas canônicas em
> `data/pmev_canonical_structures.json`. O próximo passo é o benchmark do item 9 consumir
> o gerador. Nos estados reais completos o resultado é observado: os resumos do STT 9
> trazem as nove colocações. Isso permite medir Brier e log-loss de ICM contra ChipEV
> antes de qualquer operador PMev. O `next-env.d.ts` segue pendente.
