---
id: registro-2026-11-11-powershell-77-preview-e-perfil-fundido
tipo: registro
escopo: powershell-runtime-perfil-e-autonomia
autor: "Devin (swe-2-flash) [Tier 1]"
criado_em: "2026-11-11"
classes:
  - interno
  - medido
  - infraestrutura
  - registro
verificado:
  - "PowerShell Preview 7.7.5.0 instalado via winget (MSIX); pwsh-preview/pwsh77
    resolve 7.7.0-preview.5"
  - "pwsh default permanece 7.6.9 stable -- ecossistema (husky,
    Start-SOTA-Background, hooks) inalterado"
  - "ExecutionPolicy Unrestricted -Scope CurrentUser aplicado em pwsh e
    pwsh-preview; LocalMachine RemoteSigned"
  - "Perfil canonico Microsoft.PowerShell_profile.ps1 fundido com a versao
    Raphael (idempotencia, auto-detect pwsh, telemetria opt-out, venv/uv,
    Membrana do.ps1, suite agy, gating interativo) + alias pwsh77"
  - "Perfil carrega sem erro nos dois canais; nexus resolve via .venv; orfao
    -Raphael.ps1 e .bak removidos"
nao_verificado:
  - "CI remoto dos pushes anteriores -- pendencia pend-2026-11-10-ci-remoto"
  - "Comportamento do preview 7.7 em rotinas agendadas que invocam pwsh (seguem
    no stable por design)"
config_medida:
  congelada_em: "2026-11-11"
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: "2026-11-11"
  toolchain: winget + pwsh + Get-ExecutionPolicy
  so: Windows
caminhos:
  - .husky/pre-commit
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/Start-NexusDashboard.ps1
  - reports/REGISTRO-2026-11-11-powershell-77-preview-e-perfil-fundido.md
---

# Registro — PowerShell 7.7 Preview + perfil fundido (2026-11-11)

Conductor: Devin (swe-2-flash) [Tier 1] via Devin Desktop Harness. Supervisão:
assistida.

## Contexto

Pedido do Tier 0: atualizar para "PowerShell 7.7.0", otimizar, potencializar,
aumentar autonomia e integrar sem quebra sistêmica.

## Fatos medidos

- **Não existe PowerShell 7.7.0 estável.** O canal `winget` estável
  (`Microsoft.PowerShell`) está em 7.6.9 — já instalado e mantido como `pwsh`
  default. A linha 7.7 existe apenas como **Preview**
  (`Microsoft.PowerShell.Preview` 7.7.5.0, MSIX), instalada lado a lado e
  invocável por `pwsh-preview` / alias `pwsh77` → `7.7.0-preview.5`.
- **Autonomia:** `Set-ExecutionPolicy Unrestricted -Scope CurrentUser` em ambos
  os hosts pwsh. `LocalMachine` permanece `RemoteSigned` (escopo de máquina,
  fora do alcance sem elevação e fora do pedido específico).
- **Perfil:** o `$PROFILE.CurrentUserAllHosts` do usuário era a versão antiga (4
  KB, bloco §0 apontando para runtime portátil inexistente). O arquivo irmão
  `-Raphael.ps1` (12 KB, mais novo e completo) era órfão — nenhum host o
  carregava. Fundidos: o canônico ativo agora carrega o conteúdo Raphael
  integral (guard de idempotência, auto-detect de pwsh, telemetria opt-out,
  ativação `.venv`/`uv`, wrappers Membrana `do.ps1`, suíte `agy`, PSReadLine
  preditivo com gating interativo) mais o alias `pwsh77`.
- **Poda:** `Microsoft.PowerShell_profile-Raphael.ps1` e os dois `.bak`
  removidos após fusão — cópias divergentes são entropia.
- **Verificação:** sintaxe OK, carga limpa em `pwsh` e `pwsh-preview`, `nexus`
  resolve via venv, aliases ativos.

## Não verificado / limites

- Tarefas agendadas e hooks continuam invocando `pwsh` → stable 7.6.9 por
  design; o preview é opt-in via `pwsh77`.
- Nenhum arquivo de repositório foi alterado por esta mudança — o registro
  existe para auditabilidade do estado do SO.
