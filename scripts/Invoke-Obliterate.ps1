<#
.SYNOPSIS
    Protocolo SOTA de Aniquilação Material (Obliterate)
.DESCRIPTION
    Remove fisicamente arquivos e diretórios, erradicando entropia e código morto.
    Usa -LiteralPath para contornar problemas sintáticos do PowerShell com caminhos complexos.
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$Target,

    [Parameter(Mandatory = $true)]
    [string]$ScriptDirectory,

    [switch]$Force
)

$TargetPath = Join-Path $ScriptDirectory $Target

Write-Host "=== [PROTOCOLO OBLITERATE] ANIQUILAÇÃO DE ENTROPIA ===" -ForegroundColor Red
Write-Host "Alvo: $TargetPath" -ForegroundColor DarkGray

if (Test-Path -LiteralPath $TargetPath) {
    try {
        Remove-Item -LiteralPath $TargetPath -Recurse -Force -ErrorAction Stop
        Write-Host "[SUCESSO] Alvo desintegrado. Espaço liberado com Fricção Zero." -ForegroundColor Green
    }
    catch {
        Write-Error "[FALHA CRÍTICA] Colapso ao tentar remover. O arquivo pode estar bloqueado (I/O Lock): $($_.Exception.Message)"
        exit 1
    }
}
else {
    Write-Host "[OK] O alvo já não existe no disco (Fantasma). Nenhuma ação necessária." -ForegroundColor Yellow
}
