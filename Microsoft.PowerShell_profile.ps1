
# === START NEXUS SYSTEM ENVIRONMENT ===
$Global:NexusProjectRoot = "C:\users\rapha\.gemini\Site"
$Global:NexusPythonExe = if (Test-Path "$Global:NexusProjectRoot\.venv\Scripts\python.exe") { "$Global:NexusProjectRoot\.venv\Scripts\python.exe" } else { "python.exe" }

# --- Comandos Core do Ecossistema ---

# A Membrana de Entrada (Inteligencia)
function Invoke-Nexus {
    # Roteamento SOTA: Repassa todos os parametros e flags nativamente para o do.ps1
    & "$Global:NexusProjectRoot\do.ps1" @args
}
Set-Alias nexus Invoke-Nexus

# O Centro de Comando (Diagnostico e Manutencao)
function Invoke-NexusCli {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Arguments
    )
    # Roteamento Absoluto SOTA: O Orquestrador Hibrido e o unico Kernel
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" $Arguments
}
Set-Alias nexus-cli Invoke-NexusCli

# --- Atalhos de Alto Nivel (Qualidade de Vida SOTA) ---

# Gerenciamento do Worker
function Start-NexusWorker { Invoke-NexusCli worker }
Set-Alias start-worker Start-NexusWorker

function Stop-NexusWorker {
    # ... (implementation is correct and robust)
    Write-Host "[SOTA] Paralisando o Orquestrador Hibrido..." -ForegroundColor Yellow
    $PidFilePath = Join-Path $Global:NexusProjectRoot ".nexus_worker.pid"

    if (Test-Path $PidFilePath) {
        try {
            $WorkerPid = Get-Content $PidFilePath
            $process = Get-Process -Id $WorkerPid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "[INFO] Tentando parada graciosa (SIGINT) para o processo PID: $WorkerPid..." -ForegroundColor DarkGray
                # Stop-Process sem -Force tenta um fechamento gracioso, que pode acionar o 'except KeyboardInterrupt' no Python.
                Stop-Process -Id $WorkerPid -ErrorAction SilentlyContinue | Out-Null

                if ($process | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue) {
                    Write-Host "[OK] Orquestrador SOTA offline (parada graciosa)." -ForegroundColor Green
                }
                else {
                    Write-Warning "[AVISO] Parada graciosa falhou ou demorou. Forçando o encerramento..."
                    Stop-Process -Id $WorkerPid -Force
                    Write-Host "[OK] Orquestrador SOTA offline (parada forçada)." -ForegroundColor Green
                }
            }
            else {
                Write-Warning "[AVISO] PID ($WorkerPid) encontrado em .nexus_worker.pid, mas o processo nao existe. Removendo arquivo obsoleto."
                Remove-Item $PidFilePath -Force
            }
        }
        catch {
            Write-Error "Erro ao tentar parar o worker via PID: $_"
        }
    }
    else {
        Write-Host "[INFO] Nenhum arquivo PID encontrado. Usando metodo legado para encontrar o worker..." -ForegroundColor DarkGray
        $workers = Get-CimInstance Win32_Process -Filter "name LIKE 'python%'" | Where-Object { $_.CommandLine -match "task_executor.py\s+worker" }
        if ($workers) {
            $workers | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
            Write-Host "[OK] Orquestrador SOTA offline (parada forçada via fallback)." -ForegroundColor Green
        }
        else {
            Write-Host "[INFO] Nenhum Orquestrador SOTA ativo foi detectado." -ForegroundColor DarkGray
        }
    }
}
Set-Alias stop-worker Stop-NexusWorker

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
    }
    catch {
        & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" autonomy $Mode
    }
}
function Enable-AutonomyFull { Set-NexusAutonomy "full" }
Set-Alias autonomy-full Enable-AutonomyFull
function Enable-AutonomyPartial { Set-NexusAutonomy "partial" }
Set-Alias autonomy-partial Enable-AutonomyPartial
function Disable-Autonomy { Set-NexusAutonomy "off" }
Set-Alias autonomy-off Disable-Autonomy

# Visualizacao e Consulta
function Get-NexusStatus {
    Write-Host "`n=== PAINEL DE STATUS SOTA NEXUS ===" -ForegroundColor Cyan
    Write-Host "`n[ FILA DE TAREFAS ]" -ForegroundColor Magenta
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get counts
    Write-Host "`n[ ORCAMENTO COGNITIVO DIARIO ]" -ForegroundColor Magenta
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get budget
}
Set-Alias nexus-status Get-NexusStatus
function Get-NexusHub { Get-NexusStatus }
Set-Alias nexus-hub Get-NexusHub

function Get-NexusKeys {
    # Auditoria de chaves + diagnostico de rede automatico quando a falha e de conectividade.
    $output = & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" check-keys 2>&1 | Out-String
    Write-Host $output

    if ($output -match "ClientConnectionError" -or $output -match "WinError 5" -or $output -match "Conexao:") {
        Write-Host "[NEXUS] Falha de conectividade detectada. Acionando diagnostico de rede..." -ForegroundColor Yellow
        & $Global:NexusPythonExe "$Global:NexusProjectRoot\scripts\utils\network_diagnostic.py"
    }
}
Set-Alias nexus-keys Get-NexusKeys

function Get-NexusFallback {
    param(
        [int]$Minutes = 180
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" fallback-stats $Minutes
}
Set-Alias nexus-fallback Get-NexusFallback

function Get-NexusRouteHealth {
    param(
        [int]$Minutes = 30
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" route-health $Minutes
}
Set-Alias nexus-route-health Get-NexusRouteHealth

function Get-NexusGeminiHealth {
    param(
        [int]$Minutes = 1440
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" gemini-health $Minutes
}
Set-Alias nexus-gemini-health Get-NexusGeminiHealth

function Clear-NexusFallback {
    param(
        [int]$Days = 7
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" fallback-prune $Days
}
Set-Alias nexus-fallback-prune Clear-NexusFallback

function Clear-NexusFallbackLegacy {
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" fallback-prune-legacy
}
Set-Alias nexus-fallback-prune-legacy Clear-NexusFallbackLegacy

# Atalhos Nativos da Membrana (Friccao Zero)
function Sync-Nexus { & "$Global:NexusProjectRoot\do.ps1" -SyncAgents }
Set-Alias nexus-sync Sync-Nexus
function Invoke-NexusAudit { & "$Global:NexusProjectRoot\do.ps1" -Audit "Auditoria Global" }
Set-Alias nexus-audit Invoke-NexusAudit
function Test-NexusNet { & $Global:NexusPythonExe "$Global:NexusProjectRoot\scripts\utils\network_diagnostic.py" }
Set-Alias nexus-diag-net Test-NexusNet
function Initialize-Nexus { & "$Global:NexusProjectRoot\do.ps1" -Setup }
Set-Alias nexus-setup Initialize-Nexus
function Backup-Nexus { & "$Global:NexusProjectRoot\do.ps1" -Backup }
Set-Alias nexus-backup Backup-Nexus
function Register-NexusSchedule { & "$Global:NexusProjectRoot\do.ps1" -ScheduleMaintenance }
Set-Alias nexus-schedule Register-NexusSchedule
function Watch-Nexus { & "$Global:NexusProjectRoot\do.ps1" -Watch }
Set-Alias nexus-watch Watch-Nexus
function Invoke-NexusReflect { & "$Global:NexusProjectRoot\do.ps1" -Reflect }
Set-Alias nexus-reflect Invoke-NexusReflect
function Invoke-NexusHandoff { & "$Global:NexusProjectRoot\do.ps1" -Handoff }
Set-Alias nexus-handoff Invoke-NexusHandoff
Set-Alias handoff Invoke-NexusHandoff
function Show-NexusMap {
    $MapPath = Join-Path $Global:NexusProjectRoot "docs\SOTA_REFERENCE_ARCHITECTURE.md"
    if (Test-Path $MapPath) {
        # Usa um pager para textos longos, se disponivel, ou apenas exibe.
        Get-Content $MapPath | Out-Host -Paging
    }
    else {
        Write-Warning "O Mapa do Ecossistema (SOTA_REFERENCE_ARCHITECTURE.md) ainda nao foi gerado."
        Write-Host "Execute 'nexus-schedule' e aguarde o @organizador cria-lo, ou acione manualmente." -ForegroundColor Yellow
    }
}
Set-Alias nexus-map Show-NexusMap
function Show-NexusScripts {
    $DashboardPath = Join-Path $Global:NexusProjectRoot "docs\SCRIPTS_E_COMANDOS_DASHBOARD.md"
    if (Test-Path $DashboardPath) {
        Get-Content $DashboardPath | Out-Host -Paging
    }
    else {
        Write-Warning "Dashboard de scripts/comandos nao encontrado."
    }
}
Set-Alias nexus-scripts Show-NexusScripts
function Update-NexusScripts {
    & "$Global:NexusProjectRoot\scripts\routines\invoke_scripts_dashboard.ps1"
}
Set-Alias nexus-scripts-refresh Update-NexusScripts
function Test-NexusDb { & "$Global:NexusProjectRoot\do.ps1" -CheckDB }
Set-Alias nexus-checkdb Test-NexusDb
function Invoke-NexusDb {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$Arguments
    )
    if ($Arguments.Length -eq 0) {
        # SOTA: Busca dinamica dos comandos disponiveis no Kernel
        try {
            Write-Host "Buscando comandos de banco de dados no Kernel SOTA..." -ForegroundColor DarkGray
            $commandsJson = Invoke-NexusCli db-commands
            $commands = $commandsJson | ConvertFrom-Json

            Write-Host "`nUso: nexus-db <subcomando> [argumentos]`n" -ForegroundColor Yellow
            Write-Host "Subcomandos disponiveis:"

            # Formata a saida em uma tabela improvisada
            $commands.PSObject.Properties | ForEach-Object {
                $commandName = $_.Name
                $commandDesc = $_.Value
                Write-Host ("  {0,-30} # {1}" -f $commandName, $commandDesc)
            }
        }
        catch {
            Write-Error "Nao foi possivel obter a lista de comandos do Kernel. Verifique se o worker esta online ou use 'nexus-cli db-commands' para depurar."
        }
        return
    }
    # Monta o comando db-* para o nexus-cli
    $DbCommand = "db-" + $Arguments[0]
    if ($Arguments.Length -gt 1) {
        $RemainingArgs = $Arguments[1..($Arguments.Length - 1)]
        Invoke-NexusCli $DbCommand @RemainingArgs
    }
    else {
        Invoke-NexusCli $DbCommand
    }
}
Set-Alias nexus-db Invoke-NexusDb

function Get-NexusHelp {
    Write-Host "`n=== PAINEL DE COMANDOS SOTA NEXUS ===" -ForegroundColor Cyan
    Write-Host "`n[ COGNICAO E EXECUCAO ]" -ForegroundColor Magenta
    Write-Host "  nexus 'tarefa'     - Enfileira uma nova tarefa para a IA"
    Write-Host "  ask 'pergunta'     - Consulta o Oraculo (Base RAG Vetorial)"
    Write-Host "  nexus-list         - Exibe o Registro Akashico (Tabela das ultimas tarefas)"
    Write-Host "  nexus-status       - Exibe as estatisticas da fila e o orcamento de API"

    Write-Host "`n[ ORQUESTRACAO DA MAQUINA ]" -ForegroundColor Magenta
    Write-Host "  start-worker       - Inicia o orquestrador (Background Executor SOTA)"
    Write-Host "  stop-worker        - Paralisa o orquestrador com seguranca"
    Write-Host "  nexus-watch        - Inicia a vigilia ativa (auto-executa tarefas em mudancas)"
    Write-Host "  nexus-cli          - Acesso direto ao Kernel Python (task_executor.py)"

    Write-Host "`n[ BANCO DE DADOS (DAL) ]" -ForegroundColor Magenta
    Write-Host "  nexus-db <cmd>     - Acesso direto aos comandos 'db-*' do Kernel (ex: get, cleanup)"
    Write-Host "  nexus-checkdb      - Audita a integridade do banco de dados (corrupcao, zumbis)"
    Write-Host "  nexus-backup       - Cria um snapshot/backup de seguranca da infraestrutura"

    Write-Host "`n[ SEGURANCA E AUDITORIA ]" -ForegroundColor Magenta
    Write-Host "  nexus-keys         - Audita chaves de API e auto-dispara diagnostico de rede em falhas de conexao"
    Write-Host "  nexus-fallback     - Mostra metricas de fallback (padrao 180 min)"
    Write-Host "  nexus-route-health - Mostra saude de rota por modelo e candidatos a cooldown (padrao 30 min)"
    Write-Host "  nexus-gemini-health - Auditoria profunda Gemini (ListModels + generateContent + ranking de chaves)"
    Write-Host "  nexus-fallback-prune - Limpa metricas antigas de fallback (padrao 7 dias)"
    Write-Host "  nexus-fallback-prune-legacy - Remove ruido legado de modelos antigos (1.5/Anthropic)"
    Write-Host "  nexus-diag-net     - Executa um diagnostico de rede para as APIs do Google"
    Write-Host "  nexus-audit        - Dispara uma Auditoria Adaptativa SOTA (Smart MDA)"

    Write-Host "`n[ MANUTENCAO E SIMETRIA ]" -ForegroundColor Magenta
    Write-Host "  nexus-sync         - Sincroniza o Manifesto (Gera/atualiza arquivos de Agentes)"
    Write-Host "  nexus-setup        - Reinstala e atualiza as variaveis de perfil do terminal"
    Write-Host "  nexus-schedule     - Agenda as tarefas de manutencao automaticas (backup, auditoria)"
    Write-Host "  nexus-map          - Exibe o mapa da arquitetura de referencia do sistema"
    Write-Host "  nexus-scripts      - Exibe dashboard curado de scripts e comandos funcionais"
    Write-Host "  nexus-scripts-refresh - Regenera o dashboard vivo de scripts/comandos"

    Write-Host "`n[ CONTROLE DE AUTONOMIA (GOD MODE) ]" -ForegroundColor Magenta
    Write-Host "  autonomy-full      - Ativa o God Mode irrestrito (Auto-execucao de comandos)"
    Write-Host "  autonomy-partial   - Autonomia com bloqueio de comandos destrutivos/alteradores"
    Write-Host "  autonomy-off       - Desativa execucao de terminal (Apenas forjamento de arquivos)"

    Write-Host "`n[ AUTOPOIESE E EVOLUCAO ]" -ForegroundColor Magenta
    Write-Host "  nexus-reflect      - Aciona a reflexao em massa para todos os agentes (Autopoiese)"

    Write-Host "`n=====================================`n" -ForegroundColor Cyan
}
Set-Alias nexus-help Get-NexusHelp

function Get-NexusList {
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get all
}
Set-Alias nexus-list Get-NexusList

function Invoke-NexusAsk {
    param(
        [Parameter(ValueFromRemainingArguments = $true)]
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
        }
        else {
            Write-Error "O Oraculo falhou: $($json.error)"
        }
    }
    catch {
        Write-Host "[AVISO] Oraculo Hibrido offline. Tentando consulta via API CLI..." -ForegroundColor Yellow
        $Output = & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" query $Question
        & $PrintOracle $Output
    }
}
Set-Alias ask Invoke-NexusAsk
# === END NEXUS SYSTEM ENVIRONMENT ===
function pio { & 'F:\Meu Drive\PioSOLVER-edge.exe' @args }
function monker { & 'F:\MonkerSolver\MonkerSolver.exe' @args }
