# ARQUITETURA SOTA: Templo de Aprendizado (QuizEngine)

> **Status:** Implementado e Homologado
> **Localizacao Base:** `frontend/src/components/quiz/`
> **Complexidade de Estado:** `O(1)`

## 1. Topologia da Solucao

O motor gamificado de ensino foi fragmentado respeitando a responsabilidade unica:

- **`QuizEngine.tsx`**: O cerebro. Orquestra a injecao das questoes e gerencia o estado global.
- **`QuizProgress.tsx`**: Feedback visual de avanco.
- **`QuizQuestion.tsx`**: Renderizador atomico de opcoes e gabaritos.
- **`QuizResults.tsx`**: Tela de impacto e retencao.
- **`types.ts`**: Tipagem estrita de matrizes (`QuizQuestion`, `QuizOption`).

## 2. Decisoes de Engenharia (Estado da Arte)

### 2.1. O(1) State Management

Em vez de iterar arrays com `.map()` ou `.find()` para verificar respostas e calcular o placar, o motor utiliza um Dicionario (`Record<string, string>`).

- **Vantagem:** Acesso direto via ID da questao. Elimina re-renderizacoes ciclicas e loops ocultos no momento do clique.

### 2.2. Economia Generalizada (Estetica SOTA)

- **Tipografia Absoluta:** Todos os dados mutaveis (Timer, Placar, Paginacao `01/10`) usam a classe/estilo `tabular-nums`. Isso forca o *monospace* nos digitos, impedindo que a interface "trema" ou mude de largura durante transicoes ativas.
- **Colorimetria Relacional:** Nenhuma cor *hardcoded* (hex/rgb) e permitida. Apenas injecao direta de `var(--sim-bg)`, `var(--sim-surface)`, `var(--sim-border)`, `var(--sim-success)` e `var(--sim-error)`.

## 3. Proximo Vetor de Expansao

A fundacao UI esta concluida. O proximo passo sistemico e construir a ponte (API ou Rota Server-side) que alimentara o `QuizEngine` com as Matrizes Matematicas GTO e calculos de Risk Premium advindos do motor `icm.ts` e do banco de dados SQLite.
