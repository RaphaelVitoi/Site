<#
.SYNOPSIS
    Script de Validacao de Conformidade Total (18 Agentes).
.DESCRIPTION
    Garante que todos os 18 agentes possuem memoria estruturada e 
    executa a auditoria do Cortex para validar a conformidade com v7.0 SOTA.
#>

$ProjectRoot = Split-Path $PSScriptRoot -Parent -Parent
Set-Location $ProjectRoot

Write-Host "=== INICIANDO PROTOCOLO DE CONFORMIDADE (18 AGENTES) ===" -ForegroundColor Cyan

# 1. Executa o organizador para garantir que os arquivos existem e seguem o template
Write-Host "[1/2] Sincronizando memorias fractais..." -ForegroundColor Gray
.\scripts\utils\run_organizer.ps1

# 2. Invoca a auditoria de memoria do Kernel
Write-Host "[2/2] Iniciando auditoria de integridade do Cortex..." -ForegroundColor Gray
Import-Module .\Agent-TaskManager.psm1 -Force
Invoke-MemoryAudit

Write-Host "=== PROTOCOLO CONCLUIDO ===" -ForegroundColor Green