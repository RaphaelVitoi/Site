<#
.SYNOPSIS
    SOTA PathManager - Resolucao Canonica de Caminhos (Virtual Root).
.DESCRIPTION
    Erradica a entropia de caminhos relativos (.\) que falham em diferentes contextos de invocacao (ex: OneDrive).
    Ancora a execucao na raiz do ecossistema ($Global:VITOI_ROOT) e resolve paths absolutos O(1).
#>

# SOTA: Ancoragem Canonica Absoluta do Ecossistema
if (-not $Global:VITOI_ROOT) {
    # O script esta em scripts\utils\, logo a raiz e dois niveis acima
    $Global:VITOI_ROOT = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
}

function Get-SotaPath {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string]$RelativePath
    )

    # SOTA: Purificacao de separadores de diretorio para resiliencia cross-platform e OneDrive
    $NormalizedPath = $RelativePath -replace '[\\/]', [System.IO.Path]::DirectorySeparatorChar

    return [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($Global:VITOI_ROOT, $NormalizedPath))
}

function Resolve-SotaPath {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string]$RelativePath
    )
    $AbsPath = Get-SotaPath -RelativePath $RelativePath
    if (Test-Path -LiteralPath $AbsPath) { return $AbsPath }
    throw "[CORTEX SHIELD] Caminho canonico invalido ou arquivo ausente: $AbsPath"
}
