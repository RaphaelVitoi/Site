# Script de Aplicacao Estrategica - Baseado no Relatorio Sentinela 2026-03-12
# Objetivo: Transformar recomendacoes de curto prazo em tarefas executaveis na fila do sistema.
# Autor: Gemini Code Assist (via CHICO)

# [REMOVIDO] Agent-TaskManager.psm1 nao existe mais
# $KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
# Import-Module $KernelPath -Force

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

#Validate python path
if (!(Test-Path $PyScript)) { Write-Error "task_executor.py nao encontrado"; exit 1 }

Write-Host "=== OPERACIONALIZANDO ESTRATEGIA SENTINELA (BOOT 2026-03-12) ===" -ForegroundColor Cyan

# 1. Recomendacao: Monitorar integracao @dispatcher
# Acao: O @sequenciador deve observar o fluxo de entrada para evitar gargalos.
$task1 = [ordered]@{
    id          = "STRAT-20260312-DISPATCHER"
    description = "Monitorar integracao do @dispatcher com backlog de ideias. Verificar eficacia da triagem simultanea e ajustar priorizacao se houver gargalo."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@sequenciador"
    priority    = "high"
    type        = "observation"
}
$taskJson = $task1 | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $PyScript db-add $taskB64 | Out-Null

Write-Host "[STRATEGY] Tarefa agendada para @sequenciador: Monitoramento de Fluxo" -ForegroundColor Green

# 2. Recomendacao: Testar @curator em real scenario
# Acao: Executar uma curadoria completa como teste de campo.
$task2 = [ordered]@{
    id          = "STRAT-20260312-CURATOR"
    description = "Executar Teste de Cenario Real para @curator. Realizar curadoria etico-estetica completa em feature de teste. Validar IP, pesquisa de mercado e fit de audiencia. Registrar metricas."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@curator"
    priority    = "critical"
    type        = "test"
}
$taskJson = $task2 | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $PyScript db-add $taskB64 | Out-Null

Write-Host "[STRATEGY] Tarefa agendada para @curator: Teste de Cenario Real" -ForegroundColor Green

# 3. Recomendacao: Monitorar @validador em conteudo especializado
# Acao: O @validador deve estar em alerta para dominios especificos.
$task3 = [ordered]@{
    id          = "STRAT-20260312-VALIDADOR"
    description = "Ativar vigilancia de conteudo especializado (Poker, Psicologia, Neurociencia). Garantir revisao factual de qualquer input nestes dominios e registro em MEMORY.md."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@validador"
    priority    = "medium"
    type        = "observation"
}
$taskJson = $task3 | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $PyScript db-add $taskB64 | Out-Null

Write-Host "[STRATEGY] Tarefa agendada para @validador: Vigilancia Especializada" -ForegroundColor Green

Write-Host "=== ESTRATEGIA APLICADA COM SUCESSO ===" -ForegroundColor Magenta
