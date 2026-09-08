---
id: registro-2026-09-08-contraste-icmev-chipev-executado
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-contraste"
criado_em: 2026-09-08T17:10:00-03:00
atualizado_em: 2026-09-08T18:05:00-03:00
classes: [interno, medido, pmev, icm, contraste]
caminhos:
  - frontend/src/tests/simulator/contrasteIcmevChipev.test.ts
  - reports/cwv/latest_lighthouse_production.json
revisoes_de_ancora:
- registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    Aquele registro ancora o certificado justamente para que ele VIAJE -- deixe
    de ser artefato local e passe a ser versionado. Esta atualizacao e o
    comportamento que ele prescreve, nao uma excecao a ele: toquei frontend/, o
    fingerprint invalidou, recertifiquei. Os limiares seguem os mesmos e o
    veredito e o mesmo: TBT 0 ms, LCP 377.72 ms, CLS 0, score 1.0, exit 0.
- registro: registro-2026-09-07-certificacao-tbt-e-zero-warnings-cwv
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    Aquele registro ancora o certificado pelo TBT zerado e pela ausencia de
    warnings. As duas propriedades seguem verdadeiras nesta recertificacao --
    TBT 0 ms e o gate fechando com zero erros e zero warnings nas cinco fases.
    Renovar o fingerprint apos tocar frontend/ preserva a certificacao; nao a
    contradiz.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Executar o contraste ICMev x ChipEV -- confrontar o que solveIcmDistortion
  preve com o que os sete pares da Aula 1.2 medem -- depois de duas sessoes
  consecutivas que so prepararam terreno.
classe_tarefa: contraste-empirico
criterio_de_aceite:
  - O contraste e produzido, e nao um relatorio sobre as condicoes dele.
  - A grandeza de RP usada e declarada, sem decidir o que cabe ao Tier 0.
  - Nada altera constante de motor com base em pares irreproduziveis.
verificado:
  - >-
    O CONTRASTE FOI EXECUTADO. Os sete pares sustentam 17 comparacoes entre
    previsao e medicao, agregadas por CLASSE de acao. O modelo acerta a DIRECAO
    da distorcao em 15 das 17; erro absoluto medio 4.77pp, mediano 3.80pp,
    maximo 10.55pp. As duas divergencias de sinal sao ambas em `raise` com
    frequencia abaixo de 7%.
  - >-
    GRANDEZA DECLARADA: RISK_PREMIUM_DECLARADO da fonte (BTN 21.4 / BB 12.9),
    grandeza A -- (BF-1)/(BF+1). A escolha entre as duas grandezas de RP segue
    ABERTA com o Tier 0; este contraste declara qual usa em vez de esperar por
    ela, conforme o handoff.
  - >-
    ACHADO 1 -- CARDINALIDADE UNILATERAL. O ICMev abre mais ramos agressivos que
    o ChipEV em 2 dos 7 pares; o ChipEV abre mais em ZERO. O ramo excedente e
    sempre INTERMEDIARIO e carrega massa nao-residual: 42.8% no par do turn (o
    maior peso do no inteiro) e 22.5% no do river.
  - >-
    ACHADO 2 -- ENCOLHIMENTO DE SIZING SOB ICM. Nos 3 nos de APOSTA LIVRE
    informativos, a fracao da massa agressiva no MAIOR ramo cai em 3 de 3, e o
    sizing medio ponderado normalizado cai em 3 de 3. Zero contraexemplos.
    Quedas de fracao no maior ramo: -4.9pp, -48.5pp, -33.7pp. A contagem de 4
    que este registro trazia antes da secao 6 incluia um no de RAISE (-72.7pp
    sobre massa de 0.9%), e o recorte correto e por classe -- ver achado 6.
  - >-
    MECANISMO, dado pelo Tier 0 e coerente com a medicao: quanto maior o ICM,
    maior o preco MONETARIO da ficha; a mesma ameaca em dolares e exercida com
    menos fichas, entao o sizing que o ChipEV faz grande o ICMev faz menor.
    Escalona. O escorrimento e GRADUAL -- altos escorrem para medios, medios
    para baixos, um posto por vez.
  - >-
    A GRADUALIDADE FOI MEDIDA, e refutou a metrica que eu ia usar. Dominancia
    estocastica de primeira ordem seria forte DEMAIS: ela falha no par do turn,
    onde o ramo MENOR tambem perde massa (44.3% -> 19.0% da massa agressiva)
    porque a massa subiu meio posto ate o intermediario novo em vez de descer
    ate a base. A metrica que resiste e o medio ponderado NORMALIZADO pelo
    maior ramo do proprio cenario -- imune ao pote e a stack menores que o HRC
    modela.
  - >-
    ACHADO 3 -- ASSIMETRIA ESTRUTURAL DO MODELO. O lado agressor desloca por
    CONSTANTE ADITIVA: delta = sign(dRP) * (|dRP|/10)^b * (-15.5), que nao
    contem a frequencia de entrada. O lado defensor desloca por fator
    MULTIPLICATIVO (foldShift = oop_fold * pressure * 0.015). Medido contra a
    evidencia, o lado que escala com a entrada erra menos que o de deslocamento
    constante.
  - >-
    LIMITE DA CONSTANCIA, medido: `rawBetLarge = Math.max(0, ...)` satura, e
    abaixo de ~10.5pp de bet_large o deslocamento deixa de ser constante. O ramo
    PEQUENO segue deslocando, e por isso o total nao para em -ip_bet_large --
    e -13.06pp e nao -10pp na entrada testada. Eu havia suposto -10; a medicao
    corrigiu.
  - >-
    ACHADO 4 -- O DEFEITO MAIS DURO. `signDelta = Math.sign(deltaRp)` em
    nashSolver.ts:127 faz o encolhimento de sizing depender do SINAL da
    diferenca de RP: com dRP positivo o modelo encolhe (fracao no maior ramo
    -10.1pp, certo); com dRP negativo ele AUMENTA (+5.2pp, errado). Sob o RP
    declarado, TRES dos quatro nos de aposta tem dRP negativo, e neles a
    evidencia encolhe do mesmo jeito (-48.5pp e -33.7pp). O encolhimento
    acompanha o REGIME, nao o sinal -- coerente com o mecanismo, que depende do
    preco da ficha para QUEM AGE.
  - >-
    ACHADO 5 -- LIMITE DE FORMA. ChipEvFreqs expoe exatamente DOIS slots de
    aposta; a evidencia chega a tres ramos. O terceiro nao tem destino no
    modelo, e isso nao e questao de calibrar constante.
  - >-
    Os achados estao fixados como CONTRATO em
    frontend/src/tests/simulator/contrasteIcmevChipev.test.ts (A1 a A9), 23
    testes. Suite frontend 34 suites / 264 aprovados / zero erros / zero
    warnings -- eram 33/241 antes deste arquivo, medido por stash contra HEAD.
    typecheck exit 0.
  - >-
    EMENDA NA SECAO 6, mesmo dia: o DIAGNOSTICO CAUSAL do achado 4 estava
    errado e foi corrigido apos arbitragem do Tier 0. A medicao permanece --
    o modelo inverte o encolhimento com o sinal de deltaRp, e a evidencia nao.
    O que muda e a causa: deltaRp e LEGITIMO para o eixo de DISTANCIA (quanto
    maior a diferenca, mais agressivo pode ser o RP menor), e o defeito e um
    unico parametro carregar tambem o eixo da VALORACAO ASSIMETRICA, que nao
    inverte com o sinal.
  - >-
    O ChipEV NAO TEM o fenomeno da valoracao assimetrica -- nao o tem menor.
    Ficha vale ficha para qualquer stack, e por isso reduzir a 40/40 efetivas
    nao perde nada, o que a fixture grava em STACKS_EFETIVOS_FLOP. O contraste
    neste eixo e entre AUSENCIA e PRESENCA.
  - >-
    ACHADO 6, NOVO -- O ENCOLHIMENTO E DE `bet`, NAO DE `raise`. Em aposta
    livre a direcao e unilateral (3 de 3 descendo); em aumento e MISTA (2 sobem,
    1 desce). O tamanho de um raise esta ancorado na aposta que enfrenta.
  - >-
    DEFEITO NO PROPRIO TESTE, encontrado e corrigido: o A6 original filtrava por
    massa e fracao nao-nula, e os nos de raise caiam fora POR ACIDENTE (fracao 0
    nos dois regimes). Ele passava escondendo que a generalizacao era ampla
    demais. O recorte agora e por CLASSE, por desenho.
  - >-
    ACHADO 7 -- "NAO CRESCER O POTE" (principio do Tier 0). O lado de RP maior
    reage menos de raise pos-flop, para nao inflar um pote que sera disputado
    com fichas mais caras enquanto a equidade segue aberta. Medido em pp
    absolutos: RP menor +2.5pp; RP maior -1.2pp (ABANDONO, -92%) e +0.2pp
    (residuo). O caso robusto e o abandono, e ele ocorre no unico no em que o
    RP maior enfrenta check-raise -- risco maximo de crescimento de pote.
  - >-
    COROLARIO MEDIDO: o sizing minimo (~20% do pote) salta de 8.7% para 67.5%
    sob ICM, fator 7.8x. Quem executa e o BTN -- RP MAIOR (21.4) e stack MENOR
    (37.88).
  - >-
    ACHADO 8 -- A MESA E UM ORGANISMO, e isso RESOLVE a divergencia que eu havia
    registrado como aberta. Eu lera a ausencia de discriminante por lado como
    fraqueza da amostra; ela e o RESULTADO. O Tier 0 fechou: NENHUM dos dois
    quer crescer o pote, porque ha stacks menores a cairem e, enquanto caem, os
    dois ganham equidade de premiacao de graca. Inflar o pote entre si arrisca
    o que a sobrevivencia alheia entregaria sem risco -- AMBAS as stacks se
    machucam. Medido em MESA_COMPLETA_NO_OPEN: tres assentos abaixo de metade
    da efetiva (UTG 9.25, MP2 6.88, SB 12.73), com BU 39.88 e BB 53.88 acima de
    todos. Nao ha discriminante por lado porque o incentivo nao vem da relacao
    entre os dois: vem da MESA COMPLETA.
  - >-
    E ISSO FECHA O CONTRASTE INTEIRO. A mesa completa e exatamente o que o GTO
    Wizard IGNORA e o HRC carrega -- a fixture o diz na nota de
    MESA_COMPLETA_NO_OPEN. Mais ramos, sizing menor e menos raise decorrem todos
    da mesma causa: ha stacks fora do pote cuja eliminacao beneficia os dois que
    estao dentro dele.
nao_verificado:
  - >-
    NADA FOI CORRIGIDO NO MOTOR. O achado 4 aponta defeito de modelagem em
    nashSolver.ts:127, mas alterar constante ou estrutura de solveIcmDistortion
    com base em sete pares IRREPRODUZIVEIS seria exatamente o que a fixture
    proibe em seu proprio cabecalho. A correcao e decisao do Tier 0.
  - >-
    countReproduciblePairs(AULA_1_2_PAIRS) segue 0 de 7 por `provenance`
    ausente. E o valor ESPERADO e nao foi tocado. Enquanto ele for 0, este
    contraste mede DISTANCIA entre modelo e evidencia, e nao autoriza
    calibracao.
  - >-
    O RP declarado (21.4 / 12.9) e do spot-ancora pre-flop e foi aplicado a
    todas as streets. E aproximacao: o RP evolui street a street conforme as
    stacks mudam. Nao recalculei RP por street -- exigiria o ICM dos nove
    assentos em cada no, e o recorte das capturas do HRC nao o expoe.
  - >-
    A atribuicao de QUEM AGE em cada par foi lida dos nodeLabels da fixture e
    esta declarada na constante AGENTE do teste. Nao foi derivada da arvore de
    acoes.
  - >-
    O ARQUIVO DE TESTE NAO PASSA POR `tsc`. tsconfig.json:39 exclui
    `**/*.test.ts`, e ZERO dos 34 arquivos de teste do projeto e coberto pelo
    typecheck -- e o padrao declarado, nao regressao desta sessao. A checagem
    ali e a do transpilador do jest (SWC), que nao verifica tipos. Anotado como
    achado periferico; NAO corrigido, por estar fora do foco declarado.
  - >-
    NAO investiguei os dois AXE_INCOMPLETE herdados de 312ddba3, nem os sete
    findings do Astra (B05, B07, B08, B09, F03, F05, F06). Seguem abertos.
---

# Contraste ICMev × ChipEV — executado

**Sessão:** `claude-opus5-site-2026-09-08-contraste` · **Regime:** `assistida`

---

## 1. O que mudou em relação às duas sessões anteriores

Elas prepararam terreno. **Esta comparou.** O entregável é o contraste, e ele
está em [contrasteIcmevChipev.test.ts](../frontend/src/tests/simulator/contrasteIcmevChipev.test.ts) —
17 testes que fixam o que foi medido, não uma prosa sobre as condições da medida.

Orçamento declarado antes da primeira linha: **≥ 80% ao contraste, 0% a
periferia opcional.** Cumprido — o único arquivo alterado é o teste novo, e o
único achado periférico (o `tsc` que não cobre testes) foi **anotado e não
corrigido**.

---

## 2. O contraste, em uma tabela

Dezessete comparações, agregadas por classe de ação — nunca por sizing, porque
as árvores dos dois motores não coincidem.

| | Direção | Magnitude |
| :--- | :--- | :--- |
| Acerto | **15 / 17** | erro médio **4.77pp** |
| Pior caso | 2 erros, ambos em `raise` < 7% | **10.55pp** |
| Lado defensor | escala com a entrada | erra **menos** |
| Lado agressor | deslocamento constante | erra **mais** |

**O modelo acerta a direção e erra a escala.** E os dois fatos têm a mesma
causa, visível na álgebra: o defensor desloca por fator multiplicativo, o
agressor por constante aditiva.

---

## 3. O que a evidência mostra e o modelo não tem

### 3.1 O ICMev abre ramos que o ChipEV não abre — 2 a 0

Nunca o contrário. E o ramo excedente é sempre **intermediário**, carregando
massa que não é resíduo: **42.8%** no turn, o maior peso do nó inteiro.

Isto não era ruído de leitura a ser agregado. Era dado do contraste, e foi o
Tier 0 quem o apontou como tal.

### 3.2 Sob ICM, o sizing encolhe — 4 de 4, sem contraexemplo

**O mecanismo:** quanto maior o ICM, maior o preço monetário da ficha. A mesma
ameaça em dólares se exerce com menos fichas. O sizing que o ChipEV precisa
fazer grande, o ICMev faz menor — **escalona**.

E o escorrimento é **gradual**: altos escorrem para médios, médios para baixos,
um posto por vez. Foi essa gradualidade que **refutou a métrica que eu ia usar**
— dominância estocástica de primeira ordem falha no par do turn, porque lá o
ramo *menor* também perde massa: ela subiu meio posto até o intermediário novo,
em vez de descer até a base.

A métrica que resiste é o médio ponderado **normalizado pelo maior ramo do
próprio cenário** — imune ao pote e à stack menores que o HRC modela.

---

## 4. O defeito que o contraste localizou

`signDelta = Math.sign(deltaRp)` em `nashSolver.ts:127` faz o encolhimento de
sizing depender do **sinal da diferença de RP entre os dois jogadores**:

| ΔRP | modelo | evidência |
| :--- | :--- | :--- |
| **+8.5** | −10.1pp — encolhe | −4.9pp ✓ |
| **−8.5** | **+5.2pp — aumenta** | −48.5pp e −33.7pp ✗ |

Sob o RP declarado, **três dos quatro nós de aposta têm ΔRP negativo**. Neles o
modelo prevê a direção oposta à medida.

A causa é conceitual e o mecanismo a explica: o preço da ficha sobe para **quem
age**, conforme o RP *absoluto* dele. Não é uma função da diferença.

**Nada foi corrigido.** Sete pares irreprodutíveis não autorizam mexer em motor
— a própria fixture o diz no cabeçalho. O achado fica nomeado e localizado; a
decisão é do Tier 0.

---

## 5. O que este contraste não é

Não é calibração. `countReproduciblePairs` segue **0 de 7**, e enquanto for, o
que se mede é **distância entre modelo e evidência** — não ajuste de constante.

Fechar essa distância exige pares reprodutíveis, e isso é recaptura de fonte,
não trabalho de código.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** executar o contraste que duas sessões adiaram, fixar como
contrato as cinco propriedades que ele revelou, e nomear o defeito de modelagem
que ele localizou — sem tocar no motor que sete pares irreprodutíveis não
autorizam alterar.

---

## 6. Emenda — o diagnóstico causal do §4 estava errado

**Acrescentada no mesmo dia, após arbitragem do Tier 0.** O corpo acima não se
reescreve; o que ele afirma de **medição** segue válido, e o que ele afirma de
**causa** é corrigido aqui.

### 6.1 O que eu disse, e por que estava errado

Escrevi que `signDelta` *"está governando uma grandeza que deveria ser governada
pelo RP absoluto de quem age"*. **Não é isso.**

O Tier 0 separou dois eixos que eu havia fundido:

| Eixo | O que é | `deltaRp` serve? |
| :--- | :--- | :--- |
| **Distância** | quanto maior a diferença de RP, mais agressivo pode ser o RP menor e mais seguro deve ser o RP maior | **Sim** — e inverter com o sinal é o comportamento *certo* |
| **Valoração assimétrica** | quando a stack maior aposta, aquelas fichas valem menos *para ela* do que valerão para a stack menor ao chegarem ao pote | **Não** — não inverte com o sinal |

**O defeito não é `deltaRp` existir.** É um único parâmetro carregar os dois
eixos: fundidos num fator só, um arrasta o outro.

### 6.2 O ChipEV não tem o fenômeno — não o tem menor

A assimetria de valoração **não existe** no ChipEV: ficha vale ficha para
qualquer stack. É por isso que o GTO Wizard reduz o spot a `40/40` efetivas sem
perder nada, e é por isso que a fixture grava exatamente isso em
`STACKS_EFETIVOS_FLOP`, enquanto o HRC carrega `52.88/37.88` porque **precisa**
das stacks reais para o ICM.

O contraste, neste eixo, é entre **ausência e presença** — não entre dois
tamanhos do mesmo efeito.

### 6.3 O que a medição sustenta, e o que ela não sustenta

**Sustenta.** Na fração da massa no maior ramo, a stack maior apostando encolhe
7–10× mais que a menor: `−48.5pp` e `−33.7pp` contra `−4.9pp`.

**Não sustenta.** No médio normalizado a separação some (`−55.9%` e `−12.9%`
contra `−51.0%`), e há **um único** nó com a stack menor apostando. Uma origem
só não é recorrência — a mesma régua do portão de suficiência. O mecanismo tem
**evidência a favor**, e não é fato medido.

### 6.4 Achado novo — o encolhimento é de `bet`, não de `raise`

Separando por classe de ação:

| classe | nós informativos | direção |
| :--- | :--- | :--- |
| **aposta livre** | 3 | **unilateral** — 3 de 3 descendo |
| **aumento** | 3 | **mista** — 2 sobem, 1 desce |

Faz sentido: o tamanho de um raise está ancorado na aposta que enfrenta; o de
uma bet é livre.

**E isso expôs um defeito no meu próprio teste.** O A6 original filtrava por
massa e fração não-nula, e os nós de raise caíam fora **por acidente** — tinham
fração `0` nos dois regimes. O teste passava sem que ninguém soubesse que a
generalização era ampla demais. Agora o recorte é por classe, **por desenho**.

Também escrevi, com dois dos três nós de raise em vista, que neles o sizing
*sobe*. O terceiro desmentiu. Ficou a afirmação fraca e verdadeira: **não há
direção unilateral nos raises** — e é justamente por isso que misturar as classes
diluiria um efeito consistente num agregado sem direção.

### 6.5 O que muda no código

Nada de motor, pela mesma razão do §5. Mudam A6 (recorte por classe), A7
(diagnóstico correto: dois eixos num parâmetro) e entra A8. **19 testes.**

---

## 7. "Não crescer o pote" — o princípio que unifica

**Acrescentado após novo aporte de domínio do Tier 0:** quem tem RP maior reage
menos de raise pós-flop, para não inflar o pote — sobretudo com a equidade ainda
aberta no turn e no river, onde o pote maior será disputado com fichas que valem
mais.

### 7.1 A reação de raise, medida

Em pontos percentuais **absolutos** — a leitura honesta quando as bases são de 1%:

| quem age | RP | raise ChipEV → ICMev | |
| :--- | :--- | :--- | :--- |
| BB | menor (12.9) | 6.8 → 9.3 | **+2.5pp** |
| BTN | **maior** (21.4) | 1.3 → **0.1** | **−1.2pp**, abandono |
| BTN | maior (21.4) | 0.9 → 1.1 | +0.2pp, resíduo |

**O caso forte é o abandono.** O único nó em que o RP maior enfrenta um
check-raise — máximo risco de crescimento de pote — é o único em que a agressão
praticamente desaparece: **−92%**.

**Amostra declarada:** um nó de um lado, dois do outro, um deles em resíduo. O
contrato fixa o **abandono**, que é robusto, e **não** a regra geral, que esta
amostra não sustenta.

### 7.2 O corolário do sizing mínimo

O mesmo princípio prevê que quem é avesso a inflar o pote, **quando aposta**, use
o menor sizing em alta frequência. Medido no nó de cbet do flop:

> sizing mínimo (~20% do pote): **8.7% → 67.5%**, fator **7.8×**

### 7.3 A mesa é um organismo — e isso resolve a divergência

Eu havia registrado como **divergência não resolvida** o fato de o executor ser o
BTN, que tem o RP *maior*, quando a conduta fora atribuída ao lado de RP menor. E
escrevi que *"sete pares não separam 'é o RP maior' de 'é quem enfrenta oponente
que não aumenta'"* — lendo a ausência de discriminante como **fraqueza da
amostra**.

**Ela é o resultado.** O Tier 0 fechou a questão: *nenhum dos dois quer crescer o
pote*, porque a mesa tem stacks menores prestes a cair. Enquanto elas caem, tanto
o BU quanto o BB ganham equidade de premiação **de graça**; inflar o pote entre si
arrisca exatamente o que a sobrevivência alheia entregaria sem risco. **Ambas as
stacks se machucam.**

Medido em `MESA_COMPLETA_NO_OPEN`: três assentos abaixo de metade da efetiva
(`UTG 9.25`, `MP2 6.88`, `SB 12.73`), e os dois protagonistas (`BU 39.88`,
`BB 53.88`) acima de todos eles.

Não há discriminante por lado porque **o incentivo não vem da relação entre os
dois — vem da mesa completa**. É por isso que o encolhimento aparece em 3 de 3
nós de aposta livre, com o BB agindo em dois e o BTN em um, sem separar por lado.

### 7.4 E isso fecha o contraste inteiro

Essa mesa completa é precisamente **o que o GTO Wizard ignora e o HRC carrega** —
a fixture o diz literalmente na nota de `MESA_COMPLETA_NO_OPEN`.

Mais ramos (§3.1), sizing menor (§3.2) e menos raise (§7.1) **decorrem todos da
mesma causa**: há stacks fora do pote cuja eliminação beneficia os dois que estão
dentro dele. O ChipEV não as vê; o ICMev as carrega.

### 7.5 Estado do contrato

**A1 a A9, 23 testes.**
