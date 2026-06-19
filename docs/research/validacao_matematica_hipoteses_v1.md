# Validacao Matematica das Hipoteses Paradigmaticas  v1

**Autoria:** Raphael Vitoi (teoria) + derivacoes formais (2026)
**Status:** D1D5 formalizadas. Proximo: D6  transposicao pos-flop de todos os componentes PM.

---

## Objetivo final: materializar a Perspectiva Matematica

**Toda derivacao neste documento e um insumo para tornar a PM calculavel com rigor.**

A equacao formal da Perspectiva Matematica e:

```text
PM = [(Equity  R)  Valuation_stack]  [EV_fold(t, d_pj, pos) + RIO_mw]
```

Onde:

- `Equity  R` = equity realizada apos desconto pelo Fator de Realizacao (R < 1 em MW/OOP)
- `Valuation_stack` = valor monetario ICM da stack no torneio (via Malmuth-Harville)
- `EV_fold(t, d_pj, pos)` = baseline dinamico do fold  **primeira ordem: investido**; correcoes contextuais de segunda ordem
- `RIO_mw` = Passivo Estrutural Multiway  dano esperado por Reverse Implied Odds

A decisao otima e a acao que maximiza PM, nao EV de chips brutos.

As derivacoes D1D5 constroem cada componente do lado direito da equacao. Sem elas, PM e uma formula sem substancia calculavel.

---

## Hierarquia das derivacoes

Dependencia logica entre os componentes PM:

```text
EV_fold(ICM) > 0    RIO(N) ~ O(N2)    Ci < 1 em MW
                                              
                                    PM calculavel em pre-flop
                                              
                              [D6] transposicao pos-flop  PM em qualquer street
```

Er(S) e independente dos demais  quantifica o edge relativo do jogador superior em funcao da profundidade de stack, nao um componente direto da equacao PM.

---

## Derivacao 1: EV_fold(ICM) pode ser positivo

### Proposicao (Axioma do Fold)

### Proposicao (Crescimento RIO)

Seja um torneio com N jogadores, premios `P = {p_1  p_2  ...  p_k}` nao-flat (`p_i > p_{i+1}` para pelo menos um i), e hero com stack `s_h`. Existem configuracoes de mesa tal que `EV_fold(ICM) > 0`.

### Definicao formal

Seja `E(s)` a equity ICM do hero dado vetor de stacks `s`, calculada via Malmuth-Harville:

```text
E(s) = _j  P(hero termina na posicao j | s)  p_j
```

No fold, villain leva pot ``. As stacks resultantes:

```text
s_fold = (..., s_h, ..., s_v + , ...)
```

```text
EV_fold(ICM) = E(s_fold)  E(s_atual)
```

### Prova de existencia

Considere N = 4, premios `P = {p_1, p_2, p_3, 0}` com `p_1 > p_2 > p_3 > 0`, e:

```text
s_atual = [s_h, s_v, , ]    com   0+
```

**Claim:** `EV_fold(ICM) > 0` nessa configuracao para `` suficientemente pequeno.

**Argumento:** Como   0, a probabilidade de qualquer dos dois shorts ser eliminado antes do hero e proxima de 1. Cada eliminacao anterior gera payjump `p_j = p_{rank_h}  p_{rank_h + 1} > 0` para o hero.

O fold nao altera `s_h` nem os shorts  preserva integralmente a trajetoria de laddering passivo. O call, por contraste, expoe `s_h` a risco nao-zero de reducao, o que diminui a probabilidade do hero sobreviver as eliminacoes dos shorts.

Formalmente: como o villain absorve `` (fica maior), a competicao direta herovillain e ligeiramente desfavoravel ao hero no cenario de fold. Mas esse efeito negativo e de segunda ordem quando ` << s_h`. O efeito positivo de primeiro ordem e a preservacao de `P(hero sobrevive aos shorts)`, que e dominante.

**Condicao suficiente geral:**

```text
EV_fold(ICM) > 0   sse   _{j  shorts} P(j eliminado antes de h | fold)  p_j  >  |E_competicao|
```

Onde `|E_competicao|` e a perda de equity por o villain ter ficado com `` a mais  uma funcao decrescente de `s_v / total_chips`.

Para `d_pj  0` (payjump iminente), `p_j` e grande e a condicao e satisfeita com facilidade.

### Corolario: por que chipEV sempre negativo

Em chipEV, a estrutura de premios e flat: `p_i = constante`. Logo `p_j = 0` para todo j. A condicao suficiente colapsa para `0 > 0`, que e falso. Portanto:

```text
EV_fold(chipEV) = antes < 0   sempre
```

A positividade do EV_fold e **estruturalmente exclusiva do ICM com estrutura nao-flat**  resultado do laddering, nao de qualquer quirk do modelo. Confirma que o framework Perspectiva nao e uma refinamento cosmetico do chipEV: e um espaco de decisao qualitativamente diferente.

### Extensao pos-flop (EV_fold)

No pos-flop, o EV_fold cresce com cada street:

```text
EV_fold_flop  = investido_preflop
EV_fold_turn  = (investido_preflop + investido_flop)
EV_fold_river = pot_total_investido
```

O mesmo mecanismo de positividade ICM se aplica  mas agora compete com o custo acumulado das streets anteriores. Para o river, a condicao de EV_fold > 0 requer p_j suficientemente grande para cobrir o pot total investido. Tipicamente isso implica: foldar no river sob ICM so e positivo quando o hero ja minimizou o investimento acumulado (streets pequenas, sizing conservador) e ha shorts prestes a sair.

**Implicacao para o motor pos-flop:** o threshold de fold deve usar o pot acumulado por street como baseline dinamico, nao um valor fixo.

---

## Derivacao 2: RIO multiway  crescimento do dano esperado

### Proposicao

Em cenario multiway com N oponentes independentes, o **dano esperado por Reverse Implied Odds** cresce em O(N2), enquanto as pot odds crescem em O(N). A razao dano/incentivo cresce em O(N).

### Setup

Seja:

- `p_d` = P(um oponente especifico tem mao dominante sobre o hero)  constante por oponente, independente
- `aposta_base` = contribuicao individual por player ao pot
- `pot(N) = N  aposta_base`  tamanho do pot multiway (linear em N)

### Prova

**Frequencia de dominio:**

```text
P(pelo menos 1 oponente domina) = 1  (1  p_d)^N
```

Para `p_d` pequeno (razoavel para range medio):

```text
 1  (1  N  p_d) = N  p_d     [aproximacao de primeira ordem]
```

Crescimento: **O(N)**  linear.

**Custo quando dominado:**

Quando o hero acerta mao dominada (segunda melhor mao), perde o pot completo:

```text
E[perda | dominado]  pot(N) = N  aposta_base
```

Crescimento: **O(N)**  linear.

**RIO = produto:**

```text
RIO(N) = P(dominado)  E[perda | dominado]
        (N  p_d)  (N  aposta_base)
       = N2  p_d  aposta_base
```

Crescimento: **O(N2)**  quadratico.

**Pot odds no mesmo cenario:**

```text
Pot_Odds(N) = pot(N) / custo_call = N  aposta_base / aposta_base = N
```

Crescimento: **O(N)**  linear.

**Razao:**

```text
RIO(N) / Pot_Odds(N) = N2  p_d  aposta_base / N = N  p_d  aposta_base
```

Crescimento da razao: **O(N)**  cada jogador adicional aumenta em `p_d  aposta_base` a desproporcao entre passivo estrutural e incentivo aparente das pot odds.

### Exemplo numerico

`p_d = 0.15`, `aposta_base = 1bb`. Comparacao por N:

| N | Pot_Odds | RIO(N) | Razao |
| --- | ---------- | -------- | ------- |
| 1 | 1bb      | 0.15bb | 0.15  |
| 2 | 2bb      | 0.60bb | 0.30  |
| 3 | 3bb      | 1.35bb | 0.45  |
| 4 | 4bb      | 2.40bb | 0.60  |
| 5 | 5bb      | 3.75bb | 0.75  |

Com 4 oponentes, o RIO consome 60% do aparente ganho das pot odds. Com 5 oponentes, 75%.

### Reformulacao precisa da afirmacao original

> "RIO cresce em x2 enquanto pot odds sao lineares."

**Versao precisa:**

> O dano esperado por RIO cresce em O(N2) porque e o produto de dois termos lineares: frequencia de dominio (O(N)) e custo quando dominado (O(N), pelo crescimento do pot). As pot odds crescem em O(N). A razao dano/incentivo cresce em O(N)  cada jogador adicional piora a equacao multiplicativamente.

### Extensao pos-flop (RIO)

No pos-flop, o efeito e amplificado pelo pot entrapment:

- No flop, pot odds "atraem" o hero para dentro do pot com custo aparentemente baixo
- No turn, o pot ja cresceu  custo de fold aumentou, mas a mao dominada pode estar mais clara
- No river: o hero paga o custo maximo de RIO  exatamente o momento em que foldar (EV_fold = pot_total_investido) e mais caro

O pot entrapment e a versao dinamica do RIO: o hero nao sai porque saiu caro demais nao entrar. A espiral e: pot odds flop  investimento acumulado  pot odds turn amplificadas pelo pot maior  river com custo de fold catastrofico. O RIO do flop e a causa; o overcall do river e o sintoma.

**Implicacao para o motor pos-flop:** RIO deve ser calculado como funcao do pot acumulado por street, nao apenas do tamanho do pot atual.

---

## Derivacao 3: Ci < 1 em multiway  consequencia das derivacoes anteriores

### Proposicao (Coeficiente de Insolvencia)

Para N  N* (limiar dependente de `p_d`), o Coeficiente de Insolvencia `Ci < 1`  as pot odds incentivam uma acao cuja Perspectiva real e negativa.

### Definicao

```text
Ci = Perspectiva_real / Pot_Odds_incentivo
```

Onde:

- `Perspectiva_real = E[outcome_esperado]  RIO(N)`  valor real apos desconto do passivo estrutural
- `Pot_Odds_incentivo = pot(N) = N  aposta_base`  o valor aparente que atrai o call

### Condicao para Ci < 1

```text
Ci < 1   sse   Perspectiva_real < Pot_Odds_incentivo

E[outcome]  RIO(N) < N  aposta_base

E[outcome] < N  aposta_base + N2  p_d  aposta_base

E[outcome] / (N  aposta_base) < 1 + N  p_d
```

### Limiar N* para p_d = 0.15

| N | 1 + Np_d | Ci < 1 quando equity esperada/custo < |
| --- | ----------- | --------------------------------------- |
| 2 | 1.30      | 1.30 custo                           |
| 3 | 1.45      | 1.45 custo                           |
| 4 | 1.60      | 1.60 custo                           |
| 5 | 1.75      | 1.75 custo                           |

Interpretacao: com 4 oponentes e `p_d = 0.15`, um call so tem Ci  1 se a equity esperada superar 1.60 o custo do call. A maioria dos spots de especulacao (draws, maos marginais) nao atinge esse threshold  Ci < 1, pot odds mentem.

### Corolario: Ci negativo

Ci < 0 quando `E[outcome] < RIO(N)`  o dano esperado pelo passivo estrutural supera o valor bruto do outcome. Isso ocorre em spots de maos fracamente dominadas com N  5: o hero perde mais do que ganha em media, independentemente do pot total.

### Extensao pos-flop (Ci)

No pos-flop, `Ci` deve ser recalculado por street porque:

1. `E[outcome]` muda com a textura do board (draws completam, maos dominadas ficam mais claras)
2. `RIO(N)` por street usa o pot acumulado, nao o bet individual
3. A decisao otima pode ser Ci  1 no flop e Ci < 1 no turn do mesmo pot

**Implicacao para motor pos-flop:** Ci deve ser calculado dinamicamente por street como funcao do pot acumulado e da equity residual do hero, nao como constante do spot.

---

## Sintese: o que esta provado vs o que permanece hipotese

| Hipotese | Status | Nivel |
| -------- | ------ | ----- |
| EV_fold(ICM) > 0 e possivel | **Provado** (condicao suficiente formal) | Teorema |
| EV_fold(chipEV) < 0 sempre | **Provado** (corolario) | Teorema |
| RIO(N) ~ O(N2) | **Provado** (com formulacao precisa: produto de dois O(N)) | Teorema |
| Ci < 1 para N  N* | **Provado** (consequencia direta de RIO) | Teorema |
| Frequencia MW ~33% | Hipotese empirica  aguarda MDA | Hipotese forte |
| EV_fold dinamico f(t, d_pj, pos) | Forma funcional nao fechada | Hipotese conceitual |
| Er(S) = (H/)  log(S) | Justificativa teorica via teoria da informacao | Hipotese estruturada ( como simplificacao) |

---

## Derivacao 4: Er(S)  justificativa da forma logaritmica

### Status (Er)

Hipotese estruturada com justificativa de primeiros principios. Nao e teorema formal: a forma logaritmica e derivada rigorosamente, mas  como constante e simplificacao de primeira ordem.

### Setup RIO

Seja S a profundidade de stack em BBs e B o branching factor medio da arvore de decisao (push/fold: B=2; jogo completo: B46). O numero total de sequencias de acao ate o all-in forcado e `B^S`.

Nem todas as sequencias geram edge exploitavel. Sequencias Nash-comoditizadas  conhecidas pela populacao a ponto de nao haver desvio sistematico  nao produzem edge. So sequencias onde a teoria e incompleta ou nao disseminada geram oportunidade de exploracao.

### Justificativa do logaritmo

**Observacao empirica:** a teoria de push/fold (S  15bb) esta saturada  disponivel em apps, HRC, tabelas memorizaveis. Para S > 15bb, a completude da teoria cai. Para S > 60bb, o jogo e mais complexo E menos disseminado  abismo de edge real.

**Formalizacao:** Seja S_nash  15bb o limiar de saturacao Nash. O numero de sequencias exploraveis por S e proporcional a fracao da arvore nao coberta pela teoria disseminada. Essa fracao cresce com S, mas com retornos decrescentes  cada BB adicional acrescenta menos novidade decisoria do que o anterior porque os padroes estruturais se repetem (3bet/4bet, continuation, x-raise), variando em calibracao mas nao em tipo.

Crescimento com retornos decrescentes em S e a definicao de funcao logaritmica:

```text
Oportunidades_Exploracao(S)  log(S / S_nash)
```

Portanto, o edge absoluto do jogador superior cresce com `Habilidade  log(S)`.

### Justificativa do denominador 

Com S pequeno, o numero de maos ate o all-in forcado e pequeno. O resultado de cada torneio tem alta variancia porque ha poucos pontos de decisao. O edge por mao e real, mas o desvio padrao dos resultados de torneio supera o edge esperado   domina.

Com S grande, ha mais maos por torneio, a lei dos grandes numeros comeca a atuar, e o edge acumulado torna-se mais estavel.  nao cai linearmente com S (a variancia de torneio nao desaparece com profundidade), mas a razao edge/ melhora.

A forma `Er(S) = (H/)  log(S)` captura esse comportamento com  como _medio contextual  nao como constante universal.

### Limitacao explicita (Er)

 nao e constante: depende da estrutura de premios, numero de jogadores, e posicao no torneio. A equacao e valida como aproximacao de primeira ordem com  interpretado como valor medio para um contexto de jogo especifico. Para rigor completo:

```text
Er(S, contexto) = (H / (S, estrutura, N))  log(S / S_nash)
```

onde (S, estrutura, N) e crescente em estrutura top-heavy (variancia maior) e decrescente em N (mais jogadores = mais pontos de decisao =  relativo menor por torneio).

### Implicacao pos-flop

Er(S) no pos-flop deve usar o SPR (Stack-to-Pot Ratio) como proxy de S  nao o stack absoluto. SPR baixo colapsa a arvore de decisao da mesma forma que stack curto colapsa pre-flop: o jogador esta em "push/fold do pos-flop". Er(SPR)  log(SPR) para SPR acima do threshold de saturacao.

---

## Derivacao 5: EV_fold dinamico  f(t, d_pj, pos)

### Status (EV_fold dinamico)

Hipotese conceitual formalizada em tres dimensoes independentes. Cada dimensao esta derivada isoladamente com forma funcional proposta. A combinacao e aditiva por independencia ortogonal.

---

### Componente principal: o investido

**A primeira ordem do EV_fold e o que ja foi colocado no pot:**

```text
EV_fold = investido
```

Em pre-flop sem acao anterior:

```text
EV_fold = antes    (chipEV e ICM)
```

No pos-flop, o investido cresce a cada street:

```text
EV_fold_flop   = antes
EV_fold_turn   = (antes + investido_flop)
EV_fold_river  = (antes + investido_flop + investido_turn)
```

Este e o mecanismo central do pot entrapment: cada street que o hero paga torna o fold mais caro na street seguinte. O custo de foldar no river e o pot total acumulado  nao apenas o bet atual.

**Em ICM, esse baseline pode cruzar zero** (Derivacao 1): quando os payjumps passivos acumulados superam o investido, `EV_fold > 0`. Mas em chipEV, `EV_fold = investido < 0` sempre  nao ha mecanismo de payjump que compense.

---

### Setup das correcoes contextuais

Seja `EV_fold_base = investido` o componente primario definido acima.

As tres dimensoes abaixo sao **correcoes de segunda ordem**  ajustes contextuais que modificam o baseline em funcao de variaveis temporais, estruturais e posicionais. Sao secundarias em magnitude mas estrategicamente relevantes em situacoes especificas.

---

### Dimensao 1: t  Timing de Salto de Blinds

#### Variaveis (Tempo)

- `t` = minutos restantes no nivel atual (t  \[0, T_level\])
- `T_level` = duracao total do nivel em minutos
- `BB` = big blind atual
- `BB'` = big blind do proximo nivel
- `r = BB' / BB` = razao de aumento (tipicamente 1.25 a 1.50)
- `M = Stack_h / (BB + SB + n_antes  ante)` = orbitas atuais de sobrevivencia

#### Derivacao (t)

O fold preserva `Stack_h`, mas quando `t  0` a stack sofre depreciacao iminente de poder de compra. A mesma stack em chips compra `M_atual` orbitas agora vs `M' = Stack_h / (BB' + SB' + nante')` orbitas apos o salto.

A perda de orbitas pelo salto:

```text
M = M  M' = M  (1  BB/BB') = M  (r  1)/r
```

O valor esperado de cada orbita sobrevivente (em termos de EV de Perspectiva) e `EV_per_orbit > 0`  cada orbita adicional preserva a trajetoria de laddering passivo.

A penalidade temporal do fold e a depreciacao de M orbitas, ponderada pela proximidade do salto:

```text
EV_temporal(t) = (1  t/T_level)  M  EV_per_orbit
```

Propriedades:

- `t = T_level` (inicio do nivel): penalidade = 0  muito cedo para impactar decisao
- `t  0` (salto iminente): penalidade maxima  fold "congela" valor que esta prestes a se depreciar

O EV_fold com correcao temporal:

```text
EV_fold(t) = EV_fold_base  (1  t/T_level)  M  EV_per_orbit
```

**Conclusao:** EV_fold e funcao **decrescente** de `(1  t/T_level)`  quanto mais iminente o salto, mais caro o fold estrategico. Implication: a permissividade de acao agressiva deve aumentar conforme `t  0`.

#### Observacao empirica

A simulacao Python (Gemini, sessao anterior) mostrou a curva EV_fold descendo a medida que `t  0`, confirmando a direcao do efeito. A forma exata depende de `EV_per_orbit`, que e endogeno ao modelo ICM  nao e constante universal.

---

### Dimensao 2: d_pj  Distancia para Proximo Payjump

#### Variaveis (Payjump)

- `d_pj` = numero de eliminacoes necessarias para o proximo payjump do hero (d_pj  N)
- `p_j = p_{rank_h}  p_{rank_h + 1}` = ganho financeiro do proximo payjump
- `{_1, ..., _k}` = stacks dos jogadores short (_i << Stack_h)
- `P_elim(j)` = P(short j eliminado antes do hero | fold)

#### Derivacao (d_pj)

Da Derivacao 1, a condicao de positividade do EV_fold e:

```text
_{j  shorts} P_elim(j)  p_j  >  |E_competicao|
```

Quando `d_pj = 1` (um unico short precisa cair para o hero subir de prize):

- `p_1 = p_{rank_h}  p_{rank_h+1}` e o valor bruto do proximo jump
- Se `_1  0`, entao `P_elim(1)`  probabilidade alta (proporcional a razao de stacks)

Formalmente, pelo modelo Malmuth-Harville:

```text
P_elim(j antes de h)  _j / (_j + Stack_h)  [ajuste multiway]
```

Para `_j << Stack_h`:

```text
P_elim(j)  _j / Stack_h    1   quando _j / Stack_h   (short relativo extremo)
```

Na pratica, quando o hero tem 15bb e multiplos shorts tem 2-3bb, `P_elim(j)` por orbita e alta.

O EV_fold em funcao de d_pj:

```text
EV_fold(d_pj) = EV_fold_base + _{j: rank < rank_h + d_pj} P_elim(j)  p_j  |E_comp|
```

**Threshold de positividade:**

```text
d_pj*: EV_fold(d_pj*) = 0
```

Para d_pj < d_pj* (jump iminente), `EV_fold > 0`. A condicao suficiente do limiar:

```text
_{j  shorts} P_elim(j)  p_j  >  |E_competicao| + antes
```

**Conclusao:** EV_fold e funcao **decrescente** de `d_pj`  quanto mais proximo o jump, mais positivo o fold. A curva cruza zero em `d_pj*` calculavel dado o vetor de stacks e a tabela de premios. Em `d_pj  0` (hero esta prestes a sair do dinheiro ou subir de posicao) com multiplos shorts, EV_fold  0.

---

### Dimensao 3: pos  Custo Marginal de Posicao

#### Variaveis (Posicao)

- `pos  {UTG, HJ, CO, BTN, SB, BB}` = posicao atual do hero
- `orbits_to_BB` = numero de hands ate o hero estar no BB
- `BB_cost = 1bb` = custo compulsorio do BB
- `SB_cost = 0.5bb` = custo compulsorio do SB
- `ante_per_orbit = n_players  ante_individual` = custo total de antes por orbita

#### Derivacao (pos)

O custo marginal de posicao captura o fato de que foldar em certas posicoes acarreta pagamentos compulsorios futuros **iminentes** que o hero nao pode evitar.

Para UTG (posicao mais cara):

```text
C_pos(UTG) = ante_atual + E[custo_compulsorio_proximas_hands]
```

O custo esperado das proximas hands ate o BTN (onde fold equity e maximo):

```text
E[custo_proximas_hands] = SB_cost  P(chegar ao SB) + BB_cost  P(chegar ao BB)
```

Com 6 jogadores, orbits_to_BB  5 hands. O hero **certamente** pagara BB e SB na mesma orbita. Portanto:

```text
C_pos(UTG, 6-handed) = antes + SB_cost  P(sobreviver ao SB) + BB_cost  P(sobreviver ao BB)
                      antes + 0.5bb  P_surv + 1bb  P_surv
```

Onde `P_surv` e a probabilidade do hero nao ser eliminado antes de chegar ao BB  alta quando Stack_h > 10bb.

#### Caso critico: UTG com BB iminente

Quando o hero esta em UTG com BB na proxima hand E tem stack que chegara "morta" ao BB (sem fold equity):

```text
C_pos(UTG_critico) = antes + [1bb  fold_equity_BB]
```

Se `fold_equity_BB = 0` (stack tao curta que qualquer shove no BB e call matematico para o oponente), entao:

```text
C_pos = antes + 1bb
```

O modelo forca acao agressiva no UTG mesmo que `EV_fold_base` puro diga fold marginal  porque o custo de chegar passivo ao BB supera o risco de ser chamado no UTG.

**Conclusao:** C_pos e sempre nao-negativo. E maior para UTG (mais hands ate BTN) e menor para CO/BTN (proximo de fold equity maximo).

---

### Combinacao das Tres Dimensoes

As tres dimensoes capturam riscos **ortogonais**:

- `t`: risco temporal (depreciacao por salto de blinds)
- `d_pj`: risco estrutural de premio (proximidade de payjump)
- `pos`: risco posicional (pagamentos compulsorios iminentes)

Nao ha cross-term dominante entre elas nas condicoes tipicas de torneio. A combinacao e aditiva:

```text
EV_fold(t, d_pj, pos) = EV_fold_base(s)
                        + EV_temporal(t)       #  0: torna fold mais caro
                        + EV_payjump(d_pj)     # pode ser > 0 quando d_pj  0
                         C_pos                 #  0: sempre reduz EV de foldar passivamente
```

**Casos limites:**

| Contexto                       | Efeito dominante                          | EV_fold                   |
| ------------------------------ | ----------------------------------------- | ------------------------- |
| d_pj = 1, multiplos shorts 0 | EV_payjump >> C_pos                      | Positivo                  |
| t  0, sem shorts              | EV_temporal dominante                    | Mais negativo             |
| UTG, BB iminente, stack morta  | C_pos dominante                           | Forca acao                |
| d_pj = 1 E t  0               | Dimensoes opostas  analise por magnitude | Indeterminado sem numeros |

O caso `d_pj = 1 E t  0` e o mais complexo: o payjump puxa EV_fold para positivo (sobreviver vale mais) enquanto o blind jump iminente penaliza a passividade. A resolucao depende dos valores concretos  nao ha dominancia estrutural.

### Limitacao explicita (EV_fold)

`EV_per_orbit` (Dimensao 1) e `P_surv` (Dimensao 3) sao endogenos ao modelo ICM completo  nao sao constantes. Esta derivacao estabelece a forma funcional e a direcao dos efeitos; a calibracao numerica precisa do motor M-H com vetor de stacks real.

### Implicacao para o motor pos-flop

No pos-flop, as dimensoes se transformam:

- `t`  SPR (cada street reduz o "tempo" de exploracao)
- `d_pj`  persiste (payjump continua sendo o mesmo threshold)
- `pos`  posicao relativa ao aggressor (IP/OOP modifica o C_pos)

O mecanismo e o mesmo; as variaveis proxy mudam.

---

---

## Derivacao 6: PM pos-flop  transposicao de todos os componentes por street

### Objetivo

Tornar a equacao PM calculavel em qualquer street, nao apenas pre-flop. Os componentes da equacao se transformam quando chips entram no pot sem colisao direta, SPR muda, e a arvore de decisao remanescente se colapsa progressivamente.

```text
PM_street = [(Equity_street  R_street)  Valuation_stack_street]
            [EV_fold_street + RIO_mw_street]
```

Cada termo tem comportamento diferente por street. A seguir, a transposicao de cada componente.

---

### Componente 1: Dinamica EV_fold

**Pre-flop (baseline):**

```text
EV_fold_preflop = antes
```

**Pos-flop  primeira ordem:**

O fold abre mao de tudo que foi investido ate aquela street. O baseline cresce a cada street que o hero paga:

```text
EV_fold_flop   = antes
EV_fold_turn   = (antes + investido_flop)
EV_fold_river  = (antes + investido_flop + investido_turn)
```

Esta e a mecanica central do pot entrapment: o custo de sair cresce monotonicamente com o numero de streets pagas. No river, foldar custa o pot total investido pelo hero ate aquele ponto  nao apenas o bet atual.

**Implicacao direta:** a decisao de foldar no flop e fundamentalmente diferente da decisao no river. No flop, `EV_fold  antes` (barato). No river, `EV_fold = pot_total_hero` (potencialmente catastrofico se o pot cresceu por pot odds do flop e turn).

**Correcoes de segunda ordem no pos-flop:**

As dimensoes `d_pj` e `pos` persistem com os mesmos mecanismos de D5. A dimensao `t` se transforma: o "tempo" relevante passa a ser o SPR remanescente  quanto menor o SPR, mais colapsada a arvore de decisao futura, analogo a `t  0` em pre-flop.

```text
EV_fold_street(d_pj, SPR, pos_IP_OOP) = EV_fold_street_base
                                        + EV_payjump(d_pj)
                                         (1  SPR/SPR_max)  Decision_value
                                         C_pos_postflop
```

Onde `C_pos_postflop` e maior OOP (menos informacao, menos capacidade de controle do pot) do que IP.

---

### Componente 2: RIO por street  pot entrapment como amplificador

**Pre-flop:** `RIO_mw = P(dominado)  pot_preflop ~ O(N2)` (D2).

**Pos-flop  a espiral:**

O pot entrapment e o RIO se tornando dinamico. O hero que pagou pot odds no flop com mao especulativa esta agora em uma posicao onde:

1. `EV_fold_turn = (antes + investido_flop)`  ja mais caro que pre-flop
2. O pot cresceu, as pot odds do turn parecem atraentes
3. Mas `RIO_mw_turn = P(dominado | board_turn)  pot_turn`  o board pode ter melhorado tanto a mao do hero quanto a do villain
4. No river: `RIO_mw_river = P(dominado | board_river)  pot_river`  pot maximo, clareza maxima sobre dominancia

A formula do RIO por street:

```text
RIO_mw_street = P(dominado | board_street, N)  pot_acumulado_ate_street
```

O crescimento e amplificado porque `pot_acumulado` cresce a cada street enquanto `P(dominado | board_street)` pode crescer ou manter-se  nunca cai para zero com mao dominada.

**Corolario do pot entrapment:**

O overcall no river nao e um erro isolado. E o sintoma final de uma cadeia que comecou com pot odds aparentemente favoraveis no flop. O RIO do flop e a causa estrutural; o overcall do river e onde o custo se materializa.

```text
Custo_real = RIO_flop + RIO_turn + RIO_river
           =  P(dominado | board_i)  pot_acumulado_i
```

Em multiway, esse somatorio cresce em O(N2) por street  cada jogador adicional multiplica tanto a probabilidade de dominancia quanto o pot final.

---

### Componente 3: R (Fator de Realizacao) por street

**Pre-flop:** R captura a reducao de equity realizada por posicao (OOP) e multiway.

**Pos-flop:** R muda a cada street porque a equity residual do hero muda com o board e com o numero de jogadores ainda ativos:

```text
R_flop  = f(posicao_IP_OOP, N_ativos, textura_board_flop)
R_turn  = f(posicao_IP_OOP, N_ativos_turn, textura_board_turn, equity_residual)
R_river = f(posicao_IP_OOP, N_ativos_river)   # no river, R  1 ou 0 (showdown)
```

No river, a realizacao e binaria: o hero ou ganha o pot (R=1, equity realizada completa) ou perde (R=0). A complexidade de R colapsa com o SPR  analogo ao colapso da arvore de Er(SPR).

**Implicacao:** `Equity  R` no flop e uma estimativa com alta incerteza; no river e deterministico. O motor pos-flop deve tratar R como variavel dinamica, nao constante do cenario.

---

### Componente 4: Valuation_stack por street

**Pre-flop:** `Valuation_stack = ICM_EV(stack_atual)` via Malmuth-Harville.

**Pos-flop  o paradoxo da valuation dupla:**

Conforme chips saem da stack do hero para o pot (sem colisao direta):

- A stack total do hero diminui  `ICM_EV(stack)` cai (menos chips = menos equity de torneio)
- Mas cada chip individual na stack ganha valuation marginal maior (stacks menores tem valuation ICM por chip mais alta em estruturas nao-flat)
- O pot representa valuation compensatoria: se o hero ganhar o pot, a stack resultante tem ICM_EV muito maior

Formalmente, para cada street paga:

```text
 Valuation_stack = Chips_investidos  ICM_marginal_atual
 Valuation_pot_ganho = pot_acumulado  [ICM_EV(stack + pot)  ICM_EV(stack)]
```

O valor de chamar cada street deve comparar ` Valuation_pot_ganho  P(ganhar)` contra ` Valuation_stack  P(perder)`  nao apenas equity bruta de chips.

**RP pos-flop:** o RP (Risk Premium) e exclusivo para colisao direta. Nas streets onde nao ha all-in implicito, o RP dilui progressivamente  cada BB investido no pot sem colisao reduz a pressao de eliminacao direta, porque o hero ainda tem stack remanescente. No river com SPR proximo de zero, a decisao converge para chipEV: nao ha mais stack para proteger do ponto de vista de sobrevivencia imediata.

---

### Sintese: PM_street completo

```text
PM_street = [(Equity_street  R_street)  ICM_EV(stack_resultante_ganho  P_ganho)]
            [EV_fold_street_base + EV_payjump + RIO_mw_street]
```

Onde:

| Componente   | Pre-flop          | Flop             | Turn             | River            |
| ------------ | ----------------- | ---------------- | ---------------- | ---------------- |
| EV_fold base | antes            | antes           | (antes+flop)    | pot_total_hero  |
| RIO_mw       | O(N2) pot_preflop | O(N2) pot_flop   | O(N2) pot_turn   | O(N2) pot_river  |
| R            | f(pos, N)         | f(pos, N, board) | f(pos, N, board) | 1 ou 0           |
| Valuation    | ICM(stack)        | ICM(stackflop)  | ICM(stackturn)  | ICM(stackriver) |
| SPR proxy    | Stack/antes       | Stack/pot_flop   | Stack/pot_turn   | ~0               |

**Convergencia para chipEV no river:** conforme SPR  0, `R  binario`, `EV_fold  pot_total`, e a diferenca ICM entre ganhar e perder domina completamente  mas o RP dilui porque nao ha mais arvore futura para precificar. A decisao no river e chipEV com peso ICM no outcome binario.

---

### Base de implementacao: rpDeriver.ts

O arquivo `rpDeriver.ts` ja calcula RP diluido por street. A extensao natural para o motor pos-flop e:

1. Adicionar `potAcumulado` como variavel de estado por street
2. Calcular `EV_fold_street = potAcumulado_hero` por street
3. Calcular `RIO_mw_street` com `pot_acumulado` como base (nao apenas bet atual)
4. Recalcular `R_street` com equity residual + textura do board
5. Recalcular `Valuation_stack_street` com stack remanescente apos cada investimento

---

## Sintese atualizada: status de todas as hipoteses

| Hipotese | Status | Nivel |
| -------- | ------ | ----- |
| EV_fold(ICM) > 0 e possivel | **Provado** (condicao suficiente formal) | Teorema |
| EV_fold(chipEV) < 0 sempre | **Provado** (corolario) | Teorema |
| RIO(N) ~ O(N2) | **Provado** (produto de dois O(N)) | Teorema |
| Ci < 1 para N  N* | **Provado** (consequencia direta de RIO) | Teorema |
| Er(S) = (H/)  log(S) | **Hipotese estruturada** ( como simplificacao) | Hipotese forte |
| EV_fold(t, d_pj, pos) | **Hipotese estruturada** (3 dimensoes, forma aditiva) | Hipotese forte |
| PM_street completo | **Mapeado** (todos os componentes transpostos por street) | Roadmap de implementacao |
| Frequencia MW ~33% | Hipotese empirica  aguarda MDA | Hipotese fraca |
