# PRD: Calculadora de Perspectiva Matemática (ICM Toy SOTA)

> Documento de Requisitos de Produto (Alinhado à Especificação Matemática)

## Estrutura Simétrica

### 1. Problema

O modelo tradicional de cálculo de poker (ChipEV/ICM estático) baseia-se em heurísticas falhas, principalmente as "Pot Odds". Essa abordagem ignora o fluxo dinâmico do jogo, não precifica o passivo estrutural das Reverse Implied Odds (RIO) em potes multiway, e desconsidera a Edge Relativa, levando jogadores à insolvência estratégica e à abstenção de lucro.

### 2. Resultado Esperado

Um simulador visual interativo (Toy Game) no frontend que demonstre matematicamente a degradação da utilidade real (Perspectiva Matemática) frente ao incentivo ilusório das Pot Odds. A ferramenta deve exibir graficamente o ponto exato onde um "call barato" se torna letal.

### 3. Requisitos

- **R-01 (Motor de Cálculo):** Implementar as equações de EV_fold dinâmico (t-3, payjumps) e Coeficiente de Insolvência (C_i).
- **R-02 (Simulação MW):** O sistema deve recalcular exponencialmente o peso das RIO ao escalar o número de jogadores ativos (cenário Multiway).
- **R-03 (Camada Visual):** Plotar a "Curva de Insolvência" usando Recharts, sobrepondo a linha estática de Pot Odds contra a curva decrescente da Perspectiva Matemática.
- **R-04 (Inputs Reativos):** Fornecer controles UI para `stack_efetivo`, `tempo_blinds_min`, `distancia_payjump` e `edge_oponentes`.

### 4. Riscos

- **Sobrecarga Cognitiva (UX):** A complexidade da tese matemática (Fator de Realização, Amortização de Edge) pode confundir o usuário se não for exposta de forma progressiva e visual na UI.
- **Performance Matemática:** Cálculo excessivo na thread principal do React (Frontend) caso os cenários sejam simulados iterativamente para a geração dos eixos do gráfico.
