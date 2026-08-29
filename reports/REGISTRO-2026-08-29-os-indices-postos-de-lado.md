---
id: registro-2026-08-29-os-indices-postos-de-lado
tipo: registro
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T12:00-03:00
commit: aede6a21
classes: [interno]
decide: remove rag_ignore_patterns (declarado sem leitor) e inventaria os indices para que apagar deixe de ser cego
caminhos:
  - data/system_config.json
verificado:
  - "os cinco indices lidos em modo read-only (sqlite3 file:...?mode=ro), sem escrita em nenhum"
  - "soma dos quatro datados medida em disco -- 1.110,5 MB (1,08 GB), contra os ~840 MB citados no handoff"
  - "busca por rag_ignore_patterns em todo *.py -- zero ocorrencias; as duas chaves irmas do mesmo bloco (heuristic_threshold, technical_agents) tem uma cada"
  - "nenhuma referencia em codigo aos quatro diretorios datados -- so prosa, em VALIDACAO-2026-08-28"
  - ".claude/.archive medido com du -- 0 bytes, diretorio vazio"
  - "suite completa 632 passed, 0 skipped, apos a remocao"
nao_verificado:
  - "nao apaguei indice nenhum; a decisao de apagar 1,08 GB continua do operador"
  - "nao reindexei para confirmar que a remocao de rag_ignore_patterns nao muda o conjunto varrido -- a prova e que nada o lia"
  - "nao investiguei por que .claude/.ARQUIVE e .claude/.archive coexistem"
---

# Os indices postos de lado, e a lista de exclusao que ninguem lia

## A conta estava 32% baixa

O handoff dizia *"indices Chroma antigos -- 4 diretorios, cerca de 840 MB"*.
Medido em disco: **1.110,5 MB, 1,08 GB.**

## O que cada um contem

Lido em modo somente-leitura. Nenhum indice foi tocado.

| indice | embeddings | fontes | mtime | maior categoria |
| :--- | ---: | ---: | :--- | :--- |
| `.chroma_db` **(vivo)** | 4.163 | 474 | 29/08 05:20 | PROJETO 97,5% |
| `.chroma_db.contaminado-20260828` | **241.480** | 4.040 | 28/08 15:16 | **`.venv` 99,0%** |
| `.chroma_db.colisao-20260828` | 13.373 | 449 | 28/08 15:28 | PROJETO 96,4% |
| `.chroma_db.fragmentado-20260828` | 14.227 | 494 | 28/08 16:04 | PROJETO 94,8% |
| `.chroma_db.comsuperada-20260828` | 4.239 | 496 | 28/08 16:22 | PROJETO 95,5% |

Os quatro nomes sao diagnosticos, e os numeros confirmam cada um:

- **contaminado** -- 239.062 dos 241.480 embeddings vem de `.venv`, de 3.930
  fontes. O projeto era **0,9%**: 2.196 embeddings de 74 fontes. O indice do
  projeto era, em volume, um indice das dependencias.
- **colisao** e **fragmentado** -- `.venv` some, mas sao 13,4 mil e 14,2 mil
  embeddings para cerca de 450 e 494 fontes: cerca de 29 chunks por fonte.
- **comsuperada** -- 4.239 embeddings para 496 fontes, 8,5 por fonte. O
  chunking foi corrigido entre `fragmentado` e este: **3,3x menos chunks para
  mais fontes**. Sobravam 24 fontes de arvore superada.
- **vivo** -- 454 fontes de projeto, 1 fonte de arvore arquivada.

A escada inteira aconteceu em 66 minutos de 28/08, cada degrau superado pelo
seguinte. Isso importa para a decisao de apagar: os tres intermediarios
(`colisao`, `fragmentado`, `comsuperada`, somando 154,7 MB) foram substituidos
em menos de uma hora cada. O `contaminado` sozinho e **955,7 MB, 86% do total**.

## Dois dos quatro nao tinham registro nenhum

`VALIDACAO-2026-08-28-arquitetura-de-memoria.md` cita `contaminado-20260828` e
`colisao-20260828`. **Nao cita `fragmentado-20260828` nem
`comsuperada-20260828`** -- 100,5 MB cuja unica documentacao era o nome do
diretorio.

Nome de diretorio e um bom lembrete e uma pessima ata: diz o rotulo do defeito e
nao diz quantos, de onde, nem contra o que comparar. A tabela acima e a ata que
faltava.

## A consequencia pratica: apagar deixa de ser cego

O unico valor unico do `contaminado` era ser a prova da contaminacao. **Essa
prova agora cabe em duas linhas de tabela.** Nada mais nos 955,7 MB e
insubstituivel, e nenhum dos quatro e referenciado por codigo -- so por prosa.

Continua sendo decisao do operador. O que mudou e que ela nao exige mais
escolher entre guardar 1,08 GB e perder a evidencia.

## O achado colateral: `rag_ignore_patterns`

Procurando o que impediu a contaminacao de voltar, achei em
`data/system_config.json`, dentro de `system_heuristics`:

```json
"rag_ignore_patterns": [".venv", ".git", ".chroma_db", "__pycache__", "node_modules", ".archive"]
```

**Zero leitores em todo o codigo Python.** As duas chaves irmas do mesmo bloco,
`heuristic_threshold` e `technical_agents`, tem uma cada. So esta nao tem.

Quem de fato exclui e um conjunto **hardcoded** em `memory_rag.py:377`, mais
`ignore_subtrees` e o predicado estrutural do `SUPERSEDED.md`. A lista do
config e um subconjunto dele, exceto por uma entrada: `.archive`.

E essa entrada nao e honrada. O codigo ignora `.claude/.ARQUIVE`; o config pede
`.archive`. **Sao dois diretorios diferentes, e os dois existem** --
`.claude/.ARQUIVE` (317 KB) e `.claude/.archive` (**0 bytes, vazio**).

Terceira ocorrencia hoje da mesma forma: config declarado, mecanismo hardcoded
noutro lugar, e o declarado divergindo do vivo justamente onde nao coincidem.
As outras duas foram `PRIORITY_WEIGHTS`
([[registro-2026-08-29-a-fila-que-roda]]) e `LOCAL_MODEL_MAP`
([[registro-2026-08-29-tres-orfaos]]).

Verdito igual ao do `LOCAL_MODEL_MAP`: **removido**. Ligar seria mudar o que
entra no indice, e a unica entrada que o config acrescentaria aponta para um
diretorio vazio. A duvida fica declarada, nao resolvida: por que `.ARQUIVE` e
`.archive` coexistem, e qual dos dois o autor da lista queria.

## Uma cegueira do detector, declarada

`tests/test_declarado_e_lido.py` varre **constantes Python**. `rag_ignore_patterns`
e uma **chave de JSON**, e por isso ficou fora do radar do detector que existe
justamente para achar declarado-sem-leitor. O detector nao falhou; ele nunca
olhou para la. Fica como divida: as chaves de `data/*.json` nao tem varredura
de leitor.

## O que sobra para o operador

| item | tamanho | observacao |
| :--- | ---: | :--- |
| `contaminado-20260828` | 955,7 MB | evidencia ja extraida para a tabela acima |
| os tres intermediarios | 154,7 MB | superados em menos de uma hora cada |
| `.claude/AGENTS-MEMORY/.chroma_db` | 86,2 MB | arvore superada, ultima escrita 25/05 |
| `.cerebro/agent-memory` | 34,3 MB | arvore superada, com `SUPERSEDED.md` |

E um vazamento pequeno e real: o indice **vivo** ainda carrega 4 embeddings de
`.cerebro/archive/legacy_backend/vitoi_perspective_engine.py`. Nao viola regra
nenhuma -- `.cerebro/archive` nao tem `SUPERSEDED.md` proprio e `archive` nao
esta em `ignore_dirs`. E o unico resto de arvore arquivada no indice de hoje.

**Correcao a uma pendencia minha:** eu escrevi na 13 que *"C: e D: estao abaixo
de 10% livre"*. Medido: C: em **11,6%** (107,8 GB) e D: em **20,8%** (93,2 GB).
Nenhum dos dois esta abaixo de 10%. O disco mais apertado e o **G:, com 11,0%**.
