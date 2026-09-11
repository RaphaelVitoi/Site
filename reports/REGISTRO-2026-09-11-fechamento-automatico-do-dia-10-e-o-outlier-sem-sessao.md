---
id: registro-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-11T00:03:53-03:00'
atualizado_em: '2026-09-11T06:27:25-03:00'
classes: [interno, medido, calibracao]
verificado:
  - append puro no ledger de outlier -- 1 insercao, 0 remocoes, por git diff --numstat
  - cadeia SHA-256 do ledger de outlier integra em 5 elos, conferida elo a elo
  - sequencias 1 e 3 inalteradas -- da7ef222 e 2d55d92a seguem com pattern_indexed falso
  - portao de ancora aprovou os 3 arquivos em stage antes deste registro existir
  - o .json do dia 10 e irmao de 2026-09-08.json e 2026-09-09.json, ambos versionados
  - gpt-5.6-terra e gpt-6-astra conferidos por varredura do llm/model_registry.py
  - gpt-6-astra e o unico gpt-6 do registro -- logo Codex GPT-6 e inequivoco
  - os dois portoes aprovaram os 9 arquivos desta alteracao
  - serie completa de diarios mapeada -- 4 noites com .json e sem .md
nao_verificado:
  - nao existe validador oficial para o ledger de outlier -- conferi a cadeia com script proprio
  - a origem do session_id vazio do feedback 277d4f23 nao foi auditada
  - nao reexecutei o gerador v4 para reproduzir o .json; li o artefato que ele escreveu
  - a automacao das noites de agosto nao foi confirmada -- so o modelo, Terra 5.6
  - nao sei se o portao de suficiencia estava aberto nas quatro noites sem relatorio
  - conductor_model 'Codex GPT-6' no ledger de feedback fica incorreto e nao corrigido
caminhos:
  - reports/agent-calibration/daily/2026-09-10.md
  - reports/agent-calibration/daily/2026-08-29.md
  - reports/agent-calibration/daily/2026-08-30.md
  - reports/agent-calibration/daily/2026-08-31.md
  - reports/agent-calibration/daily/2026-09-01.md
  - reports/agent-calibration/daily/2026-09-06.md
  - reports/agent-calibration/daily/2026-09-07.md
  - reports/agent-calibration/daily/2026-09-08.md
  - reports/agent-calibration/daily/2026-09-10.json
  - reports/agent-calibration/outlier-evidence-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora:
  - registro: handoff-2026-09-11-o-alvo-declarado-e-o-objeto-que-o-github-ainda-serve
    caminhos:
      - reports/REGISTRO-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao.md
    parecer: >-
      Revisado e mantido valido, sem alteracao. Aquele handoff declara ancora
      neste registro e a secao 4 dele afirma duas coisas sobre o fechamento
      automatico -- que o gerador escreve o .json e o diario em markdown e
      autoral de agente, e que a sequencia 5 retem o feedback sem session_id com
      pattern_indexed falso. As duas continuam verdadeiras depois desta edicao.
      O que mudou aqui foi a atribuicao de modelo do diario, de Codex GPT-6 para
      codex@gpt-6-astra, e o handoff nao afirma autoria daquele artefato em
      nenhum ponto -- logo nada nele precisou de emenda. Conferido lendo a secao
      4 inteira, nao por presuncao de que citacao nao afeta ancora.
  - registro: handoff-2026-09-03-sessao-outlier-infraestrutura
    caminhos:
      - reports/agent-calibration/outlier-evidence-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Aquele handoff publicou o outlier 2d55d92a na
      sequencia 3, com disposition de evidencia retida e pattern_indexed falso. A
      entrada nova e a sequencia 5 e o diff tem 1 insercao e 0 remocoes, logo a
      sequencia 3 nao foi tocada -- reli o registro e da7ef222, b39b7431,
      2d55d92a e 512fc3a6 seguem identicos, todos com pattern_indexed falso e a
      mesma disposition. A cadeia SHA-256 fecha em 5 elos. Nada no handoff
      depende da contagem total de entradas, so da sua propria, que permanece.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos:
      - reports/agent-calibration/outlier-evidence-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Aquele registro publicou o outlier da7ef222 na
      sequencia 1 e afirma tres coisas que reconferi uma a uma -- record_type
      outlier, sequencia 1 e pattern_indexed falso. As tres continuam verdadeiras
      depois do append. A tese central dele, de que o ledger de outlier e
      separado do de feedback de proposito, fica reforcada e nao contrariada
      pela entrada nova -- 99da81dc anexa evidencia de um feedback sem
      identificador de sessao sem alterar nota nem inventar sessao, que e
      exatamente o comportamento que aquele registro descreveu.
---

# Registro — o fechamento automático do dia 10, e o outlier sem sessão

## 1. O que apareceu, e por que não fui eu

Ao verificar a limpeza da árvore depois de rodar um script na raiz, encontrei o
`Site` com três alterações que não eram minhas. São o **fechamento automático do
dia local 10/09**, disparado às 23:59:37 local e gravado às 00:00:39 de 11/09:

| Artefato | Natureza |
| :--- | :--- |
| `reports/agent-calibration/daily/2026-09-10.json` | saída do gerador — `schema_version: agent-calibration-evidence/v4` |
| `reports/agent-calibration/daily/2026-09-10.md` | adendo **autoral de agente**, 28 linhas de prosa |
| `reports/agent-calibration/outlier-evidence-ledger.jsonl` | sequência 5, append puro |

Essa divisão confirma a correção que eu mesmo publiquei em
`REGISTRO-2026-09-10-busca-web-como-dado-nao-confiavel.md` §2: o gerador escreve o
`.json` e **não** escreve o diário em markdown. Eu havia afirmado antes o
contrário, corrigi, e o comportamento observado hoje sustenta a correção.

### 1.1 A atribuição estava errada — mas não onde eu procurei

Levantei suspeita de má atribuição **entre as duas execuções** e isso não se
confirmou. A má atribuição é outra, e está **dentro** do campo: ele nomeia o modelo
errado.

O que eu media: o frontmatter declarava `autor: Codex GPT-6 (Tier 1)`, o adendo das
23:59 não se atribui a ninguém, o `.json` do gerador não tem campo de autor, agente
ou modelo, a entrada do ledger de outlier também não, e a mensagem da tarefa das
00:02 vinha rotulada "Auditoria do Astra".

**Respostas do Tier 0, 2026-09-11, em duas etapas — e a segunda inverteu a
conclusão da primeira:**

1. *"Automatização do Codex, Astra não estava em sessão."* Concluí que o campo
   estava correto e escrevi isso aqui. **Errado.**
2. *"Sim, a automação é do Codex, mas o modelo usado foi o Astra."*

**Automação e modelo são eixos distintos, e o campo `autor` fundia os dois.** A
automação é do Codex; o modelo que executou foi o Astra. Declarar
`Codex GPT-6 (Tier 1)` nomeava um modelo — `GPT-6` — que **não rodou**. "Astra não
estava em sessão" é verdade sobre sessão interativa e não sobre execução de modelo;
foi nessa distinção que eu escorreguei, e ela é a mesma que o `conductor_model` do
ledger de feedback existe para manter separada.

**Corrigido para `autor: codex@gpt-6-astra`.** A forma não é invenção: a §7 do
`Site\CLAUDE.md` já fixa a convenção **automação@modelo** no exemplo
`antigravity@gemini-3.8-flash`, e a §8.3 exige o `conductor_model` exato —
`gpt-6-astra` é o identificador que o `MODEL_REGISTRY` usa. O valor anterior era
`Codex GPT-6 (Tier 1)`, e fica registrado aqui porque apagar a string apagaria a
evidência de que o campo já afirmou outra coisa.

**Por que corrigir o arquivo e não só anotar aqui.** A §7 proíbe **reescrever
histórico publicado**, e não é o caso: o commit `c5604220` permanece intacto e a
correção entra adiante, por commit novo. O que a §10.3 me proíbe é alterar o
*instrumento* que me mede — o gerador —, e eu não o toquei. Campo de dado
factualmente errado num relatório é dado, não instrumento.

Este é o mesmo princípio que levou a reemitir o commit do Gemini em 2026-09-10:
**atribuição errada é pior que atribuição ausente.** A ausência declara que não se
sabe; a errada declara algo que não é. O adendo continuar sem autoria própria é
lacuna; o campo nomear o modelo errado era afirmação falsa.

**O que fica declarado e não consertado:** o pipeline não emite campo de autor por
apêndice, nem separa automação de modelo. Corrigir o gerador para isso seria alterar
o instrumento que mede o desempenho do agente, e a §10.3 o proíbe sem autorização
explícita do Tier 0. A correção aqui foi no **dado**, não no instrumento.

## 2. Por que estou commitando artefato que outro agente produziu

O adendo declara, ele próprio, *"nenhum commit ou push"*. Isso descreve o que o
**ciclo de fechamento** faz, não o que deve acontecer com o resultado: os irmãos
`2026-09-08.json` e `2026-09-09.json` estão versionados, e os dois ledgers também.
Arquivo rastreado deixado modificado é o repositório mentindo sobre o próprio
estado — a mesma classe de defeito que consertei três vezes no dia 10.

Não editei o conteúdo de nada. O diário de 10/09 **não tem `atualizado_em`** no
frontmatter, e meu primeiro impulso foi acrescentar, como fiz com `criado_em`
naquele mesmo arquivo no dia anterior. **Não acrescentei**, porque medi primeiro:
o portão de âncora aprovou os três arquivos sem o campo. Logo ele não é exigido
para relatório diário, e a correção seria preferência minha disfarçada de
requisito — dentro de registro alheio.

## 3. O outlier da sequência 5

`99da81dc` anexa evidência de que o feedback `277d4f23`, nota 9,5, foi gravado com
**`session_id` vazio**. O ledger o retém com `pattern_indexed` falso e disposition
`retained-pending-deterministic-review`: preserva a ausência em vez de adivinhar o
identificador. É o comportamento correto — inventar o ID inflaria a contagem de
sessões distintas, que é justamente a métrica que autoriza calibração.

Consequência para a métrica do portão: dos dois feedbacks 9,5 do dia 10, **um não
identifica sessão**. O que tem sessão é `6d4a8598`, de
`claude-opus5-raiz-e-site-2026-09-10`, que registra o mesmo foco em periferia em
detrimento de eficiência já relatado em 08/09.

## 4. O ciclo roda toda noite — e quatro noites não deixaram relatório

O Tier 0 informou em 2026-09-11 que o fechamento das 23:59 ocorre **todas as
noites**. Isso transformou a verificação: o que eu tratava como um arquivo passou a
ser uma série, e série se audita por continuidade.

| Dia | relatório `.md` | artefato `.json` | sessões ativas no dia |
| :--- | :--- | :--- | ---: |
| 2026-08-29 a 09-02 | sim | ausente | — |
| **2026-09-03** | **AUSENTE** | sim | 4 |
| **2026-09-04** | **AUSENTE** | sim | 2 |
| **2026-09-05** | **AUSENTE** | sim | 3 |
| 2026-09-06 a 09-08 | sim | sim | — |
| **2026-09-09** | **AUSENTE** | sim | 0 |
| 2026-09-10 | sim | sim | — |

**Em quatro noites o gerador rodou e o relatório que o passo 7 exige não existe.**
O `.json` prova que a medição aconteceu; a ausência do `.md` diz que a análise não
foi registrada. O passo 2 é explícito: ausência de dado é **resultado válido** e
deve ser escrita literalmente — logo nem dia vazio dispensa o relatório. O 09-09,
com **zero** sessões ativas, é o caso mais defensável dos quatro, e ainda assim o
passo 2 pedia a frase.

**O que eu NÃO afirmo, e a distinção importa.** Não sei se o portão de suficiência
estava aberto naquelas noites. `sessoes_com_feedback_count` é contagem
**acumulada** desde a última calibração, e o critério **diário** depende dos
feedbacks do dia — são escopos diferentes, e confundi-los seria a mesma falha que
este registro documenta em outros lugares. O que a ausência do `.md` custa é
justamente isto: **não há como saber o que foi concluído**, e a trilha que o passo
2 existe para criar tem quatro buracos.

Antes de 09-03 o padrão se inverte: `.md` sem `.json`, porque o gerador v4 ainda
não produzia artefato. Isso não é buraco, é mudança de versão.

### 4.1 A autoria varia, e quatro diários violam a §7

| Dias | `autor` declarado |
| :--- | :--- |
| 08-29 a 09-01 | `chico@v8-gold` |
| 09-02 | `Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-02-pmev` |
| 09-06, 09-07, 09-08 | `Codex GPT-6 (Tier 1)` |
| 09-10 | `codex@gpt-6-astra` (corrigido aqui) |

**Os quatro primeiros assinam como `chico@v8-gold`, e a §7 do `Site\CLAUDE.md`
proíbe exatamente isso:** *"Chico é a identidade do projeto como grupo... O grupo
nunca escreve registro nem commit; quem escreve é um indivíduo dentro dele."* São
quatro registros assinados pelo grupo, e a regra que os proíbe mora no mesmo
repositório.

**Resolvido pelo Tier 0 em 2026-09-11:** *"Astra foi lançado recentemente, então
anteriormente quem fazia era o Terra 5.6."* Com isso os sete campos foram
normalizados à convenção **automação@modelo** da §7, usando os identificadores
canônicos do `MODEL_REGISTRY` — não strings inventadas:

| Dias | antes | depois |
| :--- | :--- | :--- |
| 08-29, 08-30, 08-31, 09-01 | `chico@v8-gold` | `codex@gpt-5.6-terra` |
| 09-06, 09-07, 09-08 | `Codex GPT-6 (Tier 1)` | `codex@gpt-6-astra` |
| 09-10 | `Codex GPT-6 (Tier 1)` | `codex@gpt-6-astra` |

`09-02` ficou intacto: `Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-02-pmev`
já é individual, correto e mais informativo que a forma curta. Uniformizá-lo seria
preferência minha, não correção.

**Dois apoios que tornam isso medição e não inferência.** `gpt-6-astra` é o **único**
`gpt-6` do registro, logo `Codex GPT-6` é inequívoco; e `gpt-5.6-terra` é o
identificador exato do Terra. Verificado por varredura do `llm/model_registry.py`.

**Uma inferência que fica declarada porque não foi confirmada:** o Tier 0 nomeou o
**modelo** de agosto, não a automação. Apliquei o prefixo `codex@` aos quatro por
ser a mesma série de artefato produzida pela mesma tarefa agendada — mas só o modelo
foi confirmado. Se a automação de agosto era outra, o prefixo desses quatro precisa
mudar, e só isso.

### 4.2 O ledger de feedback também nomeia o modelo errado — e eu não o toquei

`conductor_model` aparece no ledger de feedback com três valores distintos:
`claude-opus-5`, `gemini-3.8-flash` e **`Codex GPT-6`**. Os dois primeiros são
identificadores canônicos; o terceiro não é — o canônico é `gpt-6-astra`, e a §8.3
exige o *"modelo condutor exato"*.

**Não corrigi, e a razão é dupla.** O ledger é **append-only**: a §8.3 manda corrigir
por `Record-AgentCalibrationCorrection.ps1`, que anexa registro de correção em vez de
reescrever. E esse ledger é o instrumento que mede o desempenho do agente — anexar
correção nele por iniciativa própria é precisamente o que a §10.3 reserva ao Tier 0.
**Fica declarado, não consertado.**

## 5. Um vazio declarado

**Não existe validador oficial para o ledger de outlier.** Há
`Test-AgentCalibrationLedger.ps1` para o de feedback, e nenhum `Test-*.ps1`
menciona outlier. Conferi a cadeia com script próprio e ela fecha em 5 elos, mas
isso é verificação minha, não controle do projeto — e controle que não existe não
passa a existir porque alguém conferiu à mão uma vez. Fica declarado, sem
conserto: criar o validador hoje seria eu construindo o instrumento que mede o meu
próprio registro, e a §10.3 não permite.
