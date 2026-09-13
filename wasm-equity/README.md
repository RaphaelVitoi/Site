# Vitoi equity WebAssembly

`wasm-equity` is the single source of truth for the frontend equity engine. Generated JavaScript,
TypeScript declarations, and WebAssembly are committed under
`frontend/src/lib/engine/generated` so a Node-only checkout can typecheck and build without a Rust
toolchain. The public WASM copy used by the SRI gate is generated from the same binary.

## Regenerate

1. Install the Rust version and target pinned by `rust-toolchain.toml`.
2. Install `wasm-pack` version `0.15.0` without changing the repository lockfiles.
3. Run `npm run wasm:build` from the repository root.
4. Review and commit all generated changes together with their Rust source change.

CI runs the same command and requires the generated outputs to have no diff. Never copy ignored or
machine-local glue into the generated directory.

## Pluribus-inspired adapter ABI

`solve_pluribus_multiway_adapter_wasm` is a deterministic Rust/WASM port of the existing
Python/TypeScript heuristic adapter. It accepts pot, player count, active stacks, PMev lambda,
nominal equity, position, street, horizon depth, and iteration count. Its fixed 19-number output is
decoded by `frontend/src/lib/pluribusWasmAdapter.ts` into the typed product contract.

This binding provides a measured third runtime and observable fallback. It is not a Pluribus
blueprint, real-time subgame search, a complete extensive-form solver, or evidence of acceleration.
Cross-runtime behavior is governed by `data/engine_parity_scenarios.json`.

Validate the Rust source and the real generated binary with:

```powershell
cargo test --lib --manifest-path wasm-equity/Cargo.toml
npm run wasm:build
Push-Location frontend
npx jest --runInBand src/tests/simulator/pluribusWasmParity.test.ts
Pop-Location
```
