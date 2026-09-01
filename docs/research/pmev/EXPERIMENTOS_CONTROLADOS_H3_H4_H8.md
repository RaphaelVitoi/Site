---
id: research-pmev-experimentos-controlados-h3-h4-h8
tipo: protocolo
escopo: Site
autor: "Raphael Vitoi; Codex [Tier 1.B]"
criado_em: 2026-09-01T01:40-03:00
classes: [interno]
caminhos:
  - engine/pmev_controlled_experiments.py
  - tests/test_pmev_controlled_experiments.py
verificado:
  - estados H3, H4 e H8 exercitam intervencao permitida, estado ausente e confusao causal
nao_verificado:
  - nenhuma hipotese foi validada por solver ou por dados de jogadores neste protocolo de desenho
---

# H3, H4 e H8 — Protocolo de Experimentos Controlados

## Regra comum

Cada comparacao possui controle, tratamento, metrica primaria e regra de
falsificacao. Os dois bracos devem conter o mesmo estado minimo, e exatamente
**uma** variavel pode mudar. Uma variavel permitida nao e permissao para mudar
duas variaveis simultaneamente: isso impediria atribuir o resultado a uma
causa definida.

| Hipotese | Estado minimo adicional | Unica intervencao permitida |
| --- | --- | --- |
| H3 — erosao temporal | stacks, payouts, posicoes, blinds, ranges, arvore, tempo ate o blind | `time_to_blind_jump_minutes` |
| H4 — defesa no river | stacks, payouts, posicoes, board, ranges, pote, aposta, arvore | `payouts` |
| H8 — downward drift | stacks, payouts, posicoes, board, ranges, arvore, modelo de utilidade | `payouts` **ou** `utility_model` |

Para H4, a referencia de MTT e a baseline ICMev/Malmuth-Harville declarada no
controle. ChipEV pode compor uma comparacao limite, mas nao substitui essa
referencia dentro de uma final table.

## Artefato por execucao

Uma execucao reproduzivel deve registrar:

1. identificador da hipotese e hash do input de cada braco;
2. exportacao ou versao da arvore/range do solver, quando houver;
3. a metrica primaria definida antes da leitura do output;
4. a regra que refuta a hipotese;
5. versao do motor, ambiente e semente quando existir aleatoriedade;
6. resultados nulos, contrarios e outliers — sem smoothing ou descarte.

## Limites

Estes contratos nao medem habilidade humana, nao validam uma hipotese por si
sos e nao substituem HRC, GTO Wizard, DeepSolver, Monker ou Pio. Eles impedem
que uma comparacao confusa seja rotulada de causal antes que uma exportacao de
solver e uma metodologia de validacao estejam disponiveis.

## Verificacao

O gate executavel esta em `engine/pmev_controlled_experiments.py`; a cobertura
de entradas permitidas, campos ausentes e dupla intervencao vive em
`tests/test_pmev_controlled_experiments.py`.
