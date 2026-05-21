<#
.SYNOPSIS
    Executa uma auditoria de integridade no banco de dados tasks.db.
.DESCRIPTION
    Verifica a integridade física do arquivo, procura por tarefas zumbis (em execução por muito tempo)
    e dependências órfãs, garantindo a saúde da fila de tarefas.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$PythonCmd = if (Test-Path "$ProjectRoot\.venv\Scripts\python.exe") { "$ProjectRoot\.venv\Scripts\python.exe" } else { "python" }
$ExecutorScript = Join-Path $ProjectRoot "task_executor.py"

Write-Host "=== [SISTEMA] INICIANDO AUDITORIA DE INTEGRIDADE DO BANCO DE DADOS ===" -ForegroundColor Magenta

try {
    $reportJson = & $PythonCmd $ExecutorScript "db-check-integrity"
    $report = $reportJson | ConvertFrom-Json
}
catch {
    Write-Error "Falha crítica ao executar o script de verificação Python. Output: $_"
    exit 1
}

Write-Host "`n--- [1/3] Verificação de Integridade Física (PRAGMA) ---"
if ($report.integrity_check -eq "ok") {
    Write-Host "[OK] O banco de dados está fisicamente íntegro." -ForegroundColor Green
}
else {
    Write-Error "[FALHA CRÍTICA] Corrupção detectada no banco de dados: $($report.integrity_check)"
}

Write-Host "`n--- [2/3] Verificação de Tarefas Zumbis (Running > 2h) ---"
if ($report.zombie_tasks.Count -eq 0) {
    Write-Host "[OK] Nenhuma tarefa zumbi encontrada." -ForegroundColor Green
}
else {
    Write-Warning "[ALERTA] $($report.zombie_tasks.Count) tarefa(s) zumbi detectada(s):"
    $report.zombie_tasks | ForEach-Object {
        Write-Host "  - ID: $($_.id), Agente: $($_.agent), Iniciada em: $($_.timestamp)" -ForegroundColor Yellow
    }
    Write-Warning "Ação recomendada: Investigue e reinicie estas tarefas manualmente se necessário."
}

Write-Host "`n--- [3/3] Verificação de Dependências Órfãs ---"
if ($report.orphan_dependencies.Count -eq 0) {
    Write-Host "[OK] Nenhuma dependência órfã encontrada." -ForegroundColor Green
}
else {
    Write-Warning "[ALERTA] $($report.orphan_dependencies.Count) dependência(s) órfã(s) detectada(s):"
    $report.orphan_dependencies | ForEach-Object {
        Write-Host "  - Tarefa '$($_.task_id)' depende de uma tarefa inexistente: '$($_.missing_dependency)'" -ForegroundColor Yellow
    }
    Write-Warning "Ação recomendada: Remova ou corrija as tarefas com dependências quebradas."
}

if ($report.error) {
    Write-Error "`n[ERRO GERAL] Ocorreu um erro durante a verificação: $($report.error)"
}

Write-Host "`n[VITORIA] Auditoria de integridade do banco de dados concluída." -ForegroundColor Cyan