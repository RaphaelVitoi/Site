# PT2: A Insolvência das Pot Odds e o Colapso da Edge

> "Pot Odds são o preço. Perspectiva é o valor. Nunca confunda os dois."

## 1. A Falácia do Preço Barato

Pot Odds são uma métrica linear para um jogo não-linear. Elas ignoram:

1. **Realização de Equidade (R):** De que adianta ter 25% de odds se você só vai ver o showdown 10% das vezes?
2. **Reverse Implied Odds (RIO):** O custo de "acertar e perder o stack".

## 2. O Multiway como Cemitério Estratégico

Em potes com 3 ou mais jogadores, as RIO crescem **exponencialmente**. O sistema entra em estado de entropia onde a força absoluta da mão é secundária à **Tensão Posicional**. Se você está no meio (Sandwich), suas Pot Odds são irrelevantes; você está insolventemente preso.

## 3. O Colapso Mecânico da Edge

A Edge (superioridade técnica) não é fixa. Ela é uma função do **Stack Depth**.

* **100bb:** Edge Infinita (Árvore Complexa).
* **10bb:** Edge Nula (Colapso Binário).

O solver protege o jogador fraco ao simplificar o jogo. A missão do SOTA é forçar a complexidade onde a edge existe e aceitar a variância onde o colapso é inevitável.
