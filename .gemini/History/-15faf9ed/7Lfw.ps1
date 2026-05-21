<#
.SYNOPSIS
    [LEGACY PROXY] Bridge de Habilidades SOTA v7.0.
.DESCRIPTION
    Redireciona chamadas obsoletas para o novo Kernel Python, mantendo compatibilidade retroativa.
#>
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet("do", "status", "cleanup", "dashboard")]
    [string]$Skill,

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Payload
)

# Configuracao de caminhos absolutos para robustez
$basePath = "c:\Users\Raphael\OneDrive\Documentos\Site"
$scripts = @{
    "do"        = Join-Path $basePath "do.ps1"
    "status"    = Join-Path $basePath "status.ps1"
    "cleanup"   = Join-Path $basePath "cleanup.ps1"
    "dashboard" = Join-Path $basePath "dashboard.ps1"
}
$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }
$DoScript = Join-Path $ProjectRoot "do.ps1"

function Write-ChicoLog {
    param($Message, $Type = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Output "[$timestamp] [$Type] Chico-Skill: $Message"
}
Write-Host "[SOTA PROXY] Redirecionando chamada legada ('$Skill') para o Orquestrador v7.0..." -ForegroundColor DarkGray

try {
    if (-not $scripts.ContainsKey($Skill)) {
        throw "Habilidade '$Skill' nao mapeada no Orquestrador."
    }

    $scriptPath = $scripts[$Skill]

    if (-not (Test-Path $scriptPath)) {
        throw "Script nao encontrado em: $scriptPath"
    }

    Write-ChicoLog "Invocando '$Skill' com payload: $Payload"

    # Execucao dinamica baseada na habilidade
    if ($Skill -eq "do") {
        & $scriptPath -Prompt ($Payload -join " ")
        & $DoScript -Description ($Payload -join " ")
    }
    elseif ($Skill -eq "status") {
        if ($Payload) {
            & $scriptPath -TaskId $Payload[0]
            & $PythonCmd $PyScript get $Payload[0]
        }
        else {
            & $scriptPath
            & $PythonCmd $PyScript db-get all
        }
    }
    elseif ($Skill -eq "cleanup") {
        if ($Payload) {
            & $scriptPath -DaysToKeep $Payload[0]
            & $PythonCmd $PyScript db-cleanup $Payload[0]
        }
        else {
            & $scriptPath
            & $PythonCmd $PyScript db-cleanup 30
        }
    }
    elseif ($Skill -eq "dashboard") {
        if ($Payload -contains "-Live") {
            & $scriptPath -View "full" -Live -RefreshSeconds 5
        }
        else {
            & $scriptPath -View "full"
        }
        & $PythonCmd $PyScript db-get all
    }
}
catch {
    Write-ChicoLog $_.Exception.Message "ERROR"
    Write-Error "[SOTA PROXY] Falha ao rotear comando: $_"
    exit 1
}
finally {
    Write-ChicoLog "Operacao concluida."
}
