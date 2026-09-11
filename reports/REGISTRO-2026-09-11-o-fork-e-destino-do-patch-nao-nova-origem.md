---
id: registro-2026-09-11-o-fork-e-destino-do-patch-nao-nova-origem
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude-code@claude-opus-5
criado_em: '2026-09-11T15:40:00-03:00'
classes:
  - interno
  - medido
  - fronteira
  - submodulo
caminhos:
  - docs/architecture/DEPENDENCY_BOUNDARY_INDEX.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  baseline_head: 2a23d45da09be813eaa1332fc513e5dc610c4b49
  submodulo_upstream: 15ffb50519e719dc791cdc750ce5ed1934c0a1ed
  patch: f3b1349c9b65f6a0534532f753299cb817280ff6
verificado:
  - 'Varredura de credencial nos 88 arquivos rastreados do submodulo, com os 10 padroes de
    data/PADROES_DE_CREDENCIAL.json, antes de publicar o fork: zero ocorrencias.'
  - 'Divergencia medida antes de decidir: 1 commit local sobre o upstream 15ffb505; 88 arquivos e
    473 KB rastreados; zero arquivos sob dist/ ou node_modules/.'
  - 'Fork criado em github.com/RaphaelVitoi/exa-mcp-server e branch chore/sonarlint-campaign-20260911
    enviada. O remoto `origin` do submodulo NAO foi alterado: segue exa-labs/exa-mcp-server.'
  - 'Ponteiro do superprojeto conferido apos o push: `git ls-files -s skills/exa-mcp-server` devolve
    15ffb505, o HEAD upstream. O gitlink nao foi commitado nem enviado.'
  - 'A tabela de docs/audits/2026-08-21-submodule-classification.md mede alteracao local em 7 dos 9
    submodulos: 27, 12, 11, 10, 10, 2 e 1 arquivos. O padrao de arvore suja nao e do exa-mcp-server;
    e da frota.'
nao_verificado:
  - 'As outras 7 alteracoes locais em submodulo nao foram revisadas por diff. Sei que existem e
    quantos arquivos cada uma toca; nao sei o que fazem.'
  - 'Nao executei o exa-mcp-server como servidor MCP. A verificacao e da suite e do compilador do
    proprio pacote, nao de integracao viva -- e a auditoria manda mante-lo desabilitado ate revisao
    de rede, OAuth e comandos.'
  - 'Nao abri pull request para o upstream. Falar em nome do Tier 0 num repositorio de terceiros nao
    e ato que eu tome por conta.'
---

# O fork e destino do patch, nao nova origem

## 1. A pergunta, e quem ja a tinha respondido

O `skills/exa-mcp-server` carregava um patch de 1 commit sem para onde ir: remoto de
terceiros, HEAD desanexado, e `ignore = dirty` escondendo tudo do `git status` do
superprojeto. Tres destinos possiveis -- vendorizar, repontar para um fork, ou fork
como deposito.

**O repositorio ja tinha respondido, em dois documentos que eu precisei medir antes
de escolher.** `docs/architecture/DEPENDENCY_BOUNDARY_INDEX.md` classifica o pacote
como *servidor/conector externo*, com regra de atualizacao propria. E
`data/skills_registry.json` declara que `skills/` nao e raiz de skill de agente:
sao submodulos de extensao, *"outra classe de artefato"*, e trata-los como as
demais seria **erro de categoria**.

## 2. As duas recusas

**Vendorizar, recusado.** Apagaria a fronteira que o indice mantem de proposito, e
473 KB de codigo externo de OAuth e rede passariam a parecer codigo proprio num
repositorio publico. Quebraria tambem o padrao dos 8 submodulos de `skills/`,
deixando 7 externos e 1 inline sem que nada explicasse a excecao.

**Repontar o submodulo para o fork, recusado.** Criaria obrigacao permanente de
rebase a cada versao upstream, para um pacote que a auditoria de 21/08 manda
*manter desabilitado; revisar antes de promover*. E mudaria em silencio a origem
declarada na tabela do indice -- o documento que existe exatamente para impedir que
origem mude sem revisao.

## 3. O que foi feito

O fork recebe o commit e o superprojeto nao muda de ideia sobre nada:

| Fato | Valor |
| :--- | :--- |
| Patch | `f3b1349` |
| Destino | `RaphaelVitoi/exa-mcp-server`, branch `chore/sonarlint-campaign-20260911` |
| `origin` do submodulo | `exa-labs/exa-mcp-server` -- **inalterado** |
| Gitlink no `Site` | `15ffb505` -- **inalterado** |

Isto e a regra 4 do contrato do proprio indice aplicada: *quando houver alteracao
local em submodulo, classifique-a como patch intencional, experimento ou desvio
antes de resetar, commitar ou puxar*. A classificacao e **patch intencional**, e
agora ela esta escrita.

**Quem clonar recebe o upstream sem os consertos, e isso e o esperado.** O patch
esta pinado e localizavel; promove-lo e ato deliberado, nunca efeito colateral de
um `git submodule update`.

## 4. O achado que a decisao descobriu

Ao ler a tabela de classificacao para decidir, apareceu o que importa mais que a
decisao: **7 dos 9 submodulos tem alteracao local** -- 27, 12, 11, 10, 10, 2 e 1
arquivos. O `exa-mcp-server` nao e um caso; e o unico que alguem abriu.

Todos tem `ignore = dirty`. O `git status` do superprojeto mostra zero. E a
auditoria de 21/08 ja dizia que oito diretorios em `skills/` continham alteracoes
*"que exigem revisao por diff antes de qualquer limpeza"* -- 21 dias atras. Uma
foi revisada hoje. Sobram seis, mais o `Stitch`.

O risco nao e o codigo alterado: e que **a alteracao nao aparece**. Uma arvore suja
invisivel nao vira conflito, nao vira revisao e nao vira decisao. Ela vira perda
silenciosa no dia em que alguem rodar `git submodule update --force`.
