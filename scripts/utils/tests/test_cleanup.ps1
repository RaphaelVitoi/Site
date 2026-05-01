# Script de Teste de Cleanup (Expurgo Seguro)
# Objetivo: Forcar arquivamento imediato para validar Mutex e Checksum

try {
    Write-Host "[TEST] Carregando Kernel v3.0..." -ForegroundColor Cyan
    # [REMOVIDO] Agent-TaskManager.psm1 nao existe mais
    # Import-Module "$PSScriptRoot\Agent-TaskManager.psm1" -Force

    Write-Host "[TEST] Invocando Cleanup com DaysToKeep=0 (Forcar Arquivamento)..." -ForegroundColor Yellow
    # Invoke-TaskCleanup -DaysToKeep 0  # [REMOVIDO] Funcao do modulo deletado
    Write-Host "[AVISO] Agent-TaskManager.psm1 removido. Teste de cleanup desativado." -ForegroundColor Yellow
}
catch {
    Write-Error "[FAIL] Falha no teste: $_"
}
