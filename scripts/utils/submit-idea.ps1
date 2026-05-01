# Script de Ingestao de Ideias (Interface CEO -> Sistema)
# Facilita o Step 1 do Boot Operacional: "Nova ideia/problema"

param(
    [Parameter(Mandatory = $true, Position = 0, HelpMessage = "Descreva a ideia ou problema")]
    [string]$Description,

    [Parameter(Position = 1)]
    [ValidateSet("low", "medium", "high", "critical")]
    [string]$Priority = "medium"
)

# [REMOVIDO] Agent-TaskManager.psm1 nao existe mais
# $KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
# Import-Module $KernelPath -Force

$taskId = "IDEA-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

$task = [ordered]@{
    id          = $taskId
    description = $Description
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@dispatcher"
    priority    = $Priority
    source      = "CEO-Console"
    type        = "idea"
}

Add-AgentTask -NewTask $task
Write-Host " [INPUT] Ideia registrada: $taskId" -ForegroundColor Green
Write-Host "   Destino: @dispatcher ($Priority)" -ForegroundColor Gray
