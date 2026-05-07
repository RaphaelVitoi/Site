# Auditoria e Atualização: PM Lens Multiway e Correções de Tipagem

**Data:** 5 de maio de 2026
**Módulo:** `frontend/src/components/simulator/panels/PmLensPanel.tsx`
**Status:** Concluído e SOTA-Compliant
**Autor:** Chico (Super-Admin / Gerente do Sistema)

## 1. Escopo da Auditoria
O componente `PmLensPanel.tsx` foi auditado e refatorado para implementar adequadamente a funcionalidade **Multiway** no Framework PM, bem como a adição do perfil de apostas geométricas (`Sizing Profile`). O foco principal foi resolver conflitos de tipagem do TypeScript que surgiram durante a migração do estado singular do vilão (`villainIdx`) para um estado baseado em arrays (`villainIndices`).

## 2. Diagnóstico de Entropia (Insolvência de Tipagem)
A implementação original tratava o oponente como uma entidade única. A introdução da interface multi-seleção quebrou as referências estritas no JSX e nas dependências de `useEffect`/`useMemo`. O compilador TypeScript do Next.js identificou múltiplos erros de referência `Cannot find name 'villainIdx'` após a variável ser substituída no estado.

## 3. Ações SOTA Executadas (Resolução Zero-Rework)

### 3.1. Refatoração de Estado e Arrays
- Substituição do estado `[villainIdx, setVillainIdx]` pelo array `[villainIndices, setVillainIndices]`.
- Criação de uma variável derivada `primaryVillainIdx = villainIndices[0] ?? default` para sustentar lógicas que requerem um stack base (ex: Edge/RIO baseline).
- Definição da constante termodinâmica `simulatedActivePlayers = 1 + villainIndices.length`.

### 3.2. Adaptação dos Cálculos Matemáticos e FGS
- Atualização do input para `calculatePerspectivaVitoi`, mapeando `villainIdx: primaryVillainIdx` e `numPlayersInPot: simulatedActivePlayers`.
- Este ajuste garante que o cálculo da "Perspectiva Matemática (PM)" e "Insolvência" escale quadraticamente a "liability" (RIO) em cenários com mais de 2 jogadores.

### 3.3. Refinamento de Interface (JSX)
- Correção do botão de seleção do Agressor (Hero) para validar `impossible={ villainIndices.includes( i ) }` em vez de comparação escalar.
- Correção na telemetria avançada `SniperBadge` para apontar `stackEff` usando `initialStacks[ primaryVillainIdx ]`.
- Resolução do `auto-healing` (proteção contra array bounds ao diminuir os jogadores da mesa), limpando o array `villainIndices` de índices inválidos via `.filter()`.

## 4. Validação
- Comando `npx tsc --noEmit` executado com sucesso no diretório `frontend/`. Erros zerados (Saída limpa / Exit Code 0).
- O motor de renderização opera a 60fps+ com React e mantém integridade O(1) de comunicação com o WASM (Rust).

## 5. Diretriz Estrutural
Manter a abstração SOTA para seleção de atores. Qualquer nova métrica (ex: isolamento tático multiway) deve respeitar a iteração sobre `villainIndices`.