---
id: registro-2026-09-09-upgrade-pwsh-e-harmonizacao
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T05:00:00-03:00
atualizado_em: 2026-09-09T07:40:00-03:00
classes: [interno, medido, ambiente, powershell]
caminhos:
  - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    LINHA DE BASE, passo 1 da Tarefa 11: pwsh 7.6.5, edicao Core, em
    C:/Program Files/PowerShell/7/pwsh.exe. Windows PowerShell 5.1.26100.9278
    presente. Copias guardadas em %TEMP% -- pwsh-versao-antes.txt,
    winget-antes.txt e tarefas-antes.json.
  - >-
    TAREFAS AGENDADAS: uma unica usa o pwsh 7 --
    NexusSOTA-AgentCalibrationDailyEvaluation, apontando para o caminho absoluto
    C:/Program Files/PowerShell/7/pwsh.exe. As outras quatro
    (ChromeDev_Memory_Watchdog_SOTA, Codex_Restart_Once, SOTA_CDP_AutoStart,
    SOTA_Weekly_Maintenance) usam powershell.exe, o 5.1.
  - >-
    PASSO 2 RESOLVIDO -- A DUPLICATA E DE REGISTRO, NAO DE INSTALACAO. Ha uma
    UNICA instalacao fisica: Get-ChildItem em C:/Program Files/PowerShell
    devolve apenas o diretorio 7. As duas entradas que o winget lista
    correspondem a duas chaves de desinstalacao no registro --
    "PowerShell 7-x64" e "PowerShell 7.6.5.0-x64" --, ambas na versao 7.6.5.0 e
    ambas sem InstallLocation. Nao ha instalacao lado a lado, e portanto nao ha
    nada a remover.
  - >-
    PASSO 3, LINHA DE BASE DO PORTAO com a pagina aquecida: LCP_MS 329,61 ms
    [PASS], PY_CVE_ABERTAS 0 [PASS], RuffFormat 0 [PASS], Total de Erros 0,
    Total de Warnings 1, Status FRAGIL (AMARELO). O unico warning e o de TBT sem
    artefato Lighthouse certificado, ja conhecido e anterior a esta tarefa.
  - >-
    SUITE NA LINHA DE BASE: 1036 passed, 1 skipped, zero warnings.
  - >-
    PASSO 4 EXECUTADO E SEM EFEITO, POR INDISPONIBILIDADE NA ORIGEM:
    `winget upgrade --id Microsoft.PowerShell --exact --silent` devolve "Nenhuma
    atualizacao disponivel foi encontrada. Nenhuma versao de pacote mais recente
    esta disponivel nas origens configuradas."
  - >-
    CONFIRMADO POR DUAS VIAS INDEPENDENTES: `winget show --id
    Microsoft.PowerShell --exact` reporta "Versao: 7.6.5.0" como a mais recente
    conhecida, e a tentativa explicita `winget install --version 7.6.6.0`
    devolve "Nenhuma versao correspondente foi encontrada: 7.6.6.0".
  - >-
    A CAUSA MEDIDA NA FONTE: a API do GitHub devolve v7.6.6 como release estavel
    mais recente, publicada em 2026-09-08 -- ontem. As v7.5.11 e v7.4.20 sairam
    no mesmo dia; a v7.6.5 instalada aqui e de 2026-08-14. O aviso do proprio
    PowerShell consulta o GitHub; o winget depende de um manifesto que ainda nao
    foi indexado.
  - >-
    CORRECAO DA CONCLUSAO ACIMA, medida na segunda tentativa: o manifesto EXISTIA
    na origem. O que estava desatualizado era a COPIA LOCAL do indice. Depois de
    `winget source update`, `winget show --id Microsoft.PowerShell --exact`
    passou a reportar "Versao: 7.6.6.0". Dizer "o winget ainda nao indexou" foi
    impreciso -- indice local velho e manifesto ausente na origem sao coisas
    diferentes, e eu afirmei a segunda.
  - >-
    A DUPLICATA DE REGISTRO NAO E BENIGNA -- ELA BLOQUEIA O UPGRADE. Medido apos
    o source update, `winget list --id Microsoft.PowerShell --exact` devolve
    "PowerShell / 7.6.6.0" numa entrada e "PowerShell 7.6.5.0-x64 / 7.6.5.0" na
    outra. A primeira reporta uma versao que o DISCO NAO TEM: pwsh.exe em
    C:/Program Files/PowerShell/7 continua em 7.6.5, SHA
    ea554a8f9c6085f54fb2828f7ea286c65c35599f, com LastWriteTime de 2026-08-11
    23:21:18. Por isso `winget upgrade` responde "Nenhuma atualizacao
    disponivel": ele compara o registro (7.6.6.0) com a origem (7.6.6.0) e
    conclui que esta em dia.
  - >-
    TRES INSTALACOES REPORTARAM EXITO SEM SUBSTITUIR O BINARIO:
    `winget install --version 7.6.6.0 --force` desta sessao, uma execucao
    equivalente do proprio Tier 0 no terminal dele, e ambas com "Hash do
    instalador verificado com exito" e "Instalado com exito". O disco permaneceu
    em 7.6.5 nas tres.
  - >-
    NAO HA REINICIO PENDENTE: a chave PendingFileRenameOperations em
    HKLM:SYSTEM/CurrentControlSet/Control/Session Manager NAO existe. O
    instalador nao agendou a troca para o proximo boot -- ele saiu reportando
    exito sem substituir nem agendar.
  - >-
    NOVE PROCESSOS pwsh.exe EM EXECUCAO seguram o binario, e a identificacao
    deles muda a decisao: SETE tem o mesmo processo pai (6296) e sao terminais
    integrados do Antigravity IDE, isto e, a sessao de trabalho do Tier 0; um era
    o sentinela de delecoes desta sessao (encerrado por mim e religado depois); e
    um era a propria ferramenta que executava a medicao.
  - >-
    MSI OFICIAL BAIXADO E VERIFICADO: PowerShell-7.6.6-win-x64.msi, 113 MB,
    SHA-256 958838ff55091e1c8705d89efed0cc7e8245a3a6ef6c0ccfae20015227108ad8,
    obtido da release v7.6.6 em github.com/PowerShell/PowerShell por HTTPS.
  - >-
    O CAMINHO QUE RESTAVA FOI RECUSADO PELO TIER 0: a instalacao por msiexec com
    MSIRESTARTMANAGERCONTROL=Disable -- que faria o Windows Installer agendar a
    substituicao para o proximo reinicio em vez de pular os arquivos em uso --
    nao foi autorizada. Ela nao foi executada.
nao_verificado:
  - >-
    O UPGRADE NAO FOI CONCLUIDO. O passo 5 foi executado e devolveu 7.6.5 -- o
    binario nao mudou. Os passos 6, 7 e 8 nao foram executados, porque
    revalidar portao e suite contra uma versao que nao mudou nao mede nada.
    Eles seguem validos e esperam a substituicao efetiva do binario.
  - >-
    Nao removi nenhuma das duas chaves de desinstalacao, e nao removeria sem
    autorizacao: mexer no registro de instalacao e irreversivel sem backup, e a
    chave que mente e justamente a que o winget usa para decidir upgrades.
  - >-
    Nao instalei o MSI do GitHub, e a recusa e deliberada: ver o corpo.
  - >-
    Nao medi se o parser do pwsh 7.6.6 trata algum construto de modo diferente
    do 7.6.5. Isso e o passo 6, e so faz sentido depois do upgrade.
referencias_nao_resolviveis: []
---

# Upgrade do PowerShell: o instalador diz exito, e o disco nao muda

## O que foi feito

Os passos 1 a 3 da Tarefa 11 estao **executados e registrados**. O passo 4 foi
executado e **nao teve efeito**, por um motivo que a medicao explica.

## Passo 2: a duplicata era de registro, nao de instalacao

Este era o risco que o plano mandava resolver **antes** do upgrade, e ele se
dissolveu na medicao:

| Evidencia | Resultado |
| :--- | :--- |
| `Get-ChildItem 'C:\Program Files\PowerShell' -Directory` | **um unico** diretorio: `7` |
| Chaves de desinstalacao no registro | **duas**: `PowerShell 7-x64` e `PowerShell 7.6.5.0-x64` |
| Versao das duas | a mesma, `7.6.5.0`, ambas sem `InstallLocation` |

Uma instalacao fisica, dois registros. E o cenario benigno que o plano previa --
*"se as duas entradas apontarem para a mesma instalacao, e registro duplicado e
o upgrade normal resolve"*. **Nao ha nada a remover**, e a hipotese de
instalacao lado a lado, que teria voltado ao Tier 0, esta descartada.

## Passo 4: o comando rodou, e a origem nao tem a versao

```
winget upgrade --id Microsoft.PowerShell --exact --silent
-> Nenhuma atualizacao disponivel foi encontrada.
```

Confirmado por duas vias independentes, porque uma so nao bastaria:

- `winget show --id Microsoft.PowerShell --exact` reporta **`Versao: 7.6.5.0`**
  como a mais recente que ele conhece, e aponta as notas da `v7.6.5`;
- `winget install --version 7.6.6.0` devolve **"Nenhuma versao correspondente
  foi encontrada"**.

A causa esta na fonte. A API do GitHub devolve:

| release | publicado |
| :--- | :--- |
| `v7.6.6` | **2026-09-08** -- ontem |
| `v7.5.11`, `v7.4.20` | 2026-09-08 |
| `v7.6.5` (instalada aqui) | 2026-08-14 |

O aviso que o Tier 0 recebeu vem do proprio PowerShell, que consulta o GitHub. O
winget depende de um manifesto na comunidade de pacotes, e ele ainda nao foi
indexado -- o intervalo de horas a dias e o normal para um release de um dia.

**Nao houve falha: houve ausencia de versao na origem que governa esta
instalacao.**

## Por que NAO instalei o MSI do GitHub

O MSI existe e funcionaria. A recusa e deliberada, e o motivo saiu da propria
medicao do passo 2.

Hoje a instalacao e **governada pelo winget** -- a coluna `Origem` diz `winget`
nas duas entradas. Instalar por fora criaria estado que o gerenciador nao
gerencia, e faria isso justamente num ambiente que **ja tem duas chaves de
desinstalacao** para uma instalacao. O resultado provavel seria uma terceira, e
um `winget upgrade` futuro passando a divergir do que esta no disco.

Trocar um patch de um dia por essa desordem seria otimizar a metrica errada. A
secao 8.2 do CLAUDE.md chama isso de reducao material disfarcada de melhoria; a
escada dela manda preservar a capacidade e corrigir a causa concreta -- e a
causa concreta aqui e temporal, nao estrutural.

## O que fica pronto para a proxima execucao

Nada precisa ser reescrito. O comando do passo 4 e o mesmo, e os passos 5 a 8 --
verificar o caminho da tarefa agendada, revalidar portao e suite contra a linha
de base acima, confirmar o 5.1 e o rollback declarado -- seguem validos como
estao no plano.

**A linha de base ja esta medida**, que era a parte que nao podia ser feita
depois: portao com 0 erros e 1 warning, suite em 1036 passed, e a tarefa
`NexusSOTA-AgentCalibrationDailyEvaluation` apontando para
`C:\Program Files\PowerShell\7\pwsh.exe`. Sem esses numeros, o passo 6 nao teria
contra o que comparar.

**Nao criei script de verificacao de versao.** `winget upgrade` ja e o
mecanismo, e um wrapper sem consumidor no fluxo de runtime e o que a secao 4 da
raiz chama de entropia -- capacidade de fachada. Quando o manifesto for
indexado, o comando do plano roda como esta.

## EMENDA DE 2026-09-09, SEGUNDA TENTATIVA -- eu estava errado, e o achado e outro

O Tier 0 mandou tentar de novo. A segunda tentativa **refutou a minha
conclusao** e encontrou um defeito real no ambiente.

### Primeiro erro meu: indice local nao e a origem

Bastou `winget source update`:

```
Atualizando fonte: winget... Concluido
winget show --id Microsoft.PowerShell --exact  ->  Versao: 7.6.6.0
```

O manifesto **existia**. O que estava velho era a **copia local do indice**.
Escrevi "o winget depende de um manifesto que ainda nao foi indexado" -- afirmei
ausencia na origem quando o que havia era indice local desatualizado. Sao coisas
diferentes, e a primeira nao estava medida.

### Segundo erro meu: a duplicata NAO era benigna

Eu havia concluido, no passo 2, que as duas entradas eram "registro duplicado, e
o upgrade normal resolve". Medido depois do `source update`:

| fonte | versao |
| :--- | :--- |
| `winget list`, entrada 1 | **7.6.6.0** |
| `winget list`, entrada 2 | 7.6.5.0 |
| `pwsh.exe` no disco | **7.6.5** |
| `LastWriteTime` do binario | 2026-08-11 23:21:18 -- intocado |

A primeira entrada **reporta uma versao que o disco nao tem**. E e por isso que
`winget upgrade` responde *"Nenhuma atualizacao disponivel"*: ele compara o
registro (7.6.6.0) com a origem (7.6.6.0) e conclui, corretamente do ponto de
vista dele, que esta em dia.

**A duplicata nao e cosmetica: ela mente para o gerenciador e bloqueia o
upgrade.** Meu parecer anterior de que nao havia nada a fazer ali estava errado.

### O instalador diz exito e nao substitui nada

Tres execucoes -- `winget install --version 7.6.6.0 --force` desta sessao, e uma
equivalente do proprio Tier 0 no terminal dele -- reportaram:

```
Hash do instalador verificado com exito
Iniciando a instalacao do pacote...
Instalado com exito
```

E o disco permaneceu em **7.6.5**, mesmo SHA, mesmo `LastWriteTime`.

Nao ha reinicio pendente: `PendingFileRenameOperations` **nao existe** no
registro. O instalador nao substituiu **nem agendou** -- saiu declarando exito.

### Por que: nove processos seguram o binario, e sete sao seus

| processos `pwsh.exe` | o que sao |
| ---: | :--- |
| **7** (pai `6296`) | terminais integrados do **Antigravity IDE** -- a sua sessao |
| 1 | o sentinela de delecoes que eu subi |
| 1 | a propria ferramenta que executava a medicao |

Encerrar os sete seria derrubar a sua sessao de trabalho. **Nao fiz, e nao
faria** -- e o "quebrar algo" que a autorizacao excluia.

### O que ficou pronto, e o que falta

O MSI oficial esta baixado e verificado: `PowerShell-7.6.6-win-x64.msi`, 113 MB,
SHA-256 `958838ff55091e1c8705d89efed0cc7e8245a3a6ef6c0ccfae20015227108ad8`, da
release `v7.6.6` no GitHub por HTTPS.

O caminho que restava -- `msiexec` com `MSIRESTARTMANAGERCONTROL=Disable`, que
faria o Windows Installer **agendar** a troca para o proximo reinicio em vez de
pular os arquivos em uso -- **foi recusado pelo Tier 0 e nao foi executado**.

Restam tres caminhos, e todos passam por liberar o binario:

1. **Fechar os terminais do Antigravity IDE** e reexecutar o instalador. E o
   menos invasivo dos tres, e resolve sem reiniciar a maquina.
2. **Reiniciar a maquina** e instalar antes de abrir o IDE.
3. **Autorizar o agendamento por `MSIRESTARTMANAGERCONTROL=Disable`**, que troca
   o binario no proximo boot sem fechar nada agora.

O que **nao** funciona, e ja esta medido tres vezes, e reexecutar o instalador
com os processos de pe: ele reporta exito e nao faz nada.

### O que a linha de base garante

Os passos 1 a 3 seguem valendos e nao precisam ser refeitos: portao com 0 erros
e 1 warning, `LCP_MS` 329,61 ms, suite em 1036 passed, e a tarefa
`NexusSOTA-AgentCalibrationDailyEvaluation` apontando para
`C:\Program Files\PowerShell\pwsh.exe`. Quando a substituicao ocorrer, os
passos 5 a 8 tem contra o que comparar.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** executar e registrar os passos 1 a 4 da Tarefa 11, estabelecendo
a linha de base que a revalidacao exigira, e declarar por que o upgrade nao
ocorreu e por que nao foi forcado por fora do gerenciador.
