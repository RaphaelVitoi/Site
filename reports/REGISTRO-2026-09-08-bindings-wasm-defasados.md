---
id: registro-2026-09-08-bindings-wasm-defasados
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-08T23:45:00-03:00
atualizado_em: 2026-09-09T00:15:00-03:00
classes: [interno, medido, ci, build]
caminhos:
  - .github/workflows/sota-ci.yml
  - frontend/src/lib/engine/generated/vitoi_equity_engine.js
  - frontend/src/lib/engine/generated/vitoi_equity_engine_bg.wasm
  - frontend/public/wasm/vitoi_equity_engine_bg.wasm
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    CAUSA MEDIDA: o job de frontend do CI falha no passo "Regenerate and verify
    WASM bindings", que roda npm run wasm:build e em seguida
    git diff --exit-code sobre frontend/src/lib/engine/generated e
    frontend/public/wasm/vitoi_equity_engine_bg.wasm. O diff nao e vazio, logo
    o passo reprova.
  - >-
    O QUE O LOG DO CI MOSTRA: o binding regenerado no runner ganha a funcao
    expectedResponseType e troca "export default __wbg_init; export
    { initSync };" por "export { initSync, __wbg_init as default };". Tambem
    acusa "Binary files ... differ" para o .wasm.
  - >-
    REPRODUCAO LOCAL: npm run wasm:build nesta maquina Windows, com wasm-pack
    0.15.0 -- a mesma versao que o CI instala com cargo install --locked --
    produz exatamente as duas marcas do runner. expectedResponseType aparece
    2 vezes, e a linha 510 do vitoi_equity_engine.js e
    "export { initSync, __wbg_init as default };".
  - >-
    CONCLUSAO QUE A REPRODUCAO AUTORIZA: os bindings versionados estavam
    DEFASADOS em relacao ao wasm-bindgen que o Cargo.lock resolve hoje. Nao ha
    divergencia Windows/Linux no .js -- se houvesse, a regeneracao local nao
    reproduziria as marcas do runner.
  - >-
    DIFF: 3 arquivos. O .js com 11 insercoes e 16 delecoes; os dois .wasm de
    61767 para 61735 bytes.
  - >-
    SUITE DE FRONTEND depois da regeneracao: 34 suites, 264 testes, todos
    passando, com o guard do frontend em SUCESSO (VERDE), zero erros e zero
    warnings. Isto importa porque o .js e consumido em runtime, e nao apenas
    verificado por diff.
  - >-
    SUITE PYTHON no commit imediatamente anterior desta sessao: 1020 passed,
    1 skipped. Nenhum dos 3 arquivos deste commit e consumido pela suite
    Python.
  - >-
    DESFECHO MEDIDO APOS O PUSH: o CI reprovou de novo no mesmo passo, mas o
    diff MUDOU -- o vitoi_equity_engine.js saiu dele. Sobraram apenas os dois
    .wasm, com "Binary files ... differ". Isso confirma a bifurcacao: o .js
    convergiu, e o binario nao e reproduzivel entre Windows e Ubuntu.
  - >-
    DECISAO DO TIER 0, 2026-09-08: restringir o git diff --exit-code do CI aos
    artefatos TEXTUAIS. A alternativa apresentada e recusada foi gerar o .wasm
    em container Linux tambem localmente, tornando a reprodutibilidade um
    requisito explicito.
  - >-
    O VERIFY TEXTUAL USA CAMINHOS EXPLICITOS, nao glob, e e precedido de tres
    `test -f`. Um glob que nao casasse devolveria exit 0 e viraria falso verde,
    que e pior que a cobertura declaradamente reduzida. Simulado localmente:
    os tres arquivos existem e o diff sai limpo.
nao_verificado:
  - >-
    Nao esta provado que o .wasm binario gerado nesta maquina Windows e byte a
    byte igual ao que o runner Ubuntu produz. As duas marcas TEXTUAIS do .js
    batem, e e isso que sustenta a atribuicao; o binario so se confirma depois
    do push. Se o CI reprovar de novo neste passo, a natureza do problema muda
    -- passa a ser reprodutibilidade binaria entre plataformas -- e a Tarefa 2
    do plano traz os dois caminhos de decisao, que sao do Tier 0.
  - >-
    Nao investiguei ate o fim por que "git add <diretorio>" recusa
    frontend/src/lib/engine/generated dizendo que ele e ignorado, enquanto
    git check-ignore -v nao acusa regra alguma nem para o diretorio nem para os
    arquivos, e git ls-files confirma os quatro arquivos rastreados. Nao ha
    .gitignore dentro do diretorio. O add por caminho de arquivo funciona, e o
    stage foi conferido antes do commit; a anomalia fica declarada em vez de
    silenciada.
  - >-
    Nao rodei o typecheck nem o build do frontend neste commit.
revisoes_de_ancora:
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - frontend/src/lib/engine/generated/vitoi_equity_engine.js
    parecer: >-
      O plano ancora este arquivo exatamente para descrever a Tarefa 2, cujos
      passos 1 e 2 mandam regenerar o binding e conferir contra as duas marcas
      extraidas do log do CI -- expectedResponseType presente e o export default
      reescrito. Este commit executa esses passos e as duas marcas conferem, com
      a suite de frontend verde. O plano nao perde validade: ele previa esta
      mudanca, e o unico ponto que segue em aberto e o declarado no proprio
      plano, a igualdade byte a byte do .wasm entre plataformas, que so o push
      resolve.
  - registro: auditoria-2026-09-01-formatacao-ruff-e-ancoras
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: >-
      Aquela auditoria ancora o workflow porque tratou do MESMO job Python: ela
      aplicou ruff format a 50 arquivos justamente para que
      "toda PR nao nascesse vermelha por divida de formatacao alheia ao proprio
      diff". Esta emenda opera no mesmo job e nao desfaz nada do que ela fez --
      os dois comandos de Ruff continuam identicos e na mesma ordem. O que
      muda e o passo SEGUINTE: o pytest, que naquela epoca nunca chegava a
      rodar porque o Ruff reprovava antes, passa a ter node instalado e a
      medir. A auditoria de 01/09 removeu o obstaculo; este commit remove o que
      estava atras dele.
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - .github/workflows/sota-ci.yml
    parecer: >-
      O plano ancora o workflow em duas frentes, e esta emenda toca as duas. Na
      Tarefa 2 ele previa que, se o CI reprovasse de novo no passo do WASM, a
      natureza do problema mudaria para reprodutibilidade binaria e a escolha
      seria do Tier 0 entre restringir o verify aos textuais ou gerar em
      container; foi o que aconteceu, e a primeira opcao foi a escolhida. Na
      Tarefa 5 ele previa alterar a ordem de typecheck e build -- isso NAO foi
      feito aqui de proposito, para que o efeito desta mudanca fique
      atribuivel; a Tarefa 5 segue aberta e a sua previsao ainda nao pode ser
      testada, porque o typecheck continua atras de outro passo. O plano nao
      perde validade em nenhuma das duas.
referencias_nao_resolviveis: []
---

# Bindings WASM defasados -- a outra metade do CI vermelho

## O que estava acontecendo

O job de frontend falhava no passo que **verifica** os bindings, nao no que os
compila:

```yaml
npm run wasm:build
git diff --exit-code -- frontend/src/lib/engine/generated frontend/public/wasm/vitoi_equity_engine_bg.wasm
```

A ideia do passo e boa: se regenerar produz algo diferente do versionado, o
versionado esta errado. Foi exatamente o que ele detectou.

## A duvida que precisava ser resolvida antes de corrigir

Um `git diff --exit-code` sobre artefato binario tem duas explicacoes possiveis,
e elas pedem correcoes **opostas**:

1. **Os bindings estao defasados.** Regenerar e commitar resolve.
2. **O artefato nao e reproduzivel entre plataformas.** Regenerar e commitar
   **nao converge** -- cada lado produziria o seu, e o CI seguiria vermelho a
   cada commit feito na outra plataforma.

Commitar sem separar as duas seria chutar. O discriminante foi extrair do log
do CI **duas marcas textuais** do que o runner Ubuntu produziu:

- a funcao `expectedResponseType` passa a existir;
- `export default __wbg_init; export { initSync };` vira
  `export { initSync, __wbg_init as default };`.

Regenerado aqui, no Windows, com o mesmo `wasm-pack 0.15.0`: as duas marcas
aparecem, e a segunda na linha 510. **Windows e Ubuntu produzem o mesmo `.js`**,
logo a explicacao e a primeira -- os bindings estavam velhos em relacao ao
`wasm-bindgen` que o `Cargo.lock` resolve hoje.

Fica dito o que essa prova **nao** cobre: ela e sobre o `.js`. A igualdade byte
a byte do `.wasm` entre as duas plataformas so o push confirma, e o plano ja
traz os dois caminhos de decisao caso ela nao se confirme.

## Uma anomalia declarada, nao silenciada

`git add frontend/src/lib/engine/generated` recusa, dizendo que o caminho e
ignorado. Mas `git check-ignore -v` nao acusa regra alguma -- nem para o
diretorio, nem para os arquivos --, `git ls-files` lista os quatro arquivos como
rastreados, e nao existe `.gitignore` dentro do diretorio.

O `add` por caminho de arquivo funciona, e o stage foi conferido antes do
commit. Nao encontrei a causa e **nao a inventei**: ela fica no campo
`nao_verificado`. O que importa operacionalmente e que o exit 1 daquele `git
add` e enganoso -- os arquivos rastreados entram no indice mesmo assim, e um
`&&` encadeado depois dele mata o resto do comando sem que nada tenha falhado
de fato.

## Veredito

Frontend: **34 suites, 264 testes, VERDE**, zero warnings. As duas marcas do CI
conferem.

O que **nao** esta provado e que o CI fica verde -- isso e a Tarefa 10 do plano.

## Emenda -- o desfecho, e a cobertura que o Tier 0 aceitou perder

O push confirmou a metade da hipotese e refutou a outra, que era exatamente o
que o plano tinha previsto como bifurcacao.

**Confirmado:** o `vitoi_equity_engine.js` **saiu do diff** do CI. Os bindings
textuais convergiram -- o que este commit corrigiu estava certo.

**Refutado:** a esperanca de que o binario tambem convergisse. Sobraram os dois
`.wasm`, com `Binary files ... differ`. O `wasm-opt` nao produz o mesmo byte em
Windows e em Ubuntu, e o ciclo de regenerar-e-commitar **nao converge**: cada
lado produziria o seu, e o CI reprovaria a cada commit feito na outra
plataforma.

**Decisao do Tier 0:** o `git diff --exit-code` do CI passa a cobrir apenas os
artefatos textuais. A alternativa avaliada -- gerar o `.wasm` em container
Linux tambem localmente -- foi recusada.

Isto **e** uma reducao de cobertura, e fica dita como tal: uma mudanca que
altere somente o binario deixa de ser detectada pelo CI. Nao e um detalhe de
implementacao escondido num comentario; e o motivo pelo qual a escolha era do
Tier 0 e nao minha.

**Um cuidado que a implementacao exigiu.** A forma obvia seria um glob:

```bash
git diff --exit-code -- 'frontend/src/lib/engine/generated/*.js'
```

Mas um glob que **nao casa nada** devolve exit 0. O passo ficaria verde sem ter
verificado coisa alguma -- falso verde, que e pior que a cobertura reduzida,
porque a reducao ao menos esta declarada. A versao em vigor lista os tres
caminhos explicitamente e os precede de `test -f`, de modo que renomear um
artefato quebra o passo em vez de silencia-lo.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** registrar a causa medida da metade frontend do CI vermelho e o
discriminante que separou defasagem de irreprodutibilidade antes de corrigir.
