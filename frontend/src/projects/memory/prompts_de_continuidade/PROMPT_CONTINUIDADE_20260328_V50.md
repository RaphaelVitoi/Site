---
name: Prompt de Continuidade V50 - 2026-03-28
description: Fator R + Edge Relativa + Tier Shift ao Perder implementados. Late registration ICM quantificado e registrado. Zero erros TS.
type: project
---

# Prompt de Continuidade V50 — 2026-03-28

## Commits desta sessão

| Hash | Descrição |
|------|-----------|
| `6108adc` | refactor: biblioteca estática + icm-masterclass LessonHeader/ContentFooter |
| `98948db` | fix: [slug]/page.tsx migra para filesystem, remove Prisma |
| `7bcab13` | fix: zero erros TypeScript no simulador e ResurrectionRiskSimulator |
| `1f82e44` | feat: Fator R + Edge Relativa + Tier Shift ao Perder no PerspectivePanel |
| _(pendente)_ | docs: late registration ICM + V50 prompt + memória |

## O que foi feito

### Conteúdo ([slug]/page.tsx, biblioteca, icm-masterclass)
- `[slug]/page.tsx`: migrado de Prisma (modelo inexistente) para filesystem `docs/epics/<slug>.md`. Suporta frontmatter YAML e fallback H1. Usa `React.cache`.
- `biblioteca/page.tsx`: removida dependência Prisma, lista estática de artigos
- `icm-masterclass/page.tsx + .module.css`: adota LessonHeader/ContentFooter, remove blocos descontinuados

### Correções TS (zero erros)
- `MasterSimulator.tsx`: `ftPrizes` → `scenario.prizes` (campo nunca existiu)
- `ResurrectionRiskSimulator.tsx`: `<label>` → `<Label>` Recharts, formatter tipado

### Motor (`perspectiva.ts`) — teoria nova aplicada
- `EsperancaInput.realizationFactor?: number` (default 1)
- `EsperancaResult`: `esperancaRealizada`, `esperancaRealizadaPct`, `realizationFactor`
- `EsperancaResult`: `loseTierShift`, `loseTierDirection`
- Cálculo: `esperancaRealizada = P(win)×ΔWin×R + P(lose)×ΔLose` (lose não é descontado por R — perda é direta)

### Painel (`PerspectivePanel.tsx`) — teoria nova + ajustes
- **Fator R slider** [0.5–1.0], cor amber quando R < 0.85
- **Linha "Perspectiva Realizada"** aparece apenas quando R < 0.99
- **Fix bug**: fold baseline mostrava `winEquityPct` (equity absoluta pós-fold) → agora mostra `esperanca EV` (delta, consistente com linha de Esperança)
- **Widget "Tier Shift ao Perder"** independente do "ao Ganhar"
- **`buildInsight` reescrito** com 5 camadas: decisão principal, Fator R (quando relevante), Edge Relativa por tier (contextualiza ferramentas disponíveis), tier shifts (win e lose), externalidade, assimetria

### Teoria nova registrada — Late Registration ICM
- Documento de mentor desconhecido absorvido, analisado, corrigido (confusão FT removida)
- Memorizado em: `memory/reference_late_registration_icm_impact.md`
- Backup no projeto: `docs/research/late_registration_icm_impact.md`
- Achados centrais:
  - Prêmio ICM do late entry: +4.7% (campo 50% restante) a +16% (campo 1/3 restante)
  - Dilução uniforme ~0.28% por stack, proporcional à fatia do prize pool (não é dinâmica de FT)
  - Threshold razoável: fechar reg quando avg stack ≈ 2x starting stack (~5% prêmio)
  - Conexão com EV_fold positivo (ICM), Externalidade negativa, Table Draw/Análise Precursiva

## Estado atual do simulador

- Zero erros TypeScript
- Motor: Fator R implementado, loseTierShift exposto
- Painel: 3 camadas E·P·E + tooltips + Fator R + Tier Shift duplo + Edge Relativa contextual
- EV fold como threshold correto (não zero)
- BBs como unidade padrão

## Pendências conhecidas

### Simulador
- PKO: teoria em revisão. Modelo atual = `effectiveRp × (1 − pkoValue)`. Não captura assimetria de bounty nem prêmio positivo por eliminação.
- Fator R: atualmente apenas display/UX. Não propaga para `buildInsight` threshold (comparação Esperança vs fold usa `esperancaPct` bruta, não `esperancaRealizadaPct`). Decisão intencional por ora — avaliar se faz sentido mudar o threshold também.

### Teoria (não implementar sem autorização)
- Quantificação do EV_fold(ICM) positivo com payjumps iminentes + late entries
- FGS expandido com variáveis de iminência de blinds e Table Draw
- Fator psicológico Ψ como variável bayesiana quantificável

### Conteúdo
- `frontend/src/app/aulas/[slug]/page.tsx`: lê de `docs/epics/<slug>.md` via filesystem. Nenhum arquivo .md de aula existe ainda nesse formato — rota retorna 404 até conteúdo ser criado.
