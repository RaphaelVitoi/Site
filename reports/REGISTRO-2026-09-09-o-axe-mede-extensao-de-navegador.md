---
id: registro-2026-09-09-o-axe-mede-extensao-de-navegador
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T09:10:00-03:00
atualizado_em: 2026-09-09T09:30:00-03:00
classes: [interno, medido, a11y, instrumentacao]
caminhos:
  - scripts/ops/runtime_quality_probe.mjs
  - tests/test_probe_fronteira_da_extensao.py
  - data/a11y_manual_review_baselines.json
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    O PORTAO ESTA COM 2 WARNINGS NO TETO DE 2. Qualquer warning novo passa a
    bloquear commit. Os dois sao cwv.cobertura (Lighthouse com
    FINGERPRINT_MISMATCH) e a11y.AXE_INCOMPLETE (RULE_MISMATCH).
  - >-
    O BASELINE DE A11Y COBRE UMA UNICA REGRA: data/a11y_manual_review_baselines.json
    tem uma review, para color-contrast, com 3 alvos. O runtime devolve DUAS
    regras, e dai o RULE_MISMATCH.
  - >-
    A SEGUNDA REGRA E aria-hidden-focus, com 2 nodes, e os alvos sao
    [["tinamind-app", "div[data-sentinel=\"start\"]"]] e o equivalente com
    "end". Dois niveis de seletor indicam shadow DOM de um custom element.
  - >-
    ESSE ELEMENTO NAO E DO PROJETO: git grep por "tinamind" e por "data-sentinel"
    em todo o repositorio nao devolve NENHUM arquivo versionado. Nem em
    frontend/src, nem em qualquer outro lugar.
  - >-
    O CHROME DE MEDICAO TEM EXTENSOES CARREGADAS: /json/list na porta 9222
    devolve 8 targets de tipo extensao, entre eles Volume Master, Offscreen
    Audio Player e cinco service workers de IDs opacos.
  - >-
    O ACHADO E REPRODUTIVEL: tres passadas consecutivas do probe devolvem
    violations 0 e incomplete 2, com as mesmas duas regras, sempre.
  - >-
    UMA CORRECAO MINHA FOI ESCRITA, TESTADA E REVERTIDA. Ela excluia do escopo
    do axe os custom elements filhos diretos do body. O teste revelou dois
    problemas: excludedRoots devolveu ["next-route-announcer"] -- elemento do
    PROPRIO Next.js, que anuncia mudanca de rota a leitores de tela, e cuja
    exclusao removeria cobertura de a11y REAL; e o aria-hidden-focus sumiu
    mesmo sem tinamind-app ter sido excluido, o que significa que a correcao
    "funcionou" por um motivo diferente do que eu supunha.
  - >-
    O REVERT ESTA CONFIRMADO: git checkout devolveu o probe ao estado anterior, e
    tres passadas seguintes voltam a devolver incomplete 2 com as duas regras.
  - >-
    O TIER 0 IDENTIFICOU AS EXTENSOES em 2026-09-09: SOTA COCKPIT e NANO TAB.
    Isso mudou a decisao -- sendo elas parte permanente e conhecida do ambiente
    de trabalho, o elemento injetado e estavel, e a exclusao por nome deixa de
    ser fragil.
  - >-
    SEGUNDA CORRECAO, ESTA APROVADA POR MEDICAO: o probe passa a excluir do
    escopo do axe uma lista NOMEADA de raizes externas -- hoje apenas
    tinamind-app --, e somente quando o elemento esta PRESENTE, verificado por
    document.querySelector.
  - >-
    TRES PASSADAS CONSECUTIVAS depois da correcao: violations 0, incomplete 1,
    regras ['color-contrast'], excludedRoots ['tinamind-app']. O
    next-route-announcer NAO aparece entre os excluidos -- que era o defeito
    fatal da primeira tentativa.
  - >-
    PROVA DE PONTA A PONTA NO PORTAO: AXE_VIOLATIONS 0 [PASS] e AXE_INCOMPLETE
    1 [REVIEW APPROVED] -- o baseline voltou a bater. Total de Warnings caiu de
    2 para 1, e a margem que a autonomia do portao exige foi recuperada.
nao_verificado:
  - >-
    Nao localizei ONDE tinamind-app esta no DOM. Ele NAO e filho direto do body
    -- a lista de filhos diretos com hifen devolveu apenas next-route-announcer.
    A exclusao por nome nao precisa dessa posicao, mas ela seguiria util se o
    seletor mudasse.
  - >-
    Nao identifiquei qual das 8 extensoes injeta o tinamind-app. Os cinco
    service workers aparecem com IDs opacos e sem titulo legivel.
  - >-
    Nao acrescentei aria-hidden-focus ao baseline, e a razao esta no corpo: o
    baseline exige um source.path com SHA-256, e nao ha fonte no repositorio
    para apontar. A correcao foi no escopo da medicao, nao no registro de
    revisao.
  - >-
    Nao verifiquei o comportamento com o tinamind-app AUSENTE da pagina. O
    caminho existe no codigo -- sem elemento presente, o contexto do axe volta a
    ser o document inteiro --, mas nao foi exercido: exigiria desativar a
    extensao no navegador do Tier 0.
  - >-
    Nao alterei o perfil do Chrome nem desativei extensao alguma. O navegador e
    do Tier 0.
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - scripts/ops/runtime_quality_probe.mjs
    parecer: >-
      Aquela auditoria ancora o probe pela integridade da instrumentacao. A
      mudanca ocorre em UM ponto: o contexto passado a axe.run, que deixa de ser
      o document inteiro quando ha raiz de extensao presente na pagina. A
      coleta de performance -- LCP, CLS, TTFB, long task e heap -- nao foi
      tocada, o protocolo CDP e a aba temporaria seguem identicos, e a restricao
      a alvo loopback permanece. A mudanca AUMENTA a integridade da medicao em
      vez de reduzi-la: o axe deixa de reportar achados de DOM que este
      repositorio nao governa, e o que ficou fora e declarado em excludedRoots,
      nunca silenciado.
referencias_nao_resolviveis: []
---

# O axe media extensao de navegador, e o portao voltou a ter margem

## O estado que motivou a investigacao

O portao esta com **2 warnings no teto de 2**. Nao bloqueia hoje, mas qualquer
warning novo passa a bloquear -- a margem que a autonomia do portao exige
acabou.

Um dos dois e `a11y.AXE_INCOMPLETE` com `RULE_MISMATCH`: o baseline aprova
**uma** regra inconclusiva e o runtime devolve **duas**.

## O que a segunda regra e

```
regra: aria-hidden-focus | nodes: 2
   alvo: [['tinamind-app', 'div[data-sentinel="start"]']]
   alvo: [['tinamind-app', 'div[data-sentinel="end"]']]
```

E `git grep` por `tinamind` e por `data-sentinel` em todo o repositorio devolve
**nada**. O elemento nao existe no codigo versionado.

O Chrome que serve a porta 9222 tem **8 targets de extensao** carregados. O
`tinamind-app` vem de uma delas.

## Por que isto e mais grave que um warning

**O veredito de acessibilidade do portao depende de quais extensoes estao
instaladas no navegador de medicao.** O mesmo commit aprova numa maquina e
reprova noutra -- que e literalmente a frase do
`registro-2026-09-03-cobertura-cve-e-a-fronteira-do-submodulo`, e o principio que
o `registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil` fixou:
**o portao nao deve depender do perfil de navegador**.

Aqui ele depende. E o terceiro lugar, nesta sessao, onde um instrumento mede
algo que o projeto nao governa -- depois do `actionlint` sobre workflow de
submodulo e do guard do TimesFM sobre o ledger da maquina.

## A correcao que escrevi, testei e joguei fora

Implementei uma exclusao no probe: tirar do escopo do axe os custom elements
filhos diretos do `body`, com deteccao generica em vez de lista de nomes.

**O teste a derrubou, por dois motivos independentes:**

1. `excludedRoots` devolveu `["next-route-announcer"]` -- elemento do **proprio
   Next.js**, que anuncia mudancas de rota a leitores de tela. Excluí-lo remove
   cobertura de a11y **real**. A heuristica pegava o framework, nao a extensao.

2. O `aria-hidden-focus` **sumiu mesmo sem o `tinamind-app` ter sido excluido**.
   Ele nao e filho direto do `body`, entao nunca esteve na minha lista. A
   correcao "funcionou" por um motivo diferente do que eu supunha.

O segundo ponto e o decisivo. **Uma correcao que passa no teste pelo motivo
errado e pior que nenhuma**: ela seria commitada como entendida, e o proximo a
mexer partiria de uma explicacao falsa.

Revertido por `git checkout`, e confirmado: tres passadas voltam a devolver
`incomplete 2` com as duas regras.

## Por que tambem nao usei o baseline

O caminho alternativo seria aprovar `aria-hidden-focus` em
`data/a11y_manual_review_baselines.json`. Nao serve, e o formato do proprio
arquivo explica por que:

```json
"source": { "path": "frontend/src/app/(public)/page.tsx", "sha256": "647f9d6b..." }
```

Cada review vincula a decisao a **um arquivo do repositorio e ao seu SHA-256** --
e o `invalidated_by` lista "mudanca no SHA-256" como causa de expiracao. Nao ha
fonte para apontar aqui: o elemento e de uma extensao.

Registrar ali seria tratar **contaminacao de medicao** como **revisao de
acessibilidade do projeto**. Sao coisas diferentes, e confundi-las corromperia o
proprio baseline -- que existe para decisoes sobre o nosso codigo.

## O que resolve, e por que nao fiz

A causa raiz e o **perfil do Chrome**. As saidas possiveis:

1. **Medir num Chrome sem extensoes** -- perfil dedicado ao portao, como a secao
   8.1 do CLAUDE.md ja exige do `browser-use` (*"perfil, downloads e artefatos
   dedicados"*). Resolve na raiz e restabelece a independencia de perfil.
2. **Desativar a extensao** que injeta o `tinamind-app` no perfil atual. Mais
   simples, menos robusto: a proxima extensao reabre o problema.
3. **Exclusao cirurgica no probe**, por seletor especifico, com o criterio
   declarado de que o elemento nao existe no repositorio. Exige antes localizar
   onde ele esta no DOM -- o que **nao** fiz.

**Nenhuma foi executada.** As duas primeiras mexem no navegador do Tier 0, e a
terceira eu tentei e derrubei por medicao.

Fica o achado, que e o que tem valor aqui: **o portao mede acessibilidade de
codigo que nao e nosso, e por isso seu veredito de a11y nao e reproduzivel entre
maquinas.**

## DESFECHO -- a informacao do Tier 0 mudou a decisao, e a segunda correcao passou

O Tier 0 identificou as extensoes: **SOTA COCKPIT e NANO TAB**. Isso muda o
calculo. Sendo elas parte permanente e conhecida do ambiente de trabalho, o
elemento injetado e estavel -- e a exclusao **por nome**, que eu havia descartado
como fragil, passa a ser a opcao certa.

### A segunda correcao, e o que a separa da primeira

```javascript
const EXTERNOS = ["tinamind-app"];
const presentes = EXTERNOS.filter((tag) => document.querySelector(tag) !== null);
const contexto = presentes.length > 0 ? { exclude: presentes.map((t) => [t]) } : document;
```

Duas propriedades que a primeira versao nao tinha:

- **nome explicito**, que nao alcanca `next-route-announcer` nem qualquer
  componente do projeto;
- **condicional a presenca**, para que a cobertura declarada em `excludedRoots`
  diga o que de fato ficou de fora, e nao o que poderia ter ficado.

### O contraste que prova

| | primeira tentativa | segunda |
| :--- | :--- | :--- |
| `excludedRoots` | `next-route-announcer` -- **do Next.js** | `tinamind-app` |
| `incomplete` | 1, por acidente | 1, pela causa |
| `color-contrast` | preservado | preservado |
| motivo do resultado | desconhecido | medido |

Tres passadas consecutivas, todas iguais.

### Prova de ponta a ponta

```
AXE_VIOLATIONS             | 0 violations | <= 0     | [PASS]
AXE_INCOMPLETE             | 1 items      | <= 0     | [REVIEW APPROVED]
• Total de Warnings: 1 (Teto Maximo Permitido: 2)
```

O baseline voltou a bater -- `REVIEW APPROVED` --, e o portao caiu de **2 para 1
warning**. A margem que a autonomia do portao exige, e que estava esgotada, foi
recuperada.

### O que isto NAO resolve

A causa raiz continua sendo o **perfil do Chrome com extensoes**. A exclusao por
nome trata o sintoma conhecido; uma extensao nova que injete outro custom
element fara o warning voltar -- o que e o comportamento correto, porque exige
nova verificacao em vez de silenciar.

A solucao de raiz segue sendo medir num perfil dedicado, como a secao 8.1 do
CLAUDE.md ja exige do `browser-use`. Isso mexe no navegador do Tier 0 e nao foi
feito.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** registrar que o `aria-hidden-focus` do portao vem de extensao de
navegador, e nao do projeto; e registrar a correcao que escrevi, testei e
descartei por ter funcionado pelo motivo errado.
