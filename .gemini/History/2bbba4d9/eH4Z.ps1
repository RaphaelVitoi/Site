<# Comando para ativar Autonomia Parcial #>
$Path = Join-Path $PSScriptRoot ".claude\autonomy.json"
if (-not (Test-Path (Split-Path $Path))) { New-Item -ItemType Directory -Path (Split-Path $Path) -Force | Out-Null }
'{"mode": "partial"}' | Set-Content -Path $Path -Encoding UTF8
Write-Host "[NEXUS] Autonomia configurada para: PARCIAL. O sistema pausará antes de ações críticas." -ForegroundColor Yellow