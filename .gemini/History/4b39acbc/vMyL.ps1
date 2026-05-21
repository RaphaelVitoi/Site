<#
.SYNOPSIS
    Inicia o servidor de desenvolvimento do Next.js para visualizacao da nova arquitetura.
#>

Write-Host "=== LIGANDO MOTOR NEXT.JS (NOVO SITE) ===" -ForegroundColor Magenta
Write-Host "[NEXUS] O painel visual estara disponivel em: http://localhost:3000" -ForegroundColor Cyan

cd "$PSScriptRoot\..\..\frontend"
npm run dev
