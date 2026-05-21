<#
.SYNOPSIS
    Aciona o gatilho de reflexao em massa (Despertar Cognitivo) para todos os agentes.
.DESCRIPTION
    Enfileira uma tarefa especifica para cada um dos agentes operacionais,
    obrigando-os a ler, analisar, inovar e reescrever sua propria memoria (MEMORY.md)
    com base no Estado da Arte atual do ecossistema.
#>

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$EnvPath = Join-Path $ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

# Carregamento robusto do Kernel (SOTA)
if ($Global:AgentPaths.Kernel) {
    $KernelPath = $Global:AgentPaths.Kernel
}

else { Join-Path $ProjectRoot "Agent-TaskManager.psm1" }
# Removed redundant KernelPath assignment.
try {
    if ([string]::IsNullOrEmpty($KernelPath)) {
        Write-Host "[CRITICAL] Kernel path is null or empty. Check AgentPaths configuration." -ForegroundColor Red
        exit 1
    }

    Import-Module $KernelPath -Force -DisableNameChecking -ErrorAction Stop
}
catch {
    Write-Host "[CRITICAL] Erro ao carregar o Kernel. Detalhes: $_" -ForegroundColor Red
    exit 1
}

$Agents = @("pesquisador", "prompter", "curator", "planner", "organizador", "auditor", "implementor", "verifier", "validador", "securitychief", "seo", "bibliotecario", "maverick", "sequenciador", "skillmaster", "dispatcher", "architect", "chico")

Write-Host "=== INICIANDO DESPERTAR COGNITIVO EM MASSA (AUTOPOIESE) ===" -ForegroundColor Cyan

foreach ($agent in $Agents) {
    $agentId = "@$agent"
    $taskId = "REFLECT-$agent-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    $taskDesc = "DIRETRIZ DE AUTOPOIESE PROFUNDA: Analise o seu proprio arquivo MEMORY.md atual e o contexto do projeto. Com base na nossa recente evolucao para o Estado da Arte (Migracao para banco SQLite SOTA, Pipeline de Ingestao de Friccao Zero, 18 Entidades Integradas), voce deve atualizar, adaptar, corrigir e INOVAR a sua propria memoria. Refine suas 'Competencias'. Preencha a secao de 'Sinergia e Harmonia' descrevendo como voce se relaciona com os outros na nova Pipeline. Elabore 'Propostas Democraticas' perspicazes e filosoficas para a melhoria do ecossistema. Utilize o seu God Mode para reescrever fisicamente o arquivo .claude/agent-memory/$agent/MEMORY.md por completo, tornando-o uma obra de arte intelectual."
    
    # Ensure that the agent's memory file exists
    $AgentMemoryPath = Join-Path $ProjectRoot ".claude" "agent-memory" $agent "MEMORY.md"
    if (!(Test-Path $AgentMemoryPath)) {
        Write-Warning "Arquivo de memória do agente '$agent' não encontrado em: $AgentMemoryPath. Pulando este agente."
        continue # Skip to the next agent if the memory file doesn't exist
    }


    $task = [ordered]@{ id = $taskId; description = $taskDesc; status = "pending"; timestamp = (Get-Date -Format "o"); agent = $agentId }
    # Adicione a mensagem de commit ao comando
    $GitCommitCommand = "git commit -m ""Sincronizando agentes e ajustes pós-reflexão"" "
        
    try {
        try {
            # Executar os comandos Git dentro do bloco try
            $GitAddCommand = "git add .claude/agent-memory/$agent/MEMORY.md"
            Invoke-Expression "& {$GitAddCommand}"
            Invoke-Expression "& {$GitCommitCommand}"
            Add-AgentTask -NewTask $task
        }
        catch {
            Write-Warning "Falha ao processar comandos Git ou adicionar tarefa para o agente $($agent): $($_.Exception.Message)"
        }
        Write-Host "`n[OK] O gatilho foi acionado. A autopoiese comecara assim que o Orquestrador for iniciado." -ForegroundColor Green
        Write-Host "[ACAO] Execute 'python .\task_executor.py worker' para iniciar a revolucao." -ForegroundColor DarkGray
    }
    catch {
        Write-Error "Erro inesperado na iteração do agente $($agent): $($_.Exception.Message)"
    }
}