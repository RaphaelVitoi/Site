<#
.SYNOPSIS
    Injeta a tarefa de implementação do motor matemático ICM.
.DESCRIPTION
    Aciona o @implementor para forjar o arquivo `lib/icm.ts` com a lógica
    matemática pura do cálculo TrueICM em TypeScript.
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$KernelPath = Join-Path $ProjectRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: MOTOR MATEMÁTICO ICM (TrueICM) ===" -ForegroundColor Magenta

$taskId = "IMPL-ICM-MATH-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = "Atue como @implementor. Crie o arquivo `frontend/lib/icm.ts` contendo a lógica matemática pura para o cálculo do TrueICM. A função principal deve receber um array de stacks e um array de payouts e retornar um array com o EV (equity em dólares) de cada jogador. Implemente a lógica recursiva do ICM de forma eficiente e bem documentada. Não se preocupe com a UI, apenas com o motor matemático em TypeScript."

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@implementor"
}

Add-AgentTask -NewTask $task

Write-Host "[NEXUS] Tarefa do motor matemático ICM enfileirada para o @implementor." -ForegroundColor Green