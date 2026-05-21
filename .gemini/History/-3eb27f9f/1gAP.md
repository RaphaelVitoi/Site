# SPEC SOTA: Fase 3 - Painel de Convergência Nash

## 1. Ontologia do Componente

O objetivo não é exibir uma matriz estática, mas visualizar a **Degradação da Perspectiva Matemática**. Mãos que são lucrativas em GTO (ChipEV) devem sofrer mutação visual (para entropia/vermelho) quando o Delta de Insolvência (RIO + Punição FGS) as torna sistemicamente destrutivas.

## 2. Contratos de API (Invariância Modular)

### 2.1. Motor Rust (WASM)

A função de avaliação não retorna apenas uma ação, mas o vetor de insolvência.

```rust
pub struct InsolvencyResult {
    pub combo: String,          // ex: "AKs"
    pub pure_ev: f64,           // EV bruto GTO
    pub insolvency_delta: f64,  // Passivo estrutural (RIO) + Punição FGS (t-3)
    pub actual_pm: f64,         // pure_ev + insolvency_delta
}
```

### 2.2. Web Worker (TypeScript)

O Web Worker recebe a string do WASM e mapeia para a matriz O(1) do React. Ele atua como uma barreira anti-fricção, garantindo que o cálculo de 169 combos não bloqueie a Main Thread da UI.

## 3. Topologia Fluida e Estética (CSS/UX)

- **Grid 13x13 Estrito:** Construído com `grid-cols-13` e `aspect-square`.
- **Colorimetria Semântica:**
  - `Verde (Sucesso):` pure_ev > 0 e actual_pm > 0.
  - `Vermelho/Magenta (Insolvência):` pure_ev > 0, mas actual_pm < 0 (A Armadilha das Pot Odds).
  - `Cinza/Neutro:` pure_ev <= 0 (Fold natural).
- **Fricção Zero:** Nenhum tooltip com `position: absolute` fora de barreiras restritas. Os dados da célula inspecionada são projetados em um painel inferior de tamanho fixo, erradicando quebras de layout mobile.

## 4. RAG Knowledge Graph (Próxima Iteração)

- Endpoint: `/api/oracle/graph-nodes`
- Fluxo: O clique em uma célula insolvente aciona o ChromaDB, que retorna as relações causais (ex: "RIO" -> "Paradoxo do BB") para renderização no painel de inspeção.
