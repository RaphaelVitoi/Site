"""R Statistical Bridge for SOTA PMev Game Theory & MDA Analytics.

Harmonizes R 4.6.1+ statistical computing environment with the Python
ecosystem. Executes high-precision statistical analyses (Tail Risk VaR/CVaR,
Bayesian MDA Beta posteriors, and Polynomial Response Surfaces) via headless
Rscript with jsonlite.
"""

from __future__ import annotations

import json
import logging
import math
import os
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Final

logger = logging.getLogger("nexus.engine.r_bridge")

# Caminhos padrao para Rscript no Windows e Unix
DEFAULT_R_PATHS: Final[list[Path]] = [
    Path("C:/Program Files/R/R-4.6.1/bin/Rscript.exe"),
    Path("C:/Program Files/R/R-4.6.0/bin/Rscript.exe"),
    Path("C:/Program Files/R/R-4.5.0/bin/Rscript.exe"),
]


def resolve_rscript_path() -> Path | None:
    """Resolve o executavel Rscript no PATH ou caminhos canonicos de instalacao."""
    in_path = shutil.which("Rscript")
    if in_path:
        return Path(in_path)
    for p in DEFAULT_R_PATHS:
        if p.exists():
            return p
    return None


@dataclass(frozen=True, slots=True)
class TailRiskResult:
    mean: float
    variance: float
    skewness: float
    kurtosis: float
    var_95: float
    var_99: float
    cvar_95: float
    cvar_99: float
    engine: str


@dataclass(frozen=True, slots=True)
class BayesianMdaResult:
    prior_mean: float
    posterior_mean: float
    ci_95_lower: float
    ci_95_upper: float
    prob_above_threshold: float
    total_observations: int
    engine: str


class RStatisticalBridge:
    """Ponte de execucao estatistica R para calculos PMev avancados."""

    def __init__(self, rscript_bin: Path | str | None = None) -> None:
        if rscript_bin is not None:
            self._rscript_path: Path | None = Path(rscript_bin)
        else:
            self._rscript_path = resolve_rscript_path()

    @property
    def is_available(self) -> bool:
        """Indica se o binario Rscript esta acessivel no ambiente."""
        return self._rscript_path is not None and self._rscript_path.exists()

    @property
    def rscript_path(self) -> str | None:
        return str(self._rscript_path) if self._rscript_path else None

    def execute_r_script(self, r_code: str, timeout_seconds: float = 10.0) -> dict[str, Any]:
        """Executa codigo R arbitrario passando e recebendo JSON estruturado."""
        if not self.is_available:
            raise RuntimeError("Rscript nao encontrado no ambiente.")

        wrapper = f"""
suppressPackageStartupMessages({{
  if (!requireNamespace("jsonlite", quietly = TRUE)) {{
    user_lib <- Sys.getenv("R_LIBS_USER")
    if (dir.exists(user_lib)) .libPaths(c(user_lib, .libPaths()))
  }}
  library(jsonlite)
}})

result <- (function() {{
{r_code}
}})()

cat("___SOTA_R_OUTPUT_START___")
cat(jsonlite::toJSON(result, auto_unbox = TRUE, digits = 8))
cat("___SOTA_R_OUTPUT_END___")
"""
        cmd = [str(self._rscript_path), "--vanilla", "-"]
        proc = subprocess.run(
            cmd,
            input=wrapper,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            check=False,
            env=os.environ.copy(),
        )

        if proc.returncode != 0:
            logger.error("Falha ao executar Rscript: %s", proc.stderr)
            raise RuntimeError(f"Erro na execucao R ({proc.returncode}): {proc.stderr.strip()}")

        stdout = proc.stdout
        if "___SOTA_R_OUTPUT_START___" not in stdout or "___SOTA_R_OUTPUT_END___" not in stdout:
            raise RuntimeError(f"Output R corrompido ou inesperado: {stdout[:200]}")

        start_tag = stdout.find("___SOTA_R_OUTPUT_START___") + len("___SOTA_R_OUTPUT_START___")
        end_tag = stdout.find("___SOTA_R_OUTPUT_END___")
        json_str = stdout[start_tag:end_tag].strip()
        return json.loads(json_str)

    def compute_tail_risk(self, ev_samples: list[float]) -> TailRiskResult:
        """Calcula metricas de cauda (VaR, CVaR, assimetria, curtose) sobre amostras de EV.

        Utiliza R para calculos com precisao estatistica ou fallback analitico nativo.
        """
        if not ev_samples:
            raise ValueError("ev_samples nao pode ser vazio")

        n = len(ev_samples)
        if self.is_available:
            try:
                samples_json = json.dumps(ev_samples)
                r_code = f"""
x <- fromJSON('{samples_json}')
m <- mean(x)
s <- sd(x)
if (is.na(s)) s <- 0
n <- length(x)
var_sample <- var(x)
if (is.na(var_sample)) var_sample <- 0

# Momentos
m3 <- sum((x - m)^3) / n
m4 <- sum((x - m)^4) / n
skew <- if (s > 0) m3 / (s^3) else 0
kurt <- if (s > 0) (m4 / (s^4)) - 3 else 0

# VaR e CVaR (Expected Shortfall) nos quantis inferiores de perda
sorted_x <- sort(x)
idx_95 <- max(1, floor(0.05 * n))
idx_99 <- max(1, floor(0.01 * n))
var_95 <- -sorted_x[idx_95]
var_99 <- -sorted_x[idx_99]
cvar_95 <- -mean(sorted_x[1:idx_95])
cvar_99 <- -mean(sorted_x[1:idx_99])

list(
  mean = m,
  variance = var_sample,
  skewness = skew,
  kurtosis = kurt,
  var_95 = var_95,
  var_99 = var_99,
  cvar_95 = cvar_95,
  cvar_99 = cvar_99
)
"""
                res = self.execute_r_script(r_code)
                return TailRiskResult(
                    mean=float(res["mean"]),
                    variance=float(res["variance"]),
                    skewness=float(res["skewness"]),
                    kurtosis=float(res["kurtosis"]),
                    var_95=float(res["var_95"]),
                    var_99=float(res["var_99"]),
                    cvar_95=float(res["cvar_95"]),
                    cvar_99=float(res["cvar_99"]),
                    engine="R-4.6.1",
                )
            except Exception as e:
                logger.warning("Falha na computacao via R (%s), aplicando fallback Python", e)

        # Fallback analitico Python
        m = sum(ev_samples) / n
        var = sum((x - m) ** 2 for x in ev_samples) / (n - 1) if n > 1 else 0.0
        sd = math.sqrt(var) if var > 0 else 0.0
        skew = (sum((x - m) ** 3 for x in ev_samples) / n) / (sd**3) if sd > 0 else 0.0
        kurt = ((sum((x - m) ** 4 for x in ev_samples) / n) / (sd**4)) - 3.0 if sd > 0 else 0.0

        sorted_x = sorted(ev_samples)
        idx_95 = max(1, math.floor(0.05 * n))
        idx_99 = max(1, math.floor(0.01 * n))
        var_95 = -sorted_x[idx_95 - 1]
        var_99 = -sorted_x[idx_99 - 1]
        cvar_95 = -sum(sorted_x[:idx_95]) / idx_95
        cvar_99 = -sum(sorted_x[:idx_99]) / idx_99

        return TailRiskResult(
            mean=m,
            variance=var,
            skewness=skew,
            kurtosis=kurt,
            var_95=var_95,
            var_99=var_99,
            cvar_95=cvar_95,
            cvar_99=cvar_99,
            engine="python-native-fallback",
        )

    def compute_bayesian_mda_frequency(
        self,
        prior_alpha: float,
        prior_beta: float,
        successes: int,
        trials: int,
        threshold: float = 0.5,
    ) -> BayesianMdaResult:
        """Atualizacao Bayesiana Conjugada Beta-Binomial para frequencias de acao (MDA)."""
        post_alpha = prior_alpha + successes
        post_beta = prior_beta + (trials - successes)
        post_mean = post_alpha / (post_alpha + post_beta)
        prior_mean = prior_alpha / (prior_alpha + prior_beta)

        if self.is_available:
            try:
                r_code = f"""
q_low <- qbeta(0.025, {post_alpha}, {post_beta})
q_high <- qbeta(0.975, {post_alpha}, {post_beta})
p_above <- 1 - pbeta({threshold}, {post_alpha}, {post_beta})

list(
  ci_lower = q_low,
  ci_upper = q_high,
  prob_above = p_above
)
"""
                res = self.execute_r_script(r_code)
                return BayesianMdaResult(
                    prior_mean=prior_mean,
                    posterior_mean=post_mean,
                    ci_95_lower=float(res["ci_lower"]),
                    ci_95_upper=float(res["ci_upper"]),
                    prob_above_threshold=float(res["prob_above"]),
                    total_observations=trials,
                    engine="R-4.6.1",
                )
            except Exception as e:
                logger.warning("Falha na computacao Bayesiana via R (%s), aplicando fallback", e)

        # Fallback aproximacao normal
        var_post = (post_alpha * post_beta) / (((post_alpha + post_beta) ** 2) * (post_alpha + post_beta + 1))
        sd_post = math.sqrt(var_post)
        ci_low = max(0.0, post_mean - 1.96 * sd_post)
        ci_high = min(1.0, post_mean + 1.96 * sd_post)
        z = (threshold - post_mean) / sd_post if sd_post > 0 else 0.0
        prob_above = 0.5 * (1.0 - math.erf(z / math.sqrt(2.0)))

        return BayesianMdaResult(
            prior_mean=prior_mean,
            posterior_mean=post_mean,
            ci_95_lower=ci_low,
            ci_95_upper=ci_high,
            prob_above_threshold=prob_above,
            total_observations=trials,
            engine="python-native-fallback",
        )
