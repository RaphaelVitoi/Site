<#
.SYNOPSIS
Injeta o Epico do Simulador Interativo V2 para o @dispatcher fatiar.
.DESCRIPTION
Este script cria a tarefa-mae (epico) para o desenvolvimento
da Calculadora TrueICM V2, com foco em logica de backend e
uma nova interface visceral no front-end.
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: EPIC INTERACTIVE SIMULATOR V2 ===" -ForegroundColor Magenta

$taskId = "EPIC-ICMV2-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = "Epico: Desenvolver o Simulador Interativo V2. Isso inclui: 1) A logica de calculo do TrueICM no backend (Python). 2) Um novo front-end com visualizacao 'dark/visceral' (Next.js). Quebre este epico em subtarefas detalhadas para os agentes relevantes (@planner, @validador, @implementor, @curator), garantindo que as SPECs cubram tanto a matematica do backend quanto a experiencia do usuario no front-end."

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@dispatcher"
}

Add-AgentTask -NewTask $task

Write-Host "[NEXUS] Epico do Simulador V2 injetado. O @dispatcher ira decompor o monolito e iniciar a pipeline de execucao." -ForegroundColor Green