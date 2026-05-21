---
name: Prompt de Continuidade V31
description: Sessao 20260323 - Prizes FT calibrados (HRC real), effectiveSprData derivado, normalizeQuizData tipado, cenario Especulacao Assimetrica. 0 erros TS.
type: project
---

# Continuidade - Sessao 20260323 V31

## Commits desta sessao

- `a12e158` - sprData derivado via M-H, normalizeQuizData tipado, cenario Especulacao Assimetrica
- `8298cd2` - Prizes calibrados contra FT real (HRC 126p, TOTAL_POOL=1234.80), sidebar sem max-height

## Implementado nesta sessao

### effectiveSprData (rpDeriver → SprPipeline)
- MasterSimulator computa `effectiveSprData` com RP derivado (OOP = referencia)
- Preserva curva de dissipacao original (ratios), substitui magnitude absoluta
- Passado ao TheoryPanel → SprPipeline
- Formula: `stage.rpValue = (stage.rpValue / preRp) * effectiveOopRp`

### normalizeQuizData tipado
- Input: `Quiz | null | undefined` (de engine/types)
- Output: `NormalizedQuestion[]` (de quiz/types)
- Removido `any` de input, output e callbacks internos
- Filter com type predicate (`q is NormalizedQuestion`)

### Cenario 10: Especulacao Assimetrica (Conceito 4 da teoria original)
- id: `especulacao`, category: `clinical`
- Stacks: [35, 80, 12] (Mid IP vs CL OOP + Short catalisador)
- Conceito: mid-stack entra por implied odds de ICM, nao por pot odds
- Absorve agressividade estrutural do CL, realiza equity passivamente
- Short como rede de seguranca (Efeito de Irradiacao)

### Prizes calibrados contra FT real
- Torneio HRC: 126 jogadores, 378k chips, 23 pagos, TOTAL_POOL=1234.80
- FT prizes: 1st=237.34, 2nd=170.96, 3rd=135.17, 4th=109.99
- HU cenarios: [237.34, 170.96]
- 3-handed cenarios: [237.34, 170.96, 135.17]
- 4-handed cenarios: [237.34, 170.96, 135.17, 109.99]
- ChipEV WTA baseline: [408.30]

### Sidebar fix
- Removido `max-height: 850px` do `.selectorPanel` desktop
- 10 cenarios cabem sem scrollbar

### Limpeza Gemini
- Deletados: `frontend/page.tsx` (vazio), `scripts/maintenance/types.ts` (duplicata), `scripts/tests/` (inconsistente), `image/` (irrelevante)
- Mantidos: `.claude/handoff.md`, `scripts/utils/kill_eperm.ps1`

## Estado do projeto

### Identidade
- **Este repo = Poker Racional** (site educacional)
- **trueICM.com = projeto separado**, ja online

### 10 cenarios do simulador
1. Paradoxo do Valuation (HU, 40 vs 55)
2. Pacto Silencioso (HU, 65 vs 70)
3. Efeito Batata Quente (HU, 25 vs 20)
4. Agonia do Bluffcatcher (HU, 80 vs 30)
5. Guerra na Lama (HU, 12 vs 10)
6. Vacuo Matematico (ChipEV baseline, 100 vs 100)
7. Franco-Atirador (4h, 50/12/8/9)
8. Bully do Botao (3h, 80/20/18)
9. Ameaca Organica (HU, 90 vs 25)
10. **Especulacao Assimetrica (3h, 35/80/12)** - NOVO

### 5 tabs do simulador
1. Cenario (ScenarioStage + NashPanel + TheoryPanel)
2. Calculadora ICM (EquityCalculator)
3. Matchups FT (MatchupSelector)
4. Comparar (ComparisonRadar)
5. Perspectiva (PerspectivePanel)

### Pipeline teorica completa
stacks + prizes(FT real) → M-H(icmEngine) → RP derivado(rpDeriver) → effectiveSprData → distorcao(nashSolver) → UI

### TypeScript
- 0 erros em todo o projeto

## Pendente

### Prioridade alta
- RP derivado vs RP manual (HRC): comparar valores para validar o rpDeriver com prizes FT reais
- Confirmar se o rpDeriver com 2 jogadores + prizes FT produz RP proximo ao HRC (21.4%/12.9% para paradoxo)

### Prioridade media
- RP ceiling com minimum defense floor (Conceito 1 - divida tecnica)
- Mais pontos de calibracao empirica para o motor de distorcao
- Conteudo textual real (artigos, aulas) para o site

### Prioridade baixa
- PKO Value feature (aprovada em memoria, nao iniciada)
- Migration Prisma para TelemetryEvent (schema adicionado mas nao migrado)

## Arquivos untracked (nao commitados)
- `.claude/handoff.md` - handoff da sessao Gemini
- `scripts/utils/kill_eperm.ps1` - script anti-EPERM do Prisma/Next.js

## Nota tecnica
- Dev server precisa ser reiniciado apos mudancas estruturais
- icm.ts e modulo legado sem consumidores; motor real e icmEngine.ts
- Gemini tende a mudar model field dos agentes para strings invalidas - verificar apos sessoes Gemini
- Cenarios usam prizes da FT do torneio HRC de referencia (126p, 23 pagos)
