---
name: Classificação de Estruturas de Prêmios em MTTs
description: Framework de Raphael para classificar estruturas de premiação (TOP-HEAVY, FLAT, HÍBRIDA, PKO, SATÉLITE). Regras de threshold, denominador correto (TOTAL_POOL do torneio, não soma dos prêmios ITM), análise de exclusão, e impacto no ICM/BF/laddering. Independente de modelo ou sessão.
type: project
---

# Classificação de Estruturas de Prêmios em MTTs

## Princípio Fundamental: O Denominador Correto

O percentual do 1º lugar deve ser calculado sobre o **prize pool total do torneio** (total de buy-ins menos rake), NÃO sobre a soma dos prêmios distribuídos aos jogadores ITM.

```
% do 1º = prêmio_1º / TOTAL_POOL_TORNEIO
```

**Exemplo concreto (Referência Aula 1.2):**
- Torneio: MTT $11, 126 entradas
- TOTAL_POOL ≈ $1260 (buy-ins líquidos de rake)
- Soma dos 9 prêmios ITM (TOTAL_PRIZES) = $961.64
- 1º lugar = $237.34
- Cálculo CORRETO: $237.34 / $1260 = **18.8%** → FLAT
- Cálculo ERRADO: $237.34 / $961.64 = 24.7% → classificaria como HÍBRIDA (falso)

**Por que:** A classificação avalia a concentração de riqueza no torneio inteiro desde a bolha do ICM, não apenas entre quem paga. O pool que não é distribuído (diferença entre TOTAL_POOL e TOTAL_PRIZES) representa o valor já perdido por quem bustou ITM sem prêmio ou o rake. A estrutura é definida pela forma como o torneio INTEIRO distribui valor.

---

## Os Cinco Tipos

### 1. TOP-HEAVY (▲)

**Regra:** 1º lugar ≥ 25% do prize pool total (field curto).

**Características:**
- 1º e 2º lugares concentram parcela desproporcional do pool
- Em fields grandes: avaliar também o 3º lugar
- Em fields curtos (≤30 jogadores): focar em 1º e 2º
- Laddering pouco valioso: a diferença entre posições intermediárias é pequena comparada ao salto para o topo
- BF elevado: o custo de eliminação é alto porque o upside está concentrado nas primeiras posições
- Pressão ICM severa: foldar para subir uma posição tem EV marginal; o valor está em ganhar, não em sobreviver

**Onde aparece:**
- Eventos high stakes com field curto (quase sempre top-heavy)
- Micro stakes com fields gigantescos (operadores inflam 1º-3º para marketing)
- Torneios "winner-take-most" por design

---

### 2. FLAT (▬)

**Regra:** 1º lugar ≤ 18% do prize pool total.

**Características:**
- Saltos entre posições consecutivas são equilibrados e previsíveis
- A distância entre uma posição e a imediatamente superior é significativa mas consistente
- Laddering relevante: subir UMA posição tem valor real e tangível
- BF próximo de 1: o custo de eliminação é moderado porque o ganho de cada posição extra é distribuído
- Jogo se aproxima de ChipEV (quanto mais flat, menor a distorção ICM)

**Regra absoluta:** Se o 1º lugar captura menos que 18% do prize pool total, a estrutura NUNCA é top-heavy. É sempre flat.

**Padrão de descida:** As barras visuais descem de forma gradual e linear. O ratio entre posições consecutivas é constante (~0.72-0.82). Não há saltos abruptos.

---

### 3. HÍBRIDA (◆)

**Regra:** Foge dos extremos (1º entre 18% e 24% do pool total).

**Método de classificação: Análise de Exclusão.**
- Não é flat de forma clara e indiscutível → descarte flat
- Não é top-heavy de forma clara e indiscutível → descarte top-heavy
- Se nenhum extremo se aplica → é híbrida

**Características:**
- Tem traços de ambos os extremos simultaneamente
- Pode se aproximar mais de flat ou de top-heavy
- Varia entre sites, torneios específicos, formatos
- Cabe ao usuário avaliar a inclinação dos saltos
- Não existe padrão fixo: é o "quase top-heavy" ou o "quase flat"

**Orientação ao usuário:**
- Avalie se o laddering se aproxima mais de um extremo ou do outro
- Analise os saltos entre posições (são graduais como flat ou concentrados no topo?)
- Ajuste a estratégia ICM proporcionalmente: mais próximo de top-heavy → mais agressividade permitida no topo; mais próximo de flat → laddering mais valioso

**Nota sobre anomalias:** Alguns sites criam estruturas anômalas que não se encaixam perfeitamente em nenhuma categoria. A categoria HÍBRIDA existe exatamente para esses casos. A anomalia desta estrutura de referência (18.8%) não é forte o suficiente para descaracterizar FLAT, mas está no limiar.

---

### 4. PKO (💥)

**Classificação:** Top-heavyssimo (sempre).

**Características:**
- Dinheiro estático MUITO concentrado no 1º lugar
- Até 2º e 3º são desvalorizados no componente estático
- Laddering muito menos valioso que em qualquer outra estrutura
- A compensação vem pelo bounty acumulado (componente dinâmico)
- A dinâmica de bounty muda fundamentalmente o cálculo de risco

**Status:** Será aprofundado no futuro. Feature "PKO Value" aprovada em memória mas não iniciada.

---

### 5. SATÉLITE (🎫)

**Classificação:** Estrutura própria, não comparável diretamente.

**Características:**
- Prêmios idênticos no topo (tickets de entrada para outro torneio)
- Dinâmica de sobrevivência pura
- Acumular fichas além do necessário para o ticket tem EV zero
- Não há incentivo para terminar em 1º vs qualquer outra posição premiada
- O ICM neste formato é binário: ou você ganha o ticket ou não ganha nada

---

## Regras de Ouro (Resumo Operacional)

| Condição | Classificação | Certeza |
|----------|---------------|---------|
| 1º ≤ 18% do pool total | FLAT | Sempre |
| 1º ≥ 25% do pool total | TOP-HEAVY | Sempre |
| 1º entre 18-24% | HÍBRIDA | Avaliar caso a caso |
| PKO (qualquer %) | TOP-HEAVY extremo | Sempre (componente estático) |
| Satélite | Categoria própria | Sempre |

---

## Contexto de Mercado

- **Eventos high stakes com field curto:** geralmente top-heavy (pela natureza do field)
- **Eventos micro stakes com field gigantesco:** operadores inflam 1º-3º para chamar atenção, mas payouts intermediários podem ser flat → frequentemente HÍBRIDOS
- **Mid stakes e low high stakes (fields moderados):** maioria dos torneios, coerentes com as definições acima
- **Sites alternativos:** podem ter torneios anômalos que fogem dos padrões

---

## Impacto no Motor ICM e no Simulador

A classificação da estrutura afeta diretamente:
1. **Magnitude do RP:** estruturas top-heavy geram RPs maiores (mais valor concentrado no topo)
2. **Valor do laddering:** flat → cada posição vale subir; top-heavy → só o topo importa
3. **Agressividade ótima:** top-heavy permite mais agressividade nos extremos (BF alto = risco justificado pelo upside)
4. **Morphs do OOP/IP:** a classificação influencia quais morphs emergem nos cenários

---

## Modus Operandi para Desenvolvimento

1. **Denominador:** Sempre usar TOTAL_POOL (prize pool do torneio), nunca TOTAL_PRIZES (soma dos prêmios ITM)
2. **Barras visuais:** devem representar a fração do TOTAL_POOL, não normalizar ao 1º lugar nem ao TOTAL_PRIZES
3. **Legenda dinâmica:** calcular `pct1 = PRIZES[0].val / TOTAL_POOL * 100` e exibir no badge ativo
4. **Badge ativo (↑ ref):** marcar a classificação que corresponde à estrutura de referência do cenário
5. **Texto dos badges:** conciso mas não desleixado. Definir o extremo, o threshold, e o impacto operacional
6. **Simetria visual:** as caixas de legenda devem ter largura uniforme (grid 1fr cada)

**Why:** A classificação de estrutura é o primeiro passo interpretativo que o aluno faz ao analisar um torneio. Se estiver errada, toda a análise subsequente de ICM/RP/BF parte de premissa falsa.

**How to apply:** Ao criar novos cenários ou modificar a estrutura de prêmios, recalcular a classificação usando TOTAL_POOL e atualizar o badge ativo. Nunca assumir que a classificação anterior permanece válida após mudança de dados.
