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
        $queueJson = $rawQueueContent | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Write-Error "[ERRO] Arquivo de fila JSON corrompido em '$queuePath'. Detalhes: $_"
        Write-Warning "Backup disponível em: $queuePath.backup"
        return
    }
    
    # Garantir array
    if ($queueJson -isnot [array]) {
        $queueJson = @($queueJson)
    }
    
    if (-not $TaskId) {
        # Nenhum ID fornecido, mostrar resumo de todas as tarefas
        if ($queueJson.Count -eq 0) {
            Write-Output "Nenhuma tarefa na fila."
        } else {
            Write-Output "Status de todas as tarefas na fila ($($queueJson.Count) tarefas):"
            $queueJson | Format-Table -Property Id, Status, Timestamp -AutoSize
        }
    }
    else {
        # ID fornecido, buscar tarefa específica
        $task = $queueJson | Where-Object { $_.id -eq $TaskId }
        
        if ($task) {
            Write-Output "Detalhes da Tarefa:"
            $task | Format-List
            
            # Buscar logs relacionados a esta tarefa
            Write-Output "`nLogs de Execução para a Tarefa $TaskId`:"
            $logContent = Get-Content -Path $logPath -ErrorAction SilentlyContinue
            $taskLogs = $logContent | Select-String -Pattern $TaskId -Context 1, 1
            
            if ($taskLogs) {
                $taskLogs
            }
            else {
                Write-Output "Nenhum log de execução encontrado para esta tarefa."
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
