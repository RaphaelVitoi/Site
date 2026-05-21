<#
.SYNOPSIS
Injeta o Epico do Projeto Poker para o @dispatcher fatiar.
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$KernelPath = Join-Path $ProjectRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: EPIC POKER FRONT-END ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "EPIC-POKER-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Temos um epico: Reescrever o front-end do projeto Poker. Precisamos separar o layout em componentes reutilizaveis, criar uma nova interface imersiva para a aula de ICM e validar o aspecto responsivo. Analise este epico e enfileire as tarefas tecnicas em ordem cronologica para os agentes apropriados (@planner, @implementor, etc)."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@dispatcher"
}

Add-AgentTask -NewTask $task

Write-Host "[NEXUS] Epico injetado. O @dispatcher agora assumira a triagem e delegacao." -ForegroundColor Green