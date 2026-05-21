<#
.SYNOPSIS
    Configura as Tarefas Agendadas do Windows para as rotinas de manutencao SOTA.
.DESCRIPTION
    Este script cria ou atualiza as tarefas agendadas para garantir a execucao
    automatica e confiavel das rotinas de backup, auditoria e sincronia,
    reforcando a resiliencia e a saude do ecossistema.

    IMPORTANTE: Este script deve ser executado como Administrador.
#>

param (
    [switch]$Force
)

# Verifica se o script esta sendo executado como Administrador
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "ACESSO NEGADO. Este script requer privilegios de Administrador para manipular o Agendador de Tarefas. Por favor, re-execute em um terminal elevado."
    exit 1
}

Write-Host "=== [SKILLMASTER] CONFIGURANDO O RELOGIO BIOLOGICO DO SISTEMA ===" -ForegroundColor Magenta

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))

# --- Definicao das Tarefas de Manutencao SOTA ---

$MaintenanceTasks = @(
    @{
        TaskName    = "Nexus - Backup Diario SOTA"
        Description = "Executa o backup online diario do banco de dados de tarefas (tasks.db)."
        ScriptPath  = Join-Path $ProjectRoot "scripts\routines\invoke_daily_backup.ps1"
        Trigger     = "DAILY"
        StartTime   = "03:00" # 3 da manha, horario de baixa atividade
    },
    @{
        TaskName    = "Nexus - Auditoria Semanal SOTA"
        Description = "Dispara a pipeline de auditoria semanal (Smart MDA) para o @verifier e @auditor."
        ScriptPath  = Join-Path $ProjectRoot "scripts\routines\invoke_weekly_audit.ps1"
        Trigger     = "WEEKLY"
        Day         = "SUN" # Domingo
        StartTime   = "04:00" # 4 da manha
    },
    @{
        TaskName    = "Nexus - Sincronia de Contexto SOTA"
        Description = "Aciona o @organizador para garantir que o project-context.md esteja atualizado."
        ScriptPath  = Join-Path $ProjectRoot ".claude\sync_project_context.ps1"
        Trigger     = "DAILY"
        StartTime   = "05:00" # 5 da manha
    },
    @{
        TaskName    = "Nexus - Relatorio Semanal SOTA"
        Description = "Aciona o @historian para gerar o relatorio de produtividade e custo."
        ScriptPath  = Join-Path $ProjectRoot "scripts\routines\invoke_weekly_report.ps1"
        Trigger     = "WEEKLY"
        Day         = "MON" # Segunda-feira
        StartTime   = "06:00" # 6 da manha
    },
    @{
        TaskName    = "Nexus - Otimizacao Mensal SOTA"
        Description = "Aciona o @skillmaster para executar o VACUUM no banco de dados, reduzindo fragmentacao."
        ScriptPath  = Join-Path $ProjectRoot "scripts\routines\invoke_db_vacuum.ps1"
        Trigger     = "MONTHLY"
        Day         = "1" # Primeiro dia do mes
        StartTime   = "02:00" # 2 da manha
    }
)

foreach ($task in $MaintenanceTasks) {
    Write-Host "`n[AGENDANDO] $($task.TaskName)..." -ForegroundColor Yellow

    if (-not (Test-Path $task.ScriptPath)) {
        Write-Warning "  [AVISO] Script nao encontrado: $($task.ScriptPath). A tarefa nao sera agendada."
        continue
    }

    # O comando a ser executado. Usamos -NoProfile para um inicio mais rapido e limpo.
    $Action = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$($task.ScriptPath)`""

    # Argumentos base para schtasks
    $schtasksArgs = @(
        "/Create",
        "/TN", "`"$($task.TaskName)`"",
        "/TR", "`"$Action`"",
        "/SC", $task.Trigger,
        "/ST", $task.StartTime,
        "/RU", "SYSTEM", # Executa com a conta SYSTEM para nao depender de usuario logado
        "/RL", "HIGHEST", # Executa com os maiores privilegios
        "/F" # Forca a criacao/atualizacao se a tarefa ja existir
    )

    if ($task.Trigger -eq "WEEKLY") {
        $schtasksArgs += @("/D", $task.Day)
    }

    if ($task.Trigger -eq "MONTHLY") {
        $schtasksArgs += @("/D", $task.Day)
    }

    try {
        & schtasks.exe @schtasksArgs | Out-Null
        Write-Host "  [SUCESSO] Tarefa '$($task.TaskName)' agendada com sucesso para rodar $($task.Trigger) as $($task.StartTime)." -ForegroundColor Green
    }
    catch {
        Write-Error "  [FALHA] Nao foi possivel agendar a tarefa '$($task.TaskName)'. Erro: $_"
    }
}

Write-Host "`n[VITORIA] As rotinas de manutencao do ecossistema foram automatizadas com sucesso." -ForegroundColor Cyan
Write-Host "[INFO] Use o 'Agendador de Tarefas' do Windows para visualizar ou modificar estas tarefas."