<#
.SYNOPSIS
    Testa a capacidade Multi-Thread do Orquestrador Python no Estado da Arte.
#>
Write-Host "=== TESTE DEFINITIVO: MULTI-THREADING ===" -ForegroundColor Magenta

$Tasks = @(
    "@implementor rodar comando para criar uma pasta de testes temporária `mkdir teste_nexus`. Demore um pouco antes de responder.",
    "@curator escreva uma frase sobre estética cyberpunk.",
    "@maverick gere uma reflexão curta sobre sistemas assíncronos."
)

foreach ($t in $Tasks) {
    # A Membrana entende o Roteamento Absoluto
    .\do.ps1 -InputString $t -Force
    Start-Sleep -Milliseconds 500
}

Write-Host "`n[NEXUS] 3 tarefas injetadas simultaneamente. Abra o 'dashboard' ou 'monitor' e veja todas sendo processadas em paralelo!" -ForegroundColor Green
