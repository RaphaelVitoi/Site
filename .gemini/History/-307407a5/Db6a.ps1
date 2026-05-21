<#
.SYNOPSIS
    Gatilho do Relatório Semanal de Performance (A ser executado via Task Scheduler).
.DESCRIPTION
    1. Coleta os dados de performance e custo da última semana via Kernel.
    2. Enfileira uma tarefa para o @historian analisar os dados e gerar o relatório.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$EnvPath = Join-Path $ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host "=== [SISTEMA] INICIANDO CICLO DE RELATÓRIO SEMANAL DE PERFORMANCE ===" -ForegroundColor Cyan

# 1. Coleta os dados brutos do Kernel
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }
$ExecutorScript = Join-Path $ProjectRoot "task_executor.py"

Write-Host "[1/2] Coletando métricas de performance do banco de dados..." -ForegroundColor Yellow
$ReportJson = & $PythonCmd $ExecutorScript "db-get-agent-report"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha crítica ao coletar dados de performance: $ReportJson"
    exit 1
}

# 2. Formula a Tarefa para o @historian
$TaskId = "REPORT-WEEKLY-$(Get-Date -Format 'yyyyMMdd')"
$Desc = @"
DIRETRIZ DE ANÁLISE HISTÓRICA PARA @historian:
Os dados de performance e custo da última semana foram coletados.

DADOS BRUTOS:
```json
$ReportJson
```

Sua missão é transformar estes dados brutos em um 'Relatório Semanal de Produtividade e Custo' em formato Markdown SOTA. O relatório deve conter:
1.  Uma tabela principal com as colunas: Agente, Tarefas Concluídas, Custo (Tokens), Eficiência (Tarefas/1k Tokens).
2.  Uma breve análise (2-3 parágrafos) destacando os agentes mais produtivos, os mais eficientes e quaisquer anomalias (ex: alto custo para baixa produtividade).
3.  Um diagrama Mermaid (bar chart) visualizando o número de tarefas concluídas por agente.

Salve o relatório final em `docs/reports/WEEKLY_PERFORMANCE_LATEST.md` usando o God Mode.
"@

$Task = [ordered]@{ id = $TaskId; description = $Desc; status = "pending"; timestamp = (Get-Date -Format "o"); agent = "@historian"; metadata = @{ priority = "medium" } }
$TaskJson = $Task | ConvertTo-Json -Depth 10 -Compress
$TaskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($TaskJson))

$Output = & $PythonCmd $ExecutorScript db-add $TaskB64
if ($LASTEXITCODE -eq 0) { Write-Host "[2/2] [OK] Tarefa de relatório ($TaskId) enfileirada para o @historian." -ForegroundColor Green } else { Write-Error "Falha ao enfileirar tarefa: $Output" }