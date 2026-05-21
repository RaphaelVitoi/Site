<#
.SYNOPSIS
    Registra o Agendador de Tarefas do Windows para executar o relatorio diario.
    Horario estrategico: 22:05 PM (Logo apos o Backup SOTA das 22:00 PM).
#>

Write-Host "=== INSTALANDO MOTOR DE RELATORIOS (CORTEX PULSE) ===" -ForegroundColor Cyan

$ScriptPath = Join-Path (Split-Path $PSScriptRoot -Parent) "routines\invoke_daily_report.ps1"

$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""
$Trigger = New-ScheduledTaskTrigger -Daily -At 10:05PM
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "Nexus_Daily_Pulse_SOTA" -Action $Action -Trigger $Trigger -Settings $Settings -Description "Relatorio Diario de Produtividade dos Agentes (Cortex Pulse)" -Force

Write-Host "[OK] Relatorio Diario agendado para as 22:05 BRT. Mais um modulo SOTA ativado." -ForegroundColor Green