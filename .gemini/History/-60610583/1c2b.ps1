<#
.SYNOPSIS
    VITOI 3.2 - Elevacao SOTA de Prioridade de Processo (Extension Host)
#>

Write-Host "=== [VITOI 3.2] ELEVACAO DE PRIORIDADE DO EXTENSION HOST ===" -ForegroundColor Cyan
Write-Host "Iniciando varredura por processos subjacentes do VS Code..." -ForegroundColor Cyan

$processes = Get-Process | Where-Object { $_.ProcessName -eq "Code" -and [string]::IsNullOrWhiteSpace($_.MainWindowTitle) }

$count = 0
foreach ($p in $processes) {
    try {
        $p.PriorityClass = 'AboveNormal'
        Write-Host "[+] Simetria Alcancada: Processo $($p.Id) (Code Background) promovido a AboveNormal." -ForegroundColor Green
        $count++
    }
    catch {
        Write-Host "[ERRO] Falha ao ajustar prioridade do processo $($p.Id). Permissao negada ou processo isolado." -ForegroundColor Red
    }
}

if ($count -eq 0) {
    Write-Host "[!] Alerta: Nenhum processo correspondente ao Extension Host modificado." -ForegroundColor Yellow
}
else {
    Write-Host "=== OPERACAO CONCLUIDA: $count processos potencializados. ===" -ForegroundColor Cyan
}