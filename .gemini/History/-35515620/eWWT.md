# Mapa de Rotas do Frontend (Poker Racional)

> **CANONICO.** Qualquer agente (Claude, Gemini, ou outro) que edite rotas DEVE consultar e atualizar este arquivo.
> Rotas que nao estao aqui nao existem. Nao criar rotas novas sem adicionar aqui primeiro.

## Stack

- Next.js 16 (App Router)
- Cada rota = pasta com `page.tsx` dentro de `frontend/src/app/`
- Rotas dinamicas usam `[slug]` e consomem Prisma (SQLite)

## Arvore de Rotas

```text
/                              Landing page (home)
/quem-sou                      Sobre Raphael Vitoi
/dashboard                     Dashboard do usuario
/simulador                     Simulador Mestre ICM (Motor v4.1)
/simulador/gto-cfr             Laboratorio GTO AI (CFR e A*)

/aulas/                        Conteudo educacional ICM
  icm-masterclass/             Aula principal: Geometria do Risco
  icm-pos-flop/                Aula 1.2: Aprofundamento ICM pos-flop
  conceitos-icm/               Glossario formal do framework ICM
  # voce-aprende-poker-errado/   Artigo: A Amortizacao da Edge (movido para /biblioteca)
  leitura-icm/                 Whitepaper completo ICM
  [slug]/                      Aulas dinamicas via Prisma (CMS)

/blog/                         Blog SOTA (Padroes de Engenharia, Teoria)
  page.tsx                     Index dinamico do blog
  [slug]/                      Artigos dinamicos via Prisma (CMS)

/biblioteca/                   Artigos/ensaios aprofundados
  page.tsx                     Index da biblioteca
  [slug]/                      Artigos e ensaios dinamicos via Prisma (CMS)
  voce-aprende-poker-errado/   Artigo: A Amortizacao da Edge (com simulador)
  downward-drift-sota/         Artigo: Downward Drift e Contracao de Range sob ICM
  entendendo-o-icm-e-suas-heuristicas/ Heuristicas ICM (conteudo original)
  hermeneutica-blefe/          Hermeneutica do blefe
  motor-diluicao/              Motor de diluicao
  paradoxo-valuation/          Paradoxo da valuation

/artigos/                      Artigos tecnicos/academicos
  estado-da-arte/              Estado da Arte ICM 2025
  smart-sniper/                Protocolo Smart Sniper
  validacao-smart-sniper/      Validacao cientifica do Smart Sniper

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
