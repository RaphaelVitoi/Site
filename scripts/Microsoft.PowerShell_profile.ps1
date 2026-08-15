# ==============================================================================
# TIER 0 POWERSHELL PROFILE - SOTA v7.0 GOLD PROTOCOL
# Bypass absoluto de restricoes, homeostase de performance e interop WSL simetrico
# ==============================================================================

# 1. Erradicacao de Atrito Termodinamico & Silenciamento (Bypass de Politicas)
$ProgressPreference = 'SilentlyContinue'
try {
    # Evita qualquer prompt ou restrição de execução de scripts locais
    Set-ExecutionPolicy Bypass -Scope Process -Force -ErrorAction SilentlyContinue
    Set-ExecutionPolicy Bypass -Scope CurrentUser -Force -ErrorAction SilentlyContinue
}
catch {
    # Silencia limites impostos por politicas do Active Directory ou Registro do Sistema
}

# 2. Variaveis de Ambiente Host (Windows)
$env:UV_PROJECT_ENVIRONMENT = ".venv"
$env:PYTHONDONTWRITEBYTECODE = "1"
$env:OLLAMA_FLASH_ATTENTION = "1"

# SOTA: Persistencia no registro do usuario sem overhead de I/O em loops de shell
if ([Environment]::GetEnvironmentVariable("OLLAMA_FLASH_ATTENTION", "User") -ne "1") {
    [Environment]::SetEnvironmentVariable("OLLAMA_FLASH_ATTENTION", "1", "User")
}

# 3. Workaround de Interoperabilidade WSL Simetrico (Sem overhead de shell interativo)
# Garante paridade delegando execucao ao WSL com privilegios do root,
# mas isolado sob prefixo para nao colidir com wrappers nativos (nexus.ps1)
function Invoke-WslNexus {
    wsl.exe --cd "$PWD" -u root -e bash -lc "uv run nexus $($args -join ' ')"
}
Set-Alias wsl-nexus Invoke-WslNexus

function Invoke-WslRoot {
    if ($args) {
        wsl.exe --cd "$PWD" -u root -e bash -lc "$($args -join ' ')"
    }
    else {
        wsl.exe --cd "$PWD" -u root
    }
}
Set-Alias wsl-root Invoke-WslRoot

function Invoke-WslPython {
    wsl.exe --cd "$PWD" -u root -e bash -lc "python3 $($args -join ' ')"
}
Set-Alias wsl-python Invoke-WslPython

function Invoke-WslUv {
    wsl.exe --cd "$PWD" -u root -e bash -lc "uv $($args -join ' ')"
}
Set-Alias wsl-uv Invoke-WslUv

function Invoke-WslNpm {
    wsl.exe --cd "$PWD" -u root -e bash -lc "npm $($args -join ' ')"
}
Set-Alias wsl-npm Invoke-WslNpm

function Invoke-WslNpx {
    wsl.exe --cd "$PWD" -u root -e bash -lc "npx $($args -join ' ')"
}
Set-Alias wsl-npx Invoke-WslNpx

# 4. Elevacao de Privilegio Nativa (Sudo do Windows)
function sudo {
    if ($args) {
        Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command $args" -Verb RunAs
    }
    else {
        Start-Process powershell -Verb RunAs
    }
}

# ==============================================================================
# 5. ARSENAL EXECUTIVO SOTA (NEXUS CLI WRAPPERS)
# Acesso imediato de Friccao Zero as diretrizes da Membrana (do.ps1)
# ==============================================================================

function Invoke-NexusMembrane {
    param(
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Flag,

        [Parameter(ValueFromRemainingArguments = $true)]
        [string[]]$RemainingArgs
    )
    $Membrane = Join-Path $PWD "do.ps1"
    if (Test-Path -LiteralPath $Membrane) {
        if ($RemainingArgs) {
            & $Membrane -$Flag @RemainingArgs
        }
        else {
            & $Membrane -$Flag
        }
    }
    else {
        Write-Error "[SOTA] Membrana (do.ps1) nao localizada no diretorio atual."
    }
}

function Invoke-NexusWatch { Invoke-NexusMembrane "Watch" @args }
function Invoke-NexusCheckDb { Invoke-NexusMembrane "CheckDB" @args }
function Invoke-NexusSchedule { Invoke-NexusMembrane "ScheduleMaintenance" @args }
function Invoke-NexusBackup { Invoke-NexusMembrane "Backup" @args }
function Invoke-NexusReport { Invoke-NexusMembrane "DailyReport" @args }
function Invoke-NexusAudit { Invoke-NexusMembrane "Audit" @args }
function Invoke-NexusSync { Invoke-NexusMembrane "SyncAgents" @args }
function Invoke-NexusSetup { Invoke-NexusMembrane "Setup" @args }
function Invoke-NexusChaos { Invoke-NexusMembrane "Chaos" @args }
function Invoke-NexusKeys { Invoke-NexusMembrane "Keys" @args }
function Invoke-NexusFix { Invoke-NexusMembrane "FixEPERM" @args }
function Invoke-NexusHandoff { Invoke-NexusMembrane "Handoff" @args }

Set-Alias nexus-watch Invoke-NexusWatch
Set-Alias nexus-checkdb Invoke-NexusCheckDb
Set-Alias nexus-schedule Invoke-NexusSchedule
Set-Alias nexus-backup Invoke-NexusBackup
Set-Alias nexus-report Invoke-NexusReport
Set-Alias nexus-audit Invoke-NexusAudit
Set-Alias nexus-sync Invoke-NexusSync
Set-Alias nexus-setup Invoke-NexusSetup
Set-Alias nexus-chaos Invoke-NexusChaos
Set-Alias nexus-keys Invoke-NexusKeys
Set-Alias nexus-fix Invoke-NexusFix
Set-Alias nexus-handoff Invoke-NexusHandoff

Set-Alias nx nexus-watch

# ==============================================================================
# 6. TYPECHECKING TÉRMICO SOTA (Mypy Daemon via UV)
# ==============================================================================
function Invoke-SotaTypecheck {
    uv run dmypy run -- . $args
}
Set-Alias tc Invoke-SotaTypecheck
