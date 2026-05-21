param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet("do", "status", "cleanup")]
    [string]$Skill,

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Payload
)

# Configuração de caminhos absolutos para robustez
$basePath = "c:\Users\Raphael\OneDrive\Documentos\Site"
$scripts = @{
    "do"     = Join-Path $basePath "do.ps1"
    "status" = Join-Path $basePath "status.ps1"
}

function Write-ChicoLog {
    param($Message, $Type = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Output "[$timestamp] [$Type] Chico-Skill: $Message"
}

try {
    if (-not $scripts.ContainsKey($Skill)) {
        throw "Habilidade '$Skill' não mapeada no Orquestrador."
    }

    $scriptPath = $scripts[$Skill]

    if (-not (Test-Path $scriptPath)) {
        throw "Script não encontrado em: $scriptPath"
    }

    Write-ChicoLog "Invocando '$Skill' com payload: $Payload"

    # Execução dinâmica baseada na habilidade
    if ($Skill -eq "do") {
        & $scriptPath -Prompt ($Payload -join " ")
    }
    elseif ($Skill -eq "status") {
        if ($Payload) {
            & $scriptPath -TaskId $Payload[0]
        }
        else {
            & $scriptPath
        }
    }
}
catch {
    Write-ChicoLog $_.Exception.Message "ERROR"
    exit 1
}
finally {
    Write-ChicoLog "Operação concluída."
}
