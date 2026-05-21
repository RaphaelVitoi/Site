<#
.SYNOPSIS
    Expurgo SOTA de Entropia e Arquivos Mortos.
#>
Write-Host '=== INICIANDO EXPURGO DE LIXO DIGITAL SOTA ===' -ForegroundColor Cyan

$ProjectRoot = (Resolve-Path "$PSScriptRoot\..\..").Path

# Alvos detectados pela Auditoria Bayesiana
$DeadPaths = @(
    'worker\Java',
    'temp_media',
    'docs\epics\aula-icm-rp\NashSolver.js',
    'docs\epics\aula-icm-rp\archived'
)

foreach ($p in $DeadPaths) {
    $TargetPath = Join-Path $ProjectRoot $p
    if (Test-Path $TargetPath) {
        Write-Host "[EXPURGO] Aniquilando: $TargetPath" -ForegroundColor Yellow
        Remove-Item -Path $TargetPath -Recurse -Force -Confirm:$false
    }
}

Write-Host "`n[OK] Entropia obliterada. Economia de Shannon restaurada." -ForegroundColor Green
