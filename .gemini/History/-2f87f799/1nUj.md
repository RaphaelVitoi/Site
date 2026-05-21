# Paradigma VITOI - Project Context

## Table of Contents

- [Architecture Principles](#architecture-principles)
- [Workflow and Documentation](#workflow-and-documentation)
- [Subdirectory Contexts](#subdirectory-contexts)
  - [Frontend App Context](./frontend/src/app/GEMINI.md)

## Architecture Principles

Remember the new 'SOTA Quantum' architecture for the Paradigma VITOI project:

1. **Decoupled Physics State**: Use `SotaGlobalSyncProvider` and `useSotaSync` to share table parameters (Hero Stack, Pot, Pos) across all simulators.
2. **Behavioral Integration**: Always include 'Prospect Theory' (Loss Aversion lambda=2.25) in math calculations to reflect human bias vs pure EV.
3. **AI First**: Implement GTO solutions via CFR (Regret Matching) and optimize betting paths via A* Geometric Sizing.
4. **Scalable ICM**: Use Monte Carlo $O(N)$ fallback for fields > 10 players to prevent browser freezing.
5. **Token Efficiency**: Prioritize `grep_search` and surgical reads to maintain context.

## Workflow and Documentation

- First, use the `$search_workspace_docs` tool to find relevant documentation. Then, use the `fetch_workspace_docs` tool to retrieve the content of the top search results.
- Always follow the standards in `frontend/src/app/GEMINI.md`.

## Subdirectory Contexts

- Frontend App Context
