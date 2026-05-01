# Script de Injecao de Demanda Criativa - Maverick
# Objetivo: Enfileirar a criacao de Toy Games focados em "Predator Mode" e "Blind War Extrema".

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== COMUNICANDO COM O SENTINELA (@maverick) ===" -ForegroundColor Magenta

# Cria a tarefa de inovacao na fila do sistema
$taskId = "INOVACAO-TOYGAME-PREDATOR-$(Get-Date -Format 'yyyyMMdd')"
$task = [ordered]@{
    id          = $taskId
    description = "Planejar serie de 'Toy Games' didaticos focados na mecanica de 'Predator Mode' (IP Risk < 25% vs OOP Risk > 40%) e 'Blind Wars' extremas. Foco: Excelencia visual, didatica visceral e inovacao de produto. O objetivo e ensinar a agressao impune gerada pelo ICM."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@maverick"
    priority    = "high"
    type        = "ideation"
}

Add-AgentTask -NewTask $task

Write-Host "[KERNEL] Ordem enviada." -ForegroundColor Green
Write-Host "  > ID: $taskId" -ForegroundColor Gray
Write-Host "  > Status: Aguardando proximo ciclo de Autopoiese." -ForegroundColor Gray
