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
}
else {
    Write-Host "[WARNING] _env.ps1 nao encontrado. Usando configuracoes padrao." -ForegroundColor DarkYellow
}

# 2. Importacao do Modulo de Autopoiese
$ModulePath = Join-Path $script:ProjectRoot "Agent-Autopoiesis.psm1"
if (Test-Path $ModulePath) {
    Import-Module $ModulePath -Force
    Start-OrganismPulse
}
else {
    Write-Host "[CRITICAL] Modulo Agent-Autopoiesis.psm1 nao encontrado em $ModulePath" -ForegroundColor Red
}