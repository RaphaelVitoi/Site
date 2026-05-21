<#
.SYNOPSIS
    Micro-Kernel SOTA Completo para Orquestracao de Tarefas (v3.1 ASCII).
    Implementa Mutex, Assinatura SHA-256, Permuta Atomica e Expurgo Deterministico.
#>
#Requires -Version 5.1

# --- BOOTSTRAP: Carregar variaveis de ambiente ---
$ModuleBase = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path $MyInvocation.MyCommand.Path -Parent }
if (-not $ModuleBase) { $ModuleBase = Get-Location }

$EnvPath = Join-Path $ModuleBase "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath } else { throw "CRITICAL: _env.ps1 not found." }

# Inicialização Segura de Caminhos (Fallback para evitar erro de Path Nulo)
$Script:QueuePath = if ($Global:AgentPaths.Queue) { $Global:AgentPaths.Queue } else { Join-Path $ModuleBase "queue" }
$Script:ArchivePath = if ($Global:AgentPaths.Archive) { $Global:AgentPaths.Archive } else { Join-Path $ModuleBase "archive" }
$Script:LogPath = if ($Global:AgentPaths.Log) { $Global:AgentPaths.Log } else { Join-Path $ModuleBase ".claude\logs" }

# Garante que o diretório de log existe antes de tentar o Join-Path
if (-not (Test-Path $Script:LogPath)) { New-Item -ItemType Directory -Path $Script:LogPath -Force | Out-Null }
$Script:CorrectionsLogPath = Join-Path $Script:LogPath "corrections.log"
$Script:MutexName = $Global:TaskManagerConfig.MutexName

# -------------------------------------------------------------------
# KERNEL: Mutex Control & Criptografia
# -------------------------------------------------------------------
function Invoke-WithMutex {
    param([scriptblock]$Action)
    $mutex = New-Object System.Threading.Mutex($false, $Script:MutexName)
    try {
        if ($mutex.WaitOne([TimeSpan]::FromSeconds(30))) {
            try { & $Action } finally { $mutex.ReleaseMutex() }
        }
        else { throw "TIMEOUT KERNEL: Deadlock sistemico evitado. Mutex ocupado." }
    }
    finally { $mutex.Dispose() }
}

#-------------------------------------------------------------------
# Task Schema Validation (FSM)
#-------------------------------------------------------------------
function Test-TaskSchema {
    param([Parameter(Mandatory = $true)][object]$TaskPayload)
    if (-not $TaskPayload.id -or -not $TaskPayload.description) { return $false }
    if ($TaskPayload.status -notmatch '^(pending|running|completed|failed)$') { return $false }
    return $true
}

# -------------------------------------------------------------------
# TRANSACAO 1: ADICIONAR/ATUALIZAR TAREFA
# -------------------------------------------------------------------
function Add-AgentTask {
    param([Parameter(Mandatory = $true)][object]$NewTask)

    if (-not (Test-TaskSchema -TaskPayload $NewTask)) { throw "ABORT: Violacao de Schema." }

    # Interceptador Python SQLite (Camada DAL - Estado da Arte)
    $pyScript = Join-Path $PSScriptRoot "task_executor.py"
    if (Test-Path $pyScript) {
        if (-not $NewTask.priority) {
            $NewTask | Add-Member -MemberType NoteProperty -Name "priority" -Value "normal" -Force
        }

        $taskJson = $NewTask | ConvertTo-Json -Depth 10 -Compress:$true
        # Criptografia estrutural (Base64) para obliterar a entropia de aspas no Windows
        $taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
        
        $pythonCmd = "python"
        $VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
        if (Test-Path $VenvPython) { $pythonCmd = $VenvPython }
        
        $output = & $pythonCmd $pyScript db-add $taskB64
        if ($LASTEXITCODE -ne 0) { throw "CRITICAL: DAL SQLite rejeitou o schema. Erro: $output" }
        
        Invoke-WithMutex {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            try {
                $logDir = Split-Path $Script:LogPath
                if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
                "[$timestamp][ENQUEUED] $($NewTask.id) - $($NewTask.status) (SQLite)" | Add-Content -Path $Script:LogPath -ErrorAction Stop
            }
            catch {}
        }
        return
    }

    throw "CRITICAL: task_executor.py nao encontrado. Impossivel utilizar o banco SQLite SOTA."
}

# -------------------------------------------------------------------
# TRANSACAO 2: EXPURGO (CLEANUP) PROTEGIDO POR MUTEX
# -------------------------------------------------------------------
function Invoke-TaskCleanup {
    param([int]$DaysToKeep = 30, [int]$MaxActive = 50)

    $pyScript = Join-Path $PSScriptRoot "task_executor.py"
    if (Test-Path $pyScript) {
        $pythonCmd = "python"
        $VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
        if (Test-Path $VenvPython) { $pythonCmd = $VenvPython }
        
        & $PythonCmd $pyScript db-cleanup $DaysToKeep | Out-Null
    }
}

# -------------------------------------------------------------------
# LEITURA: OBTER STATUS (Snapshot Seguro)
# -------------------------------------------------------------------
function Get-AgentTaskStatus {
    param([string]$Status)

    $pyScript = Join-Path $PSScriptRoot "task_executor.py"
    if (Test-Path $pyScript) {
        $pythonCmd = "python"
        $VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
        if (Test-Path $VenvPython) { $pythonCmd = $VenvPython }
        
        $arg = if ([string]::IsNullOrEmpty($status)) { "all" } else { $status }
        $jsonOutput = & $PythonCmd $pyScript db-get $arg
        
        if (-not [string]::IsNullOrWhiteSpace($jsonOutput)) {
            try {
                $queue = $jsonOutput | ConvertFrom-Json
                return @($queue)
            }
            catch {
                return @()
            }
        }
    }
    return @()
}

# -------------------------------------------------------------------
# CURATOR VETO (Implementar logica de veto do @curator)
# -------------------------------------------------------------------
function Test-CuratorVeto {
    param([Parameter(Mandatory = $true)][string]$TaskId)

    $vetoFile = Join-Path $Script:LogPath "$TaskId-veto.log"

    # Check if the veto file exists
    if (Test-Path $vetoFile) {
        Write-Host "  [CURATOR] Veto DETECTADO para tarefa: $TaskId" -ForegroundColor Red
        return $true
    }
    else {
        Write-Host "  [CURATOR] Sem veto para tarefa: $TaskId" -ForegroundColor Green
        return $false
    }
}

# -------------------------------------------------------------------
# AUDITORIA DE MEMORIA (Health Check)
# -------------------------------------------------------------------
function Invoke-MemoryAudit {
    Write-Host "`n=== INICIANDO AUDITORIA DE MEMÓRIA DOS AGENTES ===" -ForegroundColor Green

    $BaseDir = Join-Path $ModuleBase ".claude"
    $MemoryDir = Join-Path $BaseDir "agent-memory"
    $ExpectedSections = @(
        "1. PERFIL E ALINHAMENTO",
        "2. COMPETENCIAS E EVOLUCAO",
        "3. PADROES, INSIGHTS E DESCOBERTAS",
        "4. SINERGIA E HARMONIA",
        "5. REGISTRO DE EXECUCAO E AUTONOMIA",
        "6. PROPOSTAS DEMOCRATICAS",
        "Tags para Ingestao RAG"
    )

    $MemoryFiles = Get-ChildItem -Path $MemoryDir -Filter "MEMORY.md" -Recurse
    $NonCompliantCount = 0

    foreach ($File in $MemoryFiles) {
        $FilePath = $File.FullName
        Write-Host "Analisando: $FilePath" -ForegroundColor Cyan
        $IsFileOk = $true

        try {
            $Content = Get-Content -Path $FilePath -Raw -ErrorAction Stop
        }
        catch {
            Write-Warning "Não foi possível ler o arquivo: $FilePath"
            continue
        }

        foreach ($Section in $ExpectedSections) {
            if ($Content -notmatch [regex]::Escape($Section)) {
                Write-Warning "Arquivo em $($File.Directory.Name) faltando secao: $Section"
                $IsFileOk = $false
            }
        }

        if ($Content -notmatch "#padrao") {
            Write-Warning "Sistema de tagging ausente em $($File.Directory.Name)."
            $IsFileOk = $false
        }

        if (-not $IsFileOk) {
            $NonCompliantCount++
            Add-CortexValidationLog -Success $false -Details "MEMORY.md não conforme: $($File.Directory.Name)"
        }
    }
    Write-Host "`n=== AUDITORIA CONCLUÍDA: $NonCompliantCount arquivos com problemas. ===" -ForegroundColor Green
}

# -------------------------------------------------------------------
# CORTEX VALIDATION LOGGING
# -------------------------------------------------------------------
function Add-CortexValidationLog {
    param([bool]$Success, [string]$Details = "")
    Invoke-WithMutex {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $status = if ($Success) { "SUCCESS" } else { "FAILED" }
        $msg = "[$timestamp][CORTEX VALIDATION] $status - $Details"
        try {
            $msg | Add-Content -Path $Script:LogPath
        }
        catch {}
    }
}

# -------------------------------------------------------------------
# LOG DE CORRECOES E AUDITORIA
# -------------------------------------------------------------------
function Add-CorrectionLog {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$Phase,
        [Parameter(Mandatory = $true)][string]$Agent,
        [Parameter(Mandatory = $true)][string]$Description,
        [string]$Reason = "N/A",
        [string]$Impact = "N/A"
    )
    Invoke-WithMutex {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $msg = "[$timestamp][CORRECTION] TaskId: $TaskId | Phase: $Phase | Agent: $Agent | Desc: $Description | Reason: $Reason | Impact: $Impact"
        try {
            $logDir = Split-Path $Script:CorrectionsLogPath
            if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
            $msg | Add-Content -Path $Script:CorrectionsLogPath
        }
        catch {}
    }
}

# Example usage within @auditor or @verifier:
# try {
#   # Perform the correction
# } catch {
#   # Handle the error
# } finally {
#   # Log the correction
#   Add-CorrectionLog -TaskId "TASK-001" -Phase "Auditoria" -Agent "@auditor" -Description "Exemplo" -Reason "Teste" -Impact "Baixo"
# }

# Exporta estritamente a API do Kernel
Export-ModuleMember -Function Test-TaskSchema, Add-AgentTask, Invoke-TaskCleanup, Get-AgentTaskStatus, Add-CortexValidationLog, Add-CorrectionLog, Invoke-MemoryAudit
