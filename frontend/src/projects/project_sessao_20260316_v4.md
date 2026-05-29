---
name: Sessão 20260316 v4 — Refinamento Visual e Bug SPR
description: Estado após sessão de refinamento tipográfico completo do site e identificação de bug conceitual no SprPipeline
type: project
---

Sessão de refinamento visual. Último commit: `aa83fee`.

**Why:** Harmonização tipográfica do site inteiro + identificação de inconsistência pedagógica no SprPipeline.

**How to apply:** Próxima sessão deve corrigir o SprPipeline antes de qualquer outra tarefa.

## O que foi feito

### biblioteca/page.tsx
- Cards com `align-items: start` (sem vazio) usando `hub-card` padrão
- `.article-tag` nas tags
- Seção "Próximas Adições" (3 cards compactos sem CodeBlock quebrado)
- Callout com links para conteúdo existente
- `article-nav` no rodapé

### MasterSimulator — tipografia
- Tool buttons: `0.7rem`, border visível, bg opaco `#1e2245` (fix contraste WCAG)
- `useScenario.ts`: fix hydration error — localStorage via `useEffect` pós-mount (era no initializer do useState)
- `gaugeValue`: `clamp(1.4rem,12vw,1.8rem)` → `1.2rem` fixo
- `gaugeWrap`: 140px → 130px
- `scenarioBtnSub`: `0.52rem` + `opacity: 0.55` (invisível) → `0.58rem` + `color: #64748b` explícita
- `scenarioBtnName`: `0.75rem` → `0.82rem` / `#e2e8f0`
- Proporção sub/name: razão ~1:1.41 (raiz de 2)
- `scenarioBtnActive` background: gradiente translúcido → `#1e2245→#111827` (opaco, elimina warning SonarQube)
- `ScenarioStage` h2: `clamp(1.4rem,3vw,1.8rem)` w900 → `clamp(1rem,2vw,1.3rem)` w700
- `NashPanel`: verdict badge compacto, sensitivity 0.7rem, baseline 0.58rem

## Bug Identificado — SprPipeline (NÃO CORRIGIDO)

**Localização:** `components/simulator/ui/SprPipeline.tsx` + dados em `engine/scenarios.ts`

**Problema duplo:**

### 1. Título errado
O componente exibe `"VAZAMENTO DE RISK PREMIUM (DEFENSOR)"` mas o que está sendo plotado é **SPR (Stack-to-Pot Ratio)**, não Risk Premium. São conceitos distintos:
- SPR = stack efetivo / pot
- RP = percentual de equidade extra exigida pelo ICM

O título correto seria algo como `"Diluição do SPR por Street"` com subtítulo explicando que SPR menor = maior pressão de ICM = RP mais alto.

### 2. sprValue = 0.0 no RIVER contradiz a narrativa
Para o cenário `pacto` (O Pacto Silencioso):
```
sprData: [
  { name: 'PRE',   potSize: 2.5,  sprValue: 26.0 },  ← correto: 65/2.5 = 26
  { name: 'FLOP',  potSize: 8.0,  sprValue: 7.6  },  ← razoável
  { name: 'TURN',  potSize: 24.0, sprValue: 1.7  },  ← razoável
  { name: 'RIVER', potSize: 65.0, sprValue: 0.0  },  ← PROBLEMA
]
```
SPR 0.0 no river = todo o stack no pot = all-in. Mas o Pacto Silencioso descreve exatamente a **evitação** de all-in entre CLs. Contradição narrativa direta.

Para o cenário `pacto`, SPR no river deveria ser algo como `0.3–0.6` (jogo conservador, algo ainda sobra).

### 3. Todos os cenários têm RIVER = 0.0
Verificar se outros cenários têm o mesmo problema ou se é convenção intencional ("all-in possível por river").

## O que fazer na próxima sessão

**Prioridade 1 — SprPipeline:**
1. Renomear título: `"Vazamento de Risk Premium"` → `"Diluição do SPR por Street"`
2. Adicionar legenda/tooltip explicando a relação: SPR baixo → RP alto → ICM pressiona
3. Corrigir sprValue do RIVER no cenário `pacto`: `0.0` → valor realista (`~0.4`)
4. Auditar os outros 8 cenários — verificar se o RIVER 0.0 é intencional ou erro

**Prioridade 2 — Páginas restantes:**
- `app/page.tsx` (homepage): hero com inline styles, badges afiliação sem classe
- `quem-sou/page.tsx`: badges inline, video-wrapper
- `psicologia-hs/page.tsx`: h2 gradient inline

**Prioridade 3 — Deploy:**
- Pipeline Vercel/Netlify para trueICM.com ainda não configurado
