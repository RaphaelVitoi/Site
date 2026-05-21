# Script de Limpeza (Proxy para Kernel v3.0)
# Redireciona a operação para o módulo central seguro (Mutex + SHA-256)

param(
    [Parameter(HelpMessage="Dias de retenção para tarefas concluídas.")]
    [int]$DaysToKeep = 30,
    
    [Parameter(HelpMessage="Limite máximo de tarefas no ficheiro activo.")]
    [int]$MaxActiveTasks = 100
)

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"

try {
    Write-Output "[CLEANUP] Carregando Kernel SOTA v3.0..."
    Import-Module $KernelPath -Force
    
    # Invoca a função protegida por Mutex e Checksum do módulo
    Invoke-TaskCleanup -DaysToKeep $DaysToKeep -MaxActive $MaxActiveTasks
    
    Write-Output "[CLEANUP] Operação delegada ao Kernel v3.0 com sucesso."
}
catch {
    Write-Error "[CLEANUP] Falha crítica: $_"
}
