---
id: registro-2026-08-29-tres-orfaos
tipo: registro
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T11:00-03:00
classes: [interno]
decide: veredito dos tres orfaos da pendencia 5 -- um ligado, dois removidos
caminhos:
  - engine/gemma_server.py
  - llm/budget.py
  - data/DECLARADO_E_NAO_LIDO.json
verificado:
  - "duas buscas por cada nome -- ripgrep no repo inteiro e grep por extensao (.py .ps1 .ts .js .json .md); fora da definicao e do proprio DECLARADO_E_NAO_LIDO.json, zero ocorrencias"
  - "ausencia de acesso dinamico confirmada -- nenhum `import *` dos dois modulos, nenhum getattr sobre eles, nenhum __all__ em qualquer um dos dois"
  - "os dois modulos importam apos a edicao; ruff aprovado em ambos"
  - "test_declarado_e_lido passa nos dois sentidos -- constante nova sem veredito reprova, e declarada que ganhou leitor tambem"
  - "suite completa 632 passed, 0 skipped, basetemp isolado"
nao_verificado:
  - "nao enumerei as variaveis de ambiente reais para provar que as duas taxonomias de pool produziriam o mesmo resultado nesta maquina; isso exigiria ler nomes de variavel de credencial, e a divergencia fica declarada em vez de resolvida"
  - "nao subi o gemma_server para exercitar MODEL_ID em execucao; a substituicao e do mesmo literal pela constante de mesmo valor"
---

# Tres orfaos, tres vereditos diferentes

A pendencia 5 os juntava numa linha so -- *"orfaos aguardando veredito"*. Medidos
um a um, nao tem nada em comum alem de ninguem ler: o veredito de cada um saiu
diferente, e um deles escondia um defeito que os outros nao tinham.

## `_MODEL_31B` -- LIGADO

Nasceu com proposito declarado no proprio comentario: *"Constantes de modelo
para expurgo de literais duplicados (S1192)"*. O unico duplicado que ela existia
para eliminar estava **tres linhas acima dela**:

```python
MODEL_ID = os.environ.get("SOTA_LOCAL_MODEL", "gemma4:31b")   # linha 178
_MODEL_31B = "gemma4:31b"                                      # linha 181
```

A constante anti-duplicacao criou a duplicacao que existia para remover. Nao e
orfa por falta de proposito -- e orfa por **nao ter dado o ultimo passo**.

Corrigido do jeito que o autor pretendia: a definicao subiu para antes do
`MODEL_ID` e o literal virou a constante. Mesma string, zero mudanca de
comportamento.

## `LOCAL_MODEL_MAP` -- REMOVIDO

Nove entradas. **Oito sao identidade** (`"12b" -> "12b"`, `"e4b" -> "e4b"`...).
A unica que nao e:

```
LOCAL_MODEL_MAP:   "4b" -> "e4b"
OLLAMA_MODEL_MAP:  "4b" -> "gemma4:latest"      <- o mapa que roda
```

**Elas discordam.** Um mapa sem leitor que fosse identidade pura seria so peso
morto; este contradiz o mapa vivo justamente na entrada que importa. E
contradiz para pior: liga-lo mandaria o alias `4b` para `gemma4:e4b`, que pesa
9,6 GB contra 7,2 GB de VRAM disponivel -- o mesmo modelo que nao carrega da
[[registro-2026-08-29-o-fallback-que-nao-carrega]].

Quem resolve alias local e `OLLAMA_MODEL_MAP`, alimentado por
`data/ollama_models.json`. Segundo mecanismo para um fato que ja tem dono.
Removido, com nota no lugar explicando por que nao volta.

## `GEMINI_ALL_KEYS_WITH_POOLS` -- REMOVIDO, e o achado esta aqui

Este parecia o mais simples e era o unico com consumidor.

A forma `{key, pool}` **e lida**: `cli/commands.py:490` faz `pool = entry["pool"]`
e decide com ela qual modelo testa a chave (`pro_model if pool == "pro" else
flash_model`). Mas o consumidor **nao usa esta estrutura** -- ele monta a lista
a mao, em `_cmd_run_gemini_health`:

```python
entries = []
for k in GEMINI_PRO_KEYS:   entries.append({"key": k, "pool": "pro"})
for k in GEMINI_FLASH_KEYS: entries.append({"key": k, "pool": "flash"})
for k in GEMINI_KEYS:       entries.append({"key": k, "pool": "legacy"})
```

Dois produtores da mesma forma. **E as duas taxonomias de `pool` sao
vocabularios diferentes:**

| produtor | de onde vem o `pool` | valores possiveis |
| :--- | :--- | :--- |
| `_cmd_run_gemini_health` (vivo) | de QUAL lista a chave veio | `pro`, `flash`, `legacy` |
| `_collect_keys_with_pool` (orfao) | do NOME da variavel, por regex `GEMINI_([A-Z0-9_]+?)_KEY` | `pro`, `flash`, `legacy` **e nomes de projeto** (`projeto_b`...) |

O consumidor ramifica em `pool == "pro"`. Sob a taxonomia orfa, uma chave
chamada `GEMINI_PROJETO_B_KEY_1` recebe pool `projeto_b`; sob a viva, cai em
`legacy`. Trocar um produtor pelo outro mudaria, em principio, **qual modelo
testa qual chave** -- por isso a unificacao nao foi feita aqui: e mudanca de
comportamento numa rotina de auditoria de credencial.

Um motivo a mais para remover em vez de ligar: a estrutura guardava **valor de
chave em texto claro** num agregado de modulo que nada consumia. Agregado sem
leitor nao e backup, e a governanca desta casa ja decidiu isso para credencial
em disco. Removida junto a `_collect_keys_with_pool`, que ficou sem chamador.

**Fica declarado e nao resolvido:** as duas taxonomias de `pool`. Unificar e
decisao, nao limpeza.

## O que este registro nao fecha

Restam oito nomes em `pendentes`, fora do escopo desta pendencia:
`PRIORITY_WEIGHTS` (decisao do vertice, ver
[[registro-2026-08-29-a-fila-que-roda]]), `DEFAULT_GEMINI_FAST_MODEL`,
`DIR_CLAUDE`, `AGENT_PROMPTER`, `LN_60`, `ALTERNATIVE_VOICE_PTBR`,
`GEMINI_VOICE_FEMALE` e `DO_PS1_FILE`.

## Licao

A pendencia dizia "tres orfaos aguardando veredito", como se fossem um item.
Nao eram: um estava a um passo de cumprir o proprio proposito, um contradizia o
mecanismo vivo, e um tinha consumidor que reimplementava a estrutura com outro
vocabulario. **Orfao nao e diagnostico, e sintoma** -- "ninguem le" diz o que
falta, nunca por que. Agrupar por sintoma economiza uma linha na lista e custa
tres medicoes depois.
