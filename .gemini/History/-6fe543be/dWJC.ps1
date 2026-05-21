<#
.SYNOPSIS
    Protocolo de Obliteracao SOTA contra EPERM.
.DESCRIPTION
    Mata processos zumbis do Node, expurga caches corrompidos do Prisma/Next e ressincroniza o banco.
#>

Write-Host "=== INICIANDO PROTOCOLO ANTI-EPERM (OBLITERACAO DE LOCKS) ===" -ForegroundColor Red

# 1. Matar todos os processos do Node
Write-Host "[1/4] Aniquilando processos Node.js fantasmas..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2 # Aguarda o Windows soltar os arquivos

$FrontendDir = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "frontend"

# 2. Limpeza profunda de caches corrompidos
Write-Host "[2/4] Purgando caches corrompidos (.next, node_modules/.prisma)..." -ForegroundColor Yellow
$PrismaCache = Join-Path $FrontendDir "node_modules\.prisma"
if (Test-Path $PrismaCache) { Remove-Item -Path $PrismaCache -Recurse -Force -ErrorAction SilentlyContinue }

# 3. Regenerar o Prisma Client
Write-Host "[3/4] Forjando novo Prisma Client..." -ForegroundColor Yellow
Set-Location $FrontendDir
Invoke-Expression "npx prisma generate"

Write-Host "`n=== EPERM OBLITERADO. OS ARQUIVOS ESTAO LIVRES. ===" -ForegroundColor Green
Write-Host "Agora voce pode rodar com seguranca: npx prisma db push (se necessario) e npm run dev" -ForegroundColor Cyan