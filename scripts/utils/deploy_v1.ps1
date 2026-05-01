# Script de Deploy Automatico v1.0
# Executa o ciclo de commit e push para o repositorio remoto

Write-Host "=== INICIANDO DEPLOY v1.0 ===" -ForegroundColor Cyan

# 1. Adicionar todos os arquivos (incluindo novos)
Write-Host "[GIT] Adicionando arquivos..." -ForegroundColor Yellow
git add . 

# 2. Commit com mensagem padronizada
Write-Host "[GIT] Commitando versao..." -ForegroundColor Yellow
git commit -m "feat: content completion v1.0 - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# 3. Push para a branch main
Write-Host "[GIT] Enviando para origem..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host " [SUCESSO] Site v1.0 publicado." -ForegroundColor Green
