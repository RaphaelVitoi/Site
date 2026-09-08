---
id: registro-2026-09-08-massa-de-fichas-e-as-duas-grandezas-de-rp
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-pmev"
criado_em: 2026-09-08T10:40:00-03:00
atualizado_em: 2026-09-08T10:40:00-03:00
classes: [interno, medido, correcao, pmev, icm]
caminhos:
  - frontend/src/lib/perspectiva.ts
  - frontend/src/lib/rpDeriver.ts
  - frontend/src/lib/icmMatrix.ts
  - frontend/src/tests/simulator/perspectiva.test.ts
  - frontend/src/tests/simulator/massaDeFichas.test.ts
  - engine/icm_matrix.py
  - engine/vitoi_perspective_engine.py
revisoes_de_ancora:
- registro: plan-pmev-contract-port-2026-09-01
  caminhos: [engine/icm_matrix.py]
  parecer: >-
    Aquele plano ancora icm_matrix.py com um item explicito na secao de trabalho:
    "Document that the BF/RP result is a pairwise, symmetric all-in baseline". A
    alteracao deste commit CUMPRE esse item em vez de contraria-lo -- o comentario
    novo em icm_matrix.py:124 declara que (BF-1)/(BF+1) e exata na convencao
    req = a + RP*(1-a) sob all-in EVEN MONEY, que e precisamente a premissa
    estrutural de baseline pairwise simetrica que o plano mandava documentar.
    Nenhuma formula, assinatura ou valor de retorno mudou; a alteracao e um
    comentario.
- registro: handoff-2026-09-07-abertura-em-pmev-com-o-terreno-medido
  caminhos:
  - frontend/src/lib/icmMatrix.ts
  - frontend/src/lib/perspectiva.ts
  - frontend/src/lib/rpDeriver.ts
  parecer: >-
    Aquele handoff ancora os tres arquivos e emite uma ordem literal: "Decida
    explicitamente se neutraliza, declara como limite, ou corrige B03 e B06/F07
    antes de comparar -- e diga qual escolheu". Este commit E a execucao dessa
    ordem, e as duas decisoes estao ditas: B03 CORRIGIDO (defeito aritmetico, com o
    proprio codigo ja concordando com a convencao no ramo `lose`), B06/F07
    DECLARADO COMO LIMITE (a escolha de formula desloca numeros do produto e o
    handoff a marcou como dominio do Tier 0). O handoff tambem afirmava que as duas
    formulas de RP sao "duas grandezas sob um rotulo, nao um bug de copia" --
    correto quanto a nao ser copia, e REFINADO aqui por medicao: as duas nao tem o
    mesmo estatuto, porque a grandeza A reproduz o RP exato no all-in even money e
    a B nao e exata em convencao alguma. A afirmacao original nao e revogada; ganha
    a metade que faltava.
- registro: validacao-2026-09-07-findings-do-astra-contra-o-codigo
  caminhos:
  - frontend/src/lib/perspectiva.ts
  - frontend/src/lib/rpDeriver.ts
  parecer: >-
    Aquela validacao registra B03, B06 e F07 como ABERTOS, com B03 reproduzido em
    "somas 105 / 110 / 108 -- identicas as da auditoria". O ESTADO MUDA com este
    commit e a mudanca precisa constar: B03 passa a FECHADO, e as somas 105/110/108
    deixam de ser reproduziveis porque os tres ramos passaram a valer
    soma(stacks)+potSize. B06 e F07 permanecem ABERTOS -- nenhuma formula foi
    trocada --, mas deixam de ser findings sem instrumento: os quatro sitios agora
    declaram a que grandeza pertencem e sob que premissa valem, e o erro da
    grandeza B esta quantificado (ate -11.11 pontos percentuais de equidade em
    BF=5). A decisao entre nomea-las separadamente ou aposentar uma segue com o
    Tier 0, como aquela validacao ja apontava.
- registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    Aquele registro ancora o artefato por duas propriedades: que ele VIAJA no git
    (o .gitignore o excluia, e cada sessao recertificava so para si) e que
    certificava TBT 0 ms com fingerprint 1c8c2fc656b846ef. A primeira propriedade
    esta INTACTA -- o artefato segue versionado e entra em stage sozinho, que era o
    ponto daquele registro. A segunda mudou POR DESIGN: tocar frontend/ invalida o
    fingerprint, e a recertificacao e o mecanismo funcionando, nao falhando. Novo
    fingerprint d85125e6a5528d32, TBT 0 ms, LCP 383.76 ms, CLS 0, score 1.0 --
    o TBT certificado, que e a propriedade substantiva, permanece 0.
- registro: registro-2026-09-07-certificacao-tbt-e-zero-warnings-cwv
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    Aquele registro certificou TBT 0 ms, LCP 373.25 ms, CLS 0 e score 1.0 sob o
    fingerprint 42b84cd618ff110f. Este commit tocou frontend/src/lib e
    frontend/src/tests, o que expirou aquele artefato por
    LIGHTHOUSE_FINGERPRINT_MISMATCH -- comportamento correto do vinculo. Reauditado
    nesta data em Chrome isolado, exit 0: TBT 0 ms, LCP 383.76 ms, CLS 0, score
    1.0, fingerprint d85125e6a5528d32. A certificacao nao foi perdida nem herdada:
    foi refeita, e as 5 fases do portao voltaram a 0 erros e 0 warnings.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Fechar o B03 corrigindo a massa de fichas dos ramos terminais, e declarar o
  B06/F07 como limite medido em vez de escolher por conta propria entre as duas
  grandezas de RP -- o contraste ICMev x ChipEV nao pode comparar numeros
  produzidos por uma modelagem que cria fichas.
classe_tarefa: correcao-de-modelagem-e-declaracao-de-limite
criterio_de_aceite:
  - Os tres ramos terminais tem massa identica, fixada por teste de contrato.
  - Nenhum numero de RP e trocado sem decisao do Tier 0; o limite fica declarado.
  - A suite permanece verde e o teorema D5 continua testando o que declara testar.
verificado:
  - >-
    B03 REPRODUZIDO E QUANTIFICADO. potSize e dinheiro ja destacado dos stacks --
    perspectiva.ts:565 le a pot odds crua como heroCost/(potSize+heroCost), o que
    so fecha sob essa leitura. Logo todo ramo terminal vale soma(stacks)+potSize.
    Medido: o ramo `lose` cumpria isso EXATAMENTE nos tres cenarios; o `win` errava
    por -heroCost e o `fold` por -investidoAcumulado. Nao era desvio difuso: era o
    vencedor nao recebendo de volta o proprio investimento.
  - >-
    EFEITO MEDIDO DO B03 SOBRE O CONTRASTE -- a lacuna que o handoff de 07/09
    declarou nao medida. deltaLose ficava intacto e deltaWin subestimado, inflando
    o Bubble Factor em +75.8%, +156.1% e +78.3% nos tres cenarios; o RP (grandeza A)
    saltava de 20.31/5.72/9.39% para 45.26/48.35/36.57%. O erro tem sinal fixo:
    SEMPRE exagera o premio de risco.
  - >-
    DEFEITO ADICIONAL NAO PREVISTO NO HANDOFF: com stack menor que o custo, o
    clamp em zero do lado do hero somado ao custo CRU do lado do vilao fabricava
    (custo - stack) fichas no ramo `lose`. Corrigido pelo mesmo custoEfetivo.
  - >-
    O TESTE D5 CANONIZAVA O DEFEITO. O cenario `potSize: 1.01, heroCost: 1` vinha
    anotado como "arrisca 1 para ganhar 0.01", mas 1.01 contra 1 e aposta even
    money -- o "0.01" era o output do B03. Medido no cenario original: o hero
    ganhava 0.01 ficha em vez de 1.01, deltaWin colapsava a zero e o BF era
    literalmente Infinity. O teorema "Sem Hard-cap" atestava o clamp que continha
    o defeito. Reconstruido com pressao estrutural real (pot 1, custo 19; pot odds
    0.95; BF 23.1; threshEq 0.9311), preservando as duas asercoes originais.
  - >-
    B06/F07 REENQUADRADO POR ALGEBRA, e o reenquadramento do handoff estava
    incompleto. A equidade requerida exata sob ICM e BF*a/(BF*a + 1 - a). Na
    convencao req = a + RP*(1-a), a grandeza A -- (BF-1)/(BF+1) -- REPRODUZ o RP
    exato para TODO BF no all-in even money: nao e arbitraria, e derivavel. A
    grandeza B -- (BF-1)/BF -- nao e exata em nenhuma convencao: coincide so em
    BF=2 e diverge ate -11.11 pontos percentuais de equidade em BF=5, a=0.5,
    sempre subestimando o preco quando o bubble factor e alto.
  - >-
    A grandeza B e a que rpDeriver.ts:11 se autodeclarava "logica BF canonica".
    Duas formulas reivindicavam canonicidade no mesmo repositorio.
  - >-
    Suite frontend 33 suites / 239 aprovados / 0 erros / 0 warnings; tsc --noEmit
    exit 0. Baseline antes da alteracao medido em 36 aprovados nas cinco suites
    tocadas, para que a comparacao nao fosse contra o vazio.
nao_verificado:
  - >-
    NAO troquei nenhuma formula de RP. A escolha entre nomear as duas grandezas
    separadamente ou aposentar uma delas e decisao de dominio do Tier 0, e trocar
    desloca numeros que o produto ja exibe.
  - >-
    NAO reavaliei RP_CEILING_THRESHOLD = 24 (rpDeriver.ts:22). Ele pode ter sido
    calibrado contra o BF inflado pelo B03; com a massa corrigida o RP cai muito, e
    o teto pode ter deixado de disparar. E consequencia direta desta correcao e
    esta declarada, nao medida.
  - >-
    NAO executei o portao de 5 fases nesta medicao: o dev server na :3000 nao
    estava de pe. As fases 1 e 2 nao foram exercidas ate aqui.
  - >-
    NAO abri os sete pares da Aula 1-2 nem toquei o portao de reprodutibilidade;
    countReproduciblePairs segue 0 de 7 por `provenance` ausente, como esperado.
---

# Massa de fichas, e as duas grandezas que se chamam RP

**Sessão:** `claude-opus5-site-2026-09-08-pmev` · **Regime:** `assistida`

---

## 1. O contraste não podia começar

O handoff de 07/09 mandou abrir direto no contraste ICMev × ChipEV e **decidir
explicitamente** se neutraliza, declara como limite, ou corrige o `B03` e o
`B06`/`F07` antes de comparar. As duas decisões estão tomadas, e são diferentes
entre si porque os dois problemas são de naturezas diferentes.

| Achado | Decisão | Por quê |
| :--- | :--- | :--- |
| `B03` — massa de fichas | **corrigido** | defeito aritmético, e o próprio código já concordava com a convenção em 1 dos 3 ramos |
| `B06`/`F07` — duas fórmulas de RP | **declarado como limite** | trocar desloca números que o produto exibe; a escolha é de domínio do Tier 0 |

---

## 2. `B03` — o vencedor não recebia de volta o próprio investimento

O handoff dizia "não conserva massa". Medido, o defeito é mais estreito e mais
específico do que isso, e por isso é corrigível sem arbitrar convenção nenhuma.

`potSize` é dinheiro **já destacado** dos stacks. Não é interpretação: a pot odds
crua em [perspectiva.ts:565](../frontend/src/lib/perspectiva.ts#L565) é
`heroCost / (potSize + heroCost)`, o que só fecha se o pote não contiver o call do
hero e não estiver mais nos stacks. Logo todo ramo terminal vale
`soma(stacks) + potSize` — alguém recolhe o pote.

**O ramo `lose` já cumpria isso exatamente, nos três cenários.** O `win` errava por
`−heroCost`, o `fold` por `−investidoAcumulado`:

| cenário | massa exigida | win | lose | fold |
| :--- | ---: | ---: | ---: | ---: |
| bolha 4-max | 120 | 110 (−10) | **120 (0)** | 116 (−4) |
| bolha 3-max | 118 | 106 (−12) | **118 (0)** | 115 (−3) |
| FT 5-max | 116 | 108 (−8) | **116 (0)** | 114 (−2) |

Não impus uma convenção externa: **apontei que dois ramos discordavam do terceiro.**

### O efeito, que o handoff declarou não medido

`deltaLose` ficava intacto e `deltaWin` subestimado. O Bubble Factor é a razão
entre os dois, então o erro não se cancela — ele se concentra:

| cenário | BF atual | BF corrigido | inflação | RP atual | RP corrigido |
| :--- | ---: | ---: | ---: | ---: | ---: |
| bolha 4-max | 2.653 | 1.510 | **+75.8%** | 45.26% | 20.31% |
| bolha 3-max | 2.872 | 1.121 | **+156.1%** | 48.35% | 5.72% |
| FT 5-max | 2.153 | 1.207 | **+78.3%** | 36.57% | 9.39% |

**O erro tem sinal fixo: sempre exagera o prêmio de risco.** O simulador vinha
ensinando a jogar mais tight do que o ICM manda.

### Um defeito a mais, que o handoff não previa

Com stack menor que o custo, o `Math.max(0, …)` do lado do hero somado ao
`heroCost` **cru** do lado do vilão fabricava `custo − stack` fichas no ramo
`lose` — justamente o ramo que estava correto no caso geral. Resolvido pelo mesmo
`custoEfetivo = min(stack, custo)`.

---

## 3. O teste D5 não media o estado: ele canonizava o defeito

Corrigido o `B03`, um único teste reprovou — o *Teorema D5: Teto do RP Orgânico,
invariância estrutural sob pressão extrema (Sem Hard-cap)*.

A hipótese menos provável é que o portão esteja errado (§1). Medi antes de julgar,
e o resultado é pior do que "teste preso a um ramo do `if`":

O cenário era `potSize: 1.01, heroCost: 1`, anotado no código como
*"Suicidal bet do agressor: arrisca 1 para ganhar 0.01"*. Mas **1.01 contra 1 é
uma aposta even money.** O "0.01" era o **output do `B03`** — o hero ganhava
`0.01` ficha em vez de `1.01` porque o ramo de vitória engolia o próprio call.

Medido no cenário original: `deltaWin` colapsava a zero e o **Bubble Factor era
literalmente `Infinity`**. O teorema "Sem Hard-cap" estava atestando o clamp que
continha o defeito.

**O autor observou o comportamento do bug e o escreveu como se fosse a premissa.**
É a forma agravada do que já estava registrado em
[[teste-que-mede-o-estado-nao-o-contrato]]: o teste não apenas mediu o estado —
ele o narrou como intenção de projeto, e o batizou de teorema.

**Preservei o teorema e reconstruí o cenário por estrutura real:** `potSize: 1`,
`heroCost: 19` — arriscar 19 para ganhar 1, pot odds cruas de `0.95`, `BF` 23.1,
`threshEq` `0.9311`. As duas asserções originais (`> 0.9` e `≤ 0.99`) ficaram
intactas e agora medem o que dizem medir: que o RP sobe organicamente e não é
grampeado.

---

## 4. `B06`/`F07` — uma é derivável, a outra não. Isso muda a decisão

O handoff concluiu que são "duas grandezas sob um rótulo, não um bug de cópia".
Correto quanto a não ser bug de cópia — cada fórmula é consistente entre TS e
Python. **Mas incompleto**: as duas não têm o mesmo estatuto.

A equidade requerida exata sob ICM, arriscando `r` para ganhar `w`, com
`a = r/(r+w)` as pot odds cruas, é `req = BF·a / (BF·a + 1 − a)`.

Na convenção `req = a + RP·(1 − a)`:

| BF | RP exato (a=0.5) | **A** `(BF−1)/(BF+1)` | **B** `(BF−1)/BF` |
| ---: | ---: | ---: | ---: |
| 1.5 | 0.2000 | **0.2000** | 0.3333 |
| 2.0 | 0.3333 | **0.3333** | 0.5000 |
| 3.0 | 0.5000 | **0.5000** | 0.6667 |
| 5.0 | 0.6667 | **0.6667** | 0.8000 |

**A grandeza A reproduz o RP exato para todo BF no all-in even money.** Não é uma
convenção arbitrária — é derivável, sob uma premissa (`a = 0.5`) que é exatamente
a premissa estrutural de uma matriz de all-in.

A grandeza B não é exata em nenhuma convenção. Coincide com a exata apenas em
`BF = 2` e diverge até **−11.11 pontos percentuais** de equidade requerida em
`BF = 5`, `a = 0.5` — **sempre subestimando o preço quando o bubble factor é
alto**, isto é, precisamente onde a bolha aperta.

E a grandeza B é a que [rpDeriver.ts:11](../frontend/src/lib/rpDeriver.ts#L11) se
autodeclarava *"lógica BF canônica"*. Duas fórmulas reivindicavam canonicidade no
mesmo repositório.

### Por que declarei em vez de trocar

Trocar a fórmula desloca números que o produto **já exibe**, e a §8.2 manda
preservar capacidade e pedir autorização antes de qualquer redução material. O
handoff marcou a escolha como domínio do Tier 0 e o Tier 0 não reverteu isso.

O que mudou é a **natureza** da decisão: ela deixou de ser "escolher entre duas
convenções igualmente válidas" e passou a ser informada por um erro medido. Os
quatro sítios agora declaram a que grandeza pertencem e sob que premissa valem —
alteração aditiva, reversível, sem efeito em runtime.

---

## 5. A consequência que fica aberta

`RP_CEILING_THRESHOLD = 24` ([rpDeriver.ts:22](../frontend/src/lib/rpDeriver.ts#L22))
pode ter sido calibrado contra o BF inflado pelo `B03`. Com a massa corrigida o RP
cai muito — nos três cenários medidos, de 36–48% para 6–20% — e **o teto pode ter
deixado de disparar**.

Não medi isso, e não o ajustei: seria otimizar um limiar sem baseline, que é o que
a §10.1 proíbe. Fica declarado como consequência direta desta correção, para quem
abrir a próxima sessão.

---

## 6. Emenda de 2026-09-08 — a pendência acima foi medida e fechada

Por determinação do Tier 0, medi o `RP_CEILING_THRESHOLD`. **A hipótese do §5
estava errada nas duas direções, e a medição achou um defeito maior.**

### 6.1 O threshold não muda. O alimentador é que estava quebrado

`deriveRps` **nunca** passou por `buildSimulatedStacks`: ele monta os
contrafactuais em soma zero (`+effStack` num jogador, `−effStack` no outro), e a
massa já se conservava ali. Medido nos quatro cenários, o RP fica entre `1.31` e
`23.01` — o teto de `24` **nunca dispara**, e encosta sem tocar no caso mais
apertado. Ele está bem calibrado para este caminho.

### 6.2 A fonte única não era única

[rpDeriver.ts:266](../frontend/src/lib/rpDeriver.ts#L266) carregava uma **cópia
manual** da mesma construção defeituosa, e **sobreviveu** à correção de
`perspectiva.ts`. É [[correcao-orfa-nao-alcanca-a-fonte-unica]] na forma inversa:
não foi a correção que ficou órfã — foi a *fonte* que não era única.

### 6.3 O defeito tinha três regimes, não um

Isto é o que a medição de §2 não tinha alcançado, porque olhou só um regime:

| pot odds | ramo `win` sob a construção antiga | RP |
| :--- | :--- | ---: |
| `custo > pote` | o hero **perdia** stack ao vencer | satura em `RP_MAX` = 60 |
| `custo = pote` | `stack − cost + pot` **colapsa em `stack`** — ramo idêntico ao baseline | **0** |
| `custo < pote` | ganho subestimado | inflado |

**O regime do meio é o mais grave, e é o mais comum do jogo.** Numa aposta de
pote — pot odds exatamente `0.5` — o ramo de vitória virava idêntico ao baseline,
o ganho ICM dava zero, `bf` caía para 1 e o RP era forçado a **zero**. O teto de
risco ficava **mudo** justo onde deveria falar. Medido: os dois cenários de pot
odds `0.50` davam `ANTES = 0.0`.

Então a frase do §2 — *"o erro tem sinal fixo: sempre exagera o prêmio de risco"*
— vale para o `perspectiva.ts`, mas **não** para este segundo sítio, onde o erro
ora saturava, ora silenciava. A frase original fica como escrita; a correção está
aqui.

### 6.4 Depois da correção, o teto discrimina

Antes: `60.0` ou `0.0`, saturado ou mudo. Depois: valores intermediários, com o
teto disparando em 3 de 5 cenários realistas. **Passou a ser um alarme, e não um
LED aceso.**

`RP_CEILING_THRESHOLD` permanece `24`. Guard em `massaDeFichas.test.ts` fixa que o
ramo de vitória não pode voltar a colapsar no baseline, para qualquer pot odds.

### 6.5 O que esta emenda mediu e NÃO corrigiu

`oopRp` é **estruturalmente 0** neste caminho, antes e depois. É consistente com a
semântica de pote destacado — o vilão já perdeu aquele dinheiro ao colocá-lo no
pote, logo não perde stack quando o hero vence, e o `loss` dele é zero por
construção. Mas torna `deltaRp = ipRp − 0` degenerado, e o comentário do próprio
código admite que *"o core é single-hero"* enquanto tenta um delta IP↔OOP.

**Não corrigi**: é mudança de modelagem, não aritmética, e está fora do que foi
determinado. Fica medido e declarado.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** corrigir a modelagem que criava fichas nos ramos terminais e
contaminava todo Bubble Factor a jusante, restaurar o teorema D5 a testar o que
declara, e converter o `B06`/`F07` de "duas grandezas sob um rótulo" em uma
decisão medida — sem antecipar a escolha que é do Tier 0.
