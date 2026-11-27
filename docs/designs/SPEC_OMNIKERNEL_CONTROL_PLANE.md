---
id: spec-2026-11-27-omnikernel-control-plane
tipo: spec
escopo: Site
ecossistema: nexus-sota
autor: Gemini 4 Hydrogen
criado_em: '2026-11-27T11:00:00-03:00'
atualizado_em: '2026-11-27T11:30:00-03:00'
classes: [interno, spec, control-plane]
caminhos:
  - docs/designs/SPEC_OMNIKERNEL_CONTROL_PLANE.md
  - control_plane/config.py
  - control_plane/service.py
  - control_plane/mcp_tools.py
verificado:
  - "Suite unitaria control_plane: 21/21 testes aprovados com 0 erros e 0 warnings"
  - "Benchmark local de latencia deterministica: p95 = 0.704 ms (meta <= 120 ms)"
  - "Benchmark A/B live 30 tarefas com Gemini: 30/30 (Braco B) vs 28/30 (Braco A), p95 = 3.691 ms, zero_regression_verified = True"
nao_verificado:
  - "Carga concorrente multi-worker sobre SQLite WAL (execucao serial monocratica conforme Site/CLAUDE.md)"
  - "Binding C opcional z3-solver ausente na .venv (executando via fallback deterministico BuiltinLinearGate)"
---

# `NEXUS-OMNIKERNEL v1.1-EVOLVED` — Especificacao Arquitetural

**Status:** Ativo (evolucao nativa sobre `Site/`)  
**Runtime:** Windows 11 nativo (`Site/.venv`, Python 3.12+/3.14, `uv`, SQLite WAL + NumPy BLAS)  
**Exposicao MCP:** Namespace `ok_*` no servidor `icm-skills-router` via Gateway Compartilhado (`127.0.0.1:8933`)  

---

## 1. Axioma e Compatibilidade de Tiers

Nenhum LLM detem autoridade sobre estado persistente, topologia de execucao, memoria de longo prazo ou criterio de aceite. Modelos de linguagem atuam exclusivamente como executores *stateless* entre contratos executaveis ($\mathcal{K}_V^{\text{bt}}$) e o controlador deterministico em malha fechada ($\Pi_\epsilon^{\text{CRC}}$).

Para preservar integralmente a piramide de **8 Tiers** de `Site/CLAUDE.md` §0 e `governance/KERNEL.md` (onde `Tier 0` = Raphael Vitoi, `Tier 1` = Coletivo CHICO, `Tier 6` = Edge/Local), o plano de controle adota **`ComputeLane`** ortogonal para roteamento computacional:

| `ComputeLane` | Papel Computacional | Custo / Precedencia Economica (`Site/CLAUDE.md` §3.2) |
| :--- | :--- | :--- |
| `L0_DET` | Parsing AST, SQLite $O(1)$, `DreamGate`, ruff/pyright, Z3, testes unitarios | \$0.00 (CPU local) |
| `L1_EDGE_ECON` | Execucao rotineira, classificacao estruturada, boilerplate | Edge local (`Tier 6` / Ollama / Laya S1) -> `Faixa.FLAT_FEE` |
| `L2_FRONTIER` | Sintese arquitetural complexa e escalonamento por `INJECT_ASYMMETRY` | `Tier 1` CHICO sob `Faixa.FLAT_FEE` / Pools OpenRouter |
| `L3_MUTATOR` | Falsificador adversarial cego ($\mathcal{E}_{\text{mut}}$), recebe apenas $\langle \mathcal{K}_V^{\text{bt}}, \text{artefato} \rangle$ | Acionado em `COMMIT_PROD`, `EXTERNAL_TOOL` ou `INJECT_ASYMMETRY` |

---

## 2. Correcoes de Engenharia sobre o Blueprint v1.0-GOLD

1. **Runtime Windows 11 Nativo:** Executa no `.venv` canonico de `Site/` sem acordar VM WSL2 nem pagar I/O 9P sobre NTFS.
2. **Pre-Filtered Vector Search (`semantic_chunks`):** Vetores `float32` em `BLOB` + `embedding_dim` + `model_id` na propria tabela com filtro SQL estrito (`bucket_id`, `ttl_expires_at`) **antes** da similaridade de cosseno em NumPy BLAS (elimina falso vazio de pos-filtragem em `vec0` global e dispensa extensao C externa).
3. **SPACE SVD Ortogonalizado ($U_r^+, U_m^-$) Seguro:** Calcula $A_{\perp}^{-} = A^{-} - U_r^+(U_r^{+T} A^{-})$ sem materializar matriz densa $d \times d$, descarta normas $< 10^{-3}$, re-normaliza colunas sobreviventes antes da SVD e aplica guarda de cold-start quando $n_+ < 4$ (*anti-anchor-only*).
4. **CRC Monotonico 1D com Soberania §8.3:** Parametro unico $\lambda \in [0, 1]$ acoplado ao escore escalar de deriva $D_{\text{drift}}(e) = \max(1 - S_{\text{id}}(e), S_{\text{viol}}(e))$ (ou $S_{\text{viol}}(e)$ em cold-start positivo). Para `COMMIT_PROD` e `EXTERNAL_TOOL`, relaxamento exige `tier0_present=True` (`calibration_mode='tier0_formal'`); caso contrario grava apenas `auto_calibration` sem afrouxar o piso.
5. **Equivalencia Hibrida Segura:** Curto-circuito para $k < 2$ (`SINGLE`, $R=1.0$); codigo/estruturado via `(canonical_ast_or_json_hash, test_vector)`; texto via implicacao bidirecional com agrupamento *complete-linkage* (`Laya S1` / detector deterministico de polaridade `>=` vs `<`, `permitir` vs `bloquear`).
6. **Portao SMT/Z3 Blindado:** AST declarativo whitelist (`QF_LIA`/`QF_LRA`, sem multiplicacao variavel$\times$variavel) com timeout rigido de `50 ms` (`z3-solver` opcional com fallback `BuiltinLinearGate` exato para intervalos e proposicoes).
7. **Idempotencia Dupla e Envelope Bifasico:** `UNIQUE(run_id, node_id, attempt)` + `idempotency_key UNIQUE` impedem bypass de `max_retries`; `PromptStructureOptimizer.build_bifasic_envelope` garante `prefix_hash` SHA-256 imutavel em todo o `run_id`.

---

## 3. Topologia de Integracao e Endpoints MCP (`ok_*`)

O pacote `control_plane/` acopla-se diretamente aos consumidores ativos de `Site/`:
- **Buckets Iniciais:** Os 7 dominios ICM de `core/skill_router.py`.
- **Cascata de Oraculos (`F_casc`):** `S0_SYNTAX` (`DreamGate` + AST/JSON/Target Lock) $\to$ `S05_Z3` (`z3_gate`) $\to$ `S1_UNIT` (`test_case` de $\mathcal{D}_{\text{crit}}$ + suite local) $\to$ `S2_ADVERSARIAL` ($\mathcal{E}_{\text{mut}}$ cego).
- **Loop Lento:** Integrado ao `memory/replay_buffer.py` (`PrioritizedReplayMemory`) e acionado pela Fase 4 do `scripts/ops/autopoietic_daily_cycle.py` com coleta de `human_edit_ratio` / `reverted` e KPIs Go/No-Go.
- **MCP (Gateway `127.0.0.1:8933`):** Registrado em `engine/skills_mcp_server.py` com os 7 endpoints fechados:
  `ok_register_canonical_artifact`, `ok_bootstrap_run_context`, `ok_resolve_serial`, `ok_search_bucket_semantic`, `ok_evaluate_node_checkpoint`, `ok_record_human_feedback`, `ok_run_slow_loop_cycle`.
- **CLI Unificada:** Subcomando `nexus control-plane {init,status,run-slow-loop,kpis,benchmark-latency}` em `scripts/cli/nexus.py`.

---

## 4. Criterios Objetivos Go/No-Go

| KPI | Meta Minima | Medicao |
| :--- | :---: | :--- |
| Taxa de Entrega Verificada | $\ge 92\%$ | Runs `COMMITTED` com `reverted = 0` e `human_edit_ratio <= 0.15` |
| Custo Medio por Entrega | $\le 0.45\times$ | `SUM(total_cost_usd) / COUNT(valid_commits)` vs baseline |
| Taxa de Cache Hit no Prefixo | $\ge 75\%$ | `SUM(cached_tokens_in) / SUM(total_tokens_in)` |
| Latencia Local do Control Plane | $p_{95} \le 120\text{ ms}$ | `nexus control-plane benchmark-latency` (sem S1/S2 externo) |
| Regressao Pos-Evolucao | $0.0\%$ em $\mathcal{D}_{\text{crit}}$ | Flag obrigatoria `zero_reg_verified = 1` em `map_elites_archive` |
