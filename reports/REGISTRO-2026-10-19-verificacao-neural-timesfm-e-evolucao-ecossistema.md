---
id: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
tipo: registro
escopo: Site -- verificacao real da inferencia neural de pesos TimesFM 2.5/3.0, suporte a covariantes, novas funcoes de dominio (ICM, telemetria, EV gap), CLI Typer e adaptador PowerShell
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-19T05:38:00-03:00'
atualizado_em: '2026-10-19T05:38:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, timesfm, ml, agentic]
caminhos:
  - .agents/skills/timesfm-forecasting/SKILL.md
  - api/v1/handlers.py
  - engine/timesfm_engine.py
  - reports/REGISTRO-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema.md
  - scripts/cli/nexus.py
  - scripts/ops/Invoke-AgentCalibrationQuantitativeSupport.ps1
  - scripts/setup/Setup-NexusProfile.ps1
  - tests/fixtures/nexus_profile_template.ps1
  - tests/test_timesfm_agent_calibration.py
  - tests/test_timesfm_engine.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: cadcf1cd-aadb-4958-851b-1635090658fe
  session_started_at: '2026-10-19T03:00:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-19
verificado:
  - "Inferencia neural direta comprovada com pesos do google/timesfm-2.5-200m-pytorch via safetensors local"
  - "Correcao critica de ordenacao de quantis do TimesFM 2.5 (coluna 0 media, coluna 1 q10, coluna 9 q90)"
  - "Bloqueio estrito de governanca TimesFM 3.0 sob TimesFMGovernanceError em modo comercial preservado"
  - "Adicao de previsao com covariantes passadas e futuras (forecast_with_covariates)"
  - "Criacao de funcoes de dominio especializadas: forecast_tournament_icm_decay, forecast_mesh_telemetry_latency, forecast_ev_variance_envelope"
  - "Comandos CLI no Nexus Typer: nexus timesfm forecast, benchmark, icm, telemetry, ev-gap e --use-weights em agent calibration-forecast"
  - "Adaptador PowerShell Invoke-AgentCalibrationQuantitativeSupport.ps1 expandido com switch -UsePretrainedWeights"
  - "Harmonizacao do roteador de perfil PowerShell em Setup-NexusProfile.ps1 e nexus_profile_template.ps1 com 7/7 testes em test_roteamento_perfil.py"
  - "Atualizacao completa do runbook canonico Site/.agents/skills/timesfm-forecasting/SKILL.md"
  - "39/39 testes aprovados em 14.48s (Zero Erros, Zero Warnings, Homeostase Total)"
nao_verificado:
  - "Download sob demanda de checkpoints externos do HuggingFace (proibido em pre-flight; apenas local_files_only=True permitido)"
revisoes_de_ancora:
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - api/v1/handlers.py
    parecer: >-
      Revisado em 2026-10-19. Rota de previsao temporal de covariantes do TimesFM integrada hermeticamente sem afetar integridade do backend aiohttp.
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Revisado em 2026-10-19. Comandos timesfm e flag --use-weights integrados no Nexus CLI mantendo total compatibilidade e paridade com catalogo de modelos.
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - api/v1/handlers.py
    parecer: >-
      Revisado em 2026-10-19. Integracao de covariantes passadas e futuras no handler handle_timesfm_forecast em total conformidade com a tipagem estrita.
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Revisado em 2026-10-19. Expansao do comando nexus timesfm icm e formatacao de tabela mantendo zero duplicacao e regras do Sonar.
  - registro: registro-2026-09-19-warning-sem-backtracking
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Revisado em 2026-10-19. Comandos adicionados sem retrocesso em sanitizacoes anteriores do Typer.
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Revisado em 2026-10-19. Nexus CLI atualizado preservando os contratos de modelos ativos do coletivo CHICO e adicionando timesfm.
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - api/v1/handlers.py
    parecer: >-
      Revisado em 2026-10-19. Handlers da API v1 preservam metricas de correlacao HTTP e suporte gracioso de desligamento.
  - registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
    caminhos:
      - scripts/cli/nexus.py
      - scripts/setup/Setup-NexusProfile.ps1
    parecer: >-
      Revisado em 2026-10-19. Comandos timesfm e monitoramento de pesos integrados preservando telemetria e dashboard Nexus; roteador de perfil harmonizado para despachar timesfm ao Typer.
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - api/v1/handlers.py
    parecer: >-
      Revisado em 2026-10-19. Contratos da rota TimesFM consolidados com validacao de schema Pydantic.
---

# REGISTRO: Verificacao Neural do Google TimesFM (2.5 & 3.0), Covariantes e Evolucao de Dominio

## Contexto e Motivacao
O Tier 0 solicitou a verificacao formal da inferencia neural direta com pesos do modelo
`google/timesfm-2.5-200m-pytorch`, auditando a operacao conjunta das versoes 2.5 (comercial Apache 2.0)
e 3.0 (pesquisa nao comercial), corrigindo falhas de quantis, ampliando funcoes de dominio
e harmonizando os adaptadores do ecossistema.

## Acoes Executadas
1. Inferencia Neural Direta:
   - Carregamento local via safetensors verificado com sucesso sem acesso externo a rede.
   - Correcao da selecao de quantis no shape (horizon, 10): coluna 0 media, coluna 1 q10, coluna 9 q90.
   - Ativacao de suporte a TimesFM 3.0 em modo pesquisa via TimesFM3Forecaster.
2. Expansao de Dominio:
   - forecast_tournament_icm_decay: Pressao estocastica de ICM e decaimento de bolha.
   - forecast_mesh_telemetry_latency: Latencia e deteccao preventiva de spike na malha.
   - forecast_ev_variance_envelope: Envelope de dispersao entre EV teorico e resultado real.
   - forecast_with_covariates: Condicionamento temporal com covariantes passadas e futuras.
3. Interfaces de Operacao:
   - Nexus CLI: Subcomandos nexus timesfm forecast, benchmark, icm, telemetry, ev-gap e --use-weights.
   - PowerShell: Switch -UsePretrainedWeights em Invoke-AgentCalibrationQuantitativeSupport.ps1.
   - Skill Canonica: Documentacao completa em Site/.agents/skills/timesfm-forecasting/SKILL.md.
4. Validacao:
   - 39 testes aprovados (Zero Erros, Zero Warnings, Homeostase Total).
