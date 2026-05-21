# Plano de Validacao de Coeficientes - Motor ICM

## Objetivo

Validar rigorosamente os coeficientes do NashSolver e HandSimulator contra dados reais/confiaveis.

---

## Coeficientes a Validar

### NashSolver (nashSolver.ts:71-81)

```typescript
defense = 50 - (safeOopRp * 1.4) + (safeIpRp * 0.2)
bluff = 33.33 + (safeOopRp * 0.8) - (safeIpRp * 1.3)
```

**Questao:** Esses coeficientes (-1.4, +0.2, +0.8, -1.3) geram resultados corretos?

---

## CAMINHO A: Validacao com Dados Reais de Raphael

**Se voce tem:**

- Planilha de outputs de HRC
- Screenshots de calculos de ICMizer
- Dados historicos de mesas/turneys

**Processo:**

1. Compartilhe 5-10 cenarios com RP conhecido
2. Rodo os coeficientes contra esses dados
3. Comparo os outputs do motor vs dados reais
4. Documento a margem de erro aceitavel

**Tempo estimado:** 2-4 horas

---

## CAMINHO B: Validacao com Fontes Publicas

**Ferramentas disponiveis online:**

1. **PokerStars ICMizer** (free, incluso)
2. **PokerCruncher** (Windows, demo/free trial)
3. **ICM+ Online** (website, pode ter restricoes)
4. **Calculadoras manuais baseadas em Malmuth-Harville**

**Processo:**

1. Seleciono 6-8 cenarios padrao (micro-stacks, Death Zone, chip leader, etc)
2. Calculo os RP manualmente via Malmuth-Harville (script Python)
3. Rodo contra a ferramenta online para validacao cruzada
4. Aplico os coeficientes e comparo vs resultado "esperado"

**Problema:** Sem acesso ao HRC proprietario, nao posso validar com 100% de certeza. Mas posso:

- Validar que os outputs sao "razoaveis" (nao absurdos)
- Comparar contra multiplas fontes (PokerStars + calculadora manual)
- Documentar as limitacoes

**Tempo estimado:** 3-6 horas

---

## CAMINHO C: Abordagem Hibrida (Recomendada)

1. **Voce fornece:** 2-3 cenarios que ja validou contra HRC
2. **Eu valido:** Os coeficientes contra esses dados (rapido, <1h)
3. **Se os coeficientes passam:** Considerar validados
4. **Se falham:** Executar Caminho B para recalibracao

**STATUS ATUAL:** Caminho C Ativado. Framework de testes `scripts/tests/validate_icm_coefficients.py` materializado e aguardando injecao dos gabaritos reais do HRC para calibrar a distorcao linear vs logaritmica/polinomial (Fator RIO e FGS).

**Tempo estimado:** 1-2 horas

---

## Matriz de Decisao

| Caminho | Precisao | Tempo | Requer seu input | Recomendacao |
|---------|----------|-------|------------------|--------------|
| A (Dados reais) |  100% | 2-4h |  Sim | Se voce tem dados |
| B (Fontes publicas) |  ~85% | 3-6h |  Nao | Fallback seguro |
| C (Hibrida) |  95%+ | 1-2h |  Sim (2-3 cenarios) | **MELHOR** |

---

## Proximo Passo

**Escolha uma opcao e responda:**

**Opcao A:**

- [ ] Compartilhe planilha/dados HRC (ou links)

**Opcao B:**

- [ ] Autorizo voce a validar usando PokerStars ICMizer + calculadora manual

**Opcao C:**

- [ ] De-me 2-3 cenarios que voce ja validou contra HRC real
- [ ] (Exemplo: "Cenario X: stacks [50, 30, 20], RP deveria ser [12.5, 22.0, 31.5]")

---

**Documento criado:** 2026-03-16 08:50
