"""Guard de memoria: RAM, commit, VRAM e cache num laco so, com tetos declarados.

Nasceu tri-camada e virou quatro no mesmo dia, por uma observacao do operador:
*"RAM utilizada 72% estavel, mesmo a cache 18% estavel"*. Estavel em 72% com
6,8 GB em standby reclaimavel -- e o **commit** em 82,6% do limite. Um teto de
98% sobre a RAM fisica e guard incapaz de ficar vermelho, porque no Windows o
que falha e o commit, nao a RAM. Ver a secao `Commit` no fim do arquivo.

O `optimize-ram --watch` que existia vigiava **so RAM**, com limiar e intervalo
passados por flag -- 90% e 300 s por default. Tinha os dois defeitos ao mesmo
tempo: gastava CPU sem pressao nenhuma e demorava ate cinco minutos para reagir
quando havia.

E faltavam tres camadas. VRAM porque o medidor estava cego ate `a86168df` (os
tres leitores cobriam NVIDIA, AMD nativo e ROCm; a maquina e Vulkan). Cache
porque `max_cache_size_mb = 4096` era atribuido no `__init__` e **nunca lido** --
a eviccao olhava `len(buckets) > 100`, entao o teto que nomeava megabytes era
medido em quantidade de baldes, e 100 baldes podem ser 1 MB ou 400 MB.

**Camada sem medidor devolve `None`, nunca zero.** Foi exatamente o defeito do
leitor de VRAM: os tres backends falhavam, `_get_vram_usage` convertia em
`(None, 0.0, 0.0)`, e qualquer teto concluiria VRAM vazia e nunca reagiria.
Desconhecido tem de ser distinguivel de folgado.
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

RAIZ = Path(__file__).resolve().parent.parent


@pytest.fixture(scope="module")
def nx():
    nome = "nexus_guard_sob_teste"
    spec = importlib.util.spec_from_file_location(nome, RAIZ / "scripts" / "cli" / "nexus.py")
    assert spec and spec.loader
    m = importlib.util.module_from_spec(spec)
    sys.modules[nome] = m
    try:
        spec.loader.exec_module(m)
        yield m
    except SystemExit:
        yield m
    finally:
        sys.modules.pop(nome, None)


@pytest.fixture(scope="module")
def tetos(nx) -> dict:
    return nx._ler_tetos()


# ---------------------------------------------------------------------------
#  Os tetos vem de fonte declarada, e a ausencia dela e fatal
# ---------------------------------------------------------------------------


def test_os_quatro_tetos_estao_declarados(tetos):
    assert set(tetos) == {"ram", "commit", "vram", "cache"}
    assert tetos["ram"]["teto_pct"] == 98.0, "o operador pediu 98%, nao o default antigo de 90"
    assert tetos["vram"]["teto_pct"] > 0
    assert tetos["cache"]["teto_mb"] > 0
    for camada, cfg in tetos.items():
        assert cfg.get("acao"), f"{camada} declara teto sem declarar acao"
        assert cfg.get("origem_do_numero"), f"{camada} tem teto sem origem -- literal que ninguem ousa mexer"


def test_sem_o_arquivo_de_tetos_o_guard_nao_roda(nx, tmp_path):
    """Guard que perde os tetos e segue rodando nao protege nada e ainda parece
    que protege. Mesmo raciocinio do portao de credencial."""
    with pytest.raises(FileNotFoundError, match="nao roda as cegas"):
        nx._ler_tetos(tmp_path / "inexistente.json")


# ---------------------------------------------------------------------------
#  Desconhecido nao e zero
# ---------------------------------------------------------------------------


def test_camada_sem_medidor_devolve_none_e_nao_zero(nx, tetos):
    """A regressao que motivou o arquivo inteiro."""
    with patch.object(nx, "_get_vram_usage", return_value=(None, 0.0, 0.0)):
        leitura = nx._medir_pressao(tetos)
    assert leitura["vram"]["valor"] is None, "VRAM sem medidor voltou a reportar um numero"
    assert leitura["vram"]["pressao"] is None
    assert leitura["vram"]["detalhe"] == "sem medidor"


def test_camada_sem_medidor_nao_dispara_acao(nx, tetos):
    """Zero de pressao e teto folgado sao a mesma coisa para quem so olha o
    numero. Se `None` virasse 0, a camada ficaria muda para sempre; se virasse
    100, dispararia sem parar. Nao pode ser nem um nem outro."""
    with patch.object(nx, "_get_vram_usage", return_value=(None, 0.0, 0.0)):
        leitura = nx._medir_pressao(tetos)
    estourou = [n for n, c in leitura.items() if c["pressao"] is not None and c["valor"] >= c["teto"]]
    assert "vram" not in estourou


def test_as_quatro_camadas_sao_lidas_de_verdade(nx, tetos):
    leitura = nx._medir_pressao(tetos)
    assert set(leitura) == {"ram", "commit", "vram", "cache"}
    assert leitura["ram"]["valor"] is not None, "RAM sempre tem medidor via psutil"
    for camada in leitura.values():
        assert camada["teto"] > 0


# ---------------------------------------------------------------------------
#  Intervalo que responde a pressao
# ---------------------------------------------------------------------------


def _leitura(ram_pressao: float | None) -> dict:
    return {"ram": {"valor": 0.0, "teto": 98.0, "unidade": "%", "pressao": ram_pressao}}


def test_o_intervalo_encolhe_conforme_a_pressao_sobe(nx):
    folgado = nx._intervalo_adaptativo(_leitura(0.0))
    meio = nx._intervalo_adaptativo(_leitura(0.5))
    apertado = nx._intervalo_adaptativo(_leitura(1.0))
    assert folgado > meio > apertado, f"nao e monotonico: {folgado}, {meio}, {apertado}"
    assert apertado >= 15 and folgado <= 600


def test_sem_medidor_nenhum_o_intervalo_vai_ao_maximo(nx):
    """Vigiar de perto o que nao se consegue medir e so gastar CPU."""
    assert nx._intervalo_adaptativo({"x": {"pressao": None}}) == 600


def test_a_pressao_e_limitada_e_nao_produz_intervalo_negativo(nx):
    """Camada muito acima do teto nao pode virar intervalo negativo."""
    assert nx._intervalo_adaptativo(_leitura(5.0)) >= 15


def test_manda_a_camada_mais_pressionada(nx):
    """Duas camadas, uma folgada e outra no limite: quem decide o ritmo e a
    pior. Media esconderia a que esta prestes a estourar."""
    leitura = {
        "ram": {"pressao": 0.05},
        "vram": {"pressao": 0.99},
    }
    assert nx._intervalo_adaptativo(leitura) <= nx._intervalo_adaptativo({"ram": {"pressao": 0.05}})
    assert nx._intervalo_adaptativo(leitura) < 60


# ---------------------------------------------------------------------------
#  As acoes, por camada
# ---------------------------------------------------------------------------


def test_cada_camada_tem_acao_propria(nx):
    """Uma acao so para tres camadas seria expurgo de RAM tentando resolver
    VRAM cheia."""
    with patch.object(nx, "_execute_ram_cleanse", return_value=7) as limpeza:
        assert "7" in nx._agir_por_camada("ram")
    limpeza.assert_called_once()

    falso = MagicMock(return_value=True)
    with patch.dict(sys.modules, {"utils.ram_optimizer": MagicMock(optimize_ollama_keepalive=falso)}):
        msg = nx._agir_por_camada("vram")
    assert "keepalive" in msg
    falso.assert_called_once_with(keepalive=0)


def test_o_guard_le_e_sai_com_once(nx, tmp_path):
    """Os dois estados do laco: com `--once` ele mede, age se preciso, e nao
    entra em loop -- que e o que torna o guard testavel."""
    from typer.testing import CliRunner  # noqa: PLC0415

    resultado = CliRunner().invoke(nx.app, ["ops", "guard", "--once"])
    assert resultado.exit_code == 0, resultado.output


def test_once_imprime_o_que_mediu_e_nao_so_os_tetos(nx):
    """A versao anterior deste teste conferia so `exit_code == 0`, e por isso
    nao viu o defeito: `--once` imprimia as quatro linhas de teto, mandava a
    LEITURA para o logger (silencioso) e saia com zero. Quem rodava via um
    verde que nao carregava a medicao que o justifica.

    O contrato agora e o valor na tela. Nome de camada nao basta: ele ja aparece
    na linha do teto, entao um teste que buscasse `commit` passaria com a
    leitura ausente."""
    from typer.testing import CliRunner  # noqa: PLC0415

    leitura = {
        "ram": {"valor": 73.0, "teto": 98.0, "unidade": "%", "pressao": 0.74},
        "commit": {"valor": 87.8, "teto": 92.0, "unidade": "%", "pressao": 0.95},
        "vram": {"valor": None, "teto": 85.0, "unidade": "%", "pressao": None},
        "cache": {"valor": 0.0, "teto": 4096.0, "unidade": "MB", "pressao": 0.0},
    }
    with patch.object(nx, "_medir_pressao", return_value=leitura):
        saida = CliRunner().invoke(nx.app, ["ops", "guard", "--once"]).output
    saida = " ".join(saida.split())  # o console quebra linha na largura do terminal

    assert "73.0%" in saida, f"a leitura de RAM nao aparece na saida: {saida!r}"
    assert "87.8%" in saida, f"a leitura de commit nao aparece na saida: {saida!r}"
    assert "vram=?" in saida, "camada sem medidor tem de sair como `?`, nunca como 0"
    assert "commit" in saida.split("mais pressionada:")[1], (
        "a camada mais pressionada e o commit a 95% do teto, e e ela que decide o ritmo"
    )


def test_once_diz_quando_esta_cego_em_vez_de_sair_verde(nx):
    """Guard sem medidor nenhum nao pode se despedir com uma linha tranquila.

    E o estado que o leitor de VRAM viveu por meses -- e ninguem soube, porque
    a ausencia de medicao tinha exatamente a mesma cara que folga."""
    from typer.testing import CliRunner  # noqa: PLC0415

    cega = {
        n: {"valor": None, "teto": 1.0, "unidade": "%", "pressao": None}
        for n in ("ram", "commit", "vram", "cache")
    }
    with patch.object(nx, "_medir_pressao", return_value=cega):
        saida = CliRunner().invoke(nx.app, ["ops", "guard", "--once"]).output
    assert "cego" in " ".join(saida.split()), f"o guard cego nao se declarou cego: {saida!r}"


def test_mais_pressionada_aponta_a_camada_e_nao_a_media(nx):
    """Unitario do que decide o ritmo. Media diluiria a camada que vai estourar."""
    leitura = {
        "ram": {"pressao": 0.10},
        "commit": {"pressao": 0.95},
        "vram": {"pressao": None},
    }
    camada, folga = nx._mais_pressionada(leitura)
    assert camada == "commit"
    assert folga == pytest.approx(0.95)
    assert nx._mais_pressionada({"vram": {"pressao": None}}) == (None, 0.0)


def test_o_guard_age_quando_a_camada_estoura(nx, tmp_path):
    """O estado que importa, e o que nunca se observa esperando acontecer."""
    from typer.testing import CliRunner  # noqa: PLC0415

    tetos_falsos = json.loads((RAIZ / "data" / "TETOS_DE_MEMORIA.json").read_text(encoding="utf-8"))
    tetos_falsos["camadas"]["ram"]["teto_pct"] = 0.1  # qualquer RAM em uso estoura
    alvo = tmp_path / "tetos.json"
    alvo.write_text(json.dumps(tetos_falsos), encoding="utf-8")

    with patch.object(nx, "_execute_ram_cleanse", return_value=3) as limpeza:
        resultado = CliRunner().invoke(nx.app, ["ops", "guard", "--once", "--tetos", str(alvo)])
    assert resultado.exit_code == 0, resultado.output
    limpeza.assert_called_once()


# ---------------------------------------------------------------------------
#  Commit: a grandeza que de fato falha
# ---------------------------------------------------------------------------


def test_commit_e_medido_e_nao_e_a_mesma_coisa_que_ram(nx, tetos):
    """A primeira versao do guard vigiava so `virtual_memory().percent`.

    Medido em 2026-08-29 nesta maquina: RAM fisica **estavel em 72%** com 6,8 GB
    em standby reclaimavel, e o commit em 82,6% do limite -- 90% do seu teto.
    `virtual_memory().percent` conta (total - disponivel), e disponivel inclui
    standby; o Windows recusa alocacao quando o COMMIT bate no limite, nao
    quando a RAM fisica sobe. Um teto de 98% sobre a grandeza folgada e guard
    incapaz de ficar vermelho."""
    leitura = nx._medir_pressao(tetos)
    assert "commit" in leitura
    if sys.platform == "win32":
        assert leitura["commit"]["valor"] is not None, "sem medidor de commit no Windows"
        assert leitura["commit"]["valor"] != leitura["ram"]["valor"], (
            "commit e RAM fisica deram o mesmo numero -- um dos dois medidores esta errado"
        )


def test_fora_do_windows_o_commit_declara_ausencia_em_vez_de_zero(nx):
    with patch.object(nx.sys, "platform", "linux"):
        assert nx._commit_charge_pct() is None


def test_a_acao_de_commit_nao_e_trim_de_working_set(nx):
    """Trim move pagina para standby, e pagina comprometida continua
    comprometida. Usar a acao de RAM aqui seria gastar I/O sem devolver commit."""
    falso = MagicMock(return_value=True)
    with (
        patch.dict(sys.modules, {"utils.ram_optimizer": MagicMock(optimize_ollama_keepalive=falso)}),
        patch.object(nx, "_execute_ram_cleanse") as limpeza,
    ):
        msg = nx._agir_por_camada("commit")
    assert "keepalive" in msg
    falso.assert_called_once_with(keepalive=0)
    limpeza.assert_not_called()


def test_a_camada_de_ram_declara_que_e_a_folgada(tetos):
    """Sem isto, alguem le teto 98% e conclui que a RAM e o sinal principal."""
    cuidados = " ".join(tetos["ram"]["cuidado_declarado"]).lower()
    assert "folgada" in cuidados and "commit" in cuidados


def test_o_ritmo_segue_a_camada_pressionada_e_nao_a_folgada(nx, tetos):
    """A prova de que acrescentar commit mudou o comportamento, nao so o log.

    Com RAM a 74% do seu teto e commit a 90% do dele, o intervalo tem de sair
    menor do que sairia olhando so RAM."""
    leitura = nx._medir_pressao(tetos)
    if leitura["commit"]["pressao"] is None:
        pytest.skip("sem medidor de commit nesta plataforma")
    com_tudo = nx._intervalo_adaptativo(leitura)
    so_ram = nx._intervalo_adaptativo({"ram": leitura["ram"]})
    assert com_tudo <= so_ram, (
        f"a camada mais pressionada nao esta mandando no ritmo: {com_tudo}s com tudo, {so_ram}s so com RAM"
    )


# ---------------------------------------------------------------------------
# Higienizacao periodica: o ramo que fabricava o proprio teto
# ---------------------------------------------------------------------------
# Medido em 2026-08-29: `optimize-ram --watch --threshold 98 --interval 300`
# rodou 7h54m. O limiar reativo nunca disparou -- 98% de RAM e inalcancavel
# nesta maquina. Mas o ramo periodico disparava a cada 300 s SEM checar nada,
# ~95 vezes, e o trim de working set que ele aciona empurra pagina para standby;
# standby conta como disponivel; `percent` CAI. O guard fabricou o teto de
# 72-73% que existia para vigiar. O reboot do operador foi o controle: sem o
# guard, a RAM variou de 61,1% a 93,0%.


def test_sem_pressao_de_commit_a_periodica_nao_age(nx):
    """O defeito original: agia por relogio, e a acao derrubava a leitura."""
    with patch.object(nx, "_commit_charge_pct", return_value=(40.0, 30.0, 75.0)):
        agir, motivo = nx._pressao_justifica_higienizacao()
    assert agir is False
    assert "sem pressao real" in motivo, motivo


def test_com_pressao_de_commit_a_periodica_age(nx):
    """Controle: o portao tem de ter os DOIS estados, ou nao e portao."""
    with patch.object(nx, "_commit_charge_pct", return_value=(88.0, 66.0, 75.0)):
        agir, motivo = nx._pressao_justifica_higienizacao()
    assert agir is True
    assert "88.0%" in motivo and "piso" in motivo, motivo


def test_sem_medidor_de_commit_a_periodica_suspende_em_vez_de_agir(nx):
    """Ausencia de medidor nao e ausencia de pressao -- e tambem nao e pressao.

    Nao agir e o lado seguro: a acao contaminaria `percent`, a unica leitura
    que ainda sobraria, e o guard passaria a se auto-elogiar no escuro.
    """
    with patch.object(nx, "_commit_charge_pct", return_value=None):
        agir, motivo = nx._pressao_justifica_higienizacao()
    assert agir is False
    assert "sem medidor" in motivo, motivo


def test_a_decisao_nao_le_virtual_memory_percent(nx):
    """A grandeza que decide nao pode ser a que a propria acao contamina.

    Teste estrutural, e nao de valor: mesmo com a RAM inventada em 99%, sem
    pressao de commit a periodica continua sem agir. Se alguem reintroduzir
    `percent` no criterio, este teste reprova.
    """
    fake = MagicMock(percent=99.0)
    with (
        patch.object(nx.psutil, "virtual_memory", return_value=fake),
        patch.object(nx, "_commit_charge_pct", return_value=(40.0, 30.0, 75.0)),
    ):
        agir, _ = nx._pressao_justifica_higienizacao()
    assert agir is False, "a decisao voltou a olhar virtual_memory().percent"


def test_o_piso_preditivo_fica_abaixo_do_teto_declarado_de_commit(nx, tetos):
    """Piso acima do teto seria portao que so abre depois de o vermelho acender."""
    assert nx._PISO_PREDITIVO_COMMIT_PCT < float(tetos["commit"]["teto_pct"])


# ---------------------------------------------------------------------------
# Teto inalcancavel: declarado no JSON desde 2026-08-29, lido por ninguem
# ---------------------------------------------------------------------------


def test_o_resumo_marca_a_camada_de_teto_inalcancavel(nx, tetos):
    """O bloco existia no JSON e nao chegava ao operador -- aviso desconectado.

    Para `ram` bater em 98% o livre teria de cair de 8,59 GB para 0,64 GB, fator
    de 13. Portao que nao consegue ficar vermelho e decoracao, e decoracao sem
    aviso e pior: parece vigilancia.
    """
    leitura = nx._medir_pressao(tetos)
    assert leitura["ram"].get("inalcancavel") is True, "o bloco do JSON nao chegou na leitura"
    assert "ram=" in nx._resumo_da_leitura(leitura)
    rotulo_ram = next(p for p in nx._resumo_da_leitura(leitura).split(" | ") if p.startswith("ram="))
    assert rotulo_ram.endswith("!"), f"a marca nao saiu no resumo: {rotulo_ram}"


def test_camada_sem_o_bloco_no_json_nao_ganha_a_marca(nx, tetos):
    """Controle: a marca tem de vir do JSON, e nao ser pintada em toda camada."""
    leitura = nx._medir_pressao(tetos)
    assert leitura["commit"].get("inalcancavel") is not True
    rotulo = next(p for p in nx._resumo_da_leitura(leitura).split(" | ") if p.startswith("commit="))
    assert not rotulo.endswith("!"), rotulo


def test_a_marca_nao_atropela_o_interrogacao_de_camada_sem_medidor(nx):
    """`?` e `!` dizem coisas diferentes: cego nao e o mesmo que decorativo."""
    leitura = {
        "cega": {"valor": None, "teto": 10.0, "unidade": "%", "pressao": None, "inalcancavel": True},
        "viva": {"valor": 5.0, "teto": 10.0, "unidade": "%", "pressao": 0.5},
    }
    assert nx._resumo_da_leitura(leitura) == "cega=? | viva=5.0%"
