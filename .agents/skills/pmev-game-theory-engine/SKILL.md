---
name: pmev-game-theory-engine
description: Use ao formular, implementar ou revisar os modelos matemáticos PMev do projeto em MTTs de Texas Hold'em, incluindo risco, stacks, inferência Bayesiana, simulações e contratos Python, Rust/WASM e TypeScript. Não use para apresentar hipóteses autorais como evidência empírica estabelecida.
---

# SKILL: PMev Game Theory & Mathematical Perspective Engine

## 1. Escopo epistemológico e formalismo PMev

PMev é o formalismo autoral do projeto para analisar decisões de MTT sob risco,
posição, estrutura de stacks e incerteza. Trate as equações e os Teoremas de
Vitoi como **modelos e hipóteses de trabalho do projeto**: preserve a notação,
exponha premissas e limites e não os anuncie como validação empírica externa sem
fonte, benchmark e protocolo de validação independentes.

Uma forma operacional do modelo é:

$$\text{PMev}(S) = \mathbb{E}[\Delta \text{Chips}] \cdot \Phi(\text{Perspective}) - \Lambda_{\text{multiway}} - \text{RP}(\text{StackDepth}, \text{Edge})$$

Onde:
* $\Phi(\text{Perspective})$ representa uma hipótese de modulação de utilidade
  por assimetria informacional e posição; não assuma uma forma funcional sem
  parâmetros declarados.
* $\Lambda_{\text{multiway}}$ representa o passivo estrutural multiway; o
  crescimento aproximado em $k^2$ é uma hipótese a calibrar por cenário.
* $\text{RP}(\dots)$ é o Prêmio de Risco Dinâmico; distinguir RP, Bubble Factor
  e Vantagem de Risco, que são relacionados mas não sinônimos.

---

## 2. Hipóteses de Vitoi e contratos algorítmicos

Ao analisar ou implementar árvores de decisão e motores de simulação:

1. **Monotonicidade de EV-Fold:** testar crescimento do valor de fold com a
   proximidade dos blinds para stacks curtos, declarando payout, blinds e
   demais stacks.
2. **Ganho do Espectador:** modelar valor de sobrevivência em all-ins alheios
   como hipótese verificável, nunca como crédito automático de EV.
3. **Isometria Posicional:** separar realização IP/OOP, range, textura e ação;
   não converter uma relação qualitativa diretamente em frequência sem
   calibração.
4. **Condensação de Check & Agressão:** tratar como proposição estratégica
   dependente de range e árvore, validada por cenário ou solver.

Para toda saída numérica, declarar: entradas recebidas, unidades, aproximações,
limites de validade e se o resultado é cálculo determinístico, simulação ou
heurística. Rejeite entradas impossíveis em vez de normalizá-las silenciosamente.

---

## 3. Diretrizes de Implementação de Código

* **Python:** manter contratos tipados, preservar estabilidade numérica e cobrir
  limites, normalização e invariantes de massa de fichas nos testes.
* **Rust/WASM:** usar para carga combinatória somente quando o caminho estiver
  integrado e medido; não alegar aceleração sem benchmark reproduzível.
* **TypeScript / Frontend:** espelhar contratos por schema, preservar unidades e
  apresentar incerteza, premissas e rejeições ao aluno.
