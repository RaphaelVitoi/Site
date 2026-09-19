---
id: registro-2026-09-17-spot-aula12-filtragem-e-indiferenca-nash
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-17T22:30:00-03:00'
atualizado_em: '2026-09-17T22:30:00-03:00'
classes: [interno, medido, frontend, simulador, handoff]
caminhos:
  - reports/REGISTRO-2026-09-17-spot-aula12-filtragem-e-indiferenca-nash.md
  - frontend/src/lib/bayesianRangeEngine.ts
  - frontend/src/components/simulator/panels/BayesianBeliefPanel.tsx
  - frontend/src/components/simulator/hooks/useBayesianRange.ts
  - frontend/src/components/simulator/GtoCfrContent.tsx
  - frontend/src/components/simulator/ui/BayesianPokerTable.tsx
  - frontend/src/components/simulator/ui/PlayingCard.tsx
  - frontend/src/tests/simulator/bayesianRangeEngine.test.ts
  - frontend/src/tests/simulator/bayesianPokerTable.test.tsx
  - reports/agent-calibration/feedback-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 3ee43c77
  host: Windows 11 Pro 10.0.26200, dev server Next 16.3.5 em :3000, Chrome via DevTools
  data_das_medicoes: 2026-09-17
verificado:
  - integracao canonica dos dados da Aula 1.2 no bayesianRangeEngine.ts e BayesianBeliefPanel.tsx
  - filtragem cumulativa de range por rua (Flop 51 combos, Turn 38 combos, River Bluff Catcher 15 combos)
  - frequencias locais condicionais P(Acao | Chegou) em cada celula do grid
  - indiferenca de Nash renderizada com split bands em gradiente proporcional (linear-gradient) e indicador visual
  - barra global de distribuicao continua no topo do grid refletindo frequencias do HRC
  - icone do botao Turn Barrel corrigido para fa-fire-flame-curved preservando compatibilidade com fontawesome-subset
  - suite Jest (bayesianRangeEngine.test.ts, bayesianPokerTable.test.tsx, fontawesomeSubset.test.ts) com 32/32 aprovados (0 erros, 0 warnings)
  - typecheck estrito (npm run typecheck) aprovado sem erros
  - eslint limpo em todos os arquivos modificados
  - feedback de calibracao 9.5 (-0.5 latencia macro vs micro) registrado na sequencia 77 do ledger com hash verificado
nao_verificado:
  - re-solve PioSolver completo de 60 GB para a arvore inteira do river (utilizadas tabelas e dados transcritos da Aula 1.2)
  - execucao do pipeline completo de e2e com Playwright headless em ambiente CI (apenas inspecao ao vivo via browser)
revisoes_de_ancora:
  - registro: registro-2026-09-12-ativacao-solvers-teoria-dos-jogos-e-multiway-pmev
    caminhos:
      - frontend/src/lib/bayesianRangeEngine.ts
      - frontend/src/tests/simulator/bayesianRangeEngine.test.ts
      - frontend/src/components/simulator/panels/BayesianBeliefPanel.tsx
      - frontend/src/components/simulator/hooks/useBayesianRange.ts
      - frontend/src/components/simulator/GtoCfrContent.tsx
    parecer: Extensao do motor bayesiano com dados exatos de HRC/GTO Wizard da Aula 1.2, filtragem cumulativa e suporte a indiferenca de Nash sem quebra de contratos preexistentes.
  - registro: registro-2026-09-14-saneamento-linters-pmev-e-engines
    caminhos:
      - frontend/src/lib/bayesianRangeEngine.ts
    parecer: Tipagem estrita preservada com novos tipos SolverNodeData, ComboNodeState e NodeAction.
  - registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
    caminhos:
      - frontend/src/components/simulator/panels/BayesianBeliefPanel.tsx
    parecer: Layout responsivo do grid mantido com adicao de barra continua e gradientes split.
  - registro: registro-2026-09-13-otimizacoes-helpers-antientropia-e-feedback
    caminhos:
      - frontend/src/components/simulator/GtoCfrContent.tsx
    parecer: Preservada a estrutura JSX limpa com integracao de BayesianPokerTable.
---

# Registro: Coerencia Canonica Aula 1.2, Filtragem Cumulativa e Indiferenca de Nash

Sessao de refinamento matematico e visual do simulador GTO/CFR (`/simulador/gto-cfr`).

## 1. Contexto e Motivacao

Reconstrucao e alinhamento do grid 13x13 e da mesa de poker de acordo com os dados, notas e imagens do documento Aula 1.2 de Raphael Vitoi:

1. ChipEV e ICMev construidos sob mesmos criterios, onde ChipEV nao possui Risk Premium e nem premiacao.
2. Acompanhamento rigoroso dos outputs dos solvers (HRC vs GTO Wizard).
3. Filtragem cumulativa de range: a medida que as acoes avancam, o range ativo encolhe visivelmente.
4. Porcentagens de cada celula expressam frequencias condicionais locais P(Acao | Chegou), nao totais pre-flop.
5. Indiferenca de Nash e ruido de balanceamento representados por gradientes em faixas proporcionais (linear-gradient).
6. Correcao do icone do botao Turn Barrel.

## 2. Implementacoes Principais

### bayesianRangeEngine.ts

- `getSolverNodeData()` com matrizes exatas de `cbet_small`, `check_raise`, `barrel_heavy`, `bluff_polar` e `call_condensed` para contextos `icm` e `chipev`.
- `computeSplitGradient()` para geracao de cores divididas proporcionais as acoes do combo.
- Modelagem do fenomeno TT-66: check 100% no ICMev vs aposta ~97% no ChipEV.

### BayesianBeliefPanel.tsx

- Grid 13x13 com estilizacao atenuada para combos filtrados (W_arr = 0).
- Gradiente linear de indiferenca para combos com acoes mistas (AQs, KTs, JTs, Q9s, Q8s).
- Barra de distribuicao continua superior no formato institucional do solver.
- Icone `fa-fire-flame-curved` ambar ativo no botao Turn Barrel.

### useBayesianRange.ts

- Exposicao de `combosLeft` refletindo o afunilamento de range: 445 -> 51 -> 38 -> 15 combos.

### BayesianPokerTable.tsx (NOVO)

- Preset canonico Aula 1.2 FT Kd Jc Ts, com stacks reais da FT (BTN 38 BB, BB 53 BB, UTG 9.3 BB, MP 6.9 BB, SB 13 BB, CO 24 BB) e badge de Risk Advantage (+8.5%).

## 3. Calibracao e Feedback Registrado

- Nota: 9.5 / 10
- Punicao: -0.5 devido a latencia em focar no macro antes de desenvolver o micro.
- Aprendizado: Priorizar a execucao cirurgica e direta da mecanica micro das celulas e nos do solver (gradientes, filtragem e percentuais locais) antes de qualquer orquestracao ou scaffolding em nivel de componente macro.
- Ledger: Gravado na sequencia 77 de `reports/agent-calibration/feedback-ledger.jsonl` com hash `f54a3186bf33e322aec6243a33e31c7de75fe5fd9bb1f5c7c3b3b821acfb683d`.

## 4. Aprendizados para Continuidade

1. **FontAwesome Subset:** `fa-fire` nao consta no subset local; usar `fa-fire-flame-curved`.
2. **JSX Text Escapes:** KaTeX e `\$` em JSX raw causam parse errors; usar texto plano (`EV(A1) = EV(A2)`).
3. **noUncheckedIndexedAccess:** Indexacao de array como `actions[0]` requer guard explicito.
4. **Macro vs Micro:** Focar primeiro na mecanica micro (frequencias, gradientes, filtros) antes de construir scaffolding macro (componentes-container, layout, orquestracao).
