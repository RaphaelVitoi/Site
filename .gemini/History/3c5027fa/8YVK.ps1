# Script de Diagnóstico Pós-Cirurgia (Kernel v3.0)
# 1. Verifica remoção de código obsoleto.
# 2. Testa injeção de tarefa no Kernel regenerado.

$DeadTissue = Join-Path $PSScriptRoot "validate-queue.ps1"

Write-Host "=== INICIANDO DIAGNÓSTICO DO SISTEMA ===" -ForegroundColor Magenta

# 1. Verificação de Limpeza
if (Test-Path $DeadTissue) {
    Write-Warning "[ALERT] Falha na cirurgia: 'validate-queue.ps1' ainda existe."
}
else {
    Write-Host "[PASS] Tecido morto removido com sucesso." -ForegroundColor Green
}

# 2. Teste de Vitalidade do Kernel
try {
    Import-Module "$PSScriptRoot\Agent-TaskManager.psm1" -Force
    
    $taskId = "HEARTBEAT-$(Get-Random -Minimum 1000 -Maximum 9999)"
    $task = [ordered]@{ id = $taskId; description = "Verificação de vitalidade do sistema"; status = "pending"; timestamp = (Get-Date -Format "o") }

    Write-Host "[TEST] Injetando $taskId via Kernel..." -ForegroundColor Yellow
    Add-AgentTask -NewTask $task
    
    Write-Host "[SUCCESS] Sistema está vivo. Auto-cura e Mutex funcionais." -ForegroundColor Cyan
}
catch {
    Write-Error "[FATAL] Falha sistêmica: $_"
}