<#
.SYNOPSIS
    Instala um atalho universal no PowerShell para invocar a Membrana Inteligente (do.ps1)
    sem precisar de ".\" e bypassando a restricao da palavra-chave reservada "do".
#>

$ProfileDir = Split-Path $PROFILE -Parent
if (-not (Test-Path $ProfileDir)) { New-Item -ItemType Directory -Path $ProfileDir -Force | Out-Null }

$AliasCode = @"

# [NEXUS HUB SOTA] Membrana Inteligente
function nx {
    `$doScript = Join-Path `$PWD `"do.ps1`"
    if (Test-Path `$doScript) {
        & `$doScript @args
    } else {
        Write-Host `"[ERRO] Voce nao esta na raiz do ecossistema SOTA (do.ps1 nao encontrado).`" -ForegroundColor Red
    }
}
function chico { nx @args }
"@

if (Test-Path $PROFILE) {
    $CurrentProfile = Get-Content $PROFILE -Raw
    if ($CurrentProfile -match "function nx") {
        Write-Host "[OK] Os atalhos 'nx' e 'chico' ja estao instalados no seu perfil." -ForegroundColor Yellow
        exit 0
    }
}

Add-Content -Path $PROFILE -Value $AliasCode
Write-Host "`n[SUCESSO] Atalhos Universais injetados na sua consciencia PowerShell." -ForegroundColor Green
Write-Host "DIRETRIZ DE ATIVACAO:" -ForegroundColor Cyan
Write-Host "1. Reinicie este terminal (Feche e abra novamente)."
Write-Host "2. A partir de agora, chame o sistema pelo nome absoluto:" -ForegroundColor White
Write-Host "   nx -Monitor" -ForegroundColor Magenta
Write-Host "   chico -Monitor" -ForegroundColor Magenta