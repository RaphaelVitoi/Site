<#
.SYNOPSIS
    Expurgo cirúrgico de dependências não utilizadas (P1-5).
#>
$ErrorActionPreference = 'Stop'
$FrontendDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\frontend'))

Write-Host '=== INICIANDO EXPURGO DE DEPENDENCIAS FANTASMAS (P1-5) ===' -ForegroundColor Magenta
Set-Location $FrontendDir
npm uninstall html2canvas jspdf recharts zustand
Write-Host '[OK] Entropia erradicada do package.json com sucesso.' -ForegroundColor Green
