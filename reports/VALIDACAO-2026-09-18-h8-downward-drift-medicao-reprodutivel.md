---
id: validacao-2026-09-18-h8-downward-drift-medicao-reprodutivel
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-18T16:00:00-03:00'
atualizado_em: '2026-09-18T16:00:00-03:00'
classes: [interno, medido, pmev, falsificacao]
caminhos:
  - reports/VALIDACAO-2026-09-18-h8-downward-drift-medicao-reprodutivel.md
  - engine/pmev_h8_drift.py
  - scripts/validation/testar_h8_downward_drift.py
  - tests/test_pmev_h8_drift.py
config_medida:
  raiz: /home/user/Site
  branch: claude/project-thread-du5exa
  commit_base: 7dfdb32
  host: Linux 6.18.44, Python 3.12.12, pytest 9.1.1 em venv efemera
  fonte: data/aula12_pairs.json, documentSha256 7ca7c89f52c1a4173ee404f1bc4059cabd564fddfb62129a6cd34789b86e4769
  data_das_medicoes: 2026-09-18
verificado:
  - a amostra de hand history NAO esta no repositorio -- scripts/validation/exportar_benchmark_icm_publico.py declara que as hand histories nao sao versionadas e nao saem da maquina
  - data/pmev_benchmark_icm_chipev.v1.json declara "amostras so com stacks, blinds e lugar"; as 12 amostras por estrutura trazem nivel, blinds, stacks, heroi, lugar_final, premios, icm_ev e chip_ev, e nenhuma acao ou sizing -- H8 nao tem o que medir la
  - a convencao sizing/pote reproduz o percentual do rotulo do GTO Wizard em 7 de 7 ramos de aposta dos quatro nos de aposta livre, erro maximo 0.40 p.p.
  - a mesma convencao NAO reproduz o rotulo nos nos de aumento (Raise 5 com pote 6.73 da 74% contra rotulo de 50%), o que sustenta por medicao a exclusao deles
  - caso de fronteira medido antes do veredito -- Bet 2.8 (50%) com pote 5.63 da 49.73%, e o ramo gemeo do HRC (2.81bb) da 49.91%; as duas convencoes de fronteira foram rodadas e nenhuma foi escolhida pelo resultado
  - H8 FALSIFICADA pelo criterio declarado nas quatro corridas -- primario estrito delta +5.05 p.p. IC95 [-3.35, +17.4]; primario por resolucao delta -13.7 p.p. IC95 [-59.6, +17.4]; secundario estrito delta +6.73 p.p. IC95 [-5.2, +23.2]; secundario por resolucao delta -18.27 p.p. IC95 [-80.2, +23.2]
  - direcao por no, fronteira estrita -- PAR_1 zero contra zero, PAR_2 -5.2, PAR_6 +23.2, PAR_4 +2.2; apenas 1 de 4 nos anda na direcao que H8 afirma
  - tests/test_pmev_h8_drift.py -- 16 passaram, 0 falharam, sob Python 3.12.12
  - a corrida e deterministica sob a mesma semente; duas execucoes devolvem IC e veredito identicos
  - count_reproducible_pairs segue 0 de 7 apos esta medicao, como antes dela
nao_verificado:
  - reproducao da observacao -- re-rodar GTO Wizard e HRC nos mesmos nos exige os solvers externos e o build, que o fixture nao le; nada aqui o alcanca
  - a suite integral do projeto e o portao de 5 fases -- este host nao tem Windows PowerShell 5.1 nem o venv do projeto; so a suite deste modulo foi executada
  - npm audit, pip-audit e a skill security-review
  - qualquer no de aumento -- ficaram fora do recorte por arbitragem do Tier 0 em 2026-09-18, e a conversao de raise-by para fracao do pote segue sem convencao comum entre os dois solvers
  - os 97 nos do documento da Aula 1.2 que nao foram transcritos; a medicao alcanca os 7 pares curados
  - a ancoragem do fixture -- pend-2026-09-18-reancorar-aula12-na-versao-atual registra que o documento atual tem sha b3fc15ba e o fixture segue ancorado em 7ca7c89f; esta medicao herda essa pendencia e nao a resolve
pendencias:
  - id: pend-2026-09-18-h8-estado-no-registro
    o_que: Arbitrar o estado_evidencia de H8 no registro de hipoteses agora que a medicao e reprodutivel mas a observacao nao
    dono: Tier 0
  - id: pend-2026-09-18-h8-convencao-de-raise
    o_que: Definir a conversao de raise-by para fracao do pote que valha nos dois solvers, ou declarar que H8 nao se enuncia em nos de aumento
    dono: Tier 0
---

# H8 — Downward Drift de Sizings: a medição virou reprodutível, e falsificou a hipótese

A ordem era tornar reprodutível a evidência de H8, a única das doze hipóteses marcada como
`evidencia_transcrita_nao_reproduzivel`. O resultado é o inverso do que a marcação sugeria: com o critério
escrito antes da corrida, **H8 é falsificada nas quatro partições medidas**, e em duas delas a direção do
efeito é a oposta da que a hipótese afirma.

Reporto assim porque a instrução era reportar seja qual fosse, e porque medir e refutar é entrega — §10.1 do
`CLAUDE.md` já fixa isso para o agente de nuvem, e vale igual aqui.

## A premissa da tarefa estava errada, e a correção mudou a fonte

A tarefa dizia para usar a amostra de hand history do repositório, a mesma do benchmark. Duas medições:

1. **Ela não está no repositório.** `scripts/validation/exportar_benchmark_icm_publico.py` declara, no
   cabeçalho: *"As hand histories nao sao versionadas e nao saem da maquina."* O que é versionado é o agregado.
2. **Ainda que estivesse, não serviria.** `data/pmev_benchmark_icm_chipev.v1.json` declara
   `"privacidade": "sem nome de jogador, id de torneio ou id de mao; amostras so com stacks, blinds e lugar"`.
   As doze amostras por estrutura trazem nível, blinds, stacks, herói, lugar final, prêmios, `icm_ev` e
   `chip_ev`. **Nenhuma ação, nenhum sizing.** H8 mede frequência de aposta por fração do pote; ali não há
   aposta alguma para medir.

A fonte correta é a que a própria nota de H8 cita: `data/aula12_pairs.json`, os sete pares ChipEV
(GTO Wizard) × IcmEV (HRC) transcritos da Aula 1.2, com SHA-256 do documento conferido no carregador.

## O que ficou reprodutível, e o que continua não sendo

São duas perguntas, e confundi-las transformaria uma transcrição em experimento.

| | Antes | Depois |
| :--- | :--- | :--- |
| **A observação** — re-rodar os solvers | não reprodutível | **não reprodutível** |
| **A medição** — obter o mesmo número da mesma fonte | não existia | **reprodutível** |

`count_reproducible_pairs` continua `0 de 7`, antes e depois. Os solvers são externos, o build não foi lido e
o e-Nash está fora do recorte da captura. O que passou a existir é fonte com hash fixado, critério em código,
semente declarada e uma corrida que qualquer um repete com o mesmo resultado.

**Isto não é pré-registro cego, e não vou chamá-lo assim.** Os pares estão versionados e
`contrasteIcmevChipev.test.ts` (A6) já publica uma direção sobre eles. O que ninguém havia computado é a
estatística literal de H8 — frequência de aposta ≥ 50% do pote. A6 mede outras duas grandezas: fração da massa
no maior ramo, e sizing médio normalizado pelo maior ramo *do próprio cenário*. A diferença entre elas e a de
H8 é exatamente o que produziu este resultado, e está na última seção.

## O desenho, fixado antes de rodar

Recorte arbitrado pelo Tier 0 em 2026-09-18 (opção A): **só nós de aposta livre**, os quatro em que ambos os
regimes oferecem `check`. O discriminante é regra de pôquer, não heurística — não se aumenta onde se pode
pedir mesa —, e é o mesmo de `classifyActionNoCenario` no TypeScript.

A exclusão dos nós de aumento é **medida, não preferida**. O rótulo do GTO Wizard mede raise-by sobre o
pote-após-call: `Raise 5 (50%)` com pote 6,73 dá 74% por sizing/pote. O lado HRC não expõe percentual algum
para calibrar a conversão, então os dois regimes ficariam sobre bases diferentes.
`test_a_mesma_convencao_nao_vale_nos_nos_de_aumento_e_e_por_isso_que_eles_ficam_fora` reprova se alguém
resolver a conversão sem declarar.

Estatística: `F≥50` = soma das frequências dos ramos de aposta com `sizing_bb / pote_bb ≥ 0,50`; e
`Δ = F≥50(ICM) − F≥50(ChipEV)` por nó.

Critério, literal do registro (*"Frequência de apostas ≥ 50% inalterada"* como condição de refuta):

> **H8 sobrevive** apenas com Δ̄ < 0 **e** topo do IC95 < 0.
> **H8 é falsificada** se Δ̄ ≥ 0, ou se o IC95 contiver zero.

Intervalo: bootstrap por **nó**, 2000 reamostragens, semente 20260918, percentis 2,5 e 97,5 — o mesmo desenho
de `engine/pmev_hh_benchmark._bootstrap`. Teste de sinal binomial exato junto.

**Limite de potência, declarado antes da corrida:** com quatro nós o p mínimo do teste de sinal é 0,125; com
três, 0,25. **Nenhum resultado possível alcança 0,05.** "Não significativo" aqui é propriedade da amostra, e
não veredito sobre a hipótese. `test_nenhum_resultado_possivel_alcanca_significancia_no_recorte_primario`
existe para que ninguém leia um p alto como refutação independente.

## A fronteira do limiar, achada pelos guards antes do veredito

O GTO Wizard rotula um ramo do PAR_2 como `Bet 2.8 (50%)`. Medido: **2,8 / 5,63 = 49,73%**. O ramo gêmeo do
HRC, `bets 2.81bb`, dá 49,91%. Os dois caem **abaixo** de 0,50 por arredondamento de leitura — sizing e pote
são números arredondados lidos de uma captura, e a árvore do solver foi construída com um ramo de meio pote.

O ramo carrega 82,5 p.p. no lado ChipEV. A fronteira decide a **magnitude** do resultado inteiro.

Comparar com `≥` estrito uma razão conhecida a ±0,3 p.p. decide o caso no arredondamento. Comparar com folga
decide no rótulo declarado. Nenhuma das duas é obviamente certa, e por isso **nenhuma foi escolhida**: as duas
rodam sempre, e o relatório traz as duas. `test_o_sinal_do_veredito_nao_depende_da_convencao_de_fronteira`
reprova se um dia elas discordarem.

## O resultado

| Partição | n | Δ̄ (p.p.) | IC95 (p.p.) | negativos | p | Veredito |
| :--- | ---: | ---: | :--- | :--- | ---: | :--- |
| Primário, fronteira estrita | 4 | **+5,05** | [−3,35; +17,40] | 1/4 | 0,625 | **falsificada** |
| Primário, fronteira por resolução | 4 | **−13,70** | [−59,60; +17,40] | 1/4 | 0,625 | **falsificada** |
| Secundário, fronteira estrita | 3 | **+6,73** | [−5,20; +23,20] | 1/3 | 1,000 | **falsificada** |
| Secundário, fronteira por resolução | 3 | **−18,27** | [−80,20; +23,20] | 1/3 | 1,000 | **falsificada** |

O secundário aplica o corte de massa agressiva residual já usado por A6 (`> 0,5` p.p. no lado ChipEV), que
descarta o PAR_1.

Por nó, fronteira estrita:

| Nó | Street | F≥50 ChipEV | F≥50 IcmEV | Δ |
| :--- | :--- | ---: | ---: | ---: |
| PAR_1 — BB leading | flop | 0,0 | 0,0 | 0,0 |
| PAR_2 — IP após check | flop | 6,6 | 1,4 | **−5,2** |
| PAR_6 — BB turn após call | turn | 23,8 | 47,0 | **+23,2** |
| PAR_4 — OOP river | river | 66,1 | 68,3 | **+2,2** |

**Um de quatro nós anda na direção que H8 afirma.** Os dois maiores desvios são contra ela, e o maior deles
por larga margem.

## Por que o drift de A6 é real e mesmo assim não sustenta H8

Não é contradição, é diferença de grandeza, e o PAR_6 a exibe inteira.

No turn, pote 15,63. O ChipEV abre dois ramos: 3,9bb (25%) a 18,9% e o all-in de 35bb (224%) a 23,8%. O IcmEV
abre **três**: 3,15bb (20%) a 11%, **7,88bb (50,4%) a 42,8%**, e 32,81bb (210%) a 4,2%.

A6 mede a fração da massa no maior ramo e o sizing médio **normalizado pelo maior ramo do próprio cenário**.
Nessa régua o IcmEV encolhe mesmo: o all-in despenca de 23,8% para 4,2%, e a massa desce um posto. H8, do jeito
que o registro a enuncia, mede uma fração **absoluta** do pote. E o ramo intermediário que o ICM abre para
receber a massa que saiu do all-in cai em **50,4% do pote** — *acima* do limiar.

A massa desceu, e desceu para o lado de cima da linha. O encolhimento de sizing que A6 documenta é um efeito de
**forma da distribuição**; H8 o enuncia como um efeito de **limiar absoluto**. Os dois não são a mesma
afirmação, e sobre estes quatro nós o segundo não se sustenta.

O PAR_4 repete o padrão no river: o ChipEV tem um único ramo grande (all-in, 87% do pote, 66,1%), e o IcmEV o
substitui por dois — 50,4% a 22,5% e 79,9% a 45,8% —, somando 68,3%. Sizing menor por ramo, mais massa acima
de meio pote.

## O que isto autoriza, e o que não autoriza

**Autoriza** dizer que a estatística literal de H8 foi medida de forma reprodutível sobre a evidência
disponível, e que ela não sobreviveu ao próprio critério do registro.

**Não autoriza** declarar H8 morta. Quatro nós de um único board (Kd Jc Ts), de uma única aula, com potência
que não alcança significância por construção. E herda uma pendência aberta: o
`pend-2026-09-18-reancorar-aula12-na-versao-atual` registra que o documento atual tem SHA `b3fc15ba` enquanto o
fixture segue ancorado em `7ca7c89f`. A medição é reprodutível contra a âncora que existe hoje; se a
re-ancoragem mudar algum valor lido, ela se repete sozinha e o número pode mudar. O que a medição mostra é que **o enunciado atual de H8 não é o
fenômeno que a evidência exibe** — e essa é uma conclusão sobre o enunciado tanto quanto sobre a hipótese.

Duas saídas, e a escolha é do Tier 0:

1. **Reenunciar H8** na grandeza que a evidência de fato move — fração da massa no maior ramo, ou sizing médio
   normalizado —, que é o que A6 já mede e onde a direção é unilateral em 3 de 3.
2. **Manter o enunciado** e registrar que ele foi medido e refutado sobre esta amostra, com a ressalva de
   potência.

Não escolhi nenhuma, e não toquei em `data/pmev_hypotheses.json`.

## Declaração de verificação — §5

Rodou: os 16 guards de `tests/test_pmev_h8_drift.py` sob Python 3.12.12, e as quatro corridas do script.

Não rodou, e portanto não está aprovado: a suíte integral do projeto, o portão de 5 fases
(`scripts/ops/cwv_gate.ps1`), `npm audit`, `pip-audit` e a skill `security-review`. Este host não tem Windows
PowerShell 5.1, não tem o `.venv` do projeto e não tem CDP — a bateria substituta da §1.1 cobre `.ps1`, e
nenhum `.ps1` foi tocado. O merge para `master` continua exigindo o portão local, como a §10.6(c) determina
para trabalho vindo de fora da máquina.
