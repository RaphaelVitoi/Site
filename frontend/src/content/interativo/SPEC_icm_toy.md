# SPEC interna — ICM Toy / Perspectiva Matemática

> **Estado:** contrato de desenho em revisão. Não descreve uma integração já
> entregue; o motor atual deve ser medido antes de qualquer implementação.

## 1. Fronteira arquitetural

O Toy Game recebe um estado de mesa declarado, calcula as transformações que
possuem contrato explícito e preserva a distinção entre:

| Camada | Pode produzir | Não pode alegar |
| :-- | :-- | :-- |
| ICM/BF/RP | cálculo condicionado a stacks e payouts | estratégia de solver sem ranges/nó. |
| PMev/FGS/RIO | saída do modelo com parâmetros declarados | validação empírica independente. |
| UI | explicação, proveniência e validação de input | completar payouts, stacks ou ranges por inferência silenciosa. |

## 2. Convenções matemáticas

### 2.1. Direção de Risk Premium

Para agressor `A` e defensor `D`:

`ΔRP(A→D) = RP_D − RP_A`

`ΔRP > 0` sinaliza que o agressor tem menor RP e Vantagem de Risco. O sinal é
contextual; não é multiplicador linear de frequência ou sizing.

### 2.2. RIO multiway

O motor atual trata a parcela multiway como uma **heurística quadrática** no
número de oponentes (`n_oponentes²`), modulada por pote, stack e parâmetros de
amortecimento. Ela não é uma lei exponencial nem uma medição de RIO de campo.
Qualquer interface deve expor o número de oponentes e os parâmetros aplicados.

### 2.3. Coeficiente de Insolvência

O texto legado `C_i = Pot_Odds / PM` não representa o contrato atual. No motor
atual, `C_i` é derivado de probabilidade de vitória e limiar de equidade
projetado. Antes de mostrar a métrica, a UI deve declarar a fórmula e a versão
do motor usadas; comparações históricas só são permitidas quando usam o mesmo
contrato.

## 3. Dados de entrada

```text
TournamentInput
  totalPrizePool, buyIn, fieldAfterLateReg
  seats: 8 | 9
  playersRemaining: 2..seats
  finalTablePayouts[]

TableState
  stacks[] (fichas ou BB, unidade declarada)
  blinds, ante, anteModel
  aggressorIndex, defenderIndex, positions
  pot, invested, playersInPot

EvidenceInput (opcional)
  handHistory, rangeSource, solverName, solverVersion, nodeId
```

Validações bloqueantes: comprimento de `stacks`, índices, unidade homogênea,
valores finitos/não negativos, vetor de payouts e conservação de fichas quando
o usuário altera um cenário. A conversão fichas↔BB exige blind level explícito.

## 4. Saída tipada

```text
ToyGameResult
  inputStatus: valid | invalid | incomplete
  provenance: user-input | deterministic-engine | external-solver
  icm: BF/RP/ΔRP por confronto
  modelSignals: EV_fold, RIO, PMev, C_i (com versão e parâmetros)
  decisionBoundary: contextual-review | insufficient-evidence
  diagnostics[]
```

`external-solver` só é permitido se forem fornecidos export, versão, ranges e
nó. Sem eles, qualquer frequência mostrada é referência didática, nunca
validação.

## 5. Fluxo de execução

1. Validar o estado recebido; bloquear incoerências antes de calcular.
2. Normalizar unidades sem modificar a soma de chips.
3. Calcular ICM/BF/RP para o confronto explicitamente selecionado.
4. Calcular componentes de modelo apenas com parâmetros declarados.
5. Exibir proveniência, incerteza e dados faltantes; não derivar ação numérica
   quando o contrato de evidência estiver incompleto.

## 6. Critérios de aceite

- Não existe texto chamando Pot Odds de “falha” ou RIO de “exponencial”.
- `ΔRP` expõe agressor e defensor, em p.p., sem transformar seu valor em
  deslocamento de frequência.
- Todo cenário inválido produz recusa explicativa e preserva os dados do aluno.
- Toda métrica de PMev é rotulada como saída de modelo até haver comparação
  externa reproduzível.
