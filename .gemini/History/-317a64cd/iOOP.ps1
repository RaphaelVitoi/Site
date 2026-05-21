<#
.SYNOPSIS
    Aciona o ciclo de auto-otimizacao do algoritmo de priorizacao de tarefas.
.DESCRIPTION
    Enfileira uma tarefa para o @historian analisar o throughput historico e,
    em seguida, para o @skillmaster aplicar os novos pesos de calibracao (alpha, beta, gamma)
    no sistema, garantindo que o scheduler se adapte para a maxima eficiencia.
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$EnvPath = Join-Path $ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host "=== INICIANDO PROTOCOLO DE RECALIBRACAO DE PRIORIDADE (CPU) ===" -ForegroundColor Cyan

# --- Funcao Auxiliar para Enfileirar Tarefa ---
function Enqueue-NexusTask {
    param(
        [hashtable]$TaskData
    )
    $taskJson = $TaskData | ConvertTo-Json -Depth 10 -Compress
    $taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
    $PyScript = Join-Path $ProjectRoot "task_executor.py"
    $PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

    $output = & $PythonCmd $PyScript db-add $taskB64
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao enfileirar tarefa $($TaskData.id): $output"
        exit 1
    }
    Write-Host "[OK] Tarefa $($TaskData.id) enfileirada para $($TaskData.agent)." -ForegroundColor Green
}

# --- ETAPA 1: Tarefa para @historian ---
$historianTaskId = "MAINT-CPU-ANALYZE-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$historianTaskDesc = @"
DIRETRIZ DE ANALISE DO ALGORITMO DE PRIORIDADE (CPU - Critical Path Utility):
Sua missao e analisar a eficiencia do scheduler de tarefas.

1.  Acesse o banco de dados `tasks.db` e analise o historico de tarefas dos ultimos 7 dias.
2.  Foque nas seguintes metricas:
    -   `workflow_duration_ms`: Tempo total de conclusao da tarefa.
    -   `wait_time_ms`: Diferenca entre `workflow_started_at` e `timestamp`.
    -   `priority`: A prioridade base da tarefa.
    -   `descendant_count`: O numero de tarefas que dependiam dela (pode ser inferido).
3.  Seu objetivo e encontrar uma correlacao entre os pesos atuais (alpha, beta, gamma, lambda_rate) e o `wait_time_ms` geral do sistema.
4.  Com base na sua analise, proponha novos valores para os pesos `alpha`, `beta`, `gamma` e `lambda_rate` que poderiam otimizar o throughput.
5.  Justifique a mudanca: "Aumentar `beta` deve priorizar tarefas-gargalo", "Aumentar `gamma` deve reduzir o 'starvation' de tarefas de baixa prioridade".
6.  Salve sua analise e a proposta de novos pesos em um arquivo de relatorio: `docs/reports/recalibration/CPU_ANALYSIS_$(Get-Date -Format 'yyyyMMdd_HHmm').md`.
"@

$historianTask = [ordered]@{
    id          = $historianTaskId
    description = $historianTaskDesc
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@historian"
    metadata    = @{ priority = "high" }
}
Enqueue-NexusTask -TaskData $historianTask

# --- ETAPA 2: Tarefa para @skillmaster ---
$skillmasterTaskId = "MAINT-CPU-APPLY-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$skillmasterTaskDesc = @"
DIRETRIZ DE APLICACAO DE RECALIBRACAO DO ALGORITMO DE PRIORIDADE (CPU):
O @historian concluiu a analise de performance do scheduler.

1.  Leia o relatorio de analise mais recente em `docs/reports/recalibration/`.
2.  Valide a logica da proposta de novos pesos para `alpha`, `beta`, `gamma` e `lambda_rate`.
3.  Use o God Mode para atualizar o arquivo `data/system_config.json`, adicionando ou modificando a secao `priority_weights` com os novos valores validados.

Exemplo de output para o God Mode:
Arquivo: data/system_config.json
```json
{
    // ... outras configuracoes ...
    "priority_weights": {
        "alpha": 1.0,
        "beta": 2.5,
        "gamma": 1.2,
        "lambda_rate": 0.25
    }
    // ... outras configuracoes ...
}
```
4.  Apos a atualizacao, o Orquestrador passara a usar os novos pesos dinamicamente na proxima selecao de tarefa.
"@

$skillmasterTask = [ordered]@{
    id          = $skillmasterTaskId
    description = $skillmasterTaskDesc
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@skillmaster"
    metadata    = @{
        priority   = "high"
        depends_on = @($historianTaskId)
    }
}
Enqueue-NexusTask -TaskData $skillmasterTask

Write-Host "[SUCESSO] Pipeline de recalibracao de prioridade enfileirada." -ForegroundColor Cyan
Write-Host "[ACAO RECOMENDADA] Execute 'python .\task_executor.py worker' para que a otimizacao seja executada." -ForegroundColor Yellow
