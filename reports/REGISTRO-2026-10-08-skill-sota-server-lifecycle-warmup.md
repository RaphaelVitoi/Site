---
id: registro-2026-10-08-skill-sota-server-lifecycle-warmup
tipo: registro
escopo: Site -- registro e reconciliacao de ancoras para criacao da skill sota-server-lifecycle-warmup e orchestrator de subida e aquecimento de servidores fullstack
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-08T09:12:00-03:00'
atualizado_em: '2026-10-08T09:12:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, devops, skills]
caminhos:
  - .agents/skills/sota-server-lifecycle-warmup/SKILL.md
  - .claude/agents/chico.md
  - data/agents_manifest.json
  - reports/REGISTRO-2026-10-08-skill-sota-server-lifecycle-warmup.md
  - scripts/ops/Invoke-SotaServerLifecycle.ps1
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 57837783-c14a-4c40-bae7-8b755005dc09
  session_started_at: '2026-10-08T06:17:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-08
verificado:
  - "criacao da skill canonica .agents/skills/sota-server-lifecycle-warmup/SKILL.md com runbook completo em 5 fases"
  - "criacao do orchestrator automatizado scripts/ops/Invoke-SotaServerLifecycle.ps1 com medicao de TTFB e payload"
  - "declaracao de capacidade no manifesto data/agents_manifest.json e sincronizacao de .claude/agents/chico.md"
  - "aprovacao integral da suite de governanca tests/test_governanca_skills.py com 10/10 testes verdes"
  - "reconciliacao formal de ancoras para registro-2026-09-25-teto-de-commits-e-push-obrigatorio e registro-2026-10-06-strata-moe-125b-e-dashboard-nexus"
nao_verificado:
  - "inicializacao em sistemas com portas restritas por politicas empresariais de firewall"
revisoes_de_ancora:
  - registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
    caminhos:
      - .claude/agents/chico.md
      - data/agents_manifest.json
    parecer: >-
      Revisado em 2026-10-08. Manifesto e documentacao sincronizados para inclusao da skill sota-server-lifecycle-warmup preservando a governanca de tetos de commits.
  - registro: registro-2026-10-06-strata-moe-125b-e-dashboard-nexus
    caminhos:
      - .claude/agents/chico.md
      - data/agents_manifest.json
    parecer: >-
      Revisado em 2026-10-08. Identidade e capacidades do agente chico atualizadas com a nova skill de ciclo de vida de servidores preservando os contratos do Strata MoE.
---

# Registro Oficial — Skill SOTA Server Lifecycle & Warmup Orchestrator

## 1. Contexto e Motivação
A governança e automação da subida, compilação de produção e aquecimento dos servidores exigem um runbook unificado e um comando 1-click. Foi criada a skill `.agents/skills/sota-server-lifecycle-warmup/` acompanhada do script PowerShell `scripts/ops/Invoke-SotaServerLifecycle.ps1` para padronizar e blindar este processo.

## 2. Escopo de Alterações
- Criação de `.agents/skills/sota-server-lifecycle-warmup/SKILL.md`.
- Implementação de `scripts/ops/Invoke-SotaServerLifecycle.ps1`.
- Atualização e sincronização fractal de `data/agents_manifest.json` e `.claude/agents/chico.md`.
- Reconciliação formal de âncoras ativas.
