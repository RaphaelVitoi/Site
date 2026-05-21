# Script de Ciclo de Manutencao - Medio Prazo
# Operacionaliza as tarefas de documentacao e health check do Relatorio Sentinela 2026-03-12

# [REMOVIDO] Agent-TaskManager.psm1 nao existe mais
# $KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
# Import-Module $KernelPath -Force

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

#Validate python path
if (!(Test-Path $PyScript)) { Write-Error "task_executor.py nao encontrado"; exit 1 }

Write-Host "=== INICIANDO CICLO DE MANUTENCAO (MEDIO PRAZO) ===" -ForegroundColor Cyan

# Tarefa 1: Consolidar Documentacao
$task1 = [ordered]@{
    id          = "MAINT-20260313-DOCS"
    description = "Consolidar documentacao do sistema. Unificar 'project-context.md' e 'MANUAL_WORKFLOW_AGENTES.md' para eliminar redundancias e alinhar com a realidade operacional v5.1."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@organizador"
    priority    = "medium"
    type        = "maintenance"
}
$taskJson = $task1 | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $PyScript db-add $taskB64 | Out-Null

Write-Host "[QUEUE] Tarefa agendada: Consolidacao Documental (@organizador)" -ForegroundColor Green

# Tarefa 2: Indice de Referencias Cruzadas
$task2 = [ordered]@{
    id          = "MAINT-20260313-INDEX"
    description = "Criar indice mestre de referencias cruzadas. Mapear dependencias entre Agentes, Scripts (PS1) e Documentos (MD) para facilitar navegacao e onboarding."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@organizador"
    priority    = "low"
    type        = "documentation"
}
$taskJson = $task2 | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $PyScript db-add $taskB64 | Out-Null

Write-Host "[QUEUE] Tarefa agendada: Indice Cruzado (@organizador)" -ForegroundColor Green

# Tarefa 3: Health Check Geral
$task3 = [ordered]@{
    id          = "MAINT-20260313-HEALTH"
    description = "Executar Health Check completo. Validar consistencia dos 14 arquivos MEMORY.md, verificar integridade dos logs e sugerir correcoes de entropia."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@organizador"
    priority    = "high"
    type        = "audit"
}
$taskJson = $task3 | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $PyScript db-add $taskB64 | Out-Null

Write-Host "[QUEUE] Tarefa agendada: Health Check (@organizador)" -ForegroundColor Green

Write-Host "---"
Write-Host "Para executar a limpeza de 2025, rode:" -ForegroundColor Gray
Write-Host ".\cleanup.ps1 -ArchiveAll2025" -ForegroundColor Yellow
