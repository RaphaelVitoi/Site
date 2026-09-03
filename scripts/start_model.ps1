<#
.SYNOPSIS
  Script de Inicializacao Otimizada de Modelos SOTA (Windows).
.DESCRIPTION
  Realiza pre-flight checks, otimizacao de RAM, garante que o Ollama esta ativo
  com os pesos puxados e inicia o proxy de inferencia.
#>
param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("12b", "e4b", "e2b", "4b", "31b", "31b_cloud", "8b", "llama3_8b", "qwen", "qwen_coder_7b_q5", "qwen_coder_7b", "granite", "deepseek", "kimi_code_cloud")]
    [string]$Model = "qwen_coder_7b_q5",

    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# 1. Mapeamento de Tags do Ollama — lido da FONTE UNICA DE VERDADE
#    data/ollama_models.json. Antes existiam tres mapas hardcoded divergentes
#    (aqui, engine/gemma_server.py e scripts/llm_inference/run_inference.py).
#    O mapa local abaixo e apenas fallback se o manifesto estiver indisponivel.
#    NOTA: nao usar $M como nome de variavel — PowerShell trata $M e $m como
#    a mesma variavel, e qualquer 'foreach ($m in ...)' sobrescreveria o mapa.
$ManifestoModelos = Join-Path $PSScriptRoot "..\data\ollama_models.json"
$OllamaTags = @{}

if (Test-Path $ManifestoModelos) {
    try {
        $Manifest = Get-Content $ManifestoModelos -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($entrada in $Manifest.models) { $OllamaTags[$entrada.alias] = $entrada.tag }
        Write-Output "[SOTA INIT] Manifesto de modelos carregado ($($OllamaTags.Count) aliases)."
    } catch {
        Write-Warning "[SOTA INIT] Manifesto ilegivel; usando fallback embutido. $($_.Exception.Message)"
    }
}

if ($OllamaTags.Count -eq 0) {
    # Fallback minimo — mantido em paridade com o manifesto.
    $OllamaTags = @{
        "12b"       = "gemma4:12b"
        "e4b"       = "gemma4:e4b"
        "e2b"       = "gemma4:e2b"
        "4b"        = "gemma4:latest"
        "31b_cloud" = "gemma4:31b-cloud"
        "31b"       = "gemma4:31b"
        "llama3_8b" = "llama3.1:8b"
        "qwen"      = "qwen2.5-coder:3b"
        "granite"   = "granite3.3:8b"
    }
}

$ModelTag = $OllamaTags[$Model]
if (-not $ModelTag) {
    Write-Error "[SOTA INIT] Alias '$Model' nao existe no manifesto. Aliases: $(($OllamaTags.Keys | Sort-Object) -join ', ')"
    exit 1
}
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
# Comparacao EXATA. A versao anterior usava '-like "*$ModelTag*"', que casava por
# substring: o alias 'gemma4:12b' daria falso positivo em 'gemma4:12b-instruct',
# e um prefixo comum mascararia a ausencia do peso correto.
$ModelDownloaded = $false
try {
    $tags = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 20
    $ModelDownloaded = @($tags.models | Where-Object { $_.name -eq $ModelTag }).Count -gt 0
} catch {
    # Fallback: primeira coluna de 'ollama list', comparada por igualdade.
    $ModelDownloaded = @(& ollama list |
        Select-Object -Skip 1 |
        ForEach-Object { ($_ -split '\s+')[0] } |
        Where-Object { $_ -eq $ModelTag }).Count -gt 0
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
# CORRECAO: a mascara fixa 255 cobre apenas 8 processadores logicos. Nesta
# maquina (i9-9900K, 8 nucleos / 16 threads) isso confinava tanto o proxy quanto
# o Ollama a METADE da CPU disponivel. A mascara agora e derivada da topologia
# real, e so e aplicada se houver mais de 8 logicos a ganhar.
$LogicalCount = (Get-CimInstance Win32_Processor | Measure-Object -Property NumberOfLogicalProcessors -Sum).Sum
$AffinityMask = [IntPtr]([int64][math]::Pow(2, $LogicalCount) - 1)

Start-Job -ArgumentList $AffinityMask, $PID -ScriptBlock {
    param($Mask, $ParentPid)
    Start-Sleep -Seconds 4

    # Restringe ao python DESTA arvore de processos. A versao anterior alterava
    # afinidade e prioridade de TODO processo 'python' da maquina, incluindo os
    # que nada tinham a ver com o proxy.
    $ProxyProcs = Get-CimInstance Win32_Process -Filter "Name='python.exe'" |
        Where-Object { $_.ParentProcessId -eq $ParentPid } |
        ForEach-Object { Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue }

    foreach ($p in $ProxyProcs) {
        try {
            $p.ProcessorAffinity = $Mask
            $p.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High
        } catch {}
    }

    $OllamaProcs = Get-Process -Name "ollama_llama_server", "ollama" -ErrorAction SilentlyContinue
    foreach ($o in $OllamaProcs) {
        try {
            $o.ProcessorAffinity = $Mask
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
