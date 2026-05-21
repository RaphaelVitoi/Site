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

# Extrai as estatisticas reais de performance (Latencia/Produtividade)
$Executor = Join-Path $ProjectRoot "task_executor.py"
$StatsJson = & $PythonCmd $Executor db-stats
if ($LASTEXITCODE -ne 0) { $StatsJson = "Sem dados estatisticos no momento." }

# 2. Formula a Tarefa para a Pipeline de QA
$TaskId = "AUDIT-WEEKLY-$(Get-Date -Format 'yyyyMMdd-HHmm')"
$Desc = @"
DIRETRIZ DE AUDITORIA SOTA E SMART MDA:
Os testes de integridade semanais foram executados fisicamente.

1. Leia o arquivo bruto em `.claude/logs/audit/latest_sota_test.log` e analise a fundo.
2. Formalize o 'Relatório Executivo de Saúde do Ecossistema' no formato Markdown SOTA.
3. OBRIGACOES DO RELATORIO (DIRETRIZ DE ALTO ESCALAO):
   - Sofisticacao e Didatismo: O texto deve ser direto, denso, estetico e educacional.
   - Visuais SOTA: Utilize tabelas comparativas, representacoes ASCII ou diagramas Mermaid para dados.
   - Comparacao e Antevisao: Apresente o "Antes vs Depois" de maneira logica e semantica (ex: como o sistema operava vs como performou no teste atual).
   - Hibrido e Performance: Analise os testes brutos E incorpore este relatorio de produtividade historica (MDA):
     `$StatsJson`
4. CORTEX SHIELD ANTI-ALUCINACAO: Esta estritamente PROIBIDO o uso de "smoothing" (suavizacao de falhas), enviesamento, fabricacao de dados ou artificialidade. Seja frio, cirurgico e factual. Exponha os erros cruamente se existirem.
5. Salve o relatorio definitivo em `docs/reports/WEEKLY_AUDIT_LATEST.md` usando o God Mode.
6. Dispare o comando de notificacao Toast do PowerShell para avisar Raphael Vitoi que a auditoria SOTA foi finalizada.
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