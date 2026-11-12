---
id: registro-2026-11-01-resiliencia-proactor-winerror-10054
tipo: registro
escopo: Site -- Resiliencia do ProactorEventLoop a desconexoes abruptas de socket no Windows (WinError 10054)
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-01T19:00:00-03:00'
atualizado_em: '2026-11-01T19:00:00-03:00'
commit: HEAD
classes:
- interno
- medido
- governanca
- registro
- backend
- sota
caminhos:
- main.py
- reports/REGISTRO-2026-11-01-resiliencia-proactor-winerror-10054.md
- tests/test_worker_startup_shutdown.py
- worker/startup.py
config_medida:
  congelada_em: '2026-11-01'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.7
  so: Windows
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-01
verificado:
  - Implementacao de tratador de excecao resiliente no ProactorEventLoop silenciando WinError 10054
  - Integracao do tratador em worker/startup.py e main.py
  - Teste unitario dedicado em tests/test_worker_startup_shutdown.py aprovado com 100% de sucesso
nao_verificado:
  - Comportamento sob sistemas operacionais Linux/macOS onde o seletor epoll/kqueue nao emite WinError
revisoes_de_ancora:
- registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
  caminhos:
  - tests/test_worker_startup_shutdown.py
  - worker/startup.py
  parecer: Revisado em 2026-11-01. Tratador de excecao adicionado ao ciclo de vida do worker para silenciar WinError 10054 inofensivo em conexoes fechadas no Windows sem alterar o mecanismo de shutdown.
---

# Registro: Resiliencia do ProactorEventLoop a WinError 10054 no Windows

## 1. Contexto & Problema
No Windows, o `ProactorEventLoop` do asyncio emite uma excecao no callback `_ProactorBasePipeTransport._call_connection_lost()` (`ConnectionResetError: [WinError 10054]`) ao tentar executar `self._sock.shutdown(socket.SHUT_RDWR)` contra um socket que ja foi redefinido (RST) pelo peer remoto (ex: fechamento de aba de navegador, cancelamento de fetch ou reload de pagina).

## 2. Solucao SOTA
Instalacao de um tratador de excecao de loop de eventos que filtra silenciosamente excecoes `ConnectionResetError` com WinError 10054 e mensagens de callback de transporte sem afetar o repasse de erros legitimos de aplicacao.

## 3. Reconciliacao de Ancoras
A ancora histórica `registro-2026-10-04-http-metrics-correlation-e-worker-shutdown` foi formalmente reconciliada conforme o M.O. 13.F.
