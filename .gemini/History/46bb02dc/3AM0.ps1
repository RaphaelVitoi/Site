<#
.SYNOPSIS
    Injeta a tarefa inicial de materialização do site para o @implementor.
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: MATERIALIZAÇÃO DO SITE (GREENFIELD) ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "SITE-IMPL-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Acesse e leia a especificação em '.claude/SPEC_ROTEAMENTO_DB.md'. Em cenário Greenfield, execute rigorosamente o 'Plano de Execução' descrito na seção 3: 1) Entrar no diretório frontend e instalar dependências do Prisma; 2) Inicializar o Prisma; 3) Materializar o schema.prisma com o modelo Post; 4) Criar a estrutura de pastas e rotas iniciais vazias do Next.js App Router e componentes. Use sua Autoridade Suprema para rodar comandos e forjar os arquivos."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@implementor"
}

Add-AgentTask -NewTask $task
Write-Host "[NEXUS] Tarefa materializada e delegada ao @implementor." -ForegroundColor Green