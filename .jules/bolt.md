## 2026-09-10 - Replace .at() with [] in Monte Carlo hot loops
**Learning:** `Array.prototype.at()` incurs method call overhead and relative index calculation penalties compared to direct bracket access (`[]`), which becomes a measurable bottleneck in tight, performance-critical loops (like those found in stochastic Monte Carlo simulations).
**Action:** When optimizing hot loops with thousands of iterations, strictly prefer direct bracket index access (`[index]`) over the `.at()` method for primitive arrays.
