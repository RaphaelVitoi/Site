# SPEC: Laboratório de ICM Universal (V2) - Vetor de Manutenção de Monopólio

**Autor:** CHICO (@architect / @planner)
**Status:** Blueprint Arquitetural (Fricção Zero)
**Data:** 2026-04-11

---

## 1. Visão Global (Antevisão Semântica)

O **Laboratório de ICM Universal (V2)** transcende os Toy-Games V1. Ele introduz o cálculo em tempo real do **Vetor de Manutenção de Monopólio** e a instabilidade das Margens de EV (Perspectiva Matemática).

Para que a interface suporte matrizes brutas e cálculos combinatórios O(1) gerados pelo Rust/WASM sem estrangular a Main Thread do React, a arquitetura exige um isolamento cirúrgico de contextos e um ciclo de vida de *Web Workers* estritamente controlado.

---

## 2. Topologia de Diretórios (Fricção Zero)

Para erradicar o Paradoxo de Roteamento do Next.js App Router (onde UI e API não podem coabitar a mesma folha) e garantir a segregação Server/Client, a topologia física obedecerá estritamente a esta árvore:

```text
src/
├── app/
│   └── laboratorio-v2/
│       ├── page.tsx                 # [SERVER] Metadata, SEO e Container Raiz. Sem hooks.
│       └── layout.tsx               # [SERVER] Layout isolado, injetando provedores globais leves.
├── components/
│   └── laboratorio/
│       ├── UniversalLabShell.tsx    # [CLIENT] Interface iterativa principal ('use client').
│       ├── MonopolyVectorPanel.tsx  # [CLIENT] Painel visual da métrica de Monopólio.
│       └── PmLensTooltipSota.tsx    # [CLIENT] Tooltip de Topologia Fluida SOTA.
├── workers/
│   └── quantum_solver.worker.ts     # [WORKER] Thread separada para o ranqueador Bitwise Rust.
└── api/
    └── oracle/
        └── route.ts                 # [API/SSE] Stream fragmentado para o Knowledge Graph.
```

---

## 3. Invariantes de Isolamento e Estado (React Context)

**Problema Evitado:** Re-renderizações cíclicas e colapso de performance.

1. **Particionamento Cirúrgico:** A malha será dividida em três `Contexts` distintos e independentes:
   * `SotaSpotContext`: Mantém apenas a física da mesa (Stacks, Posições, Payouts).
   * `SotaWasmContext`: Mantém exclusivamente a referência estática ao Worker instanciado, sem dados reativos mutáveis de jogo.
   * `SotaMetricsContext`: Mantém os outputs quantitativos (EV, Perspectiva, Risk Premium).
2. **Imutabilidade Estrita:** Todos os componentes do Laboratório devem tipar suas propriedades com `Readonly<Props>`.
3. **Erradicação de Tipos Cegos:** O uso de `any` está **BANIDO**. Coerções de eventos do Worker devem utilizar `unknown` e *pattern matching* via Type Guards.

---

## 4. Ciclo de Vida Quântico (WASM & Web Workers)

**Problema Evitado:** Morte Térmica da Main Thread e Memory Leaks.

A integração com a biblioteca matemática Rust (`rs_poker` substituído pelo motor nativo O(1)) exige que a orquestração do Worker seja à prova de falhas:

1. **Instanciação Singular:** O `quantum_solver.worker.ts` deve ser instanciado uma única vez no ciclo de vida da aplicação (preferencialmente dentro do `SotaWasmContext` via um `useRef` imutável após o primeiro render).
2. **Terminação Obrigatória (Garbage Collection):** O ciclo de vida (`useEffect`) que gerencia o Worker **DEVE** possuir uma função de *cleanup* explícita chamando `worker.terminate()` caso a árvore do laboratório seja desmontada.
3. **Ponte Zero-Fricção:** O parsing textual (ex: "AKs", "QQ") é feito pelo TypeScript, enviando matrizes brutas (`Uint8Array` ou `Int32Array`) para o Worker via transferência de memória (Transferable Objects) para não sobrecarregar a ponte estrutural do browser.

---

## 5. Arquitetura Visual SOTA (Topologia Fluida)

**Problema Evitado:** Transbordo (Overflow) de viewport no mobile e esquizofrenia de layouts dinâmicos.

1. **Barreiras Elásticas:** Nenhuma `div` modal ou tooltip deve usar compensação absoluta negativa (ex: `-left-4`). Elementos flutuantes SOTA (`PmLensTooltipSota.tsx`) devem ancorar nativamente no eixo (ex: `left-0` ou `right-0`) e utilizar limites fluidos como `max-w-[min(100%,85vw)]`.
2. **Abolição de Portals:** A injeção de painéis no DOM não utilizará `ReactDOM.createPortal`. O fluxo do HTML será preservado nativamente com Flexbox Stackável (`flex-col sm:flex-row`) e CSS Grid para manter a simetria semântica.
3. **Gamificação Visceral:** O *Dicionário de Respostas O(1)* ditará o estado dos botões. As cores semânticas de Raphael Vitoi (Vermelho para Entropia/Erro Matemático, Verde para Simetria/Acerto, Ciano para Máquina) guiarão o feedback, aplicando *Framer Motion* sutil apenas para interações de mudança de estado.

---

## 6. Blindagem de I/O e Híbrido (Oráculo SSE)

**Problema Evitado:** Latência Visual e Vazamento de Rede (Network Memory Leaks).

1. O painel teórico do laboratório que consome dados do RAG (`/api/oracle/route.ts`) utilizará a abordagem de **Híbrido SSE (Server-Sent Events)**.
2. A resposta em JSON no Backend Node.js será convertida em um `ReadableStream`.
3. No Frontend, o cancelamento da requisição HTTP (caso o usuário troque de página antes da finalização) será estancado por um `AbortController` acoplado ao evento `cancel()` do *Stream*.

---

## 7. Critérios de Aceite (@verifier / @auditor Gate)

* [ ] O componente `page.tsx` exporta `metadata` e não possui a diretiva `'use client'`.
* [ ] Os contextos `SotaSpotContext`, `SotaWasmContext` e `SotaMetricsContext` estão isolados e não geram cascatas de renders nos irmãos.
* [ ] O `quantum_solver.worker.ts` tem rotina de `terminate()` garantida no unmount.
* [ ] A interface foi testada em viewport mobile simulado e não quebra a margem no eixo X (Zero Overflow).
* [ ] Todos os dados transacionados pela API estão usando `AbortController` na raiz da requisição.
* [ ] Nenhum arquivo TypeScript implementa a tipagem `any`.

**Fricção Zero. SOTA Absoluto.**
