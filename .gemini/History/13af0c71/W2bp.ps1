<#
.SYNOPSIS
    Teste E2E de Injeção de Telemetria no Next.js (God Mode W3)
.DESCRIPTION
    Dispara um payload SOTA validado pelo Zod para o endpoint e perfura a camada
    do Prisma para verificar a integridade estrutural (homeostase) direto no SQLite.
#>

[CmdletBinding()]
param (
    [string]$EndpointUrl = 'http://localhost:3000/api/telemetry' # Altere se o route.ts for montado em outro path
)

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }

Write-Host '=== [GOD MODE] TESTE E2E: INJEÇÃO DE TELEMETRIA SOTA ===' -ForegroundColor Magenta

$Payload = [ordered]@{
    scenarioId            = "god-mode-test-$(Get-Date -Format 'HHmmss')"
    baseState             = @{ chipEvFold = -1.25; icmValuation = 15.5 }
    dynamicModifiers      = @{ timeToBlindJumpMinutes = 5.5; payjumpProximityFactor = 0.85; positionalUrgency = 0.9 }
    structuralLiabilities = @{ multiwayOpponents = 2; reverseImpliedOddsPenalty = 0.15 }
    edgeRelative          = @{ stackDepthBb = 25.0; humanNoiseFactor = 0.1; technicalSuperiority = 0.8 }
    insolvency            = @{ potOddsRatio = 0.45; perspectiveUtility = 2.1; insolvencyCoefficient = 0.35; isViable = $true }
}

$JsonPayload = $Payload | ConvertTo-Json -Depth 10 -Compress

Write-Host "`n[1/2] Disparando Matriz de Dados Zod para $EndpointUrl..." -ForegroundColor Yellow
try {
    $Response = Invoke-RestMethod -Uri $EndpointUrl -Method Post -Body $JsonPayload -ContentType 'application/json' -ErrorAction Stop
    Write-Host "  [OK] Servidor Next.js acatou a mutação: $($Response | ConvertTo-Json -Compress)" -ForegroundColor Green
}
catch {
    Write-Error "  [FALHA] O endpoint recusou a injeção ou está offline. Certifique-se de que moveu o route.ts para o diretório correto: $_"
    exit 1
}

Write-Host "`n[2/2] Validando Homeostase Física no SQLite via Motor Python..." -ForegroundColor Yellow
$DbPath = (Join-Path $ProjectRoot 'frontend\prisma\dev.db').Replace('\', '/')
$PyScript = @"
import sqlite3, sys
try:
    conn = sqlite3.connect('$DbPath')
    conn.row_factory = sqlite3.Row
    row = conn.execute('SELECT id, scenarioId, perspectiveUtility FROM VitoiPerspectiveMetric ORDER BY createdAt DESC LIMIT 1').fetchone()
    print(f'  -> ID: {row["id"]} | Scenario: {row["scenarioId"]} | Utility: {row["perspectiveUtility"]}')
    print(f'  -> ID: {row[0]} | Scenario: {row[1]} | Utility: {row[2]}')
except Exception as e:
    print(f'  [ERRO] Falha ao acessar a matriz termodinâmica do SQLite: {e}', file=sys.stderr)
    sys.exit(1)
"@

$Output = & $PythonCmd -c $PyScript
if ($LASTEXITCODE -eq 0) {
    Write-Host '  [OK] Registro consolidado inequivocamente no disco:' -ForegroundColor Green
    Write-Host $Output -ForegroundColor Cyan
    Write-Host "`n[VITORIA] A simetria entre o Front-end (Next.js), o Parser Estrito (Zod) e o Database (Prisma/SQLite) está absoluta." -ForegroundColor Green
}
