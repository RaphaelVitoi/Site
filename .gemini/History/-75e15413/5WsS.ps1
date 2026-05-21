# Simulação de Execução de Agente: @organizador
# Tarefa: 20260312-124500-777 (Validar MEMORY.md - Regra 4)

$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
if (-not (Test-Path $KernelPath)) { $KernelPath = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "Agent-TaskManager.psm1" }
Import-Module $KernelPath -Force -DisableNameChecking

$TaskId = "20260312-124500-777"
$Agents = @(
    "pesquisador", "prompter", "curator", "planner", "organizador",
    "auditor", "implementor", "verifier", "validador", "securitychief",
    "seo", "bibliotecario", "maverick", "sequenciador", "skillmaster", 
    "dispatcher", "chico", "architect"
)
$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$MemoryBase = Join-Path $ProjectRoot ".claude\agent-memory"

Write-Host "=== AGENTE @ORGANIZADOR INICIADO ===" -ForegroundColor Magenta

# 1. Atualizar Status para RUNNING
$runningTask = [ordered]@{
    id          = $TaskId
    description = "Verificar se todos os agentes possuem o arquivo MEMORY.md conforme a Regra 4"
    status      = "running"
    agent       = "@organizador"
    timestamp   = (Get-Date -Format "o")
    createdAt   = "2026-03-12T12:45:00.0000000-03:00" # Preserva original
}
Write-Host "[ORGANIZADOR] Iniciando tarefa $TaskId..." -ForegroundColor Yellow
Add-AgentTask -NewTask $runningTask

# 2. Executar Lógica (Criação Fractal de Memória)
foreach ($agent in $Agents) {
    $agentDir = Join-Path $MemoryBase $agent
    $memoryFile = Join-Path $agentDir "MEMORY.md"
    
    # Garante diretório
    if (-not (Test-Path $agentDir)) {
        New-Item -ItemType Directory -Path $agentDir -Force | Out-Null
        Write-Host "[ORGANIZADOR] Criado diretório para @$agent" -ForegroundColor Gray
    }
    
    # Garante arquivo MEMORY.md (Regra 4)
    if (-not (Test-Path $memoryFile)) {
        $template = @"
# MEMORY: @$agent

## 1. PERFIL E ALINHAMENTO
Identidade inicializada para o ecossistema autopoietico.

## 2. COMPETENCIAS E EVOLUCAO
Base de conhecimento em expansao.

## 3. PADROES, INSIGHTS E DESCOBERTAS
- Inicializacao de padroes via @organizador.

## 4. SINERGIA E HARMONIA
Integracao com a pipeline linear e consultiva.

## 5. REGISTRO DE EXECUCAO E AUTONOMIA
Aguardando primeiras diretrizes.

## 6. PROPOSTAS DEMOCRATICAS
Nenhuma proposta no momento.

### Tags para Ingestao RAG
#padrao #boot
"@
        [System.IO.File]::WriteAllText($memoryFile, $template, [System.Text.Encoding]::UTF8)
        Write-Host "[ORGANIZADOR] + Criado MEMORY.md para @$agent" -ForegroundColor Green
    }
    else {
        # Cirurgia de Conformidade (Auto-Cura para arquivos existentes)
        $currentContent = Get-Content -Path $memoryFile -Raw
        $needsUpdate = $false
        
        if ($currentContent -notmatch "6\. PROPOSTAS DEMOCRATICAS") {
            $upgrade = "`n## 6. PROPOSTAS DEMOCRATICAS`nNenhuma proposta no momento.`n`n### Tags para Ingestao RAG`n#padrao #boot"
            Add-Content -Path $memoryFile -Value $upgrade
            $needsUpdate = $true
        }

        if ($needsUpdate) {
            Write-Host "[ORGANIZADOR] * MEMORY.md atualizado/corrigido para @$agent" -ForegroundColor Yellow
        }
        else {
            Write-Host "[ORGANIZADOR] . MEMORY.md validado para @$agent" -ForegroundColor DarkGray
        }
    }
}

# 3. Atualizar Status para COMPLETED
$runningTask.status = "completed"
$runningTask.timestamp = (Get-Date -Format "o")
$runningTask.completedAt = (Get-Date -Format "o")

Add-AgentTask -NewTask $runningTask

Write-Host "[ORGANIZADOR] Tarefa concluída com sucesso." -ForegroundColor Cyan