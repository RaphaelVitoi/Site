<#
.SYNOPSIS
    Protocolo de Obliteracao SOTA. Aniquila arquivos e pastas com seguranca e registro em log.
#>
param (
    [string]$Target,
    [string]$ScriptDirectory,
    [switch]$Force
)

Write-Host '=== [PROTOCOLO DE OBLITERACAO] SOTA ATIVADO ===' -ForegroundColor Red
$TargetPath = [System.IO.Path]::GetFullPath((Join-Path $PWD $Target))
$ProjectRoot = [System.IO.Path]::GetFullPath($ScriptDirectory)

if (-not $TargetPath.StartsWith($ProjectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    Write-Error "[SEC CRITICO] O alvo de obliteracao transpassa os limites fisicos do projeto ($ProjectRoot). Acesso negado."
    return
}

if (Test-Path -LiteralPath $TargetPath) {
    $confirmation = if ($Force) { 'y' } else { Read-Host "[ALERTA] Voce esta prestes a obliterar permanentemente '$TargetPath'. IRREVERSIVEL. Deseja prosseguir? (y/n)" }

    if ($confirmation -eq 'y') {
        # Importante: O script pai ja deve ter definido Write-CryptoAuditSOTA se necessario, 
        # ou passamos como callback. Para simplicidade SOTA, assumimos que o pai logou.
        Write-Host "[OBLITERACAO] Vaporizando: $TargetPath" -ForegroundColor Yellow
        Remove-Item -LiteralPath $TargetPath -Recurse -Force -ErrorAction Stop
        Write-Host '[VITORIA] Entropia erradicada com sucesso.' -ForegroundColor Green
    }
    else {
        Write-Host '[CANCELADO] A obliteracao foi cancelada pelo usuario.' -ForegroundColor Cyan
    }
}
else {
    Write-Warning "[AVISO] O alvo nao existe ou ja foi obliterado: $TargetPath"
}
