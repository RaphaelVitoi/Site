# 🔍 Registro de Calibração: 93 Nodes (Aula 1.2)

> **Status:** Registro de referência para reprodução. Ele descreve uma hipótese de calibração contra HRC e GTO Wizard, mas não substitui exportações de nós, versões de solver, estruturas de payout e método comparativo reproduzíveis.

---

## O Cenário Âncora

- **Mesa:** Final Table (9 jogadores restantes).
- **BTN:** 38bb — $RP_{BTN} = 21.4\%$.
- **BB:** 53bb — $RP_{BB} = 12.9\%$.
- **Direção de Risco:** $\Delta RP_{BTN\to BB} = RP_{BB} - RP_{BTN} = -8.5$ p.p. Portanto, neste confronto, o **BB possui a Vantagem de Risco** por ter o menor RP; o sinal não autoriza concluir uma frequência sem modelar o spot completo.
- **Estrutura de Prêmios:** FLAT ($1^{st} = 18.8\%$).

---

## Nodes de Referência (Amostra)

| Street | Ação | Hipótese a reproduzir |
| :--- | :--- | :--- |
| **Pré-flop** | BTN Shove vs BB | Frequência de fold a confirmar com ranges, payouts, blind level e exportação de nó. |
| **Flop (KJT)** | C-bet (small) | Pressão direcional de RP a avaliar junto de posição, range e textura. |
| **Turn (2d)** | Barrel (pol) | Hipótese de diluição de RP a confrontar com o modelo de pote e stack efetivo. |
| **River (3h)** | Shove | Decisão a comparar com valor marginal de fold, range e risco de eliminação. |

---

## Hipóteses de Trabalho

1. **Teto de Equidade:** O limiar de call no river pode diferir materialmente da referência linear conforme payouts, stacks, ranges e risco de eliminação; não há teto universal de 45% declarado por este registro.
2. **Efeito de Irradiação:** Micro-stacks podem comprimir ranges de call; a magnitude precisa ser medida com a estrutura completa da mesa.
3. **Pot Entrapment:** Investimento prévio pode alterar o valor marginal de fold, mas não força call por regra fixa de percentual de stack.

---
*Fonte: Extração SOTA v4.6, 2026. A reprodução requer exports de nós, versões de solver, ranges, payouts e critérios de comparação. `nashSolver.test.ts` testa contrato de código; não valida por si só esta calibração.*
