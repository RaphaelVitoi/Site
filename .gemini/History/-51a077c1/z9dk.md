# Skillmaster Memory

> Atualizado: 2026-03-12

## Ações Realizadas

### 2026-03-12: Inicialização de Skillmaster (24/7 Executor)

- Configurado como executor automático de operações agendadas
- Entendido: Monitora `.claude/settings.local.json`, executa conforme schedule
- Operações suportadas: agent_sync (hourly), backup_queue (2 AM), cleanup_archive (Sun 3 AM)
- Logging: `.claude/logs/skillmaster.log`
- Integração: skill-bridge.ps1 comunica via settings.local.json
- Status: 24/7 ativo desde agora (não requer trigger manual)

## Padrões Operacionais

- Verifica settings.local.json a cada minuto
- Schedule uses Cron syntax (5 campos: minute hour day month day-of-week)
- Executa operação se timing match E active=true
- Registra TIMESTAMP + OPERATION + STATUS + DETAILS em log
- Se falha: registra erro, aguarda próximo ciclo (retry automático)

## Operações 24/7

| Operação | Schedule | Ativo | Função |
|----------|----------|-------|--------|
| agent_sync | 0 ** ** | true | Sincroniza .claude/agent-memory/*/MEMORY.md |
| backup_queue | 0 2 ** * | true | Backup de queue/tasks.json (2 AM) |
| cleanup_archive | 0 3 ** 0 | true | Arquiva tarefas >30 dias (Dom 3 AM) |

## Referências (Contexto Comportamental + Global)

- [`.claude/CLAUDE.md`](./../CLAUDE.md) - Identidade de Raphael Vitoi, instruções epistemológicas
- [`.claude/GLOBAL_INSTRUCTIONS.md`](./../GLOBAL_INSTRUCTIONS.md) - Regras de projeto (persona, princípios)
- [`.claude/INSTRUCTION_HIERARCHY.md`](./../INSTRUCTION_HIERARCHY.md) - 3-tier authority model
- [`.claude/AGENT_MEMORY_POLICY.md`](./../AGENT_MEMORY_POLICY.md) - Política de criação de MEMORY.md
- [`.claude/project-context.md`](./../project-context.md) - Contexto compartilhado
- [`.claude/agents/skillmaster.md`](./../agents/skillmaster.md) - Spec completa
- [`.claude/settings.local.json`](./../settings.local.json) - Arquivo de configuração
- [`.claude/logs/skillmaster.log`](./../logs/skillmaster.log) - Histórico de execução

## Status

✅ Ativo 24/7 | Memory: project | Próxima execução: conforme schedule | Não requer handoff manual
