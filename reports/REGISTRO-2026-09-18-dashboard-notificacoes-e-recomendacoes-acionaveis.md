---
id: registro-2026-09-18-dashboard-notificacoes-e-recomendacoes-acionaveis
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-18T09:58:00-03:00'
atualizado_em: '2026-09-18T09:58:00-03:00'
classes: [interno, medido, governanca, qualidade, dashboard, dream-rsi, timesfm]
caminhos:
  - reports/REGISTRO-2026-09-18-dashboard-notificacoes-e-recomendacoes-acionaveis.md
  - engine/dashboard_notifications.py
  - scripts/cli/nexus.py
  - tests/test_dashboard_notifications.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 04759c35
  data_das_medicoes: 2026-09-18
verificado:
  - integracao do motor de notificacoes e recomendacoes acionaveis (DashboardNotificationsEngine) ao ./dashboard.ps1
  - exibicao periodica e reativa do status do Dream-RSI (364 arvores, 664 nos), token budget (+50.3% livre) e calibracao
  - mapeamento de atalhos de tecla unica [D] para dream-optimize (TimesFM 3.0), [T] para stats timesfm e [K] para calibracao
  - desacoplamento epistemico estrito do modelo PMev de qualquer mencao indevida a bankroll ou gestao de banca
  - suporte a flag --notify / -n no nexus dashboard para saida sintetizada rapida em automacoes e cron
  - 48 testes pytest (test_dashboard_notifications e test_cli_nexus) aprovados em 5.24s com zero erros e zero warnings
  - ruff check e record_gate 100% limpos com zero erros
nao_verificado:
  - execucao do dashboard sob ambientes sem suporte a msvcrt / terminal interativo (comportamento degrada com aviso seguro)
---

# Notificacoes, Status Dinamico e Recomendacoes Acionaveis no Dashboard

Integracao concluida do subsistema de notificacoes em tempo real e atalhos acionaveis ao painel executivo `./dashboard.ps1` (`nexus dashboard`).

## 1. Engine de Telemetria e Notificacoes (`engine/dashboard_notifications.py`)

1. **Varredura O(1) Nao-Bloqueante:**
   - Inspeciona o banco `data/discovery_tree.db` reportando 364 arvores e 664 nos, indicando a poda preditiva de 15.1% de espaco.
   - Inspeciona o ledger `reports/agent-calibration/feedback-ledger.jsonl` com 34 sessoes, confirmando deriva temporal positiva (+0.057 pts/sessao) e risco de degradacao 0.0%.
   - Inspeciona o token budget de customizacoes da IDE Google Antigravity (9.942 / 20.000 tokens, +50.3% de folga livre).
2. **Recomendacoes Acionaveis:**
   - Tecla `[D]`: Disparo da Fase de Sonho Offline do Dream-RSI com Google TimesFM 3.0 em modo pesquisa.
   - Tecla `[T]`: Disparo do Oraculo de Series Temporais para projecao estocastica e tensores de risco PMev em MTTs.
   - Tecla `[K]`: Projecao quantilica (Q10/Q50/Q90) da calibracao dos modelos condutores.
3. **Desacoplamento Epistemico PMev vs Bankroll:**
   - O modelo PMev governa estritamente teoria dos jogos, ICM, utilidade de fichas e tensores de risco em torneios de poker (MTTs), permanecendo completamente desacoplado de financas pessoais ou gestao de banca.

## 2. Painel Executivo e Launcher (`scripts/cli/nexus.py` e `./dashboard.ps1`)

1. **Painel Rich Dinamico:**
   - Funcao `_build_notifications_panel()` integrada ao fluxo principal de renderizacao (`_generate_dashboard_ui`).
   - Atualizacao periodica a cada ciclo de poll no loop interativo do CEO.
2. **Suporte a Flag `--notify`:**
   - Permite consultar o extrato operacional instantaneo via `./dashboard.ps1 --notify` ou `nexus dashboard --notify`.
3. **Mapeamento de Teclado Seguro:**
   - Teclas `[D]` e `[T]` registradas em `cmd_map` e `valid_keys` com tratamento gracioso de terminal.

## 3. Qualidade e Validacao

- **Pytest:** 48 testes verdes em 5.24s (`tests/test_dashboard_notifications.py` e `tests/test_cli_nexus.py`).
- **Ruff:** 0 erros nos 3 arquivos de runtime e testes.
