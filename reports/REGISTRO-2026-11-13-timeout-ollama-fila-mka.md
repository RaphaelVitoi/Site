---
id: registro-2026-11-13-timeout-ollama-fila-mka
tipo: registro
escopo:
  Site -- Correção do sock_read do cliente Ollama em engine/gemma_server.py
  (90s->240s, env SOTA_OLLAMA_SOCK_READ) após SocketTimeoutError sob fila do
  benchmark MKA
ecossistema: nexus-sota
autor: Devin (SWE-2 Flash) <devin@cognition.ai>
criado_em: "2026-11-13T19:15:00-03:00"
atualizado_em: "2026-11-13T19:15:00-03:00"
commit: HEAD
classes: [interno, medido, engine, ollama, benchmark, mka]
caminhos:
  - engine/gemma_server.py
  - reports/REGISTRO-2026-11-13-timeout-ollama-fila-mka.md
config_medida:
  congelada_em: "2026-11-13"
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: "3.14.9"
  so: Windows
  session_id: 008d56c0-057e-4e0f-8977-d947d396834a
  session_started_at: "2026-11-13T18:30:00-03:00"
  condutor: Devin (SWE-2 Flash) <devin@cognition.ai>
  modelo: swe-2-flash
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-13
verificado:
  - "ast.parse OK em engine/gemma_server.py antes e depois de ruff format"
  - "ruff format aplicado; diff final cirúrgico: apenas o bloco _OLLAMA_TIMEOUT"
  - "servidor reiniciado em http://127.0.0.1:17043; /health retorna status ok"
  - "causa raiz confirmada no log uvicorn: SocketTimeoutError em _stream_local
    durante fila do MKA --all (gemma4:e4b)"
nao_verificado:
  - "comportamento sob fila >240s (limite superior do novo sock_read)"
  - "métrica de latência pós-fix em produção com MKA ainda em execução"
revisoes_de_ancora:
  - registro: auditoria-2026-09-03-disco-extensao-e-roteador-de-modelo
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — a mudança é restrita a _OLLAMA_TIMEOUT (sock_read 90->240s +
      env override); não altera roteador, aliases nem contratos do arquivo
      ancorado.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — timeout de socket do cliente Ollama apenas; nenhuma superfície
      de modelo, payload ou streaming alterada.
  - registro: handoff-2026-09-14-pagina-icm-contra-a-mesa-real
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — ajuste de resiliência de rede local; sem impacto na página ICM
      nem em rotas de inferência.
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — somente constante de timeout; integração System1/dashboard
      inalterada.
  - registro: handoff-2026-09-23-auditoria-frontend-backend-e-laya
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — diff cirúrgico em _OLLAMA_TIMEOUT; Laya e demais caminhos
      intocados.
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — não toca OLLAMA_MODEL_MAP, aliases nem calibração de modelos.
  - registro: registro-2026-08-29-tres-orfaos
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — órfãos e rotas preservados; mudança limitada a timeout de
      socket.
  - registro: registro-2026-09-23-evolucao-pendencias-laya-e-tarefas
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — pendências Laya não afetadas; apenas resiliência do cliente
      Ollama.
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — bloco adicionado em ASCII puro com comentário; harmonização de
      scripts intacta.
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — reconciliação de âncoras preservada; timeout não remove nem
      renomeia nada.
  - registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — é justamente um ganho de resiliência de servidor local;
      coerente com o registro.
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — resolução de modelo e schema JSON intocados; só o
      ClientTimeout.
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — compatibilidade mantida; env override opcional não quebra
      diagnóstico IDE.
  - registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — arquivo passou em ruff format e ast.parse; tipagem/estilo
      conformes.
  - registro: registro-2026-10-27-resolucao-matriz-ci-e-acessibilidade-wcag
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — CI matrix e a11y não são tocados; suite pytest verde no gate.
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos: [engine/gemma_server.py]
    parecer:
      Revisado — sem novas dependências, CVEs ou superfícies de segurança
      alteradas.
---

# Registro — Timeout do cliente Ollama sob fila (MKA)

## Fato

`engine/gemma_server.py` usava `_OLLAMA_TIMEOUT(sock_read=90s)`. Sob contenção
do benchmark MKA (`gemma4:e4b` processando requests de minutos no Ollama),
requests enfileiradas do gateway :17043 morriam em `SocketTimeoutError` — o
daemon segura a conexão em silêncio durante a fila e 90 s foi calibrado para
Ollama ocioso.

## Correção

`sock_read` 90→240 s (default), configurável via `SOTA_OLLAMA_SOCK_READ`.
`total=600 s` inalterado; stall real continua cortado muito antes do teto.
Servidor reiniciado em `http://127.0.0.1:17043` (`/health` ok).

## Evidência

Log uvicorn colado pelo Tier 0: `SocketTimeoutError` em `_stream_local` para
`e2b`, latências `openai_chat_completions` de 92–120 s (sucesso, não erro).
