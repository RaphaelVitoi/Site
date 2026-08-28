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

import re
import subprocess
import sys
from datetime import date
from pathlib import Path

import pytest
import yaml

RAIZ = Path(__file__).resolve().parent.parent
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

# Caminho estatico do pacote, nunca o import solto: com `scripts/ops` no
# sys.path o mesmo arquivo vira dois objetos de modulo, e o `monkeypatch` de um
# nao alcanca o outro. Ver `scripts/ops/__init__.py`.
from scripts.ops import record_gate, record_index  # noqa: E402


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


def test_nenhum_registro_declara_um_estado_derivado():
    """A 13.C exige que VIGENTE/SUSPEITO/OBSOLETO venham da medicao.

    A primeira versao proibia a CHAVE `estado`, e isso era largo demais: um
    handoff de outra sessao usa `estado: bloqueado-por-baseline-de-qualidade`
    para dizer em que pe esta o TRABALHO, que e outra grandeza. O que nao pode
    ser declarado e o estado de DECAIMENTO -- declarado, ele envelhece sem que
    nada acuse, que e exatamente o que o indice existe para impedir.
    """
    derivados = {record_index.VIGENTE, record_index.SUSPEITO, record_index.OBSOLETO}
    for p in _registros_com_frontmatter():
        fm, _ = record_index.ler_frontmatter(p)
        declarado = str((fm or {}).get("estado", "")).strip().upper()
        assert declarado not in derivados, (
            f"{p.name} declara `estado: {declarado}`, que e estado DERIVADO pela 13.C. "
            "Quem decide isso e a varredura, nao o autor."
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


def test_o_corpus_prescritivo_nao_tem_referencia_morta():
    """Varredura completa, nao so o que esta em stage.

    O portao so ve o stage -- por desenho, para nao reprovar divida
    preexistente. Este teste ve a arvore inteira do recorte prescritivo, e por
    isso pode afirmar que a divida e ZERO, e nao apenas que ninguem a aumentou.
    """
    saida = subprocess.run(
        ["git", "ls-files", "*.md"], cwd=RAIZ, capture_output=True, text=True, check=False
    )
    mortas = {
        rel: m
        for rel in saida.stdout.splitlines()
        if rel.strip() and record_gate._e_prescritivo(rel)
        for m in [record_gate.referencias_mortas(rel)]
        if m
    }
    assert not mortas, "referencia morta em documento que instrui:\n  " + "\n  ".join(
        f"{k}: {v}" for k, v in mortas.items()
    )


def test_o_detector_de_referencia_nao_confunde_latex_com_caminho():
    """Falso positivo medido: o GEMINI.md descreve um ciclo de artefatos em
    `$$\\text{...(implementation\\_plan.md)}$$`. Nao e referencia a arquivo, e o
    nome de uma etapa num diagrama -- e o primeiro rascunho o acusou."""
    gemini = RAIZ / "GEMINI.md"
    if not gemini.is_file():
        pytest.skip("GEMINI.md ausente do projeto")
    assert "implementation" in gemini.read_text(encoding="utf-8-sig"), (
        "o caso que motivou a regra sumiu do arquivo; reavaliar se a excecao de "
        "bloco matematico ainda tem lastro"
    )
    assert not record_gate.referencias_mortas("GEMINI.md"), (
        "o detector voltou a ler bloco LaTeX como caminho"
    )


def test_o_detector_de_referencia_pega_caminho_que_nao_existe(tmp_path, monkeypatch):
    (tmp_path / "reports").mkdir()
    (tmp_path / "reports" / "X.md").write_text(
        "Veja `scripts/ops/nao_existe_mesmo.py` para detalhes.\n", encoding="utf-8"
    )
    monkeypatch.setattr(record_gate, "RAIZ", tmp_path)
    assert record_gate.referencias_mortas("reports/X.md") == ["scripts/ops/nao_existe_mesmo.py"]


def test_referencia_historica_isenta_o_caminho_declarado_e_so_ele(tmp_path, monkeypatch):
    """A isencao e por CAMINHO declarado, nunca por arquivo.

    Isentar o documento inteiro criaria ponto cego exatamente onde ele nao pode
    existir -- no registro que fala dos caminhos mortos. Declarando item a item,
    a excecao aparece no frontmatter e o revisor a ve.
    """
    (tmp_path / "reports").mkdir()
    (tmp_path / "reports" / "H.md").write_text(
        "---\n"
        "id: h\ntipo: relatorio\nescopo: Site\nautor: claude@opus-5\n"
        "criado_em: 2026-08-28\n"
        "referencias_nao_resolviveis:\n  - antigo/sumiu.py\n"
        "verificado:\n  - nada\nnao_verificado:\n  - nada\n"
        "---\n\n"
        "Antes o codigo vivia em `antigo/sumiu.py`; hoje nao existe mais.\n"
        "Mas `outro/tambem_nao_existe.py` nao foi declarado.\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(record_gate, "RAIZ", tmp_path)
    achadas = record_gate.referencias_mortas("reports/H.md")
    assert achadas == ["outro/tambem_nao_existe.py"], (
        f"a isencao vazou para caminho nao declarado, ou barrou o declarado: {achadas}"
    )


def test_nenhum_registro_tem_chave_duplicada_no_frontmatter():
    """`yaml.safe_load` aceita chave repetida em silencio: a ultima vence.

    Achado real de 2026-08-28 -- duas sessoes editando este repositorio
    acrescentaram `referencias_nao_resolviveis` ao mesmo frontmatter, e nada acusou.
    Mesma familia da colisao que fez uma auditoria descartar o manual canonico
    de 40 KB e exibir os dados do de 12 KB como se fossem dele.
    """
    repetidas = {}
    for p in _registros_com_frontmatter():
        bruto = p.read_text(encoding="utf-8-sig").split("\n---", 2)[0][3:]
        chaves = [
            linha.split(":", 1)[0]
            for linha in bruto.splitlines()
            if re.match(r"^[A-Za-z_][A-Za-z0-9_]*:", linha)
        ]
        dup = sorted({c for c in chaves if chaves.count(c) > 1})
        if dup:
            repetidas[p.name] = dup
    assert not repetidas, f"chave duplicada no frontmatter: {repetidas}"


def test_o_recorte_prescritivo_exclui_o_que_descreve_o_passado():
    """Auditoria datada citando arquivo que sumiu depois e registro, nao podridao."""
    assert record_gate._e_prescritivo("CLAUDE.md")
    assert record_gate._e_prescritivo("reports/HANDOFF-2026-08-28-auditorias-e-preludio.md")
    assert not record_gate._e_prescritivo("docs/audits/AUDITORIA_SISTEMA_20260328.md")
    assert not record_gate._e_prescritivo("scripts/ops/record_gate.py")


def test_bloco_de_comentario_e_prosa_e_nao_diretiva(tmp_path, monkeypatch):
    """Achado real: o cabecalho `<# ... #>` de um .ps1 de outra sessao explica
    que a versao ANTERIOR usava a origem curinga. E documentacao correta, e o
    detector a reprovaria -- ele so pulava linha que COMECA com `#` ou `//`.

    Nona vez que um detector desta base confunde citar com afirmar. Estado de
    BLOCO, nao prefixo de linha -- e a diretiva de verdade continua pega.
    """
    monkeypatch.setattr(record_gate, "RAIZ", tmp_path)
    curinga = "--remote-allow-" + "origins=*"
    (tmp_path / "x.ps1").write_text(
        "<#\n"
        f".DESCRIPTION\n    A versao antiga usava {curinga} na porta de depuracao.\n"
        "#>\n"
        f"$args = @('{curinga}')\n",
        encoding="utf-8",
    )
    dentro = record_gate.linhas_em_bloco_de_comentario("x.ps1")
    assert dentro == {1, 2, 3, 4}, f"bloco <# #> mal delimitado: {dentro}"
    assert 5 not in dentro, "a linha de codigo entrou no bloco de comentario"


def test_ha_um_unico_caminho_de_import_para_os_modulos_de_ops():
    """Dois idiomas de import produzem DOIS objetos de modulo para um arquivo.

    Medido em 2026-08-28, antes da harmonizacao:

        import record_index as a
        import scripts.ops.record_index as b
        a is b  ->  False

    Os dois importam, os dois funcionam, e o `monkeypatch` de um nao alcanca o
    outro. Nada acusa. E a copia divergente do repositorio, so que em memoria.
    """
    ofensores = []
    for arquivo in [*RAIZ.glob("scripts/**/*.py"), *RAIZ.glob("tests/*.py")]:
        if arquivo.name == "__init__.py":
            continue
        rel = arquivo.relative_to(RAIZ).as_posix()
        # Este proprio docstring CITA o import solto para explicar por que ele e
        # proibido -- e o detector o reprovou na primeira execucao. Decima vez
        # nesta base, e desta vez a ferramenta ja existia: reaproveitar o mesmo
        # rastreador de bloco do portao, em vez de escrever um segundo.
        em_docstring = record_gate.linhas_em_bloco_de_comentario(rel)
        for n, linha in enumerate(
            arquivo.read_text(encoding="utf-8", errors="ignore").splitlines(), start=1
        ):
            if n in em_docstring or linha.lstrip().startswith("#"):
                continue
            if re.match(r"^\s*(from|import)\s+record_(index|gate)\b", linha):
                ofensores.append(f"{rel}:{n}  {linha.strip()}")
    assert not ofensores, (
        "import solto de modulo de scripts/ops (use scripts.ops.<modulo>):\n  "
        + "\n  ".join(ofensores)
    )


def test_scripts_ops_e_pacote_de_verdade():
    """Sem `__init__.py`, `scripts.ops` resolve como namespace e o import solto
    volta a ser possivel sem que nada reclame."""
    assert (RAIZ / "scripts" / "ops" / "__init__.py").is_file(), (
        "scripts/ops/__init__.py sumiu; o caminho canonico de import deixa de ser unico"
    )
    assert record_index.__name__ == "scripts.ops.record_index", (
        f"o modulo foi carregado como {record_index.__name__}, nao pelo caminho do pacote"
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
