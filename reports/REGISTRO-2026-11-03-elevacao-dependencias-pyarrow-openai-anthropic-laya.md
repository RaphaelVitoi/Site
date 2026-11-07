---
id: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
tipo: registro
escopo: Site -- Elevacao de dependencias desatualizadas pyarrow, openai, anthropic, laya e types-PyYAML
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-03T17:48:00-03:00'
atualizado_em: '2026-11-03T17:48:00-03:00'
commit: HEAD
classes:
- interno
- medido
- governanca
- registro
- backend
- sota
caminhos:
- pyproject.toml
- reports/REGISTRO-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya.md
- uv.lock
config_medida:
  congelada_em: '2026-11-03'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.7
  so: Windows
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-03
verificado:
  - Elevacao das dependencias no pyproject.toml para pyarrow>=26.0.1, openai>=3.44.0, anthropic>=2.4.0, laya>=0.4.22 e types-PyYAML>=6.0.12.20261103
  - Sincronizacao no uv.lock via uv lock e uv sync sem conflitos
  - Higienizacao de diretorios dist-info orfaos residuais no ambiente .venv
  - Validacao e teste de importacao de todos os pacotes atualizados em runtime
  - Passagem integra pelo portao de ancoras record_gate.py e record_anchor_gate.ps1
  - Suite de testes Python integral aprovada via suite_verde.py com 0 erros e 0 warnings
  - Quality Gate 5 fases aprovado via sota:audit com 0 erros e 0 warnings
nao_verificado:
  - Comportamento de streaming WebRTC do Laya em cluster multi-GPU distribuido
revisoes_de_ancora:
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - pyproject.toml
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-04-remediacao-dependabot-pypdf
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
  caminhos:
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
- registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
  caminhos:
  - pyproject.toml
  - uv.lock
  parecer: Revisado em 2026-11-03. Elevacao pontual de pyarrow 26.0.1, openai 3.44.0, anthropic 2.4.0, laya 0.4.22 e types-PyYAML.
---

# REGISTRO: Elevacao de Dependencias pyarrow, openai, anthropic, laya e types-PyYAML

## 1. Contexto & Diagnostico
Diagnosticos do gerenciador de pacotes uv-pypi acusaram versoes defasadas para 5 dependencias do projeto Site:
- `pyarrow` defasado de 26.0.0 para 26.0.1
- `openai` defasado de 3.43.0 para 3.44.0
- `anthropic` defasado de 2.3.0 para 2.4.0
- `laya` defasado de 0.4.21 para 0.4.22
- `types-PyYAML` defasado de 6.0.12.20260908 para 6.0.12.20261103

## 2. Acoes Executadas
1. Atualizacao dos requisitos no [`pyproject.toml`](file:///c:/Users/rapha/.gemini/Site/pyproject.toml).
2. Atualizacao e travamento do lockfile via `uv lock --upgrade-package`.
3. Parada graciosa do servico em segundo plano Laya (`Start-LayaService.ps1 -Stop`) para liberar bloqueio da DLL `msvcp140` do runtime Windows.
4. Sincronizacao limpa do ambiente virtual com `uv sync`.
5. Limpeza de pastas residuais `dist-info` orfas.
6. Reinicializacao do servico Laya via `Start-LayaService.ps1`.
7. Validacao dos modulos e versoes em runtime via script Python inline.
8. Execucao integral dos portoes de ancora (M.O. 13.F).
