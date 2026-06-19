<#
.SYNOPSIS
    Auditoria Adaptativa (Smart MDA) - Verificacao de Integridade SOTA
#>
param(
    [string]$Scenario = "Auditoria Global de Integridade SOTA"
)

$ErrorActionPreference = "Continue"
$ScriptDirectory = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

Write-Host "[SOTA AUDIT] Cenario: $Scenario" -ForegroundColor Cyan

Set-Location $ScriptDirectory

Write-Host "`n[1/3] Verificando Lints Python (Ruff SOTA)..." -ForegroundColor Yellow
$RuffPath = Join-Path $ScriptDirectory ".venv\Scripts\ruff.exe"
if (Test-Path -LiteralPath $RuffPath) {
    try {
        & $RuffPath check .
        if ($LASTEXITCODE -eq 0) { Write-Host "[OK] Simetria Python confirmada (Ruff local)." -ForegroundColor Green }
    }
    catch { Write-Host "[AVISO] Falha ao invocar Ruff local." -ForegroundColor Red }
} else {
    $UvCmd = if (Get-Command 'uv.exe' -ErrorAction SilentlyContinue) { 'uv.exe' } else { 'uv' }
    try {
        & $UvCmd run ruff check .
        if ($LASTEXITCODE -eq 0) { Write-Host "[OK] Simetria Python confirmada." -ForegroundColor Green }
    }
    catch { Write-Host "[AVISO] Falha ao invocar Ruff." -ForegroundColor Red }
}

Write-Host "`n[2/3] Verificando Tipagem Estrita Frontend (tsc)..." -ForegroundColor Yellow
$FrontendDir = Join-Path $ScriptDirectory "frontend"
if (Test-Path -LiteralPath $FrontendDir) {
    $PrevDir = $PWD
    Set-Location $FrontendDir
    if (Get-Command 'fnm' -ErrorAction SilentlyContinue) {
        fnm env --use-on-cd | Out-String | Invoke-Expression
    }
    $NpxCmd = if (Get-Command 'npx.cmd' -ErrorAction SilentlyContinue) { 'npx.cmd' } else { 'npx' }
    try {
        & $NpxCmd tsc --noEmit
        if ($LASTEXITCODE -eq 0) { Write-Host "[OK] Simetria TypeScript confirmada." -ForegroundColor Green }
    }
    catch { Write-Host "[AVISO] Falha ao invocar tsc." -ForegroundColor Red }
    Set-Location $PrevDir
}
else {
    Write-Host "[INFO] Diretorio frontend nao encontrado. Pulando tsc." -ForegroundColor DarkGray
}

Write-Host "`n[3/3] Inspecionando Chaves e Conectividade do Orquestrador..." -ForegroundColor Yellow
$PythonCmd = if (Test-Path "$ScriptDirectory\.venv\Scripts\python.exe") { "$ScriptDirectory\.venv\Scripts\python.exe" } else { "python" }
& $PythonCmd (Join-Path $ScriptDirectory "task_executor.py") check-keys

Write-Host "`n=== [SISTEMA] AUDITORIA CONCLUIDA ===" -ForegroundColor Magenta
