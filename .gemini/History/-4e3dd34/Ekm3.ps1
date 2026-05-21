<#
.SYNOPSIS
    NEXUS HUB: Central de Comando Unificada e Visual.
#>

$QueuePath = Join-Path $PSScriptRoot "queue\tasks.json"
$AutonomyPath = Join-Path $PSScriptRoot ".claude\autonomy.json"

Clear-Host
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " [NEXUS HUB] :: Centro de Comando e Telemetria" -ForegroundColor Yellow
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. TELEMETRIA DO SISTEMA ---
Write-Host " [ STATUS VITAL ]" -ForegroundColor White

# Worker Status
$Workers = Get-CimInstance Win32_Process -Filter "Name = 'python.exe' OR Name = 'pythonw.exe'" | Where-Object CommandLine -match "task_executor\.py.*worker"
if ($Workers) {
    Write-Host " [CORE] Orquestrador : " -NoNewline -ForegroundColor Gray; Write-Host "ATIVO" -ForegroundColor Green
}
else {
    Write-Host " [CORE] Orquestrador : " -NoNewline -ForegroundColor Gray; Write-Host "HIBERNANDO" -ForegroundColor DarkGray
}

# Autonomy Status
$autonomyMode = "off"
if (Test-Path $AutonomyPath) {
    try { $autoData = Get-Content $AutonomyPath -Raw | ConvertFrom-Json; if ($autoData.mode) { $autonomyMode = $autoData.mode } } catch {}
}
Write-Host " [SYS]  Autonomia    : " -NoNewline -ForegroundColor Gray
if ($autonomyMode -eq "full") { Write-Host "TOTAL (ON)" -ForegroundColor Green }
elseif ($autonomyMode -eq "partial") { Write-Host "PARCIAL (PAUSED)" -ForegroundColor Yellow }
else { Write-Host "DESATIVADA (OFF)" -ForegroundColor Red }

# Queue Status
$pending = 0; $running = 0
if (Test-Path $QueuePath) {
    try {
        $payload = Get-Content $QueuePath -Raw -Encoding UTF8 | ConvertFrom-Json
        $tasks = if ($null -ne $payload.tasks) { @($payload.tasks) } else { @() }
        $pending = @($tasks | Where-Object { $_.status -eq "pending" }).Count
        $running = @($tasks | Where-Object { $_.status -eq "running" }).Count
    }
    catch {}
}
$statusLine = " [DATA] Carga Atual  : {0} Pendentes | {1} Rodando" -f $pending, $running
Write-Host $statusLine -ForegroundColor Cyan
Write-Host ""

# --- 2. PALETA DE COMANDOS ---
Write-Host " [ PALETA DE COMANDOS NATIVOS ]" -ForegroundColor White
Write-Host " >>> Membrana (Inteligencia)" -ForegroundColor Magenta
Write-Host "    nexus `"ordem`"       " -NoNewline -ForegroundColor Cyan; Write-Host "- Injeta tarefas e delega para os agentes automaticamente." -ForegroundColor DarkGray
Write-Host "    nexus-bridge [arq]  " -NoNewline -ForegroundColor Cyan; Write-Host "- Executa uma SPEC gerada na Web diretamente no God Mode." -ForegroundColor DarkGray
Write-Host " [o] Visao e Monitoramento" -ForegroundColor Magenta
Write-Host "    dashboard           " -NoNewline -ForegroundColor Cyan; Write-Host "- Painel em tempo real do fluxo de tarefas." -ForegroundColor DarkGray
Write-Host "    monitor             " -NoNewline -ForegroundColor Cyan; Write-Host "- NEXUS EYE: Visualiza a mente do Orquestrador." -ForegroundColor DarkGray
Write-Host "    nexus-status        " -NoNewline -ForegroundColor Cyan; Write-Host "- Lista todas as tarefas e vitorias concluidas." -ForegroundColor DarkGray
Write-Host "    nexus-read [ID]     " -NoNewline -ForegroundColor Cyan; Write-Host "- Le os resultados de forma elegante." -ForegroundColor DarkGray
Write-Host "    ask `"pergunta`"      " -NoNewline -ForegroundColor Cyan; Write-Host "- Consulta a memoria coletiva (RAG)." -ForegroundColor DarkGray
Write-Host " [!] Controle Sistemico" -ForegroundColor Magenta
Write-Host "    start-worker        " -NoNewline -ForegroundColor Cyan; Write-Host "- Acorda o Orquestrador em background." -ForegroundColor DarkGray
Write-Host "    stop-worker         " -NoNewline -ForegroundColor Cyan; Write-Host "- Hiberna o Orquestrador com seguranca." -ForegroundColor DarkGray
Write-Host "    nexus-backup        " -NoNewline -ForegroundColor Cyan; Write-Host "- Cria backup instantaneo da fundacao." -ForegroundColor DarkGray
Write-Host " [+] Handoff e Autonomia" -ForegroundColor Magenta
Write-Host "    autonomy-full       " -NoNewline -ForegroundColor Cyan; Write-Host "- Agentes fluem do plano a implementacao sozinhos." -ForegroundColor DarkGray
Write-Host "    autonomy-partial    " -NoNewline -ForegroundColor Cyan; Write-Host "- Agentes pausam antes de escrever codigo real." -ForegroundColor DarkGray
Write-Host "    autonomy-off        " -NoNewline -ForegroundColor Cyan; Write-Host "- Exige seu comando para cada nova etapa." -ForegroundColor DarkGray
Write-Host ""
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " DICA: Digite " -NoNewline -ForegroundColor DarkGray; Write-Host "nexus-hub" -NoNewline -ForegroundColor Yellow; Write-Host " a qualquer momento para abrir esta tela." -ForegroundColor DarkGray
Write-Host ""