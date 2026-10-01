## 2026-09-20 - Nullish coalescing overhead on TypedArrays
**Learning:** `?? 0` on bounded TypedArray accesses (like `Float32Array`) in JavaScript causes significant performance degradation in hot loops due to unnecessary branching/type-checks. Bounded access always returns a primitive number, never `undefined`.
**Action:** Never use `?? 0` or logical fallbacks (`|| 0`) when reading bounded positions of TypedArrays inside high-performance loops like CFR engines.
