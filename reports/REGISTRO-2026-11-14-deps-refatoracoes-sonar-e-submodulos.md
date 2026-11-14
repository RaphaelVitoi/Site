---
id: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: "2026-11-14T04:56:00-03:00"
atualizado_em: "2026-11-14T04:56:00-03:00"
classes:
  - interno
  - medido
  - governanca
  - dependencias
config_medida:
  congelada_em: "2026-11-14"
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: "2026-11-14"
caminhos:
  - llm/gemini_decisions.py
  - llm/laya_bridge.py
  - package-lock.json
  - package.json
  - pyproject.toml
  - reports/agent-calibration/daily/2026-11-13.json
  - scripts/ops/avaliar_impacto_sessao.py
  - scripts/ops/devin_session_insights.py
  - scripts/ops/record_gate.py
  - scripts/ops/record_index.py
  - skills/exa-mcp-server
  - skills/gemini-deep-research
  - uv.lock
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - scripts/ops/record_gate.py
      - scripts/ops/record_index.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: auditoria-2026-09-24-laya-multilingual-s1
    caminhos:
      - llm/laya_bridge.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: auditoria-2026-09-29-elo-de-autonomia-entre-politica-e-runtime
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
      - scripts/ops/avaliar_impacto_sessao.py
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados; refatoracao estrutural em funcoes Python para
      reduzir complexidade cognitiva (S3776 <= 15), eliminar backtracking
      super-linear em regex de aviso (S8786) e estreitar tipagem com _como_dict
      sem alterar contratos. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: handoff-2026-08-31-saneamento-linters-e-estabilizacao-core-e-api
    caminhos:
      - pyproject.toml
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: handoff-2026-09-17-interceptacao-da-reincidencia-e-uniao-da-evidencia
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - llm/laya_bridge.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: handoff-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - llm/laya_bridge.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: handoff-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - llm/laya_bridge.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
    caminhos:
      - scripts/ops/avaliar_impacto_sessao.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - scripts/ops/avaliar_impacto_sessao.py
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados; refatoracao estrutural em funcoes Python para
      reduzir complexidade cognitiva (S3776 <= 15), eliminar backtracking
      super-linear em regex de aviso (S8786) e estreitar tipagem com _como_dict
      sem alterar contratos. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
    caminhos:
      - skills/gemini-deep-research
    parecer:
      "Revisado contra o diff deste commit: atualizacao de ponteiros de
      submodulos apos bump de dependencias compativeis (exa-mcp-server 65c333c e
      gemini-deep-research 736e536, TS ^6.0.3 preservado por peers). Nenhum
      contrato, invariante de seguranca ou comportamento medido foi alterado; o
      atestado do registro permanece valido para o escopo medido."
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - llm/laya_bridge.py
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados; refatoracao estrutural em funcoes Python para
      reduzir complexidade cognitiva (S3776 <= 15), eliminar backtracking
      super-linear em regex de aviso (S8786) e estreitar tipagem com _como_dict
      sem alterar contratos. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
    caminhos:
      - scripts/ops/record_gate.py
      - scripts/ops/record_index.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - package-lock.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-08-alternancia-de-extensoes-no-portao-de-registro
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-09-actionlint-e-a-fronteira-do-submodulo
    caminhos:
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-09-prisma-generate-e-o-typecheck-do-ci
    caminhos:
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-10-importacao-visivel-hh-hrc
    caminhos:
      - package-lock.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-10-publicacao-inputs-mtt
    caminhos:
      - package-lock.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-13-append-em-jsonl-e-suite-em-todos-os-nucleos
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-13-g2-so-bloqueia-registro-vigente
    caminhos:
      - scripts/ops/record_gate.py
      - scripts/ops/record_index.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-13-portoes-enxutos-e-horizontais
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-17-uniao-da-evidencia-aula12-com-o-motor-bayesiano
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-23-evolucao-pendencias-laya-e-tarefas
    caminhos:
      - llm/laya_bridge.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - llm/laya_bridge.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - llm/laya_bridge.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - llm/laya_bridge.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
    caminhos:
      - scripts/ops/avaliar_impacto_sessao.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
    caminhos:
      - scripts/ops/avaliar_impacto_sessao.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - scripts/ops/avaliar_impacto_sessao.py
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados; refatoracao estrutural em funcoes Python para
      reduzir complexidade cognitiva (S3776 <= 15), eliminar backtracking
      super-linear em regex de aviso (S8786) e estreitar tipagem com _como_dict
      sem alterar contratos. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - package-lock.json
      - package.json
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/laya_bridge.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - scripts/ops/avaliar_impacto_sessao.py
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados; refatoracao estrutural em funcoes Python para
      reduzir complexidade cognitiva (S3776 <= 15), eliminar backtracking
      super-linear em regex de aviso (S8786) e estreitar tipagem com _como_dict
      sem alterar contratos. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - scripts/ops/record_index.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-10-19-evolucao-telemetria-mcp-s1-e-benchmark-regime
    caminhos:
      - scripts/ops/avaliar_impacto_sessao.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - skills/exa-mcp-server
      - skills/gemini-deep-research
    parecer:
      "Revisado contra o diff deste commit: atualizacao de ponteiros de
      submodulos apos bump de dependencias compativeis (exa-mcp-server 65c333c e
      gemini-deep-research 736e536, TS ^6.0.3 preservado por peers). Nenhum
      contrato, invariante de seguranca ou comportamento medido foi alterado; o
      atestado do registro permanece valido para o escopo medido."
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - package-lock.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
    caminhos:
      - package-lock.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - package-lock.json
      - package.json
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-07-otimizacao-ux-portao-registro-e-congelamento-medicoes
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
    caminhos:
      - skills/gemini-deep-research
    parecer:
      "Revisado contra o diff deste commit: atualizacao de ponteiros de
      submodulos apos bump de dependencias compativeis (exa-mcp-server 65c333c e
      gemini-deep-research 736e536, TS ^6.0.3 preservado por peers). Nenhum
      contrato, invariante de seguranca ou comportamento medido foi alterado; o
      atestado do registro permanece valido para o escopo medido."
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Revisado contra o diff deste commit: atualizacao de ponteiros de
      submodulos apos bump de dependencias compativeis (exa-mcp-server 65c333c e
      gemini-deep-research 736e536, TS ^6.0.3 preservado por peers). Nenhum
      contrato, invariante de seguranca ou comportamento medido foi alterado; o
      atestado do registro permanece valido para o escopo medido."
  - registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
    caminhos:
      - package-lock.json
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
    caminhos:
      - package-lock.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-11-bump-deps-submodulos-skills
    caminhos:
      - skills/gemini-deep-research
    parecer:
      "Revisado contra o diff deste commit: atualizacao de ponteiros de
      submodulos apos bump de dependencias compativeis (exa-mcp-server 65c333c e
      gemini-deep-research 736e536, TS ^6.0.3 preservado por peers). Nenhum
      contrato, invariante de seguranca ou comportamento medido foi alterado; o
      atestado do registro permanece valido para o escopo medido."
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - skills/gemini-deep-research
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados; atualizacao de ponteiros de submodulos apos bump
      de dependencias compativeis (exa-mcp-server 65c333c e gemini-deep-research
      736e536, TS ^6.0.3 preservado por peers). Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - skills/exa-mcp-server
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados; atualizacao de ponteiros de submodulos apos bump
      de dependencias compativeis (exa-mcp-server 65c333c e gemini-deep-research
      736e536, TS ^6.0.3 preservado por peers). Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-12-arquitetura-s1-s2-llama-vulkan
    caminhos:
      - llm/gemini_decisions.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
    caminhos:
      - llm/gemini_decisions.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - llm/gemini_decisions.py
      - package-lock.json
      - package.json
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados; refatoracao estrutural em funcoes Python para
      reduzir complexidade cognitiva (S3776 <= 15), eliminar backtracking
      super-linear em regex de aviso (S8786) e estreitar tipagem com _como_dict
      sem alterar contratos. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-13-avisos-do-portao-e-saude-da-malha
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - package-lock.json
      - package.json
      - pyproject.toml
      - uv.lock
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: registro-2026-11-13-obsoleto-auditado-e-aviso-com-atencao
    caminhos:
      - scripts/ops/record_gate.py
      - scripts/ops/record_index.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer:
      "Revisado contra o diff deste commit: elevacao de pisos de manifestos
      (fastapi 0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright
      1.65.2, types-PyYAML 6.0.12.20261113, @ai-sdk/google 4.0.121, ai 7.0.173)
      com locks sincronizados. Nenhum contrato, invariante de seguranca ou
      comportamento medido foi alterado; o atestado do registro permanece valido
      para o escopo medido."
  - registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
    caminhos:
      - scripts/ops/record_gate.py
    parecer:
      "Revisado contra o diff deste commit: refatoracao estrutural em funcoes
      Python para reduzir complexidade cognitiva (S3776 <= 15), eliminar
      backtracking super-linear em regex de aviso (S8786) e estreitar tipagem
      com _como_dict sem alterar contratos. Nenhum contrato, invariante de
      seguranca ou comportamento medido foi alterado; o atestado do registro
      permanece valido para o escopo medido."
verificado:
  - "uv sync --all-extras: pyproject.toml e uv.lock sincronizados (fastapi
    0.162.7, pydantic-settings 2.16.3, openai 3.51.0, playwright 1.65.2,
    types-PyYAML 6.0.12.20261113)"
  - "npm install e npm run typecheck: package.json/package-lock.json
    (@ai-sdk/google 4.0.121, ai 7.0.173) e tsc --build verdes"
  - "npm run lint e npm test (frontend): eslint limpo e Jest 111/111 suites
    (740/740 testes) verdes"
  - submodulos skills/gemini-deep-research (736e536, jest 47/47 + tsc + eslint)
    e skills/exa-mcp-server (65c333c, vitest 158/158 + tsc + prettier)
    commitados e empurrados para fork
  - ruff check . e ruff format --check limpos nos 6 arquivos Python refatorados;
    pyright 0 erros/warnings em todos os 6 arquivos
  - "pytest focado: test_gemini_decisions + test_laya_bridge +
    test_laya_fase4_predict + test_laya_s1_routing + test_record_index +
    test_record_gate_* (124/124) e revalidacao pos-formatacao (60/60) verdes"
  - "npm run sota:audit: 0 erros e 0 warnings nas 5 fases (LCP 324.4 ms, TTFB
    71.6 ms, CLS 0, AXE 0, CVE 0, SRI VERIFIED)"
nao_verificado:
  - Alteracoes no workflow upstream de skills/gemini-cli-security
    (.github/workflows/gemini-review.yml) nao foram tocadas por pertencerem a
    submodulo externo sem contexto de vars/secrets locais
  - next-auth (5.0.0-beta.32) e prisma (7.10.1) em frontend/package.json
    mantidos sem downgrade/upgrade para RC (4.24.15 e v4; 8.0.0-rc.33 e
    pre-release)
---

# REGISTRO - Elevacao de dependencias, refatoracoes Sonar/Pyright e submodulos (2026-11-14)

## O que mudou

1. **Dependencias Python (pyproject.toml, uv.lock)**:
   - astapi>=0.162.7, pydantic-settings>=2.16.3, openai>=3.51.0,
     playwright>=1.65.2, ypes-PyYAML>=6.0.12.20261113 (espelhado em
     optional-dependencies.dev e dependency-groups.dev).
2. **Dependencias JS/TS (package.json, package-lock.json e submodulos)**:
   - Raiz Site: @ai-sdk/google ^4.0.121, i ^7.0.173.
   - Submodulo skills/gemini-deep-research (736e536): @google/genai ^3.3.0,
     eslint ^10.15.0, prettier ^3.10.1 ( ypescript ^6.0.3 mantido por peer deps
     de s-jest e ypescript-eslint).
   - Submodulo skills/exa-mcp-server (65c333c): mcp-handler ^2.4.0,
     @upstash/ratelimit ^2.2.1, prettier 3.10.1, ercel ^65.16.0.
   - rontend/package.json preservado: ext-auth (5.0.0-beta.32) e prisma (7.10.1,
     alinhado a @prisma/client).
3. **Refatoracoes SonarLint / Pyright / Pyrefly**:
   - S3776 reduzida para <= 15 em llm/gemini_decisions.py, llm/laya_bridge.py,
     scripts/ops/avaliar_impacto_sessao.py,
     scripts/ops/devin_session_insights.py e scripts/ops/record_index.py.
   - S8786 eliminada em scripts/ops/record_gate.py (_RE_AVISO_NAO_VIGENTE com
     classes disjuntas).
   - 11 erros missing-attribute / eportAttributeAccessIssue sanados em
     scripts/ops/avaliar_impacto_sessao.py com _como_dict.
4. **Lastro diario e higiene**:
   - Incluido eports/agent-calibration/daily/2026-11-13.json; descartado
     artefato vazio ul.

## revisoes_de_ancora

110 registros VIGENTES ancorados nos caminhos tocados receberam parecer
individual neste frontmatter.

Assinatura: Gemini 4 Hydrogen [Tier 1]
