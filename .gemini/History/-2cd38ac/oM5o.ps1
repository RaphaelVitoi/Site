# Script de Inicialização de Feature - Simulador ICM
# Objetivo: Recuperar a intenção de adicionar controles de cenário de fundador e enfileirar para planejamento.

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$KernelPath = Join-Path $ProjectRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

Write-Host "=== INICIANDO PROTOCOLO DE RECUPERAÇÃO DE INTENÇÃO (CHICO) ===" -ForegroundColor Magenta

# A sessão anterior foi interrompida. Esta tarefa formaliza a intenção para garantir a execução resiliente.
$taskId = "ICM-FEAT-FOUNDERS-$(Get-Date -Format 'yyyyMMddHHmm')"
$taskDescription = "Planejar a adição de botões/controles na UI do Simulador ICM para permitir a troca dinâmica de cenários de fundadores (ex: Fundador A vs. Fundador B). A especificação (SPEC) deve detalhar: 1) As mudanças no estado do componente React. 2) A lógica para atualizar o IcmCapTable e IcmCharts. 3) O design e posicionamento dos novos botões. 4) Como o estado será gerenciado (local ou global)."

$task = [ordered]@{
    id          = $taskId
    description = $taskDescription
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@planner"
    metadata    = @{
        origin  = "Recuperação de sessão por @chico"
        feature = "ICM Founder Scenarios"
    }
}

Add-AgentTask -NewTask $task
Write-Host "[CHICO] Intenção recuperada e formalizada. Tarefa de planejamento ($taskId) enfileirada para o @planner." -ForegroundColor Cyan
Write-Host "[CHICO] O @planner irá agora realizar a análise forense e criar o PRD/SPEC. A partir daí, o processo seguirá o fluxo padrão, garantindo a integridade do sistema."