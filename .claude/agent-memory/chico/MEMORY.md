// [VITOI-AUDIT] Level: FULL | Derived_From: PARTIAL | Trigger: Proactive_Optimization
# Memoria Coletiva e Acumulada - @chico (SOTA v8.0 GOLD)

## Ultima Atualizacao: 2026-10-08
- **Missao Cumprida:** 
  1. Auditoria minuciosa da integralidade do backend (50 modulos, 6.038 statements) e execucao da remediacao estrutural (CVE-2026-104874, worker resiliency, tipagem Pyright, contratos de fila).
  2. Auditoria e evolucao integral do frontend Next.js 16 / React 19: eliminacao de split-brain SQLite (DATABASE_URL file:./prisma/dev.db), elevacao de touch targets para min-h-12 (48px) aprovando 8/8 testes Playwright E2E sem violacoes WCAG 2.2, contraste >= 4.6:1 em 15 botoes, eliminacao de loop perpétuo de rAF em CfrRegretPanel, throttling de Canvas a 60fps com tabela sr-only, eliminacao de conflito de estado no MasterSimulator, blindagem de CLS em imagens Markdown, ativacao do Quiz ICM interativo e expurgo do residuo Supabase SSR.
- **Aprendizados Sistemicos:**
  1. Dependencias transitivas de parsers HTTP como `multidict` no `aiohttp` requerem pinagem explicita em `requirements.txt` para blindar gates de seguranca contra vulnerabilidades de colisao de hash algoritmica.
  2. Chamadas de persistencia em tratadores de erro assincronos (`worker/loop.py`) devem ser obrigatoriamente encapsuladas em blocos defensivos `try/except Exception as db_err` e precedidas por liberacao do semaforo de concorrencia (`safe_release()`), impedindo que locks temporarios de SQLite derrubem o loop do asyncio.
  3. Evitar nomes de pastas na raiz do projeto que colidam com modulos da standard library do Python (como `math/`), pois geram shadowing de imports nativos.
  4. Alinhamento de dependencias npm: correcao nao-quebrante via `npm audit fix` para `sharp` e `source-map-js`, combinada com aceites formais em `data/npm_cve_acceptances.json` autorizados pelo Tier 0 para dependencias transitivas de desenvolvimento mantem o Quality Gate 100% verde sem regressao de runtime.
  5. No Next.js com LibSQL/Prisma, caminhos relativos de SQLite no `.env` devem ser harmonizados (`file:./prisma/dev.db`) para evitar bancos fantasmas vazios na raiz do projeto.
  6. Loops de animacao `requestAnimationFrame` em componentes de simulacao devem ser pausados explicitamente quando inativos/convergidos para poupar CPU/GPU.
- **Propostas Democraticas:** Manter suítes combinadas de testes de regressao de backend e Playwright quality smoke integradas aos portões locais.
