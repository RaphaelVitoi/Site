<#
.SYNOPSIS
    Registra o Agendador de Tarefas do Windows para executar o invoke_daily_backup.ps1
    todo dia às 10:00 PM (ou quando o PC for ligado na sequencia).
#>

Write-Host "=== INSTALANDO MOTOR DE BACKUP AUTONOMO ===" -ForegroundColor Cyan

$ScriptPath = Join-Path (Split-Path $PSScriptRoot -Parent) "routines\invoke_daily_backup.ps1"

# Configuracao da Acao Silenciosa (-WindowStyle Hidden evita que pisque uma tela preta)
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""
$Trigger = New-ScheduledTaskTrigger -Daily -At 10:00PM
# Garante que se o PC estiver desligado as 10PM, ele rode assim que voce ligar:
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "Nexus_Daily_Backup_SOTA" -Action $Action -Trigger $Trigger -Settings $Settings -Description "Backup Diario e Expurgo Automatizado da Trindade" -Force

Write-Host "[OK] Agendador de Tarefas do Windows configurado. Sua historia e seu legado estao seguros para sempre." -ForegroundColor Green