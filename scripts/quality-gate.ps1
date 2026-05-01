[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Action
    )
    Write-Host ""
    Write-Host "==> $Name" -ForegroundColor Cyan
    & $Action
}

function Get-PythonCmd {
    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) { return "py" }
    $python = Get-Command python -ErrorAction SilentlyContinue
    if ($python) { return "python" }
    throw "Python não encontrado no PATH."
}

$pythonCmd = Get-PythonCmd

Invoke-Step -Name "Lint (frontend)" -Action { npm run lint }
Invoke-Step -Name "Typecheck (frontend + scripts)" -Action { npm run typecheck }
Invoke-Step -Name "Build (frontend)" -Action { npm run build }
Invoke-Step -Name "Tests (frontend)" -Action { npm run test }
Invoke-Step -Name "Python syntax check" -Action { & $pythonCmd -m py_compile web/middleware.py web/server.py }
Invoke-Step -Name "Python tests" -Action { & $pythonCmd -m pytest -q }

Write-Host ""
Write-Host "QUALITY GATE: OK" -ForegroundColor Green
