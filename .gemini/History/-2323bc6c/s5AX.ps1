<#
.SYNOPSIS
    Gatilho de Auditoria Semanal SOTA (A ser executado via Task Scheduler ou @skillmaster).
.DESCRIPTION
    1. Executa o sota_integrity_test.py.
    2. Enfileira o @verifier para analisar os resultados.
    3. Enfileira o @auditor para chancelar a Lei de Zero-Regressão.
    4. O resultado final será formalizado e notificado a Raphael Vitoi.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$EnvPath = Join-Path $ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host "=== [SKILLMASTER] INICIANDO CICLO DE AUDITORIA SOTA ===" -ForegroundColor Cyan

# 1. Executa os testes físicos
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }
$TestScript = Join-Path $ProjectRoot "scripts\tests\sota_integrity_test.py"

Write-Host "[1/3] Rodando Motor de Testes Python..." -ForegroundColor Yellow
& $PythonCmd $TestScript

# 2. Formula a Tarefa para a Pipeline de QA
$TaskId = "AUDIT-WEEKLY-$(Get-Date -Format 'yyyyMMdd-HHmm')"
$Desc = @"
DIRETRIZ DE AUDITORIA SOTA (SMART MDA):
Os testes de integridade semanais foram executados fisicamente.

1. Leia o arquivo bruto em `.claude/logs/audit/latest_sota_test.log`.
2. Avalie se as métricas de tempo (latência) e sucesso (PASS) indicam perfeição SOTA ou regressão de performance.
3. Formalize um 'Relatório Executivo de Saúde do Ecossistema' no formato Markdown.
4. Salve o relatório em `docs/reports/WEEKLY_AUDIT_LATEST.md` usando o God Mode.
5. Use o comando de notificação Toast do PowerShell para avisar Raphael Vitoi que o relatório está pronto.
"@

$Task = [ordered]@{
    id          = $TaskId
    description = $Desc
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@verifier"
    metadata    = @{ priority = "high" }
}

$TaskJson = $Task | ConvertTo-Json -Depth 10 -Compress
$TaskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($TaskJson))
$Executor = Join-Path $ProjectRoot "task_executor.py"

$Output = & $PythonCmd $Executor db-add $TaskB64
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Pipeline de Verificação Enfileirada: $TaskId" -ForegroundColor Green
}
else {
    Write-Error "Falha ao enfileirar auditoria: $Output"
}