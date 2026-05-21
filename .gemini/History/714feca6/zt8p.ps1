<#
.SYNOPSIS
    Executa o VACUUM no banco de dados com Fricção Zero, garantindo a parada e reinicio do worker.
.DESCRIPTION
    Protocolo SOTA do @skillmaster para otimização do DAL. Ele para o worker para obter
    um lock exclusivo, executa o VACUUM, e então reinicia o worker em background.
#>

Write-Host '=== [SKILLMASTER] INICIANDO PROTOCOLO DE OTIMIZACAO DE BANCO DE DADOS (VACUUM) ===' -ForegroundColor Magenta

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))

# SOTA: Carrega as funcoes de profile (start/stop-worker) se nao estiverem no escopo.
if (-not (Get-Command 'stop-worker' -ErrorAction SilentlyContinue)) {
    $ProfileSetupPath = Join-Path $ProjectRoot 'scripts\setup\Setup-NexusProfile.ps1'
    if (Test-Path $ProfileSetupPath) {
        . $ProfileSetupPath
    }
    else {
        Write-Error '[FALHA] Funcoes de controle do worker nao encontradas.'
        exit 1
    }
}

$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }
$ExecutorScript = Join-Path $ProjectRoot 'task_executor.py'

try {
    Write-Host '[VACUUM] Paralisando o worker para obter lock exclusivo...' -ForegroundColor Yellow
    stop-worker

    Write-Host '[VACUUM] Executando otimizacao VACUUM no DAL...' -ForegroundColor Cyan
    & $PythonCmd $ExecutorScript db-vacuum
    if ($LASTEXITCODE -ne 0) {
        Write-Error '[FALHA] O comando VACUUM retornou um erro. Otimizacao abortada.'
    }
}
finally {
    Write-Host '[VACUUM] Reiniciando o worker para restaurar a operacao normal...' -ForegroundColor Yellow
    start-worker -Background
}
