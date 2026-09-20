<#
.SYNOPSIS
    Orquestrador Nativo SOTA do llama-server Vulkan (AMD RX 570 8GB + Intel i9-9900K).
.DESCRIPTION
    Inicializa o binario pre-compilado em engine/llama_cpp/llama-server.exe com aceleracao
    Vulkan opcional, KV Cache limitado e um unico slot de inferencia (-np 1),
    renderizacao Jinja de Tool Schemas e amarracao direta aos blobs GGUF locais.
#>
[CmdletBinding()]
param (
    [int]$Port = 8080,
    [int]$ContextWindow = 4096,
    [string]$ModelTag = "qwen2.5-coder:7b-instruct-q5_K_M",
    [int]$GpuLayers = 99,
    [int]$Threads = 4,
    [int]$IdleSeconds = 30,
    [switch]$Background,
    [switch]$Stop
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot   = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$LlamaDir   = Join-Path $RepoRoot "engine\llama_cpp"
$ServerBin  = Join-Path $LlamaDir "llama-server.exe"
$LogsDir    = Join-Path $RepoRoot "logs"

if (-not (Test-Path $LogsDir)) { New-Item -Path $LogsDir -ItemType Directory -Force | Out-Null }

function Stop-LlamaEngine {
    param([int]$TargetPort)
    Write-Host "[SOTA VULKAN] Verificando processos ativos na porta $TargetPort..." -ForegroundColor Cyan
    $procs = Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue
    if ($procs) {
        foreach ($conn in $procs) {
            $pidToKill = $conn.OwningProcess
            try {
                $p = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
                if ($p) {
                    if ($p.Path -ne $ServerBin) {
                        throw "Porta $TargetPort pertence a outro servico; PID $pidToKill preservado."
                    }
                    Write-Host "  -> Encerrando PID $pidToKill ($($p.ProcessName))..." -ForegroundColor Yellow
                    Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                }
            } catch { throw }
        }
        Start-Sleep -Seconds 1
        Write-Host "[[OK]] Porta $TargetPort liberada." -ForegroundColor Green
    } else {
        Write-Host "[i] Nenhum processo escutando na porta $TargetPort." -ForegroundColor DarkGray
    }
}

if ($Stop) {
    Stop-LlamaEngine -TargetPort $Port
    exit 0
}

function Resolve-GgufBlob {
    param([string]$Tag)
    if (Test-Path $Tag) { return (Resolve-Path $Tag).Path }

    $tagParts = $Tag -split ":"
    $modelName = $tagParts[0]
    $tagVariant = if ($tagParts.Count -gt 1) { $tagParts[1] } else { "latest" }

    $manifestPath = "$env:USERPROFILE\.ollama\models\manifests\registry.ollama.ai\library\$modelName\$tagVariant"
    if (-not (Test-Path $manifestPath)) {
        $hfRel = $Tag -replace ":", "\" -replace "/", "\"
        $manifestPath = "$env:USERPROFILE\.ollama\models\manifests\$hfRel"
    }

    if (Test-Path $manifestPath) {
        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        $modelLayer = $manifest.layers | Where-Object { $_.mediaType -match "model" }
        $blobSha = $modelLayer.digest -replace "sha256:", "sha256-"
        $blobPath = "$env:USERPROFILE\.ollama\models\blobs\$blobSha"
        if (Test-Path $blobPath) { return $blobPath }
    }
    return $null
}

$ModelPath = Resolve-GgufBlob -Tag $ModelTag
if (-not $ModelPath) {
    Write-Error "[SOTA VULKAN] Blob GGUF para o modelo $ModelTag nao localizado no cache local (~/.ollama/models). Execute: ollama pull $ModelTag"
    exit 1
}

if (-not (Test-Path $ServerBin)) {
    Write-Error "[SOTA VULKAN] Binario compilado nao localizado em: $ServerBin"
    exit 1
}

$StartMutex = New-Object System.Threading.Mutex($false, "Local\NexusLlamaStart-$Port")
$OwnsMutex = $false
try {
try { $OwnsMutex = $StartMutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $OwnsMutex = $true }
if (-not $OwnsMutex) { throw "Outra inicializacao do llama.cpp esta em andamento na porta $Port." }
$Existing = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
if ($Existing.Count -gt 0) {
    $Owner = Get-Process -Id $Existing[0].OwningProcess
    if ($Owner.Path -ne $ServerBin) { throw "Porta $Port ocupada por outro servico; processo preservado." }
    $Health = Invoke-RestMethod "http://127.0.0.1:$Port/health" -TimeoutSec 3
    if ($Health.status -ne 'ok') { throw "llama.cpp existente ainda nao esta pronto." }
    Write-Host "[REUSE] llama.cpp ja ativo na porta $Port (PID $($Owner.Id)); configuracao existente preservada."
    return
}

$env:OMP_NUM_THREADS                   = "$Threads"
$env:GGML_VULKAN_DEVICE                = "0"
$env:GGML_VK_FORCE_MAX_ALLOCATION_SIZE = "4294967296"
$env:HSA_OVERRIDE_GFX_VERSION          = "8.0.3"

$ServerArgs = @(
    "-m",               "`"$ModelPath`"",
    "-ngl",             "$GpuLayers",
    "-c",               "$ContextWindow",
    "-np",              "1",
    "-t",               "$Threads",
    "-tb",              "$Threads",
    "-b",               "256",
    "-ub",              "128",
    "--cache-type-k",   "q8_0",
    "--cache-type-v",   "f16",
    "--cache-ram",      "0",
    "--sleep-idle-seconds", "$IdleSeconds",
    "--temp",           "0.0",
    "--top-p",          "0.95",
    "--repeat-penalty", "1.05",
    "--host",           "127.0.0.1",
    "--port",           "$Port",
    "--cont-batching",
    "--flash-attn",     "off",
    "--jinja",
    "--metrics"
)

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " SOTA VULKAN ENGINE - LLAMA.CPP DAEMON NATIVO (PORTA $Port)" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  Modelo     : $ModelTag" -ForegroundColor DarkGray
Write-Host "  Blob GGUF  : $ModelPath" -ForegroundColor DarkGray
Write-Host "  Contexto   : $ContextWindow tokens | KV: q8_0/f16 | GPU layers: $GpuLayers | Threads: $Threads | Idle: ${IdleSeconds}s" -ForegroundColor DarkGray
Write-Host "  Endpoint   : http://127.0.0.1:$Port/v1" -ForegroundColor DarkGray
Write-Host "================================================================================`n" -ForegroundColor Cyan

if ($Background) {
    $Proc = Start-Process -FilePath $ServerBin -ArgumentList $ServerArgs -WorkingDirectory $LlamaDir -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $LogsDir "llama-$Port.stdout.log") `
        -RedirectStandardError (Join-Path $LogsDir "llama-$Port.stderr.log")
    $Proc.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::BelowNormal

    Write-Host "[[OK]] Servidor Vulkan iniciado em segundo plano (PID: $($Proc.Id))." -ForegroundColor Green
    Write-Host "    Aguardando aquecimento do endpoint..." -NoNewline

    $Ready = $false
    for ($i = 0; $i -lt 120; $i++) {
        Start-Sleep -Seconds 1
        if ($Proc.HasExited) { throw "llama.cpp encerrou; consulte logs/llama-$Port.stderr.log." }
        try {
            $h = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -Method Get -TimeoutSec 1
            if ($h.status -eq "ok") {
                $Ready = $true
                Write-Host " PRONTO! (Status: $($h.status))`n" -ForegroundColor Green
                break
            }
        } catch {}
    }
    if (-not $Ready) {
        Stop-Process -Id $Proc.Id -ErrorAction SilentlyContinue
        throw "llama.cpp nao ficou pronto em 120 segundos; consulte o log."
    }
} else {
    Set-Location $LlamaDir
    & $ServerBin $ServerArgs
}
} finally {
    if ($OwnsMutex) { $StartMutex.ReleaseMutex() }
    $StartMutex.Dispose()
}
