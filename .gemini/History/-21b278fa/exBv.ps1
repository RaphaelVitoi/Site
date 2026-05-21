# [NEXUS] Protocolo de Ignicao de Autonomia Total
# Inicia o ecossistema em background para processamento continuo

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Import-Module (Join-Path $ProjectRoot "Agent-TaskManager.psm1") -Force

Write-Host "=== INICIANDO PROTOCOLO DE AUTONOMIA TOTAL ===" -ForegroundColor Magenta

# 1. Enfileirando Tarefas Subsequentes do Frontend (Simulador ICM)
$tasks = @(
    [ordered]@{ id = "TASK-ICM-UI-1"; description = "Criar componentes visuais IcmCharts e IcmCapTable"; status = "pending"; timestamp = (Get-Date -Format "o"); agent = "@implementor" },
    [ordered]@{ id = "TASK-ICM-UI-2"; description = "Integrar recharts no Next.js para visualizacao de pizza do CapTable"; status = "pending"; timestamp = (Get-Date -Format "o"); agent = "@implementor" },
    [ordered]@{ id = "TASK-ICM-AUDIT-1"; description = "Auditar roteamento e responsividade do Simulador ICM no FrontEnd"; status = "pending"; timestamp = (Get-Date -Format "o"); agent = "@auditor" }
)
foreach ($t in $tasks) { Add-AgentTask -NewTask $t }
Write-Host "[KERNEL] Tarefas de UI e Auditoria enfileiradas." -ForegroundColor Green

# 2. Lancar Dashboard de Visão Global (Hemisfério Direito)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { . $($ProjectRoot)\scripts\cli\dashboard_queue.ps1 }" -WindowStyle Normal
Write-Host "[SISTEMA] Nexus Dashboard lançado em background." -ForegroundColor Cyan

# 3. Lancar Pulso de Vida (Autopoiese / Organismo Vivo)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& { Import-Module $($ProjectRoot)\Agent-Autopoiesis.psm1 -Force; Start-OrganismPulse }" -WindowStyle Normal
Write-Host "[SISTEMA] Motor de Autopoiese (Sentinela e Orquestrador) operando ininterruptamente." -ForegroundColor Yellow