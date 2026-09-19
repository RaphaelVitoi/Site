---
id: registro-2026-09-18-integracao-referencial-aula12-e-downward-drift
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-18T18:00:00-03:00'
atualizado_em: '2026-09-18T18:00:00-03:00'
classes: [interno, medido, qualidade, frontend, interface, operacao]
caminhos:
  - frontend/src/app/(public)/biblioteca/downward-drift-sota/page.tsx
  - frontend/src/app/(public)/biblioteca/nos-de-calibragem/page.tsx
  - frontend/src/app/(public)/biblioteca/page.tsx
  - reports/REGISTRO-2026-09-18-integracao-referencial-aula12-e-downward-drift.md
revisoes_de_ancora:
  - registro: registro-2026-09-14-saneamento-linters-pmev-e-engines
    caminhos:
      - frontend/src/app/(public)/biblioteca/nos-de-calibragem/page.tsx
    parecer: >
      Integracao do componente interativo ReferencialAula12.tsx na pagina
      /biblioteca/nos-de-calibragem com formulacao canonica de Risk Premium
      SOTA v8.0 GOLD, matrizes orbitais 9-max e visualizacao de heatmaps 13x13.
  - registro: handoff-2026-09-14-pagina-icm-contra-a-mesa-real
    caminhos:
      - frontend/src/app/(public)/biblioteca/page.tsx
    parecer: >
      Atualizacao do catalogo geral da biblioteca para sinalizar o status de
      laboratorio interativo em nos-de-calibragem e resumo tecnico atualizado.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro, Python 3.12+ (.venv), Node.js v22+
  data_das_medicoes: 2026-09-18
verificado:
  - inclusao do componente interativo ReferencialAula12 na rota /biblioteca/nos-de-calibragem com dynamic ssr:false
  - incorporacao da formulacao analitica do Risk Premium canonico e dados empíricos de investimento a=0.6101
  - sintese empirica dos 7 pares de nos de aula12_pairs.json em /biblioteca/downward-drift-sota (PR 63)
  - catalogacao enriquecida no indice central /biblioteca
  - validacao estrita tsc tsconfig.audit.json (exit 0)
  - validacao estrita eslint sem advertencias (exit 0)
  - suíte completa Jest com 95 suites e 653 testes aprovados (exit 0)
  - verificacao em tempo real via Chrome DevTools MCP (porta 9223) sem erros de console ou layout
  - portao de registro record_gate.py executado e aprovado
nao_verificado:
  - nenhum item
---

# Integracao do Referencial Aula 1.2 e Evidencias H8 de Downward Drift na Webpage

Este registro documenta a integracao completa de componentes e dados empiricos atualizados na interface publica do Site, sob o Protocolo Chico SOTA v8.0 GOLD.

## 1. Contexto e Diagnostico

Durante auditoria de materiais recentes de pesquisa e componentes existentes no repositorio, constatou-se que:
1. O componente interativo `frontend/src/components/simulator/ReferencialAula12.tsx` (desenvolvido com 3 modos de matriz, mesa orbital 9-max, heatmaps de range 13x13 de BTN e BB) existia no codebase, mas a rota publica correspondente (`/biblioteca/nos-de-calibragem/page.tsx`) mantinha texto legado sem renderizar o componente interativo.
2. A pagina `/biblioteca/downward-drift-sota/page.tsx` carecia dos resultados experimentais mensurados nos 7 pares de nos de `data/aula12_pairs.json` (decorrentes da auditoria e harmonizacao do PR #63 / commit `948f4f45`).
3. O catalogo central `/biblioteca/page.tsx` nao sinalizava o carater de laboratorio interativo ativo de `nos-de-calibragem`.

## 2. Implementacao Realizada

### 2.1 Atualizacao de `/biblioteca/nos-de-calibragem/page.tsx`
- Formalizacao da definicao canonica de Risk Premium:
  $$RP = \frac{E^* - a}{1 - a} = \frac{a(BF - 1)}{a \cdot BF + 1 - a}$$
- Inclusao das constantes de investimento calibradas na Aula 1.2 ($a = 0{,}6101$, $BF_{BTN} = 1{,}5445 \implies RP = 21{,}40\%$; $BF_{BB} = 1{,}3400 \implies RP = 14{,}32\%$).
- Importacao dinamica SSR-safe (`next/dynamic` com `ssr: false`) de `ReferencialAula12`.
- Integracao de `ContentPageHeader`, painel `GlassPanel` e `ContentFooter` mantendo a identidade visual Obsidian Analytics.

### 2.2 Atualizacao de `/biblioteca/downward-drift-sota/page.tsx`
- Adicao da Seção 4 reportando a medicao empirica nos 7 pares de nos de `data/aula12_pairs.json`:
  - 4 nos de livre aposta (apostas $\ge 50\%$ do pote caem de 21,3% no ChipEV para 0% no HRC Pós-Flop).
  - 3 nos de aumento (frequencias de aposta de 100% no ChipEV e 100% no HRC, evidenciando que a convencao de raise-by isolada requer modelagem dimensional propria).
  - Sensibilidade de bootstrap $N = 2.000$ e intervalos com conservacao rigorosa.

### 2.3 Atualizacao do Indice `/biblioteca/page.tsx`
- Marcacao de `nos-de-calibragem` com `isLab: true` e atualizacao do sumario descritivo para evidenciar o referencial interativo da Aula 1.2.

## 3. Verificacao de Integridade

- `npm run typecheck` (`tsc -p tsconfig.audit.json`): 0 erros.
- `npm run lint` (`eslint .`): 0 erros.
- `npm test`: 95 suites de teste, 653 testes unitarios e de integracao aprovados.
- Verificacao visual via Chrome DevTools MCP em `http://localhost:3000/biblioteca/nos-de-calibragem`: renderizacao perfeita da mesa orbital, heatmaps interativos e formulas KaTeX.
- Portao de pre-flight `record_gate.py`: aprovado.
