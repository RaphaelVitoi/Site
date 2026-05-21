import aiosqlite
import sqlite3
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class LabManager:
    """
    Camada de Acesso a Dados (DAL) SOTA para o Laboratorio ICM/GTO.
    Interage diretamente com o banco gerado pelo Prisma (dev.db).
    """
    def __init__(self, db_path: str = "prisma/dev.db"):
        self.db_path = db_path

    async def get_tournaments(self) -> List[Dict[str, Any]]:
        """Recupera todos os torneios ativos."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = sqlite3.Row
                async with db.execute("SELECT * FROM Tournament ORDER BY start_date DESC") as cursor:
                    rows = await cursor.fetchall()
                    return [dict(row) for row in rows]
        except sqlite3.OperationalError as e:
            logger.error(f"Erro ao acessar Prisma DB (Ja executou 'npx prisma db push'?): {e}")
            return []

    async def get_scenarios_for_tournament(self, tournament_id: str) -> List[Dict[str, Any]]:
        """Recupera cenarios atrelados a um torneio."""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = sqlite3.Row
                async with db.execute("SELECT * FROM TournamentScenario WHERE tournamentId = ?", (tournament_id,)) as cursor:
                    rows = await cursor.fetchall()
                    return [dict(row) for row in rows]
        except sqlite3.OperationalError:
            return []
