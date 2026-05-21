<#
.SYNOPSIS
    Ativa a Autonomia Sistêmica TOTAL. O pipeline flui de ponta a ponta automaticamente.
#>
$ConfigPath = Join-Path $PSScriptRoot ".claude\autonomy.json"
$ConfigDir = Split-Path $ConfigPath
if (-not (Test-Path $ConfigDir)) { New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null }
'{"mode": "full"}' | Set-Content -Path $ConfigPath -Encoding UTF8
Write-Host "[ON] AUTONOMIA TOTAL ATIVADA. O ecossistema operará (Planner -> Auditor -> Implementor) ininterruptamente." -ForegroundColor Green