<#
.SYNOPSIS
    Launcher SOTA do llama.cpp Vulkan para a RX 570 Polaris (gfx803, 8GB).

.DESCRIPTION
    Sobe `llama-server` (build oficial win-vulkan-x64, tools/llama.cpp)
    com as flags medidas para Polaris + MoE offload (runbook 2026-11-11):

      - GGML_VK_ALLOW_GRAPHICS_QUEUE=1  (workaround gfx803; inofensivo em
        builds novos, necessario em antigos)
      - -ngl 99 -fa on                 (offload total; FA obrigatorio p/ KV quant)
      - -ctk q8_0 -ctv q4_0            (KV cache ~59% menor, ~lossless;
                                        NUNCA q4_0 em keys)
      - --jinja --fit on -c 32768      (fit auto-ajusta o que nao cabe)
      - -t 8                            (cores fisicos do i9-9900K; HT prejudica)

    MoE (ex.: Qwen3.6-35B-A3B ~22GB, MEDIDO 2026-11-12 na RX 570):
      '--n-cpu-moe','41'  (todos os experts na RAM; offload parcial de
        experts na GPU foi MAIS LENTO: ncmoe35=5.41 t/s vs ncmoe41=6.72)
      '--spec-type','draft-mtp','--spec-draft-n-max','4','--spec-draft-p-min','0.75'
        -> 13.45 t/s geracao (~2x), ~94% draft acceptance. Requer GGUF
        com head nextn/MTP (ex.: unsloth/*-MTP-GGUF) e -np 1.
      --moe-cache-mib MEDIDO CONTRAPRODUCENTE na Polaris: 7.5 t/s com
        cache 3072 vs 13.0 sem. Nao usar neste hardware.
      -t 12 medido igual/pior que -t 8 (HT nao ajuda, e bandwidth-bound).

    Referencia medida em hardware identico (RX 580 8GB + DDR4):
    ~16 t/s tg com --n-cpu-moe 30; expectativa 20-30 t/s com moe-cache
    quente + draft-mtp. GPU e vista nativamente via Vulkan (sem patch).

    Binarios vivem FORA do repo em ~/.gemini/tools/llama.cpp. Modelos:
    blobs Ollama (~/.ollama/models/blobs/sha256-*) sao GGUF utilizaveis,
    ou .gguf do Hugging Face em ~/.gemini/models/gguf/.

.PARAMETER ModelPath  Caminho do .gguf.
.PARAMETER Port        Porta do llama-server (default 9931; Ollama=11434).
.PARAMETER ExtraArgs  Argumentos adicionais ao llama-server.

.EXAMPLE
    # Vencedor medido: Qwen3.6-35B-A3B-MTP -> 13.45 t/s na RX 570
    .\Start-LlamaVulkan.ps1 -ModelPath "$env:USERPROFILE\.gemini\models\gguf\Qwen3.6-35B-A3B-MTP-UD-Q4_K_XL.gguf" `
        -ExtraArgs '-ncmoe','41','--spec-type','draft-mtp','--spec-draft-n-max','4','--spec-draft-p-min','0.75','-np','1','-c','8192'
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ModelPath,

    [int]$Port = 9931,

    [string[]]$ExtraArgs = @()
)

$ErrorActionPreference = 'Stop'

$LlamaDir = Join-Path $env:USERPROFILE '.gemini\tools\llama.cpp'
$ServerExe = Join-Path $LlamaDir 'llama-server.exe'

if (-not (Test-Path $ServerExe)) {
    throw "llama-server.exe nao encontrado em $ServerExe. Baixe o asset llama-bNNNNN-bin-win-vulkan-x64.zip do release mais recente e extraia em $LlamaDir."
}
if (-not (Test-Path $ModelPath)) {
    throw "Modelo nao encontrado: $ModelPath"
}

$env:GGML_VK_ALLOW_GRAPHICS_QUEUE = '1'

$serverArgs = @(
    '-m', $ModelPath,
    '--host', '127.0.0.1',
    '--port', "$Port",
    '-ngl', '99',
    '-fa', 'on',
    '-ctk', 'q8_0',
    '-ctv', 'q4_0',
    '--jinja',
    '--fit', 'on',
    '-c', '32768',
    '-t', '8'
) + $ExtraArgs

Write-Host "[llama-vulkan] RX 570 8GB | modelo: $(Split-Path $ModelPath -Leaf)" -ForegroundColor Cyan
Write-Host "[llama-vulkan] args: $($serverArgs -join ' ')" -ForegroundColor DarkGray

& $ServerExe @serverArgs
