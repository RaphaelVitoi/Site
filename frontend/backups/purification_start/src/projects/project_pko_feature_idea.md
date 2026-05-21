---
name: Feature PKO Value no Simulador
description: Ideia validada por Raphael de adicionar PKO Value como variavel ao MasterSimulator. Nao reescrever - integrar no existente.
type: project
---

Raphael aprovou a ideia de adicionar **PKO Value** como variavel ao simulador ICM.

**Why:** PKO (Progressive Knockout) altera significativamente o calculo de ICM pois o bounty reduz o custo efetivo de um call. Isso precisa estar no simulador.

**How to apply:** Integrar como novo parametro nos cenarios existentes do MasterSimulator (302 linhas, 10 componentes). NAO reescrever do zero. Pode ser um slider no painel de controle ou parametro nos scenarios.ts. Alguem tentou implementar isso reescrevendo o simulador inteiro de 302 para 53 linhas - isso foi revertido.
