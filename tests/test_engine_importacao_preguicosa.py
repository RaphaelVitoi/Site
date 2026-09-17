"""Contrato de importacao do pacote engine.

Medido em 2026-09-17: `engine/__init__.py` importava todos os submodulos em cascata (cognitive -> agents.autonomy ->
database.queue_manager -> core.config), e importar `engine.jules_bridge`, que so usa a biblioteca padrao, custava
526 MB de memoria privada contra 9 MB de um Python vazio. O servidor MCP do Jules roda uma copia por hospedeiro de
agente; com cinco hospedeiros abertos eram ~2,8 GB, num host com a memoria comprometida em 98%.
"""

from __future__ import annotations

import importlib
import json
from pathlib import Path
import subprocess
import sys

import pytest

RAIZ = Path(__file__).resolve().parents[1]
PESADOS = (
    "engine.cognitive",
    "engine.timesfm_engine",
    "engine.game_theory_solvers",
    "engine.llm_api",
    "agents",
    "database",
    "numpy",
)


def _rodar(codigo: str) -> str:
    r = subprocess.run(
        [sys.executable, "-c", codigo], cwd=RAIZ, capture_output=True, text=True, check=False, timeout=120
    )
    assert r.returncode == 0, r.stderr[-2000:]
    return r.stdout.strip().splitlines()[-1]


def _modulos_carregados_apos(importacao: str) -> set[str]:
    return set(json.loads(_rodar(f"import json, sys; {importacao}; print(json.dumps(sorted(sys.modules)))")))


def test_submodulo_leve_nao_carrega_o_pacote_inteiro() -> None:
    carregados = _modulos_carregados_apos("import engine.jules_bridge")
    assert "engine.jules_bridge" in carregados
    assert not [m for m in PESADOS if m in carregados]


def test_toda_a_api_publica_continua_importavel_da_raiz() -> None:
    engine = importlib.import_module("engine")
    assert engine.__all__
    for nome in engine.__all__:
        valor = getattr(engine, nome)
        modulo = importlib.import_module(engine._ORIGEM[nome])
        assert valor is getattr(modulo, nome), nome


def test_nome_inexistente_falha_como_atributo_ausente() -> None:
    engine = importlib.import_module("engine")
    with pytest.raises(AttributeError, match="nao_existe"):
        engine.nao_existe  # noqa: B018


def test_dir_expoe_a_api_publica() -> None:
    engine = importlib.import_module("engine")
    assert set(engine.__all__) <= set(dir(engine))


def test_from_engine_import_continua_funcionando() -> None:
    codigo = "from engine import calculate_rio_risk, TimesFMEngine; print(json.dumps([callable(calculate_rio_risk), TimesFMEngine.__name__]))"
    assert json.loads(_rodar(f"import json; {codigo}")) == [True, "TimesFMEngine"]
