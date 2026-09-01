"""O medidor de VRAM enxerga a maquina que existe -- e zero nao e desconhecido.

Esta maquina e AMD (Radeon RX 570, Polaris) e o Ollama roda **Vulkan**. Os tres
leitores que `nexus.py` tinha cobriam NVIDIA (`pynvml`), AMD nativo
(`pyamdgpuinfo`) e AMD via ROCm (`rocm-smi`) -- Polaris nao tem ROCm no Windows,
e nao ha NVIDIA aqui. Medido em 2026-08-28: **os tres devolviam None**, e
`_get_vram_usage` convertia isso em `(None, 0.0, 0.0)`.

O defeito nao era so a cegueira: era `0.0` no lugar de "desconhecido". Qualquer
teto que consumisse esse par concluiria VRAM vazia e nunca reagiria. O mesmo
padrao que atravessa esta base -- um numero plausivel sem ligacao com o que
afirma medir.

O leitor novo pergunta ao backend que esta em uso: `/api/ps` devolve `size_vram`
por modelo carregado, que e a mesma grandeza com que o Ollama calcula a divisao
CPU/GPU. Teto vem da linha `msg="inference compute" ... total="8.0 GiB"` que o
servidor escreve ao subir -- o que o backend PODE usar, nao a capacidade nominal.

Medido nos dois estados nesta maquina: `37.8% -- 3.03 GiB de 8.0` com o
`gemma4:e4b` carregado, `0.0% -- 0.00 GiB de 8.0` depois de descarregar.

Nada aqui depende desta maquina: log e HTTP sao dublados. O teste roda igual em
arvore isolada e em CI sem GPU.
"""

from __future__ import annotations

# pylint: disable=redefined-outer-name,protected-access

import importlib.util
import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

RAIZ = Path(__file__).resolve().parent.parent


@pytest.fixture
def nx():
    """Carrega nexus.py como modulo, sem disparar o app do typer."""
    spec = importlib.util.spec_from_file_location("nexus_sob_teste", RAIZ / "scripts" / "cli" / "nexus.py")
    assert spec and spec.loader
    modulo = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(modulo)
    except SystemExit:  # pragma: no cover - typer pode sair no import em algumas versoes
        pass
    vars(modulo)["_VRAM_TOTAL_VULKAN"] = None
    vars(modulo)["_VRAM_PS_CACHE"] = None
    return modulo


LINHA_DO_LOG = (
    "time=2026-08-27T09:58:16.592-03:00 level=INFO source=types.go:32 "
    'msg="inference compute" id=0 filter_id=0 library=Vulkan compute=0.0 name=Vulkan0 '
    'description="Radeon RX 570 Series" libdirs=ollama,vulkan driver=0.0 pci_id="" '
    'type=discrete total="8.0 GiB" available="7.2 GiB"'
)


def _com_log(nx, tmp_path, conteudo: str):
    _ = nx
    log = tmp_path / "Ollama" / "server.log"
    log.parent.mkdir(parents=True, exist_ok=True)
    log.write_text(conteudo, encoding="utf-8")
    return patch.dict("os.environ", {"LOCALAPPDATA": str(tmp_path)})


def _com_api_ps(nx, modelos: list[dict]):
    """Dubla `urllib.request.urlopen`, nao `httpx`.

    A primeira versao do leitor usava `httpx.get`, e foi trocada por medicao:
    um Client construido e destruido por quadro, dentro do wrapper assincrono
    do comando, esvaziava o `result.stdout` do CliRunner em
    `test_nexus_dashboard_once`; e `urlopen` levou um S310 do portao de ancora,
    porque aceita esquema arbitrario. `HTTPConnection` recebe host, porta e
    caminho separados: nao ha URL para parsear, e o achado deixa de existir.
    """
    resp = MagicMock()
    resp.read = MagicMock(return_value=json.dumps({"models": modelos}).encode())
    conexao = MagicMock()
    conexao.getresponse = MagicMock(return_value=resp)
    return patch.object(nx.http.client, "HTTPConnection", return_value=conexao)


# ---------------------------------------------------------------------------
#  O teto, lido do log do proprio backend
# ---------------------------------------------------------------------------


def test_o_teto_vem_do_log_do_ollama(nx, tmp_path):
    with _com_log(nx, tmp_path, LINHA_DO_LOG):
        assert nx._vram_total_do_log_do_ollama() == 8.0


def test_o_teto_aceita_mebibytes(nx, tmp_path):
    linha = LINHA_DO_LOG.replace('total="8.0 GiB"', 'total="512.0 MiB"')
    with _com_log(nx, tmp_path, linha):
        assert nx._vram_total_do_log_do_ollama() == pytest.approx(0.5)


def test_o_teto_e_a_ultima_linha_de_inference_compute(nx, tmp_path):
    """O servidor reescreve a linha a cada subida. Vale a mais recente, senao o
    teto envelhece calado quando a maquina muda de placa."""
    antiga = LINHA_DO_LOG.replace('total="8.0 GiB"', 'total="4.0 GiB"')
    with _com_log(nx, tmp_path, antiga + "\n" + LINHA_DO_LOG):
        assert nx._vram_total_do_log_do_ollama() == 8.0


def test_sem_log_o_teto_e_none_nunca_zero(nx, tmp_path):
    """A distincao que motivou este arquivo: ausencia de dado nao vira 0."""
    with patch.dict("os.environ", {"LOCALAPPDATA": str(tmp_path / "inexistente")}):
        assert nx._vram_total_do_log_do_ollama() is None


# ---------------------------------------------------------------------------
#  A ocupacao, lida de /api/ps
# ---------------------------------------------------------------------------


def test_ocupacao_soma_o_size_vram_dos_modelos_carregados(nx, tmp_path):
    dois = [
        {"name": "gemma4:e4b", "size_vram": 3.0 * 1024**3},
        {"name": "qwen2.5-coder:7b", "size_vram": 1.0 * 1024**3},
    ]
    with _com_log(nx, tmp_path, LINHA_DO_LOG), _com_api_ps(nx, dois):
        pct, usado, total = nx._fetch_vulkan_ollama_vram()
    assert usado == pytest.approx(4.0)
    assert total == 8.0
    assert pct == pytest.approx(50.0)


def test_nada_carregado_e_zero_de_verdade(nx, tmp_path):
    """Zero com teto CONHECIDO. Antes, `(None, 0.0, 0.0)` dizia zero sem saber
    o teto -- e um teto de 0 GiB nunca dispara nada."""
    with _com_log(nx, tmp_path, LINHA_DO_LOG), _com_api_ps(nx, []):
        pct, usado, total = nx._fetch_vulkan_ollama_vram()
    assert (pct, usado, total) == (0.0, 0.0, 8.0)


def test_servidor_fora_do_ar_e_none_nao_zero(nx, tmp_path):
    with (
        _com_log(nx, tmp_path, LINHA_DO_LOG),
        patch.object(nx.http.client, "HTTPConnection", side_effect=OSError("recusada")),
    ):
        assert nx._fetch_vulkan_ollama_vram() is None


def test_size_vram_ausente_conta_como_zero_e_nao_quebra(nx, tmp_path):
    """Modelo 100% em CPU nao traz `size_vram`. Isso e ocupacao zero de VRAM,
    nao erro -- e e justamente o caso que o gemma4:12b produz aqui."""
    with _com_log(nx, tmp_path, LINHA_DO_LOG), _com_api_ps(nx, [{"name": "so-cpu"}]):
        pct, usado, _ = nx._fetch_vulkan_ollama_vram()
    assert (pct, usado) == (0.0, 0.0)


# ---------------------------------------------------------------------------
#  A cadeia: Vulkan entra onde os tres anteriores nao respondem
# ---------------------------------------------------------------------------


def test_vulkan_responde_quando_os_tres_vendors_falham(nx, tmp_path):
    """A regressao concreta: nesta maquina os tres devolvem None e o resultado
    era `(None, 0.0, 0.0)`."""
    with (
        patch.object(nx, "_fetch_nvidia_vram", return_value=None),
        patch.object(nx, "_fetch_amd_native_vram", return_value=None),
        patch.object(nx, "_fetch_amd_rocm_vram", return_value=None),
        _com_log(nx, tmp_path, LINHA_DO_LOG),
        _com_api_ps(nx, [{"name": "x", "size_vram": 2.0 * 1024**3}]),
    ):
        pct, usado, total = nx._get_vram_usage()
    assert pct is not None, "voltou a ficar cego nesta maquina"
    assert (usado, total) == (2.0, 8.0)


def test_leitor_de_dispositivo_tem_precedencia_sobre_o_de_processo(nx):
    """Ordem declarada: os tres primeiros leem o DISPOSITIVO e valem para
    qualquer processo; o de Vulkan le so o que o Ollama ocupa. Onde houver
    leitura de dispositivo, ela ganha."""
    with (
        patch.object(nx, "_fetch_amd_native_vram", return_value=(11.0, 0.9, 8.0)),
        patch.object(nx, "_fetch_vulkan_ollama_vram", return_value=(50.0, 4.0, 8.0)) as vulkan,
    ):
        assert nx._get_vram_usage() == (11.0, 0.9, 8.0)
    vulkan.assert_not_called()


def test_tudo_indisponivel_continua_declarando_desconhecido(nx):
    """Sem nenhum leitor, o contrato antigo se mantem: None no percentual. O
    consumidor tem de tratar None, e e por isso que ele nao virou 0."""
    with (
        patch.object(nx, "_fetch_nvidia_vram", return_value=None),
        patch.object(nx, "_fetch_amd_native_vram", return_value=None),
        patch.object(nx, "_fetch_amd_rocm_vram", return_value=None),
        patch.object(nx, "_fetch_vulkan_ollama_vram", return_value=None),
    ):
        pct, _, _ = nx._get_vram_usage()
    assert pct is None
