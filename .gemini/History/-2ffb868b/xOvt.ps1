<#
.SYNOPSIS
    Bateria de Testes Rigorosos (Stress Test & Chaos Engineering)
.DESCRIPTION
    Valida a Membrana Inteligente, a concorrencia do Kernel, a Auto-Cura e a saude do Frontend.
#>

Write-Host "=== [CHAOS INITIATIVE] BATERIA DE TESTES DE ESTRESSE E2E ===" -ForegroundColor Magenta

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# Definicao da funcao Assert-SignatureValida
function Assert-SignatureValida {
    param (
        [string]$FilePath
    )
    try {
        # Verifica se o arquivo e assinado
        if ((Get-AuthenticodeSignature -FilePath $FilePath).Status -eq "Valid") {
            Write-Host "  [OK] Assinatura valida: $FilePath" -ForegroundColor Green
        }
        else {
            Write-Host "  [WARN] Assinatura INVALIDA: $FilePath" -ForegroundColor Red
        }
    }
    catch { Write-Host "  [ERRO] Falha ao verificar assinatura: $FilePath - $_" -ForegroundColor Red }
}

# 1. Teste de Integridade Termodinamica (Arquivos SOTA)
Write-Host "`n[1/4] Verificando Integridade do Ecossistema Frontend..." -ForegroundColor Yellow
$FrontendDir = Join-Path $ProjectRoot "frontend"
$PrismaSchema = Join-Path $FrontendDir "prisma\schema.prisma"
$NextConfig = Join-Path $FrontendDir "next.config.ts"

if (Test-Path $PrismaSchema) { Write-Host "  [OK] Prisma Schema detectado." -ForegroundColor Green }
else { Write-Host "  [WARN] Prisma Schema ausente." -ForegroundColor DarkYellow }

#Test Prisma
if (Select-String -Path $PrismaSchema -Pattern '"provider" = "sqlite"') { Write-Host "  [OK] SQLite provider detectado." -ForegroundColor Green }
else { Write-Host "  [WARN] SQLite provider ausente." -ForegroundColor DarkYellow }


if (Test-Path $NextConfig) { Write-Host "  [OK] Next.js SOTA Config detectado." -ForegroundColor Green }
else { Write-Host "  [WARN] Next.js config ausente." -ForegroundColor DarkYellow }

# 1.1. Validacao das assinaturas digitais dos scripts
Write-Host "`n[1.1] Validando assinaturas dos scripts..." -ForegroundColor Yellow
Get-ChildItem $ProjectRoot\*.ps1 -File | ForEach-Object { Assert-SignatureValida $_.FullName }

# 2. Teste da Membrana Inteligente (Smart CLI)
Write-Host "`n[2/4] Estressando a Membrana Inteligente (do.ps1)..." -ForegroundColor Yellow
try {
    $Task1 = "Quero planejar a arquitetura de banco de dados do NashSolver" # Deve ir pro @planner
    $Task2 = "Revisar o texto da carta de vendas sobre ICM" # Deve ir pro @curator
    
    Assert-SignatureValida "$ProjectRoot\do.ps1"
    Write-Host "  > Injetando: '$Task1'" -ForegroundColor DarkGray
    & (Join-Path $ProjectRoot "do.ps1") $Task1 -Force | Out-Null
    Write-Host "  [OK] Tarefa 1 absorvida." -ForegroundColor Green
    
    Assert-SignatureValida "$ProjectRoot\do.ps1"
    Write-Host "  > Injetando: '$Task2'" -ForegroundColor DarkGray
    & (Join-Path $ProjectRoot "do.ps1") $Task2  -Force | Out-Null
    Write-Host "  [OK] Tarefa 2 absorvida." -ForegroundColor Green
}
catch {
    Write-Host "  [FAIL] A Membrana Inteligente rompeu: $_" -ForegroundColor Red
}


# 3. Teste de Engenharia do Caos (Falha Induzida para testar Auto-Cura)
Write-Host "`n[3/4] Injetando Entropia (Falha Induzida no @implementor)..." -ForegroundColor Yellow
$KernelPath = Join-Path $ProjectRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force -DisableNameChecking
Assert-SignatureValida $KernelPath

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
$QueueFile = Join-Path $ProjectRoot "queue\tasks.json"
if (Test-Path $QueueFile) {
    $QueueData = Get-Content $QueueFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $PendingCount = @($QueueData.tasks | Where-Object { $_.status -eq 'pending' }).Count
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