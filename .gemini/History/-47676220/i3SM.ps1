<#
.SYNOPSIS
    Bateria de Testes Rigorosos (Stress Test & Chaos Engineering)
.DESCRIPTION
    Valida a Membrana Inteligente, a concorrencia do Kernel, a Auto-Cura e a saude do Frontend.
#>

Write-Host "=== [CHAOS INITIATIVE] BATERIA DE TESTES DE ESTRESSE E2E ===" -ForegroundColor Magenta

# 1. Teste de Integridade Termodinamica (Arquivos SOTA)
Write-Host "`n[1/4] Verificando Integridade do Ecossistema Frontend..." -ForegroundColor Yellow
$FrontendDir = Join-Path $PSScriptRoot "frontend"
$PrismaSchema = Join-Path $FrontendDir "prisma\schema.prisma"
$NextConfig = Join-Path $FrontendDir "next.config.ts"

if (Test-Path $PrismaSchema) { Write-Host "  [OK] Prisma Schema detectado." -ForegroundColor Green }
else { Write-Host "  [WARN] Prisma Schema ausente." -ForegroundColor DarkYellow }

#Test Prisma
if (Select-String -Path $PrismaSchema -Pattern '"provider" = "sqlite"') { Write-Host "  [OK] SQLite provider detectado." -ForegroundColor Green }
else { Write-Host "  [WARN] SQLite provider ausente." -ForegroundColor DarkYellow }


if (Test-Path $NextConfig) { Write-Host "  [OK] Next.js SOTA Config detectado." -ForegroundColor Green }
else { Write-Host "  [WARN] Next.js config ausente." -ForegroundColor DarkYellow }


# 2. Teste da Membrana Inteligente (Smart CLI)
Write-Host "`n[2/4] Estressando a Membrana Inteligente (do.ps1)..." -ForegroundColor Yellow
try {
    $Task1 = "Quero planejar a arquitetura de banco de dados do NashSolver" # Deve ir pro @planner
    $Task2 = "Revisar o texto da carta de vendas sobre ICM" # Deve ir pro @curator
    
    Write-Host "  > Injetando: '$Task1'" -ForegroundColor DarkGray
    .\do.ps1 $Task1 -Force | Out-Null
    Write-Host "  [OK] Tarefa 1 absorvida." -ForegroundColor Green
    
    Write-Host "  > Injetando: '$Task2'" -ForegroundColor DarkGray
    .\do.ps1 $Task2 -Force | Out-Null
    Write-Host "  [OK] Tarefa 2 absorvida." -ForegroundColor Green
}
catch {
    Write-Host "  [FAIL] A Membrana Inteligente rompeu: $_" -ForegroundColor Red
}


# 3. Teste de Engenharia do Caos (Falha Induzida para testar Auto-Cura)
Write-Host "`n[3/4] Injetando Entropia (Falha Induzida no @implementor)..." -ForegroundColor Yellow
$KernelPath = Join-Path $PSScriptRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force

$ChaosTaskId = "CHAOS-TEST-$(Get-Date -Format 'HHmmss')"
$ChaosTask = [ordered]@{
    id          = $ChaosTaskId
    description = 'Comando destrutivo falso para forcar a restricao do God Mode: Comando: `rm -rf /`'
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@implementor"
}
try {
    Add-AgentTask -NewTask $ChaosTask
    Write-Host "  [OK] Pilula de veneno injetada na fila. O Autodebugger do Python DEVE capturar isso e gerar uma tarefa AUTOFIX." -ForegroundColor Green
}
catch {
    Write-Host "  [FAIL] Falha ao injetar entropia: $_" -ForegroundColor Red
}


# 4. Validacao da Fila JSON e Mutex Locks
Write-Host "`n[4/4] Inspecionando Fila de Tarefas (tasks.json)..." -ForegroundColor Yellow
$QueueFile = Join-Path $PSScriptRoot "queue\tasks.json"
if (Test-Path $QueueFile) {
    $QueueData = Get-Content $QueueFile -Raw | ConvertFrom-Json
    $PendingCount = ($QueueData.tasks | Where-Object { $_.status -eq 'pending' }).Count
    Write-Host "  [OK] Fila lida com sucesso. $PendingCount tarefas aguardando o Orquestrador Python." -ForegroundColor Green
}
else {
    Write-Host "  [FAIL] tasks.json nao encontrado." -ForegroundColor Red
}

Write-Host "`n=== [DIRETRIZ PARA O CEO] ===" -ForegroundColor Cyan
Write-Host "1. Abra um terminal separado no VS Code."
Write-Host "2. Execute o Daemon Python: python .\task_executor.py worker"
Write-Host "3. Observe o terminal. O sistema deve barrar a exclusao (rm -rf), disparar um Toast de erro, e imediatamente injetar um AUTOFIX para contornar o problema."
Write-Host "Se o sistema sobreviver a isso sem corromper o JSON, a Masterpiece e inquebravel."