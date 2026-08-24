# Rotina Mensal Automatizada de Auditoria SOTA v8.0 GOLD: Modus Operandi & Roteamento.
param()

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SiteRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " SOTA v8.0 GOLD - AUDITORIA MENSAL DE MODUS OPERANDI E ROUTING   " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan

$PythonExe = Join-Path $SiteRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    $PythonExe = "python"
}

$AuditScript = Join-Path $ScriptDir "audit_monthly_modus_operandi_and_routing.py"

Write-Host "[*] Executando auditoria analitica em Python..." -ForegroundColor Gray
& $PythonExe $AuditScript

if ($LASTEXITCODE -eq 0) {
    Write-Host "[+] Auditoria Mensal concluida com SUCESSO (Status: APROVADO)." -ForegroundColor Green
} else {
    Write-Host "[!] Auditoria Mensal concluida com ALERTAS/ATENCAO." -ForegroundColor Yellow
}
