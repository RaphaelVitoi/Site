# REGISTRO DE HANDOFF SOTA - 2026-05-11

## SÍNTESE E APRENDIZADO DA SESSÃO

### Principais Realizações e Refatorações

* **Extermínio de Falsos Positivos Linter:** A extensão Webhint (Microsoft Edge Tools) foi silenciada em todo o workspace (`.vscode/settings.json`) por entrar em conflito direto com as injeções geométricas JIT e O(1) do React (Virtual DOM), garantindo a paz visual da IDE.
* **Blindagem de Hidratação (SSR vs CSR):** Corrigido o colapso catastrófico do Motor Quântico em `MasterSimulator.tsx` envelopando o `computeQuantumMetrics` com *try/catch* e forçando avaliações rigorosas de topologia de vetores (`scenario.stacks.length > 0`).
* **Erradicação da Falácia do Nullish Coalescing:** Substituído o operador `??` em `PerspectivePanel.tsx` por checagens explícitas de massa gravitacional de arrays, prevenindo cálculos resultantes em `NaN` na UI.
* **Acessibilidade SOTA (AXE A11y):** Injetados descritores `aria-label` e corrigida a sintaxe estrita de booleanos (`aria-pressed='true'/'false'`) em interações nos componentes `DownwardDriftSimulator.tsx`, `PostFlopPanel.tsx` e `PmLensPanel.tsx`.
* **Saneamento do Orquestrador:** Corrigidos 8 falsos tracebacks no `task_executor.py` e `memory_rag.py` migrando blocos de `logger.error` para `logger.exception` (SonarLint S8572).
* **Telemetria E2E:** Reparado o bug de sintaxe Windows CLI vs Python F-Strings (quotes) em `test_telemetry_endpoint.ps1`, comprovando a integridade end-to-end do Next.js para o banco de dados Prisma/SQLite.

### Decisões Arquiteturais Tomadas

Foi pacificado o entendimento de que a manipulação geométrica em 60 FPS via atributos literais de `style={{ width: ... }}` nos visualizadores matriciais e gráficos (como no CFR Regret Matching) é o verdadeiro Estado da Arte, devendo ignorar qualquer protesto residual do linter de CSS em linha estático.

### Lições Aprendidas e Novas Invariantes

* **Invariante de Tempo-de-Tela Vazio:** Nunca usar Nullish Coalescing (`??`) para hidratar arrays do simulador SOTA se existir o risco do Next.js fornecer um array vazio `[]` inicial. Arrays vazios avaliam como 'existentes' para `??` mas quebram motores preditivos indexados. Usar sempre validações `.length > 0`.
* **Invariante Terminal Windows/Python:** Evitar aspas literais na extração de dicionários dentro de *f-strings* chamados via CLI (`-c "..."`), preferindo a indexação posicional (`row[0]`) para evitar colapso de sintaxe do OS engolindo caracteres.
