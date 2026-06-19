---
name: Prompt de Continuidade V11
description: Estado pos-auditoria CHICO 2026-03-20. Correcoes de consistencia, limpeza massiva, 3 auditores em background.
type: project
---

# Prompt de Continuidade - V11 (2026-03-20)

## O que foi feito nesta sessao

### Correcoes de identidade e consistencia (17 agentes)
- chico.md reescrito (15 linhas esqueleticas para definicao completa)
- dispatcher.md criado (era fantasma sem arquivo de agente)
- sequenciador.md criado + agent-memory/sequenciador/MEMORY.md materializado
- architecter.md excluido (alias duplicado de architect)
- @seo fundido: responsabilidades absorvidas por @curator e outros agentes
- COHERENCE_MANIFEST.md reescrito v2.0 (17 agentes, zero fantasmas)
- INDEX_CEREBRO.md limpo (guardian/seo removidos, contagem corrigida)
- GLOBAL_INSTRUCTIONS.md atualizado (sequenciador+dispatcher na arquitetura, tabela expandida)
- project-context.md corrigido (16 para 17 entidades)
- SESSION_ANCHOR_20260316.md corrigido (18 para 17)

### Contagem canonica de agentes: 17
- 7 pipeline linear: architect, pesquisador, prompter, planner, auditor, implementor, verifier
- 4 consultivos: curator (absorveu SEO), validador, securitychief, bibliotecario
- 2 super-agentes: maverick (intelectual), chico (administrativo)
- 3 operacionais: organizador, skillmaster, sequenciador
- 1 entrada: dispatcher

### Limpeza executada
- 6 arquivos vazios (0 bytes) deletados
- Duplicatas raiz deletadas (MasterSimulator.tsx, PerformanceChart.tsx, route.ts) - backup em .backups_sota/
- Duplicatas .cerebro/ deletadas (MasterSimulator.tsx, icmEngine.ts, PerformanceChart.tsx)
- 6 cascas de 2 bytes deletadas (CORRECAO_*, SESSION_SNAPSHOT_*, PROMPT_V2/V3)
- .cerebro/stats/ e .cerebro/backups/ vazios deletados
- __pycache__ do projeto limpos

### 3 auditores lancados em background (podem ter terminado)
1. Estrutura raiz + scripts + dados
2. Frontend Next.js completo
3. .cerebro/ + documentacao + agent system

## PENDENCIAS PRIORITARIAS (proxima sessao)

### P0 - Consolidar auditorias
- Verificar se os 3 auditores terminaram e consolidar relatorios
- Agir sobre achados criticos

### P1 - Restaurar conteudo educacional do archive/
- 9 legacy pages (artigos/, biblioteca/, aula-1-2/, leitura-icm/) para frontend/src/app/
- RiskGeometryMasterclass.tsx (ouro educacional) para integracao no simulador
- engine/page.tsx (Guia Motor ICM) mover de components/ para app/ como rota real

### P2 - Achados do auditor .cerebro/docs (resolvidos nesta sessao)
- LIDERANCA_GOVERNANCE.md atualizado (14 para 17 agentes em todas ocorrencias)
- INDEX_MESTRE.md corrigido (16 para 17 entidades)
- SPEC.md e SPEC_ROTEAMENTO_DB.md movidos de .cerebro/ para docs/architecture/
- PRD_SIMULADOR_ICM.md (2 bytes vazio) deletado

### P2 - Verificacoes restantes
- Dirs Python (api/, core/, database/, engine/) - backend NEXUS, parecem funcionais
- .aiexclude e .gitignore - garantir exclusoes corretas
- Criar docs/INDEX.md (topologia das subpastas)
- Adicionar MODUS_OPERANDI.md ao roteiro INDEX_CEREBRO.md
- Auditor frontend pode ter achados adicionais

### P2 - Achados do auditor raiz/scripts (resolvidos nesta sessao)
- @sequenciador adicionado a routing_map.json (fast_operations) e intentmap.json
- invoke_daily_report.ps1 movido para scripts/routines/
- data/intents.json legado arquivado em archive/intents_legacy.json

### P2 - Achados pendentes do auditor raiz/scripts (proxima sessao)
- Agent-TaskManager.psm1 deletado mas referenciado em scripts (run_organizer.ps1 etc) - decidir: restaurar ou remover chamadas
- .backups_sota/ tem 266 MB de snapshots - avaliar compactacao ou limpeza
- node_modules/ na raiz (29 MB) pode ser redundante com frontend/node_modules/
- Symlinks frageis (.chroma_db e queue apontam para /c/Nexus_SOTA_Engines/Site/)
- Docx files na raiz (47 MB total) deveriam estar em content/ ou docs/research/

### P2 - Achados do auditor frontend (proxima sessao)
- Header.tsx referencia rotas que nao existem (/leitura-icm, /artigos/*, /biblioteca) - restaurar legacy pages resolve isso
- ~15-20% dead code em components (ArticleHeader, PsychologyHub, Footer, Header nao importados em nenhuma pagina)
- CodeBlock.tsx duplicado (content/ e simulator/ui/) - unificar
- frontend/public/docs/ duplica ~34 arquivos de docs/ raiz - considerar symlink ou build script
- Prisma schema tem models legados (Post, Category) nao usados
- IP local hardcoded em next.config.ts (192.168.2.120) - remover antes de deploy
- engine/page.tsx (143 linhas, Guia Motor ICM) esta em components/ mas deveria ser rota em app/
- content/interativo/toy_games_page.tsx orfao fora do build

### P3 - Deploy
- Deploy Vercel continua como prioridade (build 22 rotas OK)
- Remover IP local de next.config.ts antes de deploy

## Stack
Next.js 16, React 19, TypeScript 5.9, Tailwind 4, Prisma 5, SQLite, Python (ChromaDB RAG)

## Feedback registrado
- Claude e Gemini (ambas Pro tier) trabalham juntas. Edicoes devem ser auto-explicativas para o outro modelo.
