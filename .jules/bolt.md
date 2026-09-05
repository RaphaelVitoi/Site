## 2026-09-05 - Refuting False Optimizations: Memoization & Stringify
**Learning:** `React.memo` is actively harmful for UI components (like `ActionRow`) in this architecture because they receive inline arrow functions (`onChange`) from their parent (e.g., `NashPanel`), causing the memo check to fail 100% of the time and adding pure overhead.
**Action:** Never propose `React.memo` for components downstream of heavy prop-drilling without verifying that ALL props (especially functions) are stably memoized upstream.

**Learning:** `JSON.stringify` used on small configuration objects (e.g., `streetFreqs` with ~18 fields) inside `useQuantumEngine` is NOT a bottleneck. It is an intentional, cheap reference "seal" that protects 26 heavy downstream `useMemo` hooks from O(N³) GC thrashing and stale closures.
**Action:** Do not attempt to replace native structural sealing mechanisms with custom deep-equality checks unless there is measured proof that the object size makes serialization a bottleneck.
