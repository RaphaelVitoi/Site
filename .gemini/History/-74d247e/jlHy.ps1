<#
.SYNOPSIS
    Cria um atalho no diretório 'Startup' do Windows para inicializar o Worker Pydantic automaticamente.
#>

$TargetScript = Join-Path $PSScriptRoot "start_worker.ps1"
$StartupFolder = [Environment]::GetFolderPath('Startup')
$ShortcutPath = Join-Path $StartupFolder "NexusWorker.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$TargetScript`""
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Orquestrador Pydantic Background (Nexus)"
$Shortcut.Save()

Write-Host "[SYMMETRY] Atalho criado em: $ShortcutPath" -ForegroundColor Green