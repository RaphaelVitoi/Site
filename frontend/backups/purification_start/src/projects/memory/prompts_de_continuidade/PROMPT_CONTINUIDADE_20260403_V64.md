---
name: Prompt de Continuidade V64
description: V64 — Auditoria conteúdo ICM 4 páginas corrigidas (hierarquia E/P/E, ΔRP sign, teto emergente, ΔPerspectiva). GTO Wizard validação. ΔRP definição formal. Próximo: formalizar E/P/E em página dedicada → CSS vars → Quiz/Theory expandir.
type: project
---

## Estado Atual (V64 — 2026-04-03)

### Commit
Nenhum commit nesta sessão. Mudanças em 4 arquivos de conteúdo + memória.

### O que foi feito nesta sessão

1. **Absorção de 2 artigos GTO Wizard como fontes de validação:**
   - "MDF vs ICM: Rethinking Bluffing & Defense Strategies in MTTs" — confirma que MDF quebra sob ICM (valida Opção B do motor), confirma que agressor blefa mais quando defensor tem RP alto
   - "How ICM Impacts Postflop Strategy" — confirma covering player mais agressivo, Downward Drift, supressão de large bets (alinha com k_ip_bet_large = -12)

2. **Discussão teórica profunda — Perspectiva/Esperança/Expectativa:**
   - Framework E/P/E formalizado como extensão do ICM EV que captura o que solvers/FGS não conseguem
   - Exemplo CL: não maximiza ICM EV do pot, protege Perspectiva contra crescimento dos rivais
   - Exemplo river após 3 streets: decisão depende de ΔPerspectiva do pot ganho, não apenas RP acumulado
   - Crítica a FGS em solvers: raciocínio impecável sobre modelo incompleto. Solver resolve o pot; framework resolve o torneio.

3. **Auditoria completa de 4 páginas de conteúdo ICM — 6 correções:**

   **CRÍTICOS corrigidos:**
   - `leitura-icm`: Hierarquia das camadas estava INVERTIDA (Gemini colocou Esperança no topo). Corrigido: ICM EV → Esperança → Expectativa → Perspectiva
   - `icm-masterclass`: ΔRP formula `RP_OOP − RP_IP` → `RP_IP − RP_OOP` (alinhado ao motor)
   - `leitura-icm`: "Teto do RP 24%" apresentado como limite fixo → corrigido para emergente da equação, 24% como âncora empírica

   **SIGNIFICATIVOS corrigidos:**
   - `conceitos-icm`: `ΔEquity` → `ΔPerspectiva` em toda a seção Esperança
   - `icm-pos-flop`: "Risk Advantage +8.5% a favor do BTN" → "a favor do BB (RP menor)"
   - `leitura-icm`: "SOTA v3.2" (artefato Gemini) → "Framework ICM"

4. **Definição formal do ΔRP registrada:**
   - ΔRP = RP_IP - RP_OOP
   - Representa quanto a maior stack (RP menor) pode agredir proporcionalmente
   - Define o teto abstrativo de defesa para a stack menor (RP maior)
   - A subtração é a vantagem de risco a favor do RP menor (maior stack) = desvantagem de risco do RP maior (menor stack)

5. **Atribuição Downward Drift confirmada:**
   - O'Kearney & Carter: conceito qualitativo original
   - Raphael Vitoi: quantificação via k_A e bExponent (extensão original)
   - Crédito inline correto em 3 das 4 páginas — padrão profissional

### Arquivos modificados nesta sessão
- `frontend/src/app/aulas/icm-masterclass/page.tsx` — ΔRP formula + detail
- `frontend/src/app/aulas/icm-pos-flop/page.tsx` — Risk Advantage label + callout
- `frontend/src/app/aulas/conceitos-icm/page.tsx` — ΔEquity→ΔPerspectiva
- `frontend/src/app/aulas/leitura-icm/page.tsx` — hierarquia, teto, ΔRP, versioning

### Issues pendentes (herdados de V63)

| # | Sev | Item | Status |
|---|-----|------|--------|
| 1 | Alto | Quiz 1 opção (placeholder) em todos os cenários | PENDENTE |
| 2 | Alto | Theory 1 frase (placeholder) em todos os cenários | PENDENTE |
| 3 | Info | dangerouslySetInnerHTML em TheoryPanel | MONITORAR |
| 4 | Pendente | CSS vars nos painéis do simulador | PIPELINE |

### Pipeline de próximos passos

1. **Formalizar E/P/E em página dedicada** — Definições formais de Expectativa, Perspectiva, Esperança Matemática com equações, exemplos, e atribuição. conceitos-icm já tem base sólida; precisa de aprofundamento e pode ser a própria página ou uma nova.
2. **CSS vars** — Migrar cores hardcoded (hex) nos painéis do simulador para CSS variables de globals.css, garantindo que mudanças futuras no site propaguem automaticamente.
3. **NashPanel.tsx** — Reescrever para Opção B (6 ações: ip_check, ip_bet_small, ip_bet_large, oop_call, oop_fold, oop_raise). Inputs: chipEvFreqs editável + aggressionFactor. Outputs: center%, spread(±), delta vs ChipEV.
4. **Quiz expandir** — 3-4 opções por cenário.
5. **Theory expandir** — Conteúdo real do framework E/P/E.

### Fontes de validação externas registradas
- GTO Wizard "MDF vs ICM" (2025) — MDF quebra sob ICM, covering player mais agressivo
- GTO Wizard "How ICM Impacts Postflop" (2025) — Downward Drift confirmado, small sizing dominante sob ICM
- O'Kearney & Carter — Downward Drift (conceito original qualitativo)

### Build
Zero erros. Lint passa.
