---
id: plano-2b-curadoria-estrutural
tipo: pd
escopo: multiprojeto
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-27T18:35-03:00
commit: 4cce6758
classes: [interno, medido]
config_medida:
  raiz: C:/Users/rapha/.gemini
  data_das_medicoes: 2026-08-27
  exclusoes: [node_modules, .venv, .git]
verificado:
  - inventario de colisoes de basename por find + comparacao byte a byte (cmp)
  - extensions/ vs antigravity-cli/plugins/: 324 arquivos comparados por cmp
  - MODUS_OPERANDI.md localizado nas 5 ocorrencias e comparado por conteudo
  - contagem de SKILL.md e SKILL.md.bak em 3 recortes
  - manifesto do RAG lido e efeito de cada fonte medido arquivo a arquivo
  - PRELUDIO 0.5.1 roteamento medido nos dois estados (texto livre para o Typer
    devolvia EXIT=2) e a regra nova exercitada em 10 entradas incluindo Int32,
    null e vazio; parse dos 2 arquivos em pwsh 7 e PS 5.1
  - PRELUDIO 0.5.2 semantica do system_prompt lida no servidor
    (_build_multiturn e _build_inference_options), nao inferida do cliente
  - MAPA 1.5 (2026-08-28) as 5 familias inventariadas na raiz multiprojeto e
    cada referencia resolvida para a COPIA que atinge, nos tres tipos de
    consumidor (codigo, manifesto, convencao de runtime)
  - MAPA 1.5 pertencimento ao corpus do RAG conferido copia a copia, resolvendo
    o manifesto fonte a fonte
  - MAPA 1.5 Site/skills x extensions comparado arquivo a arquivo por cmp
    (79 identicos, 53 divergentes) e a direcao da divergencia medida por mtime
  - MAPA 1.5 registro de habilitacao e ledger de integridade do CLI conferidos
    separadamente: provam coisas diferentes (regra x instalacao)
  - FRENTE 3.1 ausencia do pacote lancedb e presenca do chromadb conferidas por
    importlib.util.find_spec, e as 10 afirmacoes de "LanceDB" localizadas em
    codigo vivo uma a uma
  - FRENTE 3.3 destino dos dados do supermemory lido no cliente
    (POST de content para api.supermemory.ai) e ausencia de modo self-hosted
    conferida no README
nao_verificado:
  - NENHUM arquivo foi movido, renomeado ou removido pelas frentes 1 a 7. O
    PRELUDIO alterou o roteamento do perfil e travou o contrato de inferencia;
    fora isso este documento continua sendo um PLANO.
  - a arvore fora de ~/.gemini nao foi inspecionada
  - nao foi medido quem IMPORTA cada copia duplicada; so a duplicacao em si
  - antigravity-cli/ e antigravity-ide/ nao tiveram o conteudo auditado
  - o proxy de inferencia NAO foi levantado: a semantica do 0.5.2 foi
    estabelecida por leitura do servidor e travada por teste do payload do
    cliente, nao por observacao de temperatura real. As chaves deste ambiente
    estao revogadas e nenhum modelo foi consultado.
  - MAPA 1.5: o Gemini CLI NAO foi executado. Que `extensions/` e a arvore
    carregada vem de tres evidencias convergentes -- o registro de habilitacao
    do CLI vive dentro dela, e o caminho padrao da ferramenta, e Site/skills nao
    e diretorio de skills reconhecido -- e nao de observacao do carregamento.
  - MAPA 1.5: nao foi medido POR QUE Site/skills divergiu, nem se o fork foi
    deliberado. So que divergiu, em que direcao e quando.
  - MAPA 1.5: a arvore de `antigravity/brain/` foi excluida das buscas de
    consumidor (e log de sessao, nao codigo vivo).
  - FRENTE 3.2: o LanceDB NAO foi instalado nem exercitado. A particao de
    corpus proposta e desenho, nao medicao -- o unico numero medido do lado
    LanceDB e o benchmark historico do CONTEXT_CHECKPOINT (54,7k reg/s), que
    nao foi reproduzido nesta sessao.
  - FRENTE 3: nenhuma busca RAG real foi executada; o gemma_server nao foi
    levantado. A equivalencia ChromaDB vem de leitura de codigo e da ausencia
    do pacote lancedb.
supersede: null
---

# PLANO 2-B — Curadoria estrutural de `~/.gemini`

> **Autorizado por Raphael Vitoi em 2026-08-27.** Frente subsequente ao trabalho
> de governança e portões da mesma data. Ver
> [HANDOFF-2026-08-27](HANDOFF-2026-08-27-governanca-e-portoes.md).

## 0. Por que isto não é limpeza

Limpeza remove o que sobra. Esta frente **reconcilia estruturas que já se
contradizem entre si** — e a contradição já custou diagnóstico errado quatro
vezes num único dia:

| # | Contradição | Custo medido |
| :--- | :--- | :--- |
| 1 | Dois `MODUS_OPERANDI.md` com o mesmo basename | Auditoria mensal descartava o canônico (39 KB) e reportava os dados do outro (12 KB) como se fossem dele |
| 2 | `reports` como nome solto num filtro | Excluía 20 registros de `docs/reports/` sem ninguém pedir |
| 3 | `recursive: false` declarado e nunca lido | Campo mentia; honrá-lo sem coordenação removeria 39 registros de governança viva |
| 4 | `.gemini` dentro de `Site/` | Ambiguidade de raiz — a mesma que o `CLAUDE.md` §1 já documenta como causa de três diagnósticos errados |

**Nenhuma delas apareceu como erro.** Todas apareceram como sucesso. É por isso
que a ordem abaixo termina em higienização, e não começa por ela.

---

## 0.5. PRELÚDIO — as duas portas, resolvidas antes da frente 1

> **Executado em 2026-08-27**, antes de qualquer movimento estrutural.
> Registrado aqui, e não como pendência solta, porque **os dois eram portas de
> entrada**: um decide como o humano entra no ecossistema, o outro como o
> cliente fala com o modelo. Curadoria estrutural que começa sem as portas
> definidas move móveis num prédio cuja entrada ainda está sendo discutida.

### 0.5.1 A porta do humano — `nexus <texto livre>` era regressão, não escolha

Foi registrado como *"mudou de destino, pode ser intencional"*. A medição
mostrou coisa pior:

```
nexus refatorar o kernel de poker  ->  EXIT=2, "No such command 'refatorar'"
```

O posicional 0 do `do.ps1` é `$Description` (linha 41): **texto livre era o uso
histórico principal — enfileirar tarefa.** A regra *"primeiro argumento sem
hífen vai para o `nexus.ps1`"* mandou esse uso para um erro do Typer.

O discriminador certo não é a presença de hífen. É o **pertencimento ao
conjunto de comandos do Typer** — flags *e* texto livre pertencem ambos ao
`do.ps1`:

| Entrada | Destino |
| :--- | :--- |
| `status`, `dashboard`, `db`, `task` … (os 21 comandos) | `nexus.ps1` |
| `refatorar o kernel` (texto livre) | `do.ps1` — enfileira tarefa |
| `-Web`, `-Execute` (flags) | `do.ps1` |
| sem argumentos | `nexus.ps1` — ajuda do Typer, lista os 21 |

**A lista estática é a dívida que isso cria**, e é a mesma forma do mapa de
modelos Ollama em três cópias divergentes. Barrada por
`tests/test_roteamento_perfil.py`, que compara **as duas cópias** com os
comandos que o Typer de fato registra, verifica que a lista é *consultada* e
não só declarada, e proíbe o retorno da decisão por hífen.

**A duplicação continua** — é o item 1.3 logo abaixo. Mas deixou de poder
divergir em silêncio, que é o pré-requisito para movê-la com segurança.

### 0.5.2 A porta do modelo — eu tinha classificado errado

Registrei que o modo conversacional enviava `system_prompt` **e**
`messages[0]` com o mesmo conteúdo, chamei de *"persona duplicada"* e disse que
resolver exigia levantar o proxy. **As duas afirmações estavam erradas**, e a
leitura do servidor bastou para desfazê-las.

Não há duplicação: `_build_multiturn` só insere um system quando `messages[0]`
**não** é system, e o cliente já põe um lá. O `req.system_prompt` nunca entra
no conteúdo no caminho multi-turn.

O que existe é um **canal lateral**:

```python
# gemma_server._build_inference_options
elif not req.system_prompt:
    params["temperature"] = 0.0
```

A *presença* do campo distingue conversacional (temperatura do modelo, 0.4-0.5)
de agêntico (forçada a 0.0). **A redundância é load-bearing:** quem a
"limpasse" trocaria 0.5 por 0.0 sem que nada acusasse. Travado em
`tests/test_run_inference_contrato.py` e anotado no ponto de uso.

> **Lição que este prelúdio deixa para as frentes 1 a 7:** eu classifiquei um
> não-defeito como defeito lendo só um lado da fronteira. A frente 5 (mapa de
> quem referencia quem) é inteiramente feita de fronteiras assim. Ler os dois
> lados antes de nomear o problema não é rigor opcional ali — é o método.

---

## 1. Diretórios homônimos — inventário medido

### 1.1 `MODUS_OPERANDI.md` existe em 5 lugares

| Bytes | Caminho | Natureza |
| ---: | :--- | :--- |
| **40.028** | `~/.gemini/MODUS_OPERANDI.md` | **CANÔNICO** — governança multiprojeto |
| 12.836 | `Site/MODUS_OPERANDI.md` | governança do projeto |
| 6.743 | `Site/.cerebro/ops-deploy/MODUS_OPERANDI.md` | **cópia exata** do próximo |
| 6.743 | `Site/.claude/MODUSOPERANDI/MODUS_OPERANDI.md` | **cópia exata** do anterior |
| 4.616 | `antigravity/.claude/MODUS_OPERANDI.md` | governança de projeto irmão |

Os dois de 6.743 B são **byte a byte idênticos** (verificado por `cmp`). Nenhum
dos cinco declara qual é o canônico nem aponta para ele.

### 1.2 `extensions/` e `antigravity-cli/plugins/` são espelho exato

**324 arquivos comparados por `cmp`, zero divergências**, mais 76 que só existem
em `extensions/`. É a mesma árvore de plugins mantida em dois lugares.

### 1.3 A cópia perigosa: divergência silenciosa

`superpowers/CLAUDE.md` existe em `Site/skills/` (7.574 B) e em `extensions/`
(8.506 B) — e **diverge**. Duplicata idêntica é desperdício; duplicata
divergente é armadilha, porque quem lê uma acredita estar lendo a outra.

### 1.4 Skills desativadas por rename

379 `SKILL.md.bak` (excluindo `node_modules`), **todos órfãos** — nenhum tem
`SKILL.md` ao lado. Não são backup: são a própria skill desligada. 61 ativas.

---

## 1.5 MAPA DE REFERÊNCIA — quem lê qual cópia

> Medido em 2026-08-28. **Nada foi movido, renomeado ou removido.** É a base de
> evidência que transforma as declarações de canônico da frente 1 em decisões
> mecânicas em vez de arbitrárias — `CLAUDE.md` §4: *"presumir que algo é órfão
> e remover já quebrou a toolchain aqui."*

### 1.5.1 Consumidor tem três tipos, e só um deles o `grep` enxerga

Essa distinção é o produto mais importante desta medição. Sem ela, "zero
referências" seria lido como "órfão", e a conclusão estaria errada em três das
cinco famílias.

| Tipo | Como se manifesta | Detectável por |
| :--- | :--- | :--- |
| **Código** | um script abre o caminho explicitamente | `grep` |
| **Manifesto** | declarado em config (`gemini-extension.json`, `rag_ingestion_manifest.json`) | leitura do manifesto |
| **Convenção do runtime** | carregado pelo agente por **nome + localização** (`CLAUDE.md` pelo Claude Code, `GEMINI.md` pelo Gemini CLI) | **invisível ao `grep`** |

**Nenhuma remoção pode se basear apenas na ausência do tipo 1.**

### 1.5.2 `MODUS_OPERANDI.md` — 5 cópias, consumidores resolvidos

| Bytes | Cópia | Código | RAG | Veredito |
| ---: | :--- | :--- | :--- | :--- |
| **40.028** | `~/.gemini/MODUS_OPERANDI.md` | `nexus.py:2156` (handoff), auditoria mensal, `sota_hygiene.py:321` | **FORA** | **CANÔNICO** e mais lido |
| 12.836 | `Site/MODUS_OPERANDI.md` | auditoria mensal (`SITE_ROOT /`) | **FORA** | governança de projeto |
| 6.743 | `Site/.claude/MODUSOPERANDI/…` | nenhum | **DENTRO** | só a memória lê |
| 6.743 | `Site/.cerebro/ops-deploy/…` | nenhum | **FORA** | **órfão real** — zero consumidores dos três tipos |
| 4.616 | `antigravity/.claude/…` | `task_executor.py:604` | n/a | canônico do projeto irmão |

**Achado 1 — a inversão do corpus.** O índice de memória contém a cópia
derivada de 6.743 B e **exclui as duas autoritativas**. Quem consulta a memória
sobre o Modus Operandi recebe o resumo, nunca o manual de 40 KB. As duas
"cópias" gêmeas byte a byte não são equivalentes: uma alimenta a memória, a
outra não alimenta nada.

**Achado 2 — o único órfão verdadeiro de toda a varredura** é
`Site/.cerebro/ops-deploy/MODUS_OPERANDI.md`. Nenhum código, nenhum manifesto,
nenhuma convenção. O diretório `ops-deploy/` é referenciado em prosa
(`project-context.md`) e outros arquivos dele estão no `document_manifest.json`
— mas este não.

### 1.5.3 `CLAUDE.md` — 4 de governança, 7 de componente

| Bytes | Cópia | Consumidor |
| ---: | :--- | :--- |
| 4.796 | `~/.gemini/CLAUDE.md` | **convenção** — carregado toda sessão |
| 3.576 | `Site/CLAUDE.md` | **convenção** — carregado com `cwd=Site`. FORA do RAG |
| 3.483 | `Site/.claude/PROPOSITOS/CLAUDE.md` | só o RAG |
| 2.281 | `antigravity/.claude/CLAUDE.md` | `do.ps1` ×3, `cognitive.py:33`, `task_executor.py:605`, `memory_rag.py:82` — **o mais lido por código de toda a varredura** |

**Achado 3 — o manual canônico erra sobre o próprio diretório.** A §1 do
`~/.gemini/CLAUDE.md`, linha 20, declara `AGENTS.md` na raiz. **Ele não
existe.** É a única inconsistência interna verificável do documento que governa
tudo — e ele é carregado em toda sessão, nas duas cópias (`~/.gemini/` e
`~/.claude/`).

### 1.5.4 `GEMINI.md` — a família de 35 era falsa

30 das 35 ocorrências estão dentro de plugins e são **declaradas por
manifesto**: cada `gemini-extension.json` traz `"contextFileName": "GEMINI.md"`.
Não são cópias concorrentes de governança — são o arquivo de contexto daquele
plugin. Declarar um "GEMINI.md canônico" que as substituísse **quebraria as
extensões**.

Governança real: 5 (raiz 1.476, `Site/` 5.548, `antigravity/` 8.342,
`antigravity-cli/` 3.489, `antigravity-ide/` 4.067). Só a da raiz tem
consumidor de código (`sota_hygiene.py:320`); as outras vivem de convenção.

`FUNDAMENTOS_SOTA.md` é **única**. Não há família — não precisa de declaração.

### 1.5.5 `Site/skills/` — **RETIFICADO em 2026-08-28**

> **A conclusão abaixo estava errada sobre a NATUREZA.** `Site/skills/` não é
> fork nem cópia: são **8 submódulos git** apontando para upstreams públicos
> (`.gitmodules` existe, os 8 são gitlinks modo `160000`, e o `HEAD` de cada um
> bate com o gitlink). Os "53 divergentes" são **versões diferentes**, não
> trabalho editado e perdido.
>
> **Por que errei:** medi `cmp` e `mtime`, que respondem *"são diferentes?"*, e
> pulei `git ls-files -s`, que responde *"o que isto é?"*. A pergunta de
> natureza precede a de diferença.
>
> **O que continua válido:** a árvore que o CLI carrega é `extensions/`, e ela
> está mais velha. **O que muda:** o risco real não são os 53 arquivos de
> versão — são **62 fontes modificados localmente** dentro dos submódulos,
> invisíveis ao `git status` por `ignore = dirty` e destrutíveis por um
> `git submodule update`.
>
> Auditoria completa em
> [AUDITORIA-2026-08-28-skills](AUDITORIA-2026-08-28-skills.md).

O texto original, preservado como registro do que foi medido e do que foi
concluído a mais do que a medição autorizava:

Este é o achado de maior consequência da medição, e o que mais teria sido
destruído por uma limpeza baseada em intuição.

| Medida | Valor |
| :--- | ---: |
| Entradas em `Site/skills/` | 8 |
| Também em `extensions/` | 6 |
| **Só em `Site/skills/`** | **2** (`gemini-cli-security`, `gemini-deep-research`) |
| Arquivos idênticos ao espelho | 79 |
| **Arquivos divergentes** | **53** |
| Divergentes em que `Site/skills` é **mais novo** | **53** |
| Divergentes em que `extensions/` é mais novo | **0** |

`Site/skills/superpowers/CLAUDE.md`: 2026-08-17, 7.574 B.
`extensions/superpowers/CLAUDE.md`: 2026-06-01, 8.506 B.
Dois meses e meio mais novo, e **menor** — editado, não apenas atualizado.

**Achado 4 — a árvore que roda é a velha.** `extensions/` é a árvore que o CLI
gerencia: o registro de habilitação (`extension-enablement.json`) vive dentro
dela. `Site/skills/` não é diretório de skills reconhecido (`Site/.claude/skills`
não existe, nenhum `settings.json` o menciona), não é declarado por manifesto e
não é lido por código. **53 arquivos de trabalho mais recente não são carregados
por nada** — e isso nunca produziu erro, porque o antigo continua funcionando.

**Achado 5 — o espelho é incompleto nos dois sentidos.** Além dos 76 arquivos
que só existem em `extensions/` (já medidos na §1.2), `gemini-cli-security` e
`gemini-deep-research` estão no **ledger de integridade** do CLI — ou seja, o
CLI os instalou — mas **não existem em `extensions/`**: só em
`antigravity-cli/plugins/` e `Site/skills/`.

### 1.5.6 O que a frente 1 já pode decidir, e o que ainda não

**Decidível agora, com evidência:**

1. Canônico de `MODUS_OPERANDI` = a raiz (40 KB) — é a mais lida por código.
2. `Site/.cerebro/ops-deploy/MODUS_OPERANDI.md` é órfão dos três tipos. **Remoção continua exigindo ordem explícita**, mas a evidência está completa.
3. `GEMINI.md` e `CLAUDE.md` de plugin **não entram** na declaração de canônico. A família de governança do `GEMINI.md` tem 5 membros, não 35.
4. `FUNDAMENTOS_SOTA.md` sai da lista de homônimos: é única.
5. O corpus do RAG precisa incluir os dois `MODUS_OPERANDI` autoritativos — hoje indexa só o derivado.

**Ainda não decidível, e por quê:**

| Questão | Falta |
| :--- | :--- |
| `Site/skills/` — promover, fundir ou arquivar os 53 arquivos mais novos? | Saber se o fork foi deliberado. É decisão do vértice, não inferência |
| `AGENTS.md` na raiz — criar ou corrigir o `CLAUDE.md`? | Decidir se a família deve existir na raiz |
| As 2 extensões fora de `extensions/` | Entender se a instalação quebrou ou se o caminho é outro |

---

**Entregável do item 1:** regra de nomeação que proíba basename ambíguo em
artefato de governança, mais um índice que declare o canônico de cada família.
**A base de evidência está na §1.5 acima.**

---

## 2. Âncoras e índices

`data/RECORD_INDEX.json`, declarado na §13.C do MODUS_OPERANDI, **não existe**.
Consequência medida: dos quatro itens do portão §13.F, **dois estão inativos** —
não falham, simplesmente não têm o que ler.

É a forma canônica do modo de falha desta casa: regra escrita, portão instalado,
e dois dos quatro critérios sem fonte de dados. O portão passa. Sempre passou.
Mesma família do `commit-msg` que morava em `.git/hooks/` com
`core.hooksPath=.husky` — a regra existia no disco e nunca executava.

### 2.1 O que já se acumulou neste escopo

Esta frente absorve tudo o que apareceu em 2026-08-27 tocando índice e âncora,
em vez de manter itens paralelos:

| Origem | Fato medido | O que a frente 2 tem de resolver |
| :--- | :--- | :--- |
| §13.C do M.O. | `data/RECORD_INDEX.json` não existe | Gerar a partir do frontmatter dos registros |
| §13.F, portão | 2 dos 4 itens inativos por falta do índice | Ligar os dois dormentes e **medir os dois estados** de cada um |
| Portão de âncora | Os outros 2 itens funcionam e reprovam de verdade | Não regredir: são a referência de como os outros dois devem ficar |
| Registros de 27/08 | 5 relatórios com frontmatter canônico já existem (`POSTULADO-001`, `HANDOFF`, `PLANO-2B`, `INTERLUDIO`, `AUDITORIA`) | São o corpus inicial do índice — e o teste de que o gerador lê frontmatter real, não sintético |
| Frente 1 (homônimos) | O índice precisa apontar para o **canônico** de cada família | **Dependência dura:** gerar o índice antes de declarar os canônicos grava a escolha arbitrária em disco |

### 2.2 Duas armadilhas conhecidas, nomeadas antes de começar

1. **Índice gerado é fato MEDIDO** (M.O. §13.A), não interno: vale para a
   árvore no estado em que foi varrida. Precisa de `config_medida`, ou vira
   número citado que ninguém consegue reproduzir.
2. **Verificar contra manifesto real, não sintético.** A validação do
   `memory_rag` nesta mesma sessão usou um manifesto inventado e não detectou o
   conflito da §13; o defeito só apareceu ao medir com o manifesto de verdade.
   O gerador do índice tem de ser exercitado contra `reports/` como está.

**Entregável:** o índice gerado a partir do frontmatter real, os dois itens
dormentes do portão §13.F ativos e **provados nos dois estados**, e um teste que
reprove se o índice divergir dos registros em disco.

**Ordem:** depois da frente 1. A dependência está no grafo da §8.

---

## 3. Contexto e memória

O manifesto do RAG ficou honesto nesta sessão (fonte para `reports/`, flag
`recursive` obedecida, arquivo morto excluído por subárvore). O corpus foi de
507 para 461 arquivos, com governança viva mantida e `.ARQUIVE` fora.

Mas a pergunta de fundo continua aberta: **qual corpus a memória DEVE ter?** O
atual é o que os globs alcançam, não o que foi decidido. Hoje ele inclui 249
arquivos de código (`*.py`, `*.ps1` recursivos da raiz) — decisão que ninguém
registrou.

### 3.1 O motor era outro do que todo mundo dizia

Medido em 2026-08-28: **`lancedb` não está instalado. `chromadb` está.** O
`memory_rag.py` usa `chromadb.PersistentClient` com embeddings
`ONNXMiniLM_L6_V2`, locais.

"LanceDB" era afirmado em **dez pontos de código vivo** — painel do dashboard,
quatro pontos do `gemma_server`, log de exceção, dashboard de avatares e o
**`system_prompt` entregue ao modelo**, que informava ao LLM ser um *"Motor de
RAG LanceDB"*. Todos corrigidos.

A origem está no `CONTEXT_CHECKPOINT`: `lancedb 0.37.1` foi **benchmarkado**
junto com `pyarrow 25.0.1` e `pyspark 4.2.0` (throughput medido de 54,7k reg/s).
A narração foi escrita para o estado **pretendido** e nunca reconciliada com o
**construído**. Nada acusou, porque nome errado não levanta exceção.

### 3.2 Instalar LanceDB **junto** com o Chroma — a condição inegociável

Foi levantado pelo vértice, e faz sentido técnico: LanceDB tem backend Rust,
formato colunar Arrow/Lance, busca híbrida (vetorial + texto integral),
versionamento de dados e leitura sem cópia. É outra classe de ferramenta, não
um Chroma melhor.

**Mas coexistência aqui tem precedente ruim.** Duas memórias e dois paradigmas
de roteamento já são problema aberto nesta base (frente 4, e a decisão
`supermemory` × `memory_rag` na §3.3). Instalar um terceiro motor "ao lado" sem
partição declarada é reproduzir o padrão pela terceira vez.

**Condição:** a partição de responsabilidade se declara ANTES da instalação, não
depois. A que faz sentido pela natureza dos dados:

| Corpus | Motor | Por quê |
| :--- | :--- | :--- |
| Governança, registros, memória de agente (~460 arquivos textuais) | **ChromaDB** | Pequeno, textual, já funciona, embeddings locais, zero configuração |
| PDFs do Drive (`ingest_drive_pdfs`), séries de benchmark, dados tabulares | **LanceDB** | Volume, colunar, Arrow — é exatamente o domínio dos 54,7k reg/s já medidos |

Sem essa linha escrita e testada, dois motores viram duas verdades.

**Roteiro proposto, em ordem:**

1. Declarar a partição acima (ou outra) num registro — **antes** de `pip install`.
2. Instalar e indexar **só** o corpus da coluna LanceDB. Não duplicar o de Chroma.
3. **Período de sombra medido:** para um conjunto de consultas de referência,
   registrar o que cada motor devolve. Comparação, não impressão.
4. Só então decidir se algum absorve o outro.
5. Guarda: estender `test_o_motor_de_rag_declarado_e_o_instalado` para exigir
   que **cada** motor citado no código esteja instalado **e** tenha corpus
   declarado. Hoje ela já reprova nome sem pacote.

**O que NÃO fazer:** instalar o LanceDB e reindexar o mesmo corpus nos dois. É
como a situação já corrigida termina de volta.

### 3.3 `supermemory` × `memory_rag` — decidido por fronteira, não por qualidade

`gemini-supermemory` faz `POST` do conteúdo para `https://api.supermemory.ai`,
exige `SUPERMEMORY_API_KEY` e não tem modo self-hosted (o *"local development"*
do README é `npm link`). O `memory_rag` é local, zero egresso.

O corpus em questão são POSTULADOs, handoffs, memória de agente e o código deste
repositório. **Mandar isso para SaaS de terceiro é decisão de exfiltração, não
de arquitetura** — e as chaves deste ambiente estão revogadas de propósito.

**`memory_rag` é a autoridade.** Não por ser melhor: por ser o único que
respeita a fronteira.

O que vale importar do `supermemory` são **conceitos, não o serviço** — três que
o `memory_rag` não tem:

- `hooks/session-start.js` — injeção automática de memória no início da sessão.
  Hoje o `nexus agent handoff` faz isso à mão.
- `git-utils.js` — contexto ciente do estado do git.
- `project-config.js` + `container-tag.js` — escopo e etiquetagem por projeto.

**Entregável:** declaração explícita do corpus pretendido, com justificativa por
fonte, o manifesto derivado dela — não o contrário — e a partição de motores da
§3.2 escrita antes de qualquer instalação.

---

## 4. Routing

Depende da pendência 6 do handoff e não deve ser atacado antes dela:

- `llm/routing_policy.py` — política **declarada**: partição por classe de
  tarefa, âncoras de decaimento, `decidir()` com procedência.
- `llm/routing.py` — política **executada**: heurística competitiva por score,
  no caminho quente via `orchestrator`.

`decidir()` está correto e **inerte por desenho**, não por esquecimento: medido
em 2026-08-27, nenhum chamador de produção escalona por esta tabela.

**Entregável:** decidir qual das duas é a autoridade. Enquanto não decidir, toda
melhoria em qualquer uma delas tem chance de virar retrabalho.

---

## 5. Regras mestras, referências e referenciais

Famílias medidas na raiz: `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`,
`FUNDAMENTOS_SOTA.md`, `MODUS_OPERANDI.md` — dezenas de ocorrências, várias
delas stubs de 9 a 92 bytes (`Site/skills/superpowers/AGENTS.md` tem 9 B).

**Entregável:** mapa de quem referencia quem, e onde a referência aponta para
cópia em vez de canônico. Precedente direto: o `README` do `hybrid_router`
apontava para a cópia da raiz e para o `.venv` errado — corrigido nesta sessão.

---

## 6. Imports e exports

Dois defeitos desta classe já apareceram e foram corrigidos:

- `__all__` incompleto: `rotas_suspeitas` e `TTL_ROTA_DIAS` existiam e não eram
  exportados.
- Módulo sem consumidor: `rotas_suspeitas()` não era chamada por ninguém, e a
  auditoria mensal que deveria chamá-la **recomendava por escrito** fazer o que
  ela faz, com texto literal.

**Entregável:** varredura de símbolo público sem `__all__` e de módulo sem
importador, com a distinção entre "ainda não integrado" e "morto".

---

## 7. Higienização e reorganização — POR ÚLTIMO

**Só depois de 1 a 6.** A regra vem do `CLAUDE.md` §4 e foi paga com quebra real
de toolchain nesta casa: *presumir que algo é órfão e remover já quebrou a
toolchain aqui.*

Antes de mover ou remover qualquer arquivo:

1. Verificar quem referencia — com busca por referência real, não substring.
2. Verificar o que está no PATH e o que o manifesto exige.
3. Declarar o canônico antes de tocar na cópia.

**Remoção é destrutiva e exige ordem explícita do vértice, item a item.**

---

## 8. Ordem e dependências

```mermaid
graph LR
    P["0.5 · PRELÚDIO<br/>as duas portas<br/>CONCLUÍDO"] --> A["1 · Homônimos<br/>declarar canônico"]
    A --> B["2 · Índices<br/>RECORD_INDEX + §13.F"]
    A --> E["5 · Referenciais<br/>quem aponta p/ quem"]
    B --> C["3 · Memória<br/>corpus pretendido"]
    E --> C
    D["4 · Routing<br/>qual é a autoridade"] --> F["6 · Imports<br/>morto vs não-integrado"]
    C --> G["7 · Higienização<br/>mover e remover"]
    F --> G
    E --> G
    style P fill:#1f5f3a,stroke:#7fe0a8,color:#fff
    style A fill:#1f4e5f,stroke:#7fd1e0,color:#fff
    style G fill:#5f1f1f,stroke:#e08080,color:#fff
    style D fill:#4a3f1f,stroke:#e0c880,color:#fff
```

O **prelúdio** precede tudo porque define as duas portas de entrada: se elas
mudam depois, cada decisão tomada abaixo delas precisa ser revisitada.

O item 1 destrava mais coisa que qualquer outro: sem saber qual é o canônico,
índice, memória e referencial ficam todos apontando para escolha arbitrária.
**A frente 2 depende dele por uma razão dura** — gerar o `RECORD_INDEX` antes
de declarar os canônicos grava a escolha arbitrária em disco, e a partir daí ela
deixa de parecer arbitrária.

O item 7 é o único destrutivo, e por isso é terminal.

---

## 9. Critério de aceite (do vértice, verbatim)

> *"linha padrão ouro que minimiza chance de erro, aumenta eficiência e
> excelência, e inviabiliza retrabalho ou efeitos sistêmicos negativos. isso
> vale pra ordem das tarefas também."*
