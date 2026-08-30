<#
.SYNOPSIS
    Orquestrador Nativo SOTA do llama-server Vulkan (AMD RX 570 8GB + Intel i9-9900K).
.DESCRIPTION
    Inicializa o binario pre-compilado em engine/llama_cpp/llama-server.exe com aceleracao
    Vulkan completa, alocacao de KV Cache q4_0, continuous batching deterministico (-np 1),
    renderizacao Jinja de Tool Schemas e amarracao direta aos blobs GGUF locais.
#>
[CmdletBinding()]
param (
    [int]$Port = 8080,
    [int]$ContextWindow = 16384,
    [string]$ModelTag = "qwen2.5-coder:7b-instruct-q5_K_M",
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
$StdoutLog  = Join-Path $LogsDir "llama_vulkan_stdout.log"
$StderrLog  = Join-Path $LogsDir "llama_vulkan_stderr.log"

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
                    Write-Host "  -> Encerrando PID $pidToKill ($($p.ProcessName))..." -ForegroundColor Yellow
                    Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                }
            } catch {}
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

Stop-LlamaEngine -TargetPort $Port

$env:OMP_NUM_THREADS                   = "8"
$env:GGML_VULKAN_DEVICE                = "0"
$env:GGML_VK_FORCE_MAX_ALLOCATION_SIZE = "4294967296"
$env:HSA_OVERRIDE_GFX_VERSION          = "8.0.3"

$ServerArgs = @(
    "-m",               "`"$ModelPath`"",
    "-ngl",             "33",
    "-c",               "$ContextWindow",
    "-np",              "1",
    "-t",               "8",
    "-tb",              "8",
    "--cache-type-k",   "q4_0",
    "--cache-type-v",   "q4_0",
    "--prompt-cache-all",
    "--lookup-cache",
    "--mlock",
    "--temp",           "0.0",
    "--top-p",          "0.95",
    "--repeat-penalty", "1.05",
    "--host",           "127.0.0.1",
    "--port",           "$Port",
    "--cont-batching",
    "--flash-attn",     "0",
    "--jinja",
    "--chat-template",  "qwen2",
    "--metrics"
)

Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host " SOTA VULKAN ENGINE - LLAMA.CPP DAEMON NATIVO (PORTA $Port)" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  Modelo     : $ModelTag" -ForegroundColor DarkGray
Write-Host "  Blob GGUF  : $ModelPath" -ForegroundColor DarkGray
Write-Host "  Contexto   : $ContextWindow tokens | KV Cache: q4_0 | Offload: 33/33 camadas" -ForegroundColor DarkGray
Write-Host "  Endpoint   : http://127.0.0.1:$Port/v1" -ForegroundColor DarkGray
Write-Host "================================================================================`n" -ForegroundColor Cyan

if ($Background) {
    $ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
    $ProcessInfo.FileName = $ServerBin
    $ProcessInfo.Arguments = ($ServerArgs -join " ")
    $ProcessInfo.WorkingDirectory = $LlamaDir
    $ProcessInfo.UseShellExecute = $false
    $ProcessInfo.CreateNoWindow = $true

    $Proc = [System.Diagnostics.Process]::Start($ProcessInfo)

    Write-Host "[[OK]] Servidor Vulkan iniciado em segundo plano (PID: $($Proc.Id))." -ForegroundColor Green
    Write-Host "    Aguardando aquecimento do endpoint..." -NoNewline

    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep -Seconds 1
        try {
            $h = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -Method Get -TimeoutSec 1
            if ($h.status -eq "ok" -or $h.status -eq "loading") {
                Write-Host " PRONTO! (Status: $($h.status))`n" -ForegroundColor Green
                break
            }
        } catch {}
    }
} else {
    Set-Location $LlamaDir
    & $ServerBin $ServerArgs
}
