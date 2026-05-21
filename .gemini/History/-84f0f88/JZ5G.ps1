# Script de Limpeza (Proxy para Kernel v3.0)
# Redireciona a operacao para o modulo central seguro (Mutex + SHA-256)

param(
    [Parameter(HelpMessage = "Dias de retencao para tarefas concluidas.")]
    [int]$DaysToKeep = 30,
    
    [Parameter(HelpMessage = "Limite maximo de tarefas no arquivo ativo.")]
    [int]$MaxActiveTasks = 100,

    [Parameter(HelpMessage = "Forca arquivamento de todo historico de 2025.")]
    [switch]$ArchiveAll2025
)

# Carregar Ambiente Global
$EnvPath = Join-Path $PSScriptRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

# Usa caminho do _env.ps1 ou fallback
# [REMOVIDO] Agent-TaskManager.psm1 nao existe mais
$PythonCmd = if (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe") {
    "$PSScriptRoot\.venv\Scripts\python.exe"
}
elseif (Test-Path (Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) ".venv\Scripts\python.exe")) {
    Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) ".venv\Scripts\python.exe"
}
else { "python" }

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PyScript = Join-Path $ProjectRoot "task_executor.py"

try {
    
    if ($ArchiveAll2025) {
        # Calcula dias desde 1 de Janeiro de 2026 para arquivar tudo
        $startOf2026 = Get-Date -Date "2026-01-01"
        $timeSpan = New-TimeSpan -Start $startOf2026 -End (Get-Date)
        $DaysToKeep = [math]::Floor($timeSpan.TotalDays)
        Write-Output "[CLEANUP] Modo ArchiveAll2025 ativado. Retendo apenas ultimos $DaysToKeep dias."
    }

    Write-Output "[CLEANUP] Delegando limpeza ao DAL (task_executor.py db-cleanup $DaysToKeep)..."
    & $PythonCmd $PyScript db-cleanup $DaysToKeep

    if ($LASTEXITCODE -eq 0) {
        Write-Output "[CLEANUP] Operacao concluida com sucesso."
    }
    else {
        Write-Error "[CLEANUP] Falha critica na limpeza do banco. Codigo de saida: $LASTEXITCODE"
        exit 1
    }
}
catch {
    Write-Error "[CLEANUP] Falha critica: $_"
}
