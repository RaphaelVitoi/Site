---
name: Late Registration — Impacto ICM no Valor da Stack
description: Estudo quantitativo do impacto de late registration no valor ICM de uma stack inicial. Autor desconhecido (mentor antigo de Raphael). Três experimentos com simulação Monte Carlo em R. Quantifica o prêmio ICM do late reg e dilução proporcional por jogador existente.
type: reference
---

# Late Registration — Impacto ICM no Valor da Stack

**Autor:** Desconhecido (mentor antigo de Raphael — aula histórica)
**Metodologia:** Monte Carlo ICM em R (100k a 120M simulações). Aproximação por simulação (exata é intratável computacionalmente para campos grandes).

---

## Achados Quantitativos Centrais

### Experimento 1 — Online $530 (buy-in efetivo: $500)

- 165 entrants, 52 players left quando reg fechou
- Stack inicial: 25k. Média da mesa: 79.327
- Valor ICM da stack inicial: **~$581**
- Prêmio: **$81 ou +16% acima do buy-in**

### Experimento 2 — Live $5.000 (buy-in efetivo: $4.650), Day 2

- 170→189 jogadores (19 late entries overnight)
- Stack inicial: 25k. Média no início do Day 2: 68.519
- Valor ICM da stack inicial: **~$5.117**
- Prêmio: **$467 ou +10% acima do buy-in**

### Experimento 3 — Live $9.400 (buy-in efetivo: ~$9.400), Day 2

- 90→100 jogadores (10 late entries overnight), 60k starting stack
- Campo ~50% restante quando late reg abriu
- Valor ICM da stack: **~$9.844**
- Prêmio: **$444 ou +4.7% acima do buy-in**

---

## Mecanismo: Quem Perde e Quanto

Cada late entry dilui todos os stacks existentes proporcionalmente. No Experimento 3:

- Perda média por jogador: **0.28% do valor ICM da stack**
- A perda percentual é **uniforme** entre todos os jogadores — CL perde mais em termos absolutos mas a mesma % que os curtos
- O valor "ganho" pelo late entry **emana diretamente dos jogadores já no torneio**
- A uniformidade (~0.28%) reflete a mecânica ICM em campo grande: cada jogador perde proporcionalmente à sua fatia atual do prize pool. Maior stack = maior fatia = maior perda absoluta, mesma proporção. Não há dinâmica de FT ou pressão de eliminação imediata — é distribuição linear em campo longe do dinheiro.

---

## Variável Determinante: Proporção do Campo Restante

| Campo restante | Prêmio ICM do late entry |
|------------------------|--------------------------|
| ~1/3 do campo (Exp. 2) | +10%                     |
| ~1/2 do campo (Exp. 3) | +4.7%                    |
| ~1/3 (Exp. 1, online)  | +16%                     |

Quanto menor a fração do campo ainda em jogo, maior o prêmio ICM de entrar tarde.

---

## Threshold Proposto pelo Autor

**Stack inicial não deveria valer mais que 5% acima do buy-in.**
Heurística derivada: fechamento quando **média de stacks ≈ 2x o starting stack**.

---

## Observação Estratégica (Seleção de Mesa por Profs)

Profissionais usam a distribuição de chips como critério de game selection no late reg:

- Chips concentrados em recreativos → entram (EV positivo de exploração)
- Chips concentrados em profissionais → pulam (EV negativo)

Late reg longa habilita esta seleção assimétrica de forma sistematizada.

---

## Conexões com o Framework Vitoi

1. **EV_fold positivo em ICM**: A diluição passiva de outros jogadores quando alguém entra tarde é análoga ao payjump passivo — late entries criam pressão ICM similar à eliminação de shorts.

2. **Externalidade negativa**: Cada late entry gera uma externalidade negativa uniforme sobre todos os stacks existentes — exatamente o que `externalityPct` no motor captura na escala de um pot.

3. **Perspectiva Matemática e Table Draw**: Saber quem tem os chips quando decide o late reg (game selection informada) é uma instância de Table Draw e Análise Precursiva aplicados antes de sequer sentar.

4. **Valuation da stack é dinâmico**: O mesmo stack de 25k vale $500 no começo e $581 duas horas depois — sem jogar uma mão. Confirmação empírica de que ICM EV não é estático.

---

## Notas Técnicas

- Programa em R, Monte Carlo (não ICM exato — intratável com >~8 jogadores)
- 100k simulações: Diff ~432 (muito ruidoso)
- 10M simulações: Diff <35 (convergência boa)
- 120M simulações: Diff <25, Memory 173GB, Tempo 5.75h (server)
- Para campos reais, 10M é o ponto de equilíbrio custo/precisão razoável
