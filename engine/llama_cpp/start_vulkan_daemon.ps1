# ==============================================================================
# NEXUS CORE - LLAMA-SERVER 1.0 (b12387) HIGH-THROUGHPUT DAEMON
# Arquivo: engine/llama_cpp/start_vulkan_daemon.ps1
# Target: Vulkan0 (RX 570) - Chico SOTA v8.0 GOLD
# ==============================================================================

param (
    [string]$ModelPath = "",
    [int]$Port = 9931,
    [string]$ListenHost = "127.0.0.1",
    [int]$CtxSize = 32768,
    [int]$Slots = 2,              # Paralelismo de agentes (Continuous Batching)
    [int]$PhysicalCores = 8,      # Threads dedicadas a P-Cores
    [string]$KVCacheType = "q8_0", # Quantizacao de KV Cache K (q8_0 ou q4_0)
    [string]$KVCacheTypeV = "q4_0", # Quantizacao de KV Cache V (q4_0)
    [string]$Device = "Vulkan0",
    [switch]$RouterMode = $true,
    [switch]$UseMlock
)

$ErrorActionPreference = "Stop"

# 1. Resolucao e Validacao de Binarios
$LlamaBin = Join-Path $PSScriptRoot "llama-server.exe"
if (-not (Test-Path $LlamaBin)) {
    $LlamaBin = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps\llama-server.exe"
}
if (-not (Test-Path $LlamaBin)) {
    $LlamaBin = "llama-server.exe" # Fallback para PATH
}

$IsRouter = ($RouterMode -and [string]::IsNullOrWhiteSpace($ModelPath))

if ($IsRouter) {
    $ModelsDir = Join-Path $env:USERPROFILE ".llama\models"
    $PresetsIni = Join-Path $env:USERPROFILE ".llama\model-context-presets.ini"
    if (-not (Test-Path $ModelsDir)) {
        New-Item -ItemType Directory -Path $ModelsDir -Force | Out-Null
    }
    $Arguments = [System.Collections.Generic.List[string]]@(
        "--host", $ListenHost,
        "--port", "$Port",
        "--cors-origins", "localhost",
        "--jinja",
        "--models-dir", "`"$ModelsDir`"",
        "--models-max", "1",
        "--models-memory-margin", "512",
        "--sleep-idle-seconds", "1800",
        "-c", "$CtxSize",
        "-np", "$Slots",
        "-t", "$PhysicalCores",
        "-b", "2048",
        "-ub", "512",
        "--cache-reuse", "256",
        "--cache-ram", "4096",
        "-ctk", $KVCacheType,
        "-ctv", $KVCacheTypeV,
        "--device", $Device,
        "--flash-attn", "on",
        "--fit", "on",
        "--fit-target", "512",
        "--metrics",
        "--props"
    )
    if (Test-Path $PresetsIni) {
        $Arguments.Add("--models-preset")
        $Arguments.Add("`"$PresetsIni`"")
    }
    $ModeSummary = "Router Nativo (:9931, models-max=1)"
} else {
    # Resolucao automatica do blob Ollama caso ModelPath nao tenha sido explicitado
    if ([string]::IsNullOrWhiteSpace($ModelPath) -or -not (Test-Path $ModelPath)) {
        $manifestPath = "$env:USERPROFILE\.ollama\models\manifests\registry.ollama.ai\library\qwen2.5-coder\7b-instruct-q5_K_M"
        if (Test-Path $manifestPath) {
            $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
            $modelLayer = $manifest.layers | Where-Object { $_.mediaType -match "model" }
            $blobSha = $modelLayer.digest -replace "sha256:", "sha256-"
            $resolvedBlob = "$env:USERPROFILE\.ollama\models\blobs\$blobSha"
            if (Test-Path $resolvedBlob) { $ModelPath = $resolvedBlob }
        }
    }

    if (-not (Test-Path $ModelPath)) {
        Write-Error "[FATAL] Modelo nao encontrado no caminho: $ModelPath"
        exit 1
    }

    $BatchSize = 2048      # Batch para prefill logico (medido via llama-bench)
    $UbatchSize = 512      # Micro-batching para saturacao de VRAM/Vulkan

    $Arguments = [System.Collections.Generic.List[string]]@(
        "--host", $ListenHost,
        "--port", "$Port",
        "--cors-origins", "localhost",
        "--jinja",
        "-m", "`"$ModelPath`"",
        "-ngl", "99",
        "--device", $Device,
        "--flash-attn", "on",
        "--fit", "on",
        "--fit-target", "512",
        "-c", "$CtxSize",
        "-ctk", $KVCacheType,
        "-ctv", $KVCacheTypeV,
        "-np", "$Slots",
        "--cont-batching",
        "-b", "$BatchSize",
        "-ub", "$UbatchSize",
        "--cache-reuse", "256",
        "--cache-ram", "4096",
        "-t", "$PhysicalCores",
        "-tb", "$PhysicalCores",
        "--metrics",
        "--props"
    )
    if ($UseMlock) {
        $Arguments.Add("--mlock")
    }
    $ModeSummary = "Standalone ($ModelPath)"
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  NEXUS CORE: LLAMA-SERVER 1.0 (b12387) VULKAN DAEMON" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Endpoint:       http://${ListenHost}:${Port}"
Write-Host "Binario:        $LlamaBin"
Write-Host "Modo:           $ModeSummary"
Write-Host "Device / Fit:   $Device | --flash-attn on | --fit on"
Write-Host "KV Cache Type:  $KVCacheType"
Write-Host "============================================================" -ForegroundColor Cyan

# 3. Inicializacao com Prioridade de Processo Alta
$ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
$ProcessInfo.FileName = $LlamaBin
$ProcessInfo.Arguments = ($Arguments -join " ")
$ProcessInfo.WorkingDirectory = $PSScriptRoot
$ProcessInfo.UseShellExecute = $false
$ProcessInfo.RedirectStandardOutput = $false
$ProcessInfo.RedirectStandardError = $false

$Process = [System.Diagnostics.Process]::Start($ProcessInfo)
$Process.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High

$Process.WaitForExit()
