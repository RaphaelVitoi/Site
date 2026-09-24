---
id: auditoria-2026-09-24-mcp-gateway-compartilhado-e-persistencia
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-09-24T09:16:00-03:00'
classes: [interno, medido, governanca, mcp, gateway, persistencia, auditoria]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: ee1d6652-38d0-4803-9048-cf30bc0588a0
  session_started_at: '2026-09-24T07:18:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-24
caminhos:
  - CLAUDE.md
  - scripts/ops/Repair-SharedMcpGateway.ps1
  - scripts/ops/Start-SharedMcpGateway.ps1
  - scripts/ops/sincronizar_nucleo.py
  - nucleo/nucleo_compartilhado.json
verificado:
  - "diagnostico-causa-raiz: erro connectex na porta 8933 decorrente da ausencia de tarefa agendada independente para o mcp-proxy"
  - "registro-tarefa-agendada: SOTA_Shared_MCP_Gateway registrada no Windows Task Scheduler com gatilho AtLogOn e execucao via pwsh 7"
  - "telemetria-runtime: mcp-proxy.exe ouvindo em 127.0.0.1:8933 com 6/6 servidores configurados e conexoes SSE ativas"
  - "script-auto-reparo: Repair-SharedMcpGateway.ps1 criado e validado com sucesso para recuperacao idempotente"
  - "skill-dedicada: shared-mcp-gateway criada em .agents/skills/ e config/skills/"
  - "governanca-canonica: secao 7.1 adicionada ao CLAUDE.md da raiz, referenciada em Site/CLAUDE.md e GEMINI.md"
  - "memoria-persistente: registros de licao e arquitetura adicionados em Site/memory/ e gemini/memory/"
nao_verificado:
  - "reinicio fisico da maquina hospedeira durante a sessao corrente (validado via disparo programatico da tarefa agendada)"
referencias_nao_resolviveis:
  - scripts/ops/Repair-SharedMcpGateway.ps1
  - scripts/ops/Start-SharedMcpGateway.ps1
  - scripts/ops/sincronizar_nucleo.py
  - nucleo/nucleo_compartilhado.json
---

# AUDITORIA E RELATORIO OFICIAL: GATEWAY MCP COMPARTILHADO E PERSISTENCIA DE INFRAESTRUTURA

## 1. Sumario Executivo
Na sessao de 2026-09-24, clientes agendicos e a IDE Antigravity acusaram recusa de conexao TCP
(`dial tcp 127.0.0.1:8933: connectex: No connection could be made because the target machine actively refused it`)
ao inicializarem cinco servidores MCP centrais:
- `exa`
- `google-jules`
- `google-workspace`
- `mcp-server-neon`
- `sequential-thinking`

Esta auditoria registra a identificacao da causa raiz, as acoes de remediacao de infraestrutura no Windows,
a criacao de mecanismos de auto-reparo e persistencia perene, a nova skill operacional e as atualizacoes
feitas na governanca e na memoria dos agentes.

## 2. Analise da Causa Raiz
Na consolidacao arquitetural de 2026-09-23, os seis servidores MCP locais compartilhados que utilizam transporte stdio
foram centralizados sob uma instancia unica do proxy HTTP Server-Sent Events (`mcp-proxy.exe` v0.12.0) na porta
`127.0.0.1:8933` (e Playwright na `127.0.0.1:8931`). O objetivo dessa consolidacao foi sanar o consumo excessivo
de memoria RAM (que alcancou 98% de 47,9 GB devido a cinco clientes locais rodando a frota inteira de servidores).

Contudo, enquanto o Playwright possuia uma tarefa agendada dedicada (`SOTA_Shared_Playwright_MCP`), o gateway 8933
havia sido referenciado apenas no script de inicializacao de background de logon (`Start-SOTA-Background.ps1`).
Como a maquina nao havia reiniciado nem feito novo logon apos a implantacao de ontem, e processos disparados dentro
de sessoes CLI efemeras pertencem ao Job Object do terminal (sendo terminados pelo Windows ao fechar o processo pai),
o listener na porta 8933 permaneceu inativo, gerando recusa de conexao para os clientes.

## 3. Acoes Executadas e Solucao Definitiva

### 3.1 Criacao da Tarefa Agendada Windows (`SOTA_Shared_MCP_Gateway`)
Foi registrada no Windows Task Scheduler a tarefa:
- **Nome:** `SOTA_Shared_MCP_Gateway`
- **Gatilho:** `AtLogOn` (usuario interativo)
- **Acao:** `C:\Program Files\PowerShell\7\pwsh.exe -NoProfile -NonInteractive -WindowStyle Hidden -File "C:\Users\rapha\.gemini\scripts\ops\Start-SharedMcpGateway.ps1"`
- **Configuracao:** Execucao desacoplada de terminais de agentes, garantindo que o processo sobreviva ao ciclo de vida das ferramentas CLI.

### 3.2 Script de Auto-Reparo e Verificacao (`Repair-SharedMcpGateway.ps1`)
Criado o script idempotente em `scripts/ops/Repair-SharedMcpGateway.ps1`, capaz de:
1. Validar e registrar a tarefa agendada caso esteja ausente.
2. Sondar o endpoint `http://127.0.0.1:8933/status` e verificar a contagem de 6 servidores.
3. Reiniciar ou disparar a tarefa agendada sob demanda se a porta estiver inativa.
4. Validar o listener da porta 8931 (Playwright).
5. Executar `sincronizar_nucleo.py --aplicar` para restabelecer a integridade do catalogo.

### 3.3 Skill de Auto-Recuperacao e Operacao (`shared-mcp-gateway`)
Criada a skill oficial em `.agents/skills/shared-mcp-gateway/SKILL.md` (e espelho em `config/skills/`),
contendo o mapa completo de portas, explicacao da arquitetura, matriz de diagnostico de erros de transporte
e procedimentos de recuperacao imediata.

### 3.4 Governanca e Memoria dos Agentes
1. **CLAUDE.md da Raiz:** Adicionada a Secao 7.1 detalhando formalmente a arquitetura do Gateway MCP compartilhado.
2. **Site/CLAUDE.md:** Atualizada a Secao 8.0 com referencia expressa a Secao 7.1 e aos barramentos 8933 e 8931.
3. **GEMINI.md e Antigravity 2.0 (v2.17):** Atualizada a especificacao dos daemons com a presenca do Gateway compartilhado.
4. **Memoria Persistente:** Registrado o aprendizado em `Site/memory/` e `gemini/memory/`.

## 4. Telemetria e Veredito de Runtime
Apos o disparo da tarefa agendada:
- **Porta 8933:** Ouvindo ativamente em `127.0.0.1:8933` (PID `39624`).
- **Endpoint de Status (`/status`):** 6/6 servidores configurados (`exa`, `google-jules`, `google-workspace`, `chrome-devtools`, `mcp-server-neon`, `sequential-thinking`).
- **Sessoes SSE:** 6 conexoes TCP ativas no estado `Established` com os clientes agendicos.
- **Porta 8931:** Ouvindo ativamente com Playwright MCP (PID `6576`).
- **Status do Sistema:** 100% Saudavel, estavel e conforme o Protocolo Chico SOTA v8.0 Gold.
