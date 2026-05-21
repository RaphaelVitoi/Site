# SPEC: Calculador de ICM Interativo
> **Autor:** CHICO (atuando como @planner)
> **Status:** Pronto para Execução pelo @implementor
> **PRD Relacionado:** ./PRD.md

---

> **⚠️ DIRETIVA DE EXECUÇÃO OBRIGATÓRIA PARA @IMPLEMENTOR:** Antes de iniciar a arquitetura Next.js, você é OBRIGADO a ler o arquivo `components/interactive/icm_toy_game_simulator.html`. Ele contém o DNA visual (animações, paleta de cores dark/cyber, gauge charts) que você deve replicar perfeitamente para componentes React/Tailwind. Não reinvente o design.

## 1. Arquitetura Técnica

*   **Framework:** Next.js (App Router)
*   **Linguagem:** TypeScript
*   **Estilo:** Tailwind CSS
*   **Estado do Componente:** React Hooks (`useState`, `useReducer`)
*   **Visualização de Dados:** `recharts` (leve, componentizada e com boa API para interações)

## 2. Estrutura de Arquivos

O @implementor deve criar a seguinte estrutura dentro de `frontend/src/`:

```
src
├── lib/
│   └── icm.ts             # Função pura para o cálculo do algoritmo ICM
└── components/
    └── icm/
        ├── ICMCalculator.tsx  # Componente principal que orquestra tudo
        ├── PlayerInputRow.tsx # Linha de input para stack e nome do jogador
        ├── PayoutInputRow.tsx # Linha de input para a premiação
        ├── ICMResultChart.tsx # Componente que renderiza o gráfico com recharts
        └── ScenarioSimulator.tsx # Botões para os cenários "E se?"
```

## 3. Lógica Core: `lib/icm.ts`

O @implementor deve implementar uma função pura e exportável `calculateICM`.

```typescript
/**
 * Calcula a equity de cada jogador usando o algoritmo ICM recursivo.
 * @param stacks Um array com as fichas de cada jogador.
 * @param payouts Um array com a estrutura de premiação.
 * @returns Um array com a equity em % do prize pool para cada jogador.
 */
export function calculateICM(stacks: number[], payouts: number[]): number[];
```
A implementação deve ser eficiente. Embora recursiva, para N < 10, a performance no lado do cliente é aceitável. O código deve ser coberto por testes unitários usando `vitest` ou `jest`.

## 4. Plano de Execução para o @implementor

1.  **Setup:** Instalar a dependência de gráficos: `npm install recharts`.
2.  **Engenharia Reversa Visual:** Inspecionar `components/interactive/icm_toy_game_simulator.html` e extrair o modelo mental do CSS/Layout para a nova arquitetura Tailwind.
2.  **Lógica Core:** Criar e implementar `frontend/src/lib/icm.ts` com a função `calculateICM`. Adicionar testes unitários para validar a precisão do algoritmo contra casos conhecidos.
3.  **Componentes de UI:** Desenvolver os componentes de input (`PlayerInputRow.tsx`, `PayoutInputRow.tsx`) como componentes controlados.
4.  **Gráfico:** Desenvolver o `ICMResultChart.tsx`, recebendo os dados de equity e renderizando um `BarChart` do `recharts`.
5.  **Orquestração:** Montar o componente principal `ICMCalculator.tsx`, gerenciando o estado global da ferramenta (stacks, payouts, resultados) e passando as props para os filhos.
6.  **Interatividade:** Conectar os `sliders` (ou inputs numéricos) ao estado, garantindo que qualquer alteração dispare um novo cálculo e re-renderize o gráfico.
7.  **Simulador de Cenários:** Implementar a lógica no `ScenarioSimulator.tsx` para modificar o estado principal com base nos cenários pré-definidos.
8.  **Página de Demonstração:** Criar uma nova rota em `frontend/src/app/tools/icm/page.tsx` para abrigar e testar o `<ICMCalculator />` de forma isolada.