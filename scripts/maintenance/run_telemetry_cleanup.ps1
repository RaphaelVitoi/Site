<#
.SYNOPSIS
    Aciona o expurgo de registros de telemetria antigos do banco de dados SQLite.
.DESCRIPTION
    Invoca o script TypeScript `cleanup-telemetry.ts` via ts-node para
    remover eventos de telemetria com mais de 15 dias, mantendo a base
    de dados enxuta e performática.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$FrontendDir = Join-Path $ProjectRoot 'frontend'

Write-Host '=== [SKILLMASTER] ACIONANDO EXPURGO DE TELEMETRIA SOTA ===' -ForegroundColor Magenta

Set-Location -Path $FrontendDir

npx ts-node 'prisma/cleanup-telemetry.ts'
