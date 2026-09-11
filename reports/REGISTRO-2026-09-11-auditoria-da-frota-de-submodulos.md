---
id: registro-2026-09-11-auditoria-da-frota-de-submodulos
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude-code@claude-opus-5
criado_em: '2026-09-11T16:30:00-03:00'
classes:
  - interno
  - medido
  - fronteira
  - submodulo
caminhos:
  - docs/architecture/DEPENDENCY_BOUNDARY_INDEX.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  baseline_head: ee02532765e86ca05647e61885c0107bb7cd2eda
  submodulos_auditados: 7
  arquivos_pendentes_no_inicio: 51
verificado:
  - 'Estado inicial medido, nao citado: 7 submodulos com arvore suja somando 51 arquivos, todos em
    HEAD desanexado com pin igual ao HEAD. A tabela de 2026-08-21 ja divergia em tres linhas --
    Stitch 2 e nao 1, deep-research 9 e nao 10, superpowers 14 e nao 11.'
  - 'gemini-cli-security: as 4 falhas de poc.test.ts sao DO UPSTREAM. Restaurei so poc.ts ao estado
    de HEAD e rodei: mesmas 4 falhas, mesmos 2 passes. O refactor de 245 linhas preserva o resultado
    exatamente. tsc --noEmit com 0 erros.'
  - 'gemini-deep-research: tsc 0 erros, jest 47/47 em 3 suites, eslint src/ limpo. Varri o diff por
    troca de comparacao exata por truthiness em assercao -- a falha que a auditoria irma em Python
    pegou hoje -- e nao ha nenhuma.'
  - 'gemini-cli-jules: registerTool esta declarado nos tipos do SDK instalado, entao a chamada direta
    compila com o MESMO unico erro pre-existente do tsconfig. O Reflect.apply era desnecessario.
    vitest 2/2.'
  - 'gemini-supermemory: node build.js sai 0 e emite apenas session-start. A remocao do hook de
    egress estava INCOMPLETA -- o artefato compilado sob dist/hooks seguia versionado com o codigo
    de envio dentro, embora o fonte ja tivesse sido apagado. Removido em commit proprio.'
  - 'superpowers: pytest 19/19 em tests/hermes, node:test 6/6 em tests/pi, script de tests/opencode
    executado a mao sai 0.'
  - 'Stitch: o escopo OAuth cloud_platform nao existe. Conferido contra google-auth, google-genai e o
    cliente Vertex da Anthropic no ambiente local: todos usam cloud-platform com hifen.'
  - 'Varredura de credencial com os 10 padroes de data/PADROES_DE_CREDENCIAL.json nos 7 submodulos,
    340 arquivos rastreados, antes de publicar qualquer fork: 1 ocorrencia, em
    gemini-cli-security/GEMINI.md, e e a documentacao da ferramenta listando o padrao que ela detecta.
    Arquivo intocado e ja publico no upstream.'
  - 'Estado final conferido: 0 pendencias nos 9 submodulos, cada um em branch nomeada, e os gitlinks
    do superprojeto NAO commitados -- os 8 seguem apontando para o HEAD upstream.'
nao_verificado:
  - 'Nao investiguei por que as 4 falhas de poc.test.ts existem no upstream do gemini-cli-security,
    nem as corrigi. Sao defeito de terceiro, anterior a este trabalho.'
  - 'Nao executei nenhum dos pacotes como servidor MCP vivo, nem o fluxo OAuth do Stitch, nem o
    workflow do jules no GitHub. As chaves deste ambiente estao revogadas.'
  - 'token-efficiency nao declara teste nem build e nao tem node_modules: a verificacao dele e por
    leitura, nao por execucao.'
  - 'superpowers nao tem suite integral: tests/brainstorm-server e skills/brainstorming nao foram
    executados, e render-graphs.js nao foi rodado contra o graphviz.'
  - 'Nao abri pull request para nenhum upstream. Estao em standby por decisao do Tier 0.'
revisoes_de_ancora:
  - registro: registro-2026-09-11-o-fork-e-destino-do-patch-nao-nova-origem
    caminhos:
      - docs/architecture/DEPENDENCY_BOUNDARY_INDEX.md
    parecer: >-
      Revisado e mantido valido, e ampliado sem contradicao. Aquele registro decidiu o destino de um
      submodulo e declarou, em nao_verificado, que as outras sete alteracoes locais nao haviam sido
      lidas. Esta revisao supre exatamente essa lacuna: as sete foram auditadas por diff e a secao
      que ele criou no indice passa de um caso para a tabela dos oito. A tese central dele --
      o fork e destino do patch, nao nova origem, e nem a origem declarada nem o ponteiro do
      superprojeto mudam -- nao so continua verdadeira como foi aplicada de forma identica aos sete
      novos casos, e conferida ao final: 8 gitlinks intactos. Nenhuma linha da tabela de origens
      declaradas foi tocada. O que o indice ganha e classificacao, verificacao e localizacao de
      patch; o que ele afirma sobre fronteira permanece palavra por palavra.
---

# Auditoria da frota de submódulos

## 1. O que havia, medido e não citado

Sete submódulos com árvore suja, **51 arquivos**, todos em HEAD desanexado. A
tabela de 21/08 já divergia em três linhas — a §4 da raiz manda que contagem
medida vença contagem citada, e venceu.

Nenhuma das sete era desvio. Todas foram classificadas como **patch intencional**
pela regra 4 do contrato do próprio índice.

## 2. O erro que a medição impediu

No `gemini-cli-security` a suíte termina com 4 vermelhos em `poc.test.ts`, e o
diff altera 245 linhas em `poc.ts`. A narrativa se monta sozinha: o refactor
quebrou. Cheguei a ler 200 linhas de diff **procurando a confirmação, não a
verdade**.

A pergunta que eu não tinha feito era se aqueles testes passavam antes.

Não passavam. Restaurei só `poc.ts` ao estado de HEAD: mesmas 4 falhas, mesmos 2
passes. O upstream do Google reprova o próprio `poc.test.ts` sem que ninguém tenha
tocado em nada.

O custo do erro seria assimétrico: eu reverteria um refactor legítimo e registraria
como regressão um trabalho correto — rastro de autoridade falso num documento que
fica. **Correlação entre "mudou" e "está vermelho" não é causa.** Custou um
`git checkout HEAD -- um-arquivo`.

## 3. Dois achados que a contagem não mostraria

**O egress que sobreviveu à própria remoção.** No `gemini-supermemory` havia um
hook de fim de sessão — fonte em src/hooks, compilado em dist/hooks, ambos hoje
removidos — que enviava, ao fim de *cada* sessão do Gemini CLI, um resumo do
trabalho (ações, preferências, decisões, aprendizados) para a API da Supermemory.
Removê-lo é o que o índice manda para este pacote. Mas a remoção estava **pela
metade, e da pior forma: parecia completa.** O `dist` é versionado neste pacote, e
o artefato compilado seguia lá com o código de envio dentro. **O que executa é o
compilado, não o fonte.** O build não denuncia: compila o que existe e não remove
artefato cujo fonte sumiu.

**A injeção no workflow.** No `gemini-cli-jules`, `gh release upload ${{ github.event.release.tag_name }}`
interpolava a expressão direto no `run:` — o valor entra no texto do shell *antes*
da execução. Passou a variável de ambiente aspeada.

## 4. Uma supressão que parecia cautela

No mesmo `jules`, o registro da ferramenta fora escrito como
`Reflect.apply(Reflect.get(server, 'registerTool'), server, [...])`. Parece defesa
contra método ausente; é desligamento do verificador de tipos — argumentos em array
não casam com sobrecarga alguma, e o TypeScript para de checar. Compila sempre,
inclusive errado.

Medi: `registerTool` está declarado no SDK instalado, e a chamada direta compila
com o mesmo único erro pré-existente. Não havia nada a contornar.

É o contraponto exato dos `# pylint: disable` que **mantive** na auditoria Python
de hoje. Lá o silenciamento era de falso positivo conhecido; aqui, de um verdadeiro
que nunca ocorreu. A diferença não é o ato de silenciar — é se existe ruído.

## 5. Um deslize meu, e o achado que ele produziu

Rodei `node build.js` no `supermemory` para verificar, e o `git add -A` seguinte
varreu os artefatos que eu próprio acabara de gerar. Medi antes de concluir: `dist/`
**já era rastreado** no upstream, então a inclusão estava correta — e foi ao
conferir isso que o artefato órfão de `session-end` apareceu.

Auditei os sete commits em busca do mesmo deslize. O único `dist/` restante é a
remoção deliberada.

## 6. Estado final

| | |
| :--- | :--- |
| Submódulos com pendência | **0** de 9 |
| Em branch nomeada | 8 (o nono, `eigen`, estava limpo) |
| Gitlinks commitados | **0** — os 8 seguem no HEAD upstream |
| Pull requests abertos | **0** — em standby por decisão do Tier 0 |
