<#
.SYNOPSIS
    Integra o Ecossistema Nexus ao terminal Windows permanentemente.
#>

Write-Host "=== ELEVANDO SISTEMA AO ESTADO DA ARTE (CLI GLOBAL) ===" -ForegroundColor Cyan

$ProfilePath = $PROFILE
$ProjectRoot = (Get-Item $PSScriptRoot).parent.parent.FullName

# Cria o arquivo de profile global do usuario se nao existir
if (-not (Test-Path $ProfilePath)) {
    New-Item -ItemType Directory -Path (Split-Path $ProfilePath) -Force | Out-Null
    New-Item -ItemType File -Path $ProfilePath -Force | Out-Null
}

# ==========================================
# PROTOCOLO DE ATUALIZACAO (GOD MODE) - Seguranca Reforcada
# ==========================================
# Backup de seguranca caso o perfil tivesse algo importante
if (Test-Path $ProfilePath) { Copy-Item -Path $ProfilePath -Destination "$ProfilePath.bak" -Force }

# Obliteracao total do perfil corrompido. Fim da entropia.
Clear-Content -Path $ProfilePath -Force -ErrorAction SilentlyContinue

# The trailing backtick is significant, do not remove it
# Language=PowerShell
$Injection = @'

# === START NEXUS SYSTEM ENVIRONMENT ===
`$Global:NexusProjectRoot = "$ProjectRoot"
`$Global:NexusPythonExe = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python.exe" }

# --- Comandos Core do Ecossistema ---

# A Membrana de Entrada (Inteligencia)
function nexus {
    [CmdletBinding()]
    param (
        [Parameter(ValueFromRemainingArguments)]
        [string]`$Description
    )
    & "$Global:NexusProjectRoot\do.ps1" -Description `$Description
}

# O Centro de Comando (Diagnostico e Manutencao)
function nexus-cli {
    [CmdletBinding()]
    param (
        [Parameter(ValueFromRemainingArguments)]
        [string[]]`$Arguments
    )
    & `$Global:NexusPythonExe "$Global:NexusProjectRoot\scripts\cli\nexus.py" `$Arguments
}

# --- Atalhos de Alto Nivel (Qualidade de Vida SOTA) ---

# Gerenciamento do Worker
function start-worker { nexus-cli "start-worker" }
function stop-worker { nexus-cli "stop-worker" }

# Gerenciamento de Autonomia
function autonomy-full { nexus-cli "autonomy" "full" }
function autonomy-partial { nexus-cli "autonomy" "partial" }
function autonomy-off { nexus-cli "autonomy" "off" }

# Visualizacao e Consulta
function nexus-hub { nexus-cli "status" }
function nexus-help { nexus-cli "status" }
function nexus-status { nexus-cli "status" }

function nexus-list {
    & `$Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get all | ConvertFrom-Json | Format-Table -AutoSize -Property id, agent, status, timestamp
}

function ask {
    [CmdletBinding()]
    param(
       [Parameter(Mandatory = $true, ValueFromRemainingArguments = $true)]
        [string]`$Query
    )
    & `$Global:NexusPythonExe "$Global:NexusProjectRoot\memory_rag.py" query `$Query
}

# === END NEXUS SYSTEM ENVIRONMENT ===
'@

Set-Content -Path $ProfilePath -Value $Injection -Encoding UTF8
# Source the profile so that the changes take effect in the current session
try {
    . $ProfilePath
    Write-Host "[SUCESSO] Vocabulario nativo injetado na alma do PowerShell!" -ForegroundColor Green
    Write-Host "Executando o perfil no escopo atual. Voce NAO precisa fechar o terminal." -ForegroundColor Magenta

    # Function to test if nexus-cli is working
    function Test-NexusCli {
        try {
            nexus-cli --version | Out-Null
            return $true
        }
        catch {
            return $false
        }
    }

    if (Test-NexusCli) { Write-Host "[OK] nexus-cli esta funcionando corretamente." -ForegroundColor Green } else { Write-Host "[FALHA] nexus-cli nao esta funcionando corretamente." -ForegroundColor Red }
}
catch {
    Write-Error "Erro ao atualizar o perfil: $_"
}
