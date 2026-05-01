<#
.SYNOPSIS
    Motor Autonomo de Backup e Expurgo SOTA.
    Custo: Zero Tokens. Tempo de execucao: Segundos.
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$BackupDir = Join-Path $ProjectRoot ".backups_sota"
if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null }

$DateStr = Get-Date -Format "yyyyMMdd_HHmmss"
$ZipFile = Join-Path $BackupDir "Nexus_Backup_$DateStr.zip"

# 1. Copia Blindada via Robocopy (Ignorando modulos pesados e temporarios)
$TempStaging = Join-Path $BackupDir "staging_$DateStr"
New-Item -ItemType Directory -Path $TempStaging -Force | Out-Null

$RobocopyArgs = @(
    $ProjectRoot, $TempStaging, "/E", 
    "/XD", "node_modules", ".next", ".git", ".venv", "__pycache__", ".backups_sota", ".backups",
    "/XF", "*.zip", "*.mp4",
    "/R:0", "/W:0"
)
# Robocopy tem exit codes complexos. Redirecionamos para o limbo.
& robocopy $RobocopyArgs | Out-Null

# 2. Compressao
Compress-Archive -Path "$TempStaging\*" -DestinationPath $ZipFile -Force
Remove-Item -Path $TempStaging -Recurse -Force

# 3. Poda de Entropia (> 14 dias)
$LimitDate = (Get-Date).AddDays(-14)
$OldBackups = Get-ChildItem -Path $BackupDir -Filter "*.zip" | Where-Object { $_.CreationTime -lt $LimitDate }

foreach ($OldFile in $OldBackups) {
    Remove-Item $OldFile.FullName -Force
}

exit 0