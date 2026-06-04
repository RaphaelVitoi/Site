<#
.SYNOPSIS
    Inicia o NEXUS Worker (task_executor + API + Watchdog).
.DESCRIPTION
    Verifica se o worker ja esta rodando via PID file, carrega variaveis de
    ambiente, ativa o venv e inicia o worker em modo interativo.
.PARAMETER Force
    Mata processo existente (se houver) antes de iniciar um novo.
.PARAMETER Background
    Inicia o worker em background (nohup). Util para sessoes longas.
#>
param(
    [switch]$Force,
    [switch]$Background
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PidFile     = Join-Path $ProjectRoot ".nexus_worker.pid"
$VenvPython  = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
$EnvScript   = Join-Path $ProjectRoot "_env.ps1"
$LogDir      = Join-Path $ProjectRoot ".cerebro\logs"

# ─── Banner ──────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=== NEXUS WORKER ===" -ForegroundColor Cyan
Write-Host "Projeto : $ProjectRoot" -ForegroundColor DarkCyan
Write-Host ""

# ─── Verifica processo existente ─────────────────────────────────────────────
if (Test-Path $PidFile) {
    $existingPid = Get-Content $PidFile -Raw | ForEach-Object { $_.Trim() }
    $proc = Get-Process -Id $existingPid -ErrorAction SilentlyContinue

    if ($proc) {
        if ($Force) {
            Write-Host "[AVISO] Worker ja rodando (PID $existingPid). Encerrando..." -ForegroundColor Yellow
            Stop-Process -Id $existingPid -Force
            Start-Sleep -Seconds 2
            Write-Host "[OK] Processo encerrado." -ForegroundColor Green
        } else {
            Write-Host "[BLOQUEIO] Worker ja esta rodando (PID $existingPid)." -ForegroundColor Red
            Write-Host "           Use -Force para matar e reiniciar." -ForegroundColor DarkRed
            exit 1
        }
    } else {
        Write-Host "[INFO] PID file encontrado mas processo morto. Limpando..." -ForegroundColor DarkYellow
        Remove-Item $PidFile -Force
    }
}

# ─── Verifica dependencias ────────────────────────────────────────────────────
if (-not (Test-Path $VenvPython)) {
    Write-Host "[ERRO] Venv nao encontrado em: $VenvPython" -ForegroundColor Red
    Write-Host "       Execute: python -m venv .venv && .venv\Scripts\pip install -r requirements.txt" -ForegroundColor DarkRed
    exit 1
}

# ─── Carrega variaveis de ambiente ────────────────────────────────────────────
if (Test-Path $EnvScript) {
    Write-Host "[ENV] Carregando variaveis de $EnvScript..." -ForegroundColor DarkCyan
    . $EnvScript
} else {
    Write-Host "[AVISO] $EnvScript nao encontrado. Usando variaveis do sistema." -ForegroundColor Yellow
}

# ─── Garante que o diretorio de logs existe ───────────────────────────────────
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

# ─── Inicia o worker ─────────────────────────────────────────────────────────
Set-Location $ProjectRoot

if ($Background) {
    $ts      = Get-Date -Format 'yyyyMMdd_HHmmss'
    $logOut  = Join-Path $LogDir "worker_${ts}_out.log"
    $logErr  = Join-Path $LogDir "worker_${ts}_err.log"
    Write-Host "[BACKGROUND] Iniciando worker em background..." -ForegroundColor Magenta
    Write-Host "             Stdout: $logOut" -ForegroundColor DarkMagenta
    Write-Host "             Stderr: $logErr" -ForegroundColor DarkMagenta

    $proc = Start-Process `
        -FilePath $VenvPython `
        -ArgumentList "task_executor.py", "worker" `
        -WorkingDirectory $ProjectRoot `
        -RedirectStandardOutput $logOut `
        -RedirectStandardError  $logErr `
        -NoNewWindow `
        -PassThru

    Write-Host "[OK] Worker iniciado em background (PID $($proc.Id))." -ForegroundColor Green
    Write-Host "     Para acompanhar: Get-Content -Wait '$logOut'" -ForegroundColor DarkGreen
} else {
    Write-Host "[START] Iniciando NEXUS Worker (Ctrl+C para parar)..." -ForegroundColor Green
    Write-Host ""
    & $VenvPython task_executor.py worker
}
