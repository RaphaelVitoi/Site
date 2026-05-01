# Sonda de Reconhecimento - Mapeamento da Raiz (Site)
# Agente: @implementor
# Objetivo: Listar recursivamente arquivos para analise de arquitetura

$SrcPath = $PSScriptRoot
$ReportPath = Join-Path $PSScriptRoot "docs\reports\STRUCTURE_SRC.md"
$ReportDir = Split-Path $ReportPath

if (-not (Test-Path $ReportDir)) { New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null }

$header = "# Mapa do Territorio: Raiz (Site)`n**Data:** $(Get-Date -Format 'yyyy-MM-dd HH:mm')`n`n## Estrutura de Arquivos`n"
Set-Content -Path $ReportPath -Value $header -Encoding UTF8

if (Test-Path $SrcPath) {
    # Lista arquivos ignorando infraestrutura de agentes (docs, logs, queue, .claude) e sistema
    $files = Get-ChildItem -Path $SrcPath -Recurse -Force -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules|\.git|\.claude|\.vscode|docs|logs|queue" }
    
    if ($files) {
        $tree = $files | ForEach-Object {
            $relativePath = $_.FullName.Replace($PSScriptRoot, "").TrimStart("\")
            "- $relativePath"
        }
        Add-Content -Path $ReportPath -Value $tree
        Write-Host "[RECONHECIMENTO] Mapa salvo em: $ReportPath" -ForegroundColor Green
    }
    else {
        Add-Content -Path $ReportPath -Value "*Nenhum arquivo encontrado ou diretorio vazio.*"
        Write-Warning "[RECONHECIMENTO] Diretorio raiz vazio (filtrado)."
    }
}
else {
    Add-Content -Path $ReportPath -Value "*ERRO DE CAMINHO.*"
    Write-Error "[RECONHECIMENTO] CRITICO: Caminho raiz nao acessivel."
}
