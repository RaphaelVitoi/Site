<#
.SYNOPSIS
    Dispara a rotina de aniquilação do banco de dados vetorial (ChromaDB) do ecossistema.
#>

Write-Host '=== [SKILLMASTER] EXPURGO VETORIAL DO RAG ===' -ForegroundColor Magenta
$PythonCmd = if (Test-Path -LiteralPath "$PSScriptRoot\..\..\.venv\Scripts\python.exe") { "$PSScriptRoot\..\..\.venv\Scripts\python.exe" } else { 'python' }

& $PythonCmd "$PSScriptRoot\purge_rag.py"
