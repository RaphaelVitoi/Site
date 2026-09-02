---
id: registro-2026-09-02-etapa-c2-par-7-e-a-trilha-do-solver
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T15:10:00-03:00
atualizado_em: 2026-09-02T15:10:00-03:00
classes: [interno, medido, pmev, retificacao]
caminhos:
  - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
  - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
revisoes_de_ancora:
  - registro: registro-2026-09-02-etapa-c-linha-completa-e-atribuicao-ambigua
    caminhos:
      - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
      - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
    parecer: >-
      Revisado, e UMA AFIRMACAO SUA ESTA ERRADA -- erro meu, nao do Tier 0.
      Aquele registro, na secao 4, justifica manter `image7.png` rejeitada
      dizendo que suas quatro insercoes "descrevem OBJETOS DIFERENTES -- range
      de ataque contra range de defesa --, entao nem o spot e recuperavel". O
      conteudo da captura desmente isso: `image7.png` mostra UM UNICO no, o BB
      diante da cbet de 1.1 do IP, pote 6.73, stacks BTN 38.9 e BB 40, com
      Fold / Call / Raise 5 (50%) / Allin 40 (497%). "Ataque" e o ramo de raise
      e "defesa" e call mais raise: sao duas vistas da MESMA tela, nao dois nos.
      O segundo leitor, sem contexto, chegou a mesma conclusao pelo argumento
      mais forte -- o rotulo `Allin 40` casa com o badge do BB (40) e nao com o
      do BTN (38.9). A rejeicao contou insercoes em vez de ler a captura.
      A secao 4 daquele registro deve ser lida com esta correcao: o criterio de
      "reuso entre passes de nodelock" continua valido e continua declarado, mas
      NAO desqualifica o par, e o no 13 x no 42 esta convertido em
      `PAR_7_BB_VS_CBET_SMALL`. Tudo o mais daquele registro segue de pe,
      inclusive a prova de que a atribuicao de figura do documento e falivel,
      que esta etapa reforcou com evidencia nova.
  - registro: registro-2026-09-02-etapa-b-river-e-classe-de-acao-no-cenario
    caminhos:
      - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
      - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
    parecer: >-
      Revisado e mantido valido, e uma de suas afirmacoes foi PROMOVIDA de prova
      indireta a prova direta. Aquele registro sustentou que a marca antes dos
      campos do painel e indicador de direcao e nao sinal negativo, provando por
      aritmetica: equidades complementares somam 100.00 e combos reaparecem como
      soma das acoes. `image59.png`, em resolucao maior, permitiu ao leitor cego
      responder campo a campo que os oito simbolos NAO sao iguais entre si --
      quatro para cima em verde, quatro para baixo em vermelho, e as direcoes
      anti-correlacionadas entre os dois jogadores. Um sinal de menos nao aponta
      para cima. A conclusao daquele registro estava certa; agora esta observada.
      Nenhum numero do par 4 mudou, e a correcao classifyActionNoCenario que ele
      introduziu segue exercitada e correta.
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
    parecer: >-
      Revisado e mantido valido. Os tres pares que aquele registro publicou saem
      daqui sem alteracao de valor, e as quatro afirmacoes de metodo que ele
      fixou continuam em vigor. A unica edicao no texto da fixture que o toca e
      a nota do par 3: ela dizia, alem do criterio de escolha, que "o no 13 foi
      descartado"; a frase de rejeicao foi retificada e o criterio de escolha
      -- ausencia de reuso -- foi preservado intacto. A conclusao daquele
      registro sobre ilegivel nao ser zero, e sobre divergencia entre solvers
      ser restricao e nao erro, nao e tocada.
verificado:
  - suite frontend completa em 187 testes e 26 suites, com 0 erro e 0 warning
  - suite do solver isolada em 93 testes, oito deles novos nesta etapa
  - tsc --noEmit com exit 0, e eslint --max-warnings=0 limpo
  - dupla leitura cega de tres capturas por leitores independentes sem contexto compartilhado, zero conflitos
  - a trilha de image59.png confere os conjuntos de acao de tres pares e do nodelock, digito a digito
  - o glifo de direcao confirmado por observacao direta, campo a campo, com direcoes anti-correlacionadas
nao_verificado:
  - suite Python, portao de 5 fases e npm audit nao foram executados nesta etapa
  - a qual passe de nodelock pertencem image7.png, image55.png e image45.png -- so o autor pode arbitrar
  - a direcao do triangulo nos dois campos `Combos`, onde o leitor declarou confianca media
  - o pote do lado HRC continua fora do recorte em todas as capturas
supersede: null
---

# Par 7, a trilha do solver, e uma rejeição minha que não se sustentava

## 1. A retificação, primeiro

A Etapa A rejeitou o par nó 13 × nó 42, e a Etapa C repetiu a rejeição com este
argumento:

> `image7.png` tem quatro inserções que descrevem *objetos diferentes* — "range
> de ataque" contra "range de defesa" —, então nem o spot é recuperável.

**O argumento era falso.** `image7.png` mostra um único nó: o BB diante da cbet
de 1.1 do IP, pote 6.73, stacks BTN 38.9 e BB 40, com
`Fold / Call / Raise 5 (50%) / Allin 40 (497%)`. "Ataque" é o ramo de raise
(6.8%); "defesa" é call mais raise (57.4% + 6.8%). São **duas vistas da mesma
tela**.

O segundo leitor, sem contexto e sem saber o que se esperava, chegou à mesma
conclusão pelo argumento mais forte que eu não havia usado: o rótulo `Allin 40`
casa com o badge do **BB** (40) e não com o do BTN (38.9), logo o painel é do BB.

O erro foi **contar inserções em vez de ler a captura** — e ele sobreviveu a
duas etapas porque a conclusão (rejeitar) parecia conservadora. Conservadorismo
mal fundamentado ainda é fundamento errado: custou um par inteiro.

A ambiguidade **real** de `image7.png` é a mesma dos pares 5 e 6 — a qual passe
de nodelock pertence —, e essa continua declarada, sem desqualificar o par.

## 2. Par 7

| | ChipEV (nó 13, `image7.png`) | ICMev (nó 42, `image12.png`) |
| --- | --- | --- |
| Fold | 35.7% · 268.83 combos | 42.6% |
| Call | 57.4% · 432.38 | 48.1% |
| Raise menor | `Raise 5 (50%)` · 6.8% · 51.52 | `raises 5.06bb` · 9.3% |
| All-in | `Allin 40 (497%)` · 0% · 0 | `raises 37.88bb` · 0.0% |

Classes correspondem; sizings não. Dois achados:

**O quase-encontro.** `Raise 5` contra `raises 5.06bb` diverge 0.06 contra uma
folga de 0.0506 — **reprova por 0.0094**. Alargar a tolerância para acomodar
seria ajustar o instrumento ao resultado, a mesma falha que a Etapa B recusou
quando um teste sintético quebrou. A folga foi declarada antes deste par existir
e fica. O valor está registrado em `QUASE_ENCONTRO_DE_SIZING_PAR_7` para que a
decisão seja auditável.

**A soma 99.9%.** Primeira ocorrência **abaixo** de 100 em sete pares; as
anteriores eram 100.0 ou 100.1. Confirma que o arredondamento de exibição da
fonte desvia para os dois lados — e que uma tolerância simétrica era a escolha
certa, não uma folga conveniente num único sentido.

## 3. Uma captura que verifica quatro

`image59.png` (nó 17) é diferente de todas as outras: inclui a **barra de
navegação do GTO Wizard**, ou seja, a árvore inteira, coluna por coluna.

```
BB vs. BTN   Stack 40bb   Pot 5.63bb
FLOP 5.63  K♦ J♣ T♠
BB   40    Check | Bet 1.4 (25%)                             -> par 1
BTN  40    Check | Bet 1.1 (20%)                             -> nodelock
BB   40    Fold | Call | Raise 5 (50%) | Allin 40 (497%)     -> par 7
BTN  38.9  Fold | Call | Raise 12.8 (50%) | Allin 40 (224%)  -> par 5
TURN 15.63  2♦
BB   35    Check | Bet 7.8 (50%)
BTN  35    Check | Bet 3.1 | Bet 7.8 | Bet 11.7 | Allin 35
```

Os rótulos batem **dígito a dígito** com o que cada captura mostra isoladamente,
sizings e percentuais entre parênteses incluídos. É verificação cruzada por
fonte independente de quatro transcrições feitas em etapas diferentes.

**Ela converte um passo inferido em passo lido.** A cadeia da Etapa C precisava
calcular `15.63 × 50% = 7.815 ≈ 7.80` para ligar o par 6 ao par 3. Aqui o ramo
`Bet 7.8 (50%)` está na tela, medido em 57.6% com 28.48 combos. A ligação deixou
de ser aritmética minha.

**E mostra o nodelock em ação.** Este nó do turn tem o mesmo pote (15.63), as
mesmas stacks (35/35), as mesmas equidades (48.63/51.37) e os mesmos combos
(49.5 e 252) que o par 6 — com **menu de sizings diferente**: aqui
`Check | Bet 7.8 (50%)`, lá `Check | Bet 3.9 (25%) | Allin 35 (224%)`. É o mesmo
nó resolvido sob locks distintos: a demonstração concreta do que a ambiguidade
de atribuição adverte, agora com números.

## 4. O glifo, encerrado por observação

Desde a Etapa A este trabalho afirma que a marca antes dos campos do painel é
indicador de direção, não sinal negativo. A prova era sempre **indireta** —
equidade não é negativa, equidades complementares somam 100, combos não são
negativos. Bons argumentos, todos aritméticos.

`image59.png` está em resolução maior. Perguntado campo a campo, sem saber o que
se esperava, o leitor cego respondeu:

> **NÃO.** Os oito símbolos **não são todos iguais entre si**: quatro apontam
> para cima e quatro para baixo, e a direção acompanha a cor. Nenhum deles me
> pareceu um traço de sinal negativo.

E as direções são **anti-correlacionadas** entre os dois jogadores, campo a
campo: onde o BB sobe, o BTN desce. É comportamento de comparador entre as duas
mãos.

**Ressalva declarada:** o leitor deu confiança alta em seis dos oito e média em
dois — os campos `Combos`, cujo glifo é menor. O que este registro sustenta é a
**não-uniformidade** e as **cores**, ambas afirmadas com segurança. E a
não-uniformidade sozinha basta: um sinal de menos não aponta para cima.

## 5. O que resta

Sete pares convertidos. Dos nós marcados `compare with` pelo autor, o único
ainda sem par é o **47** (ICMev, `IP reaction river after OOP b50`) — e não por
descuido: o par 4 mostra que a árvore ChipEV daquele river oferece 25% e all-in,
sem 50%. O ramo não existe daquele lado.

Continua não autorizando calibração. Consistência interna, por mais densa que
fique, não é reprodutibilidade: são transcrições de captura de terceiro, e
versão de solver, build e e-Nash seguem ausentes de todas elas.
