<#
.SYNOPSIS
    Aciona o gatilho de reflexao em massa (Despertar Cognitivo) para todos os agentes.
.DESCRIPTION
    Enfileira uma tarefa especifica para cada um dos agentes operacionais,
    obrigando-os a ler, analisar, inovar e reescrever sua propria memoria (MEMORY.md)
    com base no Estado da Arte atual do ecossistema.
#>

$script:CurrentDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path $MyInvocation.MyCommand.Path -Parent }
if (-not $script:CurrentDir) { $script:CurrentDir = Get-Location }
$script:ProjectRoot = Split-Path $script:CurrentDir -Parent
$EnvPath = Join-Path $script:ProjectRoot "_env.ps1"
if (Test-Path $EnvPath) { . $EnvPath }

function Initialize-Kernel {
    $KernelPath = $null
    if ($Global:AgentPaths -and -not [string]::IsNullOrEmpty($Global:AgentPaths.Kernel)) {
        $KernelPath = $Global:AgentPaths.Kernel
    } 

    if ([string]::IsNullOrEmpty($KernelPath)) {
        $PotentialPath = Join-Path $script:ProjectRoot "Agent-TaskManager.psm1"
        if (Test-Path $PotentialPath) {
            $KernelPath = (Resolve-Path $PotentialPath).Path
        }
    }

    if ([string]::IsNullOrEmpty($KernelPath)) {
        Write-Host "[CRITICAL] Caminho do Kernel nao definido e arquivo padrao nao encontrado." -ForegroundColor Red
        exit 1
    }

    # Garantir infraestrutura minima (Paths) ANTES da importacao
    if ($null -eq $Global:AgentPaths) { $Global:AgentPaths = @{} }
    if ([string]::IsNullOrEmpty($Global:AgentPaths.Log)) { 
        $Global:AgentPaths.Log = Join-Path $script:ProjectRoot ".claude\logs"
    }

    try {
        Write-Host "[INFO] Carregando Kernel SOTA: $KernelPath" -ForegroundColor DarkYellow

        # Limpeza preventiva de cache do modulo
        $ModuleName = [System.IO.Path]::GetFileNameWithoutExtension($KernelPath)
        if (Get-Module $ModuleName) { Remove-Module $ModuleName -ErrorAction SilentlyContinue }

        # Fix: Import-Module does not have a -Path parameter. 
        # Using positional argument which is compatible with all PowerShell versions.
        Write-Host "  [KERNEL] Importando modulo..." -ForegroundColor DarkGray
        Import-Module "$KernelPath" -Force -DisableNameChecking -ErrorAction Stop
    }
    catch {
        Write-Host "[CRITICAL] Erro fatal ao carregar o Kernel. Detalhes: $_" -ForegroundColor Red
        exit 1
    }
}

function New-ReflectionTask {
    param([string]$AgentName)

    $agentId = "@$AgentName"
    $taskId = "REFLECT-$AgentName-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    
    # Fix: Windows PowerShell 5.1 Join-Path only supports two arguments.
    # Chaining Join-Path calls for maximum compatibility.
    $AgentMemoryDir = Join-Path (Join-Path $script:ProjectRoot ".claude") "agent-memory"
    $AgentMemoryPath = Join-Path (Join-Path $AgentMemoryDir $AgentName) "MEMORY.md"

    if (!(Test-Path $AgentMemoryPath)) {
        Write-Warning "Arquivo de memoria do agente '$AgentName' nao encontrado. Pulando."
        return
    }

    $taskDesc = "DIRETRIZ DE AUTOPOIESE PROFUNDA: Analise o seu proprio arquivo MEMORY.md atual e o contexto do projeto. Com base na nossa recente evolucao para o Estado da Arte (Migracao para banco SQLite SOTA, Pipeline de Ingestao de Friccao Zero, 18 Entidades Integradas), voce deve atualizar, adaptar, corrigir e INOVAR a sua propria memoria. Refine suas 'Competencias'. Preencha a secao de 'Sinergia e Harmonia' descrevendo como voce se relaciona com os outros na nova Pipeline. Elabore 'Propostas Democraticas' perspicazes e filosoficas para a melhoria do ecossistema. Utilize o seu God Mode para reescrever fisicamente o arquivo .claude/agent-memory/$AgentName/MEMORY.md por completo, tornando-o uma obra de arte intelectual."
    $task = [ordered]@{ id = $taskId; description = $taskDesc; status = "pending"; timestamp = (Get-Date -Format "o"); agent = $agentId }

    try {
        # Sincronia Git preventiva
        git add "$AgentMemoryPath"
        git commit -m "Sincronia pre-reflexao: $agentId" --allow-empty | Out-Null
        
        Add-AgentTask -NewTask $task
        Write-Host "  [+] Semente de reflexao plantada para $agentId" -ForegroundColor Yellow
    }
    catch {
        Write-Warning "Erro ao processar tarefa para $($AgentName): $($_.Exception.Message)"
    }
}

# --- EXECUCAO ---

Initialize-Kernel

$Agents = @("pesquisador", "prompter", "curator", "planner", "organizador", "auditor", "implementor", "verifier", "validador", "securitychief", "seo", "bibliotecario", "maverick", "sequenciador", "skillmaster", "dispatcher", "architect", "chico")

Write-Host "`n=== INICIANDO DESPERTAR COGNITIVO EM MASSA (AUTOPOIESE) ===" -ForegroundColor Cyan
Write-Host "Orquestrando $($Agents.Count) entidades..." -ForegroundColor Gray

foreach ($agent in $Agents) {
    New-ReflectionTask -AgentName $agent
}

Write-Host "`n[OK] O gatilho foi acionado com sucesso." -ForegroundColor Green
Write-Host "[ACAO] Execute 'python .\task_executor.py worker' para iniciar o processamento." -ForegroundColor DarkGray