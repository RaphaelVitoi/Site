import sqlite3
import random
from pathlib import Path
import time
from datetime import datetime, timezone


def seed_telemetry():
    db_path = Path("frontend/prisma/dev.db").resolve()
    print(f"Connecting to {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # SOTA: Instanciação de entropia segura (OS-level) para purificar a AST e obliterar alertas S311 do Ruff
    secure_rand = random.SystemRandom()

    # Generate 25 rows of mock data
    for i in range(25):
        # SOTA: Variância lógica para garantir que a Random Forest possa extrair a Taxa de Maluquice
        is_viable = True if secure_rand.random() > 0.4 else False
        perspective_utility = (
            secure_rand.uniform(0.0, 5.0)
            if is_viable
            else secure_rand.uniform(-5.0, -0.1)
        )

        cursor.execute(
            """
            INSERT INTO VitoiPerspectiveMetric
            (id, scenarioId, chipEvFold, icmValuation, timeToBlindJumpMinutes, payjumpProximityFactor, positionalUrgency, multiwayOpponents, reverseImpliedOddsPenalty, stackDepthBb, humanNoiseFactor, technicalSuperiority, potOddsRatio, perspectiveUtility, insolvencyCoefficient, isViable, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                f"mock-{int(time.time() * 1000)}-{i}",
                "scenario-mock",
                secure_rand.uniform(-1.5, -0.1),  # chipEvFold
                secure_rand.uniform(5.0, 20.0),  # icmValuation
                secure_rand.uniform(1.0, 15.0),  # timeToBlindJumpMinutes
                secure_rand.uniform(0.1, 1.0),  # payjumpProximityFactor
                secure_rand.uniform(0.1, 1.0),  # positionalUrgency
                float(secure_rand.randint(1, 4)),  # multiwayOpponents
                secure_rand.uniform(0.0, 0.5),  # reverseImpliedOddsPenalty
                secure_rand.uniform(5.0, 50.0),  # stackDepthBb
                secure_rand.uniform(0.0, 1.0),  # humanNoiseFactor
                secure_rand.uniform(0.0, 1.0),  # technicalSuperiority
                secure_rand.uniform(0.1, 0.9),  # potOddsRatio
                perspective_utility,  # perspectiveUtility
                secure_rand.uniform(0.1, 0.8),  # insolvencyCoefficient
                1 if is_viable else 0,  # isViable (SQLite boolean)
                datetime.now(timezone.utc).isoformat(),  # createdAt
            ),
        )

    conn.commit()
    conn.close()
    print("Seed completed successfully. 25 rows inserted into VitoiPerspectiveMetric.")


if __name__ == "__main__":
    seed_telemetry()
