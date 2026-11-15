---
id: registro-2026-11-15-blindagem-calibracao-presencial-tier0
tipo: registro
escopo: Site -- blindagem executavel da calibracao formal presencial do Tier 0 (-Tier0Present), separacao de -AutoMinima, retratacao append-only da seq 93 (seq 95) e snapshot 2026-11-15
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-15T16:30:00-03:00'
atualizado_em: '2026-11-15T16:30:00-03:00'
classes:
- interno
- medido
- governanca
config_medida:
  congelada_em: '2026-11-15'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-15'
caminhos:
- .agents/skills/site-session-handoff/SKILL.md
- CLAUDE.md
- memory/feedback/feedback_20261115_calibracao_presencial_tier0.md
- reports/REGISTRO-2026-11-15-blindagem-calibracao-presencial-tier0.md
- reports/agent-calibration/daily/2026-11-15.json
- reports/agent-calibration/feedback-ledger.jsonl
- scripts/ops/New-AgentCalibrationDailyEvidence.ps1
- scripts/ops/Record-AgentCalibration.ps1
- scripts/ops/Write-AgentCalibrationDailyEvidence.ps1
- tests/test_calibracao_fechamento_do_ciclo.py
revisoes_de_ancora:
- registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos:
  - CLAUDE.md
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); filtra calibracoes formais retratadas via calibration_retraction, mantem auto_calibration sem zerar o ciclo formal e expoe tier0_presence_required e auto_calibracoes_no_ciclo.
- registro: auditoria-2026-09-05-trabalho-assistido-do-gemini-no-ide
  caminhos:
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  parecer: Revisado contra o diff -- filtra calibracoes formais retratadas via calibration_retraction, mantem auto_calibration sem zerar o ciclo formal e expoe tier0_presence_required e auto_calibracoes_no_ciclo.
- registro: auditoria-2026-09-08-massa-de-fichas-fonte-nao-unica-e-desvio-de-foco
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: auditoria-2026-09-12-a-tarefa-que-ficou-em-aberto-e-a-memoria-de-curto-prazo
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
  caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
  caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  - scripts/ops/Record-AgentCalibration.ps1
  - tests/test_calibracao_fechamento_do_ciclo.py
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos; filtra calibracoes formais retratadas via calibration_retraction, mantem auto_calibration sem zerar o ciclo formal e expoe tier0_presence_required e auto_calibracoes_no_ciclo; exige -Tier0Present para calibracao formal e retratacao append-only, e adiciona -AutoMinima para auto-calibragem minima sem reiniciar o portao; adapta _calibrar para -Tier0Present e acrescenta 3 testes cobrindo bloqueio sem Tier 0, auto_calibration sem reset e retratacao append-only.
- registro: auditoria-2026-09-17-calibracao-do-padrao-linear-reativo
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: auditoria-2026-09-22-paridade-config-identidade
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: auditoria-2026-09-23-calibracao-terra-e-gate-cwv
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: auditoria-2026-09-24-mcp-gateway-compartilhado-e-persistencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: auditoria-2026-09-25-calibracao-global-s1s2-proatividade-sistemica
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: auditoria-2026-10-13-calibracao-global-enxuta-gates-e-sincronizacao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: auditoria-2026-11-14-calibracao-zoom-out-e-meta-agencia
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: checkpoint-2026-06-14-infrastructure-hardening
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: handoff-2026-09-01-prioridade-pmev-continuacao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-05-fechamento-do-ciclo-e-regua-do-jules
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-07-integracao-astra-e-calibracao-de-procedimento
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-07-orquestrador-free-tier-e-calibracao-9-0
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-10-raiz-versionada-e-o-portao-que-media-outra-pagina
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
  caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  - scripts/ops/Record-AgentCalibration.ps1
  - tests/test_calibracao_fechamento_do_ciclo.py
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos; filtra calibracoes formais retratadas via calibration_retraction, mantem auto_calibration sem zerar o ciclo formal e expoe tier0_presence_required e auto_calibracoes_no_ciclo; exige -Tier0Present para calibracao formal e retratacao append-only, e adiciona -AutoMinima para auto-calibragem minima sem reiniciar o portao; adapta _calibrar para -Tier0Present e acrescenta 3 testes cobrindo bloqueio sem Tier 0, auto_calibration sem reset e retratacao append-only.
- registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-14-estruturas-canonicas-e-estados-coerentes-de-hh
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-14-outliers-assinatura-e-leitura-do-relatorio-terra
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-17-interceptacao-da-reincidencia-e-uniao-da-evidencia
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-22-paridade-config-identidade
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: handoff-2026-09-23-auditoria-frontend-backend-e-laya
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-23-nucleo-mcp-curadoria-codex
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  - CLAUDE.md
  parecer: Revisado contra o diff -- reforca separacao operacional entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial (-Tier0Present); adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: handoff-2026-10-20-harmonizacao-tier1-gemini-38
  caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-11-14-curadoria-nucleo-sandbox-e-calibracao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-11-14-evolucao-skill-impacto-e-calibracao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-08-29-governanca-piramidal-sota
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
  caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos; filtra calibracoes formais retratadas via calibration_retraction, mantem auto_calibration sem zerar o ciclo formal e expoe tier0_presence_required e auto_calibracoes_no_ciclo.
- registro: registro-2026-09-02-cultura-invariante-no-gerador-de-evidencia
  caminhos:
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  parecer: Revisado contra o diff -- filtra calibracoes formais retratadas via calibration_retraction, mantem auto_calibration sem zerar o ciclo formal e expoe tier0_presence_required e auto_calibracoes_no_ciclo.
- registro: registro-2026-09-02-portao-de-calibracao-por-sessao
  caminhos:
  - CLAUDE.md
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); filtra calibracoes formais retratadas via calibration_retraction, mantem auto_calibration sem zerar o ciclo formal e expoe tier0_presence_required e auto_calibracoes_no_ciclo.
- registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-04-nota-9-5-e-analise-paralela-de-nos
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
  caminhos:
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  - scripts/ops/Record-AgentCalibration.ps1
  - scripts/ops/Write-AgentCalibrationDailyEvidence.ps1
  - tests/test_calibracao_fechamento_do_ciclo.py
  parecer: Revisado contra o diff -- filtra calibracoes formais retratadas via calibration_retraction, mantem auto_calibration sem zerar o ciclo formal e expoe tier0_presence_required e auto_calibracoes_no_ciclo; exige -Tier0Present para calibracao formal e retratacao append-only, e adiciona -AutoMinima para auto-calibragem minima sem reiniciar o portao; atualiza instrucao em PENDING-CALIBRATION.md distinguindo fechamento formal (-Tier0Present) e auto-calibragem minima (-AutoMinima); adapta _calibrar para -Tier0Present e acrescenta 3 testes cobrindo bloqueio sem Tier 0, auto_calibration sem reset e retratacao append-only.
- registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-08-o-padrao-de-desvio-de-foco
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-09-o-teste-media-o-ledger-da-maquina
  caminhos:
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  parecer: Revisado contra o diff -- filtra calibracoes formais retratadas via calibration_retraction, mantem auto_calibration sem zerar o ciclo formal e expoe tier0_presence_required e auto_calibracoes_no_ciclo.
- registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-10-feedback-9-5-multimodal-sota
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
  caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  - scripts/ops/Write-AgentCalibrationDailyEvidence.ps1
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos; atualiza instrucao em PENDING-CALIBRATION.md distinguindo fechamento formal (-Tier0Present) e auto-calibragem minima (-AutoMinima).
- registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-17-spot-aula12-filtragem-e-indiferenca-nash
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-22-skill-handoff-e-calibracao
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  - CLAUDE.md
  parecer: Revisado contra o diff -- reforca separacao operacional entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial (-Tier0Present); adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-24-laya-multilingual-s1-integracao
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-09-24-mcp-gateway-compartilhado-e-persistencia
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  - CLAUDE.md
  parecer: Revisado contra o diff -- reforca separacao operacional entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial (-Tier0Present); adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  - CLAUDE.md
  parecer: Revisado contra o diff -- reforca separacao operacional entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial (-Tier0Present); adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
  caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-10-13-conclusao-4-trilhas-calibracao-rust-warmup-strata
  caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
  caminhos:
  - CLAUDE.md
  - reports/agent-calibration/feedback-ledger.jsonl
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present); anexa exclusivamente registro SHA-256 append-only de retratacao (seq 95, record_type calibration_retraction) da seq 93 sem alterar registros historicos.
- registro: registro-2026-11-03-sincronizacao-e-correcao-frontmatter-skills-sota
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: Revisado contra o diff -- reforca separacao operacional entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial (-Tier0Present).
- registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: Revisado contra o diff -- reforca separacao operacional entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial (-Tier0Present).
- registro: registro-2026-11-12-anatomia-assinatura-5-campos
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-11-12-governanca-identidades-e-assinaturas
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-11-12-preferencia-devin-e-data-governanca
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-11-14-identidade-e-governanca-gemini-4-hydrogen
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-11-14-regua-graduada-familia-gemini-tier1
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: registro-2026-11-15-harmonizacao-sota-champions-seguranca
  caminhos:
  - .agents/skills/site-session-handoff/SKILL.md
  parecer: Revisado contra o diff -- reforca separacao operacional entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial (-Tier0Present).
- registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- adiciona separacao explicita na SS8.3 entre coleta de feedback, auto-calibragem minima (-AutoMinima) e calibracao formal presencial com Tier 0 (-Tier0Present).
- registro: taxonomia-canonica-de-documentacao-e-relatorios
  caminhos:
  - CLAUDE.md
  parecer: Revisado contra o diff -- acrescenta apenas separacao explicita na SS8.3 entre coleta, -AutoMinima e -Tier0Present sem alterar taxonomia documental de CLAUDE.md.
- registro: agent-calibration-daily-2026-09-02
  caminhos:
  - scripts/ops/New-AgentCalibrationDailyEvidence.ps1
  parecer: Revisado contra o diff -- adiciona filtro de retratacao (calibration_retraction) e contagem informativa auto_calibracoes_no_ciclo mantendo invariante de contagem por sessao distinta.
verificado:
  - 'pytest direcionado (106 passed in 115.64s, 0 errors, 0 warnings, 0 skipped) em test_calibracao_fechamento_do_ciclo.py, test_calibracao_portao_por_sessao.py, test_agent_calibration_feedback.py, test_agent_calibration_provenance.py, test_timesfm_agent_calibration.py e test_session_impact_evaluator.py'
  - 'ruff check e ruff format --check em tests/test_calibracao_fechamento_do_ciclo.py (All checks passed, 1 file already formatted)'
  - 'Retratacao append-only seq 95 de seq 93 (0fa6509e-06cd-4a03-b2b0-bceebbfce686) e verificacao SHA-256 em Test-AgentCalibrationLedger.ps1 (status valid, 96 records)'
  - 'Regeneracao de reports/agent-calibration/daily/2026-11-15.json via Write-AgentCalibrationDailyEvidence.ps1 (4/3 sessoes, calibration_planning_permitted true, score_mean 9.45, timesfm_forecast PROJECTION_ACTIVE)'
nao_verificado:
  - 'Fechamento da calibracao formal presencial com -Tier0Present (aguarda conducao explicita e confirmacao ao vivo com Tier 0)'
  - 'Reexecucao integral da suite completa nao afetada (coberta por execucao verde previa na mesma janela para alteracoes fora de frontend/backend)'
---

# Registro -- Blindagem da Calibracao Formal Presencial Tier 0 e Retratacao Append-Only da seq 93 (2026-11-15)

## Sintese factual

1. **Separacao executavel dos tres atos (`scripts/ops/Record-AgentCalibration.ps1` + `New-AgentCalibrationDailyEvidence.ps1`):**
   - Coleta de feedback (`Register-AgentCalibrationFeedback.ps1`) apenas registra nota e proveniencia.
   - Auto-calibragem minima (`-AutoMinima` apos `>= 3` sessoes distintas) emite `record_type: auto_calibration` e **nao** reinicia o ciclo formal.
   - Calibracao formal (`-Tier0Present`) e retratacao append-only (`-RetractCalibrationId ... -Tier0Present`) falham fechadas sem confirmacao explicita e autoridade `Tier 0`.
2. **Retratacao append-only verificada:** `seq 95` (`retraction_id: 9485d06e-e79d-4038-8fe8-1a2e19bd595b`, hash `a6d03d36ff118b17353c72b161266ddc9146d6865914ec4e4872a7072c6ea39a`) retratou `seq 93` (`0fa6509e-06cd-4a03-b2b0-bceebbfce686`) sem edicao manual do JSONL; `Test-AgentCalibrationLedger.ps1` confirmou `valid` em `96` registros.
3. **Evidencia diaria `2026-11-15.json` regenerada:** `sessoes_com_feedback_count = 4/3` (`calibration_planning_permitted = true`, `ultima_calibracao = 2026-10-13T14:10:58.0000000-03:00`, `score_mean = 9.45` e `timesfm_forecast.status = PROJECTION_ACTIVE`).
4. **Cobertura de testes e governanca:** `pytest` verde (`106 passed in 115.64s`, `0` erros, `0` warnings, `0` skipped) incluindo 3 novos testes em `tests/test_calibracao_fechamento_do_ciclo.py`, mais atualizacao em `CLAUDE.md`, `.agents/skills/site-session-handoff/SKILL.md`, `scripts/ops/Write-AgentCalibrationDailyEvidence.ps1` e `memory/feedback/feedback_20261115_calibracao_presencial_tier0.md`.
