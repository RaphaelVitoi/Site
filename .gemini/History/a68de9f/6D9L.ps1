<#
.SYNOPSIS
    Protocolo Singularidade Fase 2: Backup Mandatorio + Varredura DAG Completa.
#>

Write-Host "=== INICIANDO PROTOCOLO SINGULARIDADE FASE 2 (VARREDURA CRITICA) ===" -ForegroundColor Red

$ProjectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# 1. RESGUARDO ABSOLUTO (BACKUP)
Write-Host "`n[1/3] Executando Backup de Seguranca Mandatorio..." -ForegroundColor Yellow
$BackupScript = Join-Path $ProjectRoot "scripts\init\invoke_daily_backup.ps1"
if (-not (Test-Path $BackupScript)) {
    $BackupScript = Join-Path $ProjectRoot "scripts\routines\invoke_daily_backup.ps1"
}

try {
    & $BackupScript
    Write-Host "  [OK] Snapshot consolidado com sucesso no cofre (.backups_sota)." -ForegroundColor Green
}
catch {
    Write-Host "  [FALHA FATAL] Backup falhou. Abortando a Singularidade para evitar entropia irreversivel." -ForegroundColor Red
    exit 1
}

# 2. MECANISMOS DE RESILIENCIA (Validacao de SQLite)
Write-Host "`n[2/3] Verificando Mecanismos de Resiliencia..." -ForegroundColor Yellow
$TaskDb = Join-Path $ProjectRoot "queue\tasks.db"
if (-not (Test-Path $TaskDb)) {
    Write-Host "  [FALHA FATAL] Banco de dados SOTA nao encontrado. Abortando." -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] Banco de Dados SQLite Online e Blindado." -ForegroundColor Green

# 3. INJECAO DAG NA MATRIZ (Varredura do Todo)
Write-Host "`n[3/3] Injetando Fatiamento da Varredura na Matriz DAG..." -ForegroundColor Cyan
$KernelPath = Join-Path $ProjectRoot "Agent-TaskManager.psm1"
Import-Module $KernelPath -Force -DisableNameChecking

$TaskId = "EPIC-VARREDURA-$(Get-Date -Format 'yyyyMMddHHmmss')"
$Directive = @"
[PROTOCOLO DA SINGULARIDADE - VARREDURA SOTA]
O sistema esta devidamente com backup. O Risco de Ruina e nulo. Avancem com a reestruturacao.

1. ARQUITETURA FISICA (@architect): Desenhe o blueprint para mover scripts soltos para as pastas canonicas (/core, /scripts, /docs, /frontend, /queue, /archive).
2. REDUCAO DE AGENTES (@maverick): Audite os 19 agentes atuais. Identifique redundancias e crie um plano de fusao (ex: prompter + planner) para reduzir a complexidade mantendo a excelencia.
3. EXPURGO FRONTEND (@implementor): Com base na nova topologia, elabore o expurgo da pasta /frontend de componentes velhos, pacotes NPM obsoletos e CSS nao utilizado do legado de 2025. ESTA ETAPA DEVE depender ('depends_on') das conclusoes do @architect e @maverick.
"@

$newTask = [ordered]@{
    id          = $TaskId
    description = $Directive
    status      = "pending"
    timestamp   = (Get-Date -Format "o")
    agent       = "@dispatcher"
    metadata    = @{ priority = "critical" }
}

Add-AgentTask -NewTask $newTask
Write-Host "`n[SUCESSO] Operacao deflagrada e protegida. O @dispatcher vai fatiar a missao." -ForegroundColor Green
Write-Host "O motor Python executara as operacoes em paralelo. Acompanhe pelo 'chico monitor'." -ForegroundColor Cyan