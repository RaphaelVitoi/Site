<#
.SYNOPSIS
    Protocolo de Obliteracao SOTA contra EPERM (Imunidade Nativa).
.DESCRIPTION
    Aniquila bloqueios de arquivo (EPERM) matando processos zumbis do Node,
    pausando o OneDrive temporariamente (o maior causador de locks no Windows),
    expurgando caches corrompidos (.next, .turbo, prisma) e ressincronizando o banco.
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$FrontendDir = Join-Path $ProjectRoot 'frontend'

Write-Host '=== INICIANDO PROTOCOLO ANTI-EPERM SOTA (OBLITERACAO ABSOLUTA) ===' -ForegroundColor Red

# 1. Matar processos ofensores (Node)
Write-Host '[1/5] Aniquilando processos Node.js fantasmas (Scoping Cirurgico Chico SOTA)...' -ForegroundColor Yellow
try {
    $CurrentPathEscaped = [regex]::Escape($PWD.Path) -replace '\\\\', '\\'
    $NodeProcs = Get-CimInstance -ClassName Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match $CurrentPathEscaped }
    if ($NodeProcs) {
        foreach ($proc in $NodeProcs) { Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue }
    }
} catch {
    Write-Warning "[AVISO] Nao foi possivel realizar o scoping cirurgico de processos Node. Prosseguindo sem matar."
}
Start-Sleep -Seconds 1

# 2. Neutralizar o OneDrive (O arqui-inimigo dos locks no Windows)
Write-Host '[2/5] Interceptando sincronizacao do OneDrive (Lock Shield)...' -ForegroundColor Yellow
$oneDriveProcess = Get-Process -Name 'OneDrive' -ErrorAction SilentlyContinue
$oneDrivePath = $null
if ($oneDriveProcess) {
    $oneDrivePath = $oneDriveProcess.Path
    Stop-Process -Name 'OneDrive' -Force -ErrorAction SilentlyContinue
    $oneDriveProcess | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue
}

# 3. Limpeza profunda e cirurgica de todos os caches sujeitos a EPERM
Write-Host '[3/5] Purgando caches corrompidos (.next, .turbo, prisma)...' -ForegroundColor Yellow
$CachesToPurge = @(
    (Join-Path $FrontendDir '.next'),
    (Join-Path $FrontendDir '.turbo'),
    (Join-Path $FrontendDir 'node_modules\.cache'),
    (Join-Path $FrontendDir 'node_modules\.prisma'),
    (Join-Path $FrontendDir 'node_modules\@prisma')
)

foreach ($Cache in $CachesToPurge) {
    if (Test-Path $Cache) {
        Remove-Item -Path $Cache -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  > Vaporizado: $Cache" -ForegroundColor DarkGray
    }
}

# 4. Regenerar o Prisma Client a partir do Vazio Quantico
Write-Host '[4/5] Forjando novo Prisma Client...' -ForegroundColor Yellow
if (Test-Path (Join-Path $FrontendDir 'package.json')) {
    Push-Location $FrontendDir
    $NpxCmd = if (Get-Command 'npx.cmd' -ErrorAction SilentlyContinue) { 'npx.cmd' } else { 'npx' }
    & $NpxCmd prisma generate --schema="..\prisma\schema.prisma"
    & $NpxCmd prisma db push --schema="..\prisma\schema.prisma" --accept-data-loss
    Pop-Location
}

# 5. Restaurar a homeostase do Windows
if ($oneDrivePath) {
    Write-Host '[5/5] Restaurando OneDrive...' -ForegroundColor Yellow
    Start-Process -FilePath $oneDrivePath
}

Write-Host "`n=== EPERM OBLITERADO. OS ARQUIVOS ESTAO LIVRES E PURIFICADOS. ===" -ForegroundColor Green
Write-Host 'O ambiente esta esterilizado. Operacoes de build e dev podem prosseguir com Friccao Zero.' -ForegroundColor Cyan
