# Script de Salvaguarda Sistemica (Snapshot de Seguranca)
# Cria backup imediato de configuracoes, memorias e documentacao critica.
<#
.SYNOPSIS
    Protocolo de Salvaguarda SOTA. Cria um snapshot blindado e enxuto do ecossistema.
.DESCRIPTION
    Erradica o desperdicio de I/O ignorando modulos pre-compilados, bancos vetoriais e 
    ambientes virtuais. Comprime estritamente o codigo, a ontologia e a telemetria.
#>
[CmdletBinding()]
param ()

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$BackupRoot = Join-Path $ProjectRoot ".backups"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$SnapshotDir = Join-Path $BackupRoot "Snapshot_$Timestamp"
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Definicao de alvos criticos (O Cerebro e a Lei do Sistema)
$Targets = @(".claude", "docs", "queue", "logs")
$BaseDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$BackupDir = Join-Path $BaseDir ".backups_sota"

Write-Host "[SAFEGUARD] Iniciando protocolo de salvaguarda..." -ForegroundColor Cyan
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

if (-not (Test-Path $SnapshotDir)) { New-Item -ItemType Directory -Path $SnapshotDir -Force | Out-Null }
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$ArchiveName = "Nexus_Snapshot_$Timestamp.zip"
$ArchivePath = Join-Path $BackupDir $ArchiveName

foreach ($target in $Targets) {
    $sourcePath = Join-Path $ProjectRoot $target
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $SnapshotDir $target
        Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
        Write-Host "  + Backup de '$target' preservado." -ForegroundColor Green
    }
Write-Host "[SALVAGUARDA] Iniciando varredura topologica a partir de $BaseDir..." -ForegroundColor Cyan

# Diretorios e arquivos vitais (Whitelist SOTA)
$IncludeList = @(
    ".claude", "core", "data", "database", "llm", "scripts", "web", "worker", "cli", "agents", "monitoring",
    "frontend\src", "frontend\public", "frontend\package.json", "frontend\tailwind.config.ts", "frontend\next.config.mjs",
    "*.py", "*.ps1", "*.md", "turbo.json", "package.json", ".vscode"
)

# Diretorios nocivos a memoria (Blacklist SOTA)
$ExcludePatterns = @(
    "*\node_modules\*", "*\.venv\*", "*\__pycache__\*", "*\.chroma_db\*", "*\.next\*", "*\.turbo\*", "*\.git\*", "*\.backups_sota\*"
)

Write-Host "[SALVAGUARDA] Comprimindo materia critica. Omitindo entropia..." -ForegroundColor Yellow

# Coleta estrita
$FilesToCompress = Get-ChildItem -Path $BaseDir -Include $IncludeList -Recurse -File | Where-Object {
    $path = $_.FullName
    -not ($ExcludePatterns | Where-Object { $path -like $_ })
}

Write-Host "[SAFEGUARD] Estado do sistema congelado em: $SnapshotDir" -ForegroundColor Yellow
Compress-Archive -Path $FilesToCompress.FullName -DestinationPath $ArchivePath -CompressionLevel Optimal

Write-Host "[VITORIA] Snapshot estrutural fixado em: $ArchivePath" -ForegroundColor Green
Write-Host "[VITORIA] A homeostase esta preservada." -ForegroundColor Green
