---
id: registro-2026-09-09-o-arquivo-gerado-que-expirava-o-certificado
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T12:20:00-03:00
atualizado_em: 2026-09-09T12:20:00-03:00
classes: [interno, medido, cwv, instrumentacao]
caminhos:
  - scripts/ops/lighthouse_cwv_audit.mjs
  - reports/cwv/latest_lighthouse_production.json
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    PORTAO VERDE, HOMEOSTASE TOTAL: Total de Erros 0, Total de Warnings 0,
    Status SUCESSO (VERDE) nas 5 fases. A sessao comecou com o portao em FRAGIL
    e 2 warnings, no teto de 2.
  - >-
    TBT_MS 0 ms [PASS] e LCP_MS 357,83 ms [PASS]. O TBT estava NAO MEDIDO ate
    aqui, por LIGHTHOUSE_FINGERPRINT_MISMATCH.
  - >-
    CAUSA MEDIDA DO MISMATCH: git status apontou UM unico arquivo alterado em
    frontend/ desde a auditoria -- frontend/next-env.d.ts. O fingerprint do
    artefato era ce81eb14cf45bc9e..., e o recalculado dava
    11efb8470f796123..., divergindo por causa dele.
  - >-
    O ARQUIVO E GERADO E GRAVA QUAL COMANDO RODOU POR ULTIMO: next build escreve
    import "./.next/types/...", next dev escreve "./.next/dev/types/...". A
    auditoria roda sobre uma build de producao; o dev server sobe em seguida e
    reescreve o arquivo. Toda execucao de npm run dev depois de uma auditoria
    invalidava o certificado.
  - >-
    O CONTEUDO NAO ALCANCA O BUNDLE: e um .d.ts, e declaracao de tipo e apagada
    em tempo de compilacao. O bundle era byte a byte o mesmo nas duas formas.
  - >-
    A ALTERNANCIA JA ESTAVA MEDIDA nesta sessao em SEIS commits consecutivos que
    tocam o arquivo, alternando entre as duas formas sem que nenhum deles fosse
    uma decisao.
  - >-
    CORRECAO: TOOL_GENERATED_FILES, um Set com um unico nome --
    next-env.d.ts --, excluido de listProductionInputs. Segue o padrao que o
    proprio script ja usava para TEST_ONLY_DIRECTORIES e TEST_ONLY_FILE,
    inclusive a advertencia de que excluir input que ALIMENTA o bundle seria
    pior que a recertificacao extra.
  - >-
    PROVA DE ESTABILIDADE: calculei o fingerprint, alternei o next-env.d.ts de
    .next/dev/types para .next/types, recalculei e restaurei. Os dois valores
    sao IDENTICOS -- 8d63a5534618e075... nas duas formas.
  - >-
    CONTRAPROVA DE ESCOPO: acrescentei uma linha de comentario a
    frontend/src/lib/prisma.ts e o fingerprint MUDOU, de 8d63a553... para
    2fbb993d... O arquivo foi restaurado e git status confirma arvore limpa. A
    exclusao e cirurgica: nao mascara mudanca real de producao.
  - >-
    AUDITORIA REGENERADA com o fingerprint estavel: tbtMs 0, lcpMs 396,45, cls 0
    e performanceScore 1, em Chrome efemero sem extensoes.
nao_verificado:
  - >-
    Nao verifiquei se algum OUTRO arquivo gerado por ferramenta entra no
    fingerprint. A exclusao cobre um unico nome, medido; uma varredura por
    arquivos gerados nao foi feita.
  - >-
    Nao removi next-env.d.ts do versionamento nem alterei o .gitignore. A
    Tarefa 5 do plano continua aberta -- o arquivo segue produzindo ruido de
    commit, ainda que nao expire mais o certificado.
  - >-
    Nao rodei a suite Python apos esta mudanca no momento de escrever este
    registro; ela roda no proprio commit, pelo portao.
revisoes_de_ancora:
  - registro: auditoria-2026-09-08-sessao-do-contraste-e-da-forense
    caminhos:
      - scripts/ops/lighthouse_cwv_audit.mjs
    parecer: >-
      O coletor muda em UM ponto: listProductionInputs passa a excluir
      TOOL_GENERATED_FILES, um Set com o unico nome next-env.d.ts. O algoritmo
      do digest, a ordenacao, a exclusao de symlinks e as demais listas --
      NON_PRODUCTION_INPUT_DIRECTORIES, TEST_ONLY_DIRECTORIES e TEST_ONLY_FILE
      -- seguem identicos, e o modo --fingerprint mantem a mesma interface.
      Provado por contraprova que a exclusao nao alarga o escopo: uma linha
      acrescentada a frontend/src/lib/prisma.ts ainda muda o fingerprint. O
      achado deste registro segue valido.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - scripts/ops/lighthouse_cwv_audit.mjs
    parecer: >-
      O coletor muda em UM ponto: listProductionInputs passa a excluir
      TOOL_GENERATED_FILES, um Set com o unico nome next-env.d.ts. O algoritmo
      do digest, a ordenacao, a exclusao de symlinks e as demais listas --
      NON_PRODUCTION_INPUT_DIRECTORIES, TEST_ONLY_DIRECTORIES e TEST_ONLY_FILE
      -- seguem identicos, e o modo --fingerprint mantem a mesma interface.
      Provado por contraprova que a exclusao nao alarga o escopo: uma linha
      acrescentada a frontend/src/lib/prisma.ts ainda muda o fingerprint. O
      achado deste registro segue valido.
  - registro: handoff-2026-09-08-contraste-fechado-e-o-gatilho-do-lighthouse
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
      - scripts/ops/lighthouse_cwv_audit.mjs
    parecer: >-
      Este commit toca os dois: o coletor exclui de listProductionInputs um
      unico arquivo gerado, next-env.d.ts, que nao alcanca o bundle por ser
      declaracao de tipo; e o artefato foi regenerado com o fingerprint
      resultante, medindo tbtMs 0 e performanceScore 1. O algoritmo do digest
      e o esquema do artefato seguem os mesmos, e a contraprova mostra que
      arquivo real de producao ainda move o fingerprint. O achado deste
      registro segue valido.
  - registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      O artefato foi REGENERADO por npm run sota:audit:production, em Chrome
      efemero sem extensoes: tbtMs 0, lcpMs 396,45, cls 0, performanceScore 1.
      O esquema do arquivo nao muda -- generated_at, target_url,
      input_fingerprint_sha256 e metrics seguem presentes, e o portao os
      exige. O que muda e o VALOR do fingerprint, agora estavel a alternancia
      do next-env.d.ts. O achado deste registro segue valido, e o certificado
      que ele ancora deixa de expirar a cada npm run dev.
  - registro: registro-2026-09-07-certificacao-tbt-e-zero-warnings-cwv
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      O artefato foi REGENERADO por npm run sota:audit:production, em Chrome
      efemero sem extensoes: tbtMs 0, lcpMs 396,45, cls 0, performanceScore 1.
      O esquema do arquivo nao muda -- generated_at, target_url,
      input_fingerprint_sha256 e metrics seguem presentes, e o portao os
      exige. O que muda e o VALOR do fingerprint, agora estavel a alternancia
      do next-env.d.ts. O achado deste registro segue valido, e o certificado
      que ele ancora deixa de expirar a cada npm run dev.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
      - scripts/ops/lighthouse_cwv_audit.mjs
    parecer: >-
      Este e o ancora mais proximo: aquele registro RECORTOU o fingerprint,
      excluindo diretorios e arquivos de teste, e fixou a regra que este
      commit obedece -- escopo e o bundle, nao o diretorio, e excluir input
      que ALIMENTA o bundle seria pior que a recertificacao extra, porque o
      certificado sobreviveria em silencio a uma mudanca real. Este commit
      ESTENDE aquele recorte por um caso que ele nao cobria: arquivo gerado
      por ferramenta. next-env.d.ts e um .d.ts, e declaracao de tipo e apagada
      em compilacao. A exclusao e por nome unico, e nao por padrao *.d.ts,
      exatamente pela advertencia daquele registro: um .d.ts escrito a mao
      pode carregar tipo que muda o codigo emitido. O achado nao perde
      validade -- ganha um caso.
  - registro: registro-2026-09-08-contraste-icmev-chipev-executado
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      O artefato foi REGENERADO por npm run sota:audit:production, em Chrome
      efemero sem extensoes: tbtMs 0, lcpMs 396,45, cls 0, performanceScore 1.
      O esquema do arquivo nao muda -- generated_at, target_url,
      input_fingerprint_sha256 e metrics seguem presentes, e o portao os
      exige. O que muda e o VALOR do fingerprint, agora estavel a alternancia
      do next-env.d.ts. O achado deste registro segue valido, e o certificado
      que ele ancora deixa de expirar a cada npm run dev.
referencias_nao_resolviveis: []
---

# O arquivo gerado que expirava o certificado

## O estado final

```
TBT_MS      | 0 ms   | <= 200 ms  | [PASS]
LCP_MS      | 357,83 | <= 2500 ms | [PASS]
• Total de Erros:    0
• Total de Warnings: 0
• Status: [SUCESSO (VERDE)] Zero Erros e Zero Warnings nas 5 Fases
```

A sessao comecou com o portao em **FRAGIL, 2 warnings no teto de 2** -- sem
margem para nenhum achado novo.

## A causa, e por que ela conecta duas frentes

O TBT estava `NAO MEDIDO` por `LIGHTHOUSE_FINGERPRINT_MISMATCH`. Regenerei a
auditoria; o mismatch voltou. `git status` sobre `frontend/` apontou **um unico
arquivo**:

```
 M frontend/next-env.d.ts
```

Esse e o arquivo que esta sessao ja tinha medido em **seis commits
consecutivos**, alternando entre `import "./.next/types/..."` e
`import "./.next/dev/types/..."` conforme o ultimo comando tenha sido
`next build` ou `next dev`.

Eu o havia classificado como **ruido de commit** -- item menor da Tarefa 5. Era
mais que isso: a auditoria roda sobre uma build de producao, o dev server sobe
em seguida e reescreve o arquivo, e **toda execucao de `npm run dev` depois de
uma auditoria invalidava o certificado de TBT**. O warning era permanente por
construcao.

## Por que excluir e correto aqui

`next-env.d.ts` e um `.d.ts`. **Declaracao de tipo e apagada em tempo de
compilacao** -- nada nele sobrevive ao runtime, e o bundle era byte a byte o
mesmo nas duas formas.

O proprio script ja tinha o padrao, e a advertencia que o limita:

> *"Excluir um diretorio que ALIMENTA o bundle seria pior que a recertificacao
> extra, porque o certificado sobreviveria silenciosamente a uma mudanca real."*

Por isso a exclusao e **um nome unico**, e nao um padrao `*.d.ts`: um arquivo de
declaracao escrito a mao pode carregar um tipo que muda o codigo emitido.

## As duas provas

**Estabilidade.** Calculei o fingerprint, alternei a forma do arquivo,
recalculei, restaurei:

| forma | fingerprint |
| :--- | :--- |
| `.next/dev/types` | `8d63a5534618e075...` |
| `.next/types` | `8d63a5534618e075...` |

Identicos.

**Escopo.** Uma linha de comentario acrescentada a
`frontend/src/lib/prisma.ts`:

| estado | fingerprint |
| :--- | :--- |
| sem a isca | `8d63a5534618e075...` |
| com a isca | `2fbb993d5b24bf12...` |

Mudou. A exclusao **nao** mascara alteracao real de producao -- que era o risco
que a tornaria pior que o problema.

Sem a segunda prova, a primeira seria compativel com uma exclusao ampla demais.

## O que fica aberto

A Tarefa 5 do plano **continua aberta**: o `next-env.d.ts` segue versionado e
segue oscilando entre commits. O que mudou e que a oscilacao deixou de expirar o
certificado de TBT -- deixou de ser causa de warning, e voltou a ser apenas
ruido.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** excluir do fingerprint de producao um arquivo gerado que nao
alcanca o bundle, com prova de estabilidade e contraprova de escopo, fechando o
ultimo warning do portao.
