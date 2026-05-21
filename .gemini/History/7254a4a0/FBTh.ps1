<#
.SYNOPSIS
    Protocolo Singularidade: Expurga entropia e injeta Roteamento DAG em background.
#>

Write-Host "=== INICIANDO PROTOCOLO SINGULARIDADE (EXPURGO & AUTONOMIA) ===" -ForegroundColor Cyan

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# 1. EXPURGO CIRÚRGICO (Sem Piedada com a Entropia)
Write-Host "`n[1/2] Varredura Termodinamica (Deletando Fantasmas)..." -ForegroundColor Yellow

$TrashFiles = @(
    "$ProjectRoot\scripts\utils\tests\test_system_stress.ps1", # Duplicata obsoleto (Mantemos o de scripts\tests\)
    "$ProjectRoot\init_cli_innovation.ps1"                      # Clone na raiz
)

foreach ($File in $TrashFiles) {
    if (Test-Path $File) {
        Remove-Item -Path $File -Force -ErrorAction Stop
        Write-Host "  [DELETADO] Entropia extirpada: $File" -ForegroundColor Green
    }
}

# 1.5. ARQUIVAMENTO DO LEGADO (Santuario Historico)
Write-Host "`n[1.5] Arquivando Legado Historico..." -ForegroundColor Yellow
$ArchiveDir = Join-Path $ProjectRoot "archive"
if (-not (Test-Path $ArchiveDir)) { New-Item -ItemType Directory -Path $ArchiveDir -Force | Out-Null }
if (Test-Path "$ProjectRoot\queue\tasks.json") {
    Move-Item -Path "$ProjectRoot\queue\tasks.json" -Destination "$ArchiveDir\tasks_legacy_v1.json" -Force
    Write-Host "  [ARQUIVADO] tasks.json congelado e movido para /archive." -ForegroundColor Cyan
}

# 2. INJEÇÃO DO CONSELHO CONSULTIVO (Trabalho Automático em DAG)
Write-Host "`n[2/2] Acordando o Conselho Consultivo em Grafo (DAG)..." -ForegroundColor Yellow

$KernelPath = Join-Path $ProjectRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force -DisableNameChecking

$TaskSlug = "singularity-cleanup"
$TaskId = "EPIC-SINGULARITY-$(Get-Date -Format 'yyyyMMddHHmmss')"

$Directive = @"
Voce deve aplicar a Navalha de Ockham ao ecossistema atual. 
1. Analise o que temos (scripts redundantes, agentes que podem ser fundidos, features frontend pesadas e sem utilidade direta).
2. REGRA FUNDAMENTAL: Faca a distincao cirurgica entre LIXO (arquivos inuteis que devem ser deletados) e LEGADO (arquivos historicos importantes que devem ser movidos para a pasta /archive).
3. Gere uma estrutura de tarefas PARALELAS onde o @architect faz a topologia, o @auditor valida e o @implementor executa, usando a nova capacidade 'depends_on' do sistema DAG.
4. Objetivo: Enxugar e simplificar a arquitetura sem perder o Estado da Arte e preservando a historia intocada.
"@

$newTask = [ordered]@{
    id          = $TaskId
    description = $Directive
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@dispatcher"
    metadata    = @{ slug = $TaskSlug; priority = "high" }
}

Add-AgentTask -NewTask $newTask
Write-Host "`n[SUCESSO] O Dispatcher vai planejar e enfileirar a execucao autonoma com dependencias amarradas." -ForegroundColor Green
Write-Host "DIRETRIZ FINAL: Execute 'python .\task_executor.py worker' e va viver sua vida. O sistema roda sozinho a partir de agora." -ForegroundColor Magenta