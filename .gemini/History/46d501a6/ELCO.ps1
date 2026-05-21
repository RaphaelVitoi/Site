<#
.SYNOPSIS
    Injeta a tarefa para o @implementor popular o banco de dados com artigos mockados.
#>

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== PROTOCOLO: MOCK DE DADOS (PRISMA SEED) ===" -ForegroundColor Magenta

$task = [ordered]@{
    id          = "SEED-DB-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "1. Crie um arquivo 'frontend/prisma/seed.ts'. 2. Adicione um script que limpe a tabela Post e insira 3 artigos de teste. Os artigos devem ter títulos como 'O Paradoxo do Valuation no ICM', 'A Ameaça Orgânica' e 'O Motor de Diluição', com conteúdo lorem ipsum/placeholder, readTime (ex: 8, 12, 5) e tags nativas do PostgreSQL (ex: ['ICM', 'Teoria'], ['Mindset']). 3. Atualize o 'package.json' adicionando o comando 'prisma': {'seed': 'ts-node prisma/seed.ts'}. 4. Instale o ts-node se necessário e execute o seed ('npx prisma db seed')."
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@implementor"
}

Add-AgentTask -NewTask $task
Write-Host "[NEXUS] Tarefa de Seed do Banco de Dados delegada ao @implementor." -ForegroundColor Green
Write-Host "Lembre-se: O Orquestrador precisa estar rodando para pegar esta tarefa." -ForegroundColor DarkGray