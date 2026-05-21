?<#
.SYNOPSIS
    Injeta o Épico do Simulador Interativo V2 para o @dispatcher fatiar.
.DESCRIPTION
    Este script cria a tarefa-mãe (épico) para o desenvolvimento
    da Calculadora TrueICM V2, com foco em lógica de backend e
    uma nova interface visceral no front-end.
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: EPIC INTERACTIVE SIMULATOR V2 ===" -ForegroundColor Magenta

$taskId = "EPIC-ICMV2-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = "Épico: Desenvolver o Simulador Interativo V2. Isso inclui: 1) A lógica de cálculo do TrueICM no backend (Python). 2) Um novo front-end com visualização 'dark/visceral' (Next.js). Quebre este épico em subtarefas detalhadas para os agentes relevantes (@planner, @validador, @implementor, @curator), garantindo que as SPECs cubram tanto a matemática do backend quanto a experiência do usuário no front-end."

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@dispatcher"
}

Add-AgentTask -NewTask $task

Write-Host "[NEXUS] Épico do Simulador V2 injetado. O @dispatcher irá decompor o monolito e iniciar a pipeline de execução." -ForegroundColor Green