---
id: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T04:40:00-03:00
atualizado_em: 2026-09-09T05:20:00-03:00
classes: [interno, medido, ci, fronteira]
caminhos:
  - .github/workflows/sota-ci.yml
  - package.json
  - tests/test_actionlint_fronteira_do_submodulo.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    MARCO MEDIDO EM 038b239e: os TRES jobs principais do CI ficaram verdes pela
    primeira vez -- Frontend TypeScript & Next.js Build SUCCESS, Python Lint &
    Pytest Matrix 3.12 SUCCESS e 3.13 SUCCESS.
  - >-
    O QUARTO JOB RODOU PELA PRIMEIRA VEZ: Security Headers & Architecture
    Quality Gate depende dos anteriores e ficava skipped enquanto eles
    reprovavam. Ele falhou no passo Actionlint.
  - >-
    CAUSA: o passo validava
    skills/gemini-cli-security/.github/workflows/gemini-review.yml, que acusa
    'property "additional_context" is not defined in object type {}' nas linhas
    68 e 134.
  - >-
    O ARQUIVO NAO E VERSIONADO POR ESTE REPOSITORIO:
    git ls-files --error-unmatch sobre ele devolve "did not match any file(s)
    known to git". O caminho esta dentro do gitlink skills/gemini-cli-security,
    cujo commit registrado e 2227f3cf7150972baac695b8233abc2186408538.
  - >-
    CORRECAO APLICADA: o passo passa a enumerar por
    git ls-files '.github/workflows/*.yml' '.github/workflows/*.yaml', que nunca
    entra em submodulo. Medido localmente: a enumeracao devolve exatamente
    .github/workflows/sota-ci.yml.
  - >-
    ACTIONLINT COM A NOVA ENUMERACAO: exit 0, sem achados. Rodado exatamente
    como o CI roda, com uv run --with actionlint-py.
  - >-
    GUARDA CONTRA FALSO VERDE: o passo traz `test -n "$WORKFLOWS"` antes de
    invocar o actionlint. Sem isso, uma enumeracao vazia passaria zero
    argumentos e o comando sairia 0 sem ter medido nada.
  - >-
    O SCRIPT NPM lint:workflows foi alinhado ao passo do CI. Portao local e CI
    que verificam coisas diferentes foi o que manteve o job Python vermelho por
    seis dias nesta mesma sessao.
  - >-
    SUITE: 1036 passed, 1 skipped, zero warnings. Eram 1032 antes; os 4 novos
    sao a guarda desta fronteira. ruff check e ruff format limpos.
  - >-
    SEGUNDA ITERACAO, MEDIDA NO CI: a primeira versao deste passo usava
    $WORKFLOWS sem aspas e o actionlint -- que roda shellcheck dentro dos blocos
    run: -- acusou SC2086 "Double quote to prevent globbing and word splitting"
    na linha 209, derrubando o job de novo.
  - >-
    ASPAS NAO RESOLVEM: "$WORKFLOWS" viraria um unico argumento contendo
    quebras de linha, e o actionlint receberia um nome de arquivo inexistente. A
    forma correta e array: git ls-files -z alimentando mapfile -d '', que separa
    por NUL e sobrevive a espaco em nome de arquivo.
  - >-
    POR QUE NAO PEGUEI LOCALMENTE NA PRIMEIRA VEZ: validei o COMANDO solto, nao
    o WORKFLOW. O actionlint so analisa o shell script quando le o arquivo do
    workflow. Validado agora do jeito certo -- actionlint sobre
    .github/workflows/sota-ci.yml devolve exit 0 SEM ACHADOS -- e o script foi
    executado na mao, devolvendo 1 item enumerado, em bash 5.3.15.
  - >-
    UMA REGRESSAO MINHA FOI PEGA PELO PROPRIO ACTIONLINT LOCAL: ao corrigir, o
    escape do printf quebrou o YAML, e actionlint acusou
    "could not parse as YAML: could not find expected ':'" na linha 218. A
    correcao foi feita e revalidada antes do commit.
nao_verificado:
  - >-
    Nao confirmei ainda que o job fica verde no CI: exige o push.
  - >-
    Nao corrigi o defeito em gemini-review.yml, e nao ha como faze-lo daqui:
    alteracao local em submodulo e descartada no proximo git submodule update.
    Corrigir de verdade exige pull request em gemini-cli-extensions/security.
  - >-
    Nao verifiquei se outros passos do CI referenciam caminhos dentro de
    submodulos. A busca foi por esta falha especifica.
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-formatacao-ruff-e-ancoras
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: >-
      Este commit altera UM passo do workflow -- o de Actionlint --, que passa
      a enumerar os workflows por git ls-files em vez de citar caminho dentro
      de submodulo. Medido: o arquivo antes citado nao e versionado aqui, e
      git ls-files --error-unmatch sobre ele devolve "did not match any
      file(s) known to git". Nenhum outro passo foi tocado, e nenhum job,
      gatilho ou matriz mudou. O achado deste registro segue valido.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - package.json
    parecer: >-
      Este commit altera UMA linha do package.json: o script lint:workflows
      passa a enumerar por git ls-files, alinhando-se ao passo do CI, em vez
      de citar caminho dentro de submodulo. Nenhuma dependencia, versao,
      workspace ou outro script foi tocado, e o package-lock.json permanece
      intacto. O achado deste registro segue valido.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - package.json
    parecer: >-
      Este commit altera UMA linha do package.json: o script lint:workflows
      passa a enumerar por git ls-files, alinhando-se ao passo do CI, em vez
      de citar caminho dentro de submodulo. Nenhuma dependencia, versao,
      workspace ou outro script foi tocado, e o package-lock.json permanece
      intacto. O achado deste registro segue valido.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - package.json
    parecer: >-
      Este commit altera UMA linha do package.json: o script lint:workflows
      passa a enumerar por git ls-files, alinhando-se ao passo do CI, em vez
      de citar caminho dentro de submodulo. Nenhuma dependencia, versao,
      workspace ou outro script foi tocado, e o package-lock.json permanece
      intacto. O achado deste registro segue valido.
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: >-
      Este commit altera UM passo do workflow -- o de Actionlint --, que passa
      a enumerar os workflows por git ls-files em vez de citar caminho dentro
      de submodulo. Medido: o arquivo antes citado nao e versionado aqui, e
      git ls-files --error-unmatch sobre ele devolve "did not match any
      file(s) known to git". Nenhum outro passo foi tocado, e nenhum job,
      gatilho ou matriz mudou. O achado deste registro segue valido.
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - package.json
    parecer: >-
      Este commit altera UMA linha do package.json: o script lint:workflows
      passa a enumerar por git ls-files, alinhando-se ao passo do CI, em vez
      de citar caminho dentro de submodulo. Nenhuma dependencia, versao,
      workspace ou outro script foi tocado, e o package-lock.json permanece
      intacto. O achado deste registro segue valido.
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - package.json
    parecer: >-
      Este commit altera UMA linha do package.json: o script lint:workflows
      passa a enumerar por git ls-files, alinhando-se ao passo do CI, em vez
      de citar caminho dentro de submodulo. Nenhuma dependencia, versao,
      workspace ou outro script foi tocado, e o package-lock.json permanece
      intacto. O achado deste registro segue valido.
  - registro: registro-2026-09-08-bindings-wasm-defasados
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: >-
      Este commit altera UM passo do workflow -- o de Actionlint --, que passa
      a enumerar os workflows por git ls-files em vez de citar caminho dentro
      de submodulo. Medido: o arquivo antes citado nao e versionado aqui, e
      git ls-files --error-unmatch sobre ele devolve "did not match any
      file(s) known to git". Nenhum outro passo foi tocado, e nenhum job,
      gatilho ou matriz mudou. O achado deste registro segue valido.
  - registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
    caminhos:
      - package.json
    parecer: >-
      Este commit altera UMA linha do package.json: o script lint:workflows
      passa a enumerar por git ls-files, alinhando-se ao passo do CI, em vez
      de citar caminho dentro de submodulo. Nenhuma dependencia, versao,
      workspace ou outro script foi tocado, e o package-lock.json permanece
      intacto. O achado deste registro segue valido.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - package.json
    parecer: >-
      Este commit altera UMA linha do package.json: o script lint:workflows
      passa a enumerar por git ls-files, alinhando-se ao passo do CI, em vez
      de citar caminho dentro de submodulo. Nenhuma dependencia, versao,
      workspace ou outro script foi tocado, e o package-lock.json permanece
      intacto. O achado deste registro segue valido.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - package.json
    parecer: >-
      Este commit altera UMA linha do package.json: o script lint:workflows
      passa a enumerar por git ls-files, alinhando-se ao passo do CI, em vez
      de citar caminho dentro de submodulo. Nenhuma dependencia, versao,
      workspace ou outro script foi tocado, e o package-lock.json permanece
      intacto. O achado deste registro segue valido.
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - package.json
    parecer: >-
      Este commit altera UMA linha do package.json: o script lint:workflows
      passa a enumerar por git ls-files, alinhando-se ao passo do CI, em vez
      de citar caminho dentro de submodulo. Nenhuma dependencia, versao,
      workspace ou outro script foi tocado, e o package-lock.json permanece
      intacto. O achado deste registro segue valido.
referencias_nao_resolviveis:
  - skills/gemini-cli-security/.github/workflows/gemini-review.yml
---

# Actionlint e a fronteira do submodulo

## O marco, e o que ele revelou

Em `038b239e` os **tres jobs principais ficaram verdes pela primeira vez**:

```
success  ⚛️ Frontend TypeScript & Next.js Build
success  🐍 Python Lint & Pytest Matrix (3.13)
success  🐍 Python Lint & Pytest Matrix (3.12)
failure  🛡️ Security Headers & Architecture Quality Gate
```

O quarto job **nunca havia rodado**. Ele depende dos outros e ficava `skipped`
enquanto eles reprovavam. Destravados os tres, ele apareceu -- e reprovou.

Este e o terceiro caso na mesma sessao de um achado que estava **atras** de
outro. Corrigir um portao nao zera o placar; expoe o que ele encobria.

## A causa nao estava sob nossa jurisdicao

```
skills/gemini-cli-security/.github/workflows/gemini-review.yml:68:36:
  property "additional_context" is not defined in object type {}
```

O arquivo **nao e versionado por este repositorio**:

```bash
git ls-files --error-unmatch skills/gemini-cli-security/.github/workflows/gemini-review.yml
# error: pathspec ... did not match any file(s) known to git
```

Ele esta dentro do gitlink `skills/gemini-cli-security`, commit `2227f3cf`, e
pertence a `gemini-cli-extensions/security`. Alteracao local ali e **descartada
no proximo `git submodule update`** -- entao nao havia correcao possivel deste
lado.

O que havia era um CI cujo veredito dependia do estado de um repositorio de
terceiro.

## A correcao ja tinha precedente, e ele e literal

O `registro-2026-09-03-cobertura-cve-e-a-fronteira-do-submodulo` resolveu
exatamente isto na fase 3 do portao, com uma frase que se aplica aqui sem
adaptacao:

> *"varrer o disco fazia o veredito depender de quais submodulos estao
> inicializados na maquina. O MESMO commit aprovaria numa maquina e reprovaria
> noutra."*

O mecanismo daquele registro e `git ls-files`, que **nao lista arquivo algum
dentro de um gitlink**. O passo do actionlint passa a usa-lo:

```bash
WORKFLOWS=$(git ls-files '.github/workflows/*.yml' '.github/workflows/*.yaml')
test -n "$WORKFLOWS"   # lista vazia aprovaria sem medir nada
uv run --with actionlint-py actionlint $WORKFLOWS
```

Nao houve principio novo a inventar: houve um principio ja estabelecido que
faltava num segundo lugar.

## A guarda contra o falso verde

`test -n "$WORKFLOWS"` nao e zelo. Sem ele, uma enumeracao vazia passaria zero
argumentos ao `actionlint`, que sairia `0` sem ter analisado nada -- verde por
ausencia de medicao, que e pior que a reprovacao honesta.

E o mesmo cuidado que a Tarefa 2 exigiu ao trocar glob por caminhos explicitos
no verify de WASM, e que a fase 3 ja tinha ao tratar lista vazia de manifestos.

## Consequencia para a Tarefa 7

O **unico** consumidor versionado de `skills/gemini-cli-security` era este passo
do actionlint -- e foi por ele que a emenda de 2026-09-09 do plano concluiu que
a intencao da branch de 2026-08-22 valia para cinco submodulos, e nao para os
seis.

Restabelecida a fronteira, aquele submodulo deixa de ter consumidor versionado,
e a recomendacao volta a valer para os seis. **Nada foi removido**: a decisao
segue sendo do Tier 0, e o registro existe para que ela seja tomada sobre o
estado atual e nao sobre o anterior.

## Emenda -- a segunda iteracao, e a licao que ela custou

A primeira versao deste passo reprovou no CI de novo, e por um achado
**legitimo do proprio actionlint**:

```
.github/workflows/sota-ci.yml:209:9: shellcheck reported issue in this script:
SC2086:info:5:40: Double quote to prevent globbing and word splitting
```

Ou seja: a fronteira foi restabelecida e o actionlint voltou a funcionar -- e a
primeira coisa que ele encontrou foi **o meu codigo**.

**Aspas nao resolvem.** `"$WORKFLOWS"` viraria um argumento unico contendo
quebras de linha, e o actionlint receberia um nome de arquivo que nao existe. A
forma correta e array:

```bash
mapfile -d '' -t WORKFLOWS < <(git ls-files -z '.github/workflows/*.yml' '.github/workflows/*.yaml')
test "${#WORKFLOWS[@]}" -gt 0
uv run --with actionlint-py actionlint "${WORKFLOWS[@]}"
```

O `-z` do git com `mapfile -d ''` separa por NUL, o que sobrevive a espaco em
nome de arquivo -- coisa que a versao com quebra de linha nao fazia.

### Por que eu nao peguei isso localmente

**Validei o comando solto, e nao o workflow.** Rodei `actionlint` passando o
caminho enumerado, o que testa se aqueles arquivos estao bem formados. Mas o
actionlint tambem roda `shellcheck` **dentro dos blocos `run:`** -- e isso so
acontece quando ele le o arquivo do workflow.

Validar o comando nao e validar o passo. Refeito do jeito certo, `actionlint`
sobre `.github/workflows/sota-ci.yml` devolve **exit 0, sem achados**, e o
script foi executado na mao: 1 item enumerado, em bash 5.3.15.

### E uma regressao que o instrumento local pegou

Ao corrigir, o escape do `printf` quebrou o YAML, e o `actionlint` local acusou
`could not parse as YAML` na linha 218. Foi corrigido e revalidado **antes** do
commit -- que e exatamente o valor de ter passado a rodar a ferramenta do jeito
que o CI a roda.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** restabelecer no passo de Actionlint a fronteira do submodulo que
o portao ja aplicava na fase 3, para que o veredito do CI deixe de depender de
repositorio que este projeto nao governa.
