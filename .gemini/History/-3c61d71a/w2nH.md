# PRD: MasterSimulator (Motor ICM - Geometria do Risco)

**ID:** PRD-20260317-001
**Status:** Draft
**Agente Responsável:** @planner

## 1. Visão Geral

O MasterSimulator é o núcleo interativo da plataforma TrueICM. Ele deve permitir que alunos visualizem a "Geometria do Risco", simulando como o **Risk Premium (RP)** e o **Bubble Factor (BF)** distorcem as decisões de Call/Fold em comparação ao ChipEV tradicional.

## 2. Requisitos Funcionais

### 2.1 Motor de Cálculo

- **Cálculo de BF:** $BF = \frac{1}{1 - RP}$
- **Cálculo de RP:** Tradução do multiplicador de dor em equidade adicional necessária.
- **Ajuste de MDF:** Redução da frequência de defesa baseada no RP (ex: 50% ChipEV -> ~33% ICMev).

### 2.2 Cenários Clínicos (Arquétipos)

O simulador deve carregar pré-configurações baseadas nos 4 arquétipos de Raphael Vitoi:

1. **O Pacto Silencioso:** (CL vs Vice CL) - Foco em conservação de stack.
2. **Paradoxo do Valuation:** (Mid Stack vs Big Stack) - Estrangulamento de agressão do IP.
3. **A Guerra na Lama:** (Micro vs Micro) - Peso do Laddering.
4. **A Ameaça Orgânica:** (God Mode) - Proteção da liderança contra dobras de rivais.

## 3. Interface (UI/UX)

- **Visualização:** Gráficos de dispersão de equidade e sliders para ajuste de stack size/prizepool.
- **Estética:** Dark/Cyber condizente com o `globals.css`.
- **Componente Base:** `frontend/src/components/SimuladorICM.tsx`.

## 4. Requisitos Técnicos

- **Frontend:** Next.js 16 (App Router).
- **Interatividade:** React 19 hooks para cálculos em tempo real no client-side.
- **Navegação:** Acessível via `/tools/simulador`.

## 5. Casos de Teste

- Validar se um RP de 21% resulta em um overfold de ~15% em relação ao GTO Wizard puro.
- Garantir que a "Dissipação de RP por Street" seja visualmente clara (Drift máximo no Flop, mínimo no River).
