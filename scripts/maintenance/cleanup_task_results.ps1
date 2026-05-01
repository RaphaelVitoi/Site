<#
.SYNOPSIS
    Limpa arquivos de resultados de tarefas antigos (>30 dias).
#>
$TargetDir = Join-Path $PSScriptRoot ".claude\task_results"
$DaysToKeep = 30

if (Test-Path $TargetDir) {
    $CutoffDate = (Get-Date).AddDays(-$DaysToKeep)
    $FilesToDelete = Get-ChildItem -Path $TargetDir -Filter "*.md" | Where-Object { $_.LastWriteTime -lt $CutoffDate }
    
    if ($FilesToDelete) {
        $FilesToDelete | Remove-Item -Force
        Write-Host "[CLEANUP] $($FilesToDelete.Count) relatorios residuais isolados e removidos de $TargetDir." -ForegroundColor Green
    }
    else {
        Write-Host "[CLEANUP] Simetria mantida. Nenhum relatorio residual encontrado." -ForegroundColor DarkGray
    }
}
