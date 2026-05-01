param(
    [Parameter(Position = 0)]
    [string]$TaskId
)

# Carregar Ambiente Global
$EnvPath = Join-Path $PSScriptRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

# Caminho para a fila de tarefas (Usa Env ou Fallback)
$queuePath = if ($Global:AgentPaths) { $Global:AgentPaths.Queue } else { Join-Path $PSScriptRoot "queue\tasks.json" }

try {
    # Ler a fila de tarefas
    if (-not (Test-Path $queuePath)) {
        Write-Output "O sistema esta vazio. Nenhuma tarefa encontrada em '$queuePath'."
        return
    }

    $rawQueueContent = Get-Content -Path $queuePath -Raw -ErrorAction Stop
    
    # Validar JSON
    try {
        $queueObj = $rawQueueContent | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Write-Error "[ERRO] Arquivo de fila JSON corrompido em '$queuePath'. Detalhes: $_"
        Write-Warning "Backup disponivel em: $queuePath.backup"
        return
    }
    
    # Extrair array de tarefas (v4.0 schema)
    $tasks = if ($queueObj.tasks) { $queueObj.tasks } else { @() }
    
    # Garantir sempre array
    if ($tasks -isnot [array]) {
        $tasks = @($tasks)
    }    
    
    if (-not $TaskId) {
        # Nenhum ID fornecido, mostrar resumo de todas as tarefas
        if ($tasks.Count -eq 0) {
            Write-Output "Nenhuma tarefa na fila."
            Write-Output "`nMetadados da fila:"
            Write-Output "  Versao: $($queueObj.version)"
            Write-Output "  Criada em: $($queueObj.createdAt)"
            Write-Output "  Ultima modificacao: $($queueObj.lastModified)"
        }
        else {
            Write-Output "Status de todas as tarefas na fila ($($tasks.Count) tarefas):"
            Write-Output ""
            
            # Resumo por status
            $statusGroups = $tasks | Group-Object -Property status
            foreach ($group in $statusGroups) {
                Write-Output "  $($group.Name): $($group.Count)"
            }
            Write-Output ""
            
            # Tabela completa
            $tasks | Format-Table -Property Id, Status, @{Expression = { 
                    $desc = if ($_.description) { $_.description } else { $_.prompt }
                    if ($desc) { $desc.Substring(0, [Math]::Min(50, $desc.Length)) } else { "" }
                }; Label                                             = "Descricao" 
            } -AutoSize
            
            Write-Output "`nMetadados da fila:"
            Write-Output "  Versao: $($queueObj.version)"
            
            if ($queueObj.updatedAt) { Write-Output "  Ultima modificacao: $($queueObj.updatedAt)" }
            elseif ($queueObj.lastModified) { Write-Output "  Ultima modificacao: $($queueObj.lastModified)" }

            if ($queueObj.checksum) { Write-Output "  Checksum: $($queueObj.checksum.Substring(0, 16))..." }
            if ($queueObj.metadata.maxRetries) { Write-Output "  Max Retries: $($queueObj.metadata.maxRetries)" }
        }
    }
    else {
        # ID fornecido, buscar tarefa especifica
        $task = $tasks | Where-Object { $_.id -eq $TaskId }
        
        if ($task) {
            Write-Output "Detalhes da Tarefa:"
            Write-Output ""
            Write-Output "  ID: $($task.id)"
            Write-Output "  Status: $($task.status)"
            if ($task.description) { Write-Output "  Descricao: $($task.description)" }
            elseif ($task.prompt) { Write-Output "  Prompt: $($task.prompt)" }
            Write-Output "  Criada em: $($task.createdAt)"
            Write-Output "  Timestamp: $($task.timestamp)"
            if ($task.completedAt) {
                Write-Output "  Completada em: $($task.completedAt)"
            }
            Write-Output "  Tentativas (Retries): $($task.retries)"
        }
        else {
            Write-Warning "Nenhuma tarefa encontrada com o ID: $TaskId"
        }
    }
    
}
catch {
    Write-Error "Falha ao processar a fila de tarefas ou logs. Detalhes: $_"
}

