---
id: handoff-2026-09-09-ci-verde-e-as-seis-causas
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T06:00:00-03:00
atualizado_em: 2026-09-09T06:00:00-03:00
classes: [interno, medido, handoff, ci]
caminhos:
  - .github/workflows/sota-ci.yml
  - scripts/ops/cwv_gate.ps1
  - reports/PLANO-FRENTES-ABERTAS-2026-09-08.md
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    CI VERDE NOS QUATRO JOBS em a96842fe: Python Lint & Pytest Matrix 3.12 e
    3.13, Frontend TypeScript & Next.js Build, e Security Headers & Architecture
    Quality Gate -- todos SUCCESS. Quando esta sessao comecou eram 8 de 8
    execucoes falhando, desde 2026-09-08T13:02.
  - >-
    SUITE PYTHON: 1056 passed, 1 skipped, zero warnings. Eram 1020 na abertura.
  - >-
    SUITE DE FRONTEND: 34 suites, 264 testes, guard em SUCESSO (VERDE).
  - >-
    PORTAO DE 5 FASES: aprovado em todos os commits desta sessao. Ultima
    execucao com a pagina aquecida: LCP_MS 329,61 ms [PASS], PY_CVE_ABERTAS 0
    [PASS], RuffFormat 0 [PASS], 0 erros, 1 warning.
  - >-
    O UNICO WARNING remanescente e "TBT nao foi certificado", que exige artefato
    Lighthouse de producao. Ele NAO foi introduzido nesta sessao -- estava
    encoberto pelo warning de cobertura da fase 1 e apareceu quando a porta CDP
    foi corrigida.
  - >-
    WORKTREES: 5,5 GB liberados. git worktree list devolve apenas a principal, e
    Site-worktrees ocupa 648 KB.
  - >-
    AUTORIA: todos os commits desta sessao conferidos com git log --format antes
    de cada push, saindo como Claude Opus 5 <noreply@anthropic.com>. O git config
    do repositorio segue apontando para outra linhagem, e a identidade foi
    nomeada em cada chamada com git -c.
nao_verificado:
  - >-
    UPGRADE DO POWERSHELL NAO EXECUTADO: a v7.6.6 saiu em 2026-09-08 e o winget
    ainda nao indexou o manifesto. Passos 1 a 3 da Tarefa 11 feitos, passo 4
    rodado sem efeito, passos 5 a 8 pendentes. Ver
    registro-2026-09-09-upgrade-pwsh-e-harmonizacao.
  - >-
    ACHADOS DO ASTRA AINDA ABERTOS: B06, B07, B08, B09 e F06. F03 e F05 seguem
    nao conclusivos. Apenas o B05, unico P1, foi fechado.
  - >-
    TAREFA 7 do plano -- a branch chore/submodule-ownership-rationalization --
    NAO foi executada. Nenhum submodulo removido, nenhuma branch apagada.
  - >-
    TAREFA 8, o Jules, NAO foi executada: a API devolve 401 e exige OAuth2, que
    envolve credencial.
  - >-
    TAREFA 5, o next-env.d.ts, NAO foi executada. A previsao do plano foi
    REFUTADA -- a causa do typecheck era Prisma --, e o item encolheu para ruido
    de commit.
  - >-
    O Dependabot reporta 3 vulnerabilidades (1 high, 2 moderate) que nem
    npm audit nem pip-audit acusam. TERCEIRA fonte, nao investigada.
  - >-
    Nao rodei a skill security-review em nenhum commit desta sessao.
  - >-
    Nao investiguei o defeito em gemini-review.yml, e nao ha como faze-lo daqui:
    exige pull request em gemini-cli-extensions/security.
referencias_nao_resolviveis: []
---

# CI verde, e as seis causas que o mantinham vermelho

## O estado

```
success  🐍 Python Lint & Pytest Matrix (3.13)
success  ⚛️ Frontend TypeScript & Next.js Build
success  🐍 Python Lint & Pytest Matrix (3.12)
success  🛡️ Security Headers & Architecture Quality Gate
```

Quando a sessao comecou eram **8 de 8 execucoes falhando**, desde
2026-09-08T13:02, e **nenhum handoff mencionava**. A auditoria de amplitude
desta mesma sessao tambem nao pegou -- eu nao havia olhado o CI.

Suite Python em **1056 passed** (eram 1020), frontend em 264, portao com 0
erros.

## As seis causas, e o que elas tinham em comum

| # | Causa | Como se manifestava |
| :-- | :--- | :--- |
| 1 | `ruff format --check` reprovava 10 arquivos | job Python, no passo do Ruff |
| 2 | Bindings WASM defasados | job frontend, no verify |
| 3 | `.wasm` nao reproduzivel entre plataformas | idem, apos corrigir o 2 |
| 4 | `prisma generate` nunca rodava no CI | typecheck, `TS2305` |
| 5 | Testes dependentes de Windows e de ledger local | pytest |
| 6 | Actionlint validando workflow de submodulo | job de seguranca |

**Cinco das seis estavam ATRAS umas das outras.** O passo do Ruff reprovava
antes do pytest, que reprovava antes do typecheck; e o quarto job dependia dos
tres primeiros, entao nunca rodava. Cada correcao expunha a proxima.

Isso e o comportamento desejado de um portao em serie -- e a razao pela qual
"corrigir o CI" nao era uma tarefa, e sim seis.

## O padrao que atravessa a sessao inteira

Quase todo defeito encontrado tem a mesma forma: **um instrumento que mede uma
coisa e e lido como se medisse outra.**

- A fase 3 do portao media `npm audit` e era lida como "CVE zero".
- O handshake CDP media *responde ao handshake* e era lido como *mede LCP*.
- O `skipif` dos testes media *pwsh no PATH* e era lido como *roda no Windows*.
- O guard do TimesFM media *o ledger desta maquina* e era lido como *o contrato
  do script*.
- O status `INSUFFICIENT_HISTORY` era emitido quando faltava o **interpretador**.
- O `actionlint` media um repositorio de terceiro e era lido como *nosso CI*.

Nenhum deles estava quebrado. Todos respondiam corretamente a pergunta que lhes
era feita -- que nao era a pergunta que se supunha.

## O que fica pronto, e o que fica aberto

**Pronto:** as Tarefas 1, 2, 3, 4 e 6 do plano, mais cinco correcoes que
nasceram do proprio CI, mais o B05 -- unico P1 aberto do Astra.

**Aberto, em ordem de prontidao:**

1. **Tarefa 11, passos 5 a 8** -- o upgrade do PowerShell. A linha de base ja
   esta medida; falta o winget indexar a v7.6.6, publicada em 2026-09-08.
2. **Achados do Astra:** B06, B07, B08, B09, F06 abertos; F03 e F05 nao
   conclusivos.
3. **Tarefa 7** -- a branch de 2026-08-22. Com a fronteira do actionlint
   restabelecida, `gemini-cli-security` perdeu seu unico consumidor versionado,
   e a recomendacao volta a valer para os seis submodulos. Decisao do Tier 0.
4. **Tarefa 8** -- o Jules. Exige OAuth2; envolve credencial.
5. **Tarefa 5** -- o `next-env.d.ts`, agora reduzido a ruido de commit.
6. **O warning de TBT** -- exige artefato Lighthouse de producao.
7. **As 3 vulnerabilidades do Dependabot** que nem `npm audit` nem `pip-audit`
   veem. Terceira fonte, nao investigada.

## Advertencias de metodo que esta sessao pagou para aprender

**Valide o workflow, nao o comando.** Rodei `actionlint` sobre o caminho
enumerado e deu verde; o CI reprovou o mesmo passo, porque o `actionlint` roda
`shellcheck` **dentro** dos blocos `run:` -- e isso so acontece quando ele le o
arquivo do workflow.

**Confira em qual porta o instrumento mede.** Atribui um warning a dev server
frio e gravei a causa na memoria antes de tentar refutar. Eu media pela 9222; o
portao media pela 9223.

**`grep` de disco nao e `git grep`.** Concluí que nenhum submodulo tinha
consumidor; o indice mostrava o contrario. A secao 4 da raiz manda verificar
referencia real -- e o indice e a referencia real.

**Confirme de qual run e o veredito.** Duas vezes li o resultado de um run
anterior como se fosse do commit recem-enviado. Filtrar por `headSha` resolve.

**A isca nao e opcional.** A primeira versao da verificacao de formatacao
imprimia `FAIL` e devolvia `Total de Erros: 0` -- teria sido commitada como
funcionando.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** entregar a proxima sessao com o CI verde nos quatro jobs, as seis
causas documentadas uma a uma, e a fila do que ficou aberto em ordem de
prontidao.
