# Mapa de Rotas do Frontend (Poker Racional)

> **CANONICO.** Qualquer agente (Claude, Gemini, ou outro) que edite rotas DEVE consultar e atualizar este arquivo.
> Rotas que nao estao aqui nao existem. Nao criar rotas novas sem adicionar aqui primeiro.

## Stack

- Next.js 14 (App Router)
- Cada rota = pasta com `page.tsx` dentro de `frontend/src/app/`
- Rotas dinamicas usam `[slug]` e consomem Prisma (SQLite)

## Arvore de Rotas (Next.js 16.2 App Router)

```text
/                              Landing page (home)
/(public)/quem-sou              Sobre Raphael Vitoi
/(user)/dashboard               Dashboard do usuario (vitoi.ts integration)
/(lab)/simulador               Simulador Mestre ICM (Motor v7.0 GOLD)
/(lab)/simulador/gto-cfr       Laboratorio GTO AI (CFR e A*)
/(auth)/login                   Página de autenticação/login
/(lab)/quiz                    Quiz e validação de conhecimento

/(public)/aulas/               Conteudo educacional ICM
  icm-masterclass/             Aula principal: Geometria do Risco
  icm-pos-flop/                Aula 1.2: Aprofundamento ICM pos-flop
  conceitos-icm/               Glossario formal do framework ICM
  leitura-icm/                 Whitepaper completo ICM
  [slug]/                      Aulas dinamicas via Prisma (CMS)

/(public)/biblioteca/          Artigos/ensaios aprofundados e técnicos
  [slug]/                      Artigos e ensaios dinamicos via Prisma (CMS)
  ... (lista de artigos mantida)

/(lab)/templo/                 Area de Inteligência e Hub AGN
  analytics/                   Dashboard analitico
  gemma/                       Oráculo de Borda (Portal Direto @gemma4)

/(auth)/callback               OAuth Callback integration
/api/og/                       OG Image generator (social sharing)

/api/v1/telemetry              Telemetry metrics ingestion (SOTA v7.0 GOLD)
/api/v1/rag                    Cognitive memory retrieve/store (RAG)
/api/v1/profile                User Profile data endpoints
/api/v1/predictive             Telemetry-based predictive stats
/api/v1/content/[slug]         CMS dynamically retrieved lesson/article content
```

## Regras de Routing

1. **Aulas** vivem em `/aulas/`. Nao criar aulas na raiz do app.
2. **Artigos e Ensaios** vivem em `/biblioteca/`.
3. **Ferramentas interativas** (simuladores, calculadoras) devem ser componentes dentro de aulas, nao rotas separadas.
4. **Redirects** nao devem existir como rotas. Se uma URL mudou, resolver via `next.config.ts` redirects.
5. **Rotas dinamicas** (`[slug]`) consomem `prisma.lesson.findUnique()` ou equivalente.

## Rotas Removidas (historico)

| Rota antiga | Destino | Motivo |
| --- | --- | --- |
| `/aula-icm` | `/aulas/icm-masterclass` | Reorganizacao hierarquica |
| `/aula-1-2` | `/aulas/icm-pos-flop` | Reorganizacao hierarquica |
| `/conceitos-icm` | `/aulas/conceitos-icm` | Reorganizacao hierarquica |
| `/leitura-icm` | `/aulas/leitura-icm` | Reorganizacao hierarquica |
| `/tools/simulador` | `/simulador` | Refatorado para Simulador Mestre (SOTA) |
| `/tools/icm` | Arquivado | Componente legado (IcmUniversalLab) |
| `/tools/masterclass` | Deletado | Redirect orfao |
| `/tools/toy-games` | Deletado | Redirect orfao |

## Componentes de Layout

- `layout.tsx` (raiz) - Layout global com Header + metadata
- `Header.tsx` - Navegacao principal (links atualizados para `/aulas/*`)
