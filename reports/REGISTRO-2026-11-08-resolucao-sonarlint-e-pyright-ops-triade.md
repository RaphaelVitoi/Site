---
id: registro-2026-11-08-resolucao-sonarlint-e-pyright-ops-triade
tipo: registro
escopo: Site -- Resolucao de diagnosticos SonarLint (S1192 literais duplicados, S3776 complexidade cognitiva) e correcao de narrowing Pyright/Pyrefly nos scripts da Triade SOTA
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-08T09:27:00-03:00'
atualizado_em: '2026-11-08T09:27:00-03:00'
commit: HEAD
verificado:
  - 'Eliminacao de literais duplicados (S1192) via constantes HELP_SESSION_ID, HELP_PROJECT_ID, HELP_MODEL_TIER, HELP_DEVICE_TYPE e STATUS_INDISPONIVEL'
  - 'Reducao de complexidade cognitiva (S3776) em cmd_list (run_stitch_agent.py) e fetch_all_exa_telemetry (sync_exa_report.py) para <= 3'
  - 'Correcao de narrowing de tipo Pyright e Pyrefly em run_jules_agent.py (coercoes explicitas str(...))'
  - '51 testes unitarios da Triade aprovados com zero falhas em test_stitch_bridge.py, test_exa_bridge.py e test_jules_bridge.py'
  - 'Ruff check e ruff format 100% aprovados sem violacoes'
nao_verificado:
  - 'Execucao em sistemas operacionais legados sem PowerShell 7+'
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-08'
  toolchain: uv sync + ruff check + pyright + pytest + record_gate.py
  python: 3.14.9
  so: Windows
classes:
  - interno
  - medido
  - governanca
  - registro
  - triade
  - sonarlint
  - pyright
caminhos:
  - scripts/ops/run_jules_agent.py
  - scripts/ops/run_stitch_agent.py
  - scripts/ops/sync_exa_report.py
  - reports/REGISTRO-2026-11-08-integracao-sota-triade-stitch-exa-jules.md
  - reports/REGISTRO-2026-11-08-resolucao-sonarlint-e-pyright-ops-triade.md
revisoes_de_ancora:
  - registro: registro-2026-10-28-fortalecimento-e-harmonizacao-sota-triade-stitch-e-exa
    caminhos:
      - scripts/ops/sync_exa_report.py
    parecer: 'Revisao em 2026-11-08: eliminacao de literais duplicados (S1192) e decomposicao para reducao de complexidade cognitiva (S3776).'
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - scripts/ops/sync_exa_report.py
    parecer: 'Revisao em 2026-11-08: saneamento de literais duplicados e complexidade cognitiva sem alterar contratos operacionais.'
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - scripts/ops/run_jules_agent.py
      - scripts/ops/run_stitch_agent.py
      - scripts/ops/sync_exa_report.py
    parecer: 'Revisao em 2026-11-08: saneamento de literais duplicados (S1192), reducao de complexidade cognitiva em cmd_list (S3776) e correcao de narrowing Pyright/Pyrefly.'
---

# Registro 2026-11-08: Resolucao SonarLint e Pyright nos CLIs e Scripts da Triade SOTA

Saneamento de qualidade e complexidade tecnica nos scripts operacionais da Triade SOTA (Stitch, Exa, Jules):
1. **SonarLint python:S1192 (Literais duplicados):**
   - `run_jules_agent.py`: substituicao de 5 literais repetidos por `HELP_SESSION_ID: Final[str] = "ID da sessao"`.
   - `run_stitch_agent.py`: criacao das constantes `HELP_PROJECT_ID`, `HELP_MODEL_TIER` e `HELP_DEVICE_TYPE`.
   - `sync_exa_report.py`: criacao da constante `STATUS_INDISPONIVEL: Final[str] = "INDISPONIVEL (EXA_API_KEY ausente)"`.
2. **SonarLint python:S3776 (Complexidade Cognitiva):**
   - `run_stitch_agent.py`: decomposicao de `cmd_list` em `_list_screens` e `_list_projects`. Complexidade reduzida de 22 para 1.
   - `sync_exa_report.py`: extracao de `_run_exa_probe` e `_build_tools_catalog` de `fetch_all_exa_telemetry`. Complexidade reduzida de 18 para 1.
3. **Pyright & Pyrefly (Narrowing de Tipos):**
   - `run_jules_agent.py`: eliminacao de erros de indexacao e acesso a atributos em variaveis inferidas como `object`, aplicando coercoes explicitas `str(...)`.
4. **Verificacao e Homologacao:**
   - Zero erros no Pyright e Ruff.
   - 51 testes unitarios executados e aprovados com sucesso.
