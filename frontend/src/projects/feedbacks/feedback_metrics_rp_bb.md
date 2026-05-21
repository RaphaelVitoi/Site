---
name: Métricas Preferidas: RP e BB
description: Métricas primárias do simulador são RP (Risk Premium) e fichas em Big Blinds (BB) — não BF nem chips absolutos
type: feedback
---

RP (Risk Premium) é a métrica primária do simulador de poker. Stacks devem ser sempre expressos em Big Blinds (BB), nunca em chips absolutos nem em valores monetários.

Why: BF (Bubble Factor) é derivado e secundário; RP captura diretamente o custo ICM de arriscar fichas e é o conceito central do framework de Raphael. Chips absolutos são desprovidos de contexto relativo — BB normaliza profundidade de stack de forma independente do nível de cego, tornando comparações entre situações válidas.

How to apply:
- Em qualquer painel, tooltip, label ou output do simulador, exibir stacks em BB (ex: "24 BB"), nunca em chips crus (ex: "12.000").
- A métrica destacada/primária de pressão ICM é sempre RP, não BF. BF pode aparecer como métrica secundária ou de suporte, mas nunca como lead.
- Ao derivar ou exibir resultados do motor (MapaICM, rpDeriver, PerspectivePanel), garantir que a unidade de stack passada e exibida seja BB.
- Em novas features (PKO, pós-flop, MW), manter a mesma convenção desde o início — não introduzir chips absolutos por conveniência e corrigir depois.
