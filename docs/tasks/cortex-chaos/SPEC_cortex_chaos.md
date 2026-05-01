# SPEC: Cortex Chaos Monkey

**Autor:** @planner | **Data:** 2026-03-20 | **PRD:** PRD_cortex_chaos.md

---

## 1. Resumo da Investigação
Utilização de Next.js 16 + Prisma. O ponto de interceptação será o wrapper global de etch.

## 2. Mudanças no Banco de Dados
Nova tabela ChaosLog:
- id: UUID
- 	ype: API_FAILURE | DB_LOCK | PROCESS_KILL
- impact: Float (Severidade (f)$)
- ecovered: Boolean

## 3. Ordem de Implementação
1. **Core Engine:** Lógica de agendamento em lib/chaos/engine.ts.
2. **Interceptor:** Injeção de falhas no cliente de API.
3. **Stressor:** Script scripts/maintenance/db_hammer.ts.

## 4. Checklist de Segurança
- [ ] Bloqueio em NODE_ENV=production.
- [ ] Validação de integridade do 	asks.json pós-falha.
