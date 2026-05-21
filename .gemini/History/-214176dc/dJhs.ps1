# Script de Salvaguarda Sistemica (Snapshot de Seguranca)
# Cria backup imediato de configuracoes, memorias e documentacao critica.

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$BackupRoot = Join-Path $ProjectRoot ".backups"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$SnapshotDir = Join-Path $BackupRoot "Snapshot_$Timestamp"

# Definicao de alvos criticos (O Cerebro e a Lei do Sistema)
$Targets = @(".claude", "docs", "queue", "logs")

Write-Host "[SAFEGUARD] Iniciando protocolo de salvaguarda..." -ForegroundColor Cyan

if (-not (Test-Path $SnapshotDir)) { New-Item -ItemType Directory -Path $SnapshotDir -Force | Out-Null }

foreach ($target in $Targets) {
    $sourcePath = Join-Path $ProjectRoot $target
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $SnapshotDir $target
        Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
        Write-Host "  + Backup de '$target' preservado." -ForegroundColor Green
    }
}

Write-Host "[SAFEGUARD] Estado do sistema congelado em: $SnapshotDir" -ForegroundColor Yellow
