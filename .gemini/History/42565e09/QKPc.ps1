<#
.SYNOPSIS
    Smart CLI Wrapper (do_v2.ps1) - A Membrana Inteligente
    Baseado na SPEC auditada em 2026-03-12.

.DESCRIPTION
    Roteador de intenções que aceita input natural, sanitiza,
    identifica o agente correto via heurística (Regex) e
    encaminha para o Agent-TaskManager.

.EXAMPLE
    .\do_v2.ps1 "preciso corrigir um bug no login"
    .\do_v2.ps1 (Modo Interativo)
#>

param(
    [string]$InputString
)

# Importar Núcleo
$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
if (Test-Path $KernelPath) {
    Import-Module $KernelPath -Force
}
else {
    Write-Warning "Kernel não encontrado. Modo de simulação ativado."
}

# --- CONFIGURAÇÃO (Córtex) ---
$IntentMap = @{
    "@implementor" = "(codar|implementar|criar|fazer|construir|bug|fix|erro|código|script)"
    "@pesquisador" = "(pesquisa|buscar|descobrir|encontrar|estado da arte|comparar|listar|o que é)"
    "@planner"     = "(planejar|estruturar|spec|prd|roadmap|arquitetura|como fazer)"
    "@auditor"     = "(auditar|verificar|validar|conferir|revisar|segurança|compliance)"
    "@maverick"    = "(ideia|inovação|pensar|estratégia|analisar|sentinela|melhorar|inventar)"
    "@curator"     = "(ética|estética|tom|texto|copy|revisão textual)"
}

function Resolve-Intent {
    param([string]$InputText)
    
    $scores = @{}
    foreach ($agent in $IntentMap.Keys) {
        $regex = $IntentMap[$agent]
        if ($InputText -match $regex) {
            $scores[$agent] = 1 # Pontuação simples por match
        }
    }

    # Retorna o primeiro match ou null
    if ($scores.Count -gt 0) {
        return $scores.Keys | Select-Object -First 1
    }
    return $null
}

# --- MODO INTERATIVO (Membrana) ---
if ([string]::IsNullOrWhiteSpace($InputString)) {
    Write-Host "=== CHICO SMART CLI v2.0 ===" -ForegroundColor Cyan
    Write-Host "O que você deseja fazer agora?" -ForegroundColor Gray
    
    $InputString = Read-Host "> "
    
    # Sanitização (Whitelist: Letras, Números, Espaços, Hífens, Underline)
    if ($InputString -notmatch '^[a-zA-Z0-9\-\_\s\u00C0-\u00FF]+$') {
        Write-Error "[SEGURANÇA] Input contém caracteres inválidos. Use apenas alfanuméricos."
        exit
    }
}

# --- PROCESSAMENTO ---
$suggestedAgent = Resolve-Intent -InputText $InputString

if ($suggestedAgent) {
    Write-Host "`nDetectado possível intenção para: " -NoNewline
    Write-Host "$suggestedAgent" -ForegroundColor Yellow
    
    $confirm = Read-Host "Confirmar roteamento? [S/N] (Padrão: S)"
    if ($confirm -match "N") {
        $agent = Read-Host "Digite o agente correto (ex: @planner)"
    }
    else {
        $agent = $suggestedAgent
    }
}
else {
    Write-Host "`nNenhum agente específico detectado automaticamente." -ForegroundColor DarkGray
    $agent = Read-Host "Para qual agente devo enviar? (Enter para pular)"
}

# --- ENFILEIRAMENTO ---
$taskId = "TASK-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

$newTask = [ordered]@{
    id          = $taskId
    description = $InputString
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
}

if (-not [string]::IsNullOrWhiteSpace($agent)) {
    $newTask["agent"] = $agent
}

# Executa se o módulo estiver carregado
if (Get-Command Add-AgentTask -ErrorAction SilentlyContinue) {
    Add-AgentTask -NewTask $newTask
    Write-Host "`n[SUCESSO] Tarefa encaminhada para $agent" -ForegroundColor Green
    Write-Host "ID: $taskId" -ForegroundColor DarkGray
}
else {
    # Fallback para debug
    Write-Host "`n[DEBUG] Tarefa seria criada:" -ForegroundColor Magenta
    $newTask | Out-String | Write-Host
}