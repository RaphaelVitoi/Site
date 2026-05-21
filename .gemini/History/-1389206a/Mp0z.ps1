<#
.SYNOPSIS
    Varredura autônoma para expurgo de tarefas falhas com dependências órfãs.
.DESCRIPTION
    Este script roda como um cronjob (ou manualmente) para manter a higiene da
    fila de tarefas, eliminando (hard delete) qualquer tarefa com status 'failed'
    que esteja aguardando por um ID de dependência que já não existe no banco de dados.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }
$ExecutorScript = Join-Path $ProjectRoot 'task_executor.py'

Write-Host '=== [SISTEMA] INICIANDO EXPURGO DE DEPENDÊNCIAS ÓRFÃS SOTA ===' -ForegroundColor Magenta

try {
    & $PythonCmd $ExecutorScript 'db-purge-orphans'
    if ($LASTEXITCODE -eq 0) {
        Write-Host '[VITORIA] Higiene da fila concluída com sucesso (Fricção Zero).' -ForegroundColor Green
    }
}
catch {
    Write-Error "Falha crítica ao executar o script Python: $_"
    exit 1
}
