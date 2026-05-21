# VALIDATION FRAMEWORKS (@validador)
> **Status:** Ativo | **Objetivo:** Garantir precisão factual antes do lançamento de qualquer feature especialista.

## Checklists de Especialidade

### 1. Motor Matemático (ICM / Teoria dos Jogos)
- [ ] **Checksum de Nash:** Os ranges no cenário teste convergem para um $EV estabilizado (variação < 0.001)?
- [ ] **Malmuth-Harville Check:** A soma dos Equities de todos os jogadores vivos é **exatamente igual** à soma do Prizepool restante? (Obrigatório).
- [ ] **Card Combinatorics:** Mãos bloqueadas (ex: se o board tem um Ás, os combos de AA caem de 6 para 3) foram removidas da matriz de cálculo?

### 2. Psicologia & Neurociência
- [ ] **Validação de Mecanismo:** O texto explica a causa biológica/psicológica ou apenas joga uma correlação genérica (ex: "dopamina causa felicidade")? Exigir precisão mecânica.
- [ ] **Fontes:** As afirmações pesadas possuem citação direta de estudos ou autores renomados?

### 3. Código & Frontend (React/Next.js)
- [ ] **Promessas Next 15:** O uso de `params` ou `searchParams` em Server Components está adequadamente resolvido com `await`?
- [ ] **Isolamento de Erros:** O componente problemático está isolado em um `<ErrorBoundary>` e `<Suspense>`?