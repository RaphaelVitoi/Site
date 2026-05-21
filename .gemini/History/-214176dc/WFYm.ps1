<#
.SYNOPSIS
    Protocolo de Salvaguarda SOTA. Cria um snapshot blindado e enxuto do ecossistema.
.DESCRIPTION
    Erradica o desperdicio de I/O ignorando modulos pre-compilados, bancos vetoriais e 
    ambientes virtuais. Comprime estritamente o codigo, a ontologia e a telemetria.
#>
[CmdletBinding()]
param ()

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$BaseDir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$BackupDir = Join-Path $BaseDir '.backups_sota'

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$ArchiveName = "Nexus_Snapshot_$Timestamp.zip"
$ArchivePath = Join-Path $BackupDir $ArchiveName

Write-Host "[SALVAGUARDA] Iniciando varredura topologica a partir de $BaseDir..." -ForegroundColor Cyan

# Diretorios e arquivos vitais (Whitelist SOTA)
$IncludeList = @(
    '.claude', 'core', 'data', 'database', 'llm', 'scripts', 'web', 'worker', 'cli', 'agents', 'monitoring',
    'frontend\src', 'frontend\public', 'frontend\package.json', 'frontend\tailwind.config.ts', 'frontend\next.config.mjs',
    '*.py', '*.ps1', '*.md', 'turbo.json', 'package.json', '.vscode'
)

# Diretorios nocivos a memoria (Blacklist SOTA)
$ExcludePatterns = @(
    '*\node_modules\*', '*\.venv\*', '*\__pycache__\*', '*\.chroma_db\*', '*\.next\*', '*\.turbo\*', '*\.git\*', '*\.backups_sota\*'
)

Write-Host '[SALVAGUARDA] Comprimindo materia critica. Omitindo entropia...' -ForegroundColor Yellow

# Coleta estrita
$FilesToCompress = Get-ChildItem -Path $BaseDir -Include $IncludeList -Recurse -File | Where-Object {
    $path = $_.FullName
    -not ($ExcludePatterns | Where-Object { $path -like $_ })
}

Compress-Archive -Path $FilesToCompress.FullName -DestinationPath $ArchivePath -CompressionLevel Optimal

Write-Host "[VITORIA] Snapshot estrutural fixado em: $ArchivePath" -ForegroundColor Green
Write-Host '[VITORIA] A homeostase esta preservada.' -ForegroundColor Green