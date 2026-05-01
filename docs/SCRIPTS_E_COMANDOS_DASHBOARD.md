# Dashboard Vivo: Scripts e Comandos (Curado)

> Atualizado em: 2026-03-28 09:40:59
> Objetivo: visao didatica e operacional do que esta ativo hoje.
> Legenda semantica: [VERDE]=operacao estavel | [CIANO]=infra/core | [AMARELO]=manutencao | [MAGENTA]=analise | [VERMELHO]=acao destrutiva/sensivel

## 0) Comandos por Objetivo

| Objetivo | Comandos recomendados | Cor semantica |
|---|---|---|
| Diagnostico rapido | 
exus-status, 
exus-keys, 
exus-fallback 60 | [MAGENTA] |
| Operacao diaria | 
exus '<tarefa>', start-worker, 
exus-list | [VERDE] |
| Manutencao segura | 
exus-checkdb, 
exus-fallback-prune 7, 
exus-backup | [AMARELO] |
| Governanca/Mapa | 
exus-map, 
exus-scripts, 
exus-scripts-refresh | [CIANO] |
| Recovery controlado | stop-worker, start-worker -Force, 
exus-fallback-prune-legacy | [VERMELHO] |

## 1) Comandos Principais

| Cor | Comando | Funcao | Backend |
|---|---|---|---|
| [VERDE] | nexus '<tarefa>' | Enfileira tarefa para o orquestrador | task_executor.py db-add |
| [CIANO] | nexus-status | Mostra fila e orcamento | task_executor.py db-get counts/budget |
| [VERDE] | nexus-list | Lista tarefas recentes | task_executor.py db-get all |
| [VERDE] | nexus-db <subcmd> | Comandos de banco | task_executor.py db-* |
| [AMARELO] | nexus-keys | Audita Gemini/OpenRouter | task_executor.py check-keys |
| [VERDE] | nexus-watchdog | Mostra a taxa de falhas e metricas | task_executor.py watchdog |
| [AMARELO] | nexus-fallback [min] | Metricas de fallback | task_executor.py fallback-stats |
| [AMARELO] | nexus-fallback-prune [days] | Limpa metricas antigas | task_executor.py fallback-prune |
| [VERMELHO] | nexus-fallback-prune-legacy | Remove ruido legado 1.5/Anthropic | task_executor.py fallback-prune-legacy |
| [VERDE] | start-worker [-Force] [-Background] | Inicia worker+API (Force=reinicia, Background=daemon) | scripts/ops/start_worker.ps1 |
| [VERMELHO] | stop-worker | Para worker com seguranca | .nexus_worker.pid |
| [AMARELO] | nexus-backup-full | Backup total (ignora node_modules) | scripts/utils/invoke_full_backup.ps1 |
| [CIANO] | nexus-scripts | Abre dashboard de scripts | docs/SCRIPTS_E_COMANDOS_DASHBOARD.md |
| [CIANO] | nexus-scripts-refresh | Regenera dashboard vivo | scripts/routines/invoke_scripts_dashboard.ps1 |

## 2) Scripts Operacionais Ativos

| Cor | Status | Categoria | Script | Uso atual |
|---|---|---|---|---|
| [CIANO] | OK | Core | do.ps1 | Membrana principal (audit/setup/schedule/checkdb) |
| [CIANO] | OK | Core | task_executor.py | Worker, API local, fila e roteamento |
| [CIANO] | OK | Core | memory_rag.py | Ingestao/consulta da memoria vetorial |
| [CIANO] | OK | Setup | scripts/setup/Setup-NexusProfile.ps1 | Instala comandos nexus-* no profile |
| [CIANO] | OK | Setup | scripts/setup/Schedule-MaintenanceTasks.ps1 | Agenda manutencao automatica |
| [CIANO] | OK | Setup | scripts/setup/Set-AgentEnvironment.ps1 | Bootstrap de ambiente de agentes |
| [CIANO] | OK | Routine | scripts/routines/Invoke-ContextAssembler.ps1 | Montagem otimizada de contexto para handoff |
| [CIANO] | OK | Routine | scripts/routines/invoke_daily_backup.ps1 | Backup diario de DB |
| [CIANO] | OK | Routine | scripts/routines/invoke_weekly_audit.ps1 | Auditoria semanal |
| [CIANO] | OK | Routine | scripts/routines/invoke_weekly_report.ps1 | Relatorio semanal |
| [CIANO] | OK | Routine | scripts/routines/invoke_db_vacuum.ps1 | VACUUM mensal |
| [CIANO] | OK | Routine | scripts/routines/invoke_sota_audit.ps1 | Auditoria sob demanda |
| [CIANO] | OK | Routine | scripts/routines/sync_agents_reality.ps1 | Sincronia de agentes/contexto |
| [CIANO] | OK | Routine | scripts/routines/invoke_scripts_dashboard.ps1 | Gerador do dashboard vivo |
| [AMARELO] | OK | Maintenance | scripts/maintenance/invoke_db_integrity_check.ps1 | Integridade de banco com relatorio |
| [AMARELO] | OK | Maintenance | scripts/maintenance/cleanup.ps1 | Limpeza operacional controlada |
| [AMARELO] | OK | Maintenance | scripts/maintenance/backup_config.ps1 | Snapshot de configuracao critica |
| [AMARELO] | OK | Maintenance | scripts/maintenance/run_cleanup_sota.ps1 | Limpa banco e task_results (>15 dias) |
| [AMARELO] | OK | Maintenance | scripts/maintenance/run_skillmaster_cron.ps1 | Executor de jobs do skillmaster |
| [MAGENTA] | OK | Utility | scripts/utils/network_diagnostic.py | Diagnostico de conectividade de APIs |
| [MAGENTA] | OK | Utility | scripts/utils/safeguard_system.ps1 | Salvaguarda pre-manutencao |
| [MAGENTA] | OK | Utility | scripts/utils/invoke_full_backup.ps1 | Backup ZIP absoluto do projeto |
| [MAGENTA] | OK | Utility | scripts/utils/run_maverick_sentinel.ps1 | Sentinela diaria (skillmaster) |
| [VERDE] | OK | Ops | scripts/ops/start_frontend.ps1 | Subida guiada do frontend |
| [VERDE] | OK | Ops | scripts/ops/start_worker.ps1 | Inicia worker (start-worker [-Force] [-Background]) |

## 3) Curadoria Aplicada (Legado)

| Origem antiga | Destino legado | Motivo | Status origem | Status destino |
|---|---|---|---|---|
| scripts/init/invoke_daily_backup.ps1 | scripts/_legacy/invoke_daily_backup.init.legacy.ps1 | Duplicata da rotina ativa | MISSING | OK |
| scripts/maintenance/run_maverick_sentinel.ps1 | scripts/_legacy/run_maverick_sentinel.maintenance.legacy.ps1 | Substituido por versao utilitaria curada | MISSING | OK |
| scripts/maintenance/run_organizador_maintenance.ps1 | scripts/_legacy/run_organizador_maintenance.maintenance.legacy.ps1 | Fora da trilha ativa e redundante | MISSING | OK |
| scripts/control/.claude/autonomy.json | scripts/_legacy/autonomy.control.legacy.json | Estado legado fora da fonte oficial | MISSING | OK |

## 4) Operacao Rapida

~~~powershell
nexus-keys
nexus-fallback
nexus-fallback 60
nexus-fallback-prune 7
nexus-fallback-prune-legacy
nexus-scripts-refresh
nexus-scripts
~~~
