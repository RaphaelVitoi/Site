# Script de Teste de Cleanup (Expurgo Seguro)
# Objetivo: Forçar arquivamento imediato para validar Mutex e Checksum

try {
    Write-Host "[TEST] Carregando Kernel v3.0..." -ForegroundColor Cyan
    Import-Module "$PSScriptRoot\Agent-TaskManager.psm1" -Force

    Write-Host "[TEST] Invocando Cleanup com DaysToKeep=0 (Forçar Arquivamento)..." -ForegroundColor Yellow
    Invoke-TaskCleanup -DaysToKeep 0
    
    Write-Host "[SUCCESS] Operação concluída. Verifique logs\tasks_archived.json e o novo Checksum." -ForegroundColor Green
}
catch {
    Write-Error "[FAIL] Falha no teste: $_"
}