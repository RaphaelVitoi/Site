---
id: registro-2026-09-09-mtt-contexto-completo-hh-hrc
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-09T13:41:25-03:00'
atualizado_em: '2026-09-09T14:09:16-03:00'
classes:
  - interno
  - medido
  - simulador
  - contrato
  - mtt
caminhos:
  - frontend/src/lib/tournamentContext.ts
  - frontend/src/lib/tournamentConditions.ts
  - frontend/src/lib/handParser.ts
  - frontend/src/lib/hrcFormat.ts
  - frontend/src/lib/hrcPrizes.ts
  - frontend/src/lib/hrcStructure.ts
  - frontend/src/lib/hrcExport.ts
  - frontend/src/lib/icmEngine.ts
  - frontend/src/lib/montecarlo.ts
  - frontend/src/components/simulator/panels/EquityCalculator.tsx
  - frontend/src/components/simulator/panels/TournamentConditionsPanel.tsx
  - frontend/src/components/simulator/panels/TournamentTableImport.tsx
  - frontend/src/components/simulator/hooks/useIcmCalculations.ts
  - frontend/src/components/simulator/hooks/useMasterHandlers.ts
  - frontend/src/components/simulator/workers/icm.worker.ts
  - frontend/src/components/simulator/workers/icmTableProcessor.ts
  - frontend/tsconfig.worker.json
  - frontend/src/tests/simulator/tournamentContext.test.ts
  - frontend/src/tests/simulator/tournamentConditions.test.ts
  - frontend/src/tests/simulator/tournamentTableImport.test.tsx
  - frontend/src/tests/simulator/handHistoryHrc.test.ts
  - frontend/src/tests/simulator/hrcStructure.test.ts
  - frontend/src/tests/simulator/fixtures/hrc-structure-pko.json
  - frontend/src/tests/simulator/fixtures/handHistories.ts
  - frontend/src/tests/simulator/fixtures/hrc-native-settings.json
  - frontend/src/tests/simulator/fixtures/hrc-native-ft-settings.json
  - frontend/eslint.config.mjs
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  baseline_head: 3a7a25b710e4e51f54aee6e7ae87072e89d5c2ba
verificado:
  - Aprovacao do usuario para inputs do torneio completo, mesa PokerStars ate 9 e GGPoker ate 8, ou mesas
    quebradas. Equidade usa contexto completo. Dominio prioritario MTT NLHE; field, ITM e prize pools
    sao inputs do usuario com defaults editaveis.
  - 'Frontend completo: 40 suites e 339 testes aprovados; zero erros e warnings no relatorio Jest. TypeScript
    app e workers, ESLint dos arquivos TS alterados e git diff --check aprovados. Acesso por colchetes
    ajustado apos TS4111 dos workers; compilacao repetida com exit 0.'
  - 'Browser dev em localhost:3000/simulador: HH GGPoker reconhecida automaticamente; SB 500, BB 1000,
    ante 125, botao 8, Hero e tres stacks corretos. Contexto sintetico com 12 restantes e mesa de 8 retornou
    oito equidades de 8.33%, com 12 payouts iguais e stacks desiguais. ITM 1201 para field 1200 bloqueou
    export e removeu resultados; restaurar ITM 180 recuperou o calculo.'
  - 'Arquivo real HRC: settings.json extraido do save SemiFT Resteal BU 30 BB 15.hrcz, da biblioteca local
    do usuario. Fixture conserva configuracao, sem resultados/estrategias. Treze jogadores, seis na mesa
    e sete externos, massa 378000 fichas, BB 1000 e 23 posicoes pagas. Importacao/reexportacao testadas;
    escalas de handdata (x100) e otherstacks (x1) reconciliadas.'
  - 'Inspecao estatica por javap do HRC instalado 4.1.0.202603231401: loader de Hand Config procura handdata,
    wizard le engine.type/maxactive, treeconfig.mode e configuracoes opcionais preflop/postflop. Nao executei
    o wizard ou um solve.'
  - 'Validacao adicional pedida pelo usuario: 8 jogadores de mesa e 115 externos, 123 no total. Teste
    de importacao, valuation e reexportacao conserva todas as 123 identidades numericas. Benchmark isolado
    sintetico: 20000 iteracoes, 23 payouts, 1559.3108 ms, oito linhas finitas. Nao existe limite de 12
    jogadores no contexto.'
  - 'Resumo completo PokerStars anexado a HH: extracao de field, pool e payouts completos quando a soma
    confere e as colocacoes sao consecutivas. Um total de fichas explicitamente presente e preenchido;
    nao e inferido da mesa. Resumo parcial conserva pool/field disponiveis sem promover payouts incompletos
    a estrutura completa. IDs de torneio divergentes sao rejeitados.'
  - 'Segunda fixture nativa FT: structure.chips declara 378000 mas a soma dos nove stacks e 375013. O
    teste detectou a contradicao real e confirma a rejeicao; a fixture original foi preservada. Uma copia
    em memoria com chips=375013 testa a variante consistente, sem modificar a evidencia original.'
  - 'Estrutura real fornecida pelo usuario: 7000000 fichas, 239 premios somando 3360.00 por colocacao,
    bountyType PKO e progressiveFactor 0.5. Composicao HH/estrutura em ambas as ordens, upload, colecoes
    aninhadas e selecao explicita testados. Raw original preservado para reexportacao.'
  - 'Pre-publicacao autorizada: portao cwv_gate.ps1 exit 0, FRAGIL, zero erros e um warning de cobertura
    CWV. LCP 614.21 ms, CLS 0, TTFB 117.96 ms; TBT nao certificado por fingerprint Lighthouse expirado.
    Axe zero violacoes, um incomplete com aceite humano preexistente; npm zero vulnerabilidades, Python
    quatro aceites preexistentes e zero CVEs abertas; SRI e higiene aprovados.'
  - Lint dos fontes aprovado apos excluir dist-workers, saida gerada pelo TypeScript ja ignorada pelo
    Git. Workflow lint aprovado via actionlint com array de caminhos Git no PowerShell; script npm original
    incompatível com cmd.exe nesta plataforma.
nao_verificado:
  - Nao abri o JSON exportado na interface desktop do HRC nem certifiquei todas as versoes/formats do
    produto. O teste de ida e volta usa nosso adaptador e uma configuracao nativa; a inspecao do JAR e
    evidencia estatica, nao validacao end-to-end do cliente.
  - 'HH suportada: texto em ingles PokerStars/GGPoker de uma mao de torneio NLHE, ate 5 MB por input/arquivo.
    Exportacoes localizadas, varias maos simultaneamente, .hrcz/.hrcv e JSON de estrategias nao sao ingeridos
    por este fluxo. Colecoes de Structure Manager agora sao aceitas como entrada complementar.'
  - 'Configuracoes HRC aceitas: malmuthharvil/mtticm sem bounties. O peso exploratorio PKO nao e convertido
    em bounty; exportacao legada agora informa incompatibilidade em vez de inventar configuracao. Novos
    setups usam molde push/fold; HH nao reconstrui uma arvore de acoes.'
  - Build Next de producao e CI remoto nao executados. Pre-publicacao medida em verificado; commit/push
    dependem dos hooks finais. Nao ampliei os outros motores PMev/Atlas para consumir estes inputs e nao
    medi desempenho para milhares de jogadores restantes.
revisoes_de_ancora:
  - registro: validacao-2026-09-07-findings-do-astra-contra-o-codigo
    caminhos:
      - frontend/src/lib/icmEngine.ts
    parecer: 'F07: o wrapper da calculadora deixou de substituir ICM por proporcao de fichas acima de
      dez jogadores. Usa Malmuth-Harville exato ate dez stacks positivos e Monte Carlo reprodutivel acima
      disso, com metadados propagados ao consumidor. A medicao historica de Claude permanece preservada;
      os demais caminhos e findings nao sao reclassificados por esta alteracao.'
referencias_nao_resolviveis: []
---

# MTT: contexto completo, mesa selecionada e interoperabilidade HH/HRC

## Decisoes do usuario e criterio de desenvolvimento

Este registro sucede a primeira fatia documentada em
[retomada do worker](REGISTRO-2026-09-09-retomada-astra-escopo-ft-e-worker.md).
Aquela medicao de 281 testes e a ausencia de importacao eram verdadeiras naquela
etapa; este registro documenta a implementacao posterior autorizada.

Raphael explicitou: estudamos principalmente MTTs No-Limit Texas Hold'em.
O usuario fornece field, ITM, prize pool e outras variaveis. O produto deve
explicar, oferecer defaults e tooltips, tratar contradicoes e emitir outputs
validos. Inputs podem conter o torneio inteiro. O limite 9p/8p restringe a mesa
analisada; nao o numero de stacks usados no valuation. Output continua molde
funcional de desenvolvimento teorico, sem promocao a prova da PMev.

| Camada | Comportamento implementado |
| :--- | :--- |
| Field total | Entradas do MTT, editaveis; separado dos jogadores restantes. |
| Contexto do valuation | Um stack por jogador restante e todos os payouts em disputa. |
| Mesa | Selecao por identidade; PokerStars 2-9, GGPoker 2-8; sem truncar o input. |
| Mao | Subconjunto separado da mesa; vazio permite snapshot ICM sem mao definida. |
| Payouts | Absolutos ou percentuais do pool restante; unidade explicita. |
| Origem | Texto original preservado; normalizacao nao substitui os valores recebidos. |

Field inicial e ITM organizam e validam o contexto. Para stacks restantes e payouts
fixos, nao se inventou um termo no Malmuth-Harville que alterasse a equidade apenas
porque o numero historico de entradas mudou. O tratamento das variaveis foi
implementado antes de qualquer nova hipotese teorica.

## Backend de calculo antes da interface

O processador do worker valida o pedido, resolve os payouts absolutos, calcula a
equidade sobre a populacao completa e so entao projeta as linhas da mesa. Os
outros jogadores permanecem no denominador e na distribuicao de colocacoes.
Mudancas nos stacks externos afetam o resultado; trocar apenas a selecao de
linhas nao altera a equidade de um mesmo jogador.

Ate dez stacks positivos, usa-se o kernel exato por subconjuntos. Acima disso,
Monte Carlo Malmuth-Harville com 20000 iteracoes e seed 1: estimativa reproduzivel,
sem substituicao por ChipEV e sem intervalo de confianca inventado. A contagem do
metodo e a populacao de valuation, nao o tamanho da mesa. Stacks zero conservam
a convencao terminal do kernel; a interface exige ao menos um stack positivo.

## Inputs e mensagens

- Field, restantes e ITM: inteiros coerentes; ITM e restantes nao excedem o field.
- A contagem de restantes precisa corresponder aos stacks efetivamente fornecidos.
- Prize pools positivos e finitos; restante nao excede total. A relacao com as
  colocacoes pagas ja eliminadas e verificada para premiacao por colocacao.
- Payouts positivos, decrescentes e em quantidade compativel; soma 100% ou pool
  restante conforme a unidade. Nao ha normalizacao silenciosa de lista invalida.
- Campos vazios permanecem invalidos, sem conversao silenciosa para zero.
- Erro informa a contradicao e suspende resultados/exportacao dependentes; corrigir
  o input reativa o calculo. O contexto original e conservado.

Os defaults sao explicitamente sinteticos e editaveis. Uma HH nao informa, por si,
o field completo, os payouts nem os stacks de outras mesas. A importacao preenche
o que encontrou e oferece molde de payouts para os campos ausentes. Esses dados
nao precisam de comprovacao externa para serem usados como inputs do usuario.

## HH e HRC

A colagem dispara a leitura automaticamente. Arquivos TXT, HH e JSON usam a
mesma fronteira de validacao. O parser de HH le apenas os assentos iniciais,
ignora o resumo de ganhos, conserva decimais e identifica sala, torneio, mesa,
blinds, ante, botao e Hero quando presentes. Variantes de jogo incompatíveis,
assentos duplicados e mistura de maos sao rejeitados. Nao se cria Hero com base
na primeira linha de um arquivo HRC que nao informa quem ele e.

O exportador anterior usava um esquema proprio com version/equityModel/structure
sem demonstracao de compatibilidade. Foi substituido pelo contrato nativo
handdata/eqmodel/treeconfig/engine, usando uma fixture extraida de arquivo HRC
real e verificacao do leitor no JAR instalado. A separacao entre Hand Config,
Complete Save e Viewer Save consta na
[documentacao oficial do HRC](https://www.holdemresources.net/blog/2023-hrc-v3-release/).
O formato esparso de payouts foi conferido contra o arquivo e a
[orientacao oficial sobre prize jumps](https://www.holdemresources.net/blog/2020-02-hrc-update/).

A origem local da fixture e:
C:/Users/rapha/OneDrive/PANTS/Pantoja/Semi FT e Mid Resteal/SemiFT Resteal BU 30 BB 15.hrcz,
entrada settings.json. Nenhum state.json, EV ou estrategia foi promovido a
resultado da bancada. A fixture e dado de interoperabilidade, nao calibracao.

Na exportacao, handdata contem somente a mesa; otherstacks contem os demais.
Stacks em BB sao convertidos com escala explicita; a massa e reconciliada.
Um botao conhecido ordena os assentos para UTG ate BB, com tratamento HU.
Sem botao, a UI explica a convencao da ordem. Configuracoes importadas preservam
arvore e engine; novos setups recebem molde push/fold para revisao no HRC.
Metadados PMev preservam as condicoes historicas do usuario fora dos campos nativos.
Payouts historicos so sao conservados quando conhecidos e compativeis; nunca
sao fabricados para completar um prize pool declarado.

## Escala do field e preenchimento da estrutura

A pergunta "So 12?" referia-se a uma captura com 115 Other Stacks e oito
assentos. O total visivel e 123 restantes; 12 era apenas uma fixture anterior.
Foi acrescentada regressao com 8 + 115, incluindo importacao HRC, calculo completo
e reexportacao. O limite de mesa nao foi aplicado aos stacks externos.
Um benchmark isolado, sintetico, de 123 jogadores/23 payouts/20000 iteracoes
retornou oito linhas finitas em 1559.3108 ms nesta maquina. Nao e um SLA, limite
de field ou medicao do solve da imagem; os valores ocultos da imagem nao foram
reconstruidos nem inferidos.

O pedido de preenchimento de Structure/Chips/Prizes foi incorporado: HRC preenche
esses dados nativos. Uma HH com resumo PokerStars completo anexado aproveita
field, prize pool e payouts; ausencia permanece ausencia. Total Chips so e lido
quando explicitamente presente. Nao se deduz total de fichas do torneio a partir
da soma de uma mesa. A interface oferece Fichas totais (BB), opcional e editavel;
quando informado, interface e processador verificam a soma global antes do output.

A fixture FT adicional revelou um caso util de input inconsistente: declaracao de
378000 fichas versus soma de 375013. O primeiro teste assumiu coerencia e falhou;
a investigacao corrigiu a premissa do teste, sem afrouxar a validacao. A fixture
original permanece intacta, e a rejeicao e esperada. A variante consistente e uma
copia derivada apenas em memoria, identificada no teste. Interoperabilidade com
um arquivo real nao dispensa a verificacao interna dos numeros recebidos.

## Evidencia e limites

A suite frontend final tem 39 suites/326 testes, zero warnings, incluindo:
mensagens de insolvencia, denominador global, stacks externos, limites de mesa,
HHs sinteticas de ambos os sites, arquivo HH via FileReader, arquivo JSON HRC,
configuracao HRC nativa e ida/volta, dados invalidos e defaults coerentes.
TypeScript app/workers e ESLint passaram. Browser dev confirmou colagem GG,
conversao para BB, Hero, 12 restantes com 8 linhas de resultado, bloqueio de ITM
impossivel e recuperacao. Nenhum processo de servidor preexistente foi reiniciado.

A abertura do arquivo exportado no cliente HRC e a execucao de um solve permanecem
sem certificacao nesta sessao. A leitura estatica do JAR nao substitui esse teste.
Tambem nao ha promessa de importar todo JSON que o HRC exporta: o fluxo atual
aceita Hand Config, sem importar estrategias, solucao ou bounties como se fossem
payouts regulares. Ferramentas auxiliares de ranges/pote continuam com inputs
proprios, identificados na interface.

O preenchimento do resumo anexado tem cobertura automatizada adicional; o teste
de browser descrito acima foi anterior a essa ultima ampliacao. O download HRC
foi acionado na aba de teste, sem erro de interface, depois de restaurar os inputs.
A aba temporaria foi encerrada e o servidor preexistente permaneceu intacto.

## Correcao de escopo: estrutura independente da HH

O arquivo fornecido pelo usuario revelou uma terceira entrada, ausente no
adaptador inicial: colecao de estruturas HRC, com raiz `name/folders/structures`.
A restricao anterior a Hand Config foi corrigida. A HH descreve a mao e a mesa;
a estrutura fornece fichas e premios; o snapshot do field fornece os demais
stacks. Os tres papeis devem compor o contexto sem substituicao silenciosa.

Arquivo: `PokerStars_3737886713-Bounty-Builder-5.50-6K-Gtd-1788972757.json`.
A fixture conserva os bytes recebidos. Nao atribui o arquivo a um fornecedor
especifico apenas pelo nome ou formato.

| Campo no arquivo | Valor lido |
| :--- | :--- |
| Nome | Bounty Builder $5.50, $6K Gtd |
| Fichas | 7000000.0, convertido de string numerica |
| Posicoes pagas | 239 |
| Soma dos premios por colocacao | 3360.00, conferida com Decimal |
| Bounty | PKO |
| Fator progressivo | 0.5 |
| Field inicial, restantes, stacks e BB | Ausentes desta estrutura |

O nome com garantia 6K nao redefine a soma dos premios nem permite inferir o
pool de bounties. A UI informa o componente de colocacao e conserva os metadados
PKO. A colecao original pode ser baixada integralmente; Hand Config PKO completo
continua dependente de bounties por jogador e modelo proprio, e sua exportacao
nao e falsificada como ICM sem bounty.

A importacao aceita numeros e strings decimais positivas, valida premios e
colecoes, exige escolha quando ha varias estruturas e preserva o contexto valido
quando uma tentativa de substituir a estrutura e invalida. Arquivo pode entrar
pelo controle geral ou dedicado; colagem tambem e suportada. A composicao foi
testada nas duas ordens sem perder HH, mesa, Hero ou os dados originais.
Fichas declaradas continuam sujeitas a reconciliacao global. Uma HH de uma mesa
com esta estrutura nao fabrica stacks externos nem permite valuation completo
quando a massa de fichas diverge.

Durante a verificacao, o primeiro teste detectou dependencia circular de schema;
a leitura de premios foi extraida para modulo independente compartilhado. A
bateria final passou: 40 suites, 339 testes, zero warnings; TypeScript app e
workers, ESLint e diff-check aprovados. ESLint foi inicialmente invocado da raiz
sem configuracao e repetido corretamente no frontend. Nao houve nova validacao
visual no browser ou no wizard desktop para este incremento.

SHA-256 da fixture de estrutura:
`b7ddf7c09e52dbd9995a8c656f224d8a46a874c9c99a789303557bb1ad489275`.

## Pre-publicacao: verificacoes e incidente de concorrencia

Publicacao solicitada explicitamente pelo usuario nesta etapa. A verificacao
Python independente terminou com 1077 testes aprovados e um pulado, sem warnings.
O pulado depende de uma arvore marcada como superada, inexistente neste checkout.
A bateria integrada passou por Ruff, Pyright, ESLint, Markdown, TypeScript e
339 testes frontend, mas sua etapa Python sobreposta a execucao independente
terminou com 1036 aprovados, um pulado e 41 erros de preparacao de fixtures.

Os erros envolveram caminhos temporarios ausentes. A configuracao desativa o
cacheprovider e define tmp_path_retention_policy=none e retention_count=0.
Interferencia entre as execucoes sobrepostas e a hipotese operacional; nao se
atribuiu essa falha ao codigo de produto. A repeticao sem concorrencia verifica
novamente a suite inteira, pois nao ha cache de falhas para limitar --lf.
A repeticao isolada terminou com exit 0: 1077 aprovados, um pulado, zero erros e
zero warnings em 308.11 segundos. Os 41 erros de fixtures nao se reproduziram.
O comando integrado com exit 1 permanece registrado como tal; todas as suas
superficies foram verificadas, com a etapa Python repetida separadamente.

## Continuacao

1. Validar o arquivo gerado no wizard da versao HRC usada em producao, preservando
   a distincao entre aceitacao do setup e qualidade/convergencia do solve.
2. Ampliar o corpus de HHs por idioma/versao mediante exemplares reais; para
   arquivos com varias maos, introduzir escolha temporal explicita, sem soma de
   stacks de instantes diferentes.
3. Integrar este contrato aos outros motores somente apos rastrear os consumidores;
   o perfil baseline F03 e sua origem continuam prioridade separada.
4. Publicacao autorizada pelo usuario: executar pre-commit, commit, pre-push e
   push, com autoria Chat GPT-6 Astra <noreply@openai.com>. Este documento
   registra as verificacoes anteriores; a confirmacao remota sera emitida apos o push.

**Auditor e implementador:** Chat GPT-6 Astra <noreply@openai.com>.
Assinaturas e medicoes historicas de outros autores permanecem preservadas.

SHA-256 da fixture HRC: 33959c225be3a54371bee5f24c91e640ad72c01d751a6ffd6a6cc9b48be23b33.

SHA-256 da fixture FT original: 78bbcfae8e50e954915f07f8651bb23f1e39685c71198920d4019cab75a8ddb9.
