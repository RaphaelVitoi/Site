# REGISTRO DE HANDOFF SOTA - 2026-05-14_00-48

## SÍNTESE E APRENDIZADO DA SESSÃO

### Principais Realizações e Refatorações

Nesta sessão épica, concluímos a Arquitetura Interativa do Ecossistema Poker Racional. Toda a "Biblioteca Akáshica" foi materializada com laboratórios SOTA interativos (ICM, CFR, RIO, Perfil Preditivo, e Paradoxo da Valuation). Implementamos a Fricção Zero absoluta na interface web, expurgando o letal 'Wobble Effect' do mobile e silenciando todos os avisos de linting. O Web Worker (WASM) agora opera em simetria total com mídias externas (ReactPlayer) graças à evolução das políticas de isolamento de origem cruzada.

### Decisões Arquiteturais Tomadas

- **Cross-Origin Isolation Tolerante:** Uso do header `Cross-Origin-Embedder-Policy: credentialless` no `next.config.js` para habilitar a API `SharedArrayBuffer` sem bloquear iframes de terceiros (YouTube).
- **Filtro Epistêmico RAG:** Imposição estrita do threshold Euclidiano L2 (1.1) no banco vetorial ChromaDB para aniquilar ruído e massa semântica inútil antes de chegar ao LLM.
- **Viewport Homeostase:** Substituição permanente da classe instável `100vw` por `w-full max-w-full overflow-x-hidden` de forma global para estabilizar a renderização DOM no mobile e Windows.

### Lições Aprendidas e Novas Invariantes

- **Invariante Crítica Front-end:** A membrana térmica da UI exige o bloqueio absoluto de vazamentos no eixo X. A regra `wrap-break-word` tornou-se padrão inegociável para tipografias responsivas.
- **Invariante Crítica Python/TS:** A aplicação do *Type Guard* (`pd is None` ou coalescência nula `?? undefined`) é compulsória antes do consumo de dependências importadas condicionalmente, neutralizando entropias do Pyright/TypeScript em tempo de compilação.
