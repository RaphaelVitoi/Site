<#
.SYNOPSIS
    Gerenciador Operacional dos Modelos Locais via llama.cpp (Vulkan / CPU)
    Modelos:
      - AI9Stars G9v3-3B (Tool Calling & Fast Operations) -> Porta 8081
      - Ling-3.0-tiny MoE (Sintese Confiavel & Portugues BR) -> Porta 8082

.DESCRIPTION
    Script operacional para iniciar, monitorar e parar instancias do llama-server
    em conformidade com o Protocolo Chico SOTA v8.0 Gold e as descobertas
    empiricas de estabilidade (modo de raciocinio desligado, contexto delimitado).

.PARAMETER Model
    Qual modelo iniciar: 'G9v3', 'Ling3' ou 'Both'. Padrao: 'G9v3'.

.PARAMETER Action
    Acao a executar: 'Start', 'Stop', 'Status'. Padrao: 'Start'.

.PARAMETER PortG9
    Porta HTTP para o G9v3-3B. Padrao: 8081.

.PARAMETER PortLing
    Porta HTTP para o Ling-3.0-tiny. Padrao: 8082.
#>

[CmdletBinding()]
param(
    [ValidateSet('G9v3', 'Ling3', 'Both')]
    [string]$Model = 'G9v3',

    [ValidateSet('Start', 'Stop', 'Status')]
    [string]$Action = 'Start',

    [int]$PortG9 = 8081,
    [int]$PortLing = 8082
)

$ErrorActionPreference = 'Stop'

# Caminhos canonicos
$ModelsDir = 'C:\Users\rapha\models\gguf'
$G9ModelPath = Join-Path $ModelsDir 'ai9stars_G9v3-3B-Q4_K_M.gguf'
$LingModelPath = Join-Path $ModelsDir 'Ling-3.0-tiny-Q4_K_M.gguf'

# Localizacao do binario do llama-server
$LlamaServerBin = $null
$WinGetLlama = 'C:\Users\rapha\AppData\Local\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.EXE'

if (Test-Path $WinGetLlama) {
    $LlamaServerBin = $WinGetLlama
} else {
    $Cmd = Get-Command 'llama-server' -ErrorAction SilentlyContinue
    if ($Cmd) { $LlamaServerBin = $Cmd.Source }
}

if (-not $LlamaServerBin) {
    Write-Error "[FALHA CRITICA] llama-server.EXE nao foi localizado no sistema."
    exit 1
}

function Test-LlamaHealth([int]$Port) {
    try {
        $resp = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        return ($resp.status -eq 'ok' -or $resp.status -eq 'loading model')
    } catch {
        return $false
    }
}

function Stop-LlamaProcess([int]$Port) {
    Write-Host "[OPS] Encerrando processos na porta $Port..." -ForegroundColor Yellow
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        $pidToKill = $conn.OwningProcess
        if ($pidToKill -gt 0) {
            try {
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                Write-Host "  -> Processo $pidToKill finalizado." -ForegroundColor Green
            } catch {
                Write-Warning "  -> Nao foi possivel finalizar PID $pidToKill."
            }
        }
    }
}

function Show-Status {
    Write-Host "`n=== STATUS DOS MODELOS LOCAIS LLAMA.CPP ===" -ForegroundColor Cyan
    
    # G9v3
    $g9Online = Test-LlamaHealth $PortG9
    $g9Color = if ($g9Online) { 'Green' } else { 'DarkGray' }
    Write-Host "1. AI9Stars G9v3-3B (Porta $PortG9): " -NoNewline
    Write-Host (if ($g9Online) { 'ONLINE (Disponivel)' } else { 'OFFLINE' }) -ForegroundColor $g9Color
    Write-Host "   Arquivo: $G9ModelPath"
    Write-Host "   Existe em disco: $(Test-Path $G9ModelPath)"

    # Ling 3.0
    $lingOnline = Test-LlamaHealth $PortLing
    $lingColor = if ($lingOnline) { 'Green' } else { 'DarkGray' }
    Write-Host "`n2. Ling-3.0-tiny MoE (Porta $PortLing): " -NoNewline
    Write-Host (if ($lingOnline) { 'ONLINE (Disponivel)' } else { 'OFFLINE' }) -ForegroundColor $lingColor
    Write-Host "   Arquivo: $LingModelPath"
    Write-Host "   Existe em disco: $(Test-Path $LingModelPath)"
    Write-Host "===========================================`n"
}

if ($Action -eq 'Status') {
    Show-Status
    exit 0
}

if ($Action -eq 'Stop') {
    if ($Model -in @('G9v3', 'Both')) { Stop-LlamaProcess $PortG9 }
    if ($Model -in @('Ling3', 'Both')) { Stop-LlamaProcess $PortLing }
    Show-Status
    exit 0
}

# --- ACAO START ---
Write-Host "`n[START] Iniciando servicos locais com llama.cpp..." -ForegroundColor Cyan

# 1. Iniciar G9v3-3B se solicitado
if ($Model -in @('G9v3', 'Both')) {
    if (-not (Test-Path $G9ModelPath)) {
        Write-Error "[ERRO] Arquivo do G9v3 nao encontrado em $G9ModelPath. Conclua o download antes de iniciar."
        exit 1
    }

    if (Test-LlamaHealth $PortG9) {
        Write-Host "[G9v3] Ja esta ONLINE e respondendo na porta $PortG9." -ForegroundColor Green
    } else {
        Write-Host "[G9v3] Lancando llama-server na porta $PortG9 (Vulkan0, 8GB VRAM RX 570, Raciocinio Desligado)..." -ForegroundColor Yellow
        
        # Parametros otimizados para AMD Radeon RX 570 8GB:
        # -dev Vulkan0: usa a RX 570 (8192 MiB VRAM total)
        # -ngl 99: offload total - modelo denso 3B Q4_K_M (1.77GB) cabe com ~6GB de folga
        # -c 16384: contexto de 16k tokens - com 8GB de VRAM ha espaco para KV cache maior
        # --reasoning off / --reasoning-format none: impede desistencia silenciosa em multi-step
        # -fa auto: Flash Attention ativo
        $argsG9 = @(
            "-m", "`"$G9ModelPath`"",
            "--host", "127.0.0.1",
            "--port", "$PortG9",
            "-dev", "Vulkan0",
            "-ngl", "99",
            "-c", "16384",
            "-fa", "auto",
            "--reasoning", "off",
            "--reasoning-format", "none",
            "-np", "1"
        )
        
        $procG9 = Start-Process -FilePath $LlamaServerBin -ArgumentList $argsG9 -PassThru -WindowStyle Hidden
        Write-Host "  -> Processo G9v3 iniciado (PID $($procG9.Id)). Aguardando warmup..."
        
        $attempts = 0
        while ($attempts -lt 20) {
            Start-Sleep -Seconds 1
            if (Test-LlamaHealth $PortG9) {
                Write-Host "  [OK] AI9Stars G9v3-3B esta ONLINE em http://127.0.0.1:$PortG9/v1" -ForegroundColor Green
                break
            }
            $attempts++
        }
        if ($attempts -ge 20) {
            Write-Warning "  [TIMEOUT] O servidor G9v3 demorou para responder. Verifique os logs."
        }
    }
}

# 2. Iniciar Ling-3.0-tiny se solicitado
if ($Model -in @('Ling3', 'Both')) {
    if (-not (Test-Path $LingModelPath)) {
        Write-Error "[ERRO] Arquivo do Ling-3.0 nao encontrado em $LingModelPath. Conclua o download antes de iniciar."
        exit 1
    }

    if (Test-LlamaHealth $PortLing) {
        Write-Host "[Ling3] Ja esta ONLINE e respondendo na porta $PortLing." -ForegroundColor Green
    } else {
        Write-Host "[Ling3] Lancando llama-server na porta $PortLing (Vulkan0, 8GB VRAM RX 570, Raciocinio Desligado)..." -ForegroundColor Yellow
        
        # Parametros otimizados para MoE de 4.49GB em GPU de 8GB + 32GB RAM:
        # -dev Vulkan0: aceleracao grafica com offload majoritario
        # -ngl 40: offload de ~40 camadas (~3.5GB) para a VRAM, restante no RAM (32GB)
        #   -> modelo 4.49GB + KV cache ~1.5GB = ~5-6GB total na GPU, dentro dos 8GB
        # -c 16384: contexto de 16k - VRAM comporta KV cache maior com o offload parcial
        # --reasoning off: garante taxa de conclusao de 10/10 nas cadeias de multiplos passos
        $argsLing = @(
            "-m", "`"$LingModelPath`"",
            "--host", "127.0.0.1",
            "--port", "$PortLing",
            "-dev", "Vulkan0",
            "-ngl", "40",
            "-c", "16384",
            "-fa", "auto",
            "--reasoning", "off",
            "--reasoning-format", "none",
            "-np", "1"
        )
        
        $procLing = Start-Process -FilePath $LlamaServerBin -ArgumentList $argsLing -PassThru -WindowStyle Hidden
        Write-Host "  -> Processo Ling3 iniciado (PID $($procLing.Id)). Aguardando warmup..."
        
        $attempts = 0
        while ($attempts -lt 25) {
            Start-Sleep -Seconds 1
            if (Test-LlamaHealth $PortLing) {
                Write-Host "  [OK] Ling-3.0-tiny esta ONLINE em http://127.0.0.1:$PortLing/v1" -ForegroundColor Green
                break
            }
            $attempts++
        }
        if ($attempts -ge 25) {
            Write-Warning "  [TIMEOUT] O servidor Ling-3 demorou para responder. Verifique os logs."
        }
    }
}

Show-Status
