# =====================================================================
# run_pipeline.ps1 - Automação Completa no Windows / PowerShell 7+
# =====================================================================
[CmdletBinding()]
param (
    [string]$HostUrl = "http://127.0.0.1:8000",
    [int]$Port = 8000,
    [int]$Requests = 60,
    [int]$Concurrency = 10,
    [string]$OutputJson = "benchmark_results.json",
    [string]$OutputPng = "benchmark_latency_report.png",
    [string]$PythonExe = "python",
    [switch]$Simulate,
    [switch]$NoOpen
)

$ErrorActionPreference = "Stop"
$ServerProcess = $null

# 0. Carregamento persistente de variáveis de ambiente do .env
if (Test-Path "$PSScriptRoot\.env") {
    Get-Content "$PSScriptRoot\.env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $val = $parts[1].Trim().Trim('"').Trim("'")
            if ($key -and -not [Environment]::GetEnvironmentVariable($key, "Process")) {
                [Environment]::SetEnvironmentVariable($key, $val, "Process")
            }
        }
    }
    Write-Host "[CONFIG] Configurações persistentes carregadas de .env" -ForegroundColor DarkCyan
}

if ($Simulate -or ($env:SIMULATE_INFERENCE -eq "true")) {
    $env:SIMULATE_INFERENCE = "true"
    Write-Host "[MODO SIMULAÇÃO] Inferência sintética ativada para benchmark de infraestrutura." -ForegroundColor Magenta
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " INICIANDO PIPELINE DE BENCHMARK HÍBRIDO (POWERSHELL)      " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Resolver caminho absoluto do Python caso estejamos em um venv
if (Test-Path "$PSScriptRoot\..\..\.venv\Scripts\python.exe") {
    $PythonExe = (Resolve-Path "$PSScriptRoot\..\..\.venv\Scripts\python.exe").Path
    Write-Host "[INFO] Utilizando interpretador Python do .venv: $PythonExe" -ForegroundColor DarkGray
}

try {
    # 1. Iniciar o servidor FastAPI em processo desacoplado
    Write-Host "`n[1/4] Inicializando servidor FastAPI (app:app) na porta $Port..." -ForegroundColor Yellow
    $ServerProcess = Start-Process $PythonExe -ArgumentList "-m uvicorn app:app --host 127.0.0.1 --port $Port" -PassThru -NoNewWindow -WorkingDirectory $PSScriptRoot

    # 2. Polling ativo de Health Check
    Write-Host "[2/4] Aguardando prontidão do endpoint /health..." -ForegroundColor Yellow
    $MaxRetries = 40
    $RetryCount = 0
    $IsOnline = $false

    while (-not $IsOnline -and $RetryCount -lt $MaxRetries) {
        Start-Sleep -Milliseconds 400
        $RetryCount++
        try {
            $Response = Invoke-RestMethod -Uri "$HostUrl/health" -Method Get -TimeoutSec 4 -ErrorAction Stop
            if ($Response -and $Response.status -eq "operational") {
                $IsOnline = $true
                Write-Host "  -> Servidor online em $HostUrl (Tentativa $RetryCount)" -ForegroundColor Green
                Write-Host "  -> Llama Local: $(if ($Response.local_llama_vulkan_online) { 'ONLINE' } else { 'OFFLINE' }) | Gemini API: $(if ($Response.gemini_api_configured) { 'CONFIGURADA' } else { 'AUSENTE' })" -ForegroundColor Gray
                break
            }
        } catch {
            # Continua aguardando o socket abrir
        }
    }

    if (-not $IsOnline) {
        throw "Timeout: O servidor FastAPI não respondeu no endpoint /health após $($MaxRetries * 400 / 1000) segundos."
    }

    # 3. Executar o Benchmark Assíncrono
    Write-Host "`n[3/4] Disparando benchmark ($Requests requisições, $Concurrency concorrentes)..." -ForegroundColor Yellow
    $env:ROUTER_URL = $HostUrl
    $env:BENCH_REQUESTS = "$Requests"
    $env:BENCH_CONCURRENCY = "$Concurrency"
    $env:BENCH_OUTPUT_JSON = "$PSScriptRoot\$OutputJson"

    & $PythonExe "$PSScriptRoot\benchmark.py"
    if ($LASTEXITCODE -ne 0) {
        throw "Falha durante a execução do benchmark.py (Exit code: $LASTEXITCODE)."
    }

    # 4. Gerar Gráficos de Distribuição (CDF / KDE) e Abertura na Tela
    Write-Host "`n[4/4] Gerando dashboard executivo de latência..." -ForegroundColor Yellow
    $PlotArgs = @("$PSScriptRoot\plot_benchmark.py", "--input", "$PSScriptRoot\$OutputJson", "--output", "$PSScriptRoot\$OutputPng")
    if ($NoOpen) {
        $PlotArgs += "--no-open"
    }

    & $PythonExe @PlotArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao gerar o gráfico em plot_benchmark.py (Exit code: $LASTEXITCODE)."
    }

    # Garantia adicional de abertura na tela no Windows caso não seja modo sem interface
    if (-not $NoOpen -and (Test-Path "$PSScriptRoot\$OutputPng")) {
        Start-Process explorer.exe "$PSScriptRoot\$OutputPng"
    }

    Write-Host "`n============================================================" -ForegroundColor Green
    Write-Host " PIPELINE CONCLUÍDO COM SUCESSO!                           " -ForegroundColor Green
    Write-Host " Resultados exportados:                                     " -ForegroundColor Green
    Write-Host "   - Dataset Bruto: $OutputJson                             " -ForegroundColor Green
    Write-Host "   - Dashboard PNG: $OutputPng                              " -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green

} catch {
    Write-Host "`n[ERRO CRÍTICO] $_" -ForegroundColor Red
} finally {
    # 5. Cleanup garantido do processo Uvicorn
    if ($ServerProcess -and -not $ServerProcess.HasExited) {
        Write-Host "`n[CLEANUP] Encerrando instância do servidor FastAPI (PID: $($ServerProcess.Id))..." -ForegroundColor DarkGray
        Stop-Process -Id $ServerProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
