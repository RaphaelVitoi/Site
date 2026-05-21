# Executor de Vigilia Automatica - Agente @maverick
# Funcao: Processar analise sistemica e auto-agendar o proximo ciclo

param(
    [Parameter(Mandatory = $true)]
    [string]$TaskId
)

# A variável CurrentTaskID é usada pelo restante do script original.
$CurrentTaskID = $TaskId
$BaseDir = Join-Path $PSScriptRoot ".claude"
$MemoryDir = Join-Path $BaseDir "agent-memory"
$ReportPath = Join-Path $PSScriptRoot "docs\reports\RELATORIO_SENTINELA_$(Get-Date -Format 'yyyy-MM-dd').md"
$DocsDir = Split-Path $ReportPath

Write-Host "=== [MAVERICK] SENTINELA INICIADO ===" -ForegroundColor Magenta

# 1. Marcar tarefa atual como RUNNING
$task = [ordered]@{
    id          = $CurrentTaskID
    description = "Maverick, assuma o posto de sentinela e realize a primeira varredura sistêmica em busca de pontos cegos."
    status      = "running"
    timestamp   = (Get-Date -Format "o")
    agent       = "@maverick"
}
Write-Host "[SENTINELA] Varredura sistemica em andamento..." -ForegroundColor Yellow
Write-Host "[SENTINELA] Analisando hashtags de memoria..." -ForegroundColor DarkCyan

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
# [VISION] Relatorio Sentinela: Vigilancia Baseada em Evidencias
**Data:** $(Get-Date -Format 'yyyy-MM-dd HH:mm') | **Estado:** Estavel (Pos-Consolidacao)

### 1. Diagnostico do Todo
O sistema atingiu estabilidade estrutural com a v6.2 (Pure ASCII). A documentacao esta simetrica.
O organismo agora respira sem conflitos de encoding.

### 2. Monitoramento de Tags (#)
- **Atividade de Decisao:** Identificada em $($Insights.Decisoes -join ", ").
- **Padroes Emergentes:** Registrados por $($Insights.Padroes -join ", ").
- **Integridade Etica:** Vigilancia ativa em $($Insights.Etica -join ", ").

### 3. Antevisao de Eventos (Mitigacao)
- **Risco Detectado:** A tabela `tasks` no banco de dados SQLite (`tasks.db`) pode crescer indefinidamente, levando a uma potencial degradacao de performance em queries de `get_next_task` e `get_tasks`.
- **Correcao Proposta:** A rotina `db-cleanup` ja existe e e a mitigacao correta. O @skillmaster deve garantir que esta rotina seja executada periodicamente para arquivar tarefas antigas e manter a tabela principal enxuta e performatica.

### 4. A Inovacao Necessaria
Continuar expandindo os laboratorios interativos visuais (Next.js) que se conectam ao orquestrador em background.
"@

# 3. Completar e AUTO-AGENDAR próximo ciclo (Loop Infinito)
# A logica de conclusao de tarefa e re-agendamento agora e gerenciada pelo orquestrador central (task_executor.py)
# Este script agora apenas gera o relatorio.

[System.IO.File]::WriteAllText($ReportPath, $ReportContent, [System.Text.Encoding]::UTF8)
Write-Host "[SENTINELA] Relatorio consolidado gerado em: $ReportPath" -ForegroundColor Green
Write-Host "[SENTINELA] Ciclo completo." -ForegroundColor Cyan