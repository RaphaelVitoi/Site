<#
.SYNOPSIS
    Auditoria de Integridade do Banco de Dados SOTA (SQLite)
#>
$ErrorActionPreference = "Continue"
$ScriptDirectory = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host "[SOTA DB] Executando manutencao no registro Akashico (tasks.db)..." -ForegroundColor Cyan

$PythonCmd = if (Test-Path "$ScriptDirectory\.venv\Scripts\python.exe") { "$ScriptDirectory\.venv\Scripts\python.exe" } else { "python" }
$TaskExecutor = Join-Path $ScriptDirectory "task_executor.py"

Write-Host "`n[1/3] Auditando DAGs e Malha de Dependencias..." -ForegroundColor Yellow
& $PythonCmd $TaskExecutor db-audit-dag

Write-Host "`n[2/3] Expurgando Tarefas Orfas (Zumbis)..." -ForegroundColor Yellow
& $PythonCmd $TaskExecutor db-purge-orphans

Write-Host "`n[3/3] Otimizando indices (VACUUM)..." -ForegroundColor Yellow
& $PythonCmd $TaskExecutor db-vacuum

Write-Host "`n=== [SISTEMA] AUDITORIA DE DB CONCLUIDA ===" -ForegroundColor Magenta
