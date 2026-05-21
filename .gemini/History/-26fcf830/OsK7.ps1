<#
.SYNOPSIS
    Executa uma auditoria de integridade no banco de dados tasks.db.
.DESCRIPTION
    Verifica a integridade fisica do arquivo, procura por tarefas zumbis (em execucao por muito tempo)
    e dependencias orfas, garantindo a saude da fila de tarefas.
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
    Write-Error "Falha critica ao executar o script de verificacao Python. Output: $_"
    exit 1
}

Write-Host "`n--- [1/3] Verificacao de Integridade Fisica (PRAGMA) ---"
if ($report.integrity_check -eq "ok") {
    Write-Host "[OK] O banco de dados esta fisicamente integro." -ForegroundColor Green
}
else {
    Write-Error "[FALHA CRITICA] Corrupcao detectada no banco de dados: $($report.integrity_check)"
}

Write-Host "`n--- [2/3] Verificacao de Tarefas Zumbis (Running > 2h) ---"
if ($report.zombie_tasks.Count -eq 0) {
    Write-Host "[OK] Nenhuma tarefa zumbi encontrada." -ForegroundColor Green
}
else {
    Write-Warning "[ALERTA] $($report.zombie_tasks.Count) tarefa(s) zumbi detectada(s):"
    $report.zombie_tasks | ForEach-Object {
        Write-Host "  - ID: $($_.id), Agente: $($_.agent), Iniciada em: $($_.timestamp)" -ForegroundColor Yellow
    }
    Write-Warning "Acao recomendada: Investigue e reinicie estas tarefas manualmente se necessario."
}

Write-Host "`n--- [3/3] Verificacao de Dependencias Orfas ---"
if ($report.orphan_dependencies.Count -eq 0) {
    Write-Host "[OK] Nenhuma dependencia orfa encontrada." -ForegroundColor Green
}
else {
    Write-Warning "[ALERTA] $($report.orphan_dependencies.Count) dependencia(s) orfa(s) detectada(s):"
    $report.orphan_dependencies | ForEach-Object {
        Write-Host "  - Tarefa '$($_.task_id)' depende de uma tarefa inexistente: '$($_.missing_dependency)'" -ForegroundColor Yellow
    }
    Write-Warning "Acao recomendada: Remova ou corrija as tarefas com dependencias quebradas."
}

if ($report.error) {
    Write-Error "`n[ERRO GERAL] Ocorreu um erro durante a verificacao: $($report.error)"
}

Write-Host "`n[VITORIA] Auditoria de integridade do banco de dados concluida." -ForegroundColor Cyan