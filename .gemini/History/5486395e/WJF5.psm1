<#
.SYNOPSIS
    Micro-Kernel SOTA Completo para Orquestracao de Tarefas (v3.1 ASCII).
    Implementa Mutex, Assinatura SHA-256, Permuta Atomica e Expurgo Deterministico.
#>
#Requires -Version 5.1

# --- BOOTSTRAP: Carregar variaveis de ambiente ---
$EnvPath = Join-Path $PSScriptRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath } else { throw "CRITICAL: _env.ps1 not found." }

$Script:QueuePath = $Global:AgentPaths.Queue
$Script:ArchivePath = $Global:AgentPaths.Archive
$Script:LogPath = $Global:AgentPaths.Log
$Script:CorrectionsLogPath = Join-Path $Global:AgentPaths.Log "corrections.log"
$Script:MutexName = $Global:TaskManagerConfig.MutexName

# -------------------------------------------------------------------
# KERNEL: Mutex Control & Criptografia
# -------------------------------------------------------------------
function Invoke-WithMutex {
    param([scriptblock]$Action)
    $mutex = New-Object System.Threading.Mutex($false, $Script:MutexName)
    try {
        if ($mutex.WaitOne([TimeSpan]::FromSeconds(15))) {
            try { & $Action } finally { $mutex.ReleaseMutex() }
        }
        else { throw "TIMEOUT KERNEL: Deadlock sistemico evitado. Mutex ocupado." }
    }
    finally { $mutex.Dispose() }
}

#-------------------------------------------------------------------
# Payload Hash 
#-------------------------------------------------------------------
function Get-PayloadHash([string]$JsonString) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($JsonString)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hashBytes = $sha256.ComputeHash($bytes)
    $sha256.Dispose()
    return [System.BitConverter]::ToString($hashBytes).Replace("-", "").ToLower()
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

#-------------------------------------------------------------------
# Atomic Operations (Task Wrapper)
#-------------------------------------------------------------------
function New-AgentTaskWrapper {
    param (
        [Parameter(Mandatory = $true)]
        [object]$Tasks
    )

    $tasksJson = $Tasks | ConvertTo-Json -Depth 10 -Compress:$true
    $checksum = Get-PayloadHash $tasksJson

    return [ordered]@{
        version   = "4.0"
        updatedAt = (Get-Date -Format "o")
        checksum  = $checksum
        tasks     = $Tasks
    }
}

# -------------------------------------------------------------------
# TRANSACAO 1: ADICIONAR/ATUALIZAR TAREFA
# -------------------------------------------------------------------
function Add-AgentTask {
    param([Parameter(Mandatory = $true)][object]$NewTask)

    if (-not (Test-TaskSchema -TaskPayload $NewTask)) { throw "ABORT: Violacao de Schema." }

    # Interceptador Pydantic (Honestidade Radical de Dados)
    $pyScript = Join-Path $PSScriptRoot "task_executor.py"
    if (Test-Path $pyScript) {
        Invoke-WithMutex {
            $taskJson = $NewTask | ConvertTo-Json -Depth 10 -Compress:$true
            # Criptografia estrutural (Base64) para obliterar a entropia de aspas no Windows
            $taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
            
            $PythonCmd = "python"
            $VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
            if (Test-Path $VenvPython) { $PythonCmd = $VenvPython }
            
            $output = & $PythonCmd $pyScript add $taskB64
            if ($LASTEXITCODE -ne 0) { throw "CRITICAL: Pydantic rejeitou o schema. Erro: $output" }
            
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            try {
                $logDir = Split-Path $Script:LogPath
                if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
                "[$timestamp][ENQUEUED] $($NewTask.id) - $($NewTask.status) (Pydantic Validated)" | Add-Content -Path $Script:LogPath
            }
            catch {}
        }
        return # Sai da função, Python já cuidou do I/O
    }

    Invoke-WithMutex {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

        try {
            $logDir = Split-Path $Script:LogPath
        }
        catch {
            Write-Warning "[AGENT-TASKMANAGER] Could not split path: $($_.Exception.Message)"
        }
        if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
        "[$timestamp][ENQUEUED] $($NewTask.id) - $($NewTask.status)" | Add-Content -Path $Script:LogPath

        $queue = @()
        if (Test-Path $Script:QueuePath) {
            try {
                $raw = [System.IO.File]::ReadAllText($Script:QueuePath, [System.Text.Encoding]::UTF8)
                if (-not [string]::IsNullOrWhiteSpace($raw)) {
                    $payload = $raw | ConvertFrom-Json
                    $queue = if ($null -ne $payload.tasks) { @($payload.tasks) } else { @($payload) }
                }
            }
            catch {
                # AUTOPOIESE: Deteccao de Entropia e Auto-Cura
                $corruptFile = "$($Script:QueuePath).corrupt.$(Get-Date -Format 'yyyyMMddHHmmss')"
                Move-Item -Path $Script:QueuePath -Destination $corruptFile -Force
        
                $msg = "[KERNEL][AUTO-HEALING] Corrupcao detectada. Entropia isolada. Sistema regenerado. Erro: $($_.Exception.Message) - $($_.Exception.StackTrace)"
                $msg | Add-Content -Path $Script:LogPath
                $queue = @()
            }
        }

        # Logica Upsert: Remove versao anterior da tarefa (se existir) para permitir atualizacao de status
        $queue = @($queue | Where-Object { $_.id -ne $NewTask.id })
        $queue += $NewTask

        # Atomic Replace
        $wrapper = New-AgentTaskWrapper -Tasks $queue
        $queueDir = Split-Path $Script:QueuePath
        if (-not (Test-Path $queueDir)) { New-Item -ItemType Directory -Path $queueDir -Force | Out-Null }

        $tempFile = "$($Script:QueuePath).tmp"
        $finalJson = $wrapper | ConvertTo-Json -Depth 10 -Compress:$false

        # Transacao Atomica
        [System.IO.File]::WriteAllText($tempFile, $finalJson, [System.Text.Encoding]::UTF8)
        Move-Item -Path $tempFile -Destination $Script:QueuePath -Force
    }
}

# -------------------------------------------------------------------
# TRANSACAO 2: EXPURGO (CLEANUP) PROTEGIDO POR MUTEX
# -------------------------------------------------------------------
function Invoke-TaskCleanup {
    param([int]$DaysToKeep = 30, [int]$MaxActive = 50)

    Invoke-WithMutex {
        if (-not (Test-Path $Script:QueuePath)) { return }
        $raw = [System.IO.File]::ReadAllText($Script:QueuePath, [System.Text.Encoding]::UTF8)
        if ([string]::IsNullOrWhiteSpace($raw)) {
            return 
        }

        $payload = $raw | ConvertFrom-Json
        $queue = if ($null -ne $payload.tasks) { @($payload.tasks) } else { @($payload) }
        $cutoff = (Get-Date).AddDays(-$DaysToKeep)

        $toArchive = @($queue.Where({ $_.status -in @("completed", "failed") -and [datetime]$_.timestamp -lt $cutoff }))
        $toKeep = @($queue.Where({ $toArchive.id -notcontains $_.id }))

        # Priorizar a manutencao de tarefas de agentes criticos (ex: @maverick)
        $maverickTasks = @($toKeep | Where-Object { $_.agent -eq "@maverick" })
        $otherTasks = @($toKeep | Where-Object { $_.agent -ne "@maverick" })
        if ($otherTasks.Count -gt $MaxActive) {
            $overflow = $toKeep.Count - $MaxActive
            $toArchive += $toKeep[0..($overflow - 1)]
            $toKeep = $toKeep[$overflow..($toKeep.Count - 1)]
        }

        if ($toArchive.Count -gt 0) {
            # Arquivo Morto
            $archived = @()
            if (Test-Path $Script:ArchivePath) { 
                $archivedRaw = [System.IO.File]::ReadAllText($Script:ArchivePath, [System.Text.Encoding]::UTF8)
                $archived = @(($archivedRaw | ConvertFrom-Json).tasks)
            }
    
            $newArchiveQueue = $archived + $toArchive
            $archiveWrapper = New-AgentTaskWrapper -Tasks $newArchiveQueue

            $archiveDir = Split-Path $Script:ArchivePath
            if (-not (Test-Path $archiveDir)) { New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null }
            $tempArchive = "$($Script:ArchivePath).tmp"
            [System.IO.File]::WriteAllText($tempArchive, ($archiveWrapper | ConvertTo-Json -Depth 10), [System.Text.Encoding]::UTF8)
            Move-Item -Path $tempArchive -Destination $Script:ArchivePath -Force

            # Nova Fila Ativa
            $queueWrapper = New-AgentTaskWrapper -Tasks $toKeep
    
            $tempQueue = "$($Script:QueuePath).tmp"
            [System.IO.File]::WriteAllText($tempQueue, ($queueWrapper | ConvertTo-Json -Depth 10), [System.Text.Encoding]::UTF8)
            Move-Item -Path $tempQueue -Destination $Script:QueuePath -Force
    
            # LOG
            foreach ($task in $toArchive) {
                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                $action = switch ($task.status) { 'completed' { '[COMPLETED]' } 'failed' { '[FAILED]' } default { '[ARCHIVED]' } }
                "[$timestamp] $action $($task.id)" | Add-Content -Path $Script:LogPath
            }

            "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [CLEANUP] Movidas $($toArchive.Count) tarefas. Assinaturas renovadas." | Add-Content -Path $Script:LogPath
        }
    }
}

# -------------------------------------------------------------------
# LEITURA: OBTER STATUS (Snapshot Seguro)
# -------------------------------------------------------------------
function Get-AgentTaskStatus {
    param([string]$Status)

    Invoke-WithMutex {
        if (-not (Test-Path $Script:QueuePath)) { return @() }

        $raw = [System.IO.File]::ReadAllText($Script:QueuePath, [System.Text.Encoding]::UTF8)
        if ([string]::IsNullOrWhiteSpace($raw)) { return @() }

        $payload = $raw | ConvertFrom-Json
        $queue = if ($null -ne $payload.tasks) { @($payload.tasks) } else { @($payload) }

        # Ordenar por prioridade (alta > normal > baixa)
        $queue = $queue | Sort-Object { switch ($_.priority) { "high" { 1 }; "normal" { 2 }; "low" { 3 }; default { 2 } } }

        # Log RUNNING
        foreach ($task in $queue | Where-Object { $_.status -eq "running" }) {
            "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] [RUNNING] $($task.id)" | Add-Content -Path $Script:LogPath
        }

        if (-not [string]::IsNullOrEmpty($Status)) {
            return @($queue | Where-Object { $_.status -eq $Status })
        }
        return @($queue)
    }
}

# -------------------------------------------------------------------
# CURATOR VETO (Implementar lógica de veto do @curator)
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

# Example usage within @auditor or @verifier:
# try {
#   # Perform the correction
# } catch {
#   # Handle the error
# } finally {
#   # Log the correction
#   Log-Correction -TaskId $TaskId -Phase "Auditoria" -Agent "@auditor" -Description "Correcao XSS" -Reason "Input malicioso" -Impact "Seguranca"
# }

# Exporta estritamente a API do Kernel
Export-ModuleMember -Function Test-TaskSchema, Add-AgentTask, Invoke-TaskCleanup, Get-AgentTaskStatus
Export-ModuleMember -Function Log-Correction #Exported Function
# Check Curator Veto AFTER verifier
if ($Task.agent -eq "@verifier" -and $Task.phase -eq "5") {
    if (Test-CuratorVeto -TaskId $Task.id) {
        $correctionsLogPath = Join-Path $Script:LogPath "corrections.log"
        # Log the veto
        Log-Correction -TaskId $TaskId -Phase "Verificação" -Agent "@verifier" -Description "Tarefa vetada pelo @curator" -Reason "Questões éticas ou estéticas não resolvidas" -Impact "Qualidade/Ética"

        # Update task status to 'vetoed'
        $Task.status = "vetoed"
        Add-AgentTask -NewTask $Task  # Save the updated task


        Write-Warning "  [KERNEL] @curator VETO DETECTED. Task $($Task.id) blocked."
        continue # Skip to the next task
    }
