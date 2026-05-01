<#
.SYNOPSIS
    Dispara uma rajada de tarefas curtas via do.ps1 para testar fluxo e notificacoes.
#>

Write-Host "=== IGNIFICANDO RAJADA DE TESTES ===" -ForegroundColor Magenta

$Tasks = @(
    "pesquisar brevemente o conceito de GTO no Poker",
    "planejar a estrutura simples para uma pagina de blog",
    "revisar texto e copy sobre a historia dos torneios",
    "orquestrar a divisao do epico de remodelacao da pagina inicial"
)

foreach ($t in $Tasks) {
    # Enfileira passando pela triagem de regex do do.ps1 automaticamente
    .\do.ps1 -InputString $t -Force
    Start-Sleep -Milliseconds 500
}

Write-Host "`n[NEXUS] Rajada injetada. Observe o NEXUS EYE e aguarde as Notificacoes no Windows!" -ForegroundColor Green
