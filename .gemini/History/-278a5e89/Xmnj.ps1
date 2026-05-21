<# Comando para ativar Autonomia Total #>
$Path = Join-Path $PSScriptRoot ".claude\autonomy.json"
if (-not (Test-Path (Split-Path $Path))) { New-Item -ItemType Directory -Path (Split-Path $Path) -Force | Out-Null }
'{"mode": "full"}' | Set-Content -Path $Path -Encoding UTF8
Write-Host "[NEXUS] Autonomia configurada para: TOTAL (ON). Agentes agirão sem bloqueios." -ForegroundColor Green