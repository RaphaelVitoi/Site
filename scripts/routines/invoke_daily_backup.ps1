<#
.SYNOPSIS
    Gatilho de Backup Diario SOTA (A ser executado via Task Scheduler ou pelo proprio @skillmaster em loop).
.DESCRIPTION
    Enfileira uma tarefa de alta prioridade para o @skillmaster executar um backup online
    do banco de dados, garantindo a integridade dos dados sem interromper a operacao.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$EnvPath = Join-Path $ProjectRoot '_env.ps1'
if (Test-Path $EnvPath) { . $EnvPath }

Write-Host '=== [SKILLMASTER] INICIANDO PROTOCOLO DE BACKUP DIARIO SOTA ===' -ForegroundColor Cyan

$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }
$Executor = Join-Path $ProjectRoot 'task_executor.py'

Write-Host '[INFO] Verificando atividade recente no banco de dados para justificar o backup...' -ForegroundColor Cyan

$IsLightBackup = $false

try {
    # Consulta o Kernel para tarefas criadas/modificadas nas ultimas 24h
    $recentActivityRaw = & $PythonCmd $Executor db-get all --since 24h --json

    # SOTA: Purifica o output para garantir que avisos de log (stderr/stdout) nao quebrem o parser
    $recentActivityJson = $recentActivityRaw | Where-Object { $_ -match '^\s*\[|^\s*\{' } | Select-Object -First 1
    $recentTasks = if ($recentActivityJson) { $recentActivityJson | ConvertFrom-Json } else { @() }

    if ($recentTasks.Count -eq 0) {
        Write-Host '[ECONOMIA GENERALIZADA] Nenhuma atividade detectada nas últimas 24 horas. Agendando backup LEVE (apenas tasks.db).' -ForegroundColor Green
        $IsLightBackup = $true
    }
    else {
        Write-Host "[INFO] Atividade detectada ($($recentTasks.Count) tarefas). Prosseguindo com o backup SOTA..." -ForegroundColor Green
    }
}
catch {
    # Se a verificação falhar, é mais seguro prosseguir com o backup por precaução.
    Write-Warning "[AVISO] Falha ao verificar a atividade recente. Prosseguindo com o backup por precaução. Erro: $($_.Exception.Message)"
}

$taskId = if ($IsLightBackup) { "BACKUP-LIGHT-$(Get-Date -Format 'yyyyMMdd')" } else { "BACKUP-DAILY-$(Get-Date -Format 'yyyyMMdd')" }
$taskDescription = @"
DIRETRIZ DE MANUTENCAO SOTA:
Execute um backup online do banco de dados (tasks.db) para garantir a integridade dos dados e a longevidade do ecossistema.
Use o comando de God Mode para invocar o motor de backup online do kernel.

Comando: `python task_executor.py db-backup-online`
"@

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = 'pending'
    timestamp   = (Get-Date -Format 'o')
    agent       = '@skillmaster'
    metadata    = @{ priority = 'critical' }
}

# SOTA Python DAL
$taskJson = $task | ConvertTo-Json -Depth 10 -Compress
$taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))

$output = & $PythonCmd $Executor db-add $taskB64
if ($LASTEXITCODE -ne 0) { Write-Error "Falha critica ao enfileirar tarefa de backup: $output"; exit 1 }

Write-Host "[OK] Tarefa de backup diario ($taskId) enfileirada para o @skillmaster." -ForegroundColor Green
Write-Host '[ACAO RECOMENDADA] O @skillmaster executara esta tarefa no proximo ciclo do worker.' -ForegroundColor Yellow
