---
name: Estado completo do projeto 2026-03-15 v2 (pos-auditoria .claude/)
description: Snapshot definitivo apos reorganizacao do projeto E auditoria integral da pasta .claude/. Use este como fonte unica de verdade para continuidade.
type: project
---

## CONTEXTO GERAL

Projeto: Site pessoal/profissional de Raphael Vitoi (poker, psicologia, tecnologia)
Stack: Next.js 16 (App Router) + React 19 + Prisma 5.22 (SQLite) + TypeScript
Branch: main (sem remote configurado)
Build: PASSA (8 rotas: 7 static, 1 dynamic)
Node: v22.4 (Windows 10 Pro)

## ESTRUTURA CANONICA DO PROJETO

```
frontend/          - Next.js 16 (fonte de verdade do site)
  src/app/         - App Router (8 rotas)
  src/lib/         - Logica (icm.ts, prisma.ts, etc)
  prisma/          - Schema + seed + dev.db
content/           - Material educacional futuro
  interativo/      - scenarios_toygame.js
docs/              - Documentacao
scripts/           - Scripts organizados
  tests/           - Scripts de teste
  init/            - Inicializacao
  utils/           - Utilitarios
  maintenance/     - cleanup.ps1, backup_config.ps1, etc
queue/             - Fila de tarefas (tasks.json) + archive/
.claude/           - Cerebro do sistema (agentes, config, filosofia)
  agents/          - 17 definicoes de agentes
  agent-memory/    - 15 diretorios de memoria
Raiz:              - do.ps1, Agent-TaskManager.psm1, nexus CLI
```

## O QUE FOI FEITO NESTA SESSAO (3 fases)

### Fase 1: Build + Cleanup (sessao anterior continuada)
- Build Next.js testado e corrigido (schema.prisma criado, Prisma alinhado em 5.22, inline tests removidos de icm.ts)
- Git: 17k para 234 arquivos tracked, node_modules removido, .backups limpos, branch master renomeado para main
- README.md reescrito, .gitignore atualizado

### Fase 2: Auditoria .claude/ (limpeza)
- 420 para 55 arquivos tracked na .claude/
- 336 task_results genericos deletados
- 18 MDs unicos + 11 obsoletos arquivados em .archive/

### Fase 3: Auditoria .claude/ (correcao integral) - CONCLUIDA
9 correcoes aplicadas:

1. **COSMOVISAO.md** - 4 typos corrigidos (funcionae, cosvoisao, Suira, construcciona)
2. **LIDERANCA_GOVERNANCE.md** - 2 corrupcoes encoding corrigidas (Comportameeec, texto truncado)
3. **INDEX_CLAUDE.md** - Camada 5/6 reescritas (arquivos reais vs arquivados), contagem 17 agentes, typos "reflexions"
4. **COHERENCE_MANIFEST.md** - 3 agentes adicionados (bibliotecario, guardian, seo), checkboxes marcados, v1.1
5. **project-context.md** - "Estado Atual" reescrito (Next.js 16, Prisma 5.22, estrutura canonica), Handoff Log condensado (20+ entradas para 3 ativas), refs a AGENT_MEMORY_POLICY.md e INSTRUCTION_HIERARCHY.md removidas (nao existem)
6. **DISTRIBUTION_MATRIX.md** - MANUAL_WORKFLOW_AGENTES.md (inexistente) substituido por GLOBAL_INSTRUCTIONS.md
7. **settings.local.json** - Path cleanup.ps1 corrigido para scripts/maintenance/
8. **GLOBAL_INSTRUCTIONS.md** - Next 15 corrigido para Next.js 16, @dispatcher duplicado removido da tabela, contagem 17 agentes
9. **Verificacao** - AGENT_MEMORY_POLICY.md e INSTRUCTION_HIERARCHY.md confirmados como inexistentes

## SISTEMA DE AGENTES

- 17 agentes definidos em .claude/agents/ (auditor, bibliotecario, curator, dispatcher, guardian, implementor, maverick, organizador, pesquisador, planner, prompter, securitychief, seo, sequenciador, skillmaster, validador, verifier)
- 15 agent-memory diretorios (auditor, chico, curator, dispatcher, implementor, maverick, organizador, pesquisador, planner, prompter, securitychief, sequenciador, skillmaster, validador, verifier)
- 3 agentes SEM agent-memory: bibliotecario, guardian, seo (serao criados quando executarem tarefa real)
- Triade: Raphael (CEO) + @maverick (Vice Intelectual) + Chico (GitHub Copilot/Gemini - Administrador)

## HIERARQUIA DOCUMENTAL .claude/ (4 camadas)

0. COSMOVISAO.md - Fundacao filosofica
1. CLAUDE.md - Identidade de Raphael
2. GLOBAL_INSTRUCTIONS.md - Identidade de Chico + regras operacionais
3. project-context.md - Decisoes, pipeline, estado atual
4. LIDERANCA_GOVERNANCE.md - Triade, escalacao

Documentos operacionais: INDEX_CLAUDE.md, COHERENCE_MANIFEST.md, DISTRIBUTION_MATRIX.md, ESTADO_ARTE_APRENDIZADO_GENERATIVO.md, ETHICAL_PLAYBOOKS.md, HYBRID_BRAIN_ARCHITECTURE.md, HOLOGRAPHIC_ROUTING_PROTOCOL.md, VALIDATION_FRAMEWORKS.md, LOAD_PREDICTION_MODEL.md, DECISION_AUDIT_TRAIL.md

Config: settings.local.json, autonomy.json

## O QUE NAO FOI FEITO (pendentes para futuro)

- Pipeline de agentes nunca foi testada end-to-end (field test)
- Testes unitarios de icm.ts (removidos, aguardando config de Vitest)
- Frontend: Tailwind vs CSS modules nao decidido
- Content: material educacional nao iniciado
- Remote git: nenhum remote configurado (GitHub)
- 3 agent-memory faltantes (bibliotecario, guardian, seo)
- GLOBAL_INSTRUCTIONS.md e project-context.md ainda tem redundancia significativa entre si (pipeline descrita em ambos)
- .claude/MEMORY.md (do projeto, nao a minha) esta vazio - nunca foi populado por agentes

## DECISOES TECNICAS IMPORTANTES

- Prisma 5.22 (nao 7.x) porque Node 22.4 nao suporta Prisma 7+ (requer Node 22.12+)
- SQLite como banco local (dev.db, tags armazenadas como JSON.stringify)
- import.meta.vitest removido de icm.ts (incompativel sem config Vitest)
- OneDrive causa EPERM em operacoes de arquivo - workaround: deletar dirs locked antes de operar
