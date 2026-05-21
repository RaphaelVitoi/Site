# Script de Teste de Injecao no Kernel v3.0
# Objetivo: Validar Mutex, Schema e Assinatura SHA-256

try {
    Write-Host '[TEST] Carregando Kernel v3.0...' -ForegroundColor Cyan
    # [REMOVIDO] Agent-TaskManager.psm1 nao existe mais
    # Import-Module "$PSScriptRoot\Agent-TaskManager.psm1" -Force

    $taskId = "TEST-SHA256-$(Get-Random -Minimum 1000 -Maximum 9999)"
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

    Write-Host "[TEST] Injetando tarefa $taskId via Mutex..." -ForegroundColor Yellow
    # Add-AgentTask -NewTask $payload  # [REMOVIDO]
    Write-Host '[AVISO] Agent-TaskManager.psm1 removido. Teste de injecao desativado.' -ForegroundColor Yellow
}
catch {
    Write-Error "[FAIL] Falha no teste: $_"
}
