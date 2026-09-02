"""Arquivo editado nao pode continuar servindo a versao velha.

`utils/cache.py` tem dois niveis: memoria e DISCO (temp/nexus_zone/cache, TTL
3600 s). Ate 2026-09-01 a chave era so `file:<caminho>`, sem mtime e sem hash de
conteudo. Consequencia: editar um documento e reiniciar o processo NAO bastava
-- o Tier 2 devolvia o conteudo antigo do disco por ate uma hora.

Medido nesse dia: a correcao dos 14 caminhos de `docs/document_manifest.json`
nao mudou nada no system prompt do @auditor (100.797 caracteres antes e depois
da correcao). So depois de apagar o cache em disco os 216.330 apareceram. Uma
hora de janela em que governanca corrigida nao chega ao agente, sem aviso.
"""

from __future__ import annotations

import os
from pathlib import Path
import time

import pytest

from utils.cache import _chave_de_arquivo, _read_file_with_cache, cache


@pytest.fixture
def cache_isolado(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """Isola o diretorio de cache em disco para nao tocar o do repositorio."""
    monkeypatch.setattr(cache, "cache_dir", str(tmp_path / "cache"))
    cache.memory_cache.clear()
    yield
    cache.memory_cache.clear()


@pytest.mark.unit
def test_edicao_invalida_o_cache(tmp_path: Path, cache_isolado) -> None:
    """O caso real: conteudo novo tem de sair na leitura seguinte."""
    alvo = tmp_path / "governanca.md"
    alvo.write_text("versao antiga\n", encoding="utf-8")
    assert _read_file_with_cache(str(alvo)) == "versao antiga\n"

    # mtime tem granularidade de sistema de arquivos; garantir avanco real.
    alvo.write_text("versao nova\n", encoding="utf-8")
    os.utime(alvo, (time.time() + 2, time.time() + 2))

    assert _read_file_with_cache(str(alvo)) == "versao nova\n", (
        "leitura devolveu conteudo antigo depois da edicao -- o cache nao invalidou"
    )


@pytest.mark.unit
def test_chave_muda_quando_o_arquivo_muda(tmp_path: Path) -> None:
    """A chave e o mecanismo: mesma chave para conteudos diferentes e o defeito."""
    alvo = tmp_path / "doc.md"
    alvo.write_text("um\n", encoding="utf-8")
    antes = _chave_de_arquivo(str(alvo))

    alvo.write_text("dois\n", encoding="utf-8")
    os.utime(alvo, (time.time() + 2, time.time() + 2))
    depois = _chave_de_arquivo(str(alvo))

    assert antes != depois, "chave identica para conteudos diferentes: a edicao seria invisivel"
    assert str(alvo) in antes and str(alvo) in depois, "a chave tem de continuar enderecando o caminho"


@pytest.mark.unit
def test_arquivo_ausente_nao_quebra_a_chave(tmp_path: Path) -> None:
    """Sem o arquivo nao ha mtime; a chave cai para a forma estavel, sem excecao."""
    ausente = tmp_path / "nao_existe.md"
    chave = _chave_de_arquivo(str(ausente))
    assert chave == f"file:{ausente}"
    assert _read_file_with_cache(str(ausente)) == ""
