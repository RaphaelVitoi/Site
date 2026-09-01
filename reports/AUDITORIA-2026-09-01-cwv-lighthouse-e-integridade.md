---
id: auditoria-cwv-lighthouse-2026-09-01
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: codex@gpt-5
criado_em: 2026-09-01T04:10-03:00
atualizado_em: 2026-09-01T04:10-03:00
commit_inicio_auditoria: 26b9b6ab6625c6410b475901cf807d17c61c2c56
classes: [interno, medido, release]
caminhos:
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/lighthouse_cwv_audit.mjs
  - scripts/ops/invoke_lighthouse_production_audit.ps1
  - tests/test_cwv_gate_truthfulness.py
  - package.json
  - package-lock.json
  - frontend/src/app/(public)/page.tsx
  - .vscode/settings.json
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  origem: origin/master
  alvo_lighthouse: http://127.0.0.1:3100/
  cdp_runtime: 127.0.0.1:9223
  tbt_lighthouse_ms: 0
  lcp_lighthouse_ms: 404.442
  cls_lighthouse: 0
  performance_score: 1.0
  cwv_gate_status: SUCESSO_VERDE
verificado:
  - build de producao Next concluido com exit 0
  - Lighthouse executado em Chrome efemero, loopback, sem extensoes e com GPU preservada
  - fingerprint SHA-256 do frontend conferido pelo gate antes da certificacao
  - runtime CDP real, axe-core, npm audit, SRI, higiene LFS e compatibilidade PowerShell 5.1 executados
  - 17 testes focados de verdade do gate, Lighthouse e revisao A11y aprovados
  - Jest frontend aprovado com 23 suites e 111 testes
nao_verificado:
  - suite Python integral permanece fora do veredito desta auditoria por apresentar erros sensiveis a ordem/estado em execucao anterior
  - os dois HTTP 401 do dashboard durante prerender nao foram alterados nesta rodada
  - o GitHub Actions continua condicionado ao ticket de billing #4716843
supersede: null
---

# Auditoria de CWV Lighthouse e integridade de release

## Veredicto

O portao local passou nas cinco fases, sem bypass: **0 erros e 0 avisos**.
O TBT deixou de ser uma lacuna porque agora provem de uma coleta Lighthouse
reexecutavel, vinculada ao fingerprint do frontend e realizada em navegador
isolado. INP continua explicitamente identificado como observacao humana
controlada; nao foi inferido a partir de long tasks ou do resumo do DevTools.

## Evidencia e limites

O artefato bruto esta em `reports/cwv/latest_lighthouse_production.json` e o
resumo do gate em `reports/cwv/cwv_report_20260901_040933.md`. O build ainda
registra HTTP 401 nas consultas de Telemetry SOTA e Predictive SOTA durante a
geracao de `/dashboard`; isso nao derrubou a build, mas permanece pendencia
funcional separada. Nenhum resultado de Actions foi usado como evidencia porque
o bloqueio de billing pertence ao estado da conta GitHub.

## Registro de ancora

Os registros historicos atingidos nesta rodada receberam uma revisao de ancora
resolvivel por este `id`. A revisao delimita o efeito ao baseline atual e nao
reclassifica conclusoes ou metricas de suas janelas originais.
