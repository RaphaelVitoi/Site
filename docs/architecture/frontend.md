---
id: arquitetura-frontend-sota
tipo: especificacao
escopo: Site -- Arquitetura Frontend Next.js 16, BFF fail-closed, CRP e Motores ICM/PMev
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-05-01T14:14:47-03:00'
atualizado_em: '2026-11-19T07:15:00-03:00'
title: "Arquitetura Frontend"
type: technical
status: active
owner: site-governance
updated_at: 2026-11-19
classes:
  - interno
  - arquitetura
verificado:
  - Especificacao arquitetural reconciliada com frontend/src/*, rotas BFF fail-closed, FontAwesome subset, zero framer-motion/react-icons, knip zero, lint e typechecks Strict TS
nao_verificado:
  - nenhuma na especificacao arquitetural; medicoes de runtime vivem nos registros datados em reports/
referencias_nao_resolviveis: []
---

# Arquitetura Frontend

Este documento descreve a arquitetura técnica atual do frontend (`Next.js 16` + React 19 + Tailwind CSS + WASM/Workers) e sua integração BFF/RPC com o backend `aiohttp` ([`server.py`](../../api/v1/server.py)) em `127.0.0.1:17042`.

## 1. Camada BFF, Identidade e Fronteiras de Segurança (Fail-Closed)

A comunicação entre browser e serviços internos passa exclusivamente pelos Route Handlers em `frontend/src/app/api/*`, com correlação por `X-Request-Id`, propagação de visitante por HMAC (`X-Nexus-Client-Id`) e timeout composto:

- **[`visitor-id.ts`](../../frontend/src/lib/server/visitor-id.ts)**: Utilitário puro Node (`identificadorDoVisitante` e `resolverCorrelationId`) desacoplado de dependências ESM de sessão, permitindo reuso uniforme em rotas públicas e privadas sem poluir testes unitários Node.
- **[`nexus-proxy.ts`](../../frontend/src/lib/server/nexus-proxy.ts)**: Gateway público para rotas de inferência/pesquisa/previsão (`/api/sota/timesfm-forecast`, `/api/v1/rag`, `/api/v1/search`, `/api/v1/predictive`, `/api/v1/logs/frontend`). Propaga `X-Request-Id`, `X-Nexus-Client-Id` e `Cache-Control: no-store`, aplica timeout padrão de `15s` via `AbortSignal.any([request.signal, AbortSignal.timeout(...)])` e traduz expiração em HTTP `504` (`503` em indisponibilidade).
- **[`operator-gateway.ts`](../../frontend/src/lib/server/operator-gateway.ts)**: Fronteira estrita de operador (`requireOperatorSession` + `buildOperatorBackendHeaders` + encaminhadores tipados). Exige sessão NextAuth autenticada cujo e-mail pertença à whitelist `NEXUS_OPERATOR_EMAILS`, anexa `Authorization: Bearer <API_SECRET_TOKEN>`, `X-Request-Id` e `X-Nexus-Client-Id` apenas após a verificação e bloqueia bypasses no Edge em [`proxy.ts`](../../frontend/src/proxy.ts).
- **Isolamento de Cotas em [`rag/route.ts`](../../frontend/src/app/api/v1/rag/route.ts)**: O endpoint de síntese bibliográfica utiliza chaves dedicadas/Tier 2+ e modelos Flash (`gemini-3.8-flash` / `gemini-3.5-flash-lite`), preservando integralmente a cota do pool OpenRouter Tier 1 do núcleo cognitivo.
- **CSP Estrita de Produção & `Permissions-Policy` ([`next.config.js`](../../frontend/next.config.js))**: Como nenhum fetch client-side sai da origem, `connect-src` fecha para `'self'` em produção (restrito a loopback/HMR apenas em dev), acompanhado de `Permissions-Policy: camera=(), geolocation=(), payment=(), usb=(), interest-cohort=()`.

### Matriz de Endpoints Conectados (`Next.js BFF <-> Python aiohttp :17042`)

| Rota BFF Next.js | Backend Python / Alvo | Acesso | Finalidade |
| :--- | :--- | :--- | :--- |
| `GET /api/v1/health` | `GET /api/v1/health` | Público (sem segredos) | Observabilidade unificada (`ok` / `degraded`, `uptime_s`, `agents`, latência) |
| `GET /api/v1/engine-capabilities` | `GET /api/v1/engine-capabilities` | Sessão autenticada | Paridade de capacidades dos motores de Teoria dos Jogos (WASM/Server) |
| `GET/POST /api/v1/gemma`, `/predictive`, `/search`, `/rag` | `/api/v1/*` | Sessão / Público rate-limited | Oráculo Gemma, perfil preditivo $\Psi$, busca híbrida e RAG bibliográfico |
| `GET/POST /api/sota/pluribus` | `POST /api/v1/game-theory/pluribus/solve` | Sessão autenticada | Solver multiway server-side acionado explicitamente pelo `PluribusMultiwayPanel` |
| `GET/POST /api/sota/key-pools` | `GET/POST /api/v1/keys/observatory` | Operador fail-closed | Inventário mascarado HKCU/HKLM, fingerprints `sha8` e sonda HTTP 0-token |
| `GET/POST /api/sota/nexus-mesh` | Porta mesh + `/api/v1/keys/observatory` | Operador fail-closed | Telemetria de portas, warmup Ollama VRAM (`MODEL_NAME_RX`/`KEEP_ALIVE_RX`) e CDP |
| `GET/POST /api/sota/chrysalis` | `/api/v1/chrysalis/health` & `/validate-plan` | Operador fail-closed | Adapter Chrysalis Live Engine com fallback determinístico em loopback |
| `GET/POST /api/sota/timesfm-forecast` & `/pmev-heatmap` | `/api/v1/predictive/timesfm` & `/api/v1/pmev/*` | Operador / Público proxy | Séries temporais TimesFM 2.5 e matriz de pressão PMev |
| `GET /api/v1/voice/status` & `POST /api/v1/voice/tts` | `127.0.0.1:9333/api/voice/*` via [`voice-gateway.ts`](../../frontend/src/lib/server/voice-gateway.ts) | Público (rate-limited 30/60s, cap 16 KB) | Disponibilidade Voice Nexus (degrada 200 offline) e síntese neural PT-BR sem expor loopback ao browser |

## 2. Critical Rendering Path (CRP), Layout e Superfícies

- **Zero-`framer-motion` em 100% da Aplicação:** A dependência `framer-motion` foi removida por completo de toda a árvore (`RootLayout`, Quiz, `SotaButton` e painéis do Simulador). [`Header.tsx`](../../frontend/src/components/ui/layout/Header.tsx), [`ReadingProgressBar.tsx`](../../frontend/src/components/ui/layout/ReadingProgressBar.tsx), [`ScrollToTop.tsx`](../../frontend/src/components/ui/layout/ScrollToTop.tsx), [`QuizEngine.tsx`](../../frontend/src/components/quiz/QuizEngine.tsx), [`RiskGauge.tsx`](../../frontend/src/components/simulator/ui/RiskGauge.tsx) e afins operam sobre primitivas CSS nativas em [`globals.css`](../../frontend/src/app/globals.css) (`animation-timeline: scroll(root)`, `@starting-style`, `transition-behavior: allow-discrete`, `.sota-enter-*`, `.sota-bar-fill`, `.sota-gauge-arc`) com guarda `prefers-reduced-motion`. O fundo ambiente ([`SotaBackground.tsx`](../../frontend/src/components/ui/layout/SotaBackground.tsx)) ignora `mousemove` quando `prefers-reduced-motion: reduce` está ativo.
- **Polling Consciente de Ciclo de Vida:** A sonda de status em `Header.tsx` requer sessão ativa, verifica `document.visibilityState === 'visible'` e aborta requisições pendentes via `AbortController` + `AbortSignal.timeout(3_000)`.
- **Contenção Abaixo da Dobra:** Seções editoriais fora da dobra inicial em [`page.tsx`](../../frontend/src/app/(public)/page.tsx) utilizam `.sota-deferred-section` (`content-visibility: auto; contain-intrinsic-size: auto none auto 480px;`) declarada em [`globals.css`](../../frontend/src/app/globals.css).
- **Dashboard SSR Paralelo:** [`dashboard/page.tsx`](../../frontend/src/app/(user)/dashboard/page.tsx) carrega dados em paralelo (`Promise.all`) com `no-store`, evitando cascatas sequenciais.
- **Escopo Editorial de Fontes ([`(public)/layout.tsx`](../../frontend/src/app/(public)/layout.tsx)):** [`layout.tsx`](../../frontend/src/app/layout.tsx) carrega apenas `Inter`, `JetBrains_Mono` e `Montserrat`; as serifas editoriais (`Playfair_Display` e `EB_Garamond`) ficam restritas ao grupo `(public)` (`display: contents`), poupando rede em rotas laboratoriais e operacionais e mantendo prerender estático (SSG).
- **Subset Tipográfico Único (sem `react-icons`):** `react-icons` foi removida em favor dos glifos `fa-brands` no [`fontawesome-subset.py`](../../frontend/scripts/fontawesome-subset.py), consolidando o manifesto e CSS estrito em `frontend/src/styles/fontawesome/`, validado em CI por [`fontawesomeSubset.test.ts`](../../frontend/src/tests/styles/fontawesomeSubset.test.ts).

## 3. Resiliência Client-Side e Fronteiras de Rota

- **[`client-fetch.ts`](../../frontend/src/lib/client-fetch.ts)**: Centraliza `fetchResponse`, `fetchJson<T>`, `fetchBlob`, `ClientFetchError` (preservando `status`, `payload` e `X-Request-Id`), `isAbortError` e `composeClientSignal`. 100% dos clientes HTTP em `frontend/src/components/`, `frontend/src/hooks/`, rotas client em `app/` (`DynamicArticleClient`, `dashboard/files`, `templo/gemma`, `templo/laya`) e clientes em `lib/` (`laya.ts`, `timesfm-client.ts`) usam esse gateway sem `fetch(` cru nem URLs loopback diretas; apenas os beacons `keepalive` (`logger.ts`, `telemetry-client.ts`) e o loader gerado pelo `wasm-bindgen` ficam fora do wrapper.
- **Error & Loading Boundaries:** Rotas críticas contam com fronteiras dedicadas — [`(user)/dashboard/error.tsx`](../../frontend/src/app/(user)/dashboard/error.tsx), [`(user)/dashboard/loading.tsx`](../../frontend/src/app/(user)/dashboard/loading.tsx), [`(lab)/error.tsx`](../../frontend/src/app/(lab)/error.tsx) e [`(lab)/simulador/loading.tsx`](../../frontend/src/app/(lab)/simulador/loading.tsx) — prevenindo CLS e quedas integrais de árvore.

## 4. Arquitetura Modular da Calculadora e Simuladores (`ICM` / `PMev`)

- **Lógica Pura ([`icm.ts`](../../frontend/src/lib/icm.ts)):** Motor puro Independent Chip Model desacoplado da UI, facilitando testes determinísticos e paridade contra WASM/Rust (`src/lib/wasm/*`).
- **Gateway de Motores ([`engineExecutionGateway.ts`](../../frontend/src/lib/engineExecutionGateway.ts)):** Unifica execução cliente/WASM e validação server-side (`createPluribusBffExecutor`) sem acoplar painéis a URLs hardcoded.
- **Calculadora ICM Universal (`frontend/src/components/icm/`):**
  - `PlayerInput.tsx`, `PrizeInput.tsx`, `ResultsDisplay.tsx` (Recharts), orquestrados por `ICMCalculator.tsx`.
- **Tema, Imutabilidade & Entropia Zero:** Tailwind CSS sob paleta Obsidian Analytics + superfícies claras editoriais, scrollbars compatíveis com `scrollbar-color`/`scrollbar-width` (`>= 3:1` de contraste), imutabilidade funcional ES2023+ (`.toSorted()`, `.findLast()`, `Element.prototype.replaceChildren()`, `Error(..., { cause })`) e código livre de exports/arquivos mortos (`npm run audit:entropy` / `knip` com saída `0`).
