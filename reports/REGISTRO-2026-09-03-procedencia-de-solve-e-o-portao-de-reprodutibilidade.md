---
id: registro-2026-09-03-procedencia-de-solve-e-o-portao-de-reprodutibilidade
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-03T01:56:31-03:00
atualizado_em: 2026-09-03T01:56:31-03:00
classes: [interno, medido, pmev, contrato]
caminhos:
  - core/perspective_schemas.py
  - engine/solver_importers/hrc_pro.py
  - tests/test_hrc_procedencia.py
  - frontend/src/components/simulator/solver/evidenceContract.ts
  - frontend/src/components/simulator/solver/__tests__/evidenceContract.test.ts
  - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
revisoes_de_ancora:
  - registro: registro-2026-09-02-etapa-c2-par-7-e-a-trilha-do-solver
    caminhos:
      - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
    parecer: >-
      Revisado, mantido valido, e sua conclusao final foi PROMOVIDA de prosa a
      verificacao executavel. Aquele registro encerra afirmando que consistencia
      interna, por mais densa que fique, nao e reprodutibilidade, e que versao de
      solver, build e e-Nash seguem ausentes de todas as capturas. Ate hoje isso
      era frase em documento: nada no codigo distinguia um par reproduzivel de um
      par apenas consistente. Agora countReproduciblePairs(AULA_1_2_PAIRS) retorna
      0, e um teste afirma esse zero contra o minimo de 3 do ledger. Nenhum numero
      daquele registro mudou -- nem o par 7, nem a trilha de image59.png, nem a
      retificacao da rejeicao que ele fez de si mesmo. A ambiguidade de nodelock
      que ele declara continua declarada e continua sendo do Tier 0.
  - registro: registro-2026-09-02-etapa-c-linha-completa-e-atribuicao-ambigua
    caminhos:
      - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
    parecer: >-
      Revisado e mantido valido, sem alteracao de conteudo. A cadeia aritmetica do
      flop ao river e as seis identidades entre quatro pares nao sao tocadas: esta
      etapa nao mexeu em frequencia, sizing, combo ou classe de acao. A ambiguidade
      de atribuicao de passe de nodelock, em image7.png, image55.png e image45.png,
      permanece exatamente como aquele registro a deixou -- por arbitrar, e so o
      autor arbitra. Nada aqui a resolve nem a contorna: a procedencia responde a
      outra pergunta, a de QUAL solve produziu o numero, e nao a de a qual passe a
      captura pertence.
  - registro: registro-2026-09-02-etapa-b-river-e-classe-de-acao-no-cenario
    caminhos:
      - frontend/src/components/simulator/solver/evidenceContract.ts
      - frontend/src/components/simulator/solver/__tests__/evidenceContract.test.ts
      - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
    parecer: >-
      Revisado e mantido valido. A funcao classifyActionNoCenario e a regra de
      poquer que a sustenta, nao se aumenta onde se pode pedir mesa, seguem
      intactas e exercitadas; a prova do glifo de direcao nao e tocada. Uma
      afirmacao sua fica REFORCADA: aquele registro sustentou que evidencia valida
      nao e evidencia completa e que todos os pares carregam ressalva. A ressalva
      deixou de ser apenas prosa e ganhou codigo proprio, PROVENANCE_INCOMPLETE,
      com severidade warning para nao descartar pares honestos. Os fixtures
      sinteticos daquele arquivo passaram a declarar procedencia completa, o que
      nao altera nenhuma assercao sua: eles perguntam sobre integridade do dado, e
      continuam perguntando exatamente isso, sem que falta de build os reprove.
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - frontend/src/components/simulator/solver/evidenceContract.ts
    parecer: >-
      Revisado e mantido valido, e o principio central que ele fixou foi APLICADO a
      um campo novo em vez de reinterpretado. Aquele registro estabeleceu que
      ilegivel nao e zero e que divergencia entre solvers e restricao e nao erro. A
      procedencia entrou como Measured<T> pela mesma razao, e o caso e ainda mais
      agudo: e-Nash 0.0 e convergencia perfeita, a afirmacao mais forte possivel
      sobre um solve, enquanto e-Nash ausente e ignorancia. Colapsa-los alegaria
      convergencia que ninguem observou. Os tres pares que aquele registro publicou
      saem daqui sem alteracao de valor algum.
  - registro: auditoria-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
    caminhos:
      - core/perspective_schemas.py
    parecer: >-
      Revisado e mantido valido. Aquela auditoria saneou ruff em modo preview e
      Pyright em core/, e o arquivo continua limpo apos esta alteracao: medido
      agora, ruff format --check reporta already formatted e ruff check reporta All
      checks passed. SolverProvenance e um modelo Pydantic novo e provenance e
      campo OPCIONAL com default None, entao nenhum consumidor existente de
      NormalizedGameTree muda de comportamento, e os 7 testes de
      test_solver_importers.py passam sem edicao. A contagem de 720 testes daquele
      registro e medicao da epoca dele, nao valor a atualizar aqui: pela secao 6.1
      do CLAUDE.md do projeto, contagem vive no portao que a executa.
  - registro: handoff-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
    caminhos:
      - core/perspective_schemas.py
    parecer: >-
      Revisado e mantido valido. Aquele handoff declarou zero lints de ruff e
      Pyright em core/ e a aprovacao dos portoes CWV e de Registro. Esta alteracao
      nao reintroduz lint algum no arquivo, conforme medido acima, e nao altera
      contrato ja publicado: acrescenta um campo opcional e um modelo novo. O que
      ele afirma sobre padronizacao Python 3.12+ e respeitado, porque o campo usa
      sintaxe X | None e Literal, ambos ja em uso no mesmo arquivo antes desta
      sessao.
verificado:
  - suite Python completa em 850 aprovados, 1 pulado e 0 reprovados, executada sob PowerShell
  - suite frontend completa em 202 testes e 26 suites, com 0 erro e 0 warning
  - suite do solver isolada em 108 testes; dezessete testes Python e quinze de frontend sao novos nesta etapa
  - tsc --noEmit com exit 0 e eslint --max-warnings=0 com exit 0 no diretorio solver
  - ruff format --check e ruff check limpos nos tres arquivos Python tocados
  - dois detectores do guard Python provados por mutacao, com restauracao conferida por SHA-256 identico
  - extracao de procedencia medida contra data/sample_hrc_export_mtt_bubble.hrc, contra JSON e contra texto com sufixo
  - nomes e definicoes das metricas obtidos por busca em fonte primaria -- CI do HRC, Nash Distance e dEV do GTO Wizard, MES do PioSOLVER
nao_verificado:
  - o formato real do export do HRC Pro da maquina do Tier 0 -- o sample do repositorio e amostra, provavelmente sintetica
  - qual unidade o HRC usa para CI quando o texto nao traz sufixo, e qual e o referente de um valor percentual
  - a formula exata do CI do HRC -- a busca confirmou que e Convergence Indicator ligado a Monte Carlo, mas nao a definicao numerica
  - se cada captura do lado ChipEV veio da biblioteca (motor HRC) ou do GTO Wizard AI -- o discriminante e o painel CI, e a conferencia caso a caso nao foi feita
  - os algoritmos citados como presentes no repositorio foram apenas CONTADOS por grep, nao auditados quanto a integracao
  - o portao de 5 fases nao foi executado nesta etapa
  - nenhuma chamada a provedor de LLM foi feita, e nenhuma e pressuposta pelos testes novos
supersede: null
---

# Procedência de solve, e o portão de reprodutibilidade que era só uma frase

## 1. A ordem foi invertida, e a inversão foi autorizada

O prompt de continuação desta sessão fixava **prioridade 1: recaptura do HRC**.
A medição inicial mostrou que executá-la primeiro produziria dado sem destino.

Os três campos que o ledger exige — versão de solver, build e e-Nash — não
tinham lugar em **nenhuma** das duas camadas do sistema:

| Camada | Tipo | build | e-Nash |
| :--- | :--- | :--- | :--- |
| Evidência transcrita (TS) | `EvidenceScenario` | ausente — só `solver: string` | ausente |
| Importação de solver (Py) | `NormalizedGameTree` | ausente — só `source_format: str` | ausente |

Uma recaptura feita hoje voltaria com build e e-Nash na tela, e o único destino
possível seria prosa num comentário. `evidenceContract.ts` existe precisamente
para impedir isso: o princípio "não lido ≠ lido como zero" só opera se o campo
existir. O solve é caro; refazê-lo por falta de campo é retrabalho evitável.

O Tier 0 confirmou a inversão, e confirmou também que **o HRC exporta arquivo**.
Isso muda a natureza do trabalho: o gargalo declarado desde a Etapa A é que os
pares são transcrição de captura de terceiro, não medição própria. Export
estruturado ataca essa barreira; três campos a mais numa transcrição, não.

## 2. O campo que era reconhecido e jogado fora

`HRCProImporter.detect_format` reconhece `hrc_version` desde sempre — e a usa
apenas para **identificar o formato**, descartando o valor em seguida. O mesmo
arquivo que sabia procurar a versão do solver não a lia.

E o export de amostra do repositório traz a versão na **primeira linha**:

```
HoldemResources Calculator Pro Export v2.4.1
```

A lacuna estava registrada como "pendente de nova captura" enquanto havia, no
repositório, um parser que já tocava o campo. Isso não é crítica à Etapa A:
aquela etapa falava do recorte das capturas coladas no DOCX, que é outro caminho.
Mas o caminho do export estava aberto e não fora percorrido.

**Ressalva declarada, e ela importa:** aquele `.hrc` é amostra do repositório e
provavelmente sintética, construída para exercitar o parser. Ela mostra o que o
projeto *assume* sobre o formato, não o que o HRC do Tier 0 *emite*. O primeiro
export real pode exigir ajuste no extrator, e isso está em `nao_verificado`.

## 3. O que foi construído

**`SolverProvenance` nas duas camadas.** Em TypeScript como `Measured<T>`, pela
mesma razão de todos os outros campos do contrato. Em Python como modelo
Pydantic, com `None` significando não-lido.

**A unidade do e-Nash é obrigatória, e não tem padrão.** Um `eNash: 0.4` sem
unidade é indistinguível entre "0,4% do pote" — solve apertado — e "0,4bb" —
solve grosseiro. Adotar uma unidade padrão converteria ambiguidade em número
confiável, que é o defeito que o contrato inteiro existe para impedir. Medido: um
JSON com `exploitability: 0.42` e sem unidade **não** conta como completo.

**`PROVENANCE_INCOMPLETE` é warning, nunca error.** Reprová-lo descartaria sete
pares honestos; silenciá-lo deixaria a barreira só na prosa. O par continua sendo
evidência legítima do que a captura mostrou; o que ele não sustenta é a alegação
de reprodutibilidade — e é só essa alegação que o ledger condiciona.

**`assessReproducibility` e `countReproduciblePairs`.** O discriminante que
faltava. Hoje retorna **zero de sete**, e esse zero está afirmado em teste contra
o mínimo de três do ledger.

> Este teste não é para consertar. Ele afirma o estado real, e o número sobe
> sozinho quando o export chegar. Quem o "consertar" preenchendo procedência sem
> o export terá inventado a evidência que o ledger exige.

## 4. O que o Tier 0 corrigiu no meio da construção

Quatro precisões suas mudaram o desenho, e a última inverteu uma conclusão minha.

**Os rótulos que eu inventei estavam errados.** Meu extrator procurava `e-Nash`,
`Exploitability` e `Nash Distance`. O HRC chama de **`CI`**; o PioSOLVER, de
**`MES`**. O campo real não seria encontrado. e-Nash é o **conceito** — distância
da solução ao equilíbrio —, e cada solver lhe dá nome próprio, então o rótulo
nativo passou a ser guardado junto com o número, pelo mesmo motivo que
`classifyAction` existe: o rótulo varia, o conceito não.

**A caixa-preta não é a teoria, são os atalhos.** Distância ao equilíbrio, ICM e
CFR estão na literatura; o destino é o mesmo. O proprietário é *como chegar lá
mais rápido* — heurísticas de aceleração e critério de parada. Isso é mais forte
que "o solver é opaco": o atalho decide **onde o solve para**, logo é ele quem
produz o número do CI. Consequência mecânica: uma versão nova, com atalho novo,
para em outro ponto com os mesmos inputs. `build` deixou de ser boa prática e
virou âncora indispensável.

**Por isso `%` virou `pct`, e não `pctOfPot`.** Ler o símbolo autoriza dizer que
a grandeza é percentual, e nada além. "Por cento de quê" é decidido pelo atalho,
não pela teoria. `pctOfPot` só entra quando o próprio export declara o referente.

**Produto não é motor.** O GTO Wizard usa redes neurais nas features avançadas,
mas as médias e básicas foram computadas **via HRC, em CIs subótimos**. Um número
lido naquela interface pode ter saído do HRC — e então a versão que importa é a
do HRC, e o solve pode não estar convergido. Daí o campo `engine`, separado do
produto. Indício útil, e é indício: as tabelas estáticas do GTO Wizard também
reportam `CI`, então ver `CI` ali sugere tabela estática. O rótulo do solver
neural ninguém aqui conhece. O contrato **não infere `engine`** — quem transcreve
declara, pela mesma razão que o validador nunca redistribui frequência.

### A inversão

Eu havia escrito que motor comum nos dois lados faria "dois números do mesmo motor
parecerem medições independentes" — tratando a coincidência como risco. **Está
errado, e o Tier 0 corrigiu:** o HRC calcula ChipEV além de ICMev.

A disputa em estudo é **ChipEV × ICMev**. Se os dois lados saem do mesmo motor, o
modelo é o mesmo e a única variável que resta variando é o regime — que é
exatamente o que o par existe para isolar. Isso é **controle experimental**. O
risco está no contrário: motores diferentes misturam efeito de regime com efeito
de motor, e nenhuma análise separa os dois depois.

Consequência prática para a recaptura: um par `ChipEV(HRC) × ICMev(HRC)`, mesmo
build, é estritamente mais forte que `ChipEV(GTO Wizard) × ICMev(HRC)`.

### A arquitetura, e o que ela devolve aos sete pares

O GTO Wizard tem dois caminhos, e só um é dele:

| Caminho | Método | Métrica |
| :--- | :--- | :--- |
| Biblioteca / tabelas estáticas | **rodadas no HRC e apresentadas como biblioteca** (Tier 0) | `CI` — é o rótulo do HRC |
| GTO Wizard AI | depth-limited subgame solving + counterfactual value networks, linhagem DeepStack/ReBeL: CFR só na street ativa, terminais truncados avaliados por rede de self-play | rótulo desconhecido aqui |

A diferença **não é de rótulo, é de escopo do cálculo**. Exploitability de árvore
completa e exploitability de subjogo truncado, com terminais estimados por rede,
não são a mesma grandeza — a segunda é residual em relação a um jogo que nunca
foi inteiramente percorrido.

**E isso devolve força aos sete pares.** Se o lado ChipEV veio da biblioteca, ele
saiu do HRC — o mesmo motor do lado ICMev. Motor comum é controle experimental, e
portanto aqueles pares já isolam o regime melhor do que a procedência declarada
neles deixava ver. O que resta é conferir captura a captura se é biblioteca ou
AI, e o discriminante está na própria tela: `CI` no painel indica biblioteca.
Essa conferência **não foi feita** e está declarada.

Nota medida, não expandida: `pluribus`, `libratus`, `deepstack`, depth-limited,
value network, CFR e Monte Carlo aparecem no repositório — 3, 2, 3, 2, 1, 45 e 31
arquivos. Isso é contagem por `grep`, e a raiz §4 é explícita: módulo que ninguém
importa não é integração. Auditar o que desses núcleos está de fato ligado é
trabalho próprio, e não foi feito aqui.

### As definições, buscadas onde deviam ter sido buscadas antes

O feedback desta sessão foi que eu não deveria perguntar ao Tier 0 o que é
público. Perguntei duas vezes — o rótulo da métrica e sua unidade — e ele acabou
trazendo a documentação que era minha para trazer. Buscando na fonte:

| Solver | Rótulo | Definição |
| :--- | :--- | :--- |
| HRC | `CI` | **Convergence Indicator**, dos cálculos de Monte Carlo do HRC. Fórmula exata não obtida. |
| GTO Wizard | `Nash Distance` / `dEV` | máxima perda de EV da solução, em **bb dividida pelo pote**; o AI resolve a ~0,1% do pote |
| PioSOLVER | `MES` | Maximally Exploitative Strategy |

Dois ganhos concretos que a busca trouxe e a pergunta não teria trazido:
`dEV` entrou na lista de rótulos reconhecidos, e a **proibição de comparar
e-Nash entre solvers deixou de ser cautela e passou a ter base documental** —
indicador de convergência de amostragem não é EV-loss máximo relativo ao pote.

E um limite que a busca **não** venceu, declarado em vez de preenchido: a fórmula
do CI não foi obtida, então o referente de um `%` do lado HRC continua aberto. Por
isso o importador segue gravando `pct` e não promove `pctOfPot` por rótulo —
mesmo do lado do GTO Wizard, onde o referente é documentado. Promover seria o
importador decidindo semântica; quem transcreve declara, agora com o fundamento
na mão.

Fontes: [HRC Documentation](https://www.holdemresources.net/docs) · [Postflop Calculations in HRC](https://www.holdemresources.net/docs/postflop/) · [Understanding Nash Distance — GTO Wizard](https://blog.gtowizard.com/understanding-nash-distance/) · [Accuracy & Benchmarks — GTO Wizard Help](https://help.gtowizard.com/accuracy-and-benchmarks/) · [Depth-Limited Solving for Imperfect-Information Games](https://arxiv.org/pdf/1805.08195)

## 5. Dois erros meus nesta sessão, e como foram pegos

**O primeiro quase entrou no repositório.** Escrevi o método Python por heredoc
dentro de um script Python — duas camadas de interpretação de escape. O resultado
foi que `[^\r\n]` virou uma **quebra de linha real dentro da regex** e os `\b`
viraram caractere de controle. O arquivo ficou sintaticamente quebrado. Um
`SyntaxWarning` apareceu, eu fui conferir **o que de fato havia sido escrito** em
vez de confiar no "OK" impresso, e revertei. A segunda tentativa escreveu o método
num arquivo literal com heredoc *quoted* — uma camada só — e conferiu os escapes e
a ausência de caracteres de controle antes de inserir.

**O segundo teria virado um anúncio de regressão falsa.** A suíte Python
executada pelo Bash reprovou 3 testes em `test_cwv_gate_truthfulness.py`, arquivo
que esta sessão não tocou, com `TypeError: unsupported operand for +: NoneType and
str` — `result.stdout` nulo num `subprocess.run(capture_output=True)`. A
aritmética até favorecia a hipótese de regressão: 834 testes antes, 8 meus, 842
agora, e as 3 falhas eram novas frente ao estado declarado no handoff.

O discriminante foi o shell: **os mesmos 17 testes passam quando executados pelo
PowerShell.** `subprocess.run` invocando `powershell` sob Git Bash devolve
`stdout=None`. Não havia regressão; havia instrumento errado.

Isto é a regra de abertura desta sessão operando **antes** do anúncio, e não
depois. Na sessão anterior o mesmo padrão produziu um anúncio de perda de trabalho
que nunca houve.

## 6. O que isto NÃO faz

Não calibra nada. `solveIcmDistortion` segue com as constantes que tinha, e nenhum
par ficou reproduzível. O portão continua fechado — a diferença é que agora ele é
um número que o teste lê, e não uma frase que alguém precisa lembrar.

Não resolve a arbitragem de nodelock de `image7.png`, `image55.png` e
`image45.png`. Continua sendo do Tier 0.

Não prova o formato do export real. Prova que o repositório tem por onde recebê-lo.
