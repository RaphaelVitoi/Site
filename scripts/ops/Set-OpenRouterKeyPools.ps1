<#
.SYNOPSIS
  Provisiona pools de chaves OpenRouter particionados por Tier em HKCU e HKLM.
  Protocolo Chico SOTA v8.0 GOLD.

.DESCRIPTION
  Grava as chaves OpenRouter nos escopos de Usuario (HKCU) e Maquina (HKLM)
  organizadas por Tier:
    - Tier 1: 3 chaves (OPENROUTER_TIER1_KEY_1..3)
    - Tier 2: 3 chaves (OPENROUTER_TIER2_KEY_1..3)
    - Tier 3: 5 chaves (OPENROUTER_TIER3_KEY_1..5)
    - Tier 4: 5 chaves (OPENROUTER_TIER4_KEY_1..5)
  Implementa a secao 3 do CLAUDE.md: segredos nunca em texto claro no git.
  Auditoria por SHA-256 truncado (sha8).

.EXAMPLE
  pwsh scripts/ops/Set-OpenRouterKeyPools.ps1 -Interactive

.EXAMPLE
  pwsh scripts/ops/Set-OpenRouterKeyPools.ps1 -JsonFile "c:\temp\chaves.json"
#>
[CmdletBinding()]
param(
  [string[]]$Tier1Keys = @(),
  [string[]]$Tier2Keys = @(),
  [string[]]$Tier3Keys = @(),
  [string[]]$Tier4Keys = @(),
  [string]$JsonFile = '',
  [switch]$Interactive
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

function Prompt-SecureKeys([string]$tierName, [int]$count) {
  $keys = @()
  Write-Host "`n=== Entrada Segura para $tierName ($count chaves) ===" -ForegroundColor Cyan
  for ($i = 1; $i -le $count; $i++) {
    $sec = Read-Host -Prompt "Cole a chave $i de $count para $tierName (oculta na tela)" -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
    try {
      $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
      if (-not [string]::IsNullOrWhiteSpace($plain)) {
        $keys += $plain.Trim()
      }
    }
    finally {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
  }
  return $keys
}

# 1. Carregamento por JsonFile se fornecido
if ($JsonFile -and (Test-Path -LiteralPath $JsonFile)) {
  Write-Host "[info] Carregando chaves a partir de $JsonFile..." -ForegroundColor DarkGray
  $data = Get-Content -LiteralPath $JsonFile -Raw | ConvertFrom-Json
  if ($data.tier1) { $Tier1Keys = @($data.tier1) }
  if ($data.tier2) { $Tier2Keys = @($data.tier2) }
  if ($data.tier3) { $Tier3Keys = @($data.tier3) }
  if ($data.tier4) { $Tier4Keys = @($data.tier4) }
}

# 2. Carregamento Interativo se solicitado
if ($Interactive) {
  if ($Tier1Keys.Count -eq 0) { $Tier1Keys = Prompt-SecureKeys "Tier 1 (Cognitive Core)" 3 }
  if ($Tier2Keys.Count -eq 0) { $Tier2Keys = Prompt-SecureKeys "Tier 2 (Superagents)" 3 }
  if ($Tier3Keys.Count -eq 0) { $Tier3Keys = Prompt-SecureKeys "Tier 3 (Batch/Dream)" 5 }
  if ($Tier4Keys.Count -eq 0) { $Tier4Keys = Prompt-SecureKeys "Tier 4 (Subagents)" 5 }
}

$pools = @{
  1 = $Tier1Keys
  2 = $Tier2Keys
  3 = $Tier3Keys
  4 = $Tier4Keys
}

$records = @()
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

foreach ($tier in 1..4) {
  $keys = $pools[$tier]
  if (-not $keys -or $keys.Count -eq 0) {
    continue
  }
  for ($i = 0; $i -lt $keys.Count; $i++) {
    $idx = $i + 1
    $varName = "OPENROUTER_TIER${tier}_KEY_${idx}"
    $keyVal = $keys[$i].Trim()
    if ([string]::IsNullOrWhiteSpace($keyVal)) { continue }

    # Grava em HKCU (User)
    [Environment]::SetEnvironmentVariable($varName, $keyVal, 'User')

    # Grava em HKLM (Machine) se admin
    $hklmOk = $false
    if ($isAdmin) {
      try {
        [Environment]::SetEnvironmentVariable($varName, $keyVal, 'Machine')
        $hklmOk = $true
      } catch {
        Write-Warning "Nao foi possivel gravar $varName em HKLM: $_"
      }
    }

    $sha = Get-Sha8 $keyVal
    $records += [PSCustomObject]@{
      Variavel = $varName
      Tier     = "Tier $tier"
      Len      = $keyVal.Length
      Sha8     = $sha
      HKCU     = 'GRAVADO'
      HKLM     = if ($hklmOk) { 'GRAVADO' } else { 'IGNORADO (Sem Admin)' }
    }
  }
}

# Broadcast WM_SETTINGCHANGE
Add-Type -Namespace Win32 -Name NativeMethods -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("user32.dll", SetLastError = true, CharSet = System.Runtime.InteropServices.CharSet.Auto)]
public static extern System.IntPtr SendMessageTimeout(
    System.IntPtr hWnd, uint Msg, System.UIntPtr wParam, string lParam,
    uint fuFlags, uint uTimeout, out System.UIntPtr lpdwResult);
'@ -ErrorAction SilentlyContinue

$HWND_BROADCAST = [IntPtr]0xffff
$WM_SETTINGCHANGE = 0x001A
$res = [UIntPtr]::Zero
[Win32.NativeMethods]::SendMessageTimeout($HWND_BROADCAST, $WM_SETTINGCHANGE, [UIntPtr]::Zero, 'Environment', 2, 5000, [ref]$res) | Out-Null

Write-Host "`n=== PROVISIONAMENTO DE POOLS OPENROUTER CONCLUIDO ===" -ForegroundColor Green
$records | Format-Table -AutoSize
Write-Host "Total de chaves configuradas: $($records.Count)" -ForegroundColor Cyan
Write-Host "Ambiente atualizado via broadcast WM_SETTINGCHANGE." -ForegroundColor DarkCyan
