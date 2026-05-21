<#
.SYNOPSIS
    Auditoria SOTA de Conectividade e Validade das Chaves de API (Pure ASCII).
.DESCRIPTION
    Verifica o status das chaves de API dinamicamente.
    Garante que o ecossistema tem combustivel antes de invocar o Orquestrador.
#>

$ProjectRoot = Split-Path $PSScriptRoot -Parent

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
            $GoogleKeyVars = @{}
            $OpenRouterKeyVars = @{}

            # Extrator Implacavel (Le direto do arquivo SOTA, ignorando se o usuario esqueceu o $env:)
            function Extract-KeysFromFile($Path) {
                if (Test-Path $Path) {
                    Get-Content $Path | ForEach-Object {
                        if ($_ -match '(?:\$env:)?([a-zA-Z0-9_]+)\s*[:=]\s*[''"]?([^''"\n\r]+)[''"]?') {
                            $Name = $Matches[1].ToUpper().Trim()
                            $Value = $Matches[2].Trim()
                            if ([string]::IsNullOrWhiteSpace($Value)) { return }
                
                            if ($Name -match "^GEMINI_API_KEY" -or $Name -match "^GOOGLE_API_KEY") {
                                $GoogleKeyVars[$Name] = $Value
                            }
                            elseif ($Name -match "^OPENROUTER_API_KEY" -or $Name -match "^OPEN_ROUTER_API_KEY") {
                                $OpenRouterKeyVars[$Name] = $Value
                            }
                        }
                    }
                }
            }

            $GoogleKeyVars = @{}
            $OpenRouterKeyVars = @{}
            Extract-KeysFromFile $EnvPs1Path
            Extract-KeysFromFile $DotEnvPath

            # Varredura Magica e Infinita das Variaveis de Ambiente (Deduplicando por Nome, nao por Valor)
            foreach ($Key in [Environment]::GetEnvironmentVariables('Process').GetEnumerator()) {
                $Name = $Key.Name.ToUpper()
                $Value = $Key.Value -replace '^"|"$', ''
                if ([string]::IsNullOrWhiteSpace($Value)) { continue }
    
                if ($Name -match "^GEMINI_API_KEY" -or $Name -match "^GOOGLE_API_KEY") {
                    $GoogleKeyVars[$Name] = $Value
                    if (-not $GoogleKeyVars.ContainsKey($Name)) { $GoogleKeyVars[$Name] = $Value }
                }
                elseif ($Name -match "^OPENROUTER_API_KEY") {
                    $OpenRouterKeyVars[$Name] = $Value
                    elseif ($Name -match "^OPENROUTER_API_KEY" -or $Name -match "^OPEN_ROUTER_API_KEY") {
                        if (-not $OpenRouterKeyVars.ContainsKey($Name)) { $OpenRouterKeyVars[$Name] = $Value }
                    }
                }

                Write-Host "=== INICIANDO AUDITORIA DE INFRAESTRUTURA DE APIs ===" -ForegroundColor Cyan

                function Test-GoogleAPI {
                    param([string]$Key, [string]$Label)
                    if ([string]::IsNullOrWhiteSpace($Key)) {
                        Write-Host "  [-] ${Label}: VAZIA / NAO ENCONTRADA" -ForegroundColor DarkGray
                        return
                    }
    
                    # Endpoint leve apenas para listar modelos, serve como ping de autenticacao
                    $Url = "https://generativelanguage.googleapis.com/v1beta/models?key=$Key"
                    try {
                        $Response = Invoke-RestMethod -Uri $Url -Method Get -ErrorAction Stop
                        Write-Host "  [+] ${Label}: ATIVA E OPERANTE (Modelos disponiveis: $($Response.models.Count))" -ForegroundColor Green
                    }
                    catch {
                        Write-Host "  [!] ${Label}: FALHA DE AUTENTICACAO OU CONEXAO - $($_.Exception.Message)" -ForegroundColor Red
                    }
                }

                function Test-OpenRouterAPI {
                    param([string]$Key, [string]$Label)
                    if ([string]::IsNullOrWhiteSpace($Key)) {
                        Write-Host "  [-] ${Label}: VAZIA / NAO ENCONTRADA" -ForegroundColor DarkGray
                        return
                    }

                    # Endpoint oficial de verificacao de chave do OpenRouter
                    $Url = "https://openrouter.ai/api/v1/auth/key"
                    $Headers = @{
                        "Authorization" = "Bearer $Key"
                    }
                    try {
                        $Response = Invoke-RestMethod -Uri $Url -Method Get -Headers $Headers -ErrorAction Stop
        
                        $KeyLabel = if ($Response.data.label) { $Response.data.label } else { "Padrao" }
                        $Limit = if ($Response.data.limit) { $Response.data.limit } else { "Ilimitado" }
        
                        Write-Host "  [+] ${Label}: ATIVA E OPERANTE" -ForegroundColor Green
                        Write-Host "      Label: $KeyLabel | Limite de Credito: $Limit" -ForegroundColor DarkGreen
                    }
                    catch {
                        Write-Host "  [!] ${Label}: FALHA DE AUTENTICACAO - $($_.Exception.Message)" -ForegroundColor Red
                    }
                }

                foreach ($K in $GoogleKeyVars.GetEnumerator() | Sort-Object Name) {
                    Test-GoogleAPI -Key $K.Value -Label "Google/Gemini API ($($K.Name))"
                }

                foreach ($K in $OpenRouterKeyVars.GetEnumerator() | Sort-Object Name) {
                    Test-OpenRouterAPI -Key $K.Value -Label "OpenRouter API ($($K.Name))"
                }

                Write-Host "=== AUDITORIA CONCLUIDA ===" -ForegroundColor Cyan
                Write-Host "[DICA] Para adicionar chaves ausentes, edite seu arquivo .env ou _env.ps1" -ForegroundColor DarkGray