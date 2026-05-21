param(
    [Parameter(Position = 0)]
    [ValidateSet("queue", "system", "full")]
    [string]$View = "full",
    
    [Parameter()]
    [switch]$Live = $false,
    
    [Parameter()]
    [int]$RefreshSeconds = 5
)

# Configuração
$queuePath = Join-Path $PSScriptRoot "queue\tasks.json"
$logPath = Join-Path $PSScriptRoot "logs\task_log.md"
$archivePath = Join-Path $PSScriptRoot "logs\tasks_archived.json"

function ConvertTo-ConsoleColor {
    param([string]$Status)
    switch ($Status) {
        "pending" { return "Yellow" }
        "running" { return "Cyan" }
        "completed" { return "Green" }
        "failed" { return "Red" }
        default { return "White" }
    }
}

function Get-QueueStats {
    try {
        if (-not (Test-Path $queuePath)) {
            return @{
                total        = 0
                pending      = 0
                running      = 0
                completed    = 0
                failed       = 0
                version      = "vazio"
                lastModified = "N/A"
                archiveCount = 0
            }
        }

        $queueObj = Get-Content -Path $queuePath -Raw | ConvertFrom-Json -ErrorAction Stop
        $tasks = if ($queueObj.tasks) { $queueObj.tasks } else { @() }
        
        if ($tasks -isnot [array]) { $tasks = @($tasks) }

        $stats = @{
            total        = $tasks.Count
            pending      = ($tasks | Where-Object { $_.status -eq "pending" } | Measure-Object).Count
            running      = ($tasks | Where-Object { $_.status -eq "running" } | Measure-Object).Count
            completed    = ($tasks | Where-Object { $_.status -eq "completed" } | Measure-Object).Count
            failed       = ($tasks | Where-Object { $_.status -eq "failed" } | Measure-Object).Count
            version      = $queueObj.version
            lastModified = $queueObj.lastModified
            queueSize    = (Get-Item $queuePath).Length
            archiveCount = 0
        }

        # Contar arquivos de arquivo
        if (Test-Path $archivePath) {
            try {
                $archiveObj = Get-Content -Path $archivePath -Raw | ConvertFrom-Json -ErrorAction Stop
                $archivedTasks = if ($archiveObj.tasks) { $archiveObj.tasks } else { @($archiveObj) }
                if ($archivedTasks -isnot [array]) { $archivedTasks = @($archivedTasks) }
                $stats.archiveCount = $archivedTasks.Count
            }
            catch {
                $stats.archiveCount = 0
            }
        }

        return $stats
    }
    catch {
        Write-Error "Falha ao obter estatísticas da fila: $_"
        return $null
    }
}

function Get-SystemStats {
    try {
        $logSize = if (Test-Path $logPath) { (Get-Item $logPath).Length } else { 0 }
        $queueBackups = @(Get-ChildItem -Path (Split-Path $queuePath) -Filter "tasks.json.backup*" -ErrorAction SilentlyContinue)
        
        $uptime = [System.Diagnostics.Process]::GetCurrentProcess().StartTime
        $psVersion = $PSVersionTable.PSVersion.Major
        
        return @{
            timestamp   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            queueFile   = $queuePath
            logFile     = $logPath
            logSize     = $logSize
            backupCount = $queueBackups.Count
            psVersion   = $psVersion
            osVersion   = [System.Environment]::OSVersion.VersionString
            diskFreeGB  = ([System.IO.DriveInfo]::GetDrives() | Where-Object { $_.IsReady } | Where-Object { $_.RootDirectory -like "C:*" }).AvailableFreeSpace / 1GB
        }
    }
    catch {
        Write-Error "Falha ao obter estatísticas do sistema: $_"
        return $null
    }
}

function Show-QueueDashboard {
    $stats = Get-QueueStats
    if (-not $stats) { return }

    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║           DASHBOARD DA FILA DE TAREFAS - WORKFLOW v5          ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "📊 ESTATÍSTICAS" -ForegroundColor White -BackgroundColor DarkCyan
    Write-Host "  Total de Tarefas: " -NoNewline
    Write-Host "$($stats.total)" -ForegroundColor White -BackgroundColor DarkBlue
    
    Write-Host "  ├─ Pendentes:  " -NoNewline
    Write-Host "$($stats.pending)" -ForegroundColor Yellow
    Write-Host "  ├─ Em Execução: " -NoNewline
    Write-Host "$($stats.running)" -ForegroundColor Cyan
    Write-Host "  ├─ Completadas: " -NoNewline
    Write-Host "$($stats.completed)" -ForegroundColor Green
    Write-Host "  └─ Falhadas:   " -NoNewline
    Write-Host "$($stats.failed)" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "📁 ARMAZENAMENTO" -ForegroundColor White -BackgroundColor DarkCyan
    Write-Host "  Versão da Fila: $($stats.version)"
    Write-Host "  Tamanho (queue/tasks.json): $([Math]::Round($stats.queueSize / 1KB, 2)) KB"
    Write-Host "  Tarefas Arquivadas: $($stats.archiveCount)"
    Write-Host "  Última Modificação: $($stats.lastModified)"
    
    Write-Host ""
    Write-Host "⚡ PRÓXIMAS AÇÕES" -ForegroundColor White -BackgroundColor DarkCyan
    
    if ($stats.pending -gt 0) {
        Write-Host "  • $($stats.pending) tarefa(s) aguardando processamento" -ForegroundColor Yellow
    }
    if ($stats.running -gt 0) {
        Write-Host "  • $($stats.running) tarefa(s) em execução" -ForegroundColor Cyan
    }
    if ($stats.failed -gt 0) {
        Write-Host "  • $($stats.failed) tarefa(s) falhada(s) requer investigação!" -ForegroundColor Red
    }
    if ($stats.total -gt 50) {
        Write-Host ("  • Fila grande ({0} tarefas). Considere executar cleanup.ps1" -f $stats.total) -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "📋 COMANDOS DISPONÍVEIS" -ForegroundColor White -BackgroundColor DarkCyan
    Write-Host "  .\do.ps1 'descrição'       - Enfileirar nova tarefa"
    Write-Host "  .\status.ps1 [TaskId]      - Ver status de tarefas"
    Write-Host "  .\cleanup.ps1              - Arquivar tarefas completadas"
    Write-Host "  .\dashboard.ps1 -Live      - Modo ao vivo (atualiza a cada 5s)"
    Write-Host ""
}

function Show-SystemDashboard {
    $sysStats = Get-SystemStats
    if (-not $sysStats) { return }

    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║              INFORMAÇÕES DO SISTEMA - 2026-03-12              ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""

    Write-Host "🖥️  SISTEMA OPERACIONAL" -ForegroundColor White -BackgroundColor DarkMagenta
    Write-Host "  PowerShell Version: $($sysStats.psVersion)"
    Write-Host "  OS Version: $($sysStats.osVersion)"
    Write-Host "  Disco Livre (C:): $([Math]::Round($sysStats.diskFreeGB, 2)) GB"
    
    Write-Host ""
    Write-Host "📂 ARQUIVOS" -ForegroundColor White -BackgroundColor DarkMagenta
    Write-Host "  Caminho da Fila: $($sysStats.queueFile)"
    Write-Host "  Arquivo de Log: $($sysStats.logFile)"
    Write-Host "  Tamanho do Log: $([Math]::Round($sysStats.logSize / 1KB, 2)) KB"
    Write-Host "  Backups Disponíveis: $($sysStats.backupCount)"
    
    Write-Host ""
    Write-Host "⏰ TIMESTAMP" -ForegroundColor White -BackgroundColor DarkMagenta
    Write-Host "  $($sysStats.timestamp)"
    Write-Host ""
}

# Main execution
try {
    if ($Live) {
        Write-Host "[INFO] Modo ao vivo ativado. Atualizando a cada $RefreshSeconds segundos. Pressione Ctrl+C para sair." -ForegroundColor Gray
        
        do {
            Clear-Host
            Show-QueueDashboard
            
            if ($View -eq "full" -or $View -eq "system") {
                Show-SystemDashboard
            }
            
            Write-Host "⏱️  Próxima atualização em $RefreshSeconds segundos... ($(Get-Date -Format 'HH:mm:ss'))" -ForegroundColor Gray
            Start-Sleep -Seconds $RefreshSeconds
        } while ($true)
    }
    else {
        # Modo snapshot (uma única exibição)
        Show-QueueDashboard
        
        if ($View -eq "full" -or $View -eq "system") {
            Show-SystemDashboard
        }
    }
}
catch {
    Write-Error "Erro ao exibir dashboard: $_"
    exit 1
}
