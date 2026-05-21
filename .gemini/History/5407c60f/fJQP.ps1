<#
/**
 * IDENTITY: Orquestrador de Evolucao (SOTA Updater)
 * PATH: upgrade_ecosystem.ps1
 * ROLE: Inspecionar e atualizar todas as dependencias (Python e Node.js) para a versao mais recente.
 * BINDING: [Python (.venv), Node.js (frontend/package.json)]
 * TELEOLOGY: Garantir que o sistema opere perpetuamente em sua versao mais poderosa e estavel, mitigando entropia de obsolescencia.
 */
#>
Write-Host '=== [EVOLUCAO SOTA] ATUALIZANDO O ECOSSISTEMA ===' -ForegroundColor Cyan

# 1. Update Python Core
Write-Host '[1/2] Atualizando Malha Cognitiva (Python)...' -ForegroundColor Yellow
if (Test-Path '.\.venv\Scripts\python.exe') {
    $PythonExec = '.\.venv\Scripts\python.exe'
    & $PythonExec -m pip install --upgrade pip --quiet

    $Outdated = & $PythonExec -m pip list --outdated --format=json | ConvertFrom-Json
    if ($Outdated) {
        $Packages = $Outdated | ForEach-Object { $_.name }
        Write-Host "  > Atualizando $($Packages.Count) dependencias obsoletas: $($Packages -join ', ')..." -ForegroundColor DarkCyan
        & $PythonExec -m pip install --upgrade $Packages
    }
    Write-Host '  > Bibliotecas Python no Estado da Arte.' -ForegroundColor Green
}

# 2. Update Next.js Core
Write-Host "`n[2/2] Atualizando Malha Visual (Next.js/React)..." -ForegroundColor Yellow
if (Test-Path '.\frontend\package.json') {
    Set-Location .\frontend
    & npm install next@latest react@latest react-dom@latest
    & npm update --save
    Set-Location ..
    Write-Host '  > Framework Frontend forcado para a Vanguarda.' -ForegroundColor Green
}

Write-Host "`n[SUCESSO] O Ecossistema foi elevado. Simetria mantida." -ForegroundColor Magenta
