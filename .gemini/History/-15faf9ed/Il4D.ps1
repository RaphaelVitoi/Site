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

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$PyScript = Join-Path $ProjectRoot "task_executor.py"
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }
$DoScript = Join-Path $ProjectRoot "do.ps1"

Write-Host "[SOTA PROXY] Redirecionando chamada legada ('$Skill') para o Orquestrador v7.0..." -ForegroundColor DarkGray

try {
    # Execucao dinamica baseada na habilidade
    if ($Skill -eq "do") {
        & $DoScript -Description ($Payload -join " ")
    }
    elseif ($Skill -eq "status") {
        if ($Payload) {
            & $PythonCmd $PyScript get $Payload[0]
        }
        else {
            & $PythonCmd $PyScript db-get all
        }
    }
    elseif ($Skill -eq "cleanup") {
        if ($Payload) {
            & $PythonCmd $PyScript db-cleanup $Payload[0]
        }
        else {
            & $PythonCmd $PyScript db-cleanup 30
        }
    }
    elseif ($Skill -eq "dashboard") {
        & $PythonCmd $PyScript db-get all
    }
}
catch {
    Write-Error "[SOTA PROXY] Falha ao rotear comando: $_"
    exit 1
}
