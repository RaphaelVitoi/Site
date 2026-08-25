# ==============================================================================
# NEXUS CORE - DAEMON WATCHDOG & HEALTH GATE AUTO-RESTART WRAPPER
# Arquivo: engine/llama_cpp/daemon_watchdog.ps1
# Pipeline: Nexus Core / Chico SOTA v8.0 GOLD
# ==============================================================================

param (
    [string]$ModelPath = "models/qwen2.5-coder-7b-instruct-q5_k_m.gguf",
    [string]$HostAddress = "127.0.0.1",
    [int]$Port = 8080,
    [int]$HealthIntervalSec = 2,
    [int]$MaxConsecutiveFailures = 3,
    [int]$ProbeTimeoutMs = 1500,
    [int]$MaxRestartCount = 10,
    [int]$CoolDownAfterCrashSec = 3
)

$ErrorActionPreference = "Continue"

# 1. Configuração de Caminhos e Parâmetros Base
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DaemonScript = Join-Path $ScriptDir "start_vulkan_daemon.ps1"
$HealthUrl = "http://${HostAddress}:${Port}/health"
$Global:DaemonProcess = $null
$Global:Running = $true

if (-not (Test-Path $DaemonScript)) {
    Write-Host "[FATAL] Script do daemon não localizado: $DaemonScript" -ForegroundColor Red
    exit 1
}

# 2. Rotinas de Gerenciamento de Processo
function Start-LlamaDaemon {
    param ([string]$Path, [string]$Model, [int]$TargetPort)

    Write-Host "[WATCHDOG] Inicializando processo daemon ($Model na porta $TargetPort)..." -ForegroundColor Cyan
    
    # Executa o daemon em job assíncrono mantendo canal de processo
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = "powershell.exe"
    $pinfo.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$Path`" -ModelPath `"$Model`" -Port $TargetPort -Host $HostAddress"
    $pinfo.UseShellExecute = $false
    $pinfo.CreateNoWindow = $false

    $proc = [System.Diagnostics.Process]::Start($pinfo)
    if ($proc) {
        $proc.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High
        Write-Host "[WATCHDOG] Daemon ativo sob PID: $($proc.Id)" -ForegroundColor Green
    }
    return $proc
}

function Stop-LlamaDaemon {
    param ($Process)
    if ($Process -and -not $Process.HasExited) {
        Write-Host "[WATCHDOG] Finalizando processo PID: $($Process.Id)..." -ForegroundColor Yellow
        try {
            $Process.Kill($true) # Mata árvore de processos
            $Process.WaitForExit(3000)
        } catch {
            Write-Host "[WARN] Falha ao encerrar PID: $_" -ForegroundColor DarkYellow
        }
    }
}

function Test-HttpHealthGate {
    param ([string]$Url, [int]$TimeoutMs)
    
    $request = [System.Net.HttpWebRequest]::Create($Url)
    $request.Timeout = $TimeoutMs
    $request.Method = "GET"
    
    try {
        $response = [System.Net.HttpWebResponse]$request.GetResponse()
        $statusCode = [int]$response.StatusCode
        $response.Close()
        return ($statusCode -eq 200)
    } catch {
        return $false
    }
}

# 3. Interceptação de Encerramento Gracioso (Ctrl+C / SIGINT)
[Console]::TreatControlCAsInput = $false
Register-EngineEvent -SourceIdentifier ([System.Management.Automation.PsEngineEvent]::Exiting) -Action {
    $Global:Running = $false
    Stop-LlamaDaemon -Process $Global:DaemonProcess
} | Out-Null

# 4. Loop de Supervisão Contínua (Health Gate Engine)
$RestartCounter = 0
$ConsecutiveFailures = 0

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  NEXUS CORE: DAEMON HEALTH SUPERVISOR (HIGH AVAILABILITY)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Target Endpoint: $HealthUrl"
Write-Host "Intervalo Probe: ${HealthIntervalSec}s (Timeout: ${ProbeTimeoutMs}ms)"
Write-Host "Tolerância:      $MaxConsecutiveFailures falhas consecutivas"
Write-Host "============================================================" -ForegroundColor Cyan

$Global:DaemonProcess = Start-LlamaDaemon -Path $DaemonScript -Model $ModelPath -TargetPort $Port

# Aguarda boot inicial do modelo antes de acionar sondas
Start-Sleep -Seconds 4

while ($Global:Running) {
    # Validação se o processo host morreu inesperadamente
    if ($Global:DaemonProcess.HasExited) {
        Write-Host "[CRITICAL] Daemon crash detectado (ExitCode: $($Global:DaemonProcess.ExitCode))." -ForegroundColor Red
        $ConsecutiveFailures = $MaxConsecutiveFailures
    } else {
        $isHealthy = Test-HttpHealthGate -Url $HealthUrl -TimeoutMs $ProbeTimeoutMs
        
        if ($isHealthy) {
            if ($ConsecutiveFailures -gt 0) {
                Write-Host "[RECOVERY] Health Gate restabelecido (200 OK)." -ForegroundColor Green
            }
            $ConsecutiveFailures = 0
        } else {
            $ConsecutiveFailures++
            Write-Host "[HEALTH GATE WARN] Falha na sonda ($ConsecutiveFailures/$MaxConsecutiveFailures) em $HealthUrl" -ForegroundColor Yellow
        }
    }

    # Disparo de Auto-Restart ao atingir threshold
    if ($ConsecutiveFailures -ge $MaxConsecutiveFailures) {
        $RestartCounter++
        Write-Host "[ALERT] Disparo de auto-recuperação do daemon (#$RestartCounter/$MaxRestartCount)..." -ForegroundColor Magenta
        
        if ($RestartCounter -gt $MaxRestartCount) {
            Write-Host "[FATAL] Limite máximo de restarts excedido. Acionando Circuit Breaker permanente." -ForegroundColor Red
            Stop-LlamaDaemon -Process $Global:DaemonProcess
            exit 2
        }

        Stop-LlamaDaemon -Process $Global:DaemonProcess
        Start-Sleep -Seconds $CoolDownAfterCrashSec
        
        $Global:DaemonProcess = Start-LlamaDaemon -Path $DaemonScript -Model $ModelPath -TargetPort $Port
        $ConsecutiveFailures = 0
        Start-Sleep -Seconds 4
    }

    Start-Sleep -Seconds $HealthIntervalSec
}
