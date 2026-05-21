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
$KernelPath = if ($Global:AgentPaths) { $Global:AgentPaths.Kernel } else { Join-Path $PSScriptRoot "Agent-TaskManager.psm1" }

try {
    Write-Output "[CLEANUP] Carregando Kernel SOTA v3.1 ASCII..."
    Import-Module $KernelPath -Force
    
    if ($ArchiveAll2025) {
        # Calcula dias desde 1 de Janeiro de 2026 para arquivar tudo
        $startOf2026 = Get-Date -Date "2026-01-01"
        $timeSpan = New-TimeSpan -Start $startOf2026 -End (Get-Date)
        $DaysToKeep = [math]::Floor($timeSpan.TotalDays)
        Write-Output "[CLEANUP] Modo ArchiveAll2025 ativado. Retendo apenas ultimos $DaysToKeep dias."
    }

    # Invoca a funcao protegida por Mutex e Checksum do modulo
    Invoke-TaskCleanup -DaysToKeep $DaysToKeep -MaxActive $MaxActiveTasks
    
    Write-Output "[CLEANUP] Operacao delegada ao Kernel v3.1 com sucesso."
}
catch {
    Write-Error "[CLEANUP] Falha critica: $_"
}
