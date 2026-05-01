# CLI Automation: Maverick Analysis & Auditor Check
# Executa as ordens do usuario para analise de retencao e verificacao de links.

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }

Write-Host "=== INICIANDO PROTOCOLO CLI ===" -ForegroundColor Cyan

# Tarefa 1: @maverick (Analise de Retencao)
$taskMaverick = [ordered]@{
    id          = "ANALISE-RETENCAO-$(Get-Date -Format 'yyyyMMddHHmm')"
    description = "Analisar o impacto do 'Simulador State of the Art' na retencao da pagina 'aula-icm.html'. Avaliar se a interatividade aumenta o tempo de permanencia ou gera distracao cognitiva (Churn)."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@maverick"
    priority    = "high"
}
$taskJson = $taskMaverick | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $PyScript db-add $taskB64 | Out-Null

Write-Host "[CLI] Tarefa enviada para @maverick: Analise de Retencao." -ForegroundColor Magenta

# Tarefa 2: @auditor (Broken Links)
$taskAuditor = [ordered]@{
    id          = "AUDIT-LINKS-$(Get-Date -Format 'yyyyMMddHHmm')"
    description = "Verificar integridade de todos os links internos em 'aula-icm.html'. Confirmar se o iframe do simulador e os botoes de navegacao apontam para destinos validos (HTTP 200)."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@auditor"
    priority    = "medium"
}
$taskJson = $taskAuditor | ConvertTo-Json -Depth 10 -Compress:$true
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
& $PythonCmd $PyScript db-add $taskB64 | Out-Null

Write-Host "[CLI] Tarefa enviada para @auditor: Verificacao de Links." -ForegroundColor Red
