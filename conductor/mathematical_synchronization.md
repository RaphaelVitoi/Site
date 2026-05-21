# PLANO DE SINCRONIZAÇÃO MATEMÁTICA SOTA v4.6 GOLD

## Objetivo
Erradicar o "drift" técnico entre os motores Python (Backend) e TypeScript (Frontend/Wasm), garantindo paridade absoluta na Equação Unificada SOTA v4.6 GOLD.

## 1. Discrepâncias Identificadas
- **Gravidade no RIO**: O motor Python usa `gravity` para escalar a tensão de RIO, enquanto o Frontend (`perspectiva.ts`) omite este termo.
- **Valuation (ICM Explosion)**: O Frontend utiliza o coeficiente `valuation` (Razão Ganho/Perda ICM) na Equação Unificada. O motor Python não possui este parâmetro.
- **Dívida RIO MW**: Diferenças sutis nos multiplicadores base (0.05 vs icmPerChip).
- **Downward Drift**: Inconsistências na aplicação da streetIdx entre as implementações.

## 2. Ações de Sincronização

### Fase 1: Backend (Python Core)
- **Arquivo**: `engine/math_sota.py`
- **Alterações**:
    - Atualizar `compute_quantum_metrics` para aceitar e processar o parâmetro `valuation`.
    - Garantir que `calculate_rio_tension` use a mesma lógica de `pot_entrapment` e `gravity` que será injetada no frontend.
    - Sincronizar constantes de `drift_base` para [Flop: 0.004, Turn: 0.008, River: 0.012].

### Fase 2: Frontend (TypeScript Core)
- **Arquivo**: `frontend/src/lib/perspectiva.ts`
- **Alterações**:
    - Injetar `calculateGravity` e usá-lo em `calculateRioTension`.
    - Unificar a `Equação Unificada` em `calculatePerspectivaVitoi` para bater 1:1 com o Python.
    - Sincronizar o cálculo de `rioLiability` com a lógica de penalização quadrática baseada em `human_noise_factor`.

### Fase 3: Post-Flop Deriver
- **Arquivo**: `frontend/src/lib/rpDeriver.ts`
- **Alterações**:
    - Substituir fórmulas locais simplificadas pelas funções exportadas de `perspectiva.ts`.
    - Corrigir a unidade de `rioMwStreet` para garantir que seja proporcional à `valuation` da street.

## 3. Verificação de Integridade
- Executar `.claude/sota_integrity_test.py` com novos assertions de paridade.
- Adicionar um teste de "Snapshot Cross-Language" onde um cenário idêntico deve retornar o mesmo `Ci` (Coeficiente de Insolvência) em ambas as linguagens.

## 4. Teoria e Doutrina
- **RIO Exponencial**: Confirmar que a penalização $N^{2+HNF}$ está ativa em todos os núcleos.
- **Colapso de Edge**: Validar que a amortização logarítmica $\ln(\text{Stack})/\ln(60)$ é a barreira final de skill.
