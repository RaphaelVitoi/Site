<#
.SYNOPSIS
    NEXUS READER: Visualizador elegante de resultados (Markdown) no Terminal.
#>
param([string]$TaskId)

if (-not $TaskId) {
    Write-Host "=== 📖 NEXUS READER ===" -ForegroundColor Cyan
    $TaskId = Read-Host "Digite o ID da tarefa ou um trecho (ex: TASK-2026)"
}

$ResultsDir = Join-Path $PSScriptRoot ".claude\task_results"
$TargetFile = Get-ChildItem -Path $ResultsDir -Filter "*$TaskId*.md" | Select-Object -First 1

if ($TargetFile) {
    Clear-Host
    Write-Host "=== 📖 RESULTADO: $($TargetFile.Name) ===" -ForegroundColor Cyan
    Write-Host "==========================================================================" -ForegroundColor DarkGray
    
    # Formatação Sintática Dinâmica (Estética)
    Get-Content $TargetFile.FullName | ForEach-Object {
        if ($_ -match "^#") { Write-Host $_ -ForegroundColor Cyan }
        elseif ($_ -match "^> ") { Write-Host $_ -ForegroundColor DarkGray }
        elseif ($_ -match "^\* |^- ") { Write-Host $_ -ForegroundColor Green }
        elseif ($_ -match "^```") { Write-Host $_ -ForegroundColor DarkYellow }
        else { Write-Host $_ -ForegroundColor White }
    }
    
    Write-Host "`n==========================================================================" -ForegroundColor DarkGray
    Write-Host "Fim do Documento.`n" -ForegroundColor Cyan
} else {
    Write-Host "❌ Nenhum resultado markdown encontrado com a chave: $TaskId" -ForegroundColor Red
}