---
id: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
tipo: handoff
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T14:00-03:00
atualizado_em: 2026-08-29T17:34-03:00
commit: edfba490
classes: [interno]
caminhos:
  - scripts/ops/record_gate.py
  - data/DECLARADO_E_NAO_LIDO.json
  - data/system_config.json
commits:
  - 392957a5 -- a fila que roda nao e a que estava documentada
  - bc32e8c1 -- detector para a rota LOCAL que nao cabe na VRAM
  - 243df2c7 -- veredito dos tres orfaos da pendencia 5
  - aede6a21 -- remove rag_ignore_patterns e inventaria os indices
  - 2fd5da40 -- o portao de registro passa a ler o indice
verificado:
  - "suite completa 635 passed, 0 skipped, com basetemp isolado, ao final"
  - "ruff no repositorio inteiro -- um unico erro, o N818 preexistente em llm/routing_policy.py"
  - "indice de registros regenerado -- 140 varridos, 28 VIGENTE, 0 SUSPEITO, 1 OBSOLETO"
  - "tests/test_hook_commit_msg.py rodado isolado -- 22 passed, com sh e bash no PATH"
  - "cinco mutacoes exercitadas entre os dois detectores novos, cada uma reprovando"
  - "todo resultado conferido com git show <sha>:<arquivo>, nunca lendo a arvore"
nao_verificado:
  - "nenhuma das quatro decisoes devolvidas ao vertice foi executada -- nada foi apagado, nenhuma tabela de roteamento foi alterada"
  - "record_anchor_gate.ps1 continua lendo a arvore na linha 134; a correcao gemea nao foi feita"
  - "o N818 nao foi corrigido -- e achado da auditoria concorrente, nao meu, e mexe na autoridade de roteamento"
  - "nao houve execucao de ponta a ponta com a fila real sob carga, nem carga de modelo local"
---

# Handoff -- quatro pendencias, e o que elas eram de fato

## O achado que vale mais que as quatro

**Tres das quatro pendencias que eu mesmo escrevi estavam erradas quando fui
executa-las.** Nao vagas: erradas em fato verificavel.

| # | o que eu escrevi | o que medi |
| :-- | :--- | :--- |
| 1 | *"a fila ordena por string no SQL"* | esse SQL **nao tem chamador de producao**; quem ordena e o `UniversalArbitrator` |
| 2 | *"`Rota.fallback` sem consumidor"* | tinha consumidor **desde 2026-08-27**, escrito no mesmo dia do aviso que dizia para nao liga-lo |
| 3 | *"4 diretorios, ~840 MB"* | **1.110,5 MB** -- 32% a mais |
| 13 | *"C: e D: abaixo de 10% livre"* | C: 11,6%, D: 20,8%. Nenhum dos dois. O apertado e o G:, com 11,0% |

A pendencia 5 nao estava errada, mas agrupava tres itens por sintoma
("ninguem le") e as tres causas eram distintas.

**Pendencia e hipotese escrita por um eu com menos medicao.** Envelhece como
qualquer documento, e envelhece mais rapido, porque foi escrita no fim de uma
janela, quando o cansaco e maior e a verificacao e menor. A regra que sai daqui:
*medir a pendencia antes de trata-la como enunciado* -- e quando a medicao
vencer, corrigir o texto **no lugar onde a pendencia esta escrita**, nao so no
commit.

## O padrao que apareceu tres vezes no mesmo dia

Config declarado, mecanismo hardcoded noutro lugar, e os dois divergindo
justamente onde nao coincidem:

| declarado | quem realmente decide | divergem em |
| :--- | :--- | :--- |
| `priority_weights` no `system_config.json` | `UniversalArbitrator`, constantes hardcoded | o config nao chega ao arbitrador; o `alpha` do codigo vale o `beta` do config |
| `LOCAL_MODEL_MAP` | `OLLAMA_MODEL_MAP`, do `ollama_models.json` | `4b -> e4b` contra `4b -> gemma4:latest` |
| `rag_ignore_patterns` | conjunto hardcoded em `memory_rag.py:377` | o config pede `.archive`, o codigo ignora `.ARQUIVE` -- dois diretorios |

E uma variante nova da falha dominante desta base, achada duas vezes: **o unico
consumidor da funcao e o teste que a exercita.** `get_next_task` e
`promote_starved_tasks` tem um chamador cada, e e um teste -- a latencia de um
deles chegou a ser medida sob carga num relatorio de auditoria. `Rota.fallback`
foi "ligado" num parametro que nenhuma producao passa como verdadeiro. Um dos
testes se chama `test_fallback_tem_caminho_de_execucao`: ele prova que a funcao
**ramifica**, nao que algo a **executa**.

## O que entrou

| commit | |
| :--- | :--- |
| `392957a5` | corrige o registro da fila; o mapa de roteamento parou de nomear a fila morta |
| `bc32e8c1` | detector: nenhuma rota LOCAL nova estoura a VRAM declarada |
| `243df2c7` | tres orfaos -- um ligado, dois removidos |
| `aede6a21` | `rag_ignore_patterns` removido; os cinco indices Chroma inventariados |
| `2fd5da40` | **pendencia 14 fechada**: o portao de registro le o indice, nao a arvore |

18 arquivos, +1.100/-131. Cinco registros novos, todos ancorados.

Dois detectores novos, e nenhum dos dois declara saude:

- `test_nenhuma_rota_local_nova_estoura_a_vram_declarada` **fixa duas violacoes
  conhecidas** -- o primario e o fallback da faixa LOCAL nao cabem em 7,2 GB.
  Rota nova quebrada reprova; correcao silenciosa de qualquer uma das duas
  tambem, forcando atualizar o registro junto.
- `test_portao_le_o_indice` monta um repositorio de verdade e encena o desacordo
  entre indice e arvore nas duas direcoes.

## O que espera decisao sua

| # | item | por que nao decidi |
| :--- | :--- | :--- |
| 1 | o mapeamento `priority_weights` -> constantes do arbitrador | nao se infere: o `alpha` do codigo vale o `beta` do config, e `lambda_age` nao tem par. Muda a ordem de saida da fila |
| 2 | o par de modelos da faixa LOCAL | cabem em 7,2 GB: `qwen2.5-coder:7b` (4,7), os tres `qwen-*` (5,4), `1.5b` (0,98), `0.5b` (0,39). Sao modelos de codigo onde hoje esta um generalista |
| 3 | apagar 1,08 GB de indices Chroma | a evidencia ja foi extraida para tabela; apagar deixou de ser cego, mas continua sendo seu ato |
| 4 | `.claude/.ARQUIVE` e `.claude/.archive` coexistem | o codigo ignora o primeiro, o config pedia o segundo, e o segundo esta vazio |
| 5 | as duas taxonomias de `pool` de chave Gemini | unificar muda qual modelo testa qual chave |
| 6 | rotacao das 4 chaves OpenRouter | ato no provedor |
| 7 | os 62 fontes modificados nos submodulos | direcao e sua |
| 12 | exclusoes do Defender | estreita uma protecao |

## O que sobra como trabalho meu

1. **`record_anchor_gate.ps1`, linha 134** -- a mesma falha que acabou de ser
   corrigida do lado Python. Caminho ja mapeado: `git show ":$arq"` com queda
   para a arvore, e os mesmos tres casos de teste. **E o proximo passo obvio.**
2. **N818** -- `ForaDaAutoridadeDaPolitica` deveria terminar em `Error`. E o
   unico erro de ruff do repositorio e trava o `sota:full`. Achado da auditoria
   concorrente, nao meu; mexe na autoridade de roteamento e nos consumidores.
3. **Os oito orfaos restantes** em `pendentes`.
4. **A cegueira do detector de orfaos**: ele varre constantes Python, entao
   chave de JSON declarada e nao lida e invisivel para ele. Foi assim que
   `rag_ignore_patterns` passou.

## Sobre a auditoria concorrente

`reports/HANDOFF-2026-08-29-auditoria-integridade-repositorio.md` esta **nao
rastreado** na arvore -- perdivel no primeiro checkout, mesma situacao das 900
linhas do agente anterior. Nao o commitei: nao e meu documento.

Dois numeros dela reconciliados por medicao:

- **609 passed + 22 skipped = 631**, que e exatamente a contagem em `1521afdb`,
  antes do detector de VRAM. Mesma suite, hash anterior.
- Os 22 pulados sao `tests/test_hook_commit_msg.py`, pulados por falta de `sh`
  no PATH. Aqui `sh` e `bash` estao no PATH e o arquivo roda: **22 passed**. O
  `nao_verificado` item 6 dela fica verificado, sem bypass.
- O **N818 e real**, e e o unico erro de ruff do repositorio. Minha verificacao
  anterior era mais estreita que a dela -- eu rodava ruff so nos arquivos que
  tocava.

A "regra de standby" dela pede hash congelado. Os meus cinco commits entraram
durante a janela, sob ordem direta a cada passo. O efeito e o que ela ja
antecipou: **nao existe hash congelado, e a bateria integral dela nao certifica
estes commits.**

## Declaracao (governanca secao 5)

Rodaram: suite completa com basetemp isolado ao final de cada commit; ruff no
repositorio inteiro; os dois portoes antes de cada commit, sem bypass; o indice
de registros regenerado e conferido por `--suspeitos`; cinco mutacoes; e a
conferencia de todo resultado por `git show <sha>:<arquivo>`.

Nao rodaram: nenhuma execucao de ponta a ponta da fila sob carga; nenhuma carga
real de modelo local; nenhuma chamada a provedor de LLM; nenhuma reindexacao do
RAG apos remover `rag_ignore_patterns` -- a prova ali e que nada o lia.

## Prompt de continuidade

> Voce assume o `Site` em `C:\Users\rapha\.gemini\Site`, unico repositorio git
> desta raiz multiprojeto. Leia `CLAUDE.md` e `MODUS_OPERANDI.md` (secoes
> 1.1-1.3, 12 e 13) antes de propor arquitetura.
>
> **`git status` antes de qualquer coisa, e nunca `git add -A`.** Ha artefatos
> nao rastreados de outra sessao na arvore -- entre eles um handoff de auditoria
> que nao e seu. Estagie sempre por caminho explicito.
>
> Rode a suite com `--basetemp` proprio; sem isso duas execucoes concorrentes
> apagam o `pytest-N` uma da outra. **Confira o resultado com
> `git show <sha>:<arquivo>`, nunca lendo a arvore** -- e agora o portao de
> registro faz o mesmo, mas o portao de ancora ainda nao.
>
> **A regra mais cara desta janela: pendencia e hipotese, nao enunciado.** Tres
> das quatro que eu executei estavam factualmente erradas -- a fila que "ordenava
> por SQL" nao tinha chamador, o fallback "sem consumidor" tinha um desde dois
> dias antes, e os "840 MB" eram 1.110. **Meça a pendencia antes de trata-la como
> escrita, e quando a medicao vencer, corrija o texto no lugar onde a pendencia
> mora.**
>
> Duas perguntas de bolso que pagaram hoje. Ao ler qualquer portao: *de onde vem
> a lista, e de onde vem o conteudo?* Se as fontes forem diferentes, ha uma
> janela entre elas. Ao ver um orfao: *quem mais ja faz isso?* -- porque tres
> vezes hoje o declarado tinha um sosia hardcoded que era quem mandava.
>
> **Proximo passo obvio: `record_anchor_gate.ps1`, linha 134.** Mesma falha que
> `record_gate.py` acabou de perder, do lado PowerShell. O caminho esta mapeado
> em [[registro-2026-08-29-o-portao-le-o-indice]]: `git show ":$arq"` com queda
> para a arvore, e os tres casos de teste ja escritos do lado Python servem de
> molde.
>
> Depois dele, o N818 em `llm/routing_policy.py:366` -- unico erro de ruff do
> repositorio, trava o `sota:full`, e nao e correcao cosmetica: renomear a
> excecao exige atualizar consumidores e testes.
>
> Oito itens esperam decisao do operador e estao na secao 5 deste handoff. Nao
> execute nenhum sem palavra dele; varios apagam dado ou mudam roteamento.
