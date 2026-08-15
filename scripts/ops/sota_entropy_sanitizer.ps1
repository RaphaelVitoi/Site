<#
.SYNOPSIS
    SOTA Entropy Sanitizer & Multi-Tier Garbage Collector
    Protocol Chico SOTA v7.0 GOLD
#>

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "=== [SOTA ENTROPY & SYSTEM HYGIENE SANITIZER] ===" -ForegroundColor Cyan

$pyExe = "C:\Users\rapha\.gemini\Site\.venv\Scripts\python.exe"
if (Test-Path $pyExe) {
    & $pyExe "C:\Users\rapha\.gemini\Site\scripts\ops\sota_entropy_sanitizer.py"
} else {
    Write-Warning "Python venv não encontrado."
}

Write-Host "=================================================" -ForegroundColor Cyan
