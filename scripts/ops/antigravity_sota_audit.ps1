<#
.SYNOPSIS
    SOTA Antigravity Ecosystem Auditor & Orchestrator Telemetry
    Protocol Chico SOTA v7.0 GOLD
#>

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "`n=== [SOTA ANTIGRAVITY ECOSYSTEM RUNTIME AUDIT] ===" -ForegroundColor Cyan

# 1. Run Python Antigravity SOTA Guard
$pyExe = "C:\Users\rapha\.gemini\Site\.venv\Scripts\python.exe"
if (Test-Path $pyExe) {
    & $pyExe "C:\Users\rapha\.gemini\antigravity_sota_guard.py"
} else {
    Write-Warning "Python venv não encontrado."
}

# 2. Nexus Orchestrator Health
$nexusExe = "C:\Users\rapha\.gemini\Site\.venv\Scripts\nexus.exe"
if (Test-Path $nexusExe) {
    Write-Host "`n[NEXUS ORCHESTRATOR TELEMETRIA]:" -ForegroundColor Yellow
    & $nexusExe health
}

Write-Host "`n========================================================" -ForegroundColor Cyan
