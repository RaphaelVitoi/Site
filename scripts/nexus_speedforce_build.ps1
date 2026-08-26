# NEXUS SPEEDFORCE BUILD SOTA
# Alvos: Python (PyO3) e Frontend (WASM)

$ErrorActionPreference = "Stop"
$RepositoryRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$NexusCoreRoot = Join-Path $RepositoryRoot 'core/nexus-core-rust'

Write-Host "=== [SPEEDFORCE] Iniciando Build Hibrido SOTA ===" -ForegroundColor Cyan

# 1. Alvo: WASM (Frontend)
Write-Host "-> Compilando para WASM (Simulador)..." -ForegroundColor Yellow
Push-Location $RepositoryRoot
try {
    npm run wasm:build
} finally {
    Pop-Location
}

# 2. Alvo: Python (Backend)
Write-Host "-> Tentando instalar Maturin..." -ForegroundColor Yellow
Push-Location $NexusCoreRoot
try {
    python -m pip install maturin --quiet

    Write-Host "-> Compilando modulo Python..." -ForegroundColor Yellow
    maturin develop --no-default-features --features python
} finally {
    Pop-Location
}

Write-Host "=== [SPEEDFORCE] Build Concluido com Sucesso! ===" -ForegroundColor Green
