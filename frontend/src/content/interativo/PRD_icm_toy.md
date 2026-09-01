# PRD interno — Calculadora de Perspectiva Matemática para Toy Games de MTT

> **Estado editorial:** especificação de produto em revisão; não é uma rota,
> nem um simulador publicado, nem evidência independente de estratégia.

## 1. Problema delimitado

Em MTTs, Pot Odds descrevem o preço local de continuar, mas não esgotam o
spot: payouts, stacks, risco de eliminação, posição, realização de equidade e
oponentes remanescentes também importam. Elas são uma condição necessária da
análise, não uma regra suficiente. ChipEV puro entra somente como referência
contrafactual de comparação; não deve ser apresentado como o estado operacional
normal de um MTT.

O produto deve tornar essas dependências explícitas sem converter hipóteses
PMev em frequência, sizing ou recomendação de solver sem evidência de nó.

## 2. Resultado de produto

Um Toy Game de mesa final que receba o estado declarado pelo estudante, valide
a conservação de fichas e separe visualmente:

1. dados recebidos e pressupostos escolhidos;
2. cálculo ICM/BF/RP reproduzível para o estado informado;
3. sinais PMev/FGS/RIO que ainda são hipóteses de modelo;
4. lacunas que impedem um veredito quantitativo.

O resultado deve dizer **“dados insuficientes para frequência”** quando não
houver ranges, ações, pote, posição ou fonte de solver necessários. O objetivo
didático é explicar a árvore de decisão, não preencher essa árvore com números
inventados.

## 3. Recorte de versão inicial

- MTT Vanilla de Texas Hold'em, mesa final de 8 ou 9 lugares.
- O estudante pode informar de 2 a 9 jogadores remanescentes; em heads-up de
  mesa final, o motor exibe uma referência terminal winner-take-all/ICM-neutra,
  sem declarar que o torneio “vira ChipEV puro”.
- PKO, Mystery, satélite, rebuy e bounties ficam visíveis como extensões futuras
  e não entram no cálculo desta versão. Re-entry pode compor o field declarado,
  mas não deve ser inferido sem registro.

## 4. Contrato de entradas

| Grupo | Campo obrigatório | Regra de validade |
| :-- | :-- | :-- |
| Torneio | prize pool total, buy-in, field após late registration | valores positivos; o pool total não é a soma automática dos prêmios da FT se existirem payouts anteriores. |
| Mesa final | número de lugares (8/9), jogadores remanescentes e vetor de payouts da FT | `2 ≤ remanescentes ≤ lugares`; vetor estritamente não negativo e em ordem de colocação. |
| Fichas | stack de cada jogador, em fichas ou BB, e blind level/ante | uma única unidade por cálculo; soma de fichas preservada entre cenários. |
| Spot | agressor, defensor, posição, pote e investimento atual | índices pertencem à mesa; valores não negativos; stack efetivo coerente. |
| Evidência opcional | hand history e origem de solver/ranges | HH só preenche após reconhecer formato e FT compatível; output de solver recebe fonte, versão e nó. |

Templates top-heavy, híbrido e flat podem sugerir uma distribuição inicial,
mas devem mostrar fonte, período e universo. Nenhum template pode substituir o
vetor de payouts informado nem fingir que representa PokerStars ou GGPoker sem
amostra documentada.

## 5. Saídas e limites

- Exibir BF/RP com a direção explícita: `ΔRP(A→D) = RP_defensor − RP_agressor`.
  Valor positivo identifica a Vantagem de Risco do agressor; a unidade é p.p.
  dentro da leitura ICMev/RP.
- Exibir RIO/FGS/PMev como componentes e pressupostos do motor, não como
  veredito de equilíbrio externo.
- Nunca converter `ΔRP` diretamente em percentagem de agressão, defesa ou
  sizing. Essa transformação exige payout, stacks efetivos, pote, posição,
  ranges e jogadores remanescentes — e, para validação, nós reprodutíveis.
- Recusar inputs impossíveis (stack negativo, soma de chips incompatível,
  payout vazio, jogador fora da mesa) com mensagem pedagógica e sem completar
  dados ausentes por suposição silenciosa.

## 6. Riscos e critérios de aceite

| Risco | Tratamento de aceite |
| :-- | :-- |
| Saída visual parecer resultado de solver | cada métrica traz proveniência: entrada do usuário, cálculo de motor ou referência externa. |
| Perda de fichas entre cenários | teste de conservação de stack e erro bloqueante no formulário. |
| Confusão entre Pot Odds e decisão final | interface descreve Pot Odds como condição necessária, não como sentença de ação. |
| Hipótese ser promovida a fato | publicação só após revisão editorial, parâmetros versionados e comparação reproduzível. |
