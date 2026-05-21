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
    [CmdletBinding()]
    param(
        [Parameter(ValueFromRemainingArguments)]
        [string]$Description
    )
    & "$Global:NexusProjectRoot\do.ps1" -Description $Description
}

# O Centro de Comando (Diagnostico e Manutencao)
function nexus-cli {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromRemainingArguments)]
        [string[]]$Arguments
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\scripts\cli\nexus.py" $Arguments
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
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\task_executor.py" db-get all | ConvertFrom-Json | Format-Table -AutoSize -Property id, agent, status, timestamp
}

function ask {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, ValueFromRemainingArguments)]
        [string]$Query
    )
    & $Global:NexusPythonExe "$Global:NexusProjectRoot\memory_rag.py" query $Query
}

# === END NEXUS SYSTEM ENVIRONMENT ===
'@

# Substituicao explicita do placeholder
$ProfileContent = $Template.Replace('__PROJECT_ROOT__', $ProjectRoot)

# Escreve o profile
Set-Content -Path $ProfilePath -Value $ProfileContent -Encoding UTF8

# === VERIFICACAO POS-INSTALACAO ===
Write-Host "`n[VERIFICACAO] Testando integridade do profile gerado..." -ForegroundColor Yellow

$parseErrors = $null
[System.Management.Automation.Language.Parser]::ParseFile($ProfilePath, [ref]$null, [ref]$parseErrors)

if ($parseErrors.Count -eq 0) {
    Write-Host "[SUCESSO] Profile gerado sem erros de parse!" -ForegroundColor Green
    Write-Host "[SUCESSO] Vocabulario nativo injetado na alma do PowerShell!" -ForegroundColor Green
}
else {
    Write-Error "[FALHA CRITICA] Profile gerado com $($parseErrors.Count) erro(s) de parse:"
    $parseErrors | ForEach-Object { Write-Error "  - $_" }
    Write-Host "[ROLLBACK] Restaurando backup..." -ForegroundColor Red
    if (Test-Path "$ProfilePath.bak") {
        Copy-Item -Path "$ProfilePath.bak" -Destination $ProfilePath -Force
        Write-Host "[ROLLBACK] Backup restaurado. Profile anterior ativo." -ForegroundColor Yellow
    }
    exit 1
}

Write-Host "`nFeche este terminal e abra um novo para a magica acontecer." -ForegroundColor Magenta
