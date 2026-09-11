---
id: registro-2026-09-11-campanha-sonarlint-exa-e-reverificacao-do-probe-hrc
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude-code@claude-opus-5
criado_em: '2026-09-11T14:20:00-03:00'
classes:
  - interno
  - medido
  - contrato
  - hrc
caminhos:
  - scripts/validation/hrc-native-read.mjs
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  baseline_head: 24cb453230f4ed37465f41e47301961e9b48bc17
  node: 24.16.0
  hrc: 4.1.0.202603231401
  jdk: 26.0.1
  submodulo_exa_head: 15ffb50519e719dc791cdc750ce5ed1934c0a1ed
verificado:
  - 'Probe HRC executado de ponta a ponta duas vezes contra a instalacao real, antes e depois da troca
    de require.extensions por registerHooks: 13 artefatos em cada diretorio de saida, identicos byte a
    byte com excecao do campo generatedAt. Todos os exportSha256 coincidem.'
  - 'A migracao exigiu DOIS hooks, nao um. require.extensions registrava um compilador (visivel) e
    inseria .ts em Module._extensions, lista percorrida pelo resolvedor (nao declarado). Com apenas o
    hook load, tournamentContext.ts falha em require(''./hrcStructure'') -- import relativo sem extensao.
    O hook resolve so intervem quando a resolucao normal falha.'
  - 'A guarda de escopo do hook permanece intacta e continua sendo sua razao de existir: apenas
    TypeScript sob frontend/src pode ser carregado pelo probe.'
  - 'Submodulo skills/exa-mcp-server: suite completa em 158 testes / 158 passando / 13 arquivos, e
    tsc --noEmit com 0 erros, apos 19 correcoes SonarLint em 8 arquivos.'
  - 'Linha de base do submodulo antes de qualquer alteracao minha: 20 testes falhando em 4 arquivos,
    todos pela mesma causa unica -- o stub FakeMcpServer nao implementava registerTool, metodo que a
    migracao em curso passou a usar. A campanha havia desabilitado silenciosamente a propria verificacao.'
nao_verificado:
  - 'Nao executei o probe sob Node anterior a 22.15. registerHooks nao existe la, e a troca eleva esse
    piso. Medido apenas em 24.16.0.'
  - 'Nao reverifiquei as afirmacoes de solve, equidade ou convergencia do registro de 2026-09-09: a
    reverificacao cobre o caminho de leitura nativa e o roundtrip, nao a valuation.'
  - 'Nao revisei individualmente os 22 arquivos que a campanha anterior deixou modificados no submodulo.
    A verificacao e do estado combinado pelos portoes do proprio pacote (suite e tsc), nao arquivo a arquivo.'
  - 'Os 33 arquivos Python modificados na arvore do Site por outra campanha nao foram lidos, verificados
    nem incluidos neste commit.'
revisoes_de_ancora:
  - registro: registro-2026-09-09-validacao-nativa-hrc
    caminhos:
      - scripts/validation/hrc-native-read.mjs
    parecer: >-
      Revisado e mantido valido, e desta vez por reproducao e nao por leitura. Aquele
      registro afirma que o harness executa contra HRC 4.1.0.202603231401 e JDK 26.0.1
      produzindo roundtrip nativo integro; rodei o mesmo harness hoje, na mesma
      instalacao, e os 13 artefatos saem identicos byte a byte aos da execucao de
      controle, com todos os exportSha256 coincidindo. A alteracao neste caminho troca
      exclusivamente o mecanismo de carga de TypeScript -- require.extensions, deprecado,
      por registerHooks -- e nao toca em nenhuma classe nativa, contrato de stdout,
      fixture ou comparacao premio a premio que sustente qualquer conclusao daquele
      documento. A config_medida dele continua exata: mesma versao de HRC, mesmo jar,
      mesmo JDK. O unico fato novo que ele nao podia conhecer e o piso de Node >= 22.15,
      declarado aqui em nao_verificado.
---

# Campanha SonarLint no exa-mcp-server e reverificacao do probe nativo HRC

## 1. O achado que veio antes do trabalho

`skills/exa-mcp-server` nao e codigo deste repositorio. E submodulo apontando para
`github.com/exa-labs/exa-mcp-server`, em HEAD desanexado no commit upstream
`15ffb50`, de autoria `kesku@exa.ai`. O `Site` guarda apenas o SHA:
`git ls-files skills/exa-mcp-server/src` devolve zero arquivos.

Ao chegar, encontrei **22 arquivos modificados e nao commitados** ali dentro, com
434 insercoes -- uma campanha de migracao e saneamento em curso, de outro agente.
Como o `.gitmodules` declara `ignore = dirty`, o `git status` do `Site` nao mostra
nada disso. **O trabalho existia e era invisivel ao repositorio que o contem.**

## 2. A causa unica das 20 falhas

A linha de base do submodulo, antes de qualquer alteracao minha, era 20 testes
falhando em 4 arquivos. Todas tinham a mesma causa: `FakeMcpServer`, o stub de
servidor usado pelos testes, implementa `tool()` mas nao `registerTool()`. A
campanha migrara 8 dos 11 registros de ferramenta para `registerTool` -- que e o
metodo vigente do SDK, `tool()` esta deprecado -- e o stub ficou para tras.

Uma ausencia de metodo em um duble de teste desabilitou a verificacao de quatro
arquivos de uma vez. A campanha parecia adiantada e estava, na pratica, sem medidor.

## 3. O que foi corrigido

Caminhos a partir da raiz do `Site`; todos vivem dentro do submodulo, e por isso
nenhum deles e rastreado por este repositorio.

| Arquivo | Achados |
| :--- | :--- |
| `skills/exa-mcp-server/src/tools/agentProgress.ts` | S3776 (47), S3358 |
| `skills/exa-mcp-server/src/tools/agentRun.ts` | S3776 (21), S3776 (29) |
| `skills/exa-mcp-server/src/tools/deepSearch.ts` | S1874, S3776 (24), S7778 |
| `skills/exa-mcp-server/src/tools/webSearchAdvanced.ts` | S1874, S3776 (30) |
| `skills/exa-mcp-server/src/tools/webFetch.ts` | S1874 -- medido por mim, nao reportado |
| `skills/exa-mcp-server/api/mcp.ts` | S7773 x2, S6594, S8786, S6582, S3776 (33), S7778, S3776 (35), S1854 |
| `skills/exa-mcp-server/api/mcp-oauth.ts` | S7763 |
| `skills/exa-mcp-server/tests/helpers/fakeMcpServer.ts` | causa das 20 falhas |

Resultado: 158 testes passando de 158, `tsc --noEmit` com 0 erros.

### 3.1 A ordem de `tools_list`, e por que o codigo cedeu

Sobrou uma falha depois do stub corrigido, e ela nao era da campanha SonarLint: o
refactor de `skills/exa-mcp-server/src/mcp-handler.ts` movera o recurso `tools_list` de primeiro
para ultimo, e o teste afirma a ordem.

Havia duas correcoes possiveis e elas **nao sao simetricas**. Alterar o teste faria
a suite passar e destruiria a unica evidencia de que a ordem mudou. Mover o registro
de volta faz a suite passar e preserva o teste como medidor.

O criterio que decidiu foi medir se a reordenacao era **necessaria**: `tools_list`
nao le nada do bloco de agentes, nao depende de `agentSkillContent`, nao depende de
coisa alguma ali. Foi arrasto de refactor. Quando a mudanca de comportamento e
incidental, o codigo cede; se fosse necessaria, o teste e que estaria desatualizado.

## 4. O probe HRC, e o que a API deprecada fazia sem declarar

Ver `revisoes_de_ancora` para o parecer formal. O ponto tecnico esta em `verificado`:
`require.extensions['.ts']` fazia duas coisas e so uma estava escrita. Registrar o
compilador era o proposito declarado; inserir `.ts` na lista do resolvedor era efeito
colateral nao declarado, e era dele que dependia todo `require` relativo sem extensao.

Uma verificacao isolada do hook `load` **passou** -- carreguei `hrcPrizes.ts` com
sucesso, porque aquele arquivo nao importa outro `.ts`. So a execucao de ponta a
ponta, com o HRC real, expos a falha em `tournamentContext.ts`.

**Migrar API deprecada nao e traduzir chamada; e descobrir o que a antiga fazia em
silencio.**

## 5. Nao alterado, por medicao

Os 31 erros `cannot find symbol` em `HrcNativeReadProbe.java` sao classpath do
editor, nao defeito: o `javac` do probe recebe `-cp <plugins>/*` em tempo de
execucao, e a compilacao passa -- provada hoje, duas vezes. **O erro e do medidor.**

`java:S1220` (mover para pacote nomeado) quebraria a invocacao pelo nome simples que
o `.mjs` faz. `java:S106` (trocar `System.out` por logger) quebraria o contrato de
saida: o `.mjs` faz `JSON.parse(result.stdout)`. As duas regras estao erradas para
este arquivo.

## 6. Em aberto, e depende do Tier 0

O submodulo continua com remoto de terceiros. As correcoes moram em arvore suja de
HEAD desanexado, invisiveis ao `Site` por `ignore = dirty`, e **nao ha para onde
enviar**: ninguem aqui tem push para `exa-labs/exa-mcp-server`. Commitar o gitlink
no `Site` apontaria para um SHA que so existe nesta maquina. A decisao -- fork
proprio, ou vendorizar o pacote e deixar de ser submodulo -- e do Tier 0.
