# HandRanks.dat — REMOVIDO por decisao (2026-09-17)

**Status:** FECHADO. Substitui a pendencia de "auditoria de layout".
**Decisao:** remover o blob do repositorio. Registrada com a procedencia
completa para recuperacao imediata se alguem precisar.

---

## O que a auditoria mediu (e o que ela refutou)

### O arquivo ERA integro

A pendencia anterior levantou tres hipoteses: tabela de 5/6-cartas, arquivo
truncado, ou cabecalho/offsetShift. **A primeira e a segunda estao refutadas.**

```
sha256 local    ad00f3976ad278f2cfd8c47b008cf4dbdefac642d70755a9f20707f8bbeb3c7e
sha256 upstream ad00f3976ad278f2cfd8c47b008cf4dbdefac642d70755a9f20707f8bbeb3c7e
                IDENTICO -- e o HandRanks.dat canonico do Two Plus Two

CRC32  7808da57   (confere com a documentacao do upstream)
MD5    5de2fa6f53f4340d7d91ad605a6400fb
SHA1   f8467e36f470c9beea98c47d661c9b2c4a13e577
tamanho 129.951.336 bytes = 32.487.834 slots x 4 bytes   (exato)
```

A tabela de 7 cartas do Two Plus Two ocupa exatamente 32.487.834 entradas
uint32. O arquivo tem exatamente esse tamanho. **Nao ha truncamento.**

### Como ele entrou no repositorio

```
6a63ec61  feat: SOTA v4.2 Gold Standard - Aesthetic & Structural Overhaul
          (Glassmorphism, rounded-4xl, scrollbar-hide)
          1026 arquivos, +17.408 / -6.731 linhas
```

Um mega-commit de refactor de interface. O blob entrou junto com hundreds de
outros arquivos, nao por decisao sobre tabelas de poker. E `frontend/public/wasm/`
tem `.gitignore` com `*` -- **ignora tudo**. O arquivo so esta versionado porque
alguem forçou `git add -f` sobre o ignore.

### Nao ha consumidor

Busca por `HandRanks` no repositorio inteiro retorna 3 arquivos, **todos
nossos**: este documento, `PENDENCIAS_FILA.md`, e o docstring de
`engine/hand_evaluator.py`. Zero codigo de producao ou teste o le.

---

## Por que remover e nao manter

1. **E o original, entao e recuperavel.** O sha256 acima bate com o upstream.
   Reconstruir localmente e um download; nao ha informacao unica aqui.
2. **Nunca foi escolha.** Entrou por `add -f` sobre um `.gitignore` que ignora a
   pasta inteira. Remover restaura a intencao, nao viola decisao.
3. **A pasta e de build output.** `scripts/build-wasm.mjs:13` escreve
   `vitoi_equity_engine_bg.wasm` la dentro. O `HandRanks.dat` era o unico item
   da pasta que ninguem produz.
4. **130 MB no LFS sem contrapartida.** `engine/hand_evaluator.py` responde a
   mesma pergunta em runtime, sem tabela e sem build step.

## Procedencia para recuperacao

```
Origem canonica: http://static.eluctari.com/download/game/poker/HandRanks.dat
Repositorio:     https://github.com/tommy-a/zetebot (src/tools/TwoPlusTwo.java)
                 documenta size, CRC32, MD5, SHA1 e SHA256 do arquivo.
Git:             git checkout 6a63ec61 -- frontend/public/wasm/HandRanks.dat
                 (so ate o commit que o remove; depois disso so o historico)
```

## O que NAO foi resolvido, e por que isso nao bloqueou

Nao foi possivel confirmar que `engine/hand_evaluator.py` concorda com a
tabela. As 52 raizes da arvore ficam em `HR[54..105]` com passo de 53, mas a
navegacao `p = HR[p + card[i]]` nao fecha para o mapeamento de cartas
documentado -- os valores saem da faixa 1..7461 do Two Plus Two.

Isso **nao era necessario** para a decisao: um arquivo que ninguem le nao
precisa concordar com nada para ser removido. Deixado aberto deliberadamente, e
nao afirmado em nenhum codigo.

`perfect_hash_key` em `engine/hand_evaluator.py` tem docstring que diz
exatamente isso: o hash **nao** esta confirmado para enderecar este blob. Essa
afirmacao foi corrigida em 2026-09-17 e deve continuar assim enquanto o layout
nao for medido.

---

## Se alguem precisar do binding

Requer, antes de qualquer codigo novo:

- [ ] Determinar o mapeamento de cartas que faz `lookupHand7` fechar em 1..7461
- [ ] Validar contra `engine/hand_evaluator.py` em N >= 30.000 maos, tolerancia
      declarada
- [ ] So entao escrever o binding

Nao herdar o mapeamento de fonte de terceiros sem medir. Foi exatamente o que
tentou e falhou nesta auditoria.