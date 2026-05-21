---
name: Reorganizacao global do projeto 2026-03-15
description: Reorganizacao completa da estrutura de diretorios e componentes do projeto inteiro (raiz + frontend). Snapshot definitivo pos-reorganizacao.
type: project
---

Reorganizacao completa executada em 2026-03-15. Frontend + raiz.

**Why:** Estrutura plana com 20+ scripts na raiz, componentes sem agrupamento, arquivos mortos, duplicatas, referencias quebradas.
**How to apply:** Usar esta estrutura como referencia para qualquer operacao futura. Scripts movidos usam `$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path` para resolver a raiz.

## Estrutura final da RAIZ

```
Site/
├── _env.ps1                    # Config global (anchor de $PSScriptRoot)
├── Agent-TaskManager.psm1      # Kernel do sistema de tarefas
├── Agent-Autopoiesis.psm1      # Loop de vida artificial
├── do.ps1                      # CLI inteligente (entry-point principal)
├── task_executor.py             # Worker Python (Pydantic)
├── memory_rag.py                # Backend RAG (bibliotecario)
├── GLOBAL_INSTRUCTIONS.md       # Instrucoes do projeto
├── README.md
├── .gitignore, .aiexclude, .clauderules, .cursorules
│
├── data/                        # JSON configs do Cortex
│   ├── intentmap.json           # Mapeamento agente -> regex
│   ├── intents.json             # Intents raw
│   ├── synonyms.json            # Sinonimos por agente
│   └── aphorisms.json           # Easter eggs do @maverick
│
├── scripts/
│   ├── cli/       (10)  # ask, dashboard, dashboard_health, dashboard_queue, nexus_backup, nexus_hub, nexus_read, nexus_status, serve, status
│   ├── ops/       (5)   # start_life, start_worker, start_frontend, stop_worker, monitor_worker
│   ├── control/   (3)   # autonomy_full, autonomy_partial, autonomy_off
│   ├── setup/     (4)   # check-cortex, Setup-NexusProfile, Set-AgentEnvironment, create_startup_shortcut
│   ├── init/      (9)   # init_article_page, init_cli_innovation, init_curator_copy, init_epic_blog, init_epic_poker, init_home_build, init_icm_calc_build, init_maverick_pedagogy, init_seed_db, init_site_build
│   ├── utils/     (12)  # apply_sentinel_strategy, create_agent_documentation, deploy_v1, map_territory, run_maverick_sentinel, run_organizador_maintenance, run_organizer, safeguard_system, show_stats, skill-bridge, submit-idea, upgrade_ecosystem
│   ├── maintenance/ (6) # backup_config, clean_backups, cleanup, cleanup_task_results, delete_old_backups, queue_maintenance
│   └── tests/     (8)   # stress_test, test_batch, test_cleanup, test_implementor_poker, test_kernel_injection, test_multithread, test_post_surgery, test_system_stress
│
├── frontend/                    # Next.js 16.1.6 + React 19 + Tailwind v4 + Prisma 5.22
│   ├── next.config.ts           # Config vazio (pronto para futuras configs)
│   ├── package.json             # Inclui prebuild (limpa .next antes de build)
│   ├── prisma/                  # Schema + seed + dev.db (SQLite)
│   ├── public/                  # Assets estaticos + legacy/ + simulador/
│   └── src/
│       ├── app/                 # 10 rotas (App Router)
│       │   ├── layout.tsx, globals.css, page.tsx, page.test.tsx
│       │   ├── aula-icm/page.tsx
│       │   ├── aula-1-2/page.tsx
│       │   ├── biblioteca/page.tsx
│       │   ├── leitura-icm/page.tsx
│       │   ├── psicologia-hs/page.tsx + [slug]/page.tsx
│       │   ├── quem-sou/page.tsx
│       │   └── tools/icm/page.tsx     # Calculadora ICM interativa
│       ├── components/
│       │   ├── layout/   Header.tsx, Footer.tsx
│       │   ├── content/  ArticleHeader.tsx, CodeBlock.tsx, PsychologyHub.tsx
│       │   └── icm/      ICMCalculator.tsx, SimuladorICM.tsx
│       └── lib/           prisma.ts, icmEngine.ts, handParser.ts
│
├── content/                     # Material fonte (artigos, aulas, pesquisa, interativo)
├── docs/
│   ├── architecture/            # SPECs, PRDs, frontend.md
│   ├── reports/                 # Health checks, sentinela, KPIs
│   └── tasks/                   # Historico de tasks (aula-icm-rp, etc.)
│
├── queue/                       # tasks.json + archive/
├── logs/                        # task_log.md, tasks_archived.json
├── .claude/                     # AI config (agentes, memoria, settings, autonomy)
│   ├── agents/                  # 16 agentes (.md cada)
│   ├── agent-memory/            # MEMORY.md por agente
│   ├── .archive/                # Docs obsoletos arquivados
│   └── (13 MDs de governanca + settings.local.json + autonomy.json)
├── .vscode/                     # settings.json, mcp.json, extensions.json
├── .backups/                    # Snapshots locais
├── .tmp/                        # Temporarios
└── .venv/                       # Python venv
```

## Operacoes executadas nesta sessao

### 1. SonarQube S2004 (SimuladorICM.tsx)
- `loadScript` e `loadMotorScripts` extraidos para escopo de modulo
- Nesting reduzido de 5+ para 2 niveis dentro do useEffect
- Mesmo comportamento funcional (carregamento sequencial apos ApexCharts)

### 2. OneDrive EPERM (.next/)
- Junction tentado mas incompativel com Turbopack (resolucao de modulos quebra)
- Solucao final: `prebuild` script no package.json que executa `cmd /c rmdir /s /q .next`
- next.config.ts criado (vazio, pronto para futuras configs)
- Usar `npm run build` ao inves de `npx next build`

### 3. Frontend reorganizado
- 7 componentes movidos para subdiretorios semanticos (layout/, content/, icm/)
- 5 arquivos mortos removidos: stubs layout/Header+Footer, ui/Button, index.ts vazio, lib/icm.ts duplicata
- Rota /tools/icm criada (landing e Header linkavam para ela mas nao existia)
- 6 imports normalizados de relativos para @/ alias
- Import do biblioteca/page.tsx: `../../components/CodeBlock` → `@/components/content/CodeBlock`

### 4. Raiz reorganizada
- 20 scripts movidos da raiz para scripts/ (cli, ops, control, setup)
- 4 JSONs movidos para data/
- prisma/ raiz removido (duplicata obsoleta do frontend/prisma/)
- .claude/task_results/ removido (30 arquivos)
- queue/*.corrupt* removidos
- docs/ vazios removidos (MEMORY.md, project-context.md, STRUCTURE_SRC.md)
- docs/PRD.md → docs/architecture/PRD_TOY_GAMES.md

### 5. Referencias corrigidas (42 scripts + do.ps1)
- Todos scripts em scripts/*/ usam: `$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path`
- do.ps1: JSONs apontam para data/, check-cortex para scripts/setup/
- _env.ps1: adicionados paths Data, Scripts, Frontend
- Setup-NexusProfile.ps1: todos 16 aliases atualizados para novos paths
- skill-bridge.ps1: path hardcoded substituido por $ProjectRoot
- scripts/init/*.ps1: bug pre-existente de $PSScriptRoot corrigido

## Build
- Frontend: 10 rotas (/, aula-icm, aula-1-2, biblioteca, leitura-icm, psicologia-hs, psicologia-hs/[slug], quem-sou, tools/icm, _not-found)
- 0 erros TypeScript, compilacao ~2.5s

## Acao pendente do usuario
- Rodar `.\scripts\setup\Setup-NexusProfile.ps1` para atualizar aliases no $PROFILE do PowerShell

## Seguranca (flag)
- _env.ps1 contem API keys hardcoded (GEMINI_API_KEY, ANTHROPIC_API_KEY). Nao mover para git publico.
