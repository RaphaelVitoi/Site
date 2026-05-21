<#
.SYNOPSIS
    Compila o motor WebAssembly SOTA e materializa a Fricção Zero no frontend.
#>

$ScriptDirectory = $PSScriptRoot
$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $ScriptDirectory '..\..'))
$WasmSourceDir = Join-Path $ProjectRoot "frontend\wasm-equity"
$WasmPublicDir = Join-Path $ProjectRoot "frontend\public\wasm"

Write-Host "=== [SOTA] FORJANDO MOTOR QUÂNTICO (WASM) ===" -ForegroundColor Magenta

# Navega e compila
Set-Location $WasmSourceDir
Write-Host "Executando wasm-pack build..." -ForegroundColor Cyan
wasm-pack build --target web --out-dir pkg
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha catastrófica na forja do Rust."
    exit 1
}

# Materializa no Public
if (-not (Test-Path $WasmPublicDir)) {
    New-Item -ItemType Directory -Path $WasmPublicDir -Force | Out-Null
}

$WasmBinary = Join-Path $WasmSourceDir "pkg\vitoi_equity_engine_bg.wasm"
$WasmDest = Join-Path $WasmPublicDir "vitoi_equity_engine_bg.wasm"

Copy-Item -Path $WasmBinary -Destination $WasmDest -Force
Write-Host "[OK] Binário WASM ancorado com sucesso em: $WasmDest" -ForegroundColor Green
Write-Host "[INFO] A Fricção Zero exige um Hard Refresh (Ctrl + F5) no navegador." -ForegroundColor Yellow
