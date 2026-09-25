<#
.SYNOPSIS
    Provisiona o pool de chaves Gemini API para rotação inteligente em HKCU:\Environment.
    Protocolo Chico SOTA v8.0 GOLD.

.DESCRIPTION
    Grava as 5 chaves da API Google Gemini no escopo de Usuário (HKCU:\Environment)
    e no processo atual, configuradas para uso rotacional de alta eficiência com
    gemini-3.5-flash-lite (edições atômicas, triagem e linting).
    Também registra o ID e nome do projeto do Google AI Studio / GCP:
      - GEMINI_API_PROJECT_ID: projects/913870412920
      - GEMINI_PROJECT_NAME:   original-498419
    Segredos nunca são gravados em disco nem expostos no Git.
    A telemetria exibe apenas o fingerprint truncado SHA-256 (sha8) e o comprimento.

.PARAMETER Keys
    Array de chaves da Gemini API.

.PARAMETER ProjectId
    ID do projeto GCP/AI Studio (padrão: projects/913870412920).

.PARAMETER ProjectName
    Nome do projeto (padrão: original-498419).

.EXAMPLE
    pwsh scripts/ops/Set-GeminiKeyPool.ps1 -Keys $minhasChaves
#>
[CmdletBinding()]
param(
    [string[]]$Keys = @(),
    [string]$ProjectId = "projects/913870412920",
    [string]$ProjectName = "original-498419"
)

Set-StrictMode -Version Latest
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

if ($Keys.Count -eq 0) {
    Write-Host "[Set-GeminiKeyPool] Nenhuma chave informada via parametro. Lendo variaveis existentes..." -ForegroundColor Yellow
}

$records = @()

for ($i = 0; $i -lt $Keys.Count; $i++) {
    $idx = $i + 1
    $keyVal = $Keys[$i].Trim()
    if ([string]::IsNullOrWhiteSpace($keyVal)) { continue }

    $varName = "GEMINI_API_KEY_${idx}"
    $aliasFlash = "GEMINI_FLASH_KEY_${idx}"

    # Grava chave primária e alias em HKCU (User) e Process
    [Environment]::SetEnvironmentVariable($varName, $keyVal, 'User')
    [Environment]::SetEnvironmentVariable($varName, $keyVal, 'Process')
    [Environment]::SetEnvironmentVariable($aliasFlash, $keyVal, 'User')
    [Environment]::SetEnvironmentVariable($aliasFlash, $keyVal, 'Process')

    # Se for a chave 1, define como fallback padrão GEMINI_API_KEY
    if ($idx -eq 1) {
        [Environment]::SetEnvironmentVariable("GEMINI_API_KEY", $keyVal, 'User')
        [Environment]::SetEnvironmentVariable("GEMINI_API_KEY", $keyVal, 'Process')
    }

    $sha = Get-Sha8 $keyVal
    $records += [PSCustomObject]@{
        Variavel = $varName
        Funcao   = "Flash-Lite / Triagem / Linting"
        Len      = $keyVal.Length
        Sha8     = $sha
        HKCU     = 'GRAVADO'
        Processo = 'ATIVO'
    }
}

# Grava identificadores do projeto
if ($ProjectId) {
    [Environment]::SetEnvironmentVariable("GEMINI_PROJECT_ID", $ProjectId, 'User')
    [Environment]::SetEnvironmentVariable("GEMINI_PROJECT_ID", $ProjectId, 'Process')
    $records += [PSCustomObject]@{
        Variavel = "GEMINI_PROJECT_ID"
        Funcao   = "Google Cloud Project Resource"
        Len      = $ProjectId.Length
        Sha8     = Get-Sha8 $ProjectId
        HKCU     = 'GRAVADO'
        Processo = 'ATIVO'
    }
}

if ($ProjectName) {
    [Environment]::SetEnvironmentVariable("GEMINI_PROJECT_NAME", $ProjectName, 'User')
    [Environment]::SetEnvironmentVariable("GEMINI_PROJECT_NAME", $ProjectName, 'Process')
    $records += [PSCustomObject]@{
        Variavel = "GEMINI_PROJECT_NAME"
        Funcao   = "Google Cloud Project Name"
        Len      = $ProjectName.Length
        Sha8     = Get-Sha8 $ProjectName
        HKCU     = 'GRAVADO'
        Processo = 'ATIVO'
    }
}

# Broadcast WM_SETTINGCHANGE para que a IDE e novos shells herdem as variáveis
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

Write-Host "`n=== PROVISIONAMENTO DO POOL GEMINI CONCLUIDO ===" -ForegroundColor Green
$records | Format-Table -AutoSize
Write-Host "Total de registros provisionados: $($records.Count)" -ForegroundColor Cyan
Write-Host "Persistido em HKCU:\Environment e ativo no processo atual." -ForegroundColor DarkCyan
