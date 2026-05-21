<#
.SYNOPSIS
    Injeta o Épico do Sistema de Blog para o @dispatcher orquestrar.
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: EPIC BLOG SYSTEM ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "EPIC-BLOG-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Épico: Criar uma arquitetura de geração automática de artigos para o Blog (Temas: Poker e Psicologia). Precisamos estabelecer um fluxo em que o sistema pesquisa os temas em tendência, estrutura o SEO e os intertítulos, redige o conteúdo e gera um template HTML/Markdown para exibição estética no site. Analise este épico complexo e enfileire as tarefas técnicas na ordem exata para os agentes da tríade correta (@planner, @pesquisador, @curator, @implementor, etc)."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@dispatcher"
}

Add-AgentTask -NewTask $task

Write-Host "[NEXUS] O Épico do Blog foi entregue ao @dispatcher." -ForegroundColor Green