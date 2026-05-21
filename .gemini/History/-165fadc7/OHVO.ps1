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

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$ZipStream = [System.IO.File]::Open($ArchivePath, [System.IO.FileMode]::Create)
$ZipArchive = [System.IO.Compression.ZipArchive]::new($ZipStream, [System.IO.Compression.ZipArchiveMode]::Create)

function Add-FilesToZip {
    param([string]$Path)
    try {
        $items = Get-ChildItem -Path $Path -ErrorAction Stop
        foreach ($item in $items) {
            $itemPathForMatch = if ($item.PSIsContainer) { "$($item.FullName)\" } else { $item.FullName }
            $isExcluded = $false
            foreach ($pattern in $ExclusionPatterns) {
                if ($itemPathForMatch -like $pattern) {
                    $isExcluded = $true
                    break
                }
            }

            if (-not $isExcluded) {
                if ($item.PSIsContainer) {
                    Add-FilesToZip -Path $item.FullName
                }
                else {
                    $relativePath = $item.FullName.Substring($ProjectRoot.Length).TrimStart('\')
                    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($ZipArchive, $item.FullName, $relativePath, [System.IO.Compression.CompressionLevel]::Optimal)
                }
            }
        }
    }
    catch {
        Write-Warning "  [AVISO] Ignorando pasta com lock ou corrompida pelo OneDrive: $Path"
    }
}

Add-FilesToZip -Path $ProjectRoot

$ZipArchive.Dispose()
$ZipStream.Dispose()

Write-Host "[SUCESSO] Backup completo criado com sucesso em: $ArchivePath" -ForegroundColor Green
