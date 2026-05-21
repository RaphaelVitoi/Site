<#
.SYNOPSIS
    Unifica as importacoes do componente CodeBlock duplicado na arquitetura.
#>

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$FrontendDir = Join-Path $ProjectRoot "frontend\src"

Write-Host "=== INICIANDO UNIFICACAO SOTA DO CODEBLOCK ===" -ForegroundColor Cyan

$Files = Get-ChildItem -Path $FrontendDir -Include *.tsx, *.ts -Recurse
$Count = 0

foreach ($File in $Files) {
    $Content = Get-Content $File.FullName -Raw
    $Original = $Content
    
    # Usa Regex (Preservando o que vem antes do 'from') para trocar o caminho absoluto ou relativo para o Alias do Next.js
    $Content = [regex]::Replace($Content, '(?m)^(import\s+.*?)from\s+[''"][^''"]*(?:content|simulator/ui)/CodeBlock[''"]', '$1from "@/components/ui/CodeBlock"')
    
    if ($Content -cne $Original) {
        Set-Content -Path $File.FullName -Value $Content -Encoding UTF8
        Write-Host "[OK] Atualizado import em: $($File.Name)" -ForegroundColor Green
        $Count++
    }
}

$Old1 = Join-Path $FrontendDir "components\content\CodeBlock.tsx"
$Old2 = Join-Path $FrontendDir "components\simulator\ui\CodeBlock.tsx"
if (Test-Path $Old1) { Remove-Item $Old1 -Force; Write-Host "[LIXO] Deletado fantasma: $Old1" -ForegroundColor Yellow }
if (Test-Path $Old2) { Remove-Item $Old2 -Force; Write-Host "[LIXO] Deletado fantasma: $Old2" -ForegroundColor Yellow }

Write-Host "=== UNIFICACAO CONCLUIDA ($Count arquivo(s) modificado(s)) ===" -ForegroundColor Green