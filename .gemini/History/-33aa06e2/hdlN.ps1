<#
.SYNOPSIS
    Injeta a tarefa de implementação da Página de Artigo Individual para o @implementor.
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: MATERIALIZAÇÃO DA PÁGINA DE ARTIGO ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "ARTICLE-PAGE-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Acesse e leia o arquivo 'docs/tasks/blog-article/SPEC_ARTICLE_PAGE.md'. Implemente a rota dinâmica de Artigo Individual em 'frontend/src/app/blog/[slug]/page.tsx' usando Next.js App Router. Configure o '@tailwindcss/typography' para o design focado em leitura (prose-invert). Crie a lógica de fetch no Prisma e a injeção mista (Markdown parser) que permita embutir o '[SIMULADOR_V1]'."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@implementor"
}

Add-AgentTask -NewTask $task
Write-Host "[NEXUS] Tarefa materializada e delegada ao @implementor." -ForegroundColor Green