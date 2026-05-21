<#
.SYNOPSIS
    Protocolo Anti-EPERM SOTA Gold. Aniquila processos travados e pausa sincronização para evitar locks de I/O.
#>
param (
    [string]$CommandString,
    [string]$ScriptDirectory
)

Write-Host '=== [PROTOCOLO ANTI-EPERM] CHICO NO CONTROLE ===' -ForegroundColor Red

if ([string]::IsNullOrWhiteSpace($CommandString)) {
    Write-Error "O parametro -FixEPERM requer um comando. Ex: -FixEPERM 'npm install'"
    return
}

$CommandParts = @($CommandString -split '\s+(?=(?:[^"]*"[^"]*")*[^"]*$)' | Where-Object { $_ -match '\S' } | ForEach-Object { $_.Trim('"') })
$CommandName = $CommandParts[0]
$CommandArgs = @()
if ($CommandParts.Length -gt 1) { $CommandArgs = @($CommandParts[1..($CommandParts.Length - 1)]) }
$AllowedCommands = @('npm', 'pnpm', 'yarn', 'pip', 'npx')

if ($CommandName -notin $AllowedCommands) {
    Write-Error "[SEC] O comando '$CommandName' nao e permitido. Permitidos: $($AllowedCommands -join ', ')"
    return
}

Write-Host '[ANTI-EPERM] Aniquilando processos Node zumbis SOTA...' -ForegroundColor Yellow
try {
    $CurrentPathEscaped = [regex]::Escape($ScriptDirectory) -replace '\\\\', '\\'
    $NodeProcs = Get-CimInstance -ClassName Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match $CurrentPathEscaped }
    if ($NodeProcs) {
        foreach ($proc in $NodeProcs) { Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue }
    }
}
catch {
    Write-Warning '[ANTI-EPERM] Falha ao consultar processos Node.'
}

Write-Host '[ANTI-EPERM] Pausando sincronizacao do OneDrive...' -ForegroundColor Yellow
$oneDriveProcess = Get-Process -Name 'OneDrive' -ErrorAction SilentlyContinue
if ($oneDriveProcess) {
    $oneDrivePath = $oneDriveProcess.Path
    Stop-Process -Name 'OneDrive' -Force -ErrorAction SilentlyContinue
    $oneDriveProcess | Wait-Process -Timeout 15 -ErrorAction SilentlyContinue
}

try {
    Write-Host "[ANTI-EPERM] Executando: '$CommandString'" -ForegroundColor Cyan
    & $CommandName @CommandArgs
}
catch {
    Write-Error "[FALHA] Comando protegido falhou: $_"
}
finally {
    if ($oneDrivePath -and (Test-Path $oneDrivePath)) {
        Write-Host '[ANTI-EPERM] Restaurando OneDrive...' -ForegroundColor Gray
        Start-Process -FilePath $oneDrivePath -WindowStyle Minimized -ErrorAction SilentlyContinue
    }
}
