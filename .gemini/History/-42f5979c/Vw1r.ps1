<#
.SYNOPSIS
    Aciona o @curator para revisar e refinar a copy dos CTAs da Home.
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: CURADORIA DE COPY (@CURATOR) ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "CURADORIA-HOME-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Acesse e leia o arquivo 'docs/tasks/blog-home/SPEC_BLOG_HOME.md'. Revise os CTAs (Call To Action) propostos na seção 2.1 (Hero Section) e a headline. Sugira uma copy mais persuasiva, profunda e alinhada com o tom da COSMOVISAO.md ('Beleza Estrutural' e 'Autoridade'). O objetivo é convidar o usuário para a jornada de 'Aprendizado Generativo' sem parecer um apelo comercial barato. Anexe suas sugestões ao final do arquivo ou proponha a substituição direta."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@curator"
}

Add-AgentTask -NewTask $task
Write-Host "[NEXUS] Solicitação de curadoria delegada ao @curator." -ForegroundColor Cyan