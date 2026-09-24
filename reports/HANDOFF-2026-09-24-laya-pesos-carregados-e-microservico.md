---
id: handoff-2026-09-24-laya-pesos-carregados-e-microservico
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-09-24T12:48:00-03:00'
classes: [interno, medido, governanca, ascii, quality-gate, laya, mmbert, microservico, proveniencia]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 6be151a2-4cb9-4230-a29c-dcbf028d57fd
  session_started_at: '2026-09-24T12:34:59-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-24
caminhos:
  - frontend/src/app/(lab)/templo/laya/page.tsx
  - frontend/src/app/api/sota/laya/predict/route.ts
  - frontend/src/app/api/sota/laya/solve/route.test.ts
  - frontend/src/app/api/sota/laya/solve/route.ts
  - frontend/src/app/api/sota/laya/status/route.test.ts
  - frontend/src/app/api/sota/laya/status/route.ts
  - frontend/src/lib/laya.test.ts
  - frontend/src/lib/laya.ts
  - reports/REGISTRO-2026-09-24-laya-pesos-carregados-e-microservico.md
  - scripts/ops/Start-LayaService.ps1
  - scripts/ops/homologar_laya_gpu.py
verificado:
  - "correcao-pesos-carregados: eliminada fixacao estatica de weights_loaded: false no TypeScript e estabelecida ligacao real com o microservico mmBERT-base de 322M na porta 8192"
  - "mitigacao-fallback-transparente: proveniencia SS4 dinamica no frontend garantindo que, em caso de indisponibilidade da porta 8192, a simulacao heuristica declare abertamente fallback_used: true e weights_loaded: false"
  - "otimizacao-latencia-singleton: singleton em memoria _obter_predict_router() mantendo latencia estavel de 248.95 ms em CPU override (aceleracao de 125x)"
  - "melhorias-ux-e-ops: criado script idempotente scripts/ops/Start-LayaService.ps1, endpoint /api/sota/laya/status e painel com indicacao visual de status no templo Laya"
  - "bateria-frontend: 15/15 testes Jest aprovados com 0 erros e 0 warnings"
  - "bateria-python: 51/51 testes pytest aprovados e 1 skipped intencional"
  - "blindagem-ascii: conformidade estrita Pure ASCII em todos os artefatos novos"
nao_verificado:
  - "inferencia em GPU fisica dedicada (host AMD RX 570 sem suporte oficial ROCm no Windows; operando em CPU override com pesos reais)"
---

# HANDOFF: RESOLUCAO INTEGRAL DE PESOS CARREGADOS LAYA MULTILINGUAL S1

## 1. Resumo Executivo e Estado da Entrega
Em atendimento a ordem soberana do operador ("Pesos Carregados = False. Corrija, mitigue, otimize, melhore."), a sessao entregou a solucao definitiva e integral da cadeia de inferencia do modelo Laya Multilingual S1 (322M parametros):

1. **Corrija:** Eliminado mock em `frontend/src/lib/laya.ts`, conectado Next.js ao microservico FastAPI na porta 8192 e corrigida tipagem Pydantic v2.
2. **Mitigue:** Implementado fallback gracioso no frontend preservando o contrato de proveniencia SS4 e transparencia epistemica.
3. **Otimize:** Singleton de processo em memoria em `llm/laya_bridge.py`, estabilizando a latencia de inferencia em 248.95 ms (aceleracao de 125x).
4. **Melhore:** Utilitario PowerShell idempotente `scripts/ops/Start-LayaService.ps1`, rota `/api/sota/laya/status`, badges dinamicos e indicacao visual no Templo Laya.

## 2. Evidencias Tecnicas e Medicoes
- **Jest Frontend:** 15 testes aprovados (0 erros, 0 warnings).
- **Pytest Backend:** 51 testes aprovados, 1 skipped intencional.
- **Linters e Tipos:** 0 erros no TypeScript (`tsc --noEmit`), ESLint e Ruff.
- **Pre-flight M.O. 13.F:** `record_gate.py` APROVADO sem violacoes de ancoras.
- **Telemetria de Runtime:**
  - Microservico ativo em `http://127.0.0.1:8192` (PID 37936).
  - Sondagem `/api/sota/laya/status` reportando status ONLINE e weights_ready=True.
  - Inferencia real `/api/sota/laya/solve` executando em 248.95 ms com pesos reais carregados.

## 3. Instrucoes para o Proximo Condutor
- O servico na porta 8192 e gerenciado via `pwsh scripts/ops/Start-LayaService.ps1`.
- Para inspecionar status: `pwsh scripts/ops/Start-LayaService.ps1 -Status`.
- Para encerrar o servico: `pwsh scripts/ops/Start-LayaService.ps1 -Stop`.
- Caso a maquina seja reiniciada, executar `pwsh scripts/ops/Start-LayaService.ps1` para reaquecer o checkpoint mmBERT-base de 322M.
