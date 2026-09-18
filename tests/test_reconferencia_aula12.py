"""Guards da reconferencia da Aula 1.2 -- o campo que impede reancoragem sem leitura.

O defeito que estes testes existem para pegar nao e um erro de calculo: e uma
mentira de procedencia. Trocar `AULA_1_2_SHA256` pela versao vigente deixa os
sete pares internamente coerentes e a suite inteira verde, enquanto o dado passa
a afirmar que foi lido de um documento cujas capturas ninguem releu.

Cobrem tambem a nao-divergencia entre o fixture curado TypeScript e o espelho
JSON, que e a mesma obrigacao que `aula12PairsJson.test.ts` cumpre do outro lado
-- e que aqui vale porque os hosts de agente nao tem Node.
"""

from __future__ import annotations

import json
from pathlib import Path
import sys

import pytest

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts" / "ops"))

from gerar_reconferencia_aula12 import reconferencia as reconferencia_do_fixture  # noqa: E402

from engine.pmev_aula12_evidence import (  # noqa: E402
    AULA_1_2_SHA256,
    DATA_PATH,
    RECONFERENCE_LAYERS,
    Reconference,
    load_reconference,
)

SHA_VIGENTE = "b3fc15ba0b22ae2e15e38b5ea1aa59e1356b168d866bba2a1516958a5c23f930"


def _reconferencia(**troca: object) -> Reconference:
    base: dict[str, object] = {
        "document_sha256": SHA_VIGENTE,
        "conferido_em": "2026-09-18",
        "camadas_alcancadas": ("metadados", "texto"),
        "substrato": "extracao de texto versionada no repositorio",
        "confere": ("14 de 14 rotulos de no",),
        "divergencias": (),
        "nao_alcancado": ("as figuras",),
    }
    base.update(troca)
    return Reconference(**base)  # type: ignore[arg-type]


class TestEspelhoNaoDiverge:
    def test_json_e_identico_ao_fixture_typescript(self) -> None:
        espelho = json.loads(DATA_PATH.read_text(encoding="utf-8"))["reconferencia"]
        assert espelho == reconferencia_do_fixture()

    def test_o_espelho_carrega_e_declara_as_duas_versoes(self) -> None:
        rec = load_reconference()
        assert rec.document_sha256 == SHA_VIGENTE
        assert rec.document_sha256 != AULA_1_2_SHA256


class TestAncoraSustentada:
    """A tabela de decisao inteira. A ultima linha e a razao de existir do campo."""

    def test_ancora_na_versao_antiga_sem_figuras_e_o_estado_honesto(self) -> None:
        assert _reconferencia().ancora_sustentada(AULA_1_2_SHA256) is True

    def test_ancora_na_versao_antiga_com_figuras_segue_sustentada(self) -> None:
        rec = _reconferencia(camadas_alcancadas=("texto", "figuras"))
        assert rec.ancora_sustentada(AULA_1_2_SHA256) is True

    def test_ancora_na_versao_nova_com_figuras_e_legitima(self) -> None:
        rec = _reconferencia(camadas_alcancadas=("texto", "figuras"))
        assert rec.ancora_sustentada(SHA_VIGENTE) is True

    def test_ancora_na_versao_nova_sem_figuras_nao_se_sustenta(self) -> None:
        assert _reconferencia().ancora_sustentada(SHA_VIGENTE) is False

    def test_o_carregador_recusa_a_reancoragem_sem_leitura(self, tmp_path: Path) -> None:
        """O caso real de 2026-09-18: trocar o SHA em 5 arquivos e seguir em frente."""
        bruto = json.loads(DATA_PATH.read_text(encoding="utf-8"))
        bruto["reconferencia"]["documentSha256"] = AULA_1_2_SHA256
        alvo = tmp_path / "aula12_pairs.json"
        alvo.write_text(json.dumps(bruto, ensure_ascii=False), encoding="utf-8")
        with pytest.raises(ValueError, match="nao alcancou as figuras"):
            load_reconference(alvo)


class TestDeclaracaoMalformada:
    @pytest.mark.parametrize(
        ("troca", "motivo"),
        [
            (
                {"document_sha256": "7CA7C89F52C1A4173EE404F1BC4059CABD564FDDFB62129A6CD34789B86E4769"},
                "hexadecimal minusculo",
            ),
            ({"document_sha256": "b3fc15ba"}, "hexadecimal minusculo"),
            ({"camadas_alcancadas": ()}, "nenhuma camada alcancada"),
            ({"camadas_alcancadas": ("capturas",)}, "camada desconhecida"),
            ({"substrato": "   "}, "sem substrato nao e auditavel"),
        ],
        ids=["sha maiusculo", "sha curto", "sem camada", "camada inexistente", "sem substrato"],
    )
    def test_falha_fechado(self, troca: dict[str, object], motivo: str) -> None:
        # O `match` e o ponto: cada declaracao malformada tem que falhar pelo
        # SEU motivo. Um ValueError qualquer passaria mesmo se a validacao
        # errada disparasse, e o teste diria verde sobre a checagem trocada.
        with pytest.raises(ValueError, match=motivo):
            _reconferencia(**troca)

    def test_o_espelho_sem_o_bloco_e_erro_nao_ausencia_benigna(self, tmp_path: Path) -> None:
        bruto = json.loads(DATA_PATH.read_text(encoding="utf-8"))
        del bruto["reconferencia"]
        alvo = tmp_path / "aula12_pairs.json"
        alvo.write_text(json.dumps(bruto, ensure_ascii=False), encoding="utf-8")
        with pytest.raises(ValueError, match="sem bloco"):
            load_reconference(alvo)

    def test_as_camadas_conhecidas_sao_exatamente_tres(self) -> None:
        assert {"metadados", "texto", "figuras"} == RECONFERENCE_LAYERS


class TestConteudoMedido:
    """O que a reconferencia de 2026-09-18 de fato mediu, contra o que declara."""

    def test_nao_declara_ter_alcancado_as_figuras(self) -> None:
        rec = load_reconference()
        assert rec.alcancou_figuras is False
        assert any("figuras" in item for item in rec.nao_alcancado)

    def test_o_substrato_aponta_a_extracao_versionada_e_ela_existe(self) -> None:
        rec = load_reconference()
        caminho = RAIZ / "reports" / "curation" / "pmev-2026-09-09" / "text" / "S08.txt"
        assert caminho.name in rec.substrato
        assert caminho.exists()

    def test_os_catorze_rotulos_de_no_estao_na_extracao_da_versao_vigente(self) -> None:
        """O achado central da reconferencia, remedido a cada corrida."""
        import re
        import unicodedata

        def norm(s: str) -> str:
            s = unicodedata.normalize("NFKD", s)
            s = "".join(c for c in s if not unicodedata.combining(c)).lower()
            return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", s)).strip()

        texto = norm(
            (RAIZ / "reports" / "curation" / "pmev-2026-09-09" / "text" / "S08.txt").read_text(encoding="utf-8")
        )
        rotulos = [
            "2 Leading (ChipEV)",
            "39 Leading (IcmEV)",
            "3 IP action apos BB check",
            "41 IP action apos BB check",
            "13 BB X-R vs IP cbet size small",
            "42 BB X-R vs IP cbet size small",
            "14 IP reaction vs XR",
            "43 IP reaction vs XR",
            "15 BB XR and betting turn after IP calls (2d)",
            "44 BB XR and betting turn after IP calls (2d)",
            "28 IP reaction vs cbet turn OOP after xR flop (2d)",
            "45 IP reaction vs cbet turn OOP after xR flop (2d)",
            "29 OOP action river after IP calls turn (river 3h)",
            "46 OOP action river after IP calls turn (river 3h)",
        ]
        assert len(rotulos) == 14
        ausentes = [r for r in rotulos if norm(r) not in texto]
        assert ausentes == []

    def test_as_divergencias_achadas_ficam_declaradas(self) -> None:
        rec = load_reconference()
        assert len(rec.divergencias) == 2
        assert any("PAR_6" in d for d in rec.divergencias)
        assert any("PAR_7" in d for d in rec.divergencias)
