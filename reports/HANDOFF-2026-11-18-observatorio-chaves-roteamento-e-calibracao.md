---
id: handoff-2026-11-18-observatorio-chaves-roteamento-e-calibracao
tipo: handoff
escopo:
  "Site -- Handoff da sessao de 2026-11-18: expansao dos pools OpenRouter
  (Tier 1=5, Tier 2=10), paridade 87/87 HKCU/HKLM, chave legada
  OLLAMA_CLOUD_KEY, skill e observatorio Rich/Nexus audit-keys, otimizacao
  bidirecional de roteamento e calibracao 9.5"
ecossistema: nexus-sota
autor: "Gemini 4 Hydrogen <noreply@google.com>"
criado_em: "2026-11-18T12:30:00-03:00"
atualizado_em: "2026-11-18T12:30:00-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - handoff
  - auditoria
  - governanca
  - roteamento
  - observatorio
  - calibracao
caminhos:
  - .agents/skills.json
  - .agents/skills/key-pool-audit/SKILL.md
  - .agents/skills/key-pool-audit/scripts/Audit-KeyPools.ps1
  - .agents/skills/key-pool-audit/scripts/render_key_audit.py
  - .claude/agents/securitychief.md
  - CLAUDE.md
  - api/v1/handlers.py
  - api/v1/server.py
  - cli/commands.py
  - data/agents_manifest.json
  - database/queue_manager.py
  - do.ps1
  - docs/INDEX.md
  - docs/POOLS-DE-CHAVES.md
  - docs/SCRIPTS_E_COMANDOS_DASHBOARD.md
  - engine/llm_api.py
  - frontend/src/app/(user)/dashboard/page.tsx
  - frontend/src/app/api/sota/key-pools/route.ts
  - frontend/src/app/api/sota/nexus-mesh/route.ts
  - frontend/src/components/analytics/NexusKeyPoolsPanel.test.tsx
  - frontend/src/components/analytics/NexusKeyPoolsPanel.tsx
  - llm/budget.py
  - llm/key_observatory.py
  - llm/ollama_cloud.py
  - llm/openrouter_pool.py
  - llm/orchestrator.py
  - llm/providers.py
  - reports/AUDITORIA-2026-11-18-pools-chaves-observatorio-e-roteamento.md
  - reports/HANDOFF-2026-11-18-observatorio-chaves-roteamento-e-calibracao.md
  - reports/agent-calibration/feedback-ledger.jsonl
  - scripts/ops/Set-OpenRouterKeyPools.ps1
  - scripts/setup/Setup-NexusProfile.ps1
  - tests/test_governanca_skills.py
  - tests/test_openrouter_pools.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: "a025efc1-d6ea-4fd3-bf19-a3f676f31e95"
  session_started_at: "2026-11-18T10:53:00-03:00"
  condutor: "Gemini 4 Hydrogen <noreply@google.com>"
  modelo: gemini-4-hydrogen
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-18
verificado:
  - "Paridade 87/87 variaveis em 11 pools ativos entre HKCU e HKLM (0 FAIL, 0 WARN, 0 InvalidFmt) via cmd /c audit-keys -AnomaliesOnly -Strict (exit 0)"
  - "Sonda live audit-keys -Pool Tier1 -Live validou 5/5 chaves OpenRouter Tier 1 com HTTP 200 (media 101 ms); servicos locais probeados: Ollama :11434 UP (197 ms), API :17042 UP (19 ms), Gemma :17043 UP (11 ms)"
  - "Pyright (0 errors, 0 warnings, 0 informations), Ruff check/format (All checks passed), ESLint e TypeScript tsc --build (exit 0) aprovados apos edicoes finais"
  - "Pytest direcionado (test_openrouter_pools.py, test_llm_layer_sota.py, test_media_pool.py, test_decision_pool.py, test_gemini_pool.py, test_task_routing.py): 81 passed in 7.57s, 0 erros, 0 warnings; test_governanca_skills.py: 10 passed in 7.59s, 0 erros, 0 warnings"
  - "Jest frontend (NexusKeyPoolsPanel.test.tsx, NexusOperationsPanel.test.tsx): 2 passed, 2 total (0 erros, 0 warnings)"
  - "Quality Gate 5 fases (npm run sota:audit / cwv_gate.ps1): SUCESSO (VERDE), LCP 310.38ms, CLS 0.000168, TBT 32.496ms, TTFB 100.66ms, MAX_HEAP 20.50MB, axe=0 violations (1 incomplete REVIEW APPROVED), 0 CVEs crit/high/py, SRI VERIFIED"
  - "Feedback 9.5 do Tier 0 gravado no ledger SHA-256 (sequence=99, 100 registros, tail 90d881411ffdcecacb9d8709f8b08f7d0b60dfb7cc64e04dea1133c5ccce42cb) e validado por Test-AgentCalibrationLedger.ps1"
nao_verificado:
  - "Record-AgentCalibration.ps1 nao executado por exigir quorum minimo (>= 3) de sessoes elegiveis acumuladas no ledger apos o lastro de referencia"
  - "Ollama Cloud API endpoint remoto em modo offline sem sonda externa paga completa em todos os provedores pagos; sonda HTTP live executada especificamente no Tier 1 OpenRouter e sockets locais"
---

# Handoff -- Sessao 2026-11-18 (Observatorio de Chaves/Pools, Paridade 87/87 HKCU/HKLM, Roteamento Bidirecional e Calibracao 9.5)

> **Relatorio detalhado da auditoria e especificacao tecnica:** ver [AUDITORIA-2026-11-18-pools-chaves-observatorio-e-roteamento.md](AUDITORIA-2026-11-18-pools-chaves-observatorio-e-roteamento.md) e o inventario mascarado consolidado em [docs/POOLS-DE-CHAVES.md](../docs/POOLS-DE-CHAVES.md).

## 1. Resumo Executivo das Entregas

1. **Paridade Estrutural no Registro (`87/87`) e Expansao OpenRouter (`32` chaves / `4` Tiers):**
   - `OPENROUTER_TIER1_KEY_2` rotacionada (`sha8 22eba9b5`) e `OPENROUTER_TIER1_KEY_5` (`34b51f77`) adicionada -> Tier 1 consolidado em **5 chaves**.
   - `OPENROUTER_TIER2_KEY_8..10` (`a89d74b3`, `3639dfc3`, `4145ccc4`) adicionadas -> Tier 2 consolidado em **10 chaves**.
   - Chave legada anteriormente divergente em `HKLM\OLLAMA_API_KEY` preservada e promovida para `OLLAMA_CLOUD_KEY` (`OLLAMA_KEYS = 2`), com `OLLAMA_API_KEY` unificada entre `HKCU` e `HKLM`.
   - `OPENROUTER_API_KEY` (`9669414e`) desacoplada do Tier 1 e dedicada ao Tier 4 para preservar a cota cognitiva do Tier 1; `HF_TOKEN`, `SOTA_OPENAI_API_KEY`, `SOTA_SITE_TOKEN` e tuning Ollama RX 570 (`q8_0`/`2`/`32768`/`1`) sincronizados com broadcast `WM_SETTINGCHANGE`.

2. **Skill `key-pool-audit`, CLI Global `audit-keys` e Painel Rich SOTA:**
   - Criada a skill `.agents/skills/key-pool-audit/` (`SKILL.md`, `Audit-KeyPools.ps1`, `render_key_audit.py`) e wrapper global `C:/Users/rapha/.gemini/bin/audit-keys.cmd` (mascaramento estrito prefixo/sufixo + `sha8`).
   - Modo offline + telemetria SQLite (`audit-keys`), sonda live com latencia ms (`audit-keys -Live`), filtro por pool (`-Pool Tier1`), filtro estrito de anomalias (`-AnomaliesOnly -Strict`) e saida JSON (`-Json`).

3. **Otimizacao Bidirecional de Roteamento ("Ida e Volta"):**
   - **Ida:** `llm/orchestrator.py` protege Tier 1 (`_resolve_openrouter_tier` / `_resolve_openrouter_keys_for_task`: compressao em Tier 3, subagentes em Tier 4); `llm/openrouter_pool.py` isola `OPENROUTER_API_KEY` em Tier 4 com cursor round-robin adaptativo (`_tier_cursors`, `DEFAULT_COOLDOWN_402`, `has_available_key`); `database/queue_manager.py` + `llm/budget.py` eliminam N+1 SQLite via `get_keys_recent_stats_batch` (`json_each`); `llm/providers.py` consulta singletons vivos (`gemini_pool_manager`, `openrouter_pool_manager`, `OLLAMA_KEYS`).
   - **Volta:** `_notify_pool_success` e `_notify_pool_failure` alimentam os pool managers em memoria imediatamente apos sucesso/falha HTTP/timeout, e `OpenRouterStrategy.check_quarantine` respeita isolamento em memoria + backoff `Retry-After`/`402`.

4. **Integracao Harmonica ao Nexus e Dashboard Next.js (`/dashboard`):**
   - Backend: `llm/key_observatory.py`, rotas autenticadas `GET` e `POST /api/v1/keys/observatory` (`api/v1/handlers.py`, `api/v1/server.py`), comando CLI `audit-keys`/`nexus-audit-keys` (`cli/commands.py`), switches `-AuditKeys`/`-Live` (`do.ps1`) e funcao `nexus-audit-keys` (`Setup-NexusProfile.ps1`).
   - Frontend: `/api/sota/key-pools/route.ts`, no de observatorio integrado em `/api/sota/nexus-mesh/route.ts`, componente `NexusKeyPoolsPanel.tsx` em `frontend/src/app/(user)/dashboard/page.tsx` e testes unitarios em `NexusKeyPoolsPanel.test.tsx`.

## 2. Panorama Quantitativo Medido (`avaliar_impacto_sessao.py --forcar-benchmark`)

| Eixo | Medicao Observada | Observacao |
| :--- | :--- | :--- |
| Entregas Git (12.0h pre-commit) | 6 commits / 80 arquivos (+6969/-1103) | Branch `master`, WORKING TREE pronto para publicacao |
| CWV / A11y / CVE (`cwv_gate.ps1`) | LCP 310.4ms, CLS 0.0002, TBT 32.5ms, TTFB 100.7ms | axe=0 (1 incomplete REVIEW APPROVED), CVE crit/high/py=0, SOTA VERDE |
| Economia S1 MCP (`--forcar-benchmark`) | -40.56% tokens (32 ferramentas, overhead 294.4 us) | Warmup descartado |
| Ingress Fast-Path S1 | 0.0747 ms (74.7 us) | Triagem O(1) sem compilar grafo |
| Passivo de Governanca | 0 abertas / 0 vencidas (reducao 100.0%) | Saude da malha: SAUDAVEL (0 alertas graves) |
| Ledger de Calibracao | 100 registros (tail `90d88141`) | Sequence 99 Score 9.5 gravado; TimesFM `INSUFFICIENT_HISTORY` (0/4) |
| Pools OpenRouter Multi-Tier | 32 chaves totais / 32 ativas (score medio 80.0) | T1: 5 \| T2: 10 \| T3: 5 \| T4: 12 (0 bloq / 0 rev) |
| Paridade de Registro HKCU/HKLM | 87/87 sincronizadas em 11 pools ativos | 0 InvalidFmt \| 0 FAIL \| 0 WARN (`audit-keys -AnomaliesOnly -Strict` exit 0) |
| Memoria Agentica | 56 notas (53 no Site) | Entradas 2026-11-18 gravadas em `../CLAUDE.md` e `../memoria/HERMES.md` |

## 3. Calibracao do Tier 0 e Licao Operacional

- **Nota:** `9.5` | **Escopo:** `handoff` | **Sessao:** `a025efc1-d6ea-4fd3-bf19-a3f676f31e95`
- **Event ID:** `bf1b16bc-7c35-4800-b9c4-1a9608e35eca` | **Sequence:** `99` (`100` registros)
- **Hash:** `90d881411ffdcecacb9d8709f8b08f7d0b60dfb7cc64e04dea1133c5ccce42cb`
- **Feedback Tier 0:** _"eficiencia e criatividade bem sofisticadas"_
- **Licao operacional consolidada:** A sinergia entre observabilidade deterministica sem vazamento de credenciais (`key-pool-audit` + `/api/v1/keys/observatory` + `NexusKeyPoolsPanel`), protecao estrita do Tier 1 e feedback imediato de ida/volta nos pool managers reduz desperdicio de cota e tempo de diagnostico sem sacrificar seguranca nem tipagem estrita (`pyright` + `tsc`).

## 4. Deliverables & Proximos Passos para o Sucessor

- `deliverables`:
  - `.agents/skills/key-pool-audit/` (`SKILL.md`, `Audit-KeyPools.ps1`, `render_key_audit.py`) e wrapper `C:/Users/rapha/.gemini/bin/audit-keys.cmd`
  - `llm/openrouter_pool.py`, `llm/providers.py`, `llm/orchestrator.py`, `llm/budget.py`, `llm/ollama_cloud.py`, `llm/key_observatory.py`, `database/queue_manager.py`, `engine/llm_api.py`
  - `api/v1/handlers.py`, `api/v1/server.py`, `cli/commands.py`, `do.ps1`, `scripts/setup/Setup-NexusProfile.ps1`, `scripts/ops/Set-OpenRouterKeyPools.ps1`
  - `frontend/src/app/api/sota/key-pools/route.ts`, `frontend/src/app/api/sota/nexus-mesh/route.ts`, `frontend/src/components/analytics/NexusKeyPoolsPanel.tsx`, `NexusKeyPoolsPanel.test.tsx`, `frontend/src/app/(user)/dashboard/page.tsx`
  - `docs/POOLS-DE-CHAVES.md`, `docs/INDEX.md`, `docs/SCRIPTS_E_COMANDOS_DASHBOARD.md`, `CLAUDE.md`, `reports/AUDITORIA-2026-11-18-pools-chaves-observatorio-e-roteamento.md`
- Reiniciar sessoes de terminal antigas caso ainda exibam o alerta `INFO` de processo herdado para `OPENROUTER_API_KEY`.
- Acumular sessoes elegiveis adicionais no ledger de calibracao ate atingir o quorum minimo (`>= 3`) para `Record-AgentCalibration.ps1` e `TimesFM`.
