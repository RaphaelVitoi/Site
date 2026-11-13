---
id: handoff-2026-11-13-aposentadoria-strata-e-fecho-de-sessao
tipo: handoff
escopo: >-
  "Fechamento da sessao 2026-11-13: auditoria Goldfish (5 fases) do ecossistema
  llama.cpp/Strata/Avalon, remediacao completa do eixo Strata (NO-GO medido em
  gfx803), endurecimento do health-check do llama-swap e limpeza de toda a
  superficie ativa (providers, roteamento, dashboard, skills, manifestos)"
alvo: Site + ecossistema ~/.gemini
status: ativo
autor: Devin (SWE-2 Flash) [Tier 1]
criado_em: "2026-11-13"
verificado:
  - "Goldfish review 5 fases concluido; relatorio em
    reports/reviews/goldfish_review_20261113.md"
  - "Upstream C:\\Users\\rapha\\Strata v0.1.39 inspecionado: sem Vulkan, alvo
    CUDA/HIP 12GB+ VRAM, Polaris/gfx803 sem suporte -- contradiz a documentacao
    anterior"
  - "Provider/roteamento Strata removidos de llm/providers.py,
    llm/orchestrator.py, llm/routing.py e engine/llm_api.py; nomes legados
    strata* caem no Ollama e falham de forma honesta (engine/llm_api.py:641)"
  - "llama_server_online() em llm/system2_local.py agora exige identidade via
    GET /v1/models com modelo qwen* -- backend estranho na :8080 nao e mais
    classificado como llama.cpp"
  - "Superficie ativa limpa: nexus.py (comando ops strata, atalho x, sonda de
    servico), get_dashboard_telemetry.py, Start-NexusDashboard.ps1,
    dashboard.ps1, nexus.ps1, docs, Setup-NexusProfile.ps1, skills.json,
    agents_manifest.json, chico.md, timesfm SKILL.md, tests"
  - "Delecao fisica: llm/strata_client.py, scripts/ops/strata_local_node.py,
    .agents/skills/strata-inference-engine/, tests/test_strata_client.py"
  - "Quarentena externa: ~/.gemini/quarantine/strata-retired-2026-11-13/ recebeu
    Start-StrataNode.ps1 e strata-config.template.json"
  - "engine_capabilities.json: referencia orfa avalon-strata substituida por
    limitacao neutra; eixo llama-cpp-vulkan permanece canonico e medido"
  - "Verificacao: ruff All checks passed; pyright 0 erros nos 7 arquivos
    tocados; pytest focado 213 passed (cli_nexus, governanca_skills,
    antigravity_bridge, roteamento, system2_local, llm_layer, routing_policy,
    task_routing); smoke de roteamento confirma qwen3.8:27b -> ollama, strata*
    -> ollama (falha honesta), qwen2.5-coder:1.5b -> local_llama"
nao_verificado:
  - "C:\\Users\\rapha\\Strata (clone upstream) nao foi alterado; recebeu apenas
    .markdownlint.json local para silenciar MD033 do README upstream"
  - "Execucao real do tier moe via llama-swap :8080 nao foi exercitada nesta
    sessao (servico pode estar offline; health-check novo nao foi testado contra
    backend vivo)"
  - "Registros historicos que citam Strata (RECORD_INDEX, REGISTRO-2026-10-*,
    RELATORIO_IMPACTO_*) foram mantidos como trilha de auditoria imutavel; a
    aposentadoria esta registrada neste handoff e no goldfish report"
referencias_nao_resolviveis:
  - llm/strata_client.py
  - scripts/ops/strata_local_node.py
  - .agents/skills/strata-inference-engine/SKILL.md
  - tests/test_strata_client.py
  - scripts/ops/Start-StrataNode.ps1
revisoes_de_ancora:
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - engine/llm_api.py
      - llm/orchestrator.py
      - llm/routing.py
      - scripts/cli/nexus.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
    caminhos:
      - llm/routing.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-09-04-credenciais-submodulos-e-adaptador-hrc
    caminhos:
      - data/agents_manifest.json
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
    caminhos:
      - data/engine_capabilities.json
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - scripts/cli/nexus.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - scripts/cli/nexus.py
      - scripts/ops/get_dashboard_telemetry.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-09-19-warning-sem-backtracking
    caminhos:
      - scripts/cli/nexus.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - llm/orchestrator.py
      - scripts/cli/nexus.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
    caminhos:
      - .claude/agents/chico.md
      - data/agents_manifest.json
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - engine/llm_api.py
      - llm/orchestrator.py
      - llm/routing.py
      - scripts/cli/nexus.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-01-integracao-cloud-ollama-hermes-nous-e-chaves-registro
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-01-resiliencia-servidores-locais-e-triagem
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
    caminhos:
      - .claude/agents/chico.md
      - data/agents_manifest.json
      - docs/SCRIPTS_E_COMANDOS_DASHBOARD.md
      - engine/llm_api.py
      - scripts/cli/nexus.py
      - scripts/ops/Start-NexusDashboard.ps1
      - scripts/ops/get_dashboard_telemetry.py
      - scripts/setup/Setup-NexusProfile.ps1
      - tests/test_cli_nexus.py
    parecer:
      "Eixo Strata aposentado neste commit: provider, estrategia, cliente, shim,
      skill e comandos de dashboard removidos; upstream v0.1.39 medido NO-GO em
      gfx803 (sem Vulkan, alvo CUDA/HIP 12GB+). O registro permanece como trilha
      historica da integracao; nao descreve mais o estado vigente -- fonte de
      verdade atual: REGISTRO-2026-11-12-arquitetura-s1-s2-llama-vulkan."
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-08-skill-sota-server-lifecycle-warmup
    caminhos:
      - .claude/agents/chico.md
      - data/agents_manifest.json
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-09-auditoria-governanca-e-remediacao-sota-v8-gold
    caminhos:
      - docs/SCRIPTS_E_COMANDOS_DASHBOARD.md
      - scripts/routines/invoke_scripts_dashboard.ps1
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-10-evolucao-malha-agentica-sota-v8-gold
    caminhos:
      - .agents/skills.json
      - llm/orchestrator.py
      - llm/providers.py
      - llm/routing.py
      - tests/test_governanca_skills.py
    parecer:
      "Revisado contra o diff: o provider strata foi removido neste commit
      (aposentadoria do eixo, NO-GO gfx803). O atestado do registro permanece
      valido para o restante do seu escopo declarado (subagentes Ollama, higiene
      de constantes)."
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - llm/orchestrator.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - scripts/ops/get_dashboard_telemetry.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-19-resolucao-sonarqube-nexus-mesh-e-logger
    caminhos:
      - tests/test_cli_nexus.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
    caminhos:
      - scripts/cli/nexus.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
    caminhos:
      - .agents/skills/timesfm-forecasting/SKILL.md
      - scripts/cli/nexus.py
      - scripts/setup/Setup-NexusProfile.ps1
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos:
      - data/agents_manifest.json
      - engine/llm_api.py
      - llm/routing.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
    caminhos:
      - docs/SCRIPTS_E_COMANDOS_DASHBOARD.md
      - scripts/cli/nexus.py
      - scripts/routines/invoke_scripts_dashboard.ps1
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - llm/routing.py
      - tests/test_governanca_skills.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - engine/llm_api.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - .claude/agents/chico.md
      - data/agents_manifest.json
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota
    caminhos:
      - .agents/skills.json
      - .agents/skills/timesfm-forecasting/SKILL.md
      - data/agents_manifest.json
      - tests/test_governanca_skills.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - .agents/skills/timesfm-forecasting/SKILL.md
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - data/agents_manifest.json
      - tests/test_governanca_skills.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - scripts/cli/nexus.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - llm/local_engine_client.py
      - llm/providers.py
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
    caminhos:
      - llm/antigravity_sdk_bridge.py
      - scripts/cli/nexus.py
      - scripts/setup/Setup-NexusProfile.ps1
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - data/agents_manifest.json
    parecer:
      "Revisado contra o diff deste commit: o caminho foi tocado pela
      aposentadoria do eixo Strata (NO-GO medido em gfx803; ver
      reports/reviews/goldfish_review_20261113.md e HANDOFF-2026-11-13) ou por
      limpeza de superficie ativa correlata. A alteracao nao invalida o atestado
      do registro, que permanece valido para o seu escopo declarado."
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - reports/REGISTRO-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject.md
    parecer:
      "Revisado: o caminho ancorado (registro historico de 2026-11-07) recebeu
      apenas o campo referencias_nao_resolviveis no frontmatter, declarando os
      arquivos Strata removidos neste commit. Nenhuma afirmacao do registro foi
      alterada; o atestado permanece valido."
pendencias: []
referencias:
  - review: reports/reviews/goldfish_review_20261113.md
  - registro: reports/REGISTRO-2026-11-12-arquitetura-s1-s2-llama-vulkan.md
  - registro: reports/REGISTRO-2026-10-06-strata-moe-125b-e-dashboard-nexus.md
---

# HANDOFF — Aposentadoria do eixo Strata e fecho de sessao (2026-11-13)

## O que aconteceu

Sessao conduzida por **Devin (SWE-2 Flash) [Tier 1]** (veiculo `devin-desktop`,
supervisao assistida) em duas etapas:

1. **Auditoria Goldfish** do ecossistema llama.cpp/Strata/Avalon via protocolo
   `egm-review` (5 fases, subagentes stateless read-only). Veredito: a
   arquitetura documentada era materialmente inconsistente -- llama.cpp Vulkan
   via llama-swap e a unica via medida e funcional no hardware (RX 570 Polaris
   gfx803, 8 GB VRAM); Strata declarava capacidades Vulkan/hybrid inexistentes
   no upstream e colidia na porta 8080 com o llama-swap; o shim Python podia
   fabricar respostas e telemetria apresentando-se como "Strata MoE 125B".
   Relatorio completo: `reports/reviews/goldfish_review_20261113.md`.

2. **Remediacao aprovada pelo Tier 0** ("Todas as recomendacoes estao
   aprovadas"): remocao do provider/roteamento Strata do caminho quente, limpeza
   de toda a superficie ativa e delecao fisica dos artefatos com quarentena
   externa dos arquivos fora do repo.

## Estado final da arquitetura de inferencia local

| Componente                                       | Estado                                | Porta           |
| :----------------------------------------------- | :------------------------------------ | :-------------- |
| llama-swap v272 (proxy OpenAI-compatible)        | canonico, medido ~13.45 t/s draft-mtp | 127.0.0.1:8080  |
| llama-server Vulkan b12292 (Qwen3.6-35B-A3B-MTP) | sob demanda via llama-swap / direto   | :9931           |
| Ollama (tiers fast/balanced/deep/code)           | ativo                                 | 127.0.0.1:11434 |
| Strata / shim / skill                            | **aposentados** (NO-GO gfx803)        | --              |

Proveniencia: `meta.engine = "llama-cpp-vulkan"` so e emitido apos geracao real
via `/v1/chat/completions`; `llama_server_online()` exige `/v1/models` com
modelo `qwen*`, impedindo que um backend estranho na :8080 seja classificado
como llama.cpp.

## Correcao de roteamento relevante

Antes da remediacao, `qwen3.8:27b` (modelo Ollama System-2) era capturado pelo
filtro `"qwen3.8" in model_l` e roteado para o provider Strata na :8080. Agora
resolve para `('ollama', 'qwen3.8:27b')`. Nomes legados `strata*` resolvem para
Ollama e falham de forma honesta em vez de rotear para a porta errada.

## Backups e reversao

- Git: todos os arquivos deletados sao recuperaveis via historico (`git log`).
- Quarentena externa (nao versionada):
  `C:\Users\rapha\.gemini\quarantine\strata-retired-2026-11-13\` contem
  `Start-StrataNode.ps1` e `strata-config.template.json`.
- Upstream `C:\Users\rapha\Strata` intacto (clone git limpo + .markdownlint.json
  local nao commitado).

## Avaliacao factual de impacto da sessao

Saida de `python scripts/ops/avaliar_impacto_sessao.py --markdown` (medida
quantitativa agnostica; nao e metrica causal de toda a sessao, e o painel
canonico do ecossistema no fechamento):

| Metrica de Impacto               | Valor Medido                           | Status / Observacao                                                                         |
| :------------------------------- | :------------------------------------- | :------------------------------------------------------------------------------------------ |
| **Economia de Tokens MCP (S1)**  | **-61.03%**                            | Telemetria viva da sessao (16 chamadas reais) (overhead: 496.0 us)                          |
| **Ingress Fast-Path S1**         | **0.6828 ms** (682.8 us)               | Triagem O(1) de tarefas sem compilar grafo                                                  |
| **Passivo de Pendencias**        | **1 abertas** (reducao: 0.0%)          | Resolucao formal via M.O. 13.F                                                              |
| **Integridade do Ledger**        | **91 registros** (tail: `bfb33070`)    | Portao acumulado: 0 sessoes                                                                 |
| **Resolucao de Tarefas SQLite**  | **100.0%** (0/0)                       | 0 pendencias residuais ou falhas                                                            |
| **Pools OpenRouter Multi-Tier**  | **21 chaves** (21 ativas, score: 80.0) | T1: 4 \| T2: 7 \| T3: 5 \| T4: 5 (0 bloq / 0 rev)                                           |
| **Eficiencia Economica & Infra** | **0 cloud / 16 locais**                | Cotas Pro Tier 1 prioritarias (Faixa.FLAT_FEE); Mitigacao ativa de custos de servidores     |
| **Memoria Agentica Local**       | **49 notas** (site: 47)                | Analogo ao Devin Memory/Dreaming; repo ~/.gemini/memoria: 1 dirty, ultimo commit 2026-11-13 |

Pendencia viva pre-existente (nao desta sessao):
`pend-2026-11-12-ollama-cloud-credits` -- billing Ollama Cloud (HTTP 402), dono
Tier 0, prazo 2026-11-26. Declarada em
`reports/HANDOFF-2026-11-12-supabase-mcp-mesh-e-oauth.md`.

## Aprendizados reutilizaveis (memoria)

Registrados em `memory/strata-retirement-2026-11-13.md`:

1. Health-check por status HTTP nao prova identidade de backend; exigir marcador
   de modelo/versao (`/v1/models` + prefixo esperado) antes de classificar um
   servico local.
2. Filtro de roteamento por substring de modelo (`"qwen3.8" in model_l`) captura
   modelos homonimos de outros providers; provider local deve ser opt-in
   explicito, nunca inferido por nome.
3. Shim "API-compatible" que delega a outro backend ou fabrica resposta e risco
   de proveniencia: telemetria e `meta.engine` devem refletir o motor real,
   nunca o rotulo configurado.

## Proximo passo util

Quando o llama-swap estiver no ar, exercitar o tier `moe` de
`llm/system2_local.py` uma vez para validar o novo health-check de identidade
contra backend vivo (`/v1/models` deve listar `qwen-moe` /
`qwen3.6-35b-a3b-mtp`). Nao verificado nesta sessao.
