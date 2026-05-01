# SPEC: Calculadora de Perspectiva Matemática (ICM Toy SOTA)

> Especificação Técnica Baseada nos Axiomas de "Perspectiva Matemática", "Reverse Implied Odds (RIO)", "EV_fold Dinâmico" e "Edge Relativa".

## 1. Objetivo Arquitetural

Construir um motor de cálculo e simulação visual (Toy) que sobreponha a heurística falha de Pot Odds e ChipEV tradicional. O sistema calculará a **Perspectiva Matemática (PM)**, precificando o custo de existência (ICM dinâmico) e o passivo estrutural de colisões.

## 2. Motor Matemático (Core Math)

O núcleo da calculadora deve implementar as seguintes equações extraídas da tese sistêmica:

### 2.1. Perspectiva Matemática Integrada (PM)

A métrica soberana que define se o call/open é solvente.
`PM = [(Equity * R) * Valuation_stack] - [EV_fold(t, dpj, pos) + RIO_mw]`

- `R`: Fator de Realização de Equidade.
- `Valuation_stack`: Peso em $ (ICM) das fichas ganhas.

### 2.2. EV_fold Dinâmico (Baseline Móvel)

Ao contrário do modelo estático, o piso de fold varia por dois tensores:

- **Efeito Payjump ($d_{pj}$):** Proximidade da bolha. Pode tornar `EV_fold > 0` (Fold Positivo).
- **Erosão Antecipada ($t-3$):** Proximidade do aumento de blinds. Acelera o `EV_fold` para território negativo (força agressão para evitar morte por inanição).

### 2.3. Reverse Implied Odds (RIO_mw)

O passivo estrutural cresce exponencialmente em cenários Multiway.

- `RIO_mw = RIO_base * (N_jogadores ^ 2)`
- **Coeficiente de Insolvência ($C_i$):** `C_i = Pot_Odds / PM`. Se $C_i < 1$, as pot odds são uma armadilha.

### 2.4. Edge Relativa ($E_r$)

Atua como um filtro final de abstenção de lucro.

- `E_r(S) = (\sigma / \Delta Hab) * log(S)`
- Pilhas profundas (100bb) aumentam a árvore de decisão (Maior $O_e$), permitindo alta $E_r$.
- Pilhas curtas (10bb) podam a árvore (Menor $O_e$), convertendo a decisão para colisão mecânica de Nash, amortizando a Edge do jogador superior.

## 3. Estrutura de Dados e Parâmetros (Input/Output)

### 3.1. Entradas do Usuário (Inputs da UI)

- `stack_efetivo` (Number): Ex: 10 a 100 bb.
- `jogadores_ativos` (Number): 2 (Heads-up) a 9 (Multiway massivo).
- `pot_odds_imediatas` (Ratio/Percent): Ex: 4:1 (20%).
- `distancia_payjump` (Enum/Number): Longe, Moderado, Bolha, FT.
- `tempo_blinds_min` (Number): Minutos até o próximo nível (ex: 3 min).
- `edge_oponentes` (Enum): Superior, Neutro, Inferior.

### 3.2. Saídas do Motor (Outputs Visuais)

- **Gráfico de Insolvência:** Curva de degradação da Perspectiva vs Pot Odds lineares.
- **Sinalizador de Decisão:** `Solvente (Agressão)`, `Mecânico (Nash)`, `Insolvente (Fold)`.
- **Valor de Abstenção:** Quantos BB/EV estão sendo desperdiçados ao foldar em cenários de alta Edge.

## 4. Fluxo de Execução

1. O frontend capta os inputs do estado do jogo.
2. O `Calculador` deriva o `EV_fold` ajustado por `t` e `d_pj`.
3. O `Calculador` calcula as RIO exponenciais se `jogadores_ativos > 2`.
4. A Edge Relativa atua como multiplicador final sobre a Esperança Matemática.
5. O sistema projeta a sobreposição visual demonstrando onde as Pot Odds falham.
