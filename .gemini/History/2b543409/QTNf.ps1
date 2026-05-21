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

$GoogleKey1 = [Environment]::GetEnvironmentVariable("GOOGLE_API_KEY_1") -replace '^"|"$', ''
$GoogleKey2 = [Environment]::GetEnvironmentVariable("GOOGLE_API_KEY_2") -replace '^"|"$', ''
$GoogleKey1 = [Environment]::GetEnvironmentVariable("GEMINI_API_KEY") -replace '^"|"$', ''
if ([string]::IsNullOrWhiteSpace($GoogleKey1)) { $GoogleKey1 = [Environment]::GetEnvironmentVariable("GOOGLE_API_KEY_1") -replace '^"|"$', '' }

$GoogleKey2 = [Environment]::GetEnvironmentVariable("GEMINI_API_KEY_SECONDARY") -replace '^"|"$', ''
if ([string]::IsNullOrWhiteSpace($GoogleKey2)) { $GoogleKey2 = [Environment]::GetEnvironmentVariable("GOOGLE_API_KEY_2") -replace '^"|"$', '' }

$GoogleKey3 = [Environment]::GetEnvironmentVariable("GEMINI_API_KEY_TERTIARY") -replace '^"|"$', ''
if ([string]::IsNullOrWhiteSpace($GoogleKey3)) {
    $GoogleKey3 = [Environment]::GetEnvironmentVariable("GOOGLE_API_KEY_3") -replace '^"|"$', ''
}
$OpenRouterKey = [Environment]::GetEnvironmentVariable("OPENROUTER_API_KEY") -replace '^"|"$', ''

$OpenRouterKey1 = [Environment]::GetEnvironmentVariable("OPENROUTER_API_KEY") -replace '^"|"$', ''
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
    param([string]$Key)
    param([string]$Key, [string]$Label)
    if ([string]::IsNullOrWhiteSpace($Key)) {
        Write-Host "  [-] OpenRouter API: VAZIA / NÃO ENCONTRADA" -ForegroundColor DarkGray
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
        
        Write-Host "  [+] OpenRouter API: ATIVA E OPERANTE" -ForegroundColor Green
        Write-Host "  [+] $Label: ATIVA E OPERANTE" -ForegroundColor Green
        Write-Host "      Label: $KeyLabel | Limite de Crédito: $Limit" -ForegroundColor DarkGreen
    }
    catch {
        Write-Host "  [!] OpenRouter API: FALHA DE AUTENTICAÇÃO - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  [!] $Label: FALHA DE AUTENTICAÇÃO - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Test-GoogleAPI -Key $GoogleKey1 -Label "Google API (Chave Primária)"
Test-GoogleAPI -Key $GoogleKey2 -Label "Google API (Chave Secundária)"
Test-GoogleAPI -Key $GoogleKey3 -Label "Google API (Chave Terciária)"
Test-OpenRouterAPI -Key $OpenRouterKey
Test-OpenRouterAPI -Key $OpenRouterKey1 -Label "OpenRouter API (Chave Primária)"
Test-OpenRouterAPI -Key $OpenRouterKey2 -Label "OpenRouter API (Chave Secundária)"

Write-Host "=== AUDITORIA CONCLUÍDA ===" -ForegroundColor Cyan
Write-Host "[DICA] Para adicionar chaves ausentes, edite seu arquivo .env ou _env.ps1" -ForegroundColor DarkGray