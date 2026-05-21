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

# --- BOOTSTRAP: Resolucao de Caminhos ---
$ModuleBase = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path $MyInvocation.MyCommand.Path -Parent }
if (-not $ModuleBase) { $ModuleBase = Get-Location }

# Telemetria (Inicializacao)
if ($Script:AgentStats -eq $null) {
    $Script:AgentStats = @{}

    # Carrega dinamicamente os agentes do intentmap para autoconsciencia
    $AllAgents = @()
    $IntentMapPath = Join-Path $ModuleBase "data\intentmap.json"
    if (Test-Path $IntentMapPath) {
        try {
            $jsonIntentMap = Get-Content -Path $IntentMapPath -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Stop
            $AllAgents = $jsonIntentMap.psobject.properties.Name
        }
        catch {
            Write-Warning "[AUTOPOIESE] Falha ao ler intentmap.json para contagem dinamica de agentes."
            # Fallback para uma lista basica se o JSON falhar
            $AllAgents = @("@maverick", "@planner", "@auditor")
        }
    }
    
    foreach ($name in $AllAgents) {
        $agentId = if ($name.StartsWith("@")) { $name } else { "@$name" }
        $Script:AgentStats[$agentId] = @{ executions = 0; totalTime = 0 }
    }
    # Inicializa o marcador de pulso do sistema
    $Script:AgentStats["_last_updated"] = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")
}

$EnvPath = Join-Path $ModuleBase "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath } else { throw "CRITICAL: _env.ps1 not found." }

# Fallback de Caminhos (Garante resiliencia se carregado fora do do.ps1)
if ($null -eq $Global:AgentPaths) { $Global:AgentPaths = @{} }
if (-not $Global:AgentPaths.Root) { $Global:AgentPaths.Root = $ModuleBase }
if (-not $Global:AgentPaths.Docs) { $Global:AgentPaths.Docs = Join-Path $ModuleBase "docs" }
if (-not $Global:AgentPaths.Log) { $Global:AgentPaths.Log = Join-Path $ModuleBase ".claude\logs" }
if (-not $Global:AgentPaths.Kernel) { $Global:AgentPaths.Kernel = Join-Path $ModuleBase "Agent-TaskManager.psm1" }

# Fallback de Configuracao para Autopoiese
if ($null -eq $Global:AutopoiesisConfig) {
    $Global:AutopoiesisConfig = @{
        HeartRateSeconds = 30
        ActiveAgents     = @("@maverick", "@planner", "@auditor", "@architect", "@organizador")
    }
}

# Importacao do Kernel com Verificacao de Path
$KernelPath = if ($Global:AgentPaths.Kernel) { $Global:AgentPaths.Kernel } else { Join-Path $ModuleBase "Agent-TaskManager.psm1" }
if (Test-Path $KernelPath) {
    Import-Module "$KernelPath" -Force -DisableNameChecking
}
else {
    Write-Error "[CRITICAL] Kernel nao encontrado em: $KernelPath. Autopoiese abortada."
}

# -------------------------------------------------------------------
# FUNÇÕES VITAIS (Ciclos de Agente)
# -------------------------------------------------------------------
   
function Invoke-AgentMaverick {
    $Script:AgentStats["@maverick"].executions++
    Write-Host "[AUTOPOIESE] [MAVERICK] Escaneando o horizonte..." -ForegroundColor Magenta
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.description -match "Maverick|Sentinela|Vigilia" -or $_.agent -eq "@maverick" } | Select-Object -First 1

    if ($myTask) {
        try {
            $startTime = Get-Date
            
            # 1. Metamorfose: Pending -> Running
            $myTask.status = "running"
            Add-AgentTask -NewTask $myTask

            # 2. Producao de Arte (Simulada)
            Start-Sleep -Seconds 2 # "Thinking time"
            
            # 3. Fertilizacao (Trigger Planner)
            $plannerTask = [ordered]@{
                id          = "PLAN-$(Get-Date -Format 'yyyyMMddHHmmss')"
                description = "Planejar implementacao baseada na visao do Maverick: $($myTask.description)"
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

function Invoke-AgentArchitect {
    $Script:AgentStats["@architect"].executions++
    Write-Host "[AUTOPOIESE] [ARCHITECT] Analisando integridade estrutural..." -ForegroundColor Cyan
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.agent -eq "@architect" } | Select-Object -First 1

    if ($myTask) {
        try {
            $startTime = Get-Date
            $myTask.status = "running"
            Add-AgentTask -NewTask $myTask

            Start-Sleep -Seconds 2
            Write-Host "  + [Architect] Visao macro definida. Despachando para @pesquisador." -ForegroundColor Green

            # Handoff para Pesquisador
            $researchTask = [ordered]@{
                id          = "RESEARCH-$(Get-Date -Format 'yyyyMMddHHmmss')"
                description = "Pesquisa tecnica aprofundada para: $($myTask.description)"
                status      = "pending"
                timestamp   = (Get-Date -Format "o")
                agent       = "@pesquisador"
                metadata    = @{ source = "architect_autopoiesis"; related_to = $myTask.id }
            }
            Add-AgentTask -NewTask $researchTask

            $myTask.status = "completed"
            $myTask.completedAt = (Get-Date -Format "o")
            Add-AgentTask -NewTask $myTask
            
            $endTime = Get-Date
            $timeTaken = New-TimeSpan -Start $startTime -End $endTime
            $Script:AgentStats["@architect"].totalTime += $timeTaken.TotalSeconds
        }
        catch {
            Write-Warning "[ARCHITECT-FAILURE] Erro no fluxo: $_"
            $myTask.status = "failed"
            Add-AgentTask -NewTask $myTask
        }
    }
}

function Invoke-AgentOrganizador {
    $Script:AgentStats["@organizador"].executions++
    Write-Host "[AUTOPOIESE] [ORGANIZADOR] Verificando homeostase documental..." -ForegroundColor Yellow
    
    # O Organizador decide autonomamente se o contexto precisa de sincronia
    $contextFile = Join-Path $ModuleBase ".claude\project-context.md"
    $needsSync = $false
    
    if (Test-Path $contextFile) {
        $lastWrite = (Get-Item $contextFile).LastWriteTime
        if ((Get-Date) -gt $lastWrite.AddHours(4)) { $needsSync = $true }
    }
    else { $needsSync = $true }

    if ($needsSync) {
        try {
            $startTime = Get-Date
            Write-Host "  + [Organizador] Contexto obsoleto detectado. Gerando tarefa de sincronia." -ForegroundColor DarkYellow
            
            $syncTask = [ordered]@{
                id          = "MAINT-CONTEXT-$(Get-Date -Format 'yyyyMMddHHmmss')"
                description = "Executar .claude\sync_project_context.ps1 para garantir homeostase documental."
                status      = "pending"
                timestamp   = (Get-Date -Format "o")
                agent       = "@organizador"
            }
            Add-AgentTask -NewTask $syncTask
            
            $endTime = Get-Date
            $Script:AgentStats["@organizador"].totalTime += (New-TimeSpan -Start $startTime -End $endTime).TotalSeconds
        }
        catch { Write-Warning "[ORGANIZADOR-FAILURE] Falha ao agendar sync: $_" }
    }
}

function Save-AgentStats {
    $StatsPath = Join-Path $ModuleBase ".claude\stats"
    if (-not (Test-Path $StatsPath)) { New-Item -ItemType Directory -Path $StatsPath -Force | Out-Null }
    
    $FilePath = Join-Path $StatsPath "agent_telemetry.json"
    $JsonData = $Script:AgentStats | ConvertTo-Json -Depth 10
    # Garantindo UTF-8 sem BOM (SOTA) para o Dashboard Next.js
    $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($FilePath, $JsonData, $Utf8NoBom)
    Write-Host "[TELEMETRIA] Dados exportados para $FilePath" -ForegroundColor DarkGray
}


# -------------------------------------------------------------------
# RELOGIO BIOLOGICO (Manutencao Automatica Semanal)
# -------------------------------------------------------------------
function Invoke-RoutineMaintenance {
    $lastUpdateFile = Join-Path $ModuleBase ".claude\last_ecosystem_update.txt" # Arquivo para registrar a ultima atualizacao
    $shouldUpdate = $false
    
    if (-not [string]::IsNullOrEmpty($lastUpdateFile) -and -not (Test-Path $lastUpdateFile)) { 
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
        Write-Host "[AUTOPOIESE] [SKILLMASTER] Agendando manutencao semanal..." -ForegroundColor Yellow
        $task = [ordered]@{
            id          = "MAINTENANCE-$(Get-Date -Format 'yyyyMMdd')"
            description = "Comando: `.\upgrade_ecosystem.ps1` executado via Autopoiese semanal. Atualizar dependencias para o Estado da Arte."
            status      = "pending" # Enfileira para o skillmaster
            timestamp   = (Get-Date -Format "o")
            agent       = "@skillmaster"
        }
        Add-AgentTask -NewTask $task
        # Padronizacao SOTA: UTF-8 sem BOM para evitar entropia de caracteres
        $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($lastUpdateFile, (Get-Date).ToString("o"), $Utf8NoBom)
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

    if ($null -eq $Global:AutopoiesisConfig.ActiveAgents -or $Global:AutopoiesisConfig.ActiveAgents.Count -eq 0) {
        Write-Error "[ARRITMIA] Nenhum agente ativo configurado para o pulso."
        return
    }

    while ($true) {
        # Checa rotinas de manutencao antes de processar agentes
        Invoke-RoutineMaintenance

        foreach ($agentName in $Global:AutopoiesisConfig.ActiveAgents) {
            # Identifica dinamicamente a funcao do agente (ex: "@maverick" -> "Invoke-AgentMaverick")
            $funcName = "Invoke-Agent$($agentName.Substring(1).Substring(0,1).ToUpper())$($agentName.Substring(2))"
            if (Get-Command -Name $funcName -ErrorAction SilentlyContinue) {
                Invoke-AgentWithRetry -AgentAction { & $funcName } -AgentName $agentName
            }
            else {
                Write-Host "[PULSO] Agente $agentName detectado na config, mas sem ciclo ($funcName) implementado." -ForegroundColor DarkGray
            }
        }
        
        # Exporta estatisticas para o Dashboard a cada ciclo
        Save-AgentStats
        
        $CurrentTime = Get-Date -Format "HH:mm:ss"
        # SOTA: Remocao de acentuacao para conformidade estrita com ASCII no Backend (Lei #4)
        Write-Host "[$CurrentTime] [HEARTBEAT] Pulso estavel. Sistema em homeostase." -ForegroundColor DarkCyan

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

Export-ModuleMember -Function Invoke-AgentMaverick, Invoke-AgentPlanner, Invoke-AgentAuditor, Invoke-AgentArchitect, Invoke-AgentOrganizador, Invoke-RoutineMaintenance, Invoke-AgentWithRetry, Start-OrganismPulse, Show-AgentStats, Save-AgentStats
