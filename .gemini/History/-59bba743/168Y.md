# ARQUITETURA SOTA: Templo de Aprendizado (QuizEngine)

> **Status:** Implementado e Homologado
> **Localização Base:** `frontend/src/components/quiz/`
> **Complexidade de Estado:** `O(1)`

## 1. Topologia da Solução
O motor gamificado de ensino foi fragmentado respeitando a responsabilidade única:
- **`QuizEngine.tsx`**: O cérebro. Orquestra a injeção das questões e gerencia o estado global.
- **`QuizProgress.tsx`**: Feedback visual de avanço.
- **`QuizQuestion.tsx`**: Renderizador atômico de opções e gabaritos.
- **`QuizResults.tsx`**: Tela de impacto e retenção.
- **`types.ts`**: Tipagem estrita de matrizes (`QuizQuestion`, `QuizOption`).

## 2. Decisões de Engenharia (Estado da Arte)

### 2.1. O(1) State Management
Em vez de iterar arrays com `.map()` ou `.find()` para verificar respostas e calcular o placar, o motor utiliza um Dicionário (`Record<string, string>`).
* **Vantagem:** Acesso direto via ID da questão. Elimina re-renderizações cíclicas e loops ocultos no momento do clique.

### 2.2. Economia Generalizada (Estética SOTA)
- **Tipografia Absoluta:** Todos os dados mutáveis (Timer, Placar, Paginação `01/10`) usam a classe/estilo `tabular-nums`. Isso força o *monospace* nos dígitos, impedindo que a interface "trema" ou mude de largura durante transições ativas.
- **Colorimetria Relacional:** Nenhuma cor *hardcoded* (hex/rgb) é permitida. Apenas injeção direta de `var(--sim-bg)`, `var(--sim-surface)`, `var(--sim-border)`, `var(--sim-success)` e `var(--sim-error)`.

## 3. Próximo Vetor de Expansão
A fundação UI está concluída. O próximo passo sistêmico é construir a ponte (API ou Rota Server-side) que alimentará o `QuizEngine` com as Matrizes Matemáticas GTO e cálculos de Risk Premium advindos do motor `icm.ts` e do banco de dados SQLite.