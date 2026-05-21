lidade<#
.SYNOPSIS
Injeta o Épico do Projeto Poker para o @dispatcher fatiar.
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$KernelPath = Join-Path $ProjectRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: EPIC POKER FRONT-END ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "EPIC-POKER-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Temos um épico: Reescrever o front-end do projeto Poker. Precisamos separar o layout em componentes reutilizáveis, criar uma nova interface imersiva para a aula de ICM e validar o aspecto responsivo. Analise este épico e enfileire as tarefas técnicas em ordem cronológica para os agentes apropriados (@planner, @implementor, etc)."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@dispatcher"
}

Add-AgentTask -NewTask $task

Write-Host "[NEXUS] Épico injetado. O @dispatcher agora assumirá a triagem e delegação." -ForegroundColor Green