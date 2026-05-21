<#
.SYNOPSIS
    Realiza um backup completo do projeto (Friccao Zero), ignorando dependencias pesadas.
    Cria um backup ZIP completo do projeto, excluindo diretorios pesados.
.DESCRIPTION
    Protocolo de Salvaguarda Manual Redundante. Gera um arquivo .zip do
    diretorio raiz do projeto, ignorando inteligentemente pastas como .git,
    .venv, node_modules, e outros artefatos de build/cache para criar um
    backup leve e portatil.
#>
Write-Host '=== INICIANDO BACKUP COMPLETO SOTA ===' -ForegroundColor Cyan

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$BackupDir = Join-Path $ProjectRoot '.claude\backups'
if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null }
$BackupBaseDir = Join-Path $ProjectRoot '_backups'
$BackupDir = Join-Path $BackupBaseDir 'full_manual'

$Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$ArchiveName = "full_project_$Timestamp.zip"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$ArchiveName = "NEXUS_SOTA_BACKUP_$Timestamp.zip"
$ArchivePath = Join-Path $BackupDir $ArchiveName

Write-Host "Compactando ecossistema para: $ArchiveName..." -ForegroundColor Yellow
Write-Host 'Ignorando: node_modules, .git, .venv, .next, .chroma_db, __pycache__...' -ForegroundColor DarkGray
Write-Host '=== INICIANDO BACKUP MANUAL SOTA ===' -ForegroundColor Cyan
Write-Host "[ALVO] $ArchivePath" -ForegroundColor DarkCyan

Push-Location $ProjectRoot
try {
    tar.exe -a -c -f "$ArchivePath" --exclude="node_modules" --exclude=".git" --exclude=".venv" --exclude=".next" --exclude=".chroma_db" --exclude="__pycache__" *
    Write-Host '[OK] Backup absoluto finalizado com sucesso.' -ForegroundColor Green
    Write-Host "Destino: $ArchivePath" -ForegroundColor DarkGray
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
    catch {
        Write-Error "Falha ao executar o backup: $_"
    }
    finally {
        Pop-Location
    }

    Compress-Archive -Path $filesToArchive.FullName -DestinationPath $ArchivePath -CompressionLevel Optimal

    Write-Host "[SUCESSO] Backup completo criado com sucesso em: $ArchivePath" -ForegroundColor Green
