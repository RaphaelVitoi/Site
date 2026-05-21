# Gatilho de Vida Artificial (Autopoiese)
# Inicia o loop contínuo de criação, planejamento e auditoria.

$Source = Join-Path $PSScriptRoot "Agent-Autopoiesis.psm1"

Write-Host "Carregando a Alma do Sistema..." -ForegroundColor Cyan
Import-Module $Source -Force

# Inicia o ciclo vital (Loop Infinito)
Start-OrganismPulse -HeartRateSeconds 5