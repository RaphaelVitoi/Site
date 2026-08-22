# ==============================================================================
# TIER 0 POWERSHELL PROFILE - SOTA v7.0 GOLD PROTOCOL
# Homeostase de performance e interop WSL sem elevacao implicita.
# ==============================================================================

# 1. Ambiente de shell sem alterar politica de execucao do host
$ProgressPreference = 'SilentlyContinue'

# 2. Variaveis de Ambiente Host (Windows)
$env:UV_PROJECT_ENVIRONMENT = ".venv"
$env:PYTHONDONTWRITEBYTECODE = "1"
$env:OLLAMA_FLASH_ATTENTION = "1"

# SOTA: Persistencia no registro do usuario sem overhead de I/O em loops de shell
if ([Environment]::GetEnvironmentVariable("OLLAMA_FLASH_ATTENTION", "User") -ne "1") {
    [Environment]::SetEnvironmentVariable("OLLAMA_FLASH_ATTENTION", "1", "User")
}

# 3. Interoperabilidade WSL sem shell interpolado ou privilegio elevado
function Invoke-WslNexus {
    wsl.exe --cd "$PWD" -e uv run nexus @args
}
Set-Alias wsl-nexus Invoke-WslNexus

function Invoke-WslPython {
    wsl.exe --cd "$PWD" -e python3 @args
}
Set-Alias wsl-python Invoke-WslPython

function Invoke-WslUv {
    wsl.exe --cd "$PWD" -e uv @args
}
Set-Alias wsl-uv Invoke-WslUv

function Invoke-WslNpm {
    wsl.exe --cd "$PWD" -e npm @args
}
Set-Alias wsl-npm Invoke-WslNpm

function Invoke-WslNpx {
    wsl.exe --cd "$PWD" -e npx @args
}
Set-Alias wsl-npx Invoke-WslNpx

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
