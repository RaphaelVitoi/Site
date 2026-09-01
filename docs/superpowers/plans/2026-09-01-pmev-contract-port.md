---
id: plan-pmev-contract-port-2026-09-01
tipo: plano
escopo: Site
autor: "Codex [Tier 1.B]"
criado_em: 2026-09-01T01:40-03:00
classes: [interno]
caminhos:
  - engine/pmev_spec.py
  - engine/pmev_controlled_experiments.py
  - engine/pmev_late_registration.py
  - engine/icm_matrix.py
  - tests/test_pmev_spec.py
  - tests/test_pmev_controlled_experiments.py
verificado:
  - divergencia do commit historico contra master e os contratos existentes foram inspecionados antes do port seletivo
  - revisao posterior adicionou testes de regressao para entradas nao finitas, cardinalidade ICM, baseline H4, snapshots imutaveis e estrutura proporcional H9
nao_verificado:
  - este plano nao constitui validacao empirica de PMev, integracao de runtime ou avaliacao por solver
---

# PMev Contract Port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` to execute this plan task-by-task and `superpowers:verification-before-completion` before reporting completion.

**Goal:** Port the smallest reproducible PMev research-contract layer from `chore/submodule-ownership-rationalization` onto current `master`, without importing stale UI, package, submodule, or solver assumptions.

**Architecture:** The new modules are a research boundary beside the existing runtime PMev engine. `TournamentState` supplies a validated monetary/stack state; the PMev tier configuration makes the ICMev recovery condition explicit; H3/H4/H8 experiment contracts reject confounding; H9 checks a conservative late-registration identity using the existing exact Malmuth-Harville implementation. The existing matrix engine receives documentation-only scope limits. No current simulator route consumes this layer until a later explicit adapter task.

**Tech Stack:** Python 3.12+, dataclasses, `StrEnum`, pytest, the existing `engine.icm_matrix.calculate_malmuth_harville_icm`.

## Provenance and non-goals

- Source history: `ee879df613d70563c95159250ec8cf917dc9ad2d` and `f293d0e07aec32643a6dafebb12e673906ccdeef`.
- Base: `f55a6486f9d53372621260431f4d6c15b316ecb2`.
- This port is **not** a proof that PMev supersedes ICMev, an inference of player skill, a solver export, or live strategic advice.
- In MTT contracts the monetary baseline is ICMev/Malmuth-Harville. ChipEV may appear only as a limiting pedagogical comparison; it is not the baseline asserted by a final-table experiment.
- Do not port frontend pages, routing, lockfiles, model registry, workflow edits, Eigen vendoring, or submodules in this change set.

## Task 1 — Add the baseline-state and tier contract

**Files:**
- Create `engine/pmev_spec.py`
- Create `tests/test_pmev_spec.py`

**Steps:**
1. Implement `PMevTier` with the seven declared research tiers.
2. Implement frozen `TournamentState(stacks, payouts)` with finite, non-negative values, positive total stack mass, a non-empty positive payout pool, and no more payouts than active players; normalize input sequences to immutable snapshots.
3. Implement frozen `PMevConfiguration` and `recovers_icmev()`, returning true only for `PMev-0` with every extension disabled.
4. Add tests for baseline recovery and invalid mass.

**Verification:**
```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_pmev_spec.py -q
```

## Task 2 — Add anti-confounding contracts for H3/H4/H8

**Files:**
- Create `engine/pmev_controlled_experiments.py`
- Create `tests/test_pmev_controlled_experiments.py`

**Steps:**
1. Declare required state fields and the allowed intervention field set for each hypothesis.
2. Validate that both arms contain the complete hypothesis-specific state.
3. Require exactly one changed field. A change must be one allowed intervention, so H8 may change `payouts` **or** `utility_model`, never both in the same causal comparison.
4. Require non-empty primary metric and falsification rule, and snapshot both arms recursively before validation so later caller mutation cannot alter accepted evidence.
5. Test an allowed H3 clock intervention, a confounded H3 stack intervention, incomplete H4 river state, missing key versus `None`, snapshot immutability, and the H8 double-intervention rejection.
6. Require the literal H4 equity baseline `ICMev/Malmuth-Harville` in both arms; never admit a pure-ChipEV MTT baseline.

**Verification:**
```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_pmev_controlled_experiments.py -q
```

## Task 3 — Add the H9 late-registration conservation benchmark

**Files:**
- Create `engine/pmev_late_registration.py`
- Extend `tests/test_pmev_spec.py`

**Steps:**
1. Model a deterministic late entrant, net contribution, and post-entry payout vector.
2. Fail closed unless post-entry payouts equal prior payout pool plus the net contribution, preserve the prior payout cardinality, and scale every pre-entry payout proportionally. A same-sum payout redistribution is a separate model intervention, not this benchmark baseline.
3. Use the repository's existing exact Malmuth-Harville calculation for both states.
4. Return incumbent deltas, entrant equity, entrant bonus, and a numeric conservation residual.
5. Test a conservative small-field transition and rejection of non-conservative, non-finite, cardinality-changing, and same-sum redistributed transitions.

**Verification:**
```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_pmev_spec.py -q
```

## Task 4 — Make the existing ICM matrix boundary explicit

**Files:**
- Modify `engine/icm_matrix.py`

**Steps:**
1. Document that the BF/RP result is a pairwise, symmetric all-in baseline.
2. State that it does not calculate pot odds, ranges, rake, bounties, post-flop trees, or future transitions.
3. Keep calculation behavior unchanged; this task narrows interpretation rather than altering arithmetic.

**Verification:**
```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_pmev_spec.py tests/test_pmev_controlled_experiments.py -q
.\.venv\Scripts\python.exe -m ruff check engine/pmev_spec.py engine/pmev_controlled_experiments.py engine/pmev_late_registration.py tests/test_pmev_spec.py tests/test_pmev_controlled_experiments.py engine/icm_matrix.py
```

## Task 5 — Preserve research provenance

**Files:**
- Create `docs/research/pmev/PMEV_SPEC_V0_1.md`
- Create `docs/research/pmev/EXPERIMENTOS_CONTROLADOS_H3_H4_H8.md`

**Steps:**
1. Explain the baseline-recovery contract and H9 identity without presenting it as an empirical validation.
2. Explain one-intervention causal discipline, minimum artifacts, and falsification boundaries for H3/H4/H8.
3. Link code paths and tests by relative path.
4. Declare unimplemented tiers and absent solver/hand-history/real-player validation as limitations.

**Verification:**
```powershell
git diff --check
.\.venv\Scripts\python.exe -m pytest tests/test_pmev_spec.py tests/test_pmev_controlled_experiments.py -q
```

## Final verification and publication

1. Run targeted tests and Ruff; run `npm run sota:audit` only if worktree dependencies are installed and a verified CDP/runtime surface is available.
2. Stage only the files named by this plan, run `git diff --cached --check`, and commit without bypassing hooks.
3. Publish `integrate/pmev-contracts-20260901`, then open a PR against `master`. Do not merge it as part of this task.
