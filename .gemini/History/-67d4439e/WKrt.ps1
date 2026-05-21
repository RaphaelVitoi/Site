<#
.SYNOPSIS
    Inicia o ciclo de autopoiese para a estrutura de dados do MasterSimulator.
#>

$script:CurrentDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path $MyInvocation.MyCommand.Path -Parent }
$script:ProjectRoot = Split-Path $script:CurrentDir -Parent
$KernelPath = Join-Path $script:ProjectRoot "Agent-TaskManager.psm1"

if (Test-Path $KernelPath) {
    Import-Module "$KernelPath" -Force
}
else {
    Write-Host "[ERROR] Kernel nao encontrado." -ForegroundColor Red; exit
}

Write-Host "=== INICIANDO PROTOCOLO: ESTRUTURA ACID MASTERSIMULATOR ===" -ForegroundColor Cyan

$taskId = "ARCH-TABLES-$(Get-Date -Format 'yyyyMMddHHmm')"
$taskDescription = "Definir a estrutura de tabelas ACID para o MasterSimulator no SQLite. Aplicar o Framework SENTINEL-v1: Garantir atomicidade nas transacoes de poker e teoria dos jogos. Detalhar tabelas de 'GameState', 'PlayerPosition' e 'ICM_Calculations'. O output deve ser uma visao arquitetural concisa para o @pesquisador validar bibliotecas de manipulacao de matrizes."

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@architect"
}

Add-AgentTask -NewTask $task
Write-Host "[OK] Tarefa enviada ao @architect. O fluxo de autopoiese cuidara do handoff." -ForegroundColor Green