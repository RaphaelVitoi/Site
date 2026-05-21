# Script Utilitário: Visualização de Telemetria dos Agentes
# Exibe as estatísticas de execução acumuladas na sessão atual.

$AutopoiesisPath = Join-Path $PSScriptRoot "Agent-Autopoiesis.psm1"

if (Test-Path $AutopoiesisPath) {
    Write-Host "=== 📊 TELEMETRIA DO ECOSSISTEMA ===" -ForegroundColor Cyan
    
    # Importa o módulo para acessar as estatísticas em cache
    Import-Module $AutopoiesisPath -Force
    
    # Chama a função de exibição integrada
    Show-AgentStats
    
    Write-Host "`n[SISTEMA] Dados extraídos com sucesso." -ForegroundColor DarkGray
}
else {
    Write-Host "❌ [ERRO] Módulo Agent-Autopoiesis.psm1 não encontrado." -ForegroundColor Red
}