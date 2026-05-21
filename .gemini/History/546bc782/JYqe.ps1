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
    $VenvPy = Join-Path (Split-Path $PSScriptRoot -Parent) ".venv\Scripts\python.exe"
    if (Test-Path -LiteralPath $VenvPy) { return $VenvPy }
    return "python"
}

$pythonCmd = Get-PythonCmd
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$FrontendDir = Join-Path $ProjectRoot "frontend"

Invoke-Step -Name "Lint (frontend)" -Action { npm run lint }
Invoke-Step -Name "Typecheck (frontend + scripts)" -Action { npm run typecheck }
Invoke-Step -Name "Build (frontend)" -Action { npm run build }
Invoke-Step -Name "Tests (frontend)" -Action { npm run test }
Invoke-Step -Name "Python syntax check" -Action { & $pythonCmd -m py_compile web/middleware.py web/server.py }
Invoke-Step -Name "Python tests" -Action { & $pythonCmd -m pytest -q }
Invoke-Step -Name "Python SOTA Linting (Ruff)" -Action { Push-Location $ProjectRoot; try { & $pythonCmd -m ruff check . } finally { Pop-Location } }
Invoke-Step -Name "Python SOTA Formatting (Ruff)" -Action { Push-Location $ProjectRoot; try { & $pythonCmd -m ruff format --check . } finally { Pop-Location } }

Invoke-Step -Name "Lint (frontend)" -Action { Push-Location $FrontendDir; try { npm run lint } finally { Pop-Location } }
Invoke-Step -Name "Typecheck (frontend)" -Action { Push-Location $FrontendDir; try { npx tsc --noEmit } finally { Pop-Location } }
Invoke-Step -Name "Build (frontend)" -Action { Push-Location $FrontendDir; try { npm run build } finally { Pop-Location } }

Write-Host ""
Write-Host "QUALITY GATE: OK" -ForegroundColor Green
