# PRD: Calculador de ICM Interativo
> **Autor:** CHICO (atuando como @planner)
> **Status:** Pronto para Especificacao Tecnica
> **Epico Relacionado:** EPIC-BLOG

---

> ** ALERTA DE LEGADO E CONTINUIDADE:** Este PRD descreve a **V2 (Universal)**. O sistema ja possui uma **V1 (Prototipo Didatico de Toy-Games)** funcional esculpida em `components/interactive/icm_toy_game_simulator.html`. A V2 NAO descarta a V1, mas evolui o conceito. A V1 deve ser tratada como a "versao de fundacao" para UI e regras de negocio base.

## 1. Visao: O Laboratorio de ICM

Transformar o conceito abstrato de ICM (Independent Chip Model) em uma experiencia tatil e visual. Em vez de uma calculadora estatica, criaremos um **laboratorio interativo** onde os usuarios nao apenas calculam a equity, mas **sentem** o impacto de cada ficha. A ferramenta deve encarnar o principio de "Aprendizado Generativo".

## 2. Publico-Alvo

- **Primario:** Jogadores de poker (alunos) que ja ouviram falar de ICM, mas lutam para aplicar o conceito sob pressao.
- **Secundario:** Jogadores avancados que desejam refinar sua intuicao em cenarios marginais.

## 3. Requisitos Funcionais (User Stories)

*   **Como usuario, eu quero** poder inserir o numero de jogadores, os stacks de fichas de cada um e a estrutura de premiacao **para** obter a equity em dolar ($) de cada jogador.
*   **Como usuario, eu quero** ver uma representacao grafica (grafico de barras ou pizza) da equity de cada jogador **para** entender visualmente a distribuicao de valor.
*   **Como usuario, eu quero** poder arrastar sliders para ajustar os stacks de fichas **para** ver o impacto no ICM de todos os jogadores em tempo real.
*   **Como usuario, eu quero** um botao "E se?" que simule cenarios comuns (ex: "o short stack dobra contra o chip leader") **para** entender a dinamica de risco e recompensa sem precisar recalcular tudo manualmente.
*   **Como usuario, eu quero** poder simular uma situacao de all-in entre dois jogadores **para** visualizar a mudanca de equity resultante para todos na mesa.

## 4. Requisitos Nao-Funcionais

| Requisito | Descricao | Alinhamento Filosofico |
|---|---|---|
| **Performance** | Os calculos e a atualizacao da UI devem ser instantaneos (<100ms) para garantir a fluidez da interacao com os sliders. | "Beleza Como Padrao" (uma UI lenta e feia). |
| **Design** | A interface deve ser minimalista, intuitiva e esteticamente agradavel, focada na clareza da informacao. | "Hierarquia Clara", "Foco". |
| **Responsividade** | A ferramenta deve ser totalmente funcional em dispositivos moveis e desktops. | "Orientado para o Outro" (acessivel a todos). |
| **Portabilidade** | O componente deve ser facilmente incorporavel em qualquer artigo do blog. | Potencializa o conteudo escrito. |

## 5. Fora do Escopo (v1)

- Calculos de ICM para mais de 10 jogadores.
- Analise de ranges de maos (sera uma feature separada, ex: "Analisador de Push/Fold").
- Login de usuario para salvar cenarios (pode ser v2).

## 6. Referencias Existentes no Sistema (Para evitar retrabalho)

- **Simulador V1:** `components/interactive/icm_toy_game_simulator.html`. Deve ser estritamente usado como referencia de design de interface (UI dark mode, barras de progresso, sliders, feedback visual). A V2 em React deve herdar esta estetica de forma transparente.
- **Dados de Teste:** O arquivo V1 contem pontos de dados exatos baseados na aula (`aula-icm-rp.md`). O @verifier usara esses dados legados para testar se a matematica da nova V2 esta batendo com a teoria ja validada.
