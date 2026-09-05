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
$RawProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$ProjectRoot = (Get-Item $RawProjectRoot).FullName

# Valida que o ProjectRoot resolve corretamente e contem o arquivo do.ps1
if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot 'do.ps1'))) {
    Write-Error "ProjectRoot invalido ou incompleto: '$ProjectRoot'. Certifique-se de que o script esta em scripts\setup e o arquivo do.ps1 existe na raiz."
    exit 1
}

Write-Host "[SOTA] ProjectRoot ancorado: $ProjectRoot" -ForegroundColor DarkCyan

# Cria diretorio do profile se nao existir
$ProfileDir = Split-Path $ProfilePath
if (-not (Test-Path -LiteralPath $ProfileDir)) {
    New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null
}

# Backup do perfil anterior
if (Test-Path -LiteralPath $ProfilePath) {
    Copy-Item -Path $ProfilePath -Destination "$ProfilePath.bak" -Force
    Write-Host "[INFO] Backup salvo em: $ProfilePath.bak" -ForegroundColor DarkCyan
}

# Template literal (single-quoted here-string) - nenhum $ e expandido
# __PROJECT_ROOT__ e o unico placeholder, substituido explicitamente
$Template = @'

# === START NEXUS SYSTEM ENVIRONMENT ===
$Global:NexusProjectRoot = "__PROJECT_ROOT__"
$Global:NexusPythonExe = if (Test-Path -LiteralPath "$Global:NexusProjectRoot\.venv\Scripts\python.exe") { "$Global:NexusProjectRoot\.venv\Scripts\python.exe" } else { "python.exe" }

# SOTA: Suspensao do OneDrive disparada pela instanciacao do VSCode
if ($env:TERM_PROGRAM -eq 'vscode') {
    $odProcess = Get-Process -Name 'OneDrive' -ErrorAction SilentlyContinue
    if ($odProcess) {
        Write-Host '[SEC] VSCode detectado. Aniquilando processo do OneDrive para prevenir EPERM e locks de DB...' -ForegroundColor Yellow
        Stop-Process -Name 'OneDrive' -Force -ErrorAction SilentlyContinue
    }
}

# --- Helpers de Resiliencia SOTA ---
function Search-DeepPropertyRegexSOTA {
    param(
        [psobject]$Node,
        [string]$RegexPattern,
        [System.Collections.Generic.List[psobject]]$Accumulator = $null,
        [switch]$FirstMatchOnly
    )
    if ($null -eq $Node) { return }
    $IsRoot = $false
    if ($null -eq $Accumulator) {
        $Accumulator = [System.Collections.Generic.List[psobject]]::new()
        $IsRoot = $true
    }
    if ($FirstMatchOnly -and $Accumulator.Count -gt 0) {
        if ($IsRoot) { return $Accumulator }
        return
    }
    try {
        if ($Node -is [array]) {
            foreach ($item in $Node) {
                if ($FirstMatchOnly -and $Accumulator.Count -gt 0) { break }
                Search-DeepPropertyRegexSOTA -Node $item -RegexPattern $RegexPattern -Accumulator $Accumulator -FirstMatchOnly:$FirstMatchOnly
            }
        } elseif ($null -ne $Node.PSObject -and $null -ne $Node.PSObject.Properties) {
            foreach ($prop in $Node.PSObject.Properties) {
                if ($FirstMatchOnly -and $Accumulator.Count -gt 0) { break }
                if ($prop.Name -match $RegexPattern) {
                    [void]$Accumulator.Add([pscustomobject]@{ Key = $prop.Name; Value = $prop.Value })
                    if ($FirstMatchOnly) { break }
                }
                if ($null -ne $prop.Value) { Search-DeepPropertyRegexSOTA -Node $prop.Value -RegexPattern $RegexPattern -Accumulator $Accumulator -FirstMatchOnly:$FirstMatchOnly }
            }
        }
    } catch { }
    if ($IsRoot) { return $Accumulator }
}

function Invoke-FallbackSOTA {
    param(
        [Parameter(Mandatory=$true)][scriptblock]$Action,
        [Parameter(Mandatory=$true)]$Fallback,
        [string]$WarningMsg = ""
    )
    try {
        $res = & $Action
        if ($null -eq $res) { throw "Resultado de execucao nulo." }
        return $res
    } catch {
        $msg = if ($WarningMsg) { "$WarningMsg ($($_.Exception.Message))" } else { "Falha de processamento ($($_.Exception.Message))" }
        Write-Warning "[FALLBACK SOTA] $msg -> Assumindo valor seguro de contingencia."
        return $Fallback
    }
}

function Convert-DeepJsonStringSOTA {
    param([Parameter(ValueFromPipeline=$true)]$Node)
    if ($null -eq $Node) { return $null }

    if ($Node -is [string]) {
        $t = $Node.Trim()
        if (($t.StartsWith("{") -and $t.EndsWith("}")) -or ($t.StartsWith("[") -and $t.EndsWith("]"))) {
            try { return Convert-DeepJsonStringSOTA -Node ($t | ConvertFrom-Json) } catch { return $Node }
        }
        return $Node
    }

    if ($Node -is [array]) {
        $arr = [System.Collections.Generic.List[psobject]]::new()
        foreach ($i in $Node) { [void]$arr.Add((Convert-DeepJsonStringSOTA -Node $i)) }
        return $arr.ToArray()
    }

    if ($null -ne $Node.PSObject -and $null -ne $Node.PSObject.Properties) {
        $obj = New-Object PSObject
        foreach ($p in $Node.PSObject.Properties) { $obj | Add-Member -MemberType NoteProperty -Name $p.Name -Value (Convert-DeepJsonStringSOTA -Node $p.Value) }
        return $obj
    }
    return $Node
}

# --- Comandos Core do Ecossistema ---

# A Membrana de Entrada (Inteligencia SOTA v8.0 GOLD)
# Ver a nota gemea em Microsoft.PowerShell_profile.ps1. Esta lista e esta funcao
# estao DUPLICADAS entre os dois arquivos -- item 1.3 do plano 2-B, fonte unica
# ainda por declarar. Enquanto durar a duplicacao, tests/test_roteamento_perfil.py
# compara AMBAS as copias com os comandos que o Typer registra: a duplicacao
# continua, mas deixou de poder divergir em silencio.
$Global:NexusTyperCommands = @(
    'agent', 'audit', 'autonomy', 'autopoiesis', 'calib-forecast', 'chat', 'clippy', 'dashboard', 'db', 'gate',
    'graph', 'handoff', 'homeostasis', 'index', 'list', 'ops', 'routine', 'scripts', 'search',
    'stats', 'status', 'sync-consciousness', 'task', 'task-audit', 'test', 'triad', 'voice', 'web'
)

function nexus {
    if ($args.Count -eq 0) {
        & "$Global:NexusProjectRoot\nexus.ps1"
        return
    }
    if ($Global:NexusTyperCommands -contains "$($args[0])") {
        & "$Global:NexusProjectRoot\nexus.ps1" @args
    } else {
        # Flags e TEXTO LIVRE de tarefa: ambos sao do do.ps1.
        & "$Global:NexusProjectRoot\do.ps1" @args
    }
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

    if (Test-Path -LiteralPath $PidFilePath) {
        try {
            $rawPid = (Get-Content -LiteralPath $PidFilePath -Raw).Trim()
            if ($rawPid -match '^\d+$') {
                $workerPid = [int]$rawPid
                $process = Get-Process -Id $workerPid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "[SEC] Obliterando processo Worker (PID $workerPid) com precisao cirurgica..." -ForegroundColor DarkGray
                    Stop-Process -Id $workerPid -Force -ErrorAction SilentlyContinue
                    $process | Wait-Process -Timeout 5 -ErrorAction SilentlyContinue
                    Write-Host "[OK] Orquestrador SOTA offline. (Friccao Zero)" -ForegroundColor Green
                } else {
                    Write-Host "[SEC] Worker (PID $workerPid) nao esta mais em execucao. Limpando artefato." -ForegroundColor DarkGray
                }
            } else {
                Write-Warning "[AVISO] Arquivo PID malformado. Removendo..."
            }
            Remove-Item -LiteralPath $PidFilePath -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Error "Erro ao tentar obliterar o worker via PID: $_"
        }
    }
    else {
        Write-Host "[INFO] Arquivo PID ausente. Nenhum worker ativo detectado pela ancora." -ForegroundColor DarkGray
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

        $capacityValue = Get-SafeDeepPropertySOTA -Node $status -Path 'rate_limiter.capacity'

        if ($null -ne $capacityValue) {
            try {
                $tokensValue = [double]::Parse((Get-SafeDeepPropertySOTA -Node $status -Path 'rate_limiter.current_tokens' -Fallback 0).ToString(), [System.Globalization.CultureInfo]::InvariantCulture)
                $starvationValue = [int](Get-SafeDeepPropertySOTA -Node $status -Path 'rate_limiter.starvation_events' -Fallback 0)
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

# --- Aliases para o Dashboard e Comandos Comuns (Friccao Zero) ---
function Invoke-Dashboard {
    & "$Global:NexusProjectRoot\dashboard.ps1" @args
}
Set-Alias -Name dashboard -Value Invoke-Dashboard
Set-Alias -Name hub -Value nexus-status
Set-Alias -Name vitoi_dashboard -Value Invoke-Dashboard
Set-Alias -Name gemini-cli -Value nexus-cli
Set-Alias -Name sota -Value nexus

# --- Substituicao de Aliases Nativos (Friccao Zero) ---
Remove-Item Alias:gc -Force -ErrorAction SilentlyContinue
function gc { nexus @args }

Remove-Item Alias:gl -Force -ErrorAction SilentlyContinue
function gl { git log --oneline -n 10 @args }

'@

$FinalProfileContent = $Template.Replace('__PROJECT_ROOT__', $ProjectRoot)

# Salva no arquivo principal do PROFILE
Set-Content -Path $ProfilePath -Value $FinalProfileContent -Encoding UTF8
Write-Host "[OK] Ecossistema Nexus ancorado em: $ProfilePath" -ForegroundColor Green

# Salva no arquivo alternativo (garante suporte a Windows PowerShell E PowerShell 7 Core)
$AltProfilePath = if ($ProfilePath -match 'WindowsPowerShell') {
    $ProfilePath -replace 'WindowsPowerShell', 'PowerShell'
} else {
    $ProfilePath -replace 'PowerShell', 'WindowsPowerShell'
}
$AltProfileDir = Split-Path $AltProfilePath
if (-not (Test-Path -LiteralPath $AltProfileDir)) {
    New-Item -ItemType Directory -Path $AltProfileDir -Force | Out-Null
}
Set-Content -Path $AltProfilePath -Value $FinalProfileContent -Encoding UTF8
Write-Host "[OK] Ecossistema Nexus ancorado no profile alternativo: $AltProfilePath" -ForegroundColor Green

