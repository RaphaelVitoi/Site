"""
Gerenciamento e persistencia de dados experimentais e cenarios SOTA (Lab Manager).
"""

import logging
import sqlite3
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
