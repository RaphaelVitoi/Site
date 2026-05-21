<#
<#
.SYNOPSIS
    Gera o dashboard curado de scripts e comandos funcionais do Nexus.
.DESCRIPTION
    Auditoria leve de existencia de comandos e scripts ativos, com output
    didatico em Markdown para consulta rapida no terminal.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$DashboardPath = Join-Path $ProjectRoot 'docs\SCRIPTS_E_COMANDOS_DASHBOARD.md'

function Test-ItemStatus {
    param([string]$Path)
    if (Test-Path $Path) { return 'OK' }
    return 'MISSING'
}

$commands = @(
    @{ Name = "nexus '<tarefa>'"; Purpose = 'Enfileira tarefa para o orquestrador'; Backend = 'task_executor.py db-add' },
    @{ Name = 'nexus-status'; Purpose = 'Mostra fila e orcamento'; Backend = 'task_executor.py db-get counts/budget' },
    @{ Name = 'nexus-list'; Purpose = 'Lista tarefas recentes'; Backend = 'task_executor.py db-get all' },
    @{ Name = 'nexus-db <subcmd>'; Purpose = 'Comandos de banco'; Backend = 'task_executor.py db-*' },
    @{ Name = 'nexus-keys'; Purpose = 'Audita Gemini/OpenRouter'; Backend = 'task_executor.py check-keys' },
    @{ Name = 'nexus-watchdog'; Purpose = 'Mostra a taxa de falhas e metricas'; Backend = 'task_executor.py watchdog' },
    @{ Name = 'nexus-fallback [min]'; Purpose = 'Metricas de fallback'; Backend = 'task_executor.py fallback-stats' },
    @{ Name = 'nexus-fallback-prune [days]'; Purpose = 'Limpa metricas antigas'; Backend = 'task_executor.py fallback-prune' },
    @{ Name = 'nexus-fallback-prune-legacy'; Purpose = 'Remove ruido legado 1.5/Anthropic'; Backend = 'task_executor.py fallback-prune-legacy' },
    @{ Name = 'start-worker'; Purpose = 'Inicia worker+API'; Backend = 'task_executor.py worker' },
    @{ Name = 'stop-worker'; Purpose = 'Para worker com seguranca'; Backend = '.nexus_worker.pid' },
    @{ Name = 'nexus-backup-full'; Purpose = 'Backup total (ignora node_modules)'; Backend = 'scripts/utils/invoke_full_backup.ps1' },
    @{ Name = 'nexus-scripts'; Purpose = 'Abre dashboard de scripts'; Backend = 'docs/SCRIPTS_E_COMANDOS_DASHBOARD.md' },
    @{ Name = 'nexus-scripts-refresh'; Purpose = 'Regenera dashboard vivo'; Backend = 'scripts/routines/invoke_scripts_dashboard.ps1' }
)

$activeScripts = @(
    @{ Category = 'Core'; Path = 'do.ps1'; Use = 'Membrana principal (audit/setup/schedule/checkdb)' },
    @{ Category = 'Core'; Path = 'task_executor.py'; Use = 'Worker, API local, fila e roteamento' },
    @{ Category = 'Core'; Path = 'memory_rag.py'; Use = 'Ingestao/consulta da memoria vetorial' },
    @{ Category = 'Setup'; Path = 'scripts/setup/Setup-NexusProfile.ps1'; Use = 'Instala comandos nexus-* no profile' },
    @{ Category = 'Setup'; Path = 'scripts/setup/Schedule-MaintenanceTasks.ps1'; Use = 'Agenda manutencao automatica' },
    @{ Category = 'Setup'; Path = 'scripts/setup/Set-AgentEnvironment.ps1'; Use = 'Bootstrap de ambiente de agentes' },
    @{ Category = 'Routine'; Path = 'scripts/routines/Invoke-ContextAssembler.ps1'; Use = 'Montagem otimizada de contexto para handoff' },
    @{ Category = 'Routine'; Path = 'scripts/routines/invoke_daily_backup.ps1'; Use = 'Backup diario de DB' },
    @{ Category = 'Routine'; Path = 'scripts/routines/invoke_weekly_audit.ps1'; Use = 'Auditoria semanal' },
    @{ Category = 'Routine'; Path = 'scripts/routines/invoke_weekly_report.ps1'; Use = 'Relatorio semanal' },
    @{ Category = 'Routine'; Path = 'scripts/routines/invoke_db_vacuum.ps1'; Use = 'VACUUM mensal' },
    @{ Category = 'Routine'; Path = 'scripts/routines/invoke_sota_audit.ps1'; Use = 'Auditoria sob demanda' },
    @{ Category = 'Routine'; Path = 'scripts/routines/sync_agents_reality.ps1'; Use = 'Sincronia de agentes/contexto' },
    @{ Category = 'Routine'; Path = 'scripts/routines/invoke_scripts_dashboard.ps1'; Use = 'Gerador do dashboard vivo' },
    @{ Category = 'Maintenance'; Path = 'scripts/maintenance/invoke_db_integrity_check.ps1'; Use = 'Integridade de banco com relatorio' },
    @{ Category = 'Maintenance'; Path = 'scripts/maintenance/cleanup.ps1'; Use = 'Limpeza operacional controlada' },
    @{ Category = 'Maintenance'; Path = 'scripts/maintenance/backup_config.ps1'; Use = 'Snapshot de configuracao critica' },
    @{ Category = 'Maintenance'; Path = 'scripts/maintenance/run_cleanup_sota.ps1'; Use = 'Limpa banco e task_results (>15 dias)' },
    @{ Category = 'Maintenance'; Path = 'scripts/maintenance/run_skillmaster_cron.ps1'; Use = 'Executor de jobs do skillmaster' },
    @{ Category = 'Utility'; Path = 'scripts/utils/network_diagnostic.py'; Use = 'Diagnostico de conectividade de APIs' },
    @{ Category = 'Utility'; Path = 'scripts/utils/safeguard_system.ps1'; Use = 'Salvaguarda pre-manutencao' },
    @{ Category = 'Utility'; Path = 'scripts/utils/invoke_full_backup.ps1'; Use = 'Backup ZIP absoluto do projeto' },
    @{ Category = 'Utility'; Path = 'scripts/utils/run_maverick_sentinel.ps1'; Use = 'Sentinela diaria (skillmaster)' },
    @{ Category = 'Ops'; Path = 'scripts/ops/start_frontend.ps1'; Use = 'Subida guiada do frontend' }
)

$legacyItems = @(
    @{ Old = 'scripts/init/invoke_daily_backup.ps1'; New = 'scripts/_legacy/invoke_daily_backup.init.legacy.ps1'; Why = 'Duplicata da rotina ativa' },
    @{ Old = 'scripts/maintenance/run_maverick_sentinel.ps1'; New = 'scripts/_legacy/run_maverick_sentinel.maintenance.legacy.ps1'; Why = 'Substituido por versao utilitaria curada' },
    @{ Old = 'scripts/maintenance/run_organizador_maintenance.ps1'; New = 'scripts/_legacy/run_organizador_maintenance.maintenance.legacy.ps1'; Why = 'Fora da trilha ativa e redundante' },
    @{ Old = 'scripts/control/.claude/autonomy.json'; New = 'scripts/_legacy/autonomy.control.legacy.json'; Why = 'Estado legado fora da fonte oficial' }
)

$now = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$lines = New-Object System.Collections.Generic.List[string]

$lines.Add('# Dashboard Vivo: Scripts e Comandos (Curado)')
$lines.Add('')
$lines.Add("> Atualizado em: $now")
$lines.Add('> Objetivo: visao didatica e operacional do que esta ativo hoje.')
$lines.Add('> Legenda semantica: [VERDE]=operacao estavel | [CIANO]=infra/core | [AMARELO]=manutencao | [MAGENTA]=analise | [VERMELHO]=acao destrutiva/sensivel')
$lines.Add('')
$lines.Add('## 0) Comandos por Objetivo')
$lines.Add('')
$lines.Add('| Objetivo | Comandos recomendados | Cor semantica |')
$lines.Add('|---|---|---|')
$lines.Add("| Diagnostico rapido | `nexus-status`, `nexus-keys`, `nexus-fallback 60` | [MAGENTA] |")
$lines.Add("| Operacao diaria | `nexus '<tarefa>'`, `start-worker`, `nexus-list` | [VERDE] |")
$lines.Add("| Manutencao segura | `nexus-checkdb`, `nexus-fallback-prune 7`, `nexus-backup` | [AMARELO] |")
$lines.Add("| Governanca/Mapa | `nexus-map`, `nexus-scripts`, `nexus-scripts-refresh` | [CIANO] |")
$lines.Add("| Recovery controlado | `stop-worker`, `nexus-fallback-prune-legacy` | [VERMELHO] |")
$lines.Add('')
$lines.Add('## 1) Comandos Principais')
$lines.Add('')
$lines.Add('| Cor | Comando | Funcao | Backend |')
$lines.Add('|---|---|---|---|')
foreach ($c in $commands) {
    $semantic = '[VERDE]'
    if ($c.Name -match 'fallback|checkdb|backup|keys') { $semantic = '[AMARELO]' }
    if ($c.Name -match 'scripts|map|status') { $semantic = '[CIANO]' }
    if ($c.Name -match 'stop-worker|prune-legacy') { $semantic = '[VERMELHO]' }
    if ($c.Name -match 'audit|diag') { $semantic = '[MAGENTA]' }
    $lines.Add("| $semantic | $($c.Name) | $($c.Purpose) | $($c.Backend) |")
}
$lines.Add('')
$lines.Add('## 2) Scripts Operacionais Ativos')
$lines.Add('')
$lines.Add('| Cor | Status | Categoria | Script | Uso atual |')
$lines.Add('|---|---|---|---|---|')
foreach ($s in $activeScripts) {
    $abs = Join-Path $ProjectRoot $s.Path
    $status = Test-ItemStatus -Path $abs
    $semantic = '[CIANO]'
    if ($s.Category -eq 'Maintenance') { $semantic = '[AMARELO]' }
    if ($s.Category -eq 'Utility') { $semantic = '[MAGENTA]' }
    if ($s.Category -eq 'Ops') { $semantic = '[VERDE]' }
    $lines.Add("| $semantic | $status | $($s.Category) | $($s.Path) | $($s.Use) |")
}
$lines.Add('')
$lines.Add('## 3) Curadoria Aplicada (Legado)')
$lines.Add('')
$lines.Add('| Origem antiga | Destino legado | Motivo | Status origem | Status destino |')
$lines.Add('|---|---|---|---|---|')
foreach ($l in $legacyItems) {
    $oldStatus = Test-ItemStatus -Path (Join-Path $ProjectRoot $l.Old)
    $newStatus = Test-ItemStatus -Path (Join-Path $ProjectRoot $l.New)
    $lines.Add("| $($l.Old) | $($l.New) | $($l.Why) | $oldStatus | $newStatus |")
}
$lines.Add('')
$lines.Add('## 4) Operacao Rapida')
$lines.Add('')
$lines.Add('~~~powershell')
$lines.Add('nexus-keys')
$lines.Add('nexus-fallback')
$lines.Add('nexus-fallback 60')
$lines.Add('nexus-fallback-prune 7')
$lines.Add('nexus-fallback-prune-legacy')
$lines.Add('nexus-scripts-refresh')
$lines.Add('nexus-scripts')
$lines.Add('~~~')

$tempPath = "$DashboardPath.tmp"
$saved = $false
for ($i = 0; $i -lt 3; $i++) {
    try {
        $lines | Set-Content -Path $tempPath -Encoding UTF8
        Copy-Item -LiteralPath $tempPath -Destination $DashboardPath -Force
        Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
        $saved = $true
        break
    }
    catch {
        Start-Sleep -Milliseconds 250
    }
}

if ($saved) {
    Write-Host "[OK] Dashboard vivo atualizado em: $DashboardPath" -ForegroundColor Green
}
else {
    Write-Warning "Nao foi possivel atualizar o dashboard (arquivo em uso): $DashboardPath"
}
