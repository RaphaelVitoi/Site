---
name: Prompt de Continuidade V34
description: Sessao 20260327b - Auditoria expandida. Limpeza raiz, reestruturacao routing frontend (/aulas/*), auditoria backend completa, memorias limpas.
type: project
---

# Continuidade - Sessao 20260327 V34

## O que aconteceu nesta sessao (continuacao da V33)

### Limpeza da raiz (A-01 e A-02 resolvidos)
- 6 arquivos lixo deletados: `_write_probe_root.txt`, `hello_sota.py`, `settings.py`, `settings.json`, `SESSION_LOG_20260327-020735.md`, `flowchart.svg`
- `caminho/` (placeholder de teste) deletado
- `.cerebro/page.tsx` (blog orfao) deletado
- `node_modules/` orfao deletado (55MB recuperados)

### Reestruturacao de routing do frontend
Rotas soltas na raiz do App Router movidas para hierarquia coerente:
- `/aula-icm` → `/aulas/icm-masterclass` (+ page.module.css)
- `/aula-1-2` → `/aulas/icm-pos-flop`
- `/conceitos-icm` → `/aulas/conceitos-icm`
- `/leitura-icm` → `/aulas/leitura-icm`

### tools/ inteiro eliminado
- `tools/icm` → `archive/legacy_icm_components/tools-icm/`
- `tools/simulador` → `archive/legacy_icm_components/tools-simulador/`
- `tools/masterclass` e `tools/toy-games` (redirects orfaos) deletados
- Pasta `tools/` removida

### Links internos atualizados (9 arquivos)
Header.tsx, layout.tsx, page.tsx (home), icm-masterclass, icm-pos-flop, conceitos-icm, leitura-icm, templo/analytics, artigos/estado-da-arte, biblioteca/motor-diluicao. Comentarios PATH atualizados.

### HandSimulator removido do MasterSimulator
Lazy import e bloco de render removidos (painel nunca existiu). Botao removido do TOOL_BUTTONS.

### DownwardDriftSimulator + IcmUniversalLab arquivados
Movidos para `archive/legacy_icm_components/`. Importam funcoes que nao existem no motor atual.

### route.tsx (OG Image) posicionado
Movido da raiz para `frontend/src/app/api/og/route.tsx` (rota correta do Next.js).

### ROUTES.md criado
`frontend/ROUTES.md` - mapa canonico de rotas. Regras explicitas para agentes (Claude e Gemini). Arvore completa, historico de rotas removidas, regras de routing.

### Auditoria backend completa
Todos os componentes Python e PowerShell auditados:

| Componente | Status |
|---|---|
| task_executor.py (3409 linhas) | FUNCIONAL - syntax OK, imports OK |
| core/arbitrator.py | FUNCIONAL - DAG + scoring |
| database/queue_manager.py | FUNCIONAL (BOM removido) |
| core/config.py | FUNCIONAL - 18 agentes |
| core/schemas.py | FUNCIONAL - Pydantic Task |
| memory_rag.py | FUNCIONAL - ChromaDB + hibrido |
| do.ps1 (CLI) | FUNCIONAL - sem refs quebradas |
| 10 scripts criticos | FUNCIONAL |
| api/server.py | DELETADO (legacy morto, zero refs) |

### Docs .cerebro/ verificados
- `MODUS_OPERANDI.md` estava 0 bytes → restaurado do git (4665 bytes)
- Todos os demais existem e com conteudo integro
- `autonomy.json` = `{"mode": "full"}` (minimalista mas funcional)

### Memorias limpas
- 10 arquivos orfaos deletados (V4-V9, V21, 3 historicos)
- MEMORY.md: 68 entradas, zero links quebrados
- Agent memories (18 diretorios): todos com conteudo valido

### BOM removido
- `database/queue_manager.py` tinha BOM UTF-8 → removido

## Estado tecnico atual

### Frontend
- **Build:** `tsc --noEmit` = ZERO ERROS
- **Routing:** Hierarquia limpa sob `/aulas/*`, `/biblioteca/*`, `/artigos/*`
- **Legados:** Todos em `archive/legacy_icm_components/`
- **ROUTES.md:** Mapa canonico criado

### Backend
- **Orquestrador:** task_executor.py funcional (unico servidor, aiohttp)
- **DAL:** queue_manager.py com ACID + WAL
- **Arbitragem:** UniversalArbitrator com DAG + teoria de filas
- **RAG:** memory_rag.py com ChromaDB
- **CLI:** do.ps1 integrado

### Docs
- `.cerebro/` integro (MODUS_OPERANDI restaurado)
- INDEX_CEREBRO.md descreve estrutura de 6 camadas
- Agentes: 18 specs + 18 memorias

## Pendentes para proxima sessao

### P1: Conteudo das aulas movidas
As 4 aulas movidas para `/aulas/*` mantem conteudo interno intacto mas podem ter links/refs internas que apontam para caminhos antigos dentro do proprio texto (nao no codigo - esses foram corrigidos).

### P2: psicologia-hs routing
`/psicologia-hs/` e `/psicologia-hs/[slug]/` sao candidatas a mover para `/artigos/psicologia-hs/` para consistencia. Nao foi feito nesta sessao.

### P3: biblioteca/[slug] inexistente
O Next.js types referencia `biblioteca/[slug]/page.js` que nao existe. Pode ser rota dinamica planejada mas nunca implementada.

### P4: memory/ na raiz
62 arquivos em `memory/` na raiz. Possivel legado/duplicata do sistema de memorias do Claude. Avaliar.

### P5: Refatoracao futura (baixa prioridade)
- task_executor.py (3409 linhas) candidato a modularizacao
- do.ps1 (545 linhas) candidato a quebra em modulos

## Feedback registrado
- Hierarquia de modelos atualizada: Raphael + Claude = mente intelectual, Gemini = executora qualificada. Docs devem ser briefings operacionais claros para ela.

## Commit pendente
Nada foi commitado nesta sessao. Acumulado significativo de mudancas.
