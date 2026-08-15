<#
.SYNOPSIS
    Protocolo de Compilação SOTA para o Motor Tensorial C++ (Vetor Beta)
#>
$ErrorActionPreference = 'Stop'

function Import-Vcvars {
    param([string]$vcvarsPath)
    if (Test-Path $vcvarsPath) {
        Write-Host "-> Inicializando ambiente do compilador MSVC via vcvarsall.bat..." -ForegroundColor DarkGray
        $tempFile = [System.IO.Path]::GetTempFileName()
        cmd.exe /c "`"$vcvarsPath`" x64 && set" > $tempFile
        Get-Content $tempFile | Foreach-Object {
            if ($_ -match "^([^=]+)=(.*)$") {
                $name = $Matches[1]
                $val = $Matches[2]
                [Environment]::SetEnvironmentVariable($name, $val, [System.EnvironmentVariableTarget]::Process)
            }
        }
        Remove-Item $tempFile -Force
    }
}

$ScriptDir = $PSScriptRoot
$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $ScriptDir "..\.."))
$TensorDir = Join-Path $ProjectRoot "core\tensor_engine"
$BuildDir = Join-Path $TensorDir "build"

Write-Host "`n=== [VETOR BETA] COMPILANDO MOTOR TENSORIAL QUÂNTICO (C++ / NANOBIND) ===" -ForegroundColor Magenta

if (-not (Test-Path -LiteralPath $TensorDir)) {
    Write-Error "[ENTROPIA] O diretório fonte do motor tensorial não foi encontrado em $TensorDir"
}

$CacheFile = Join-Path $BuildDir "CMakeCache.txt"
if (Test-Path $CacheFile) {
    Write-Host "-> Expurgando cache envenenado do CMake..." -ForegroundColor Yellow
    Remove-Item -Path "$BuildDir\*" -Recurse -Force -ErrorAction SilentlyContinue
}

if (-not (Test-Path -LiteralPath $BuildDir)) {
    New-Item -ItemType Directory -Path $BuildDir | Out-Null
}

# Bypass CMake drop: Forjamento de cabeçalho MSVC Compat O(1)
$MsvcCompatHeader = Join-Path $BuildDir "msvc_compat.h"
Set-Content -Path $MsvcCompatHeader -Value "#pragma once`n#ifndef __builtin_verbose_trap`n#define __builtin_verbose_trap(a,b) __builtin_trap()`n#endif" -Encoding UTF8

try {
    $PythonPath = (Join-Path $ProjectRoot ".venv\Scripts\python.exe").Replace("\", "/")
    $UvCmd = Join-Path $ProjectRoot ".venv\Scripts\uv.exe"
    if (-not (Test-Path $UvCmd)) {
        $UvCmd = "uv"
    }
    $CMakeArgs = @("-S", $TensorDir, "-B", $BuildDir, "-G", "Ninja", "-DCMAKE_BUILD_TYPE=Release", "-DCMAKE_EXPORT_COMPILE_COMMANDS=ON", "-DPython_EXECUTABLE=$PythonPath")

    $ClangBin = ""
    if (Get-Command 'clang-cl.exe' -ErrorAction SilentlyContinue) {
        $ClangBin = (Get-Command 'clang-cl.exe').Source
    }
    elseif (Test-Path "C:\Program Files\LLVM\bin\clang-cl.exe") {
        $ClangBin = "C:\Program Files\LLVM\bin\clang-cl.exe"
    }

    if ($ClangBin) {
        $RcBin = $ClangBin.Replace("clang-cl.exe", "llvm-rc.exe")
        $env:CC = $ClangBin
        $env:CXX = $ClangBin
        $CMakeArgs += "-DCMAKE_C_COMPILER=$($ClangBin.Replace('\', '/'))"
        $CMakeArgs += "-DCMAKE_CXX_COMPILER=$($ClangBin.Replace('\', '/'))"

        # Injeção de Imunidade: Resolve __builtin_verbose_trap via header e silencia entropia Eigen
        $CompatFlags = "/DWIN32 /D_WINDOWS /EHsc /GR /arch:AVX2 /FI`"$($MsvcCompatHeader.Replace('\', '/'))`" -Wno-nan-infinity-disabled"
        $CMakeArgs += "-DCMAKE_CXX_FLAGS=$CompatFlags"

        if (Test-Path $RcBin) {
            $CMakeArgs += "-DCMAKE_RC_COMPILER=$($RcBin.Replace('\', '/'))"
        }
        Write-Host "-> [SOTA] Motor LLVM/Clang-CL detectado em: $ClangBin" -ForegroundColor DarkGray
    }
    else {
        # SOTA: Fallback para MSVC nativo caso Clang nao esteja instalado
        $VcVarsPath = ""
        $VSPaths = @(
            "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Auxiliary\Build\vcvarsall.bat",
            "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat",
            "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Auxiliary\Build\vcvarsall.bat",
            "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat",
            "C:\Program Files (x86)\Microsoft Visual Studio\2019\Professional\VC\Auxiliary\Build\vcvarsall.bat",
            "C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvarsall.bat",
            "C:\Program Files (x86)\Microsoft Visual Studio\2019\Enterprise\VC\Auxiliary\Build\vcvarsall.bat",
            "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\VC\Auxiliary\Build\vcvarsall.bat"
        )
        foreach ($path in $VSPaths) {
            if (Test-Path $path) {
                $VcVarsPath = $path
                break
            }
        }
        if ($VcVarsPath) {
            Import-Vcvars -vcvarsPath $VcVarsPath
        } else {
            Write-Warning "[AVISO] vcvarsall.bat nao localizado. A compilacao pode falhar se o compilador nao estiver no PATH."
        }
    }

    Write-Host "-> Transmutação Semântica SOTA (Nanobind 1.x -> 2.0+)..." -ForegroundColor Yellow
    $KernelPath = Join-Path $TensorDir "src\quantum_kernel.cpp"
    if (Test-Path $KernelPath) {
        $KernelContent = Get-Content $KernelPath -Raw
        $KernelContent = $KernelContent -replace 'nanobind/tensor\.h', 'nanobind/ndarray.h'
        $KernelContent = $KernelContent -replace 'nb::tensor', 'nb::ndarray'
        Set-Content -Path $KernelPath -Value $KernelContent -Encoding UTF8
    }

    Write-Host "-> Gerando árvore de dependências (CMake + Ninja)..." -ForegroundColor Cyan
    & $UvCmd run cmake @CMakeArgs

    if ($LASTEXITCODE -ne 0) { throw "Falha na geração da árvore CMake." }

    Write-Host "-> Compilando extensão nativa (SIMD / C++17)..." -ForegroundColor Cyan
    & $UvCmd run cmake --build "$BuildDir" --config Release

    if ($LASTEXITCODE -ne 0) { throw "Falha na compilação bruta (Ninja/CMake)." }

    Write-Host "-> Consolidando Artefato (.pyd) na raiz da Camada de Inteligência..." -ForegroundColor Yellow
    $Artifact = Get-ChildItem -Path "$BuildDir" -Filter "quantum_tensor_engine*.pyd" -Recurse | Select-Object -First 1

    if ($Artifact) {
        Copy-Item -Path $Artifact.FullName -Destination (Join-Path $ProjectRoot "core\quantum_tensor_engine.pyd") -Force
        Copy-Item -Path (Join-Path $BuildDir "compile_commands.json") -Destination (Join-Path $ProjectRoot "compile_commands.json") -Force -ErrorAction SilentlyContinue
        Write-Host "[SUCESSO] Módulo C++ compilado. Importação Python: 'import core.quantum_tensor_engine'" -ForegroundColor Green
    }
    else {
        Write-Error "[ENTROPIA FATAL] A compilação terminou, mas o binário .pyd não foi encontrado no diretório de build."
    }
}
catch {
    Write-Error "[ENTROPIA] O processo de compilação colapsou: $_"
}
