<#
.SYNOPSIS
    Ativa a Autonomia Sistêmica PARCIAL. O pipeline pausa antes de implementar código real.
#>
$ConfigPath = Join-Path $PSScriptRoot ".claude\autonomy.json"
$ConfigDir = Split-Path $ConfigPath
if (-not (Test-Path $ConfigDir)) { New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null }
'{"mode": "partial"}' | Set-Content -Path $ConfigPath -Encoding UTF8
Write-Host "[PAUSED] AUTONOMIA PARCIAL ATIVADA. Agentes planejam e auditam sozinhos, mas a execução final (@implementor) requer sua aprovação." -ForegroundColor Yellow