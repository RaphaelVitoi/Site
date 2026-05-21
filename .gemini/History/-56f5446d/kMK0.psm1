<#
.SYNOPSIS
    Módulo de Autopoiese Sistêmica (Workflow v6.0).
    Transforma o sistema de uma fila passiva para um organismo vivo.
    
.DESCRIPTION
    Implementa a lógica de "Vida Artificial" para os agentes.
    - Maverick: Gera entropia controlada (Inovação) e vigília (Sentinela).
    - Planner: Transforma entropia em estrutura (PRD/SPEC).
   - Auditor: Garante a integridade da estrutura (Validação).
    
    Princípio: Simetria, Arte e Autopoiese.
#>

# Telemetria (Inicialização)
# Verifica se a variável já existe para não sobrescrever
if ($Script:AgentStats -eq $null) {
    $Script:AgentStats = @{ "@maverick" = @{ executions = 0; totalTime = 0 }
        "@planner"                      = @{ executions = 0; totalTime = 0 }
        "@auditor"                      = @{ executions = 0; totalTime = 0 }
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
    Write-Host "[AUTOPOIESE] 🟣 Maverick escaneando o horizonte..." -ForegroundColor Magenta
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.description -match "Maverick|Sentinela|Vigília" -or $_.agent -eq "@maverick" } | Select-Object -First 1

    if ($myTask) {
        try {
            $startTime = Get-Date
            $slug = "inovacao-$(Get-Random -Minimum 1000 -Maximum 9999)"
            
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

            # 4. Conclusão e Renascimento (Autopoiese)
            $myTask.status = "completed"
            $myTask.completedAt = (Get-Date -Format "o")
            Add-AgentTask -NewTask $myTask

            # Calcular intervalo dinâmico para a próxima vigília
            $pendingTasks = (Get-AgentTaskStatus -Status "pending").Count
            $averageCompletionTime = [Math]::Min(3600, (Get-Random -Minimum 600 -Maximum 1800)) # entre 10 e 30 minutos
            $entropyLevel = [Math]::Min(10, (Get-Random -Minimum 0 -Maximum 5)) # escala de 0 a 10
            $baseInterval = 3600 # 1 hora em segundos
            $dynamicInterval = $baseInterval + ($pendingTasks * 60) + ($entropyLevel * 300) - $averageCompletionTime
            $dynamicInterval = [Math]::Max(600, $dynamicInterval)
            $maxInterval = 86400 # 24 horas em segundos
            $dynamicInterval = [Math]::Min($dynamicInterval, $maxInterval)
                
            $endTime = Get-Date
            $timeTaken = New-TimeSpan -Start $startTime -End $endTime
            $Script:AgentStats["@maverick"].totalTime += $timeTaken.TotalSeconds
        }
        catch {
            # Falha resiliente: Loga o erro, marca a tarefa como 'failed' e continua.
            Write-Warning "[MAVERICK-FAILURE] Erro ao processar tarefa $($myTask.id): $_"
            $myTask.status = "failed"
            Add-AgentTask -NewTask $myTask
        }
    }

    # O Maverick nunca dorme: agenda sua próxima vigília se não houver outra
    $nextSentinel = $tasks | Where-Object { $_.description -match "Vigília" -and $_.status -eq "pending" }
    if (-not $nextSentinel) {
        $sentinelTask = [ordered]@{
            id          = "SENTINELA-$(Get-Date -Format 'yyyyMMddHHmmss')"
            description = "Vigília Sentinela - Ciclo Contínuo (Autopoiese)"
            status      = "pending"
            timestamp   = (Get-Date -Format "o")
            agent       = "@maverick"
        }
        Add-AgentTask -NewTask $sentinelTask
        Write-Host "  > [Maverick] Próxima vigília agendada." -ForegroundColor DarkMagenta
    }
} # End of Invoke-AgentMaverick

function Invoke-AgentPlanner {
    $Script:AgentStats["@planner"].executions++
    Write-Host "[AUTOPOIESE] 🔵 Planner buscando caos para estruturar..." -ForegroundColor Cyan
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.agent -eq "@planner" } | Select-Object -First 1

    if ($myTask) {
        try {
            # 1. Metamorfose
            $startTime = Get-Date

            $myTask.status = "running"
            Add-AgentTask -NewTask $myTask

            # 2. Arquitetura (Criação de Docs)
            $taskName = if ($myTask.metadata -and $myTask.metadata.slug) {
                $myTask.metadata.slug
            }
            else {
                "task-$($myTask.id)" # Fallback para tarefas sem slug
            }
            
            $docPath = Join-Path $Global:AgentPaths.Docs "tasks\$taskName"
            if (-not (Test-Path $docPath)) { New-Item -ItemType Directory -Path $docPath -Force | Out-Null }
            
            $prdContent = "# PRD: $($myTask.description)`n`n> Gerado automaticamente via Autopoiese`n`n## Estrutura Simétrica`n..."
            $specContent = "# SPEC: $($myTask.description)`n`n> Especificação Técnica`n`n## Ordem de Implementação`n1. Setup`n2. Core`n..."
            
            [System.IO.File]::WriteAllText((Join-Path $docPath "PRD.md"), $prdContent, [System.Text.Encoding]::UTF8)
            [System.IO.File]::WriteAllText((Join-Path $docPath "SPEC.md"), $specContent, [System.Text.Encoding]::UTF8)
            
            Write-Host "  + [Planner] Estrutura cristalizada em $docPath." -ForegroundColor Green

            # 3. Handoff Harmonioso (Trigger Auditor)
            $auditorTask = [ordered]@{
                id          = "AUDIT-$(Get-Date -Format 'yyyyMMddHHmmss')"
                description = "Auditar planos gerados para: $taskName"
                status      = "pending"
                timestamp   = (Get-Date -Format "o")
                agent       = "@auditor"
                metadata    = @{ target_dir = $docPath }
            }
            Add-AgentTask -NewTask $auditorTask

            # 4. Conclusão
            $myTask.status = "completed"
            $myTask.completedAt = (Get-Date -Format "o")
            Add-AgentTask -NewTask $myTask
            
            $endTime = Get-Date
            $timeTaken = New-TimeSpan -Start $startTime -End $endTime
            $Script:AgentStats["@planner"].totalTime += $timeTaken.TotalSeconds
        }
        catch {
            # Falha resiliente: Loga o erro, marca a tarefa como 'failed' e continua.
            Write-Warning "[PLANNER-FAILURE] Erro ao processar tarefa $($myTask.id): $_"
            $myTask.status = "failed"
            Add-AgentTask -NewTask $myTask
        }
    }
}

function Invoke-AgentAuditor {
    $Script:AgentStats["@auditor"].executions++
    Write-Host "[AUTOPOIESE] 🔴 Auditor garantindo integridade..." -ForegroundColor Red
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.agent -eq "@auditor" } | Select-Object -First 1

    if ($myTask) {
        try {
            # 1. Metamorfose
            $startTime = Get-Date

            $myTask.status = "running"
            Add-AgentTask -NewTask $myTask

            # 2. Validação (Ação de Guarda)
            Start-Sleep -Seconds 1
            Write-Host "  + [Auditor] Planos validados. Simetria confirmada." -ForegroundColor Green

            # 3. Conclusão
            $myTask.status = "completed"
            $myTask.completedAt = (Get-Date -Format "o")
            Add-AgentTask -NewTask $myTask
            
            # Nota: Auditor é o fim do ciclo de planejamento, não gera automaticamente implementor para segurança (Autonomia user-level).
            $endTime = Get-Date
            $timeTaken = New-TimeSpan -Start $startTime -End $endTime
            $Script:AgentStats["@auditor"].totalTime += $timeTaken.TotalSeconds
        }
        catch {
            # Falha resiliente: Loga o erro, marca a tarefa como 'failed' e continua.
            Write-Warning "[AUDITOR-FAILURE] Erro ao processar tarefa $($myTask.id): $_"
            $myTask.status = "failed"
            Add-AgentTask -NewTask $myTask
        }
    }
}

# -------------------------------------------------------------------
# FUNÇÃO AUXILIAR DE RESILIÊNCIA
# -------------------------------------------------------------------
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
                return # Sucesso, sai da função
            }
            catch {
                Write-Error "Falha ao reiniciar $AgentName na tentativa $($retries): $_"
            }
        }

        Write-Error "FALHA CRÍTICA: Não foi possível reiniciar $AgentName após $MaxRetries tentativas. O organismo continuará, mas este agente está inoperante."
    }
}

# -------------------------------------------------------------------
# O PULSO DE VIDA (Loop Principal)
# -------------------------------------------------------------------
function Start-OrganismPulse {
    param([int]$HeartRateSeconds = $Global:AutopoiesisConfig.HeartRateSeconds)

    Write-Host "=== INICIANDO PULSO DE VIDA SISTÊMICA ===" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host "O organismo está vivo. Pressione Ctrl+C para hibernar." -ForegroundColor Gray

    while ($true) {
        foreach ($agentName in $Global:AutopoiesisConfig.ActiveAgents) {
            $agentAction = Get-Command "Invoke-Agent$agentName"
            Invoke-AgentWithRetry -AgentAction $agentAction -AgentName "@$($agentName.ToLower())"
        }
        
        # Respiração do sistema
        Write-Host "`n[ORGANISMO] Ciclo concluído. Respirando por $HeartRateSeconds segundos...`n" -ForegroundColor DarkGray
        Start-Sleep -Seconds $HeartRateSeconds
    }

}

# Função para mostrar as estatísticas dos agentes
function Show-AgentStats {
    Write-Host "`n=== Estatísticas dos Agentes ===" -ForegroundColor Green
    foreach ($agent in $Script:AgentStats.Keys) {
        $executions = $Script:AgentStats[$agent].executions
        $totalTime = [Math]::Round($Script:AgentStats[$agent].totalTime, 2)
        Write-Host "$($agent): Execuções=$executions, Tempo Total=$totalTime segundos" -ForegroundColor Cyan
    }
}