<#
.SYNOPSIS
  Provisionamento declarativo de modelos Ollama a partir da fonte unica de verdade.

.DESCRIPTION
  Le data/ollama_models.json e reconcilia o estado declarado com o estado real
  do Ollama. Substitui a pratica de versionar os pesos em Git LFS: os modelos
  passam a ser um artefato provisionado sob demanda, nao um binario no repo.

  Por omissao apenas RELATA a divergencia. Nada e baixado nem removido sem
  que voce peca explicitamente com -Pull.

.PARAMETER Pull
  Puxa os modelos marcados como "required" que estiverem ausentes.

.PARAMETER IncludeOptional
  Estende o -Pull tambem aos modelos "required": false. Use com cuidado:
  varios aliases legados no manifesto nunca foram instalados de proposito.

.PARAMETER StartOllama
  Sobe o Ollama se a porta nao estiver escutando.

.EXAMPLE
  .\Ensure-OllamaModels.ps1
  Relatorio de divergencia, sem alterar nada.

.EXAMPLE
  .\Ensure-OllamaModels.ps1 -Pull -StartOllama
  Sobe o Ollama e puxa apenas os modelos obrigatorios ausentes.
#>
[CmdletBinding()]
param(
    [switch]$Pull,
    [switch]$IncludeOptional,
    [switch]$StartOllama,

    # Libera OLLAMA_API_BASE fora de loopback. Ver validacao abaixo.
    [switch]$PermitirRemoto
)

$ErrorActionPreference = 'Stop'

# ─────────────────────────────────────────────────────────────────────────────
# 1. Carregar a fonte unica de verdade
# ─────────────────────────────────────────────────────────────────────────────
$RepoRoot  = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$Manifesto = Join-Path $RepoRoot 'data\ollama_models.json'

if (-not (Test-Path $Manifesto)) {
    Write-Error "[SOTA] Manifesto nao encontrado: $Manifesto"
    exit 1
}

# NOTA: nomes de variavel em PowerShell sao case-INSENSITIVE. Nao usar $M aqui,
# porque colide com o $m de qualquer 'foreach ($m in ...)' adiante e o manifesto
# seria silenciosamente sobrescrito.
try {
    $Manifest = Get-Content $Manifesto -Raw -Encoding UTF8 | ConvertFrom-Json
} catch {
    Write-Error "[SOTA] Manifesto invalido: $($_.Exception.Message)"
    exit 1
}

$ApiBase = if ($env:OLLAMA_API_BASE) { $env:OLLAMA_API_BASE } else { $Manifest.runtime.api_base_default }

# OLLAMA_API_BASE vem do ambiente e atravessa fronteira de confianca: e o
# destino de um Invoke-RestMethod mais adiante. Uma variavel envenenada faria
# este script consultar um host arbitrario. O Ollama e um daemon local, entao
# restringir a loopback nao custa funcionalidade — e quem tiver motivo legitimo
# para apontar para outro host declara isso explicitamente com -PermitirRemoto.
try {
    $Uri = [uri]$ApiBase
} catch {
    Write-Error "[SOTA] OLLAMA_API_BASE nao e uma URI valida: '$ApiBase'"
    exit 1
}

$ehLoopback = $Uri.IsLoopback -or $Uri.Host -in @('localhost', '127.0.0.1', '::1')
if (-not $ehLoopback -and -not $PermitirRemoto) {
    Write-Error (
        "[SOTA] OLLAMA_API_BASE aponta para '$($Uri.Host)', fora de loopback. " +
        "O Ollama e um daemon local; um endereco remoto aqui costuma indicar " +
        "variavel de ambiente envenenada. Use -PermitirRemoto se for deliberado."
    )
    exit 1
}

$Porta = $Uri.Port

Write-Output ''
Write-Output '════════════════════════════════════════════════════════════════'
Write-Output '  SOTA — RECONCILIACAO DE MODELOS OLLAMA'
Write-Output '════════════════════════════════════════════════════════════════'
Write-Output "  Manifesto : $Manifesto"
Write-Output "  Declarados: $($Manifest.models.Count) modelos"
Write-Output "  API       : $ApiBase"
Write-Output ''

# ─────────────────────────────────────────────────────────────────────────────
# 2. Garantir que o Ollama responde
# ─────────────────────────────────────────────────────────────────────────────
function Test-OllamaVivo {
    param([int]$P)
    try {
        $t = New-Object System.Net.Sockets.TcpClient
        $c = $t.BeginConnect('127.0.0.1', $P, $null, $null)
        $ok = $c.AsyncWaitHandle.WaitOne(600, $false)
        if ($ok) { $t.EndConnect($c); $t.Close(); return $true }
        $t.Close()
    } catch {}
    return $false
}

$Vivo = Test-OllamaVivo -P $Porta

if (-not $Vivo -and $StartOllama) {
    Write-Output "[OLLAMA] Offline. Iniciando..."
    $Caminhos = @(
        "$env:LOCALAPPDATA\Programs\Ollama\ollama app.exe",
        "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe",
        "C:\Program Files\Ollama\ollama.exe"
    )
    $Exe = $Caminhos | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($Exe) {
        Start-Process $Exe -WindowStyle Minimized
        for ($i = 0; $i -lt 15 -and -not $Vivo; $i++) {
            Start-Sleep -Seconds 1
            $Vivo = Test-OllamaVivo -P $Porta
        }
    } else {
        Write-Warning "[OLLAMA] Executavel nao encontrado nos caminhos padrao."
    }
}

if (-not $Vivo) {
    Write-Warning "[OLLAMA] Nao esta escutando em $ApiBase."
    Write-Warning "         Rode novamente com -StartOllama, ou suba o Ollama manualmente."
    Write-Warning "         O relatorio abaixo sai apenas com o lado declarado."
    Write-Output ''
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. Inventario real
# ─────────────────────────────────────────────────────────────────────────────
$Instalados = @{}
if ($Vivo) {
    try {
        $resp = Invoke-RestMethod -Uri "$ApiBase/api/tags" -TimeoutSec 30
        foreach ($apiModel in $resp.models) {
            $Instalados[$apiModel.name] = [pscustomobject]@{
                Tag    = $apiModel.name
                SizeGB = [math]::Round($apiModel.size / 1GB, 2)
                Digest = if ($apiModel.digest) { $apiModel.digest.Substring(0, [math]::Min(12, $apiModel.digest.Length)) } else { '' }
            }
        }
    } catch {
        Write-Warning "[OLLAMA] Falha ao consultar /api/tags: $($_.Exception.Message)"
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# 4. Reconciliar
# ─────────────────────────────────────────────────────────────────────────────
$ObrigAusentes = @()
$OpcAusentes   = @()
$Presentes     = @()

foreach ($mod in $Manifest.models) {
    $temInstalado = $Instalados.ContainsKey($mod.tag)
    if ($temInstalado) {
        $Presentes += [pscustomobject]@{
            Alias = $mod.alias; Tag = $mod.tag; Tier = $mod.tier
            SizeGB = $Instalados[$mod.tag].SizeGB
            Consumidores = $mod.consumers.Count
        }
    } elseif ($mod.required) {
        $ObrigAusentes += $mod
    } else {
        $OpcAusentes += $mod
    }
}

# Instalados que o manifesto nao declara
$TagsDeclaradas = $Manifest.models | ForEach-Object { $_.tag }
$NaoDeclarados  = $Instalados.Keys | Where-Object { $_ -notin $TagsDeclaradas }

# Declarados sem nenhum consumidor no codigo
$SemConsumidor = $Manifest.models | Where-Object { $_.consumers.Count -eq 0 }

# ─────────────────────────────────────────────────────────────────────────────
# 5. Relatorio
# ─────────────────────────────────────────────────────────────────────────────
if ($Presentes.Count) {
    Write-Output '── PRESENTES E DECLARADOS ──────────────────────────────────────'
    $Presentes | Sort-Object -Property SizeGB -Descending |
        Format-Table Alias, Tag, Tier, SizeGB, Consumidores -AutoSize | Out-String | Write-Output
}

if ($ObrigAusentes.Count) {
    Write-Output '── OBRIGATORIOS AUSENTES ───────────────────────────────────────'
    foreach ($m in $ObrigAusentes) { Write-Output "  [FALTA] $($m.tag)  ($($m.alias))  — $($m.role)" }
    Write-Output ''
}

if ($OpcAusentes.Count) {
    Write-Output '── OPCIONAIS AUSENTES (esperado — nao puxar sem motivo) ────────'
    foreach ($m in $OpcAusentes) { Write-Output "  [ ok ] $($m.tag)  ($($m.alias))" }
    Write-Output ''
}

if ($NaoDeclarados) {
    Write-Output '── INSTALADOS MAS NAO DECLARADOS ───────────────────────────────'
    foreach ($t in $NaoDeclarados) { Write-Output "  [DERIVA] $t  ($($Instalados[$t].SizeGB) GB) — adicionar ao manifesto ou remover" }
    Write-Output ''
}

if ($SemConsumidor.Count) {
    Write-Output '── DECLARADOS SEM CONSUMIDOR NO CODIGO ─────────────────────────'
    foreach ($m in $SemConsumidor) { Write-Output "  [ORFAO] $($m.tag) — nenhum arquivo referencia" }
    Write-Output ''
}

# ─────────────────────────────────────────────────────────────────────────────
# 6. Acao — so quando pedida
# ─────────────────────────────────────────────────────────────────────────────
$APuxar = @($ObrigAusentes)
if ($IncludeOptional) { $APuxar += $OpcAusentes }

if (-not $Pull) {
    if ($APuxar.Count) {
        Write-Output "[SOTA] $($APuxar.Count) modelo(s) seriam puxados. Rode com -Pull para aplicar."
    } else {
        Write-Output '[SOTA] Estado reconciliado: nada a puxar.'
    }
    Write-Output ''
    exit 0
}

if (-not $Vivo) { Write-Error '[SOTA] -Pull exige o Ollama ativo. Use -StartOllama.'; exit 1 }

if (-not $APuxar.Count) { Write-Output '[SOTA] Nada a puxar.'; Write-Output ''; exit 0 }

Write-Output "── PUXANDO $($APuxar.Count) MODELO(S) ──────────────────────────────────"
$falhas = 0
foreach ($m in $APuxar) {
    Write-Output "  -> ollama pull $($m.tag)"
    & ollama pull $m.tag
    if ($LASTEXITCODE -ne 0) { Write-Warning "     falhou: $($m.tag)"; $falhas++ }
}

Write-Output ''
if ($falhas) { Write-Warning "[SOTA] Concluido com $falhas falha(s)."; exit 1 }
Write-Output '[SOTA] Modelos obrigatorios reconciliados.'
Write-Output ''
