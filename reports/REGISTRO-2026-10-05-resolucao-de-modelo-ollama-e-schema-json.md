---
id: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
tipo: registro
escopo: Site -- resolucao de alias e tags do Ollama em call_ollama, propagacao de response_format como JSON Schema, fallback de contingencia Gemini para modelos Gemma
ecossistema: nexus-sota
autor: Space-Bunny-Alpha <noreply@hermes.com>
criado_em: '2026-10-05T07:20:00-03:00'
atualizado_em: '2026-10-05T09:10:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, backend, engine, llm, ollama, roteamento]
caminhos:
  - engine/llm_api.py
  - engine/gemma_server.py
  - reports/REGISTRO-2026-10-05-resolucao-de-modelo-ollama-e-schema-json.md
  - reports/REGISTRO-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao.md
  - reports/REGISTRO-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem.md
  - tests/test_llm_layer_sota.py
  - tests/test_llm_ollama_integracao_real.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 20261003_204817_c81943
  session_started_at: '2026-10-03T20:48:00-03:00'
  condutor: Space-Bunny-Alpha <noreply@hermes.com>
  modelo: space-bunny-alpha
  veiculo: hermes-agent
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-05
verificado:
  - "resolucao de alias e tag em call_ollama passa a consultar OLLAMA_MODEL_MAP e normalize_model de engine/gemma_server.py, com precedencia de alias exato e preservacao de tag exata"
  - "call_ollama propaga response_format como JSON Schema no campo format do corpo, em vez de reduzir toda exigencia estruturada ao literal json"
  - "fallback de contingencia via gemini-3.5-flash-lite para modelos Gemma antes do encerramento da sessao em _dispatch_provider_call"
  - "testes/test_llm_layer_sota.py cobre os tres casos de resolucao e a propagacao do schema, com double de sessao tipado por cast(aiohttp.ClientSession, ...)"
  - "ruff check e ruff format --check sem erros nos dois arquivos; pyright com 0 erros (2 avisos preexistentes); pytest de tests/test_llm_layer_sota.py com 0 erros e 0 warnings em 26 testes"
  - "PROVA CONTRA O DAEMON REAL em 2026-10-05: tests/test_llm_ollama_integracao_real.py, 5 testes, 0 erros e 0 warnings, contra 127.0.0.1:11434 com 25 modelos instalados -- o schema JSON chegou ao daemon e a resposta o obedeceu, o caminho sem schema nao injetou format, o erro do daemon virou RuntimeError com HTTP 404, e todo alias de OLLAMA_MODEL_MAP resolve para tag instalada"
nao_verificado:
  - "execucao contra provedores externos (Nous Research e cloud) e execucao em producao distribuida multi-host"
revisoes_de_ancora:
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-10-05. A substituicao do mapeamento de cloud por OLLAMA_MODEL_MAP
      mantem o espirito do expurgo: uma fonte unica de verdade para alias, hoje em
      data/ollama_models.json, carregada por engine/gemma_server.py. A precedencia
      de alias exato antes de heuristica de substring preserva a correcao medida em
      2026-09-03, em que os seis modelos qwen instalados resolviam errado.
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - engine/llm_api.py
    parecer: >-
      Revisado em 2026-10-05. O saneamento de amostragem e a rotacao de chaves seguem
      intactos; o fallback de contingencia Gemini e acionado somente quando o caminho
      Ollama devolveu vazio e existe credencial Gemini disponivel, sem contornar
      circuit breaker nem _block_key.
---

# Registro: Resolucao de Modelo Ollama e JSON Schema em `call_ollama`

Data: 2026-10-05

## 1. Contexto

`call_ollama` resolvia o modelo pedido com uma unica operacao: remover o prefixo
`google/`. Isso significava que qualquer alias do manifesto (`qwen`, `e4b`,
`qwen_pmev`) chegava ao daemon como nome literal, e nao como a tag que a maquina
realmente tem instalada. O daemon recebe o nome e falha, ou peor, serve um modelo
diferente do pedido.

O mesmo ramo ainda reduzia `response_format` ao literal `"json"`. O parametro e uma
funcao que recebe um JSON Schema, e os provedores-irmaos ja o honram como schema
(`responseSchema` no Gemini). O caminho local era o unico que perderia o contrato.

## 2. O que Mudou

**2.1 Resolucao com precedencia explicita.** A resolucao passa por
`engine.gemma_server.OLLAMA_MODEL_MAP` e `normalize_model`, nesta ordem: alias exato
do manifesto, tag exata preservada como tag, e so entao normalizacao por substring.
A precedencia do nome exato vem da medicao de 2026-09-03 registrada no proprio
`normalize_model`: aplicada a um nome exato, a heuristica de substring colapsava os
seis modelos qwen instalados em um so alias, tres deles marcados `required: true`.

A falha de import nao derruba a inferencia: o `try/except` cai no nome pedido, e o
`logger.debug` registra o motivo -- o mesmo contrato que `call_gemini` usa para a
armadilha BK-14.

**2.2 `response_format` como schema.** O corpo passa a carregar o schema recebido.
Um chamador que pede `{"type": "object", ...}` recebe restricao estruturada no caminho
local, igual ao que recebia na nuvem.

**2.3 Fallback de contingencia para Gemma.** Em `_dispatch_provider_call`, o ramo
OpenRouter deixou de ser um `return` imediato. Quando ele devolve vazio e o modelo
pedido e da familia Gemma, ha uma ultima tentativa via `gemini-3.5-flash-lite`
antes de encerrar a sessao com `None`.

## 3. Verificacao Executada

| Canal | Resultado |
|---|---|
| `ruff check` (2 arquivos) | All checks passed |
| `ruff format --check` (2 arquivos) | 2 files already formatted |
| `pyright` (2 arquivos) | 0 erros; 2 avisos preexistentes |
| `pytest tests/test_llm_layer_sota.py` | 26 testes, 0 erros, 0 warnings |
| `pytest tests/test_llm_ollama_integracao_real.py` | 5 testes, 0 erros, 0 warnings (21,2 s e 5,96 s em duas execucoes) |

Os 3 erros de tipo que o teste novo introduziu foram corrigidos com
`cast(aiohttp.ClientSession, DummySession())`, e nao relaxando a assinatura de
`call_ollama`: o double implementa o protocolo de que a funcao precisa, e a
equivalencia contratual e declarada no ponto de uso.

## 3.1 Prova Contra o Daemon Real

A secao 4 declarava um limite: os testes substituiam sessao e resposta, e nenhuma
chamada real ao daemon tinha sido feita. Medido em 2026-10-05 contra
`127.0.0.1:11434`, com 25 modelos instalados nesta maquina.

**Por que um double nao bastava.** Com `response.ok` sempre verdadeiro, tres
caminhos nunca executavam: o tratamento do corpo JSON com schema, a traducao de erro do
daemon, e a prova de que o alias aponta para tag REAL e nao apenas para uma string
plausivel. O teste de unidade passa com um alias inventado; o de integracao reprova.

| Teste | O que mede |
|---|---|
| `test_daemon_lista_o_modelo_que_o_teste_vai_requisitar` | Pre-condicao: sem ela, um 404 do daemon pareceria falha de resolucao |
| `test_call_ollama_responde_texto_contudo_com_schema_no_daemon_real` | O schema chega e a resposta o obedece: `resposta` chega como inteiro |
| `test_call_ollama_sem_schema_nao_injeta_format` | Ausencia de `format` nao degrada a inferencia livre |
| `test_call_ollama_traduz_erro_do_daemon_em_runtime_error` | Modelo inexistente vira `RuntimeError` com `HTTP 404` na mensagem |
| `test_alias_do_manifesto_resolve_para_tag_instalada` | Todo alias de `OLLAMA_MODEL_MAP` aponta para tag que o daemon tem |

O ultimo e o que fecha o contrato fim a fim: **alias -> manifesto -> tag -> daemon**.
A medicao de 2026-09-03 mostrou os seis qwen resolvendo errado; este teste pega a
reincidencia sem chamar o gerador, e falha no momento da instalacao em vez de no
momento do uso.

O teste e marcado `@pytest.mark.integration` e pula sozinho quando o daemon nao
responde -- quem roda a suite sem Ollama no ar ve um pulo declarado, nunca um
verde sobre auditoria inexistente.

## 4. Limites Desta Medicao

O daemon local foi exercitado de verdade: inferencia com e sem schema, e o caminho
de erro com modelo inexistente. **O que continua sem medicao:** provedores externos
(Nous Research e cloud) e execucao em producao distribuida multi-host. O caminho
local e o que esta revisao alterou, e ele esta medido.