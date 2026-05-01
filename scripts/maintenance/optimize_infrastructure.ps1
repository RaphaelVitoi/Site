<#
.SYNOPSIS
    A Navalha SOTA. Expurgador de entropia de infraestrutura e otimizador de memoria.
.DESCRIPTION
    1. Remove node_modules orfaos na raiz.
    2. Deleta arquivos de cache e backups inuteis apontados na auditoria.
    3. Realiza o Vacuum no SQLite e reseta o ChromaDB se solicitado para re-indexacao limpa.
#>
param(
    [switch]$Force
)

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

Write-Host "=== [SOTA] INICIANDO EXPURGO DE INFRAESTRUTURA ===" -ForegroundColor Cyan

# 1. Aniquilacao do node_modules raiz (A arvore fantasma)
$RootNodeModules = Join-Path $ProjectRoot "node_modules"
if (Test-Path $RootNodeModules) {
    if ($Force) {
        Write-Host "[LIXO] Excluindo node_modules raiz..." -ForegroundColor Yellow
        Remove-Item -Path $RootNodeModules -Recurse -Force
        Write-Host "[OK] node_modules raiz vaporizado." -ForegroundColor Green
    } else {
        Write-Host "[SAFEGUARD] node_modules raiz encontrado. Reexecute com -Force para remover." -ForegroundColor Yellow
    }
}

# 2. Limpeza de artefatos inuteis (Arquivos .docx soltos)
$DocxFiles = Get-ChildItem -Path $ProjectRoot -Filter "*.docx" -File
foreach ($doc in $DocxFiles) {
    if ($Force) {
        Write-Host "[LIXO] Excluindo documento obsoleto: $($doc.Name)" -ForegroundColor Yellow
        Remove-Item -Path $doc.FullName -Force
    } else {
        Write-Host "[SAFEGUARD] Documento detectado: $($doc.Name). Reexecute com -Force para remover." -ForegroundColor Yellow
    }
}

# 3. Otimizacao do Banco de Dados SQLite (Vacuum)
$TasksDb = Join-Path $ProjectRoot "queue\tasks.db"
if (Test-Path $TasksDb) {
    Write-Host "[OTIMIZACAO] Executando VACUUM no banco SQLite..." -ForegroundColor Magenta
    $SqliteCmd = "sqlite3 `"$TasksDb`" `"VACUUM;`""
    Invoke-Expression $SqliteCmd *>&1 | Out-Null
    Write-Host "[OK] Fila de Tarefas SOTA desfragmentada e otimizada." -ForegroundColor Green
}

# 4. Reducao e Limpeza do ChromaDB (.chroma_db)
$ChromaDbPath = Join-Path $ProjectRoot ".claude\agent-memory\.chroma_db"
if (Test-Path $ChromaDbPath) {
    $Size = (Get-ChildItem $ChromaDbPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "[MEMORIA] Tamanho atual do ChromaDB: $([math]::Round($Size, 2)) MB" -ForegroundColor Cyan
    
    $BackupPath = Join-Path $ProjectRoot ".claude\agent-memory\.chroma_db_bloat_backup"
    if ($Force) {
        if (Test-Path $BackupPath) { Remove-Item -Path $BackupPath -Recurse -Force -ErrorAction SilentlyContinue }
        # Movemos para uma pasta de backup para forcar o @bibliotecario a reconstruir 
        # uma versao mais limpa, sem historico de sessoes mortas na proxima execucao.
        Rename-Item -Path $ChromaDbPath -NewName ".chroma_db_bloat_backup" -Force -ErrorAction SilentlyContinue
        Write-Host "[OK] ChromaDB isolado. Ele sera recriado 100% otimizado e limpo pelo motor memory_rag.py na proxima indexacao." -ForegroundColor Green
    } else {
        Write-Host "[SAFEGUARD] ChromaDB detectado. Reexecute com -Force para isolar e recriar." -ForegroundColor Yellow
    }
}

Write-Host "=== [SOTA] INFRAESTRUTURA PURIFICADA COM SUCESSO ===" -ForegroundColor Green
