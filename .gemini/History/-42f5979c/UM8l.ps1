<#
.SYNOPSIS
    Aciona o @curator para revisar e refinar a copy dos CTAs da Home (ASCII).
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: CURADORIA DE COPY (@CURATOR) ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "CURADORIA-HOME-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Acesse e leia o arquivo SPEC. Revise os CTAs propostos e a headline. Sugira uma copy mais persuasiva, profunda e alinhada com o tom da COSMOVISAO.md ('Beleza Estrutural' e 'Autoridade')."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@curator"
}

Add-AgentTask -NewTask $task
Write-Host "[NEXUS] Solicitacao de curadoria delegada ao @curator." -ForegroundColor Cyan