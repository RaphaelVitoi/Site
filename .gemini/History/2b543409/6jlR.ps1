<#
.SYNOPSIS
    Auditoria SOTA de Conectividade e Validade das Chaves de API.
.DESCRIPTION
    Verifica o status das chaves de API (Google 1, Google 2 e OpenRouter).
    Garante que o ecossistema tem "combustível" antes de invocar o Orquestrador.
#>

$ProjectRoot = Split-Path $PSScriptRoot -Parent

# 1. Carregamento de Variáveis de Ambiente
# Suporta tanto o padrão _env.ps1 quanto um arquivo .env tradicional SOTA.
$EnvPs1Path = Join-Path $ProjectRoot "_env.ps1"
$DotEnvPath = Join-Path $ProjectRoot ".env"

if (Test-Path $EnvPs1Path) { 
    . $EnvPs1Path 
}
elseif (Test-Path $DotEnvPath) {
    Get-Content $DotEnvPath | ForEach-Object {
        if ($_ -match '^(?!#)([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), 'Process')
        }
    }
}

$GoogleKey1 = [Environment]::GetEnvironmentVariable("AIzaSyDeSdVEDJBJ9ExJ_iZtvpq3W9WlN8kctfA") -replace '^"|"$', ''
if ([string]::IsNullOrWhiteSpace($GoogleKey1)) { $GoogleKey1 = [Environment]::GetEnvironmentVariable("GOOGLE_API_KEY_1") -replace '^"|"$', '' }
$GoogleKeys = @()
$OpenRouterKeys = @()

$GoogleKey2 = [Environment]::GetEnvironmentVariable("AIzaSyCI5n7E0auzAWazv5DBuLrb2XzN2Qbix6c") -replace '^"|"$', ''
if ([string]::IsNullOrWhiteSpace($GoogleKey2)) { $GoogleKey2 = [Environment]::GetEnvironmentVariable("GOOGLE_API_KEY_2") -replace '^"|"$', '' }

$GoogleKey3 = [Environment]::GetEnvironmentVariable("AIzaSyAsVPLwKYhirWTiW3pgZWgAEjFtY1IHQyc") -replace '^"|"$', ''
if ([string]::IsNullOrWhiteSpace($GoogleKey3)) {
    $GoogleKey3 = [Environment]::GetEnvironmentVariable("AIzaSyAsVPLwKYhirWTiW3pgZWgAEjFtY1IHQyc") -replace '^"|"$', ''
    # Varredura Magica e Infinita das Variaveis de Ambiente
    foreach ($Key in [Environment]::GetEnvironmentVariables('Process').GetEnumerator()) {
        $Name = $Key.Name.ToUpper()
        $Value = $Key.Value -replace '^"|"$', ''
        if ([string]::IsNullOrWhiteSpace($Value)) { continue }
    
        if ($Name -match "^GEMINI_API_KEY" -or $Name -match "^GOOGLE_API_KEY") {
            if ($GoogleKeys -notcontains $Value) { $GoogleKeys += $Value }
        }
        elseif ($Name -match "^OPENROUTER_API_KEY") {
            if ($OpenRouterKeys -notcontains $Value) { $OpenRouterKeys += $Value }
        }
    }

    $OpenRouterKey1 = [Environment]::GetEnvironmentVariable("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") -replace '^"|"$', ''
    if ([string]::IsNullOrWhiteSpace($OpenRouterKey1)) { $OpenRouterKey1 = [Environment]::GetEnvironmentVariable("OPENROUTER_API_KEY_1") -replace '^"|"$', '' }

    $OpenRouterKey2 = [Environment]::GetEnvironmentVariable("OPENROUTER_API_KEY_2") -replace '^"|"$', ''

    Write-Host "=== INICIANDO AUDITORIA DE INFRAESTRUTURA DE APIs ===" -ForegroundColor Cyan

    function Test-GoogleAPI {
        param([string]$Key, [string]$Label)
        if ([string]::IsNullOrWhiteSpace($Key)) {
            Write-Host "  [-] $Label: VAZIA / NÃO ENCONTRADA" -ForegroundColor DarkGray
            return
        }
    
        # Endpoint leve apenas para listar modelos, serve como ping de autenticação
        $Url = "https://generativelanguage.googleapis.com/v1beta/models?key=$Key"
        try {
            $Response = Invoke-RestMethod -Uri $Url -Method Get -ErrorAction Stop
            Write-Host "  [+] $Label: ATIVA E OPERANTE (Modelos disponíveis: $($Response.models.Count))" -ForegroundColor Green
        }
        catch {
            Write-Host "  [!] $Label: FALHA DE AUTENTICAÇÃO OU CONEXÃO - $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    function Test-OpenRouterAPI {
        param([string]$Key, [string]$Label)
        if ([string]::IsNullOrWhiteSpace($Key)) {
            Write-Host "  [-] $Label: VAZIA / NÃO ENCONTRADA" -ForegroundColor DarkGray
            return
        }

        # Endpoint oficial de verificação de chave do OpenRouter
        $Url = "https://openrouter.ai/api/v1/auth/key"
        $Headers = @{
            "Authorization" = "Bearer $Key"
        }
        try {
            $Response = Invoke-RestMethod -Uri $Url -Method Get -Headers $Headers -ErrorAction Stop
        
            $KeyLabel = if ($Response.data.label) { $Response.data.label } else { "Padrão" }
            $Limit = if ($Response.data.limit) { $Response.data.limit } else { "Ilimitado" }
        
            Write-Host "  [+] $Label: ATIVA E OPERANTE" -ForegroundColor Green
            Write-Host "      Label: $KeyLabel | Limite de Crédito: $Limit" -ForegroundColor DarkGreen
        }
        catch {
            Write-Host "  [!] $Label: FALHA DE AUTENTICAÇÃO - $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Test-GoogleAPI -Key $GoogleKey1 -Label "Google API (Chave Primária)"
    Test-GoogleAPI -Key $GoogleKey2 -Label "Google API (Chave Secundária)"
    Test-GoogleAPI -Key $GoogleKey3 -Label "Google API (Chave Terciária)"
    Test-OpenRouterAPI -Key $OpenRouterKey1 -Label "OpenRouter API (Chave Primária)"
    Test-OpenRouterAPI -Key $OpenRouterKey2 -Label "OpenRouter API (Chave Secundária)"
    $gIndex = 1
    foreach ($Key in $GoogleKeys) {
        Test-GoogleAPI -Key $Key -Label "Google/Gemini API (Chave $gIndex)"
        $gIndex++
    }

    $oIndex = 1
    foreach ($Key in $OpenRouterKeys) {
        Test-OpenRouterAPI -Key $Key -Label "OpenRouter API (Chave $oIndex)"
        $oIndex++
    }

    Write-Host "=== AUDITORIA CONCLUÍDA ===" -ForegroundColor Cyan
    Write-Host "[DICA] Para adicionar chaves ausentes, edite seu arquivo .env ou _env.ps1" -ForegroundColor DarkGray