<#
.SYNOPSIS
    Enfileira as tarefas de mitigação de dívida técnica apontadas na auditoria SOTA.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { 'python' }
$PyScript = Join-Path $ProjectRoot 'task_executor.py'

function Add-Task {
    param([hashtable]$TaskData)
    $taskJson = $TaskData | ConvertTo-Json -Depth 10 -Compress
    $taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
    $output = & $PythonCmd $PyScript db-add $taskB64
    if ($LASTEXITCODE -eq 0) { Write-Host "[OK] Tarefa $($TaskData.id) enfileirada para $($TaskData.agent)." -ForegroundColor Green }
    else { Write-Error "Falha ao enfileirar: $output" }
}

Write-Host '=== ENFILEIRANDO TAREFAS DE DÍVIDA TÉCNICA (RUMO AO SOTA) ===' -ForegroundColor Cyan

# 1. Tarefa de Segurança e Encoding para o @auditor
Add-Task -TaskData [ordered]@ {
    id = "DEBT-CHROMA-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = 'Revisar pipeline de dados do ChromaDB. Implementar sanitização UTF-8/ASCII rigorosa e corrigir falhas de encoding para evitar corrupção de fragmentos do RAG.'
    status = 'pending'
    timestamp = (Get-Date -Format 'o')
    agent = '@auditor'
    metadata = @{ priority = 'high' }
}

# 2. Tarefa de Refatoração e Limpeza para o @implementor
Add-Task -TaskData [ordered]@ {
    id = "DEBT-REFACTOR-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = 'Remover a dependência defasada (old-lib-v1). Além disso, extrair as funções de heurística de roteamento de task_executor.py para um módulo próprio (ex: core/routing.py) para baixar a complexidade ciclomática.'
    status = 'pending'
    timestamp = (Get-Date -Format 'o')
    agent = '@implementor'
    metadata = @{ priority = 'critical' }
}
