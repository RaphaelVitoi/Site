"""Benchmark precisa medir o que declara.

Medido em 2026-09-16: o benchmark WASM lia um buffer multiway nunca preenchido e
publicava 528 milhoes it/s de atalho de disjuntor; a suite imprimia VRAM fixa como
telemetria e terminava sempre em sucesso; o plot do hybrid router gerava dados
sinteticos em silencio quando o JSON faltava. Registro:
reports/REGISTRO-2026-09-16-benchmarks-medidos-e-nao-declarados.md
"""

# pylint: disable=import-outside-toplevel  # importorskip precisa rodar antes do import

from __future__ import annotations

import json
from pathlib import Path
import shutil
import subprocess

import pytest

RAIZ = Path(__file__).resolve().parent.parent


@pytest.mark.skipif(shutil.which("node") is None, reason="exige Node.js")
def test_benchmark_wasm_devolve_veredito_derivado_e_equidade_multiway_real():
    proc = subprocess.run(  # noqa: S603, S607  # Record-Id: registro-2026-09-16-benchmarks-medidos-e-nao-declarados
        ["node", str(RAIZ / "scripts" / "benchmark_wasm_quantum.mjs"), "--json", "--amostras", "3"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=180,
        check=False,
    )
    linha = next(ln for ln in proc.stdout.splitlines() if ln.startswith("{"))
    relatorio = json.loads(linha)
    assert relatorio["veredito"] == "OK", relatorio["falhas"]
    assert proc.returncode == 0
    assert relatorio["amostras_por_caso"] == 3
    assert relatorio["memoria_wasm_bytes"]["final"] >= relatorio["memoria_wasm_bytes"]["inicial"]
    multiway = next(c for c in relatorio["casos"] if c["caso"].startswith("multiway"))
    assert multiway["disjuntor"] == 0, "o disjuntor disparou: o caso voltou a medir o atalho de saida"
    assert abs(sum(multiway["equidades"]) - 1) < 1e-6, "o kernel voltou a nao avaliar maos"
    for caso in relatorio["casos"]:
        assert caso["min_ms"] <= caso["mediana_ms"] <= caso["max_ms"]


def test_suite_nao_imprime_telemetria_fixa():
    fonte = (RAIZ / "scripts" / "benchmark_sota_suite.py").read_text(encoding="utf-8")
    codigo = fonte.split('"""', 2)[2]  # fora da docstring, que documenta o defeito antigo
    for texto_fixo in ("Fatiamento Termodinamico", "Acceleration Active", "CONCLUIDO COM SUCESSO"):
        assert texto_fixo not in codigo


def test_plot_recusa_dataset_ausente_sem_pedido_de_sintetico(tmp_path):
    pytest.importorskip("matplotlib")
    from tools.hybrid_router.plot_benchmark import load_dataset  # noqa: PLC0415

    with pytest.raises(SystemExit):
        load_dataset(str(tmp_path / "nao_existe.json"))
    _, meta = load_dataset(None, permitir_sintetico=True)
    assert meta["modo"] == "sintetico"


def test_plot_le_o_modo_do_envelope_e_conta_falhas(tmp_path):
    pytest.importorskip("matplotlib")
    from tools.hybrid_router.plot_benchmark import load_dataset  # noqa: PLC0415

    arquivo = tmp_path / "r.json"
    resultado = {"target_executed": "GEMINI_37_FLASH_STANDARD", "latency_ms": 450.0, "thinking_tokens": 0}
    arquivo.write_text(
        json.dumps(
            {
                "modo": "simulado",
                "resultados": [
                    {**resultado, "is_success": True, "simulado": True},
                    {**resultado, "is_success": False, "simulado": False},
                ],
            }
        ),
        encoding="utf-8",
    )
    df, meta = load_dataset(str(arquivo))
    assert meta["modo"] == "simulado"
    assert (meta["total"], meta["sucesso"], len(df)) == (2, 1, 1)


def test_runner_classifica_o_modo_pelas_respostas():
    from tools.hybrid_router.benchmark import RequestResult, modo_da_execucao  # noqa: PLC0415

    def r(sucesso: bool, simulado: bool) -> RequestResult:
        return RequestResult(200, 1.0, "X", 0, 0, sucesso, simulado=simulado)

    assert modo_da_execucao([r(True, True), r(True, True)]) == "simulado"
    assert modo_da_execucao([r(True, False), r(False, True)]) == "real"
    assert modo_da_execucao([r(True, True), r(True, False)]) == "misto"
    assert modo_da_execucao([r(False, False)]) == "sem_sucesso"
