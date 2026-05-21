<#
.SYNOPSIS
    Hiberna o Orquestrador Python com seguranca.
#>
Write-Host "[SISTEMA] Tentando hibernar o Orquestrador Python..." -ForegroundColor Cyan
$existingWorker = Get-Process -Name "python", "pythonw" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "task_executor.py" }

if ($existingWorker) {
    Stop-Process -Id $existingWorker.Id -Force
    Write-Host "[SISTEMA] Orquestrador (PID: $($existingWorker.Id)) hibernado com sucesso." -ForegroundColor Green
} else {
    Write-Host "[SISTEMA] O Orquestrador ja estava em hibernacao. Nenhuma acao necessaria." -ForegroundColor DarkGray
}