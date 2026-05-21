<#
.SYNOPSIS
    Configura o sistema para Autonomia DESATIVADA.
#>
$ProjectRoot = (Get-Item $PSScriptRoot).parent.parent.FullName
$AutonomyFile = Join-Path $ProjectRoot ".claude\autonomy.json"

$Config = @{ mode = "off" }
$JsonContent = $Config | ConvertTo-Json -Compress

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($AutonomyFile, $JsonContent, $Utf8NoBomEncoding)

Write-Host "[AUTONOMIA] Sistema configurado para Autonomia DESATIVADA." -ForegroundColor Red
Write-Host "[AVISO] O sistema agora exigira comando manual para cada etapa do pipeline." -ForegroundColor DarkGray