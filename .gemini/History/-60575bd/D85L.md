# Projeto Paradigma VITOI - SOTA Quantum

## Arquitetura Sistêmica (Atualização 2026)

Este projeto evoluiu de um simulador de poker estático para um ecossistema dinâmico de **Teoria dos Sistemas** e **Inteligência Artificial**.

### 1. Core Engine (Matemática e IA)

- **`src/lib/perspectiva.ts`**: O coração do sistema. Implementa a Equação Unificada VITOI. Agora inclui a **Prospect Theory** (Aversão à Perda) e o fallback para **Monte Carlo ICM**.
- **`src/lib/ai-models.ts`**: Motor de IA Avançado.
  - **CFR (Counterfactual Regret Minimization)**: Convergência para Equilíbrio de Nash.
  - **A* Pathfinding**: Otimização de Bet Sizing Geométrico.
  - **Bayesian Recursive Updating**: Atualização de crenças (Range Reading) street-by-street.
  - **Random Forest**: Classificação heurística de arquétipos de oponentes.
- **`src/lib/montecarlo.ts`**: Algoritmo estocástico $O(N)$ que permite cálculos de ICM para fields grandes (MTTs), evitando a explosão combinatória do Malmuth-Harville.

### 2. Estado Global e Sincronia (SOTA Sync)

- **`src/components/simulator/hooks/useSotaSync.tsx`**: Hook unificado para compartilhar a "Física da Mesa" (Hero Stack, Pote, Posição, Status de Referência).
- **`SotaGlobalSyncProvider`**: Provider no `layout.tsx` que garante que todos os simuladores (Master, Downward Drift, GTO AI) operem sobre o mesmo cenário de mesa em tempo real.

### 3. Interface e Hub

- **`SotaHubNavbar.tsx`**: Barra de navegação global com Glassmorphism que permite trânsito instantâneo entre módulos e configuraçãoHUD da física da mesa.
- **`GtoCfrSimulator.tsx`**: Módulo interativo de IA que visualiza árvores de decisão e arrependimento (regret).

### 4. Diretrizes de Performance

- **Otimização de Tokens**: Sempre use `grep_search` antes de ler arquivos.
- **Performance Web**: Cálculos pesados de ICM usam Web Workers ou fallback Monte Carlo para manter 60fps.
- **Tipagem**: Manter 100% de cobertura TypeScript via `tsconfig.audit.json`.

---
*Este documento é a base de contexto para o agente Gemini CLI.*
