# PMev Spec v0.1 — Contrato Mínimo Reproduzível

## Objetivo

Definir o menor núcleo que permite avaliar uma extensão PMev sem misturar
utilidade de torneio, carreira, crenças adversárias e recompensas intermediárias.

## Baseline recuperável

`PMev-0` usa somente `stacks` e `payouts`. Sob a configuração base:

```text
dynamic_rewards = false
stochastic_transitions = false
beliefs = false
optionality = false
U(S_T) = V_ICM(S_T)
```

o resultado deve recuperar o ICMev/Malmuth-Harville do estado correspondente.

## Unidades

| Campo | Unidade | Regra |
|---|---|---|
| `stacks` | fichas | não negativas; soma positiva |
| `payouts` | unidade monetária única | não negativos; soma positiva |
| `net_contribution` | mesma unidade dos payouts | não inclui rake; overlay/bounty exige operador próprio |
| `V(S)` | mesma unidade dos payouts | comparar ações sempre na mesma escala |

## H9 — Late registration

Para a transição conservativa de entrada tardia:

\[
\sum_i \Delta V_i + B_{entry}=0,
\qquad
B_{entry}=V_{entrant}(S^+) - c.
\]

O benchmark atual é exato e determinístico para fields pequenos. Antes de
Monte Carlo ou dados históricos, ele deve passar testes de conservação e ser
comparado a cálculos ICM exatos em cenários enumeráveis.

## Próximos contratos

1. H3: relógio, próxima subida de blinds e posição orbital, com pares de estados controlados.
2. H4: payoff de vitória, derrota e fold no river; BF local sem transporte entre árvores.
3. H8: árvore fixa, ranges fixos e frequência de sizings para comparação ChipEV/ICMev.
