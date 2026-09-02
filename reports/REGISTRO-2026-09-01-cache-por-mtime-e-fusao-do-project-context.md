---
id: registro-2026-09-01-cache-por-mtime-e-fusao-do-project-context
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T01:05-03:00
atualizado_em: 2026-09-02T01:05-03:00
classes: [interno, medido]
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  python_da_suite: '3.12.3'
  suite_antes: 772 passed, 10 skipped, 0 failed
  suite_depois: 775 passed, 10 skipped, 0 failed
  project_context_fundido: 7762 bytes
caminhos:
  - utils/cache.py
  - tests/test_cache_invalidacao.py
  - .claude/project-context.md
  - engine/cognitive.py
  - agents/context_builder.py
verificado:
  - >-
    O guard do cache foi quebrado de proposito antes de ser aceito. Com o mtime
    na chave: 3 passed. Substituindo a chave de volta por `file:{path}`: 2
    failed, e as duas falhas sao exatamente a leitura pos-edicao e a igualdade
    de chave entre conteudos diferentes. Restaurado: 3 passed.
  - >-
    Correcao anterior deste registro, sobre medicao propria: eu havia declarado
    que a maior das quatro versoes de project-context.md nao continha as outras,
    apontando 13 linhas ausentes. A comparacao era byte a byte e NAO normalizava
    acento. Refeita ignorando diacriticos, o numero real e SETE, nao treze -- as
    outras nove eram a mesma frase escrita com e sem acentuacao. O alarme
    original foi inflado por defeito de medicao meu.
  - >-
    As sete linhas genuinamente unicas foram preservadas na fusao: dois caminhos
    de Fontes Autorizadas que a versao de MODUSOPERANDI tinha mais atuais que a
    maior, quatro linhas de Handoff Log de marco de 2026 vindas de
    .ARQUIVE/legacy_root, e a linha de rodape de PROPOSITOS.
  - >-
    As quatro linhas de handoff vindas de .ARQUIVE carregavam residuo de diff
    nao resolvido (prefixos `-|` e `+|` no mesmo arquivo versionado). Foi
    incorporada a versao `+`, que e a resolucao; o marcador nao entrou.
  - >-
    A secao "Diretorios Chave" do documento descrevia a estrutura `.cerebro`
    inteira, extinta. Reescrita para a arvore fundida, com nota explicita de que
    caminho `.cerebro/` em qualquer documento ou codigo e referencia morta.
  - >-
    Leitura pelo caminho de producao conferida apos a fusao: 7.599 caracteres,
    com Diretorios Chave, GOVERNANCA/COSMOVISAO, a nota de fusao, a linha de
    @curator e o rodape de PROPOSITOS todos presentes.
  - >-
    O fallback duplicado em engine/cognitive.py e agents/context_builder.py foi
    removido: apos o reaponte, as duas ramificacoes apontavam para o mesmo
    arquivo e o `if not exists` nao decidia nada.
  - Suite completa em 775 aprovados, 10 pulados, zero falhas; ruff check e format limpos.
nao_verificado:
  - >-
    Se ha outros consumidores de `_read_file_with_cache` que dependiam da chave
    antiga de forma nao obvia. A mudanca e retrocompativel na leitura -- chave
    nova simplesmente erra o cache e le do disco -- mas nenhuma varredura de
    chamadores foi feita alem dos testes da suite.
  - >-
    O comportamento do mtime em sistemas de arquivos com granularidade de
    segundo inteiro sob edicoes muito proximas. O teste forca o avanco com
    os.utime; edicoes reais dentro do mesmo segundo poderiam nao mudar a chave.
    Nao medido em NTFS nem em sistemas de arquivos de rede.
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-integridade-pos-fusao
    caminhos:
      - engine/cognitive.py
    parecer: >-
      Aquela auditoria reapontou quatro caminhos da lista `docs_to_read` que estavam em subpastas intermediarias. Este commit continua o mesmo trabalho no mesmo arquivo e fecha o item que ela deixou declarado em aberto: o project-context, unico caminho que continuava sem resolver. Nenhum dos quatro reapontes anteriores e desfeito.
  - registro: registro-2026-09-01-identidade-de-agente-na-arvore-canonica
    caminhos:
      - engine/cognitive.py
      - agents/context_builder.py
    parecer: >-
      A leitura de identidade em `.claude/agents/` e a diretriz de escrita em `.claude/agent-memory/`, que aquele registro fixou nos dois arquivos, nao sao tocadas. As linhas alteradas aqui sao as de project-context, que apontavam para `.claude/MODUSOPERANDI/`, subpasta consolidada pela fusao, mais a remocao do fallback que apos o reaponte comparava um caminho consigo mesmo. O achado ancorado segue valido nos dois arquivos.
  - registro: validacao-2026-08-28-arquitetura-de-memoria
    caminhos:
      - engine/cognitive.py
      - agents/context_builder.py
    parecer: >-
      A arquitetura de memoria agentica -- qual arvore e canonica e como a memoria chega ao agente -- nao muda. O que muda e o caminho do project-context, documento de CONTEXTO e nao de memoria, e a remocao de um fallback que apos o reaponte comparava um caminho consigo mesmo. A canonica `.claude/agent-memory` continua sendo a fonte.
---

# Cache por mtime, e a fusao das quatro versoes do contexto

## O cache que engolia a correcao

`utils/cache.py` tem dois niveis: memoria e **disco** (`temp/nexus_zone/cache`,
TTL 3600 s). A chave era `file:<caminho>` -- sem mtime, sem hash de conteudo.

O efeito nao e teorico. Na auditoria da hora anterior, corrigir os catorze
caminhos de `docs/document_manifest.json` **nao mudou nada**: o system prompt do
@auditor continuou com 100.797 caracteres, identicos, porque o Tier 2 devolvia o
manifesto antigo do disco. So depois de `rm temp/nexus_zone/cache/*.json` os
216.330 apareceram.

Reiniciar o processo nao resolvia -- disco sobrevive a restart. A janela era de
ate uma hora em que um documento de governanca corrigido nao chega ao agente, e
nada avisa.

Agora a chave inclui o mtime. Arquivo editado gera chave nova e erra o cache
naturalmente; a entrada velha expira sozinha pelo TTL, o que mantem a funcao sem
efeito colateral de escrita. Guard em `tests/test_cache_invalidacao.py`, quebrado
de proposito: voltar a chave antiga derruba dois dos tres testes.

## A fusao, e um erro meu de medicao

O `project-context.md` tinha quatro versoes divergentes, todas removidas pela
fusao `.cerebro` -> `.claude`. O vertice mandou escolher a maior, "por obvio", e
eu respondi que a maior **nao** continha as outras -- treze linhas ausentes.

**Estava errado, e o defeito era meu.** A comparacao era byte a byte e nao
normalizava acentuacao. Refeita ignorando diacriticos, o numero cai de treze
para sete: as outras nove eram a mesma frase escrita com e sem acento
(`criacao`/`criação`, `academicos`/`acadêmicos`, `avancado`/`avançado`). Alarme
inflado por medicao mal feita, do mesmo tipo que a memoria do @auditor ja
registra -- *numero produzido sobre precondicao nao verificada*.

As sete unicas de verdade, todas preservadas:

| Origem | O que so ela tinha |
| :--- | :--- |
| `MODUSOPERANDI/` (4.282 b) | dois caminhos de Fontes Autorizadas **mais atuais** que os da maior |
| `.ARQUIVE/legacy_root/` (1.113 b) | quatro linhas de Handoff Log de marco de 2026 |
| `PROPOSITOS/` (1.609 b) | a linha de rodape de consagracao |

A ironia da primeira: a versao *menor* carregava os caminhos mais novos
(`.claude/COSMOVISAO.md`), enquanto a maior ainda apontava para
`.cerebro/philosophy/COSMOVISAO.md`. Tamanho nao ordena atualidade.

## O que a fusao consertou alem de juntar

A secao "Diretorios Chave" descrevia a arvore `.cerebro` inteira -- onze
entradas, todas mortas. Reescrita para a estrutura fundida, com nota explicita
de que `.cerebro/` em qualquer documento ou codigo e referencia morta.

E as quatro linhas de handoff vindas de `.ARQUIVE` carregavam **residuo de diff
nao resolvido**: prefixos `-|` e `+|` convivendo no mesmo arquivo versionado.
Entrou a versao `+`, que e a resolucao.

## Efeito conferido

Leitura pelo caminho de producao, depois da fusao: 7.599 caracteres, com
`Diretorios Chave`, `GOVERNANCA/COSMOVISAO`, a nota de fusao, a linha de
`@curator` e o rodape de `PROPOSITOS` todos presentes. O contexto de projeto
voltou a chegar ao agente, e chega correto.
