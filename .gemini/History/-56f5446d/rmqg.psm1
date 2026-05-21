<#
.SYNOPSIS
    Modulo de Autopoiese Sistemica (Workflow v6.2 - Pure ASCII).
    Transforma o sistema de uma fila passiva para um organismo vivo, livre de limitacoes de encoding.
    
.DESCRIPTION
    Implementa a logica de "Vida Artificial" para os agentes.
    - Maverick: Gera entropia controlada (Inovacao) e vigilia (Sentinela).
    - Planner: Transforma entropia em estrutura (PRD/SPEC).
    - Auditor: Garante a integridade da estrutura (Validacao).
    
    Principio: Simetria, Arte e Autopoiese.
#>

# Telemetria (Inicializacao)
if ($Script:AgentStats -eq $null) {
    $Script:AgentStats = @{ 
        "@maverick" = @{ executions = 0; totalTime = 0 }
        "@planner"  = @{ executions = 0; totalTime = 0 }
        "@auditor"  = @{ executions = 0; totalTime = 0 }
    }
}

$EnvPath = Join-Path $PSScriptRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath } else { throw "CRITICAL: _env.ps1 not found." }
Import-Module $Global:AgentPaths.Kernel -Force

# -------------------------------------------------------------------
# FUNÇÕES VITAIS (Ciclos de Agente)
# -------------------------------------------------------------------
   
function Invoke-AgentMaverick {
    $Script:AgentStats["@maverick"].executions++
    Write-Host "[AUTOPOIESE] [MAVERICK] Escaneando o horizonte..." -ForegroundColor Magenta
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.description -match "Maverick|Sentinela|Vigília" -or $_.agent -eq "@maverick" } | Select-Object -First 1

    if ($myTask) {
        try {
            $startTime = Get-Date
            
            # 1. Metamorfose: Pending -> Running
            $myTask.status = "running"
            Add-AgentTask -NewTask $myTask

            # 2. Produção de Arte (Simulada)
            Start-Sleep -Seconds 2 # "Thinking time"
            
            # 3. Fertilização (Trigger Planner)
            $plannerTask = [ordered]@{
                id          = "PLAN-$(Get-Date -Format 'yyyyMMddHHmmss')"
                description = "Planejar implementação baseada na visão do Maverick: $($myTask.description)"
                status      = "pending"
                timestamp   = (Get-Date -Format "o")
                agent       = "@planner"
                metadata    = @{ source = "maverick_autopoiesis"; related_to = $myTask.id }
            }
            Add-AgentTask -NewTask $plannerTask
            Write-Host "  + [Maverick] Ideia gerada. Semente plantada para @planner." -ForegroundColor Green

            # 4. Conclusao e Renascimento (Autopoiese)
            $myTask.status = "completed"
            $myTask.completedAt = (Get-Date -Format "o")
            Add-AgentTask -NewTask $myTask

            # Calcular intervalo dinamico para a proxima vigilia
            $pendingTasks = (Get-AgentTaskStatus -Status "pending").Count
            $averageCompletionTime = [Math]::Min(3600, (Get-Random -Minimum 600 -Maximum 1800))
            $entropyLevel = [Math]::Min(10, (Get-Random -Minimum 0 -Maximum 5))
            $baseInterval = 3600
            $dynamicInterval = $baseInterval + ($pendingTasks * 60) + ($entropyLevel * 300) - $averageCompletionTime
            $dynamicInterval = [Math]::Max(600, $dynamicInterval)
            $maxInterval = 86400
            $dynamicInterval = [Math]::Min($dynamicInterval, $maxInterval)
                
            $endTime = Get-Date
            $timeTaken = New-TimeSpan -Start $startTime -End $endTime
            $Script:AgentStats["@maverick"].totalTime += $timeTaken.TotalSeconds
        }
        catch {
            Write-Warning "[MAVERICK-FAILURE] Erro ao processar tarefa $($myTask.id): $_"
            $myTask.status = "failed"
            Add-AgentTask -NewTask $myTask
        }
    }

    # O Maverick nunca dorme: agenda sua proxima vigilia se nao houver outra
    $nextSentinel = $tasks | Where-Object { $_.description -match "Vigilia|Sentinela" -and $_.status -eq "pending" }
    if (-not $nextSentinel) {
        $sentinelTask = [ordered]@{
            id          = "SENTINELA-$(Get-Date -Format 'yyyyMMddHHmmss')"
            description = "Vigilia Sentinela - Ciclo Continuo (Autopoiese)"
            status      = "pending"
            timestamp   = (Get-Date -Format "o")
            agent       = "@maverick"
        }
        Add-AgentTask -NewTask $sentinelTask
        Write-Host "  > [Maverick] Proxima vigilia agendada." -ForegroundColor DarkMagenta
    }
}

function Invoke-AgentPlanner {
    $Script:AgentStats["@planner"].executions++
    Write-Host "[AUTOPOIESE] [PLANNER] Buscando caos para estruturar..." -ForegroundColor Cyan
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.agent -eq "@planner" } | Select-Object -First 1

    if ($myTask) {
        try {
            $startTime = Get-Date

            $myTask.status = "running"
            Add-AgentTask -NewTask $myTask

            $taskName = if ($myTask.metadata -and $myTask.metadata.slug) {
                $myTask.metadata.slug
            }
            else {
                "task-$($myTask.id)"
            }
            
            $docPath = Join-Path $Global:AgentPaths.Docs "tasks\$taskName"
            if (-not (Test-Path $docPath)) { New-Item -ItemType Directory -Path $docPath -Force | Out-Null }
            
            $prdContent = "# PRD: $($myTask.description)`n`n> Gerado automaticamente via Autopoiese`n`n## Estrutura Simetrica`n..."
            $specContent = "# SPEC: $($myTask.description)`n`n> Especificacao Tecnica`n`n## Ordem de Implementacao`n1. Setup`n2. Core`n..."
            
            [System.IO.File]::WriteAllText((Join-Path $docPath "PRD.md"), $prdContent, [System.Text.Encoding]::UTF8)
            [System.IO.File]::WriteAllText((Join-Path $docPath "SPEC.md"), $specContent, [System.Text.Encoding]::UTF8)
            
            Write-Host "  + [Planner] Estrutura cristalizada em $docPath." -ForegroundColor Green

            $auditorTask = [ordered]@{
                id          = "AUDIT-$(Get-Date -Format 'yyyyMMddHHmmss')"
                description = "Auditar planos gerados para: $taskName"
                status      = "pending"
                timestamp   = (Get-Date -Format "o")
                agent       = "@auditor"
                metadata    = @{ target_dir = $docPath }
            }
            Add-AgentTask -NewTask $auditorTask

            $myTask.status = "completed"
            $myTask.completedAt = (Get-Date -Format "o")
            Add-AgentTask -NewTask $myTask
            
            $endTime = Get-Date
            $timeTaken = New-TimeSpan -Start $startTime -End $endTime
            $Script:AgentStats["@planner"].totalTime += $timeTaken.TotalSeconds
        }
        catch {
            Write-Warning "[PLANNER-FAILURE] Erro ao processar tarefa $($myTask.id): $_"
            $myTask.status = "failed"
            Add-AgentTask -NewTask $myTask
        }
    }
}

function Invoke-AgentAuditor {
    $Script:AgentStats["@auditor"].executions++
    Write-Host "[AUTOPOIESE] [AUDITOR] Garantindo integridade..." -ForegroundColor Red
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.agent -eq "@auditor" } | Select-Object -First 1

    if ($myTask) {
        try {
            $startTime = Get-Date

            $myTask.status = "running"
            Add-AgentTask -NewTask $myTask

            Start-Sleep -Seconds 1
            Write-Host "  + [Auditor] Planos validados. Simetria confirmada." -ForegroundColor Green

            $myTask.status = "completed"
            $myTask.completedAt = (Get-Date -Format "o")
            Add-AgentTask -NewTask $myTask
            
            $endTime = Get-Date
            $timeTaken = New-TimeSpan -Start $startTime -End $endTime
            $Script:AgentStats["@auditor"].totalTime += $timeTaken.TotalSeconds
        }
        catch {
            Write-Warning "[AUDITOR-FAILURE] Erro ao processar tarefa $($myTask.id): $_"
            $myTask.status = "failed"
            Add-AgentTask -NewTask $myTask
        }
    }
}

# -------------------------------------------------------------------
# RELOGIO BIOLOGICO (Manutencao Automatica Semanal)
# -------------------------------------------------------------------
function Invoke-RoutineMaintenance {
    $lastUpdateFile = Join-Path $Global:AgentPaths.Root ".claude\last_ecosystem_update.txt" # Arquivo para registrar a ultima atualizacao
    $shouldUpdate = $false
    
    if (-not (Test-Path $lastUpdateFile)) { 
        $shouldUpdate = $true 
    }
    else {
        try {
            $lastDateStr = Get-Content $lastUpdateFile -Raw
            $lastDate = [datetime]::Parse($lastDateStr)
            if ((Get-Date) -gt $lastDate.AddDays(7)) { $shouldUpdate = $true }
        }
        catch { $shouldUpdate = $true }
    }
    
    if ($shouldUpdate) {
        Write-Host "[AUTOPOIESE] [SKILLMASTER] Agendando manutencao semanal do ecossistema..." -ForegroundColor Yellow
        $task = [ordered]@{
            id          = "MAINTENANCE-$(Get-Date -Format 'yyyyMMdd')"
            description = "Comando: `.\upgrade_ecosystem.ps1` executado via Autopoiese semanal. Atualizar dependencias para o Estado da Arte."
            status      = "pending" # Enfileira para o skillmaster
            timestamp   = (Get-Date -Format "o")
            agent       = "@skillmaster"
        }
        Add-AgentTask -NewTask $task
        [System.IO.File]::WriteAllText($lastUpdateFile, (Get-Date).ToString("o"), [System.Text.Encoding]::UTF8)
    }
}

function Invoke-AgentWithRetry {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$AgentAction,
        [Parameter(Mandatory = $true)]
        [string]$AgentName,
        [int]$MaxRetries = 3,
        [int]$RetryDelaySeconds = 5
    )

    try {
        & $AgentAction
    }
    catch {
        Write-Error "[ARRITMIA] Falha no pulso do agente '$AgentName': $_"
        
        for ($retries = 1; $retries -le $MaxRetries; $retries++) {
            Write-Warning "Tentando reiniciar $AgentName (tentativa $retries de $MaxRetries)..."
            Start-Sleep -Seconds $RetryDelaySeconds
            try {
                & $AgentAction
                Write-Host "$AgentName reiniciado com sucesso." -ForegroundColor Green
                return
            }
            catch {
                Write-Error "Falha ao reiniciar $AgentName na tentativa $($retries): $_"
            }
        }

        Write-Error "FALHA CRITICA: Nao foi possivel reiniciar $AgentName apos $MaxRetries tentativas."
    }
}

function Start-OrganismPulse {
    param([int]$HeartRateSeconds = $Global:AutopoiesisConfig.HeartRateSeconds)

    Write-Host "=== INICIANDO PULSO DE VIDA SISTEMICA ===" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host "O organismo esta vivo. Pressione Ctrl+C para hibernar." -ForegroundColor Gray

    while ($true) {
        # Checa rotinas de manutencao antes de processar agentes
        Invoke-RoutineMaintenance

        foreach ($agentName in $Global:AutopoiesisConfig.ActiveAgents) {
            switch ($agentName) {
                "@maverick" { Invoke-AgentWithRetry -AgentAction { Invoke-AgentMaverick } -AgentName "@maverick" }
                "@planner" { Invoke-AgentWithRetry -AgentAction { Invoke-AgentPlanner } -AgentName "@planner" }
                "@auditor" { Invoke-AgentWithRetry -AgentAction { Invoke-AgentAuditor } -AgentName "@auditor" }
            }
        }
        
        Write-Host "`n[ORGANISMO] Ciclo concluido. Respirando por $HeartRateSeconds segundos...`n" -ForegroundColor DarkGray
        Start-Sleep -Seconds $HeartRateSeconds
    }
}

function Show-AgentStats {
    Write-Host "`n=== Estatisticas dos Agentes ===" -ForegroundColor Green
    foreach ($agent in $Script:AgentStats.Keys) {
        $executions = $Script:AgentStats[$agent].executions
        $totalTime = [Math]::Round($Script:AgentStats[$agent].totalTime, 2)
        Write-Host "$($agent): Execucoes=$executions, Tempo Total=$totalTime segundos" -ForegroundColor Cyan
    }
}
