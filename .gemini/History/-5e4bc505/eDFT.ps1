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

try {
    Write-Output "[CLEANUP] Acionando Expurgo SOTA (SQLite Python DAL)..."
    
    if ($ArchiveAll2025) {
        # Calcula dias desde 1 de Janeiro de 2026 para arquivar tudo
        $startOf2026 = Get-Date -Date "2026-01-01"
        $timeSpan = New-TimeSpan -Start $startOf2026 -End (Get-Date)
        $DaysToKeep = [math]::Floor($timeSpan.TotalDays)
        Write-Output "[CLEANUP] Modo ArchiveAll2025 ativado. Retendo apenas ultimos $DaysToKeep dias."
    }

    $PyScript = Join-Path $PSScriptRoot "task_executor.py"
    $PythonCmd = if (Test-Path "$PSScriptRoot\.venv\Scripts\python.exe") { "$PSScriptRoot\.venv\Scripts\python.exe" } else { "python" }
    
    & $PythonCmd $PyScript db-cleanup $DaysToKeep | Out-Null
    
    Write-Output "[CLEANUP] Banco de dados otimizado e entropia arquivada com sucesso."
}
catch {
    Write-Error "[CLEANUP] Falha critica: $_"
}
