<#
.SYNOPSIS
    Integra o Ecossistema Nexus ao terminal Windows permanentemente.
.DESCRIPTION
    Gera o PowerShell profile com funcoes globais do Nexus.
    Usa template literal (single-quoted here-string) com substituicao explicita
    para evitar bugs de backtick-escape em here-strings expandiveis.
#>

Write-Host "=== ELEVANDO SISTEMA AO ESTADO DA ARTE (CLI GLOBAL) ===" -ForegroundColor Cyan

$ProfilePath = $PROFILE
$ProjectRoot = (Get-Item $PSScriptRoot).parent.parent.FullName

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
    Write-Host "[SOTA] Paralisando o Orquestrador Hibrido..." -ForegroundColor Yellow
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "task_executor.py" } | Stop-Process -Force
    Write-Host "[OK] Orquestrador SOTA offline." -ForegroundColor Green
}

# Gerenciamento de Autonomia
function Set-NexusAutonomy {
    param([string]$Mode)
    try {
        $apiUrl = "http://127.0.0.1:17042/state"
        $body = @{ key = "autonomy_mode"; value = $Mode } | ConvertTo-Json -Compress
        Invoke-WebRequest -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop | Out-Null
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
function nexus-status { & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get all }
function nexus-hub { nexus-status }

function nexus-keys {
    # Transfere a auditoria complexa para o Orquestrador Python (Concorrencia e Teste Fisico SOTA)
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" check-keys
}

# Atalhos Nativos da Membrana (Friccao Zero)
function nexus-sync { & "$Global:NexusProjectRoot\do.ps1" -SyncAgents }
function nexus-audit { & "$Global:NexusProjectRoot\do.ps1" -Audit "Auditoria Global" }
function nexus-setup { & "$Global:NexusProjectRoot\do.ps1" -Setup }
function nexus-backup { & "$Global:NexusProjectRoot\do.ps1" -Backup }

function nexus-help { 
    Write-Host "`n=== PAINEL DE COMANDOS SOTA NEXUS ===" -ForegroundColor Cyan
    Write-Host "`n[ COGNICAO E EXECUCAO ]" -ForegroundColor Magenta
    Write-Host "  nexus 'tarefa'     - Enfileira uma nova tarefa para a IA"
    Write-Host "  ask 'pergunta'     - Consulta o Oraculo (Base RAG Vetorial)"
    Write-Host "  nexus-list         - Exibe o Registro Akashico (Tabela das ultimas tarefas)"
    Write-Host "  nexus-status       - Exibe vitorias, throughput e estatisticas da fila"
    
    Write-Host "`n[ ORQUESTRACAO DA MAQUINA ]" -ForegroundColor Magenta
    Write-Host "  start-worker       - Inicia o orquestrador (Background Executor SOTA)"
    Write-Host "  stop-worker        - Paralisa o orquestrador com seguranca"
    Write-Host "  nexus-cli          - Acesso direto ao Kernel Python (task_executor.py)"
    
    Write-Host "`n[ SEGURANCA E AUDITORIA ]" -ForegroundColor Magenta
    Write-Host "  nexus-keys         - Exibe o status das chaves de API carregadas (.env / _env.ps1)"
    Write-Host "  nexus-audit        - Dispara uma Auditoria Adaptativa SOTA (Smart MDA)"
    
    Write-Host "`n[ MANUTENCAO E SIMETRIA ]" -ForegroundColor Magenta
    Write-Host "  nexus-sync         - Sincroniza o Manifesto (Gera/atualiza arquivos de Agentes)"
    Write-Host "  nexus-setup        - Reinstala e atualiza as variaveis de perfil do terminal"
    Write-Host "  nexus-backup       - Cria um snapshot/backup de seguranca da infraestrutura"
    
    Write-Host "`n[ CONTROLE DE AUTONOMIA (GOD MODE) ]" -ForegroundColor Magenta
    Write-Host "  autonomy-full      - Ativa o God Mode irrestrito (Auto-execucao de comandos)"
    Write-Host "  autonomy-partial   - Autonomia com bloqueio de comandos destrutivos/alteradores"
    Write-Host "  autonomy-off       - Desativa execucao de terminal (Apenas forjamento de arquivos)"
    
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
        $body = @{ question = $Question; n_results = 3 } | ConvertTo-Json -Compress
        $response = Invoke-WebRequest -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $json = $response.Content | ConvertFrom-Json
        if ($json.status -eq "SUCCESS") {
            & $PrintOracle $json.answer
        } else {
            Write-Error "O Oraculo falhou: $($json.error)"
        }
    } catch {
        Write-Host "[AVISO] Oraculo Hibrido offline. Tentando consulta via API CLI..." -ForegroundColor Yellow
        $Output = & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" ask $Question
        & $PrintOracle $Output
    }
}
# === END NEXUS SYSTEM ENVIRONMENT ===
'@

# Injeta variaveis no template e garante encodamento UTF-8
$FinalProfileContent = $Template.Replace('__PROJECT_ROOT__', $ProjectRoot)

# Salva no arquivo (sobrescrevendo o que havia para evitar duplicacao na instalacao)
Set-Content -Path $ProfilePath -Value $FinalProfileContent -Encoding UTF8

Write-Host "[OK] Ecossistema Nexus ancorado em: $ProfilePath" -ForegroundColor Green
    