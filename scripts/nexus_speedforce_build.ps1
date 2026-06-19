# NEXUS SPEEDFORCE BUILD SOTA
# Alvos: Python (PyO3) e Frontend (WASM)

$ErrorActionPreference = "Stop"
$ProjectRoot = "C:/users/rapha/GeminiHub/Site/core/nexus-core-rust"

Write-Host "=== [SPEEDFORCE] Iniciando Build Hibrido SOTA ===" -ForegroundColor Cyan

# 1. Alvo: WASM (Frontend)
Write-Host "-> Compilando para WASM (Simulador)..." -ForegroundColor Yellow
cd $ProjectRoot
wasm-pack build --target web --out-dir ../../frontend/public/wasm --no-default-features --features wasm

# 2. Alvo: Python (Backend)
Write-Host "-> Tentando instalar Maturin..." -ForegroundColor Yellow
python -m pip install maturin --quiet

Write-Host "-> Compilando modulo Python..." -ForegroundColor Yellow
maturin develop --no-default-features --features python

Write-Host "=== [SPEEDFORCE] Build Concluido com Sucesso! ===" -ForegroundColor Green
