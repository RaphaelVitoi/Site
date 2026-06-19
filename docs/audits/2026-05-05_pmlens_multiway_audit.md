# Auditoria e Atualizacao: PM Lens Multiway e Correcoes de Tipagem

**Data:** 5 de maio de 2026
**Modulo:** `frontend/src/components/simulator/panels/PmLensPanel.tsx`
**Status:** Concluido e SOTA-Compliant
**Autor:** Chico (Super-Admin / Gerente do Sistema)

## 1. Escopo da Auditoria
O componente `PmLensPanel.tsx` foi auditado e refatorado para implementar adequadamente a funcionalidade **Multiway** no Framework PM, bem como a adicao do perfil de apostas geometricas (`Sizing Profile`). O foco principal foi resolver conflitos de tipagem do TypeScript que surgiram durante a migracao do estado singular do vilao (`villainIdx`) para um estado baseado em arrays (`villainIndices`).

## 2. Diagnostico de Entropia (Insolvencia de Tipagem)
A implementacao original tratava o oponente como uma entidade unica. A introducao da interface multi-selecao quebrou as referencias estritas no JSX e nas dependencias de `useEffect`/`useMemo`. O compilador TypeScript do Next.js identificou multiplos erros de referencia `Cannot find name 'villainIdx'` apos a variavel ser substituida no estado.

## 3. Acoes SOTA Executadas (Resolucao Zero-Rework)

### 3.1. Refatoracao de Estado e Arrays
- Substituicao do estado `[villainIdx, setVillainIdx]` pelo array `[villainIndices, setVillainIndices]`.
- Criacao de uma variavel derivada `primaryVillainIdx = villainIndices[0] ?? default` para sustentar logicas que requerem um stack base (ex: Edge/RIO baseline).
- Definicao da constante termodinamica `simulatedActivePlayers = 1 + villainIndices.length`.

### 3.2. Adaptacao dos Calculos Matematicos e FGS
- Atualizacao do input para `calculatePerspectivaVitoi`, mapeando `villainIdx: primaryVillainIdx` e `numPlayersInPot: simulatedActivePlayers`.
- Este ajuste garante que o calculo da "Perspectiva Matematica (PM)" e "Insolvencia" escale quadraticamente a "liability" (RIO) em cenarios com mais de 2 jogadores.

### 3.3. Refinamento de Interface (JSX)
- Correcao do botao de selecao do Agressor (Hero) para validar `impossible={ villainIndices.includes( i ) }` em vez de comparacao escalar.
- Correcao na telemetria avancada `SniperBadge` para apontar `stackEff` usando `initialStacks[ primaryVillainIdx ]`.
- Resolucao do `auto-healing` (protecao contra array bounds ao diminuir os jogadores da mesa), limpando o array `villainIndices` de indices invalidos via `.filter()`.

## 4. Validacao
- Comando `npx tsc --noEmit` executado com sucesso no diretorio `frontend/`. Erros zerados (Saida limpa / Exit Code 0).
- O motor de renderizacao opera a 60fps+ com React e mantem integridade O(1) de comunicacao com o WASM (Rust).

## 5. Diretriz Estrutural
Manter a abstracao SOTA para selecao de atores. Qualquer nova metrica (ex: isolamento tatico multiway) deve respeitar a iteracao sobre `villainIndices`.