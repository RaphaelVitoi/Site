<#
.SYNOPSIS
    Injeta a tarefa de planejamento para a feature interativa do Simulador ICM (Next.js).
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

Write-Host '=== PROTOCOLO: FEATURE ICM FOUNDER (NEXT.JS) ===' -ForegroundColor Magenta

$taskId = "FEATURE-ICM-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$description = "Planejar a arquitetura e os componentes React (Next.js) para a Calculadora/Simulador de ICM Interativo. " +
"O objetivo e criar uma interface no frontend que permita ao usuario inserir stacks e payouts para calcular o Risk Premium em tempo real. " +
"Consulte as regras e PRDs na pasta docs/tasks/aula-icm-rp e formule uma SPEC.md clara para o @implementor focar apenas em codar o Next.js."

$task = [ordered]@{
    "id"          = $taskId
    "description" = $description
    "status"      = "pending"
    "timestamp"   = (Get-Date -Format "o")
    "agent"       = "@planner"
}

$taskJson = $task | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

& $PythonCmd (Join-Path $ProjectRoot "task_executor.py") db-add $taskB64 | Out-Null
Write-Host '[NEXUS] Tarefa materializada e delegada ao @planner via SQLite.' -ForegroundColor Green