<#
.SYNOPSIS
    Injeta o Épico de migração do NashSolver de JavaScript para Python SOTA.
.DESCRIPTION
    O alvo principal: Refatorar o motor matemático para Python, preparando-o para expor os cálculos via API para o MasterSimulator no Next.js.
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

Write-Host "=== PROTOCOLO: EPIC NASH SOLVER PYTHON ===" -ForegroundColor Magenta

$taskId = "EPIC-NASHSOLVER-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = "Épico: Migrar o NashSolver legado (JavaScript) para uma classe Python robusta e de alta performance. O sistema backend deve calcular Equilíbrios de Nash puros e mistos usando Teoria dos Jogos matricial. O output deve estar ancorado no 'Protocolo da Verdade' da Cosmovisão. @dispatcher: Fatie este épico em tarefas granulares. Acione o @planner para desenhar a arquitetura da classe e da API (FastAPI/Flask), o @validador para certificar a precisão matemática contra os Toy Games originais, e o @implementor para codificar o Cérebro Matemático."

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
Write-Host "[NEXUS] Epico do NashSolver injetado na fila SQLite para o @dispatcher." -ForegroundColor Green