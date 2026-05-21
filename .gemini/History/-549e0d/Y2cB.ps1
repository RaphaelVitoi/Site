# Arquivo de Configuracao Global do Ecossistema de Agentes
# Use `.` para carregar no escopo do seu script: . ./_env.ps1
# RENOMEIE ESTE ARQUIVO PARA _env.ps1 e preencha as chaves de API.

if ($null -ne $Global:AgentPaths) { return }

# 1. Caminhos Criticos (Cerebro do Sistema)
$Global:AgentPaths = @{
    Root        = $PSScriptRoot
    Queue       = Join-Path $PSScriptRoot "queue\tasks.json"
    Archive     = Join-Path $PSScriptRoot "logs\tasks_archived.json"
    Log         = Join-Path $PSScriptRoot "logs\task_log.md"
    Kernel      = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
    Autopoiesis = Join-Path $PSScriptRoot "Agent-Autopoiesis.psm1"
    Memory      = Join-Path $PSScriptRoot ".claude\agent-memory"
    Docs        = Join-Path $PSScriptRoot "docs"
    Data        = Join-Path $PSScriptRoot "data"
    Scripts     = Join-Path $PSScriptRoot "scripts"
    Frontend    = Join-Path $PSScriptRoot "frontend"
}

# 2. Configuracao do Organismo Vivo (Autopoiese)
$Global:AutopoiesisConfig = @{
    ActiveAgents     = @("@maverick", "@planner", "@auditor")
    HeartRateSeconds = 10
}

# 3. Configuracao do Gerenciador de Tarefas
$Global:TaskManagerConfig = @{
    MutexName = "Global\AgentTaskQueue_Mutex_Master"
}

# 4. Chaves de API (Cognicao)
# Substitua os valores abaixo com suas chaves reais.
$env:GEMINI_API_KEY = "SUA_CHAVE_GEMINI_API_AQUI"
# $env:GEMINI_API_KEY_BACKUP = "SUA_CHAVE_GEMINI_BACKUP_AQUI"
$env:OPENROUTER_API_KEY = "SUA_CHAVE_OPENROUTER_AQUI"
$env:ANTHROPIC_API_KEY = "SUA_CHAVE_ANTHROPIC_API_AQUI"

Write-Host "[ENV] Ambiente e caminhos globais carregados." -ForegroundColor DarkGray