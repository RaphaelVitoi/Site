---
name: Prompt de Continuidade V32
description: Sessao 20260323 - rpDeriver reescrito (BF via Perspectiva), especulacao IP/OOP corrigido, validacao multi-player quase exata, HU usa fallback manual. 0 erros TS.
type: project
---

# Continuidade - Sessao 20260323 V32

## Commits desta sessao

- `50add2a` - rpDeriver reescrito: BF via Perspectiva, especulacao IP/OOP corrigido, scripts 0-byte deletados

## Implementado nesta sessao

### rpDeriver reescrito: Bubble Factor via Perspectiva
- Formula anterior (ERRADA): `RP = chip% - ICM%` (media desconto de fichas, nao custo de colisao)
  - Dava RP > 0 so para big stacks, RP = 0 para shorts/mids
  - Invertia a direcao em quase todos os cenarios
- Formula nova (CORRETA): `BF = ICM_loss / ICM_gain` via `calculatePerspectiva`
  - `RP = 100 * (BF - 1) / BF` (equivalente a `BF = 100 / (100 - RP)`)
  - Ambos jogadores tem RP > 0 (direcao correta)
  - Simula all-in pelo effective stack entre IP e OOP
  - Epsilon (0.001) no lugar de stack=0 para evitar edge case M-H

### Validacao rpDeriver BF
- **Multi-player (3+ jogadores): EXCELENTE**
  - bully: derivado 4.1/41.7 vs manual 5.0/42.0 (quase exato)
  - especulacao: derivado 49.5/7.1 vs manual 38.0/8.2 (direcao correta)
  - sniper: derivado 5.9/53.7 vs manual 12.0/45.0 (direcao correta)
- **HU (2 jogadores, 2 premios): BF = 1.0 para ambos**
  - Com apenas 2 premios garantidos, M-H nao detecta distorcao ICM
  - Causa: HRC calcula RP no contexto completo do torneio (126 jogadores, 23 pagos)
  - Solucao: rpDeriver retorna `null` quando BF < 1.01 para ambos
  - MasterSimulator ja tem fallback: `derivedRp?.ipRp ?? scenario.ipRp`

### Especulacao Assimetrica: IP/OOP corrigido
- Antes: IP=Mid(35bb), OOP=CL(80bb) - INVERTIDO
- Depois: IP=CL(80bb) BTN, OOP=Mid(35bb) BB - CORRETO
- CL agride por obrigacao (Agressor Obrigatorio), Mid absorve (Especulativo Passivo)

### Scripts 0-byte deletados
- cli/, ops/, routines/, setup/ e maintenance parcial (arquivos vazios herdados)

## Estado do projeto

### Identidade
- **Este repo = Poker Racional** (site educacional)
- **trueICM.com = projeto separado**, ja online

### Pipeline teorica corrigida
stacks + prizes(FT real) -> BF(perspectiva.ts) -> RP derivado(rpDeriver) -> effectiveSprData -> distorcao(nashSolver) -> UI
- Multi-player: RP derivado automaticamente (BF approach)
- HU: RP manual (calibrado HRC) como fallback

### TypeScript
- 0 erros em todo o projeto

### 10 cenarios do simulador
1-9: mesmos de V31
10: Especulacao Assimetrica (3h, 35/80/12) - IP/OOP CORRIGIDO

### 5 tabs do simulador
1. Cenario (ScenarioStage + NashPanel + TheoryPanel)
2. Calculadora ICM (EquityCalculator)
3. Matchups FT (MatchupSelector)
4. Comparar (ComparisonRadar)
5. Perspectiva (PerspectivePanel)

## Pendente

### Prioridade alta
- Conteudo textual real (Aula 1) para o site - Gemini produziu rascunho bruto, precisa curadoria
- RP derivado para HU: explorar adicionar jogadores de fundo (phantom stacks) para simular contexto FT completo

### Prioridade media
- RP ceiling com minimum defense floor (Conceito 1 - divida tecnica)
- Mais pontos de calibracao empirica para cenarios multi-player
- Pagina de formalizacao dos conceitos (Perspectiva/Esperanca/Expectativa)

### Prioridade baixa
- PKO Value feature (aprovada em memoria, nao iniciada)
- Migration Prisma para TelemetryEvent (schema adicionado mas nao migrado)

## Arquivos untracked (nao commitados)
- `.claude/handoff.md` - handoff da sessao Gemini
- `scripts/utils/kill_eperm.ps1` - script anti-EPERM
- `docs/architecture/002-quiz-engine-sota.md` - doc Gemini
- `frontend/src/app/templo/` - pagina Gemini
- `frontend/src/components/quiz/` - componentes Gemini
- `frontend/src/components/telemetry.ts` - Gemini

## Nota tecnica
- rpDeriver usa calculatePerspectiva (perspectiva.ts), nao calculateMalmuthHarville direto
- Epsilon 0.001 no rpDeriver evita stack=0 no M-H (jogador eliminado nao recebe premio na recursao)
- BF_THRESHOLD = 1.01: abaixo disso, retorna null (sem distorcao detectavel)
- icm.ts e modulo legado; motor real e icmEngine.ts + perspectiva.ts
- Cenarios usam prizes da FT do torneio HRC de referencia (126p, 23 pagos)
