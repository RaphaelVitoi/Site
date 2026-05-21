---
name: Avaliacao completa site e simulador ICM
description: Auditoria da arquitetura, motor, conteudo e gaps do simulador ICM e site educacional. Referencia para todo trabalho futuro.
type: project
---

## Estado do Site e Simulador (2026-03-21)

### Contexto
- Site e 100% autoral de Raphael Vitoi sobre poker/ICM
- Conteudo textual e didatico e de Raphael - teoria original que nao existe na literatura
- Parte interativa (motor, calculos, outputs) foi placeholder funcional - matematica errada
- Conteudo textual esta pessimamente estruturado (organizacao, sequenciamento, hierarquia)
- Tudo e esboco degradado de algo que nem era versao final

### Arquitetura (SOLIDA - nao precisa ser repensada)
- 29 arquivos, separacao clara: engine / hooks / ui / panels / orquestrador
- Fluxo: cenario → nashSolver → gauges/panels (limpo, motor substituivel)
- 9 cenarios como objetos tipados (theory, exploit, sprData, quiz)
- Lazy loading nos 7 paineis secundarios
- TypeScript tipado, CSS module 1310 linhas

### O que funciona bem
- RiskGauge visceral (Death Zone, Predator Zone, audio)
- SprPipeline como visualizacao de dissipacao (precisa dados reais)
- RangeMatrix 13x13 interativa com localStorage
- Estrutura de cenarios extensivel sem refatoracao

### O que esta ERRADO (parte interativa)
1. Nash Solver: modelo linear com 5 constantes fixas. Nao captura Teto do RP gradual, inversao Parte II, nem Vantagem de Risco
2. sprData: valores de dissipacao estimados sem rastreabilidade
3. Quizzes: 1 pergunta por cenario, sem contexto (sizing, street, RP oponente)
4. Slider de agressividade: multiplicador linear, nao captura que agressividade e funcao da Vantagem de Risco
5. AI Coach: template filling sem motor real
6. Death Zone em 40% e corte binario arbitrario - efeito ja opera em 6% nos toy games

### O que FALTA (demandas da teoria de Raphael)
- Faixas ponderadas em vez de pontos fixos (distribuicao com centro de gravidade)
- Vantagem de Risco como metrica visivel e computada
- Especulacao Assimetrica modelada
- Economia de Perspectiva (CL briga por perspectiva, nao fichas)
- Formalizacao matematica dos conceitos originais

**Why:** O site e o veiculo para teoria original de Raphael sobre ICM pos-flop. A arquitetura serve, o conteudo existe, mas o motor e os dados precisam ser refeitos com rigor.
**How to apply:** Nunca reescrever a arquitetura - trabalhar dentro dela. Focar em substituir o motor e calibrar dados contra HRC. Conteudo textual e intocavel sem aprovacao de Raphael.
