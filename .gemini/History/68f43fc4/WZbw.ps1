<#
.SYNOPSIS
    Inicia o Motor de Fila Pydantic (Python) silenciosamente em background.
#>

$WorkerScript = Join-Path $PSScriptRoot "task_executor.py"

Write-Host "=== IGNIFICANDO WORKER PYDANTIC ===" -ForegroundColor Cyan

try {
    # Envolvemos a chamada no próprio PowerShell para garantir que a resolução do PATH funcione
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-WindowStyle", "Hidden", "-Command", "python `"$WorkerScript`" worker" -WindowStyle Hidden
    Write-Host "[PULSO] Orquestrador Python iniciado nas sombras. 🐍" -ForegroundColor Green
}
catch {
    Write-Host "[CRÍTICO] Falha ao iniciar Worker: $_" -ForegroundColor Red
}