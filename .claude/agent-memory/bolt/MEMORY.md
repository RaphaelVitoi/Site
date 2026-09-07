## 2024-05-19 - React.memo on Heavy Recharts SVG components
**Learning:** Recharts components (like LineChart, ResponsiveContainer) perform computationally expensive SVG layout calculations on every render. If they are placed inside a parent component that has frequent state updates (such as telemetry polling / live wasmLogs in PerspectivePanel), they cause significant main thread CPU churn even when their input data is perfectly stable. Re-rendering a complex SVG DOM structure unnecessarily can tank frame rates.
**Action:** Always wrap Recharts components (or other complex visualization components) with `React.memo` if their props are stable but their parent renders frequently.

### 2026-09-07 -- Medição de React.memo em Componentes Recharts Pesados

Origem: sessão Jules `5197519323884032401`.

- ``#aprendizado`` **Componentes SVG pesados como Recharts requerem memoização se o estado do painel pai for ruidoso.** `PerspectiveChart` renderiza um `LineChart` complexo. O pai `PerspectivePanel` possuía estado interno que era atualizado frequentemente (por exemplo, telemetria através da prop `wasmLogs` para um painel irmão). Como a prop `chartData` que `PerspectiveChart` recebia já era perfeitamente memoizada via `usePerspectiveCalculations`, e como o `PerspectiveChart` não recebia funções inline na chamada `PerspectivePanel.tsx:284` e `:698`, a memoização neste caso isola o gargalo do render sem as falhas descritas anteriormente.
**Ação:** Envolver visualizações de dados custosas com `React.memo` quando 100% das props forem comprovadamente estáveis via hooks anteriores ou valores hardcoded, para estancar os desperdícios gerados por estados irmãos dentro do memo componente raiz. Sempre faça medições primeiro.

### 2026-09-07 -- Medição de React.memo em Componentes Recharts Pesados

Origem: sessão Jules `5197519323884032401`.

- ``#aprendizado`` **Componentes SVG pesados como Recharts requerem memoização se o estado do painel pai for ruidoso.** `PerspectiveChart` renderiza um `LineChart` complexo. O pai `PerspectivePanel` possui estado interno (`wasmLogs`) que é atualizado frequentemente e aciona re-renders no painel inteiro, empurrando renderizações desnecessárias e custosas para os SVGs que não precisam ser alterados (como sua prop `chartData` é estabilizada via `usePerspectiveCalculations`).
**Ação:** Envolver visualizações de dados custosas com `React.memo` quando as props forem garantidamente estáveis para estancar desperdícios gerados por vizinhos barulhentos dentro do mesmo painel.
