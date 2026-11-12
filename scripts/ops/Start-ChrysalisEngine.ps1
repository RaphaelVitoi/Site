<#
.SYNOPSIS
    Gerenciador da Chrysalis Live Engine (Porta 8788).

.DESCRIPTION
    Protocolo Chico SOTA v8.0 GOLD.
    Inicia, monitora e mantem ativo o servico externo AGPL Chrysalis Live Engine
    em loopback restrito (127.0.0.1:8788). Nenhum codigo AGPL e copiado para o repositorio;
    o servico e consumido estritamente via HTTP no adapter engine/chrysalis_bridge.py.

.PARAMETER Port
    Porta TCP do servico (Padrao: 8788).

.PARAMETER Status
    Apenas verifica a saude do servico.

.PARAMETER Stop
    Encerra o processo da engine.

.PARAMETER Restart
    Reinicia o servico.
#>
param (
    [int]$Port = 8788,
    [switch]$Status,
    [switch]$Stop,
    [switch]$Restart
)

$ErrorActionPreference = 'Stop'
$HealthUrl = "http://127.0.0.1:$Port/v1/apps"

function Test-ChrysalisHealth {
    param ([string]$Url)
    try {
        $req = [System.Net.HttpWebRequest]::Create($Url)
        $req.Method = 'GET'
        $req.Timeout = 1500
        $res = $req.GetResponse()
        $res.Close()
        return $true
    }
    catch [System.Net.WebException] {
        if ($_.Exception -and $_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
            # 200, 401 ou 403 significam que o servidor HTTP esta ativo e respondendo
            if ($code -eq 200 -or $code -eq 401 -or $code -eq 403) {
                return $true
            }
        }
        return $false
    }
    catch {
        return $false
    }
}

function Stop-ChrysalisProcess {
    param ([int]$TargetPort)
    $connections = Get-NetTCPConnection -LocalPort $TargetPort -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($p in $pids) {
            Write-Host "[CHRYSALIS] Encerrando processo PID $p na porta $TargetPort..." -ForegroundColor Yellow
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    }
}

# 1. Modo Stop
if ($Stop) {
    Write-Host "[CHRYSALIS] Parando Chrysalis Live Engine na porta $Port..." -ForegroundColor Cyan
    Stop-ChrysalisProcess -TargetPort $Port
    Write-Host "[CHRYSALIS] Servico encerrado com sucesso." -ForegroundColor Green
    exit 0
}

# 2. Modo Status
$isAlive = Test-ChrysalisHealth -Url $HealthUrl
if ($Status) {
    if ($isAlive) {
        Write-Host "[CHRYSALIS] ONLINE (Porta $Port)" -ForegroundColor Green
        exit 0
    }
    else {
        Write-Host "[CHRYSALIS] OFFLINE na porta $Port." -ForegroundColor Yellow
        exit 1
    }
}

# 3. Modo Restart
if ($Restart) {
    Write-Host "[CHRYSALIS] Reiniciando Chrysalis Live Engine..." -ForegroundColor Cyan
    Stop-ChrysalisProcess -TargetPort $Port
    Start-Sleep -Seconds 1
}
elseif ($isAlive) {
    Write-Host "[CHRYSALIS] Servico ja esta ONLINE na porta $Port." -ForegroundColor Green
    exit 0
}

# 4. Inicializacao do processo
Write-Host "[CHRYSALIS] Iniciando Chrysalis Live Engine em loopback (porta $Port)..." -ForegroundColor Cyan

$chrysalisBin = (Get-Command chrysalis -ErrorAction SilentlyContinue).Source
if (-not $chrysalisBin) {
    $fallbackNpm = Join-Path $env:APPDATA 'npm\chrysalis.ps1'
    if (Test-Path -LiteralPath $fallbackNpm) {
        $chrysalisBin = $fallbackNpm
    }
    else {
        Write-Error "[CHRYSALIS] Executavel chrysalis nao localizado no PATH ou npm global."
        exit 1
    }
}

Start-Process -FilePath "pwsh.exe" -ArgumentList @(
    "-NoProfile",
    "-NonInteractive",
    "-WindowStyle", "Hidden",
    "-Command",
    "& '$chrysalisBin' start --port $Port --open-browser false --lan false"
) -WindowStyle Hidden -ErrorAction Stop | Out-Null

# Aguarda ate 10s pela prontidao HTTP
$deadline = (Get-Date).AddSeconds(10)
$ready = $false
while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500
    if (Test-ChrysalisHealth -Url $HealthUrl) {
        $ready = $true
        break
    }
}

if ($ready) {
    Write-Host "[CHRYSALIS] SUCESSO: Chrysalis Live Engine ativo e operacional na porta $Port!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "[CHRYSALIS] AVISO: Servico demorou para responder. Verifique logs em AppData\Local\Chrysalis\data\logs." -ForegroundColor Yellow
    exit 0
}
