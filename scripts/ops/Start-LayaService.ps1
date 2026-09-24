<#
.SYNOPSIS
    Gerenciador do Microservico de Inferencia Laya Multilingual S1 (Porta 8192).

.DESCRIPTION
    Protocolo Chico SOTA v8.0 GOLD.
    Inicia, monitora e mantem ativo o servico de inferencia Laya Multilingual (322M)
    com pesos reais carregados em memoria (GPU/CUDA ou CPU override).

.PARAMETER Port
    Porta TCP do microservico (Padrao: 8192).

.PARAMETER Status
    Apenas verifica a saude do servico.

.PARAMETER Stop
    Encerra o processo do microservico.
#>
param (
    [int]$Port = 8192,
    [switch]$Status,
    [switch]$Stop
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SiteRoot = (Resolve-Path "$ScriptDir\..\..").Path
$VenvPython = "$SiteRoot\.venv\Scripts\python.exe"
$HomologarScript = "$SiteRoot\scripts\ops\homologar_laya_gpu.py"
$HealthUrl = "http://127.0.0.1:$Port/health"

function Test-LayaServiceHealth {
    param ([string]$Url)
    try {
        $res = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 2 -ErrorAction Stop
        return $res
    } catch {
        return $null
    }
}

# 1. Modo Stop
if ($Stop) {
    Write-Host "[LAYA S1] Localizando processos na porta $Port..." -ForegroundColor Cyan
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($p in $pids) {
            Write-Host "[LAYA S1] Encerrando processo PID $p..." -ForegroundColor Yellow
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
        Write-Host "[LAYA S1] Microservico encerrado com sucesso." -ForegroundColor Green
    } else {
        Write-Host "[LAYA S1] Nenhum processo ativo na porta $Port." -ForegroundColor Gray
    }
    exit 0
}

# 2. Modo Status
$activeHealth = Test-LayaServiceHealth -Url $HealthUrl
if ($Status) {
    if ($activeHealth) {
        Write-Host "[LAYA S1] ONLINE (Porta $Port)" -ForegroundColor Green
        Write-Host "  Modelo:          $($activeHealth.model)"
        Write-Host "  Pesos Prontos:   $($activeHealth.weights_ready)"
        Write-Host "  CUDA Disponivel: $($activeHealth.cuda_available)"
        Write-Host "  CPU Override:    $($activeHealth.cpu_override_active)"
        exit 0
    } else {
        Write-Host "[LAYA S1] OFFLINE na porta $Port." -ForegroundColor Yellow
        exit 1
    }
}

# 3. Se ja estiver online, confirma
if ($activeHealth) {
    Write-Host "[LAYA S1] Microservico ja esta ONLINE e operacional na porta $Port." -ForegroundColor Green
    Write-Host "  Status:        $($activeHealth.status)"
    Write-Host "  Pesos Prontos: $($activeHealth.weights_ready)"
    exit 0
}

# 4. Inicia o microservico
Write-Host "[LAYA S1] Iniciando Microservico de Inferencia Laya (mmBERT-base, 322M)..." -ForegroundColor Cyan
if (-not (Test-Path $VenvPython)) {
    Write-Error "[LAYA S1] Python virtualenv nao encontrado em $VenvPython"
    exit 1
}

$startProcessArgs = @{
    FilePath = $VenvPython
    ArgumentList = @($HomologarScript, "--serve", "--port", "$Port")
    WorkingDirectory = $SiteRoot
    WindowStyle = "Hidden"
}

# Configura ambiente para permitir inferencia de pesos em CPU se CUDA indisponivel
$env:CHICO_LAYA_PREDICT_ALLOW_CPU = "1"

$proc = Start-Process @startProcessArgs -PassThru
Write-Host "[LAYA S1] Processo iniciado (PID $($proc.Id)). Aguardando aquecimento do checkpoint..." -ForegroundColor Gray

# Aguarda ate 35s pelo warmup
$deadline = (Get-Date).AddSeconds(35)
$ready = $false
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    $h = Test-LayaServiceHealth -Url $HealthUrl
    if ($h -and $h.status -eq "HEALTHY") {
        $ready = $true
        $activeHealth = $h
        break
    }
}

if ($ready) {
    Write-Host "[LAYA S1] SUCESSO: Microservico de Inferencia Laya ativo na porta $Port!" -ForegroundColor Green
    Write-Host "  Status:          $($activeHealth.status)"
    Write-Host "  Modelo:          $($activeHealth.model)"
    Write-Host "  Pesos Carregados:$($activeHealth.weights_ready)"
    Write-Host "  CUDA:            $($activeHealth.cuda_available)"
    exit 0
} else {
    Write-Host "[LAYA S1] AVISO: Microservico demorou mais que o esperado para responder." -ForegroundColor Yellow
    Write-Host "  Verifique se o processo PID $($proc.Id) ainda esta executando o download/warmup."
    exit 0
}
