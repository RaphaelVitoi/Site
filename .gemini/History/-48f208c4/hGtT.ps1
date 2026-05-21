# CLI Automation: Maverick Analysis & Auditor Check
# Executa as ordens do usuário para análise de retenção e verificação de links.

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== INICIANDO PROTOCOLO CLI ===" -ForegroundColor Cyan

# Tarefa 1: @maverick (Análise de Retenção)
$taskMaverick = [ordered]@{
    id          = "ANALISE-RETENCAO-$(Get-Date -Format 'yyyyMMddHHmm')"
    description = "Analisar o impacto do 'Simulador State of the Art' na retenção da página 'aula-icm.html'. Avaliar se a interatividade aumenta o tempo de permanência ou gera distração cognitiva (Churn)."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@maverick"
    priority    = "high"
}
Add-AgentTask -NewTask $taskMaverick
Write-Host "[CLI] Tarefa enviada para @maverick: Análise de Retenção." -ForegroundColor Magenta

# Tarefa 2: @auditor (Broken Links)
$taskAuditor = [ordered]@{
    id          = "AUDIT-LINKS-$(Get-Date -Format 'yyyyMMddHHmm')"
    description = "Verificar integridade de todos os links internos em 'aula-icm.html'. Confirmar se o iframe do simulador e os botões de navegação apontam para destinos válidos (HTTP 200)."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@auditor"
    priority    = "medium"
}
Add-AgentTask -NewTask $taskAuditor
Write-Host "[CLI] Tarefa enviada para @auditor: Verificação de Links." -ForegroundColor Red