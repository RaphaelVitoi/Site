<#
.SYNOPSIS
    Configura o sistema para Autonomia PARCIAL.
#>
$ProjectRoot = (Get-Item $PSScriptRoot).parent.parent.FullName
$AutonomyFile = Join-Path $ProjectRoot ".claude\autonomy.json"

$Config = @{ mode = "partial" }
$JsonContent = $Config | ConvertTo-Json -Compress

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($AutonomyFile, $JsonContent, $Utf8NoBomEncoding)

Write-Host "[AUTONOMIA] Sistema configurado para Autonomia PARCIAL." -ForegroundColor Yellow
Write-Host "[AVISO] Agentes agora pausarao antes de etapas criticas (ex: escrita de codigo)." -ForegroundColor DarkGray