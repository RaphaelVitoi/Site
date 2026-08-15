# SPEC: Calculador de ICM Interativo
> **Autor:** CHICO (atuando como @planner)
> **Status:** Pronto para Execucao pelo @implementor
> **PRD Relacionado:** ./PRD.md

---

> ** DIRETIVA DE EXECUCAO OBRIGATORIA PARA @IMPLEMENTOR:** Antes de iniciar a arquitetura Next.js, voce e OBRIGADO a ler o arquivo `components/interactive/icm_toy_game_simulator.html`. Ele contem o DNA visual (animacoes, paleta de cores dark/cyber, gauge charts) que voce deve replicar perfeitamente para componentes React/Tailwind. Nao reinvente o design.

## 1. Arquitetura Tecnica

*   **Framework:** Next.js (App Router)
*   **Linguagem:** TypeScript
*   **Estilo:** Tailwind CSS
*   **Estado do Componente:** React Hooks (`useState`, `useReducer`)
*   **Visualizacao de Dados:** `recharts` (leve, componentizada e com boa API para interacoes)

## 2. Estrutura de Arquivos

O @implementor deve criar a seguinte estrutura dentro de `frontend/src/`:

```
src
 lib/
    icm.ts             # Funcao pura para o calculo do algoritmo ICM
 components/
     icm/
         ICMCalculator.tsx  # Componente principal que orquestra tudo
         PlayerInputRow.tsx # Linha de input para stack e nome do jogador
         PayoutInputRow.tsx # Linha de input para a premiacao
         ICMResultChart.tsx # Componente que renderiza o grafico com recharts
         ScenarioSimulator.tsx # Botoes para os cenarios "E se?"
```

## 3. Logica Core: `lib/icm.ts`

O @implementor deve implementar uma funcao pura e exportavel `calculateICM`.

```typescript
/**
 * Calcula a equity de cada jogador usando o algoritmo ICM recursivo.
 * @param stacks Um array com as fichas de cada jogador.
 * @param payouts Um array com a estrutura de premiacao.
 * @returns Um array com a equity em % do prize pool para cada jogador.
 */
export function calculateICM(stacks: number[], payouts: number[]): number[];
```
A implementacao deve ser eficiente. Embora recursiva, para N < 10, a performance no lado do cliente e aceitavel. O codigo deve ser coberto por testes unitarios usando `vitest` ou `jest`.

## 4. Plano de Execucao para o @implementor

1.  **Setup:** Instalar a dependencia de graficos: `npm install recharts`.
2.  **Engenharia Reversa Visual:** Inspecionar `components/interactive/icm_toy_game_simulator.html` e extrair o modelo mental do CSS/Layout para a nova arquitetura Tailwind.
2.  **Logica Core:** Criar e implementar `frontend/src/lib/icm.ts` com a funcao `calculateICM`. Adicionar testes unitarios para validar a precisao do algoritmo contra casos conhecidos.
3.  **Componentes de UI:** Desenvolver os componentes de input (`PlayerInputRow.tsx`, `PayoutInputRow.tsx`) como componentes controlados.
4.  **Grafico:** Desenvolver o `ICMResultChart.tsx`, recebendo os dados de equity e renderizando um `BarChart` do `recharts`.
5.  **Orquestracao:** Montar o componente principal `ICMCalculator.tsx`, gerenciando o estado global da ferramenta (stacks, payouts, resultados) e passando as props para os filhos.
6.  **Interatividade:** Conectar os `sliders` (ou inputs numericos) ao estado, garantindo que qualquer alteracao dispare um novo calculo e re-renderize o grafico.
7.  **Simulador de Cenarios:** Implementar a logica no `ScenarioSimulator.tsx` para modificar o estado principal com base nos cenarios pre-definidos.
8.  **Pagina de Demonstracao:** Criar uma nova rota em `frontend/src/app/tools/icm/page.tsx` para abrigar e testar o `<ICMCalculator />` de forma isolada.
