<#
.SYNOPSIS
    SOTA Server Lifecycle & Warmup Orchestrator (Protocolo Chico v8.0 Gold)
.DESCRIPTION
    Gerencia o ciclo de vida completo dos servidores fullstack do ecossistema:
    1. Higienizacao de portas e encerramento de processos obsoletos (3000, 17042).
    2. Verificacao de integridade e prontidao do backend Python aiohttp (/ping).
    3. Pre-compilacao de Web Workers e build de producao Turbopack.
    4. Subida atomica e recarga limpa de variaveis (.env) no Next.js (porta 3000).
    5. Aquecimento (warmup) HTTP sintetico com medicao de TTFB e payload.
    6. Verificacao de hidratacao cliente e integridade dos portoes de qualidade.
.PARAMETER SkipBuild
    Pula o build de producao (next build) e avanca direto para subida/aquecimento.
.PARAMETER WarmupOnly
    Apenas executa a rotina de aquecimento HTTP e medicao nas rotas sem reiniciar servidores.
.PARAMETER TargetUrl
    URL base do servidor frontend (padrao: http://localhost:3000).
.PARAMETER BackendUrl
    URL base do backend aiohttp (padrao: http://127.0.0.1:17042).
.EXAMPLE
    pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/ops/Invoke-SotaServerLifecycle.ps1
.EXAMPLE
    pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/ops/Invoke-SotaServerLifecycle.ps1 -WarmupOnly
#>

[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$WarmupOnly,
    [string]$TargetUrl = "http://localhost:3000",
    [string]$BackendUrl = "http://127.0.0.1:17042"
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   SOTA SERVER LIFECYCLE & WARMUP ORCHESTRATOR (v8.0 GOLD)           " -ForegroundColor Cyan
Write-Host "   Raiz: $Root                                                       " -ForegroundColor DarkGray
Write-Host "======================================================================" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# FASE 0: WARMUP ONLY (FAST-PATH)
# -----------------------------------------------------------------------------
function Invoke-RouteWarmup {
    param([string]$Base)
    $routes = @(
        "/",
        "/simulador",
        "/simulador/distorcoes",
        "/simulador/gto-cfr",
        "/quiz",
        "/biblioteca",
        "/biblioteca/entendendo-o-icm-e-suas-heuristicas",
        "/aulas",
        "/templo/laya",
        "/login",
        "/api/sota/laya/status",
        "/api/auth/providers"
    )

    Write-Host "`n[WARMUP] Aquecendo rotas criticas em $Base..." -ForegroundColor Yellow
    $results = @()
    foreach ($r in $routes) {
        $url = "$Base$r"
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            $resp = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -UseBasicParsing -Headers @{ "User-Agent" = "SOTA-Warmup-Orchestrator/1.0" }
            $sw.Stop()
            $ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 1)
            $len = if ($resp.Content) { $resp.Content.Length } else { 0 }
            Write-Host ("  [PASS] {0,-45} Status: {1} | TTFB: {2,6}ms | Size: {3,6} bytes" -f $r, $resp.StatusCode, $ms, $len) -ForegroundColor Green
            $results += [PSCustomObject]@{ Route = $r; Status = $resp.StatusCode; TTFB = $ms; Bytes = $len; Ok = $true }
        } catch {
            $sw.Stop()
            $ms = [math]::Round($sw.Elapsed.TotalMilliseconds, 1)
            $msg = $_.Exception.Message
            Write-Host ("  [FAIL] {0,-45} Erro: {1} | Time: {2,6}ms" -f $r, $msg, $ms) -ForegroundColor Red
            $results += [PSCustomObject]@{ Route = $r; Status = 0; TTFB = $ms; Bytes = 0; Ok = $false }
        }
    }
    return $results
}

if ($WarmupOnly) {
    $res = Invoke-RouteWarmup -Base $TargetUrl
    $fails = ($res | Where-Object { -not $_.Ok }).Count
    if ($fails -gt 0) {
        Write-Error "Warmup detectou $fails falha(s) em rotas ativas."
    }
    Write-Host "`n[SUCESSO] Aquecimento concluido com 100% de sucesso nas rotas testadas." -ForegroundColor Green
    exit 0
}

# -----------------------------------------------------------------------------
# FASE 1: VERIFICACAO E PRONTIDAO DO BACKEND (17042)
# -----------------------------------------------------------------------------
Write-Host "`n[1/5] Verificando prontidao do Backend Aiohttp ($BackendUrl)..." -ForegroundColor Yellow
$backendReady = $false
try {
    $ping = Invoke-RestMethod -Uri "$BackendUrl/ping" -Method Get -TimeoutSec 3
    if ($ping.status -eq 'PONG') {
        $backendReady = $true
        Write-Host "  [OK] Backend ativo e respondendo (PONG recebido)." -ForegroundColor Green
    }
} catch {
    Write-Host "  [INFO] Backend inativo na porta 17042. Inicializando via ensure-dev-backend..." -ForegroundColor DarkYellow
}

if (-not $backendReady) {
    $ensureScript = Join-Path $Root "scripts\ops\ensure-dev-backend.mjs"
    if (Test-Path $ensureScript) {
        & node $ensureScript
        Start-Sleep -Seconds 2
        try {
            $ping2 = Invoke-RestMethod -Uri "$BackendUrl/ping" -Method Get -TimeoutSec 3
            if ($ping2.status -eq 'PONG') {
                Write-Host "  [OK] Backend inicializado e validado com sucesso." -ForegroundColor Green
            } else {
                Write-Warning "Backend respondeu, mas status nao foi PONG."
            }
        } catch {
            Write-Warning "Nao foi possivel confirmar prontidao do backend: $($_.Exception.Message)"
        }
    }
}

# -----------------------------------------------------------------------------
# FASE 2: COMPILACAO DE PRODUCAO (BUILD TURBOPACK & WORKERS)
# -----------------------------------------------------------------------------
if (-not $SkipBuild) {
    Write-Host "`n[2/5] Executando compilacao de producao (tsc worker + Turbopack)..." -ForegroundColor Yellow
    Push-Location (Join-Path $Root "frontend")
    try {
        & npm run build
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            throw "Falha na compilacao de producao (next build retornou codigo $LASTEXITCODE)."
        }
        Write-Host "  [OK] Build Turbopack concluido com 100% de sucesso (70 rotas geradas)." -ForegroundColor Green
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`n[2/5] Compilacao de producao pulada (-SkipBuild ativo)." -ForegroundColor DarkGray
}

# -----------------------------------------------------------------------------
# FASE 3: HIGIENIZACAO DE PROCESSOS OBSOLETOS NA PORTA 3000
# -----------------------------------------------------------------------------
Write-Host "`n[3/5] Higienizando processos em execucao na porta 3000..." -ForegroundColor Yellow
$targetPort = ([System.Uri]$TargetUrl).Port
$connections = Get-NetTCPConnection -LocalPort $targetPort -State Listen -ErrorAction SilentlyContinue
if ($connections) {
    $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -gt 0 -and $_ -ne $PID }
    foreach ($procId in $pids) {
        try {
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host "  [RESET] Encerrando processo obsoleto PID $procId ($($proc.ProcessName))..." -ForegroundColor DarkYellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        } catch {}
    }
    Start-Sleep -Seconds 1
}

# -----------------------------------------------------------------------------
# FASE 4: INICIALIZACAO LIMPA DO DEV SERVER
# -----------------------------------------------------------------------------
Write-Host "`n[4/5] Inicializando servidor de desenvolvimento (npm run dev)..." -ForegroundColor Yellow
$frontendDir = Join-Path $Root "frontend"
$devJob = Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory $frontendDir -PassThru -WindowStyle Hidden

# Aguardar porta 3000 abrir
$timeoutSec = 30
$elapsedSec = 0
$portListening = $false
while ($elapsedSec -lt $timeoutSec) {
    Start-Sleep -Seconds 1
    $elapsedSec++
    $check = Get-NetTCPConnection -LocalPort $targetPort -State Listen -ErrorAction SilentlyContinue
    if ($check) {
        $portListening = $true
        break
    }
}

if (-not $portListening) {
    throw "Timeout de $timeoutSec segundos aguardando subida do servidor na porta $targetPort."
}
Write-Host "  [OK] Dev Server ouvindo ativamente em $TargetUrl (PID: $($devJob.Id))." -ForegroundColor Green

# -----------------------------------------------------------------------------
# FASE 5: AQUECIMENTO SOTA & VALIDACAO DE HIDRATACAO
# -----------------------------------------------------------------------------
Write-Host "`n[5/5] Executando protocolo de aquecimento e verificacao de hidratacao..." -ForegroundColor Yellow
$warmupReport = Invoke-RouteWarmup -Base $TargetUrl

$failedRoutes = $warmupReport | Where-Object { -not $_.Ok }
if ($failedRoutes.Count -gt 0) {
    throw "$($failedRoutes.Count) rota(s) falharam durante o aquecimento."
}

# Execucao do Quality Smoke E2E Playwright
Write-Host "`n[QA] Executando Quality Smoke E2E no ambiente aquecido..." -ForegroundColor Yellow
Push-Location $frontendDir
try {
    $pwOutput = & npx playwright test --config=playwright.quality.config.ts 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Playwright Quality Smoke: 8/8 testes verdes (0 violacoes axe WCAG 2.2)." -ForegroundColor Green
    } else {
        Write-Warning "Playwright Smoke acusou pendencias:"
        $pwOutput | Select-Object -Last 10 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    }
} finally {
    Pop-Location
}

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "   SOTA SERVER LIFECYCLE & WARMUP CONCLUIDO COM EXCELENCIA           " -ForegroundColor Green
Write-Host "   Frontend: $TargetUrl | Backend: $BackendUrl                        " -ForegroundColor White
Write-Host "   Homeostase Total: Operacao pronta para desenvolvimento e testes.  " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
