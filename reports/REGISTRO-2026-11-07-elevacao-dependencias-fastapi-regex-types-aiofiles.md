---
id: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
tipo: registro
escopo: Site -- elevacao de dependencias desatualizadas fastapi 0.162.1, regex 2026.11.7 e types-aiofiles 25.1.0.20261107
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-07T09:20:00-03:00'
atualizado_em: '2026-11-07T09:20:00-03:00'
commit: HEAD
verificado:
  - "Sintaxe e formato de pyproject.toml validados via ruff check"
  - "Resolucao e sincronizacao via uv lock e uv sync limpas (fastapi 0.162.1, regex 2026.11.7, types-aiofiles 25.1.0.20261107)"
  - "Suite completa de testes executada via pytest com 2092 testes aprovados, 4 pulados e zero falhas/warnings"
nao_verificado:
  - "Execucao em producao conteinerizada sob Cloud Run / Docker"
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: 2026-11-07
  toolchain: uv lock + uv sync + ruff check + pytest
  python: 3.14.9
  so: Windows
classes:
  - interno
  - medido
  - governanca
  - registro
  - backend
  - dependencias
caminhos:
  - pyproject.toml
  - uv.lock
  - reports/REGISTRO-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles.md
revisoes_de_ancora:
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
    parecer: 'Caminho revisado em 2026-11-07: elevacao pontual de dependencias de manutencao (fastapi 0.162.1, regex 2026.11.7, types-aiofiles 25.1.0.20261107) com teste de regressao e suite completa verdes (2092 passed). Contratos do backend permanecem inalterados.'
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Caminhos revisados em 2026-11-07: atualizacoes menores de pacotes no pyproject.toml e uv.lock com lock e sync consistentes e suite integral aprovada.'
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Caminhos revisados em 2026-11-07: lockfile e dependencias sincronizadas com zero vulnerabilidades e paridade confirmada.'
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Caminhos revisados em 2026-11-07: bump cirurgico de fastapi, regex e types-aiofiles sem regressao no pypdf ou dependencias do projeto.'
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: 'Caminho revisado em 2026-11-07: uv.lock atualizado preservando os pisos de seguranca de sentence-transformers e urllib3.'
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Caminhos revisados em 2026-11-07: alteracoes em pyproject.toml e uv.lock restritas a bumps de manutencao compatibilizados.'
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - uv.lock
    parecer: 'Caminho revisado em 2026-11-07: uv.lock mantem integridade estrutural e compatibilidade com engine Strata.'
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Caminhos revisados em 2026-11-07: stubs de types-aiofiles e dependencias atualizados mantendo contratos de tipagem.'
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Caminhos revisados em 2026-11-07: atualizacoes menores de pacotes Python sem impacto nas rotinas de teste do axe.'
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Caminhos revisados em 2026-11-07: integridade dos manifests confirmada com resolucao limpa e sem conflitos transitivos.'
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer: 'Caminho revisado em 2026-11-07: pyproject.toml atualizado pontualmente com compatibilidade estrita mantida.'
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: 'Caminhos revisados em 2026-11-07: bump cirurgico de fastapi para 0.162.1, regex para 2026.11.7 e types-aiofiles para 25.1.0.20261107 com 2092 testes verdes.'
---

# Registro 2026-11-07 — Elevacao de dependencias desatualizadas

## O que foi alterado
- `fastapi` elevado de `>=0.162.0` para `>=0.162.1` no `Site/pyproject.toml`.
- `regex` elevado de `>=2026.9.29` para `>=2026.11.7` no `Site/pyproject.toml`.
- `types-aiofiles` elevado de `>=25.1.0.20260518` para `>=25.1.0.20261107` no `Site/pyproject.toml`.
- `Site/uv.lock` sincronizado via `uv lock`.
- Ambiente virtual sincronizado via `uv sync`.

## Validacao
- `ruff check pyproject.toml`: checks aprovados.
- `pytest`: 2092 testes aprovados, 4 pulados, 0 falhas, 0 warnings.
