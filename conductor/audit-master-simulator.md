# Plano de Auditoria: MasterSimulator e Teoria do Frontend

## 1. Objetivo
Realizar uma auditoria profunda e sistemática da teoria, conteúdo, matemática e código dos componentes do simulador de poker presentes no frontend. O foco será cruzar a implementação do `MasterSimulator` e a "Perspectiva Matemática" (PM) com as formulações teóricas originais de Raphael Vitoi.

## 2. Escopo & Arquivos Chave
- **Orquestrador:** `MasterSimulator.tsx`
- **Motores Matemáticos:** 
  - `lib/perspectiva.ts` (Core da Equação Unificada)
  - `engine/nashSolver.ts` (Ajustes de Frequência Nash/GTO)
  - `lib/montecarlo.ts` (Cálculo ICM estocástico)
- **Painéis Associados:**
  - `EquityCalculator.tsx`
  - `NashPanel.tsx`
  - `PmLensPanel.tsx`
  - `TheoryPanel.tsx`
  - `PostFlopPanel.tsx`
- **Processamento de Dados:** `lib/handParser.ts`
- **Documentação Teórica Base (Paradigma Vitoi):**
  - `frontend/research/icm-materials/icmteoriaadicionalpt1.txt`
  - `frontend/research/icm-materials/icmteoriaadicionalpt2.txt`
  - `.backups_sota/temp_28/archive/legacy_icm_components/entendendo-o-icm-e-suas-heuristicas.md`
  - `TEORIA_PERSPECTIVA_MATEMATICA_VITOI.md`
  - `memory/project_teoria_icm_original_20260321.md`
  - `.backups_sota/temp_28/memory/project_teoria_icm_perspectiva_esperanca.md`

## 3. Fases da Execução

### Fase 1: Auditoria da Orquestração (`MasterSimulator.tsx`)
- Mapear como o `MasterSimulator` gerencia o estado global (banco de dados em memória vs. workers).
- Avaliar a coerência do loop de atualização (`useQuantumEngine`, `useScenario`).
- Identificar possíveis race conditions na troca de "Quantum Sync" (atualizações síncronas/assíncronas).

### Fase 2: Auditoria Matemática Estrita (vs Paradigma Vitoi)
- **O Axioma do EV do Fold:** Validar se o motor reconhece o EV de fold como baseline dinâmico (não zero), impactado por *payjumps* (podendo ser positivo) e pelo *Pot Entrapment* pós-flop (fortemente negativo).
- **Equação Unificada (PM):** 
  - Destrinchar a fórmula `PM = [(Equity * R) * Valuation] - [EV_fold(t, dpj, pos) + RIO_mw]`.
  - Avaliar a coerência das camadas da Hierarquia Cognitiva: ICM (Estático) -> Esperança Matemática (Lógica) -> Expectativa Matemática (Preditiva) -> Perspectiva Matemática (Síntese).
  - Validar a precificação das Reverse Implied Odds (RIO) em cenários Multiway, garantindo a insolvência das "Pot Odds" sob alta entropia.
- **Solver de Nash e Diluição de RP:**
  - Validar a aplicação do "Teto do RP", a "Vantagem de Risco" (diferença entre RP ida e volta) e a especulação assimétrica.
  - Verificar se o simulador entende a diluição do Risk Premium pelas streets (menor impacto da colisão inicial compensado pela atratividade do pote).
- **Amortização da Edge:** Verificar como a profundidade de stack altera a árvore de decisão (jogadores fracos com 10bbs têm erro reduzido contra os CLs).

### Fase 3: Coerência de Conteúdo e Teoria (`TheoryPanel` e UI)
- Revisar tooltips (ex: "Guia SOTA", Delta, P.P.) para garantir alinhamento terminológico com os documentos originais (ex: não usar "Overfold", usar "Fold Estrutural").
- Verificar a correta atribuição do fenômeno "Downward Drift" a O'Kearney & Carter.
- Ler os artigos embutidos para garantir o tom correto: Pot Odds como conceito obsoleto frente à Perspectiva; a Agressão do CL como manutenção do sistema; e a não irrelevância da intuição (Fator Ψ / Taxa de Maluquice Humana) - embora esta última talvez esteja fora do escopo simulado em código duro, deve estar no conteúdo.

### Fase 4: Parsing e Integração de Mãos (`handParser.ts`)
- Avaliar a capacidade do parser de lidar com formatos de histórico de mãos (PokerStars, GG, etc.).
- Garantir que as variáveis extraídas servem perfeitamente à equação da Perspectiva Matemática (ex: stacks efetivos, posição e preflop dead money).

## 4. Verificação & Conclusão
- Listar anomalias teóricas, dissonâncias cognitivas ou bugs matemáticos encontrados (se houver).
- Propor correções ou refinamentos de código para que o motor represente 100% o estado da arte das formulações originais.
- Formalizar e apresentar o resultado final para o usuário.
