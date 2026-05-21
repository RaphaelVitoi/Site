param(
    [Parameter(Position = 0)]
    [int]$DaysToKeep = 30,
    
    [Parameter()]
    [switch]$ArchiveAll = $false
)

# Configuração
$queuePath = Join-Path $PSScriptRoot "queue\tasks.json"
$archivePath = Join-Path $PSScriptRoot "logs\tasks_archived.json"

# Garantir que os diretórios existem
$logDir = Split-Path $archivePath
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }

Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [CLEANUP] Iniciando limpeza de fila de tarefas..."

try {
    # Ler fila atual
    if (-not (Test-Path $queuePath)) {
        Write-Output "Nenhuma fila encontrada em '$queuePath'. Nada para limpar."
        return
    }
    
    $rawContent = Get-Content -Path $queuePath -Raw -ErrorAction Stop
    
    if ([string]::IsNullOrWhiteSpace($rawContent)) {
        Write-Output "Fila está vazia. Nada para limpar."
        return
    }
    
    # Parsear JSON com v1.0 schema
    try {
        $queueObj = $rawContent | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Write-Error "[CLEANUP] JSON corrompido. Nada foi feito."
        return
    }
    
    # Extrair tasks (v1.0 schema)
    $tasks = if ($queueObj.tasks) { $queueObj.tasks } else { @() }
    
    # Garantir que é array
    if ($tasks -isnot [array]) {
        $tasks = @($tasks)
    }
    
    $cutoffDate = (Get-Date).AddDays(-$DaysToKeep)
    
    # Separar tarefas completadas antigas de tarefas a manter
    $toArchive = @()
    $toKeep = @()
    
    foreach ($task in $tasks) {
        $taskDate = [datetime]::Parse($task.timestamp)
        
        if ($ArchiveAll) {
            # Modo arquivo tudo
            if ($task.status -eq "completed") {
                $toArchive += $task
            }
            else {
                $toKeep += $task
            }
        }
        else {
            # Modo arquivo por data
            if ($taskDate -lt $cutoffDate -and $task.status -eq "completed") {
                $toArchive += $task
            }
            else {
                $toKeep += $task
            }
        }
    }
    
    # Processar arquivamento
    if ($toArchive.Count -gt 0) {
        # Ler arquivo de arquivos se existir
        $existingArchives = @()
        if (Test-Path $archivePath) {
            $archiveRawContent = Get-Content -Path $archivePath -Raw
            if (-not [string]::IsNullOrWhiteSpace($archiveRawContent)) {
                $archiveObj = $archiveRawContent | ConvertFrom-Json -ErrorAction SilentlyContinue
                
                if ($archiveObj.tasks) {
                    $existingArchives = @($archiveObj.tasks)
                }
                else {
                    $existingArchives = @($archiveObj)
                }
                
                if ($existingArchives -isnot [array]) {
                    $existingArchives = @($existingArchives)
                }
            }
        }
        
        # Combinar e escrever com schema v1.0
        $allArchives = @($existingArchives) + @($toArchive)
        
        $archiveObj = @{
            version      = "1.0"
            createdAt    = (Get-Date -Format "o")
            lastModified = (Get-Date -Format "o")
            metadata     = @{
                description = "Arquivo de tarefas completadas (histórico)"
                sourceFile  = $queuePath
            }
            tasks        = @($allArchives)
        }
        
        $archiveObj | ConvertTo-Json -Depth 10 | Set-Content -Path $archivePath -Encoding UTF8
        
        Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [CLEANUP] Arquivadas $($toArchive.Count) tarefas completadas"
    }
    
    # Escrever fila atualizada (v1.0 schema)
    if ($toKeep.Count -gt 0 -or $queueObj.version) {
        # Atualizar objeto da fila
        $queueObj.tasks = @($toKeep)
        $queueObj.lastModified = (Get-Date -Format "o")
        
        $queueObj | ConvertTo-Json -Depth 10 | Set-Content -Path $queuePath -Encoding UTF8
    }
    else {
        # Se nenhuma tarefa para manter, criar estrutura v1.0 vazia
        $emptyQueue = @{
            version = "1.0"
            createdAt = (Get-Date -Format "o")
            lastModified = (Get-Date -Format "o")
            metadata = @{
                description = "Fila de tarefas do Workflow v5"
                maxRetries = 3
                archiveThresholdDays = 30
            }
            tasks = @()
        }
        $emptyQueue | ConvertTo-Json -Depth 10 | Set-Content -Path $queuePath -Encoding UTF8
    }
    
    Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [CLEANUP] Tarefas retidas na fila: $($toKeep.Count)"
    Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [CLEANUP] Status:"
    Write-Output "  - Pending: $($toKeep | Where-Object { $_.status -eq 'pending' } | Measure-Object | Select-Object -ExpandProperty Count)"
    Write-Output "  - Running: $($toKeep | Where-Object { $_.status -eq 'running' } | Measure-Object | Select-Object -ExpandProperty Count)"
    Write-Output "  - Completed: $($toKeep | Where-Object { $_.status -eq 'completed' } | Measure-Object | Select-Object -ExpandProperty Count)"
    Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [CLEANUP] Conclusão bem-sucedida"
    
}
catch {
    Write-Error "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [CLEANUP] Falha ao limpar fila de tarefas. Detalhes: $_"
}
