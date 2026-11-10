---
id: handoff-2026-11-10-boot-persistente-mesh-mcp-e-cockpit
tipo: handoff
escopo: persistencia-boot-reboot-task-scheduler-shim-acp-mcpbrowser-gateway-dedup-backend-job-object-laya-health
autor: Devin (SWE-2 Flash) [Tier 2] <158243242+devin-ai-integration[bot]@users.noreply.github.com>
criado_em: '2026-11-10'
classes:
  - interno
  - medido
  - governanca
  - handoff
  - ops
  - mcp
  - lifecycle
verificado:
  - Task agendada SOTA_Ecosystem_AutoStart registrada e disparada manualmente com LastTaskResult=0
  - Boot log ~/.gemini/logs/sota-boot-autostart.log registrou todas as etapas concluidas
  - Shim agy_acp_server.exe compilado e handshake ACP initialize validado (1053 bytes, Antigravity ACP Server v1.5.4)
  - mcpbrowser@1.10.110 instalado em tools/mcp-runtime, exposto via gateway :8933 e initialize MCP respondido
  - sincronizar_nucleo.py --aplicar propagou mcpbrowser para todos os hospedeiros sem divergencia
  - Backend :17042 reduzido a instancia unica (par zumbi de 07:42 eliminado)
  - /health do Laya :8192 medido de ~520-2650ms para 1-3ms apos cache do perfil de hardware
  - cdp_cors_proxy.py :9224 e sota_orchestrator.py :9333 spawnados via Win32_Process.Create sobreviveram >2min apos morte do shell pai (antes morriam em ~1-2min via Start-Process)
  - 10/10 portas do ecossistema OPEN em verificacao final
nao_verificado:
  - Comportamento do Devin apos reinicio da IDE com mcp_config.json sem chrome-devtools-mcp e MCPBrowser stdio (serao servidos via config compartilhado :8933)
  - Eficacia do auto-cura §2.10 do Invoke-SotaAutopoieticMesh.ps1 em producao de longo prazo
  - Screenshot referida pelo usuario nao estava anexada a sessao
config_medida:
  congelada_em: '2026-11-10'
  raiz: C:/Users/rapha/.gemini
  projetos: [C:/Users/rapha/.gemini, C:/Users/rapha/.gemini/Site]
  branch_raiz: main
  branch_site: master
  data_das_medicoes: '2026-11-10'
  toolchain: PowerShell 7, csc.exe .NET Framework 4.x, node, uv, record_gate.py
  python: 3.14.9
  so: Windows
caminhos:
  - scripts/ops/Install-SOTA-EcosystemAutoStart.ps1
  - scripts/ops/agy_acp_server.cs
  - scripts/ops/Start-SOTA-Background.ps1
  - scripts/ops/Invoke-SotaAutopoieticMesh.ps1
  - nucleo/nucleo_compartilhado.json
  - tools/mcp-runtime/package.json
  - scripts/ops/ensure-dev-backend.mjs
  - scripts/ops/homologar_laya_gpu.py
  - scripts/ops/Start-LayaService.ps1
  - .vscode/settings.json
referencias_nao_resolviveis:
  - scripts/ops/Install-SOTA-EcosystemAutoStart.ps1
  - scripts/ops/Start-SOTA-Background.ps1
  - scripts/ops/Invoke-SotaAutopoieticMesh.ps1
  - nucleo/nucleo_compartilhado.json
  - Devin/mcp_config.json
revisoes_de_ancora:
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: auditoria-2026-09-22-paridade-config-identidade
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: handoff-2026-09-22-paridade-config-identidade
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-09-07-padronizacao-sistemica-markdownlint
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-09-12-saneamento-linter-e-reconciliacao-de-ancoras
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-09-14-auditoria-e-refinamento-settings-e-configuracoes
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-10-19-saneamento-linters-markdown-e-conformidade-tipagem
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-10-20-saneamento-quality-gate-ascii-e-reconciliacao-de-ancoras
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-10-24-auditoria-geral-saneamento-e-reconciliacao
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-10-28-saneamento-reconciliacao-e-elevacao-dependencias-triade-montecarlo
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-10-31-refatoracao-cfr-tipagem-e-higiene
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-11-05-saneamento-customizations-e-elevacao-dependencias
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-11-07-auditoria-jules-cloud-saneamento-linters-e-pyproject
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-11-08-integracao-sota-suite-antigravity-sdk-cli-acp
    caminhos:
      - .vscode/settings.json
    parecer: 'Reconciliacao em 2026-11-10: python.defaultInterpreterPath corrigido de caminho relativo puro para ${workspaceFolder}/.venv/Scripts/python.exe; nenhuma outra chave alterada.'
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: 'Reconciliacao em 2026-11-10: adicionada apenas @lru_cache em obter_perfil_hardware para eliminar subprocesso powershell por GET /health; logica de idempotencia de socket inalterada.'
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: 'Reconciliacao em 2026-11-10: adicionada apenas @lru_cache em obter_perfil_hardware para eliminar subprocesso powershell por GET /health; logica de idempotencia de socket inalterada.'
  - registro: registro-2026-11-09-idempotencia-socket-laya-gpu-serve
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
    parecer: 'Reconciliacao em 2026-11-10: adicionada apenas @lru_cache em obter_perfil_hardware para eliminar subprocesso powershell por GET /health; logica de idempotencia de socket inalterada.'
---

# HANDOFF — Persistência de Boot, Malha MCP e Ciclo de Vida (2026-11-10)

**Condutor:** Devin (SWE-2 Flash) [Tier 2] · **Veículo:** devin-desktop · **Supervisão:** assistida (Tier 0 delegou decisões de escopo e autorizou commit+push)

## 1. Propósito e estado inicial

Sessão iniciada para (a) transformar o launcher VBS de boot em schedule rigoroso e (b) auditar instabilidade do ecossistema (latência alta, processos zumbis, Chrome abrindo "do nada"). Estado inicial: persistência apenas via `SOTA_Ecosystem_Boot.vbs` na pasta Startup; sem task dedicada; backend :17042 com duas instâncias `main.py`; `/health` do Laya custando até ~2,6s; `chrome-devtools-mcp@latest` e `mcpbrowser@latest` via npx no Devin sem versão fixa.

## 2. O que foi alterado

### Raiz multiprojeto (`~/.gemini`, repo `raiz-multiprojeto`)

| Arquivo | Mudança |
| :--- | :--- |
| `scripts/ops/Install-SOTA-EcosystemAutoStart.ps1` | **Novo.** Instalador idempotente da task `SOTA_Ecosystem_AutoStart` (AtLogOn +45s, restart 3x/5min, ExecutionTimeLimit ilimitado, StartWhenAvailable). |
| `scripts/ops/agy_acp_server.cs` | **Novo.** Shim C# que resolve `agy.exe acp` para clientes ACP que exigem `agy_acp_server.exe` no PATH; herda stdio (pipes intermediários quebravam o protocolo). |
| `scripts/ops/Start-SOTA-Background.ps1` | §4 agora spawna `cdp_cors_proxy`/`sota_orchestrator` via `Win32_Process.Create` (escapa Job Object); cabeçalho aponta para a task real. |
| `scripts/ops/Invoke-SotaAutopoieticMesh.ps1` | Novo §2.10: auto-cura :9224/:9333 a cada heartbeat de 5min via CIM; warnings PSScriptAnalyzer zerados (`$GB` removido, `$null` à esquerda). |
| `nucleo/nucleo_compartilhado.json` | `mcpbrowser` adicionado a `mcp.compartilhados` (stdio → gateway singleton). |
| `tools/mcp-runtime/` | `mcpbrowser@1.10.110` instalado (package.json + lock); gitignored por conter node_modules/config sensível. |
| `config/mcp_gateway.json`, `config/mcp_config.json` e espelhos | Regenerados por `sincronizar_nucleo.py --aplicar` (gitignored, estado local canônico). |
| `SOTA_Ecosystem_Boot.vbs` (Startup) | **Removido** — substituído pela task agendada. |

Fora de repo (estado local): `AppData/Local/agy/bin/agy_acp_server.exe` compilado; `Devin/mcp_config.json` sem `chrome-devtools-mcp`/`MCPBrowser` stdio (agora via gateway); `Site/.vscode/settings.json` interpretador → `${workspaceFolder}/.venv/Scripts/python.exe`.

### Projeto Site (`~/​.gemini/Site`, repo próprio)

| Arquivo | Mudança |
| :--- | :--- |
| `scripts/ops/homologar_laya_gpu.py` | `@lru_cache` em `obter_perfil_hardware()` — elimina torch.cuda + subprocesso powershell por `/health`. |
| `scripts/ops/ensure-dev-backend.mjs` | Guarda TCP: porta viva + `/ping` lento → aguarda, não spawna duplicata. |
| `scripts/ops/Start-LayaService.ps1` | Wait de warmup 60s→150s (medido ~97s real). |
| `.vscode/settings.json` | `python.defaultInterpreterPath` relativo→`${workspaceFolder}` (causa do erro de interpretador). |

## 3. Evidências medidas

- **Boot:** task disparada manualmente → `LastTaskResult=0`; log `sota-boot-autostart.log` completo.
- **Laya /health:** 2650/576/520ms → **1–3ms** (5 amostras pós-cache).
- **Backend:** de 2 pares `main.py` para 1; guarda TCP validada por sintaxe (`node --check`).
- **ACP:** `agy_acp_server` respondeu `initialize` com JSON-RPC idêntico ao `agy.exe acp` direto.
- **mcpbrowser:** `POST /servers/mcpbrowser/mcp` initialize → `serverInfo.name=MCPBrowser v1.10.110`.
- **Cockpit:** processos via CIM vivos >2min após morte do shell (Start-Process morria em ~1–2min — Job Object medido).
- **Portas finais:** 8192, 17042, 3000, 8933, 8931, 9222, 9223, 9224, 9333, 11434 = **10/10 OPEN**.

## 4. Decisões de arquitetura (delegadas pelo Tier 0)

1. **Task Scheduler > VBS na Startup:** delay, retry, ExecutionTimeLimit e visibilidade; trigger AtLogOn cobre boot/reboot pois apps GUI exigem sessão interativa.
2. **mcpbrowser → gateway:** singleton global satisfaz "maximum one browser connection"; elimina npx residente e processo por sessão.
3. **chrome-devtools-mcp stdio removido do Devin:** duplicata pura do gateway (`:9223`); capacidade preservada via `chrome-devtools` compartilhado.
4. **Playwright test-server (PID 11304):** mantido — filho legítimo do Devin.exe, não órfão.
5. **Shim ACP com herança de handles:** pipes .NET intermediários impedia resposta do `agy acp`; herança direta validada.

## 5. Não verificado / riscos residuais

- Devin precisa reiniciar para carregar `mcp_config.json` novo; se a IDE não ler o config compartilhado, `chrome-devtools`/`mcpbrowser` voltariam a faltar — monitorar próxima sessão.
- `npm audit` no mcp-runtime: 38 vulnerabilidades transitivas (maioria puppeteer/mcpbrowser) — débito técnico pré-existente, não regressão.
- Processos uv-trampoline (par venv→cpython) são normais, não zumbis.
- Screenshot citada pelo usuário não foi anexada — análise visual pendente se reenviada.

## 6. Pendências e próximo passo

- Observar próximo boot real para confirmar `SOTA_Ecosystem_AutoStart` end-to-end sem intervenção.
- Se 9224/9333 voltarem a cair, o §2.10 do mesh auto-cura em ≤5min; investigar causa raiz se recorrente.
- Avaliação de impacto da sessão (executada via `avaliar_impacto_sessao.py --pendencias-inicio 0 --markdown`; `--pendencias-inicio` declarado como 0 por ausência de baseline declarada — proxy, não causal):

### Painel de Avaliacao de Impacto da Sessao (Agnostico Tier 1-2-3)

| Metrica de Impacto | Valor Medido | Status / Observacao |
| :--- | :--- | :--- |
| **Economia de Tokens MCP (S1)** | **-61.03%** | Telemetria viva da sessao (20 chamadas reais) (overhead: 294.0 us) |
| **Ingress Fast-Path S1** | **0.5055 ms** (505.5 us) | Triagem O(1) de tarefas sem compilar grafo |
| **Passivo de Pendencias** | **0 abertas** (reducao: 0.0%) | Resolucao formal via M.O. 13.F |
| **Integridade do Ledger** | **91 registros** (tail: `bfb33070`) | Portao acumulado: 0 sessoes |
| **Resolucao de Tarefas SQLite** | **100.0%** (0/0) | 0 pendencias residuais ou falhas |
| **Pools OpenRouter Multi-Tier** | **1 chaves** (1 ativas, score: 80.0) | T1: 1 \| T2: 0 \| T3: 0 \| T4: 0 (0 bloq / 0 rev) |
| **Eficiencia Economica & Infra** | **14 cloud / 13 locais** | Cotas Pro Tier 1 prioritarias (Faixa.FLAT_FEE); Mitigacao ativa de custos de servidores |

> Nota de leitura: o painel mede a integridade do ecossistema no fechamento, não o delta causal desta sessão (a sessão alterou lifecycle/MCP fora do escopo medido pelos eixos). O pool OpenRouter medido (1 chave ativa) reflete telemetria do registry no momento da coleta — não houve rotação nem bloqueio nesta sessão.
