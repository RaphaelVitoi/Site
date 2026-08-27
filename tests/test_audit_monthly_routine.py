"""Testes da rotina de auditoria mensal de Modus Operandi e roteamento.

Travam dois defeitos reais encontrados em 2026-08-27, ambos da familia
"sinal verde desconectado":

1. A auditoria RECOMENDAVA monitorar releases de fronteira com um literal fixo,
   enquanto `rotas_suspeitas()` vivia sem chamador no modulo do qual ela ja
   importava.
2. `mo_status` era indexado por basename, e dois manuais compartilham o nome
   `MODUS_OPERANDI.md`. O canonico multiprojeto era engolido em silencio.

O segundo e o mais perigoso dos dois: colisao de chave NAO alcanca ramo de
erro. O arquivo existe, so nao e o que a tabela afirma. Nenhuma auditoria que
le output pega isso  so a que compara cardinalidade.
"""

from __future__ import annotations

import datetime
from pathlib import Path

import pytest

from scripts.routines.audit_monthly_modus_operandi_and_routing import (
    _frontmatter,
    auditar_manuais,
)

CAMPOS_OBRIGATORIOS = ("id", "tipo", "escopo", "autor", "criado_em", "verificado", "nao_verificado")


#  Colisao de chave: o defeito que nao alcanca ramo de erro


@pytest.fixture
def arvore_com_basename_repetido(tmp_path: Path) -> tuple[Path, list[Path]]:
    """Reproduz a topologia real: manual na raiz e manual no projeto, mesmo nome."""
    raiz = tmp_path
    projeto = raiz / "Site"
    (projeto / "docs").mkdir(parents=True)

    manual_raiz = raiz / "MODUS_OPERANDI.md"
    manual_projeto = projeto / "MODUS_OPERANDI.md"
    outro = projeto / "docs" / "ARQUITETURA.md"

    manual_raiz.write_text("CAMADA 1 CAMADA 2 CAMADA 3 CAMADA 4 MCP\n" + "x" * 5000, encoding="utf-8")
    manual_projeto.write_text("CAMADA 1 MCP\n", encoding="utf-8")
    outro.write_text("nada\n", encoding="utf-8")

    return raiz, [manual_raiz, manual_projeto, outro]


def test_manuais_de_mesmo_basename_nao_colidem(arvore_com_basename_repetido):
    """O defeito: indexar por `f.name` fazia o segundo sobrescrever o primeiro."""
    raiz, arquivos = arvore_com_basename_repetido
    mo_status, alertas = auditar_manuais(arquivos, raiz=raiz)

    assert len(mo_status) == len(arquivos) == 3, f"manual engolido: {sorted(mo_status)}"
    assert "MODUS_OPERANDI.md" in mo_status
    assert "Site/MODUS_OPERANDI.md" in mo_status
    assert not alertas, alertas


def test_o_manual_raiz_preserva_os_proprios_dados(arvore_com_basename_repetido):
    """Nao basta ter 3 linhas: a linha certa tem que trazer o arquivo certo.

    Na colisao original a linha existia, dizia 'presente', e trazia o tamanho do
    OUTRO arquivo. Contar sem conferir o conteudo deixaria isso passar.
    """
    raiz, arquivos = arvore_com_basename_repetido
    mo_status, _ = auditar_manuais(arquivos, raiz=raiz)

    tam_raiz = mo_status["MODUS_OPERANDI.md"]["tamanho_bytes"]
    tam_projeto = mo_status["Site/MODUS_OPERANDI.md"]["tamanho_bytes"]
    assert tam_raiz > tam_projeto, "a linha da raiz esta exibindo os dados do manual de projeto"
    assert mo_status["MODUS_OPERANDI.md"]["tem_4_camadas"] is True
    assert mo_status["Site/MODUS_OPERANDI.md"]["tem_4_camadas"] is False


def test_guarda_de_cardinalidade_denuncia_colisao(tmp_path: Path):
    """Se a colisao voltar por outro caminho, a contagem tem que gritar.

    Forcado com dois caminhos que resolvem para o MESMO rotulo relativo: e o
    unico jeito de a cardinalidade cair sem reintroduzir o bug de basename.
    """
    (tmp_path / "MODUS_OPERANDI.md").write_text("MCP\n", encoding="utf-8")
    duplicado = tmp_path / "MODUS_OPERANDI.md"

    mo_status, alertas = auditar_manuais([duplicado, duplicado], raiz=tmp_path)

    assert len(mo_status) == 1
    assert any("Colisao de chave" in a for a in alertas), alertas


def test_manual_ausente_vira_alerta(tmp_path: Path):
    mo_status, alertas = auditar_manuais([tmp_path / "NAO_EXISTE.md"], raiz=tmp_path)
    assert mo_status["NAO_EXISTE.md"]["existe"] is False
    assert any("nao encontrado" in a for a in alertas)


#  Frontmatter: derivado, nunca literal


def _bloco(texto: str) -> dict[str, str]:
    linhas = texto.splitlines()
    assert linhas[0] == "---", "frontmatter tem que abrir na primeira linha"
    fim = linhas.index("---", 1)
    chaves = {}
    for linha in linhas[1:fim]:
        if linha and not linha.startswith(" ") and ":" in linha:
            k, _, v = linha.partition(":")
            chaves[k.strip()] = v.strip()
    return chaves


def _frontmatter_de_exemplo(**over):
    base = dict(
        agora=datetime.datetime(2026, 8, 27, 15, 30),
        mes_ano="2026_08",
        status_camadas={"m1": {"status": "OK"}, "m2": {"status": "OK"}},
        mo_status={"a.md": {"existe": True}, "b.md": {"existe": True}},
        suspeitas={},
        cob={"agentes": 19, "subagentes": 13},
        n_agentes_resolvidos=19,
    )
    base.update(over)
    return _frontmatter(**base)


def test_frontmatter_tem_todos_os_campos_obrigatorios():
    chaves = _bloco(_frontmatter_de_exemplo())
    faltando = [c for c in CAMPOS_OBRIGATORIOS if c not in chaves]
    assert not faltando, f"o portao de ancora reprovaria: {faltando}"


def test_classe_externa_traz_fontes_e_ttl():
    """M.O. 13.A: fato externo decai pelo TEMPO, entao exige fonte e TTL."""
    texto = _frontmatter_de_exemplo()
    chaves = _bloco(texto)
    assert "externo" in chaves["classes"]
    assert "fontes" in chaves and "ttl_dias" in chaves
    assert "medido" in chaves["classes"] and "config_medida" in chaves


def test_nao_verificado_nunca_sai_vazio():
    """Verificacao nao executada nao e verificacao aprovada (governanca, secao 5)."""
    texto = _frontmatter_de_exemplo()
    corpo = texto.split("nao_verificado:", 1)[1]
    primeira = corpo.splitlines()[1]
    assert primeira.startswith("  - "), "nao_verificado sem itens reprova no portao"
    assert "chaves deste ambiente" in texto, "a limitacao real (sem chamada a provedor) sumiu"


def test_contagens_do_frontmatter_sao_derivadas_nao_literais():
    """O defeito de origem foi texto fixo. Mudar a entrada tem que mudar a saida."""
    a = _frontmatter_de_exemplo(cob={"agentes": 19, "subagentes": 13})
    b = _frontmatter_de_exemplo(cob={"agentes": 7, "subagentes": 2})
    assert "19 agentes e 13 subagentes" in a
    assert "7 agentes e 2 subagentes" in b
    assert a != b, "frontmatter nao reage a mudanca de entrada: voltou a ser literal"


def test_rotas_suspeitas_aparecem_no_config_medida():
    limpo = _frontmatter_de_exemplo(suspeitas={})
    sujo = _frontmatter_de_exemplo(suspeitas={"governanca": "vencida", "estrategia": "vencida"})
    assert "rotas_suspeitas: 0" in limpo
    assert "rotas_suspeitas: 2" in sujo


def test_manual_ausente_entra_no_nao_verificado():
    texto = _frontmatter_de_exemplo(mo_status={"a.md": {"existe": True}, "sumido.md": {"existe": False}})
    assert "sumido.md" in texto
    assert "presenca em disco de 1 de 2" in texto
