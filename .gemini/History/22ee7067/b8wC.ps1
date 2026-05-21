<#
.SYNOPSIS
    Acorda o Orquestrador Python (task_executor.py) em background.
#>
$ProjectRoot = (Get-Item $PSScriptRoot).parent.parent.FullName
$PythonExe = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python.exe" }
$WorkerScript = Join-Path $ProjectRoot "task_executor.py"

# Checa se o worker ja esta rodando para evitar duplicatas
$existingWorker = Get-Process -Name "python", "pythonw" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "task_executor.py" }
if ($existingWorker) {
    Write-Host "[SISTEMA] O Orquestrador ja esta ativo (PID: $($existingWorker.Id)). Nenhuma acao necessaria." -ForegroundColor Green
    exit 0
}

Write-Host "[SISTEMA] Acordando o Orquestrador Python (SOTA)..." -ForegroundColor Cyan
# Inicia o processo em uma nova janela minimizada para nao travar o terminal atual
# e permitir que o usuario veja os logs se necessario.
$arguments = @("-NoProfile", "-WindowStyle", "Minimized", "-Command", "Start-Sleep -Seconds 1; & '$PythonExe' '$WorkerScript' worker-api")
Start-Process powershell -ArgumentList $arguments

Write-Host "[SISTEMA] Orquestrador ativado em background. O sistema esta vivo." -ForegroundColor Green