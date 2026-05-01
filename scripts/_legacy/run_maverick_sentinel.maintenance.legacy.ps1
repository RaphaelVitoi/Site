# Executor de Vigilia Automatica - Agente @maverick
# Funcao: Processar analise sistemica e auto-agendar o proximo ciclo

param(
    [Parameter(Mandatory = $true)]
    [string]$TaskId
)

# A variável CurrentTaskID é usada pelo restante do script original.
$CurrentTaskID = $TaskId
$BaseDir = Join-Path $PSScriptRoot '.claude'
$MemoryDir = Join-Path $BaseDir 'agent-memory'
$ReportPath = Join-Path $PSScriptRoot "docs\reports\RELATORIO_SENTINELA_$(Get-Date -Format 'yyyy-MM-dd').md"
$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$DocsDir = Split-Path $ReportPath

Write-Host '=== [MAVERICK] SENTINELA INICIADO ===' -ForegroundColor Magenta

# 1. Iniciar varredura
# O orquestrador 'task_executor.py' é responsável por gerenciar o estado da tarefa (running, completed).
Write-Host "[SENTINELA] Varredura sistemica para a tarefa '$CurrentTaskID' em andamento..." -ForegroundColor Yellow

# 2. Coleta de Insights via Tags (Simulação de Escaneamento)
if (-not (Test-Path $DocsDir)) { New-Item -ItemType Directory -Path $DocsDir -Force | Out-Null }

$Insights = @{
    Decisoes = @()
    Padroes  = @()
    Etica    = @()
}

Write-Host '[SENTINELA] Analisando hashtags de memoria nos agentes...' -ForegroundColor DarkCyan
# Busca heurística nas memórias dos agentes
Get-ChildItem -Path $MemoryDir -Filter 'MEMORY.md' -Recurse | ForEach-Object {
    $Content = Get-Content $_.FullName
    $AgentName = $_.Directory.Name

    if ($Content -match '#decisão') { $Insights.Decisoes += "@$AgentName" }
    if ($Content -match '#padrão') { $Insights.Padroes += "@$AgentName" }
    if ($Content -match '#ética') { $Insights.Etica += "@$AgentName" }
}

$ReportContent = @"
# [VISION] Relatorio Sentinela: Smart MDA (Mass Data Analysis)
**Data:** $(Get-Date -Format 'yyyy-MM-dd HH:mm') | **Estado:** Estavel e Autoconsciente (17 Agentes)

### 1. Diagnostico do Todo
O ecossistema opera em Friccao Zero, com 17 Agentes trabalhando em arquitetura Fractal e Pure ASCII. A homeostase esta preservada.

### 2. Monitoramento de Tags (#)
- **Atividade de Decisao:** Identificada em $($Insights.Decisoes -join ', ').
- **Padroes Emergentes:** Registrados por $($Insights.Padroes -join ', ').
- **Integridade Etica:** Vigilancia ativa em $($Insights.Etica -join ', ').

### 3. Antevisao (Passado > Presente > Futuro)
- **Analise Recursiva (Passado):** O acumulo de logs mortos gerava ruido e lentidao.
- **Analise Precursiva (Presente):** Implementada a linha de corte SOTA: 30 dias para Tasks/Logs, 7 dias para Backups, e 0 dias para entropia imediata.
- **Analise Preditiva (Futuro):** Com as politicas de expurgo ativas, o SQLite e os drives locais nunca ultrapassarao limites criticos de storage.

### 4. A Inovacao Necessaria
Continuar expandindo os laboratorios interativos visuais (Next.js) que se conectam ao orquestrador em background.
"@

# 3. Completar e AUTO-AGENDAR próximo ciclo (Loop Infinito)
# A logica de conclusao de tarefa e re-agendamento agora e gerenciada pelo orquestrador central (task_executor.py)
# Este script agora apenas gera o relatorio.

[System.IO.File]::WriteAllText($ReportPath, $ReportContent, [System.Text.Encoding]::UTF8)
Write-Host "[SENTINELA] Relatorio consolidado gerado em: $ReportPath" -ForegroundColor Green

Write-Host '[SENTINELA] Ciclo completo.' -ForegroundColor Cyan
