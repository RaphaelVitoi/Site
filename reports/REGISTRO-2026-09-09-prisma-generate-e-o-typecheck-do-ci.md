---
id: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T02:10:00-03:00
atualizado_em: 2026-09-09T02:10:00-03:00
classes: [interno, medido, ci, build]
caminhos:
  - package.json
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    CAUSA MEDIDA NO CI: destravados o Ruff e o verify de WASM, o passo
    "TypeScript Strict Type Check and production build" rodou pela primeira vez
    em dias e falhou com TS2305 em tres arquivos --
    frontend/prisma/seed-content.ts, frontend/prisma/seed-scenarios.ts e
    frontend/src/lib/prisma.ts --, todos com Module '@prisma/client' has no
    exported member 'PrismaClient'.
  - >-
    LACUNA: nao havia postinstall no package.json, e nenhum passo do workflow
    executava prisma generate. O Prisma 7 exige a geracao do cliente; localmente
    ele existia porque alguem gerou uma vez, e node_modules nao vai para o CI.
  - >-
    REPRODUCAO LOCAL: apagando node_modules/@prisma/client e node_modules/.prisma
    e rodando o typecheck, os MESMOS tres arquivos falham -- aqui com TS2307 em
    vez de TS2305, porque local o pacote sumiu inteiro e no CI ele existia sem o
    cliente gerado.
  - >-
    CORRECAO PROVADA DE PONTA A PONTA: com o postinstall declarado, `npm ci`
    instalou 1205 pacotes e gerou o cliente automaticamente --
    node_modules/.prisma/client passou a existir --, e
    `npx tsc --build frontend/tsconfig.json --force` devolveu exit 0 com ZERO
    ocorrencias de "error TS".
  - >-
    A ORDEM IMPORTA E FOI OBSERVADA: `prisma generate` falha com "Could not
    resolve @prisma/client" se o pacote nao estiver instalado. O postinstall
    roda DEPOIS da instalacao, que e exatamente a ordem que o npm garante.
  - >-
    O LOCK NAO MUDOU: o diff e de 1 linha em package.json, e package-lock.json
    permanece intacto. `npm ci` reportou "found 0 vulnerabilities".
  - >-
    DEV SERVER RESTABELECIDO apos o npm ci: porta 3000 em LISTEN, e o probe
    devolve lcpMs 345 e depois 339 ms, com axe violations 0.
nao_verificado:
  - >-
    Nao confirmei ainda que o typecheck do CI fica verde: isso exige o push. O
    que esta provado e que o criterio equivalente passa nesta maquina depois de
    um npm ci limpo.
  - >-
    Nao rodei `npm run build` completo depois da correcao -- apenas o typecheck.
    O passo do CI roda os dois, nessa ordem.
  - >-
    Nao investiguei as outras tres falhas de pytest que o CI expos
    (test_sentinela_delecoes e dois casos de test_timesfm_agent_calibration),
    que sao de dependencia de Windows num runner Ubuntu. Sao outro item.
revisoes_de_ancora:
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - package.json
    parecer: >-
      Aquele relatorio ancora o package.json como parte do quality gate da
      fusao. A mudanca e de UMA linha e acrescenta um script npm padrao
      (postinstall); nao remove, renomeia nem altera nenhum script existente, e
      o package-lock.json permanece intacto.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - package.json
    parecer: >-
      Aquela auditoria ancora o package.json pelos scripts de CWV e Lighthouse.
      Nenhum deles foi tocado: a linha nova e um postinstall que roda
      prisma generate, e nao interfere em lighthouse, cwv nem em qualquer script
      de auditoria.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - package.json
    parecer: >-
      Aquele handoff ancora o package.json no contexto de vulnerabilidades. A
      mudanca nao adiciona, remove nem altera dependencia alguma -- o
      package-lock.json esta intacto --, e o npm ci que a exercitou reportou
      "found 0 vulnerabilities".
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - package.json
    parecer: >-
      Aquele handoff ancora o package.json pela malha agentica e pela trava de
      LFS. Nada de LFS nem de configuracao de agente foi tocado; a linha nova e
      um script de ciclo de vida do npm.
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - package.json
    parecer: >-
      Aquele registro ancora os scripts lint:md e lint:md:fix. Os dois
      permanecem identicos, com as mesmas flags e o mesmo --ignore-path.
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - package.json
    parecer: >-
      Aquele registro ancora o package.json na adaptacao da familia Gemini
      Flash. Nada de roteamento, modelo ou amostragem passa por este arquivo, e
      a linha nova e um postinstall de geracao do cliente Prisma.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - package.json
    parecer: >-
      Aquele relatorio ancora o package.json na analise integral do ecossistema.
      A mudanca e aditiva, de uma linha, e nao altera a topologia de workspaces
      nem qualquer dependencia.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - package.json
    parecer: >-
      Aquele relatorio ancora o package.json pelo impacto quantitativo. O unico
      impacto mensuravel desta linha e que `npm ci` passa a gerar o cliente
      Prisma -- o que ATE ENTAO nao acontecia e mantinha o typecheck do CI
      quebrado. Nenhuma metrica de dependencia muda: o lock esta intacto e o
      audit segue em zero.
referencias_nao_resolviveis: []
---

# `prisma generate` e o typecheck que nunca rodava

## O que o destravamento revelou

Corrigidos o Ruff e o verify de WASM, o passo de typecheck do CI **rodou pela
primeira vez em dias** -- e falhou:

```
frontend/prisma/seed-content.ts(2,10): error TS2305: Module '"@prisma/client"' has no exported member 'PrismaClient'.
frontend/prisma/seed-scenarios.ts(2,10): error TS2305: ...
frontend/src/lib/prisma.ts(1,10): error TS2305: ...
```

Nao havia `postinstall` no `package.json`, e nenhum passo do workflow executava
`prisma generate`. O Prisma 7 **exige** a geracao do cliente; na maquina local
ele existia porque alguem o gerou uma vez, e `node_modules` nao viaja para o CI.

## Uma previsao minha que foi refutada aqui

O `PLANO-FRENTES-ABERTAS-2026-09-08`, na Tarefa 5, previa que o typecheck
falharia por causa do `next-env.d.ts`: ele importa `.next/types` ou
`.next/dev/types`, `.next/` esta no `.gitignore`, e o CI rodava typecheck antes
do build.

**A previsao estava errada.** O typecheck falhou por Prisma, nao por
`next-env.d.ts`, e o erro TS2305 nomeia os tres arquivos de Prisma e mais
nenhum. Depois de gerar o cliente, o typecheck passou **sem que o
`next-env.d.ts` fosse tocado**.

Isso reclassifica aquele item: o arquivo oscilante e **ruido de commit**, nao
risco de CI. A Tarefa 5 encolhe, e a previsao falsificavel cumpriu o papel de
uma previsao falsificavel -- foi falsificada, e o registro fica.

## O instrumento quase me enganou de novo

A primeira tentativa de reproduzir localmente **passou**, o que teria me levado
a concluir que a causa era outra. O motivo: `tsc --build` e incremental e
consulta o `.tsbuildinfo`; nada havia mudado nos fontes, entao ele nao
recompilou.

Com `--force`, os mesmos tres erros apareceram. **Um typecheck que "passa" sem
ter compilado nao e um typecheck que passa** -- e a mesma classe de erro que
esta sessao ja cometeu ao medir a porta CDP errada.

## A correcao, e por que no `postinstall`

```json
"postinstall": "prisma generate --schema=frontend/prisma/schema.prisma"
```

Poderia ter sido um passo no workflow, e resolveria o CI. Mas ai o defeito
continuaria existindo para qualquer clone novo do repositorio: quem rodasse
`npm ci` e `npm run typecheck` na sua maquina veria os mesmos tres erros.

O `postinstall` corrige na raiz. E a ordem que o npm garante e exatamente a
necessaria -- medida ao errar: rodar `prisma generate` com o pacote ausente
devolve `Could not resolve @prisma/client`, porque o gerador escreve **dentro**
do pacote instalado.

## Prova

`npm ci` -- 1205 pacotes, `found 0 vulnerabilities` -- gerou
`node_modules/.prisma/client`, e:

```
npx tsc --build frontend/tsconfig.json --force
exit=0     erros TS: 0
```

O diff e de **uma linha**, e o `package-lock.json` esta intacto.

## Um estrago meu, declarado

Para reproduzir o defeito apaguei `node_modules/@prisma/client`, o que derrubou
o dev server da porta 3000 para HTTP 500. O `npm ci` de restauracao falhou na
primeira tentativa porque o proprio dev server segurava
`lightningcss.win32-x64-msvc.node`.

Derrubei o dev server -- que eu mesmo havia subido nesta sessao --, rodei o
`npm ci` e o religuei. Estado final conferido: porta 3000 em LISTEN, `lcpMs`
345 e depois 339 ms, `axe violations` 0.

A primeira medicao apos o `npm ci` devolveu `lcpMs` de **2498 ms**, a um fio do
teto de 2500. Era compilacao a frio, e as duas passadas seguintes confirmaram.
A licao de aquecer a pagina antes de commitar segue valendo -- ela nunca foi a
causa do warning `cwv.cobertura`, mas continua sendo uma armadilha real.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** gerar o cliente Prisma no ciclo de instalacao, corrigindo o
typecheck no CI e em qualquer clone; e registrar a refutacao da previsao que o
plano fazia sobre a causa.
