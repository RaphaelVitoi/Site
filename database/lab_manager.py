"""
Gerenciamento e persistencia de dados experimentais e cenarios SOTA (Lab Manager).
"""
from __future__ import annotations

import json
import logging
import sqlite3
import uuid
from pathlib import Path

import aiosqlite

logger = logging.getLogger(__name__)


class LabManager:
    """
    Gerenciador SOTA para os laboratorios e cenarios de testes quantitativos.
    """

    def __init__(self, db_path: str = "frontend/prisma/dev.db"):
        base_path = Path(__file__).parent.parent.resolve()
        self.db_path = base_path / db_path

    async def get_tournaments(self) -> list[dict[str, str | int]]:
        """Recupera todos os torneios ativos."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = sqlite3.Row
                async with db.execute("SELECT * FROM Tournament ORDER BY start_date DESC") as cursor:
                    rows = await cursor.fetchall()
                    return [dict(row) for row in rows]
        except sqlite3.OperationalError as err:
            logger.warning("Erro ao acessar Prisma DB (Ja executou 'npx prisma db push'?): %s", err)
            return []

    async def get_scenarios_for_tournament(self, tournament_id: str) -> list[dict[str, str | int]]:
        """Recupera cenarios atrelados a um torneio."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = sqlite3.Row
                async with db.execute(
                    "SELECT * FROM TournamentScenario WHERE tournamentId = ?",
                    (tournament_id,),
                ) as cursor:
                    rows = await cursor.fetchall()
                    return [dict(row) for row in rows]
        except sqlite3.OperationalError as err:
            logger.warning("Erro ao acessar Prisma DB: %s", err)
            return []

    async def save_pmev_benchmark_study(self, study_data: dict[str, str | float | int]) -> bool:
        """Persiste um estudo quantitativo de benchmark PMev no banco do laboratorio."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    """
                    CREATE TABLE IF NOT EXISTS PmevBenchmarkStudy (
                        id TEXT PRIMARY KEY,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        source TEXT NOT NULL,
                        scenario_name TEXT NOT NULL,
                        stack_bb REAL,
                        bubble_factor REAL,
                        time_to_blind REAL,
                        icm_req_equity REAL,
                        pmev_req_equity REAL,
                        delta_equity REAL,
                        hrc_ev_bb REAL,
                        pmev_ev_bb REAL,
                        monte_carlo_runs INTEGER,
                        delta_combos REAL,
                        raw_data_json TEXT
                    )
                    """
                )
                study_id = str(study_data.get("id", f"pmev_{uuid.uuid4().hex[:12]}"))
                await db.execute(
                    """
                    INSERT INTO PmevBenchmarkStudy (
                        id, source, scenario_name, stack_bb, bubble_factor,
                        time_to_blind, icm_req_equity, pmev_req_equity, delta_equity,
                        hrc_ev_bb, pmev_ev_bb, monte_carlo_runs, delta_combos, raw_data_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        study_id,
                        str(study_data.get("source", "HRC Pro v2.4.1")),
                        str(study_data.get("scenario_name", "Mesa Final MTT SB vs BB")),
                        float(study_data.get("stack_bb", 18.5)),
                        float(study_data.get("bubble_factor", 2.45)),
                        float(study_data.get("time_to_blind", 3.0)),
                        float(study_data.get("icm_req_equity", 0.4949)),
                        float(study_data.get("pmev_req_equity", 0.4316)),
                        float(study_data.get("delta_equity", -0.0633)),
                        float(study_data.get("hrc_ev_bb", -2.00)),
                        float(study_data.get("pmev_ev_bb", 0.13)),
                        int(study_data.get("monte_carlo_runs", 100000)),
                        float(study_data.get("delta_combos", 778.83)),
                        json.dumps(study_data.get("raw_data", {})),
                    ),
                )
                await db.commit()
                logger.info("Estudo PMev %s persistido no Laboratorio.", study_id)
                return True
        except Exception as err:
            logger.error("Erro ao salvar estudo PMev no LabManager: %s", err)
            return False

    async def get_pmev_benchmark_studies(self, limit: int = 20) -> list[dict[str, str | float | int]]:
        """Recupera estudos e benchmarks persistidos do PMev."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = sqlite3.Row
                async with db.execute(
                    "SELECT * FROM PmevBenchmarkStudy ORDER BY created_at DESC LIMIT ?",
                    (limit,),
                ) as cursor:
                    rows = await cursor.fetchall()
                    return [dict(row) for row in rows]
        except sqlite3.OperationalError:
            return []
