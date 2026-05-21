# Memoria de CHICO (Tier 1)

## Acoes Realizadas

- [Estabilizacao CFR/React] - Resolucao de White Screen of Death no Next.js (colapso de reconciliacao).
  - Resultado: sucesso
  - Aprendizado: Injetar texto via Web Worker em nos React (ex: `el.textContent`) destroi o TextNode subjacente e causa crash `NotFoundError`. O padrao SOTA e usar `dangerouslySetInnerHTML={{ __html: "--" }}` na div receptora para o React abdicar do tracking, e aplicar Guard Rails nas mensagens assincronas (`if (!matrix) return;`) para evitar asfixia do Error Overlay.

## Padroes Observados

- Padrao 1: Quando bibliotecas terceiras (ex: Recharts, react-markdown) entram em conflito com `@types/react` no Next 14, o analisador estatico acusa erro `ts(2786)`. A solucao Friccao Zero e suprimir pontualmente via `// @ts-nocheck`, visto que o motor SWC compila o runtime perfeitamente.
