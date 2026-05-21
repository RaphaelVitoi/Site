<#
.SYNOPSIS
    Integra o Ecossistema Nexus ao terminal Windows permanentemente.
.DESCRIPTION
    Gera o PowerShell profile com funcoes globais do Nexus.
    Usa template literal (single-quoted here-string) com substituicao explicita
    para evitar bugs de backtick-escape em here-strings expandiveis.
#>

Write-Host '=== ELEVANDO SISTEMA AO ESTADO DA ARTE (CLI GLOBAL) ===' -ForegroundColor Cyan

$ProfilePath = $PROFILE
$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# Valida que o ProjectRoot resolve corretamente
if (-not (Test-Path $ProjectRoot)) {
    Write-Error "ProjectRoot invalido: '$ProjectRoot'. Verifique a localizacao do script."
    exit 1
}

Write-Host "[INFO] ProjectRoot resolvido: $ProjectRoot" -ForegroundColor DarkCyan

# Cria diretorio do profile se nao existir
$ProfileDir = Split-Path $ProfilePath
if (-not (Test-Path $ProfileDir)) {
    New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null
}

# Backup do perfil anterior
if (Test-Path $ProfilePath) {
    Copy-Item -Path $ProfilePath -Destination "$ProfilePath.bak" -Force
    Write-Host "[INFO] Backup salvo em: $ProfilePath.bak" -ForegroundColor DarkCyan
}

# Template literal (single-quoted here-string) - nenhum $ e expandido
# __PROJECT_ROOT__ e o unico placeholder, substituido explicitamente
$Template = @'

# === START NEXUS SYSTEM ENVIRONMENT ===
$Global:NexusProjectRoot = "__PROJECT_ROOT__"
$Global:NexusPythonExe = if (Test-Path "$Global:NexusProjectRoot\.venv\Scripts\python.exe") { "$Global:NexusProjectRoot\.venv\Scripts\python.exe" } else { "python.exe" }

# --- Comandos Core do Ecossistema ---

# A Membrana de Entrada (Inteligencia)
function nexus {
    # Roteamento SOTA: Repassa todos os parametros e flags nativamente para o do.ps1
    & "$Global:NexusProjectRoot\do.ps1" @args
}

# O Centro de Comando (Diagnostico e Manutencao)
function nexus-cli {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$Arguments
    )
    # Roteamento Absoluto SOTA: O Orquestrador Hibrido e o unico Kernel
        & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" @Arguments
}

# --- Atalhos de Alto Nivel (Qualidade de Vida SOTA) ---

# Gerenciamento do Worker
function start-worker {
    param(
        [switch]$Force,
        [switch]$Background
    )
    & "$Global:NexusProjectRoot\scripts\ops\start_worker.ps1" @PSBoundParameters
}
function stop-worker {
    Write-Host "[SOTA] Paralisando o Orquestrador Hibrido..." -ForegroundColor Yellow
    $PidFilePath = Join-Path $Global:NexusProjectRoot ".nexus_worker.pid"

    if (Test-Path $PidFilePath) {
        try {
            $workerPid = Get-Content $PidFilePath
            $process = Get-Process -Id $workerPid -ErrorAction Ignore
            if ($process) {
                Write-Host "[INFO] Tentando parada graciosa (SIGINT) para o processo PID: $workerPid..." -ForegroundColor DarkGray

                try { Stop-Process -Id $workerPid -ErrorAction Stop | Out-Null } catch { }

                try {
                    $process | Wait-Process -Timeout 10 -ErrorAction Stop
                    Write-Host "[OK] Orquestrador SOTA offline (parada graciosa)." -ForegroundColor Green
                } catch {
                    Write-Warning "[AVISO] Parada graciosa falhou ou demorou. Forçando o encerramento..."
                    Stop-Process -Id $workerPid -Force
                    Write-Host "[OK] Orquestrador SOTA offline (parada forçada)." -ForegroundColor Green
                }
            } else {
                Write-Warning "[AVISO] PID ($workerPid) encontrado em .nexus_worker.pid, mas o processo nao existe. Removendo arquivo obsoleto."
                Remove-Item $PidFilePath -Force
            }
        } catch {
            Write-Error "Erro ao tentar parar o worker via PID: $_"
        }
    }
    else {
        Write-Host "[INFO] Nenhum arquivo PID encontrado. Usando metodo legado para encontrar o worker..." -ForegroundColor DarkGray
        $workers = Get-CimInstance Win32_Process -Filter "name LIKE 'python%'" | Where-Object { $_.CommandLine -match "task_executor.py\s+worker" }
        if ($workers) {
            $workers | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
            Write-Host "[OK] Orquestrador SOTA offline (parada forçada via fallback)." -ForegroundColor Green
        } else {
            Write-Host "[INFO] Nenhum Orquestrador SOTA ativo foi detectado." -ForegroundColor DarkGray
        }
    }
}

# Gerenciamento de Autonomia
function Set-NexusAutonomy {
    param([string]$Mode)
    try {
        $apiUrl = "http://127.0.0.1:17042/state"
        $headers = @{ "Content-Type" = "application/json" }
        if ($env:API_SECRET_TOKEN) {
            $headers.Add("Authorization", "Bearer $env:API_SECRET_TOKEN")
        }
        $body = @{ key = "autonomy_mode"; value = $Mode } | ConvertTo-Json -Compress
        Invoke-WebRequest -Uri $apiUrl -Method Post -Body $body -Headers $headers -ContentType "application/json" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop | Out-Null
        $msg = "[SOTA] Autonomia SOTA alterada para: $Mode (Latencia Zero)"
        Write-Host $msg -ForegroundColor Green
    } catch {
        & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" autonomy $Mode
    }
}
function autonomy-full { Set-NexusAutonomy "full" }
function autonomy-partial { Set-NexusAutonomy "partial" }
function autonomy-default { Set-NexusAutonomy "default" }
function autonomy-stop { Set-NexusAutonomy "stop" }

# Visualizacao e Consulta
function nexus-status {
    Write-Host "`n=== PAINEL DE STATUS SOTA NEXUS ===" -ForegroundColor Cyan
    Write-Host "`n[ FILA DE TAREFAS ]" -ForegroundColor Magenta
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get counts
    Write-Host "`n[ ORCAMENTO COGNITIVO DIARIO ]" -ForegroundColor Magenta
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get budget

    # SOTA: Centraliza a coleta de telemetria via API para evitar lock de DB e acelerar a resposta.
    try {
        $dbApiUrl = "http://127.0.0.1:17042/db-summary"
        $dbHeaders = @{}
        if ($env:API_SECRET_TOKEN) { $dbHeaders.Add("Authorization", "Bearer $env:API_SECRET_TOKEN") }
        $dbResponse = Invoke-WebRequest -Uri $dbApiUrl -Method Get -Headers $dbHeaders -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        $dbStatus = $dbResponse.Content | ConvertFrom-Json

        Write-Host "`n[ FILA DE TAREFAS ]" -ForegroundColor Magenta
        Write-Host ($dbStatus.tasks | ConvertTo-Json -Compress)
        Write-Host "`n[ ORCAMENTO COGNITIVO DIARIO ]" -ForegroundColor Magenta
        Write-Host ($dbStatus.budget | ConvertTo-Json -Compress)
    } catch {
        Write-Host "`n[ FILA DE TAREFAS ]" -ForegroundColor Magenta; & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get counts
        Write-Host "`n[ ORCAMENTO COGNITIVO DIARIO ]" -ForegroundColor Magenta; & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get budget
    }

    Write-Host "`n[ CONTROLE DE VAZAO (RATE LIMITER) ]" -ForegroundColor Magenta
    try {
        $apiUrl = "http://127.0.0.1:17042/system-status"
        $headers = @{}
        if ($env:API_SECRET_TOKEN) { $headers.Add("Authorization", "Bearer $env:API_SECRET_TOKEN") }
        $response = Invoke-WebRequest -Uri $apiUrl -Method Get -Headers $headers -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        $status = $response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue

        if ($null -ne $status -and $null -ne $status.rate_limiter -and $status.rate_limiter.PSObject.Properties.Match('capacity').Count -gt 0) {
            $rl = $status.rate_limiter
            try {
                $tokensValue = [double]::Parse($rl.current_tokens.ToString(), [System.Globalization.CultureInfo]::InvariantCulture)
                $capacityValue = [int]$rl.capacity
                $starvationValue = [int]$rl.starvation_events
                $tokensFormatted = $tokensValue.ToString("N2", [System.Globalization.CultureInfo]::InvariantCulture)
                Write-Host ("  {0,-20} : {1} / {2}" -f 'Tokens Atuais', $tokensFormatted, $capacityValue)
                Write-Host ("  {0,-20} : {1}" -f 'Eventos Starvation', $starvationValue)
            } catch {
                Write-Host "  (Erro ao formatar telemetria. Worker pode estar retornando dados inesperados.)" -ForegroundColor DarkYellow
                Write-Host "  RAW Response: $($response.Content)" -ForegroundColor DarkGray
            }
        } else {
            Write-Host "  (Telemetria do Rate Limiter indisponivel ou malformada)" -ForegroundColor DarkGray
            if ($response) { Write-Host "  RAW Response: $($response.Content)" -ForegroundColor DarkGray }
        }
    } catch {
        Write-Host "  (Worker offline ou endpoint /system-status indisponivel)" -ForegroundColor DarkGray
    }
}
function nexus-hub { nexus-status }

function nexus-notify {
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get-notify @args
}

function nexus-keys {
    # Auditoria de chaves + diagnostico de rede automatico quando a falha e de conectividade.
        $outputRaw = & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" check-keys 2>&1
        $outputStr = $outputRaw -join "`n"
        Write-Host $outputStr

        if ($outputStr -match "ClientConnectionError" -or $outputStr -match "WinError 5" -or $outputStr -match "Conexao:") {
        Write-Host "[NEXUS] Falha de conectividade detectada. Acionando diagnostico de rede..." -ForegroundColor Yellow
        & $Global:NexusPythonExe "$Global:NexusProjectRoot\scripts\utils\network_diagnostic.py"
    }
}

function nexus-fallback {
    param(
        [int]$Minutes = 180
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" fallback-stats $Minutes
}

function nexus-route-health {
    param(
        [int]$Minutes = 30
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" route-health $Minutes
}

function nexus-gemini-health {
    param(
        [int]$Minutes = 1440
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" gemini-health $Minutes
}

function nexus-rate-limits {
    param(
        [int]$Days = 7
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" rate-limits $Days
}

function nexus-watchdog {
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" watchdog
}

function nexus-fallback-prune {
    param(
        [int]$Days = 7
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" fallback-prune $Days
}

function nexus-fallback-prune-legacy {
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" fallback-prune-legacy
}

# Atalhos Nativos da Membrana (Friccao Zero)
function nexus-sync { & "$Global:NexusProjectRoot\do.ps1" -SyncAgents }
function nexus-audit { & "$Global:NexusProjectRoot\do.ps1" -Audit "Auditoria Global" }
function nexus-diag-net { & $Global:NexusPythonExe "$Global:NexusProjectRoot\scripts\utils\network_diagnostic.py" }
function nexus-setup { & "$Global:NexusProjectRoot\do.ps1" -Setup }
function nexus-backup { & "$Global:NexusProjectRoot\do.ps1" -Backup }
function nexus-backup-full { & "$Global:NexusProjectRoot\scripts\utils\invoke_full_backup.ps1" }
function nexus-schedule { & "$Global:NexusProjectRoot\do.ps1" -ScheduleMaintenance }
function nexus-watch { & "$Global:NexusProjectRoot\do.ps1" -Watch }
function nexus-reflect { & "$Global:NexusProjectRoot\do.ps1" -Reflect }
function nexus-map {
    $MapPath = Join-Path $Global:NexusProjectRoot "docs\SOTA_REFERENCE_ARCHITECTURE.md"
    if (Test-Path $MapPath) {
        # Usa um pager para textos longos, se disponivel, ou apenas exibe.
            Get-Content $MapPath
    } else {
        Write-Warning "O Mapa do Ecossistema (SOTA_REFERENCE_ARCHITECTURE.md) ainda nao foi gerado."
        Write-Host "Execute 'nexus-schedule' e aguarde o @organizador cria-lo, ou acione manualmente." -ForegroundColor Yellow
    }
}
function nexus-scripts {
    $DashboardPath = Join-Path $Global:NexusProjectRoot "docs\SCRIPTS_E_COMANDOS_DASHBOARD.md"
    if (Test-Path $DashboardPath) {
            Get-Content $DashboardPath
    } else {
        Write-Warning "Dashboard de scripts/comandos nao encontrado."
    }
}
function nexus-scripts-refresh {
    & "$Global:NexusProjectRoot\scripts\routines\invoke_scripts_dashboard.ps1"
}
function nexus-graph {
    & "$Global:NexusProjectRoot\do.ps1" -Graph
}
function nexus-checkdb { & "$Global:NexusProjectRoot\do.ps1" -CheckDB }
function nexus-retry {
    param([Parameter(Mandatory=$true)][string]$TaskId)
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-retry $TaskId
}
function nexus-retry-failed {
    $output = & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-retry-failed
    $output | ForEach-Object { Write-Host $_ }
    $combinedOutput = $output -join " "
    if ($combinedOutput -match "SUCCESS:\s*(\d+)\s*tarefas") {
        $count = $Matches[1]
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
        $ToastXml = @"
<toast>
    <visual>
        <binding template="ToastText02">
            <text id="1">Nexus Orchestrator</text>
            <text id="2">SUCESSO: $count tarefas 'failed' reenfileiradas!</text>
        </binding>
    </visual>
</toast>
"@
        $Xml = [Windows.Data.Xml.Dom.XmlDocument]::new()
        $Xml.LoadXml($ToastXml)
        $Toast = [Windows.UI.Notifications.ToastNotification]::new($Xml)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('NexusRetry').Show($Toast)
    }
}
function nexus-complete {
    param([Parameter(Mandatory=$true)][string]$TaskId)
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-complete $TaskId
}
function nexus-restore {
    [CmdletBinding(SupportsShouldProcess=$true)]
    param(
        [switch]$Force
    )
    & "$Global:NexusProjectRoot\scripts\utils\restore_system.ps1" @PSBoundParameters
}
function nexus-db {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$Arguments
    )
    if ($Arguments.Length -eq 0) {
        # SOTA: Busca dinamica dos comandos disponiveis no Kernel
        try {
            Write-Host "Buscando comandos de banco de dados no Kernel SOTA..." -ForegroundColor DarkGray
            $commandsJson = nexus-cli db-commands
            $commands = $commandsJson | ConvertFrom-Json

            Write-Host "`nUso: nexus-db <subcomando> [argumentos]`n" -ForegroundColor Yellow
            Write-Host "Subcomandos disponiveis:"

            # Formata a saida em uma tabela improvisada
            $commands.PSObject.Properties | ForEach-Object {
                $commandName = $_.Name
                $commandDesc = $_.Value
                Write-Host ("  {0,-30} # {1}" -f $commandName, $commandDesc)
            }
        } catch {
            Write-Error "Nao foi possivel obter a lista de comandos do Kernel. Verifique se o worker esta online ou use 'nexus-cli db-commands' para depurar."
        }
        return
    }
    # Monta o comando db-* para o nexus-cli
    $DbCommand = "db-" + $Arguments[0]

    if ($Arguments.Length -gt 1) {
        $RemainingArgs = $Arguments[1..($Arguments.Length - 1)]
        nexus-cli $DbCommand @RemainingArgs
    } else {
        nexus-cli $DbCommand
    }
}

function nexus-ping {
    param(
        [string]$Agent = "@maverick",
        [int]$Timeout = 120
    )
    $ts = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
    $tsShort = Get-Date -Format "HHmmss"
    $taskId = "PING-$tsShort"
    $apiBase = "http://127.0.0.1:17042"
    $headers = @{ "Content-Type" = "application/json" }
    if ($env:API_SECRET_TOKEN) { $headers["Authorization"] = "Bearer $env:API_SECRET_TOKEN" }

    $body = @{
        id          = $taskId
        description = "PING de diagnostico $taskId. Responda APENAS em uma linha: PONG | modelo=<seu_modelo> | ts=$ts"
        agent       = $Agent
        timestamp   = $ts
        metadata    = @{ ping = $true }
    } | ConvertTo-Json -Compress

    Write-Host "[PING] Enfileirando tarefa $taskId para $Agent..." -ForegroundColor Cyan
    try {
        $resp = Invoke-WebRequest -Uri "$apiBase/add" -Method Post -Body $body -Headers $headers -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $json = $resp.Content | ConvertFrom-Json
        if ($json.status -ne "SUCCESS") { throw $json.error }

        $start = [datetime]::UtcNow
        $lastDot = 0
        while (([datetime]::UtcNow - $start).TotalSeconds -lt $Timeout) {
            $elapsed = [int]([datetime]::UtcNow - $start).TotalSeconds
            try {
                $res = Invoke-WebRequest -Uri "$apiBase/task-result?id=$taskId" -Headers $headers -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
                $rJson = $res.Content | ConvertFrom-Json
                $preview = ($rJson.content -split "`n" | Where-Object { $_ -match "\S" } | Select-Object -First 2) -join " | "
                Write-Host ""
                Write-Host "[PONG] ${elapsed}s | $preview" -ForegroundColor Green
                return
            } catch {
                if (($elapsed - $lastDot) -ge 5) {
                    Write-Host "[PING] Aguardando... ${elapsed}s" -ForegroundColor DarkGray
                    $lastDot = $elapsed
                }
                Start-Sleep -Seconds 3
            }
        }
        Write-Host "[PING] Timeout (${Timeout}s) -- tarefa $taskId ainda pendente." -ForegroundColor Yellow
    } catch {
        Write-Host "[PING] Worker offline ou erro: $_" -ForegroundColor Red
        Write-Host "       Use 'start-worker' para iniciar o orquestrador." -ForegroundColor DarkGray
    }
}

function nexus-help {
    Write-Host "`n=== PAINEL DE COMANDOS SOTA NEXUS ===" -ForegroundColor Cyan
    Write-Host "`n[ COGNICAO E EXECUCAO ]" -ForegroundColor Magenta
    Write-Host "  nexus 'tarefa'     - Enfileira uma nova tarefa para a IA"
    Write-Host "  ask 'pergunta'     - Consulta o Oraculo (Base RAG Vetorial)"
    Write-Host "  nexus-list         - Exibe o Registro Akashico (Tabela das ultimas tarefas)"
    Write-Host "  nexus-status       - Exibe as estatisticas da fila e o orcamento de API"
    Write-Host "  nexus-notify       - Lista auditorias sentinela pendentes para o @maverick"

    Write-Host "`n[ ORQUESTRACAO DA MAQUINA ]" -ForegroundColor Magenta
    Write-Host "  start-worker       - Inicia o orquestrador (Background Executor SOTA)"
    Write-Host "  stop-worker        - Paralisa o orquestrador com seguranca"
    Write-Host "  nexus-watch        - Inicia a vigilia ativa (auto-executa tarefas em mudancas)"
    Write-Host "  nexus-cli          - Acesso direto ao Kernel Python (task_executor.py)"

    Write-Host "`n[ BANCO DE DADOS (DAL) ]" -ForegroundColor Magenta
    Write-Host "  nexus-db <cmd>     - Acesso direto aos comandos 'db-*' do Kernel (ex: get, cleanup)"
    Write-Host "  nexus-checkdb      - Audita a integridade do banco de dados (corrupcao, zumbis)"
    Write-Host "  nexus-retry        - Reenfileira uma tarefa especifica (muda para pending)"
    Write-Host "  nexus-retry-failed - Reenfileira TODAS as tarefas com status 'failed'"
    Write-Host "  nexus-restore      - Restaura o sistema a partir do ultimo backup .zip (EMERGENCIA)"
    Write-Host "  nexus-complete     - Marca uma tarefa especifica (ex: NOTIFY-*) como concluida"
    Write-Host "  nexus-backup       - Cria um snapshot/backup de seguranca da infraestrutura"
    Write-Host "  nexus-backup-full  - Cria um backup ZIP total do projeto (ignora node_modules e pesados)"

    Write-Host "`n[ SEGURANCA E AUDITORIA ]" -ForegroundColor Magenta
    Write-Host "  nexus-ping         - Enfileira tarefa de diagnostico e exibe PONG quando o worker responder"
    Write-Host "  nexus-keys         - Audita chaves de API e auto-dispara diagnostico de rede em falhas de conexao"
    Write-Host "  nexus-fallback     - Mostra metricas de fallback (padrao 180 min)"
    Write-Host "  nexus-route-health - Mostra saude de rota por modelo e candidatos a cooldown (padrao 30 min)"
    Write-Host "  nexus-gemini-health - Auditoria profunda Gemini (ListModels + generateContent + ranking de chaves)"
    Write-Host "  nexus-watchdog     - Exibe as estatisticas do Watchdog e taxa de falhas atual"
    Write-Host "  nexus-rate-limits  - Exibe relatorio de gargalos de quota (HTTP 429) por dia e modelo."
    Write-Host "  nexus-fallback-prune - Limpa metricas antigas de fallback (padrao 7 dias)"
    Write-Host "  nexus-fallback-prune-legacy - Remove ruido legado de modelos antigos (1.5/Anthropic)"
    Write-Host "  nexus-diag-net     - Executa um diagnostico de rede para as APIs do Google"
    Write-Host "  nexus-audit        - Dispara uma Auditoria Adaptativa SOTA (Smart MDA)"

    Write-Host "`n[ MANUTENCAO E SIMETRIA ]" -ForegroundColor Magenta
    Write-Host "  nexus-sync         - Sincroniza o Manifesto (Gera/atualiza arquivos de Agentes)"
    Write-Host "  nexus-setup        - Reinstala e atualiza as variaveis de perfil do terminal"
    Write-Host "  nexus-schedule     - Agenda as tarefas de manutencao automaticas (backup, auditoria)"
    Write-Host "  nexus-map          - Exibe o mapa da arquitetura de referencia do sistema"
    Write-Host "  nexus-commands     - Exibe um painel estetico com todos os comandos funcionais"
    Write-Host "  nexus-scripts      - Exibe dashboard curado de scripts e comandos funcionais"
    Write-Host "  nexus-scripts-refresh - Regenera o dashboard vivo de scripts/comandos"
    Write-Host "  nexus-graph        - Exibe o grafo de dependencias das tarefas pendentes (Mermaid)"

    Write-Host "`n[ CONTROLE DE AUTONOMIA (GOD MODE) ]" -ForegroundColor Magenta
    Write-Host "  autonomy-full      - W3 - Ativa o God Mode irrestrito (Motor de Inovacao)"
    Write-Host "  autonomy-partial   - W2 - Autonomia com bloqueio de comandos destrutivos/alteradores"
    Write-Host "  autonomy-default   - W1 - Desativa execucao de terminal (Apenas forjamento de arquivos)"
    Write-Host "  autonomy-stop      - W0 - Desativa mutacao completa (Observacao Pura)"

    Write-Host "`n[ AUTOPOIESE E EVOLUCAO ]" -ForegroundColor Magenta
    Write-Host "  nexus-reflect      - Aciona a reflexao em massa para todos os agentes (Autopoiese)"

    Write-Host "`n[ PROTOCOLOS DE SESSAO ]" -ForegroundColor Magenta
    Write-Host "  ola-chico          - Prepara o ambiente para uma nova sessao (atalho para nexus-sync)"
    Write-Host "  handoff            - Executa o protocolo de fim de sessao (sintese, backup, prompt)"

    Write-Host "`n=====================================`n" -ForegroundColor Cyan
}

function nexus-list {
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get all
}

function ask {
    param(
        [Parameter(ValueFromRemainingArguments=$true)]
        [string[]]$Query
    )
    $PrintOracle = {
        param([string]$text)
        Write-Host "`n[ ORACULO ] A VOZ DA MENTE COLETIVA" -ForegroundColor Magenta
        Write-Host "----------------------------------" -ForegroundColor DarkGray
        Write-Host $text -ForegroundColor Cyan
        Write-Host "----------------------------------`n" -ForegroundColor DarkGray
    }

    $Question = $Query -join " "
    try {
        $apiUrl = "http://127.0.0.1:17042/ask-oracle"
        $headers = @{ "Content-Type" = "application/json" }
        if ($env:API_SECRET_TOKEN) {
            $headers.Add("Authorization", "Bearer $env:API_SECRET_TOKEN")
        }
        $body = @{ question = $Question; n_results = 3 } | ConvertTo-Json -Compress
        $response = Invoke-WebRequest -Uri $apiUrl -Method Post -Body $body -Headers $headers -ContentType "application/json" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $json = $response.Content | ConvertFrom-Json
        if ($json.status -eq "SUCCESS") {
            & $PrintOracle $json.answer
        } else {
            Write-Error "O Oraculo falhou: $($json.error)"
        }
    } catch {
        Write-Host "[AVISO] Oraculo Hibrido offline. Tentando consulta via API CLI..." -ForegroundColor Yellow
        $Output = & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" query $Question
        & $PrintOracle $Output
    }
}

# --- Protocolos de Sessao SOTA ---
function ola-chico { nexus-sync }
function handoff { & "$Global:NexusProjectRoot\do.ps1" -Handoff }

function nexus-commands {
    Write-Host "`n=== PAINEL DE COMANDOS FUNCIONAIS SOTA NEXUS ===" -ForegroundColor Cyan

    $CommandGroups = [ordered]@{
        "COGNICAO E EXECUCAO" = @(
            @{ Name = 'nexus <tarefa>'; Desc = 'Enfileira uma nova tarefa para a IA' },
            @{ Name = 'ask <pergunta>'; Desc = 'Consulta o Oraculo (Base RAG Vetorial)' },
            @{ Name = 'nexus-list'; Desc = 'Exibe o Registro Akashico (Tabela das ultimas tarefas)' },
            @{ Name = 'nexus-status'; Desc = 'Exibe as estatisticas da fila e o orcamento de API' },
            @{ Name = 'nexus-notify'; Desc = 'Lista auditorias sentinela pendentes para o @maverick' }
        );
        "ORQUESTRACAO DA MAQUINA" = @(
            @{ Name = 'start-worker'; Desc = 'Inicia o orquestrador (Background Executor SOTA)' },
            @{ Name = 'stop-worker'; Desc = 'Paralisa o orquestrador com seguranca' },
            @{ Name = 'nexus-watch'; Desc = 'Inicia a vigilia ativa (auto-executa tarefas em mudancas)' },
            @{ Name = 'nexus-cli'; Desc = 'Acesso direto ao Kernel Python (task_executor.py)' }
        );
        "BANCO DE DADOS (DAL) E RECUPERACAO" = @(
             @{ Name = 'nexus-db <cmd>'; Desc = 'Acesso direto aos comandos db-* do Kernel' },
             @{ Name = 'nexus-checkdb'; Desc = 'Audita a integridade do banco de dados (corrupcao, zumbis)' },
             @{ Name = 'nexus-retry <id>'; Desc = 'Reenfileira uma tarefa especifica (muda para pending)' },
             @{ Name = 'nexus-retry-failed'; Desc = 'Reenfileira TODAS as tarefas com status failed' },
             @{ Name = 'nexus-complete <id>'; Desc = 'Marca uma tarefa especifica (ex: NOTIFY-*) como concluida' },
             @{ Name = 'nexus-backup'; Desc = 'Cria um snapshot de seguranca da infraestrutura' },
             @{ Name = 'nexus-backup-full'; Desc = 'Cria um backup ZIP total do projeto' },
             @{ Name = 'nexus-restore'; Desc = 'Restaura o sistema a partir do ultimo backup .zip (EMERGENCIA)' }
        );
        "SEGURANCA E AUDITORIA" = @(
            @{ Name = 'nexus-ping'; Desc = 'Enfileira tarefa de diagnostico e exibe PONG quando o worker responder' },
            @{ Name = 'nexus-keys'; Desc = 'Audita chaves de API e auto-dispara diagnostico de rede' },
            @{ Name = 'nexus-fallback'; Desc = 'Mostra metricas de fallback (padrao 180 min)' },
            @{ Name = 'nexus-route-health'; Desc = 'Mostra saude de rota por modelo e candidatos a cooldown' },
            @{ Name = 'nexus-gemini-health'; Desc = 'Auditoria profunda Gemini (ListModels + generateContent)' },
            @{ Name = 'nexus-watchdog'; Desc = 'Exibe as estatisticas do Watchdog e taxa de falhas atual' },
            @{ Name = 'nexus-rate-limits'; Desc = 'Exibe relatorio de gargalos de quota (HTTP 429)' },
            @{ Name = 'nexus-audit'; Desc = 'Dispara uma Auditoria Adaptativa SOTA (Smart MDA)' }
        );
        "MANUTENCAO E SIMETRIA" = @(
            @{ Name = 'nexus-sync'; Desc = 'Sincroniza o Manifesto (Gera/atualiza arquivos de Agentes)' },
            @{ Name = 'nexus-setup'; Desc = 'Reinstala e atualiza as variaveis de perfil do terminal' },
            @{ Name = 'nexus-schedule'; Desc = 'Agenda as tarefas de manutencao automaticas' },
            @{ Name = 'nexus-map'; Desc = 'Exibe o mapa da arquitetura de referencia do sistema' },
            @{ Name = 'nexus-scripts'; Desc = 'Exibe dashboard curado de scripts e comandos funcionais' },
            @{ Name = 'nexus-scripts-refresh'; Desc = 'Regenera o dashboard vivo de scripts/comandos' },
            @{ Name = 'nexus-graph'; Desc = 'Exibe o grafo de dependencias das tarefas pendentes' }
        );
        "CONTROLE DE AUTONOMIA (GOD MODE)" = @(
            @{ Name = 'autonomy-full'; Desc = 'W3 - Ativa o God Mode irrestrito (Auto-execucao de comandos)' },
            @{ Name = 'autonomy-partial'; Desc = 'W2 - Autonomia com bloqueio de comandos destrutivos/alteradores' },
            @{ Name = 'autonomy-default'; Desc = 'W1 - Desativa execucao de terminal (Apenas forjamento de arquivos)' },
            @{ Name = 'autonomy-stop'; Desc = 'W0 - Desativa mutacao completa (Observacao Pura)' }
        )
    }

    foreach ($group in $CommandGroups.GetEnumerator()) {
        Write-Host "`n[ $($group.Name) ]" -ForegroundColor Magenta
        $group.Value | ForEach-Object {
            $nameFormatted = "{0,-30}" -f $_.Name
            Write-Host "  $nameFormatted" -NoNewline
            Write-Host "# " -ForegroundColor DarkGray -NoNewline
            Write-Host $_.Desc -ForegroundColor Gray
        }
    }
    Write-Host "`n==================================================`n" -ForegroundColor Cyan
}

# === END NEXUS SYSTEM ENVIRONMENT ===
'@

# Injeta variaveis no template e garante encodamento UTF-8
$FinalProfileContent = $Template.Replace('__PROJECT_ROOT__', $ProjectRoot)

# Salva no arquivo (sobrescrevendo o que havia para evitar duplicacao na instalacao)
Set-Content -Path $ProfilePath -Value $FinalProfileContent -Encoding UTF8

Write-Host "[OK] Ecossistema Nexus ancorado em: $ProfilePath" -ForegroundColor Green
