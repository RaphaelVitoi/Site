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
    # Expulsar paginas do working set nao libera a memoria comprometida.
    # O watchdog observa sem forcar paginacao em todos os navegadores do usuario.
    $privateMB = [math]::Round(($chromeProcs | Measure-Object PrivateMemorySize64 -Sum).Sum / 1MB, 2)
    Write-Warning "Working set: $totalMemMB MB; memoria privada: $privateMB MB. Identifique abas/extensoes pelo consumidor."
    if ($AutoPurgeCaches) { Write-Warning 'AutoPurgeCaches aposentado: nenhuma pagina de memoria foi expulsa.' }
} else {
    Write-Host "[STATUS] Memória perfeitamente balanceada dentro dos parâmetros SOTA (< $MaxMemoryThresholdGb GB)." -ForegroundColor Green
}

Write-Host "======================================================================`n" -ForegroundColor Cyan
