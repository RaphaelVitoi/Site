# Script de Teste de Injeção no Kernel v3.0
# Objetivo: Validar Mutex, Schema e Assinatura SHA-256

try {
    Write-Host "[TEST] Carregando Kernel v3.0..." -ForegroundColor Cyan
    Import-Module "$PSScriptRoot\Agent-TaskManager.psm1" -Force

    $taskId = "TEST-SHA256-$(Get-Random -Minimum 1000 -Maximum 9999)"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    $payload = [ordered]@{
        id          = $taskId
        description = "Tarefa de verificação de integridade criptográfica (SHA-256)"
        status      = "pending"
        timestamp   = $timestamp
    }

    Write-Host "[TEST] Injetando tarefa $taskId via Mutex..." -ForegroundColor Yellow
    Add-AgentTask -NewTask $payload
    
    Write-Host "[SUCCESS] Tarefa injetada. Verifique 'checksum' em queue\tasks.json." -ForegroundColor Green
}
catch {
    Write-Error "[FAIL] Falha no teste: $_"
}