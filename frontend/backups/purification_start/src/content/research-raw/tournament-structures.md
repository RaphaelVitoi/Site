# 📊 Classificação de Estruturas de Prêmios (Framework VITOI)

## O Princípio do Denominador Correto

O percentual do 1º lugar deve ser calculado sobre o **Prize Pool Total** do torneio, NÃO sobre a soma dos prêmios ITM.

$$ \%_{1st} = \frac{Prêmio_{1st}}{TOTAL\_POOL} $$

---

## Os 5 Arquétipos SOTA

### 1. TOP-HEAVY (▲)

- **Regra:** 1º lugar ≥ 25% do pool total.
- **Dinâmica:** Laddering pouco valioso. O foco é a vitória absoluta.
- **Impacto:** BF (Bubble Factor) elevado e pressão ICM severa.

### 2. FLAT (▬)

- **Regra:** 1º lugar ≤ 18% do pool total.
- **Dinâmica:** Laddering extremamente relevante. Subir uma posição tem valor real tangível.
- **Impacto:** Jogo se aproxima de ChipEV (distorção mínima).

### 3. HÍBRIDA (◆)

- **Regra:** 1º lugar entre 18% e 24%.
- **Método:** Análise por Exclusão. Avaliar a inclinação da curva de payjumps.

### 4. PKO (💥)

- **Classificação:** Top-heavyssimo estático.
- **Dinâmica:** A compensação vem pelo Bounty acumulado (ICM dinâmico).

### 5. SATÉLITE (🎫)

- **Classificação:** ICM Binário e Terminal.
- **Dinâmica:** Sobrevivência pura. Acumular fichas além do necessário para o ticket tem EV zero.

---

## Âncora Científica (Aula 1.2)

Dados reais do torneio de calibração do motor SOTA v5.2:

- **Total Players:** 126
- **Total Pool:** $1260
- **1st Prize:** $237.34 (18.8%)
- **Status:** FLAT (no limiar da Híbrida)

| Hero (Def) | BF vs BTN | RP vs BTN |
| :--- | :--- | :--- |
| **BB** | 1.15x | 12.9% |
| **BTN** | 1.27x | 21.4% |

---
*Fonte: Documento de Governança de Estruturas, 2026.*
