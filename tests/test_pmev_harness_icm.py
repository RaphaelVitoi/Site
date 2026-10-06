"""O harness de paridade ICM x ChipEV precisa continuar verde.

Por que um teste para o harness: ele é o unico mecanismo que detecta se
`engine/icm_matrix.py` mudou depois que o artefato publico foi gerado. Se o
kernel divergir e ninguem rodar `python -m engine.pmev_harness_icm`, a
divergencia so aparece no proximo relatorio -- ou nunca.

O que estes testes NAO prometem:

- Nao revalidam as 15.459 estados do benchmark. O artefato so publica
  agregados e uma amostra de 12 estados por estrutura; as maos de origem nao
  sao versionadas. Ver a docstring de `engine/pmev_harness_icm.py`.
# Nao reamostram o bootstrap por torneio. Isso e irreproduzivel de proposito.

O que eles prometem, sobre o harness:

1. Verde no artefato commitado (o motor bate com o que foi publicado).
2. Vermelho quando o motor muda (a sensibilidade é real, nao decorativa).
3. Vermelho quando o artefato é adulterado (o harness le o artefato de fato).
"""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

import pytest

from engine import pmev_harness_icm
from engine.pmev_harness_icm import ARTEFATO_PADRAO, rodar, verificar_estrutura


def _artefato() -> dict[str, Any]:
    return json.loads(ARTEFATO_PADRAO.read_text(encoding="utf-8"))


class TestArtefatoCommitado:
    def test_harness_fica_verde_no_artefato_do_repo(self) -> None:
        relatorios = rodar()
        falhas = [(r.estrutura_id, v.nome, v.detalhe) for r in relatorios for v in r.falhas()]
        assert not falhas, f"harness vermelho no artefato commitado: {falhas}"

    def test_cobre_todas_as_estruturas_publicadas(self) -> None:
        dados = _artefato()
        relatorios = rodar()
        assert {r.estrutura_id for r in relatorios} == {e["id"] for e in dados["estruturas"]}

    def test_recompara_mais_de_um_assento_por_estado(self) -> None:
        """Uma checagem so do heroi nao pegaria erro de permutao entre mesas."""
        total = 0
        for rel in rodar():
            for v in rel.verificacoes:
                if v.nome == "estados_recomparados":
                    assentos = int(v.detalhe.split("assentos")[0].strip().split(",")[-1])
                    total += assentos
        # 48 estados publicados (12 x 4 estruturas), todos com mais de 1 assento.
        assert total > 200, f"so {total} assentos recomparados; Amostras-POR_ESTRUTURA=12"


class TestSensibilidade:
    """O harness precisa FALHAR quando a coisa muda. Verde decorativo nao serve."""

    def test_falha_se_o_artefato_for_adulterado(self, tmp_path: Path) -> None:
        dados = copy.deepcopy(_artefato())
        primeiro = dados["estruturas"][0]
        alvo = primeiro["amostras"][0]["icm_ev"][0]
        primeiro["amostras"][0]["icm_ev"][0] = float(alvo) + 1.0

        adulterado = tmp_path / "adulterado.json"
        adulterado.write_text(json.dumps(dados), encoding="utf-8")

        falhas = [v for r in rodar(adulterado) for v in r.falhas()]
        assert falhas, "harness aceitou icm_ev adulterado em 1.0"
        assert any(v.nome == "icm_ev_conferido" for v in falhas)

    def test_falha_se_o_artefato_perder_a_amostra(self, tmp_path: Path) -> None:
        dados = copy.deepcopy(_artefato())
        for est in dados["estruturas"]:
            est["amostras"] = []

        sem_amostra = tmp_path / "sem_amostra.json"
        sem_amostra.write_text(json.dumps(dados), encoding="utf-8")

        falhas = [v for r in rodar(sem_amostra) for v in r.falhas()]
        assert falhas
        assert any(v.nome == "amostra_publicada" for v in falhas)

    def test_falha_se_a_diferenca_publicada_for_incoerente(self, tmp_path: Path) -> None:
        """`diferenca` tem de ser modelo - referencia. Se nao for, o agregado mente."""
        dados = copy.deepcopy(_artefato())
        bloco = dados["estruturas"][0]["metricas"]["brier_lugar"]
        bloco["diferenca"] = float(bloco["diferenca"]) + 0.5

        incoerente = tmp_path / "incoerente.json"
        incoerente.write_text(json.dumps(dados), encoding="utf-8")

        falhas = [v for r in rodar(incoerente) for v in r.falhas()]
        assert falhas
        assert any(v.nome.startswith("diferenca_confere") for v in falhas)

    def test_estrutura_sem_premios_e_recusada(self) -> None:
        est = {"id": "x", "amostras": [{"stacks": [1, 1], "icm_ev": [1.0, 1.0]}]}
        rel = verificar_estrutura(est, {"x": est["amostras"]})
        assert not rel.ok
        assert any(v.nome == "premios_disponiveis" for v in rel.falhas())


class TestContratoDoArtefato:
    def test_assentos_reportados_batem_com_a_amostra(self) -> None:
        """`estados_recomparados` soma os assentos de TODOS os estados da estrutura.

        O texto diz "12/12 estados, 74 assentos no total" -- 74 e a soma, nao o
        comprimento de um estado. Confere-se a soma, que e o invariante real.
        """
        dados = _artefato()
        for est in dados["estruturas"]:
            rel = verificar_estrutura(est, {est["id"]: est["amostras"]})
            detalhe = next(v.detalhe for v in rel.verificacoes if v.nome == "estados_recomparados")
            esperado = sum(len(a["stacks"]) for a in est["amostras"])
            assentos = int(detalhe.split(",")[-1].strip().split()[0])
            assert assentos == esperado, est["id"]

    def test_icm_e_chipev_conferem_na_spin(self) -> None:
        """Invariante do modelo: em `vencedor_leva_tudo`, ICM reproduz ChipEV."""
        dados = _artefato()
        spins = [e for e in dados["estruturas"] if e.get("vencedor_leva_tudo")]
        assert spins, "nenhuma estrutura com vencedor_leva_tudo no artefato"
        for est in spins:
            rel = verificar_estrutura(est, {est["id"]: est["amostras"]})
            nomes = {v.nome for v in rel.verificacoes}
            assert "spin_icm_igual_a_chipev" in nomes
            assert all(v.ok for v in rel.verificacoes)


class TestCodigoDeSaida:
    def test_main_retorna_zero_no_artefato_saudavel(self) -> None:
        assert pmev_harness_icm.main([]) == 0

    def test_main_retorna_um_quando_o_artefato_esta_errado(self, tmp_path: Path) -> None:
        dados = copy.deepcopy(_artefato())
        for est in dados["estruturas"]:
            est["amostras"] = []
        ruim = tmp_path / "ruim.json"
        ruim.write_text(json.dumps(dados), encoding="utf-8")

        assert pmev_harness_icm.main(["--artefato", str(ruim)]) == 1

    def test_json_e_machine_readable(self, capsys: pytest.CaptureFixture[str]) -> None:
        assert pmev_harness_icm.main(["--json"]) == 0
        saida = json.loads(capsys.readouterr().out)
        assert saida["ok"] is True
        assert saida["verificacoes_total"] > 0
        assert saida["falhas"] == []


@pytest.mark.parametrize("nome_arquivo", ["pmev_benchmark_icm_chipev.v1.json"])
def test_artefato_existe_e_declara_metodo(nome_arquivo: str) -> None:
    caminho = Path(__file__).resolve().parents[1] / "data" / nome_arquivo
    assert caminho.exists()
    dados = json.loads(caminho.read_text(encoding="utf-8"))
    assert dados["schema"] == "pmev-benchmark-icm-chipev/v1"
    # O harness anuncia o que nao faz; a frase so pode sair se for verdade.
    assert "nao versionadas" in dados["privacidade"] or "privacidade" in dados
