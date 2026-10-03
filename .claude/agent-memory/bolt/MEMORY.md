## 2024-05-18 - [Monte Carlo Allocation Churn]
**Learning:** Multidimensional arrays (`number[][]`) and iterator methods (`.map`) in hot mathematical loops create excessive GC churn that drastically reduces engine execution speed.
**Action:** Replace `number[][]` with 1D `Uint32Array` or `Float64Array` mapping logical sizes like `row * cols + col` in any simulation/engine hot loop. Use standard `for` loops over `Array.prototype.map`.
