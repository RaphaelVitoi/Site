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

    [switch] $Verificar
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Credenciais que este ecossistema usa (incluindo bridges e slots rotacionais).
$CredenciaisConhecidas = @(
    'JULES_API_KEY',
    'STITCH_API_KEY',
    'EXA_API_KEY',
    'GITHUB_TOKEN',
    'RENDER_API_KEY',
    'GOOGLE_CLOUD_PROJECT',
    'DEVIN_API_TOKEN',
    'DEVIN_API_KEY',
    'DEVIN_ORG_ID',
    'VERCEL_TOKEN',
    'VERCEL_USER_ID',
    'RAGFLOW_API_KEY',
    'RAGFLOW_API_BASE',
    'N8N_API_KEY',
    'NEO4J_AURA_API_KEY',
    'NEO4J_AURA_CLIENT_ID',
    'NEO4J_AURA_CLIENT_SECRET',
    'NEO4J_AURA_AGENT_CLIENT_ID',
    'NEO4J_AURA_AGENT_CLIENT_SECRET',
    'NEO4J_AURA_INSTANCE_ID',
    'DOCKER_PAT',
    'HF_CREDENTIALS',
    'HF_KEY'
)

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

if ([string]::IsNullOrWhiteSpace($Nome)) {
    Write-Host 'Informe o nome da credencial. Conhecidas neste ecossistema:' -ForegroundColor Yellow
    foreach ($c in $CredenciaisConhecidas) { Write-Host "  - $c" }
    Write-Host ''
    Write-Host 'Uso: .\scripts\ops\Set-EcosystemCredential.ps1 -Nome VERCEL_TOKEN [-Slot 1]' -ForegroundColor DarkGray
    Write-Host 'Ou:  .\scripts\ops\Set-EcosystemCredential.ps1 -Verificar' -ForegroundColor DarkGray
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

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
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
