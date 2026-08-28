---
id: handoff-2026-08-28-auditorias-e-preludio
tipo: handoff
escopo: multiprojeto
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T02:50-03:00
atualizado_em: 2026-08-28T05:10-03:00
commit: 71934ef7
classes: [interno, medido]
referencias_nao_resolviveis:
  - reports/HANDOFF-2026-08-28-browser-sota-cdp.md
config_medida:
  raiz: C:/Users/rapha/.gemini
  branch: master
  suite_no_inicio: 415 passed
  suite_no_fim: 504 passed (arvore viva) / 500 passed + 4 skipped (isolada)
  commits_da_sessao: 16
  data: 2026-08-27 a 2026-08-28
verificado:
  - FRENTE 2 -- criterios da 13.F sondados nos DOIS estados, um a um, com
    violacao encenada em stage -- 3 de 7 bloqueavam antes, 7 de 8 depois
  - FRENTE 2 -- cada bloqueio conferido pela MENSAGEM, e nao so pelo codigo de
    saida; a primeira rodada atribuiu um bloqueio ao criterio errado
  - FRENTE 2 -- os 10 registros com frontmatter submetidos a yaml.safe_load;
    6 eram ilegiveis e os 10 parseiam apos a normalizacao
  - FRENTE 2 -- indice gerado contra o corpus real (121 arquivos), nunca
    sintetico; cadeia de supersede derivando OBSOLETO sem estado declarado
  - FRENTE 5 -- 518 .md varridos por citacao de caminho; cada estreitamento
    medido (1511 -> 46 -> 3) e as 4 suspeitas do recorte prescritivo conferidas
    a mao, uma a uma
  - FRENTE 5 -- criterio G6 provado nos dois estados; a isencao por
    referencias_nao_resolviveis testada contra vazamento para caminho nao declarado
  - FRENTE 1 -- corpus do RAG medido nos dois estados com o coletor real
    (470 -> 474) e a barreira de traversal exercitada (fonte ".." coleta 0)
  - FRENTE 1 -- 7 mutacoes aplicadas as guardas do indice, com baseline explicita
    (11 passed antes) e contagem de COLETADOS conferida; 7 detectadas
  - FRENTE 1 -- os consumidores de codigo declarados no indice reconferidos
    arquivo a arquivo -- dois haviam envelhecido
  - suite completa executada apos cada bloco de alteracao
  - portao de ancora executado antes de cada commit; um deles REPROVOU e a
    causa foi corrigida em vez de contornada
  - 14 mutacoes aplicadas e revertidas ao longo da sessao, com baseline
    explicita nas ultimas 11
  - parse dos arquivos .ps1 alterados em pwsh 7 e em Windows PowerShell 5.1
  - launchers executados de dentro e de fora do projeto
nao_verificado:
  - nenhuma chamada real a provedor de LLM -- as chaves deste ambiente estao
    revogadas e nao foram substituidas
  - o proxy de inferencia (127.0.0.1:17043) nunca foi levantado
  - nenhuma skill foi executada; nenhum servidor MCP foi iniciado
  - o Gemini CLI nao foi executado
  - nexus ops maintenance nao foi rodado ponta a ponta (o passo 3 e
    sanitize --apply, que deleta arquivos)
  - nexus ops quality-gate completo (10 fases) nao foi executado
  - os patches em patches/skills NAO foram reaplicados sobre copia limpa
  - FRENTE 1 -- nenhuma ingestao foi executada -- o corpus foi medido pelo
    coletor (que arquivos ENTRAM), nao pela indexacao (o que a memoria devolve)
  - FRENTE 1 -- qual das tres grafias de chave de contexto o Gemini CLI honra de
    fato nao foi medido; exigiria executar o CLI
  - FRENTE 2 -- o criterio C2b (ancora DECLARADA) nao foi sondado ponta a ponta;
    a violacao exige registro rastreado e fora do stage. Provado em unidade
  - FRENTE 2 -- nenhum registro declara o campo caminhos hoje; C2b esta ativo
    com raio zero por ausencia de adotantes, nao por ausencia de defeito
  - FRENTE 2 -- os 111 arquivos sem frontmatter nao foram convertidos em
    registro; continuam fora do indice, contados e declarados
supersede: handoff-2026-08-27-governanca-e-portoes
---

# HANDOFF — 2026-08-28

Sequência do [HANDOFF-2026-08-27](HANDOFF-2026-08-27-governanca-e-portoes.md),
que este documento **supersede** para efeito de retomada.

## 1. Estado

```
master 71934ef7 · suíte 415 → 504 (viva) · 500 + 4 skipped (isolada)
```

Dezesseis commits.

> **A concorrência foi resolvida no INTERLÚDIO de 05:05.** As quatro edições da
> outra sessão foram auditadas por execução e adotadas; as assimetrias que elas
> expuseram, fechadas; e a suíte ganhou um caminho de execução isolado. Resta
> intocado apenas o registro não rastreado
> `reports/HANDOFF-2026-08-28-browser-sota-cdp.md` — decisão do vértice.
> Ver [INTERLUDIO-2026-08-28](INTERLUDIO-2026-08-28-concorrencia-e-isolamento.md)
> e §4.5.

| Commit | O quê |
| :--- | :--- |
| `d9db429e` | Procedência de rota, portão de âncora, 10 sinais desconectados |
| `f3f7084e` | Dashboard executivo + saneamento de 6 achados do interlúdio |
| `e436e3e1` | Veredito derivado nos 4 resumos; fim do sucesso gracioso |
| `97c931d8` | Reprovar em toda direção de falha que devolvia zero |
| `dbaf4e82` | Prelúdio do plano 2-B: as duas portas de entrada |
| `4792e73b` | Mapa de referência das famílias de governança |
| `a6712d6a` | `AGENTS.md` vira ponteiro + auditoria das 8 skills |
| `dc231c69` | O motor é ChromaDB; o passo 5 do maintenance nunca existiu |
| `9670b8a0` | Patches dos submódulos + handoff + frente 3 do plano |
| `b3caaa1a` | **Frente 1 entregue:** índice canônico + regra de nomeação |
| `6634a3f0` | **Frente 2 entregue:** `RECORD_INDEX` derivado + portão que lê o documento |
| `9d02b9fa` | **Frente 5 entregue:** referência viva + isenção declarada |
| `9e7f7d26` | Bloco de comentário é prosa — achado auditando a outra sessão |
| `26f5e630` | **Interlúdio:** adota as edições concorrentes, unifica os vereditos |
| `71934ef7` | **Interlúdio:** suíte em worktree isolado, e a simetria que ela expôs |

## 2. O que se aprendeu — catorze lições com custo pago

### 2.1 Procurar o **habilitador**, não catalogar instâncias

Várias falhas silenciosas na mesma camada costumam ter **um** ponto que
converte falha em sucesso para todas. No `cli/commands.py`, o `else` do
despacho legado imprimia e retornava — `EXIT=0`. Enquanto ele existisse,
`check=True` era decorativo em todo o `nexus.py`, e um atalho apontando para
nome inexistente era indistinguível de um que funciona.

### 2.2 Presença não é função

Corrigi o passo 5 do `maintenance` adicionando guarda de existência do
**arquivo**. O arquivo existia; o **subcomando** (`optimize`) nunca existiu. A
etapa continuou não fazendo nada, agora com uma guarda por cima. Verificar que
o alvo existe não verifica que a invocação é válida.

### 2.3 Natureza precede diferença

Concluí que `Site/skills/` era um fork com trabalho perdido. São **submódulos**.
Medi `cmp` e `mtime` — que respondem *"são diferentes?"* — e pulei
`git ls-files -s`, que responde *"o que isto é?"*.

### 2.4 Ler os dois lados da fronteira antes de nomear o defeito

Registrei "persona duplicada" no `run_inference` e disse que resolver exigiria
levantar o proxy. Errado nas duas pontas: ler o servidor bastou, e não havia
duplicação — o campo é canal lateral de temperatura, e a redundância é
*load-bearing*. **"Exige levantar o ambiente" costuma ser preguiça disfarçada
de rigor.**

### 2.5 O arnês de verificação também mente

Um script de mutação que media `returncode != 0` reportou `7/7 detectores
provados`. Uma era falsa: `pytest -k` não casou com o id parametrizado, o
pytest saiu **5** por *nenhum teste coletado*, e 5 ≠ 0. **Teste de mutação só
vale com baseline** — exigir `N passed` antes, `≥1 failed` depois, e conferir a
contagem de testes **coletados**.

### 2.6 Detector precisa separar *citar* de *afirmar* — cinco vezes

O portão de âncora reprovou os próprios comentários; o guard de roteamento pegou
`Convert-DeepJsonStringSOTA`; o guard do literal pegou minha prosa; o guard do
`AGENTS.md` idem; o guard do LanceDB reprovou o meio da própria docstring.

A resposta certa foi sempre **estreitar o escopo estruturalmente**, nunca
isentar o arquivo. E a última exigiu a distinção fina: **comentário é uma linha,
docstring é um bloco** — rastrear estado, não prefixo.

### 2.7 Nome de componente é afirmação, e envelhece calado

Dez pontos afirmavam "LanceDB"; o motor é ChromaDB e `lancedb` não está
instalado. A narração foi escrita para o estado **pretendido** e nunca
reconciliada com o **construído** — e chegou ao `system_prompt` do modelo. Nada
acusou, porque nome errado não levanta exceção.

### 2.8 Chave literal é aposta sobre vocabulário alheio — e falha ao contrário

Para saber quais `GEMINI.md` são arquivo de contexto de plugin (e portanto
**não** são cópias concorrentes de governança), medi o literal
`"contextFileName"` nos manifestos. São **três** grafias: `contextFileName`,
`contextPath`, `context`.

O erro é o **espelho** do da §2.6. Lá o detector reprovava quem devia passar;
aqui aprovava quem devia ser olhado — falso **negativo**. E a consequência seria
concreta: a regra de nomeação mandaria renomear o `GEMINI.md` do
`todoist-extension`, quebrando a extensão.

A correção não foi acrescentar as outras duas chaves — seria a mesma aposta com
mais fichas. Foi trocar por um predicado **estrutural**: *existe
`gemini-extension.json` irmão cujo texto cita o nome deste arquivo*. Não depende
de conhecer a grafia, e é o mesmo teste do consumidor tipo 2 da §1.5.1 do plano.

### 2.9 Regex vê campo; não vê documento

O portão de âncora confere os campos obrigatórios do frontmatter com
`^([a-z_]+):`. **Seis dos dez registros com frontmatter desta base não eram YAML
válido** — `- texto: mais texto` vira mapa, e crase é caractere indicador — e o
portão aprovava os seis, porque o regex achava os campos.

Frontmatter presente e ilegível é a forma mais limpa de sinal verde
desconectado que esta base já produziu: o dado existe, o campo existe, o portão
diz APROVADO, e **nenhum consumidor de máquina consegue ler**. Sobreviveu a duas
sessões de auditoria — inclusive às minhas, que escreveram três dos seis.

A correção não foi ensinar YAML ao PowerShell. Foi separar por natureza:
**linha a linha fica no portão PowerShell; documento inteiro exige parser, e por
isso a etapa 3 do pre-commit é Python.**

### 2.10 Código de saída diz que bloqueou; só a mensagem diz por quê

A primeira bateria de sondas do estado *depois* reportou 8 de 8, com um critério
bloqueando que eu havia desenhado para passar. Não era o critério: o **fixture
da própria sonda** trazia o defeito da §2.9, e o portão pegou a sonda.

Numa bateria em que cada sonda deve disparar um critério **específico**,
`returncode != 0` é evidência de que *algo* bloqueou — não de que o *alvo*
bloqueou. É o refinamento da §2.5: lá o arnês contava "não rodou" como
"reprovou"; aqui contava "reprovou por outro motivo" como "detector ativo".

### 2.11 Quando a forma não separa, quem separa é a declaração

Sete vezes um detector desta base reprovou a prosa que o documenta, e sete vezes
a resposta foi **estreitar a forma**: pular linha que é só comentário, rastrear
bloco de docstring, ignorar `$$`.

Na oitava, a forma não separava. Um documento que cita `X` para **apontar** e um
que cita `X` para dizer *"isto sumiu"* produzem a mesma sequência de caracteres,
na mesma espécie de linha. Nenhuma regra estrutural distingue intenção.

A saída não é isentar o arquivo — isso abre ponto cego exatamente no registro
que fala dos caminhos mortos. É **declarar a exceção por item**, no frontmatter,
onde o revisor a vê: `referencias_nao_resolviveis: [...]`. Mesmo princípio do
`caminhos:` da frente 2. **Quando a inferência não decide, o autor declara e o
portão obedece à declaração — nunca ao palpite.**

### 2.12 Trabalho concorrente é uma classe de risco, e `git add -A` é o vetor

Outra sessão editou este repositório enquanto eu trabalhava. Meu `git add -A`
varreu um handoff que não é meu para o stage; só não foi commitado porque conferi
o `git status` antes. Duas sessões também acrescentaram **a mesma chave** ao
mesmo frontmatter — e `yaml.safe_load` aceita chave repetida em silêncio, a
última vencendo.

Regra que passa a valer: **`git add` com caminhos explícitos**, e ler o
`git status` antes de todo commit — não como cerimônia, mas porque o que aparece
ali pode não ter sido você.

### 2.13 Nome canônico é dado; nome de diretório é acidente

Quatro lugares do código tratavam `RAIZ.name` como se fosse o nome do projeto.
São coisas diferentes: o nome canônico é `Site`, e o diretório pode se chamar
qualquer coisa — um worktree se chama `suite-isolada-Site-<pid>-<epoch>`.

Três testes só passavam numa árvore multiprojeto completa, e nenhuma execução
local acharia isso, porque local está tudo montado. **Só rodar fora do lugar
revela o que depende do lugar.**

### 2.14 Verificar o que está ao alcance, declarar o resto

Ao rodar em árvore limpa, três classes de referência viraram "morta" sem estar:
submódulo não materializado, caminho de projeto irmão, artefato derivado. Em
todos os casos o endereço é válido e o conteúdo é que não está aqui.

O detector deixou de ser binário. Ele agora **classifica**: resolve, é de outro
escopo, é derivado, é submódulo vazio — ou é morta. É a mesma disciplina do
`nao_verificado` do frontmatter, aplicada a caminho: *verificação não executada
não é verificação reprovada, e também não é aprovada — é declarada.*

## 3. Padrão que se acumulou — calibração bayesiana

**"Sinal verde desconectado" chegou a 15 instâncias catalogadas**, mais quatro
variantes novas nomeadas nesta sessão:

| Variante | Exemplo |
| :--- | :--- |
| **Nome errado para grandeza real** | `"KV Cache Alocado"` movia `num_predict`, não `num_ctx` |
| **Habilitador estrutural** | `print` sem exit no despacho legado |
| **Limpo por instrução** | `ignore = dirty` escondendo 62 fontes modificados |
| **Dado presente e ilegível** | frontmatter que o regex valida e nenhum parser lê |

**Priores atualizados:**

- Afirmação de sucesso na UI → **rastrear até o campo do protocolo**, não até a
  variável local.
- "Zero referências em código" → **não** significa órfão. Consumidor tem três
  tipos, e o `grep` só vê um (§1.5.1 do plano).
- Árvore de git limpa → conferir se é limpa **de fato** ou por configuração.
- Contagem em prosa de governança → suspeita por padrão. A §6 do `AGENTS.md`
  dizia `395/395` com a suíte em 447. E a §2 do plano dizia "dois dos quatro
  itens do portão"; medindo, eram **quatro de seis** critérios inativos.
- Validação por **regex** → prova que o campo está lá, não que o documento é
  legível. Para documento, parser.
- `returncode != 0` numa bateria de sondas → prova que *algo* bloqueou, não que
  o **alvo** bloqueou. Conferir a mensagem.
- Suíte que passa **aqui** → não prova que passa em clone limpo. Rodar
  `nexus test --isolado` antes de afirmar que a suíte está verde.
- Nome de diretório → **nunca** é o nome canônico do projeto.

## 4. O que fica aberto

### 4.1 Decisão sua

| # | Item |
| :--- | :--- |
| 1 | Os 62 fontes modificados: **patches já extraídos e versionados** (risco contido). Falta escolher entre PR upstream, fork próprio, ou descartar |
| 2 | As 2 extensões no ledger do CLI e fora de `extensions/` |
| 3 | Portar os 3 conceitos do `supermemory` para o `memory_rag` local (§3.3 do plano) |
| 4 | Instalar LanceDB ao lado do Chroma — **com a partição declarada antes** (§3.2 do plano) |

### 4.2 Execução — **mas nenhuma delas é livre de consequência**

> **Frentes 1, 2 e 5 saíram desta lista em 2026-08-28.** A 5 no `9d02b9fa`
> (referência morta em documento que prescreve vira critério de portão; isenção
> declarada por caminho — §5.1 do plano). A 1 no commit `b3caaa1a`
> (índice canônico das 5 famílias em `data/INDICE_CANONICO_GOVERNANCA.json`,
> regra de nomeação, 11 guardas, 7 mutações — §1.6 do plano). A 2 no
> `6634a3f0` (`RECORD_INDEX` derivado, `nexus index`, etapa 3 do pre-commit,
> 18 guardas — §2.3 do plano). O portão §13.F passou de **3 de 7** critérios
> ativos para **7 de 8**.
>
> **E o título desta seção foi corrigido.** Ela dizia *"sem decisão pendente"*,
> e isso é falso para os cinco itens restantes: **todos tocam a árvore de
> extensões, que está fora do repositório e fora de qualquer portão daqui.**
> Renomear os 376 `.bak` sujaria o estado dos submódulos que os patches acabaram
> de capturar. Nenhum é difícil; nenhum é gratuito.

- Padronizar `.disabled` — 376 arquivos hoje `.bak`, nome que mente
- `extensions/` com **0 skills ativas e 56 desligadas** — a árvore que o CLI carrega
- Religar `gemini-cli-security` (o `osvScanner` que o `CLAUDE.md` §2 pede à mão)
- Renomear `Site/skills/`, que não contém skills do `Site`
- Propagar `<extensao>-GEMINI.md` nos 30 homônimos

### 4.3 Destrutivo — exige ordem explícita item a item

- `Site/.cerebro/ops-deploy/MODUS_OPERANDI.md` — único órfão verdadeiro medido
- `_calculate_dynamic_context()` — inalcançável no `gemma_server`
- Cópia raiz de `~/.gemini/tools/hybrid_router/`

### 4.5 Trabalho de outra sessão — **resolvido no interlúdio, menos um item**

Descoberto em 2026-08-28 às ~04:00, com o repositório em uso concorrente:

| Item | Estado |
| :--- | :--- |
| `scripts/cli/nexus.py`, `scripts/ops/record_index.py`, `tests/test_patches_skills.py`, `scripts/ops/cwv_gate.ps1` | **ADOTADOS** no `26f5e630`, auditados por execução. Duas das mudanças consertavam defeitos reais |
| `reports/HANDOFF-2026-08-28-browser-sota-cdp.md` | **Não rastreado, intocado.** Decisão do vértice |

**Duas coisas que o vértice precisa saber sobre esse handoff:**

1. Ele registra um **risco P0 declarado pelo próprio autor**: *"uma credencial
   materializada em argumento de MCP permanece um risco P0: requer rotação no
   provedor e migração para mecanismo fora da linha de comando"*. Não verifiquei
   nem toquei — só estou transportando o achado para onde ele seja visto.
2. Se for commitado como está, **os dois portões o bloqueiam**: o frontmatter
   não tem `verificado` nem `nao_verificado` (§13.B), e declara
   `estado: bloqueado-por-baseline-de-qualidade`. O `estado` em si passa — meu
   teste só proíbe declarar VIGENTE/SUSPEITO/OBSOLETO, que são derivados.

### 4.4 Meta-governança

- **Candidato a POSTULADO:** a regra do portão de âncora distingue comentário
  mas não docstring — 5 ocorrências. Recusei mexer em detector de segurança
  para me desbloquear; a mudança exige medição dos dois estados.
- POSTULADO-001 itens C e D: as fases 1 e 2 do CWV não medem. São os 2 warnings
  que mantêm o portão amarelo por desenho.
- Herdados: `engine/llm_api.py` duplicando `llm/anthropic.py` e
  `llm/openrouter.py`; `Site/.gemini/` aninhado; dois paradigmas de roteamento.

## 5. Prompt de continuação

```
Retomando o NEXUS-CORE-SOTA (~/.gemini/Site), master 71934ef7.
Suite: 504 passed na arvore viva, 500 passed + 4 skipped na isolada.

ANTES DE QUALQUER COISA: `git status`. Este repositorio ja teve duas sessoes ao
mesmo tempo (secao 4.5 e o INTERLUDIO de 28/08). Nao commitar o que nao e seu,
e usar `git add` com caminho explicito, nunca -A.

E antes de afirmar que a suite esta verde: `nexus test --isolado`. Passar aqui
nao prova que passa em clone limpo -- tres testes so passavam nesta maquina.

LEIA PRIMEIRO, nesta ordem:
  1. reports/HANDOFF-2026-08-28-auditorias-e-preludio.md — secoes 2, 3 e 4
  2. reports/PLANO-2B-CURADORIA-ESTRUTURAL.md — preludio 0.5, mapa 1.5,
     FRENTE 1 (secao 1.6), FRENTE 2 (secao 2.3), frente 3
  3. data/INDICE_CANONICO_GOVERNANCA.json — o canonico de cada familia
  4. `nexus index --suspeitos` — estado derivado dos registros AGORA
  5. reports/AUDITORIA-2026-08-28-skills.md — secoes 2, 4 e 5
  6. ~/.gemini/CLAUDE.md e Site/CLAUDE.md

PROXIMO PASSO RECOMENDADO
Frente 4 (routing) ou frente 6 (imports). As frentes 1, 2 e 5 fecharam a camada
de GOVERNANCA DO REGISTRO: canonico declarado por familia, indice derivado,
7 de 8 criterios do portao ativos, e referencia morta barrada no que prescreve.

A frente 4 e a que destrava mais: enquanto nao se decidir se a autoridade e
llm/routing_policy.py (declarada) ou llm/routing.py (executada), toda melhoria
em qualquer uma tem chance de virar retrabalho. E ela e PRE-REQUISITO da frente
6 no grafo da secao 8 do plano.

Antes de qualquer frente nova, rodar `nexus index --suspeitos`. Se algum
registro tiver virado SUSPEITO ou OBSOLETO desde 28/08, resolver isso primeiro:
indice que acumula suspeito vira indice que ninguem olha.

Ha tambem uma adocao barata e util: declarar `caminhos:` no frontmatter dos
registros que afirmam fatos sobre codigo especifico. O criterio C2b esta ativo
e com raio zero porque NINGUEM declara -- a protecao existe e nao esta em uso.

Se o vertice preferir avancar por valor imediato: religar gemini-cli-security e
padronizar .disabled continuam abertos -- mas nenhum dos dois e execucao pura
como o handoff dizia. Ambos tocam a arvore de extensoes fora do repositorio, e
o .disabled sujaria o estado dos submodulos que os patches capturam.

REGRAS QUE VALEM SEMPRE AQUI
- Escopo limita o que se ALTERA, jamais o que se LE (M.O. 1.2). E ler os DOIS
  lados de uma fronteira antes de nomear defeito.
- Natureza precede diferenca: perguntar "o que isto e?" antes de "sao
  diferentes?".
- Presenca nao e funcao: alvo existir nao prova invocacao valida.
- Procurar o HABILITADOR quando varias falhas silenciosas surgem na mesma
  camada.
- Teste de mutacao SO vale com baseline: N passed antes, >=1 failed depois, e
  conferir testes COLETADOS. "Reprovou" e "nao rodou" tem o mesmo returncode.
- Detector precisa separar citar de afirmar. Comentario e linha, docstring e
  bloco. Estreitar escopo estruturalmente, nunca isentar arquivo.
- Nome de componente e afirmacao: conferir contra o instalado.
- Nunca medir exit code depois de um pipe.
- Regex ve campo; nao ve documento. Para documento, parser.
- Numa bateria de sondas, conferir a MENSAGEM: returncode != 0 prova que algo
  bloqueou, nao que o alvo bloqueou.
- Quando a FORMA nao separa citar de afirmar, a excecao se DECLARA por item no
  frontmatter -- nunca se isenta o arquivo.
- `git add` com caminho explicito. Ler o `git status` antes de commitar: pode
  haver outra sessao no mesmo repositorio.
- Sonda de portao e mutacao rodam em arvore ISOLADA (`suite_isolada.py`), nunca
  no indice de trabalho: encenar violacao no indice de verdade e o unico risco
  de concorrencia que disciplina de `git add` nao cobre.
- Nome de diretorio nao e nome canonico de projeto.
- Remocao e destrutiva: ordem explicita do vertice, item a item.
- Nao contornar hook que falha -- inclusive nao ampliando a excecao dele.

LINHA DE BASE
504 passed (viva) / 500 + 4 skipped (isolada). Os 4 skips sao os que declaram
nao poder verificar projeto irmao sem a raiz multiprojeto -- pular com motivo,
nunca passar em silencio. Portao de ancora APROVADO, portao de registro APROVADO.
Pre-commit com EXIT real medido sem pipe. Indice: 9 VIGENTE, 0 SUSPEITO,
1 OBSOLETO (o handoff de 27/08, corretamente aposentado).
```

## 6. Declaração (governança §5)

Rodaram: a suíte completa após cada bloco; o portão de âncora antes de cada
commit (**dois** reprovaram, e as causas foram corrigidas, não contornadas — o
segundo foi o detector de ampliação de origem pegando o próprio teste que o
exercita); as **8 sondas** da §13.F nos dois estados; **21 mutações**
com reversão verificada — as 7 últimas com baseline explícita e contagem de
coletados conferida; parse dos `.ps1` em duas versões do PowerShell; execução
dos launchers de dentro e de fora do projeto; o corpus do RAG medido nos dois
estados com o coletor real e a barreira de traversal exercitada.

Não rodaram, e por quê: nenhuma chamada real a provedor de LLM (chaves
revogadas); o proxy de inferência nunca foi levantado; nenhuma skill executada
nem servidor MCP iniciado; o Gemini CLI não foi executado; `maintenance` ponta
a ponta (o passo 3 deleta) e `quality-gate` completo ficaram fora; os patches
não foram reaplicados sobre cópia limpa. Tudo declarado no frontmatter.
