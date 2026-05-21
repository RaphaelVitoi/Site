---
name: Validação Matemática das Hipóteses Paradigmáticas
description: Tarefa ativa: criar validação matemática formal para hipóteses do framework Perspectiva que atualmente existem predominantemente em teoria. Identificar o que tem prova, o que tem hipótese forte e o que precisa de derivação.
type: project
---

## Objetivo

Transformar hipóteses paradigmáticas do framework Perspectiva em proposições com validação matemática ou empírica explícita. Raphael tem a teoria; falta a formalização que fecha o ciclo científico.

**Why:** O framework tem credibilidade teórica, mas hipóteses "fortes" sem derivação formal são vulneráveis a refutação por falta de rigor — e não transferem para publicação ou uso educacional de alta integridade.

**How to apply:** Para cada hipótese identificada abaixo, determinar se a validação é: (A) derivação matemática pura, (B) simulação/exemplo numérico, (C) ancoragem empírica (HRC, MDA), ou (D) hipótese assumida com grau de certeza explícito.

---

## Hipóteses Identificadas por Status

### Hipóteses com derivação já iniciada (formalizar)

1. **EV_fold em ICM pode ser positivo**
   - Exemplo qualitativo existe (12bb vs múltiplos 5bb)
   - Falta: prova geral. Quando exatamente EV_fold(ICM) ≥ 0? Condições necessárias e suficientes.
   - Abordagem: derivar via Malmuth-Harville — comparar equity(fold) vs equity(call) como função de d_pj e distribuição de shorts.

2. **RIO multiway cresce em taxa x² enquanto pot odds são lineares**
   - Afirmado sem derivação
   - Abordagem: mostrar que em multiway com N oponentes, P(acertar mão dominada por pelo menos 1) cresce em O(N) ou O(N²) dependendo da independência de ranges. Formalizar para N=2,3,4.

3. **Er(S) = (ΔHabilidade / σ) × log(S)**
   - Forma proposta por Raphael, sem derivação da escolha logarítmica
   - Abordagem: justificar por que log(S) — argumento de information theory (entropia de decisão cresce logaritmicamente com a árvore de opções)?

### Hipóteses com ancoragem empírica declarada mas sem quantificação

4. **Frequência multiway ~33%** (tendência MDA, "hipótese forte sem rigor científico")
   - Declarada explicitamente como hipótese
   - Status: aguarda dados MDA

5. **EV_fold dinâmico f(t, d_pj, pos)**
   - Matemática declarada como "não fechada"
   - Abordagem: modelar cada dimensão separadamente antes de combinar

### Hipóteses implícitas que merecem formalização

6. **Risco de Ressurreição** — dobrar 10bb→20bb "devolve complexidade ao oponente"
   - Intuitivo, não quantificado. Pode ser derivado via Oe(S) por profundidade.

7. **Ci = Perspectiva_real / Pot_Odds_incentivo < 1 em MW com ≥4 jogadores**
   - Condição de "pot odds mentem" — falta prova geral

---

## Próximos passos (por prioridade de fechabilidade matemática)

1. EV_fold(ICM) positivo — condições via M-H (mais próximo de fechar)
2. RIO x² multiway — combinatória de ranges
3. Ci < 1 em MW — derivação via Perspectiva e pot odds
4. Er(S) log — justificativa teórica da forma funcional
5. EV_fold dinâmico — modelar cada dimensão isolada
