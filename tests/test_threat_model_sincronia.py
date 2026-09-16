"""O modelo de ameacas nao pode divergir do codigo em silencio.

Medido em 2026-09-16: reports/threat-modeling/pmev-site.tc.json declarava RLS estrito
num PostgreSQL que o repositorio nao tem, canais Supabase Realtime que nenhum codigo
abre e mitigacoes `mitigationResolved` sem um unico teste. Parecia auditado e nao
descrevia o sistema. O arquivo continua editavel no threat-composer; estes guards
cobram so o que torna uma afirmacao verificavel.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
MODELO = RAIZ / "reports" / "threat-modeling" / "pmev-site.tc.json"

STATUS_AMEACA = {"threatIdentified", "threatResolved", "threatNotUseful"}
STATUS_MITIGACAO = {
    "mitigationIdentified",
    "mitigationInProgress",
    "mitigationResolved",
    "mitigationResolvedWillNotAction",
}


@pytest.fixture(scope="module")
def modelo() -> dict:
    return json.loads(MODELO.read_text(encoding="utf-8"))


def _meta(item: dict, chave: str):
    return next((m["value"] for m in item.get("metadata") or [] if m["key"] == chave), None)


def _e_teste(caminho: str) -> bool:
    """Teste Python em tests/ ou teste jest do frontend (src/tests/, *.test.ts[x])."""
    return caminho.startswith("tests/") or "/tests/" in caminho or ".test." in Path(caminho).name


def _itens(modelo: dict) -> list[tuple[str, dict]]:
    return [("premissa", a) for a in modelo.get("assumptions", [])] + [
        ("mitigacao", m) for m in modelo.get("mitigations", [])
    ]


def test_toda_premissa_e_mitigacao_cita_evidencia_que_existe(modelo):
    faltando = []
    for tipo, item in _itens(modelo):
        evidencia = _meta(item, "custom:evidencia")
        if not evidencia:
            faltando.append(f"{tipo} {item['numericId']} sem custom:evidencia")
            continue
        faltando += [
            f"{tipo} {item['numericId']} cita caminho inexistente: {c}" for c in evidencia if not (RAIZ / c).exists()
        ]
    assert not faltando, "o modelo afirma o que o repositorio nao sustenta:\n" + "\n".join(faltando)


def test_mitigacao_resolvida_aponta_um_teste(modelo):
    sem_teste = [
        m["numericId"]
        for m in modelo.get("mitigations", [])
        if m.get("status") == "mitigationResolved" and not any(_e_teste(c) for c in _meta(m, "custom:evidencia") or [])
    ]
    assert not sem_teste, f"mitigacao resolvida sem teste que a prove: {sem_teste}"


def test_ameaca_resolvida_tem_ao_menos_uma_mitigacao_resolvida(modelo):
    resolvidas = {m["id"] for m in modelo.get("mitigations", []) if m.get("status") == "mitigationResolved"}
    ligacoes: dict[str, set[str]] = {}
    for link in modelo.get("mitigationLinks", []):
        ligacoes.setdefault(link["linkedId"], set()).add(link["mitigationId"])
    sem_base = [
        t["numericId"]
        for t in modelo.get("threats", [])
        if t.get("status") == "threatResolved" and not (ligacoes.get(t["id"], set()) & resolvidas)
    ]
    assert not sem_base, f"ameaca marcada resolvida sem mitigacao resolvida ligada: {sem_base}"


def test_ligacoes_apontam_para_itens_existentes(modelo):
    ids = {i["id"] for chave in ("assumptions", "mitigations", "threats") for i in modelo.get(chave, [])}
    orfas = [
        link
        for link in modelo.get("assumptionLinks", []) + modelo.get("mitigationLinks", [])
        if link["linkedId"] not in ids or link.get("assumptionId", link.get("mitigationId")) not in ids
    ]
    assert not orfas, f"ligacoes para itens que nao existem: {orfas}"


def test_ids_e_status_sao_consistentes(modelo):
    for chave, validos in (("threats", STATUS_AMEACA), ("mitigations", STATUS_MITIGACAO)):
        itens = modelo.get(chave, [])
        numeros = [i["numericId"] for i in itens]
        assert len(numeros) == len(set(numeros)), f"numericId repetido em {chave}"
        invalidos = [i["numericId"] for i in itens if i.get("status") not in validos]
        assert not invalidos, f"status fora do vocabulario do threat-composer em {chave}: {invalidos}"


def test_toda_ameaca_declara_quando_foi_medida(modelo):
    sem_data = [t["numericId"] for t in modelo.get("threats", []) if not _meta(t, "custom:medido_em")]
    assert not sem_data, f"ameaca sem custom:medido_em nao distingue revisada de esquecida: {sem_data}"
