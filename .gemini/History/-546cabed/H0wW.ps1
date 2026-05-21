<#
.SYNOPSIS
    Injeta a tarefa arquitetural para o Simulador ICM V2.
.DESCRIPTION
    Aciona o @architect para desenhar a topologia de diretorios Next.js 15+
    e o schema.prisma base para a Calculadora TrueICM.
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$KernelPath = Join-Path $ProjectRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: ARQUITETURA DO SIMULADOR ICM ===" -ForegroundColor Magenta

$taskId = "ARCH-ICM-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$taskDescription = "Atue como @architect. Mapeie a estrutura de diretorios do frontend (Next.js 15+ App Router) e o Schema do Prisma (schema.prisma) para o Simulador ICM V2. Considere a matematica do TrueICM, persistencia de cenarios (Fundador A vs B) e interface visceral. Materialize sua resposta no diretorio 'docs/tasks/simulador-icm/' forjando dois artefatos: '1_DIRECTORY_TREE.md' (com a topologia de pastas e componentes como MasterSimulator, IcmCapTable, IcmCharts) e '2_PRISMA_SCHEMA.md' (com os models de banco de dados necessarios)."

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@architect"
}

Add-AgentTask -NewTask $task

Write-Host "[NEXUS] Topologia solicitada. Tarefa enfileirada para o @architect." -ForegroundColor Green
