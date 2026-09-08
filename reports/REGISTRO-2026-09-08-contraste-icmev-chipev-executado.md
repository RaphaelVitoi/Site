---
id: registro-2026-09-08-contraste-icmev-chipev-executado
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-contraste"
criado_em: 2026-09-08T17:10:00-03:00
atualizado_em: 2026-09-08T17:10:00-03:00
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
    veredito e o mesmo: TBT 0 ms, LCP 387.78 ms, CLS 0, score 1.0, exit 0.
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
    ACHADO 2 -- ENCOLHIMENTO DE SIZING SOB ICM. Nos 4 pares informativos sobre
    sizing, a fracao da massa agressiva no MAIOR ramo cai em 4 de 4, e o sizing
    medio ponderado normalizado cai em 4 de 4. Zero contraexemplos. Quedas de
    fracao no maior ramo: -4.9pp, -48.5pp, -72.7pp, -33.7pp.
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
    Os cinco achados estao fixados como CONTRATO em
    frontend/src/tests/simulator/contrasteIcmevChipev.test.ts (A1 a A7), 17
    testes. Suite frontend 34 suites / 258 aprovados / zero erros / zero
    warnings -- eram 33/241 antes deste arquivo, medido por stash contra HEAD.
    typecheck exit 0.
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
