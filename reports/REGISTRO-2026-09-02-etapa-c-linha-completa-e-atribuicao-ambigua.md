---
id: registro-2026-09-02-etapa-c-linha-completa-e-atribuicao-ambigua
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T14:40:00-03:00
atualizado_em: 2026-09-02T14:40:00-03:00
classes: [interno, medido, pmev]
caminhos:
  - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
  - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
revisoes_de_ancora:
  - registro: registro-2026-09-02-etapa-b-river-e-classe-de-acao-no-cenario
    caminhos:
      - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
      - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
    parecer: >-
      Revisado e mantido valido, e CONFIRMADO por evidencia que ele nao tinha.
      Aquele registro publicou o par 4 (river) e afirmou que ele auditava a
      Etapa A por quatro identidades aritmeticas independentes. Este commit
      acrescenta os pares 5 e 6, que estendem a mesma cadeia para tras ate o
      flop e fecham DUAS identidades adicionais: o pote 11.73 mais o call 3.90
      resulta nos 15.63 do turn, e a stack 38.90 menos 3.90 resulta nos 35.00 do
      no seguinte. Nada do par 4 mudou; nenhum numero dele foi reescrito.
      A correcao classifyActionNoCenario que aquele registro justificou tambem
      foi exercitada por caso novo e se comportou como ele previu: no par 5, que
      e um no diante de aposta pendente, o all-in do ChipEV permanece raise, o
      que confirma que a normalizacao nao e global. Todas as afirmacoes daquele
      registro seguem de pe.
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
    parecer: >-
      Revisado, e uma de suas notas de metodo precisa ser AMPLIADA, nao
      corrigida. Aquele registro fixou que o total de combos do BB diverge entre
      duas capturas do mesmo spot, 752.8 e 752.6, e que a divergencia e da fonte
      e nao se resolve por media. A Etapa C encontrou um TERCEIRO valor para a
      mesma grandeza, 752.7, na captura do nodelock. A conclusao dele fica mais
      forte, nao mais fraca: tres valores confirmam padrao de exibicao do
      solver. O texto da fixture foi atualizado de "duas capturas" para "tres",
      e a regra de nao escolher nem promediar permanece intacta. Os tres pares
      que aquele registro publicou saem daqui sem alteracao de valor.
verificado:
  - suite frontend completa em 179 testes e 26 suites, com 0 erro e 0 warning
  - suite do solver isolada em 85 testes, dez deles novos nesta etapa
  - tsc --noEmit com exit 0, e eslint --max-warnings=0 limpo
  - dupla leitura cega das quatro capturas por dois leitores independentes sem contexto compartilhado, zero conflitos
  - a cadeia aritmetica do flop ao river fecha em seis identidades entre quatro pares
  - o pareamento dos nos 14/43 e 15/44 e do proprio documento, que os marca com `compare with`
nao_verificado:
  - suite Python, portao de 5 fases e npm audit nao foram executados nesta etapa
  - A QUAL PASSE DE NODELOCK pertencem image55.png e image45.png -- o documento reusa as duas e so o autor pode arbitrar
  - o pote do lado HRC continua fora do recorte em todas as capturas
  - a causa da divergencia de sizing entre os dois motores permanece NAO DETERMINADA
supersede: null
---

# Etapa C: a linha inteira do flop ao river, e a ambiguidade que ela não apaga

## 1. Dois pares novos, pareados pelo próprio autor

O documento marca com `compare with` quais nós formam par. Não é inferência
minha: é a etiqueta do autor.

| | ChipEV | ICMev |
| --- | --- | --- |
| **Par 5** — IP reage ao check-raise no flop | nó 14, `image55.png` | nó 43, `image54.png` |
| **Par 6** — BB age no turn após o IP pagar | nó 15, `image45.png` | nó 44, `image28.png` |

Dupla leitura cega das quatro capturas, dois leitores independentes sem contexto
compartilhado: **zero conflitos**.

**Par 5 é o primeiro caso em que as classes de ação correspondem e os sizings
não, fora do par 3.** Os dois lados oferecem fold, call e dois raises — e aqui
`Allin 40` permanece `raise`, porque há aposta pendente e não se pode pedir
mesa. É a confirmação, por caso novo, de que a normalização introduzida na
Etapa B não é global.

**Par 6 repete a forma do par 4:** duas sizings de aposta contra três, aviso de
cardinalidade, nenhum bloqueio.

## 2. A cadeia agora vai do flop ao river

Quatro capturas, transcritas em três etapas diferentes, sem que a leitura de uma
informasse a outra. Encaixadas, fecham **seis identidades**:

```
FLOP -> TURN
  pote  11.73 + call 3.90   = 15.63   (par 5 -> par 6)
  BTN   38.90 - call 3.90   = 35.00

TURN (nodelock de 50%)
  15.63 x 50%               =  7.815 ~ 7.80
  pote  15.63 + 7.80        = 23.43   = pote do par 3
  BB    35.00 - 7.80        = 27.20   = stack do BB no par 3

TURN -> RIVER
  pote  23.43 + call 7.80   = 31.23   = pote do par 4
  BTN   35.00 - call 7.80   = 27.20   = stack no par 4
```

E as contagens de combos atravessam por outro caminho: **370.9** é o range do IP
em três capturas (nodelock, par 2, par 5); **252** é o range do BTN no par 6 e o
`totalCombos` do par 3; **32.81bb** é o shove do HRC no turn em duas capturas
independentes (pares 3 e 6).

Um erro de dígito em qualquer um dos quatro pares quebraria pelo menos uma
dessas igualdades.

## 3. O número que parecia defeito, e o nodelock que o explica

O range do IP no par 5 tem **370.9 combos — o range inteiro**. Num nó em que o
IP já apostou e foi aumentado, isso deveria ser um subconjunto.

A explicação está em `image63.png`: um nodelock que obriga o IP a apostar `Bet
1.1 (20%)` com **100%** da mão, 370.9 combos. Sem esse contexto o número
pareceria erro de leitura; com ele, é consequência. A captura entrou como
contexto (`NODELOCK_IP_CBET_SMALL`), não como par — não tem gêmeo ICMev.

Ela também traz um **terceiro valor** para o total de combos do BB: 752.7, ao
lado dos 752.8 e 752.6 já registrados. Três valores para a mesma grandeza,
todos da fonte. Reforça a regra que já existia: não se escolhe um, não se tira
média.

## 4. Uma ambiguidade que eu poderia ter escondido

As duas capturas ChipEV desta etapa aparecem **duas vezes** no documento, com
legendas de nós diferentes, e a segunda inserção cai sempre num **bloco de
nodelock diferente**:

```
image55.png -> `14 IP reaction vs XR after cbet small flop`
            -> `Range de defesa IP vs BB xR`
image45.png -> `15 BB XR and betting turn after IP calls (2d)`
            -> `21 Action BB turn after IP calls no XR (2d)`
```

Isso não é suspeita genérica — **há prova de que a atribuição de figura falha
nesta região.** `image63.png` tem três inserções, e a terceira a legenda como
`24 Nodelock: Obrigando o OOP a cbetar sizing baixa`. A captura mostra o **BTN
apostando 1.1 a 100%**: ela não pode ilustrar um lock sobre o OOP. Uma das três
legendas está objetivamente errada.

**Por que os pares 5 e 6 entram mesmo assim, e o par com `image7.png` não.**
`image7.png` tem quatro inserções que descrevem *objetos diferentes* — "range de
ataque" contra "range de defesa" —, então nem o spot é recuperável; segue
rejeitado desde a Etapa A. Aqui as duas legendas de cada captura descrevem o
*mesmo* spot em fraseados diferentes, e a cadeia aritmética amarra as capturas
ao mesmo solve. O que fica em aberto é **a qual passe de nodelock elas
pertencem** — e só o autor da fonte pode arbitrar isso.

A ambiguidade está declarada em `ATRIBUICAO_AMBIGUA_NODELOCK`, repetida no
`nodeLabel` de cada par, e há teste que falha se alguém a apagar. Escondê-la
deixaria os pares mais limpos e menos verdadeiros.

## 5. Uma hipótese que NÃO virou explicação

O all-in do ChipEV no par 5 é rotulado `Allin 40`; o do ICMev, `raises 37.88bb`.
E 37.88 é exatamente `efetivaPosFlopBb`, já registrado desde a Etapa A.

A tentação é evidente: cada motor rotula o all-in pelo total da sua própria
base. Mas **essa é a vizinhança da explicação que o Tier 0 descartou** quando
foi usada para o par 3 — "os motores partem de stacks efetivas diferentes" —, e
a correção continua valendo: a efetiva é 40bb nos dois cenários antes do open.
A coincidência aqui é sobre a base *pós-flop* que cada interface exibe, que é
outra grandeza. Confundir as duas foi o erro original.

Registrei como `HIPOTESE_BASE_DO_ALLIN`, com `confirmada: false`, falsificador
declarado e um teste que reprova se alguém promovê-la a fato sem a recaptura.
**A causa da divergência de sizing segue NÃO DETERMINADA.**

## 6. O que resta no documento

Depois desta etapa, os pares marcados `compare with` ainda não convertidos são:

- **nó 13 × nó 42** — bloqueado por `image7.png`, quatro inserções ambíguas;
- **nós 47, 48, 49** (ICMev) — a linha do river após uma aposta de 50%. **Não
  têm gêmeo ChipEV**, e não por descuido: o par 4 mostra que a árvore ChipEV
  daquele river oferece 25% e all-in, sem 50%. O ramo não existe daquele lado.

## 7. O que continua não autorizado

Seis pares transcritos não são calibração. Consistência interna não é
reprodutibilidade: estes números seguem sendo transcrição de captura de
terceiro, e versão de solver, build e e-Nash continuam ausentes de todas as
capturas. Nada aqui altera as constantes de `solveIcmDistortion`.
