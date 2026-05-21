<#
.SYNOPSIS
    Realiza um backup completo do projeto (Friccao Zero), ignorando dependencias pesadas.
#>
Write-Host '=== INICIANDO BACKUP COMPLETO SOTA ===' -ForegroundColor Cyan
$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$BackupDir = Join-Path $ProjectRoot '.claude\backups'
if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null }

$Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$ArchiveName = "full_project_$Timestamp.zip"
$ArchivePath = Join-Path $BackupDir $ArchiveName

Write-Host "Compactando ecossistema para: $ArchiveName..." -ForegroundColor Yellow
Write-Host 'Ignorando: node_modules, .git, .venv, .next, .chroma_db, __pycache__...' -ForegroundColor DarkGray

Push-Location $ProjectRoot
try {
    tar.exe -a -c -f "$ArchivePath" --exclude="node_modules" --exclude=".git" --exclude=".venv" --exclude=".next" --exclude=".chroma_db" --exclude="__pycache__" *
    Write-Host '[OK] Backup absoluto finalizado com sucesso.' -ForegroundColor Green
    Write-Host "Destino: $ArchivePath" -ForegroundColor DarkGray
}
catch {
    Write-Error "Falha ao executar o backup: $_"
}
finally {
    Pop-Location
}
