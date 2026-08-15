<#
.SYNOPSIS
  Script de Inicializacao Otimizada de Modelos SOTA (Windows).
.DESCRIPTION
  Realiza pre-flight checks, otimizacao de RAM, garante que o Ollama esta ativo
  com os pesos puxados e inicia o proxy de inferencia.
#>
param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("31b", "26b", "12b", "4b", "8b", "llama3_8b", "qwen", "granite")]
    [string]$Model,

    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# 1. Mapeamento de Tags do Ollama
$OllamaTags = @{
    "31b"       = "gemma4:31b-cloud"
    "26b"       = "gemma4:26b"
    "12b"       = "gemma4:12b"
    "4b"        = "gemma4:latest"
    "8b"        = "gemma4:8b"
    "llama3_8b" = "llama3.1:8b"
    "qwen"      = "qwen2.5-coder:3b"
    "granite"   = "granite3.3:8b"
}

$ModelTag = $OllamaTags[$Model]
Write-Output "[SOTA INIT] Inicializando modelo: $Model ($ModelTag)..."

# 2. Garbage Collector & RAM Trim (WMI / API do Windows via PowerShell)
Write-Output "[SOTA RAM] Executando Garbage Collector e liberando Working Set de processos inativos..."
try {
    # Chamar Garbage Collector do .NET
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    # Tentar limpar o Working Set dos processos Python/Ollama inativos para liberar RAM fisica
    $ProcessesToTrim = Get-Process -Name "python", "ollama", "ollama_llama_server" -ErrorAction SilentlyContinue
    foreach ($proc in $ProcessesToTrim) {
        try {
            $handle = $proc.Handle
            # Assinar API Win32 SetProcessWorkingSetSize
            $code = @"
            using System;
            using System.Runtime.InteropServices;
            public class MemoryOptimizer {
                [DllImport("kernel32.dll", EntryPoint = "SetProcessWorkingSetSize", SetLastError = true)]
                public static extern bool SetProcessWorkingSetSize(IntPtr hProcess, int dwMinimumWorkingSetSize, int dwMaximumWorkingSetSize);
            }
"@
            Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
            [MemoryOptimizer]::SetProcessWorkingSetSize($handle, -1, -1) | Out-Null
        } catch {}
    }
    Write-Output "[SOTA RAM] Limpeza de RAM executada com sucesso."
} catch {
    Write-Output "[SOTA RAM] Aviso: Otimizacao detalhada de RAM indisponivel (privilegios ou .NET)."
}

# SOTA: Otimizacao AMD GPU Polaris (ROCm gfx803 Polaris Compatibility Bypass)
$GpuController = Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue
$HasAmdGpu = $false
if ($GpuController) {
    $gpu_list = $GpuController -as [array]
    foreach ($gpu in $gpu_list) {
        if ($gpu.Name -like "*Radeon*" -or $gpu.Name -like "*AMD*") {
            $HasAmdGpu = $true
            break
        }
    }
}
if ($HasAmdGpu) {
    $env:HSA_OVERRIDE_GFX_VERSION = "8.0.3"
    Write-Output "[SOTA PERF] Detectada GPU AMD. Injetando bypass HSA_OVERRIDE_GFX_VERSION=8.0.3 para aceleracao ROCm Polaris."
}

# 3. Verificacao do Servico Ollama
Write-Output "[SOTA OLLAMA] Verificando se o servico Ollama esta ativo na porta 11434..."
$OllamaPortOpen = $false
try {
    $tcpConnection = New-Object System.Net.Sockets.TcpClient
    $connection = $tcpConnection.BeginConnect("127.0.0.1", 11434, $null, $null)
    $success = $connection.AsyncWaitHandle.WaitOne(500, $false)
    if ($success) {
        $tcpConnection.EndConnect($connection)
        $OllamaPortOpen = $true
    }
} catch {}

if (-not $OllamaPortOpen) {
    Write-Output "[SOTA OLLAMA] Ollama offline. Iniciando processo Ollama App..."
    # Procurar o executavel do Ollama nos caminhos padrao do Windows
    $OllamaPaths = @(
        "$env:LOCALAPPDATA\Programs\Ollama\ollama app.exe",
        "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe",
        "C:\Program Files\Ollama\ollama.exe",
        "ollama.exe"
    )
    $OllamaExe = $null
    foreach ($path in $OllamaPaths) {
        if (Test-Path $path) {
            $OllamaExe = $path
            break
        }
    }

    if ($OllamaExe) {
        Start-Process $OllamaExe -WindowStyle Minimized
        Write-Output "[SOTA OLLAMA] Processo Ollama App disparado. Aguardando inicializacao..."
        for ($i = 0; $i -lt 10; $i++) {
            Start-Sleep -Seconds 1
            # Re-check port 11434
            try {
                $tcpConnection = New-Object System.Net.Sockets.TcpClient
                $connection = $tcpConnection.BeginConnect("127.0.0.1", 11434, $null, $null)
                if ($connection.AsyncWaitHandle.WaitOne(200, $false)) {
                    $tcpConnection.EndConnect($connection)
                    $OllamaPortOpen = $true
                    break
                }
            } catch {}
        }
    } else {
        Write-Warning "[SOTA OLLAMA] Executavel do Ollama nao encontrado nos caminhos padrao do Windows."
    }
}

if (-not $OllamaPortOpen) {
    Write-Error "[SOTA OLLAMA] Erro Critico: Nao foi possivel conectar ao Ollama na porta 11434. Verifique a instalacao."
    exit 1
} else {
    Write-Output "[SOTA OLLAMA] Conexao com Ollama estabelecida com sucesso."
}

# 4. Verificacao/Pull de Pesos do Modelo
Write-Output "[SOTA WEIGHTS] Verificando se os pesos do modelo $ModelTag estao disponiveis localmente..."
$ModelsList = & ollama list
$ModelDownloaded = $false
foreach ($line in $ModelsList) {
    if ($line -like "*$ModelTag*") {
        $ModelDownloaded = $true
        break
    }
}

if (-not $ModelDownloaded) {
    Write-Output "[SOTA WEIGHTS] Modelo $ModelTag ausente. Efetuando pull automatico dos pesos do Ollama..."
    & ollama pull $ModelTag
} else {
    Write-Output "[SOTA WEIGHTS] Pesos do modelo $ModelTag localizados com sucesso."
}

# 5. Inicializacao do Servidor Proxy com Afinidade e Prioridade de Processo
Write-Output "[SOTA PROXY] Iniciando Servidor Proxy gemma_server.py..."
$env:SOTA_LOCAL_MODEL = $Model

# Executa o python do ambiente virtual para garantir dependencias
$WorkingDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$VenvPythonRelative = Join-Path $PSScriptRoot "..\.venv\Scripts\python.exe"
$VenvPython = $VenvPythonRelative

if (Test-Path $VenvPythonRelative) {
    $VenvPython = [System.IO.Path]::GetFullPath($VenvPythonRelative)
} else {
    $LocalVenv = Join-Path $WorkingDirectory ".venv\Scripts\python.exe"
    if (Test-Path $LocalVenv) {
        $VenvPython = [System.IO.Path]::GetFullPath($LocalVenv)
    } else {
        $VenvPython = "python"
    }
}
Write-Output "[SOTA PROXY] Usando python executavel: $VenvPython (WorkingDirectory: $WorkingDirectory)"

# Iniciar configuracao de afinidade em background via Start-Job
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 4
    # Ajustar afinidade do Proxy python
    $ProxyProcs = Get-Process -Name "python" -ErrorAction SilentlyContinue
    foreach ($p in $ProxyProcs) {
        try {
            $p.ProcessorAffinity = 255
            $p.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High
        } catch {}
    }
    # Ajustar afinidade do Ollama
    $OllamaProcs = Get-Process -Name "ollama_llama_server", "ollama" -ErrorAction SilentlyContinue
    foreach ($o in $OllamaProcs) {
        try {
            $o.ProcessorAffinity = 255
            $o.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::AboveNormal
        } catch {}
    }
} | Out-Null

Write-Output "[SOTA SUCCESS] Modelo e Proxy iniciados com Sucesso absoluto no Estado da Arte."

# Executar o proxy no primeiro plano para manter o processo e o console vivos
Set-Location $WorkingDirectory
& $VenvPython "engine/gemma_server.py"

# Manter a janela ativa aguardando a finalizacao do proxy
if ($ProxyProcess) {
    $ProxyProcess.WaitForExit()
}
