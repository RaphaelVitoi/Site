# [SOTA WORKFLOW] Sincronizacao de Consciencia (RAG Sync)
# Versao: v1.0 GOLD

param (
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n[SOTA] Iniciando Sincronizacao de Consciencia..." -ForegroundColor Cyan

# Caminhos
$Root = (Get-Item -Path $PSScriptRoot).Parent.Parent.FullName
$RagScript = Join-Path $Root "memory_rag.py"

if (-not (Test-Path $RagScript)) {
    Write-Error "Motor RAG nao localizado em: $RagScript"
}

Write-Host "[SOTA] Invocando Ingestao de Mente Coletiva (LanceDB)..." -ForegroundColor Gray

# Execucao via Python (Kernel)
try {
    # Usando o executavel Python do ambiente atual
    python $RagScript ingest
    Write-Host "`n[SUCCESS] Simetria Cognitiva alcancada. Mente Coletiva atualizada.`n" -ForegroundColor Green
} catch {
    Write-Host "`n[FAIL] Colapso na sincronizacao: $_" -ForegroundColor Red
    exit 1
}
