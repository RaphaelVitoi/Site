---
id: registro-2026-10-01-laya-calibracao-timeout-resiliente-e-ui-proveniencia
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-01T12:35:00-03:00'
classes: [interno, medido, governanca, ascii, quality-gate, laya, s1, timeout, proveniencia, nextjs, frontend]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 1eae919c-b5e6-4f60-8935-0e603f5c08d0
  session_started_at: '2026-10-01T11:54:30-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-01
caminhos:
  - frontend/src/app/(lab)/templo/laya/page.tsx
  - frontend/src/app/api/sota/laya/predict/route.ts
  - frontend/src/app/api/sota/laya/solve/route.ts
verificado:
  - "calibracao-timeout-resiliente: ampliado o timeout de AbortSignal em frontend/src/app/api/sota/laya/predict/route.ts e frontend/src/app/api/sota/laya/solve/route.ts de 1000ms para 4500ms configuravel via LAYA_UPSTREAM_TIMEOUT_MS, eliminando falsos positivos de fallback heuristico durante inferencias em CPU com concorrencia de compilacao"
  - "ui-proveniencia-contextual: enriquecido o callout de proveniencia em frontend/src/app/(lab)/templo/laya/page.tsx para distinguir quando o microservico esta ONLINE na porta 8192 (oferecendo botao de re-execucao direta com pesos reais) versus OFFLINE (orientando comando PowerShell e checagem de status)"
  - "exibicao-latencia-neural-ui: adicionado mostrador explicito da latencia neural real em milissegundos no card de proveniencia da UI"
  - "testes-jest-frontend: 21 testes aprovados em 4 suites com 0 erros e 0 warnings"
  - "check-fast: ruff, eslint e tsc --build aprovados com exit code 0"
  - "live-runtime-validado: inferencia neural executada com sucesso em solve via porta 3000 retornando weights_loaded=True, fallback_used=False e latencia de 220.4 ms"
  - "blindagem-ascii: conformidade estrita Pure ASCII preservada em todo o registro de governanca"
nao_verificado:
  - "inferencia acelerada por CUDA no host (microservico operando em modo CPU override por hardware local sem GPU NVIDIA dedicada ativa)"
revisoes_de_ancora:
  - registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - frontend/src/app/api/sota/laya/solve/route.ts
    parecer: >-
      Revisado. Calibrado o timeout de comunicacao HTTP upstream para absorver a latencia
      de inferencia de tensores neurais mmBERT 322M em CPU sem degradar para simulacao heuristica.
  - registro: registro-2026-09-24-laya-pesos-carregados-e-microservico
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
      - frontend/src/app/api/sota/laya/predict/route.ts
      - frontend/src/app/api/sota/laya/solve/route.ts
    parecer: >-
      Revisado. Aprimorada a telemetria e o card de proveniencia da interface para harmonizar
      com o estado real do microservico FastAPI na porta 8192.
  - registro: registro-2026-09-24-laya-visual-workbench-e-rotas-admin
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
    parecer: >-
      Revisado. Refinada a experiencia do usuario no callout do contrato de proveniencia
      com acoes contextuais inteligentes para re-execucao com pesos reais.
  - registro: registro-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - frontend/src/app/api/sota/laya/predict/route.ts
    parecer: >-
      Revisado. Otimizada a rota predict com timeout resiliente de 4500ms para inferencia S1.
  - registro: registro-2026-09-25-laya-warmup-persistencia-e-timeout-s1
    caminhos:
      - frontend/src/app/api/sota/laya/predict/route.ts
      - frontend/src/app/api/sota/laya/solve/route.ts
    parecer: >-
      Revisado. Restaurada a margem segura de timeout contra cortes prematuros de forward pass
      em CPU, preservando a integridade dos testes unitarios via mock defensivo de rede.
---

# REGISTRO DE CALIBRACAO: TIMEOUT RESILIENTE LAYA S1 E UI CONTEXTUAL DE PROVENIENCIA

## 1. Contexto do Diagnostico e Causa Raiz

O usuario apresentou captura de tela do painel Contrato de Proveniencia SS4 em `(lab)/templo/laya`:
- Engine ID: `laya-solver-adapter-cfr-plus-ts`
- Runtime: `nextjs-typescript`
- Pesos Carregados: `false (Fallback Heuristico S1)`
- Fallback Ativo: `true (Simulacao Edge TS)`
- Callout orientando execucao manual de `pwsh scripts/ops/Start-LayaService.ps1`.

### Diagnostico Minucioso:
1. **Timeout Agressivo Prematuro:** Na rodada de saneamento de testes do Jest, o timeout de rede em `frontend/src/app/api/sota/laya/solve/route.ts` e `frontend/src/app/api/sota/laya/predict/route.ts` havia sido reduzido para 1000ms para evitar estourar o limite de 5000ms do Jest quando a porta estava fechada sem mock.
2. **Latencia Factual em CPU:** Em ambiente local com CPU override (sem GPU NVIDIA), o modelo mmBERT-base de 322M executa o forward pass entre 200ms e 1800ms sob concorrencia com o processo Node/Next.js. Quando ultrapassava 1000ms, o AbortSignal abortava e caia silenciosamente no fallback TypeScript simulado.
3. **Incoerencia Cognitiva na UI:** A interface apresentava um aviso estatico mandando rodar o script de inicializacao mesmo quando o microservico na porta 8192 ja estava ativo e saudavel, sem permitir ao usuario re-executar com um unico clique.

---

## 2. Acoes e Otimizacoes Aplicadas

1. **Timeout Upstream Resiliente e Parametrizavel:**
   - Rotas `/api/sota/laya/solve` e `/api/sota/laya/predict` agora adotam `UPSTREAM_TIMEOUT_MS = Number(process.env.LAYA_UPSTREAM_TIMEOUT_MS) || 4500`.
   - Se o microservico estiver desligado, a recusa do socket no Windows (`ECONNREFUSED`) e imediata (sub-10ms), mantendo o fallback instantaneo sem travamentos.
   - Se o microservico estiver executando inferencia neural em CPU, 4500ms oferecem margem suficiente para computacao sem abortos indevidos.

2. **UX de Proveniencia Contextual e Reativa:**
   - O componente `frontend/src/app/(lab)/templo/laya/page.tsx` inspeciona `serviceStatus.status`. Se estiver `ONLINE`, exibe o banner informativo com a latencia do servico e um botao de acao rapida para re-executar com pesos reais.
   - Se estiver `OFFLINE`, mantem as instrucoes operacionais e botao de copiar comando PowerShell com opcao de atualizar status.
   - Adicionada exibicao da latencia neural real (`bridgeResult.s1_prediction.latency_ms`) no painel de metricas.

3. **Blindagem de Testes:**
   - Os testes de unidade do Jest utilizam mocks deterministicos de rede, executando em 2.5s com 0 erros e 0 warnings.
