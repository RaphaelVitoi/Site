# Limpeza de Backups Legados (Pos-Migracao Kernel v3.0)
# Remove arquivos *.backup gerados pelos scripts antigos (do.ps1 v1, validate-queue.ps1)

$QueueDir = Join-Path $PSScriptRoot "queue"

if (Test-Path $QueueDir) {
    $files = Get-ChildItem -Path $QueueDir -Filter "*.backup"
    if ($files.Count -gt 0) {
        $files | Remove-Item -Force -Verbose
        Write-Host "[CLEANUP] Removidos $($files.Count) arquivos de backup obsoletos." -ForegroundColor Green
    }
    else {
        Write-Host "[INFO] Nenhum arquivo .backup encontrado." -ForegroundColor Gray
    }
}
