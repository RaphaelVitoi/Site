param(
    [Parameter(Position = 0)]
    [string]$TaskId
)

# Caminhos para os arquivos
$queuePath = Join-Path $PSScriptRoot "queue\tasks.json"
$logPath = Join-Path $PSScriptRoot "logs\task_log.md"

try {
    # Ler a fila de tarefas
    if (-not (Test-Path $queuePath)) {
        Write-Output "O sistema está vazio. Nenhuma tarefa encontrada em '$queuePath'."
        return
    }

    $rawQueueContent = Get-Content -Path $queuePath -Raw -ErrorAction Stop
    
    # Validar JSON
    try {
        $queueObj = $rawQueueContent | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Write-Error "[ERRO] Arquivo de fila JSON corrompido em '$queuePath'. Detalhes: $_"
        Write-Warning "Backup disponível em: $queuePath.backup"
        return
    }
    
    # Extrair array de tarefas (v1.0 schema)
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
            Write-Output "  Versão: $($queueObj.version)"
            Write-Output "  Criada em: $($queueObj.createdAt)"
            Write-Output "  Última modificação: $($queueObj.lastModified)"
        } else {
            Write-Output "Status de todas as tarefas na fila ($($tasks.Count) tarefas):"
            Write-Output ""
            
            # Resumo por status
            $statusGroups = $tasks | Group-Object -Property status
            foreach ($group in $statusGroups) {
                Write-Output "  $($group.Name): $($group.Count)"
            }
            Write-Output ""
            
            # Tabela completa
            $tasks | Format-Table -Property Id, Status, @{Expression={$_.prompt.Substring(0, [Math]::Min(40, $_.prompt.Length))}; Label="Prompt"} -AutoSize
            
            Write-Output "`nMetadados da fila:"
            Write-Output "  Versão: $($queueObj.version)"
            Write-Output "  Última modificação: $($queueObj.lastModified)"
            Write-Output "  Max Retries: $($queueObj.metadata.maxRetries)"
        }
    }
    else {
        # ID fornecido, buscar tarefa específica
        $task = $tasks | Where-Object { $_.id -eq $TaskId }
        
        if ($task) {
            Write-Output "Detalhes da Tarefa:"
            Write-Output ""
            Write-Output "  ID: $($task.id)"
            Write-Output "  Status: $($task.status)"
            Write-Output "  Prompt: $($task.prompt)"
            Write-Output "  Criada em: $($task.createdAt)"
            Write-Output "  Timestamp: $($task.timestamp)"
            if ($task.completedAt) {
                Write-Output "  Completada em: $($task.completedAt)"
            }
            Write-Output "  Tentativas (Retries): $($task.retries)"
            Write-Output ""
            
            # Buscar logs relacionados a esta tarefa
            Write-Output "Logs de Execução para a Tarefa $TaskId`:"
            if (Test-Path $logPath) {
                $logContent = Get-Content -Path $logPath -ErrorAction SilentlyContinue
                $taskLogs = $logContent | Select-String -Pattern $TaskId -Context 1, 1
                
                if ($taskLogs) {
                    $taskLogs
                }
                else {
                    Write-Output "Nenhum log de execução encontrado para esta tarefa."
                }
            } else {
                Write-Output "Arquivo de log não existe ainda: $logPath"
            }
        }
        else {
            Write-Warning "Nenhuma tarefa encontrada com o ID: $TaskId"
        }
    }
    
}
catch {
    Write-Error "Falha ao processar a fila de tarefas ou logs. Detalhes: $_"
}
