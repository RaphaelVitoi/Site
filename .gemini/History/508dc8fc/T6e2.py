import logging
import sqlite3
from pathlib import Path

# Lazy import para economizar overhead de startup no ecossistema base
try:
    import numpy as np
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder
except ImportError:
    np = None
    LabelEncoder = None
    RandomForestClassifier = None

logger = logging.getLogger(__name__)


class PredictiveForestEngine:
    """
    SOTA: Motor de Random Forest para telemetria de Quiz e Dashboard.
    Opera sob a jurisdicao do @historian.
    """

    def __init__(self, db_path: str = "queue/tasks.db"):
        self.db_path = Path(db_path).resolve()
        self.model = None
        self.label_encoder = None
        self._is_trained = False

        if RandomForestClassifier is None:
            logger.warning(
                "[PREDICTIVE] scikit-learn ausente. Motor Preditivo operara em fallback (pesos neutros)."
            )
        else:
            self._ensure_schema()

    def _get_db_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _ensure_schema(self) -> None:
        """Garante a existencia da tabela telemetry_logs (Autopoiese)."""
        schema = """
        CREATE TABLE IF NOT EXISTS telemetry_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            category TEXT NOT NULL,
            time_ms INTEGER NOT NULL,
            is_correct INTEGER NOT NULL,
            ev_loss REAL NOT NULL,
            user_id TEXT DEFAULT 'local',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """
        try:
            with self._get_db_connection() as conn:
                conn.execute(schema)
                conn.commit()
        except sqlite3.Error as e:
            logger.error(f"[PREDICTIVE] Falha ao forjar schema SQLite: {e}")

    def train_model(self) -> bool:
        """
        Extrai a telemetria bruta do SQLite, codifica as features (CFR) e treina a Forest.
        Execucao isolada e idealmente orquestrada via @skillmaster (Background CRON).
        """
        if RandomForestClassifier is None or np is None or LabelEncoder is None:
            return False

        try:
            with self._get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT category, time_ms, is_correct, ev_loss FROM telemetry_logs WHERE type = 'quiz'"
                )
                rows = cursor.fetchall()

                if len(rows) < 50:
                    logger.info(
                        "[PREDICTIVE] Amostragem insuficiente (<50). Treinamento abortado."
                    )
                    return False

                # Extração em massa (SOTA CFR)
                categories = [row["category"] for row in rows]
                time_ms = [row["time_ms"] for row in rows]
                ev_loss = [row["ev_loss"] for row in rows]
                y = np.array([row["is_correct"] for row in rows])

                # Codificação Categórica do Rótulo
                self.label_encoder = LabelEncoder()
                cat_encoded = self.label_encoder.fit_transform(categories)

                # Matriz de Features (X): [categoria_codificada, tempo_resposta, ev_perdido]
                X = np.column_stack((cat_encoded, time_ms, ev_loss))

                self.model = RandomForestClassifier(
                    n_estimators=100,
                    max_depth=5,
                    random_state=42,
                    class_weight="balanced",
                )
                self.model.fit(X, y)

                self._is_trained = True
                logger.info(
                    "[PREDICTIVE] Mente Preditiva (Random Forest) calibrada com sucesso."
                )
                return True
        except sqlite3.Error as e:
            logger.error(f"[PREDICTIVE] Erro de banco de dados no treinamento: {e}")
            return False
        except Exception as e:  # noqa: BLE001
            logger.error(f"[PREDICTIVE] Falha Catastrofica no treinamento: {e}")
            return False

    def get_predictive_profile(self) -> dict[str, float]:
        """
        Retorna um dicionario de categorias e o peso ponderado de deficiencia.
        Integra-se diretamente na rota API proxy para o frontend (Next.js).
        """
        fallback_profile = {
            "Fundamento ICM": 0.5,
            "Risk Premium (Bolha)": 0.5,
            "Vantagem de Risco (God Mode)": 0.5,
            "Valuation (Top-Heavy)": 0.5,
            "Sobrevivência Crítica (FGS)": 0.5,
        }

        if not self._is_trained or self.model is None or self.label_encoder is None:
            return fallback_profile

        try:
            profile = {}
            known_categories = self.label_encoder.classes_

            for cat in known_categories:
                cat_enc = self.label_encoder.transform([cat])[0]
                # X_test simula uma métrica basal para medir a vulnerabilidade pura da categoria
                # [categoria, tempo_medio_sintetico_5s, ev_loss_basal]
                X_test = np.array([[cat_enc, 5000, 0.05]])

                # predict_proba extrai probabilidade para classes [0 (erro), 1 (acerto)]
                prob_error = self.model.predict_proba(X_test)[0][0]
                profile[str(cat)] = float(prob_error)

            # Preserva fallback para chaves recém-adicionadas que ainda não têm dados na telemetria
            for cat, weight in fallback_profile.items():
                if cat not in profile:
                    profile[cat] = weight

            return profile
        except Exception as e:  # noqa: BLE001
            logger.warning(
                f"[PREDICTIVE] Falha na inferência do perfil, usando fallback: {e}"
            )
            return fallback_profile
