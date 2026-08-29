---
id: handoff-2026-08-29-roteamento-memoria-e-guard
tipo: relatorio
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T03:00-03:00
atualizado_em: 2026-08-29T04:40-03:00
commit: 50322a68
classes: [interno, medido]
caminhos:
  - data/ESTADO_DE_ROTEAMENTO.json
  - data/TETOS_DE_MEMORIA.json
  - data/DECLARADO_E_NAO_LIDO.json
  - data/ESTADO_DA_MEMORIA_DE_TRABALHO.json
  - memory_rag.py
  - scripts/cli/nexus.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commits_da_janela: 13
  arquivos: 81
  linhas: 7114 insercoes e 58 remocoes
  suite_no_inicio: 518
  suite_no_fim: 623
  data: 2026-08-28 a 2026-08-29
verificado:
  - suite completa antes de cada um dos 13 commits
  - os dois portoes antes de cada commit; cinco reprovaram e as cinco causas
    foram corrigidas na origem, nunca contornadas
  - 24 mutacoes nesta janela, todas com baseline explicita e conferencia de que
    a mutacao APLICOU antes de concluir qualquer coisa
  - git status conferido antes de cada estagiamento -- tres vezes evitou sujeira
  - indice do RAG reconstruido cinco vezes e comparado geracao a geracao
nao_verificado:
  - nenhuma chamada real a provedor de LLM em nenhum momento
  - o guard de memoria nao foi exercitado sob pressao real; os dois estados
    foram provados com teto rebaixado e gauge dublado
  - a QUALIDADE da recuperacao do RAG nao foi avaliada -- nao existe nesta base
    um conjunto de consultas com resposta esperada
  - os conectores de nuvem (Drive, OneDrive, Dropbox) nao tiveram o estado de
    autenticacao verificado; a sessao e nao-interativa e nao roda OAuth
supersede: null
---

# HANDOFF — roteamento, memória e o guard

**Estado:** `master 50322a68` · árvore limpa · **620 passed** · índice 19 VIGENTE,
0 SUSPEITO · portões de âncora e registro APROVADOS.

## 1. O que foi entregue, em uma tabela

| # | Entrega | Antes → depois |
| :--- | :--- | :--- |
| 1 | **Autoridade de roteamento** | política inerte → 19/19 agentes seguem, via `core.config.modelo_do_agente` |
| 2 | **Subagentes** | 13/13 divergindo → tabela local governa, custo zero travado em teste |
| 3 | **Medidor de VRAM** | cego (`None,0,0`) → Vulkan, 8 GiB lidos do log do Ollama |
| 4 | **Memória agêntica** | 3 árvores, 19/19 divergentes, uma gitignored → canônica única, versionada |
| 5 | **Índice do RAG** | 241.480 fragmentos, 99% `.venv` → 4.163, 0% |
| 6 | **Chunking** | mediana 162 num teto de 1200 → 1009 |
| 7 | **Guard de memória** | só RAM, 300 s fixos → 4 camadas, ritmo adaptativo |
| 8 | **Varredura permanente** | achado por acaso → detector com veredito por item |

13 commits, 81 arquivos, +7.114/−58. Suíte 518 → 620.

## 2. O que espera decisão sua

| # | Item | Por que não decidi |
| :--- | :--- | :--- |
| 1 | **`PRIORITY_WEIGHTS`** — `{alpha, beta, gamma, lambda_age}` em `system_config.json`, carregado e nunca lido; a fila ordena por string em SQL | Ligar muda a ordem em que as tarefas saem da fila |
| 2 | **`Rota.fallback`** sem consumidor | Ligar torna `gemma4:e4b` alcançável, e ele não cabe na VRAM. É decisão sobre a **tabela** |
| 3 | **Índices antigos do Chroma** — 4 diretórios, ~840 MB, gitignored | São reversíveis por `mv`; apagar é seu |
| 4 | **Árvores superadas** — `.cerebro/agent-memory` e `.claude/AGENTS-MEMORY` | Marcadas com `SUPERSEDED.md`, nada apagado |
| 5 | **`LOCAL_MODEL_MAP`, `_MODEL_31B`, `GEMINI_ALL_KEYS_WITH_POOLS`** | Órfãos declarados em `DECLARADO_E_NAO_LIDO.json`, à espera de veredito |
| 6 | Rotação das 4 chaves OpenRouter | Ato no provedor |
| 7 | Os 62 fontes modificados nos submódulos | Direção é sua |
| 8 | **O teto de RAM em 98% é inalcançável nesta máquina** — o livre teria de cair de 8,59 GB para 0,64 GB (13×) | Trocar a grandeza muda **quando a máquina age sozinha**. Alternativas medidas em `TETOS_DE_MEMORIA.json` |

## 3. O padrão que dominou a janela

**Medir a grandeza errada com precisão.** Quatro vezes, e o número estava sempre certo:

| medi | decide |
| :--- | :--- |
| preço unitário do modelo | **faixa orçamentária** |
| `mtime` do arquivo | **data declarada** |
| RAM física | **commit charge** |
| tamanho em disco do modelo | **pegada em runtime** |

Nas quatro, o que quebrou a ilusão foi **um número estável demais para ser
verdade**. Nas duas primeiras fui eu que estranhei; na terceira foi o vértice
(*"RAM 72% estável"*); na quarta, a medição do `ollama ps`.

O corolário virou detector: `tests/test_declarado_e_lido.py` varre a árvore por
AST atrás de constante atribuída e nunca lida — a forma detectável desse padrão.

## 4. Onde estão as declarações

Cinco arquivos em `data/` guardam decisão com a medição que a justifica. **Cada
um tem teste que compara a declaração com a árvore**, nos dois sentidos:

| Arquivo | Governa |
| :--- | :--- |
| `ESTADO_DE_ROTEAMENTO.json` | qual tabela decide o modelo, por superfície |
| `ESTADO_DA_MEMORIA_DE_TRABALHO.json` | por que `notepad_memory` e `replay_buffer` **não** foram ligados |
| `TETOS_DE_MEMORIA.json` | os 4 tetos do guard, com a medição de cada número |
| `DECLARADO_E_NAO_LIDO.json` | inventário de órfãos com veredito por item |
| `INDICE_CANONICO_GOVERNANCA.json` | o canônico de cada família (frente 1) |

Se um desses testes falhar, **a decisão mudou** — atualize a declaração no mesmo
commit, nunca afrouxe o teste.

## 5. Prompt de continuação

```
Contexto: Site em master 50322a68, arvore limpa, suite 620 passed.
Leia primeiro reports/HANDOFF-2026-08-29-roteamento-memoria-e-guard.md e
reports/VALIDACAO-2026-08-28-arquitetura-de-memoria.md.

O plano de memoria (5 passos) esta fechado. As frentes 1, 2, 4 e 5 do plano 2-B
estao entregues; restam a 3 (corpus da memoria -- parcialmente atacada), a 6
(imports e exports: morto vs nao integrado) e a 7 (higienizacao, terminal).

Antes de propor qualquer coisa, rode:
  uv run pytest -q
  uv run python scripts/ops/record_index.py --suspeitos
  uv run python scripts/cli/nexus.py ops guard --once

Regras que esta base cobra, e que custaram caro para aprender:
- Medir antes de agir, e medir a grandeza que DECIDE, nao a que esta a mao.
  Numero estavel demais para ser verdade e o sinal.
- Verde e suspeito por padrao. Mutacao com baseline explicita, conferindo que a
  mutacao APLICOU e que a mensagem nomeia o alvo.
- Onde ha duas fontes para o mesmo fato, apagar a segunda -- nunca sincronizar.
- Portao que reprova: investigar o achado, nunca contornar. E a saida certa
  costuma ser ELIMINAR o achado, nao registrar a supressao.
- git status antes de estagiar. Tres vezes nesta janela evitou sujeira.
- Declaracao que sobrevive ao fato e o defeito que a secao 13.A existe para
  impedir. Reconciliar no mesmo commit.

A frente 6 e a mais destravada agora: a autoridade de roteamento esta decidida,
entao "morto vs nao integrado" pode ser medido sem ambiguidade.
```

## 6. Declaração (governança §5)

Rodaram: a suíte completa antes de cada um dos 13 commits; os dois portões antes
de cada commit, com cinco reprovações corrigidas na origem; 24 mutações com
baseline explícita e conferência de que a mutação aplicou; `git status` antes de
cada estagiamento; o índice do RAG reconstruído cinco vezes e comparado geração a
geração.

Não rodaram: nenhuma chamada real a provedor de LLM; o guard não foi exercitado
sob pressão real de memória; a **qualidade** da recuperação do RAG não foi
avaliada — não existe nesta base um conjunto de consultas com resposta esperada, e
sem ele qualquer afirmação sobre ranking seria opinião com número ao lado; o
estado de autenticação dos conectores de nuvem não foi verificado.

---

## 7. Adendo pós-handoff — o comando de checagem não reportava nada

Rodar as três verificações que a §5 manda rodar achou um defeito **na terceira
delas**. `nexus ops guard --once` imprimia as quatro linhas de teto, mandava a
leitura para `logger.info` (silencioso) e saía com código 0. O comando que o
próximo agente usaria para conhecer o estado da máquina **não dizia o estado da
máquina**, e parecia saudável por sair verde.

O teste que deveria cobrir isso conferia `exit_code == 0` — *não quebrou*, quando
o contrato é *relatar*. Corrigido, com três mutações detectadas. Suíte 620 → 623.

E aí a medição corrigiu **a mim**, a partir de duas observações do vértice
(*"estável demais a RAM"*, *"não senti prejuízo no meu flow"*):

| grandeza | o que ela decide | agora |
| :--- | :--- | ---: |
| commit / limite | alocação passa a ser **recusada** | 87,6% |
| pagefile em uso | a máquina fica **lenta** | 19,7% |
| RAM física | nada, nesta máquina | 73% |

**55% do commit cobrado (41,6 de 75,6 GB) nunca foi tocado** — reserva que o
Windows cobra do limite e que jamais virou página. Por isso o número alto não
dói. O relatório da frente 3 dizia "a pressão de memória é commit"; correto para
recusa de alocação, **errado para desempenho**. Corrigido na §9 daquele
documento.

O padrão da §3 ganha uma variante que vale registrar: aqui **o número estava
certo e a interpretação não**. Três fontes independentes concordavam no valor.
Concordância entre fontes valida a medição, não a conclusão.

## Revisao de ancora -- 2026-08-29, faxina do antecessor

Ancoras atingidas: `memory_rag.py`, `scripts/cli/nexus.py`.

O que mudou nelas: em `memory_rag.py`, extracao de `_accumulate_paragraphs` e
`_is_path_ignored` -- logica movida para metodo proprio, sem alteracao de
regra; em `nexus.py`, a faxina descrita acima.

**As conclusoes deste documento seguem de pe.** O tamanho do fragmento continua
respeitando a constante declarada, e a arvore que se declara superada continua
saindo do indice. A suite de chunking (`tests/test_chunking_rag.py`) cobre a
extracao e esta verde.

## Revisao de ancora -- 2026-08-29, pendencias 9 e 10 fechadas

Ancoras atingidas: `data/TETOS_DE_MEMORIA.json`, `scripts/cli/nexus.py`.

O que mudou nelas: a higienizacao periodica do `optimize-ram --watch` deixou de
rodar por relogio e passou a exigir pressao medida em commit; o bloco
`inalcancavel_nesta_maquina` do JSON ganhou a decisao de 2026-08-29 e passou a
ser lido pelo codigo.

**As conclusoes deste documento seguem de pe.** Nada aqui depende do ramo
periodico do guard nem do teto de RAM. O roteamento e a memoria continuam como
descritos.

## Revisao de ancora -- 2026-08-29, a fila que roda

Ancora tocada: `data/DECLARADO_E_NAO_LIDO.json`.

**A linha 1 da tabela da secao 2 esta errada e fica registrada como errada.** Ela
diz que `PRIORITY_WEIGHTS` esta desligado e que *"a fila ordena por string em
SQL"*. A primeira metade se confirma. A segunda nao: o `CASE` em SQL de
`queue_manager.get_next_task` **nao tem chamador de producao** -- so um teste. A
fila que roda e `worker/loop.py:_dispatch_optimal_task`, que decide pelo
`UniversalArbitrator`, cujas constantes estao hardcoded e ignoram o
`system_config.json`.

Ver [[registro-2026-08-29-a-fila-que-roda]] para a medicao.

**A conclusao deste handoff nao muda:** o item 1 continua sendo decisao do
vertice, e por um motivo mais forte do que o registrado -- alem de mudar a ordem
de saida da fila, o mapeamento entre as chaves do config (`alpha`, `beta`,
`gamma`, `lambda_age`) e as constantes do arbitrador (`TIME_DECAY_ALPHA`,
`PROPAGATION_GAMMA`) nao e inferivel do codigo.

## Revisao de ancora -- 2026-08-29, o fallback que nao carrega

Ancora tocada: `data/ESTADO_DE_ROTEAMENTO.json`.

O item 2 da tabela da secao 2 diz: *"`Rota.fallback` sem consumidor -- ligar
torna `gemma4:e4b` alcancavel, e ele nao cabe na VRAM"*. **A primeira metade
esta desatualizada**: o consumidor existe desde 2026-08-27 em
`llm/routing_policy.py:426`. A segunda continua valendo, e piorou -- alem do
fallback (9,6 GB), o *primario* da classe LOCAL (`gemma4:12b`, 7,6 GB) tambem
estoura o teto declarado de 7,2 GB.

O caminho so nao esta em uso porque `primario_indisponivel=True` nao tem
chamador de producao.

**A conclusao do handoff nao muda:** o item 2 segue como decisao do operador
sobre a tabela. Ver [[registro-2026-08-29-o-fallback-que-nao-carrega]].
