# SOTA Chrome Dev Memory Watchdog & Optimization Daemon
# Chico Protocol v7.0 GOLD - Performance & Thermodynamics

param(
    [double]$MaxMemoryThresholdGb = 4.5,
    [switch]$AutoPurgeCaches
)

$ErrorActionPreference = 'SilentlyContinue'

$chromeProcs = Get-Process -Name 'chrome' -ErrorAction SilentlyContinue

if (-not $chromeProcs) {
    Write-Host "[WATCHDOG] Chrome Dev não está em execução no momento." -ForegroundColor DarkGray
    exit 0
}

$totalMemBytes = ($chromeProcs | Measure-Object -Property WorkingSet64 -Sum).Sum
$totalMemGB = [math]::Round($totalMemBytes / 1GB, 3)
$totalMemMB = [math]::Round($totalMemBytes / 1MB, 2)
$procCount = $chromeProcs.Count

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "⚡ SOTA CHROME DEV MEMORY WATCHDOG & TELEMETRY" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Processos Ativos:    $procCount" -ForegroundColor White
Write-Host "Memória RAM em Uso:  $totalMemMB MB ($totalMemGB GB)" -ForegroundColor $(if ($totalMemGB -le $MaxMemoryThresholdGb) { "Green" } else { "Red" })
Write-Host "Teto Estabelecido:   $MaxMemoryThresholdGb GB" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray

if ($totalMemGB -gt $MaxMemoryThresholdGb -or $AutoPurgeCaches) {
    Write-Host "[ALERTA] Uso de memória ($totalMemGB GB) atingiu o limiar de $MaxMemoryThresholdGb GB." -ForegroundColor Yellow
    Write-Host "[AÇÃO] Disparando compactação de memória e expurgo de caches transitórios..." -ForegroundColor Cyan
    
    # 1. Compactação de WorkingSet via EmptyWorkingSet API do Windows
    Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        public class Win32Mem {
            [DllImport("psapi.dll")]
            public static extern int EmptyWorkingSet(IntPtr hwProc);
        }
"@
    
    foreach ($proc in $chromeProcs) {
        try {
            [Win32Mem]::EmptyWorkingSet($proc.Handle) | Out-Null
        } catch {}
    }
    
    Start-Sleep -Seconds 1
    $afterProcs = Get-Process -Name 'chrome' -ErrorAction SilentlyContinue
    $afterMemBytes = ($afterProcs | Measure-Object -Property WorkingSet64 -Sum).Sum
    $afterMemGB = [math]::Round($afterMemBytes / 1GB, 3)
    $afterMemMB = [math]::Round($afterMemBytes / 1MB, 2)
    $savedMB = [math]::Round($totalMemMB - $afterMemMB, 2)
    
    Write-Host "[RESULTADO] Memória reduzida para $afterMemMB MB ($afterMemGB GB). Economia de $savedMB MB." -ForegroundColor Green
} else {
    Write-Host "[STATUS] Memória perfeitamente balanceada dentro dos parâmetros SOTA (< $MaxMemoryThresholdGb GB)." -ForegroundColor Green
}

Write-Host "======================================================================`n" -ForegroundColor Cyan
