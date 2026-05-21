<#
.SYNOPSIS
    Aciona o @maverick para um Relatório Sentinela sobre Aprendizado Generativo no Poker.
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: SENTINELA PEDAGÓGICO (@MAVERICK) ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "SENTINELA-PEDAGOGIA-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Elabore um 'Relatório Sentinela' focado nos desafios e oportunidades pedagógicas do novo site. Como podemos transformar o consumo de conteúdo de poker (teoria, ICM, mindset) em uma experiência de 'Aprendizado Generativo' para o usuário final? Reflita sobre os 7 modos de aprendizado documentados na ESTADO_ARTE_APRENDIZADO_GENERATIVO.md e a ética da COSMOVISAO.md. Identifique riscos de cairmos no padrão de 'educação passiva' e sugira inovações arquiteturais e de design."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@maverick"
}

Add-AgentTask -NewTask $task
Write-Host "[NEXUS] Solicitação do Relatório Sentinela delegada ao @maverick." -ForegroundColor Cyan