# Script de Injeção de Demanda Criativa - Maverick
# Objetivo: Enfileirar a criação de Toy Games focados em "Predator Mode" e "Blind War Extrema".

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== COMUNICANDO COM O SENTINELA (@maverick) ===" -ForegroundColor Magenta

# Cria a tarefa de inovação na fila do sistema
$taskId = "INOVACAO-TOYGAME-PREDATOR-$(Get-Date -Format 'yyyyMMdd')"
$task = [ordered]@{
    id          = $taskId
    description = "Planejar série de 'Toy Games' didáticos focados na mecânica de 'Predator Mode' (IP Risk < 25% vs OOP Risk > 40%) e 'Blind Wars' extremas. Foco: Excelência visual, didática visceral e inovação de produto. O objetivo é ensinar a agressão impune gerada pelo ICM."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@maverick"
    priority    = "high"
    type        = "ideation"
}

Add-AgentTask -NewTask $task

Write-Host "[KERNEL] Ordem enviada." -ForegroundColor Green
Write-Host "  > ID: $taskId" -ForegroundColor Gray
Write-Host "  > Status: Aguardando próximo ciclo de Autopoiese." -ForegroundColor Gray