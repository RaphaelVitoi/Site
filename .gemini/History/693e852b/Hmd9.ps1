param(
    [Parameter(Position = 0)]
    [ValidateSet("queue", "system", "full")]
    [string]$View = "full",
    
    [Parameter()]
    [switch]$Live = $false,
    
    [Parameter()]
    [int]$RefreshSeconds = 5
)

$queuePath = Join-Path $PSScriptRoot "queue\tasks.json"

function Get-QueueStats {
    try {
        if (-not (Test-Path $queuePath)) {
            return @{total=0; pending=0; running=0; completed=0; failed=0; version="vazio"; lastModified="N/A"}
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
        }
        return $stats
    }
    catch {
        Write-Host "Erro ao ler fila: $_" -ForegroundColor Red
        return $null
    }
}

function Show-Dashboard {
    $stats = Get-QueueStats
    if (-not $stats) { return }

    Write-Host ""
    Write-Host "===== DASHBOARD FILA TAREFAS =====" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Estatisticas:" -ForegroundColor White
    Write-Host "  Total: $($stats.total)" 
    Write-Host "  Pendentes: $($stats.pending)" -ForegroundColor Yellow
    Write-Host "  Em Execucao: $($stats.running)" -ForegroundColor Cyan
    Write-Host "  Completadas: $($stats.completed)" -ForegroundColor Green
    Write-Host "  Falhadas: $($stats.failed)" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "Armazenamento:" -ForegroundColor White
    Write-Host "  Versao: $($stats.version)"
    Write-Host ("  Tamanho: {0} KB" -f [Math]::Round($stats.queueSize / 1KB, 2))
    Write-Host "  Modificado: $($stats.lastModified)"
    
    Write-Host ""
    Write-Host "Comandos:" -ForegroundColor White
    Write-Host "  .\do.ps1 'descricao'  - Enfileirar"
    Write-Host "  .\status.ps1          - Status"
    Write-Host "  .\cleanup.ps1         - Limpar"
    Write-Host "  .\dashboard.ps1 -Live - Modo vivo"
    Write-Host ""
}

if ($Live) {
    Write-Host "Modo vivo. Ctrl+C para sair." -ForegroundColor Gray
    do {
        Clear-Host
        Show-Dashboard
        Start-Sleep -Seconds $RefreshSeconds
    } while ($true)
}
else {
    Show-Dashboard
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

        $queueObj = Get-Content -Path $queuePath -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Stop
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
                $archiveObj = Get-Content -Path $archivePath -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Stop
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
        Write-Error "Falha ao obter estatisticas da fila: $_"
        return $null
    }
}

function Get-SystemStats {
    try {
        $queueBackups = @(Get-ChildItem -Path (Split-Path $queuePath) -Filter "backup_*.json" -ErrorAction SilentlyContinue)
        
        $psVersion = $PSVersionTable.PSVersion.Major
        
        return @{
            timestamp   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            queueFile   = $queuePath
            backupCount = $queueBackups.Count
            psVersion   = $psVersion
            osVersion   = [System.Environment]::OSVersion.VersionString
        }
    }
    catch {
        Write-Error "Falha ao obter estatisticas do sistema: $_"
        return $null
    }
}

function Show-QueueDashboard {
    $stats = Get-QueueStats
    if (-not $stats) { return }

    Write-Host ""
    Write-Host "=====================================================================" -ForegroundColor Cyan
    Write-Host "           DASHBOARD DA FILA DE TAREFAS - WORKFLOW v5              " -ForegroundColor Cyan
    Write-Host "=====================================================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "ESTATISTICAS" -ForegroundColor White -BackgroundColor DarkCyan
    Write-Host "  Total de Tarefas: $($stats.total)" -ForegroundColor White
    
    Write-Host "  Pendentes: $($stats.pending)" -ForegroundColor Yellow
    Write-Host "  Em Execucao: $($stats.running)" -ForegroundColor Cyan
    Write-Host "  Completadas: $($stats.completed)" -ForegroundColor Green
    Write-Host "  Falhadas: $($stats.failed)" -ForegroundColor Red
    
    Write-Host ""
    Write-Host "ARMAZENAMENTO" -ForegroundColor White -BackgroundColor DarkCyan
    Write-Host "  Versao da Fila: $($stats.version)"
    Write-Host ("  Tamanho (queue/tasks.json): {0} KB" -f [Math]::Round($stats.queueSize / 1KB, 2))
    Write-Host "  Tarefas Arquivadas: $($stats.archiveCount)"
    Write-Host "  Ultima Modificacao: $($stats.lastModified)"
    
    Write-Host ""
    Write-Host "PROXIMAS ACOES" -ForegroundColor White -BackgroundColor DarkCyan
    
    if ($stats.pending -gt 0) {
        Write-Host ("  - {0} tarefa(s) aguardando processamento" -f $stats.pending) -ForegroundColor Yellow
    }
    if ($stats.running -gt 0) {
        Write-Host ("  - {0} tarefa(s) em execucao" -f $stats.running) -ForegroundColor Cyan
    }
    if ($stats.failed -gt 0) {
        Write-Host ("  - {0} tarefa(s) falhada(s) requer investigacao!" -f $stats.failed) -ForegroundColor Red
    }
    if ($stats.total -gt 50) {
        Write-Host ("  - Fila grande ({0} tarefas). Considere executar cleanup.ps1" -f $stats.total) -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "COMANDOS DISPONIVEIS" -ForegroundColor White -BackgroundColor DarkCyan
    Write-Host "  .\do.ps1 'descricao'       - Enfileirar nova tarefa"
    Write-Host "  .\status.ps1 [TaskId]      - Ver status de tarefas"
    Write-Host "  .\cleanup.ps1              - Arquivar tarefas completadas"
    Write-Host "  .\dashboard.ps1 -Live      - Modo ao vivo (atualiza a cada 5s)"
    Write-Host ""
}

function Show-SystemDashboard {
    $sysStats = Get-SystemStats
    if (-not $sysStats) { return }

    Write-Host ""
    Write-Host "=====================================================================" -ForegroundColor Magenta
    Write-Host "              INFORMACOES DO SISTEMA - 2026-03-12                  " -ForegroundColor Magenta
    Write-Host "=====================================================================" -ForegroundColor Magenta
    Write-Host ""

    Write-Host "SISTEMA OPERACIONAL" -ForegroundColor White -BackgroundColor DarkMagenta
    Write-Host "  PowerShell Version: $($sysStats.psVersion)"
    Write-Host "  OS Version: $($sysStats.osVersion)"
    
    Write-Host ""
    Write-Host "ARQUIVOS" -ForegroundColor White -BackgroundColor DarkMagenta
    Write-Host "  Caminho da Fila: $($sysStats.queueFile)"
    Write-Host "  Backups Disponiveis: $($sysStats.backupCount)"
    
    Write-Host ""
    Write-Host "TIMESTAMP" -ForegroundColor White -BackgroundColor DarkMagenta
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
            
            Start-Sleep -Seconds $RefreshSeconds
        } while ($Live)
    }
    else {
        # Modo estatico
        Show-QueueDashboard
        
        if ($View -eq "full" -or $View -eq "system") {
            Show-SystemDashboard
        }
    }
}
catch {
    Write-Error "Erro ao executar dashboard: $_"
    exit 1
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

        $queueObj = Get-Content -Path $queuePath -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Stop
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

    Write-Host "ESTATISTICAS" -ForegroundColor White -BackgroundColor DarkCyan
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
    Write-Host "ARMAZENAMENTO" -ForegroundColor White -BackgroundColor DarkCyan
    Write-Host "  Versão da Fila: $($stats.version)"
    Write-Host "  Tamanho (queue/tasks.json): $([Math]::Round($stats.queueSize / 1KB, 2)) KB"
    Write-Host "  Tarefas Arquivadas: $($stats.archiveCount)"
    Write-Host "  Última Modificação: $($stats.lastModified)"
    
    Write-Host ""
    Write-Host "PROXIMAS ACOES" -ForegroundColor White -BackgroundColor DarkCyan
    
    if ($stats.pending -gt 0) {
        Write-Host ("  - {0} tarefa(s) aguardando processamento" -f $stats.pending) -ForegroundColor Yellow
    }
    if ($stats.running -gt 0) {
        Write-Host ("  - {0} tarefa(s) em execucao" -f $stats.running) -ForegroundColor Cyan
    }
    if ($stats.failed -gt 0) {
        Write-Host ("  - {0} tarefa(s) falhada(s) requer investigacao!" -f $stats.failed) -ForegroundColor Red
    }
    if ($stats.total -gt 50) {
        Write-Host ("  - Fila grande ({0} tarefas). Considere executar cleanup.ps1" -f $stats.total) -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "COMANDOS DISPONIVEIS" -ForegroundColor White -BackgroundColor DarkCyan
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

    Write-Host "SISTEMA OPERACIONAL" -ForegroundColor White -BackgroundColor DarkMagenta
    Write-Host "  PowerShell Version: $($sysStats.psVersion)"
    Write-Host "  OS Version: $($sysStats.osVersion)"
    Write-Host "  Disco Livre (C:): $([Math]::Round($sysStats.diskFreeGB, 2)) GB"
    
    Write-Host ""
    Write-Host "ARQUIVOS" -ForegroundColor White -BackgroundColor DarkMagenta
    Write-Host "  Caminho da Fila: $($sysStats.queueFile)"
    Write-Host "  Arquivo de Log: $($sysStats.logFile)"
    Write-Host "  Tamanho do Log: $([Math]::Round($sysStats.logSize / 1KB, 2)) KB"
    Write-Host "  Backups Disponíveis: $($sysStats.backupCount)"
    
    Write-Host ""
    Write-Host "TIMESTAMP" -ForegroundColor White -BackgroundColor DarkMagenta
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
            
            Write-Host ("Proxima atualizacao em {0} segundos... ({1})" -f $RefreshSeconds, (Get-Date -Format 'HH:mm:ss')) -ForegroundColor Gray
            Start-Sleep -Seconds $RefreshSeconds
        } while ($true)
    }
    else {
        # Modo snapshot (uma unica exibicao)
        Show-QueueDashboard
        
        if ($View -eq "full" -or $View -eq "system") {
            Show-SystemDashboard
        }
    }
}
catch {
    Write-Error "Erro ao executar dashboard: $_"
    exit 1
}
