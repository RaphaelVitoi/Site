<#
.SYNOPSIS
    Inicia o Orquestrador Python SOTA garantindo a injecao das variaveis de ambiente (API Keys).
#>

$EnvPath = Join-Path $PSScriptRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host "=== INICIANDO WORKER (COM CHAVES DE API INJETADAS) ===" -ForegroundColor Cyan

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PyScript = Join-Path $ProjectRoot ".claude\task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

& $PythonCmd $PyScript worker