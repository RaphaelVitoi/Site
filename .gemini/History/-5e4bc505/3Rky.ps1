# CHICO CLEANUP SCRIPT - Restaurando a Simetria
# Executar na raiz: .\cleanup.ps1

Write-Host "Iniciando limpeza de arquivos redundantes na raiz..." -ForegroundColor Cyan

# Arquivos que NUNCA devem estar na raiz (causam conflito de import)
$filesToRemove = @("__init__.py", "test_task_executor.py", "tests.py")

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removido: $file" -ForegroundColor Yellow
    }
}

# Remove o arquivo 'tests' apenas se ele não for o diretório de testes
if ((Test-Path "tests") -and -not (Test-Path "tests" -PathType Container)) {
    Remove-Item "tests" -Force
    Write-Host "Removido arquivo conflitante: tests" -ForegroundColor Yellow
}

Write-Host "Limpeza concluida. Tente rodar: python -m unittest discover tests" -ForegroundColor Green