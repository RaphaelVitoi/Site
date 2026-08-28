---
id: frente-4-2026-08-28-autoridade-de-roteamento
tipo: relatorio
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-28T11:20-03:00
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
  agentes_que_divergem: 19
  subagentes: 13
  subagentes_que_divergem: 13
verificado:
  - a divergencia foi medida por EXECUCAO -- core.config carregado, os dois mapas
    comparados chave a chave -- e nao por leitura dos modulos
  - a lista de leitores de AGENT_MODEL_MAP foi derivada da arvore com fronteira
    de palavra, depois de a busca por substring ter produzido um falso positivo
  - as duas superficies medidas separadamente -- agentes e subagentes
  - 6 mutacoes com baseline explicita, contagem de coletados conferida e
    identidade da mensagem exigida
  - suite completa nas duas arvores antes do commit
  - o portao de mensagem de commit exercitado nos DOIS estados, 22 casos, mais
    uma mutacao que reverte a classe de caracteres e reprova 3 deles
nao_verificado:
  - nenhuma chamada real a provedor de LLM; liveness de credencial nao testada.
    O custo citado e o declarado no MODEL_REGISTRY, nao um gasto observado
  - nao foi medido o VOLUME de chamadas por agente, entao a multiplicacao de
    custo por chamada nao vira previsao de fatura
  - acesso a configuracao por nome inteiramente computado em runtime esta fora
    do alcance da varredura lexica; as duas formas conhecidas foram conferidas
supersede: null
---

# FRENTE 4 — a autoridade de roteamento

> **Entregue: a medição e o detector. Não entregue — porque não é minha — a
> decisão.** O que mudou é que ela deixou de poder ser tomada em silêncio.

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

## 7. O que espera decisão do vértice

| Superfície | Pergunta | Consequência medida |
| :--- | :--- | :--- |
| **Agentes** | o caminho quente passa a ler `AGENT_MODEL_MAP`, ou o manifesto é a autoridade e a política sai? | custo por chamada ×5,5 para quem a tabela põe em `gemini-3.7-flash`; ×37 para `chico`, em `claude-opus-5` |
| **Subagentes** | a tabela local de `subagents_mesh` governa e `SUBAGENTES` sai da política, ou o contrário? | ligar a política troca custo marginal zero por API paga |
| **`gemma4`** | corrigir o alias do manifesto para a nomeação da frota | independe das duas acima |

A multiplicação de custo é **por chamada**, não por fatura: o volume por agente
não foi medido. E é o desenho da tabela, não um defeito — capacidade por classe
custa. Mas é o que transforma *"ligar a política"* de refatoração em decisão de
gasto, e por isso não é minha.

## 8. Declaração (governança §5)

Rodaram: a divergência medida por execução nas duas superfícies; a lista de
leitores derivada da árvore com fronteira de palavra; 6 mutações com baseline
explícita, contagem de coletados e identidade de mensagem; a suíte completa nas
duas árvores; os dois portões antes do commit.

Não rodaram: nenhuma chamada real a provedor; nenhum teste de liveness de
credencial; nenhuma medição de volume de chamadas por agente — então o custo
citado é o declarado no registro, e não vira previsão de fatura. Acesso a
configuração por nome inteiramente computado em runtime está fora do alcance da
varredura léxica; as duas formas conhecidas foram conferidas e não existem.
