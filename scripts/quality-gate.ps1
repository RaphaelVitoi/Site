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
    if ($LASTEXITCODE -ne 0) {
        throw "Erro: O passo '$Name' falhou com codigo de saida $LASTEXITCODE."
    }
}

function Get-PythonCmd {
    # SOTA: Prefere o Python do ambiente virtual (.venv) se disponível localmente
    $venvPython = Join-Path $PSScriptRoot "..\.venv\Scripts\python.exe"
    if (Test-Path $venvPython) {
        return (Resolve-Path $venvPython).Path
    }
    $py = Get-Command py -ErrorAction SilentlyContinue
    if ($py) { return "py" }
    $python = Get-Command python -ErrorAction SilentlyContinue
    if ($python) { return "python" }
    throw "Python nao encontrado no PATH."
}

$pythonCmd = Get-PythonCmd

Invoke-Step -Name "Lint (frontend)" -Action { npm run lint }
Invoke-Step -Name "Typecheck (frontend + scripts)" -Action { npm --workspace frontend run typecheck:audit }
Invoke-Step -Name "Build (frontend)" -Action { npm run build }
Invoke-Step -Name "Tests (frontend)" -Action { npm run test }
Invoke-Step -Name "Python syntax check" -Action { & $pythonCmd -m py_compile web/middleware.py web/server.py }
Invoke-Step -Name "Python tests" -Action { & $pythonCmd -m pytest -q }

Write-Host ""
Write-Host "QUALITY GATE: OK" -ForegroundColor Green
