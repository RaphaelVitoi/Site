---
id: registro-2026-09-08-bindings-wasm-defasados
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-08T23:45:00-03:00
atualizado_em: 2026-09-08T23:45:00-03:00
classes: [interno, medido, ci, build]
caminhos:
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

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** registrar a causa medida da metade frontend do CI vermelho e o
discriminante que separou defasagem de irreprodutibilidade antes de corrigir.
