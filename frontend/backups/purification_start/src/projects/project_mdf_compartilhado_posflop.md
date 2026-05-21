---
name: MDF Compartilhado no Pós-flop Multiway ICM
description: Conceito original de Raphael: MDF no pós-flop MW ICM é desconhecido. Só existe formulação chipEV HU. O range com mais vantagens (mais força + menos investido) defende a maior fração do MDF compartilhado.
type: project
---

# MDF Compartilhado — Pós-flop Multiway ICM

**Autoria:** Raphael Vitoi

## O que se sabe

**ChipEV HU:** MDF é calculável. A fórmula padrão existe e é bem conhecida.

**Multiway ICM pós-flop:** o MDF agregado da defesa é desconhecido formalmente. Nenhuma fonte atual (GTO Wizard, HRC, literatura) resolve isso com rigor em contexto ICM MW.

## O que se sabe sobre a distribuição do MDF compartilhado

O "MDF compartilhado" em MW é a frequência mínima total de defesa que o aggressor precisa encarar para que seu bluff não tenha EV automático positivo.

Quem defende mais dessa frequência compartilhada:

> O range que tem **mais força** (equity superior) **E** que **investiu menos** (custo de fold menor, portanto EV_fold menos negativo) é o responsável pela maior fração do MDF compartilhado.

Raciocínio: em MW, jogadores com range mais fraco ou que já investiram mais estão mais próximos do threshold de fold (EV_fold mais negativo, threshold mais fácil de cruzar). O range com ambas as vantagens — força E menor investimento — é quem sustenta a maior parte da pressão defensiva.

## Status

Hipótese conceitual — ainda não formalizada matematicamente.

**Why:** Tratar depois que a teoria HU (pré-flop e pós-flop) estiver funcional no motor. A formalização do MW ICM MDF depende de ter o mecanismo HU como base.

**How to apply:** Quando chegar ao motor pós-flop MW, o MDF compartilhado deve ser modelado com a distribuição assimétrica descrita acima — não como MDF uniforme dividido por N jogadores.
