<#
.SYNOPSIS
    Teste de Estresse Simultâneo (Mutex Contention)
.DESCRIPTION
    Dispara 50 processos paralelos (Background Jobs) contra a Membrana CLI,
    forçando concorrência severa na escrita do arquivo tasks.json para
    validar a robustez do Mutex do Kernel.
#>

Write-Host "=== CHICO MUTEX STRESS TEST ===" -ForegroundColor Cyan
Write-Host "Iniciando disparo assíncrono de 50 intenções massivas..." -ForegroundColor Yellow

$Jobs = @()

for ($i = 1; $i -le 50; $i++) {
    $Jobs += Start-Job -ScriptBlock {
        param($ScriptDir, $id)
        # O parâmetro -Force anula a confirmação [Y/n]
        # O *>&1 funde as saídas para lermos o sucesso
        & (Join-Path $ScriptDir "do.ps1") -Force "estratégia massiva número $id para testar o kernel" *>&1
    } -ArgumentList $PSScriptRoot, $i
}

Write-Host "[KERNEL] 50 threads engatilhadas. Resolvendo colisões (Mutex)..." -ForegroundColor DarkGray
Wait-Job -Job $Jobs | Out-Null

$Results = Receive-Job -Job $Jobs
Remove-Job -Job $Jobs

$SuccessCount = @($Results -match "Integrity verified").Count
$FailCount = 50 - $SuccessCount

Write-Host "`n=== RELATÓRIO DO TESTE DE ESTRESSE ===" -ForegroundColor Cyan
Write-Host "Transações atômicas bem-sucedidas: $SuccessCount/50" -ForegroundColor Green
if ($FailCount -gt 0) {
    Write-Host "Falhas detectadas (Colisão / Timeout): $FailCount/50" -ForegroundColor Red
}
else {
    Write-Host "NENHUMA COLISÃO. O Mutex defendeu 100% da integridade da fila." -ForegroundColor Green
}