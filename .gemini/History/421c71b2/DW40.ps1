<#
.SYNOPSIS
    Auditoria de Seguranca e Rotacao de Chaves de API (SOTA).
.DESCRIPTION
    Este script realiza uma varredura completa no ecossistema para:
    1. Identificar todas as chaves de API (Google, OpenRouter) definidas em _env.ps1, .env e variaveis de ambiente.
    2. Testar a validade de cada chave fazendo uma chamada de autenticacao leve na API correspondente.
    3. Procurar por vazamentos (leaks) dessas chaves hardcoded em outros arquivos do projeto.
    4. Relatar o status de cada chave: ATIVA, INVALIDA, VAZIA ou VAZADA.
#>

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

# --- PARTE 1: INGESTAO IMPLACAVEL DE CHAVES ---

$AllKeys = @{} # Armazena todas as chaves encontradas: @{ "GEMINI_API_KEY" = @{ Value="..."; Source="File" } }

# Funcao para adicionar ou atualizar chaves no dicionario mestre
function Add-Key {
    param($Name, $Value, $Source)
    $UpperName = $Name.ToUpper().Trim()
    if ($UpperName.StartsWith("GEMINI_CLI")) { return } # Ignora chaves especificas da CLI

    if (-not $AllKeys.ContainsKey($UpperName)) {
        $AllKeys[$UpperName] = @{ Value = $Value; Source = $Source }
    }
}

# Le de arquivos de ambiente (_env.ps1, .env)
$EnvFiles = @(Join-Path $ProjectRoot "_env.ps1"), @(Join-Path $ProjectRoot ".env")
foreach ($File in $EnvFiles) {
    if (Test-Path $File) {
        Get-Content $File | ForEach-Object {
            if ($_ -match '^(?:\$env:|\$)?([a-zA-Z0-9_]+)\s*[:=]\s*[''"]?([^''"\s#]+)[''"]?') {
                Add-Key -Name $Matches[1] -Value $Matches[2] -Source "File (`$($File.Split('\')[-1])`)"
            }
        }
    }
}

# Le de variaveis de ambiente do processo (pode conter chaves setadas manualmente)
[Environment]::GetEnvironmentVariables('Process').GetEnumerator() | ForEach-Object {
    Add-Key -Name $_.Name -Value ($_.Value -replace '^"|"$', '') -Source "Environment"
}

# --- PARTE 2: FUNCOES DE AUDITORIA ---

# Funcao para testar a validade da chave Google/Gemini
function Test-GoogleAPI {
    param([string]$Key)
    $Url = "https://generativelanguage.googleapis.com/v1beta/models?key=$Key"
    try {
        Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10 -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Funcao para testar a validade da chave OpenRouter
function Test-OpenRouterAPI {
    param([string]$Key)
    $Url = "https://openrouter.ai/api/v1/auth/key"
    $Headers = @{ "Authorization" = "Bearer $Key" }
    try {
        Invoke-RestMethod -Uri $Url -Method Get -Headers $Headers -TimeoutSec 10 -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Funcao para procurar vazamentos da chave no codigo fonte
function Find-KeyLeaks {
    param([string]$KeyValue)
    
    $ExcludedPaths = @(
        (Join-Path $ProjectRoot ".git"),
        (Join-Path $ProjectRoot ".venv"),
        (Join-Path $ProjectRoot "node_modules"),
        (Join-Path $ProjectRoot "archive"),
        (Join-Path $ProjectRoot ".bak"),
        (Join-Path $ProjectRoot ".claude\logs")
    )

    $Files = Get-ChildItem -Path $ProjectRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notlike "*_env.ps1" -and $_.FullName -notlike "*.env"
    }

    $LeakedFiles = @()
    foreach ($File in $Files) {
        $isExcluded = $false
        foreach ($exclude in $ExcludedPaths) {
            if ($File.FullName.StartsWith($exclude)) {
                $isExcluded = $true
                break
            }
        }
        if (-not $isExcluded) {
            if (Select-String -Path $File.FullName -Pattern $KeyValue -Quiet -ErrorAction SilentlyContinue) {
                $LeakedFiles += $File.FullName.Replace($ProjectRoot, "")
            }
        }
    }
    return $LeakedFiles
}


# --- PARTE 3: EXECUCAO DA AUDITORIA ---

Write-Host "=== INICIANDO AUDITORIA DE SEGURANCA DE CHAVES DE API ===" -ForegroundColor Cyan
$Summary = @{ Active = 0; Invalid = 0; Empty = 0; Leaked = 0 }

$SortedKeys = $AllKeys.GetEnumerator() | Sort-Object Name

foreach ($KeyEntry in $SortedKeys) {
    $KeyName = $KeyEntry.Name
    $KeyData = $KeyEntry.Value
    $KeyValue = $KeyData.Value
    $KeySource = $KeyData.Source

    Write-Host "`n[AUDITANDO] $($KeyName) (Fonte: $($KeySource))" -ForegroundColor White
    
    # 1. Checa se a chave esta vazia
    if ([string]::IsNullOrWhiteSpace($KeyValue) -or $KeyValue -eq "REPLACE_ME") {
        Write-Host "  [!] STATUS: VAZIA / NAO CONFIGURADA" -ForegroundColor DarkYellow
        $Summary.Empty++
        continue
    }

    # 2. Valida a chave contra a API
    $isValid = $false
    if ($KeyName.StartsWith("GEMINI") -or $KeyName.StartsWith("GOOGLE")) {
        $isValid = Test-GoogleAPI -Key $KeyValue
    }
    elseif ($KeyName.StartsWith("OPENROUTER") -or $KeyName.StartsWith("OPEN_ROUTER")) {
        $isValid = Test-OpenRouterAPI -Key $KeyValue
    }
    else {
        # Ignora chaves que nao sabemos como testar
        continue
    }

    if ($isValid) {
        Write-Host "  [+] STATUS: ATIVA E OPERANTE" -ForegroundColor Green
        $Summary.Active++
    }
    else {
        Write-Host "  [!] STATUS: INVALIDA OU EXPIRADA" -ForegroundColor Red
        $Summary.Invalid++
    }

    # 3. Procura por vazamentos (leaks)
    $leaks = Find-KeyLeaks -KeyValue $KeyValue
    if ($leaks.Count -gt 0) {
        Write-Host "  [CRITICAL] VAZAMENTO DETECTADO EM $($leaks.Count) ARQUIVO(S):" -ForegroundColor Red
        $leaks | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
        $Summary.Leaked++
    }
    else {
        Write-Host "  [OK] SEGURANCA: Nenhum vazamento detectado no codigo fonte." -ForegroundColor Green
    }
}

# --- PARTE 4: RELATORIO FINAL ---

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "            RELATORIO FINAL DA AUDITORIA"
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  - Chaves Ativas: $($Summary.Active)" -ForegroundColor Green
Write-Host "  - Chaves Vazias: $($Summary.Empty)" -ForegroundColor DarkGray
Write-Host "  - Chaves Invalidas/Expiradas: $($Summary.Invalid)" -ForegroundColor Red
Write-Host "  - Chaves Vazadas (LEAKED): $($Summary.Leaked)" -ForegroundColor Magenta

if ($Summary.Leaked -gt 0) {
    Write-Host "`n[ACAO CRITICA] Chaves vazadas foram encontradas! E OBRIGATORIO rotacionar (revogar e gerar novas) estas chaves imediatamente e remove-las dos arquivos de codigo fonte." -ForegroundColor Red
}
if ($Summary.Invalid -gt 0) {
    Write-Host "`n[ACAO RECOMENDADA] Chaves invalidas foram encontradas. Verifique se estao corretas ou gere novas chaves." -ForegroundColor Yellow
}