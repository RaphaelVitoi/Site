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

# [SOTA] Aplica a Lei Marcial do Gemini silenciosamente a cada nova sessão
$GeminiLawPath = Join-Path $Global:NexusProjectRoot ".claude\Enforce-GeminiLaw.ps1"
if (Test-Path $GeminiLawPath) {
    try {
        & $GeminiLawPath -Quiet
    } catch {
        # Fallback cego: O perfil nunca deve morrer por falha em scripts secundarios
    }
}

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
        [Parameter(ValueFromRemainingArguments)]
        [string[]]$Arguments
    )
    # Roteamento Absoluto SOTA: O Orquestrador Hibrido e o unico Kernel
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" $Arguments
}

# --- Atalhos de Alto Nivel (Qualidade de Vida SOTA) ---

# Gerenciamento do Worker
function start-worker { nexus-cli worker }
function stop-worker {
    # ... (implementation is correct and robust)
    Write-Host "[SOTA] Paralisando o Orquestrador Hibrido..." -ForegroundColor Yellow
    $PidFilePath = Join-Path $Global:NexusProjectRoot ".nexus_worker.pid"

    if (Test-Path $PidFilePath) {
        try {
                $workerPid = Get-Content $PidFilePath
                $process = Get-Process -Id $workerPid -ErrorAction SilentlyContinue
            if ($process) {
                    Write-Host "[INFO] Tentando parada graciosa (SIGINT) para o processo PID: $workerPid..." -ForegroundColor DarkGray
                # Stop-Process sem -Force tenta um fechamento gracioso, que pode acionar o 'except KeyboardInterrupt' no Python.
                    Stop-Process -Id $workerPid -ErrorAction SilentlyContinue | Out-Null

                if ($process | Wait-Process -Timeout 10 -ErrorAction SilentlyContinue) {
                    Write-Host "[OK] Orquestrador SOTA offline (parada graciosa)." -ForegroundColor Green
                } else {
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
function autonomy-off { Set-NexusAutonomy "off" }

# Visualizacao e Consulta
function nexus-status {
    Write-Host "`n=== PAINEL DE STATUS SOTA NEXUS ===" -ForegroundColor Cyan
    Write-Host "`n[ FILA DE TAREFAS ]" -ForegroundColor Magenta
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get counts
    Write-Host "`n[ ORCAMENTO COGNITIVO DIARIO ]" -ForegroundColor Magenta
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get budget
}
function nexus-hub { nexus-status }

function nexus-keys {
    # Auditoria de chaves + diagnostico de rede automatico quando a falha e de conectividade.
    $output = & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" check-keys 2>&1 | Out-String
    Write-Host $output

    if ($output -match "ClientConnectionError" -or $output -match "WinError 5" -or $output -match "Conexao:") {
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
        Get-Content $MapPath | Out-Host -Paging
    } else {
        Write-Warning "O Mapa do Ecossistema (SOTA_REFERENCE_ARCHITECTURE.md) ainda nao foi gerado."
        Write-Host "Execute 'nexus-schedule' e aguarde o @organizador cria-lo, ou acione manualmente." -ForegroundColor Yellow
    }
}
function nexus-scripts {
    $DashboardPath = Join-Path $Global:NexusProjectRoot "docs\SCRIPTS_E_COMANDOS_DASHBOARD.md"
    if (Test-Path $DashboardPath) {
        Get-Content $DashboardPath | Out-Host -Paging
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
function nexus-db {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromRemainingArguments)]
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
    $RemainingArgs = $Arguments[1..($Arguments.Length - 1)]

    nexus-cli $DbCommand @RemainingArgs
}

function nexus-help {
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
    Write-Host "  nexus-backup-full  - Cria um backup ZIP total do projeto (ignora node_modules e pesados)"

    Write-Host "`n[ SEGURANCA E AUDITORIA ]" -ForegroundColor Magenta
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
    Write-Host "  nexus-scripts      - Exibe dashboard curado de scripts e comandos funcionais"
    Write-Host "  nexus-scripts-refresh - Regenera o dashboard vivo de scripts/comandos"
    Write-Host "  nexus-graph        - Exibe o grafo de dependencias das tarefas pendentes (Mermaid)"

    Write-Host "`n[ CONTROLE DE AUTONOMIA (GOD MODE) ]" -ForegroundColor Magenta
    Write-Host "  autonomy-full      - Ativa o God Mode irrestrito (Auto-execucao de comandos)"
    Write-Host "  autonomy-partial   - Autonomia com bloqueio de comandos destrutivos/alteradores"
    Write-Host "  autonomy-off       - Desativa execucao de terminal (Apenas forjamento de arquivos)"

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

# === END NEXUS SYSTEM ENVIRONMENT ===
'@

# Injeta variaveis no template e garante encodamento UTF-8
$FinalProfileContent = $Template.Replace('__PROJECT_ROOT__', $ProjectRoot)

# Salva no arquivo (sobrescrevendo o que havia para evitar duplicacao na instalacao)
Set-Content -Path $ProfilePath -Value $FinalProfileContent -Encoding UTF8

Write-Host "[OK] Ecossistema Nexus ancorado em: $ProfilePath" -ForegroundColor Green
