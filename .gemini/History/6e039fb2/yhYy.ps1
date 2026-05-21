<#
.SYNOPSIS
    Encerra o Motor de Fila Pydantic (Python) que roda em background.
#>

Write-Host "=== ENCERRANDO WORKER PYDANTIC ===" -ForegroundColor Cyan

# Busca processos do Python cuja linha de comando contenha "task_executor.py worker"
$Workers = Get-CimInstance Win32_Process -Filter "Name = 'python.exe' OR Name = 'pythonw.exe'" | Where-Object CommandLine -match "task_executor\.py.*worker"

if ($Workers) {
    foreach ($Worker in $Workers) {
        Stop-Process -Id $Worker.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Host "[PULSO] Processo Orquestrador (PID: $($Worker.ProcessId)) hibernado com sucesso." -ForegroundColor Green
    }
}
else {
    Write-Host "[INFO] Nenhum orquestrador encontrado em execução." -ForegroundColor DarkGray
}