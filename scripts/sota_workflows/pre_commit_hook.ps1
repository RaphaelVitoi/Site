#!/usr/bin/env pwsh
# Hook de Pre-Commit SOTA
# Este hook engatilha a integridade e forca a validacao da malha termodinamica
# antes de qualquer modificacao ser salva no Indice.

Write-Host "[SOTA HOOK] Iniciando Validacao Pre-Commit..." -ForegroundColor Cyan

# 1. Auditoria de Entropia (Linting)
Write-Host "[SOTA HOOK] Executando Pipeline de Integridade (Nexus Ops Lint)..." -ForegroundColor Yellow
$pythonExe = if (Test-Path "$PSScriptRoot\..\..\.venv\Scripts\python.exe") { "$PSScriptRoot\..\..\.venv\Scripts\python.exe" } else { "python.exe" }
$lintOutput = & $pythonExe "$PSScriptRoot\..\cli\nexus.py" ops lint 2>&1
$lintExitCode = $LASTEXITCODE

if ($lintExitCode -ne 0) {
    Write-Host "[ERRO SOTA] A auditoria falhou. Corrija a entropia antes de submeter." -ForegroundColor Red
    Write-Host $lintOutput
    exit 1
}

Write-Host "[OK] Simetria alcancada. O commit pode prosseguir." -ForegroundColor Green
exit 0
