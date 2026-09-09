---
id: handoff-2026-09-09-verde-nos-dois-portoes
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T12:45:00-03:00
atualizado_em: 2026-09-09T12:45:00-03:00
classes: [interno, medido, handoff, ci, portao]
caminhos:
  - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/lighthouse_cwv_audit.mjs
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.6'
verificado:
  - >-
    CI VERDE NOS QUATRO JOBS em 49d103d1: Python Lint & Pytest Matrix 3.12 e
    3.13, Frontend TypeScript & Next.js Build, e Security Headers & Architecture
    Quality Gate. Eram 8 de 8 execucoes falhando quando a sessao comecou.
  - >-
    PORTAO LOCAL VERDE, HOMEOSTASE TOTAL: 0 erros e 0 warnings nas 5 fases.
    Comecou a sessao em FRAGIL com 2 warnings, no teto de 2. TBT_MS 0 [PASS],
    LCP_MS 357,83 [PASS], AXE_INCOMPLETE 1 [REVIEW APPROVED], PY_CVE_ABERTAS 0
    [PASS], RuffFormat 0 [PASS], PowerShell51 0 [PASS].
  - >-
    SUITE PYTHON: 1060 passed, 1 skipped, zero warnings, rodada pelo PowerShell.
    Eram 1020 na abertura da sessao.
  - >-
    SUITE DE FRONTEND: 34 suites, 264 testes, guard em SUCESSO (VERDE).
  - >-
    POWERSHELL 7.6.6 instalado, com o caminho canonico
    C:/Program Files/PowerShell/7/pwsh.exe preservado e a tarefa
    NexusSOTA-AgentCalibrationDailyEvaluation apontando para ele, Test-Path True
    e estado Ready. Windows PowerShell 5.1.26100.9278 intacto.
  - >-
    ESTADO DO GIT no fechamento: ahead 0, HEAD em 49d103d1. Tres arquivos fora
    do commit -- .claude/settings.json e .vscode/settings.json, modificados
    desde ANTES desta sessao, e dois daily/ da calibracao que a tarefa agendada
    gerou.
  - >-
    INFRAESTRUTURA DE PE: sentinela de delecoes ATIVO no pid 13560, portas 3000
    e 9222 em LISTEN, 9223 livre.
  - >-
    JSONL DO SENTINELA: 4 linhas, TODAS ISCAS de validacao. Nenhum evento real
    de delecao foi capturado nesta sessao.
  - >-
    AUTORIA: todos os commits desta sessao conferidos com git log --format antes
    de cada push, saindo como Claude Opus 5 <noreply@anthropic.com>. O git config
    do repositorio segue apontando para outra linhagem, e a identidade foi
    nomeada em cada chamada com git -c.
nao_verificado:
  - >-
    Nao rodei a skill security-review em nenhum commit desta sessao.
  - >-
    Nao investiguei as 3 vulnerabilidades que o Dependabot reporta (1 high, 2
    moderate) e que nem npm audit nem pip-audit acusam. Terceira fonte de CVE,
    aberta.
  - >-
    Nao removi a entrada orfa "PowerShell 7.6.5.0-x64" do registro do Windows.
    Ela aponta para versao que nao existe mais no disco; era ela que bloqueava o
    upgrade. Mexer em chave de desinstalacao e irreversivel sem backup.
  - >-
    Nao executei as Tarefas 5, 7 e 8 do plano, nem os achados B06, B07, B08,
    B09, F03, F05 e F06 do Astra. Apenas o B05, unico P1, foi fechado.
  - >-
    Nao verifiquei o comportamento do probe com o tinamind-app AUSENTE, nem
    identifiquei qual das extensoes o injeta.
referencias_nao_resolviveis: []
---

# Verde nos dois portoes

## O estado

```
CI:      success x 4 jobs        (era 8 de 8 falhando)
Portao:  0 erros, 0 warnings     (era FRAGIL, 2 warnings no teto)
Suite:   1060 passed             (eram 1020)
pwsh:    7.6.6                   (era 7.6.5)
```

`ahead 0`, HEAD em `49d103d1`.

## O que foi fechado

**As seis causas do CI vermelho**, cinco delas escondidas atras umas das outras:
`ruff format` reprovando 10 arquivos; bindings WASM defasados; o `.wasm`
irreproduzivel entre plataformas; `prisma generate` que nunca rodava; testes
presos ao Windows e ao ledger da maquina; e o `actionlint` validando workflow de
submodulo.

**Os dois warnings do portao.** O `aria-hidden-focus` vinha de `tinamind-app`,
DOM injetado pelas extensoes SOTA COCKPIT e NANO TAB -- `git grep` nao acha
"tinamind" em lugar nenhum do repositorio. E o TBT nao certificava porque
`next-env.d.ts`, arquivo gerado que grava qual comando rodou por ultimo,
expirava o fingerprint a cada `npm run dev`.

**Mais:** o upgrade do PowerShell para 7.6.6; o `B05` do Astra, unico P1, que
era maior que o finding -- seis campos sem limite, nao um; 5,5 GB de worktrees;
a cobertura de CVE Python na fase 3; e o `ruff format` no pre-commit.

## O padrao, que e o que vale levar

Seis instrumentos mediam uma coisa e eram lidos como se medissem outra:

| instrumento | media | era lido como |
| :--- | :--- | :--- |
| fase 3 do portao | `npm audit` | "CVE zero" |
| handshake CDP | "a porta responde" | "a porta mede LCP" |
| `skipif` dos testes | `pwsh` no PATH | "roda no Windows" |
| guard do TimesFM | o ledger daquela maquina | o contrato do script |
| `actionlint` | workflow de submodulo | nosso CI |
| `axe` | DOM de extensao | acessibilidade do projeto |

**Nenhum estava quebrado.** Todos respondiam corretamente a pergunta que lhes
era feita -- que nao era a pergunta que se supunha. E o `winget` fez pior: rodou
o MSI, recebeu 1603, e reportou "Instalado com exito".

## O que fica aberto, em ordem de prontidao

1. **Entrada orfa no winget** -- `PowerShell 7.6.5.0-x64` aponta para versao
   inexistente. Era ela que bloqueava o upgrade. Chave de desinstalacao e
   irreversivel sem backup; decisao do Tier 0.
2. **Tarefa 5** -- `next-env.d.ts` segue versionado e oscilando. Deixou de
   expirar o certificado, entao virou apenas ruido de commit.
3. **Achados do Astra:** `B06`, `B07`, `B08`, `B09` e `F06` abertos; `F03` e
   `F05` nao conclusivos.
4. **Tarefa 7** -- a branch `chore/submodule-ownership-rationalization`, `behind
   294`. Com a fronteira do actionlint restabelecida, `gemini-cli-security`
   perdeu seu unico consumidor versionado, e a recomendacao volta a valer para
   os seis submodulos.
5. **Tarefa 8** -- o Jules devolve 401 e exige OAuth2. Envolve credencial.
6. **As 3 vulnerabilidades do Dependabot** que nem `npm audit` nem `pip-audit`
   veem. Terceira fonte, nao investigada.
7. **A calibracao assistida** -- o portao da secao 8.3 segue ABERTO, com 17
   sessoes distintas e nenhuma calibracao registrada.

## Advertencias de metodo, cada uma paga com um erro desta sessao

**Valide o workflow, nao o comando.** Rodei `actionlint` no caminho enumerado e
deu verde; o CI reprovou o mesmo passo, porque o `actionlint` roda `shellcheck`
**dentro** dos blocos `run:`.

**Confira em qual porta o instrumento mede.** Atribui um warning a dev server
frio e gravei a causa na memoria antes de tentar refutar. Eu media pela 9222; o
portao media pela 9223.

**`grep` de disco nao e `git grep`.** Concluí que nenhum submodulo tinha
consumidor; o indice mostrava o contrario.

**Confirme de qual run e o veredito.** Duas vezes li o resultado de um run
anterior como se fosse do commit recem-enviado. Filtrar por `headSha` resolve.

**Toda correcao precisa de contraprova de escopo.** A exclusao do fingerprint
passou no teste de estabilidade -- e so a contraprova, com uma isca em
`prisma.ts`, mostrou que ela nao era ampla demais.

**Uma correcao que passa pelo motivo errado e pior que nenhuma.** A primeira
exclusao do axe funcionou no teste, e por acaso: ela removia o
`next-route-announcer`, do proprio Next.js, e o resultado vinha de outra causa.

**Plausibilidade nao e medicao.** Atribui a falha do MSI aos nove processos
`pwsh` em uso. Existiam, e nao eram a causa: o instalador parava antes, na
elevacao.

**A isca nao e opcional.** A primeira versao da verificacao de formatacao
imprimia `FAIL` e devolvia `Total de Erros: 0`.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** entregar a proxima sessao com CI e portao verdes, o padrao que
atravessou a sessao nomeado, e a fila aberta em ordem de prontidao.
