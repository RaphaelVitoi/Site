# Executor de Vigília Automática - Agente @maverick
# Função: Processar análise sistêmica e auto-agendar o próximo ciclo

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force
$AutopoiesisPath = Join-Path $PSScriptRoot "Agent-Autopoiesis.psm1"

$CurrentTaskID = "20260312-130500-123"
$BaseDir = Join-Path $PSScriptRoot ".claude"
$MemoryDir = Join-Path $BaseDir "agent-memory"
$ReportPath = Join-Path $PSScriptRoot "docs\reports\RELATORIO_SENTINELA_$(Get-Date -Format 'yyyy-MM-dd').md"
$DocsDir = Split-Path $ReportPath

Write-Host "=== MAVERICK SENTINELA INICIADO ===" -ForegroundColor Magenta

# 1. Marcar tarefa atual como RUNNING
$task = [ordered]@{
    id          = $CurrentTaskID
    description = "Maverick, assuma o posto de sentinela e realize a primeira varredura sistêmica em busca de pontos cegos."
    status      = "running"
    timestamp   = (Get-Date -Format "o")
    agent       = "@maverick"
}
Add-AgentTask -NewTask $task
Write-Host "[SENTINELA] Varredura sistêmica em andamento..." -ForegroundColor Yellow
Write-Host "[SENTINELA] Analisando hashtags de memória (#padrão, #decisão)..." -ForegroundColor DarkCyan

# 2. Coleta de Insights via Tags (Simulação de Escaneamento)
if (-not (Test-Path $DocsDir)) { New-Item -ItemType Directory -Path $DocsDir -Force | Out-Null }

$Insights = @{
    Decisoes = @()
    Padroes  = @()
    Etica    = @()
}

# Busca heurística nas memórias dos agentes
Get-ChildItem -Path $MemoryDir -Filter "MEMORY.md" -Recurse | ForEach-Object {
    $Content = Get-Content $_.FullName
    $AgentName = $_.Directory.Name
    
    if ($Content -match "#decisão") { $Insights.Decisoes += "@$AgentName" }
    if ($Content -match "#padrão") { $Insights.Padroes += "@$AgentName" }
    if ($Content -match "#ética") { $Insights.Etica += "@$AgentName" }
}

$ReportContent = @"
# 👁️ Relatório Sentinela: Vigilância Baseada em Evidências
**Data:** $(Get-Date -Format 'yyyy-MM-dd HH:mm') | **Estado:** Estável (Pós-Consolidação)

### 1. Diagnóstico do Todo
O sistema atingiu estabilidade estrutural com a v5.1. A documentação está simétrica.
O risco imediato mudou de 'caos estrutural' para 'estagnação operacional' (ter estrutura mas não usar).

### 2. Monitoramento de Tags (#)
- **Atividade de Decisão (#decisão):** Identificada em $($Insights.Decisoes -join ", ").
- **Padrões Emergentes (#padrão):** Registrados por $($Insights.Padroes -join ", ").
- **Integridade Ética (#ética):** Vigilância ativa em $($Insights.Etica -join ", ").

### 3. Antevisão de Eventos (Mitigação)
- **Risco Detectado:** A fila de tarefas (`tasks.json`) é um array único. Se crescer indefinidamente (>500 itens), a performance de I/O degradará.
- **Correção Proposta:** O script `cleanup.ps1` existe mas depende de execução manual ou do `skillmaster` (ainda teórico em agendamento). Recomendo hard-limit no `Agent-TaskManager.psm1`.

### 4. A Inovação Necessária
Transformar o `do.ps1` em um CLI interativo que sugere o agente correto baseado no input, reduzindo a carga cognitiva de escolha do usuário.
"@
[System.IO.File]::WriteAllText($ReportPath, $ReportContent, [System.Text.Encoding]::UTF8)
Write-Host "[SENTINELA] Relatório gerado em: $ReportPath" -ForegroundColor Green

# 3. Completar e AUTO-AGENDAR próximo ciclo (Loop Infinito)
$task.status = "completed"
$task.completedAt = (Get-Date -Format "o")
Add-AgentTask -NewTask $task

$nextId = "SENTINELA-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$nextTask = [ordered]@{ id = $nextId; description = "Vigília Sentinela - Ciclo Contínuo (Auto-Agendado)"; status = "pending"; timestamp = (Get-Date -Format "o"); priority = "background" }
Add-AgentTask -NewTask $nextTask

# Incluir Telemetria no Relatório
Import-Module $AutopoiesisPath -Force
$stats = Show-AgentStats | Out-String
$reportContent += "`n### Desempenho dos Agentes`n$stats"
[System.IO.File]::WriteAllText($ReportPath, $reportContent, [System.Text.Encoding]::UTF8)
$ReportContent += "`n### Desempenho dos Agentes`n$stats"
[System.IO.File]::WriteAllText($ReportPath, $ReportContent, [System.Text.Encoding]::UTF8)
Write-Host "[SENTINELA] Próximo ciclo agendado: $nextId" -ForegroundColor Cyan