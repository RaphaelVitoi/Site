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

    # Injeta a memória do ambiente (_env.ps1) no processo oculto para garantir o acesso às chaves de API
    $EnvScript = Join-Path $PSScriptRoot "_env.ps1"
    $RunCommand = "if (Test-Path '$EnvScript') { . '$EnvScript' }; & `"$PythonCmd`" `"$WorkerScript`" worker"
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile", "-WindowStyle", "Hidden", "-Command", $RunCommand -WindowStyle Hidden
    Write-Host "[PULSO] Orquestrador Python iniciado nas sombras. [CORE]" -ForegroundColor Green
}
catch {
    Write-Host "[CRÍTICO] Falha ao iniciar Worker: $_" -ForegroundColor Red
}