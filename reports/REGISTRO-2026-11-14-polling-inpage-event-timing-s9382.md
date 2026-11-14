---
id: registro-2026-11-14-polling-inpage-event-timing-s9382
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-14T09:55:00-03:00'
atualizado_em: '2026-11-14T09:55:00-03:00'
classes:
- interno
- medido
- governanca
config_medida:
  congelada_em: '2026-11-14'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-14'
  regra_sonarlint: javascript:S9382
caminhos:
- scripts/ops/runtime_quality_probe.mjs
revisoes_de_ancora:
- registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
  caminhos:
  - scripts/ops/runtime_quality_probe.mjs
  parecer: 'Reconciliacao SOTA: substituicao do laco while com await por uma unica Promise in-page via runtimeValue preservando integracao CDP e comportamento da sonda.'
- registro: auditoria-2026-09-23-calibracao-terra-e-gate-cwv
  caminhos:
  - scripts/ops/runtime_quality_probe.mjs
  parecer: 'Reconciliacao SOTA: OBSERVED_EVENT_LATENCY_MS permanece diagnostico ([OBSERVED], sem certificar INP humano), com contratos validados nos 32 casos de test_cwv_gate_truthfulness.py + test_probe_fronteira_da_extensao.py.'
- registro: registro-2026-09-09-o-axe-mede-extensao-de-navegador
  caminhos:
  - scripts/ops/runtime_quality_probe.mjs
  parecer: 'Reconciliacao SOTA: EXTERNOS (tinamind-app) e excludedRoots mantidos inalterados e validados em test_probe_fronteira_da_extensao.py.'
- registro: registro-2026-09-10-o-portao-que-media-a-tela-de-erro-do-chrome
  caminhos:
  - scripts/ops/runtime_quality_probe.mjs
  parecer: 'Reconciliacao SOTA: travas de origem, #main-frame-error e navegacao mantidas intactas.'
- registro: registro-2026-11-14-cobertura-integral-event-timing-e-axe-dom
  caminhos:
  - scripts/ops/runtime_quality_probe.mjs
  parecer: 'Reconciliacao SOTA: eliminado await em laco (SonarLint javascript:S9382) mantendo janela maxima de 1500ms em polling de 60ms dentro da pagina e observacao real de eventLatencyMs.'
verificado:
  - Execucao direta de node scripts/ops/runtime_quality_probe.mjs contra http://127.0.0.1:9223 e http://localhost:3000/ retornou exit 0 com eventLatencyMs 24ms e 0 violacoes axe
  - Suite test_probe_fronteira_da_extensao.py + test_cwv_gate_truthfulness.py aprovada com 32/32 testes verdes e 0 warnings
  - npx eslint --no-ignore scripts/ops/runtime_quality_probe.mjs aprovado com exit 0 e 0 erros
nao_verificado:
  - Execucao remota de GitHub Actions apos o push em origin/master
  - Pendencia externa de faturamento pend-2026-11-12-ollama-cloud-credits (dono Tier 0)
---
# Eliminacao de await em Laco (SonarLint javascript:S9382) em runtime_quality_probe.mjs

## 1. Alteracao e Evidencia

1. **[`scripts/ops/runtime_quality_probe.mjs`](file:///c:/Users/rapha/.gemini/Site/scripts/ops/runtime_quality_probe.mjs#L240-L259):** Substituido o laco `while (Date.now() < prazo)` que executava `await runtimeValue(...)` e `await new Promise(...)` por uma unica chamada `await runtimeValue(...)` com `Promise` executada no contexto da pagina (`setInterval` de 60ms com teto de 1500ms).
2. **Beneficio tecnico:** Elimina o achado SonarLint `javascript:S9382` ("Unexpected `await` inside a loop") e reduz roundtrips CDP durante a coleta de Event Timing.
