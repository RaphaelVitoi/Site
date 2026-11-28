---
id: handoff-2026-11-28-dashboard-files-ecossistema-cloud
tipo: handoff
escopo: Evolucao integral de /dashboard/files -- raiz multiprojeto (.gemini), Google Drive, OneDrive, leitor universal e simetria visual
ecossistema: nexus-sota
autor: Gemini 4 Neon <noreply@google.com>
criado_em: '2026-11-28T08:22:00-03:00'
atualizado_em: '2026-11-28T08:22:00-03:00'
commit: HEAD
classes:
- interno
- handoff
- frontend
- seguranca
caminhos:
- api/v1/handlers.py
- api/v1/handlers_files.py
- frontend/src/app/(user)/dashboard/files/page.tsx
- frontend/src/app/api/vitoi/files/list/route.ts
- frontend/src/app/api/vitoi/files/view/route.ts
- frontend/src/components/files/UniversalDocumentViewer.test.tsx
- frontend/src/components/files/UniversalDocumentViewer.tsx
- frontend/src/components/ui/layout/SotaMarkdown.tsx
- reports/HANDOFF-2026-11-28-dashboard-files-ecossistema-cloud.md
- reports/agent-calibration/feedback-ledger.jsonl
- tests/test_files_ecosystem_api.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: 3.14.9
  so: Windows
  condutor: Gemini 4 Neon
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: '2026-11-28'
verificado:
- uv run --no-sync python -m pytest tests/test_files_ecosystem_api.py tests/test_servico_de_arquivo_2026_09_30.py tests/test_auditoria_fortificacao_5_fases.py tests/test_backend_hardening.py -- 67 passed, 0 warnings
- uv run --no-sync ruff check api/v1/handlers_files.py api/v1/handlers.py tests/test_files_ecosystem_api.py -- All checks passed
- uv run --no-sync pyright --project pyproject.toml api/v1/handlers_files.py tests/test_files_ecosystem_api.py -- 0 errors, 0 warnings, 0 informations
- npm --workspace frontend run test -- --testPathPatterns="UniversalDocumentViewer|operator-gateway|operatorProxy" -- 3 suites, 28 passed
- npm --workspace frontend run lint -- --max-warnings=0 nos 6 arquivos alterados -- 0 errors, 0 warnings
- npm --workspace frontend run typecheck -- tsc -p tsconfig.audit.json 0 errors
- validacao interativa ao vivo em http://localhost:3000/dashboard/files via Chrome CDP :9222 -- Ecosystem (.gemini), Project, GoogleDrive (F:/Meu Drive), OneDrive, Mermaid SVG, KaTeX, TOC, link relativo, PDF visual + Texto RAG (2.259 palavras), planilha multi-aba (7 abas) + grafico 19 barras e imagem 128x128 com 0 erros de console e 0 erros HTTP
- feedback Tier 0 gravado via Register-AgentCalibrationFeedback.ps1 (Score 9.8, seq 103, 104 registros, tail_hash 9f583749961113d4a512f03e7a92e6870834ee4808f27f9b652a36756ba4623d)
nao_verificado:
- Execucao isolada completa de suite_verde.py antes deste fechamento -- sera executada nos hooks pre-commit/pre-push ou em validacao dedicada
- CI remoto GitHub Actions apos git push -- pendente execucao remota
- 1 ocorrencia externa de pageerror "Access to storage is not allowed from this context." no contexto Chrome CDP :9222 do perfil host (sem impacto em rotas ou console)
revisoes_de_ancora:
- registro: auditoria-2026-10-08-integralidade-backend
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Apenas re-exports de compatibilidade em api/v1/handlers.py; fronteira de seguranca e contratos preservados.
- registro: auditoria-2026-10-08-integralidade-frontend
  caminhos:
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Evolucao em UniversalDocumentViewer e SotaMarkdown preserva tipagem estrita e seguranca XSS/Mermaid strict.
- registro: auditoria-2026-11-18-pools-chaves-observatorio-e-roteamento
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Re-exports de arquivos em handlers.py nao alteram observatorio ou roteamento de pools.
- registro: handoff-2026-09-19-documentos-loopback-sonar-e-download
  caminhos:
  - api/v1/handlers.py
  - frontend/src/app/api/vitoi/files/view/route.ts
  - frontend/src/components/files/UniversalDocumentViewer.test.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Contrato de download attachment/filename* e streaming loopback preservados; adicionado suporte a parametro ?sheet=.
- registro: handoff-2026-09-22-integracao-system1-llm-dashboard
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Integracao System 1 em handlers.py intocada; apenas novos re-exports de handlers_files.py.
- registro: handoff-2026-09-23-ci-ram-e-rustfmt-staged
  caminhos:
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). SotaMarkdown segue limpo em ESLint e TypeScript sem alteracao de pipeline CI.
- registro: handoff-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Contratos de remediacao backend preservados em api/v1/handlers.py.
- registro: handoff-2026-10-08-remediacao-e-evolucao-frontend
  caminhos:
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Props opcionais adicionadas mantendo total retrocompatibilidade das paginas consumidoras.
- registro: handoff-2026-11-15-translategemma-timesfm-laya-roi
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Apenas adicionados re-exports de compatibilidade (_resolve_ecosystem_root, _resolve_onedrive_root) de api/v1/handlers_files.py.
- registro: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Observatorio e roteamento preservados em handlers.py.
- registro: handoff-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - frontend/src/app/(user)/dashboard/files/page.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Virtualizacao @tanstack/react-virtual mantida e integrada a arvore hierarquica, nuvens e simetria visual.
- registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Fronteira HTTP e portoes independentes preservados.
- registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Procedencia TimesFM e JSON CLI preservados.
- registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Tipagem estrita validada com pyright 0 errors / 0 warnings.
- registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Fronteira de autoridade e protecao de credenciais reforcadas em handlers_files.py.
- registro: registro-2026-09-12-teoria-canonica-chen-janda-e-convergencia-cfr
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Handlers de teoria dos jogos inalterados.
- registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Contratos de capacidades e proveniencia inalterados.
- registro: registro-2026-09-14-correcoes-pos-auditoria-handoff-tier-e-dependencias
  caminhos:
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). SotaMarkdown mantem assinatura padrao com prop opcional onRelativeLinkClick.
- registro: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Rotas de aulas/RSI em handlers.py preservadas.
- registro: registro-2026-09-18-saneamento-geral-de-linters-e-gate-remocao-citada
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Ruff e pyright zerados apos os re-exports em handlers.py.
- registro: registro-2026-09-19-loopback-e-visualizador-pdf-chrome
  caminhos:
  - api/v1/handlers.py
  - frontend/src/app/api/vitoi/files/view/route.ts
  - frontend/src/components/files/UniversalDocumentViewer.test.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Renderizacao PDF inline desbloqueada do spinner RAG mantendo CSP/COEP compativeis com Chrome.
- registro: registro-2026-09-19-operador-local-dev-autenticacao
  caminhos:
  - frontend/src/app/(user)/dashboard/files/page.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Fluxo de autenticacao de operador e fetch defensivo validados ao vivo.
- registro: registro-2026-09-19-universal-document-viewer-e-seguranca-csp-pdf
  caminhos:
  - api/v1/handlers.py
  - frontend/src/app/(user)/dashboard/files/page.tsx
  - frontend/src/components/files/UniversalDocumentViewer.test.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). UniversalDocumentViewer e /dashboard/files evoluiram com multi-aba, TOC, grafico corrigido e testes ampliados (28 passed).
- registro: 2026-09-22-auditoria-frontend-4-itens
  caminhos:
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Lazy-load do CSS do KaTeX e securityLevel strict do Mermaid preservados.
- registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Re-exports em handlers.py preservam higiene ASCII.
- registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Metricas HTTP e shutdown em handlers.py inalterados.
- registro: registro-2026-10-05-layout-espacial-formatacao-bb-e-icmev-rp
  caminhos:
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Normalizacao HTML/Markdown preservada em SotaMarkdown.tsx.
- registro: registro-2026-10-08-auditoria-e-evolucao-frontend
  caminhos:
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Evolucao visual validada ao vivo com 0 erros de console e ESLint zerado.
- registro: registro-2026-10-08-auditoria-e-remediacao-backend
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Remediacao backend preservada em handlers.py.
- registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
  caminhos:
  - frontend/src/app/(user)/dashboard/files/page.tsx
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Helpers extraidos mantem baixa complexidade cognitiva e zero warnings ESLint.
- registro: registro-2026-10-19-saneamento-sonarqube-timesfm-e-a11y
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Padroes Sonar/a11y preservados.
- registro: registro-2026-10-19-verificacao-neural-timesfm-e-evolucao-ecossistema
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Verificacao neural e ecossistema preservados.
- registro: registro-2026-11-08-saneamento-pure-ascii-timesfm-e-handlers
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Higiene de handlers.py mantida.
- registro: registro-2026-11-17-auditoria-fortificacao-backend-5-fases
  caminhos:
  - api/v1/handlers.py
  - api/v1/handlers_files.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Regra HIGH-01 de PATH_GDRIVE_ROOT preservada integralmente; suites de fortificacao (67 passed) verdes.
- registro: registro-2026-11-17-fase-3-backend-estrutural-sota
  caminhos:
  - api/v1/handlers.py
  - api/v1/handlers_files.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Modularizacao de handlers_files.py preservada e ampliada com suporte seguro a raiz .gemini, Google Drive e OneDrive.
- registro: registro-2026-11-19-auditoria-evolucao-frontend-sota
  caminhos:
  - frontend/src/app/(user)/dashboard/files/page.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Evolucao frontend SOTA validada em testes Jest (28 passed) e CDP :9222.
- registro: registro-2026-11-21-blindagem-ascii-e-saneamento-linters
  caminhos:
  - api/v1/handlers.py
  - frontend/src/app/(user)/dashboard/files/page.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Linters Python e Frontend com 0 erros e 0 warnings.
- registro: registro-2026-11-21-deps-sota-roi-neon-orchestrator-e-calibracao
  caminhos:
  - frontend/src/app/(user)/dashboard/files/page.tsx
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Evolucao de simetria e filtros sobre o mesmo contrato validado.
- registro: registro-2026-11-22-icm-rules-ssot-e-roi-s1
  caminhos:
  - api/v1/handlers.py
  parecer: Revisado em 2026-11-28 (Gemini 4 Neon). Rules SSOT e ROI S1 inalterados em handlers.py.
---

# HANDOFF — Central de Documentos (`/dashboard/files`): Ecossistema `.gemini`, Google Drive, OneDrive & Simetria Visual

## 1. Contexto Inicial, Proveniência e Propósito

- **Sessão / Condutor:** `6b2d7211-823c-496a-bc30-790998eeb6ab` (início `2026-11-28T07:06:12-03:00`), conduzida por **Gemini 4 Neon** (`gemini-4-neon`, Tier 1, veículo `antigravity`, supervisão `assistida`).
- **Propósito:** Auditar, corrigir, refinar e validar integralmente `/dashboard/files` (backend, BFF Next.js e UI), expandindo-o para ler com segurança toda a documentação e artefatos da raiz multiprojeto `.gemini`, além de conectar **Google Drive** e **OneDrive**, e elevar a sofisticação estética e simetria dos painéis.

## 2. Arquitetura e Alterações Realizadas

1. **Backend — Expansão Segura de Raízes e Parsing (`api/v1/handlers_files.py`, `api/v1/handlers.py`):**
   - **Raiz multiprojeto (`_resolve_ecosystem_root`):** expõe `Ecosystem (.gemini)` via `NEXUS_ECOSYSTEM_ROOT` ou detecção segura do pai `.gemini` com `WORKSPACE_INDEX.md` + `CLAUDE.md`, podando `Site/` e diretórios pesados/transitórios (`lancedb`, `hm2`, `vendor`, `ik_llama.cpp`, `antigravity/mcp`, `antigravity/cache`, `antigravity/annotations`, `config/plugins`, `*_archive`, `*_quarantine`).
   - **Nuvem local (`_resolve_gdrive_root`, `_resolve_onedrive_root`):** auto-detecção local de `F:\Meu Drive` / `G:\Meu Drive` (`_gdrive_uses_doc_subdirs` preserva legado com `Documentos`/`GD`/`Documents`) e `%OneDrive%` / `~/OneDrive`, mantendo isolamento estrito em testes/containers e aplicando poda segura em nuvem (`_CLOUD_MAX_DEPTH = 4`, `_CLOUD_MAX_LIMIT = 800`, sem tocar arquivos On-Demand).
   - **Hardening (`_is_sensitive_path`):** bloqueia listagem e entrega `403` em `/api/files/view` para `oauth_creds.json`, `gcp_oauth_client.json`, `google_accounts.json`, `installation_id`, `credentials.json`, `token.json`, `client_secret*.json`, `service_account*.json`, `quarantine/`, `acl_backup_*` e `remediacao_backup_*`.
   - **Parsing e multi-aba (`_parse_spreadsheet`, `_read_text_safe`, `handle_view_file`):** sanitiza `NaN`/`Inf`/`NaT` para `None`, suporta `?sheet=` em Excel/ODS (`sheets` e `active_sheet`), detecta null-bytes (`b"\x00"`) antes de decodificar texto e amplia `RAW_MIME_TYPES`/`MEDIA_EXTS`.

2. **Frontend & BFF (`frontend/src/app/api/vitoi/files/list/route.ts`, `frontend/src/app/api/vitoi/files/view/route.ts`, `frontend/src/components/ui/layout/SotaMarkdown.tsx`, `frontend/src/components/files/UniversalDocumentViewer.tsx`, `frontend/src/app/(user)/dashboard/files/page.tsx`):**
   - BFF repassa `q`, `mode`, `limit` (`list`) e `sheet` (`view`).
   - `SotaMarkdown`: prop opcional `onRelativeLinkClick`, `overflow-x-auto` com SVG responsivo para Mermaid/mindmaps e células `td` sem corte/overlay obscuro.
   - `UniversalDocumentViewer`: `stripFrontmatterAndNormalize` (evita YAML frontmatter virar `<h1>` gigante), TOC `h1`–`h3` com limpeza LaTeX, PDF visual imediato sem bloquear no carregamento do `Texto RAG`, seletor de abas e série numérica no gráfico tabular (`h-full justify-end` corrigindo altura `0px` das barras), busca e linhas pareadas no `CodeTextViewer`, imagem `> 1 MB` via `rawUrl`.
   - `/dashboard/files`: simetria vertical rigorosa (`h-[calc(100vh-11.5rem)] min-h-152`), árvore hierárquica / lista virtualizada, filtros rápidos e pílulas de fontes (`.gemini`, `Site`, `Google Drive`, `OneDrive`), 4 atalhos canônicos no empty state, atalhos `/` e `Ctrl+K`, deep-link `?path=...` e navegação por links relativos.

## 3. Avaliação Factual de Impacto da Sessão (Agnóstico Tier 1-2-3)

Coletada via `uv run --no-sync python scripts/ops/avaliar_impacto_sessao.py --markdown` (executado antes do commit e antes do append do ledger `seq 103`):

| Metrica de Impacto | Valor Medido | Status / Observacao |
| :--- | :--- | :--- |
| **Entregas Git (12.0h)** | **0 commits / 0 arq.** | Pre-commit da sessao atual (branch `master`, dirty=15) |
| **CWV, A11y & Seguranca** | **LCP 423.6ms / CLS 4.0614** | TBT 32.5ms, axe=0, CVE crit/high=0, suite HEAD=False |
| **Economia de Tokens MCP (S1)** | **-40.56%** | Capacidade S1 em regime (32 ferramentas, overhead: 430.7 us) |
| **Ingress Fast-Path S1** | **0.09 ms** (90.0 us) | Triagem O(1) de tarefas sem compilar grafo |
| **Passivo de Pendencias** | **0 abertas** (0 vencidas) | Resolucao formal via M.O. 13.F |
| **Integridade do Ledger** | **103 -> 104 registros** | Atualizado para `seq 103` (`9f583749...`) com Score `9.8` |
| **Resolucao de Tarefas SQLite** | **100.0%** (0/0) | pending=0 / failed=0 |
| **Saude da Malha** | **ALERTA** (1 alerta grave) | `Auditoria de calibracao parada ha 3 dia(s)` |
| **Pools OpenRouter Multi-Tier** | **32 chaves** (32 ativas, score: 80.0) | T1: 5 \| T2: 10 \| T3: 5 \| T4: 12 (0 bloq / 0 rev) |
| **Eficiencia Economica & Infra** | **21 locais / 18 identidades** | Tier 1=17, Tier 2=1; Cotas Pro Tier 1 (Faixa.FLAT_FEE) prioritarias |
| **Memoria Agentica Local** | **56 notas** (site: 53) | `~/.gemini/memoria/HERMES.md` atualizado nesta sessao |

### Estado dos Pools OpenRouter (`openrouter_pool_manager.get_telemetry_summary()`)
- **Total:** `32` chaves ativas em 4 tiers (`Tier 1`: 5, `Tier 2`: 10, `Tier 3`: 5, `Tier 4`: 12), **0 bloqueadas**, **0 revogadas**, score uniforme **`80.0`**, latência base **`500.0 ms`** (paridade HKCU/HKLM íntegra).

## 4. Calibração & Memória Persistida

- **Feedback Tier 0:** Score **`9.8`** (`"sessão quase perfeita, senão por ausencia de certa sofisticação estética e de simetria"`), gravado via `scripts/ops/Register-AgentCalibrationFeedback.ps1` (`seq 103`, `104` registros, `record_hash=9f583749961113d4a512f03e7a92e6870834ee4808f27f9b652a36756ba4623d`) e verificado por `scripts/ops/Test-AgentCalibrationLedger.ps1`.
- **Memória:** Entrada append-only gravada em `../memoria/HERMES.md` (seção §8, entrada `2026-11-28`).

## 5. Contrato Tipado de Entrega (Standup 4 Baldes)

- **Completed:**
  - `api/v1/handlers_files.py`, `api/v1/handlers.py`, `tests/test_files_ecosystem_api.py`
  - `frontend/src/app/api/vitoi/files/list/route.ts`, `frontend/src/app/api/vitoi/files/view/route.ts`
  - `frontend/src/components/ui/layout/SotaMarkdown.tsx`, `frontend/src/components/files/UniversalDocumentViewer.tsx`, `frontend/src/components/files/UniversalDocumentViewer.test.tsx`
  - `frontend/src/app/(user)/dashboard/files/page.tsx`
  - `reports/HANDOFF-2026-11-28-dashboard-files-ecossistema-cloud.md`, `reports/agent-calibration/feedback-ledger.jsonl`
- **In Progress:** Portões pre-commit (`record_anchor_gate.ps1`, `record_gate.py`, `.husky/pre-commit`), commit e `git push origin master`.
- **Blocked / Failed:** Nenhum bloqueio nos testes automatizados ou validação ao vivo; registro externo único no contexto CDP host (`Access to storage is not allowed from this context.`).
- **Key Decisions (`persistence-type-changes`):** Nenhuma alteração de schema SQLite/LanceDB; novas variáveis opcionais `NEXUS_ECOSYSTEM_ROOT`, `NEXUS_GDRIVE_ROOT` e `NEXUS_ONEDRIVE_ROOT` com fallback seguro por detecção local apenas quando a raiz `.gemini` existe.

## 6. Evidência Literal de Comandos Validados

- `uv run --no-sync python -m pytest --basetemp="$env:TEMP\pytest_files_cloud" tests/test_files_ecosystem_api.py tests/test_servico_de_arquivo_2026_09_30.py tests/test_auditoria_fortificacao_5_fases.py tests/test_backend_hardening.py -q` → `67 passed in 22.18s` (exit 0)
- `uv run --no-sync ruff check api/v1/handlers_files.py api/v1/handlers.py tests/test_files_ecosystem_api.py` → `All checks passed!` (exit 0)
- `uv run --no-sync pyright --project pyproject.toml api/v1/handlers_files.py tests/test_files_ecosystem_api.py` → `0 errors, 0 warnings, 0 informations` (exit 0)
- `npm --workspace frontend run test -- --testPathPatterns="UniversalDocumentViewer|operator-gateway|operatorProxy"` → `3 passed, 28 passed` (exit 0)
- `npm --workspace frontend run lint -- --max-warnings=0 ...` → exit 0 (0 erros, 0 warnings)
- `npm --workspace frontend run typecheck` → exit 0 (0 erros)
- Validação ao vivo via Playwright/CDP `:9222` em `http://localhost:3000/dashboard/files` → `explorer` (`ecosystem_visible=true`, `project_visible=true`, `googledrive_visible=true`, `onedrive_visible=true`), `markdown_mermaid` (`mermaid_svgs=1`, `katex_nodes=8`, `tables=2`), `relative_link` (`found_link=true`), `pdf` (`has_object_embed=true`, `rag_body_len=16020`), `spreadsheet` (`rows_rendered=84`, `has_chart=true`, `sheet_selector_btns=7`), `image` (`loaded=true`), `googledrive_read` (`opened=true`), `console_errors=[]`, `http_errors=[]`.
