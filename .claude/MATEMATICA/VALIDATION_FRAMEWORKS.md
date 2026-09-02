# VALIDATION FRAMEWORKS (@validador)

> **Status:** Ativo | **Objetivo:** Garantir precisao factual antes do lancamento de qualquer feature especialista.

## Checklists de Especialidade

### 1. Motor Matematico (ICM / Teoria dos Jogos)

- [ ] **Checksum de Nash:** Os ranges no cenario teste convergem para um $EV estabilizado (variacao < 0.001)?
- [ ] **Malmuth-Harville Check:** A soma dos Equities de todos os jogadores vivos e **exatamente igual** a soma do Prizepool restante? (Obrigatorio).
- [ ] **Card Combinatorics:** Maos bloqueadas (ex: se o board tem um As, os combos de AA caem de 6 para 3) foram removidas da matriz de calculo?

### 2. Psicologia & Neurociencia

- [ ] **Validacao de Mecanismo:** O texto explica a causa biologica/psicologica ou apenas joga uma correlacao generica (ex: "dopamina causa felicidade")? Exigir precisao mecanica.
- [ ] **Fontes:** As afirmacoes pesadas possuem citacao direta de estudos ou autores renomados?

### 3. Codigo & Frontend (React/Next.js)

- [ ] **Promessas Next 15:** O uso de `params` ou `searchParams` em Server Components esta adequadamente resolvido com `await`?
- [ ] **Isolamento de Erros:** O componente problematico esta isolado em um `<ErrorBoundary>` e `<Suspense>`?
