<#
.SYNOPSIS
    Compiles the native nexus-core-rust CPython extension (PyO3) and installs it into the local .venv.

.DESCRIPTION
    Protocolo Chico SOTA v8.0 GOLD.
    Builds core/nexus-core-rust with `--release --features python` pointing to the
    active virtual environment Python (PYO3_PYTHON), then places nexus_core_rust.pyd
    into .venv/Lib/site-packages so that UniversalArbitrator activates RUST_CORE_AVAILABLE.
#>
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$crateDirectory = Join-Path $repositoryRoot 'core\nexus-core-rust'

$cargoCmd = Get-Command cargo -ErrorAction SilentlyContinue
$cargoExe = if ($cargoCmd) {
    $cargoCmd.Source
} elseif (Test-Path -LiteralPath "$env:USERPROFILE\.cargo\bin\cargo.exe") {
    "$env:USERPROFILE\.cargo\bin\cargo.exe"
} else {
    throw "Cargo (Rust) nao encontrado no PATH nem em ~/.cargo/bin"
}

$venvPython = Join-Path $repositoryRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $venvPython)) {
    $venvPython = Join-Path $repositoryRoot '.venv\bin\python'
}
if (-not (Test-Path -LiteralPath $venvPython)) {
    throw "Ambiente virtual Python (.venv) ausente em $repositoryRoot"
}

Write-Host "Compilando nexus-core-rust com feature python..." -ForegroundColor Cyan
$env:PYO3_PYTHON = $venvPython

Push-Location $crateDirectory
try {
    & $cargoExe build --release --features python
    if ($LASTEXITCODE -ne 0) {
        throw "Falha na compilacao do crate nexus-core-rust (exit code $LASTEXITCODE)"
    }
} finally {
    Pop-Location
}

$targetRelease = Join-Path $crateDirectory 'target\release'
$dllPath = Join-Path $targetRelease 'nexus_core_rust.dll'
$soPath = Join-Path $targetRelease 'libnexus_core_rust.so'

$sitePackages = Join-Path $repositoryRoot '.venv\Lib\site-packages'
if (-not (Test-Path -LiteralPath $sitePackages)) {
    $sitePackages = (Get-ChildItem -Path (Join-Path $repositoryRoot '.venv\lib') -Filter 'site-packages' -Recurse | Select-Object -First 1).FullName
}

if (Test-Path -LiteralPath $dllPath) {
    $destPyd = Join-Path $sitePackages 'nexus_core_rust.pyd'
    Copy-Item -LiteralPath $dllPath -Destination $destPyd -Force
    Write-Host "Instalado com sucesso em $destPyd" -ForegroundColor Green
} elseif (Test-Path -LiteralPath $soPath) {
    $destSo = Join-Path $sitePackages 'nexus_core_rust.so'
    Copy-Item -LiteralPath $soPath -Destination $destSo -Force
    Write-Host "Instalado com sucesso em $destSo" -ForegroundColor Green
} else {
    throw "Binario compilado nao encontrado em $targetRelease"
}
