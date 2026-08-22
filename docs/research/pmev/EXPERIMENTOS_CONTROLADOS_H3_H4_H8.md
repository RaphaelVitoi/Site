# H3, H4 e H8 — Protocolo de Experimentos Controlados

## Regra comum

Cada experimento altera somente a intervenção declarada. Stacks, payouts,
posição, ranges, board, árvore, versão do solver, tolerância, locks e seed são
artefatos versionados. Um resultado sem exportação de solver é observação, não
evidência reproduzível.

| Hipótese | Intervenção permitida | Métrica primária | Regra de falsificação |
|---|---|---|---|
| H3 | `time_to_blind_jump_minutes` | `ΔQ(open)` e `ΔRFI` | não há expansão economicamente relevante no regime pré-definido |
| H4 | `payouts` | frequência de defesa e `E*` derivada dos valores de estado | defesa não diverge da solução ChipEV no mesmo nó |
| H8 | `payouts` ou `utility_model` | frequência de sizings `≥ 50% pot` | frequências não mudam de modo robusto entre os braços |

## Artefato por execução

```text
experiment_id, hypothesis_id, solver, solver_version, export_checksum,
control_state, treatment_state, ranges, tree, board, locks, convergence,
seed, primary_metric, secondary_metrics, result, uncertainty, limitations
```

## Limites

- H4 não transforma BF em constante transportável entre sizings ou streets.
- H8 testa uma tendência condicionada; não prescreve 20–25% pot antes do resultado.
- H3 não atribui causalidade à urgência se stacks, ranges ou árvore também mudarem.
