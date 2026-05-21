[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][scriptblock]$Action
    )
    Write-Host ''
    Write-Host "==> $Name" -ForegroundColor Cyan
    & $Action
}

function Get-PythonCmd {
    $VenvPy = Join-Path (Split-Path $PSScriptRoot -Parent) '.venv\Scripts\python.exe'
    if (Test-Path -LiteralPath $VenvPy) { return $VenvPy }
    return 'python'
}

$pythonCmd = Get-PythonCmd
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$FrontendDir = Join-Path $ProjectRoot 'frontend'

Invoke-Step -Name 'Python SOTA Linting (Ruff)' -Action { Push-Location $ProjectRoot; try { & $pythonCmd -m ruff check . } finally { Pop-Location } }
Invoke-Step -Name 'Python SOTA Formatting (Ruff)' -Action { Push-Location $ProjectRoot; try { & $pythonCmd -m ruff format --check . } finally { Pop-Location } }

Invoke-Step -Name 'Lint (frontend)' -Action { Push-Location $FrontendDir; try { npm run lint } finally { Pop-Location } }
Invoke-Step -Name 'Typecheck (frontend)' -Action { Push-Location $FrontendDir; try { npx tsc --noEmit } finally { Pop-Location } }
Invoke-Step -Name 'Build (frontend)' -Action { Push-Location $FrontendDir; try { npm run build } finally { Pop-Location } }

Write-Host ''
Write-Host 'QUALITY GATE: OK' -ForegroundColor Green
