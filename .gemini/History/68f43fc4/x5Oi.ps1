<#
.SYNOPSIS
    Inicia o Motor de Fila Pydantic (Python) silenciosamente em background.
#>

$WorkerScript = Join-Path $PSScriptRoot "task_executor.py"

Write-Host "=== IGNIFICANDO WORKER PYDANTIC ===" -ForegroundColor Cyan

try {
    # Resolve o caminho absoluto do executável (Start-Process exige precisão)
    $PythonCmd = (Get-Command python.exe -ErrorAction SilentlyContinue).Definition
    if ([string]::IsNullOrWhiteSpace($PythonCmd)) {
        $PythonCmd = "python.exe" # Fallback
    }

    Start-Process -FilePath $PythonCmd -ArgumentList "`"$WorkerScript`" worker" -WindowStyle Hidden
    Write-Host "[PULSO] Orquestrador Python iniciado nas sombras. 🐍" -ForegroundColor Green
}
catch {
    Write-Host "[CRÍTICO] Falha ao iniciar Worker: $_" -ForegroundColor Red
    Write-Host "[DICA] Verifique se o Python está devidamente instalado e adicionado ao PATH do Windows." -ForegroundColor Yellow
}