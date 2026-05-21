# Plano de Correção: Alucinação em ReferencialData.ts

## Objetivo
Corrigir os dados alucinados em `ReferencialData.ts` para que representem fielmente o material de origem da "Aula 1.2", restabelecendo a âncora empírica (BTN vs BB com RP de 21.4% vs 12.9%).

## Arquivos Afetados
- `frontend/src/components/simulator/ReferencialData.ts`

## Passos de Implementação
1. **Atualizar PRIZES:**
   Substituir os prêmios genéricos pelos prêmios exatos validados (`FT_PRIZES` do `scenarios.ts`):
   `[ 237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47 ]`
2. **Atualizar TOTAL_POOL:**
   Ajustar para `1234.80` para manter a proporção exata de ~19.2% para o 1º lugar.
3. **Reconstruir BF_STACKS e BF_MATRIX:**
   - Usar as stacks da `FT1` (Aula 1.2 real): `[53.6, 44.8, 35.2, 28.5, 22.1, 15, 11.6, 9.4, 6.2]`.
   - Gerar a `BF_MATRIX` convertendo a `FT1_MATRIX` de RP para BF usando a fórmula $BF = 1 / (1 - RP/100)$.
4. **Alinhar TABLE_PLAYERS:**
   Ajustar o stack do BTN para `38` e BB para `53` para garantir que o seletor visual (`activeBtnIdx` e `activeBbIdx`) escolha exatamente o índice 2 (35.2) e 0 (53.6), resultando perfeitamente em `21.4%` e `12.9%`.

## Verificação
- A interface da Aula 1.2 (`ReferencialAula12.tsx`) deverá exibir RP BTN = 21.4% e RP BB = 12.9%.
- A estrutura de prêmios deverá mostrar $237.34 para o 1º lugar, coerente com os $1234.80 totais.