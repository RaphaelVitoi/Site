<#
.SYNOPSIS
  Provisiona a chave de acesso do Supabase em HKCU e HKLM.
  Protocolo Chico SOTA v8.0 GOLD.

.DESCRIPTION
  Grava a chave de acesso do Supabase nos escopos de Usuario (HKCU) e Maquina (HKLM)
  para as variaveis canonicas e de compatibilidade:
    - SUPABASE_ACCESS_TOKEN (Padrao oficial da CLI e API de Gestao do Supabase)
    - SUPABASE_TOKEN (Alias direto para ferramentas e scripts de automacao)
    - SUPABASE_KEY (Alias de compatibilidade)
  Gera broadcast WM_SETTINGCHANGE para propagacao imediata no Windows.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Key
)

$ErrorActionPreference = 'Stop'

function Get-Sha8([string]$s) {
  $sha = [Security.Cryptography.SHA256]::Create()
  try {
    return [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($s))).Replace('-', '').ToLower().Substring(0, 8)
  }
  finally {
    $sha.Dispose()
  }
}

$vars = @('SUPABASE_ACCESS_TOKEN', 'SUPABASE_TOKEN', 'SUPABASE_KEY')
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

$records = @()

foreach ($var in $vars) {
  # 1. Escopo de Usuario (HKCU)
  [Environment]::SetEnvironmentVariable($var, $Key, 'User')
  $hkcuVal = [Environment]::GetEnvironmentVariable($var, 'User')

  # 2. Escopo de Maquina (HKLM) se admin
  $hklmOk = $false
  if ($isAdmin) {
    try {
      [Environment]::SetEnvironmentVariable($var, $Key, 'Machine')
      $hklmVal = [Environment]::GetEnvironmentVariable($var, 'Machine')
      $hklmOk = ($hklmVal -eq $Key)
    }
    catch {
      Write-Warning "Falha ao gravar $var em HKLM: $_"
    }
  }

  # 3. Escopo do Processo Atual
  [Environment]::SetEnvironmentVariable($var, $Key, 'Process')

  $sha = Get-Sha8 $Key

  $records += [PSCustomObject]@{
    Variavel = $var
    Tamanho  = $Key.Length
    SHA8     = $sha
    HKCU     = if ($hkcuVal -eq $Key) { 'GRAVADO (OK)' } else { 'FALHA' }
    HKLM     = if ($hklmOk) { 'GRAVADO (OK)' } else { 'FALHA' }
    Processo = 'GRAVADO (OK)'
  }
}

# 4. Broadcast do Windows para propagacao de ambiente
$HWND_BROADCAST = [IntPtr]0xffff
$WM_SETTINGCHANGE = 0x001A
$res = [UIntPtr]::Zero
Add-Type -Namespace Win32 -Name NativeMethods -MemberDefinition @'
[DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
'@ -ErrorAction SilentlyContinue

[Win32.NativeMethods]::SendMessageTimeout($HWND_BROADCAST, $WM_SETTINGCHANGE, [UIntPtr]::Zero, 'Environment', 2, 5000, [ref]$res) | Out-Null

$records | Format-Table -AutoSize
