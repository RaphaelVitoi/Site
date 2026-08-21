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
