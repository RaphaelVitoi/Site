---
id: registro-2026-11-14-cobertura-integral-event-timing-e-axe-dom
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-14T09:45:00-03:00'
atualizado_em: '2026-11-14T09:45:00-03:00'
classes:
- interno
- medido
- governanca
config_medida:
  congelada_em: '2026-11-14'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: '2026-11-14'
  event_timing_probe_observado: true
  testes_pulados_suite_verde: 0
caminhos:
- scripts/ops/runtime_quality_probe.mjs
- tests/test_ordem_headings.py
revisoes_de_ancora:
- registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
  caminhos:
  - scripts/ops/runtime_quality_probe.mjs
  parecer: 'Reconciliacao SOTA: observer event com durationThreshold 0 mais first-input e despacho de clique CDP em coordenada inerte nao-interativa, preservando ausencia de regressao na integracao e veracidade do diagnostico.'
- registro: auditoria-2026-09-23-calibracao-terra-e-gate-cwv
  caminhos:
  - scripts/ops/runtime_quality_probe.mjs
  parecer: 'Reconciliacao SOTA: OBSERVED_EVENT_LATENCY_MS permanece estritamente diagnostico ([OBSERVED], sem certificar INP humano), com contratos preservados nos 32 casos de test_cwv_gate_truthfulness.py.'
- registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
  caminhos:
  - tests/test_ordem_headings.py
  parecer: 'Reconciliacao SOTA: timeout HTTP de deteccao em _is_service_live ampliado de 4s para 10s sob carga paralela -n 6, eliminando falso skip sem relaxar o fail-closed quando a porta 3000 esta fechada.'
- registro: handoff-2026-11-08-otimizacao-backend-e-integridade-sota
  caminhos:
  - tests/test_ordem_headings.py
  parecer: 'Reconciliacao SOTA: suite_verde.py passa com 0 erros, 0 warnings e 0 testes pulados (incluindo test_o_axe_confirma_a_hierarquia_no_dom nas 6 rotas).'
- registro: registro-2026-09-09-o-axe-mede-extensao-de-navegador
  caminhos:
  - scripts/ops/runtime_quality_probe.mjs
  parecer: 'Reconciliacao SOTA: lista explicita EXTERNOS (tinamind-app) e excludedRoots declarados mantidos intactos e validados em test_probe_fronteira_da_extensao.py.'
- registro: registro-2026-09-10-o-portao-que-media-a-tela-de-erro-do-chrome
  caminhos:
  - scripts/ops/runtime_quality_probe.mjs
  parecer: 'Reconciliacao SOTA: todas as travas de identidade de origem, #main-frame-error e navegacao permaneceram inalteradas.'
- registro: registro-2026-10-26-saneamento-tipagem-linters-e-reconciliacao-de-ancoras
  caminhos:
  - tests/test_ordem_headings.py
  parecer: 'Reconciliacao SOTA: supressor # nosec preservado com tipagem e formatacao ruff integralmente aprovadas.'
- registro: registro-2026-11-08-otimizacao-backend-sonarlint-pyright-e-headings
  caminhos:
  - tests/test_ordem_headings.py
  parecer: 'Reconciliacao SOTA: validacao de heading-order em DOM renderizado mantida integral e executada sem skip no suite_verde.py.'
- registro: registro-2026-11-08-otimizacao-timesfm-zero-skipped-e-headings
  caminhos:
  - tests/test_ordem_headings.py
  parecer: 'Reconciliacao SOTA: tolerancia do probe HTTP ajustada para 10s eliminando o ultimo teste pulado sob xdist -n 6.'
verificado:
  - Observacao nativa de Event Timing em scripts/ops/runtime_quality_probe.mjs -- observer event com durationThreshold 0, observer first-input e despacho de evento pointer inerte em ponto fora de controles interativos
  - Execucao completa de cwv_gate.ps1 com 0 erros, 0 warnings e 0 linhas [N/MED] -- OBSERVED_EVENT_LATENCY_MS e OBSERVED_LONG_TASK_BLOCKING_MS ambos reportados como [OBSERVED]
  - Suite focada test_ordem_headings.py + test_cwv_gate_truthfulness.py + test_probe_fronteira_da_extensao.py aprovada com 37/37 testes verdes
  - Suite completa Python via suite_verde.py aprovada com 0 erros, 0 warnings e 0 testes pulados (incluindo test_o_axe_confirma_a_hierarquia_no_dom)
nao_verificado:
  - Execucao remota de GitHub Actions apos o push do commit atual em origin/master
  - Re-validacao manual em chrome://tracing ou field RUM p75 apos o snapshot humano anterior (INP 16ms/106ms p75 segue sob registro cwv-human-observation-localhost-20260901)
  - Pendencia externa de faturamento pend-2026-11-12-ollama-cloud-credits (dono Tier 0)
---
# Cobertura Integral de Medicao: OBSERVED_EVENT_LATENCY_MS e Zero Testes Pulados em suite_verde

## 1. Alteracoes e Evidencias

1. **[`scripts/ops/runtime_quality_probe.mjs`](file:///c:/Users/rapha/.gemini/Site/scripts/ops/runtime_quality_probe.mjs):** Adicionada observacao `event` com `durationThreshold: 0` mais `first-input` e despacho de clique CDP em coordenada inerte confirmada fora de elementos interativos (`a, button, input, select, textarea, summary, [role="button"], [tabindex]`). Sem interacao humana completa o campo permanece estritamente diagnostico (`[OBSERVED]`, sem certificar INP normativo), mantendo retorno `null` se o navegador nao emitir entrada.
2. **[`tests/test_ordem_headings.py`](file:///c:/Users/rapha/.gemini/Site/tests/test_ordem_headings.py):** Ajustado `timeout=4` para `timeout=10` em `_is_service_live` para evitar falso skip quando o servidor Next.js responde `HEAD /` sob concorrencia dos 6 workers de `suite_verde.py`.
3. **Resultados medidos:** `suite_verde.py` aprovado com `0 Erros, 0 Warnings, 0 Nao Executados` e `cwv_gate.ps1` aprovado com `0 Erros, 0 Warnings` e zero `[N/MED]`.
