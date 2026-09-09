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


class LabPersistenceUnavailableError(RuntimeError):
    """A persistencia do laboratorio nao respondeu -- banco, schema ou tabela.

    Existe para separar duas coisas que o DAO devolvia identicas: `[]` porque
    nao ha torneios (dado legitimo) e `[]` porque a tabela nao existe (defeito
    de configuracao). Medido em 2026-09-09: `Tournament` e `TournamentScenario`
    estao ausentes do `schema.prisma` E do banco vivo, entao a rota devolvia
    HTTP 200 SUCCESS com lista vazia -- indistinguivel de um laboratorio sem
    torneios cadastrados. Erro que se apresenta como sucesso e pior que erro.
    """


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
            raise LabPersistenceUnavailableError(f"Leitura de Tournament indisponivel: {err}") from err

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
            raise LabPersistenceUnavailableError(f"Leitura de TournamentScenario indisponivel: {err}") from err

    #: Campos que sao MEDICAO, e por isso nao podem ter default.
    #:
    #: Ate 2026-09-09 o metodo preenchia todos eles quando faltavam -- inclusive
    #: uma origem de solver comercial e equities com quatro casas. Um estudo
    #: gravado com `{}` ficava indistinguivel, no banco, de uma medicao real.
    #: `id` e `raw_data` continuam opcionais: um e identidade, o outro e anexo,
    #: e nenhum dos dois afirma um resultado.
    CAMPOS_DE_PROCEDENCIA = (
        "source",
        "scenario_name",
        "stack_bb",
        "bubble_factor",
        "time_to_blind",
        "icm_req_equity",
        "pmev_req_equity",
        "delta_equity",
        "hrc_ev_bb",
        "pmev_ev_bb",
        "monte_carlo_runs",
        "delta_combos",
    )

    async def save_pmev_benchmark_study(self, study_data: dict[str, str | float | int]) -> bool:
        """Persiste um estudo quantitativo de benchmark PMev no banco do laboratorio.

        Recusa a gravacao quando falta qualquer campo de procedencia: um ledger
        experimental que completa lacunas com defaults deixa de ser evidencia.
        """
        ausentes = [campo for campo in self.CAMPOS_DE_PROCEDENCIA if study_data.get(campo) is None]
        if ausentes:
            raise ValueError(
                "Estudo PMev recusado por procedencia incompleta; sem default para: " + ", ".join(ausentes)
            )
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
                        str(study_data["source"]),
                        str(study_data["scenario_name"]),
                        float(study_data["stack_bb"]),
                        float(study_data["bubble_factor"]),
                        float(study_data["time_to_blind"]),
                        float(study_data["icm_req_equity"]),
                        float(study_data["pmev_req_equity"]),
                        float(study_data["delta_equity"]),
                        float(study_data["hrc_ev_bb"]),
                        float(study_data["pmev_ev_bb"]),
                        int(study_data["monte_carlo_runs"]),
                        float(study_data["delta_combos"]),
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
        except sqlite3.OperationalError as err:
            raise LabPersistenceUnavailableError(f"Leitura de PmevBenchmarkStudy indisponivel: {err}") from err
