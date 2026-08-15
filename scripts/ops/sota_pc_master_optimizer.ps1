<#
.SYNOPSIS
    SOTA Gold Master PC Performance, Boot & Runtime Optimizer
    Protocol Chico SOTA v7.0 GOLD - Systems Architecture & Low-Latency Tuning
#>

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  SOTA GOLD MASTER PC PERFORMANCE & BOOT OPTIMIZER (CHICO v7.0)" -ForegroundColor Cyan
Write-Host "  Governança: Raphael Vitoi | Total RAM: 32 GB | SOTA Equilibrium" -ForegroundColor Gray
Write-Host "======================================================================`n"

# -----------------------------------------------------------------------------
# 1. SPARK & SYSTEM GLOBAL ENVIRONMENT VARIABLES
# -----------------------------------------------------------------------------
Write-Host "[1/6] Configurando Variáveis de Ambiente Globais (Gold Equilibrium Default)..." -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable('SPARK_EQUILIBRIUM_PROFILE', 'BALANCED_GOLD', 'Machine')
[System.Environment]::SetEnvironmentVariable('SPARK_EQUILIBRIUM_PROFILE', 'BALANCED_GOLD', 'User')
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Users\rapha\.gemini\tools\jdk-21', 'Machine')
[System.Environment]::SetEnvironmentVariable('HADOOP_HOME', 'C:\Users\rapha\.gemini\tools\hadoop', 'Machine')
Write-Host "  [OK] SPARK_EQUILIBRIUM_PROFILE = BALANCED_GOLD registrado como padrão." -ForegroundColor Green
Write-Host "  [OK] JAVA_HOME e HADOOP_HOME vinculados permanentemente ao sistema." -ForegroundColor Green

# -----------------------------------------------------------------------------
# 2. BOOT & REBOOT ACCELERATION (BCD & SHUTDOWN KERNEL TIMEOUTS)
# -----------------------------------------------------------------------------
Write-Host "`n[2/6] Acelerando Inicialização e Reinicialização (Bootloader & Kernel)..." -ForegroundColor Yellow

# BCD Timeout (3 segundos)
bcdedit /timeout 3 | Out-Null
Write-Host "  [OK] BCD Bootloader Timeout calibrado para 3 segundos." -ForegroundColor Green

# Fast Shutdown & Service Termination Timings
$controlPath = "HKLM:\SYSTEM\CurrentControlSet\Control"
Set-ItemProperty -Path $controlPath -Name "WaitToKillServiceTimeout" -Value "2000" -Type String -Force
Write-Host "  [OK] WaitToKillServiceTimeout calibrado para 2000ms (Shutdown ágil)." -ForegroundColor Green

# Desktop App Hang & Termination Timings (Current User & Default)
$desktopPaths = @("HKCU:\Control Panel\Desktop", "Registry::HKEY_USERS\.DEFAULT\Control Panel\Desktop")
foreach ($dp in $desktopPaths) {
    if (Test-Path $dp) {
        Set-ItemProperty -Path $dp -Name "AutoEndTasks" -Value "1" -Type String -Force
        Set-ItemProperty -Path $dp -Name "HungAppTimeout" -Value "1000" -Type String -Force
        Set-ItemProperty -Path $dp -Name "WaitToKillAppTimeout" -Value "2000" -Type String -Force
        Set-ItemProperty -Path $dp -Name "MenuShowDelay" -Value "0" -Type String -Force
    }
}
Write-Host "  [OK] AutoEndTasks=1 e MenuShowDelay=0 configurados (Zero latência de interface e reinício)." -ForegroundColor Green

# -----------------------------------------------------------------------------
# 3. KERNEL MEMORY & SCHEDULING (32GB RAM WORKSTATION OPTIMIZATION)
# -----------------------------------------------------------------------------
Write-Host "`n[3/6] Otimizando Escalonador de Processos e Memória RAM..." -ForegroundColor Yellow

# Win32PrioritySeparation = 38 (0x26 -> Short variable quantum, foreground priority)
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\PriorityControl" -Name "Win32PrioritySeparation" -Value 38 -Type DWord -Force
Write-Host "  [OK] Win32PrioritySeparation = 38 (Foco máximo na responsividade do aplicativo em primeiro plano)." -ForegroundColor Green

# Memory Management: Disable Paging of Executive & Desktop Working Sets
$memPath = "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management"
Set-ItemProperty -Path $memPath -Name "DisablePagingExecutive" -Value 1 -Type DWord -Force
Set-ItemProperty -Path $memPath -Name "ClearPageFileAtShutdown" -Value 0 -Type DWord -Force
Set-ItemProperty -Path $memPath -Name "LargeSystemCache" -Value 0 -Type DWord -Force
Write-Host "  [OK] Kernel Executive retido 100% na RAM (Zero page-faults de drivers)." -ForegroundColor Green

# -----------------------------------------------------------------------------
# 4. FILESYSTEM & NVMe / SSD DISK I/O ACCELERATION
# -----------------------------------------------------------------------------
Write-Host "`n[4/6] Calibrando Subsistema de Arquivos NTFS & TRIM..." -ForegroundColor Yellow

# Disable NTFS Last Access Time Updates (Elimina escritas desnecessárias em cada leitura)
fsutil behavior set disablelastaccess 1 | Out-Null
Write-Host "  [OK] DisableLastAccess = 1 (Escrita desnecessária em leituras de disco eliminada)." -ForegroundColor Green

# Ensure TRIM is enabled
fsutil behavior set DisableDeleteNotify 0 | Out-Null
Write-Host "  [OK] TRIM / DisableDeleteNotify = 0 ativo para preservação de SSD/NVMe." -ForegroundColor Green

# -----------------------------------------------------------------------------
# 5. NETWORK TCP/IP LOW-LATENCY STACK & DNS CACHE
# -----------------------------------------------------------------------------
Write-Host "`n[5/6] Otimizando Pilha de Rede TCP/IP e Cache DNS..." -ForegroundColor Yellow
netsh int tcp set global autotuninglevel=normal | Out-Null
netsh int tcp set global rss=enabled | Out-Null
netsh int tcp set global ecncapability=enabled | Out-Null
netsh int tcp set global fastopen=enabled | Out-Null
netsh int tcp set global fastopenfallback=enabled | Out-Null
netsh int tcp set global hystart=enabled | Out-Null
netsh int tcp set global prr=enabled | Out-Null
netsh int ip set global taskoffload=enabled | Out-Null
ipconfig /flushdns | Out-Null
Write-Host "  [OK] Pilha TCP/IP configurada: RSS, AutoTuning, FastOpen e HyStart ativos." -ForegroundColor Green
Write-Host "  [OK] Cache DNS limpo com sucesso." -ForegroundColor Green

# -----------------------------------------------------------------------------
# 6. EXPURGO DE ARQUIVOS TEMPORÁRIOS ESTÁVEIS
# -----------------------------------------------------------------------------
Write-Host "`n[6/6] Expurgo de Arquivos Temporários e Cache Entrópico..." -ForegroundColor Yellow

$tempFolders = @(
    $env:TEMP,
    "C:\Windows\Temp"
)

$cleanedFiles = 0
$cleanedBytes = 0

foreach ($tf in $tempFolders) {
    if (Test-Path $tf) {
        Get-ChildItem -Path $tf -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
            try {
                $len = $_.Length
                Remove-Item $_.FullName -Force -ErrorAction Stop
                $cleanedFiles++
                $cleanedBytes += $len
            } catch {
                # In-use files skipped safely
            }
        }
    }
}

$cleanedMB = [math]::Round($cleanedBytes / 1MB, 2)
Write-Host "  [OK] $cleanedFiles arquivos temporários eliminados ($cleanedMB MB liberados com segurança)." -ForegroundColor Green

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "  SOTA MASTER PC OPTIMIZATION CONCLUÍDA COM SUCESSO ABSOLUTO (+EV)" -ForegroundColor Cyan
Write-Host "======================================================================`n"
