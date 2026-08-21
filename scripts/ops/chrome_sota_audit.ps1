<#
.SYNOPSIS
    SOTA Chrome Dev Dual-Instance & Core Web Vitals Audit Suite
    Chico Protocol v7.0 GOLD
#>

param(
    [string]$Url = "https://web.dev",
    [switch]$HeapSnapshot,
    [switch]$FullTrace,
    [string]$OutputDir = "$env:TEMP\chrome_sota_audits"
)

$ErrorActionPreference = 'SilentlyContinue'

if (-not (Test-Path $OutputDir)) {
    New-Item -Path $OutputDir -ItemType Directory -Force | Out-Null
}

Write-Host "`n=== [SOTA AUDITOR] AUDITORIA DE PERFORMANCE GOOGLE CHROME DEV ===" -ForegroundColor Cyan
Write-Host "Alvo: $Url" -ForegroundColor Yellow

# 1. Auditoria CDP Standard (Porta 9222)
Write-Host "`n--- [1] INSTÂNCIA STANDARD (Porta 9222) ---" -ForegroundColor Green
try {
    $stdVersion = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json/version" -TimeoutSec 3
    Write-Host "[ONLINE] Engine: $($stdVersion.Browser)" -ForegroundColor Green
    Write-Host "         V8 Engine: $($stdVersion.'V8-Version')" -ForegroundColor Gray
    Write-Host "         Protocol:  $($stdVersion.'Protocol-Version')" -ForegroundColor Gray
    Write-Host "         WebSocket: $($stdVersion.webSocketDebuggerUrl)" -ForegroundColor Gray
    
    $pages = Invoke-RestMethod -Uri "http://127.0.0.1:9222/json/list" -TimeoutSec 3
    Write-Host "         Páginas/Alvos Ativos: $($pages.Count)" -ForegroundColor Green
    $pages | Select-Object -First 3 | ForEach-Object {
        Write-Host "         - Target: $($_.title) [$($_.url)]" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "[OFFLINE] Porta 9222 inativa no momento." -ForegroundColor Yellow
}

# 2. Auditoria CDP Admin (Porta 9223)
Write-Host "`n--- [2] INSTÂNCIA ADMINISTRATOR (Porta 9223) ---" -ForegroundColor Magenta
try {
    $adminVersion = Invoke-RestMethod -Uri "http://127.0.0.1:9223/json/version" -TimeoutSec 3
    Write-Host "[ONLINE] Engine: $($adminVersion.Browser)" -ForegroundColor Green
    Write-Host "         V8 Engine: $($adminVersion.'V8-Version')" -ForegroundColor Gray
    Write-Host "         Protocol:  $($adminVersion.'Protocol-Version')" -ForegroundColor Gray
    Write-Host "         WebSocket: $($adminVersion.webSocketDebuggerUrl)" -ForegroundColor Gray
    
    $adminPages = Invoke-RestMethod -Uri "http://127.0.0.1:9223/json/list" -TimeoutSec 3
    Write-Host "         Páginas/Alvos Ativos: $($adminPages.Count)" -ForegroundColor Green
    $adminPages | Select-Object -First 3 | ForEach-Object {
        Write-Host "         - Target: $($_.title) [$($_.url)]" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "[STANDBY] Porta 9223 aguardando execução sob demanda do modo Administrador." -ForegroundColor DarkYellow
}

Write-Host "`n[ PROFILING & DEVTOOLS MCP ]" -ForegroundColor Cyan
Write-Host "Comandos de Auditoria Ativos via Antigravity MCP:"
Write-Host "  1. performance_start_trace    -> Traço completo de CPU, INP, LCP e CLS"
Write-Host "  2. performance_analyze_insight -> Diagnóstico profundo de Core Web Vitals"
Write-Host "  3. take_heapsnapshot          -> Snapshot do Heap Graph V8"
Write-Host "  4. lighthouse_audit           -> Score SOTA de Performance, PWA e A11y"
Write-Host "========================================================`n"
