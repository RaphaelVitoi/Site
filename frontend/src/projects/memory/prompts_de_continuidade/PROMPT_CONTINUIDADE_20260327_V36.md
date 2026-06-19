---
name: Prompt de Continuidade V36
description: Sessao 20260327d - Agentes expandidos (18 perfis + 6 MEMORYs), ecossistema corrigido. Pendentes: routing_patterns + intentmap sync + agents_manifest.json V34 pendentes.
type: project
---

# Continuidade V36 - 20260327

## STATUS: COMMITS DA SESSAO

| Commit | Descricao |
|---|---|
| ba77f5a | Backend auditoria task_executor (V35) + Frontend routing /aulas/* (V34) |
| 311c68e | 18 perfis de agentes expandidos + 6 MEMORYs reescritas/expandidas |
| a2f3d25 | HOLOGRAPHIC_ROUTING_PROTOCOL reescrito, routing_map data corrigida, 17->18 agentes |

## O QUE FOI FEITO NESTA SESSAO

### Perfis de agentes (.cerebro/agents/*.md)
Todos os 18 agentes expandidos de 12 linhas para 35-50 linhas. Novo formato com secoes:
- Modo de Operacao (quando acionar, protocolo entrada/saida)
- Padrao e Filosofia
- Anti-Padroes
- Entrega Esperada
- Proposta Evolutiva

### MEMORYs reescritas/expandidas (.cerebro/agent-memory/*/MEMORY.md)
- @historian, @planner, @verifier: reescritas do zero (eram templates vazios ou corrompidos)
- @dispatcher, @bibliotecario: expandidas (1 linha/secao → conteudo real)
- @sequenciador: corrigida (declaracao de auto-extincao removida — agente permanece ativo)

### Ecossistema
- HOLOGRAPHIC_ROUTING_PROTOCOL.md: reescrito do zero (estava com codigo Python — corrompido)
  Cobre: principio holografico, pipeline harmonica, memoria individual/coletiva, autopoiese, fractalismo, mapa de comunicacao entre agentes
- routing_map.json: data corrigida (2023 → 2026)
- COHERENCE_MANIFEST.md + INDEX_CEREBRO.md: 17 → 18 agentes

### @sequenciador permanece ativo
Raphael confirmou. Papel distinto do task_executor.py: ele orquestra mecanicamente, o @sequenciador define a inteligencia de ordenacao.

## PENDENTES DESTA SESSAO (NAO CONCLUIDOS)

### P1 - CRITICO: Sincronizar routing_patterns
O task_executor.py linha 406 recalcula INTENT_MAP do agents_manifest.json, ignorando intentmap.json.
O intentmap.json tem patterns mais ricos que o manifesto — esses termos extras estao sendo desperdicados.

**Acao necessaria:**
1. Enriquecer routing_patterns no agents_manifest.json com termos extras do intentmap.json
2. Sincronizar intentmap.json para ser espelho exato do manifesto (ou deprecar)

Exemplos de enriquecimento necessario:
- @historian manifesto: "relatorio|produtividade|custo|analise de log|historico|performance"
  intentmap tem a mais: "metricas|tendencia|insights|dados"
- @bibliotecario manifesto: "rag|memori|historic|lembr|chroma|vetor|conhecimento|dados|informacao|contexto"
  intentmap tem a mais: "documentos"
- @chico manifesto: "sintese|consenso|democrat|harmonia|mediacao|conflito|orquestra|gerenc|infraestrutura|automacao|log|monitoramento|api"
  intentmap tem a mais: "sistema|admin"
- @maverick manifesto nao tem: "visao|futuro"
- @verifier manifesto: "test|bug|qa|falha|erro|quebr|repar|validar|funcional"
  intentmap: "test|bug|qa|falha|erro|quebr|repar" (faltam os ultimos 2 no intentmap)

### P2 - MEDIO: COHERENCE_MANIFEST.md incompleto na contagem
O COHERENCE_MANIFEST diz "17 agentes" em alguns lugares (ja corrigido os principais via sed),
mas pode ter referencias numericas adicionais. Verificar com grep detalhado.

### P3 - BAIXO: intentmap.json como fonte de verdade vs. manifesto
Decidir definitivamente: usar intentmap.json como fonte ou deprecar.
Se manter, task_executor.py linha 406 deve ser alterado para ler do arquivo ao inves de calcular.

## PENDENTES HERDADOS DA V34 (ainda nao tocados)

- P1-V34: Refs internas de texto nas aulas movidas (caminhos antigos no texto, nao no codigo)
- P2-V34: /psicologia-hs/ candidata a mover para /artigos/psicologia-hs/
- P3-V34: biblioteca/[slug]/page.js referenciado pelo Next.js types mas nao existe
- P4-V34: memory/ na raiz (62 arquivos) — avaliar se legado/duplicata
- P5: Modularizacao futura task_executor.py (3395 linhas) e do.ps1 (545 linhas)

## TECH STACK (referencia rapida)

- Backend: Python/aiohttp (task_executor.py), aiosqlite, ChromaDB, Pydantic
- Frontend: Next.js 14 App Router, TypeScript, Tailwind
- Providers LLM: Gemini (nativo, primario), OpenRouter (fallback), Anthropic (ultimo)
- Web search: Tavily (primario), Perplexity sonar (fallback, free tier)
- DB: SQLite WAL via QueueManager
- RAG: ChromaDB + all-MiniLM-L6-v2, busca hibrida BM25+vetorial

## ARQUITETURA DO ECOSSISTEMA (resumo para contexto rapido)

18 agentes com pipeline linear: @dispatcher → @architect → @planner → @pesquisador → @prompter → @auditor → @implementor → @verifier → @curator → @sequenciador → @historian

Agentes consultivos injetados por heuristicas: @maverick (estrategia), @securitychief (seguranca), @validador (matematica), @bibliotecario (contexto RAG)

Agentes de manutencao autonomos: @skillmaster (CRON), @organizador (homeostase), @historian (metricas)

Cada agente carrega: COSMOVISAO + GLOBAL_INSTRUCTIONS + project-context + agents_manifest + sua MEMORY.md + RAG coletivo semantico
