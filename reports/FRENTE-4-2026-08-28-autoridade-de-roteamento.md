---
id: frente-4-2026-08-28-autoridade-de-roteamento
tipo: relatorio
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T11:20-03:00
atualizado_em: 2026-08-30T00:03-03:00
commit: 764694a5
classes: [interno, medido]
caminhos:
  - llm/routing.py
  - llm/routing_policy.py
  - llm/orchestrator.py
  - core/config.py
  - core/subagents_mesh.py
  - data/ESTADO_DE_ROTEAMENTO.json
  - tests/test_frente4_autoridade_de_roteamento.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: 2026-08-28
  agentes: 19
  agentes_que_divergem_antes: 19
  agentes_que_seguem_a_politica_depois: 19
  subagentes: 14
  subagentes_que_divergiam: 13
  subagentes_em_custo_zero: 14
  agentes_em_custo_marginal_zero: 12
verificado:
  - a divergencia foi medida por EXECUCAO -- core.config carregado, os dois mapas
    comparados chave a chave -- e nao por leitura dos modulos
  - a lista de leitores de AGENT_MODEL_MAP e derivada da AST, referencia de
    CODIGO e nao de texto, depois de substring e depois de fronteira de palavra
    terem produzido um falso positivo cada
  - as duas superficies medidas separadamente -- agentes e subagentes
  - 6 mutacoes com baseline explicita, contagem de coletados conferida e
    identidade da mensagem exigida
  - suite completa nas duas arvores antes do commit
  - o portao de mensagem de commit exercitado nos DOIS estados, 22 casos, mais
    uma mutacao que reverte a classe de caracteres e reprova 3 deles
  - depois da decisao -- concordancia de 19 de 19 medida por execucao, e a
    distribuicao por FAIXA orcamentaria, que corrigiu a conta de custo da
    versao anterior deste registro
  - 6 mutacoes novas, uma por parte da decisao, com baseline explicita e
    identidade de mensagem exigida
  - git status conferido depois de cada rodada de mutacao, porque uma delas
    deixou arquivo mutado na arvore de trabalho
nao_verificado:
  - nenhuma chamada real a provedor de LLM; liveness de credencial nao testada.
    O custo citado e o declarado no MODEL_REGISTRY, nao um gasto observado
  - nao foi medido o VOLUME de chamadas por agente, entao a multiplicacao de
    custo por chamada nao vira previsao de fatura
  - acesso a configuracao por nome inteiramente computado em runtime esta fora
    do alcance de varredura estatica; as duas formas conhecidas foram conferidas
  - Rota.fallback continua sem consumidor, e NAO foi ligado de proposito -- o
    fallback da classe LOCAL e gemma4:e4b, que por medicao anterior nao cabe na
    VRAM desta maquina. E decisao sobre a TABELA, do operador
supersede: null
---

# FRENTE 4 — a autoridade de roteamento

> **As seções 1 a 6 descrevem o estado ANTES da decisão, e ficam como estão.**
> Elas são a evidência de que a medição precedeu a escolha — reescrevê-las no
> presente apagaria justamente isso. O que era pergunta virou resposta na
> **seção 7**, onde o vértice decidiu, e a seção 7.1 corrige uma conta minha que
> estava errada.
>
> Estado atual: a política é a autoridade nos agentes; a tabela local governa os
> subagentes, com custo zero como invariante; o alias do `gemma4` foi corrigido.

## 1. O enquadramento do plano estava errado

A §4 do plano 2-B pedia: *"decidir qual das duas é a autoridade — `routing_policy.py`
(declarada) ou `routing.py` (executada)"*.

Medido, as duas funções de entrada têm **tipos diferentes**:

| Módulo | Entrada | Saída | Pergunta que responde |
| :--- | :--- | :--- | :--- |
| `llm/routing_policy.py` · `rotear` | `str` (nome de agente) | `str` (alias de modelo) | **qual** modelo |
| `llm/routing.py` · `_reorder_models_for_economy` | `list[str]` | `list[str]` | **em que ordem** tentar os que já recebi |

Duas funções de tipos diferentes não disputam a mesma autoridade. O reordenador
não tem como nomear um modelo que não lhe deram — permuta e filtra. Se as duas
estivessem ligadas, estariam em **série**, não em competição.

Era um falso dilema, e nenhuma leitura o teria mostrado: só perguntar *"o que
cada uma é?"* antes de *"são diferentes?"*. Quarta vez que essa ordem importa
nesta base.

## 2. A pergunta real, e a resposta medida

**O caminho quente consulta a política?** Não.

```
core/config.py:253   AGENT_MODEL_MAP = _resolver_modelos(...)   <- chama routing_policy.rotear
llm/orchestrator.py:151   te.AGENTS_MANIFEST[agente]["primary_model"]   <- NAO le o mapa
```

Leitores de `AGENT_MODEL_MAP`, derivados da árvore:

| Leitor | Papel |
| :--- | :--- |
| `core/config.py` | escritor |
| `scripts/routines/audit_monthly_modus_operandi_and_routing.py` | relatório |
| `tests/test_routing_policy.py` | teste |

**Nenhum consumidor de produção.** A auditoria mensal afere `len(AGENT_MODEL_MAP) >= 19`
e publica que o mapa está saudável — o único consumidor da saída é o relatório
que a declara saudável.

E a divergência não é parcial:

```
agentes:     19 de 19 divergem   (politica atribui 5 modelos; o manifesto, 2)
subagentes:  13 de 13 divergem   (13 tiers, duas tabelas, zero acordo)
```

O comentário em `core/config.py` diz *"até 2026-08-21 os 19 agentes recebiam o
MESMO primary_model no manifesto; este mapa é o que torna a preferência
operante"*. Medido hoje: o manifesto **ainda** dá o mesmo modelo a 18 dos 19, e o
mapa que curaria isso não é lido por ninguém que roteie. O mapa está correto,
testado por 37 testes, auditado todo mês — e desligado.

## 3. A segunda superfície inverte o sinal

Nos subagentes a mesma desconexão aparece, e aqui **a tabela executada é
provavelmente a melhor**:

| | executada — `core/subagents_mesh.py` | declarada — `routing_policy.SUBAGENTES` |
| :--- | :--- | :--- |
| 13 tiers | frota **local** (Ollama) | modelos de **nuvem** |
| custo marginal | zero | pago por token |
| quem consulta | `execute_subagent_pipeline` | ninguém |

Ligar a política nesta superfície trocaria custo zero por API paga. Então o
entregável não é *"ligue a política"* — é **decidir por superfície qual tabela
governa, e apagar a outra**. Onde há duas fontes para um fato, sincronizar é a
resposta errada: elas divergem por construção. Sexta instância.

## 4. Um defeito que independe da decisão

`google/gemma-4-e2b-it` é o `primary_model` do agente `gemma4` — e portanto o que
o caminho quente usa. Medido:

| Mecanismo | Resposta |
| :--- | :--- |
| `routing._infer_provider_for_model` | `"local"` (heurística sobre o texto do alias) |
| `routing_policy.e_local` | `False` (consulta a frota declarada) |
| `MODEL_REGISTRY` | ausente |
| a frota local declara | `gemma4:e2b` |
| a política roteia para | `gemma4:12b` |

Os **dois módulos de roteamento discordam sobre a mesma string**. Nomeação de
HuggingFace onde o runtime local usa nomeação de Ollama. Nome não é natureza,
quarta instância — e a primeira em que os dois discordam explicitamente.

## 5. O que foi entregue

| Artefato | Papel |
| :--- | :--- |
| `data/ESTADO_DE_ROTEAMENTO.json` | fonte única sobre a **relação** entre os módulos; não decide nada, registra o medido |
| `tests/test_frente4_autoridade_de_roteamento.py` | 10 testes que comparam a árvore com a declaração |

**Nenhum teste trava comportamento.** Ligar a política faz os testes falharem —
de propósito, com a mensagem dizendo *"a decisão pendente foi tomada: atualize a
declaração e este registro no mesmo commit"*. É o oposto de um portão: não
impede a mudança, impede que ela passe despercebida.

## 6. Três vezes o detector reprovou a própria documentação

Nesta frente, na primeira execução:

1. **Import estrela por substring** — reprovou a docstring deste detector, que
   cita a forma para dizer que ela não existe. Estreitado: a linha tem de
   **abrir** com a declaração. *(12ª instância)*
2. **`getattr` de mapa de modelo** — media *"o arquivo contém `getattr` **e**
   contém `MODEL` em algum lugar"*, dois fatos independentes co-ocorrendo.
   Acusou `getattr(te, "_c", ...)` em `worker/loop.py`, que busca uma função de
   cor. O nome dizia uma grandeza, a medição era outra — **dentro do detector
   que existe para achar isso**. Estreitado: o mapa tem de estar **dentro da
   chamada**. *(13ª instância, e nome errado para grandeza real)*
3. **Anotação de retorno** — `politica.return_annotation is str` deu falso
   negativo porque os dois módulos usam `from __future__ import annotations` e a
   anotação chega como **string**. Meu instrumento estava errado, não o código.

Mais uma, na medição e não no teste: procurei leitores de `AGENT_MODEL_MAP` por
substring e acusei `core/subagents_mesh.py`, que tem `SUBAGENT_MODEL_MAP`.
Substring não é referência — a mesma falha que fez `arkov` casar com `arko`. Foi
corrigido com fronteira de palavra, e o falso positivo virou achado de verdade:
foi assim que a segunda superfície apareceu.

Em nenhum dos quatro casos a saída foi isentar arquivo.

## 6.1 O portão de mensagem de commit não implementava a própria regra

Este commit foi rejeitado pelo `.husky/commit-msg` por causa do escopo
`feat(frente-4)`. A investigação — a governança proíbe contornar hook que falha
— mostrou um defeito na regra, não na mensagem.

A classe era `[a-zA-Z0-9_\-\.\/]`. **Dentro de colchetes POSIX a contrabarra
é literal**, então isso não diz *"sublinhado, hífen, ponto, barra"*: diz
*"sublinhado, a faixa de contrabarra até contrabarra, ponto, contrabarra,
barra"*. O hífen vira operador de faixa e **sai** do conjunto; a contrabarra
**entra**. Medido:

| Mensagem | Antes | Depois |
| :--- | :--- | :--- |
| `feat(frente-4): x` | rejeitada | aceita |
| `feat(ci-cd): x` | rejeitada | aceita |
| escopo contendo contrabarra | **aceita** | rejeitada |
| `feat(escopo com espaco): x` | rejeitada | rejeitada |

O autor escreveu a contrabarra justamente para admitir o hífen, e ela produziu o
oposto. Sobreviveu porque **nenhum teste exercitava o hook** — só o commit o
exercitava, e só no estado que passa. Portão cujo verde é o único estado
observado tem metade da evidência.

`tests/test_hook_commit_msg.py` cobre a outra metade: 22 casos nos dois estados,
sem cópia da regra — o teste **executa o hook**, porque regra de portão
duplicada num teste é a forma mais silenciosa de duas fontes divergirem.
Mutação com baseline explícita: reverter a classe reprova 3 dos 22.

## 7. A decisão, tomada pelo vértice em 2026-08-28

> Esta seção substitui a lista de perguntas que estava aqui. As três foram
> respondidas no mesmo interlúdio, e a segunda foi respondida **como
> restrição**, não como delegação.

| Superfície | Decisão | Como ficou |
| :--- | :--- | :--- |
| **Agentes** | a política é a autoridade | o caminho quente resolve por `core.config.modelo_do_agente` |
| **Subagentes** | *"subagente sempre = custo 0"* | a tabela local de `subagents_mesh` governa; a política **recusa** atribuir modelo a tier |
| **`gemma4`** | corrigir o alias | `google/gemma-4-e2b-it` → `gemma4:12b` |

Em cada superfície havia duas fontes para o mesmo fato. A saída foi **apagar a
segunda**, nunca mantê-las em acordo — duas fontes divergem por construção, e
sincronizá-las só adia.

### 7.1 Correção: minha conta de custo estava errada

A §7 anterior dizia *"×5,5 para a maioria, ×37 para o `chico`"*. **Isso comparava
preço unitário entre faixas — exatamente o que a docstring da política proíbe:**
*"preço unitário só desempata DENTRO da mesma faixa"*. Medido por faixa:

| Faixa | Agentes | Custo marginal |
| :--- | ---: | :--- |
| `local` | 1 | zero — frota Ollama |
| `gratuita` | 11 | zero — cota do `gemini-3.7-flash` |
| `api_paga` | 7 | pago |

**12 dos 19 agentes ficam em custo marginal zero.** A superfície paga são 7, e
são exatamente as classes em que o operador declarou que capacidade de fronteira
é necessária: governança, estratégia, construção e raciocínio profundo. A
decisão que apresentei como cara era, medida na unidade certa, a que respeita a
Economia Generalizada que a própria tabela declara.

Li a tabela e reportei o preço; não li a **faixa**, que é o campo que a tabela
usa para decidir. Medir a grandeza errada com precisão continua sendo medir a
grandeza errada.

### 7.2 Como os agentes foram ligados

`core.config.modelo_do_agente` é a **fonte única**, com três degraus:

1. `model_override` da tarefa — designação explícita do operador, vence tudo;
2. `AGENT_MODEL_MAP` — a política por classe de tarefa, a autoridade;
3. `primary_model` do manifesto — rede de segurança **com aviso**, nunca
   silenciosa. Cair aqui é anomalia, não operação normal.

Os quatro consumidores passaram a chamá-la. Dois deles não roteiam — **informam
ao agente, no system prompt, em que modelo ele roda**. Liam `primary_model`
enquanto o orquestrador roteava por outra fonte: o agente era *informado* de um
modelo e *executado* em outro. Ligar só o orquestrador teria consertado a
execução e deixado o prompt mentindo.

Medido depois: **19 de 19 agentes seguem a política** (era 0 de 19), e o caminho
quente passou a distribuir 5 modelos distintos onde distribuía 2.

**Por que a política entra como `designated_model` e não como um candidato
comum:** `llm/routing._score_standard_preference` dá −4 a `gemini-3.5` e 9 aos
modelos de fronteira, e `prefer_cost_saving_mode` está ligado. Se o modelo da
política entrasse como candidato comum, o reordenador o mandaria para o fim e
reporia o colapso que a política existe para curar. Isso está declarado como
pendência: **a preferência por nome de modelo está embutida em duas camadas.**

### 7.3 Subagentes: o invariante, travado onde a autoridade mora

`decidir()` levanta `ForaDaAutoridadeDaPolitica` para tier que não é também
agente. `SUBAGENTES` continua declarando a **classe de tarefa** de cada tier —
informação diferente e legítima, usada por `_classe_de` e `cobertura()`.

Os quatro nomes que existem nas duas famílias (`architect`, `curator`,
`implementor`, `validador`) resolvem como **agente**, que é o que `_classe_de`
sempre fez. Há teste para isso: a recusa não podia mudar a precedência.

O invariante é travado onde a autoridade de fato mora — um teste lê
`SUBAGENT_MODEL_MAP` e exige que todo modelo esteja na frota local, custo zero.
Sem cópia da tabela.

### 7.4 O que a decisão deixou aberto, e está declarado

**`Rota.fallback` continua sem consumidor.** A política declara primário,
fallback e escalonamento; o caminho quente consome só o primário, e o resto da
cadeia vem das listas globais. Não liguei o fallback nesta passagem **de
propósito**: o fallback da classe LOCAL é `gemma4:e4b`, e há medição anterior de
que o e4b é multimodal e não cabe na VRAM desta máquina. Tornar o fallback
alcançável sem revisar essa entrada criaria um caminho para um modelo que não
carrega — trocaria um defeito silencioso por um barulhento. É decisão sobre a
**tabela**, e ela é do operador.

## 8. A quarta vez, já implementando a decisão

A quarta apareceu ao implementar a decisão: o scanner de leitores de
`AGENT_MODEL_MAP` acusou `llm/orchestrator.py`, que só **cita** o nome num
comentário explicando por que passou a usar `modelo_do_agente`. Décima quinta
instância na base.

A escada foi subida até o fim: substring → fronteira de palavra → **AST**.
Comentário e docstring não viram `Name` nem `Attribute`, então a medição passou
a ser *"o código referencia isto"* em vez de *"o texto contém isto"*. E arquivo
que não parseia virou falha explícita, porque ausência silenciosa esconderia um
leitor. Nenhum arquivo isento.

## 9. O arnês de mutação deixou a árvore mutada

Rodando as seis mutações da decisão, um `OSError 22` do Windows explodiu
**dentro do próprio bloco de restauração**. O script morreu e
`core/subagents_mesh.py` ficou na árvore de trabalho com um subagente apontando
para nuvem paga — a mutação virando estado real.

`git status` pegou. A correção não foi só a retentativa: foi **conferir a
restauração lendo de volta**. Restaurar sem verificar é a mesma família de
defeito que este arnês existe para achar — a ação foi tentada e ninguém
verificou o resultado, dentro da ferramenta escrita para perguntar exatamente
isso.

Regra que fica: **arnês que muta arquivo da árvore de trabalho confere a árvore
depois de rodar.** `git status` faz parte da medição, não é zelo opcional.

## 10. Declaração (governança §5)

Rodaram: a divergência e depois a concordância medidas por execução nas duas
superfícies; a lista de leitores derivada da árvore por AST; a distribuição por
faixa orçamentária, que corrigiu a conta de custo da versão anterior deste
registro; 6 mutações com baseline explícita, contagem de coletados e identidade
da mensagem, mais 6 anteriores; a suíte completa nas duas árvores; os dois
portões antes do commit; `git status` conferido depois de cada rodada de
mutação.

Não rodaram: nenhuma chamada real a provedor de LLM; nenhum teste de liveness de
credencial; nenhuma medição de volume de chamadas por agente — o custo citado é
o declarado no registro e na faixa, e não vira previsão de fatura. Acesso a
configuração por nome inteiramente computado em runtime continua fora do alcance
de qualquer varredura estática; as duas formas conhecidas foram conferidas e não
existem.

## Revisao de ancora -- 2026-08-29, faxina do antecessor

Ancora atingida: `tests/test_frente4_autoridade_de_roteamento.py`.

O que mudou nela: **apenas o nome de um teste**, de
`test_leitores_de_AGENT_MODEL_MAP_batem_com_a_declaracao` para a forma em
minusculas. Nenhuma assercao, nenhum dado, nenhum comportamento.

**Este documento nao muda.** A autoridade de roteamento via
`core.config.modelo_do_agente` segue como descrita.

## Revisao de ancora -- 2026-08-29, o fallback que nao carrega

Ancora tocada: `data/ESTADO_DE_ROTEAMENTO.json`.

Esta frente registrou, como pendencia nao resolvida, que `Rota.fallback` seguia
sem consumidor, **e escreveu a condicao para liga-lo**: revisar antes a entrada
da classe LOCAL, porque o fallback dela e `gemma4:e4b` e ele nao cabe na VRAM
desta maquina.

Medido em 2026-08-29: **o consumidor foi escrito no mesmo dia 2026-08-27**
(`llm/routing_policy.py:426`) e a entrada LOCAL nao foi revisada. A condicao foi
atravessada, nao respondida. O dano nao chegou porque `primario_indisponivel`
nao tem chamador de producao -- o caminho esta armado e desconectado.

Numeros novos, lidos do repositorio: o teto e 7,2 GB, o fallback `gemma4:e4b`
pesa 9,6 GB e o **primario `gemma4:12b` pesa 7,6 GB**. Nao e so o fallback que
estoura; o primario tambem, e a degradacao pede 2 GB a mais que o degrau de
cima.

**A conclusao desta frente nao muda:** a autoridade de roteamento continua sendo
`llm/routing_policy.py`, e a escolha do modelo da faixa LOCAL continua sendo do
operador. O que mudou e que agora existe detector --
`test_nenhuma_rota_local_nova_estoura_a_vram_declarada`. Ver
[[registro-2026-08-29-o-fallback-que-nao-carrega]].
