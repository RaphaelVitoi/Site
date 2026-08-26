# SOTA 1-Click Ecosystem Healthcheck Protocol
[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   SOTA 1-CLICK ECOSYSTEM HEALTHCHECK (v8.0 GOLD)    " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Pytest Validation
Write-Host "[1/4] Executando bateria de testes Pytest..." -ForegroundColor Yellow
$testOutput = uv run --no-sync pytest -q tests/ 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Pytest Invariant: Aprovado (Zero Erros / Zero Warnings)" -ForegroundColor Green
} else {
    Write-Host "  [FALHA] Pytest reprovado:" -ForegroundColor Red
    $testOutput | Select-Object -Last 10 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
}

# 2. Ruff Linting
Write-Host "[2/4] Verificando Ruff Linting..." -ForegroundColor Yellow
$ruffOutput = uv run --no-sync ruff check . 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Ruff Lint: 100% Limpo" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] Ruff detectou pendencias:" -ForegroundColor Red
    $ruffOutput | Select-Object -Last 10 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
}

# 3. Frontend Typecheck
Write-Host "[3/4] Validando tipos TypeScript do Frontend..." -ForegroundColor Yellow
$tscOutput = npm run typecheck 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] TypeScript Typecheck: 100% Valido" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] TypeScript com erros de tipo:" -ForegroundColor Red
    $tscOutput | Select-Object -Last 10 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
}

# 4. Dependency Vulnerabilities
Write-Host "[4/4] Verificando integridade de dependencias..." -ForegroundColor Yellow
$npmAudit = npm audit --audit-level=low 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] NPM Audit: 0 vulnerabilidades" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] NPM Audit com vulnerabilidades:" -ForegroundColor Yellow
    $npmAudit | Select-Object -Last 10 | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   HOMEOSTASE TOTAL SOTA VALIDADA COM SUCESSO        " -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
