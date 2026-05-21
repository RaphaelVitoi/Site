<#
.SYNOPSIS
    Cria um backup ZIP completo do projeto, excluindo diretorios pesados.
.DESCRIPTION
    Protocolo de Salvaguarda Manual Redundante. Gera um arquivo .zip do
    diretorio raiz do projeto, ignorando inteligentemente pastas como .git,
    .venv, node_modules, e outros artefatos de build/cache para criar um
    backup leve e portatil.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$BackupBaseDir = Join-Path $ProjectRoot '_backups'
$BackupDir = Join-Path $BackupBaseDir 'full_manual'

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$ArchiveName = "NEXUS_SOTA_BACKUP_$Timestamp.zip"
$ArchivePath = Join-Path $BackupDir $ArchiveName

Write-Host '=== INICIANDO BACKUP MANUAL SOTA ===' -ForegroundColor Cyan
Write-Host "[ALVO] $ArchivePath" -ForegroundColor DarkCyan

$ExclusionPatterns = @(
    '*\.git\*',
    '*\.venv\*',
    '*\node_modules\*',
    '*\frontend\.next\*',
    '*\frontend\out\*',
    '*\__pycache__\*',
    '*\_backups\*',
    '*\.claude\logs\*',
    '*\.DS_Store'
)

$filesToArchive = Get-ChildItem -Path $ProjectRoot -Recurse | Where-Object {
    $isExcluded = $false
    foreach ($pattern in $ExclusionPatterns) { if ($_.FullName -like $pattern) { $isExcluded = $true; break } }
    -not $isExcluded
}

Compress-Archive -Path $filesToArchive.FullName -DestinationPath $ArchivePath -CompressionLevel Optimal

Write-Host "[SUCESSO] Backup completo criado com sucesso em: $ArchivePath" -ForegroundColor Green