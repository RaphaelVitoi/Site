<#
.SYNOPSIS
    NEXUS READER: Visualizador elegante de resultados (Markdown) no Terminal.
#>
param([string]$TaskId)

if (-not $TaskId) {
    Write-Host '=== [READ] NEXUS READER ===' -ForegroundColor Cyan
    $TaskId = Read-Host 'Digite o ID da tarefa (exemplo: TASK-2026)'
}

$ResultsDir = Join-Path $PSScriptRoot '.claude\task_results'
$TargetFile = Get-ChildItem -Path $ResultsDir -Filter ('*{0}*.md' -f $TaskId) -ErrorAction SilentlyContinue | Select-Object -First 1

if ($null -ne $TargetFile -and $TargetFile.FullName) {
    Clear-Host
    Write-Host ('=== [READ] RESULTADO: {0} ===' -f $TargetFile.Name) -ForegroundColor Cyan
    Write-Host '==========================================================================' -ForegroundColor DarkGray
    
    # Formatação Sintática Dinâmica (Estética)
    Get-Content $TargetFile.FullName | ForEach-Object {
        if ($_ -match '^#') { Write-Host $_ -ForegroundColor Cyan }
        elseif ($_ -match '^> ') { Write-Host $_ -ForegroundColor DarkGray }
        elseif ($_ -match '^\* |^- ') { Write-Host $_ -ForegroundColor Green }
        elseif ($_ -match '^```') { Write-Host $_ -ForegroundColor DarkYellow }
        else { Write-Host $_ -ForegroundColor White }
    }
    
    Write-Host ''
    Write-Host '==========================================================================' -ForegroundColor DarkGray
    Write-Host 'Fim do Documento.' -ForegroundColor Cyan
    Write-Host ''
}
else {
    Write-Host ('[FAIL] Nenhum resultado markdown encontrado com a chave: {0}' -f $TaskId) -ForegroundColor Red
}
