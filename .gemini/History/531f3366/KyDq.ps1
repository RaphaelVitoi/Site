<#
.SYNOPSIS
    Configura o sistema para Autonomia TOTAL.
#>
$ProjectRoot = (Get-Item $PSScriptRoot).parent.parent.FullName
$AutonomyFile = Join-Path $ProjectRoot ".claude\autonomy.json"

$Config = @{ mode = "full" }
$JsonContent = $Config | ConvertTo-Json -Compress

# Forca a escrita com encoding UTF8 sem BOM, que e o padrao para JSON
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($AutonomyFile, $JsonContent, $Utf8NoBomEncoding)

Write-Host "[AUTONOMIA] Sistema configurado para Autonomia TOTAL." -ForegroundColor Green
Write-Host "[AVISO] Agentes agora executarao o ciclo completo (design -> implementacao) sem intervencao." -ForegroundColor Yellow