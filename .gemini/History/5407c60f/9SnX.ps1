<#
/**
 * IDENTITY: Orquestrador de Evolucao (SOTA Updater)
 * PATH: upgrade_ecosystem.ps1
 * ROLE: Inspecionar e atualizar todas as dependencias (Python e Node.js) para a versao mais recente.
 * BINDING: [Python (.venv), Node.js (frontend/package.json)]
 * TELEOLOGY: Garantir que o sistema opere perpetuamente em sua versao mais poderosa e estavel, mitigando entropia de obsolescencia.
 */
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

Write-Host "=== [EVOLUCAO SOTA] ATUALIZANDO O ECOSSISTEMA ===" -ForegroundColor Cyan

# 1. Update Python Core
Write-Host "[1/2] Atualizando Malha Cognitiva (Python)..." -ForegroundColor Yellow
$PythonExe = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
if (Test-Path $PythonExe) {
    & $PythonExe -m pip install --upgrade pip pydantic requests aiohttp aiosqlite
    Write-Host "  > Bibliotecas Python no Estado da Arte." -ForegroundColor Green
}

# 2. Update Next.js Core
Write-Host "`n[2/2] Atualizando Malha Visual (Next.js/React)..." -ForegroundColor Yellow
$FrontendDir = Join-Path $ProjectRoot "frontend"
if (Test-Path (Join-Path $FrontendDir "package.json")) {
    Push-Location $FrontendDir
    & npm install next@latest react@latest react-dom@latest @prisma/client@latest
    & npm update --save
    Pop-Location
    Write-Host "  > Framework Frontend forcado para a Vanguarda." -ForegroundColor Green
}

Write-Host "`n[SUCESSO] O Ecossistema foi elevado. Simetria mantida." -ForegroundColor Magenta