<#
.SYNOPSIS
    Auditoria SOTA de Conectividade e Validade das Chaves de API.
    Auditoria SOTA de Conectividade e Validade das Chaves de API (Pure ASCII).
.DESCRIPTION
    Verifica o status das chaves de API (Google 1, Google 2 e OpenRouter).
    Garante que o ecossistema tem "combustível" antes de invocar o Orquestrador.
    Verifica o status das chaves de API dinamicamente.
    Garante que o ecossistema tem combustivel antes de invocar o Orquestrador.
#>

$ProjectRoot = Split-Path $PSScriptRoot -Parent

# 1. Carregamento de Variáveis de Ambiente
# Suporta tanto o padrão _env.ps1 quanto um arquivo .env tradicional SOTA.
# 1. Carregamento de Variaveis de Ambiente
# Suporta tanto o padrao _env.ps1 quanto um arquivo .env tradicional SOTA.
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

$GoogleKeys = @()
$OpenRouterKeys = @()
$GoogleKeyVars = @{}
$OpenRouterKeyVars = @{}

# Varredura Magica e Infinita das Variaveis de Ambiente
# Varredura Magica e Infinita das Variaveis de Ambiente (Deduplicando por Nome, nao por Valor)
foreach ($Key in [Environment]::GetEnvironmentVariables('Process').GetEnumerator()) {
    $Name = $Key.Name.ToUpper()
    $Value = $Key.Value -replace '^"|"$', ''
    if ([string]::IsNullOrWhiteSpace($Value)) { continue }
    
    if ($Name -match "^GEMINI_API_KEY" -or $Name -match "^GOOGLE_API_KEY") {
        if ($GoogleKeys -notcontains $Value) { $GoogleKeys += $Value }
        $GoogleKeyVars[$Name] = $Value
    }
    elseif ($Name -match "^OPENROUTER_API_KEY") {
        if ($OpenRouterKeys -notcontains $Value) { $OpenRouterKeys += $Value }
        $OpenRouterKeyVars[$Name] = $Value
    }
}

Write-Host "=== INICIANDO AUDITORIA DE INFRAESTRUTURA DE APIs ===" -ForegroundColor Cyan

function Test-GoogleAPI {
    param([string]$Key, [string]$Label)
    if ([string]::IsNullOrWhiteSpace($Key)) {
        Write-Host "  [-] ${Label}: VAZIA / NÃO ENCONTRADA" -ForegroundColor DarkGray
        Write-Host "  [-] ${Label}: VAZIA / NAO ENCONTRADA" -ForegroundColor DarkGray
        return
    }
    
    # Endpoint leve apenas para listar modelos, serve como ping de autenticação
    # Endpoint leve apenas para listar modelos, serve como ping de autenticacao
    $Url = "https://generativelanguage.googleapis.com/v1beta/models?key=$Key"
    try {
        $Response = Invoke-RestMethod -Uri $Url -Method Get -ErrorAction Stop
        Write-Host "  [+] ${Label}: ATIVA E OPERANTE (Modelos disponíveis: $($Response.models.Count))" -ForegroundColor Green
        Write-Host "  [+] ${Label}: ATIVA E OPERANTE (Modelos disponiveis: $($Response.models.Count))" -ForegroundColor Green
    }
    catch {
        Write-Host "  [!] ${Label}: FALHA DE AUTENTICAÇÃO OU CONEXÃO - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  [!] ${Label}: FALHA DE AUTENTICACAO OU CONEXAO - $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-OpenRouterAPI {
    param([string]$Key, [string]$Label)
    if ([string]::IsNullOrWhiteSpace($Key)) {
        Write-Host "  [-] ${Label}: VAZIA / NÃO ENCONTRADA" -ForegroundColor DarkGray
        Write-Host "  [-] ${Label}: VAZIA / NAO ENCONTRADA" -ForegroundColor DarkGray
        return
    }

    # Endpoint oficial de verificação de chave do OpenRouter
    # Endpoint oficial de verificacao de chave do OpenRouter
    $Url = "https://openrouter.ai/api/v1/auth/key"
    $Headers = @{
        "Authorization" = "Bearer $Key"
    }
    try {
        $Response = Invoke-RestMethod -Uri $Url -Method Get -Headers $Headers -ErrorAction Stop
        
        $KeyLabel = if ($Response.data.label) { $Response.data.label } else { "Padrão" }
        $KeyLabel = if ($Response.data.label) { $Response.data.label } else { "Padrao" }
        $Limit = if ($Response.data.limit) { $Response.data.limit } else { "Ilimitado" }
        
        Write-Host "  [+] ${Label}: ATIVA E OPERANTE" -ForegroundColor Green
        Write-Host "      Label: $KeyLabel | Limite de Crédito: $Limit" -ForegroundColor DarkGreen
        Write-Host "      Label: $KeyLabel | Limite de Credito: $Limit" -ForegroundColor DarkGreen
    }
    catch {
        Write-Host "  [!] ${Label}: FALHA DE AUTENTICAÇÃO - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  [!] ${Label}: FALHA DE AUTENTICACAO - $($_.Exception.Message)" -ForegroundColor Red
    }
}

$gIndex = 1
foreach ($Key in $GoogleKeys) {
    Test-GoogleAPI -Key $Key -Label "Google/Gemini API (Chave $gIndex)"
    $gIndex++
    foreach ($K in $GoogleKeyVars.GetEnumerator() | Sort-Object Name) {
        Test-GoogleAPI -Key $K.Value -Label "Google/Gemini API ($($K.Name))"
    }

    $oIndex = 1
    foreach ($Key in $OpenRouterKeys) {
        Test-OpenRouterAPI -Key $Key -Label "OpenRouter API (Chave $oIndex)"
        $oIndex++
        foreach ($K in $OpenRouterKeyVars.GetEnumerator() | Sort-Object Name) {
            Test-OpenRouterAPI -Key $K.Value -Label "OpenRouter API ($($K.Name))"
        }

        Write-Host "=== AUDITORIA CONCLUÍDA ===" -ForegroundColor Cyan
        Write-Host "=== AUDITORIA CONCLUIDA ===" -ForegroundColor Cyan
        Write-Host "[DICA] Para adicionar chaves ausentes, edite seu arquivo .env ou _env.ps1" -ForegroundColor DarkGray