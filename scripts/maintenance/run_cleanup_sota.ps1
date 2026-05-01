<#
.SYNOPSIS
    Executa a limpeza de tarefas e resultados antigos (> 15 dias).
#>
Write-Host '=== [SKILLMASTER] INICIANDO OBLITERAÇÃO DE ARTEFATOS ANTIGOS ===' -ForegroundColor Magenta

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python.exe' }

& $PythonCmd "$ProjectRoot\task_executor.py" db-cleanup 15

Write-Host '[OK] Limpeza concluída e espaço liberado.' -ForegroundColor Green
