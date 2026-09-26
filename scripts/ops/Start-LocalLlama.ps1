<#
.SYNOPSIS
    Gerenciador Operacional dos Modelos Locais via llama.cpp (Vulkan / CPU)
    Modelos:
      - AI9Stars G9v3-3B (Tool Calling & Fast Operations) -> Porta 8081
      - Ling-3.0-tiny MoE (Sintese Confiavel & Portugues BR) -> Porta 8082
      - Qwen2.5-Coder-1.5B (Engenharia de Codigo & Linting Q8_0) -> Porta 8083

.DESCRIPTION
    Script operacional para iniciar, monitorar e parar instancias do llama-server
    em conformidade com o Protocolo Chico SOTA v8.0 Gold e as descobertas
    empiricas de estabilidade (modo de raciocinio desligado, contexto delimitado).

.PARAMETER Model
    Qual modelo iniciar: 'G9v3', 'Ling3', 'QwenCoder', 'Duo' (G9v3+Qwen) ou 'All'. Padrao: 'Duo'.

.PARAMETER Action
    Acao a executar: 'Start', 'Stop', 'Status'. Padrao: 'Start'.

.PARAMETER PortG9
    Porta HTTP para o G9v3-3B. Padrao: 8081.

.PARAMETER PortLing
    Porta HTTP para o Ling-3.0-tiny. Padrao: 8082.

.PARAMETER PortQwen
    Porta HTTP para o Qwen2.5-Coder-1.5B. Padrao: 8083.
#>

[CmdletBinding()]
param(
    [ValidateSet('G9v3', 'Ling3', 'QwenCoder', 'Duo', 'All')]
    [string]$Model = 'Duo',

    [ValidateSet('Start', 'Stop', 'Status')]
    [string]$Action = 'Start',

    [int]$PortG9 = 8081,
    [int]$PortLing = 8082,
    [int]$PortQwen = 8083
)

$ErrorActionPreference = 'Stop'

# Caminhos canonicos
$ModelsDir = 'C:\Users\rapha\models\gguf'
$G9ModelPath = Join-Path $ModelsDir 'ai9stars_G9v3-3B-Q4_K_M.gguf'
$LingModelPath = Join-Path $ModelsDir 'Ling-3.0-tiny-Q4_K_M.gguf'
$QwenModelPath = Join-Path $ModelsDir 'qwen2.5-coder-1.5b-q8_0.gguf'

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

    # Qwen 2.5 Coder
    $qwenOnline = Test-LlamaHealth $PortQwen
    $qwenColor = if ($qwenOnline) { 'Green' } else { 'DarkGray' }
    Write-Host "`n3. Qwen2.5-Coder-1.5B Q8_0 (Porta $PortQwen): " -NoNewline
    Write-Host (if ($qwenOnline) { 'ONLINE (Disponivel)' } else { 'OFFLINE' }) -ForegroundColor $qwenColor
    Write-Host "   Arquivo: $QwenModelPath"
    Write-Host "   Existe em disco: $(Test-Path $QwenModelPath)"
    Write-Host "===========================================`n"
}

if ($Action -eq 'Status') {
    Show-Status
    exit 0
}

if ($Action -eq 'Stop') {
    if ($Model -in @('G9v3', 'Duo', 'All')) { Stop-LlamaProcess $PortG9 }
    if ($Model -in @('Ling3', 'All')) { Stop-LlamaProcess $PortLing }
    if ($Model -in @('QwenCoder', 'Duo', 'All')) { Stop-LlamaProcess $PortQwen }
    Show-Status
    exit 0
}

# --- ACAO START ---
Write-Host "`n[START] Iniciando servicos locais com llama.cpp..." -ForegroundColor Cyan

# 1. Iniciar G9v3-3B se solicitado
if ($Model -in @('G9v3', 'Duo', 'All')) {
    if (-not (Test-Path $G9ModelPath)) {
        Write-Error "[ERRO] Arquivo do G9v3 nao encontrado em $G9ModelPath."
        exit 1
    }

    if (Test-LlamaHealth $PortG9) {
        Write-Host "[G9v3] Ja esta ONLINE e respondendo na porta $PortG9." -ForegroundColor Green
    } else {
        Write-Host "[G9v3] Lancando llama-server na porta $PortG9 (Vulkan0, 8GB VRAM RX 570, Raciocinio Desligado)..." -ForegroundColor Yellow
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
    }
}

# 2. Iniciar Ling-3.0-tiny se solicitado
if ($Model -in @('Ling3', 'All')) {
    if (-not (Test-Path $LingModelPath)) {
        Write-Error "[ERRO] Arquivo do Ling-3.0 nao encontrado em $LingModelPath."
        exit 1
    }

    if (Test-LlamaHealth $PortLing) {
        Write-Host "[Ling3] Ja esta ONLINE e respondendo na porta $PortLing." -ForegroundColor Green
    } else {
        Write-Host "[Ling3] Lancando llama-server na porta $PortLing (Vulkan0, 8GB VRAM RX 570, Raciocinio Desligado)..." -ForegroundColor Yellow
        $argsLing = @(
            "-m", "`"$LingModelPath`"",
            "--host", "127.0.0.1",
            "--port", "$PortLing",
            "-dev", "Vulkan0",
            "-ngl", "32",
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
    }
}

# 3. Iniciar Qwen2.5-Coder-1.5B se solicitado
if ($Model -in @('QwenCoder', 'Duo', 'All')) {
    if (-not (Test-Path $QwenModelPath)) {
        Write-Error "[ERRO] Arquivo do Qwen2.5-Coder nao encontrado em $QwenModelPath."
        exit 1
    }

    if (Test-LlamaHealth $PortQwen) {
        Write-Host "[QwenCoder] Ja esta ONLINE e respondendo na porta $PortQwen." -ForegroundColor Green
    } else {
        Write-Host "[QwenCoder] Lancando llama-server na porta $PortQwen (Vulkan0, 8GB VRAM RX 570, Codigo Q8_0)..." -ForegroundColor Yellow
        $argsQwen = @(
            "-m", "`"$QwenModelPath`"",
            "--host", "127.0.0.1",
            "--port", "$PortQwen",
            "-dev", "Vulkan0",
            "-ngl", "99",
            "-c", "16384",
            "-fa", "auto",
            "-np", "1"
        )
        $procQwen = Start-Process -FilePath $LlamaServerBin -ArgumentList $argsQwen -PassThru -WindowStyle Hidden
        Write-Host "  -> Processo QwenCoder iniciado (PID $($procQwen.Id)). Aguardando warmup..."
        $attempts = 0
        while ($attempts -lt 20) {
            Start-Sleep -Seconds 1
            if (Test-LlamaHealth $PortQwen) {
                Write-Host "  [OK] Qwen2.5-Coder-1.5B esta ONLINE em http://127.0.0.1:$PortQwen/v1" -ForegroundColor Green
                break
            }
            $attempts++
        }
    }
}

Show-Status
