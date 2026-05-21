# Perspectiva Matemática — Framework Completo v2

**Autoria:** Raphael Vitoi (2026)
**Status:** Teoria em construção ativa. Validação prioritária em FTs.

---

## Hierarquia de Métricas (Pipeline Iterativo)

```text
chipEV → ICM EV → Esperança Matemática → Expectativa Matemática → Perspectiva Matemática
```

### ICM EV — Snapshot Financeiro

"O que tenho agora?" — Ponto de partida concreto. Aproximação via Malmuth-Harville (toy game). Permanece como base, não é descartado. Limitação: trata a mão no vácuo (como se o torneio terminasse ali).

### Esperança Matemática — Estratégico-Lógica

"O que posso concretamente buscar neste cenário, em termos de probabilidades, riscos e ganhos?"

```math
Esperança(ação) = P(ganhar) × ΔPerspectiva_ganho + P(perder) × ΔPerspectiva_perda
```

Preditiva e lógica. Decisão ótima maximiza Esperança, não ICM EV do pot isolado.

### Expectativa Matemática — Probabilístico-Preditiva

"SE isso acontecer, o que representa no meu FGS de positivo/negativo? Quanto afeta ICM EV e minha Esperança futura?"

Opera com cadeia preditiva e desvio padrão. Captura consequências encadeadas (ex: ganhar contra o CL = viro CL + mitigo principal adversário = ferramentas futuras ampliadas).

### Perspectiva Matemática — Síntese Definitiva

Não é o output simples das três camadas. É a síntese que **aprendeu iterativamente** com todas as camadas anteriores e as encapsula. Métrica fechada (sem abstração residual), definitiva.

Substitui ICM EV completamente — não como simplificação, mas como refinamento superior.

---

## Equação Formal

```math
PM = [(Equity × R) × Valuation_stack] - [EV_fold(t, d_pj, pos) + RIO_mw]
```

- `R` = Fator de Realização de Equidade (HU ≈ 1.0; multiway cai)
- `EV_fold(t, d_pj, pos)` = baseline dinâmico (ver seção abaixo)
- `RIO_mw` = Passivo Estrutural Multiway

---

## EV do Fold — Threshold Correto e Dinâmico

**Em chipEV:** `EV_fold = −antes = −0.125bb`. Nunca zero em torneios.

**Em ICM:** pode ser **positivo** — foldar quando há shorts prestes a sair = payjump passivo sem investimento.

### Threshold Correto

```text
Ação é superior ao fold sse: Esperança(ação) > EV_fold
```

Exemplo: Esperança −0.10% > fold −0.25% → call matematicamente correto, mesmo com Esperança negativa.

### EV_fold Dinâmico: f(t, d_pj, pos)

| Dimensão | Efeito no baseline |
| -------- | ----------------- |
| `t → 0` (blinds sobindo em ~3min) | Fold fica mais caro — stack perderá poder de compra. Seja menos conservador. |
| `d_pj → 0` (payjump iminente) | EV_fold pode cruzar zero e ser positivo. Seja mais conservador para colisões. |
| `pos` (UTG + BB na próxima mão) | Inclui custo marginal de 1.5bb iminente. Força ação agressiva se stack chegará morta ao BB. |

---

## Edge Relativa por Profundidade de Stack

```math
Er(S) = (ΔHabilidade / σ) × log(S)
```

Edge cresce logaritmicamente com S. Variância (σ) domina em stacks curtos — equaliza o campo.

| Stack | Ferramentas | Oportunidade de Erro (Oe) | Er |
| ------- | ----------- | ------------------------ | -- |
| 100bb+ | 3bet/4bet/multi-barrel/x-r/overbet/blockers | Máxima | Máxima |
| 25-60bb | open/cbet/3bet/shove parcial | Média | Média |
| 10-15bb | push/fold quase exclusivo | Mínima | Mínima |

**Amortização dupla em short stacks:**

1. Árvore colapsada — menos oportunidades de erro do fraco
2. Nash comoditizado — teoria de push/fold está disseminada
3. Com 60bb+ o jogo é mais complexo E menos disseminado → abismo de edge real

### Risco de Ressurreição

Dobrar um stack de ~10bb (→ ~20bb) devolve a complexidade da árvore ao oponente. Valor estratégico de manter short stack confinado à simplicidade. Um call de EV marginal (+0.05bb) pode ser erro de Perspectiva se o custo de "ressuscitar" o adversário é maior.

---

## RP Pós-flop — Diluição Dinâmica

RP é exclusivo para colisão direta. Conforme fichas entram no pot sem colisão:

- RP residual diminui (pressão de eliminação reduz)
- Cada BB individualmente ganha valuation (stack perde em total)
- Pot representa valuation compensatória exponencialmente maior
- No river: decisões se aproximam do chipEV (HRC pós-flop confirma)

Aparente paradoxo: "pressão ICM diminui e aumenta ao mesmo tempo" — evidência de que ICM sozinho é insuficiente.

---

## RIO — Passivo Estrutural

- **Implied Odds** → conceito de Especulação (vetor positivo)
- **Reverse Implied Odds** → Passivo Estrutural (vetor negativo)

Frequência de cenários multiway: ~33% (tendência de MDA, hipótese forte).

Em multiway, RIO cresce em taxa **x²** enquanto pot odds são lineares. Em ICM, perder pote por RIO contra CL = destruição de Perspectiva exponencial.

**Coeficiente de Insolvência:**

```math
Ci = Perspectiva_real / Pot_Odds_incentivo
```

Quando Ci < 1, pot odds mentem. Com ≥4 jogadores, Ci frequentemente negativo.

---

## Pot Odds — Posição no Framework

| Contexto | Utilidade |
| -------- | --------- |
| Teoria perfeita | Mínima/Inexistente (absorvida por EV_fold + Perspectiva) |
| Prática — Elite | Provavelmente prejudicial (distrator de Perspectiva) |
| Prática — Básico | Positiva (reduz erros catastróficos) |

BB não defende "porque está barato" — defende porque EV_fold = −1.125bb é absurdamente negativo. A métrica correta desloca o fundamento de odds para threshold de fold.

---

## MDF em ICM

MDF existe em ICM. Variáveis devem ser **monetárias** (valuation, não chips brutos). No framework de Raphael: variáveis de **Perspectiva**. BB não descumpre MDF — defende principalmente pelo x-raise punitivo (peso maior) + x-call condensado.

---

## Fator Ψ — Taxa de Maluquice Emocional

```math
P(Call_ganho) = P(Nuts_representado) + P(Bluff_errado_emocional)
```

Frequência de erro emocional/tilt quantificável por MDA populacional. Quando P(erro_humano) > P(nuts_representados), call é obrigatório por Perspectiva, independente do ICMev isolado. Essa é uma variável de MDA e não deve ser incluída na versão atual do simulador.

---

## "Erro de Ambos" — All-in Mal Calibrado

Se o Vilão paga all-in incorretamente (overcall wide), **o range do atacante também estava mal calibrado**. O erro é de ambos:
- **Vilão:** Erro de execução (call matemático com equidade insuficiente).
- **Hero:** Erro de antevisão (shove vulnerável à incapacidade de fold do oponente, $f_b$).

### Dinâmica Sistêmica (Não-Soma Zero)
Diferente do ChipEV, em ICM o call incorreto do defensor reduz o ICMev de ambos os jogadores ativos. A equidade financeira de torneio é destruída pela colisão e distribuída passivamente para os **bystanders** (demais jogadores na mesa). Por isso, calibrar ranges exige prever a taxa de erro humana ($f_b$).

---

## Hipótese de Fricção Limítrofe no River (Hipótese Vitoi H1)

**Status:** Hipótese a ser validada de forma empírica (não assumir como dogma absoluto).

### Enunciado da Hipótese
Em estruturas de torneio padrão (Top-Heavy) e sob apostas sustentáveis pós-flop (como Pot-Size Bet, $B \le P$), o Risk Premium realista de colisão possui um teto de fricção na casa dos $28\%$ ($BF \approx 1.388$). Ao isolarmos a equação de indiferença de Nash no River:
$$E = \frac{BF}{2 + BF} \approx \frac{1.388}{3.388} \approx 41\%$$

Portanto, postula-se que é estruturalmente improvável que um Bluffcatcher necessite de mais de $45\%$ de equidade para pagar no River. Cenários com equidade maior exigiriam ou estruturas de payout aberrantes (satélites) ou sizings de overbet do agressor que o próprio modelo GTO proíbe por violar a auto-preservação de stack (suicídio de EV do agressor).

O simulador em [perspectiva.ts](file:///C:/Users/Raphael/.gemini/Site/frontend/src/lib/perspectiva.ts) deve calcular as equidades limites de forma livre, permitindo que a matemática flua sem cap limitador, testando esta hipótese em spots extremos.

---

## Table Draw — Prioridade de Análise

Antes de olhar as cartas, em qualquer cenário:

1. **BB** — mais jogado contra, expectativa sempre positiva
2. **BTN** — segunda maior frequência, maior gerador de problemas
3. **SB** — naturalmente agressivo (3bet/resteal > call por design posicional)
4. **Posições de abertura à esquerda** — retroativo: CO → HJ → LJ → própria stack

Análise: **Recursiva** (passado/padrões) + **Precursiva** (presente/agora — termo cunhado por Raphael) + **Preditiva** (futuro/probabilístico), com base bayesiana.

---

## FGS Vitoi vs Solver

**FGS solver (HRC):** M-metric + ICM emendados. ~6 mãos de profundidade. Consome RAM colossal. Na prática, ignorado.

**FGS Vitoi:** vai ao cerne abstrativo. Integra variáveis que solvers ignoram:

- Timing de cegões (t−3 min)
- Rotação de posições (UTG → BB próxima mão)
- Table Draw completo
- Análise Precursiva + Recursiva + Preditiva bayesiana

---

## Validação

Testável prioritariamente em FTs (controle máximo). ICM existe desde a 1ª mão de torneio (campo de 200p, estrutura flat, RP de 1.8%). Progressão: bolha/FT → campo médio → início.

