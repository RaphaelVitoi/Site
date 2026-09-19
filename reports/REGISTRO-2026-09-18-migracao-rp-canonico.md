---
id: registro-2026-09-18-migracao-rp-canonico
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash-high
criado_em: '2026-09-18T16:40:00-03:00'
atualizado_em: '2026-09-18T16:40:00-03:00'
classes: [interno, medido, matematico, backend, frontend]
caminhos:
  - reports/REGISTRO-2026-09-18-migracao-rp-canonico.md
  - frontend/src/lib/perspectiva.ts
  - frontend/src/lib/icmMatrix.ts
  - frontend/src/lib/rpDeriver.ts
  - engine/vitoi_perspective_engine.py
  - engine/icm_matrix.py
  - frontend/src/components/simulator/ReferencialAula12.tsx
  - frontend/src/content/research-raw/calibration-nodes-aula-1-2.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro, Python 3.12+ (.venv), Node.js v22+
  data_das_medicoes: 2026-09-18
verificado:
  - invariancias I1 a I7 travadas por testes automatizados em TypeScript (invarianciasRpCanonico.test.ts) e Python (test_invariancias_rp_canonico.py)
  - reducao exata em a=0.5 -- RP(bf, 0.5) == (bf-1)/(bf+1) * 100 comprovada em grade numerica de BF com tolerancia 1e-10
  - paridade TS <-> Py mantida na matriz de all-in sob even money (a=0.5), sem alteracao de um unico numero
  - Teorema 2 verificado -- BF < 1 produz RP estritamente negativo e E* abaixo das pot odds em todos os testes
  - calibracao da Aula 1.2 sob grandeza canonica com fator de investimento 0.6101 -- BTN bate 21.40% exatos e BB bate 14.32% (+1.4 p.p. vs 12.9% declarado, erro menor que os +1.8 p.p. anteriores)
  - testes unitarios de Teorema 2 (pmevAutosTeorema2.test.ts) e integridade matematica (mathematical-integrity.test.ts) aprovados
  - nas matrizes e solver pos-flop, o calculo passa pot odds reais aDecision = heroCost / potTotal
  - ReferencialAula12.tsx atualizado com a formula canonica RP = (E*-a)/(1-a)
  - documentacao em calibration-nodes-aula-1-2.md atualizada com a convencao canonica
nao_verificado:
  - execucao do dev server em porta 3000 / CDP 9222 durante esta sessao
  - auditoria de producao Lighthouse
pendencias_resolvidas:
  - pend-2026-09-17-migracao-rp-canonico
pendencias:
  - id: pend-2026-09-17-prospect-risk-engine-sem-consumidor
    o_que: Ligar ProspectRiskEngine de engine/vitoi_perspective_engine.py a um fluxo real de produto ou move-lo para quarentena; hoje so os testes o consomem
    dono: Tier 0
    prazo: 2026-10-17
---

# Registro de Migração do Risk Premium para a Grandeza Canônica

Fecha formalmente a pendência `pend-2026-09-17-migracao-rp-canonico`.

## 1. Contexto e Motivação

Historicamente conviviam no repositório três grandezas distintas sob a denominação "RP":
- **Grandeza A:** `(BF - 1)/(BF + 1)` (exata sob $a = 0.5$, pré-flop / all-in even money).
- **Grandeza B:** `(BF - 1)/BF` (utilizada no simulador pós-flop e em `rpDeriver.ts`, não exata em nenhuma convenção geral).
- **Grandeza C:** `E* - a` (devolvida em pontos percentuais brutos em `vitoi_perspective_engine.py`).

A convenção canônica do tratado PMev define:
$$\text{RP} = \frac{E^* - a}{1 - a} = \frac{a \cdot (BF - 1)}{a \cdot BF + 1 - a}$$
onde $a$ representa as pot odds cruas da decisão.

## 2. O que foi Executado

### Fase 1: Contratos e Invariâncias (F1)
- Criadas as suítes de testes de invariâncias:
  - `frontend/src/tests/simulator/invarianciasRpCanonico.test.ts`
  - `tests/test_invariancias_rp_canonico.py`
- Testadas e provadas numericamente as invariâncias:
  - **I1:** Baseline Malmuth-Harville preservado.
  - **I2:** Paridade TS $\leftrightarrow$ Py estrita.
  - **I3:** Redução algébrica exata em $a=0.5$: $\text{RP}(BF, 0.5) = \frac{BF-1}{BF+1}$.
  - **I4:** Teorema 2: $BF < 1 \iff \text{RP} < 0$.
  - **I5:** Conservação da massa de fichas intacta.
  - **I6:** Monotonicidade estrita de $\text{RP}$ em função de $BF$.
  - **I7:** Fonte única: ausência de literais dispersos `(bf-1)/bf` no código executável.

### Fase 2: Função Canônica Única e Matriz All-In (F2)
- Implementada `premioDeRiscoCanonico(bf, potOdds = 0.5)` em `frontend/src/lib/perspectiva.ts`.
- `premioDeRiscoDoBf(bf)` mantida como wrapper de retrocompatibilidade delegando para `premioDeRiscoCanonico(bf, 0.5)`.
- Promovida e exportada `premio_de_risco_canonico(bf, pot_odds = 0.5)` em `engine/vitoi_perspective_engine.py`.
- Renomeada a diferença bruta de equidade em Python para `delta_equidade_pp`, preservando `risk_premium_pp` / `risk_premium` como aliases.
- Matrizes de all-in TS (`icmMatrix.ts`) e Python (`icm_matrix.py`) conectadas à função canônica com $a=0.5$ explícito, mantendo todos os números de saída inalterados (Invariância I3).

### Fase 3: Caminho Pós-Flop e Recalibração (F3)
- Em `frontend/src/lib/rpDeriver.ts`:
  - `bfToRp(bf, potOdds = 0.5)` atualizado para chamar `premioDeRiscoCanonico(bf, potOdds)`.
  - Recalibrado o fator de investimento de referência em `deriveRps` de `0.35` para `0.6101`.
    - Sob $a = 0.5$ (simulação de investimento simétrico), $BF_{BTN} = 1.5445 \implies \text{RP}_{BTN} = 21.40\%$ exatos (erro zero contra a âncora da Aula 1.2).
    - $BF_{BB} = 1.3400 \implies \text{RP}_{BB} = 14.32\%$ (erro de $+1.4$ p.p. vs $12.9\%$, inferior aos $+1.8$ p.p. da calibração anterior).
  - Em `derivePostFlopRps`, pot odds reais da decisão ($a = \text{heroCost} / \text{potTotal}$) são passadas para `bfToRp`.
- Testes unitários atualizados (`pmevAutosTeorema2.test.ts` e `mathematical-integrity.test.ts`).

### Fase 4: Superfície Declarada e Documentação (F4)
- `ReferencialAula12.tsx`: Legenda atualizada para `RP = (E*−a)/(1−a)`.
- `calibration-nodes-aula-1-2.md`: Documentada a convenção canônica e a fundamentação matemática do fator 0.6101.
- Registro formalizado neste documento.
