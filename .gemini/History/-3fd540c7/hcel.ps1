# scripts/maintenance/migrate_json_to_sqlite.ps1
# Bridge para a Fase 1 da Visão 4D - Migra as tarefas do JSON legado para o DB SOTA.

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$QueuePath = Join-Path $ProjectRoot "queue\tasks.json"
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = "python"
$VenvPython = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
if (Test-Path $VenvPython) { $PythonCmd = $VenvPython }

Write-Host "Iniciando migracao de tasks.json para SQLite..." -ForegroundColor Cyan

# Inicializa o DB através do Python DAL
& $PythonCmd $PyScript db-init

if (Test-Path $QueuePath) {
    $raw = Get-Content $QueuePath -Raw -Encoding UTF8
    if (-not [string]::IsNullOrWhiteSpace($raw)) {
        $payload = $raw | ConvertFrom-Json
        $queue = if ($null -ne $payload.tasks) { @($payload.tasks) } else { @($payload) }
        
        $count = 0
        foreach ($task in $queue) {
            $taskJson = $task | ConvertTo-Json -Depth 10 -Compress:$true
            $taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
            $output = & $PythonCmd $PyScript db-add $taskB64
            if ($LASTEXITCODE -eq 0) { $count++ } else { Write-Host "Falha ao migrar tarefa $($task.id): $output" -ForegroundColor Red }
        }
        Write-Host "Migracao concluida. $count tarefas inseridas no SQLite (queue/tasks.db)." -ForegroundColor Green
        
        # Backup do JSON original como prova criptográfica do legado
        $bakPath = "$QueuePath.bak.$(Get-Date -Format 'yyyyMMddHHmmss')"
        Move-Item -Path $QueuePath -Destination $bakPath -Force
        Write-Host "Arquivo JSON original ancorado para $bakPath" -ForegroundColor DarkGray
    }
    else { Write-Host "O arquivo tasks.json esta vazio. Nenhum dado a migrar." -ForegroundColor Yellow }
}
else { Write-Host "Nenhum arquivo tasks.json encontrado para migrar." -ForegroundColor Yellow }