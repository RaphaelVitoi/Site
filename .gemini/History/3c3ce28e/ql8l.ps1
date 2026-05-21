# Sonda de Reconhecimento - Mapeamento de /src
# Agente: @implementor
# Objetivo: Listar recursivamente arquivos para análise de arquitetura

$SrcPath = Join-Path $PSScriptRoot "src"
$ReportPath = Join-Path $PSScriptRoot "docs\reports\STRUCTURE_SRC.md"
$ReportDir = Split-Path $ReportPath

if (-not (Test-Path $ReportDir)) { New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null }

$header = "# Mapa do Território: /src`n**Data:** $(Get-Date -Format 'yyyy-MM-dd HH:mm')`n`n## Estrutura de Arquivos`n"
Set-Content -Path $ReportPath -Value $header -Encoding UTF8

if (Test-Path $SrcPath) {
    # Lista arquivos ignorando node_modules e .git
    $files = Get-ChildItem -Path $SrcPath -Recurse -Force -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules|\.git" }
    
    if ($files) {
        $tree = $files | ForEach-Object {
            $relativePath = $_.FullName.Replace($PSScriptRoot, "").TrimStart("\")
            "- $relativePath"
        }
        Add-Content -Path $ReportPath -Value $tree
        Write-Host "[RECONHECIMENTO] Mapa salvo em: $ReportPath" -ForegroundColor Green
    }
    else {
        Add-Content -Path $ReportPath -Value "*Nenhum arquivo encontrado ou diretório vazio.*"
        Write-Warning "[RECONHECIMENTO] Diretório /src existe mas está vazio."
    }
}
else {
    Add-Content -Path $ReportPath -Value "*DIRETÓRIO /src NÃO ENCONTRADO NA RAIZ.*"
    Write-Error "[RECONHECIMENTO] CRÍTICO: /src não existe na raiz do projeto."
}