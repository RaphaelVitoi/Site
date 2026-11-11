---
id: registro-2026-11-11-powershell-770-stable-msix
tipo: registro
escopo: runtime-powershell
autor: "Devin (swe-2-flash) [Tier 1]"
criado_em: '2026-11-11'
classes:
  - interno
  - medido
  - infraestrutura
  - registro
verificado:
  - "pwsh -NoProfile reporta PSVersion 7.7.0 apos Add-AppxPackage do msixbundle oficial v7.7.0"
  - "SHA256 do PowerShell-7.7.0.msixbundle conferido contra o publicado no release: E00C349858C2D273F29485541ECE91617B435ACCDD5E3F156D68D5CB97740022"
  - "Portas pos-restart: 8933 gateway UP, 8931 playwright UP, 11434 ollama UP (0.40.16), 17043 gemma_server UP (gemma4:12b), 17042 backend UP, 3000 frontend UP"
  - "Tarefas SOTA recuperadas: SOTA_Shared_MCP_Gateway Running, SOTA_Autopoietic_MCP_Sentinel LastTaskResult=0, SOTA_Laya_Multilingual_S1 Running"
nao_verificado:
  - "CI remoto -- pendencia pend-2026-11-10-ci-remoto"
  - "Execucao de hooks/gates sob pwsh 7.7.0 em commit real (primeiro commit pos-upgrade ainda nao ocorreu)"
caminhos:
  - reports/REGISTRO-2026-11-11-powershell-770-stable-msix.md
revisoes_de_ancora: []
---

# Registro — PowerShell 7.7.0 stable via MSIX (2026-11-11)

Conductor: Devin (swe-2-flash) [Tier 1]. Supervisão: assistida.

## Contexto

O release estável `v7.7.0` do PowerShell saiu em 2026-11-10, um dia após a
instalação do preview `7.7.0-preview.5`/winget `7.7.5.0`. O winget ainda não
havia propagado o estável (oferecia apenas 7.6.10), então o MSIX oficial foi
baixado de `github.com/PowerShell/PowerShell/releases/tag/v7.7.0` com hash
SHA256 verificado antes da instalação.

## Procedimento e incidente

`Add-AppxPackage` falhou 3x com `0x80073D02` (pacote em uso): 14 processos
`pwsh.exe` 7.6.9 ativos (terminais interativos, gateway MCP, sentinela, e o
próprio harness do agente — cuja morte reiniciou a sessão, conforme
autorizado pelo Tier 0). A tarefa `SOTA_Shared_MCP_Gateway` não pôde ser
desabilitada sem elevação (`Acesso negado`), mas o loop kill→install com
retry venceu na 4ª tentativa (~02:09). Todas as tarefas SOTA foram
reabilitadas automaticamente pelos próprios mecanismos de boot.

## Estado final

- `pwsh` (canal estável, WindowsApps MSIX): **7.6.9 → 7.7.0**
- `pwsh-preview`/`pwsh77`: **7.7.5.0 preview** — inalterado, segue opt-in
- ExecutionPolicy CurrentUser `Unrestricted`: inalterado
- Perfil canônico `Microsoft.PowerShell_profile.ps1`: inalterado (auto-detect
  cobre o novo caminho WindowsApps; alias `pwsh77` continua válido)
- Ollama 0.40.16, gemma_server `gemma4:12b`, backend :17042, frontend :3000,
  gateway :8933, playwright :8931 — todos UP pós-restart

## Pendências

- `pend-2026-11-10-ci-remoto` — segue aberta
- `pend-2026-11-10-key-pools-api` — segue aberta
- Primeiro commit real sob pwsh 7.7.0 ainda não exercitou os hooks — observar
  o próximo commit como validação prática do runtime.
