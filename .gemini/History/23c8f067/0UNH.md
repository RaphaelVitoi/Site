# Mapa de Rotas do Frontend (Poker Racional)

> **CANONICO.** Qualquer agente (Claude, Gemini, ou outro) que edite rotas DEVE consultar e atualizar este arquivo.
> Rotas que nao estao aqui nao existem. Nao criar rotas novas sem adicionar aqui primeiro.

## Stack

- Next.js 16 (App Router)
- Cada rota = pasta com `page.tsx` dentro de `frontend/src/app/`
- Rotas dinamicas usam `[slug]` e consomem Prisma (SQLite)

## Arvore de Rotas

```
/                              Landing page (home)
/quem-sou                      Sobre Raphael Vitoi

/aulas/                        Conteudo educacional ICM
  icm-masterclass/             Aula principal: Geometria do Risco
  icm-pos-flop/                Aula 1.2: Aprofundamento ICM pos-flop
  conceitos-icm/               Glossario formal do framework ICM
  leitura-icm/                 Whitepaper completo ICM
  [slug]/                      Aulas dinamicas via Prisma (CMS)

/biblioteca/                   Artigos/ensaios aprofundados
  page.tsx                     Index da biblioteca
  entendendo-o-icm.../         Heuristicas ICM (conteudo original)
  hermeneutica-blefe/          Hermeneutica do blefe
  motor-diluicao/              Motor de diluicao
  amortizacao-da-edge/         A Amortização da Edge em Stacks Curtos
  paradoxo-valuation/          Paradoxo da valuation

/artigos/                      Artigos tecnicos/academicos
  estado-da-arte/              Estado da Arte ICM 2025
  smart-sniper/                Protocolo Smart Sniper
  validacao-smart-sniper/      Validacao cientifica do Smart Sniper

/psicologia-hs/                Psicologia High Stakes
  page.tsx                     Index
  [slug]/                      Artigos dinamicos via Prisma

/templo/                       Area administrativa
  analytics/                   Dashboard analitico

/api/og/                       OG Image generator (social sharing)
```

## Regras de Routing

1. **Aulas** vivem em `/aulas/`. Nao criar aulas na raiz do app.
2. **Artigos** vivem em `/artigos/` (tecnico/academico) ou `/biblioteca/` (ensaios).
3. **Ferramentas interativas** (simuladores, calculadoras) devem ser componentes dentro de aulas, nao rotas separadas.
4. **Redirects** nao devem existir como rotas. Se uma URL mudou, resolver via `next.config.ts` redirects.
5. **Rotas dinamicas** (`[slug]`) consomem `prisma.lesson.findUnique()` ou equivalente.

## Rotas Removidas (historico)

| Rota antiga | Destino | Motivo |
|---|---|---|
| `/aula-icm` | `/aulas/icm-masterclass` | Reorganizacao hierarquica |
| `/aula-1-2` | `/aulas/icm-pos-flop` | Reorganizacao hierarquica |
| `/conceitos-icm` | `/aulas/conceitos-icm` | Reorganizacao hierarquica |
| `/leitura-icm` | `/aulas/leitura-icm` | Reorganizacao hierarquica |
| `/tools/simulador` | Arquivado | Componente legado (DownwardDriftSimulator) |
| `/tools/icm` | Arquivado | Componente legado (IcmUniversalLab) |
| `/tools/masterclass` | Deletado | Redirect orfao |
| `/tools/toy-games` | Deletado | Redirect orfao |

## Componentes de Layout

- `layout.tsx` (raiz) - Layout global com Header + metadata
- `Header.tsx` - Navegacao principal (links atualizados para `/aulas/*`)
