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
Write-Host '[SALVAGUARDA] Construindo arvore de espelhamento (Isolamento de Entropia)...' -ForegroundColor Yellow

# Diretorios nocivos a memoria (Blacklist SOTA)
$ExcludePatterns = @(
    '*\node_modules\*', '*\.venv\*', '*\__pycache__\*', '*\.chroma_db\*', '*\.next\*', '*\.turbo\*', '*\.git\*', '*\.backups_sota\*'
$StagingDir = Join-Path $BackupDir "staging_$Timestamp"
New-Item -ItemType Directory -Path $StagingDir | Out-Null

# SOTA: Substituicao do Get-ChildItem (lento e vulneravel a Reparse Points do OneDrive)
# pelo Robocopy nativo do Windows. Ignora juncoes (/XJ) e exclui bloat na origem (/XD).
$RobocopyArgs = @(
    $BaseDir, $StagingDir,
    '/S', '/XJ', '/R:0', '/W:0',
    '/XD', 'node_modules', '.venv', '__pycache__', '.chroma_db', '.next', '.turbo', '.git', '.backups_sota',
    '/NFL', '/NDL', '/NJH', '/NJS', '/nc', '/ns', '/np'
)
& robocopy @RobocopyArgs | Out-Null

Write-Host '[SALVAGUARDA] Comprimindo materia critica. Omitindo entropia...' -ForegroundColor Yellow
Write-Host '[SALVAGUARDA] Comprimindo materia critica estruturada...' -ForegroundColor Yellow
Compress-Archive -Path "$StagingDir\*" -DestinationPath $ArchivePath -CompressionLevel Optimal

# Coleta estrita
$FilesToCompress = Get-ChildItem -Path $BaseDir -Include $IncludeList -Recurse -File | Where-Object {
    $path = $_.FullName
    -not ($ExcludePatterns | Where-Object { $path -like $_ })
}
# Limpeza atomica do staging
Remove-Item -Path $StagingDir -Recurse -Force

Compress-Archive -Path $FilesToCompress.FullName -DestinationPath $ArchivePath -CompressionLevel Optimal

Write-Host "[VITORIA] Snapshot estrutural fixado em: $ArchivePath" -ForegroundColor Green
Write-Host '[VITORIA] A homeostase esta preservada.' -ForegroundColor Green