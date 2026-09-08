---
id: registro-2026-09-08-forense-das-delecoes-e-o-sentinela
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-contraste"
criado_em: 2026-09-08T17:40:00-03:00
atualizado_em: 2026-09-08T17:40:00-03:00
classes: [interno, medido, forense, observabilidade]
caminhos:
  - scripts/ops/sentinela_delecoes.ps1
  - tests/test_sentinela_delecoes.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
  volume: 'C: NTFS com journal USN ativo (32 MB, ID 0x01d525c7808fd9d8)'
verificado:
  - >-
    DELECAO DATADA PELO JOURNAL USN: 08/09/2026 16:05:19, razao 0x80000200
    (FILE_DELETE | CLOSE). Recriacao as 16:09:01 com File Reference Number
    diferente (...02f66b -> ...0c1f3c), que bate no MESMO SEGUNDO com o
    `git checkout --` registrado no transcrito da sessao em 19:09:01 UTC.
    Duas fontes independentes fecham a linha do tempo.
  - >-
    ATOR FORA DO REPOSITORIO: no registro USN imediatamente anterior cai
    logs/task_executor.log. Medido por grep em todo o codigo -- nenhuma linha
    deste repositorio apaga esse arquivo; a unica referencia e a criacao em
    task_executor.py:103.
  - >-
    ONZE CANDIDATOS DESCARTADOS COM MEDICAO, um a um, listados na secao 3.
    Inclui todos os scripts de limpeza do repositorio e da raiz, as tarefas
    agendadas nao-Microsoft, stash orfao (git stash list e git reflog stash
    ambos vazios) e o mecanismo SUPERSEDED.
  - >-
    A SUITE NAO E A CAUSA: tres reproducoes, todas negativas -- suite completa
    de 993 testes, o teste isolado que roda o portao, e o modulo inteiro com a
    arvore suja como estava no dia.
  - >-
    O SENTINELA CAPTURA: teste funcional com isca, executado e aprovado. A
    primeira versao (FileSystemWatcher) NAO capturava e teria passado por boa
    sem ele. Suite de 7 testes, 7 passed em 15,31 s.
  - >-
    EXTENSOES DO GOOGLE CLOUD PRESENTES: googlecloudtools.cloudcode-2.41.0,
    google.geminicodeassist-2.101.0-insiders.0 e googlecloudtools.datacloud-0.10.0
    instaladas em .antigravity-ide\extensions, com cloudcode.log escrito no
    mesmo segundo, segundo o USN.
nao_verificado:
  - >-
    A CAUSA DAS TRES DELECOES SEGUE DESCONHECIDA. O journal USN nao grava
    processo, e essa e a limitacao do instrumento. Nomear um processo exigiria
    Sysmon ou Process Monitor -- mudanca de sistema que NAO foi feita e nao foi
    autorizada.
  - >-
    A ATRIBUICAO DO TIER 0 A EXTENSAO DO GOOGLE CLOUD NAO FOI CONFIRMADA. Ha
    lastro circunstancial (extensoes instaladas, logs escritos no mesmo
    segundo), e nao ha prova. Declarada como hipotese de trabalho, na forma que
    a secao 8.2 exige: investigar primeiro o mecanismo da origem atribuida.
  - >-
    O DELTA DE CPU NAO PROVA AUTORIA. Na isca de controle o autor real (um
    pwsh) aparece na lista, mas o Antigravity IDE lidera o ranking mesmo sem ter
    apagado nada, por estar sempre ocupado.
  - >-
    O SENTINELA NAO SOBREVIVE A REBOOT, de proposito. Registrar tarefa agendada
    e mudanca de sistema e exige autorizacao que nao foi pedida.
  - >-
    NAO MEDI as ocorrencias de 03/09 e 07/09 pelo USN. O journal tem 32 MB e
    rotaciona; so a de 08/09 ainda estava nele.
---

# Forense das delecoes e o sentinela

## 1. A pergunta

Por que o mesmo documento sumiu tres vezes. `.claude/RELATORIOS/INVENTARIO_FERRAMENTAS.md`
desapareceu do working tree em 03/09, 07/09 e 08/09, **sem commit em nenhuma delas**,
e foi restaurado do indice as tres vezes. Duas sessoes registraram `cause unknown`.

## 2. O que ficou provado

**A delecao e real e datada.** O journal USN do NTFS registra, em
`08/09/2026 16:05:19`, razao `0x80000200` -- `FILE_DELETE | CLOSE`. A recriacao
as `16:09:01` traz File Reference Number **diferente** (`...02f66b` para
`...0c1f3c`): o arquivo foi destruido e outro nasceu no lugar, o que bate com o
`git checkout --` que o transcrito da sessao registra em `19:09:01 UTC` -- o
mesmo segundo. Duas fontes independentes fecham a linha do tempo.

**O ator esta fora do repositorio.** No registro USN IMEDIATAMENTE anterior cai
`logs/task_executor.log`. Sao dois arquivos em dois diretorios distintos,
apagados consecutivamente. Medido por grep em todo o codigo: **nenhuma linha
deste repositorio apaga `task_executor.log`** -- a unica referencia e a criacao
em `task_executor.py:103`.

**Nao foi varredura por status de versionamento.** `logs/task_executor.log` e
ignorado pelo git; `INVENTARIO_FERRAMENTAS.md` e rastreado. Tambem nao foi
atributo de arquivo: a compressao NTFS vale para o repositorio inteiro.

## 3. O que foi descartado, com medicao

| Candidato | Como caiu |
| :--- | :--- |
| Commit no historico | `a22df57e` e o unico com `--diff-filter=D` no caminho; as tres nao tem commit |
| `sota_entropy_sanitizer.py` | varre so temp, sqlite e logs rotacionados |
| `core/autopoiesis_engine.py` | purga `pytest_*` e `*.tmp` da raiz |
| `weekly-maintenance.ps1` da raiz | so `$env:TEMP` e `SystemRoot\Temp` |
| `purify_memories_ascii.py` | alvos sao `agent-memory`, `reports`, `docs` |
| `apply_sanitize.py` | **nunca rodou**: sem `archive/auto_archived`, sem candidatos, sem log |
| `watchdog-chrome-memory.ps1` | so chama `EmptyWorkingSet`; nao toca disco |
| Tarefas agendadas | nenhuma nao-Microsoft grava no repositorio |
| `git stash` orfao | `git stash list` e `git reflog stash` ambos vazios |
| Mecanismo `SUPERSEDED` | exclui da ingestao RAG; nao apaga arquivo |
| Comando nos transcritos | 83 MB varridos: so restauracoes, nenhuma delecao |
| **A suite de testes** | **tres reproducoes negativas** -- ver §4 |

## 4. A suite nao e a causa, e isso tambem e resultado

A correlacao temporal era forte: o USN mostra os diretorios temporarios
`test_lighthouse_input_fingerpr0` e `test_lighthouse_fingerprint_cl0` nascendo
as `16:05:10-11`, o teste seguinte do modulo leva 8,03 s medidos, e 11 + 8 = 19.

Coincidencia de relogio nao e causa. Tres tentativas de reproducao:

| Tentativa | Resultado |
| :--- | :--- |
| Suite completa, 993 testes | arquivo intacto |
| So `test_gate_reads_only_a_hash_bound_lighthouse_tbt_artifact` | intacto |
| Modulo inteiro com a arvore **suja**, como estava no dia | intacto |

A suite estava rodando naquele segundo; nao foi ela que apagou.

## 5. A atribuicao, e o que ela ainda nao e

O Tier 0 atribui a origem a extensao do Google Cloud, que reaparece
persistentemente como extensao do ambiente. A §8.2 manda investigar primeiro o
mecanismo da origem atribuida, e a investigacao encontrou lastro: as extensoes
`googlecloudtools.cloudcode-2.41.0`, `google.geminicodeassist-2.101.0-insiders.0`
e `googlecloudtools.datacloud-0.10.0` estao instaladas em
`.antigravity-ide\extensions`, e o USN mostra `cloudcode.log`,
`Antigravity IDE.log`, `Codex.log` e `language_server.log` sendo escritos no
mesmo segundo.

**Isso nao prova autoria.** O journal USN nao grava processo, e a limitacao e do
instrumento. Nomear um processo exigiria Sysmon ou Process Monitor, que e
mudanca de sistema e nao foi feita.

## 6. O instrumento, e o que ele custou para ficar honesto

`scripts/ops/sentinela_delecoes.ps1` vigia as duas pastas e, ao ver o sumico,
registra o instante e os processos que **gastaram CPU na janela**.

Duas versoes foram descartadas por medicao, nao por gosto:

1. **`FileSystemWatcher` com `Register-ObjectEvent`** -- nao capturou a isca de
   teste. Falhou em **silencio**: pareceria ligado e nao registraria nada. E a
   pior classe de falha para instrumento de medicao, porque produz confianca sem
   lastro.
2. **Retrato absoluto de processos** -- devolveu **240** processos e nao apontou
   ninguem. Trocado por delta de CPU no intervalo.

**O limite, declarado no proprio script:** delta de CPU e **indicio, nao prova**.
Na isca de controle o autor real era um `pwsh` e ele aparece na lista -- mas o
`Antigravity IDE` lidera o ranking mesmo assim, porque esta sempre ocupado. O que
fecha atribuicao e padrao repetido entre ocorrencias, nao leitura isolada.

`tests/test_sentinela_delecoes.py` guarda sete propriedades, entre elas a que
importa: a isca some e o registro aparece. Sem ela, a versao silenciosa teria
passado por boa.

## 7. O que continua aberto

A causa das tres delecoes. O sentinela nao a responde -- ele **prepara a quarta
ocorrencia para ser medida** em vez de inferida. Nao sobrevive a reboot, de
proposito: registrar tarefa agendada e mudanca de sistema e exige autorizacao.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** fixar o que a forense do journal USN provou, o que ela descartou
com medicao, e entregar o instrumento que transforma a proxima ocorrencia em
evidencia com processo, sem afirmar autoria que o instrumento nao alcanca.
