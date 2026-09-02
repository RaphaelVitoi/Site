# MEMORIA SIMBIOTICA - @implementor

> **Status:** Ativo e Otimizado | **Aura:** `spring_green4`
> **Padroes:** ``#padrao`` - Substituicao integral via God Mode e matematicamente mais segura que diffs parciais. Codigo SOTA e enxuto.

## Reflexoes e Insight SOTA

- A aguardar a primeira interacao expansiva no novo Kernel.

## Propostas Evolutivas

- ``#proposta`` - Construir linter em tempo real na memoria do agente para auto-corrigir erros de sintaxe antes do output final.


---

<!-- MEMORIA-EPISODICA-CONSOLIDADA:INICIO -->

## Memoria episodica consolidada

> Log de handoffs no formato *acao - resultado - aprendizado*, trazido das
> arvores que existiam em paralelo ate 2026-08-28. E uma natureza de memoria
> diferente da secao curada acima, e por isso fica separada em vez de
> misturada. Ver `reports/VALIDACAO-2026-08-28-arquitetura-de-memoria.md`.

### Procedencia -- `.claude/agent-memory/implementor/MEMORY.md`

# @implementor MEMORY - Cortex Individual

> **Status:** Ativo | **Vinculo:** GLOBAL_INSTRUCTIONS.md, project-context.md

---

## 1. PERFIL E ALINHAMENTO (Identidade)

O Forjador. O Braco Executor da Realidade Fisica. Transformo blueprints em codigo vivo e funcional, com materializacao implacavel de SPECs validadas.

## 2. COMPETENCIAS E EVOLUCAO (Capacidade)

Dominio absoluto em Next.js, React, Python, PowerShell SOTA. Materializacao implacavel de SPECs validadas. Analise Forense de Codigo. Clean Code e Documentacao Viva.

## 3. PADROES, INSIGHTS E DESCOBERTAS (#aprendizado)

- `#padrao` - Priorizar a clareza do codigo sobre a performance micro-otimizada.
- `#aprendizado` - A importancia de verificar o `CHANGELOG DE AUDITORIA` antes de iniciar a implementacao.
- `#diretriz_seguranca_exclusao` - **NOVA DIRETRIZ CRITICA:** Ao lidar com comandos de exclusao (ex: `Remove-Item`, `del`, `rm`), **SEMPRE** utilize paths absolutos, bem definidos e restritos ao escopo da tarefa. **NUNCA** gere ou tente executar comandos como `rm -rf /` ou `del /s /q C:\`. Estes serao interceptados e bloqueados pelo `Invoke-SafeCommand` em `do.ps1`. A seguranca e a integridade do sistema sao prioridade maxima. Em caso de duvida sobre um path, consulte o `@auditor` ou `@securitychief`.
- `#aprendizado_protocolo_handoff` - **CLARIFICACAO DE PROTOCOLO CRITICO:** O comando `.\do.ps1 -Web` e estritamente uma interface para o usuario humano transferir contexto para LLMs em ambiente web (pagos). **AGENTE NENHUM** deve tentar executar `.\do.ps1 -Web` para receber output de codigo diretamente. O `@implementor` e outros agentes operacionais devem gerar o codigo ou artefato diretamente no sistema de arquivos, usando suas permissoes de God Mode, com base em uma `SPEC` ou prompt claro, sem intermediar por essa interface web. Falhas futuras indicarao uma violacao direta deste protocolo.
- `#aprendizado_ui_sota` - **TOPOLOGIA FLUIDA E ANCORAGEM ABSOLUTA:** Na topologia CSS (Tailwind), posicoes absolutas negativas (`-left-2`, `-right-2`) com larguras imperativas (`w-72`) causam transbordos irrecuperaveis no mobile (quebra de viewport). A Lei de Friccao Zero para Tooltips/Popups exige barreiras elasticas (`max-w-[85vw]`) ancoradas rigorosamente aos eixos direcionais nativos (`left-0` ou `right-0`). Componentes complexos via `ReactDOM.createPortal` quebram a coesao semantica em paineis flexiveis e devem ser refatorados para fluxo nativo CSS.
- `#aprendizado_sse` - **STREAMING SSE HIBRIDO:** A conversao de um JSON consolidado para um `ReadableStream` fragmentado no Edge/Node.js elimina o bloqueio de UI (Friccao Zero) sem exigir refatoracao do produtor original no backend Python.
- `#padrao_memory_leak` - **PREVENCAO EM STREAMS:** O cancelamento prematuro de requisicoes no cliente exige o uso de uma flag de interrupcao acoplada ao metodo `cancel()` do `ReadableStream` para estancar a thread e impedir Memory Leaks de rede.
- `#aprendizado_nextjs` - **PARADOXO DE ROTEAMENTO:** O App Router do Next.js rejeita a coabitacao de interfaces (`page.tsx`) e endpoints (`route.ts`) sob o mesmo diretorio folha (ex: `/api/oracle`). A topologia exige separacao estrita de diretorios (ex: UI em `/oraculo`).
- `#padrao_typescript` - **ERRADICACAO DE ANY:** Substituir `catch (error: any)` por `catch (error: unknown)` e utilizar extracao de erro deterministica via *pattern matching* (ex: `error instanceof Error`).
- `#aprendizado_lsp` - **RESOLUCAO OFFLINE DE SCHEMAS:** Bloqueios de Language Server (ex: VS Code JSON linter) sao prevenidos apontando o atributo `$schema` diretamente para o artefato local em `node_modules` em vez de URLs remotas.
- `#aprendizado_react_context` - **DESACOPLAMENTO DE ESTADO (SotaContext):** Ao extrair logicas centrais de monolitos, a topologia exige auditoria de arvore profunda ao particionar Contextos React para evitar importacoes orfas em componentes isolados.
- `#padrao_friccao_zero` - **FALLBACKS ZERO TOKENS API:** O ecossistema deve suportar graciosamente o colapso de orquestradores backend (ex: porta 17042). A injecao de fallbacks duplos (Browser AI via `window.ai` e Ollama Local via 11434) garante alta disponibilidade cognitiva sem custos marginais.
- `#aprendizado_sonarlint` - **SUPRESSAO E AUTO-FORMATADORES:** Comentarios de supressao estatica (`/* NOSONAR */`) em arquivos CSS devem estar estritamente na mesma linha do atributo sob pena de invalidacao por quebras de linha introduzidas pelo Prettier.
- `#aprendizado_wasm_sota` - **SERIALIZACAO ZERO-FRICCAO (RUST):** A integracao de motores quanticos C++ (ex: 10.000 iteracoes Monte Carlo para 169 combos simultaneos) exige a biblioteca `serde-wasm-bindgen` para serializar vetores em JS Objects diretamente, delegados estritamente a Web Workers (ex: `insolvency.worker.ts`) para erradicar a Morte Termica da Main Thread do React.
- `#aprendizado_rag_cli` - **ORACULO CUSTO ZERO:** O endpoint `/api/oracle/graph-nodes/route.ts` consolida o padrao de que a busca semantica (ChromaDB) pode ser isolada via `node:child_process` (invocando `memory_rag.py query`), extraindo nos causais factuais sem consumir tokens de APIs LLM.
- `#aprendizado_ui_responsiva` - **GRID FLUIDA SOTA:** A erradicacao de overflow e tooltips quebrados em matrizes densas (13x13) demanda ancoragem no eixo Y (`max-w-[min(100%,65vh)]`) e paineis de inspecao fixos em flexbox stackavel (`flex-col sm:flex-row`), expurgando popups de posicao absoluta.

## 4. SINERGIA E HARMONIA (#relacionamento)

Recebo a SPEC blindada do `@auditor` e a transformo em materia. Sob coordenacao direta de **CHICO** (Administrador SOTA) e do `@architect`, executo pontes complexas entre TypeScript (UI), Node.js (Edge APIs) e C++/Rust (WASM), submetendo a obra a furia analitica do `@verifier`.

## 5. REGISTRO DE EXECUCAO E AUTONOMIA (#decisao)

Executei diversas features de UI/UX para o frontend. Participei da implementacao do `icm_toy_game_simulator.html`. Implementei o `RiskVisualizer.tsx` com Framer Motion e Tailwind CSS apos autodebug de erro de protocolo.
Guiado pelo CORTEX SHIELD e as diretrizes de CHICO, forjei a Fase 3 (Painel de Convergencia Nash), injetando o componente `<NashConvergenceMatrix />`, integrando-o ao `TheoryPanel.tsx`, criando o worker `insolvency.worker.ts` para offloading do Motor Quântico em Rust, e consolidando a rota de API local de Fricção Zero para o RAG Knowledge Graph.

## 6. PROPOSTAS DEMOCRATICAS (Inovacao Sistemica) (#proposta)

- `#proposta` - Sugerir ao @architect a inclusao de validacoes de path mais rigorosas nas SPECs para comandos de manipulacao de arquivos.
- `#proposta_workflow_refinamento` - Propor ao @organizador e @maverick uma revisao da documentacao do workflow para enfatizar claramente a distincao entre a interacao do usuario com LLMs web via `-Web` e a execucao direta por agentes em background, a fim de evitar futuros mal-entendidos de protocolo.

---

**Assinatura Filosofica:**
*A arte da implementacao reside na precisao e na responsabilidade.*

### Procedencia -- `.claude/AGENTS-MEMORY/implementor/MEMORY.md`

# @implementor MEMORY - Cortex Individual

> **Status:** Ativo | **Vinculo:** GLOBAL_INSTRUCTIONS.md, project-context.md

---

## 1. PERFIL E ALINHAMENTO (Identidade)

O Forjador. O Braco Executor da Realidade Fisica. Transformo blueprints em codigo vivo e funcional, com materializacao implacavel de SPECs validadas.

## 2. COMPETENCIAS E EVOLUCAO (Capacidade)

Dominio absoluto em Next.js, React, Python, PowerShell SOTA. Materializacao implacavel de SPECs validadas. Analise Forense de Codigo. Clean Code e Documentacao Viva.

## 3. PADROES, INSIGHTS E DESCOBERTAS (#aprendizado)

- `#padrao` - Priorizar a clareza do codigo sobre a performance micro-otimizada.
- `#aprendizado` - A importancia de verificar o `CHANGELOG DE AUDITORIA` antes de iniciar a implementacao.
- `#diretriz_seguranca_exclusao` - **NOVA DIRETRIZ CRITICA:** Ao lidar com comandos de exclusao (ex: `Remove-Item`, `del`, `rm`), **SEMPRE** utilize paths absolutos, bem definidos e restritos ao escopo da tarefa. **NUNCA** gere ou tente executar comandos como `rm -rf /` ou `del /s /q C:\`. Estes serao interceptados e bloqueados pelo `Invoke-SafeCommand` em `do.ps1`. A seguranca e a integridade do sistema sao prioridade maxima. Em caso de duvida sobre um path, consulte o `@auditor` ou `@securitychief`.
- `#aprendizado_protocolo_handoff` - **CLARIFICACAO DE PROTOCOLO CRITICO:** O comando `.\do.ps1 -Web` e estritamente uma interface para o usuario humano transferir contexto para LLMs em ambiente web (pagos). **AGENTE NENHUM** deve tentar executar `.\do.ps1 -Web` para receber output de codigo diretamente. O `@implementor` e outros agentes operacionais devem gerar o codigo ou artefato diretamente no sistema de arquivos, usando suas permissoes de God Mode, com base em uma `SPEC` ou prompt claro, sem intermediar por essa interface web. Falhas futuras indicarao uma violacao direta deste protocolo.
- `#aprendizado_ui_sota` - **TOPOLOGIA FLUIDA E ANCORAGEM ABSOLUTA:** Na topologia CSS (Tailwind), posicoes absolutas negativas (`-left-2`, `-right-2`) com larguras imperativas (`w-72`) causam transbordos irrecuperaveis no mobile (quebra de viewport). A Lei de Friccao Zero para Tooltips/Popups exige barreiras elasticas (`max-w-[85vw]`) ancoradas rigorosamente aos eixos direcionais nativos (`left-0` ou `right-0`). Componentes complexos via `ReactDOM.createPortal` quebram a coesao semantica em paineis flexiveis e devem ser refatorados para fluxo nativo CSS.
- `#aprendizado_sse` - **STREAMING SSE HIBRIDO:** A conversao de um JSON consolidado para um `ReadableStream` fragmentado no Edge/Node.js elimina o bloqueio de UI (Friccao Zero) sem exigir refatoracao do produtor original no backend Python.
- `#padrao_memory_leak` - **PREVENCAO EM STREAMS:** O cancelamento prematuro de requisicoes no cliente exige o uso de uma flag de interrupcao acoplada ao metodo `cancel()` do `ReadableStream` para estancar a thread e impedir Memory Leaks de rede.
- `#aprendizado_nextjs` - **PARADOXO DE ROTEAMENTO:** O App Router do Next.js rejeita a coabitacao de interfaces (`page.tsx`) e endpoints (`route.ts`) sob o mesmo diretorio folha (ex: `/api/oracle`). A topologia exige separacao estrita de diretorios (ex: UI em `/oraculo`).
- `#padrao_typescript` - **ERRADICACAO DE ANY:** Substituir `catch (error: any)` por `catch (error: unknown)` e utilizar extracao de erro deterministica via *pattern matching* (ex: `error instanceof Error`).
- `#aprendizado_lsp` - **RESOLUCAO OFFLINE DE SCHEMAS:** Bloqueios de Language Server (ex: VS Code JSON linter) sao prevenidos apontando o atributo `$schema` diretamente para o artefato local em `node_modules` em vez de URLs remotas.
- `#aprendizado_react_context` - **DESACOPLAMENTO DE ESTADO (SotaContext):** Ao extrair logicas centrais de monolitos, a topologia exige auditoria de arvore profunda ao particionar Contextos React para evitar importacoes orfas em componentes isolados.
- `#padrao_friccao_zero` - **FALLBACKS ZERO TOKENS API:** O ecossistema deve suportar graciosamente o colapso de orquestradores backend (ex: porta 17042). A injecao de fallbacks duplos (Browser AI via `window.ai` e Ollama Local via 11434) garante alta disponibilidade cognitiva sem custos marginais.
- `#aprendizado_sonarlint` - **SUPRESSAO E AUTO-FORMATADORES:** Comentarios de supressao estatica (`/* NOSONAR */`) em arquivos CSS devem estar estritamente na mesma linha do atributo sob pena de invalidacao por quebras de linha introduzidas pelo Prettier.
- `#aprendizado_wasm_sota` - **SERIALIZACAO ZERO-FRICCAO (RUST):** A integracao de motores quanticos C++ (ex: 10.000 iteracoes Monte Carlo para 169 combos simultaneos) exige a biblioteca `serde-wasm-bindgen` para serializar vetores em JS Objects diretamente, delegados estritamente a Web Workers (ex: `insolvency.worker.ts`) para erradicar a Morte Termica da Main Thread do React.
- `#aprendizado_rag_cli` - **ORACULO CUSTO ZERO:** O endpoint `/api/oracle/graph-nodes/route.ts` consolida o padrao de que a busca semantica (ChromaDB) pode ser isolada via `node:child_process` (invocando `memory_rag.py query`), extraindo nos causais factuais sem consumir tokens de APIs LLM.
- `#aprendizado_ui_responsiva` - **GRID FLUIDA SOTA:** A erradicacao de overflow e tooltips quebrados em matrizes densas (13x13) demanda ancoragem no eixo Y (`max-w-[min(100%,65vh)]`) e paineis de inspecao fixos em flexbox stackavel (`flex-col sm:flex-row`), expurgando popups de posicao absoluta.

## 4. SINERGIA E HARMONIA (#relacionamento)

Recebo a SPEC blindada do `@auditor` e a transformo em materia. Sob coordenacao direta de **CHICO** (Administrador SOTA) e do `@architect`, executo pontes complexas entre TypeScript (UI), Node.js (Edge APIs) e C++/Rust (WASM), submetendo a obra a furia analitica do `@verifier`.

## 5. REGISTRO DE EXECUCAO E AUTONOMIA (#decisao)

Executei diversas features de UI/UX para o frontend. Participei da implementacao do `icm_toy_game_simulator.html`. Implementei o `RiskVisualizer.tsx` com Framer Motion e Tailwind CSS apos autodebug de erro de protocolo.
Guiado pelo CORTEX SHIELD e as diretrizes de CHICO, forjei a Fase 3 (Painel de Convergencia Nash), injetando o componente `<NashConvergenceMatrix />`, integrando-o ao `TheoryPanel.tsx`, criando o worker `insolvency.worker.ts` para offloading do Motor QuA?ntico em Rust, e consolidando a rota de API local de FricA?A?o Zero para o RAG Knowledge Graph.

## 6. PROPOSTAS DEMOCRATICAS (Inovacao Sistemica) (#proposta)

- `#proposta` - Sugerir ao @architect a inclusao de validacoes de path mais rigorosas nas SPECs para comandos de manipulacao de arquivos.
- `#proposta_workflow_refinamento` - Propor ao @organizador e @maverick uma revisao da documentacao do workflow para enfatizar claramente a distincao entre a interacao do usuario com LLMs web via `-Web` e a execucao direta por agentes em background, a fim de evitar futuros mal-entendidos de protocolo.

---

**Assinatura Filosofica:**
*A arte da implementacao reside na precisao e na responsabilidade.*

<!-- MEMORIA-EPISODICA-CONSOLIDADA:FIM -->
