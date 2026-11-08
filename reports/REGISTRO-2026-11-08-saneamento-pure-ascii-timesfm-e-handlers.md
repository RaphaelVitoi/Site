---
id: registro-2026-11-08-saneamento-pure-ascii-timesfm-e-handlers
tipo: registro
escopo: Site -- Saneamento Pure ASCII em motor TimesFM, API handlers e suite de testes
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-08T10:22:00-03:00'
atualizado_em: '2026-11-08T10:22:00-03:00'
commit: HEAD
verificado:
  - 'Substituicao de escapes unicode por Pure ASCII explicito em engine/timesfm_engine.py'
  - 'Harmonizacao da mensagem de recusa em api/v1/handlers.py (nao comerciais)'
  - 'Atualizacao de assercoes em tests/test_timesfm_engine.py para Pure ASCII (VIOLACAO DE LICENCA)'
  - 'Suite de testes de TimesFM aprovada integralmente (25 passed)'
  - 'Validacao de blindagem ASCII aprovada via nexus ops check-ascii'
  - 'Ruff check aprovado sem pendencias'
nao_verificado:
  - 'Execucao em interpretadores legados Python 3.11 ou anterior'
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-08'
  toolchain: uv sync + ruff check + nexus ops check-ascii + pytest + record_gate.py
  python: 3.14.9
  so: Windows
classes:
  - interno
  - medido
  - governanca
  - registro
  - ascii
  - integridade
caminhos:
  - api/v1/handlers.py
  - engine/timesfm_engine.py
  - tests/test_timesfm_engine.py
  - reports/REGISTRO-2026-11-08-saneamento-pure-ascii-timesfm-e-handlers.md
revisoes_de_ancora:
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - api/v1/handlers.py
    parecer: 'Revisao em 2026-11-08: normalizacao de mensagem de erro em handler TimesFM para Pure ASCII.'
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - api/v1/handlers.py
    parecer: 'Revisao em 2026-11-08: normalizacao de mensagem de erro em handler TimesFM para Pure ASCII.'
  - registro: registro-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps
    caminhos:
      - engine/timesfm_engine.py
    parecer: 'Revisao em 2026-11-08: saneamento de escapes unicode em strings de erro e notas para Pure ASCII.'
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - api/v1/handlers.py
      - engine/timesfm_engine.py
      - tests/test_timesfm_engine.py
    parecer: 'Revisao em 2026-11-08: conversao integral de escapes unicode para Pure ASCII idiomático, eliminando truncamentos de log.'
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - api/v1/handlers.py
    parecer: 'Revisao em 2026-11-08: normalizacao de mensagem de erro em handler TimesFM para Pure ASCII.'
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - api/v1/handlers.py
    parecer: 'Revisao em 2026-11-08: normalizacao de mensagem de erro em handler TimesFM para Pure ASCII.'
  - registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
    caminhos:
      - api/v1/handlers.py
      - engine/timesfm_engine.py
    parecer: 'Revisao em 2026-11-08: saneamento de escapes unicode em mensagens de violacao de governanca e handlers.'
  - registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
    caminhos:
      - api/v1/handlers.py
      - engine/timesfm_engine.py
      - tests/test_timesfm_engine.py
    parecer: 'Revisao em 2026-11-08: normalizacao de strings de erro de governanca para Pure ASCII e atualizacao correspondente dos testes unitarios.'
  - registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
    caminhos:
      - engine/timesfm_engine.py
    parecer: 'Revisao em 2026-11-08: eliminacao de escapes unicode remanescentes em engine/timesfm_engine.py para garantir blindagem ASCII robusta sem dependencia de decodificacao de console.'
  - registro: registro-2026-10-26-saneamento-tipagem-linters-e-reconciliacao-de-ancoras
    caminhos:
      - tests/test_timesfm_engine.py
    parecer: 'Revisao em 2026-11-08: ajuste de assercoes de teste para verificar strings Pure ASCII.'
---

# Registro 2026-11-08: Saneamento Pure ASCII em Motor TimesFM, Handlers e Testes

## 1. Contexto & Diagnostico
Durante a inspecao forense do log da suite de testes de 2101 testes e Quality Gate, foi detectado que mensagens de violacao de licenca do modelo TimesFM 3.0 apresentavam letras mutiladas (`VIOLAO DE LICENA`, `est sob`, `probe expressamente`, `produo`, `servio`).
A causa raiz identificada residia no uso de escapes unicode (`\u00...`) em `engine/timesfm_engine.py` e `api/v1/handlers.py`. Ao serem emitidas pelo logger do sistema sob terminais Windows ou filtros com codificacao ASCII estrita, os bytes acentuados eram descartados por decodificadores conservadores.

## 2. Acoes Executadas
1. **`engine/timesfm_engine.py`**:
   - Convertidas todas as strings de erro de governanca, descricoes de campos Pydantic e notas tecnicas para Pure ASCII estrito e idiomatico (`VIOLACAO DE LICENCA`, `esta sob`, `proibe expressamente`, `producao`, `servico`).
   - Zerada a presenca de sequencias de escape `\u00...`.
2. **`api/v1/handlers.py`**:
   - Ajustada a string de erro em `handle_timesfm_forecast` para Pure ASCII (`Pesos TimesFM nao comerciais...`).
3. **`tests/test_timesfm_engine.py`**:
   - Atualizadas as assercoes unitarias para validar `VIOLACAO DE LICENCA` e `nao comerciais`.

## 3. Verificacao & Conformidade
- `pytest tests/test_timesfm_engine.py`: 25 passed em 5.58s.
- `nexus ops check-ascii`: Blindagem ASCII 100% integra em todos os modulos.
- `ruff check`: All checks passed.
