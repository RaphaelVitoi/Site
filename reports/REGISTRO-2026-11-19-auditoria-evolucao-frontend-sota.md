---
id: registro-2026-11-19-auditoria-evolucao-frontend-sota
tipo: registro
escopo:
  Site -- Auditoria, refinamento e integracao BFF/frontend SOTA (zero
  framer-motion/react-icons, Voice Nexus BFF, client-fetch integral, knip zero,
  fontawesome subset, contrast/a11y baseline) e sincronia google-genai 3.6.1
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: "2026-11-19T07:50:51-03:00"
atualizado_em: "2026-11-19T07:50:51-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - registro
  - qualidade
  - arquitetura
  - dependencias
caminhos:
  - data/a11y_manual_review_baselines.json
  - docs/architecture/frontend.md
  - frontend/knip.json
  - frontend/next.config.js
  - frontend/package.json
  - frontend/src/app/(lab)/error.tsx
  - frontend/src/app/(lab)/simulador/MasterSimulatorLoader.tsx
  - frontend/src/app/(lab)/templo/gemma/page.tsx
  - frontend/src/app/(lab)/templo/laya/page.tsx
  - frontend/src/app/(public)/biblioteca/[slug]/DynamicArticleClient.tsx
  - frontend/src/app/(public)/biblioteca/[slug]/page.tsx
  - frontend/src/app/(public)/biblioteca/icm-contra-a-mesa-real/page.tsx
  - frontend/src/app/(public)/layout.tsx
  - frontend/src/app/(public)/page.tsx
  - frontend/src/app/(user)/dashboard/error.tsx
  - frontend/src/app/(user)/dashboard/files/page.tsx
  - frontend/src/app/(user)/dashboard/loading.tsx
  - frontend/src/app/(user)/dashboard/page.tsx
  - frontend/src/app/api/sota/chrysalis/route.test.ts
  - frontend/src/app/api/sota/chrysalis/route.ts
  - frontend/src/app/api/sota/key-pools/route.test.ts
  - frontend/src/app/api/sota/key-pools/route.ts
  - frontend/src/app/api/sota/nexus-mesh/route.test.ts
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  - frontend/src/app/api/sota/pluribus/route.ts
  - frontend/src/app/api/v1/engine-capabilities/route.ts
  - frontend/src/app/api/v1/gemma/route.ts
  - frontend/src/app/api/v1/health/route.test.ts
  - frontend/src/app/api/v1/health/route.ts
  - frontend/src/app/api/v1/predictive/route.ts
  - frontend/src/app/api/v1/rag/route.ts
  - frontend/src/app/api/v1/search/route.ts
  - frontend/src/app/api/v1/voice/status/route.test.ts
  - frontend/src/app/api/v1/voice/status/route.ts
  - frontend/src/app/api/v1/voice/tts/route.test.ts
  - frontend/src/app/api/v1/voice/tts/route.ts
  - frontend/src/app/globals.css
  - frontend/src/app/layout.tsx
  - frontend/src/auth.ts
  - frontend/src/components/analytics/ChrysalisLiveEnginePanel.tsx
  - frontend/src/components/analytics/NexusKeyPoolsPanel.tsx
  - frontend/src/components/analytics/NexusOperationsPanel.tsx
  - frontend/src/components/analytics/NexusWarmupMeshPanel.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  - frontend/src/components/quiz/QuizEngine.tsx
  - frontend/src/components/quiz/QuizQuestion.tsx
  - frontend/src/components/quiz/QuizResults.tsx
  - frontend/src/components/quiz/icmQuizGenerator.ts
  - frontend/src/components/simulator/DashboardSOTA.tsx
  - frontend/src/components/simulator/MasterSimulator.tsx
  - frontend/src/components/simulator/NashMatrixProfiler.tsx
  - frontend/src/components/simulator/PmevRangeViewer.tsx
  - frontend/src/components/simulator/ReferencialData.ts
  - frontend/src/components/simulator/SotaContext.tsx
  - frontend/src/components/simulator/hooks/useMasterCalculations.ts
  - frontend/src/components/simulator/hooks/useQuantumEngine.ts
  - frontend/src/components/simulator/hooks/useSotaSpeech.ts
  - frontend/src/components/simulator/panels/CounterfactualPanel.tsx
  - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
  - frontend/src/components/simulator/panels/NashPanel.tsx
  - frontend/src/components/simulator/panels/PluribusMultiwayPanel.tsx
  - frontend/src/components/simulator/panels/PredictiveProfilePanel.tsx
  - frontend/src/components/simulator/panels/ScenarioStage.tsx
  - frontend/src/components/simulator/panels/WasmTelemetryWidget.tsx
  - frontend/src/components/simulator/solver/types.ts
  - frontend/src/components/simulator/solver/utils.ts
  - frontend/src/components/simulator/ui/ActionRow.tsx
  - frontend/src/components/simulator/ui/GeminiVoicePlayer.tsx
  - frontend/src/components/simulator/ui/GravitationalScannerPanel.tsx
  - frontend/src/components/simulator/ui/InsolvencyRadar.tsx
  - frontend/src/components/simulator/ui/InsolvencyRioPanel.tsx
  - frontend/src/components/simulator/ui/RiskGauge.tsx
  - frontend/src/components/simulator/ui/SimulatorNavigation.tsx
  - frontend/src/components/simulator/useGemmaStream.ts
  - frontend/src/components/ui/layout/ArticleVoiceNarration.tsx
  - frontend/src/components/ui/layout/Header.tsx
  - frontend/src/components/ui/layout/ReadingProgressBar.tsx
  - frontend/src/components/ui/layout/ScrollToTop.tsx
  - frontend/src/components/ui/layout/SectionHeader.tsx
  - frontend/src/components/ui/layout/ShareButtons.tsx
  - frontend/src/components/ui/layout/SotaBackground.tsx
  - frontend/src/components/ui/layout/SotaButton.tsx
  - frontend/src/constants/translations.ts
  - frontend/src/content/interativo/icm_toy_game_simulator.html
  - frontend/src/lib/ai-models.ts
  - frontend/src/lib/client-fetch.test.ts
  - frontend/src/lib/client-fetch.ts
  - frontend/src/lib/engineExecutionGateway.ts
  - frontend/src/lib/fieldModel.ts
  - frontend/src/lib/handParser.ts
  - frontend/src/lib/hrcArchive.ts
  - frontend/src/lib/hrcFormat.ts
  - frontend/src/lib/index.ts
  - frontend/src/lib/laya.test.ts
  - frontend/src/lib/laya.ts
  - frontend/src/lib/rpDeriver.ts
  - frontend/src/lib/server/nexus-proxy.ts
  - frontend/src/lib/server/operator-gateway.ts
  - frontend/src/lib/server/visitor-id.ts
  - frontend/src/lib/server/voice-gateway.ts
  - frontend/src/lib/surface.ts
  - frontend/src/lib/timesfm-client.ts
  - frontend/src/proxy.ts
  - frontend/src/styles/fontawesome/fa-brands-400.woff2
  - frontend/src/styles/fontawesome/fa-solid-900.woff2
  - frontend/src/styles/fontawesome/fontawesome-subset.css
  - frontend/src/styles/fontawesome/manifest.json
  - frontend/src/tests/app/surface-and-layout.test.tsx
  - frontend/src/tests/library/pmevBenchmark.test.ts
  - frontend/src/tests/simulator/aula12Evidence.test.ts
  - frontend/tsconfig.json
  - frontend/tsconfig.test.json
  - llm/antigravity_sdk_bridge.py
  - package-lock.json
  - pyproject.toml
  - reports/REGISTRO-2026-09-09-curadoria-corpus-pmev.md
  - reports/REGISTRO-2026-11-19-auditoria-evolucao-frontend-sota.md
  - requirements.txt
  - uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  session_id: a025efc1-d6ea-4fd3-bf19-a3f676f31e95
  condutor: Gemini 4 Hydrogen <noreply@google.com>
  modelo: gemini-4-hydrogen
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: "2026-11-19"
verificado:
  - npm run audit:entropy (knip) exit 0
  - npm run check:fast (ruff, pyright 0 errors 0 warnings, eslint, tsc --build)
    exit 0
  - tsc -p tsconfig.audit.json e tsc -b tsconfig.worker.json exit 0
  - modern-web-guidance legacy-scan frontend/src totalFindings 0
  - npm --workspace frontend run test --runInBand -- 119 de 119 suites e 771 de
    771 testes aprovados, 0 erros 0 warnings
  - npm run sota:audit 5 de 5 fases VERDE -- LCP 377.42 ms, TTFB 174.52 ms, CLS
    0.00018, TBT 32.50 ms, MAX_HEAP 18.68 MB, AXE_VIOLATIONS 0, CVE 0, SRI
    VERIFIED (reports/cwv/cwv_report_20261119_073833.md)
  - pytest tests/test_cwv_gate_truthfulness tests/test_contraste_superficie
    tests/test_classes_de_cor_nao_emitidas tests/test_ordem_headings
    tests/test_patches_skills tests/test_record_index -- 110 passed
  - pytest tests/test_requirements_sync.py tests/test_antigravity_sdk_bridge.py
    -- 29 passed
  - Sonda HTTP localhost:3000 -- rotas 200 com Permissions-Policy, voice/tts
    vazio 400, key-pools sem sessao 401
  - Navegador isolado CDP em / e /biblioteca/icm-contra-a-mesa-real sem erros de
    console nem mismatch de hidratacao
nao_verificado:
  - Push do submodulo skills/exa-mcp-server para o remoto fork (commit local
    S6551 preservado no submodulo; gitlink do superprojeto mantido em 1a4349d)
  - reports/agent-calibration/daily/2026-11-18.json deixado fora de stage por
    pertencer a calibracao alheia ao escopo deste commit
  - Rebuild completo de producao next build nao executado sobre .next enquanto o
    servidor next dev permanece ativo na porta 3000
referencias_nao_resolviveis:
  - frontend/src/components/simulator/solver/vitoi.ts
  - frontend/src/schemas/perspective.ts
revisoes_de_ancora:
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - frontend/package.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - frontend/src/app/(public)/page.tsx
      - frontend/src/components/simulator/PmevRangeViewer.tsx
      - frontend/src/components/simulator/solver/types.ts
      - frontend/src/components/simulator/solver/utils.ts
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; simulador e paineis
      livres de framer-motion, conectados a SotaEcosystemProvider/Pluribus
      BFF/client-fetch, podando exports mortos e arquivo morto solver/vitoi.ts
      com 119/119 suites Jest aprovadas.
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - requirements.txt
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: auditoria-2026-09-23-calibracao-terra-e-gate-cwv
    caminhos:
      - data/a11y_manual_review_baselines.json
    parecer:
      Revisado em 2026-11-19. baseline a11y re-vinculado ao sha256 vigente de
      page.tsx com 18 alvos e 0 violacoes axe.
  - registro: auditoria-2026-09-24-laya-multilingual-s1
    caminhos:
      - frontend/src/lib/laya.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: auditoria-2026-10-02-frontend-sota-subagents
    caminhos:
      - frontend/src/app/(public)/biblioteca/[slug]/DynamicArticleClient.tsx
      - frontend/src/app/(public)/biblioteca/[slug]/page.tsx
      - frontend/src/app/globals.css
      - frontend/src/app/layout.tsx
      - frontend/src/components/simulator/MasterSimulator.tsx
      - frontend/src/components/simulator/hooks/useQuantumEngine.ts
      - frontend/src/components/simulator/hooks/useSotaSpeech.ts
      - frontend/src/components/simulator/ui/RiskGauge.tsx
      - frontend/src/components/ui/layout/Header.tsx
      - frontend/src/components/ui/layout/SotaButton.tsx
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; framer-motion e
      react-icons removidos de Header/ReadingProgressBar/ShareButtons/SotaButton
      (subconjunto fa-brands gerado por fontawesome-subset.py), guarda
      prefers-reduced-motion em SotaBackground e fetch em Header via
      client-fetch; simulador e paineis livres de framer-motion, conectados a
      SotaEcosystemProvider/Pluribus BFF/client-fetch, podando exports mortos e
      arquivo morto solver/vitoi.ts com 119/119 suites Jest aprovadas.
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: auditoria-2026-10-08-integralidade-frontend
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
      - frontend/src/app/globals.css
      - frontend/src/components/files/UniversalDocumentViewer.tsx
      - frontend/src/components/quiz/icmQuizGenerator.ts
      - frontend/src/components/simulator/MasterSimulator.tsx
      - frontend/src/components/simulator/ui/GeminiVoicePlayer.tsx
      - frontend/src/lib/server/nexus-proxy.ts
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController; fronteira BFF fail-closed
      reforcada (requireOperatorSession, proxy.ts no-store, visitor-id puro,
      rotas health/engine-capabilities/pluribus/voice BFF, isolamento de cota
      RAG e correlation ID); paineis analytics/quiz integrados ao BFF e
      client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan; simulador e
      paineis livres de framer-motion, conectados a
      SotaEcosystemProvider/Pluribus BFF/client-fetch, podando exports mortos e
      arquivo morto solver/vitoi.ts com 119/119 suites Jest aprovadas.
  - registro: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
    caminhos:
      - frontend/src/app/(user)/dashboard/page.tsx
      - frontend/src/app/api/sota/key-pools/route.ts
      - frontend/src/app/api/sota/nexus-mesh/route.ts
      - frontend/src/components/analytics/NexusKeyPoolsPanel.tsx
    parecer:
      Revisado em 2026-11-19. SSR paralelo em dashboard/page.tsx, fronteiras de
      erro/loading, exports explicitos NextAuthResult em auth.ts e migracao de
      gemma/laya/files para @/lib/client-fetch com AbortController; fronteira
      BFF fail-closed reforcada (requireOperatorSession, proxy.ts no-store,
      visitor-id puro, rotas health/engine-capabilities/pluribus/voice BFF,
      isolamento de cota RAG e correlation ID); paineis analytics/quiz
      integrados ao BFF e client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - frontend/src/app/(public)/page.tsx
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      fontes serifadas movidas para (public)/layout.tsx, primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson.
  - registro: handoff-2026-09-07-abertura-em-pmev-com-o-terreno-medido
    caminhos:
      - frontend/src/lib/rpDeriver.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: handoff-2026-09-08-executar-o-contraste-sem-preparar-terreno
    caminhos:
      - frontend/src/lib/rpDeriver.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - pyproject.toml
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: handoff-2026-09-10-raiz-versionada-e-o-portao-que-media-outra-pagina
    caminhos:
      - frontend/src/app/api/v1/search/route.ts
    parecer:
      Revisado em 2026-11-19. fronteira BFF fail-closed reforcada
      (requireOperatorSession, proxy.ts no-store, visitor-id puro, rotas
      health/engine-capabilities/pluribus/voice BFF, isolamento de cota RAG e
      correlation ID).
  - registro: handoff-2026-09-13-integracao-de-engines-wasm-e-economia-de-gate
    caminhos:
      - frontend/src/components/simulator/panels/PluribusMultiwayPanel.tsx
      - frontend/src/lib/engineExecutionGateway.ts
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas; clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero; piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: handoff-2026-09-14-pagina-icm-contra-a-mesa-real
    caminhos:
      - frontend/src/app/(public)/biblioteca/icm-contra-a-mesa-real/page.tsx
      - frontend/src/tests/library/pmevBenchmark.test.ts
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; simulador e paineis
      livres de framer-motion, conectados a SotaEcosystemProvider/Pluribus
      BFF/client-fetch, podando exports mortos e arquivo morto solver/vitoi.ts
      com 119/119 suites Jest aprovadas.
  - registro: handoff-2026-09-15-monte-carlo-icm-worker-pool-e-transicoes
    caminhos:
      - frontend/src/lib/engineExecutionGateway.ts
      - frontend/src/lib/handParser.ts
      - frontend/src/lib/index.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: handoff-2026-09-17-interceptacao-da-reincidencia-e-uniao-da-evidencia
    caminhos:
      - frontend/src/tests/simulator/aula12Evidence.test.ts
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas.
  - registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
    caminhos:
      - frontend/next.config.js
      - frontend/src/components/files/UniversalDocumentViewer.tsx
      - frontend/src/proxy.ts
      - frontend/src/styles/fontawesome/fa-solid-900.woff2
      - frontend/src/styles/fontawesome/fontawesome-subset.css
      - frontend/src/styles/fontawesome/manifest.json
    parecer:
      Revisado em 2026-11-19. next.config.js atualizado com connect-src 'self'
      em producao, Permissions-Policy e optimizePackageImports (recharts);
      framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; fronteira BFF
      fail-closed reforcada (requireOperatorSession, proxy.ts no-store,
      visitor-id puro, rotas health/engine-capabilities/pluribus/voice BFF,
      isolamento de cota RAG e correlation ID); paineis analytics/quiz
      integrados ao BFF e client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan.
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - frontend/src/app/(user)/dashboard/page.tsx
      - frontend/src/app/api/v1/rag/route.ts
      - frontend/src/components/analytics/NexusOperationsPanel.tsx
      - frontend/src/lib/server/operator-gateway.ts
    parecer:
      Revisado em 2026-11-19. SSR paralelo em dashboard/page.tsx, fronteiras de
      erro/loading, exports explicitos NextAuthResult em auth.ts e migracao de
      gemma/laya/files para @/lib/client-fetch com AbortController; fronteira
      BFF fail-closed reforcada (requireOperatorSession, proxy.ts no-store,
      visitor-id puro, rotas health/engine-capabilities/pluribus/voice BFF,
      isolamento de cota RAG e correlation ID); paineis analytics/quiz
      integrados ao BFF e client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan.
  - registro: handoff-2026-09-23-ci-ram-e-rustfmt-staged
    caminhos:
      - frontend/src/app/(public)/page.tsx
      - frontend/src/app/globals.css
      - frontend/src/components/analytics/NexusOperationsPanel.tsx
      - frontend/src/components/simulator/MasterSimulator.tsx
      - frontend/src/components/simulator/panels/NashPanel.tsx
      - frontend/src/components/simulator/ui/ActionRow.tsx
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; paineis
      analytics/quiz integrados ao BFF e client-fetch com zero framer-motion, e
      saneamento replaceChildren/scrollbar-color sem achados legacy-scan;
      simulador e paineis livres de framer-motion, conectados a
      SotaEcosystemProvider/Pluribus BFF/client-fetch, podando exports mortos e
      arquivo morto solver/vitoi.ts com 119/119 suites Jest aprovadas.
  - registro: handoff-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - frontend/src/lib/laya.test.ts
      - frontend/src/lib/laya.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: handoff-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - frontend/src/lib/laya.test.ts
      - frontend/src/lib/laya.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: handoff-2026-09-24-laya-pesos-carregados-e-microservico
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
      - frontend/src/lib/laya.test.ts
      - frontend/src/lib/laya.ts
    parecer:
      Revisado em 2026-11-19. SSR paralelo em dashboard/page.tsx, fronteiras de
      erro/loading, exports explicitos NextAuthResult em auth.ts e migracao de
      gemma/laya/files para @/lib/client-fetch com AbortController; clientes
      lib/ (laya, timesfm-client) unificados em @/lib/client-fetch,
      createPluribusBffExecutor conectado em engineExecutionGateway,
      toSorted/Error cause aplicados e exports mortos removidos sob knip zero.
  - registro: handoff-2026-09-24-laya-visual-workbench-e-rotas-admin
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
      - frontend/src/app/(user)/dashboard/page.tsx
      - frontend/src/components/ui/layout/Header.tsx
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController.
  - registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
    caminhos:
      - frontend/src/app/globals.css
      - frontend/src/components/ui/layout/ShareButtons.tsx
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; framer-motion e
      react-icons removidos de Header/ReadingProgressBar/ShareButtons/SotaButton
      (subconjunto fa-brands gerado por fontawesome-subset.py), guarda
      prefers-reduced-motion em SotaBackground e fetch em Header via
      client-fetch.
  - registro: handoff-2026-09-30-expurgo-de-modelos-obsoletos-harmonizacao-qwen-e-calibracao
    caminhos:
      - frontend/src/app/api/v1/rag/route.ts
    parecer:
      Revisado em 2026-11-19. fronteira BFF fail-closed reforcada
      (requireOperatorSession, proxy.ts no-store, visitor-id puro, rotas
      health/engine-capabilities/pluribus/voice BFF, isolamento de cota RAG e
      correlation ID).
  - registro: handoff-2026-10-02-frontend-sota-harmonizacao
    caminhos:
      - frontend/src/app/(public)/biblioteca/[slug]/DynamicArticleClient.tsx
      - frontend/src/app/(public)/biblioteca/[slug]/page.tsx
      - frontend/src/app/globals.css
      - frontend/src/app/layout.tsx
      - frontend/src/components/simulator/MasterSimulator.tsx
      - frontend/src/components/simulator/hooks/useQuantumEngine.ts
      - frontend/src/components/simulator/hooks/useSotaSpeech.ts
      - frontend/src/components/simulator/ui/RiskGauge.tsx
      - frontend/src/components/ui/layout/Header.tsx
      - frontend/src/components/ui/layout/SotaButton.tsx
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; framer-motion e
      react-icons removidos de Header/ReadingProgressBar/ShareButtons/SotaButton
      (subconjunto fa-brands gerado por fontawesome-subset.py), guarda
      prefers-reduced-motion em SotaBackground e fetch em Header via
      client-fetch; simulador e paineis livres de framer-motion, conectados a
      SotaEcosystemProvider/Pluribus BFF/client-fetch, podando exports mortos e
      arquivo morto solver/vitoi.ts com 119/119 suites Jest aprovadas.
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: handoff-2026-10-08-remediacao-e-evolucao-frontend
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
      - frontend/src/app/globals.css
      - frontend/src/components/files/UniversalDocumentViewer.tsx
      - frontend/src/components/quiz/icmQuizGenerator.ts
      - frontend/src/components/simulator/MasterSimulator.tsx
      - frontend/src/components/simulator/ui/GeminiVoicePlayer.tsx
      - frontend/src/lib/server/nexus-proxy.ts
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController; fronteira BFF fail-closed
      reforcada (requireOperatorSession, proxy.ts no-store, visitor-id puro,
      rotas health/engine-capabilities/pluribus/voice BFF, isolamento de cota
      RAG e correlation ID); paineis analytics/quiz integrados ao BFF e
      client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan; simulador e
      paineis livres de framer-motion, conectados a
      SotaEcosystemProvider/Pluribus BFF/client-fetch, podando exports mortos e
      arquivo morto solver/vitoi.ts com 119/119 suites Jest aprovadas.
  - registro: handoff-2026-10-18-expansao-fractal-sota-voice-nexus-e-impacto
    caminhos:
      - frontend/src/components/simulator/ui/GeminiVoicePlayer.tsx
      - frontend/src/components/ui/layout/ArticleVoiceNarration.tsx
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; simulador e paineis
      livres de framer-motion, conectados a SotaEcosystemProvider/Pluribus
      BFF/client-fetch, podando exports mortos e arquivo morto solver/vitoi.ts
      com 119/119 suites Jest aprovadas.
  - registro: handoff-2026-10-18-harmonizacao-malha-agentica-e-painel-nexus
    caminhos:
      - frontend/src/app/(user)/dashboard/page.tsx
      - frontend/src/app/api/sota/nexus-mesh/route.ts
      - frontend/src/components/analytics/NexusWarmupMeshPanel.tsx
    parecer:
      Revisado em 2026-11-19. SSR paralelo em dashboard/page.tsx, fronteiras de
      erro/loading, exports explicitos NextAuthResult em auth.ts e migracao de
      gemma/laya/files para @/lib/client-fetch com AbortController; fronteira
      BFF fail-closed reforcada (requireOperatorSession, proxy.ts no-store,
      visitor-id puro, rotas health/engine-capabilities/pluribus/voice BFF,
      isolamento de cota RAG e correlation ID); paineis analytics/quiz
      integrados ao BFF e client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan.
  - registro: handoff-2026-10-24-auditoria-sota-gemma-health-check-e-estabilidade
    caminhos:
      - frontend/src/app/(lab)/templo/gemma/page.tsx
      - frontend/src/app/api/v1/gemma/route.ts
      - frontend/src/components/ui/layout/Header.tsx
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController; fronteira BFF fail-closed
      reforcada (requireOperatorSession, proxy.ts no-store, visitor-id puro,
      rotas health/engine-capabilities/pluribus/voice BFF, isolamento de cota
      RAG e correlation ID).
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
    caminhos:
      - llm/antigravity_sdk_bridge.py
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
    caminhos:
      - frontend/src/app/(user)/dashboard/page.tsx
      - frontend/src/app/api/sota/key-pools/route.ts
      - frontend/src/app/api/sota/nexus-mesh/route.ts
      - frontend/src/components/analytics/NexusKeyPoolsPanel.tsx
    parecer:
      Revisado em 2026-11-19. SSR paralelo em dashboard/page.tsx, fronteiras de
      erro/loading, exports explicitos NextAuthResult em auth.ts e migracao de
      gemma/laya/files para @/lib/client-fetch com AbortController; fronteira
      BFF fail-closed reforcada (requireOperatorSession, proxy.ts no-store,
      visitor-id puro, rotas health/engine-capabilities/pluribus/voice BFF,
      isolamento de cota RAG e correlation ID); paineis analytics/quiz
      integrados ao BFF e client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan.
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - requirements.txt
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: plano-laya-integracao-s1s2-pmev-2026-09-20
    caminhos:
      - frontend/src/components/simulator/solver/vitoi.ts
      - frontend/src/lib/rpDeriver.ts
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas; clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero; piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - frontend/src/lib/timesfm-client.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: registro-2026-09-09-adaptador-contrafactual-pmev
    caminhos:
      - frontend/src/components/simulator/panels/CounterfactualPanel.tsx
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas.
  - registro: registro-2026-09-09-mtt-contexto-completo-hh-hrc
    caminhos:
      - frontend/src/lib/handParser.ts
      - frontend/src/lib/hrcFormat.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: registro-2026-09-09-o-axe-mede-extensao-de-navegador
    caminhos:
      - data/a11y_manual_review_baselines.json
    parecer:
      Revisado em 2026-11-19. baseline a11y re-vinculado ao sha256 vigente de
      page.tsx com 18 alvos e 0 violacoes axe.
  - registro: registro-2026-09-09-publicacao-bancadas-pmev
    caminhos:
      - frontend/src/components/simulator/panels/CounterfactualPanel.tsx
      - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas.
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-09-09-retomada-astra-escopo-ft-e-worker
    caminhos:
      - frontend/src/components/simulator/hooks/useQuantumEngine.ts
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas.
  - registro: registro-2026-09-09-transicoes-icm-redistribuicao
    caminhos:
      - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas.
  - registro: registro-2026-09-10-busca-web-como-dado-nao-confiavel
    caminhos:
      - frontend/src/app/api/v1/search/route.ts
    parecer:
      Revisado em 2026-11-19. fronteira BFF fail-closed reforcada
      (requireOperatorSession, proxy.ts no-store, visitor-id puro, rotas
      health/engine-capabilities/pluribus/voice BFF, isolamento de cota RAG e
      correlation ID).
  - registro: registro-2026-09-10-estimativa-field-estrutura-hh
    caminhos:
      - frontend/src/lib/fieldModel.ts
      - frontend/src/lib/hrcFormat.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: registro-2026-09-10-feedback-9-5-multimodal-sota
    caminhos:
      - frontend/src/app/api/v1/search/route.ts
    parecer:
      Revisado em 2026-11-19. fronteira BFF fail-closed reforcada
      (requireOperatorSession, proxy.ts no-store, visitor-id puro, rotas
      health/engine-capabilities/pluribus/voice BFF, isolamento de cota RAG e
      correlation ID).
  - registro: registro-2026-09-10-fichas-posicoes-premiacao
    caminhos:
      - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
      - frontend/src/lib/hrcFormat.ts
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas; clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: registro-2026-09-10-importacao-visivel-hh-hrc
    caminhos:
      - frontend/package.json
      - frontend/src/lib/hrcArchive.ts
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      clientes lib/ (laya, timesfm-client) unificados em @/lib/client-fetch,
      createPluribusBffExecutor conectado em engineExecutionGateway,
      toSorted/Error cause aplicados e exports mortos removidos sob knip zero.
  - registro: registro-2026-09-10-publicacao-inputs-mtt
    caminhos:
      - frontend/package.json
      - frontend/src/lib/fieldModel.ts
      - frontend/src/lib/hrcArchive.ts
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      clientes lib/ (laya, timesfm-client) unificados em @/lib/client-fetch,
      createPluribusBffExecutor conectado em engineExecutionGateway,
      toSorted/Error cause aplicados e exports mortos removidos sob knip zero.
  - registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
    caminhos:
      - frontend/src/app/(lab)/templo/gemma/page.tsx
      - frontend/src/app/api/v1/search/route.ts
      - frontend/src/components/simulator/MasterSimulator.tsx
      - frontend/src/components/simulator/ReferencialData.ts
      - frontend/src/components/simulator/hooks/useSotaSpeech.ts
      - frontend/src/components/simulator/panels/NashPanel.tsx
      - frontend/src/components/simulator/useGemmaStream.ts
      - frontend/src/components/ui/layout/Header.tsx
      - frontend/src/lib/fieldModel.ts
      - frontend/src/lib/handParser.ts
      - frontend/src/lib/hrcFormat.ts
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController; fronteira BFF fail-closed
      reforcada (requireOperatorSession, proxy.ts no-store, visitor-id puro,
      rotas health/engine-capabilities/pluribus/voice BFF, isolamento de cota
      RAG e correlation ID); simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas; clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: registro-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras
    caminhos:
      - frontend/src/components/simulator/panels/PluribusMultiwayPanel.tsx
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas.
  - registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
    caminhos:
      - frontend/next.config.js
      - frontend/package.json
      - frontend/src/lib/timesfm-client.ts
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      next.config.js atualizado com connect-src 'self' em producao,
      Permissions-Policy e optimizePackageImports (recharts); clientes lib/
      (laya, timesfm-client) unificados em @/lib/client-fetch,
      createPluribusBffExecutor conectado em engineExecutionGateway,
      toSorted/Error cause aplicados e exports mortos removidos sob knip zero.
  - registro: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - frontend/knip.json
      - frontend/package.json
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - frontend/package.json
      - package-lock.json
      - requirements.txt
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: registro-2026-09-14-saneamento-linters-pmev-e-engines
    caminhos:
      - frontend/next.config.js
      - frontend/src/lib/timesfm-client.ts
    parecer:
      Revisado em 2026-11-19. next.config.js atualizado com connect-src 'self'
      em producao, Permissions-Policy e optimizePackageImports (recharts);
      clientes lib/ (laya, timesfm-client) unificados em @/lib/client-fetch,
      createPluribusBffExecutor conectado em engineExecutionGateway,
      toSorted/Error cause aplicados e exports mortos removidos sob knip zero.
  - registro: registro-2026-09-17-uniao-da-evidencia-aula12-com-o-motor-bayesiano
    caminhos:
      - frontend/src/tests/simulator/aula12Evidence.test.ts
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas.
  - registro: registro-2026-09-18-decisoes-delegadas-sobre-as-pendencias
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: registro-2026-09-18-integracao-arcabouco-pmev-e-harmonizacao-global
    caminhos:
      - frontend/src/app/layout.tsx
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson.
  - registro: registro-2026-09-18-refinamento-estetico-master-simulator
    caminhos:
      - frontend/src/components/simulator/panels/NashPanel.tsx
      - frontend/src/components/simulator/ui/ActionRow.tsx
      - frontend/src/styles/fontawesome/fa-solid-900.woff2
      - frontend/src/styles/fontawesome/fontawesome-subset.css
      - frontend/src/styles/fontawesome/manifest.json
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; simulador e paineis
      livres de framer-motion, conectados a SotaEcosystemProvider/Pluribus
      BFF/client-fetch, podando exports mortos e arquivo morto solver/vitoi.ts
      com 119/119 suites Jest aprovadas.
  - registro: registro-2026-09-19-harmonizacao-roteamento-e-atualizacao-componentes
    caminhos:
      - frontend/src/app/(user)/dashboard/page.tsx
      - frontend/src/components/simulator/panels/WasmTelemetryWidget.tsx
      - frontend/src/components/ui/layout/Header.tsx
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController; simulador e paineis livres de
      framer-motion, conectados a SotaEcosystemProvider/Pluribus
      BFF/client-fetch, podando exports mortos e arquivo morto solver/vitoi.ts
      com 119/119 suites Jest aprovadas.
  - registro: registro-2026-09-19-loopback-e-visualizador-pdf-chrome
    caminhos:
      - frontend/next.config.js
      - frontend/src/components/files/UniversalDocumentViewer.tsx
      - frontend/src/proxy.ts
    parecer:
      Revisado em 2026-11-19. next.config.js atualizado com connect-src 'self'
      em producao, Permissions-Policy e optimizePackageImports (recharts);
      fronteira BFF fail-closed reforcada (requireOperatorSession, proxy.ts
      no-store, visitor-id puro, rotas health/engine-capabilities/pluribus/voice
      BFF, isolamento de cota RAG e correlation ID); paineis analytics/quiz
      integrados ao BFF e client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan.
  - registro: registro-2026-09-19-operador-local-dev-autenticacao
    caminhos:
      - frontend/src/app/(user)/dashboard/files/page.tsx
      - frontend/src/auth.ts
    parecer:
      Revisado em 2026-11-19. SSR paralelo em dashboard/page.tsx, fronteiras de
      erro/loading, exports explicitos NextAuthResult em auth.ts e migracao de
      gemma/laya/files para @/lib/client-fetch com AbortController.
  - registro: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
    caminhos:
      - frontend/next.config.js
      - frontend/src/app/(user)/dashboard/files/page.tsx
      - frontend/src/components/files/UniversalDocumentViewer.tsx
      - frontend/src/lib/server/operator-gateway.ts
    parecer:
      Revisado em 2026-11-19. next.config.js atualizado com connect-src 'self'
      em producao, Permissions-Policy e optimizePackageImports (recharts); SSR
      paralelo em dashboard/page.tsx, fronteiras de erro/loading, exports
      explicitos NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController; fronteira BFF fail-closed
      reforcada (requireOperatorSession, proxy.ts no-store, visitor-id puro,
      rotas health/engine-capabilities/pluribus/voice BFF, isolamento de cota
      RAG e correlation ID); paineis analytics/quiz integrados ao BFF e
      client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan.
  - registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - frontend/src/lib/laya.test.ts
      - frontend/src/lib/laya.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: registro-2026-09-24-laya-multilingual-s1-integracao
    caminhos:
      - frontend/src/lib/laya.test.ts
      - frontend/src/lib/laya.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: registro-2026-09-24-laya-pesos-carregados-e-microservico
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
      - frontend/src/lib/laya.test.ts
      - frontend/src/lib/laya.ts
    parecer:
      Revisado em 2026-11-19. SSR paralelo em dashboard/page.tsx, fronteiras de
      erro/loading, exports explicitos NextAuthResult em auth.ts e migracao de
      gemma/laya/files para @/lib/client-fetch com AbortController; clientes
      lib/ (laya, timesfm-client) unificados em @/lib/client-fetch,
      createPluribusBffExecutor conectado em engineExecutionGateway,
      toSorted/Error cause aplicados e exports mortos removidos sob knip zero.
  - registro: registro-2026-09-24-laya-ts-strict-conformance
    caminhos:
      - frontend/src/lib/laya.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: registro-2026-09-24-laya-visual-workbench-e-rotas-admin
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
      - frontend/src/app/(user)/dashboard/page.tsx
      - frontend/src/components/ui/layout/Header.tsx
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController.
  - registro: registro-2026-09-25-malha-universal-s1s2-execucao-sota
    caminhos:
      - frontend/src/lib/laya.test.ts
      - frontend/src/lib/laya.ts
    parecer:
      Revisado em 2026-11-19. clientes lib/ (laya, timesfm-client) unificados em
      @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos:
      - frontend/src/styles/fontawesome/fontawesome-subset.css
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch.
  - registro: registro-2026-09-30-expurgo-de-modelos-obsoletos-e-reconciliacao-de-ancoras
    caminhos:
      - frontend/src/app/api/v1/rag/route.ts
    parecer:
      Revisado em 2026-11-19. fronteira BFF fail-closed reforcada
      (requireOperatorSession, proxy.ts no-store, visitor-id puro, rotas
      health/engine-capabilities/pluribus/voice BFF, isolamento de cota RAG e
      correlation ID).
  - registro: registro-2026-10-01-laya-calibracao-timeout-resiliente-e-ui-proveniencia
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
    parecer:
      Revisado em 2026-11-19. SSR paralelo em dashboard/page.tsx, fronteiras de
      erro/loading, exports explicitos NextAuthResult em auth.ts e migracao de
      gemma/laya/files para @/lib/client-fetch com AbortController.
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-10-05-atlas-cenarios-acessibilidade-e-design-system
    caminhos:
      - frontend/package.json
      - frontend/src/components/simulator/MasterSimulator.tsx
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      simulador e paineis livres de framer-motion, conectados a
      SotaEcosystemProvider/Pluribus BFF/client-fetch, podando exports mortos e
      arquivo morto solver/vitoi.ts com 119/119 suites Jest aprovadas.
  - registro: registro-2026-10-05-layout-espacial-formatacao-bb-e-icmev-rp
    caminhos:
      - frontend/src/components/simulator/hooks/useQuantumEngine.ts
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas.
  - registro: registro-2026-10-08-auditoria-e-evolucao-frontend
    caminhos:
      - frontend/src/app/(lab)/templo/laya/page.tsx
      - frontend/src/app/globals.css
      - frontend/src/components/files/UniversalDocumentViewer.tsx
      - frontend/src/components/quiz/icmQuizGenerator.ts
      - frontend/src/components/simulator/MasterSimulator.tsx
      - frontend/src/components/simulator/ui/GeminiVoicePlayer.tsx
      - frontend/src/lib/server/nexus-proxy.ts
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController; fronteira BFF fail-closed
      reforcada (requireOperatorSession, proxy.ts no-store, visitor-id puro,
      rotas health/engine-capabilities/pluribus/voice BFF, isolamento de cota
      RAG e correlation ID); paineis analytics/quiz integrados ao BFF e
      client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan; simulador e
      paineis livres de framer-motion, conectados a
      SotaEcosystemProvider/Pluribus BFF/client-fetch, podando exports mortos e
      arquivo morto solver/vitoi.ts com 119/119 suites Jest aprovadas.
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - frontend/package.json
      - package-lock.json
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-10-13-saneamento-diagnosticos-ide-e-compatibilidade
    caminhos:
      - frontend/src/styles/fontawesome/fontawesome-subset.css
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch.
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-10-18-painel-nexus-warmup-e-mesh-orchestrator
    caminhos:
      - frontend/src/app/(user)/dashboard/page.tsx
      - frontend/src/app/api/sota/nexus-mesh/route.ts
      - frontend/src/components/analytics/NexusWarmupMeshPanel.tsx
    parecer:
      Revisado em 2026-11-19. SSR paralelo em dashboard/page.tsx, fronteiras de
      erro/loading, exports explicitos NextAuthResult em auth.ts e migracao de
      gemma/laya/files para @/lib/client-fetch com AbortController; fronteira
      BFF fail-closed reforcada (requireOperatorSession, proxy.ts no-store,
      visitor-id puro, rotas health/engine-capabilities/pluribus/voice BFF,
      isolamento de cota RAG e correlation ID); paineis analytics/quiz
      integrados ao BFF e client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan.
  - registro: registro-2026-10-18-reformatacao-prettier-article-voice-narration
    caminhos:
      - frontend/src/components/ui/layout/ArticleVoiceNarration.tsx
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch.
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - data/a11y_manual_review_baselines.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. baseline a11y re-vinculado ao sha256 vigente de
      page.tsx com 18 alvos e 0 violacoes axe; piso google-genai>=3.6.1
      sincronizado entre pyproject.toml, requirements.txt e uv.lock
      (test_requirements_sync.py aprovado) e tipagem limpa verificada em
      antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - data/a11y_manual_review_baselines.json
      - frontend/src/app/(lab)/templo/gemma/page.tsx
      - frontend/src/app/(public)/page.tsx
      - frontend/src/app/(user)/dashboard/files/page.tsx
      - frontend/src/app/globals.css
      - frontend/src/components/simulator/PmevRangeViewer.tsx
      - frontend/src/components/simulator/panels/PredictiveProfilePanel.tsx
      - frontend/src/components/simulator/ui/GravitationalScannerPanel.tsx
      - frontend/src/components/simulator/ui/RiskGauge.tsx
      - frontend/src/components/simulator/useGemmaStream.ts
      - frontend/src/lib/engineExecutionGateway.ts
    parecer:
      Revisado em 2026-11-19. baseline a11y re-vinculado ao sha256 vigente de
      page.tsx com 18 alvos e 0 violacoes axe; fontes serifadas movidas para
      (public)/layout.tsx, primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController; simulador e paineis livres de
      framer-motion, conectados a SotaEcosystemProvider/Pluribus
      BFF/client-fetch, podando exports mortos e arquivo morto solver/vitoi.ts
      com 119/119 suites Jest aprovadas; clientes lib/ (laya, timesfm-client)
      unificados em @/lib/client-fetch, createPluribusBffExecutor conectado em
      engineExecutionGateway, toSorted/Error cause aplicados e exports mortos
      removidos sob knip zero.
  - registro: registro-2026-10-18-saneamento-linters-sonar-e-markdownlint
    caminhos:
      - frontend/src/components/simulator/hooks/useSotaSpeech.ts
      - frontend/src/components/ui/layout/ArticleVoiceNarration.tsx
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; simulador e paineis
      livres de framer-motion, conectados a SotaEcosystemProvider/Pluribus
      BFF/client-fetch, podando exports mortos e arquivo morto solver/vitoi.ts
      com 119/119 suites Jest aprovadas.
  - registro: registro-2026-10-19-refinamento-sota-frontend-header-layout-e-surface
    caminhos:
      - frontend/next.config.js
      - frontend/src/components/ui/layout/Header.tsx
      - frontend/src/components/ui/layout/ReadingProgressBar.tsx
      - frontend/src/components/ui/layout/SotaBackground.tsx
      - frontend/src/lib/surface.ts
      - frontend/src/tests/app/surface-and-layout.test.tsx
    parecer:
      Revisado em 2026-11-19. next.config.js atualizado com connect-src 'self'
      em producao, Permissions-Policy e optimizePackageImports (recharts);
      framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; clientes lib/ (laya,
      timesfm-client) unificados em @/lib/client-fetch,
      createPluribusBffExecutor conectado em engineExecutionGateway,
      toSorted/Error cause aplicados e exports mortos removidos sob knip zero.
  - registro: registro-2026-10-19-resolucao-sonarqube-nexus-mesh-e-logger
    caminhos:
      - frontend/src/app/api/sota/nexus-mesh/route.ts
      - frontend/src/components/analytics/NexusWarmupMeshPanel.tsx
    parecer:
      Revisado em 2026-11-19. fronteira BFF fail-closed reforcada
      (requireOperatorSession, proxy.ts no-store, visitor-id puro, rotas
      health/engine-capabilities/pluribus/voice BFF, isolamento de cota RAG e
      correlation ID); paineis analytics/quiz integrados ao BFF e client-fetch
      com zero framer-motion, e saneamento replaceChildren/scrollbar-color sem
      achados legacy-scan.
  - registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
    caminhos:
      - frontend/src/components/simulator/panels/NashPanel.tsx
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas.
  - registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
    caminhos:
      - frontend/src/components/ui/layout/ReadingProgressBar.tsx
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch.
  - registro: registro-2026-10-20-harmonizacao-tier1-e-gemini-38
    caminhos:
      - frontend/src/app/api/v1/rag/route.ts
    parecer:
      Revisado em 2026-11-19. fronteira BFF fail-closed reforcada
      (requireOperatorSession, proxy.ts no-store, visitor-id puro, rotas
      health/engine-capabilities/pluribus/voice BFF, isolamento de cota RAG e
      correlation ID).
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - frontend/package.json
      - frontend/src/app/globals.css
      - frontend/src/components/simulator/ui/InsolvencyRadar.tsx
      - frontend/src/content/interativo/icm_toy_game_simulator.html
      - frontend/src/lib/fieldModel.ts
      - frontend/src/lib/hrcFormat.ts
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      fontes serifadas movidas para (public)/layout.tsx, primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; paineis
      analytics/quiz integrados ao BFF e client-fetch com zero framer-motion, e
      saneamento replaceChildren/scrollbar-color sem achados legacy-scan;
      simulador e paineis livres de framer-motion, conectados a
      SotaEcosystemProvider/Pluribus BFF/client-fetch, podando exports mortos e
      arquivo morto solver/vitoi.ts com 119/119 suites Jest aprovadas; clientes
      lib/ (laya, timesfm-client) unificados em @/lib/client-fetch,
      createPluribusBffExecutor conectado em engineExecutionGateway,
      toSorted/Error cause aplicados e exports mortos removidos sob knip zero.
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - frontend/package.json
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-10-24-resolucao-health-check-gemma-e-estabilidade-dev
    caminhos:
      - frontend/src/app/(lab)/templo/gemma/page.tsx
      - frontend/src/app/api/v1/gemma/route.ts
      - frontend/src/components/ui/layout/Header.tsx
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController; fronteira BFF fail-closed
      reforcada (requireOperatorSession, proxy.ts no-store, visitor-id puro,
      rotas health/engine-capabilities/pluribus/voice BFF, isolamento de cota
      RAG e correlation ID).
  - registro: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-10-27-elevacao-dependencias-python-openai-pyspark-pytest
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-10-27-evolucao-project-context-e-reconciliacao-sota
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-10-27-harmonizacao-dependencias-ci-e-wasm
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: registro-2026-10-27-harmonizacao-dependencias-katex-e-ci
    caminhos:
      - frontend/package.json
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - frontend/package.json
      - package-lock.json
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-10-27-resolucao-matriz-ci-e-acessibilidade-wcag
    caminhos:
      - frontend/src/components/quiz/QuizResults.tsx
    parecer:
      Revisado em 2026-11-19. paineis analytics/quiz integrados ao BFF e
      client-fetch com zero framer-motion, e saneamento
      replaceChildren/scrollbar-color sem achados legacy-scan.
  - registro: registro-2026-10-28-atualizacao-laya-e-estabilizacao-playwright-smoke
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-10-31-estabilizacao-lifecycle-warmup-turbopack
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-01-elevacao-estetica-sota-otimizacao-endpoints-e-reconciliacao
    caminhos:
      - frontend/src/app/(public)/page.tsx
      - frontend/src/app/api/v1/rag/route.ts
      - frontend/src/components/simulator/ui/InsolvencyRadar.tsx
    parecer:
      Revisado em 2026-11-19. fontes serifadas movidas para (public)/layout.tsx,
      primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; fronteira BFF
      fail-closed reforcada (requireOperatorSession, proxy.ts no-store,
      visitor-id puro, rotas health/engine-capabilities/pluribus/voice BFF,
      isolamento de cota RAG e correlation ID); simulador e paineis livres de
      framer-motion, conectados a SotaEcosystemProvider/Pluribus
      BFF/client-fetch, podando exports mortos e arquivo morto solver/vitoi.ts
      com 119/119 suites Jest aprovadas.
  - registro: registro-2026-11-01-integracao-ai-mesh-sdk-e-otimizacao-jules
    caminhos:
      - frontend/src/app/api/sota/nexus-mesh/route.ts
      - package-lock.json
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      fronteira BFF fail-closed reforcada (requireOperatorSession, proxy.ts
      no-store, visitor-id puro, rotas health/engine-capabilities/pluribus/voice
      BFF, isolamento de cota RAG e correlation ID); piso google-genai>=3.6.1
      sincronizado entre pyproject.toml, requirements.txt e uv.lock
      (test_requirements_sync.py aprovado) e tipagem limpa verificada em
      antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-03-elevacao-dependencias-pyarrow-openai-anthropic-laya
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-03-otimizacao-agentes-watchdog-e-calibracao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-03-remediacao-dependabot-pypdf-pyasn1-minimatch
    caminhos:
      - package-lock.json
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-04-otimizacao-layout-header-e-elevacao-dependencias
    caminhos:
      - frontend/src/components/ui/layout/Header.tsx
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. framer-motion e react-icons removidos de
      Header/ReadingProgressBar/ShareButtons/SotaButton (subconjunto fa-brands
      gerado por fontawesome-subset.py), guarda prefers-reduced-motion em
      SotaBackground e fetch em Header via client-fetch; piso
      google-genai>=3.6.1 sincronizado entre pyproject.toml, requirements.txt e
      uv.lock (test_requirements_sync.py aprovado) e tipagem limpa verificada em
      antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - pyproject.toml
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-06-reparo-manifestos-e-declaracao-chrysalis
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-07-auditoria-integral-dependabot-github-e-code-scanning
    caminhos:
      - frontend/package.json
      - frontend/src/app/api/v1/search/route.ts
      - package-lock.json
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      fronteira BFF fail-closed reforcada (requireOperatorSession, proxy.ts
      no-store, visitor-id puro, rotas health/engine-capabilities/pluribus/voice
      BFF, isolamento de cota RAG e correlation ID); piso google-genai>=3.6.1
      sincronizado entre pyproject.toml, requirements.txt e uv.lock
      (test_requirements_sync.py aprovado) e tipagem limpa verificada em
      antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-07-elevacao-dependencias-fastapi-regex-types-aiofiles
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-08-elevacao-dependencias-regex-e-laya
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-08-elevacao-pypdf-7-0-torchvision-e-ecossistema-npm
    caminhos:
      - frontend/package.json
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-08-harmonizacao-r-4-6-1-jules-e-saneamento-ancoras
    caminhos:
      - frontend/src/components/simulator/hooks/useQuantumEngine.ts
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      simulador e paineis livres de framer-motion, conectados a
      SotaEcosystemProvider/Pluribus BFF/client-fetch, podando exports mortos e
      arquivo morto solver/vitoi.ts com 119/119 suites Jest aprovadas.
  - registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
    caminhos:
      - llm/antigravity_sdk_bridge.py
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-08-integracao-sota-triade-stitch-exa-jules
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-08-otimizacao-pyproject-dependencias-extras-e-reconciliacao
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-08-refinamento-sonarlint-e-code-review-triage
    caminhos:
      - frontend/package.json
      - frontend/src/app/api/sota/nexus-mesh/route.ts
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      fronteira BFF fail-closed reforcada (requireOperatorSession, proxy.ts
      no-store, visitor-id puro, rotas health/engine-capabilities/pluribus/voice
      BFF, isolamento de cota RAG e correlation ID).
  - registro: registro-2026-11-08-saneamento-code-review-triage
    caminhos:
      - frontend/package.json
      - frontend/src/app/api/sota/nexus-mesh/route.ts
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      fronteira BFF fail-closed reforcada (requireOperatorSession, proxy.ts
      no-store, visitor-id puro, rotas health/engine-capabilities/pluribus/voice
      BFF, isolamento de cota RAG e correlation ID).
  - registro: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
    caminhos:
      - llm/antigravity_sdk_bridge.py
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-09-elevacao-dependencias-e-fork-eigen
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-09-remediacao-telemetria-cockpit-e-homeostase-laya-chrysalis
    caminhos:
      - frontend/src/app/api/sota/nexus-mesh/route.ts
    parecer:
      Revisado em 2026-11-19. fronteira BFF fail-closed reforcada
      (requireOperatorSession, proxy.ts no-store, visitor-id puro, rotas
      health/engine-capabilities/pluribus/voice BFF, isolamento de cota RAG e
      correlation ID).
  - registro: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
    caminhos:
      - llm/antigravity_sdk_bridge.py
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-10-ai-sdk-google-4-0-117-ai-7-0-169
    caminhos:
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: registro-2026-11-10-bump-deps-e-extra-paths-pylance
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-10-google-genai-3-1-0
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-10-lock-bundle-analyzer-16-4-6
    caminhos:
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: registro-2026-11-11-elevacao-fastapi-playwright-e-bump-deep-research
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-11-elevacao-pypdf-turbo-ai-sdk-google
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-11-elevacao-sentence-transformers-genai-prettier-exa-mcp
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-11-elevacao-typer-types-knip-harmonizacao
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-11-nota-pareamento-dev-dependency-groups
    caminhos:
      - pyproject.toml
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-12-review-sweeps-endurecimento-sota
    caminhos:
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: registro-2026-11-13-elevacao-deps-e-saneamento-configs-ide
    caminhos:
      - package-lock.json
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-13-revisao-ancora-pyproject-extra-path-cockpit
    caminhos:
      - pyproject.toml
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-14-deps-refatoracoes-sonar-e-submodulos
    caminhos:
      - package-lock.json
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-14-laya-pylint-e-refactors-sonar
    caminhos:
      - llm/antigravity_sdk_bridge.py
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-14-llama-cpp-b12387-router-9931
    caminhos:
      - llm/antigravity_sdk_bridge.py
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-14-merge-evolucao-jules-851230-132415
    caminhos:
      - frontend/src/components/simulator/MasterSimulator.tsx
      - frontend/src/components/simulator/hooks/useQuantumEngine.ts
      - frontend/src/components/simulator/panels/NashPanel.tsx
    parecer:
      Revisado em 2026-11-19. simulador e paineis livres de framer-motion,
      conectados a SotaEcosystemProvider/Pluribus BFF/client-fetch, podando
      exports mortos e arquivo morto solver/vitoi.ts com 119/119 suites Jest
      aprovadas.
  - registro: registro-2026-11-14-roteamento-pools-transporte-e-validacao-hrc
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-14-sync-uvlock-ollama-cloud-circuit-e-ci
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-16-elevacao-deps-anthropic-laya-accelerate-e-deps-sync
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-17-elevacao-deps-google-genai-openai
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-17-fase-2-saneamento-estrutural-frontend
    caminhos:
      - data/a11y_manual_review_baselines.json
      - frontend/next.config.js
      - frontend/package.json
      - frontend/src/app/(lab)/simulador/MasterSimulatorLoader.tsx
      - frontend/src/app/(public)/page.tsx
      - frontend/src/components/simulator/MasterSimulator.tsx
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. baseline a11y re-vinculado ao sha256 vigente de
      page.tsx com 18 alvos e 0 violacoes axe; removidos framer-motion e
      react-icons de package.json/package-lock.json e zerado knip.json
      (audit:entropy = 0); next.config.js atualizado com connect-src 'self' em
      producao, Permissions-Policy e optimizePackageImports (recharts); fontes
      serifadas movidas para (public)/layout.tsx, primitivas CSS nativas
      (@starting-style/allow-discrete/backdrop/scroll-timeline) em globals.css,
      contraste WCAG (#625f5a) e contencao .sota-deferred-section em Home, e
      migracao SWR de DynamicArticleClient para fetchJson; SSR paralelo em
      dashboard/page.tsx, fronteiras de erro/loading, exports explicitos
      NextAuthResult em auth.ts e migracao de gemma/laya/files para
      @/lib/client-fetch com AbortController; simulador e paineis livres de
      framer-motion, conectados a SotaEcosystemProvider/Pluribus
      BFF/client-fetch, podando exports mortos e arquivo morto solver/vitoi.ts
      com 119/119 suites Jest aprovadas.
  - registro: registro-2026-11-17-fase-3-backend-estrutural-sota
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-17-fase-5-evolucao-das-forcas-sota
    caminhos:
      - pyproject.toml
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-17-fases-0-1-portoes-verificacao-e-higiene-doc-real
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-17-renovacao-baseline-color-contrast-grain
    caminhos:
      - data/a11y_manual_review_baselines.json
    parecer:
      Revisado em 2026-11-19. baseline a11y re-vinculado ao sha256 vigente de
      page.tsx com 18 alvos e 0 violacoes axe.
  - registro: registro-2026-11-17-saneamento-deps-lint-typecheck-build
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: registro-2026-11-18-elevacao-deps-google-genai-regex-turbo
    caminhos:
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-18-elevacao-deps-vitest-typescript-eslint-openai
    caminhos:
      - frontend/package.json
      - package-lock.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0);
      piso google-genai>=3.6.1 sincronizado entre pyproject.toml,
      requirements.txt e uv.lock (test_requirements_sync.py aprovado) e tipagem
      limpa verificada em antigravity_sdk_bridge.py via ruff/pyright/pytest.
  - registro: registro-2026-11-18-saneamento-sonarlint-pyright-e-deps
    caminhos:
      - frontend/src/app/api/sota/key-pools/route.ts
      - frontend/src/app/api/sota/nexus-mesh/route.ts
      - frontend/src/components/analytics/NexusKeyPoolsPanel.tsx
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer:
      Revisado em 2026-11-19. fronteira BFF fail-closed reforcada
      (requireOperatorSession, proxy.ts no-store, visitor-id puro, rotas
      health/engine-capabilities/pluribus/voice BFF, isolamento de cota RAG e
      correlation ID); paineis analytics/quiz integrados ao BFF e client-fetch
      com zero framer-motion, e saneamento replaceChildren/scrollbar-color sem
      achados legacy-scan; piso google-genai>=3.6.1 sincronizado entre
      pyproject.toml, requirements.txt e uv.lock (test_requirements_sync.py
      aprovado) e tipagem limpa verificada em antigravity_sdk_bridge.py via
      ruff/pyright/pytest.
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - package-lock.json
    parecer:
      Revisado em 2026-11-19. removidos framer-motion e react-icons de
      package.json/package-lock.json e zerado knip.json (audit:entropy = 0).
  - registro: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
    caminhos:
      - tests/test_llm_ollama_integracao_real.py
    parecer:
      Revisado em 2026-11-19 (Devin SWE-2 Flash). acrescido _inferir_com_retry
      com re-tentativa limitada a TimeoutError/ClientError nos dois testes de
      inferencia reais; o daemon Ollama atende uma inferencia por vez e a suite
      paralela divide a maquina com outros agentes. Nenhum contrato medido pelo
      registro mudou - schema JSON, ausencia de format sem response_format,
      RuntimeError HTTP 404 e resolucao de alias permanecem identicos.
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - tests/test_llm_ollama_integracao_real.py
    parecer:
      Revisado em 2026-11-19 (Devin SWE-2 Flash). acrescido _inferir_com_retry
      com re-tentativa limitada a TimeoutError/ClientError nos dois testes de
      inferencia reais; o daemon Ollama atende uma inferencia por vez e a suite
      paralela divide a maquina com outros agentes. Nenhum contrato medido pelo
      registro mudou - schema JSON, ausencia de format sem response_format,
      RuntimeError HTTP 404 e resolucao de alias permanecem identicos.
  - registro: registro-2026-10-19-refinamento-sota-frontend-header-layout-e-surface
    caminhos:
      - tests/test_llm_ollama_integracao_real.py
    parecer:
      Revisado em 2026-11-19 (Devin SWE-2 Flash). acrescido _inferir_com_retry
      com re-tentativa limitada a TimeoutError/ClientError nos dois testes de
      inferencia reais; o daemon Ollama atende uma inferencia por vez e a suite
      paralela divide a maquina com outros agentes. Nenhum contrato medido pelo
      registro mudou - schema JSON, ausencia de format sem response_format,
      RuntimeError HTTP 404 e resolucao de alias permanecem identicos.
  - registro: registro-2026-11-01-elevacao-estetica-sota-otimizacao-endpoints-e-reconciliacao
    caminhos:
      - tests/test_llm_ollama_integracao_real.py
    parecer:
      Revisado em 2026-11-19 (Devin SWE-2 Flash). acrescido _inferir_com_retry
      com re-tentativa limitada a TimeoutError/ClientError nos dois testes de
      inferencia reais; o daemon Ollama atende uma inferencia por vez e a suite
      paralela divide a maquina com outros agentes. Nenhum contrato medido pelo
      registro mudou - schema JSON, ausencia de format sem response_format,
      RuntimeError HTTP 404 e resolucao de alias permanecem identicos.
  - registro: registro-2026-11-15-saneamento-sonarlint-codeql-e-portoes
    caminhos:
      - tests/test_llm_ollama_integracao_real.py
    parecer:
      Revisado em 2026-11-19 (Devin SWE-2 Flash). acrescido _inferir_com_retry
      com re-tentativa limitada a TimeoutError/ClientError nos dois testes de
      inferencia reais; o daemon Ollama atende uma inferencia por vez e a suite
      paralela divide a maquina com outros agentes. Nenhum contrato medido pelo
      registro mudou - schema JSON, ausencia de format sem response_format,
      RuntimeError HTTP 404 e resolucao de alias permanecem identicos.
---

# Registro -- Auditoria e Evolucao Frontend SOTA (2026-11-19)

## 1. Resumo das Entregas

- **Camada BFF & Seguranca Fail-Closed:** Criado
  `frontend/src/lib/server/visitor-id.ts`, reforcados `nexus-proxy.ts` e
  `operator-gateway.ts` (correlacao `X-Request-Id`, `X-Nexus-Client-Id`,
  `Cache-Control no-store` e timeout `504`/`503`), endurecidos
  `/api/sota/key-pools`, `/api/sota/nexus-mesh` e `/api/sota/chrysalis` em
  `proxy.ts`, criados `/api/v1/health`, `/api/v1/engine-capabilities`,
  `/api/sota/pluribus` e `/api/v1/voice/{status,tts}` (`voice-gateway.ts`), alem
  de isolamento de cota no `/api/v1/rag` e `Permissions-Policy` +
  `connect-src 'self'` em producao via `next.config.js`.
- **Unificacao `client-fetch.ts`:** Criado `frontend/src/lib/client-fetch.ts`
  (`fetchResponse`, `fetchJson`, `fetchBlob`, `ClientFetchError`,
  `isAbortError`, `composeClientSignal`) cobrindo `components/`, `hooks/`, rotas
  client em `app/` (`DynamicArticleClient`, `dashboard/files`, `templo/gemma`,
  `templo/laya`) e clientes em `lib/` (`laya.ts`, `timesfm-client.ts`).
- **Erradicacao `framer-motion` & `react-icons` + CRP:** Substituidos por
  primitivas CSS nativas em `frontend/src/app/globals.css`
  (`animation-timeline`, `@starting-style`, `transition-behavior`, `<dialog>` e
  `.sota-drawer-panel::backdrop`), `fa-brands` no subset FontAwesome, escopo
  editorial de fontes em `frontend/src/app/(public)/layout.tsx`, fronteiras de
  erro/loading em `(user)/dashboard` e `(lab)`, contraste WCAG em
  `(lab)/error.tsx` e Home, e baseline a11y atualizado em
  `data/a11y_manual_review_baselines.json`.
- **Entropia Zero & Sincronia de Deps:** Alcancada saida zero em
  `npm run audit:entropy` (`knip`), removidos dois arquivos mortos (solver vitoi
  e schema perspective, ja declarados em referencias_nao_resolviveis
  historicos), reconciliados `pyproject.toml`, `requirements.txt` e `uv.lock` em
  `google-genai>=3.6.1`, e atualizado `docs/architecture/frontend.md`.

## 2. Verificacao e Conformidade

- Suite Jest integral aprovada (119 suites, 771 testes, zero erros e zero
  warnings).
- `check:fast` (`ruff`, `pyright`, `eslint`, `tsc --build`),
  `tsc -p tsconfig.audit.json`, `tsc -b tsconfig.worker.json`, `knip` e
  `legacy-scan` (`totalFindings = 0`) aprovados.
- Browser isolado CDP sem erros de console nem mismatches de hidratacao em `/` e
  `/biblioteca/icm-contra-a-mesa-real`.
- Portao `npm run sota:audit` (5/5 fases VERDE) e baterias Python alvo
  (`test_cwv_gate_truthfulness`, `test_contraste_superficie`,
  `test_classes_de_cor_nao_emitidas`, `test_ordem_headings`,
  `test_patches_skills`, `test_record_index`, `test_requirements_sync`,
  `test_antigravity_sdk_bridge`) aprovados; `suite_verde.py` integral escalonada
  na sequencia e no portao `.husky/pre-commit`.
