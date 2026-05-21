<#
.SYNOPSIS
    NEXUS BACKUP: Cria um backup instantâneo do projeto ignorando pastas pesadas.
#>

$Source = $PSScriptRoot
$Dest = Join-Path $PSScriptRoot ".backups\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$ExcludeDirs = @(".git", "node_modules", ".venv", ".backups", "__pycache__")

Write-Host "=== [BACKUP] NEXUS BACKUP ===" -ForegroundColor Cyan
Write-Host "Iniciando varredura e cópia para $Dest..." -ForegroundColor DarkGray

robocopy $Source $Dest /MIR /XD $ExcludeDirs /XF "*.log" "*.tmp" /NFL /NDL /NJH /NJS /nc /ns /np
Write-Host "[OK] Backup concluído e isolado com sucesso!" -ForegroundColor Green