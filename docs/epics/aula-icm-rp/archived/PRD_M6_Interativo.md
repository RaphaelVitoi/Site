# PRD: Modulo 6 - Simulador Interativo de Toy-Games

**Autor:** @planner | **Data:** 2026-03-11 | **Status:** Rascunho

---

## 1. Problema

A aula `aula-icm-rp.md` utiliza "Toy-Games" estaticos para explicar as dinamicas do Risk Premium (RP). Embora pedagogicamente eficaz, o formato de texto e tabelas nao permite que o aluno "sinta" a relacao entre as variaveis. A internalizacao de conceitos contraintuitivos (como o "Teto do RP" ou a reacao do OOP com RP baixo) seria acelerada se o aluno pudesse manipular as variaveis e observar as consequencias em tempo real.

---

## 2. Resultado Esperado

Um componente web simples, autocontido e interativo que sirva como um laboratorio para os "Toy-Games" do Modulo 2. O componente permitira ao usuario ajustar os valores de Risk Premium do agressor (IP) e do defensor (OOP) e visualizar instantaneamente o impacto nas frequencias otimas de bluff e defesa. O objetivo nao e ser um solver preciso, mas uma ferramenta didatica para acelerar a intuicao.

O componente deve ser integrado ao final do Modulo 2 do documento `aula-icm-rp.md`.

---

## 3. Historias de Usuario

-   **Como estudante da aula,** eu quero poder arrastar um slider que representa o RP do meu oponente e ver um grafico que me mostra o quanto a minha frequencia de bluff deve aumentar, para que eu possa internalizar a relacao entre a pressao que eu aplico e o risco que meu oponente corre.
-   **Como estudante cetico,** eu quero poder replicar o cenario contraintuitivo da "Parte II" dos Toy-Games (onde o agressor tem RP alto) e ver com meus proprios olhos que a defesa do oponente diminui, para que eu acredite no conceito e pare de cometer esse erro.
-   **Como estudante focado,** eu quero uma ferramenta simples que modele *apenas* o cenario dos Toy-Games, sem a distracao de outras variaveis (board, ranges, etc.), para que eu possa focar em dominar uma unica variavel de cada vez.

---

## 4. Requisitos

### 4.1 Requisitos Funcionais (Comportamento)

| ID | Requisito | Prioridade | Notas |
| :--- | :--- | :--- | :--- |
| RF-01 | Deve haver dois controles de entrada (sliders) para definir o "RP do Agressor (IP)" e o "RP do Defensor (OOP)". | Deve | O range deve ir de 0% a 25% para cobrir os cenarios da aula. |
| RF-02 | O componente deve exibir dois outputs principais em tempo real: a frequencia de bluff do agressor e a frequencia de defesa do defensor. | Deve | Pode ser em percentual ou em um grafico de barras simples. |
| RF-03 | A logica de calculo deve ser baseada nos dados e principios dos 8 Toy-Games apresentados no Modulo 2. | Deve | O objetivo e a fidelidade pedagogica ao texto, nao a precisao de um solver. |
| RF-04 | Deve ser implementado com tecnologias web padrao (HTML, CSS, JavaScript) sem dependencias de frameworks pesados (React, Vue, etc.). | Deveria | Garante leveza, portabilidade e facilidade de manutencao. |
| RF-05 | O componente deve ser integrado ou "embedado" no documento `aula-icm-rp.md`, preferencialmente apos a conclusao do Modulo 2. | Deve | Para que o usuario interaja com a ferramenta logo apos aprender a teoria. |

### 4.2 Requisitos Nao-Funcionais (Qualidade)

| ID | Requisito | Prioridade | Notas |
| :--- | :--- | :--- | :--- |
| RNF-01 | O design visual deve ser limpo, minimalista e consistente com o estilo geral do site/documento. | Deve | Evitar distracoes visuais. |
| RNF-02 | O componente deve ser responsivo e funcional em telas de desktop e mobile. | Deveria | Para permitir o estudo em diferentes dispositivos. |
| RNF-03 | A interacao deve ser instantanea, sem atrasos perceptiveis ao arrastar os sliders. | Deve | A natureza da ferramenta exige feedback em tempo real. |

---

## 5. Fora do Escopo

-   **Solver de Poker Completo:** Esta ferramenta nao e e nao deve tentar ser um GTO Wizard ou DeepSolver. Ela apenas ilustra um cenario isolado.
-   **Configuracoes Adicionais:** Nao havera opcoes para mudar o tamanho do pote, o tamanho da aposta, os ranges das maos ou a textura do board.
-   **Armazenamento de Dados:** O estado do componente nao sera salvo. Cada visita comeca com os valores padrao.
-   **Logica de Solver Real:** A logica de calculo sera uma aproximacao ou interpolacao dos resultados dos Toy-Games, nao um calculo de equilibrio em tempo real.

---

## 6. Riscos

| Risco | Severidade | Mitigacao |
| :--- | :--- | :--- |
| A logica simplificada ser imprecisa e ensinar uma heuristica errada. | Alta | A SPEC deve deixar explicito que a logica e uma *interpolacao* dos resultados conhecidos dos Toy-Games, e o proprio componente deve ter uma nota de rodape afirmando seu proposito puramente didatico. |
| O desenvolvimento do componente atrasar a entrega das outras melhorias. | Media | Definir um escopo minimalista na SPEC, focando apenas no essencial para o ganho pedagogico e usando tecnologias simples (vanilla JS). |
| A integracao com o documento Markdown se provar tecnicamente complexa. | Baixa | A SPEC deve prever um metodo de fallback simples, como um link para uma pagina separada, caso o "embed" direto falhe. O uso de `<iframe>` e geralmente uma solucao robusta. |


