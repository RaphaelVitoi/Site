<#
.SYNOPSIS
    Gatilho de Auditoria SOTA Sob Demanda (Smart MDA Adaptativo).
.DESCRIPTION
    Permite que Raphael Vitoi ou os agentes disparem um teste de integridade
    com um foco especifico. Forca o @verifier a gerar um relatorio C-Level SOTA,
    sem alucinacoes ou "smoothing".
#>
param (
    [string]$Scenario = "Auditoria Global de Integridade e Homeostase"
)

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$EnvPath = Join-Path $ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host "=== [CHICO] INVOCANDO AUDITORIA ADAPTATIVA SOTA ===" -ForegroundColor Cyan
Write-Host "Foco/Cenario: $Scenario" -ForegroundColor DarkGray

# 1. Executa os testes físicos Python
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }
$TestScript = Join-Path $ProjectRoot ".claude\sota_integrity_test.py"

Write-Host "[1/2] Rodando Motor de Testes Python..." -ForegroundColor Yellow
& $PythonCmd $TestScript

# Extrai as estatisticas reais de performance (Latencia/Produtividade)
$Executor = Join-Path $ProjectRoot "task_executor.py"
$StatsJson = & $PythonCmd $Executor db-stats
if ($LASTEXITCODE -ne 0) { $StatsJson = "Sem dados estatisticos no momento." }

# 2. Formula a Tarefa Hibrida (Smart MDA)
$TaskId = "AUDIT-CUSTOM-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$Desc = @"
DIRETRIZ DE AUDITORIA ADAPTATIVA SOTA E SMART MDA:
Os testes de integridade fisica foram executados. Raphael Vitoi solicitou o seguinte FOCO/CENARIO para sua analise: "$Scenario".

1. Leia o arquivo bruto recem-gerado em `.claude/logs/audit/latest_sota_test.log`.
2. Formalize o 'Relatorio Executivo de Auditoria Sob Demanda' (Markdown SOTA).
3. OBRIGACOES DO RELATORIO (DIRETRIZ C-LEVEL):
   - Foco Adaptativo: Analise os dados sob a lente do cenario solicitado ("$Scenario").
   - Sofisticacao: Denso, direto, estetico e didatico.
   - Visuais: Utilize tabelas comparativas, ASCII ou diagramas Mermaid SOTA.
   - Hibrido e Performance: Avaliacao Quantitativa (latencia, I/O, RAM), Historico MDA (`$StatsJson`) e Qualitativa.
   - Antevisao: Avalie o impacto futuro destas metricas (Passado > Presente > Futuro).
4. CORTEX SHIELD ANTI-ALUCINACAO: E expressamente PROIBIDO o uso de "smoothing" (suavizacao de falhas), enviesamento, fabricacao de dados ou artificialidade. Seja frio, cirurgico e factual. Exponha a entropia.
5. AVALIACAO SENSORIAL: Apos concluir a analise, determine categoricamente o nivel de risco/saude: 'Perfect', 'Low', 'Moderate', 'High' ou 'Critical'.
6. Salve o relatorio definitivo em `docs/reports/AUDIT_ONDEMAND_$(Get-Date -Format 'yyyyMMdd_HHmm').md` via God Mode.
7. INVOCAR ALARME: No seu output, chame o motor sensorial SOTA EXATAMENTE assim, adaptando o nivel e a mensagem:
Comando: `powershell.exe -ExecutionPolicy Bypass -File "scripts/routines/send_alert.ps1" -Level "SEU_NIVEL_AQUI" -Title "Auditoria SOTA Concluida" -Message "Resumo em 1 frase da conclusao."`
"@

$Task = [ordered]@{
    id          = $TaskId
    description = $Desc
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@verifier"
    metadata    = @{ priority = "critical"; scenario = $Scenario }
}

$TaskJson = $Task | ConvertTo-Json -Depth 10 -Compress
$TaskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($TaskJson))
$Executor = Join-Path $ProjectRoot "task_executor.py"

$Output = & $PythonCmd $Executor db-add $TaskB64
if ($LASTEXITCODE -eq 0) { Write-Host "[OK] Pipeline Smart MDA Enfileirada: $TaskId" -ForegroundColor Green } else { Write-Error "Falha: $Output" }