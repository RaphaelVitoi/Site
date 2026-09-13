"""Update SQLite FTS5 index with multi-drive discoveries across C, D, E, F, G."""

from __future__ import annotations

import sqlite3
from pathlib import Path

DB_PATH = Path(r"c:\Users\rapha\.gemini\Site\docs\research\pmev\pmev_knowledge.db")

multidrive_anchors = [
    # D:
    (
        "D:\\Solver work\\632 sem lead.cfr",
        "632 sem lead.cfr",
        "Solver CFR 23.27 GB - Simulação profunda pós-flop",
        "D:",
        ".cfr",
        23275066494,
        "Solvers & CFR",
    ),
    (
        "D:\\Solver work\\deepsolver comparasion.cfr",
        "deepsolver comparasion.cfr",
        "DeepSolver comparison CFR 19.09 GB",
        "D:",
        ".cfr",
        19098589217,
        "Solvers & CFR",
    ),
    (
        "D:\\AULAO VOCE NAO SABE JOGAR POKER RAPHAEL VITOI.mp4",
        "AULÃO VOCÊ NÃO SABE JOGAR POKER RAPHAEL VITOI",
        "Masterclass autoral em vídeo por Raphael Vitoi (620 MB)",
        "D:",
        ".mp4",
        620227640,
        "Masterclasses",
    ),
    (
        "D:\\notes.RaphaVitoi.xml",
        "notes.RaphaVitoi.xml",
        "Banco de dados de anotações de jogadores de Raphael Vitoi (5.3 MB)",
        "D:",
        ".xml",
        5337157,
        "Player Profiling & MDA",
    ),
    (
        "D:\\Solver work\\ICM pio sims BS x MS",
        "ICM pio sims BS x MS",
        "Pasta com múltiplas simulações de ICM em PioSolver",
        "D:",
        "[folder]",
        0,
        "Solvers & ICM",
    ),
    # E:
    (
        "E:\\ICM sims",
        "ICM sims",
        "Diretório especializado em simulações massivas de ICM",
        "E:",
        "[folder]",
        0,
        "Solvers & ICM",
    ),
    (
        "E:\\Biblioteca\\Artigos e livros\\E-Books interessantes para consulta\\Poker\\Inglês\\(freakonomics)THEROLEOFSKILLVERSUSLUCKINPOKER.pdf",
        "The Role of Skill Versus Luck in Poker",
        "Paper científico Freakonomics sobre habilidade vs sorte",
        "E:",
        ".pdf",
        98051,
        "Academic Literature",
    ),
    (
        "E:\\Biblioteca\\Acervo\\Akkari Team\\Akkari 2020 - Avançado",
        "Akkari Team 2020 - Avançado",
        "Coleção completa do curso avançado Akkari Team (mais de 400 vídeos e PDFs)",
        "E:",
        "[folder]",
        0,
        "Masterclasses & Courses",
    ),
    (
        "E:\\Biblioteca\\Estudos\\Curso Cash\\Monker Solver Files BB Node Locked-003",
        "Monker Solver Files BB Node Locked",
        "Solvers Monker com Nodelocks de Big Blind (múltiplos arquivos de 4.3 GB)",
        "E:",
        "[folder]",
        0,
        "Solvers & Monker",
    ),
    # F:
    (
        "F:\\Hermiones",
        "Hermiones Ranges & Solvers",
        "Biblioteca massiva com mais de 102.700 arquivos .rng de matrizes de range",
        "F:",
        "[folder]",
        0,
        "Ranges & Grids",
    ),
    (
        "F:\\MonkerSolver",
        "MonkerSolver Engine & Environment",
        "Ambiente de execução e árvores de MonkerSolver",
        "F:",
        "[folder]",
        0,
        "Solvers & Monker",
    ),
    (
        "F:\\Meu Drive\\PreflopTreeBuilding\\Templates\\SBvsBB",
        "Templates SB vs BB 15-40bb",
        "Árvores completas CFR de SB vs BB para stacks de 15bb a 40bb",
        "F:",
        "[folder]",
        0,
        "Solvers & Trees",
    ),
    # OneDrive Hydrated
    (
        "C:\\Users\\rapha\\OneDrive\\Aplicando Pressão em Cenários de Muito ICM.pptx",
        "Aplicando Pressão em Cenários de Muito ICM",
        "Apresentação Teórica de 36 slides sobre Pot Odds, RIO, MDF e ICM por Raphael Vitoi",
        "OneDrive",
        ".pptx",
        3227849,
        "Masterclasses",
    ),
    (
        "C:\\Users\\rapha\\OneDrive\\BOLHA BTN 40 BB 55 posflop.hrcz",
        "BOLHA BTN 40 BB 55 posflop.hrcz",
        "Simulação massiva de bolha HRC 10.95 GB",
        "OneDrive",
        ".hrcz",
        10953134794,
        "Solvers & HRC",
    ),
    (
        "C:\\Users\\rapha\\OneDrive\\Documentos\\TEORIA_PERSPECTIVA_MATEMATICA_VITOI.pdf",
        "TEORIA PERSPECTIVA MATEMÁTICA VITOI",
        "Manifesto do paradigma Vitoi, Axioma do EVfold e falácia das Pot Odds",
        "OneDrive",
        ".pdf",
        120870,
        "PMev Core",
    ),
]

conn = sqlite3.connect(str(DB_PATH))
cursor = conn.cursor()

for path_str, title, desc, origin, ext, sz, cat in multidrive_anchors:
    file_key = f"{origin}:{path_str}"
    cursor.execute(
        """
    INSERT INTO documents (file_key, title, path, origin, ext, size_bytes, category, snippet)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(file_key) DO UPDATE SET
        title=excluded.title,
        path=excluded.path,
        ext=excluded.ext,
        size_bytes=excluded.size_bytes,
        category=excluded.category,
        snippet=excluded.snippet;
    """,
        (file_key, title, path_str, origin, ext, sz, cat, desc),
    )

cursor.execute("INSERT OR REPLACE INTO documents_fts(documents_fts) VALUES('rebuild');")
conn.commit()
conn.close()

print("Âncoras multi-disco inseridas com sucesso no banco SQLite FTS5!")
