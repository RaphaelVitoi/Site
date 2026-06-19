---
name: Teoria EV do Fold e Antes — Threshold Correto de Decisão
description: Contribuição original de Raphael: EV do fold nunca é 0 em chipEV (é -antes). Em ICM pode ser POSITIVO. Threshold = Esperança > EV_fold. EV_fold é dinâmico: f(t, d_pj, pos). RIO multiway x². BB defende pelo threshold, não por pot odds.
type: project
---

# Teoria EV do Fold e Antes

**Autoria:** Raphael Vitoi

## Teoria Original: EV do Fold como Threshold Correto

### Pré-flop (ChipEV)

O EV do fold **nunca é 0 em torneios** (exceto cash game sem posição de blind).
Com antes padrão de 12.5% do BB:

```math
EV_fold(chipEV) = −antes = −0.125bb
```

Threshold correto para uma ação ser superior ao fold:

```math
Ação é preferível sse: Esperança(ação) > EV_fold
```

Exemplo: Esperança do open = −0.10bb > fold −0.125bb → **open é matematicamente correto** mesmo com EV negativo absoluto.

### EV do fold em ICM — pode ser POSITIVO

**CORREÇÃO CRÍTICA:** Em ICM, o EV do fold **não é sempre negativo**. Pode ser positivo.

Exemplo: tenho 12bbs. CO, BTN, SB, BB têm 5bbs cada. Ao foldar, eu "passo a vez" e potencializo a probabilidade dos shorts caírem antes de mim — payjumps passivos garantidos sem investir nada além do ante. O fold aumenta minha Perspectiva. EV_fold(ICM) nesse cenário é provavelmente **positivo**.

Isso é evidência de que ICM EV isolado é insuficiente como métrica final — a Perspectiva Matemática captura esse ganho passivo.

**O Desafio Lógico da Assimetria:** Postular dogmaticamente que o `EV_fold` permaneça positivo ao longo de uma órbita cria uma utopia baseada em paralisia e sangramento de *blinds*. Como o Big Blind subtrai de forma incontornável 1bb de capital fixo, o EV neste assento é rigorosamente cortado em valores negativos na largada. `EV_fold(ICM) > 0` descreve um *estado anômalo, condicional e transitório*, estritamente dependente da alta probabilidade de eliminação de atores terciários da mesa.

### Extensão para o pós-flop

O EV do fold pós-flop é o valuation que você já investiu nas streets anteriores, não −antes.

- Conforme fichas entram no pot, EV_fold fica mais negativo
- O pot representa valuation compensatória exponencialmente maior do que as fichas individuais investidas
- Quanto mais você paga, mais "aprisionado" fica ao pot (HRC pós-flop confirma esta tendência)
- No river, decisões de call se aproximam do ChipEV porque o RP já foi "precificado" nas streets anteriores

**RP pós-flop é dinâmico e côncavo:** conforme o pot cresce e a stack perde valuation, cada BB em unidade GANHA valuation. O RP foi diluído nas streets (RP é exclusivo para colisão direta). A pressão ICM diminui e aumenta simultaneamente — evidência de que ICM sozinho não serve.

### Implicação para o motor

- `calculateEsperancaFold` retorna o EV do fold no cenário ICM — pode ser positivo
- `buildInsight` deve comparar Esperança da ação vs EV_fold (não vs 0)
- Implementado: `foldThreshold = foldResult?.esperancaPct ?? 0`

### Posição dos solvers

Solvers (GTO Wizard, HRC) **simplificam EV do fold = 0** nos outputs por clareza de interface. Internamente maximizam EV total (threshold correto). A simplificação é pedagógica, não matemática.

### Pot Odds — posição de Raphael

Efeito das pot odds na teoria perfeita: **mínimo ou inexistente** (redundante, absorvido pelo EV_fold e pela Perspectiva). Na prática:

- **Elite:** provavelmente prejudicial — distrator de Perspectiva que cria pseudo-densidade de decisão
- **Iniciante:** utilidade positiva — reduz erros catastróficos de matemática básica

As **Reverse Implied Odds (RIO)** são o "veneno" das pot odds: incentivam entrada no pot apenas para expor o jogador a perdas maiores ao acertar mão dominada. Implied Odds estão absorvidas no conceito de Especulação dentro do framework Perspectiva.

**Why:** BB defende não porque "está barato" (pot odds), mas porque EV_fold = −1.125bb em chipEV, muito mais negativo que qualquer call defensável. A métrica correta desloca o fundamento da defesa de odds para threshold de fold.

---

## EV_fold Dinâmico — Formalizção f(t, d_pj, pos)

O baseline de fold não é estático — é uma função de três dimensões contextuais:

```math
EV_fold(t, d_pj, pos)
```

- `t` = tempo para salto de blinds. Quando t → 0 (blinds sobem em ~3 min):
  - Foldar é **mais caro** — stack preservada perderá 30-50% de poder de compra na próxima órbita
  - Perspectiva: mais permissivo para open/call antes do salto
- `d_pj` = distância para próximo payjump:
  - Quando d_pj → 0 (payjump iminente): EV_fold cruza zero e pode ser **positivo**
  - Sobreviver = capturar payjump sem investir fichas
  - Perspectiva: mais conservadora para colisão
- `pos` = posição futura:
  - UTG agora + BB na próxima mão = 1.5bb compulsório iminente
  - EV_fold do UTG deve incluir o custo marginal da mão do BB que virá
  - Se a stack chegará ao BB "morta" (sem fold equity), o modelo força ação agressiva no UTG mesmo que ICMev puro diga fold marginal

### Efeito visual (Gemini Python simulation)

A simulação mostrou que conforme d_pj → 0, a curva EV_fold cruza o eixo zero (evidência do fold positivo). Conforme t → 0, o EV_fold desce (fold fica mais caro). Os dois efeitos operam independentemente e podem se combinar.

---

## RIO Multiway — Passivo Estrutural Exponencial

Em cenários multiway (~33% das situações pós-open, tendência MDA):

- RIO(N) cresce em **O(N²)**: produto de frequência_domínio O(N) × custo_quando_dominado O(N). Pot odds crescem em O(N). A razão dano/incentivo cresce em O(N) — cada player adicional multiplica a distorção. (Afirmação "x²" era imprecisa — não é a probabilidade que cresce quadraticamente, é o produto de dois termos lineares. Derivação formal: `validacao_matematica_hipoteses_v1.md`)
  - **Ajuste de Rigor Termodinâmico:** O perigo de ser dominado no poker multiway não cresce em escala infinita; os ranges obedecem, em vez disso, à Probabilidade Complementar $P = 1 - (1 - p)^N$. A distorção violenta gerada pelo RIO em Multiway emana diretamente da estabilização e "truncamento" veloz desta curva num cume de incerteza em cruzamento com um pote inflado de alta exposição.
- A equação básica do call torna-se:

  ```math
  EV_call = (Equity × Pot) - (1 - Equity × Investimento) - RIO
  ```

- Em ICM, perder um pote por RIO contra stack maior é "suicídio estratégico": o valuation das fichas perdidas no River > fichas investidas no Flop

**A espiral do prejuízo:**

1. Pot Odds atraem entrada (baixo custo aparente)
2. Jogador acerta mão marginal/dominada
3. Continua investindo — pot entrapment + RIO
4. Perde stack no River — EV_fold catastrófico no final

"O overcall no River é frequentemente o sintoma; a negligência das RIO no Flop/Turn é a causa."
