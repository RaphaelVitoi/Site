# ==============================================================================
# NEXUS CORE - LLAMA-SERVER HIGH-THROUGHPUT / ULTRA-LOW LATENCY DAEMON
# Arquivo: engine/llama_cpp/start_vulkan_daemon.ps1
# Target: Vulkan / CUDA Engine (Port 8080) - Chico SOTA v8.0 GOLD
# ==============================================================================

param (
    [string]$ModelPath = "",
    [int]$Port = 8080,
    [string]$Host = "127.0.0.1",
    [int]$CtxSize = 8192,
    [int]$Slots = 4,              # Paralelismo de agentes (Continuous Batching)
    [int]$PhysicalCores = 8,      # Threads dedicadas a P-Cores
    [string]$KVCacheType = "q8_0" # Quantização de KV Cache (q8_0 ou q4_0)
)

$ErrorActionPreference = "Stop"

# 1. Resolução e Validação de Binários e Modelos
$LlamaBin = Join-Path $PSScriptRoot "llama-server.exe"
if (-not (Test-Path $LlamaBin)) {
    $LlamaBin = "llama-server.exe" # Fallback para PATH
}

# SOTA: Auto-resolução do blob GGUF caso o caminho relativo não exista diretamente
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
    Write-Error "[FATAL] Modelo não encontrado no caminho: $ModelPath"
    exit 1
}

# 2. Definição de Parâmetros de Inferência e Otimização de Kernel
$BatchSize = 512       # Batch para prefill lógico
$UbatchSize = 512      # Micro-batching para saturação de VRAM/Vulkan

$Arguments = @(
    # --- Configuração de Rede e Endpoints ---
    "--host", $Host,
    "--port", $Port,

    # --- Carregamento de Modelo e Memória ---
    "-m", "`"$ModelPath`"",
    "--mlock",                  # Bloqueia tensores na RAM física (evita swap paging)
    "-ngl", "99",               # Offload total de camadas para VRAM / GPU

    # --- Otimização de Contexto e KV Cache ---
    "-c", $CtxSize,             # Context window total
    "-ctk", $KVCacheType,       # Quantização de chaves do KV Cache
    "-ctv", $KVCacheType,       # Quantização de valores do KV Cache

    # --- Continuous Batching & Multi-Agent Slots ---
    "-np", $Slots,              # Número de slots independentes simultâneos
    "--cont-batching",          # Escalonamento contínuo de tarefas pendentes
    "-b", $BatchSize,
    "-ub", $UbatchSize,

    # --- Reutilização e Cache de Prefixo ---
    "--prompt-cache-all",       # Cacheia tensores de prompts em todos os slots

    # --- Afinidade de Hardware e Execução ---
    "-t", $PhysicalCores,       # Threads ativas de processamento
    "-tb", $PhysicalCores       # Threads dedicadas ao processamento de batch
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  NEXUS CORE: INICIALIZANDO DAEMON VULKAN / LLAMA-SERVER" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Endpoint:       http://${Host}:${Port}"
Write-Host "Modelo:         $ModelPath"
Write-Host "Slots Concor.:  $Slots (Continuous Batching Ativo)"
Write-Host "KV Cache Type:  $KVCacheType"
Write-Host "Memory Lock:    Habilitado (--mlock)"
Write-Host "============================================================" -ForegroundColor Cyan

# 3. Inicialização com Prioridade de Processo Alta
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
