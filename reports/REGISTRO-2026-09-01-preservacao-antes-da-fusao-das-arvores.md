---
id: registro-2026-09-01-preservacao-antes-da-fusao-das-arvores
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-01T20:25-03:00
atualizado_em: 2026-09-01T20:25-03:00
classes: [interno, medido]
config_medida:
  raiz: /home/user/Site
  branch: master
  so: Linux
  distribuicao: Ubuntu 24.04.4 LTS (container remoto, nao a maquina do operador)
  python_da_suite: '3.12.3'
  suite: 766 passed, 9 skipped, 0 failed
  arvores_de_memoria: 3
  arquivos_sem_equivalente_na_canonica: 3
caminhos:
  - .claude/agent-memory/chico/AUDITORIA_VITOI_V4.md
  - .claude/agent-memory/chico/SESSION_ANCHOR_20260316.md
  - .claude/agent-memory/chico/SESSION_ANCHOR_20260316.variante-supersedida.md
  - .claude/agent-memory/chico/VERIFICACAO_CRUZADA_LOG.md
verificado:
  - >-
    As tres arvores de memoria seguem versionadas neste commit:
    .claude/agent-memory (20 arquivos), .claude/AGENTS-MEMORY (24) e
    .cerebro/agent-memory (24).
  - >-
    Os MEMORY.md das duas arvores nao-canonicas JA estavam absorvidos: a
    canonica carrega os marcadores "### Procedencia -- .cerebro/..." e
    "### Procedencia -- .claude/AGENTS-MEMORY/...". Apagar esses MEMORY.md nao
    perde conteudo.
  - >-
    Tres arquivos NAO estavam absorvidos e existiam apenas nas duas arvores
    marcadas para exclusao: AUDITORIA_VITOI_V4.md (2191 b),
    SESSION_ANCHOR_20260316.md (2865 b) e VERIFICACAO_CRUZADA_LOG.md (1209 b),
    todos sob chico/. Copiados para a canonica neste commit, conferidos com cmp.
  - >-
    SESSION_ANCHOR_20260316.md DIVERGIA entre as duas arvores, e a divergencia e
    de governanca: a versao de .cerebro subordina CHICO ao Tier 0 sob Menor
    Privilegio, Target Lock e validacao de integridade; a de AGENTS-MEMORY
    declara que CHICO "possui 100% de autoridade executiva". A primeira entrou
    como vigente; a segunda foi preservada como
    SESSION_ANCHOR_20260316.variante-supersedida.md, com cabecalho que a marca
    como licenca revogada. O corpo apos o cabecalho e byte a byte igual ao
    original, conferido com cmp.
  - >-
    `.claude/AGENTS-MEMORY/auditor/memory.json` nao foi preservado por decisao declarada: as duas copias
    sao identicas e contem apenas {"common_spec_issues": [],
    "high_risk_patterns": []} -- 62 bytes sem informacao.
  - >-
    Os SUPERSEDED.md nao foram movidos por decisao declarada: sao lapides das
    proprias arvores, so fazem sentido dentro delas, e o texto que carregam
    ("Remove-los e ato do vertice, depois de a canonica estar verificada em
    uso") e a condicao que este commit cumpre, nao conteudo a migrar.
  - Suite completa em 766 aprovados, 9 pulados, zero falhas apos as copias.
nao_verificado:
  - >-
    O estado da arvore de trabalho do operador, onde a reorganizacao esta em
    stage e nao foi empurrada. Este commit e aditivo e toca apenas caminhos novos
    sob .claude/agent-memory/chico/, entao nao conflita com a exclusao das outras
    duas arvores -- mas isso e leitura de caminhos, nao merge observado.
  - >-
    Se ha outro conteudo nao absorvido nas subarvores que a reorganizacao remove
    fora de agent-memory (.claude/.ARQUIVE, .claude/RELATORIOS, .claude/AUDITORIA
    e demais). A conferencia deste registro cobriu as tres arvores de memoria
    agentica, nao o restante da reorganizacao.
  - >-
    Nao renomeei .claude/GOVERNANCA nem revisei o INDICE_CANONICO_GOVERNANCA.json
    da reorganizacao: ambos existem apenas na arvore local do operador, fora do
    alcance desta sessao.
---

# Preservacao antes da fusao das arvores de memoria

## Por que este commit existe

A reorganizacao em curso na maquina do operador remove `.claude/AGENTS-MEMORY/`
e trata `.cerebro/` como extinto. A remocao e legitima e ja tinha condicao
escrita: as proprias lapides das duas arvores dizem que remove-las e ato do
vertice **depois de a canonica estar verificada em uso**.

A verificacao encontrou a canonica *quase* completa. Os `MEMORY.md` estavam
absorvidos -- a prova esta nos marcadores de procedencia dentro de cada arquivo
canonico. Tres arquivos sob `chico/` nao estavam, e nao havia copia deles em
lugar nenhum fora das duas arvores a serem apagadas.

## O achado que muda o peso da coisa

`SESSION_ANCHOR_20260316.md` nao era uma duplicata: as duas arvores guardavam
**versoes diferentes do mesmo documento de identidade**, e o paragrafo que
diverge e o que define a autoridade do agente.

| Arvore | O que o documento declara |
| :--- | :--- |
| `.cerebro/agent-memory/chico/` | CHICO e orquestrador operacional **subordinado ao Tier 0**, com autoridade de escrita sob **Menor Privilegio**, Target Lock estrito, invariantes de governanca e validacao de integridade antes de alteracao estrutural. |
| `.claude/AGENTS-MEMORY/chico/` | "A distincao foi obliterada." CHICO e o proprio ecossistema e **possui 100% de autoridade executiva** para intervir, editar e curar o proprio corpo. |

A segunda e a redacao antiga; a primeira e a revisao que a estreitou. Se a fusao
tivesse promovido a copia errada -- ou deixado as duas legiveis como identidade
corrente -- o agente passaria a ler uma licenca que a governanca ja tinha
revogado. Nao e perda de bytes: e reversao silenciosa de uma decisao de
governanca, do tipo que so aparece quando alguem compara os dois arquivos.

## O que foi feito

| Acao | Arquivo |
| :--- | :--- |
| Copiado para a canonica | `.claude/agent-memory/chico/AUDITORIA_VITOI_V4.md` |
| Copiado para a canonica | `.claude/agent-memory/chico/VERIFICACAO_CRUZADA_LOG.md` |
| Copiado como **vigente** (versao Menor Privilegio) | `.claude/agent-memory/chico/SESSION_ANCHOR_20260316.md` |
| Preservado como **historico marcado** (versao 100% autoridade) | `.claude/agent-memory/chico/SESSION_ANCHOR_20260316.variante-supersedida.md` |

Nao preservados, por decisao declarada e nao por omissao: `.claude/AGENTS-MEMORY/auditor/memory.json`
(stub vazio de 62 bytes) e os `SUPERSEDED.md` (lapides das arvores que saem).

## O que continua aberto

Este commit torna seguro apagar as duas arvores de memoria. Ele **nao** cobre o
resto da reorganizacao: `.claude/.ARQUIVE/`, `.claude/RELATORIOS/`,
`.claude/AUDITORIA/` e demais subarvores removidas nao foram conferidas quanto a
conteudo nao absorvido. A mesma pergunta que valeu aqui vale para elas -- existe
copia do conteudo em algum lugar que sobreviva? -- e ainda nao foi respondida com
medicao.
