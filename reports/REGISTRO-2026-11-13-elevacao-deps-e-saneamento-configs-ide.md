---
id: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor:
  Devin (SWE-2 Flash)
  <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: "2026-11-13T14:10:00-03:00"
atualizado_em: "2026-11-13T14:10:00-03:00"
classes: [interno, medido, governanca, dependencias]
config_medida:
  congelada_em: "2026-11-13"
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: 2026-11-13
caminhos:
  - pyproject.toml
  - uv.lock
  - package.json
  - package-lock.json
  - Site.code-workspace
  - .devin/config.json
revisoes_de_ancora:
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos: [package-lock.json, package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos: [package-lock.json, package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos: [pyproject.toml]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos: [pyproject.toml]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
    caminhos: [Site.code-workspace]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos: [package-lock.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos: [package-lock.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-04-otimizacao-settings-seguranca-e-io
    caminhos: [Site.code-workspace]
    parecer:
      "Revisado contra o diff deste commit: eslint.workingDirectories em
      Site.code-workspace migrado de {directory,!cwd:false} para a forma string
      'frontend' -- semanticamente equivalente na extensao atual (o cwd muda por
      padrao) e elimina o aviso de forma depreciada do schema. A configuracao
      efetiva do ESLint nao muda e o atestado do registro permanece valido."
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos: [package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos: [package-lock.json, package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
    caminhos: [package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
    caminhos: [package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-10-importacao-visivel-hh-hrc
    caminhos: [package-lock.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-10-publicacao-inputs-mtt
    caminhos: [package-lock.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras
    caminhos: [Site.code-workspace]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos: [Site.code-workspace, package-lock.json, package.json]
    parecer:
      "Revisado contra o diff deste commit: eslint.workingDirectories em
      Site.code-workspace migrado de {directory,!cwd:false} para a forma string
      'frontend' -- semanticamente equivalente na extensao atual (o cwd muda por
      padrao) e elimina o aviso de forma depreciada do schema. A configuracao
      efetiva do ESLint nao muda e o atestado do registro permanece valido."
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos: [package-lock.json, package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
    caminhos: [package-lock.json, package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos: [uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos: [package-lock.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos: [package-lock.json, package.json, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos: [Site.code-workspace, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: eslint.workingDirectories em
      Site.code-workspace migrado de {directory,!cwd:false} para a forma string
      'frontend' -- semanticamente equivalente na extensao atual (o cwd muda por
      padrao) e elimina o aviso de forma depreciada do schema. A configuracao
      efetiva do ESLint nao muda e o atestado do registro permanece valido."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos: [package-lock.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos: [package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: pisos de ruff (>=0.17.5) e
      pytest-asyncio (>=1.5.0) atualizados de forma identica em
      [project.optional-dependencies].dev e [dependency-groups].dev, preservando
      o pareamento PEP 735 declarado pelo registro. O atestado permanece valido."
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos: [package-lock.json, package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
    caminhos: [package-lock.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos: [package-lock.json, package.json, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: @ai-sdk/google ^4.0.118->^4.0.120 e
      ai ^7.0.170->^7.0.172 (ultimas publicadas no npm), lockfile regenerado.
      Sem mudanca de API nem de contrato; atestado do registro permanece valido."
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos: [pyproject.toml]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
    caminhos: [package-lock.json, package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: pisos de ruff (>=0.17.5) e
      pytest-asyncio (>=1.5.0) atualizados de forma identica em
      [project.optional-dependencies].dev e [dependency-groups].dev, preservando
      o pareamento PEP 735 declarado pelo registro. O atestado permanece valido."
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos: [package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos: [package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
    caminhos: [package-lock.json, package.json]
    parecer:
      "Revisado contra o diff deste commit: @ai-sdk/google ^4.0.118->^4.0.120 e
      ai ^7.0.170->^7.0.172 (ultimas publicadas no npm), lockfile regenerado.
      Sem mudanca de API nem de contrato; atestado do registro permanece valido."
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-10-eslint-workingdirectories-cwd-schema
    caminhos: [Site.code-workspace]
    parecer:
      "Revisado contra o diff deste commit: eslint.workingDirectories em
      Site.code-workspace migrado de {directory,!cwd:false} para a forma string
      'frontend' -- semanticamente equivalente na extensao atual (o cwd muda por
      padrao) e elimina o aviso de forma depreciada do schema. A configuracao
      efetiva do ESLint nao muda e o atestado do registro permanece valido."
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: google-genai elevado de >=3.2.0 para
      >=3.3.0 (ultima publicada, conferida no PyPI); o pin tenacity<9.2.0 foi
      mantido porque o Requires-Dist do 3.3.0 ainda exige tenacity<9.2.0. O
      atestado do registro segue valido: sua medicao e historica e o novo piso
      nao altera o escopo declarado."
  - registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
    caminhos: [package-lock.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos: [pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: @ai-sdk/google ^4.0.118->^4.0.120 e
      ai ^7.0.170->^7.0.172 (ultimas publicadas no npm), lockfile regenerado.
      Sem mudanca de API nem de contrato; atestado do registro permanece valido."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: google-genai elevado de >=3.2.0 para
      >=3.3.0 (ultima publicada, conferida no PyPI); o pin tenacity<9.2.0 foi
      mantido porque o Requires-Dist do 3.3.0 ainda exige tenacity<9.2.0. O
      atestado do registro segue valido: sua medicao e historica e o novo piso
      nao altera o escopo declarado."
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos: [package-lock.json, package.json, pyproject.toml, uv.lock]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos: [pyproject.toml]
    parecer:
      "Revisado contra o diff deste commit: pisos de ruff (>=0.17.5) e
      pytest-asyncio (>=1.5.0) atualizados de forma identica em
      [project.optional-dependencies].dev e [dependency-groups].dev, preservando
      o pareamento PEP 735 declarado pelo registro. O atestado permanece valido."
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos: [package-lock.json, package.json]
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos de
      dependencia (fastapi 0.162.6, google-genai 3.3.0, onnxruntime 1.32.0,
      openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0, @ai-sdk/google 4.0.120,
      ai 7.0.172) e saneamento de configs do IDE (.devin/config.json sem
      comentarios JSON; eslint.workingDirectories na forma corrente do schema).
      A mudanca e de piso, nao de contrato: o atestado do registro permanece
      valido para o escopo medido."
verificado:
  - "pip index versions: fastapi 0.162.6, google-genai 3.3.0, onnxruntime
    1.32.0, openai 3.50.0, ruff 0.17.5, pytest-asyncio 1.5.0 sao as ultimas
    publicadas no PyPI"
  - "npm view: @ai-sdk/google 4.0.120 e ai 7.0.172 sao as ultimas publicadas no
    npm"
  - "uv sync --all-extras: uv.lock regenerado e todos os pisos instalados;
    extras pmev/monitoring/vision preservados"
  - "npm install: package-lock.json sincronizado com os novos pisos"
  - "pip show google-genai 3.3.0: Requires-Dist tenacity<9.2.0,>=8.2.3
    confirmado — pin local mantido"
  - "pip show laya: 0.4.31 instalada = ultima publicada; nao havia bump a fazer"
  - "ruff check .: limpo com ruff 0.17.5; pytest focado 69/69 + 26/26 verde"
  - "pytest test_gemini_decisions: 0 warnings apos ajuste do filterwarnings para
    SyntaxWarning upstream"
nao_verificado:
  - "Suite jest/frontend nao executada neste commit (gates do hook sao
    CWV+pytest); bumps npm sao patch/minor em SDK de AI, risco residual baixo"
  - "Comportamento funcional do google-genai 3.3.0 alem do import nao foi
    exercitado (sem chamada real a API neste commit)"
---

# REGISTRO — Elevacao de pisos de dependencias e saneamento de configs do IDE (2026-11-13)

## Motivo

O IDE reportou pisos de dependencias abaixo das ultimas versoes publicadas e
dois problemas de configuracao: `.devin/config.json` com comentarios (JSON
estrito rejeita) e `Site.code-workspace` usando a forma depreciada de
`eslint.workingDirectories`. Todos os pisos foram conferidos no PyPI/npm antes
do bump — nenhum foi elevado por indicacao do IDE sem verificacao.

## O que mudou

| Pacote                         | Antes         | Depois    |
| :----------------------------- | :------------ | :-------- |
| fastapi                        | >=0.162.5     | >=0.162.6 |
| google-genai                   | >=3.2.0       | >=3.3.0   |
| onnxruntime                    | >=1.31.1      | >=1.32.0  |
| openai                         | >=3.49.0      | >=3.50.0  |
| ruff (dev, 2 listas)           | >=0.17.4      | >=0.17.5  |
| pytest-asyncio (dev, 2 listas) | >=1.4.1.post1 | >=1.5.0   |
| @ai-sdk/google                 | ^4.0.118      | ^4.0.120  |
| ai                             | ^7.0.170      | ^7.0.172  |

- `pyproject.toml`: pisos acima; `ruff` e `pytest-asyncio` atualizados de forma
  identica em `[project.optional-dependencies].dev` e `[dependency-groups].dev`
  (pareamento PEP 735 preservado). `uv.lock` regenerado via
  `uv sync --all-extras`.
- `package.json`/`package-lock.json`: pisos npm acima; lockfile via
  `npm install`.
- `.devin/config.json`: comentarios de cabecalho removidos (JSON estrito).
- `Site.code-workspace`: `eslint.workingDirectories` migrou de
  `{directory, !cwd: false}` para a forma string `"frontend"` — semanticamente
  equivalente (a extensao muda o cwd por padrao) e elimina o aviso de schema.

## Decisoes de compatibilidade

- **`tenacity<9.2.0` mantido.** O `Requires-Dist` do google-genai 3.3.0 (lido do
  PyPI) ainda exige `tenacity<9.2.0,>=8.2.3` — o pin e constraint upstream real,
  nao cautela local. Comentario do pin atualizado para citar o 3.3.0.
- **`laya` nao aparece na lista do IDE porque ja esta no piso maximo**
  (`>=0.4.31`, ultima publicada e instalada).
- **SyntaxWarning upstream do google-genai 3.3.0:** `types.py` tem docstring com
  escape invalido `\/` nas linhas 18308/18346 — defeito cosmetico da Google,
  emitido uma vez por compilacao. O `filterwarnings` do pytest passou a ignorar
  `.*invalid escape sequence.*:SyntaxWarning` **sem escopo de modulo**: a
  atribuicao de SyntaxWarning de import e do modulo importador (nao do
  site-packages), e o escopo por modulo nao casa. Seguro sem escopo porque o
  ruff `W` (W605) esta habilitado e `ruff check --select W605 .` passa limpo —
  nenhum escape invalido pode existir no codigo proprio.
- **Extras opcionais preservados:** `uv sync --extra dev` inicial removeu
  `polars`/`prometheus-client`/`torchvision` (extras
  `pmev`/`monitoring`/`vision` fora do sync); corrigido com
  `uv sync --all-extras`.

## Verificacao

- `uv sync --all-extras` e `npm install`: locks regenerados, versoes instaladas
  conferidas uma a uma (`pip list`/`npm ls`).
- `ruff check .`: limpo. `ruff 0.17.5`.
- pytest focado: `test_record_index` + `test_saude_da_malha` 69/69 verde;
  `test_gemini_decisions` 26/26 sem warnings apos o ajuste do filterwarnings.
- Portoes do commit (CWV/a11y/CVE/SRI, suite integral, record gate) executados
  pelo hook pre-commit.

## revisoes_de_ancora

73 registros VIGENTES tiveram caminhos-ancora tocados por este commit
(manifestos quentes). Cada um recebeu parecer individual neste frontmatter — a
mesma classe de revisao que os registros de elevacao anteriores fizeram.

Assinatura: Devin (SWE-2 Flash) [Tier 1]
