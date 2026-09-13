## 2024-05-18 - [Avoid .at() in Hot Loops]
**Learning:** Using Array.prototype.at() inside hot loops (like in Monte Carlo simulation) adds substantial method call overhead in V8 compared to direct bracket notation `[]`, degrading execution speed by about 7x (e.g. from ~450ms down to ~3300ms for 100,000 iterations).
**Action:** Prefer direct bracket notation `[]` over `.at()` in performance-critical hot loops to avoid significant performance penalties.
