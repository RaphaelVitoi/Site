# CHICO CLEANUP SCRIPT - Restaurando a Simetria
# Executar na raiz: .\cleanup.ps1

Write-Host "Iniciando limpeza de arquivos redundantes na raiz..." -ForegroundColor Cyan

$filesToRemove = @("__init__.py", "test_task_executor.py", "tests.py", "tests")

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force -Recurse
        Write-Host "Removido: $file" -ForegroundColor Yellow
    }
}

Write-Host "Limpeza concluida. Tente rodar: python -m unittest discover tests" -ForegroundColor Green