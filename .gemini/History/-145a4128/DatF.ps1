<#
.SYNOPSIS
    Inicia o servidor de desenvolvimento do Next.js para visualização da nova arquitetura.
#>

Write-Host "=== LIGANDO MOTOR NEXT.JS (NOVO SITE) ===" -ForegroundColor Magenta
Write-Host "[NEXUS] O painel visual estará disponível em: http://localhost:3000" -ForegroundColor Cyan

cd "$PSScriptRoot\frontend"
npm run dev