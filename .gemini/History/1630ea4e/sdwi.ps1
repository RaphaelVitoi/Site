<#
.SYNOPSIS
    Deletes backup directories older than 30 days.
.DESCRIPTION
    This script removes old backup directories to save disk space.
#>

$BackupRoot = Join-Path $PSScriptRoot ".bak"
$DaysToKeep = 30
$CutoffDate = (Get-Date).AddDays(-$DaysToKeep)

Write-Host "Procurando backups mais antigos que $($DaysToKeep) dias..." -ForegroundColor Yellow

try {
    Get-ChildItem -Path $BackupRoot -Directory | Where-Object { $_.CreationTime -lt $CutoffDate } | ForEach-Object {
        Write-Host "Deletando backup antigo: $($_.Name)" -ForegroundColor DarkGray
        Remove-Item -Path $_.FullName -Recurse -Force
    }

    Write-Host "Limpeza de backups concluída." -ForegroundColor Green
}
catch {
    Write-Host "Falha ao deletar backups antigos: $($_.Exception.Message)" -ForegroundColor Red
}


<#
EXEMPLO DE USO:

1. Salve este script como delete_old_backups.ps1
2. Rode: .\delete_old_backups.ps1
#>