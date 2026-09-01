# 🃏 Strategic Toy Games & RP Asymmetry

## Conceitos Centrais de Raphael Vitoi

### 1. Teto do RP (RP Ceiling)

- Limite mecânico de defesa imposto pelo Risk Premium. Não é binário (como a "Death Zone" em 40%) - é gradual e já opera em níveis baixos como 6%.
- O Defensor (OOP) defende até onde o RP permite, e não pelo MDF (Minimum Defense Frequency) clássico.
- **Observação nos Toy Games:** O OOP mantém a mesma frequência de defesa mesmo quando o IP aumenta bluffs - ele defende no "Teto", onde qualquer desvio pioraria seu EV monetário.

### 2. Vantagem de Risco (Risk Advantage)

- Em um confronto direcional entre agressor (A) e defensor (D), $\Delta RP_{A\to D} = RP_{defensor} - RP_{agressor}$.
- Quando o resultado é positivo, o agressor tem o menor RP e possui a **Vantagem de Risco** naquele confronto. A diferença é expressa em pontos percentuais (p.p.) dentro da leitura ICMev/RP do spot.
- A diferença não é um conversor linear de agressividade. Ela indica direção e gravidade relativa da pressão; payout, stacks efetivos, pote, posição, ranges e jogadores remanescentes definem a frequência e o sizing concretos.

### 3. Economia de Perspectiva vs Fichas

- O CL não briga por fichas; briga por **Perspectiva Matemática** de posições superiores.
- "Fichas perdidas impactam mais que conquistadas" é uma verdade enganosa para o CL com distância suficiente.
- O CL aposta para **negar perspectiva alheia**, não meramente para acumular stacks.

### 4. Especulação Assimétrica

- O Mid-stack entra no pote não por *pot odds*, mas por **implied odds de ICM**.
- Investe pouco, absorve agressividade obrigatória do CL, realiza equity passivamente quando acerta.
- Se acerta, sua Perspectiva e Expectativa Matemática explodem, enquanto o CL sofre pouco dano relativo.

### 5. Fold Estrutural (A Falácia do "Overfold")

- Uma frequência de fold muito alta contra o CL pode ser coerente em um toy game de ICM severo, mas não é uma frequência GTO universal.
- "Overfold" é um vício de linguagem herdado do ChipEV quando ignora a utilidade não linear do torneio. O termo técnico correto é **Fold Estrutural**; a frequência precisa ser calculada para o cenário.

---

## Estrutura dos Toy Games (Âncora Aula 1)

**Cenário:**

- **Board:** 22223
- **Range IP:** AA, QQ, JJ (18 combos)
- **Range OOP:** KK (6 combos - bluffcatcher puro)
- **Pote:** 100 | **Aposta:** 100 (Pot-size all-in)

### Parte I - IP RP=3% fixo, OOP RP progressivo (0% → 24%)

1. **TG1 (ChipEV):** IP 6v+3b, OOP call 50% (MDF perfeito).
2. **TG2 (OOP RP=6%):** IP bluffs aumentam para 4.2 combos. OOP folda levemente mais.
3. **TG3 (OOP RP=9%):** IP bluffs aumentam para 5 combos. OOP atinge o **TETO** e para de foldar. IP explora bluffando mais.
4. **TG4 (OOP RP=18%):** IP 6v vs 8b (desequilíbrio ChipEV). OOP mantém o mesmo Teto de defesa.

### Parte II - OOP RP=3% fixo, IP RP progressivo (9% → 21%)

1. **TG1 (IP RP=9%):** IP bluffs levemente acima do ChipEV. OOP com RP baixo paga **MENOS**.
2. **TG2 (IP RP=18%):** IP mantém range bluff-heavy. OOP folda cada vez mais.
3. **TG3 (IP RP=21%):** OOP chega a ~80% de fold contra o mesmo range do IP.

**Mecanismo:** Dobrar o IP (agressor) aumenta a stack dele e reduz a pressão ICM da mesa inteira, beneficiando todos os outros jogadores. O custo de "dar fichas" ao nêmesis supera o EV de capturar o blefe.

---
*Fonte: Transcrição Aula 1.2, Paradigma VITOI. Documento de hipótese autoral em curadoria; exemplos de toy game não substituem uma validação geral por solver ou dados externos.*
