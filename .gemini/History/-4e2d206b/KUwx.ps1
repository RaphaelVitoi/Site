<#
.SYNOPSIS
    Injeta o Épico do Motor de Equilíbrio de Nash e Toy Games (Cérebro Matemático).
.DESCRIPTION
    O alvo principal: Implementar a fundação matemática pura em Python.
    O @dispatcher deverá quebrar isso em fases de Pesquisa, Especificação Rigorosa,
    Validação Matemática (Pelo @validador) e Implementação da lógica de matrizes de payoff e solvers de Toy Games.
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

Write-Host "=== PROTOCOLO: EPIC NASH SOLVER E TOY GAMES ===" -ForegroundColor Magenta

$taskId = "EPIC-NASHSOLVER-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = "Épico: Construir a fundação do Cérebro Matemático (NashSolver e 8 Toy Games Clássicos). O sistema backend deve ser capaz de calcular equilíbrios de Nash puros e mistos usando teoria dos jogos matricial e lógica iterativa. Exijo precisão matemática absoluta. @dispatcher: Fatie este épico em tarefas granulares. Certifique-se de alocar o @validador para certificar a matemática de Bill Chen / Matemática de Poker, o @planner para desenhar a arquitetura da classe Solver, e o @implementor para codificar os algoritmos SOTA em Python."

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@dispatcher"
}

$taskJson = $task | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

& $PythonCmd (Join-Path $ProjectRoot "task_executor.py") db-add $taskB64 | Out-Null
Write-Host "[NEXUS] A semente do NashSolver foi plantada. Inicie o Worker para o @dispatcher atuar." -ForegroundColor Green