---
id: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T22:40:00-03:00
atualizado_em: 2026-09-02T22:40:00-03:00
classes: [interno, medido, llm, correcao]
caminhos:
  - llm/adapters.py
  - llm/anthropic.py
  - engine/llm_api.py
  - tests/test_adapters_anthropic_http.py
  - reports/agent-calibration/feedback-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
verificado:
  - >-
    19 testes hermeticos verdes em tests/test_adapters_anthropic_http.py, sem
    nenhuma chamada a provedor de LLM.
nao_verificado:
  - >-
    Comportamento contra a API real da Anthropic. As API keys deste ambiente
    estao revogadas e a raiz proibe teste que pressuponha chamada real; os dois
    defeitos foram estabelecidos por analise estatica contra a documentacao da API.
revisoes_de_ancora:
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado, e e o unico dos sete que afirma o valor corrigido. O parecer de
      ancora dele diz, textualmente, que "o ledger e append-only; o novo
      feedback 9.5 da sessao de curadoria MCP" foi anexado. As duas metades
      envelheceram de modo diferente. A primeira -- append-only -- continua
      verdadeira, e e exatamente o que esta correcao honra: o registro de
      sequencia 5 NAO foi reescrito, e a correcao 110a52e7 foi ANEXADA como
      sequencia 6, apontando o event_id 15b9a610. A segunda envelheceu: aquele
      9.5 passou a 9.0 por determinacao do Tier 0. Documento datado nao
      retroage, entao a linha 137 daquele arquivo permanece como foi escrita; a
      divergencia fica declarada aqui, que e onde o leitor da cadeia a encontra.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido integralmente valido -- e agora exercitado uma segunda
      vez, o que e a melhor evidencia a favor dele. Aquele registro criou
      `Record-AgentCalibrationCorrection.ps1` e fez
      `New-AgentCalibrationDailyEvidence.ps1` APLICAR a correcao antes de
      contar, para que ela nao fosse decoracao. Esta correcao usou o mesmo
      mecanismo, sobre outro registro e outra sessao, e a aplicacao se confirmou
      na medicao: `correcoes_aplicadas` foi de 1 para 2 e `score_max` caiu de
      9.5 para 9. A generalizacao do literal de timestamp que aquele registro
      introduziu tambem seguiu valendo: a cadeia permaneceu `valid` com 7
      registros depois do append.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido como evidencia DATADA, que e o que ele e. As
      agregacoes que ele fotografou mudaram com esta correcao -- `score_max` de
      9.5 para 9 e a media do acumulado para 8.38 --, mas o documento nao e
      fonte dessas agregacoes: e o registro do que o gerador media no instante
      da corrida. Recalcula-lo agora destruiria a trilha do dia, que e a unica
      razao de a corrida das 23:59 existir. O valor corrente sai do gerador, nao
      deste arquivo.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido; nada nele depende do registro corrigido.
      Aquela auditoria trata da nota gravada literalmente sem conversao de
      escala -- o caso 0.8 contra 8 -- e da doutrina de outlier como evidencia
      retida. Esta correcao e de outro registro, de outra sessao, e nao e
      conversao de escala: e uma reducao de 0,5 determinada pelo Tier 0, gravada
      literal como 9.0. A regra que aquela auditoria firmou e justamente a que
      foi seguida aqui.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Ele e o handoff da propria sessao cuja nota foi
      corrigida, e ancora o ledger como ESTADO de encerramento, sem afirmar o
      valor numerico da nota em lugar nenhum -- a varredura por "9.5", media e
      contagem nao retorna ocorrencia. O que ele descreve (quarentena reversivel
      de MCPs e roteamento lazy) e independente da nota e nao foi tocado.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido por anterioridade verificavel. Ele e de
      2026-09-01 e ancora o ledger pelo feedback da sessao
      `codex-site-2026-09-01-prioridade`, sequencia 1, nota 7.5 -- registro que
      esta correcao nao toca. O registro corrigido nasceu em 2026-09-02 as
      23:39, depois deste documento, entao nenhuma afirmacao dele podia
      depender dele.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido, pela mesma anterioridade. Handoff de
      2026-09-01, anterior por quase um dia ao registro corrigido; ancora o
      ledger como estado de continuidade do PMev e nao afirma nota, media nem
      contagem de sessoes. A prioridade que ele fixou -- a recaptura do HRC --
      segue aberta e nao e afetada por correcao de calibracao.
---

# `adapters.py` ligado ao caminho real da Anthropic

**Sessão:** `claude-opus5-site-2026-09-02-guarda` · **Assinatura individual:** Claude Opus 5 [Tier 1.B]

## O diagnóstico

`llm/adapters.py` e `llm/model_registry.py` já sabiam tudo o que a geração 5
exige: `budget_tokens` removido, amostragem legada rejeitada, thinking
adaptativo, `effort` obrigatório, `max_tokens` limitado pela capacidade.
Trabalho correto e atual.

**E era importado por um único arquivo — `tests/test_model_registry.py`.**
Nenhum código de produção o consumia. A §4 da raiz nomeia exatamente isto:
*módulo que ninguém importa não é integração*.

Quem chamava a Anthropic eram duas implementações paralelas, ambas sem teste:

| | `llm/anthropic.py:12` | `engine/llm_api.py:90` |
| :--- | :--- | :--- |
| `max_tokens` | 8192 | 4096 fixo |
| `temperature` | **enviava sempre (0.2)** | não enviava |
| leitura | `content[0]["text"]` | `content[0]["text"]` |
| passava pelo adapter | não | não |

### Os dois defeitos

**1. `temperature` retorna 400 na geração 5.** Sampling foi removido em Opus 5,
Sonnet 5 e Fable 5 — e `llm/routing_policy.py` roteia para os dois primeiros.

**2. `content[0]["text"]` levanta `KeyError` com thinking.** Em Opus 5 o thinking
está **ligado por padrão**; o bloco 0 costuma ser `thinking`, que não tem chave
`text`. O `display` omitido não salva: o texto vem vazio, mas o bloco existe.
`tests/test_adapters_anthropic_http.py` guarda essa prova explicitamente.

## O erro que a leitura prévia evitou

O impulso era remover `temperature`. Isso teria quebrado o ping de validação de
chave: `cli/commands.py:707` chama `call_anthropic` com
**`claude-3-haiku-20240307`** — geração 3, fora do registro, e que **aceita**
amostragem.

A pergunta certa nunca foi *"o código manda `temperature`?"*, e sim *"manda para
um modelo que a rejeita?"*. A escolha agora é do registro, não de heurística de
nome, e o caminho legado fica preservado — escada §8.2: **preservar capacidade
antes de corrigir causa concreta**.

## O que foi acrescentado ao adapter

Quatro membros em `AnthropicAdapter`, todos conhecimento da API, todos na fonte
única que já o guarda:

| Membro | Razão |
| :--- | :--- |
| `e_geracao_atual` | separa geração 5 do legado; absorve o `KeyError` de `get()` |
| `build_http` | `betas` é argumento do SDK — no HTTP cru vira header `anthropic-beta`; mandá-lo no corpo é campo desconhecido, e o beta nunca chega |
| `extrair_texto` | varre `content` pelo bloco `text` e concatena; aceita dict e objeto do SDK |
| `motivo_da_recusa` | lê `stop_details`, que só vem preenchido em recusa |

E `houve_recusa` foi generalizada: fazia apenas `getattr`, logo devolvia `False`
para **todo** payload vindo de `await response.json()` — isto é, para os dois
únicos caminhos de chamada Anthropic que este projeto executa.

Acima do teto de streaming do modelo, `llm/anthropic.py` agora falha **local**,
não com timeout remoto sem causa aparente — a filosofia que o próprio
`adapters.py` já declarava para o 400.

## O que isto NÃO fecha

A duplicação entre `engine/llm_api.py` e `llm/anthropic.py`, aberta em
`HANDOFF-2026-08-27` como item 3 e ainda "não tocado". As duas implementações
continuam existindo. O que mudou é que ambas passaram a derivar o conhecimento
da API da mesma fonte, em vez de cada uma carregar sua cópia envelhecida.
Declarar aquele item fechado aqui seria falso.

## O commit alheio que levou este trabalho pela metade

Às 23:34 a sessão `gemini-flash-site-2026-09-02-mcp-curation` commitou
`dfbbcb9e`, e junto do trabalho dela levou o meu, ainda em andamento:
`llm/adapters.py` (+93), `llm/anthropic.py` (+57), `engine/llm_api.py` (+24),
`tests/test_governanca_canonico_e_ponteiro.py` (+190) e o registro da guarda
(+109), cujo frontmatter ela completou com `verificado` / `nao_verificado`.

**`dfbbcb9e` ficou quebrado.** Ele contém as cinco referências a
`AnthropicAdapter` em `engine/llm_api.py` e **não contém o import** — eu o
acrescentei depois do commit dela. É `NameError` em tempo de execução.

O portão de 5 fases aprovou assim porque **mede o working tree, não o índice**:
o import existia em disco quando ele rodou, e não no conteúdo que foi
commitado. Vale como achado do portão, não como culpa de quem commitou.

`dfbbcb9e` não foi empurrado. A correção é aditiva — este commit traz o import
—, e não reescreve nada.

## Verificações

**Rodaram:** 19 testes herméticos novos; a suíte Python completa
(826 passam, 1 pula, 0 reprovam).

**Não rodaram:** qualquer chamada real ao provedor — a raiz é explícita, *as API
keys deste ambiente estão revogadas e não foram substituídas*. Os dois defeitos
são análise estática contra a documentação da API, não observação de 400 e de
`KeyError` em execução.

**Achado adjacente, não tratado:** `anthropic>=0.42.0` está declarado em
`requirements.txt:35` e `pyproject.toml:63`, instalado em 0.103.1, e **nenhum
arquivo o importa**. O PyPI já publica 1.3.0, um major com breaking changes; o
pin é aberto para cima. Mexer nisso é alteração de dependência e exige
autorização do Tier 0.
