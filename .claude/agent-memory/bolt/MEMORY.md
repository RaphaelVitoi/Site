## 2024-10-12 - TypedArray Return Signatures

**Learning:** When optimizing highly-iterative arrays like those in a Monte Carlo loop with cache-friendly TypedArrays (`Float64Array`), those arrays often get returned at the end of the simulation. Modifying the return type from `number[]` to `Float64Array` implicitly breaks downstream code assuming standard array prototypes (like `.push()` or `Array.isArray`).
**Action:** Always map TypedArrays back to native Arrays (`Array.from(typedArray)`) at the return boundary to preserve API compatibility, taking the negligible performance hit there instead of inside the hot loop.
