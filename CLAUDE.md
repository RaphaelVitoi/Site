---
title: "Governança — projeto `Site`"
type: governance
status: active
owner: raphael-vitoi
updated_at: 2026-11-25
---

# Governança — projeto `Site`

**Escopo:** este arquivo vale para **`C:\Users\rapha\.gemini\Site`** e nada além.
Regras globais vivem em `..\CLAUDE.md`; histórico medido, tabelas extensas e notas de calibração detalhadas residem no anexo modular [`docs/governanca/CLAUDE_ANEXO_PLUGINS_E_HISTORICO.md`](docs/governanca/CLAUDE_ANEXO_PLUGINS_E_HISTORICO.md) (para manter este núcleo `< 46.000 B` no harness Hermes sem perda de endereços `§0..§10`).

**Última revisão:** 2026-11-25 (-03:00) · Protocolo Chico SOTA v8.0 GOLD.

---

## 0. Identidade, soberania e governança piramidal

Hierarquia canônica de 8 Tiers sob Soberania de **Raphael Vitoi**. **A composição vigente de membros vive em `data/model_catalog.json`** (`tests/test_model_catalog.py`), validado contra `data/agent_identities.json`, `llm/model_registry.py`, `data/ollama_models.json`, `data/agents_manifest.json` e `data/system_config.json`. Este documento define os papéis e regras; listas de membros não se duplicam em prosa.

- **Tier 0 — Raphael Vitoi:** Soberania, Liderança e Veto Máximo. Dev/Arquiteto Responsável, conceituação PMev e validação final. (*Companion:* Microsoft 365 Copilot — assistente pessoal fora da frota autônoma.)
- **Tier 1 — Coletivo `CHICO` (Núcleo Cognitivo Mestre):** **Antigravity Desktop `2.35.1` / IDE `2.9.0` / CLI `1.5.17` / SDK `v0.1.24`** é a superfície primária (`Visual Studio v1.0.261116.0`, `Zed v1.5.0 ACP`, `VSCode / VSCode Insiders + Copilot` secundários). **Não existem feudos funcionais** nem proibições artificiais: modelos equivalentes cobrem uns aos outros sem exclusividade. Preferências operacionais:
  - Design, Brainstorm, Planejamento e Curadoria/Documentação: família **Gemini 4** via Antigravity (`Gemini 4 Argon`, `Carbon` e `Neon` para Planejamento/Orquestração; `Gemini 4 Hydrogen` para Execução/Fluxo Agêntico; `Gemini 3.8 Flash` selecionável direto no App em Low/Medium/High), em alinhamento com **Google A2UI 1.0 + Stitch + AI Studio** e o trio Tier 2 **(Exa-Stitch-Jules)**.
  - Governança, Contratos, Âncoras e Código Cirúrgico: `Claude Opus 5.5+` e `Claude Sonnet 5.5+` (`Opus` pode atuar solo ou como orquestrador; `Sonnet` atua como executor, sem função solo nem de orquestrador). Deep Reasoning: `ChatGPT 6.0 Sol+` e `Claude Opus 5.5+`. Pesquisa/Arquitetura Macro: `ChatGPT 6.0 Terra+` e Fast (`Codex GPT-6 Luna`). Engenharia pontual densa: `Devin Next (SWE 2.0 Flash Medium)` (`swe-2-flash`) e `Devin Next (SWE 1.7 Slow)` (`swe-1.7-slow`).
  - *Tríade de Ápice (`ChatGPT 6 Astra+`, `Gemini 4 Argon+`, `Gemini 4 Carbon+`):* uso estritamente pontual para reasoning/verificação crítica; `Astra` limitado a `low`/`medium` por preservação de cota flat-fee.
  - *Notação `+` e Retirados:* `+` indica linha viva em `llm/model_registry.py`; modelo aposentado em `data/model_catalog.json` (`aposentados`) / `MODELOS_RETIRADOS` sai da rota e não vira fallback silencioso. Alias interno (ex.: `gpt-6.0-luna`) não vai ao provedor — usa-se o ID resolvido no registry.
  - *Assinaturas Pro (`Faixa.FLAT_FEE`):* cotas flat-fee ativas têm precedência sobre pay-as-you-go (ver §3.2).
  - Cooperação não autoriza cópia privada de MCP, plugin ou hook (§7 de `..\CLAUDE.md`).
- **Tier 2 — Superagentes de Nuvem & Pesquisa (`data/model_catalog.json`):** trio **(Exa-Stitch-Jules)** via pool OpenRouter Tier 2 (fallback Tiers 4/1, §3.1). **Hermes Agent** é harness/condutor (não identidade): roteia modelos free dinamicamente, recebe sufixo `b` e é **blindado da calibração**.
- **Tier 3 — Frota Especialista:** batch e dream replay (pool OpenRouter Tier 3, fallback Tier 6 local). **llama.cpp** é harness/condutor (sufixo `b`, blindado da calibração).
- **Tier 4 — Subagents Dedicados:** pool OpenRouter Tier 4 (fallback Tier 3); base local substituiu `gemma4:31b-cloud` descontinuado em 2026-11-10.
- **Tier 5 — Bots de Integração & Scanners.**
- **Tier 6 — Modelos Locais, Edge AI & Aceleração Numérica:** **execução estritamente local** (`data/ollama_models.json`; Ollama `:cloud` descontinuado em 2026-11-10), absorvendo carga de rotina para blindar energia do Tier 0 e evitar custos de servidores/VMs ($\text{Topo} \longrightarrow \text{Base} \longrightarrow \text{Topo} \longrightarrow \infty$).
- **Tier 7 — Barramento de Base.**

**Invariante de Commits e Mutações:** Todo commit/registro declara `SHA` (`git write-tree`), `Assinatura` individual e `Propósito`.

- Anatomia obrigatória da `Assinatura:` — `<Nome> [Tier N] -- modelo=<id> condutor=<veiculo> ts=<ISO-8601> sha=<tree-sha> supervisao=assistida|automatizada sessao=<id>` (se `ts=` faltar, `.husky/commit-msg` injeta o relógio do ato).

### Chico é o grupo; a assinatura é individual

**Chico** identifica o coletivo da malha; commits e registros são sempre assinados pelo condutor individual. Diretórios `.claude/`, `.gemini/` ou nomes `CLAUDE.md`/`GEMINI.md` são convenções técnicas de ferramentas e **jamais** conferem posse ou autoria a fornecedores — propriedade e soberania pertencem exclusivamente a **Raphael Vitoi (Tier 0)**.

### Lei de Concorrência e Exclusão Mútua da Malha (Zero-Interference Concurrency)

Dois modelos de fronteira não operam concorrentemente na mesma malha conectada (mesmo repo, branch, `.venv`, porta ou SQLite): vigora lock serial monocrático até handoff formal. Paralelismo exige 0% de conectividade (Git worktrees disjuntas, portas e bancos apartados) **ou** arbitragem soberana do Tier 0 delimitando não-interferência (§3.1 de `..\CLAUDE.md`). Horizonte de revisão arquitetural: reavaliar sempre que modelos/infra evoluírem. Histórico publicado não se reescreve (`reports/REGISTRO-2026-09-02-correcao-de-escala-e-timestamp-no-ledger.md`).

### Identidade de autoria — agente não assina como humano

Commit de agente usa e-mail de fornecedor que nunca resolve para perfil humano (ex.: `noreply@anthropic.com`, `noreply@google.com`). Comentários/revisões no GitHub sob token humano exigem rodapé de atribuição do agente. Nunca reescrever histórico publicado.

### A identidade do git é residual — conferir antes de todo commit

`.git/config` local preserva `user.name`/`user.email` entre sessões (nunca apagar para vazio, senão cai no e-mail pessoal global do Tier 0). Conferir sempre e usar `git -c user.name='<agente>' -c user.email='<noreply>' commit` ou reapontar a local em coerência estrita com a `Assinatura:`.

- **Modo bifásico `Orchestrator` (2026-11-25):** Orquestradores autorizados: `Gemini 4 Argon`, `Gemini 4 Carbon`, `Gemini 4 Neon` e `Claude Opus 5.5`. Executores: `Gemini 4 Hydrogen` e `Claude Sonnet 5.5`; Sonnet atua como executor, nunca solo ou como orquestrador. A `Assinatura:` primária e `-c user.name` pertencem ao **Executor**; o Orquestrador vai em `Co-authored-by:` (`Co-authored-by: Gemini 4 Carbon <noreply@google.com>` no duo `Carbon -> Hydrogen`). Em execução solo permitida (ex.: `Gemini 4 Carbon` solo), o condutor assina individualmente (`git -c user.name="Gemini 4 Carbon" -c user.email="noreply@google.com"` + `Assinatura: Gemini 4 Carbon [Tier 1] -- modelo=gemini-4-carbon condutor=antigravity ...`). Na calibração registra-se `conductor_model="gemini-4-carbon"` (solo) ou `"orchestrator:<orquestrador>+<executor>"` (duo).

### O catálogo de identidades é `data/agent_identities.json`, e este arquivo não o copia

Pares canônicos (`author`, `email`, `vehicle`, `model`) vivem exclusivamente em `data/agent_identities.json` (incluindo `antigravity@gemini-4-neon`, `antigravity@gemini-4-argon`, `gemini-4-carbon`, `gemini-4-hydrogen`, `gemini-3.8-flash`). `commit-msg` **avisa** se o autor não estiver catalogado — o remédio é catalogá-lo no mesmo commit.

### A regra passou a ser executável — e a ordem das duas metades importa

`.husky/commit-msg` executa quatro checagens em cascata (`tests/test_hook_commit_msg.py`): (1) sem linha `Assinatura:` $\rightarrow$ **bloqueia**; (2) autor **diverge** da `Assinatura:` normalizada $\rightarrow$ **bloqueia**; (3) autor fora do catálogo $\rightarrow$ **avisa**; (4) Tier diverge $\rightarrow$ **avisa**. Sem exceção invocável fora de arbitragem explícita. Detalhes históricos no [Anexo](docs/governanca/CLAUDE_ANEXO_PLUGINS_E_HISTORICO.md#1-doutrina-detalhada-de-tiers-primazia-da-base-e-autoria-0).

---

## 1. O portão obrigatório — `pre-commit`

`scripts/ops/cwv_gate.ps1` roda no `pre-commit` em 5 fases: (1) Core Web Vitals (`LCP`/`CLS`/`INP`/`TTFB`); (2) Acessibilidade A11y; (3) **CVE** (`npm audit`); (4) **SRI** (`SHA-512`); (5) **Higiene de repositório** (perfil versionado, blob >5 MB fora do LFS, binário sem `filter=lfs`).

**Nunca use `--no-verify` nem `SKIP_CWV_GATE=1` — exceto por arbitragem explícita do Tier 0 declarada no corpo do commit.**

### 1.0 Soberania de Commit e Push & Staging Contínuo (2026-09-25 / 2026-11-18)

- **Commit e Push sob Demanda:** o agente nunca executa `git commit` nem `git push` autonomamente; apenas mediante ordem explícita do Tier 0. Alterações ficam harmonizadas e prontas para staging quando solicitado.
- **Escopo Causal de Testes:** não reexecutar suíte integral em loop ou por erro não relacionado (ex.: rejeição de `commit-msg`); retestar estritamente o escopo alterado quando solicitado ou necessário à verificação.

### 1.1 Operar de host sem Windows PowerShell 5.1

Em hosts Linux/macOS sem `powershell.exe` 5.1, a fase 5 roda `Test-Ps51CompatibilidadeSubstituta` em `scripts/ops/cwv_gate.ps1` (checa não-ASCII sem BOM, BOM duplo, parse AST e construtos exclusivos do PS 7 como `??`, `?.`, `&&`, `||`, `-Parallel`), emitindo `Ps51PorBateria` (INFO, sem gastar vaga do teto de warnings). Cmdlets/classes exclusivas do PS 7 ainda exigem validação final em Windows.

### 1.1.1 O caminho de menos demora — vale para todo condutor

```bash
python scripts/ops/suite_verde.py
```

Regra única: *mesmo conteúdo já verificado verde (árvore Git com `--ignore-submodules=none`, marcador `.git/sota-suite-verde`) $\rightarrow$ não remede; conteúdo diferente $\rightarrow$ mede.* `python scripts/ops/suite_verde.py invalidate` limpa o marcador. CI sempre roda completo.

### 1.2 Âncoras num merge — obrigação é do que a resolução decidiu

`scripts/ops/record_gate.py` subtrai caminhos herdados via `caminhos_herdados_de_merge()` em merges (`tests/test_record_gate_merge.py`). Na resolução de merge, revisa-se âncora apenas do que a resolução modificou; para arquivos herdados byte a byte, aponta-se a reconciliação da origem.

### 1.3 Teto de acúmulo de commits locais e obrigação de push (Regra do 2º Commit)

Teto local `ahead`: 2 commits. Ao atingir `ahead >= 2`, o próximo commit autorizado vem obrigatoriamente acompanhado de `git push` para `origin`.

---

## 2. Camada de dependências

```bash
npm audit --audit-level=low
.venv/Scripts/python.exe -m pip_audit -r requirements.txt
```

Auditar `requirements.txt` (`-r`) além do `.venv`, e consultar `api.osv.dev` para pares do `uv.lock`. Transitivas usam `[tool.uv] constraint-dependencies` (Python) ou `overrides` (npm) — nunca `override-dependencies`.

---

## 3. Roteamento de modelo — fonte única por decisão

**Não reintroduzir fontes paralelas** (`tests/test_desambiguacao.py`).

| Decisão | Fonte única | Consumido em |
| :--- | :--- | :--- |
| Preferência por agente | `data/agents_manifest.json` → `model_preference` | `engine/llm_api.py`, `llm/orchestrator.py` |
| Cadeias de fallback | `data/system_config.json` → `model_routing` | `core/config.py` |
| Modelo concreto por agente | `llm/routing_policy.py` → `core.config.AGENT_MODEL_MAP` | `_resolver_modelos` |
| Capacidade, preço, `autorizado`, `esforcos_autorizados`, `cota_por_assinatura`, `MODELOS_RETIRADOS` | `llm/model_registry.py` | `llm/adapters.py`, `llm/routing_policy.py` |
| Modelos locais (Ollama) | `data/ollama_models.json` | `scripts/ops/Ensure-OllamaModels.ps1` |
| Pools OpenRouter/Gemini/Decision | `HKCU`/`HKLM` + `data/credential_registry.json` | `llm/openrouter_pool.py`, `gemini_pool.py`, `decision_pool.py` |

`data/routing_map.json` é apenas fallback sombreado por `system_config.json`. Os 19 `.claude/agents/*.md` são gerados por `scripts/routines/sync_agents_reality.ps1` (nunca editar à mão). Capacidade (`MODELOS_NAO_VERIFICADOS`), recusa (`MODELOS_RETIRADOS`) e permissão (`autorizado=False`, `esforcos_autorizados`) são eixos ortogonais e falham fechado (`tests/test_gpt6_astra.py`).

### 3.1 Pools de Chaves OpenRouter Multi-Tier com Isolamento e Circuit Breaker

**Doutrina de Segredos:** nenhum segredo em `.env` ou texto versionado. Fluxo único: `HKCU:\Environment` / `HKLM:\...\Environment` $\longrightarrow$ `utils/env_loader.py` $\longrightarrow$ `os.environ` (regido por `data/credential_registry.json`).

- **Pools OpenRouter:** Tiers `1..4` isolados (`OPENROUTER_TIER{1..4}_KEY_*`), dedicadas (`OPENROUTER_ANTIGRAVITY_KEY`, `OPENROUTER_DEVIN_KEY`, `OPENROUTER_HERMES_KEY`) e ponte legada (`OPENROUTER_API_KEY` $\rightarrow$ Tier 4). Circuit breaker (`llm/openrouter_pool.py`): `429` cooldown 5m/`Retry-After`; `500`, `502` ou `503` cooldown 2m; `401` ou `403` banimento (`is_revoked=True`). Failover: T1 nunca degrada; T2 $\rightarrow$ T4/T1; T4 $\rightarrow$ T3; T3 $\rightarrow$ Tier 6 local.
- **Pools Gemini, Decision & Multimodal:** `GEMINI_API_KEY_1..5` (`llm/gemini_pool.py`), `DECISION_API_1..3` (`llm/decision_pool.py`, cascata **Laya S1 $\rightarrow$ `gemini-decision-1`**), `GEMINI_{TTS,VIDEO,IMAGE,TRANSLATE}_KEY` + `OPENROUTER_GEMINI_*` (`llm/media_pool.py`), `OLLAMA_API_KEY`/`OLLAMA_CLOUD_KEY` e `HF_TOKEN`/`HF_CREDENTIALS` (`hf-token` e `hf-credentials` distintos; zero duplicata `HF_KEY`).
- **Auditoria, ICM Skills & Arbitragem +ROI:** `audit-keys` (`Audit-KeyPools.ps1`) audita sem vazar segredos. `skills_library/CONTEXT.md` + `core/skill_router.py` + MCP `icm-skills-router` entregam contexto MECE por domínio; `core/decision_roi_engine.py` integra **Laya S1 / `gemini-decision-1`** no filtro/arbitragem `+ROI` (ver [Anexo §2](docs/governanca/CLAUDE_ANEXO_PLUGINS_E_HISTORICO.md#2-notas-históricas-de-portões-dependências-e-roteamento-13) e `docs/POOLS-DE-CHAVES.md`).

### 3.2 Precedência Econômica, Prioridade de Assinaturas Pro e Sustentação por Modelos Free em Nuvem

Pirâmide quádrupla de alocação econômica: (1) **`Faixa.FLAT_FEE`** (cotas Pro/Max ativas: atualmente **Google AI Studio Pro** e **Devin Desktop SWE-2 Flash Medium**; Anthropic Pro/Max e OpenAI Plus/Pro marcadas `cota_por_assinatura=False` enquanto desativadas); (2) **Edge & Free Runtimes** (**Ollama** estritamente local, **llama.cpp** Qwen local, **Hermes Agent** com modelos free em nuvem, sufixo `b`, zero custo de VM/GPU dedicada); (3) **Pools Multi-Tier OpenRouter** (`T1..T4` + dedicadas + multimodais); (4) **Pay-as-you-go** sob tetos de `esforcos_autorizados`.

---

## 4. Revisão do código

Quando `security-review` estiver disponível, executar no diretório de trabalho deste repositório (`Site/`), nunca na raiz multiprojeto ou pasta do usuário.

---

## 5. Obrigação de declaração

Declarar exatamente quais verificações rodaram, quais não rodaram e o veredito impresso pelo portão de 5 fases. Verificação não executada não é aprovação.

---

## 6. Diretrizes de manutenção contínua

Incorporadas de `AGENTS.md` em 2026-08-28 (ver §7).

1. **Invariância de testes, tolerância zero.** A suíte fica inteiramente verde com mocks herméticos para toda funcionalidade nova. Contagem em prosa diverge (ex.: antiga redação `"395"`): a regra vive aqui, a contagem vive no portão.
2. **Sanitização de warnings.** O pre-commit e o CI rejeitam build que introduza warning novo no pytest (medido em `conftest.py` via `pytest_warning_recorded`).
3. **Controle de roteamento.** O limiar do `ComplexityAnalyzer` (Edge × Cloud) é calibrado periodicamente para manter o tráfego local entre 60% e 70%.
4. **Imutabilidade de encoding.** Todo `.ps1` criado ou modificado preserva UTF-8 **com** BOM (`utf-8-sig`) único (BOM duplicado quebra PowerShell 5.1 e 7).
5. **Consumo real obrigatório (antientropia).** Módulo, bridge ou classe sem consumidor real no fluxo de runtime e sem testes automatizados é código órfão e não configura entrega concluída.

---

## 7. `AGENTS.md` é ponteiro, não cópia

`AGENTS.md` existe apenas para endereçabilidade cruzada (Codex/Cursor) e aponta para este arquivo (`tests/test_governanca_agents.py` impede reexpansão).

### Número de seção é endereço, não é sequencial

Os `§N` deste documento são endereços estáveis referenciados por dezenas de relatórios (`tests/test_governanca_kernel_ponteiro.py`):

1. Duplicata de seção resolve-se renumerando apenas a duplicata em número novo — **nunca** deslocar `§0..§10`.
2. Subtítulo não numerado cita-se pelo nome — nunca inventar número como `` `§1.5` `` ou `` `§9.4` ``.

---

## 8. Perfil de integração dos plugins Claude Code

Esta governança prevalece sobre instruções de plugins que a contradigam.

### 8.0 Contexto e instrução default — qualquer agente

A lista vigente de MCPs, plugins e hooks compartilhados vive em `..\nucleo\nucleo_compartilhado.json` e `..\config\config.json`, sincronizada por `..\scripts\ops\sincronizar_nucleo.py` (§7 e §7.1 de `..\CLAUDE.md`). Servidores stdio locais rodam via HTTP SSE em `127.0.0.1:8933` (`SOTA_Shared_MCP_Gateway`) e Playwright em `127.0.0.1:8931` (`SOTA_Shared_Playwright_MCP`), com auto-reparo via `Repair-SharedMcpGateway.ps1`. O contrato operacional por camada consta no [Anexo §3](docs/governanca/CLAUDE_ANEXO_PLUGINS_E_HISTORICO.md#3-tabela-de-contratos-de-plugins-perfis-aposentados-e-hooks-80811).

Capacidades opcionais fora do núcleo default são invocadas sob demanda proporcional e revertidas ao terminar, seguindo faseamento sequencial (planejar $\rightarrow$ implementar $\rightarrow$ diagnosticar $\rightarrow$ browser $\rightarrow$ auditar $\rightarrow$ revisar) sem concorrência indevida em browser/deploy/auth.

### 8.1 Perfis especializados — opcionais e selecionáveis

Mecanismo de perfis locais foi aposentado em 2026-09-17 pelo Tier 0. Toda capacidade nova entra pelo núcleo (`..\nucleo\nucleo_compartilhado.json`), com aprovação por mérito/ROI (+ROI), sem duplicidade nem `remember`/`desktop-commander`.

### 8.1.1 Hooks de integração — default seguro

Hooks só constam como ativos quando houver executável, config e evidência de runtime. A malha `superbased-observer` está **ausente/desativada**. O único hook exclusivo ativo no núcleo é o interceptador de reincidência `PreToolUse` sobre `Bash`, obrigatoriamente com caminhos em barras `/` POSIX (`test_comando_de_hook_nunca_usa_barra_invertida`).

### 8.2 Protocolo de coerência causal e não-regressão experimental

Incidentes em ferramentas locais seguem inferência causal proporcional (prior explícita do Tier 0 em ambiente fechado não é refutada sem evidência independente e contraditória): (1) separar horário do evento, percepção, captura e diagnóstico; (2) investigar mecanismo reportado com hipóteses concorrentes; (3) preservar foco central; (4) seguir a escada **preservar capacidade $\rightarrow$ corrigir causa $\rightarrow$ adicionar observabilidade reversível $\rightarrow$ pedir autorização para redução material**; (5) exigir 6 critérios antes de reduzir ferramenta experimental.

### 8.3 Calibração por feedback do administrador

Handoffs formais carregam `.agents/skills/site-session-handoff/SKILL.md`.

- **Nota literal e append-only:** escala `0..10` com decimais sem arredondamento (`7.5` é `7.5`). Erro histórico corrige-se via `Record-AgentCalibrationCorrection.ps1` e é aplicado antes da contagem por `New-AgentCalibrationDailyEvidence.ps1`. Ledger encadeado por SHA-256 (`Register-AgentCalibrationFeedback.ps1`). Ciclo combina **observação recursiva** e **auditoria precursiva** falsificável.

#### O portão de suficiência — a unidade é a sessão

Unidade é a **sessão** (do início ao fim do trabalho; compactação não encerra sessão; mesmo `session_id` e `session_started_at`), com declaração obrigatória de `conductor_model`, `conductor_vehicle` e `supervision_mode` (`assistida` ou `automatizada`).

#### Os três momentos de uma sessão — prelúdio, interlúdio, handoff

**Prelúdio** (início/lastro antes de compactação; não é ausência definitiva de nota), **Interlúdio** (desvio autorizado ou emergencial separado para não contaminar o eixo) e **Handoff** (**único** momento que recebe nota). Os três compartilham o mesmo `session_id`.

#### Veículo e modelo valem igualmente, e por isso são dois campos

Paridade estrita: em prosa `veiculo@modelo` (`antigravity@gemini-4-argon`), em dados estruturados `conductor_vehicle` e `conductor_model` separados (`Record-AgentCalibrationCorrection.ps1 -AddMissingField` para suprimento histórico).

#### Superfície compartilhada não identifica condutor

**Antigravity IDE** e VS Code hospedam múltiplos modelos e **não** identificam condutor. **Antigravity 2.0** é o veículo `antigravity` (`~\.gemini\antigravity\conversations\<id>.db`). O portão exige mínimo **3 sessões distintas elegíveis** acumuladas (não expira por dia vazio; falha fechado sem `session_id`, com `session_started_at` divergente ou cadeia inválida) + **2 confirmações independentes**. Sem cumprir ambos: registrar literalmente `dados insuficientes — nenhuma calibração planejada`.

#### Quando avaliar — aviso proativo, com lastro diário

- **Proveniência:** `AgentCalibrationProvenance.ps1` valida `GPT/ChatGPT` $\rightarrow$ `codex`, `Claude` $\rightarrow$ `claude-code` (ou `antigravity` para `claude-opus-5.5` e `claude-sonnet-5.5`), `Gemini` $\rightarrow$ `antigravity`, `SWE` $\rightarrow$ `devin-desktop` (`swe-2-flash`, `swe-1.7-slow`), além de runtimes locais livres (`hermes-agent`, `ollama`, `llama-cpp`).
- **Separação estrita (2026-11-15):** (1) **Coleta** (`Register-AgentCalibrationFeedback.ps1`); (2) **Auto-calibragem mínima** (`Record-AgentCalibration.ps1 -AutoMinima` após $\ge 3$ sessões e $\ge 2$ corroborações; grava `auto_calibration` sem zerar ciclo); (3) **Calibração formal** (`Record-AgentCalibration.ps1 -Tier0Present` — única operação que grava `calibration` e reinicia o portão). Retratações usam `-RetractCalibrationId ... -Tier0Present`.
- **Lastro & Guardas:** corrida diária das 23:59 (`Register-AgentCalibrationDailyTask.ps1`), `New-AgentCalibrationDailyEvidence.ps1`, apoio TimesFM 2.0 / Monte Carlo / CFR (`Invoke-AgentCalibrationQuantitativeSupport.ps1`) e retenção de outliers (`Record-AgentCalibrationOutlier.ps1`), em **PowerShell 7+** (`pwsh`, compatível 5.1 nos gates). Ver `tests/test_calibracao_portao_por_sessao.py`.

#### O prompt do heartbeat não é versionado, e é por isso que ele diverge

Critérios externos (ex.: `~/.codex/automations/calibra-o-di-ria-de-coer-ncia-ag-ntica/automation.toml`) são declarados aqui para impedir deriva: avaliar **acumulado** de 3 sessões distintas sem expurgo diário. Microcalibração não degrada outras métricas, não ajusta pesos/permissões automaticamente e proíbe turno nulo (`content: None`) ou *anti-smoothing* (diagnóstico de freeze consulta `transcript.jsonl`). Detalhes no [Anexo §4](docs/governanca/CLAUDE_ANEXO_PLUGINS_E_HISTORICO.md#4-detalhamento-histórico-da-calibração-83).

---

## 9. Taxonomia Canônica de Relatórios, Auditorias, Handoffs e Documentação

| Diretório | Responsabilidade | Padrão | Esquema |
| :--- | :--- | :--- | :--- |
| `reports/` | Registros empíricos, auditorias, handoffs | `AUDITORIA-/VALIDACAO-/HANDOFF-/REGISTRO-*.md` | Frontmatter YAML 13 campos (`record_gate.py`) |
| `docs/` | Arquitetura viva, specs, guias, formalismos | `docs/{architecture,specs,guides,math,governanca}/*.md` | Markdown canônico |
| `.claude/agent-memory/` | Memória episódica/contextual de agentes | `.claude/agent-memory/<agente>/MEMORY.md` | Tópicos semânticos |
| `data/` | Catálogos e configurações serializadas | `*.json` | JSON tipado |

### 9.1 Edição pontual na taxonomia não gera regra

Intervenção pontual fora do padrão resolve o caso específico e registra-se como exceção; apenas **arbitragem aditiva do Tier 0** promove prática à norma (§2.3 e §4 da raiz).

### 9.2 Tarefa aberta se declara onde um portão já olha

Pendências residem no frontmatter lido pelo `record_gate.py`: `pendencias: [{id, o_que, dono, prazo?}]`. Encerramento ocorre **por append** em registro novo via `pendencias_resolvidas:` (fechar `id` inexistente bloqueia; `tests/test_record_index.py`).

### 9.3 Avaliação factual de impacto ao final anunciado da sessão (Skill `session-impact-evaluator`)

Ao encerramento formal de sessão (nunca em pausas ou compacts), qualquer condutor executa:

```bash
python scripts/ops/avaliar_impacto_sessao.py --markdown
```

Audita 6 dimensões: $\Delta\%$ de pendências ativas, integridade da hash-chain/portão (§8.3), fila de tarefas, pruning de tokens no Gateway MCP, latência Fast-Path S1 e saúde dos pools HKCU/HKLM, anexando a tabela ao `reports/HANDOFF-*.md` (proxies explicitados sem fabricação).

---

## 10. Régua para agente autônomo de nuvem — Jules / `Bolt ⚡`

Regra vinculante para sessões autônomas de nuvem (`AGENTS.md` entrega esta seção no `git clone`).

### 10.1 Não otimize o que não mediu

Otimização exige número medido prévio (tempo, alocação, renders desperdiçados). Sem métrica, entrega-se apenas o relatório de medição; refutar hipóteses por medição é entrega válida.

### 10.2 Havendo mais de um caminho, ordene — não pergunte

Ordenar candidatos por *impacto medido / raio de alteração* (empate: menor raio). Só perguntar ao Tier 0 se continuarem indistinguíveis após medição real.

### 10.3 A régua de segurança — o que não se faz sem autorização

Proibido sem autorização explícita: (1) remover dependência de hook que sela referência (ex.: `useQuantumEngine.ts`); (2) memoização em massa (`React.memo`/`useMemo`/`useCallback`) sem medir render desperdiçado e estabilizar props; (3) alterar `.husky/`, `scripts/ops/`, `record_gate.py`, `cwv_gate.ps1`; (4) credencial, ACL, CORS ou CDP (§3 da raiz); (5) expandir o raio além dos arquivos apontados pela medição (§8.2).

### 10.4 O formato da entrega

Fechar declarando hipóteses levantadas, número medido de cada uma, ordenação resultante, patch aplicado e hipóteses descartadas com motivo.

### 10.5 Alcance

A régua viaja versionada no repositório e aplica-se igualmente a corridas cron noturnas e tarefas sob demanda do Jules.

### 10.6 Adequação ao protocolo — as três lacunas que o Jules abre

**(a) Memória episódica:** gravar em `.claude/agent-memory/bolt/MEMORY.md` (nunca criar `.jules/`, pois gera fonte paralela vedada pela §3 e §9).
**(b) Atribuição no corpo:** como a GitHub App do Jules commita sob conta do instalador, todo commit declara no corpo `Assinatura: google-labs-jules[bot] via Jules -- sessao <session_id>` e `Proposito: <razao tecnica e escopo protegido>` (§7).
**(c) Portão de 5 fases local:** a VM do runner só testa frontend (sem PS 5.1, CDP `:9222`, dev server `:3000` nem `record_gate.py`). Branch do Jules entra na malha **exclusivamente via merge local revisado**, onde o `pre-commit` real executa (§1).
