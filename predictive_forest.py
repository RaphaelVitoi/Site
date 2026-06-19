"""Modulo contendo a engine preditiva (Random Forest)."""
import logging
import sqlite3
from pathlib import Path

# Lazy import para economizar overhead de startup no ecossistema base
try:
    from sklearn.ensemble import RandomForestClassifier
except ImportError:
    RandomForestClassifier = None

logger = logging.getLogger(__name__)


class PredictiveForestEngine:
    """
    SOTA: Motor de Random Forest para telemetria de Quiz e Dashboard.
    Opera sob a jurisdicao do @historian.
    """

    def __init__(self, db_path: str | None = None):
        # Resolve path prioritizing the Prisma frontend db
        if db_path is None or db_path == "queue/tasks.db":
            candidates = [
                Path("frontend/prisma/dev.db"),
                Path("prisma/dev.db"),
                Path("frontend/dev.db"),
                Path("dev.db"),
            ]
            for cand in candidates:
                resolved = cand.resolve()
                if resolved.exists():
                    self.db_path = resolved
                    break
            else:
                self.db_path = Path("frontend/prisma/dev.db").resolve()
        else:
            self.db_path = Path(db_path).resolve()

        self.model = None
        self._is_trained = False
        self.profile_path = Path(__file__).parent.resolve() / "predictive_profile.json"
        self.feature_keys = [
            "potOddsRatio",
            "reverseImpliedOddsPenalty",
            "timeToBlindJumpMinutes",
            "payjumpProximityFactor",
            "insolvencyCoefficient",
            "positionalUrgency",
            "gravity",
            "downward_drift"
        ]

        if RandomForestClassifier is None:
            logger.warning(
                "[PREDICTIVE] scikit-learn ausente. Motor Preditivo operara em "
                "fallback (pesos neutros)."
            )

    def _get_db_connection(self) -> sqlite3.Connection:
        # SOTA Guard: Concorrencia Docker (WAL Mode) previne 'database is locked'
        conn = sqlite3.connect(self.db_path, timeout=20.0)
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA busy_timeout=5000;")
        conn.row_factory = sqlite3.Row
        return conn

    def train_model(self) -> bool:
        """
        Extrai a telemetria bruta do SQLite, codifica as features e treina a Forest.
        """
        if RandomForestClassifier is None:
            logger.error("[PREDICTIVE] Abortado: RandomForestClassifier nao importado.")
            return False

        try:
            with self._get_db_connection() as conn:
                cursor = conn.cursor()
                # Query all events with metadata containing situation metrics
                cursor.execute(
                    "SELECT isCorrect, metadata FROM TelemetryEvent WHERE metadata IS NOT NULL"
                )
                rows = cursor.fetchall()

                features_list = []
                targets = []

                for row in rows:
                    meta_str = row["metadata"]
                    if not meta_str:
                        continue
                    try:
                        import json
                        meta = json.loads(meta_str)
                        # Extract features in a consistent order if all keys are present
                        if all(k in meta for k in self.feature_keys):
                            features = [float(meta[k]) for k in self.feature_keys]
                            features_list.append(features)
                            targets.append(1 - int(row["isCorrect"]))  # User error: 1 - isCorrect
                    except (ValueError, TypeError, KeyError) as e:
                        logger.debug("[PREDICTIVE] Erro ao parsear metadata: %s", e)

                # Requisicao de amostragem minima reduzida para 10 para
                # ambientes de teste
                if len(features_list) < 10:
                    logger.info(
                        "[PREDICTIVE] Amostragem insuficiente (%d < 10). Treinamento abortado.",
                        len(features_list)
                    )
                    return False

                import numpy as np
                features_array = np.array(features_list)
                targets_array = np.array(targets)

                self.model = RandomForestClassifier(
                    n_estimators=50, max_depth=4, random_state=42
                )
                self.model.fit(features_array, targets_array)

                self._is_trained = True
                logger.info(
                    "[PREDICTIVE] Mente Preditiva (Random Forest) calibrada "
                    "com sucesso com %d amostras.",
                    len(features_list)
                )

                # Persistir perfil preditivo calibrado em formato puro ASCII no disco
                profile = self._compute_modulated_profile()
                try:
                    import json
                    with open(self.profile_path, "w", encoding="ascii") as f:
                        json.dump(profile, f, ensure_ascii=True)
                    logger.info("[PREDICTIVE] Perfil preditivo calibrado persistido com sucesso.")
                except OSError as e:
                    logger.error("[PREDICTIVE] Falha ao persistir perfil preditivo no disco: %s", e)

                return True
        except sqlite3.Error as e:  # noqa: BLE001
            logger.error("[PREDICTIVE] Falha Catastrofica no treinamento: %s", e)
            return False

    def _compute_modulated_profile(self) -> dict[str, float]:
        """
        Retorna um dicionario de categorias e o peso ponderado de deficiencia.
        Utiliza a importancia das features para modular o baseline de erros.
        """
        profile = {
            "Aversao ao Risco": 0.85,
            "Pot Entrapment": 0.65,
            "Miopia de Payjump": 0.90,
            "Excesso de Agressao": 0.30,
            "Passivo Estrutural (RIO)": 0.75,
            "Desvio de Nash": 0.45,
        }

        if self._is_trained and self.model is not None:
            try:
                importances = dict(
                    zip(self.feature_keys, self.model.feature_importances_, strict=True)
                )
                scale = 0.3

                # Modulate baseline using feature importances
                risk_mod = (
                    importances.get("gravity", 0.0)
                    + importances.get("timeToBlindJumpMinutes", 0.0)
                ) * scale
                profile["Aversao ao Risco"] = round(
                    min(1.0, max(0.0, profile["Aversao ao Risco"] + risk_mod)), 2
                )

                pot_mod = importances.get("potOddsRatio", 0.0) * scale
                profile["Pot Entrapment"] = round(
                    min(1.0, max(0.0, profile["Pot Entrapment"] + pot_mod)), 2
                )

                payjump_mod = importances.get("payjumpProximityFactor", 0.0) * scale
                profile["Miopia de Payjump"] = round(
                    min(1.0, max(0.0, profile["Miopia de Payjump"] - payjump_mod)), 2
                )

                aggro_mod = importances.get("positionalUrgency", 0.0) * scale
                profile["Excesso de Agressao"] = round(
                    min(1.0, max(0.0, profile["Excesso de Agressao"] + aggro_mod)), 2
                )

                rio_mod = importances.get("reverseImpliedOddsPenalty", 0.0) * scale
                profile["Passivo Estrutural (RIO)"] = round(
                    min(1.0, max(0.0, profile["Passivo Estrutural (RIO)"] + rio_mod)), 2
                )

                nash_mod = (
                    importances.get("insolvencyCoefficient", 0.0)
                    + importances.get("downward_drift", 0.0)
                ) * scale
                profile["Desvio de Nash"] = round(
                    min(1.0, max(0.0, profile["Desvio de Nash"] + nash_mod)), 2
                )
            except (AttributeError, TypeError, ValueError) as e:
                logger.error("[PREDICTIVE] Erro ao modular perfil preditivo: %s", e)

        return profile

    def get_predictive_profile(self) -> dict[str, float]:
        """
        Recupera o perfil preditivo do arquivo json persistido ou do prior/baseline.
        Garante a blindagem e conversao de chaves para compatibilidade com o formato ASCII puro.
        """
        # Se ja foi treinado em memoria neste processo, usa o modelo em memoria
        if self._is_trained and self.model is not None:
            return self._compute_modulated_profile()

        # Caso contrario, tenta carregar o arquivo persistido
        if self.profile_path.exists():
            try:
                with open(self.profile_path, "r", encoding="ascii") as f:
                    import json
                    profile = json.load(f)
                # Mapeia chaves acentuadas antigas para ASCII puro caso existam
                ascii_profile = {}
                ascii_map = {
                    "Aversao ao Risco": "Aversao ao Risco",
                    "Pot Entrapment": "Pot Entrapment",
                    "Miopia de Payjump": "Miopia de Payjump",
                    "Excesso de Agressao": "Excesso de Agressao",
                    "Passivo Estrutural (RIO)": "Passivo Estrutural (RIO)",
                    "Desvio de Nash": "Desvio de Nash",
                    "Aversao ao Risco": "Aversao ao Risco",
                    "Excesso de Agressao": "Excesso de Agressao"
                }
                for k, v in profile.items():
                    mapped_k = ascii_map.get(k, k)
                    ascii_profile[mapped_k] = v
                return ascii_profile
            except (OSError, ValueError) as e:
                logger.error("[PREDICTIVE] Erro ao carregar perfil: %s", e)

        # Fallback basico
        return self._compute_modulated_profile()
