import aiosqlite
import sqlite3
import logging
from typing import List, Dict, Union

logger = logging.getLogger(__name__)


class LabManager:
    def __init__(self, db_path: str = "frontend/prisma/dev.db"):
        from pathlib import Path

        base_path = Path(__file__).parent.parent.resolve()
        self.db_path = base_path / db_path

    async def get_tournaments(self) -> List[Dict[str, Union[str, int]]]:
        """Recupera todos os torneios ativos."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = sqlite3.Row
                async with db.execute(
                    "SELECT * FROM Tournament ORDER BY start_date DESC"
                ) as cursor:
                    rows = await cursor.fetchall()
                    return [dict(row) for row in rows]
        except sqlite3.OperationalError as e:
            logger.exception(
                f"Erro ao acessar Prisma DB (Ja executou 'npx prisma db push'?): {e}"
            )
            return []

    async def get_scenarios_for_tournament(
        self, tournament_id: str
    ) -> List[Dict[str, Union[str, int]]]:
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
        except sqlite3.OperationalError:
            logger.exception("Erro ao acessar Prisma DB.")
            return []
