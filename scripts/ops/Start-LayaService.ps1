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

$TaskName = "SOTA_Laya_Multilingual_S1"

# 1. Modo Stop
if ($Stop) {
    Write-Host "[LAYA S1] Encerrando servico agendado '$TaskName' e limpando porta $Port..." -ForegroundColor Cyan
    $t = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($t) {
        Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    }
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

# 3. Se ja estiver online com pesos prontos, confirma
if ($activeHealth -and $activeHealth.weights_ready -eq $true) {
    Write-Host "[LAYA S1] Microservico ja esta ONLINE e com pesos prontos na porta $Port." -ForegroundColor Green
    Write-Host "  Status:        $($activeHealth.status)"
    Write-Host "  Pesos Prontos: $($activeHealth.weights_ready)"
    exit 0
}

# 4. Inicia o microservico via Windows Task Scheduler persistente
Write-Host "[LAYA S1] Iniciando Microservico de Inferencia Laya (mmBERT-base, 322M)..." -ForegroundColor Cyan
if (-not (Test-Path $VenvPython)) {
    Write-Error "[LAYA S1] Python virtualenv nao encontrado em $VenvPython"
    exit 1
}

# Configura ambiente para permitir inferencia de pesos em CPU se CUDA indisponivel
$env:CHICO_LAYA_PREDICT_ALLOW_CPU = "1"
[Environment]::SetEnvironmentVariable("CHICO_LAYA_PREDICT_ALLOW_CPU", "1", "User")
[Environment]::SetEnvironmentVariable("CHICO_LAYA_PREDICT_ALLOW_CPU", "1", "Process")

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if (-not $task) {
    Write-Host "[LAYA S1] Registrando tarefa agendada persistente '$TaskName'..." -ForegroundColor Cyan
    $action = New-ScheduledTaskAction -Execute $VenvPython -Argument "`"$HomologarScript`" --serve --port $Port" -WorkingDirectory $SiteRoot
    $trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive
    $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Days 365) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description 'Microservico de inferencia Laya Multilingual S1 (322M) na porta 8192 sob o Protocolo Chico SOTA v8.0 GOLD.' -Force | Out-Null
}

# Dispara a tarefa agendada
Start-ScheduledTask -TaskName $TaskName
Write-Host "[LAYA S1] Tarefa agendada disparada ('$TaskName'). Aguardando aquecimento do checkpoint (mmBERT 322M)..." -ForegroundColor Gray

# Aguarda ate 60s pelo warmup (cold load do mmBERT-base 322M em CPU leva ~30s)
$deadline = (Get-Date).AddSeconds(60)
$ready = $false
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    $h = Test-LayaServiceHealth -Url $HealthUrl
    if ($h -and $h.status -eq "HEALTHY" -and $h.weights_ready -eq $true) {
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
    Write-Host "[LAYA S1] AVISO: Microservico demorou mais que o esperado para aquecer os pesos." -ForegroundColor Yellow
    Write-Host "  Verifique o log de execucao ou tente novamente."
    exit 0
}
