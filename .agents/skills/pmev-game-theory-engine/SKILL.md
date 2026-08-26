---
name: pmev-game-theory-engine
description: Especialista em Teoria dos Jogos SOTA, Formalismo Matemático PMev (Perspective-Modulated Expected Value) vs ICMev, Teoremas de Vitoi, Inferência Bayesiana, Isometria e aceleração de cálculos via Rust/SIMD e WASM. Use ao formular modelos matemáticos de Poker, analisar dinâmicas de Stack/Risco, calcular equidades convexas, ou implementar motores numéricos em Python, Rust e TypeScript.
---

# SKILL: PMev Game Theory & Mathematical Perspective Engine

## 1. Axiomática Fundamental do PMev (Perspective-Modulated Expected Value)

O **PMev** substitui a linearidade clássica do cEV e as distorções míopes do ICMev estático por um formalismo termodinâmico e de teoria da decisão sob incerteza:

$$\text{PMev}(S) = \mathbb{E}[\Delta \text{Chips}] \cdot \Phi(\text{Perspective}) - \Lambda_{\text{multiway}} - \text{RP}(\text{StackDepth}, \text{Edge})$$

Onde:
*   $\Phi(\text{Perspective})$ modula a utilidade esperada com base na assimetria informacional e dinâmica de posição ($IP > OOP$).
*   $\Lambda_{\text{multiway}}$ penaliza o passivo estrutural de potes multiway proporcional ao quadrado dos oponentes ativos ($\sim k^2$).
*   $\text{RP}(\dots)$ é o Prêmio de Risco Dinâmico atenuado por edge técnico e profundidade de stack.

---

## 2. Teoremas de Vitoi & Formalismo Algorítmico

Ao analisar ou implementar árvores de decisão e motores de simulação:

1. **Monotonicidade de EV-Fold:** O valor do fold $\text{EV}_{\text{fold}}$ cresce assintoticamente com a proximidade dos blinds para stacks curtos.
2. **Ganho do Espectador (Bystander Gain):** Em cenários de all-in alheio, stacks curtos auferem valor de sobrevivência sem alocação de risco ativo.
3. **Isometria Posicional ($IP$ vs $OOP$):** Fator de realização $\mathcal{R}_{IP} > \mathcal{R}_{OOP}$, exigindo compensação convexa no range de abertura OOP.
4. **Condensação de Check & Agressão:** Checks em range balanceado condensam equity para contra-ataques assimétricos no turn e river.

---

## 3. Diretrizes de Implementação de Código

* **Python 3.12+:** Tipagem estrita com `float` ou vetores NumPy SIMD, documentação Google com KaTeX escapado (`\$`), Zero-`Any`.
* **Rust WASM (`wasm-equity`):** Cálculos combinatorialmente pesados (169 matrizes e simulações Monte Carlo) devem ser compilados para WebAssembly via `vitoi_engine_cli`.
* **TypeScript / Frontend:** Consumo dos resultados via schemas Zod (`z.infer`) espelhados no Pydantic do backend.
