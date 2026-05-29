---
name: Estrutura do torneio HRC de referencia
description: Dados do torneio usado como ancora empirica (Aula 1.2, 93 nodes HRC). 126 jogadores, 378k chips, 23 pagos, TOTAL_POOL=1234.80
type: project
---

## Torneio de Referencia (HRC - Aula 1.2)

- **Jogadores:** 126
- **Chips totais:** 378,000
- **Pagos:** 23 posicoes
- **TOTAL_POOL:** 1,234.80
- **Engine:** Monte Carlo, Max Active Players: 4

### Estrutura de Premios Completa

| Pos | Premio | Pos | Premio |
|-----|--------|-----|--------|
| 1 | 237.34 | 10 | 26.39 |
| 2 | 170.96 | 11 | 26.39 |
| 3 | 135.17 | 12 | 26.39 |
| 4 | 109.99 | 13 | 26.39 |
| 5 | 90.28 | 14-23 | 16.76 |
| 6 | 73.95 | | |
| 7 | 59.92 | | |
| 8 | 47.56 | | |
| 9 | 36.47 | | |

### Premios da FT (usados nos cenarios)

- HU (2 restantes): [237.34, 170.96]
- 3-handed: [237.34, 170.96, 135.17]
- 4-handed: [237.34, 170.96, 135.17, 109.99]
- ChipEV baseline (WTA): [408.30]

### Classificacao da Estrutura

- 1st / TOTAL_POOL = 237.34 / 1234.80 = 19.2% → **FLAT** (<=18% seria flat puro, mas 19.2% e borderline HIBRIDA)

**Why:** Esta e a unica ancora empirica do motor (93 nodes HRC vs GTO Wizard). Todos os cenarios foram calibrados contra esta estrutura.
**How to apply:** Ao criar novos cenarios ou validar o motor, usar esta estrutura como referencia. Ao calibrar prizes, usar o subconjunto correto para N jogadores restantes na FT.
