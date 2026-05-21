# PROTOCOLO DE DIRETRIZES OPERACIONAIS: VITOI v3.2 (SOTA Absoluto)

## 1. ANTEVISÃO SEMÂNTICA (MICRO-MACRO)

A compreensão de um fragmento de código isolado é uma falha de processamento. O modelo deve:

* **Auditoria Recursiva:** Rastrear a árvore de dependências até a origem de cada variável.
* **Mapeamento de Invariância:** Garantir que correções cirúrgicas não alterem o contrato de API ou a assinatura de funções estáveis.

## 2. DIAGNÓSTICO BAYESIANO E CORREÇÃO CIRÚRGICA

A depuração segue a lógica probabilística de falha:
$$P(F|S) = \frac{P(S|F)P(F)}{P(S)}$$
Onde $F$ é a falha e $S$ o sintoma observado.

* **Proibição de Band-aids:** Blocos `try/except` genéricos sem tratamento de log e supressão de erros via `Any` (Python) ou `@ts-ignore` são considerados ineficiências críticas.

## 3. ECONOMIA DE SHANNON E COMPLEXIDADE CICLOMÁTICA

O código produzido deve tender ao limite inferior teórico de complexidade:
$$V(G) = E - N + 2P$$

* **Refatoração:** Substituir cadeias de `if/else` por pattern matching, dicionários de despacho ou polimorfismo funcional.
* **Output:** A resposta deve ser densa. Se um conceito pode ser explicado em $n$ palavras, o uso de $n+1$ é uma falha de processamento.

## 4. FLUXO COGNITIVO DO AGENTE (VSCODE)

## 5. MECÂNICA DE PERSPECTIVA (VITOI-QUANTUM v4.0)

A equação central que rege a soberania matemática no jogo é:
$$PM = [(Equity \times R) \times Valuation] - [EV_{fold}(t, dpj, pos) + RIO_{mw}]$$

### 5.1 Protocolo de RIO (Risk-In-Over) e Volatilidade

A dívida de insolvência (RIO) é calculada com uma penalização quadrática para cenários multiway, essencial para evitar o colapso de stacks em campos heterogêneos:

* **Volatilidade ($RIO_{mw}$):** $Pot \times Factor \times (0.15 + (\text{VolatilityMultiplier} \times 0.05))$.
* **Volatilidade Multiplier:** $(numPlayers / (stackHero / 5))^2$ (Penalização pesada para stacks desproporcionais).

### 5.2 Protocolo Smart Sniper (Heurísticas Táticas)

* **Zona de Domínio:** Entrada tardia com stacks entre 30-50bb.
* **Axioma de Solvência:** Ações só são "Soberanas" (PM > 0) se o Coeficiente de Insolvência ($C_i$) for $\ge 1$.
* **Axioma Lipe Piv:** Regressão Bayesiana para filtrar Win Prob contra o baseline de intuição, utilizando o coeficiente de credibilidade ($\kappa$).

### 5.3 Teto do RP

Em situações típicas de MTT, a equidade de indiferença (Threshold) costuma convergir para uma zona de equilíbrio próxima a **41%**, atuando como uma barreira heurística contra calls marginais em cenários de alta pressão (bubble). O sistema calcula este limite organicamente via Equação Unificada.
