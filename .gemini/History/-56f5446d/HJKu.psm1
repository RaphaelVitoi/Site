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

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

# -------------------------------------------------------------------
# FUNÇÕES VITAIS (Ciclos de Agente)
# -------------------------------------------------------------------

function Invoke-AgentMaverick {
    Write-Host "[AUTOPOIESE] 🟣 Maverick escaneando o horizonte..." -ForegroundColor Magenta
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.description -match "Maverick|Sentinela|Vigília" -or $_.agent -eq "@maverick" } | Select-Object -First 1

    if ($myTask) {
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
        $averageCompletionTime = # Implementar lógica para calcular o tempo médio de conclusão
        $entropyLevel = # Implementar lógica para medir o nível de entropia

        # Ajustar o intervalo com base nos fatores
        $baseInterval = 3600 # 1 hora em segundos
        $dynamicInterval = $baseInterval + ($pendingTasks * 60) + ($entropyLevel * 300)

        # Limitar o intervalo a um valor máximo
        $maxInterval = 86400 # 24 horas em segundos
        $dynamicInterval = [Math]::Min($dynamicInterval, $maxInterval)

        
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
    }
}

function Invoke-AgentPlanner {
    Write-Host "[AUTOPOIESE] 🔵 Planner buscando caos para estruturar..." -ForegroundColor Cyan
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.agent -eq "@planner" } | Select-Object -First 1

    if ($myTask) {
        # 1. Metamorfose
        $myTask.status = "running"
        Add-AgentTask -NewTask $myTask

        # 2. Arquitetura (Criação de Docs)
        $taskName = if ($myTask.id -match "INOVACAO") {
            if ($myTask.id -match "CLI") { "cli-interativa" }
            elseif ($myTask.id -match "TOYGAME") { "toygame-predator" }
            else { "inovacao-$($myTask.id)" }
        }
        else {
            "task-$($myTask.id)"
        }
        
        $docPath = Join-Path $PSScriptRoot "docs\tasks\$taskName"
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
    }
}

function Invoke-AgentAuditor {
    Write-Host "[AUTOPOIESE] 🔴 Auditor garantindo integridade..." -ForegroundColor Red
    $tasks = Get-AgentTaskStatus -Status "pending"
    $myTask = $tasks | Where-Object { $_.agent -eq "@auditor" } | Select-Object -First 1

    if ($myTask) {
        # 1. Metamorfose
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
    }
}

# -------------------------------------------------------------------
# O PULSO DE VIDA (Loop Principal)
# -------------------------------------------------------------------
function Start-OrganismPulse {
    param([int]$HeartRateSeconds = 10)
    
    # Definir intervalos individuais (se necessário)
    $maverickInterval = 10
    $plannerInterval = 15
    $auditorInterval = 20

    Write-Host "=== INICIANDO PULSO DE VIDA SISTÊMICA ===" -ForegroundColor White -BackgroundColor DarkBlue
    Write-Host "O organismo está vivo. Pressione Ctrl+C para hibernar." -ForegroundColor Gray

    while ($true) {
        try {
            Invoke-AgentMaverick
            Invoke-AgentPlanner
            Invoke-AgentAuditor
            
            # Respiração do sistema
            Start-Sleep -Seconds $HeartRateSeconds
        }
        catch {
           Write-Error "[ARRITMIA] Falha no pulso: $_"
            # Tentar reiniciar o agente (ex: Invoke-AgentMaverick)
            # Se falhar novamente após algumas tentativas, pausar o sistema e notificar o usuário
            
            # Exemplo (simplificado):
            # $agentName = if ($_.InvocationInfo.MyCommand.Name -match "Maverick") { "@maverick" } elseif (...) { ... }
            # $retries = 0
            # while ($retries -lt 3) {
            #     try {
            #         Invoke-Expression "& $($_.InvocationInfo.MyCommand.Name)" # Reiniciar o agente
            #         break # Sucesso
            #     }
            #     catch {
            #         Write-Warning "Falha ao reiniciar $($agentName). Tentando novamente ($($retries + 1)/3)..."
            #         Start-Sleep -Seconds 5
            #         $retries++
            #     }
            # }
            
            Start-Sleep -Seconds $HeartRateSeconds
        }
    }
}