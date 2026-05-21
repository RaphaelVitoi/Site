<#
.SYNOPSIS
    Gatilho de Otimizacao Mensal do Banco de Dados (VACUUM).
.DESCRIPTION
    Enfileira uma tarefa de manutencao para o @skillmaster executar o comando VACUUM
    no banco de dados SQLite. Isso reconstrói o banco de dados, remove espacos
    vazios e reduz a fragmentacao, mantendo a performance em nivel SOTA.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$EnvPath = Join-Path $ProjectRoot '_env.ps1'
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host '=== [SISTEMA] INICIANDO PROTOCOLO DE OTIMIZACAO MENSAL (VACUUM) ===' -ForegroundColor Cyan

$taskId = "MAINT-VACUUM-$(Get-Date -Format 'yyyyMMdd-HHmmss-ffff')"
$taskDescription = @"
DIRETRIZ DE OTIMIZACAO DE BANCO DE DADOS PARA @skillmaster:
Execute o comando de otimizacao VACUUM no banco de dados para reduzir a fragmentacao e recuperar espaco em disco.
Esta e uma tarefa de manutencao critica para a saude de longo prazo do ecossistema.

Comando: `python task_executor.py db-vacuum`
"@

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = 'pending'
    timestamp   = (Get-Date -Format 'o')
    agent       = '@skillmaster'
    metadata    = @{ priority = 'medium' }
}

$taskJson = $task | ConvertTo-Json -Depth 10 -Compress
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }

& $PythonCmd (Join-Path $ProjectRoot 'task_executor.py') db-add $taskB64
Write-Host "[OK] Tarefa de otimizacao ($taskId) enfileirada para o @skillmaster." -ForegroundColor Green
