---
id: handoff-2026-11-18-deps-openrouter-free-worker-hud-e-calibracao
tipo: handoff
escopo:
  "Site -- Handoff da sessao de 2026-11-18: elevacao de dependencias, disjuntor
  404 e modelos :free OpenRouter, Worker HUD SOTA, regra Orchestrator (Argon) +
  Hydrogen e calibracao 8.5"
ecossistema: nexus-sota
autor: "Gemini 4 Hydrogen <noreply@google.com>"
criado_em: "2026-11-18T09:24:00-03:00"
atualizado_em: "2026-11-18T09:24:00-03:00"
commit: HEAD
classes:
  - interno
  - handoff
  - governanca
  - worker
  - roteamento
  - calibracao
caminhos:
  - CLAUDE.md
  - data/agent_identities.json
  - reports/HANDOFF-2026-11-18-deps-openrouter-free-worker-hud-e-calibracao.md
  - reports/agent-calibration/feedback-ledger.jsonl
  - tests/test_worker_startup_shutdown.py
  - worker/loop.py
verificado:
  - "Elevacao de vitest (^5.1.1), typescript-eslint (^8.73.0) e openai
    (>=3.55.0) validada e publicada em d7f79c40"
  - "Disjuntor HTTP 404 imediato e 6 modelos :free ativos do OpenRouter
    validados (d9c1df1e)"
  - "Worker HUD refatorado em worker/loop.py com Console singleton
    compartilhado, banner grid CORE/MESH/QUEUE e telemetria live; tarefa real
    TELEMETRY-HUD-VERIFY-20261118 concluida"
  - "Feedback 8.5 do Tier 0 gravado no ledger append-only (sequence=98, 99
    registros, tail_hash 14629b25...) e validado por
    Test-AgentCalibrationLedger.ps1"
  - "Regra bifasica Orchestrator (Argon) + Executor (Hydrogen) registrada em
    data/agent_identities.json, Site/CLAUDE.md, ../CLAUDE.md e
    ../memoria/HERMES.md"
nao_verificado:
  - "Fechamento do ciclo automatico de calibracao (Record-AgentCalibration.ps1
    exige >= 3 sessoes elegiveis; pendente)"
---

# Handoff -- Sessao 2026-11-18 (Deps, Disjuntor 404 OpenRouter :free, Worker HUD, Governanca Argon/Hydrogen e Calibracao 8.5)

## 1. Resumo das Entregas na Sessao

1. **Onda 1 -- Dependencias e Higiene de Submodulo (`d7f79c40`):**
   - Elevacao de `vitest` / `@vitest/mocker` (`^5.1.1`) em `package.json` e
     `typescript-eslint` (`^8.73.0`) em `frontend/package.json`
     (`npm install --force`, preservando `vite@8.3.8` e `typescript@7.0.2`).
   - Sincronizacao de `openai>=3.55.0` em `requirements.txt` apos atualizacao do
     `pyproject.toml`, correcao de `formatUnknownError` no submodulo
     `skills/exa-mcp-server` (`1a4349d`) e reconciliacao de 10 avisos `SUSPEITO`
     com seus SHAs historicos.
   - Consolidacao da raiz multiprojeto em `../memoria/OPS_SOTA_GOLD.md`
     (`5e61aae` / `bbb4ef0` em `origin/main`).

2. **Onda 2 -- Disjuntor HTTP 404 e Novos Modelos `:free` OpenRouter
   (`d9c1df1e`):**
   - Implementado disjuntor imediato para HTTP 404 / `"no longer available"` em
     `llm/providers.py`, evitando queima sequencial de 5 chaves do pool por
     tarefa diante de rotas descontinuadas (como ocorreu com `@chico` em
     `EGM-DRIFT-2026-W47`).
   - Substituidos os 4 modelos `:free` descontinuados por 6 modelos `:free`
     ativos no OpenRouter (`nvidia/nemotron-3-ultra-550b-a55b:free`,
     `google/gemma-4-31b-it:free`, `google/gemma-4-26b-a4b-it:free`,
     `cohere/north-mini-code:free`, `nvidia/nemotron-3.5-lightning:free`,
     `inclusionai/ling-3.2-flash:free`) em `data/system_config.json`,
     `data/routing_map.json`, `core/config.py`, `core/subagents_mesh.py`,
     `llm/free_router.py`, `llm/orchestrator.py`, `llm/routing.py` e
     `engine/llm_api.py`.
   - Blindagem `not m.endswith(":free")` nos classificadores `_is_local_model`,
     `_infer_provider_for_model`, `_score_math`, `_score_curadoria` e
     `_score_inteligencia` de `llm/routing.py` para eliminar colisoes por
     substring (`31b`, `flash`) com rotas locais Ollama ou tiers pagos.

3. **Onda 3 -- Refatoracao Tecnica, Estetica e Telemetrica do Worker HUD
   (`worker/loop.py`):**
   - Compartilhamento de singleton `Console` entre `RichHandler`
     (`task_executor.py`) e `console.status` (`worker/loop.py`), substituindo
     subprocessos `cls`/`clear` por `console.clear()` para eliminar sobreposicao
     ANSI.
   - Banner inicial em `Table.grid` com linhas `CORE`, `MESH` e `QUEUE`
     (`_build_boot_panel`) e HUD vivo em `_update_terminal_status` exibindo
     uptime (`_format_uptime`), rotas/chaves bloqueadas nos pools OpenRouter e
     descritores das tarefas ativas (`_ACTIVE_TASKS_META`).
   - Cobertura unitaria ampliada em `tests/test_worker_startup_shutdown.py` e
     execucao real verificada via worker desacoplado (`Win32_Process.Create`)
     com a tarefa `TELEMETRY-HUD-VERIFY-20261118` concluida.

4. **Onda 4 -- Calibracao Tier 0 (`8.5`), Regra
   `Orchestrator (Argon) + Hydrogen` e Handoff:**
   - Registrado feedback do Tier 0 (`Score = 8.5`, `sequence = 98`,
     `99 registros`,
     `tail_hash = 14629b25622148f0003fb0b5539aa8b2967945aa7daf540200c85b6b246be966`)
     para a sessao `a5ca72c9-1d47-451d-be0b-8b156fc3d1a9`, cobrando maior
     metacognicao ativa e _zoom-out_ sistemico antes da execucao linear.
   - Documentada a regra bifasica do modo **Orchestrator (Argon)** em
     `CLAUDE.md`, `data/agent_identities.json`, `../CLAUDE.md` e
     `../memoria/HERMES.md`: quando **Gemini 4 Argon** planeja em _Plan Mode_ e
     **Gemini 4 Hydrogen** executa, a autoria primaria do Git
     (`user.name="Gemini 4 Hydrogen"`) e a linha `Assinatura:` pertencem sempre
     ao agente executor, cabendo ao planejador a co-autoria explicita via
     `Co-authored-by: Gemini 4 Argon <noreply@google.com>`.

## 2. Panorama Quantitativo Medido (`avaliar_impacto_sessao.py --forcar-benchmark`)

| Eixo                                   | Medicao Observada                                           | Observacao                                                   |
| :------------------------------------- | :---------------------------------------------------------- | :----------------------------------------------------------- |
| Entregas Git (12h antes do fechamento) | 7 commits / 109 arquivos (+6984/-1129)                      | Branch `master` em sincronia com `origin/master`             |
| CWV / A11y / CVE                       | LCP 336.5ms, CLS 5.5189, TBT 32.5ms, axe=0, CVE crit/high=0 | SOTA GOLD aprovado                                           |
| Economia S1 MCP (`--forcar-benchmark`) | -40.56% tokens (32 ferramentas, overhead 352.6 us)          | Warmup descartado                                            |
| Ingress Fast-Path S1                   | 0.0778 ms (77.8 us)                                         | Triagem O(1) sem compilar grafo                              |
| Passivo de Governanca                  | 0 pendencias abertas / 0 vencidas                           | Reducao 100.0%                                               |
| Ledger de Calibracao                   | 99 registros (tail `14629b25`)                              | Gate 0 sessoes no lastro D-1; TimesFM `INSUFFICIENT_HISTORY` |
| Pools OpenRouter Multi-Tier            | 28 chaves totais / 28 ativas (score medio 80.0)             | T1: 4 \| T2: 7 \| T3: 5 \| T4: 12 (0 bloq / 0 rev)           |
| Eficiencia Economica & Identidades     | 21 modelos locais / 17 identidades canonicas                | Tier 1=16, Tier 2=1                                          |
| Memoria Agentica                       | 56 notas (53 no Site)                                       | Entrada 2026-11-18 gravada em `../memoria/HERMES.md`         |

## 3. Calibracao do Tier 0 e Licao Operacional

- **Nota:** `8.5` | **Escopo:** `handoff` | **Sessao:**
  `a5ca72c9-1d47-451d-be0b-8b156fc3d1a9`
- **Feedback:** _"acredito que houve falta de meta-cognicao e zoom-out para
  olhar de forma sistemica, como calibramos ontem."_
- **Acao corretiva estrutural:** Em toda alteracao de catalogo, dependencias ou
  roteamento, mapear imediatamente os consumidores, classificadores de string e
  manifests espelhados (`requirements.txt` <-> `pyproject.toml`,
  `llm/routing.py` <-> `data/system_config.json`) e emitir o Selo Metacognitivo
  (`MC - C<id>`) nos desvios de galho ou acoplamentos transversais.

## 4. Proximos Passos para o Sucessor

- Acumular sessoes elegiveis adicionais no ledger ate atingir o quorom minimo
  (`>= 3`) antes de invocar `Record-AgentCalibration.ps1` e alimentar os pontos
  do `TimesFM`.
- Monitorar no worker residente (`worker-api` na porta `17042`) a distribuicao
  real de chamadas entre os 6 novos modelos `:free` do OpenRouter em proximos
  ciclos semanais (`EGM-DRIFT`).
