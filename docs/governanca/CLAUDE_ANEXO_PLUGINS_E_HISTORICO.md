---
id: docs-governanca-claude-anexo-plugins-e-historico
tipo: registro
escopo: Anexo historico e tabelas detalhadas do CLAUDE.md para manter o nucleo abaixo de 46.000 B sem perda de evidencias medidas
autor: Gemini 4 Hydrogen <noreply@google.com>
criado_em: '2026-11-22T14:40:00-03:00'
atualizado_em: '2026-11-22T18:41:00-03:00'
verificado:
- tests/test_governanca_kernel_ponteiro.py e tests/test_governanca_agents.py verdes apos modularizacao de CLAUDE.md
nao_verificado:
- Nenhum pendente no escopo deste anexo
referencias_nao_resolviveis:
- nucleo/nucleo_compartilhado.json
- config/config.json
title: "Anexo Operacional do CLAUDE.md — Histórico Medido, Plugins, Pools e Calibração"
type: technical
status: active
owner: site-governance
updated_at: 2026-11-22
---

# Anexo Operacional do `CLAUDE.md` — Histórico Medido, Plugins, Pools e Calibração

> Anexo modular criado para manter [`../../CLAUDE.md`](../../CLAUDE.md) abaixo do teto de truncamento do harness Hermes (`< 46.000 B`) preservando 100% do lastro histórico, evidências medidas e tabelas detalhadas sem perda de informação. Todas as regras normativas e endereços `§0..§10` permanecem em [`../../CLAUDE.md`](../../CLAUDE.md).

---

## 1. Doutrina Detalhada de Tiers, Primazia da Base e Autoria (`§0`)

- **Tiers 0..7:** A composição viva dos membros reside em [`../../data/model_catalog.json`](../../data/model_catalog.json), [`../../data/agent_identities.json`](../../data/agent_identities.json), [`../../llm/model_registry.py`](../../llm/model_registry.py) e [`../../data/ollama_models.json`](../../data/ollama_models.json).
- **Preços de assinatura medidos em 2026-09-07:** Anthropic Pro `\$20`, Max 5x `\$100`, Max 20x `\$200`; OpenAI Plus `\$20`, Pro `\$100` (5x), Pro `\$200` (20x). Refinação periódica delegada à tríade fast (`Gemini 3.5 Flash-Lite+` / `ChatGPT 6.0 Luna+` / `Claude Haiku 5.5+`).
- **Primazia da Base:** Runtimes locais (`Ollama` local, `:cloud` descontinuado em 2026-11-10; `llama.cpp` com Qwen quantizado; `Hermes Agent` roteando modelos free como Laguna com sufixo `b`, blindados da calibração) absorvem trabalho massivo para poupar GPU/infraestrutura cloud e blindar a energia cognitiva do Tier 0 ($\text{Topo} \longrightarrow \text{Base} \longrightarrow \text{Topo} \longrightarrow \infty$).
- **Invariante de Identidade Residual no Git (2026-08-30, 2026-09-10, 2026-09-12):**
  - `2026-08-30`: commits saíram com e-mail do administrador; CodeRabbit gravou `Learnt from: RaphaelVitoi`.
  - `2026-09-10`: sessão Gemini assinou como `Codex GPT-5` por `.git/config` local residual.
  - `2026-09-12`: `user.email` residual `noreply@openai.com` em sessão Opus 5 (`21ef0373`). Reapontamento da configuração local arbitrado pelo Tier 0; `commit-msg` passou a bloquear ausência de `Assinatura:` e divergência Autor vs. Assinatura (16 de 40 commits anteriores não traziam a linha), enquanto autor fora do catálogo e divergência de número de Tier emitem aviso (`tests/test_hook_commit_msg.py`).
  - Motivo medido do catálogo de identidades: o repositório havia acumulado 20 grafias para ~5 agentes (`Claude`, `Claude Opus 5`, `Codex`, `Codex GPT-5`, `Codex [Tier 1.B]`, `Gemini 3.8 Flash`, `Gemini 3.8 Flash High`, `Chico SOTA v8.0 GOLD`).
- **Modo bifásico `Orchestrator` (2026-11-21):** Duo canônico `Gemini 4 Neon` (ou `Argon`) planejador $\rightarrow$ `Gemini 4 Hydrogen` executor. A `Assinatura:` primária e `-c user.name` pertencem ao Executor; o Planejador recebe `Co-authored-by:`; na calibração registra-se como `conductor_model="orchestrator:<planejador>+<executor>"`.

---

## 2. Notas Históricas de Portões, Dependências e Roteamento (`§1..§3`)

- **Bateria substituta PS 5.1 (`§1.1`):** Aprovar em `Test-Ps51CompatibilidadeSubstituta` não consome vaga do teto de warnings (`Ps51PorBateria` em INFO), porém comandos/classes exclusivas do PS 7 seguem exigindo validação em Windows antes de release.
- **`suite_verde.py` (`§1.1.1`):** Medido em 2026-09-12 ("quase uma hora para commit e push" por medição dupla). Chaveia pelo SHA da árvore (`--ignore-submodules=none` por causa dos submódulos `skills/` com `ignore = dirty`), armazenado em `.git/sota-suite-verde`. CI sempre executa completo.
- **Merges no `record_gate.py` (`§1.2`):** Medido em 2026-09-01 no merge `.cerebro` $\rightarrow$ `.claude` (15 âncoras herdadas em 12 caminhos idênticos ao remoto). `caminhos_herdados_de_merge()` restringe revisão de âncoras ao que difere de todos os pais (`tests/test_record_gate_merge.py`).
- **Modelos retirados e faixa (`§3`):** `claude-fable-5-1` (retirado em 2026-09-07 por faixa de acesso, antes primário em `SESSAO_MULTI_DIA`) e `gpt-6-astra` (`esforcos_autorizados`: `low`/`medium`). Documentação derivada `.claude/agents/*.md` é gerada por `scripts/routines/sync_agents_reality.ps1`.
- **Pools de Chaves (`§3.1`):** Inventário completo e `sha8` em [`../POOLS-DE-CHAVES.md`](../POOLS-DE-CHAVES.md) e `data/credential_registry.json`. Pendentes pools Anthropic/OpenAI (`pend-2026-11-10-key-pools-api`). Fórmula adaptativa:
  $$\text{Score} = (\text{Taxa de Sucesso } \%) - \min\left(\frac{\text{Latência Média}}{100}, 30\right) - \min(15 \times \text{Falhas Consecutivas}, 50)$$
- **Status das assinaturas flat-fee (`§3.2`, 2026-11-12):** Anthropic Pro/Max e OpenAI Plus/Pro temporariamente desativadas (`cota_por_assinatura=False`); Google AI Studio Pro e Devin Desktop SWE-2 Flash Medium ativas.

---

## 3. Tabela de Contratos de Plugins, Perfis Aposentados e Hooks (`§8.0..§8.1.1`)

> A lista habilitada vive exclusivamente em [`../../nucleo/nucleo_compartilhado.json`](../../../nucleo/nucleo_compartilhado.json) e [`../../config/config.json`](../../../config/config.json) (nunca repetir contagem ou lista ativa como SSOT em prosa).

| Modo | Camada | Plugin | Contrato operacional |
| :--- | :--- | :--- | :--- |
| DEFAULT | Orquestração | `superpowers` | Especificação, plano, TDD, debugging e delegação; não decide segurança do produto. |
| DEFAULT | Engenharia de plugins | `plugin-dev` | Alterações em skills, comandos, hooks, MCP e manifests; validar antes de distribuir. |
| DEFAULT | Web | `modern-web-guidance` | APIs nativas, acessibilidade, performance e compatibilidade; base técnica do frontend. |
| DEFAULT | Design | `frontend-design` | Direção visual, tipografia, tokens e UX; não substitui A11y, testes ou CWV. |
| DEFAULT | Código | `typescript-lsp` | Diagnósticos, definição e referências TS/JS; somente fonte de verdade do LSP. |
| DEFAULT | Runtime web | `playwright` | Smoke/E2E e evidência visual; migrou para MCP compartilhado (`:8931`). |
| OPCIONAL | Segurança de API | `42crunch-api-security-testing` | OpenAPI, conformance, BOLA/BFLA; desinstalado nos perfis em 2026-09-17. |
| DEFAULT | Segurança de código | `claude-security` | Threat model, findings verificados e patches em scratch; sem auto-aplicação. |
| DEFAULT | Revisão | `code-review` | Revisão de PR; comentário via `gh` exige autorização explícita separada. |
| OPCIONAL | Plataforma | `vercel` | Contexto Next/Vercel read-only; desinstalado dos perfis em 2026-09-17. |

- **Perfis aposentados (2026-09-17):** `hyperframes` (3,19 GB cache), `codspeed`, `browser-use`, `amd-skills`, `42crunch`, `vercel` removidos; `remember`, `datahub-skills`, `desktop-commander`, `endor-labs-agent-kit` fora.
- **Hooks (`§8.1.1`):** Malha `superbased-observer` ausente (`observer.exe` e `C:\Users\rapha\.observer\config.toml` inexistentes; medido em 2026-09-18 que `"hooks": {}` não existia). Único hook exclusivo ativo no núcleo é o interceptador de reincidência `PreToolUse` sobre `Bash` (caminhos sempre em `/` POSIX, validado por `test_comando_de_hook_nunca_usa_barra_invertida` após falha silenciosa de `\` em 2026-09-17).

---

## 4. Detalhamento Histórico da Calibração (`§8.3`)

- **Correção de escala decimal (2026-09-02):** Sessão `claude-opus5-site-2026-09-02-integridade` teve nota `8` gravada como `0.8`; `Record-AgentCalibrationCorrection.ps1` registra correções append-only e `New-AgentCalibrationDailyEvidence.ps1` as aplica antes de contar (`correcoes_no_ledger`, `correcoes_aplicadas`).
- **Momentos da sessão (2026-09-12):** `Prelúdio` (início, sujeito a compacts, não é ausência definitiva de nota como `2d55d92a`), `Interlúdio` (desvio autorizado/emergencial sem contaminar o eixo), `Handoff` (onde reside a nota). Todos compartilham `session_id` e `session_started_at`.
- **Paridade `conductor_model` vs `conductor_vehicle` (2026-09-11):** Separados após incidente da sequência 16 (`Codex GPT-6`). Superfícies compartilhadas (`Antigravity IDE` em `%APPDATA%\Antigravity IDE\User\globalStorage`, VS Code) não identificam condutor; o runtime `Antigravity 2.0` grava em `~\.gemini\antigravity\conversations\<id>.db`.
- **Proveniência executável e corrida diária (2026-09-12):** `AgentCalibrationProvenance.ps1` valida família $\leftrightarrow$ veículo (`hermes-agent`, `ollama`, `llama-cpp` têm modelo local livre). Corrida às 23:59 (`Register-AgentCalibrationDailyTask.ps1`) grava lastro mesmo insuficiente. Prompt da automação Codex (`~/.codex/automations/calibra-o-di-ria-de-coer-ncia-ag-ntica/automation.toml`) reconciliado em 2026-09-12 para avaliar acumulado de 3 sessões em PowerShell 7+ (resolvendo divergência `512fc3a6` de 09-06/09-10/09-12).
- **Apoio quantitativo:** Núcleo Monte Carlo Rust/WASM, CFR iterativo e Google Research TimesFM 2.0 (`Invoke-AgentCalibrationQuantitativeSupport.ps1`, `nexus agent calibration-forecast` $H=3$); `Record-AgentCalibrationOutlier.ps1` retém outliers sem descarte ou promoção automática.

---

## 5. Lastro de Taxonomia e Régua Jules / `Bolt ⚡` (`§9..§10`)

- **Pendências (`§9.2`):** Caso medido em 2026-08-28 (`patches/skills/README.md` invisível por 14 dias) levou à adoção de `pendencias:` e `pendencias_resolvidas:` no frontmatter lido pelo `record_gate.py` (`tests/test_record_index.py`).
- **Sessão Jules `14536923137986406349` (2026-09-05) e commit `4d90a05b` (`§10`):** Motivaram as 5 travas de segurança (`useQuantumEngine.ts` 18 números / O(N³), `NashPanel.tsx` `ActionRow` inline), memória em `.claude/agent-memory/bolt/MEMORY.md` (nunca `.jules/`), bloco `Assinatura: google-labs-jules[bot]` no corpo do commit, e exigência de merge local revisado para execução real das 5 fases do `cwv_gate.ps1`.
