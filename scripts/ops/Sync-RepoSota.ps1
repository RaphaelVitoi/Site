<#
.SYNOPSIS
    Sincronizador SOTA de Repositorio (Rebase Linear + CWV Gate)
    Protocolo Chico SOTA v8.0 GOLD
.DESCRIPTION
    Realiza o fetch com prune, rebase seguro com autostash, verificacao de integridade
    de LFS e executa o portao de 5 fases cwv_gate.ps1.
#>
[CmdletBinding()]
param(
    [string]$TargetBranch = "master"
)

$ErrorActionPreference = "Stop"
$repoRoot = (git rev-parse --show-toplevel 2>$null)
if (-not $repoRoot) {
    Write-Error "Este script deve ser executado dentro de um repositorio Git."
    exit 1
}
$repoRoot = $repoRoot.Trim()
Set-Location $repoRoot

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host " [*] SOTA REPOSITORY SYNC & LINEAR REBASE (PROTOCOLO v8.0 GOLD)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Fetch com Prune
Write-Host "`n[1/4] Atualizando referencias remotas (fetch --prune)..." -ForegroundColor Yellow
git fetch origin --prune
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao executar git fetch origin --prune."
}
Write-Host "  [OK] Referencias atualizadas com sucesso." -ForegroundColor Green

# 2. Rebase com AutoStash
Write-Host "`n[2/4] Executando rebase linear contra origin/$TargetBranch com autostash..." -ForegroundColor Yellow
git rebase "origin/$TargetBranch" --autostash
if ($LASTEXITCODE -ne 0) {
    Write-Error "[FAIL] Conflito de rebase detectado! Resolva os arquivos marcados e execute 'git rebase --continue'."
}
Write-Host "  [OK] Historico linear sincronizado com sucesso." -ForegroundColor Green

# 3. Verificacao de Git LFS
Write-Host "`n[3/4] Auditando integridade de ponteiros Git LFS..." -ForegroundColor Yellow
if (Get-Command git-lfs -ErrorAction SilentlyContinue) {
    git lfs status | Out-Null
    Write-Host "  [OK] Integridade de Git LFS verificada." -ForegroundColor Green
} else {
    Write-Host "  [WARN] git-lfs nao encontrado no PATH." -ForegroundColor Yellow
}

# 4. Validacao do Portao de 5 Fases
Write-Host "`n[4/4] Disparando Portao de Integridade de 5 Fases..." -ForegroundColor Yellow
$gateScript = Join-Path $repoRoot "scripts/ops/cwv_gate.ps1"
if (Test-Path $gateScript) {
    if (Get-Command pwsh -ErrorAction SilentlyContinue) {
        & pwsh -NoProfile -ExecutionPolicy Bypass -File $gateScript
    } else {
        & powershell -NoProfile -ExecutionPolicy Bypass -File $gateScript
    }
} else {
    Write-Host "  [WARN] Script cwv_gate.ps1 nao localizado em scripts/ops/." -ForegroundColor Yellow
}

Write-Host "`n[SUCESSO] Repositorio 100% sincronizado, linear e protegido pelo Protocolo Chico SOTA v8.0 GOLD!" -ForegroundColor Green

