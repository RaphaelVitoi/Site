# PROTOCOLO VITOI 3.2 - BLINDAGEM ASCII (PRE-COMMIT)
# Verifica se os arquivos que estao sendo commitados possuem caracteres nao-ASCII.

$files = git diff --cached --name-only --diff-filter=ACM | Where-Object { $_ -match '\.(py|ts|tsx|json|md|ps1|sh)$' }

if ($null -eq $files) {
    exit 0
}

$hasError = $false

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content -Path $file -Raw
        if ($content -match '[^\x00-\x7F]') {
            Write-Host "[!] ALERTA SOTA: Caracteres nao-ASCII detectados em: $file" -ForegroundColor Yellow
            $hasError = $true
        }
    }
}

# PROTOCOLO CHICO v6 - BLINDAGEM ASCII ATIVA
if ($hasError) {
    Write-Error "[!] ERRO SOTA: Commit abortado devido a presenca de caracteres nao-ASCII."
    exit 1
}
exit 0
