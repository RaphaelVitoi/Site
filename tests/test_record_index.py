"""Guardas do indice ancorado e do portao de registro -- M.O. 13.C e 13.F.

Contexto medido em 2026-08-28, encenando uma violacao de cada criterio da 13.F
em stage: **tres de sete bloqueavam**. Quatro criterios nao tinham o que ler --
o portao passava, e sempre passou, por ausencia de fonte de dados, nao por
limpeza do repositorio.

O achado de maior consequencia veio de graca junto: SEIS dos dez registros com
frontmatter nao eram YAML valido. O portao PowerShell confere campo obrigatorio
com `^([a-z_]+):`, e regex acha campo em bloco que nenhum parser le. Campo
presente num frontmatter ilegivel e a forma mais limpa de sinal verde
desconectado que esta base ja produziu -- e ela sobreviveu a duas sessoes de
auditoria justamente porque o portao dizia APROVADO.
"""

from __future__ import annotations

import subprocess
import sys
from datetime import date
from pathlib import Path

import pytest
import yaml

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "scripts" / "ops"))

import record_gate  # noqa: E402
import record_index  # noqa: E402


# ---------------------------------------------------------------------------
# todo registro tem de ser legivel por maquina
# ---------------------------------------------------------------------------


def _registros_com_frontmatter() -> list[Path]:
    return [
        p
        for p in record_index.arquivos_de_registro(RAIZ)
        if p.is_file() and p.read_text(encoding="utf-8-sig", errors="ignore").startswith("---")
    ]


def test_ha_registros_para_conferir():
    """Sem esta guarda, uma varredura vazia faria os testes seguintes passarem
    sem ler nada -- a mesma falha do arnes que contou 'nenhum teste coletado'
    como aprovacao."""
    assert _registros_com_frontmatter(), "nenhum registro com frontmatter foi encontrado"


def test_todo_frontmatter_e_yaml_valido():
    quebrados = []
    for p in _registros_com_frontmatter():
        bruto = p.read_text(encoding="utf-8-sig").split("\n---", 2)[0][3:]
        try:
            yaml.safe_load(bruto)
        except yaml.YAMLError as e:
            quebrados.append(f"{p.name}: {getattr(e, 'problem', e)}")
    assert not quebrados, "frontmatter que nenhum parser le:\n  " + "\n  ".join(quebrados)


def test_verificado_e_nao_verificado_sao_listas_de_texto():
    """`- texto: mais texto` vira MAPA, nao string. O campo continua 'presente'
    para um regex, e o conteudo vira outra coisa."""
    errados = []
    for p in _registros_com_frontmatter():
        fm, _ = record_index.ler_frontmatter(p)
        if not fm:
            continue
        for campo in ("verificado", "nao_verificado"):
            itens = fm.get(campo) or []
            if isinstance(itens, list) and any(not isinstance(x, str) for x in itens):
                errados.append(f"{p.name}:{campo}")
    assert not errados, f"item de lista que virou mapa: {errados}"


# ---------------------------------------------------------------------------
# o indice
# ---------------------------------------------------------------------------


def test_indice_fecha_a_cardinalidade():
    """Colisao de id nao aparece como ausencia -- aparece como sucesso."""
    indice = record_index.construir(RAIZ)
    t = indice["totais"]
    soma = t["vigente"] + t["suspeito"] + t["obsoleto"] + t["sem_frontmatter"]
    assert soma == indice["arquivos_varridos"], (
        f"a soma dos estados ({soma}) nao fecha com os arquivos varridos "
        f"({indice['arquivos_varridos']}): houve perda ou sobrescrita silenciosa"
    )


def test_estado_e_derivado_e_nao_declarado():
    """Nenhum registro declara `estado` no frontmatter: o estado vem da medicao."""
    for p in _registros_com_frontmatter():
        fm, _ = record_index.ler_frontmatter(p)
        assert "estado" not in (fm or {}), (
            f"{p.name} declara `estado` no frontmatter. A 13.C exige estado DERIVADO; "
            "declarado, ele envelhece sem que nada acuse."
        )


def test_supersede_marca_obsoleto():
    indice = record_index.construir(RAIZ)
    por_id = {r["id"]: r for r in indice["registros"]}
    for r in indice["registros"]:
        alvo = r.get("supersede")
        if alvo and str(alvo).lower() not in {"null", "none"} and alvo in por_id:
            assert por_id[alvo]["estado"] == "OBSOLETO", (
                f"{alvo} foi superseded por {r['id']} e continua {por_id[alvo]['estado']}"
            )


def test_ttl_vencido_e_detectado_e_ttl_vivo_nao():
    vencido = {"ttl_dias": 1, "fontes": [{"consultado_em": "2020-01-01"}]}
    vivo = {"ttl_dias": 3650, "fontes": [{"consultado_em": "2026-08-01"}]}
    hoje = date(2026, 8, 28)
    assert record_index.ttl_vencido(vencido, hoje), "TTL vencido passou"
    assert not record_index.ttl_vencido(vivo, hoje), "TTL vivo foi acusado"
    assert record_index.ttl_vencido({"ttl_dias": 30, "fontes": []}, hoje), (
        "ttl_dias sem consultado_em nao tem de onde contar e deve ser acusado"
    )
    assert record_index.ttl_vencido({}, hoje) is None, "registro sem ttl_dias nao tem o que vencer"


def test_config_medida_aceita_as_duas_leituras_de_raiz():
    """Falso positivo medido: `raiz` significa o projeto em um registro e a raiz
    multiprojeto em outro. Chave cujo sentido varia nao pode ter resolvedor de
    valor unico."""
    ambiente = record_index.resolvedores_de_ambiente(RAIZ)
    for valor in (str(RAIZ).replace("\\", "/"), str(RAIZ.parent).replace("\\", "/")):
        divergencias, _ = record_index.conferir_config_medida({"raiz": valor}, ambiente)
        assert not divergencias, f"raiz legitima acusada como divergente: {valor}"
    divergencias, _ = record_index.conferir_config_medida({"raiz": "/planeta/inexistente"}, ambiente)
    assert divergencias, "raiz de outro mundo passou"


def test_chave_desconhecida_nao_e_dada_por_conferida():
    """Tratar chave sem resolvedor como 'bate' seria inventar sinal verde."""
    ambiente = record_index.resolvedores_de_ambiente(RAIZ)
    divergencias, nao_conferiveis = record_index.conferir_config_medida(
        {"quantizador": "Q4_K_M"}, ambiente
    )
    assert not divergencias
    assert nao_conferiveis == ["quantizador"]


def test_o_indice_nao_e_versionado():
    """Cache commitado envelhece no primeiro registro editado sem rebuild -- a
    divergencia contra a qual a propria 13.C adverte."""
    saida = subprocess.run(
        ["git", "check-ignore", "data/RECORD_INDEX.json"],
        cwd=RAIZ, capture_output=True, text=True, check=False,
    )
    assert saida.returncode == 0, "data/RECORD_INDEX.json nao esta no .gitignore"
    rastreado = subprocess.run(
        ["git", "ls-files", "--error-unmatch", "data/RECORD_INDEX.json"],
        cwd=RAIZ, capture_output=True, text=True, check=False,
    )
    assert rastreado.returncode != 0, "o indice derivado esta rastreado pelo git"


# ---------------------------------------------------------------------------
# a ancora interna e DECLARADA, nunca inferida
# ---------------------------------------------------------------------------


def test_ancora_interna_nao_e_inferida_da_prosa():
    """Inferir caminho de prosa travaria o repositorio: os handoffs citam
    nexus.py, e todo commit em nexus.py exigiria superseder o handoff."""
    indice = record_index.construir(RAIZ)
    citados = sum(len(r["caminhos_citados_na_prosa"]) for r in indice["registros"])
    declarados = sum(len(r["caminhos_declarados"]) for r in indice["registros"])
    assert citados > declarados, (
        "a prosa deveria citar muito mais caminhos do que os declarados; "
        "se isso se inverteu, conferir se a varredura de prosa ainda funciona"
    )
    fonte = Path(record_gate.__file__).read_text(encoding="utf-8")
    assert "caminhos_citados_na_prosa" not in fonte, (
        "o portao passou a usar a prosa como ancora. Sugestao nao e ancora."
    )


# ---------------------------------------------------------------------------
# o portao
# ---------------------------------------------------------------------------


def test_o_portao_reprova_frontmatter_ilegivel(tmp_path, monkeypatch):
    ruim = tmp_path / "RUIM.md"
    ruim.write_text(
        "---\nid: x\nverificado:\n  - item: com dois pontos\n    e continuacao que quebra\n---\n\ncorpo\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(record_gate, "RAIZ", tmp_path)
    monkeypatch.setattr(record_gate, "arquivos_em_stage", lambda: ["reports/RUIM.md"])
    (tmp_path / "reports").mkdir()
    (tmp_path / "reports" / "RUIM.md").write_text(ruim.read_text(encoding="utf-8"), encoding="utf-8")
    monkeypatch.setattr(record_gate, "_git", lambda *a: "")
    erros, _ = record_gate.verificar()
    assert any("YAML valido" in e for e in erros), f"o portao aceitou frontmatter ilegivel: {erros}"


def test_o_portao_cobra_ancora_declarada(tmp_path, monkeypatch):
    """C2 na forma que este repositorio pode sustentar: caminho DECLARADO.

    Nao e sondavel de ponta a ponta sem commitar dentro da medicao -- a violacao
    exige registro ja rastreado e FORA do stage. Por isso aqui, em unidade.
    """
    (tmp_path / "reports").mkdir()
    registro = tmp_path / "reports" / "ANCORADO.md"
    registro.write_text(
        "---\nid: ancorado\ntipo: relatorio\nescopo: Site\nautor: claude@opus-5\n"
        "criado_em: 2026-08-28\ncommit: b635c067\nclasses: [interno]\n"
        "caminhos:\n  - engine/alvo.py\n"
        "verificado:\n  - nada\nnao_verificado:\n  - nada\n---\n\ncorpo\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(record_gate, "RAIZ", tmp_path)
    # O caminho ancorado mudou; o registro NAO foi revisado no mesmo commit.
    monkeypatch.setattr(record_gate, "arquivos_em_stage", lambda: ["engine/alvo.py"])
    monkeypatch.setattr(
        record_gate, "_git", lambda *a: "reports/ANCORADO.md\n" if a[:1] == ("ls-files",) else ""
    )
    erros, _ = record_gate.verificar()
    assert any("ANCORADO.md" in e and "engine/alvo.py" in e for e in erros), (
        f"o portao nao cobrou a ancora declarada: {erros}"
    )

    # E o caso legitimo: registro revisado no MESMO commit nao pode ser acusado.
    monkeypatch.setattr(
        record_gate, "arquivos_em_stage", lambda: ["engine/alvo.py", "reports/ANCORADO.md"]
    )
    erros, _ = record_gate.verificar()
    assert not any("ANCORADO.md" in e for e in erros), (
        f"registro revisado junto foi acusado assim mesmo: {erros}"
    )


def test_o_portao_detecta_ampliacao_de_origem():
    """Padroes montados em tempo de execucao: embutir o literal no teste faria
    este arquivo disparar o proprio detector.

    E fez. Previ dois dos tres e deixei o terceiro inteiro; o portao reprovou
    este arquivo no primeiro commit. Sexta ocorrencia do mesmo padrao nesta
    base, e a resposta continua sendo a mesma -- montar o literal aqui, jamais
    isentar o caminho. Isentar criaria ponto cego no unico arquivo que exercita
    o detector.
    """
    casos = [
        "--remote-allow-" + "origins=*",
        'allow_origins=["' + "*" + '"]',
        "CORS_ALLOW_" + "ALL_ORIGINS = True",
    ]
    for linha in casos:
        assert any(p.search(linha) for p in record_gate.PADROES_DE_AMPLIACAO.values()), (
            f"ampliacao nao detectada: {linha}"
        )
    for inocente in ("origins = load_allowed()", "allow_origins=settings.ORIGENS"):
        assert not any(p.search(inocente) for p in record_gate.PADROES_DE_AMPLIACAO.values()), (
            f"falso positivo em linha legitima: {inocente}"
        )


def test_o_portao_esta_no_pre_commit():
    """Modulo que ninguem invoca nao e integracao."""
    hook = (RAIZ / ".husky" / "pre-commit").read_text(encoding="utf-8")
    assert "record_gate.py" in hook, "o portao de registro nao e chamado pelo pre-commit"
    assert "set -e" in hook, (
        "sem `set -e` o hook devolve o codigo do ULTIMO comando e as etapas "
        "anteriores deixam de bloquear em silencio"
    )


def test_nexus_index_esta_na_lista_de_roteamento():
    """`nexus index` sem isto viraria descricao de tarefa no do.ps1."""
    perfil = (RAIZ / "Microsoft.PowerShell_profile.ps1").read_text(encoding="utf-8-sig")
    assert "'index'" in perfil, "o comando index nao entrou na lista de comandos do Typer"


@pytest.mark.parametrize("flag", ["--rebuild", "--suspeitos"])
def test_a_cli_declarada_na_13c_existe(flag):
    """A secao 13.C declara `nexus index --rebuild` e `--suspeitos`."""
    fonte = (RAIZ / "scripts" / "cli" / "nexus.py").read_text(encoding="utf-8")
    assert f'"{flag}"' in fonte, f"a flag {flag} declarada na 13.C nao existe no comando"
