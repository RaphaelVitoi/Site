# Estruturas de prêmio — templates operacionais PMev

> **Fronteira:** taxonomia didática interna. Os limiares abaixo são pontos de
> partida de curadoria; não descrevem uma classificação universal de MTT.

## Princípio do denominador correto

O peso do primeiro lugar é calculado sobre o **prize pool total**:

`%_1st = premio_1st / prize_pool_total`

Esse percentual é um sinal inicial. A classificação exige também o vetor de
payouts, número de premiados, inclinação dos payjumps e estágio do torneio.

## Templates de trabalho

| Template | Sinal inicial de 1º lugar | Leitura requerida |
| :-- | :-- | :-- |
| Top-heavy | `≥ 25%` | confirmar se os primeiros saltos concentram valor e se o restante da curva sustenta a leitura. |
| Híbrida | `18–24%` | avaliar a curva inteira; o percentual do 1º isolado não resolve a classe. |
| Flat | `≤ 18%` | verificar distribuição efetiva de posições e ITM; não concluir aproximação a ChipEV por um único limiar. |
| PKO / Mystery | fora do escopo v1 | requer modelagem separada de bounty e regras da sala. |
| Satélite | fora do escopo v1 | requer utilidade terminal de ticket e modelo próprio. |

## Referência interna da Aula 1.2

- Field declarado: 126 entradas.
- Prize pool declarado: US$ 1.260.
- Primeiro prêmio: US$ 237,34 (18,8% do pool total).
- Vetor da FT: deve permanecer anexado ao cenário que o usa.

O valor de 18,8% é uma referência no limiar operacional entre flat e híbrida;
ele não certifica a estrutura sem o vetor integral e a fonte do torneio. BF/RP
devem ser recalculados por confronto e não copiados como propriedade estática
da categoria de payout.
