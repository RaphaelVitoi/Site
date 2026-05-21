<#
.SYNOPSIS
    Inicia o Motor de Fila Pydantic (Python) silenciosamente em background.
#>

$WorkerScript = Join-Path $PSScriptRoot "task_executor.py"

Write-Host "=== IGNIFICANDO WORKER PYDANTIC ===" -ForegroundColor Cyan

try {
    $PythonCmd = "python"
    $VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
    if (Test-Path $VenvPython) { $PythonCmd = $VenvPython }

    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-WindowStyle", "Hidden", "-Command", "& `"$PythonCmd`" `"$WorkerScript`" worker" -WindowStyle Hidden
    Write-Host "[PULSO] Orquestrador Python iniciado nas sombras. 🐍" -ForegroundColor Green
}
catch {
    Write-Host "[CRÍTICO] Falha ao iniciar Worker: $_" -ForegroundColor Red
}