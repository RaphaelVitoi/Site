# PT2 — Pot Odds, realização e Edge (rascunho de pesquisa)

> **Fronteira:** hipótese didática PMev. O texto descreve condições a testar,
> não uma prova de que Pot Odds ou Edge deixem de operar.

## 1. Preço local e valor contextual

Pot Odds são o preço imediato de continuar e permanecem uma condição necessária
da análise. Elas não capturam, por si, realização de equidade, posições futuras,
range adversário, RIO, ICM ou payjumps. A decisão requer integrar essas camadas,
não descartar a métrica de preço.

## 2. Multiway e RIO

Em potes multiway, mais linhas, ranges e risco de dominação podem reduzir a
realização de equidade e aumentar RIO. A implementação atual usa uma penalidade
quadrática no número de oponentes como heurística de modelo; “exponencial” não
é a descrição matemática desse contrato. A magnitude deve ser calibrada contra
cenários reproduzíveis antes de ser tratada como previsão de jogo real.

## 3. Edge e profundidade

Profundidade de stack altera tamanho da árvore, realizabilidade e espaço de
erro, mas não torna a Edge infinita a 100 BB nem nula a 10 BB. A relação precisa
de ranges, posições, ação anterior, skill model e evidência de solver. A função
do Toy Game é exibir a dependência e os dados ausentes, não transformar stack
depth em uma decisão automática.
