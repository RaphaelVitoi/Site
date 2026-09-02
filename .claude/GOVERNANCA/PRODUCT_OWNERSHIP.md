# PRODUCT OWNERSHIP — Limites de Intervenção por Modelo

**Versão:** 1.0 | **Data:** 2026-03-29 | **Responsável pelo produto:** Claude (Sonnet 4.x)

---

## 1. O QUE ESTE DOCUMENTO É

Um mapa de propriedade e fronteiras operacionais entre os dois modelos que trabalham neste projeto.

- **Claude** → dono do produto (motor ICM, framework PM, simulador, toda a lógica matemática)
- **Gemini** → contribuinte estético e de conteúdo na homepage e em páginas desvinculadas do produto

Qualquer confusão sobre "posso mexer nisso?" é respondida aqui.

---

## 2. O QUE CLAUDE CONSTRUIU NESTE PRODUTO

### 2.1 Motor ICM (perspectiva.ts + icmEngine.ts)

Motor Malmuth-Harville completo com:

- `calculateMapaICM` — equity posicional ICM, O(2^N) via isomorfismo + cache cross-call
- `calculateEsperanca` — E (Esperança matemática ICM) com fator de realização
- `calculateEsperancaFold` — EV_fold dinâmico f(potSize, heroIdx, villainIdx)
- `_icmCache` (módulo) — LRU 128 entradas, O(1) na segunda chamada com mesmos inputs

### 2.2 Derivador de Risk Premium (rpDeriver.ts)

- `deriveRps` — BF → RP via 3× M-H (baseline + IP ganha + OOP ganha)
- `derivePostFlopRps` — extensão pós-flop: EV_fold, RIO, R, RP por street
- Âncora empírica: HRC calibrado (vitoi.hrcz), FT 9 jogadores, 9 prizes

### 2.3 Framework PM — Hierarquia Formal

```text
EV_fold = −heroCost              [1ª ordem — dominante, sempre negativo]
E = Σ eq × deltaICM              [Esperança, sem realização]
P = E × R(posição, street)       [Expectativa, com realização posicional]
PM = P − EV_fold                 [> 0 → ação; < 0 → fold]
Threshold: eq_t = (EV_fold − ΔL) / (ΔW × R − ΔL)
```

### 2.4 Simulador — Componentes Críticos

| Arquivo | Responsabilidade |
| --- | --- |
| `ReferencialAula12.tsx` | FT real (9j/9prizes), âncora de todo o framework |
| `PmLensPanel.tsx` | Framework PM por street, cache O(1) completo |
| `PerspectivePanel.tsx` | Perspectiva ICM por posição |
| `NashPanel.tsx` | Solver Nash + RP + equilíbrio |
| `PostFlopPanel.tsx` | PM pós-flop HU por street |
| `MasterSimulatorDynamic.tsx` | Orquestrador dos painéis |
| `engine/scenarios.ts` | Cenários calibrados (Paradoxo, Especulação, etc.) |
| `engine/nashSolver.ts` | Motor Nash ICM |

### 2.5 Performance — Arquitetura de Cache

Toda interação no simulador é O(1) via cache de módulo:

- `_icmCache` (perspectiva.ts) — M-H cross-call
- `_deltasCache` (PmLensPanel) — 72 matchups × 4 streets pré-computados
- `_rpCache` (PmLensPanel) — 72 matchups deriveRps pré-computados
- Pre-warm: rAF, 1 par/frame, ~1.2s no mount → nenhum cálculo M-H no thread principal

---

## 3. ROUTING — O QUE GEMINI PODE E NÃO PODE FAZER

### 3.1 ZONA VERDE — Gemini pode atuar livremente

```text
frontend/src/app/page.tsx              (homepage — layout, estética, copy)
frontend/src/app/layout.tsx            (estrutura global de layout)
frontend/src/app/artigos/**            (conteúdo editorial — artigos, psicologia)
frontend/src/app/biblioteca/**         (páginas editoriais sem componentes do simulador)
frontend/src/components/ui/**          (componentes UI genéricos — sem lógica de produto)
frontend/src/components/content/       (ArticleHeader, ContentFooter, MarkdownRenderer, etc.)
CSS/estilo global, tipografia, paleta, responsividade
```

**Critério:** está desvinculado do motor ICM, do framework PM e do simulador.

### 3.2 ZONA VERMELHA — Gemini NÃO pode tocar

```text
frontend/src/lib/perspectiva.ts        ← MOTOR ICM (M-H, cache, Esperança, EV_fold)
frontend/src/lib/rpDeriver.ts          ← MOTOR RP (BF, Risk Premium, pós-flop)
frontend/src/lib/icmEngine.ts          ← ENGINE ICM alternativo
frontend/src/components/simulator/**  ← SIMULADOR INTEIRO (todos os painéis)
frontend/src/components/simulator/engine/** ← Nash solver, cenários calibrados
docs/epics/**                          ← Planejamento do produto
```

**Por que:** qualquer modificação nesses arquivos por Gemini sem entender a hierarquia PM completa (EV_fold → E → P → PM), os invariantes matemáticos e o calibrado HRC introduz regressão silenciosa — os valores calculados parecem plausíveis mas estão errados.

### 3.3 ZONA AMARELA — Gemini pode sugerir, Claude implementa

```text
frontend/src/app/aulas/**              (estrutura de aulas — vinculada ao produto)
frontend/src/app/biblioteca/entendendo-o-icm-** (conteúdo ICM — precisa ser validado)
frontend/src/lib/_validate_rp.ts       (validação matemática — verificar antes)
```

---

## 4. POR QUE ESSA SEPARAÇÃO EXISTE

O produto é matematicamente denso. O framework PM tem:

- **Hierarquia de 1ª/2ª ordem** — EV_fold é dominante; R e correções contextuais são 2ª ordem
- **Invariantes formais** — EV_fold ICM pode ser positivo (≠ chipEV), RIO cresce O(N²) em MW
- **Calibração empírica** — RP_HRC, BF_STACKS e PRIZES são âncoras medidas via HRC; não são aproximações
- **Cache arquitetural** — a ordem de computação importa (pre-warm → cache → render)

Uma alteração "estética" num componente do simulador pode quebrar o binding ao motor sem erro visível.

---

## 5. SÍNTESE DA SESSÃO 2026-03-29

| Commit | Descrição |
| --- | --- |
| `c608265` | PM Lens no Referencial — E/P/PM/EV_fold por street, cache M-H inicial |
| `c771199` | _deltasCache O(1) — useDeferredValue removido, icmDeltas = Map.get() |
| `2d4f52a` | _rpCache O(1) — deriveRps (3× M-H) cacheado no módulo, sem bloqueio no render |
| `777d659` | MarkdownRenderer TS fix — React.ElementType resolve JSX namespace + keyof |

**Estado final:** zero erros TypeScript, zero latência de render no simulador.

---

*Claude é responsável pela integridade matemática e arquitetural do produto.*
*Gemini é parceira estética e editorial fora do produto.*
*Nenhuma das duas substitui a revisão de Raphael em decisões de paradigma matemático.*
