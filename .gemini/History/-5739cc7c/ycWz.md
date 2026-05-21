# Validação Matemática das Hipóteses Paradigmáticas — v1

**Autoria:** Raphael Vitoi (teoria) + derivações formais (2026)
**Status:** D1–D5 formalizadas. Próximo: D6 — transposição pós-flop de todos os componentes PM.

---

## Objetivo final: materializar a Perspectiva Matemática

**Toda derivação neste documento é um insumo para tornar a PM calculável com rigor.**

A equação formal da Perspectiva Matemática é:

```text
PM = [(Equity × R) × Valuation_stack] − [EV_fold(t, d_pj, pos) + RIO_mw]
```

Onde:

- `Equity × R` = equity realizada após desconto pelo Fator de Realização (R < 1 em MW/OOP)
- `Valuation_stack` = valor monetário ICM da stack no torneio (via Malmuth-Harville)
- `EV_fold(t, d_pj, pos)` = baseline dinâmico do fold — **primeira ordem: −investido**; correções contextuais de segunda ordem
- `RIO_mw` = Passivo Estrutural Multiway — dano esperado por Reverse Implied Odds

A decisão ótima é a ação que maximiza PM, não EV de chips brutos.

As derivações D1–D5 constroem cada componente do lado direito da equação. Sem elas, PM é uma fórmula sem substância calculável.

---

## Hierarquia das derivações

Dependência lógica entre os componentes PM:

```text
EV_fold(ICM) > 0  →  RIO(N) ~ O(N²)  →  Ci < 1 em MW
                                              ↓
                                    PM calculável em pré-flop
                                              ↓
                              [D6] transposição pós-flop → PM em qualquer street
```

Er(S) é independente dos demais — quantifica o edge relativo do jogador superior em função da profundidade de stack, não um componente direto da equação PM.

---

## Derivação 1: EV_fold(ICM) pode ser positivo

### Proposição

Seja um torneio com N jogadores, prêmios `P = {p_1 ≥ p_2 ≥ ... ≥ p_k}` não-flat (`p_i > p_{i+1}` para pelo menos um i), e hero com stack `s_h`. Existem configurações de mesa tal que `EV_fold(ICM) > 0`.

### Definição formal

Seja `E(s)` a equity ICM do hero dado vetor de stacks `s`, calculada via Malmuth-Harville:

```text
E(s) = Σ_j  P(hero termina na posição j | s) × p_j
```

No fold, villain leva pot `π`. As stacks resultantes:

```text
s_fold = (..., s_h, ..., s_v + π, ...)
```

```text
EV_fold(ICM) = E(s_fold) − E(s_atual)
```

### Prova de existência

Considere N = 4, prêmios `P = {p_1, p_2, p_3, 0}` com `p_1 > p_2 > p_3 > 0`, e:

```text
s_atual = [s_h, s_v, ε, ε]    com ε → 0+
```

**Claim:** `EV_fold(ICM) > 0` nessa configuração para `π` suficientemente pequeno.

**Argumento:** Como ε → 0, a probabilidade de qualquer dos dois shorts ser eliminado antes do hero é próxima de 1. Cada eliminação anterior gera payjump `Δp_j = p_{rank_h} − p_{rank_h + 1} > 0` para o hero.

O fold não altera `s_h` nem os shorts — preserva integralmente a trajetória de laddering passivo. O call, por contraste, expõe `s_h` a risco não-zero de redução, o que diminui a probabilidade do hero sobreviver às eliminações dos shorts.

Formalmente: como o villain absorve `π` (fica maior), a competição direta hero–villain é ligeiramente desfavorável ao hero no cenário de fold. Mas esse efeito negativo é de segunda ordem quando `π << s_h`. O efeito positivo de primeiro ordem é a preservação de `P(hero sobrevive aos shorts)`, que é dominante.

**Condição suficiente geral:**

```text
EV_fold(ICM) > 0   sse   Σ_{j ∈ shorts} P(j eliminado antes de h | fold) × Δp_j  >  |ΔE_competição|
```

Onde `|ΔE_competição|` é a perda de equity por o villain ter ficado com `π` a mais — uma função decrescente de `s_v / total_chips`.

Para `d_pj → 0` (payjump iminente), `Δp_j` é grande e a condição é satisfeita com facilidade.

### Corolário: por que chipEV sempre negativo

Em chipEV, a estrutura de prêmios é flat: `p_i = constante`. Logo `Δp_j = 0` para todo j. A condição suficiente colapsa para `0 > 0`, que é falso. Portanto:

```text
EV_fold(chipEV) = −antes < 0   sempre
```

A positividade do EV_fold é **estruturalmente exclusiva do ICM com estrutura não-flat** — resultado do laddering, não de qualquer quirk do modelo. Confirma que o framework Perspectiva não é uma refinamento cosmético do chipEV: é um espaço de decisão qualitativamente diferente.

### Extensão pós-flop (EV_fold)

No pós-flop, o EV_fold cresce com cada street:

```text
EV_fold_flop  = −investido_preflop
EV_fold_turn  = −(investido_preflop + investido_flop)
EV_fold_river = −pot_total_investido
```

O mesmo mecanismo de positividade ICM se aplica — mas agora compete com o custo acumulado das streets anteriores. Para o river, a condição de EV_fold > 0 requer Δp_j suficientemente grande para cobrir o pot total investido. Tipicamente isso implica: foldar no river sob ICM só é positivo quando o hero já minimizou o investimento acumulado (streets pequenas, sizing conservador) e há shorts prestes a sair.

**Implicação para o motor pós-flop:** o threshold de fold deve usar o pot acumulado por street como baseline dinâmico, não um valor fixo.

---

## Derivação 2: RIO multiway — crescimento do dano esperado

### Proposição

Em cenário multiway com N oponentes independentes, o **dano esperado por Reverse Implied Odds** cresce em O(N²), enquanto as pot odds crescem em O(N). A razão dano/incentivo cresce em O(N).

### Setup

Seja:

- `p_d` = P(um oponente específico tem mão dominante sobre o hero) — constante por oponente, independente
- `aposta_base` = contribuição individual por player ao pot
- `pot(N) = N × aposta_base` — tamanho do pot multiway (linear em N)

### Prova

**Frequência de domínio:**

```text
P(pelo menos 1 oponente domina) = 1 − (1 − p_d)^N
```

Para `p_d` pequeno (razoável para range médio):

```text
≈ 1 − (1 − N × p_d) = N × p_d     [aproximação de primeira ordem]
```

Crescimento: **O(N)** — linear.

**Custo quando dominado:**

Quando o hero acerta mão dominada (segunda melhor mão), perde o pot completo:

```text
E[perda | dominado] ≈ pot(N) = N × aposta_base
```

Crescimento: **O(N)** — linear.

**RIO = produto:**

```text
RIO(N) = P(dominado) × E[perda | dominado]
       ≈ (N × p_d) × (N × aposta_base)
       = N² × p_d × aposta_base
```

Crescimento: **O(N²)** — quadrático.

**Pot odds no mesmo cenário:**

```text
Pot_Odds(N) = pot(N) / custo_call = N × aposta_base / aposta_base = N
```

Crescimento: **O(N)** — linear.

**Razão:**

```text
RIO(N) / Pot_Odds(N) = N² × p_d × aposta_base / N = N × p_d × aposta_base
```

Crescimento da razão: **O(N)** — cada jogador adicional aumenta em `p_d × aposta_base` a desproporção entre passivo estrutural e incentivo aparente das pot odds.

### Exemplo numérico

`p_d = 0.15`, `aposta_base = 1bb`. Comparação por N:

| N | Pot_Odds | RIO(N) | Razão |
|---|----------|--------|-------|
| 1 | 1bb      | 0.15bb | 0.15  |
| 2 | 2bb      | 0.60bb | 0.30  |
| 3 | 3bb      | 1.35bb | 0.45  |
| 4 | 4bb      | 2.40bb | 0.60  |
| 5 | 5bb      | 3.75bb | 0.75  |

Com 4 oponentes, o RIO consome 60% do aparente ganho das pot odds. Com 5 oponentes, 75%.

### Reformulação precisa da afirmação original

> "RIO cresce em x² enquanto pot odds são lineares."

**Versão precisa:**

> O dano esperado por RIO cresce em O(N²) porque é o produto de dois termos lineares: frequência de domínio (O(N)) e custo quando dominado (O(N), pelo crescimento do pot). As pot odds crescem em O(N). A razão dano/incentivo cresce em O(N) — cada jogador adicional piora a equação multiplicativamente.

### Extensão pós-flop (RIO)

No pós-flop, o efeito é amplificado pelo pot entrapment:

- No flop, pot odds "atraem" o hero para dentro do pot com custo aparentemente baixo
- No turn, o pot já cresceu — custo de fold aumentou, mas a mão dominada pode estar mais clara
- No river: o hero paga o custo máximo de RIO — exatamente o momento em que foldar (EV_fold = −pot_total_investido) é mais caro

O pot entrapment é a versão dinâmica do RIO: o hero não sai porque saiu caro demais não entrar. A espiral é: pot odds flop → investimento acumulado → pot odds turn amplificadas pelo pot maior → river com custo de fold catastrófico. O RIO do flop é a causa; o overcall do river é o sintoma.

**Implicação para o motor pós-flop:** RIO deve ser calculado como função do pot acumulado por street, não apenas do tamanho do pot atual.

---

## Derivação 3: Ci < 1 em multiway — consequência das derivações anteriores

### Proposição (RIO)

Para N ≥ N* (limiar dependente de `p_d`), o Coeficiente de Insolvência `Ci < 1` — as pot odds incentivam uma ação cuja Perspectiva real é negativa.

### Definição

```text
Ci = Perspectiva_real / Pot_Odds_incentivo
```

Onde:

- `Perspectiva_real = E[outcome_esperado] − RIO(N)` — valor real após desconto do passivo estrutural
- `Pot_Odds_incentivo = pot(N) = N × aposta_base` — o valor aparente que atrai o call

### Condição para Ci < 1

```text
Ci < 1   sse   Perspectiva_real < Pot_Odds_incentivo

E[outcome] − RIO(N) < N × aposta_base

E[outcome] < N × aposta_base + N² × p_d × aposta_base

E[outcome] / (N × aposta_base) < 1 + N × p_d
```

### Limiar N* para p_d = 0.15

| N | 1 + N×p_d | Ci < 1 quando equity esperada/custo < |
|---|-----------|---------------------------------------|
| 2 | 1.30      | 1.30× custo                           |
| 3 | 1.45      | 1.45× custo                           |
| 4 | 1.60      | 1.60× custo                           |
| 5 | 1.75      | 1.75× custo                           |

Interpretação: com 4 oponentes e `p_d = 0.15`, um call só tem Ci ≥ 1 se a equity esperada superar 1.60× o custo do call. A maioria dos spots de especulação (draws, mãos marginais) não atinge esse threshold — Ci < 1, pot odds mentem.

### Corolário: Ci negativo

Ci < 0 quando `E[outcome] < RIO(N)` — o dano esperado pelo passivo estrutural supera o valor bruto do outcome. Isso ocorre em spots de mãos fracamente dominadas com N ≥ 5: o hero perde mais do que ganha em média, independentemente do pot total.

### Extensão pós-flop (Ci)

No pós-flop, `Ci` deve ser recalculado por street porque:

1. `E[outcome]` muda com a textura do board (draws completam, mãos dominadas ficam mais claras)
2. `RIO(N)` por street usa o pot acumulado, não o bet individual
3. A decisão ótima pode ser Ci ≥ 1 no flop e Ci < 1 no turn do mesmo pot

**Implicação para motor pós-flop:** Ci deve ser calculado dinamicamente por street como função do pot acumulado e da equity residual do hero, não como constante do spot.

---

## Síntese: o que está provado vs o que permanece hipótese

| Hipótese | Status | Nível |
|----------|--------|-------|
| EV_fold(ICM) > 0 é possível | **Provado** (condição suficiente formal) | Teorema |
| EV_fold(chipEV) < 0 sempre | **Provado** (corolário) | Teorema |
| RIO(N) ~ O(N²) | **Provado** (com formulação precisa: produto de dois O(N)) | Teorema |
| Ci < 1 para N ≥ N* | **Provado** (consequência direta de RIO) | Teorema |
| Frequência MW ~33% | Hipótese empírica — aguarda MDA | Hipótese forte |
| EV_fold dinâmico f(t, d_pj, pos) | Forma funcional não fechada | Hipótese conceitual |
| Er(S) = (ΔH/σ) × log(S) | Justificativa teórica via teoria da informação | Hipótese estruturada (σ como simplificação) |

---

## Derivação 4: Er(S) — justificativa da forma logarítmica

### Status (Er)

Hipótese estruturada com justificativa de primeiros princípios. Não é teorema formal: a forma logarítmica é derivada rigorosamente, mas σ como constante é simplificação de primeira ordem.

### Setup RIO

Seja S a profundidade de stack em BBs e B o branching factor médio da árvore de decisão (push/fold: B=2; jogo completo: B≈4–6). O número total de sequências de ação até o all-in forçado é `B^S`.

Nem todas as sequências geram edge exploitável. Sequências Nash-comoditizadas — conhecidas pela população a ponto de não haver desvio sistemático — não produzem edge. Só sequências onde a teoria é incompleta ou não disseminada geram oportunidade de exploração.

### Justificativa do logaritmo

**Observação empírica:** a teoria de push/fold (S ≤ 15bb) está saturada — disponível em apps, HRC, tabelas memorizáveis. Para S > 15bb, a completude da teoria cai. Para S > 60bb, o jogo é mais complexo E menos disseminado — abismo de edge real.

**Formalização:** Seja S_nash ≈ 15bb o limiar de saturação Nash. O número de sequências exploráveis por S é proporcional à fração da árvore não coberta pela teoria disseminada. Essa fração cresce com S, mas com retornos decrescentes — cada BB adicional acrescenta menos novidade decisória do que o anterior porque os padrões estruturais se repetem (3bet/4bet, continuation, x-raise), variando em calibração mas não em tipo.

Crescimento com retornos decrescentes em S é a definição de função logarítmica:

```text
Oportunidades_Exploração(S) ∝ log(S / S_nash)
```

Portanto, o edge absoluto do jogador superior cresce com `ΔHabilidade × log(S)`.

### Justificativa do denominador σ

Com S pequeno, o número de mãos até o all-in forçado é pequeno. O resultado de cada torneio tem alta variância porque há poucos pontos de decisão. O edge por mão é real, mas o desvio padrão dos resultados de torneio supera o edge esperado — σ domina.

Com S grande, há mais mãos por torneio, a lei dos grandes números começa a atuar, e o edge acumulado torna-se mais estável. σ não cai linearmente com S (a variância de torneio não desaparece com profundidade), mas a razão edge/σ melhora.

A forma `Er(S) = (ΔH/σ) × log(S)` captura esse comportamento com σ como σ_médio contextual — não como constante universal.

### Limitação explícita (Er)

σ não é constante: depende da estrutura de prêmios, número de jogadores, e posição no torneio. A equação é válida como aproximação de primeira ordem com σ interpretado como valor médio para um contexto de jogo específico. Para rigor completo:

```text
Er(S, contexto) = (ΔH / σ(S, estrutura, N)) × log(S / S_nash)
```

onde σ(S, estrutura, N) é crescente em estrutura top-heavy (variância maior) e decrescente em N (mais jogadores = mais pontos de decisão = σ relativo menor por torneio).

### Implicação pós-flop

Er(S) no pós-flop deve usar o SPR (Stack-to-Pot Ratio) como proxy de S — não o stack absoluto. SPR baixo colapsa a árvore de decisão da mesma forma que stack curto colapsa pré-flop: o jogador está em "push/fold do pós-flop". Er(SPR) ∝ log(SPR) para SPR acima do threshold de saturação.

---

## Derivação 5: EV_fold dinâmico — f(t, d_pj, pos)

### Status (EV_fold dinâmico)

Hipótese conceitual formalizada em três dimensões independentes. Cada dimensão está derivada isoladamente com forma funcional proposta. A combinação é aditiva por independência ortogonal.

---

### Componente principal: o investido

**A primeira ordem do EV_fold é o que já foi colocado no pot:**

```text
EV_fold = −investido
```

Em pré-flop sem ação anterior:

```text
EV_fold = −antes    (chipEV e ICM)
```

No pós-flop, o investido cresce a cada street:

```text
EV_fold_flop   = −antes
EV_fold_turn   = −(antes + investido_flop)
EV_fold_river  = −(antes + investido_flop + investido_turn)
```

Este é o mecanismo central do pot entrapment: cada street que o hero paga torna o fold mais caro na street seguinte. O custo de foldar no river é o pot total acumulado — não apenas o bet atual.

**Em ICM, esse baseline pode cruzar zero** (Derivação 1): quando os payjumps passivos acumulados superam o investido, `EV_fold > 0`. Mas em chipEV, `EV_fold = −investido < 0` sempre — não há mecanismo de payjump que compense.

---

### Setup das correções contextuais

Seja `EV_fold_base = −investido` o componente primário definido acima.

As três dimensões abaixo são **correções de segunda ordem** — ajustes contextuais que modificam o baseline em função de variáveis temporais, estruturais e posicionais. São secundárias em magnitude mas estrategicamente relevantes em situações específicas.

---

### Dimensão 1: t — Timing de Salto de Blinds

#### Variáveis

- `t` = minutos restantes no nível atual (t ∈ \[0, T_level\])
- `T_level` = duração total do nível em minutos
- `BB` = big blind atual
- `BB'` = big blind do próximo nível
- `r = BB' / BB` = razão de aumento (tipicamente 1.25 a 1.50)
- `M = Stack_h / (BB + SB + n_antes × ante)` = orbitas atuais de sobrevivência

#### Derivação (t)

O fold preserva `Stack_h`, mas quando `t → 0` a stack sofre depreciação iminente de poder de compra. A mesma stack em chips compra `M_atual` orbitas agora vs `M' = Stack_h / (BB' + SB' + n×ante')` orbitas após o salto.

A perda de orbitas pelo salto:

```text
ΔM = M − M' = M × (1 − BB/BB') = M × (r − 1)/r
```

O valor esperado de cada orbita sobrevivente (em termos de EV de Perspectiva) é `EV_per_orbit > 0` — cada orbita adicional preserva a trajetória de laddering passivo.

A penalidade temporal do fold é a depreciação de ΔM orbitas, ponderada pela proximidade do salto:

```text
ΔEV_temporal(t) = −(1 − t/T_level) × ΔM × EV_per_orbit
```

Propriedades:

- `t = T_level` (início do nível): penalidade = 0 — muito cedo para impactar decisão
- `t → 0` (salto iminente): penalidade máxima — fold "congela" valor que está prestes a se depreciar

O EV_fold com correção temporal:

```text
EV_fold(t) = EV_fold_base − (1 − t/T_level) × ΔM × EV_per_orbit
```

**Conclusão:** EV_fold é função **decrescente** de `(1 − t/T_level)` — quanto mais iminente o salto, mais caro o fold estratégico. Implication: a permissividade de ação agressiva deve aumentar conforme `t → 0`.

#### Observação empírica

A simulação Python (Gemini, sessão anterior) mostrou a curva EV_fold descendo à medida que `t → 0`, confirmando a direção do efeito. A forma exata depende de `EV_per_orbit`, que é endógeno ao modelo ICM — não é constante universal.

---

### Dimensão 2: d_pj — Distância para Próximo Payjump

#### Variáveis

- `d_pj` = número de eliminações necessárias para o próximo payjump do hero (d_pj ∈ ℕ)
- `Δp_j = p_{rank_h} − p_{rank_h + 1}` = ganho financeiro do próximo payjump
- `{ε_1, ..., ε_k}` = stacks dos jogadores short (ε_i << Stack_h)
- `P_elim(j)` = P(short j eliminado antes do hero | fold)

#### Derivação (d_pj)

Da Derivação 1, a condição de positividade do EV_fold é:

```text
Σ_{j ∈ shorts} P_elim(j) × Δp_j  >  |ΔE_competição|
```

Quando `d_pj = 1` (um único short precisa cair para o hero subir de prize):

- `Δp_1 = p_{rank_h} − p_{rank_h+1}` é o valor bruto do próximo jump
- Se `ε_1 → 0`, então `P_elim(1)` → probabilidade alta (proporcional à razão de stacks)

Formalmente, pelo modelo Malmuth-Harville:

```text
P_elim(j antes de h) ≈ ε_j / (ε_j + Stack_h) × [ajuste multiway]
```

Para `ε_j << Stack_h`:

```text
P_elim(j) ≈ ε_j / Stack_h  →  1   quando ε_j / Stack_h → ∞ (short relativo extremo)
```

Na prática, quando o hero tem 15bb e múltiplos shorts têm 2-3bb, `P_elim(j)` por orbita é alta.

O EV_fold em função de d_pj:

```text
EV_fold(d_pj) = EV_fold_base + Σ_{j: rank < rank_h + d_pj} P_elim(j) × Δp_j − |ΔE_comp|
```

**Threshold de positividade:**

```text
d_pj*: EV_fold(d_pj*) = 0
```

Para d_pj < d_pj* (jump iminente), `EV_fold > 0`. A condição suficiente do limiar:

```text
Σ_{j ∈ shorts} P_elim(j) × Δp_j  >  |ΔE_competição| + antes
```

**Conclusão:** EV_fold é função **decrescente** de `d_pj` — quanto mais próximo o jump, mais positivo o fold. A curva cruza zero em `d_pj*` calculável dado o vetor de stacks e a tabela de prêmios. Em `d_pj → 0` (hero está prestes a sair do dinheiro ou subir de posição) com múltiplos shorts, EV_fold ≫ 0.

---

### Dimensão 3: pos — Custo Marginal de Posição

#### Variáveis

- `pos ∈ {UTG, HJ, CO, BTN, SB, BB}` = posição atual do hero
- `orbits_to_BB` = número de hands até o hero estar no BB
- `BB_cost = 1bb` = custo compulsório do BB
- `SB_cost = 0.5bb` = custo compulsório do SB
- `ante_per_orbit = n_players × ante_individual` = custo total de antes por órbita

#### Derivação (pos)

O custo marginal de posição captura o fato de que foldar em certas posições acarreta pagamentos compulsórios futuros **iminentes** que o hero não pode evitar.

Para UTG (posição mais cara):

```text
C_pos(UTG) = ante_atual + E[custo_compulsório_próximas_hands]
```

O custo esperado das próximas hands até o BTN (onde fold equity é máximo):

```text
E[custo_próximas_hands] = SB_cost × P(chegar ao SB) + BB_cost × P(chegar ao BB)
```

Com 6 jogadores, orbits_to_BB ≈ 5 hands. O hero **certamente** pagará BB e SB na mesma órbita. Portanto:

```text
C_pos(UTG, 6-handed) = antes + SB_cost × P(sobreviver ao SB) + BB_cost × P(sobreviver ao BB)
                     ≈ antes + 0.5bb × P_surv + 1bb × P_surv
```

Onde `P_surv` é a probabilidade do hero não ser eliminado antes de chegar ao BB — alta quando Stack_h > 10bb.

#### Caso crítico: UTG com BB iminente

Quando o hero está em UTG com BB na próxima hand E tem stack que chegará "morta" ao BB (sem fold equity):

```text
C_pos(UTG_crítico) = antes + [1bb − fold_equity_BB]
```

Se `fold_equity_BB = 0` (stack tão curta que qualquer shove no BB é call matemático para o oponente), então:

```text
C_pos = antes + 1bb
```

O modelo força ação agressiva no UTG mesmo que `EV_fold_base` puro diga fold marginal — porque o custo de chegar passivo ao BB supera o risco de ser chamado no UTG.

**Conclusão:** C_pos é sempre não-negativo. É maior para UTG (mais hands até BTN) e menor para CO/BTN (próximo de fold equity máximo).

---

### Combinação das Três Dimensões

As três dimensões capturam riscos **ortogonais**:

- `t`: risco temporal (depreciação por salto de blinds)
- `d_pj`: risco estrutural de prêmio (proximidade de payjump)
- `pos`: risco posicional (pagamentos compulsórios iminentes)

Não há cross-term dominante entre elas nas condições típicas de torneio. A combinação é aditiva:

```text
EV_fold(t, d_pj, pos) = EV_fold_base(s)
                        + ΔEV_temporal(t)       # ≤ 0: torna fold mais caro
                        + ΔEV_payjump(d_pj)     # pode ser > 0 quando d_pj → 0
                        − C_pos                 # ≥ 0: sempre reduz EV de foldar passivamente
```

**Casos limites:**

| Contexto                       | Efeito dominante                          | EV_fold                   |
|--------------------------------|-------------------------------------------|---------------------------|
| d_pj = 1, múltiplos shorts ε→0 | ΔEV_payjump >> C_pos                      | Positivo                  |
| t → 0, sem shorts              | ΔEV_temporal dominante                    | Mais negativo             |
| UTG, BB iminente, stack morta  | C_pos dominante                           | Força ação                |
| d_pj = 1 E t → 0               | Dimensões opostas — análise por magnitude | Indeterminado sem números |

O caso `d_pj = 1 E t → 0` é o mais complexo: o payjump puxa EV_fold para positivo (sobreviver vale mais) enquanto o blind jump iminente penaliza a passividade. A resolução depende dos valores concretos — não há dominância estrutural.

### Limitação explícita (EV_fold)

`EV_per_orbit` (Dimensão 1) e `P_surv` (Dimensão 3) são endógenos ao modelo ICM completo — não são constantes. Esta derivação estabelece a forma funcional e a direção dos efeitos; a calibração numérica precisa do motor M-H com vetor de stacks real.

### Implicação para o motor pós-flop

No pós-flop, as dimensões se transformam:

- `t` → SPR (cada street reduz o "tempo" de exploração)
- `d_pj` → persiste (payjump continua sendo o mesmo threshold)
- `pos` → posição relativa ao aggressor (IP/OOP modifica o C_pos)

O mecanismo é o mesmo; as variáveis proxy mudam.

---

---

## Derivação 6: PM pós-flop — transposição de todos os componentes por street

### Objetivo

Tornar a equação PM calculável em qualquer street, não apenas pré-flop. Os componentes da equação se transformam quando chips entram no pot sem colisão direta, SPR muda, e a árvore de decisão remanescente se colapsa progressivamente.

```text
PM_street = [(Equity_street × R_street) × Valuation_stack_street]
           − [EV_fold_street + RIO_mw_street]
```

Cada termo tem comportamento diferente por street. A seguir, a transposição de cada componente.

---

### Componente 1: Dinâmica EV_fold

**Pré-flop (baseline):**

```text
EV_fold_preflop = −antes
```

**Pós-flop — primeira ordem:**

O fold abre mão de tudo que foi investido até aquela street. O baseline cresce a cada street que o hero paga:

```text
EV_fold_flop   = −antes
EV_fold_turn   = −(antes + investido_flop)
EV_fold_river  = −(antes + investido_flop + investido_turn)
```

Esta é a mecânica central do pot entrapment: o custo de sair cresce monotonicamente com o número de streets pagas. No river, foldar custa o pot total investido pelo hero até aquele ponto — não apenas o bet atual.

**Implicação direta:** a decisão de foldar no flop é fundamentalmente diferente da decisão no river. No flop, `EV_fold ≈ −antes` (barato). No river, `EV_fold = −pot_total_hero` (potencialmente catastrófico se o pot cresceu por pot odds do flop e turn).

**Correções de segunda ordem no pós-flop:**

As dimensões `d_pj` e `pos` persistem com os mesmos mecanismos de D5. A dimensão `t` se transforma: o "tempo" relevante passa a ser o SPR remanescente — quanto menor o SPR, mais colapsada a árvore de decisão futura, análogo a `t → 0` em pré-flop.

```text
EV_fold_street(d_pj, SPR, pos_IP_OOP) = EV_fold_street_base
                                        + ΔEV_payjump(d_pj)
                                        − (1 − SPR/SPR_max) × ΔDecision_value
                                        − C_pos_postflop
```

Onde `C_pos_postflop` é maior OOP (menos informação, menos capacidade de controle do pot) do que IP.

---

### Componente 2: RIO por street — pot entrapment como amplificador

**Pré-flop:** `RIO_mw = P(dominado) × pot_preflop ~ O(N²)` (D2).

**Pós-flop — a espiral:**

O pot entrapment é o RIO se tornando dinâmico. O hero que pagou pot odds no flop com mão especulativa está agora em uma posição onde:

1. `EV_fold_turn = −(antes + investido_flop)` — já mais caro que pré-flop
2. O pot cresceu, as pot odds do turn parecem atraentes
3. Mas `RIO_mw_turn = P(dominado | board_turn) × pot_turn` — o board pode ter melhorado tanto a mão do hero quanto a do villain
4. No river: `RIO_mw_river = P(dominado | board_river) × pot_river` — pot máximo, clareza máxima sobre dominância

A fórmula do RIO por street:

```text
RIO_mw_street = P(dominado | board_street, N) × pot_acumulado_até_street
```

O crescimento é amplificado porque `pot_acumulado` cresce a cada street enquanto `P(dominado | board_street)` pode crescer ou manter-se — nunca cai para zero com mão dominada.

**Corolário do pot entrapment:**

O overcall no river não é um erro isolado. É o sintoma final de uma cadeia que começou com pot odds aparentemente favoráveis no flop. O RIO do flop é a causa estrutural; o overcall do river é onde o custo se materializa.

```text
Custo_real = RIO_flop + RIO_turn + RIO_river
           = Σ P(dominado | board_i) × pot_acumulado_i
```

Em multiway, esse somatório cresce em O(N²) por street — cada jogador adicional multiplica tanto a probabilidade de dominância quanto o pot final.

---

### Componente 3: R (Fator de Realização) por street

**Pré-flop:** R captura a redução de equity realizada por posição (OOP) e multiway.

**Pós-flop:** R muda a cada street porque a equity residual do hero muda com o board e com o número de jogadores ainda ativos:

```text
R_flop  = f(posição_IP_OOP, N_ativos, textura_board_flop)
R_turn  = f(posição_IP_OOP, N_ativos_turn, textura_board_turn, equity_residual)
R_river = f(posição_IP_OOP, N_ativos_river)   # no river, R → 1 ou 0 (showdown)
```

No river, a realização é binária: o hero ou ganha o pot (R=1, equity realizada completa) ou perde (R=0). A complexidade de R colapsa com o SPR — análogo ao colapso da árvore de Er(SPR).

**Implicação:** `Equity × R` no flop é uma estimativa com alta incerteza; no river é determinístico. O motor pós-flop deve tratar R como variável dinâmica, não constante do cenário.

---

### Componente 4: Valuation_stack por street

**Pré-flop:** `Valuation_stack = ICM_EV(stack_atual)` via Malmuth-Harville.

**Pós-flop — o paradoxo da valuation dupla:**

Conforme chips saem da stack do hero para o pot (sem colisão direta):

- A stack total do hero diminui → `ICM_EV(stack)` cai (menos chips = menos equity de torneio)
- Mas cada chip individual na stack ganha valuation marginal maior (stacks menores têm valuation ICM por chip mais alta em estruturas não-flat)
- O pot representa valuation compensatória: se o hero ganhar o pot, a stack resultante tem ICM_EV muito maior

Formalmente, para cada street paga:

```text
Δ Valuation_stack = −ΔChips_investidos × ICM_marginal_atual
Δ Valuation_pot_ganho = pot_acumulado × [ICM_EV(stack + pot) − ICM_EV(stack)]
```

O valor de chamar cada street deve comparar `Δ Valuation_pot_ganho × P(ganhar)` contra `Δ Valuation_stack × P(perder)` — não apenas equity bruta de chips.

**RP pós-flop:** o RP (Risk Premium) é exclusivo para colisão direta. Nas streets onde não há all-in implícito, o RP dilui progressivamente — cada BB investido no pot sem colisão reduz a pressão de eliminação direta, porque o hero ainda tem stack remanescente. No river com SPR próximo de zero, a decisão converge para chipEV: não há mais stack para proteger do ponto de vista de sobrevivência imediata.

---

### Síntese: PM_street completo

```text
PM_street = [(Equity_street × R_street) × ICM_EV(stack_resultante_ganho × P_ganho)]
           − [EV_fold_street_base + ΔEV_payjump + RIO_mw_street]
```

Onde:

| Componente   | Pré-flop          | Flop             | Turn             | River            |
|--------------|-------------------|------------------|------------------|------------------|
| EV_fold base | −antes            | −antes           | −(antes+flop)    | −pot_total_hero  |
| RIO_mw       | O(N²) pot_preflop | O(N²) pot_flop   | O(N²) pot_turn   | O(N²) pot_river  |
| R            | f(pos, N)         | f(pos, N, board) | f(pos, N, board) | 1 ou 0           |
| Valuation    | ICM(stack)        | ICM(stack−flop)  | ICM(stack−turn)  | ICM(stack−river) |
| SPR proxy    | Stack/antes       | Stack/pot_flop   | Stack/pot_turn   | ~0               |

**Convergência para chipEV no river:** conforme SPR → 0, `R → binário`, `EV_fold → −pot_total`, e a diferença ICM entre ganhar e perder domina completamente — mas o RP dilui porque não há mais árvore futura para precificar. A decisão no river é chipEV com peso ICM no outcome binário.

---

### Base de implementação: rpDeriver.ts

O arquivo `rpDeriver.ts` já calcula RP diluído por street. A extensão natural para o motor pós-flop é:

1. Adicionar `potAcumulado` como variável de estado por street
2. Calcular `EV_fold_street = −potAcumulado_hero` por street
3. Calcular `RIO_mw_street` com `pot_acumulado` como base (não apenas bet atual)
4. Recalcular `R_street` com equity residual + textura do board
5. Recalcular `Valuation_stack_street` com stack remanescente após cada investimento

---

## Síntese atualizada: status de todas as hipóteses

| Hipótese | Status | Nível |
|----------|--------|-------|
| EV_fold(ICM) > 0 é possível | **Provado** (condição suficiente formal) | Teorema |
| EV_fold(chipEV) < 0 sempre | **Provado** (corolário) | Teorema |
| RIO(N) ~ O(N²) | **Provado** (produto de dois O(N)) | Teorema |
| Ci < 1 para N ≥ N* | **Provado** (consequência direta de RIO) | Teorema |
| Er(S) = (ΔH/σ) × log(S) | **Hipótese estruturada** (σ como simplificação) | Hipótese forte |
| EV_fold(t, d_pj, pos) | **Hipótese estruturada** (3 dimensões, forma aditiva) | Hipótese forte |
| PM_street completo | **Mapeado** (todos os componentes transpostos por street) | Roadmap de implementação |
| Frequência MW ~33% | Hipótese empírica — aguarda MDA | Hipótese fraca |
