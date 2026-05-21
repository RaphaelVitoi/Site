# Mapa de Rotas do Frontend (Poker Racional)

> **CANONICO.** Qualquer agente (Claude, Gemini, ou outro) que edite rotas DEVE consultar e atualizar este arquivo.
> Rotas que nao estao aqui nao existem. Nao criar rotas novas sem adicionar aqui primeiro.

## Stack

- Next.js 14 (App Router)
- Cada rota = pasta com `page.tsx` dentro de `frontend/src/app/`
- Rotas dinamicas usam `[slug]` e consomem Prisma (SQLite)

## Arvore de Rotas

```text
/                              Landing page (home)
/quem-sou                      Sobre Raphael Vitoi
/dashboard                     Dashboard do usuario
/simulador                     Simulador Mestre ICM (Motor v4.1)
/simulador/gto-cfr             Laboratorio GTO AI (CFR e A*)
/login                         Página de autenticação/login
/quiz                          Quiz e validação de conhecimento

/aulas/                        Conteudo educacional ICM
  icm-masterclass/             Aula principal: Geometria do Risco
  icm-pos-flop/                Aula 1.2: Aprofundamento ICM pos-flop
  conceitos-icm/               Glossario formal do framework ICM
  # voce-aprende-poker-errado/   Artigo: A Amortizacao da Edge (movido para /biblioteca)
  leitura-icm/                 Whitepaper completo ICM
  [slug]/                      Aulas dinamicas via Prisma (CMS)

/biblioteca/                   Artigos/ensaios aprofundados e técnicos
  page.tsx                     Index da biblioteca
  [slug]/                      Artigos e ensaios dinamicos via Prisma (CMS)
  voce-aprende-poker-errado/   Artigo: A Amortizacao da Edge (com simulador)
  downward-drift-sota/         Artigo: Downward Drift e Contracao de Range sob ICM (com Laboratorio)
  entendendo-o-icm-e-suas-heuristicas/ Heuristicas ICM (conteudo original)
  exegese-da-decisao/          Exegese da Decisao
  hermeneutica-blefe/          Hermeneutica do blefe
  motor-diluicao/              Motor de diluicao
  paradoxo-valuation/          Paradoxo da valuation
  axioma-ev-fold-dinamico/     Axioma do EV Fold Dinamico
  falacia-equilibrio-pedagogia/ Falacia do Equilibrio
  fator-psi-maluquice-humana/  Fator Psi (Maluquice Humana)
  geometria-do-risco/          Geometria do Risco
  heuristica-icm-pos-flop-aula/ Heuristica ICM Pos-Flop
  hierarquia-da-decisao/        Hierarquia da Decisao SOTA (Axiomas VITOI)
  insolvencia-das-pot-odds/    Insolvencia das Pot Odds
  laboratorio-chipev-vs-icmev/ Laboratorio ChipEV vs ICMev
  manifesto-sota-axiomas/      Manifesto SOTA: Axiomas
  psicologia-high-stakes/      Psicologia High Stakes
  risco-de-ressurreicao/       Risco de Ressurreicao
  teoria-da-perspectiva/       Teoria da Perspectiva
  teto-equidade-river-icm/     Teto de Equidade River ICM
  toy-games/                   Toy Games (Predator Mode)
  estruturas-de-torneio/       Estruturas de Torneio (Framework VITOI)
  nos-de-calibragem/           Nós de Calibragem (Âncora SOTA)
  estado-da-arte/              Estado da Arte ICM 2025 (Originalmente em /artigos)
  smart-sniper/                Protocolo Smart Sniper (Originalmente em /artigos)
  validacao-smart-sniper/      Validacao cientifica do Smart Sniper (Originalmente em /artigos)

/templo/                       Area de Inteligência e Hub AGN
  analytics/                   Dashboard analitico
  gemma/                       Oráculo de Borda (Portal Direto @gemma4)

/auth/callback                 OAuth Callback integration
/api/og/                       OG Image generator (social sharing)
/api/telemetry                 Telemetry metrics ingestion
/api/rag                       Cognitive memory retrieve/store (RAG)
/api/profile                   User Profile data endpoints
/api/predictive-profile        Telemetry-based predictive stats
/api/content/[slug]            CMS dynamically retrieved lesson/article content
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
