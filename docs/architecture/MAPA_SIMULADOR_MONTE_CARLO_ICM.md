# Mapa do simulador de Monte Carlo ICM

**Alvo:** `frontend/src/lib/montecarlo.ts` (185 linhas) e tudo que o consome.
**Repositório:** `RaphaelVitoi/Site`, branch `master` no estado de 2026-09-18.
**Natureza:** leitura e medição. Nenhuma linha de código alterada.

---

## 1. O que o kernel calcula hoje

`calculateIcmMonteCarlo(stacks, prizes, config)` devolve quatro campos, e só estes:

| Campo | Definição operacional | Unidade |
| :--- | :--- | :--- |
| `equities[i]` | $\hat{E}_i = \frac{1}{N}\sum_{k=1}^{N} \text{prêmio recebido por } i \text{ na iteração } k$ | a mesma de `prizes` |
| `stdErrorPerPlayer[i]` | $P\sqrt{p(1-p)/N}$, com $p = \hat{E}_i/P$ e $P=\sum \text{prêmios ativos}$ | idem |
| `seed` | semente de 32 bits, ou `null` quando se usou `Math.random` | — |
| `iterations` | $N$ efetivo (zero quando o cenário é degenerado) | — |

Tudo o que o simulador entrega é **uma média monetária por assento**. Ele não expõe
distribuição de colocação, probabilidade de vitória, variância por amostra, nem
intervalo de confiança. `winProb` que aparece em `icmEngine.ts:58` não vem do
simulador: é $s_i/T$, a fração de fichas, calculada fora dele.

## 2. Como amostra

Random walk de Harville sequencial, uma iteração por permutação amostrada:

1. sorteia o 1º colocado com $P(i) = s_i / \sum_{j \text{ vivo}} s_j$;
2. paga o prêmio daquela colocação, remove o jogador da pool e subtrai o stack dele do denominador;
3. repete até esgotar os prêmios ativos (`prizes.slice(0, numPlayers)`).

Detalhes mecânicos que importam:

- **RNG:** SplitMix32 com passo **aditivo fixo** de `0x6d2b79f5` (`montecarlo.ts:23-31`).
  Sem `seed`, cai em `Math.random` e o resultado deixa de ser reproduzível.
- **Estado de vivos:** bitmask `int32` para $N \le 31$, `Uint8Array` para $N > 30$.
  Medido: em $N=31$, `(1 << 31) - 1` vale `-2147483649` e só funciona porque o
  operador `&` coage para `ToInt32` e devolve `0x7FFFFFFF`. O comentário da linha 100
  está certo, por coincidência aritmética, não por construção. As linhas 167-169 são
  inalcançáveis: `isBusted` nunca é falso quando `numPlayers > 30`.
- **Paralelismo:** `icmWorkerPool.ts` reparte $N$ entre até 8 workers com sementes
  `baseSeed + i·1013904223` e faz média ponderada por iterações.

## 3. Premissas embutidas no código

1. **Harville puro.** A chance de terminar à frente é proporcional às fichas. Não existe
   habilidade, posição, ordem de ação, nem ajuste de range.
2. **O torneio não é jogado.** Nenhuma mão é simulada. O modelo salta do snapshot atual
   direto para a ordem final de eliminação.
3. **O tempo não passa.** Não há blinds, antes, níveis, nem erosão de stack. Um mesmo
   snapshot vale igual a 200bb de média e a 8bb de média.
4. **Um único field plano.** Não há mesas, nem balanceamento. Um field de 200 é tratado
   como uma mesa de 200.
5. **Premiação estática.** Sem bounty, sem reentrada, sem deal. `featureFlags.ts:19`
   registra PKO como em desenvolvimento, e `hrcFormat.ts:98` recusa exportar PKO
   justamente porque o modelo não o contém.
6. **Stacks estritamente positivos.** Medido: com stack zero o kernel perde prêmio.
   Em `[100, 100, 0]` com prêmios `[70, 20, 10]`, o exato devolve `45, 45, 10` e o
   Monte Carlo devolve `44.95, 45.05, 0` — soma 90 de 100, porque a guarda
   `remainingTotalChips <= 0` interrompe o laço antes do último prêmio.
   `icmEngine.ts:36-52` filtra os vivos e reaplica a convenção terminal, e por isso
   está correto; `icmWorkerPool`, `icm.worker` e `perspectiva.calculateMapaICM`
   ($n>10$) passam os stacks crus e herdam o furo.
7. **Uma semente por chamada.** Não há mecanismo de números aleatórios comuns entre
   cenários comparados.

## 4. Onde ele acerta o ICM

**É o mesmo modelo do kernel exato, estimado por amostragem.** `icmMatrix.ts:147`
enumera Malmuth-Harville em $O(n\,2^n)$; o Monte Carlo amostra a mesma cadeia. Medido
contra o exato, erro relativo máximo por jogador:

| Cenário | $N=1.000$ | $N=10.000$ | $N=100.000$ |
| :--- | ---: | ---: | ---: |
| FT 3-way hyper | 1,62% | 0,22% | 0,03% |
| Major final 4 | 3,27% | 0,34% | 0,13% |
| WSOP ME FT 9-max | 4,40% | 1,34% | 0,60% |
| Bolha, 6 vivos / 5 pagos | 4,01% | 0,42% | 0,92% |

**A massa de premiação é conservada exatamente**, não estatisticamente: com todos os
stacks positivos, o resíduo $\sum \hat{E}_i - P$ medido foi `0.000e+0` em todos os quatro
cenários a $N=50.000$. Isso é propriedade estrutural — cada iteração distribui o conjunto
completo de prêmios —, não sorte amostral.

**A procedência é auditável.** `icmEngine.ts` roteia $n \le 10$ para o exato e $n > 10$
para o amostrado, e declara qual usou em `metadata.method`. `icmTransitionExperiment.ts`
é a peça mais madura da base: conserva fichas e premiação em centavos, exige ordem de
eliminação declarada em vez de inferir empates, e publica uma lista de `limitations` que
diz em voz alta que o Monte Carlo aproxima e que a seed não certifica convergência.

## 5. Onde ele se afasta

**5.1 A barra de erro está errada, e por dois motivos distintos.**

O rótulo "erro padrão de Bernoulli" descreve um modelo que não é o do estimador. O payoff
por iteração não é $P\cdot\text{Bernoulli}(p)$: é uma variável discreta sobre a escada de
prêmios. Como $P \ge \max(\text{prêmio})$, vale $E[X^2]_{\text{Bernoulli}} \ge E[X^2]_{\text{real}}$,
logo a fórmula é um **limite superior**, nunca um erro padrão. Medido contra o desvio
empírico de 30 sementes a $N=10.000$, a razão empírico/declarado ficou entre **0,16 e 0,34**
nos 16 assentos avaliados: a barra é de 3 a 6 vezes mais larga que a realidade.

Pior: no caminho paralelo, `icmWorkerPool.ts:189-191` aplica $\sqrt{p(1-p)/N}$ com $p$ sendo
a **equity monetária**, sem normalizar pela premiação. Para qualquer prêmio maior que 1,
$p(1-p) < 0$ e o resultado é `NaN`. Reproduzido: equities `120544, 101924, 77532` devolvem
`NaN, NaN, NaN`. O modo `WORKER_POOL` é o padrão no browser; o fallback single-thread
devolve o valor largo mas finito. A barra de erro que o usuário lê depende de qual caminho
o navegador tomou.

**5.2 O bubble factor é uma diferença de estimativas ruidosas, e não é reproduzível.**

`perspectiva.ts:107` chama o Monte Carlo **sem seed** com 20.000 iterações, e o cache de
`calculateMapaICM` só é consultado no ramo $n \le 10$. Em $n > 10$, `rpDeriver.ts` obtém
base, vitória e derrota de três amostragens independentes e não repetíveis. Medido em
12 vivos / 9 pagos, hero mid stack, 40 repetições:

| Regime | BF médio | desvio | faixa | Equidade requerida |
| :--- | ---: | ---: | :--- | :--- |
| Sementes independentes (atual) | 1,750 | 0,050 | [1,632; 1,843] | amplitude **2,82pp** |
| Números aleatórios comuns | 1,752 | 0,027 | [1,696; 1,807] | amplitude 1,46pp |

Uma oscilação de 2,82 pontos percentuais na equidade requerida, entre execuções do mesmo
cenário, é a distância entre pagar e foldar num spot apertado.

**5.3 É snapshot, e o próprio repositório sabe disso.** `solver/scenarios.ts:57` traz o quiz
cuja resposta correta é *"trata o torneio como se terminasse na mão atual"*. A biblioteca
pública fala em FGS em seis páginas; o kernel não tem uma linha a respeito.

**5.4 A distribuição de colocação é jogada no lixo.** O laço já sorteia a permutação
completa, mas só acumula o prêmio. `perspectiva.ts:111-118` preenche `positionProbs` apenas
na coluna 0, e com $s_i/T$ — não com a frequência medida. O dado mais rico da simulação é
descartado dentro do laço que o produz.

**5.5 Independência dos fluxos paralelos por sorte, não por construção.** O passo aditivo
fixo faz de cada worker um deslocamento do mesmo fluxo global. Como `0x6d2b79f5` é ímpar,
é invertível módulo $2^{32}$, e portanto **todo par de workers se sobrepõe em algum ponto
do ciclo**. Medido: a menor distância de sobreposição é de 292.323.453 sorteios (worker 0
contra worker 1), contra ~125.000 sorteios consumidos na carga mais pesada de hoje
(50.000 iterações, 8 workers, 20 prêmios). A margem é de ~2.600x, confortável — e não
documentada em lugar algum, portanto invisível a quem aumentar $N$ no futuro.

---

## 6. O que precisaria mudar para sustentar um ICM mais forte

Ordenado por impacto medido sobre raio de alteração. Os quatro primeiros são correções de
integridade dentro do modelo atual; os demais mudam o modelo.

1. **Estimador de variância real.** Acumular $\sum x^2$ por jogador no laço e devolver
   $\widehat{\text{Var}}/N$ com IC 95%. Custo: um array e uma multiplicação por iteração.
   Elimina de uma vez a barra 3-6x larga e o rótulo "Bernoulli" que não descreve nada.
2. **Corrigir o agregador paralelo.** `icmWorkerPool` deve combinar as variâncias dos
   workers, não recalcular uma pseudo-Bernoulli sobre valor monetário. Enquanto não o faz,
   o modo padrão do browser publica `NaN`.
3. **Unificar a semântica de stack zero.** Ou o kernel aplica a convenção terminal do
   exato, ou recusa stacks zerados na entrada. Hoje o comportamento depende de qual
   chamador filtrou antes, e a suíte não cobre o caso: os testes de conservação de massa
   em `montecarlo.test.ts` usam apenas stacks positivos.
4. **Números aleatórios comuns para todo delta.** Bubble factor, risk premium e equidade
   requerida são *diferenças*. Reusar a mesma seed nos cenários base/vitória/derrota
   cortou o desvio em 1,8x sem uma iteração a mais. Junto: dar seed determinística ao
   ramo $n>10$ de `calculateMapaICM`, hoje não reproduzível.
5. **Emitir a matriz de colocação completa.** $\hat{P}(\text{jogador } i \text{ termina em } j)$
   já é produzida e descartada. É a entrada de qualquer coisa que venha depois: prospect
   theory sobre a escada de prêmios, valoração de bounty, análise de pay jump.
6. **Estrutura de blinds e antes como entrada de primeira classe.** `TournamentConditions`
   já carrega field, ITM e pool, mas não nível, blinds nem antes. Sem eles não existe
   horizonte temporal, e sem horizonte não existe FGS.
7. **Trocar o sorteio de ordem final por transição de fichas.** É a fronteira real entre
   ICM e FGS: em vez de amostrar a permutação em um passo, simular mãos ou all-ins com
   blinds subindo e stacks evoluindo. Aqui o Monte Carlo deixa de ser um atalho para o
   exato e passa a calcular algo que o exato não calcula. Reduz a chance de vitória de
   proporcional-a-fichas para emergente da dinâmica.
8. **Bounty como termo no payoff da iteração.** A infraestrutura já recusa PKO
   explicitamente em vez de fingir suporte, o que é a postura certa. Falta o termo.
9. **Mesas e balanceamento.** Um field de 200 num único pool superestima a exposição
   mútua. Modelar mesas muda quem pode eliminar quem, e a estrutura de sorteio a cada
   quebra de mesa.
10. **Habilidade por jogador.** Um parâmetro de vantagem que distorça $P(i) \propto s_i$
    para $P(i) \propto s_i^{\theta_i}$ ou equivalente. É a hipótese mais fácil de testar
    contra dados de campo (MDA) e a mais difícil de calibrar sem vazar overfitting.
11. **Gerador com fluxos disjuntos por construção.** Um gerador baseado em contador
    (PCG, Philox) com `stream id` por worker substitui a margem de 2.600x por garantia.
    Passa a ser condição declarada, não coincidência aritmética.

**Uma observação de alcance.** Os itens 1 a 5 são correções: o modelo continua sendo
Malmuth-Harville, e a teoria não avança, só para de mentir sobre a própria precisão. O
item 7 é o único que muda a classe do modelo. Os itens 6, 8, 9 e 10 só fazem sentido
depois dele, porque todos pressupõem que exista uma dinâmica a parametrizar.

---

## 7. Declaração de verificações

**Executadas.** Leitura integral de `montecarlo.ts`, `icmEngine.ts`, `icmMatrix.ts`,
`icmWorkerPool.ts`, `icm.worker.ts`, `icmTransitionExperiment.ts`, `tournamentConditions.ts`
e `montecarlo.test.ts`; leitura parcial de `perspectiva.ts`, `rpDeriver.ts` e
`monteCarloParallelPool.ts`. Varredura de consumidores por `grep` em todo o repositório.
Todas as tabelas numéricas deste documento vêm de portes fiéis dos dois kernels em
JavaScript puro, executados em Node 22 fora da árvore do projeto, com sementes declaradas.

**Não executadas.** A suíte do projeto não rodou: `frontend/node_modules` não está
presente neste host e instalar dependências ultrapassaria o escopo de leitura. O portão de
5 fases (`cwv_gate.ps1`) não rodou, porque nenhum commit foi feito. A skill
`security-review` não foi invocada, porque não houve alteração de código para revisar.
O `monteCarloParallelPool.ts` foi lido apenas o suficiente para confirmar que é outro
motor — equity de mão via WASM, range contra range — e **não** um caminho do ICM.

**Limite dos números.** Os portes reproduzem a aritmética dos kernels linha a linha, mas
são portes: uma divergência entre eles e o TypeScript original só seria descartada por
execução da suíte real, que não ocorreu.
