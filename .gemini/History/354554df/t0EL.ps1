# Script de Salvaguarda Sistêmica (Snapshot de Segurança)
# Cria backup imediato de configurações, memórias e documentação crítica.

$BackupRoot = Join-Path $PSScriptRoot ".backups"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$SnapshotDir = Join-Path $BackupRoot "Snapshot_$Timestamp"

# Definição de alvos críticos (O Cérebro e a Lei do Sistema)
$Targets = @(".claude", "docs", "queue", "logs")

Write-Host "[SAFEGUARD] Iniciando protocolo de salvaguarda..." -ForegroundColor Cyan

if (-not (Test-Path $SnapshotDir)) { New-Item -ItemType Directory -Path $SnapshotDir -Force | Out-Null }

foreach ($target in $Targets) {
    $sourcePath = Join-Path $PSScriptRoot $target
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $SnapshotDir $target
        Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
        Write-Host "  + Backup de '$target' preservado." -ForegroundColor Green
    }
}

Write-Host "[SAFEGUARD] Estado do sistema congelado em: $SnapshotDir" -ForegroundColor Yellow