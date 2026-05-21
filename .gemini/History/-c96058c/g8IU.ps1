<#
.SYNOPSIS
    Injeta a tarefa de implementação da Página Inicial (Home) para o @implementor.
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: MATERIALIZAÇÃO DA HOME PAGE === " -ForegroundColor Magenta

$task = [ordered]@{
    id          = "HOME-PAGE-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Acesse e leia o arquivo 'SPEC_BLOG_HOME.md'. Implemente a UI da Página Inicial substituindo o conteúdo de 'frontend/src/app/page.tsx'. Use rigorosamente a paleta Dark/Cyber (bg-slate-950, etc.) e as fontes configuradas no tailwind.config.ts. Crie a Hero Section, a Vitrine de Ferramentas e um mock do Feed de Artigos conforme a SPEC."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@implementor"
}

Add-AgentTask -NewTask $task
Write-Host "[NEXUS] Tarefa da Home Page delegada ao @implementor." -ForegroundColor Green