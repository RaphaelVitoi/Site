<#
.SYNOPSIS
    Interface direta com o Agente @bibliotecario (RAG Search).
#>
param(
    [Parameter(Position = 0)]
    [string]$Question
)

if ([string]::IsNullOrWhiteSpace($Question)) {
    Write-Host "=== 📚 BIBLIOTECÁRIO NEXUS ===" -ForegroundColor Green
    $Question = Read-Host "O que deseja buscar na Mente Coletiva?"
}

python memory_rag.py query "$Question"