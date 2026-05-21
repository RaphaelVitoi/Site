# PRD: Calculador de ICM Interativo
> **Autor:** CHICO (atuando como @planner)
> **Status:** Pronto para Especificação Técnica
> **Épico Relacionado:** EPIC-BLOG

---

## 1. Visão: O Laboratório de ICM

Transformar o conceito abstrato de ICM (Independent Chip Model) em uma experiência tátil e visual. Em vez de uma calculadora estática, criaremos um **laboratório interativo** onde os usuários não apenas calculam a equity, mas **sentem** o impacto de cada ficha. A ferramenta deve encarnar o princípio de "Aprendizado Generativo".

## 2. Público-Alvo

- **Primário:** Jogadores de poker (alunos) que já ouviram falar de ICM, mas lutam para aplicar o conceito sob pressão.
- **Secundário:** Jogadores avançados que desejam refinar sua intuição em cenários marginais.

## 3. Requisitos Funcionais (User Stories)

*   **Como usuário, eu quero** poder inserir o número de jogadores, os stacks de fichas de cada um e a estrutura de premiação **para** obter a equity em dólar ($) de cada jogador.
*   **Como usuário, eu quero** ver uma representação gráfica (gráfico de barras ou pizza) da equity de cada jogador **para** entender visualmente a distribuição de valor.
*   **Como usuário, eu quero** poder arrastar sliders para ajustar os stacks de fichas **para** ver o impacto no ICM de todos os jogadores em tempo real.
*   **Como usuário, eu quero** um botão "E se?" que simule cenários comuns (ex: "o short stack dobra contra o chip leader") **para** entender a dinâmica de risco e recompensa sem precisar recalcular tudo manualmente.
*   **Como usuário, eu quero** poder simular uma situação de all-in entre dois jogadores **para** visualizar a mudança de equity resultante para todos na mesa.

## 4. Requisitos Não-Funcionais

| Requisito | Descrição | Alinhamento Filosófico |
|---|---|---|
| **Performance** | Os cálculos e a atualização da UI devem ser instantâneos (<100ms) para garantir a fluidez da interação com os sliders. | "Beleza Como Padrão" (uma UI lenta é feia). |
| **Design** | A interface deve ser minimalista, intuitiva e esteticamente agradável, focada na clareza da informação. | "Hierarquia Clara", "Foco". |
| **Responsividade** | A ferramenta deve ser totalmente funcional em dispositivos móveis e desktops. | "Orientado para o Outro" (acessível a todos). |
| **Portabilidade** | O componente deve ser facilmente incorporável em qualquer artigo do blog. | Potencializa o conteúdo escrito. |

## 5. Fora do Escopo (v1)

- Cálculos de ICM para mais de 10 jogadores.
- Análise de ranges de mãos (será uma feature separada, ex: "Analisador de Push/Fold").
- Login de usuário para salvar cenários (pode ser v2).