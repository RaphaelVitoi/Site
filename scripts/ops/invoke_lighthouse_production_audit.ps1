[CmdletBinding()]
param(
    [ValidateRange(1, 65535)][int]$ServerPort = 3100,
    [ValidateRange(1, 65535)][int]$CdpPort = 9230,
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$FrontendRoot = Join-Path $RepoRoot 'frontend'
$CollectorPath = Join-Path $PSScriptRoot 'lighthouse_cwv_audit.mjs'
$ReportDir = Join-Path $RepoRoot 'reports\cwv'
$Timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$ArtifactPath = Join-Path $ReportDir "lighthouse_desktop_production_$Timestamp.json"
$LatestArtifactPath = Join-Path $ReportDir 'latest_lighthouse_production.json'
$TempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$auditProfile = Join-Path $TempRoot ('sota-lighthouse-audit-' + [guid]::NewGuid().ToString('N'))
$ProductionUrl = "http://127.0.0.1:$ServerPort/"

function Get-ListeningProcessIds {
    param([int]$Port)
    return @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
}

function Assert-FreePort {
    param([int]$Port, [string]$Purpose)
    $owners = @(Get-ListeningProcessIds -Port $Port)
    if ($owners.Count -gt 0) {
        throw "A porta $Port para $Purpose ja esta em uso pelo(s) PID(s): $($owners -join ', '). O auditor nao encerra processos que nao iniciou."
    }
}

function Wait-ForHttp {
    param([string]$Url, [string]$Description)
    $deadline = (Get-Date).AddSeconds(60)
    do {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { return }
        } catch { }
        Start-Sleep -Milliseconds 250
    } while ((Get-Date) -lt $deadline)
    throw "Tempo esgotado aguardando $Description em $Url."
}

function Stop-AuditChrome {
    param([string]$ProfilePath)
    $profilePattern = [regex]::Escape($ProfilePath)
    $auditChrome = @(Get-CimInstance Win32_Process -Filter "Name = 'chrome.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -and $_.CommandLine -match $profilePattern })
    foreach ($process in $auditChrome) {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

if (-not (Test-Path -LiteralPath $FrontendRoot -PathType Container)) { throw "Frontend ausente: $FrontendRoot" }
if (-not (Test-Path -LiteralPath $CollectorPath -PathType Leaf)) { throw "Coletor Lighthouse ausente: $CollectorPath" }

$chromePath = Join-Path ${env:ProgramFiles} 'Google\Chrome Dev\Application\chrome.exe'
if (-not (Test-Path -LiteralPath $chromePath -PathType Leaf)) { throw "Chrome Dev nao encontrado: $chromePath" }
$node = Get-Command node.exe -ErrorAction Stop
$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if ($null -eq $npm) { $npm = Get-Command npm -ErrorAction Stop }
$nextCli = Join-Path $RepoRoot 'node_modules\next\dist\bin\next'
if (-not (Test-Path -LiteralPath $nextCli -PathType Leaf)) { throw "CLI Next ausente: $nextCli" }

Assert-FreePort -Port $ServerPort -Purpose 'servidor Next temporario'
Assert-FreePort -Port $CdpPort -Purpose 'Chrome isolado de auditoria'

$server = $null
try {
    if (-not $SkipBuild) {
        Write-Host '[Lighthouse] Gerando build de producao' -ForegroundColor Cyan
        Push-Location $RepoRoot
        try {
            & $npm.Source run build
            if ($LASTEXITCODE -ne 0) { throw "npm run build terminou com codigo $LASTEXITCODE." }
        } finally { Pop-Location }
    }

    New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
    $server = Start-Process -FilePath $node.Source -ArgumentList @($nextCli, 'start', '-H', '127.0.0.1', '-p', $ServerPort) -WorkingDirectory $FrontendRoot -WindowStyle Hidden -PassThru
    Wait-ForHttp -Url $ProductionUrl -Description 'Next em modo producao'

    New-Item -ItemType Directory -Path $auditProfile -Force | Out-Null
    Start-Process -FilePath $chromePath -ArgumentList @(
        '--headless=new',
        '--remote-debugging-address=127.0.0.1',
        "--remote-debugging-port=$CdpPort",
        "--user-data-dir=$auditProfile",
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages',
        '--disable-background-networking',
        '--disable-sync',
        '--no-first-run',
        '--no-default-browser-check',
        'about:blank'
    ) -WindowStyle Hidden | Out-Null
    Wait-ForHttp -Url ("http://127.0.0.1:{0}/json/version" -f $CdpPort) -Description 'CDP do Chrome isolado'

    & $node.Source $CollectorPath '--url' $ProductionUrl '--port' $CdpPort '--source-root' $FrontendRoot '--output' $ArtifactPath
    if ($LASTEXITCODE -ne 0) { throw "O coletor Lighthouse terminou com codigo $LASTEXITCODE." }
    if (-not (Test-Path -LiteralPath $ArtifactPath -PathType Leaf)) { throw "Artefato Lighthouse ausente: $ArtifactPath" }
    Copy-Item -LiteralPath $ArtifactPath -Destination $LatestArtifactPath -Force
    Write-Host "[Lighthouse] Artefato atual: $LatestArtifactPath" -ForegroundColor Green
}
finally {
    Stop-AuditChrome -ProfilePath $auditProfile
    if ($null -ne $server -and -not $server.HasExited) { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue }
    if (Test-Path -LiteralPath $auditProfile) {
        $resolvedProfile = [IO.Path]::GetFullPath($auditProfile)
        if ($resolvedProfile.StartsWith($TempRoot, [StringComparison]::OrdinalIgnoreCase) -and (Split-Path -Leaf $resolvedProfile) -like 'sota-lighthouse-audit-*') {
            Remove-Item -LiteralPath $auditProfile -Recurse -Force
        }
    }
}
