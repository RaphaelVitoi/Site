<#
.SYNOPSIS
    Grava uma credencial do ecossistema em HKCU:\Environment e HKLM (se Admin) sem passar por disco.

.DESCRIPTION
    A secao 3 do CLAUDE.md da raiz proibe credencial em texto claro, e a secao 6.4
    fixa onde elas moram: variaveis de ambiente de USUARIO (HKCU:\Environment) e
    MAQUINA (HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment).
    Este script e o caminho unico para inserir ou renovar uma delas, inclusive em
    slots rotacionais (-Slot 1..N -> NOME_1..NOME_N).
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string] $Nome,

    [int] $Slot = 0,

    [switch] $Verificar,

    [switch] $Remover,

    [switch] $Sincronizar
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Credenciais que este ecossistema usa (fonte unica: data/credential_registry.json).
$RegistryPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\data\credential_registry.json'))
if (-not (Test-Path -LiteralPath $RegistryPath)) {
    throw "Manifesto canonico ausente: $RegistryPath"
}
$RegistrySpec = Get-Content -LiteralPath $RegistryPath -Raw -Encoding UTF8 | ConvertFrom-Json
$CredenciaisConhecidas = @($RegistrySpec.ecosystem_managed_vars | ForEach-Object { [string]$_ })

function Send-EnvironmentBroadcast {
    try {
        if (-not ('Win32.SotaEnvNotify' -as [type])) {
            Add-Type -Namespace Win32 -Name SotaEnvNotify -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("user32.dll", SetLastError = true, CharSet = System.Runtime.InteropServices.CharSet.Auto)]
public static extern System.IntPtr SendMessageTimeout(
    System.IntPtr hWnd, uint Msg, System.UIntPtr wParam, string lParam,
    uint fuFlags, uint uTimeout, out System.UIntPtr lpdwResult);
'@
        }
        $res = [UIntPtr]::Zero
        [void][Win32.SotaEnvNotify]::SendMessageTimeout([IntPtr]0xFFFF, 0x001A, [UIntPtr]::Zero, 'Environment', 2, 5000, [ref]$res)
    }
    catch {
        Write-Verbose "Broadcast WM_SETTINGCHANGE ignorado: $_"
    }
}

function Show-Estado {
    param([string[]] $Nomes)

    Write-Host ''
    Write-Host 'Credencial                      HKCU (User)      HKLM (Machine)   Sessao' -ForegroundColor Cyan
    Write-Host '------------------------------  ---------------  ---------------  ------------' -ForegroundColor Cyan

    foreach ($n in $Nomes) {
        $hkcu = [Environment]::GetEnvironmentVariable($n, 'User')
        $hklm = [Environment]::GetEnvironmentVariable($n, 'Machine')
        $proc = [Environment]::GetEnvironmentVariable($n, 'Process')

        $colHkcu = if ([string]::IsNullOrEmpty($hkcu)) { 'AUSENTE' } else { "{0} chars" -f $hkcu.Length }
        $colHklm = if ([string]::IsNullOrEmpty($hklm)) { 'AUSENTE' } else { "{0} chars" -f $hklm.Length }
        $colProc = if ([string]::IsNullOrEmpty($proc)) { 'ausente' } else { "{0} chars" -f $proc.Length }

        Write-Host ("{0,-30}  {1,-15}  {2,-15}  {3}" -f $n, $colHkcu, $colHklm, $colProc)
    }
    Write-Host ''
}

if ($Verificar) {
    Show-Estado -Nomes $CredenciaisConhecidas
    Write-Host 'Somente comprimentos sao exibidos. O valor nunca e impresso.' -ForegroundColor DarkGray
    return
}

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if ($Sincronizar) {
    $changed = $false
    foreach ($n in $CredenciaisConhecidas) {
        $u = [Environment]::GetEnvironmentVariable($n, 'User')
        $m = [Environment]::GetEnvironmentVariable($n, 'Machine')
        $hasU = -not [string]::IsNullOrWhiteSpace($u)
        $hasM = -not [string]::IsNullOrWhiteSpace($m)
        if ($hasU -and $hasM -and ($u -eq $m)) {
            Write-Host ("{0,-30}  SYNCED" -f $n) -ForegroundColor Green
            continue
        }
        if ($hasU -and (-not $hasM -or $u -ne $m)) {
            if ($isAdmin) {
                [Environment]::SetEnvironmentVariable($n, $u.Trim(), 'Machine')
                [Environment]::SetEnvironmentVariable($n, $u.Trim(), 'Process')
                $changed = $true
                Write-Host ("{0,-30}  MIRRORED_TO_HKLM" -f $n) -ForegroundColor Cyan
            }
            else {
                Write-Warning ("{0}: HKLM divergente/ausente (requer Admin para gravar)" -f $n)
            }
        }
        elseif (-not $hasU -and $hasM) {
            [Environment]::SetEnvironmentVariable($n, $m.Trim(), 'User')
            [Environment]::SetEnvironmentVariable($n, $m.Trim(), 'Process')
            $changed = $true
            Write-Host ("{0,-30}  MIRRORED_TO_HKCU" -f $n) -ForegroundColor Cyan
        }
    }
    if ($changed) {
        Send-EnvironmentBroadcast
    }
    return
}

if ($Remover) {
    if ([string]::IsNullOrWhiteSpace($Nome)) {
        Write-Host 'Informe -Nome para remover de HKCU/HKLM/Process.' -ForegroundColor Red
        exit 1
    }
    $removeTargets = @($Nome)
    if ($Slot -gt 0) {
        $removeTargets = @("${Nome}_${Slot}")
    }
    foreach ($t in $removeTargets) {
        [Environment]::SetEnvironmentVariable($t, $null, 'User')
        [Environment]::SetEnvironmentVariable($t, $null, 'Process')
        if ($isAdmin) {
            [Environment]::SetEnvironmentVariable($t, $null, 'Machine')
        }
        Write-Host ("REMOVIDO: {0} (HKCU + Process{1})" -f $t, $(if ($isAdmin) { ' + HKLM' } else { ' ; HKLM ignorado sem Admin' })) -ForegroundColor Yellow
    }
    Send-EnvironmentBroadcast
    return
}

if ([string]::IsNullOrWhiteSpace($Nome)) {
    Write-Host 'Informe o nome da credencial. Conhecidas neste ecossistema:' -ForegroundColor Yellow
    foreach ($c in $CredenciaisConhecidas) { Write-Host "  - $c" }
    Write-Host ''
    Write-Host 'Uso: .\scripts\ops\Set-EcosystemCredential.ps1 -Nome VERCEL_TOKEN [-Slot 1]' -ForegroundColor DarkGray
    Write-Host 'Ou:  .\scripts\ops\Set-EcosystemCredential.ps1 -Verificar | -Sincronizar | -Nome VAR -Remover' -ForegroundColor DarkGray
    exit 1
}

$targetNames = @()
if ($Slot -gt 0) {
    $slotName = "${Nome}_${Slot}"
    $targetNames += $slotName
    if ($Slot -eq 1 -or [string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($Nome, 'User'))) {
        $targetNames += $Nome
    }
}
else {
    $targetNames += $Nome
}

$primaryTarget = $targetNames[0]
$anterior = [Environment]::GetEnvironmentVariable($primaryTarget, 'User')
if ([string]::IsNullOrEmpty($anterior)) {
    Write-Host "$primaryTarget ainda nao existe no escopo de usuario. Sera criada." -ForegroundColor Yellow
}
else {
    Write-Host "$primaryTarget ja existe ($($anterior.Length) chars) e sera SUBSTITUIDA." -ForegroundColor Yellow
    Write-Host 'A credencial anterior deve ser revogada no provedor.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Cole o valor. Ele nao aparece na tela e nao entra no historico.' -ForegroundColor Cyan
$segura = Read-Host -Prompt "  $primaryTarget" -AsSecureString

$hklmGravado = $false
$ptr = [IntPtr]::Zero
try {
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToGlobalAllocUnicode($segura)
    $claro = [Runtime.InteropServices.Marshal]::PtrToStringUni($ptr)

    if ([string]::IsNullOrWhiteSpace($claro)) {
        Write-Host 'Valor vazio. Nada foi alterado.' -ForegroundColor Red
        exit 1
    }

    $claro = $claro.Trim()
    foreach ($t in $targetNames) {
        [Environment]::SetEnvironmentVariable($t, $claro, 'User')
        [Environment]::SetEnvironmentVariable($t, $claro, 'Process')
        if ($isAdmin) {
            try {
                [Environment]::SetEnvironmentVariable($t, $claro, 'Machine')
                $hklmGravado = $true
            }
            catch {
                Write-Warning "Falha ao gravar $t em HKLM: $_"
            }
        }
    }
    $comprimento = $claro.Length
    Send-EnvironmentBroadcast
}
finally {
    if ($ptr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeGlobalAllocUnicode($ptr)
    }
    Remove-Variable -Name claro -ErrorAction SilentlyContinue
}

$confirmacao = [Environment]::GetEnvironmentVariable($primaryTarget, 'User')
if ($confirmacao.Length -ne $comprimento) {
    Write-Host 'Gravacao nao confere. Verifique manualmente.' -ForegroundColor Red
    exit 1
}

Write-Host ''
Write-Host ("OK. {0} gravada com {1} caracteres." -f ($targetNames -join ', '), $comprimento) -ForegroundColor Green
Write-Host ("HKCU: GRAVADO | HKLM: {0}" -f ($(if ($hklmGravado) { 'GRAVADO' } else { 'IGNORADO (Sem Admin)' }))) -ForegroundColor Green
Write-Host 'Processos ja abertos (IDE, servidores) so a herdam apos reinicio.' -ForegroundColor DarkGray
Write-Host ''
Write-Host 'A credencial NAO foi escrita em arquivo nenhum, por desenho.' -ForegroundColor DarkGray
