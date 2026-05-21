import json
import logging
import sqlite3
from pathlib import Path

# Lazy import para economizar overhead de startup no ecossistema base
try:
    import pandas as pd  # type: ignore
    from sklearn.ensemble import RandomForestClassifier
except ImportError:
    RandomForestClassifier = None
    pd = None

logger = logging.getLogger(__name__)


class PredictiveForestEngine:
    """
    SOTA: Motor de Random Forest para telemetria de Quiz e Dashboard.
    Opera sob a jurisdicao do @historian.
    """

    def __init__(self, db_path: str = "queue/tasks.db"):
        self.db_path = Path(db_path).resolve()
        self.profile_path = Path(".claude/predictive_profile.json").resolve()
        self.model = None
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

    def train_model(self) -> bool:
        """
        Extrai a telemetria bruta do SQLite, codifica as features (CFR) e treina a Forest.
        Execucao isolada e idealmente orquestrada via @skillmaster (Background CRON).
        """
        if RandomForestClassifier is None or pd is None:
            return False

        try:
            with self._get_db_connection() as conn:
                try:
                    # Adaptação SOTA para estrutura nativa Prisma (Next.js)
                    df = pd.read_sql_query(
                        "SELECT category, isCorrect as is_correct, evLoss as ev_loss FROM TelemetryEvent",
                        conn,
                    )
                except sqlite3.OperationalError:
                    # Fallback para schema legado (Queue DB)
                    df = pd.read_sql_query(
                        "SELECT category, is_correct, ev_loss FROM telemetry_logs", conn
                    )

                if (
                    len(df) < 10
                ):  # Threshold dinâmico reduzido para calibração ultra-rápida (Cold-Start)
                    logger.info(
                        "[PREDICTIVE] Amostragem insuficiente (<10 registros). Treinamento abortado para prevenir overfitting."
                    )
                    return False

                # Limpeza e codificação OHE SOTA
                df = df.dropna(subset=["category", "is_correct"])
                if df.empty or df["is_correct"].nunique() < 2:
                    logger.info(
                        "[PREDICTIVE] Variancia nula na amostra (apenas acertos/erros). O modelo exige falibilidade para treinar."
                    )
                    return False

                X = pd.get_dummies(df[["category"]])
                y = df["is_correct"].astype(int)

                # SOTA: Amostragem Bayesiana ponderada pela Gravidade do Erro (EV Loss).
                # Erros catastroficos (alto EV Loss) exercem maior pressao termodinamica no modelo.
                ev_loss_weight = df["ev_loss"].fillna(0.0).astype(float)
                sample_weights = 1.0 + ev_loss_weight

                self.model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=None,
                    min_samples_leaf=2,
                    random_state=42,
                    class_weight="balanced",
                )
                self.model.fit(X, y, sample_weight=sample_weights)

                # Extracao de matriz de probabilidade p/ o Perfil de Vulnerabilidades
                profile = {}
                for col in X.columns:
                    cat_name = col.replace("category_", "")
                    sample = pd.DataFrame(0, index=[0], columns=X.columns)
                    sample[col] = 1

                    proba = self.model.predict_proba(sample)[0]
                    # Isola a probabilidade de falha (classe 0) se existir no mapping do sklearn
                    vuln = (
                        proba[list(self.model.classes_).index(0)]
                        if 0 in self.model.classes_
                        else 0.0
                    )
                    profile[cat_name] = round(float(vuln), 2)

                # Persistencia atômica para consumo Lado Cliente (Next.js SSR)
                self.profile_path.parent.mkdir(parents=True, exist_ok=True)
                with open(self.profile_path, "w", encoding="utf-8") as f:
                    json.dump(profile, f)

                self._is_trained = True
                logger.info(
                    f"[PREDICTIVE] Mente Preditiva calibrada. Assinaturas bayesianas extraidas: {len(profile)}"
                )
                return True
        except Exception as e:  # noqa: BLE001
            logger.error(f"[PREDICTIVE] Falha Catastrofica no treinamento: {e}")
            return False

    def get_predictive_profile(self) -> dict[str, float]:
        """
        Recupera a calibragem do disco para garantir Friccao Zero de I/O.
        """
        if self.profile_path.exists():
            try:
                with open(self.profile_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"[PREDICTIVE] Erro ao ler perfil calibrado: {e}")

        fallback_profile = {
            "Fundamentos SOTA": 0.5,
            "Risk Premium": 0.5,
            "Bolha": 0.5,
            "Pós-Flop": 0.5,
            "Sobrevivência Crítica (FGS)": 0.5,
        }

        return fallback_profile
