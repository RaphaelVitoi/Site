# Script de Ciclo de Manutenção - Médio Prazo
# Operacionaliza as tarefas de documentação e health check do Relatório Sentinela 2026-03-12

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== INICIANDO CICLO DE MANUTENÇÃO (MÉDIO PRAZO) ===" -ForegroundColor Cyan

# Tarefa 1: Consolidar Documentação
$task1 = [ordered]@{
    id          = "MAINT-20260313-DOCS"
    description = "Consolidar documentação do sistema. Unificar 'project-context.md' e 'MANUAL_WORKFLOW_AGENTES.md' para eliminar redundâncias e alinhar com a realidade operacional v5.1."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@organizador"
    priority    = "medium"
    type        = "maintenance"
}
Add-AgentTask -NewTask $task1
Write-Host "[QUEUE] Tarefa agendada: Consolidação Documental (@organizador)" -ForegroundColor Green

# Tarefa 2: Índice de Referências Cruzadas
$task2 = [ordered]@{
    id          = "MAINT-20260313-INDEX"
    description = "Criar índice mestre de referências cruzadas. Mapear dependências entre Agentes, Scripts (PS1) e Documentos (MD) para facilitar navegação e onboarding."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@organizador"
    priority    = "low"
    type        = "documentation"
}
Add-AgentTask -NewTask $task2
Write-Host "[QUEUE] Tarefa agendada: Índice Cruzado (@organizador)" -ForegroundColor Green

# Tarefa 3: Health Check Geral
$task3 = [ordered]@{
    id          = "MAINT-20260313-HEALTH"
    description = "Executar Health Check completo. Validar consistência dos 14 arquivos MEMORY.md, verificar integridade dos logs e sugerir correções de entropia."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@organizador"
    priority    = "high"
    type        = "audit"
}
Add-AgentTask -NewTask $task3
Write-Host "[QUEUE] Tarefa agendada: Health Check (@organizador)" -ForegroundColor Green

Write-Host "---"
Write-Host "Para executar a limpeza de 2025, rode:" -ForegroundColor Gray
Write-Host ".\cleanup.ps1 -ArchiveAll2025" -ForegroundColor Yellow