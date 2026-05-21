<# Comando para desativar a Autonomia #>
$Path = Join-Path $PSScriptRoot ".claude\autonomy.json"
if (-not (Test-Path (Split-Path $Path))) { New-Item -ItemType Directory -Path (Split-Path $Path) -Force | Out-Null }
'{"mode": "off"}' | Set-Content -Path $Path -Encoding UTF8
Write-Host "[NEXUS] Autonomia configurada para: DESATIVADA (OFF). Requer comando manual." -ForegroundColor Red