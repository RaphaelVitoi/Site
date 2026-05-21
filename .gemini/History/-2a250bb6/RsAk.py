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

    # Generate 25 rows of mock data
    for i in range(25):
        # SOTA: Variância lógica para garantir que a Random Forest possa extrair a Taxa de Maluquice
        is_viable = True if random.random() > 0.4 else False
        perspective_utility = (
            random.uniform(0.0, 5.0) if is_viable else random.uniform(-5.0, -0.1)
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
                random.uniform(-1.5, -0.1),  # chipEvFold
                random.uniform(5.0, 20.0),  # icmValuation
                random.uniform(1.0, 15.0),  # timeToBlindJumpMinutes
                random.uniform(0.1, 1.0),  # payjumpProximityFactor
                random.uniform(0.1, 1.0),  # positionalUrgency
                float(random.randint(1, 4)),  # multiwayOpponents
                random.uniform(0.0, 0.5),  # reverseImpliedOddsPenalty
                random.uniform(5.0, 50.0),  # stackDepthBb
                random.uniform(0.0, 1.0),  # humanNoiseFactor
                random.uniform(0.0, 1.0),  # technicalSuperiority
                random.uniform(0.1, 0.9),  # potOddsRatio
                perspective_utility,  # perspectiveUtility
                random.uniform(0.1, 0.8),  # insolvencyCoefficient
                1 if is_viable else 0,  # isViable (SQLite boolean)
                datetime.now(timezone.utc).isoformat(),  # createdAt
            ),
        )

    conn.commit()
    conn.close()
    print("Seed completed successfully. 25 rows inserted into VitoiPerspectiveMetric.")


if __name__ == "__main__":
    seed_telemetry()
