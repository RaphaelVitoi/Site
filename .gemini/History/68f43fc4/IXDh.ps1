<#
.SYNOPSIS
    Inicia o Orquestrador Python SOTA garantindo a injecao das variaveis de ambiente (API Keys).
#>

$EnvPath = Join-Path $PSScriptRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host "=== INICIANDO WORKER (COM CHAVES DE API INJETADAS) ===" -ForegroundColor Cyan

$PyScript = Join-Path $PSScriptRoot "task_executor.py"
$PythonCmd = if (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe") { "$PSScriptRoot\.venv\Scripts\python.exe" } else { "python" }

& $PythonCmd $PyScript worker