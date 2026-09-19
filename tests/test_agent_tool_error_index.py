"""Contratos de contagem e procedencia das fontes do indice de erros."""

import datetime as dt
import json
import os
from pathlib import Path

import pytest

from scripts.ops import agent_tool_error_index as indice


def _gravar(caminho: Path, registros: list[dict]) -> None:
    caminho.write_text("\n{invalido}\n" + "\n".join(json.dumps(registro) for registro in registros), encoding="utf-8")


def test_claude_conta_apenas_resultados_e_erro_booleano(tmp_path: Path) -> None:
    caminho = tmp_path / "abcdefgh-sessao.jsonl"
    _gravar(
        caminho,
        [
            {"timestamp": "2026-09-20T12:00:00", "message": {"content": "texto"}},
            {
                "timestamp": "2026-09-19T10:00:00",
                "message": {
                    "content": [
                        None,
                        {"type": "tool_use"},
                        {"type": "tool_result", "is_error": True},
                        {"type": "tool_result", "is_error": 1},
                        {"type": "tool_result", "is_error": "true"},
                    ]
                },
            },
        ],
    )
    assert list(indice.de_claude_code(str(tmp_path), "2026-09-19")) == [
        {
            "veiculo": "claude-code",
            "origem": "abcdefgh",
            "inicio": "2026-09-19T10:00",
            "chamadas": 3,
            "erros": 1,
            "taxa_pct": 33.3,
            "metodo": "is_error",
        }
    ]
    assert list(indice.de_claude_code(str(tmp_path), "2026-09-20")) == []


@pytest.mark.parametrize(
    "registros",
    [
        [{"message": {"content": [{"type": "tool_result"}]}}],
        [{"timestamp": "2026-09-19T10:00:00", "message": None}],
    ],
)
def test_claude_sem_medicao_ou_data_nao_produz_taxa_zero(tmp_path: Path, registros: list[dict]) -> None:
    _gravar(tmp_path / "sessao.jsonl", registros)
    assert list(indice.de_claude_code(str(tmp_path), "2026-09-01")) == []


def test_codex_preserva_denominador_formatos_e_corte_por_mtime(tmp_path: Path) -> None:
    caminho = tmp_path / "rollout-2026-09-19T10-00.jsonl"
    saidas = ["  Script failed\nerro", [{"text": "Script failed"}], "Script completed", [], [None], None]
    _gravar(
        caminho,
        [
            {"payload": {"type": tipo, "output": saida}}
            for tipo in ("custom_tool_call_output", "function_call_output")
            for saida in saidas
        ]
        + [{"payload": None}, {"payload": {"type": "function_call", "output": "Script failed"}}],
    )
    marca = dt.datetime(2026, 9, 19, 10).timestamp()
    os.utime(caminho, (marca, marca))
    linhas = list(indice.de_codex(str(tmp_path), "2026-09-19"))
    assert len(linhas) == 1
    assert linhas[0]["chamadas"] == 12
    assert linhas[0]["erros"] == 4
    assert linhas[0]["taxa_pct"] == 33.3
    assert linhas[0]["metodo"] == "sentinela"
    assert list(indice.de_codex(str(tmp_path), "2026-09-20")) == []


def test_ledger_ignora_registros_sem_medicao_e_preserva_procedencia(tmp_path: Path) -> None:
    caminho = tmp_path / "ledger.jsonl"
    _gravar(
        caminho,
        [
            {"record_type": "correction", "tool_calls": 3, "tool_errors": 1},
            {"record_type": "feedback", "tool_calls": 0, "tool_errors": 0},
            {"record_type": "feedback", "tool_calls": 3},
            {"record_type": "feedback", "tool_errors": 1},
            {"record_type": "feedback", "tool_calls": 4, "tool_errors": 1},
        ],
    )
    assert list(indice.do_ledger(str(caminho))) == [
        {
            "veiculo": "desconhecido",
            "origem": "sem-sessao",
            "inicio": "",
            "chamadas": 4,
            "erros": 1,
            "taxa_pct": 25.0,
            "metodo": "declarado",
        }
    ]
    assert list(indice.do_ledger(str(tmp_path / "ausente.jsonl"))) == []
