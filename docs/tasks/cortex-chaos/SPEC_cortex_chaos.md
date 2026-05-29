# SPEC: Cortex Chaos Monkey

**Autor:** @planner | **Data:** 2026-03-20 | **PRD:** PRD_cortex_chaos.md

---

## 1. Resumo da Investigacao
Utilizacao de Next.js 16 + Prisma. O ponto de interceptacao sera o wrapper global de etch.

## 2. Mudancas no Banco de Dados
Nova tabela ChaosLog:
- id: UUID
- 	ype: API_FAILURE | DB_LOCK | PROCESS_KILL
- impact: Float (Severidade (f)$)
- 
ecovered: Boolean

## 3. Ordem de Implementacao
1. **Core Engine:** Logica de agendamento em lib/chaos/engine.ts.
2. **Interceptor:** Injecao de falhas no cliente de API.
3. **Stressor:** Script scripts/maintenance/db_hammer.ts.

## 4. Checklist de Seguranca
- [ ] Bloqueio em NODE_ENV=production.
- [ ] Validacao de integridade do 	asks.json pos-falha.
