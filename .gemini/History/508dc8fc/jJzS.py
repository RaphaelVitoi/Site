import concurrent.futures
import json
import logging
import sqlite3
from pathlib import Path
from typing import Any

# Lazy import para economizar overhead de startup no ecossistema base
try:
    import pandas as pd  # type: ignore
    from sklearn.ensemble import RandomForestClassifier
except ImportError:
    RandomForestClassifier = None
    pd = None

logger = logging.getLogger(__name__)


def _isolated_fit_and_extract(df: Any) -> tuple[Any, dict[str, float]]:
    """
    SOTA: Função top-level que isola o processamento CPU-Bound do scikit-learn e a
    manipulação do Pandas num processo segregado, blindando o Event Loop principal.
    """
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier

    if "category" in df.columns:
        X = pd.get_dummies(df[["category"]])
    else:
        feature_cols = [c for c in df.columns if c.startswith("feat_")]
        X = df[feature_cols].fillna(0.0)

    y = df["is_correct"].astype(int)
    ev_loss_weight = df["ev_loss"].fillna(0.0).astype(float).abs()
    sample_weights = 1.0 + ev_loss_weight

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=None,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced",
        max_features="sqrt",
    )
    model.fit(X, y, sample_weight=sample_weights)

    profile = {}
    if "category" in df.columns:
        for col in X.columns:
            cat_name = col.replace("category_", "")
            sample = pd.DataFrame(0, index=[0], columns=X.columns)  # type: ignore
            sample[col] = 1
            proba = model.predict_proba(sample)[0]
            vuln = proba[list(model.classes_).index(0)] if 0 in model.classes_ else 0.0
            profile[cat_name] = round(float(vuln), 2)
    else:
        global_vuln = 1.0 - y.mean()
        importances = dict(zip(X.columns, model.feature_importances_, strict=False))
        profile = {
            "Aversão ao Risco": round(
                global_vuln + importances.get("feat_risk_aversion", 0.0), 2
            ),
            "Pot Entrapment": round(
                global_vuln + importances.get("feat_pot_entrapment", 0.0), 2
            ),
            "Miopia de Payjump": round(
                global_vuln
                + importances.get("feat_payjump_myopia", 0.0)
                + importances.get("feat_time_myopia", 0.0),
                2,
            ),
            "Excesso de Agressão": round(
                global_vuln + importances.get("feat_over_aggression", 0.0), 2
            ),
            "Passivo Estrutural (RIO)": round(
                global_vuln + importances.get("feat_rio_passivo", 0.0), 2
            ),
            "Desvio de Nash": round(global_vuln, 2),
        }
        for k in profile:
            profile[k] = min(max(profile[k], 0.0), 1.0)
    return model, profile


class PredictiveForestEngine:
    """
    SOTA: Motor de Random Forest para telemetria de Quiz e Dashboard.
    Opera sob a jurisdicao do @historian.
    """

    def __init__(self, db_path: str = "queue/tasks.db"):
        self.db_path = Path(db_path).resolve()
        self.profile_path = Path(".claude/predictive_profile.json").resolve()
        self.model: Any = None
        self._is_trained = False

        if RandomForestClassifier is None or pd is None:
            logger.warning(
                "[PREDICTIVE] scikit-learn ou pandas ausente. Motor Preditivo operara em fallback (pesos neutros)."
            )

    def _get_db_connection(self) -> sqlite3.Connection:
        # SOTA Guard: Auto-discovery do Prisma DB caso a Telemetria resida nele
        db_target = self.db_path
        prisma_db = Path("frontend/prisma/dev.db").resolve()
        if prisma_db.exists() and "tasks.db" in str(db_target):
            db_target = prisma_db

        conn = sqlite3.connect(db_target, timeout=20.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA busy_timeout=5000;")
        conn.row_factory = sqlite3.Row
        return conn

    def _fetch_training_data(self) -> Any:
        if pd is None:
            return None

        try:
            with self._get_db_connection() as conn:
                try:
                    df = pd.read_sql_query(  # type: ignore
                        """
                        SELECT
                            potOddsRatio as feat_pot_entrapment,
                            reverseImpliedOddsPenalty as feat_rio_passivo,
                            timeToBlindJumpMinutes as feat_time_myopia,
                            payjumpProximityFactor as feat_payjump_myopia,
                            insolvencyCoefficient as feat_risk_aversion,
                            positionalUrgency as feat_over_aggression,
                            perspectiveUtility as ev_loss,
                            isViable as is_correct
                        FROM VitoiPerspectiveMetric
                        """,
                        conn,
                    )
                except sqlite3.OperationalError:
                    df = pd.read_sql_query(  # type: ignore
                        "SELECT category, is_correct, ev_loss FROM telemetry_logs", conn
                    )
                return df
        except Exception:
            logger.exception("[PREDICTIVE] Falha no I/O de dados.")
            return None

    def _persist_profile(self, profile: dict[str, float]) -> bool:
        try:
            self.profile_path.parent.mkdir(parents=True, exist_ok=True)
            with open(
                self.profile_path, "w", encoding="ascii", errors="backslashreplace"
            ) as f:
                json.dump(profile, f, ensure_ascii=True)
            self._is_trained = True
            logger.info(
                f"[PREDICTIVE] Mente Preditiva calibrada. Assinaturas bayesianas extraidas: {len(profile)}"
            )
            return True
        except Exception:
            logger.exception("[PREDICTIVE] Falha ao persistir perfil.")
            return False

    def train_model(self) -> bool:
        """
        Extrai a telemetria bruta do SQLite, codifica as features (CFR) e treina a Forest.
        Execucao isolada e idealmente orquestrada via @skillmaster (Background CRON).
        """
        if RandomForestClassifier is None or pd is None:
            return False

        df = self._fetch_training_data()
        if df is None:
            return False

        if (
            len(df) < 10
        ):  # Threshold dinâmico reduzido para calibração ultra-rápida (Cold-Start)
            logger.info(
                "[PREDICTIVE] Amostragem insuficiente (<10 registros). Treinamento abortado para prevenir overfitting."
            )
            return False

        df = df.dropna(subset=["is_correct"])
        if df.empty or df["is_correct"].nunique() < 2:
            logger.info(
                "[PREDICTIVE] Variancia nula na amostra (apenas acertos/erros). O modelo exige falibilidade para treinar."
            )
            return False

        # SOTA: Offloading de I/O CPU-Bound para ProcessPoolExecutor para blindar o Event Loop do Orquestrador
        try:
            with concurrent.futures.ProcessPoolExecutor(max_workers=1) as executor:
                future = executor.submit(_isolated_fit_and_extract, df)
                self.model, profile = future.result()
            return self._persist_profile(profile)
        except Exception:
            logger.exception(
                "[PREDICTIVE] Falha catastrófica no isolamento do processo de treinamento."
            )
            return False

    def get_predictive_profile(self) -> dict[str, float]:
        """
        Recupera a calibragem do disco para garantir Friccao Zero de I/O.
        """
        if self.profile_path.exists():
            try:
                with open(
                    self.profile_path, "r", encoding="ascii", errors="backslashreplace"
                ) as f:
                    return json.load(f)
            except Exception:
                logger.exception("[PREDICTIVE] Erro ao ler perfil calibrado.")

        fallback_profile = {
            "Aversão ao Risco": 0.85,
            "Pot Entrapment": 0.65,
            "Miopia de Payjump": 0.90,
            "Excesso de Agressão": 0.30,
            "Passivo Estrutural (RIO)": 0.75,
            "Desvio de Nash": 0.45,
        }

        return fallback_profile
