<#
.SYNOPSIS
    Injeta a tarefa de planejamento para a feature interativa do Simulador ICM (Next.js).
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

Write-Host '=== PROTOCOLO: FEATURE ICM FOUNDER (NEXT.JS) ===' -ForegroundColor Magenta

$taskId = "FEATURE-ICM-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$description = "A Calculadora/Simulador de ICM (Poker) ja esta construida, isolada e em fase de finalizacao (Motor Vanilla JS/HTML existente). " +
"Sua missao e analisar a logica de calculo de Risk Premium ja consolidada no projeto e planejar a migracao/integracao impecavel desse motor para a nova estrutura de componentes React (Next.js). " +
"Gere uma SPEC orientando o @implementor sobre como encapsular o 'main.js' e a interface atual no padrao App Router do Next.js sem perder dados ou quebrar as formulas validadas."

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