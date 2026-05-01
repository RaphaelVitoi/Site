<#
.SYNOPSIS
    Validador de Integridade do Cortex (JSON)
.DESCRIPTION
    Le e valida a sintaxe e a estrutura logica (Schema) dos arquivos JSON
    que compoem a base de conhecimento do ecossistema de agentes.
#>
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

$CortexFiles = @(
    @{ Name = "agents_manifest.json"; Type = "Dictionary"; KeyPrefix = "@"; ValueType = "PSCustomObject" },
    @{ Name = "synonyms.json"; Type = "Dictionary"; KeyPrefix = "@"; ValueType = "Array" },
    @{ Name = "aphorisms.json"; Type = "Array"; KeyPrefix = $null; ValueType = "String" }
)

Write-Host "=== CORTEX INTEGRITY CHECK ===" -ForegroundColor Cyan
Write-Host "Iniciando validacao de sintaxe e schema dos arquivos JSON...`n" -ForegroundColor DarkGray

$AllPassed = $true

foreach ($file in $CortexFiles) {
    $FilePath = Join-Path $ProjectRoot "data\$($file.Name)"
    Write-Host "[$($file.Name)] " -NoNewline -ForegroundColor White
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "NOT FOUND" -ForegroundColor DarkYellow
        continue
    }

    try {
        $rawContent = Get-Content -Path $FilePath -Raw -Encoding UTF8
        
        # 1. Validacao de Sintaxe JSON
        $jsonParsed = $rawContent | ConvertFrom-Json
        if ($null -eq $jsonParsed) { throw "Arquivo vazio ou JSON invalido (null)." }
        
        # 2. Validacao de Schema (Estrutura)
        if ($file.Type -eq "Dictionary") {
            foreach ($property in $jsonParsed.psobject.properties) {
                $key = $property.Name
                $val = $property.Value

                if (-not $key.StartsWith($file.KeyPrefix)) {
                    throw "Chave invalida '$key'. Deve obrigatoriamente comecar com '$($file.KeyPrefix)'."
                }
                if ($file.ValueType -eq "PSCustomObject" -and $val.GetType().Name -ne "PSCustomObject") {
                    throw "O valor da chave '$key' deve ser um Objeto (PSCustomObject)."
                }
                if ($file.ValueType -eq "Array" -and -not ($val -is [array])) {
                    throw "O valor da chave '$key' deve ser um Array."
                }
            }
        }
        elseif ($file.Type -eq "Array") {
            if (-not ($jsonParsed -is [array])) {
                throw "O elemento raiz do arquivo deve ser um Array."
            }
        }

        Write-Host "OK (Sintaxe e Schema validados)" -ForegroundColor Green
    }
    catch {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "  -> $($_.Exception.Message)" -ForegroundColor Red
        $AllPassed = $false
    }
}

if ($AllPassed) {
    Write-Host "`n[SUCCESS] Todos os arquivos do Cortex estao integros e corretos." -ForegroundColor Green
}
else {
    Write-Host "`n[ERROR] Corrupcao ou erro de formatacao detectado no Cortex. Corrija os arquivos e tente novamente." -ForegroundColor Red
}