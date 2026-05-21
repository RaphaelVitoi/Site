# DOSSIÊ TÉCNICO: Risk Premium e a Geometria do Risco

**ID:** TASK-20260317-ICM-RP
**Status:** Materializado
**Agente Responsável:** @maverick (Supervisão) / @planner (Estruturação)
**Contexto:** Complemento à Aula 1.2 e Motor de Cálculo do MasterSimulator.

---

## 1. Definição Ontológica

O **Risk Premium (RP)** não é apenas um número; é a representação matemática da _fricção existencial_ em um torneio de poker. Enquanto no ChipEV jogamos por fichas (recursos lineares), no ICMv jogamos por valor monetário (recursos convexos). O RP é o "pedágio" que o ICM cobra para permitir que você coloque seu stack em risco.

## 2. O Motor Matemático (Fundação para o Simulador)

Para a implementação no `SimuladorICM.tsx`, utilizaremos as seguintes constantes derivadas da teoria de Raphael Vitoi:

### 2.1 Bubble Factor (BF)

O multiplicador de pressão. Representa quanto mais "vale" uma ficha perdida em relação a uma ficha ganha.
$$BF = \frac{Equity\% \text{ (Perdida)}}{Equity\% \text{ (Ganha)}}$$

### 2.2 Tradução para Risk Premium (RP)

O RP é a equidade adicional necessária além das Pot Odds puras.
$$RP = \frac{BF - 1}{BF + 1}$$

## 3. Heurísticas do "Downward Drift"

O fenômeno do Downward Drift, conforme documentado na `aula-1-2/page.tsx`, dita que a agressividade deve ser comprimida proporcionalmente ao RP.

1. **Compressão de Sizing:** Se o RP > 15%, sizings de 75% pot tendem a ser substituídos por 33% ou 25% (B20/B33) para preservar o SPR e evitar o "Teto de Dor" do ICM.
2. **Check-Back Frequency:** Em boards dinâmicos, o IP (agressor) aumenta a frequência de check-back em 12-18% comparado ao ChipEV para evitar variância catastrófica.
3. **Overfold Seletivo:** O BB deve realizar um overfold de aproximadamente 10-15% contra sizings médios, mas defender agressivamente contra sizings "blockers" se o agressor for um Big Stack tentando abusar da Ameaça Orgânica.

## 4. Arquétipos de Colisão (Casos de Teste para o Worker)

| Cenário                   | Agente Sugerido | Risk Premium | Ação Esperada                                              |
| :------------------------ | :-------------- | :----------- | :--------------------------------------------------------- |
| **Pacto Silencioso**      | CL vs Vice CL   | > 20%        | Ranges de flat call extremamente largos; 0% 4-bet bluff.   |
| **Paradoxo do Valuation** | Mid vs Big      | 18%          | IP (Mid) estrangula blefes; BB (Big) aumenta leads.        |
| **Guerra na Lama**        | Short vs Short  | 8%           | Jogo aproxima-se do ChipEV; agressividade por laddering.   |
| **Ameaça Orgânica**       | Big vs Mid      | 12%          | Big stack seleciona mãos para não criar "monstros" rivais. |

## 5. Diretrizes para o @implementor

Ao codificar o `SimuladorICM.tsx`:

- O gráfico de equidade deve visualmente "encolher" (murchar) quando o slider de RP for movido para a direita.
- Implementar tooltips que expliquem o **Bubble Factor** em tempo real.
- Garantir que os cálculos usem `useMemo` para evitar latência na UI, mantendo o padrão de **Fricção Zero**.

---

## 6. Handoff Log

| Agente | Ação           | Data       | Nota                                                         |
| :----- | :------------- | :--------- | :----------------------------------------------------------- |
| @chico | Materialização | 2026-03-17 | Dossiê de RP criado para guiar a implementação do simulador. |

---

_Este documento integra a Mente Coletiva do ecossistema TrueICM. Qualquer alteração deve ser auditada pelo @auditor._
