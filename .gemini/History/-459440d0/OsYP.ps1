<#
.SYNOPSIS
    Entry point para o Coracao do Sistema.
    Carrega o ambiente, o Kernel e inicia o pulso de Autopoiese.
#>

$script:ProjectRoot = $PSScriptRoot
$EnvPath = Join-Path $script:ProjectRoot "_env.ps1"

# 1. Bootstrap de Ambiente
if (Test-Path $EnvPath) { 
    . $EnvPath 
    Write-Host "[OK] Ambiente carregado via _env.ps1" -ForegroundColor Green
}
else {
    Write-Host "[WARNING] _env.ps1 nao encontrado. Usando configuracoes padrao." -ForegroundColor DarkYellow
}

# 3. Garantir limpeza de tela e identidade visual
Clear-Host
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "        CHICO SYSTEM - PROTOCOLO DE AUTOPOIESE           " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 2. Importacao do Modulo de Autopoiese
$ModulePath = Join-Path $script:ProjectRoot "Agent-Autopoiesis.psm1"
if (Test-Path $ModulePath) {
    # Tenta carregar o Kernel explicitamente antes para garantir visibilidade da API
    $KernelPath = Join-Path $script:ProjectRoot "Agent-TaskManager.psm1"
    if (Test-Path $KernelPath) {
        Import-Module $KernelPath -Force -DisableNameChecking
    }
    
    Import-Module $ModulePath -Force
    Start-OrganismPulse
}
else {
    Write-Host "[CRITICAL] Modulo Agent-Autopoiesis.psm1 nao encontrado em $ModulePath" -ForegroundColor Red
}