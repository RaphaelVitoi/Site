---
id: registro-2026-11-08-blindagem-ascii-modulos-python
tipo: registro
escopo: Site -- Blindagem ASCII em modulos Python (engine/chrysalis_bridge.py, llm/strata_client.py, tests/test_jules_bridge.py)
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-08T09:37:00-03:00'
atualizado_em: '2026-11-08T09:37:00-03:00'
commit: HEAD
verificado:
  - 'Remocao de caracteres nao-ASCII em engine/chrysalis_bridge.py (cedilhas, simbolos de secao e travessoes)'
  - 'Remocao de travessoes nao-ASCII em comentarios de llm/strata_client.py'
  - 'Remocao de acentuacao em docstrings de tests/test_jules_bridge.py'
  - 'Aprovacao total do comando nexus ops check-ascii com zero entropia'
  - '51 testes unitarios da Triade aprovados sem falhas'
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
  - engine/chrysalis_bridge.py
  - llm/strata_client.py
  - tests/test_jules_bridge.py
  - reports/REGISTRO-2026-11-08-blindagem-ascii-modulos-python.md
revisoes_de_ancora:
  - registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
    caminhos:
      - llm/strata_client.py
    parecer: 'Revisao em 2026-11-08: normalizacao de travessao nao-ASCII para hifen em comentario NOSONAR para conformidade com a Blindagem ASCII.'
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - tests/test_jules_bridge.py
    parecer: 'Revisao em 2026-11-08: remocao de acento em docstring de teste para conformidade com a Blindagem ASCII.'
  - registro: registro-2026-10-31-desbloqueio-e-homologacao-jules-speedup-range-parser
    caminhos:
      - tests/test_jules_bridge.py
    parecer: 'Revisao em 2026-11-08: remocao de acento em docstring de teste para conformidade com a Blindagem ASCII.'
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - llm/strata_client.py
    parecer: 'Revisao em 2026-11-08: normalizacao de travessao nao-ASCII para hifen em comentario NOSONAR para conformidade com a Blindagem ASCII.'
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - tests/test_jules_bridge.py
    parecer: 'Revisao em 2026-11-08: remocao de acento em docstring de teste para conformidade com a Blindagem ASCII.'
---

# Registro 2026-11-08: Blindagem ASCII em Modulos Python

Normalizacao de caracteres Unicode nao-ASCII para conformidade com o mandato Pure ASCII (`nexus ops check-ascii`):
- `engine/chrysalis_bridge.py`: substituicao de `Convenção:` por `Convencao:`, `§` por `S` e `—` por `--`.
- `llm/strata_client.py`: substituicao de travessoes `—` por hifens `-` nos comentarios NOSONAR.
- `tests/test_jules_bridge.py`: substituicao de `atômicas` por `atomicas` na docstring do teste.
