# PT1 — EV do Fold e Future Game Simulation (rascunho de pesquisa)

> **Fronteira:** hipótese didática PMev. Não é uma fórmula universal de MTT e
> não substitui ICM, ranges ou uma árvore de solver.

## 1. O custo de continuar existindo

O fold não é automaticamente zero. Contudo, o custo de uma órbita depende de
modelo de ante (BBA ou antes distribuídos), número de jogadores, posição,
blinds, stack e horizonte de decisão. O exemplo `-0,125 BB` pode ilustrar um
ante de 12,5% em uma convenção específica, mas não deve aparecer como constante
de toda mesa 8-max ou de todo MTT.

O cálculo deve separar: investimento já comprometido, custo futuro da órbita e
valor condicional de sobreviver a eliminações alheias. Só o primeiro é conhecido
sem projeção; os demais precisam de premissas registradas.

## 2. Fold positivo e laddering

Próximo a um payjump, um fold pode carregar valor monetário condicional quando
há probabilidade relevante de eliminação de outro jogador. Isso não garante
fold, nem transforma qualquer micro-stack em fonte de EV positivo. O modelo
precisa declarar payouts, stacks, posição, jogadores remanescentes e a hipótese
de ocorrência que produziu a projeção.

## 3. Antevisão de órbita

Distância até o Big Blind pode ser uma variável útil de FGS. A quantidade de
mãos até a blind não é constante: muda com o tamanho da mesa e com a posição.
Ela deve ser calculada a partir do assento real, não fixada como “UTG = 6” ou
“BTN = 2” fora de uma configuração declarada.

O resultado correto é um sinal para comparar linhas sob o mesmo cenário. Não é
uma autorização automática para ampliar ou reduzir ranges.
