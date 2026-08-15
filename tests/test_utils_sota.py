"""
Testes de cobertura SOTA para o pacote utils/.
Cobre: text, harmonizer, cache, storage, resources.
"""

# pylint: disable=redefined-outer-name

import os

import pytest

from utils.cache import SOTACache
from utils.harmonizer import SOTAHarmonizer
from utils.resources import ResourceGuard
from utils.storage import SOTABucketing
from utils.text import enforce_pure_ascii

# ==============================================================================
# utils/text.py  enforce_pure_ascii
# ==============================================================================


@pytest.mark.unit
@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("", ""),  # edge: string vazia (branch `if not text`)
        ("cafe", "cafe"),  # ASCII puro: sem alteracao
        ("caf\u00e9", "cafe"),  # acento agudo: e-acute -> e
        ("a\u00e7\u00e3o", "acao"),  # cedilha + til: acao
        ("\u00c7\u00e1\u00e9\u00ed\u00f3\u00fa", "Caeiou"),  # maiusculas acentuadas
        ("\U0001f600 poker", " poker"),  # emoji: destruido pelo NFKD+ASCII
        ("\u2014separador\u2026", "-separador..."),  # dash/ellipsis curados
        ("\u201cquoted\u201d", '"quoted"'),  # aspas tipograficas curadas
    ],
)
def test_enforce_pure_ascii(raw: str, expected: str) -> None:
    """Valida a purificacao ASCII para todos os ramos de substituicao."""
    assert enforce_pure_ascii(raw) == expected


@pytest.mark.unit
def test_enforce_pure_ascii_idempotent() -> None:
    """Aplicar enforce_pure_ascii duas vezes deve retornar o mesmo resultado."""
    text = "Cafe com acao no poker!"
    once = enforce_pure_ascii(text)
    twice = enforce_pure_ascii(once)
    assert once == twice


# ==============================================================================
# utils/harmonizer.py  SOTAHarmonizer
# ==============================================================================


@pytest.mark.asyncio
@pytest.mark.unit
async def test_harmonizer_ultra_fast_async_with_coroutine() -> None:
    """Decorator deve aguardar coroutines nativas corretamente."""

    @SOTAHarmonizer.ultra_fast_async
    async def async_double(x: int) -> int:
        return x * 2

    result = await async_double(21)
    assert result == 42


@pytest.mark.asyncio
@pytest.mark.unit
async def test_harmonizer_ultra_fast_async_with_sync_function() -> None:
    """Decorator deve rodar funcoes sincronas via asyncio.to_thread."""

    @SOTAHarmonizer.ultra_fast_async
    def sync_triple(x: int) -> int:
        return x * 3

    result = await sync_triple(7)
    assert result == 21


@pytest.mark.asyncio
@pytest.mark.unit
async def test_harmonizer_ultra_fast_async_propagates_exceptions() -> None:
    """Decorator deve propagar excecoes sem silencia-las."""

    @SOTAHarmonizer.ultra_fast_async
    async def failing_func() -> None:
        raise ValueError("SOTA Error")

    with pytest.raises(ValueError, match="SOTA Error"):
        await failing_func()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_harmonizer_batch_process_all_items() -> None:
    """batch_process deve processar todos os itens independente do batch_size."""
    import asyncio

    async def double(x: int) -> int:
        await asyncio.sleep(0)
        return x * 2

    items = list(range(1, 12))  # 11 items > batch_size padrao de 10
    results = await SOTAHarmonizer.batch_process(items, double, batch_size=3)
    assert results == [x * 2 for x in items]


@pytest.mark.asyncio
@pytest.mark.unit
async def test_harmonizer_batch_process_empty_list() -> None:
    """batch_process com lista vazia deve retornar lista vazia sem erro."""
    import asyncio

    async def noop(x: int) -> int:
        await asyncio.sleep(0)
        return x

    results = await SOTAHarmonizer.batch_process([], noop)
    assert results == []


# ==============================================================================
# utils/cache.py  SOTACache
# ==============================================================================


@pytest.fixture
def cache(tmp_path):
    """Instancia SOTACache isolada em diretorio temporario."""
    return SOTACache(cache_dir=str(tmp_path / "cache"), ttl=3600)


@pytest.mark.unit
def test_cache_set_and_get_memory_hit(cache: SOTACache) -> None:
    """Valor recentemente inserido deve ser retornado do tier de memoria."""
    cache.set("key1", "value1")
    assert cache.get("key1") == "value1"


@pytest.mark.unit
def test_cache_get_returns_none_for_missing_key(cache: SOTACache) -> None:
    """Chave inexistente deve retornar None sem excecao."""
    assert cache.get("nonexistent") is None


@pytest.mark.unit
def test_cache_expired_ttl_returns_none(cache: SOTACache) -> None:
    """Valor com TTL negativo (ja expirado) deve ser ignorado."""
    cache.set("expired_key", "stale_value", ttl=-1)
    assert cache.get("expired_key") is None


@pytest.mark.unit
def test_cache_disk_persistence_survives_memory_clear(cache: SOTACache) -> None:
    """Valor deve ser recuperado do disco apos limpeza do tier de memoria."""
    cache.set("disk_key", {"data": 42})
    cache.memory_cache.clear()  # Simula eviction da memoria
    result = cache.get("disk_key")
    assert result == {"data": 42}


@pytest.mark.unit
def test_cache_clear_removes_all_entries(cache: SOTACache) -> None:
    """clear() deve limpar memoria e disco completamente."""
    cache.set("a", 1)
    cache.set("b", 2)
    cache.clear()
    assert cache.get("a") is None
    assert cache.get("b") is None
    assert cache.memory_cache == {}


@pytest.mark.unit
def test_cache_overwrite_existing_key(cache: SOTACache) -> None:
    """Sobrescrever uma chave deve retornar o valor mais recente."""
    cache.set("k", "old")
    cache.set("k", "new")
    assert cache.get("k") == "new"


@pytest.mark.unit
def test_cache_get_hash_is_deterministic(cache: SOTACache) -> None:
    """_get_hash deve retornar o mesmo hash para a mesma chave."""
    h1 = cache._get_hash("test_key")
    h2 = cache._get_hash("test_key")
    assert h1 == h2
    assert len(h1) == 64  # SHA-256 hex


# ==============================================================================
# utils/storage.py  SOTABucketing
# ==============================================================================


@pytest.fixture
def buckets(tmp_path):
    """Instancia SOTABucketing isolada em diretorio temporario."""
    return SOTABucketing(root_dir=str(tmp_path / "buckets"))


@pytest.mark.unit
def test_bucketing_get_bucket_path_creates_directory(buckets: SOTABucketing) -> None:
    """get_bucket_path deve criar o diretorio se nao existir."""
    path = buckets.get_bucket_path("test-bucket")
    assert os.path.isdir(path)


@pytest.mark.unit
def test_bucketing_upload_and_download_roundtrip(buckets: SOTABucketing) -> None:
    """Upload seguido de download deve retornar os bytes identicos."""
    payload = b"SOTA_POKER_DATA_42"
    buckets.upload_file("models", "weights.bin", payload)
    result = buckets.download_file("models", "weights.bin")
    assert result == payload


@pytest.mark.unit
def test_bucketing_download_nonexistent_returns_none(buckets: SOTABucketing) -> None:
    """Download de arquivo inexistente deve retornar None sem excecao."""
    result = buckets.download_file("empty-bucket", "ghost.bin")
    assert result is None


@pytest.mark.unit
def test_bucketing_multiple_buckets_isolated(buckets: SOTABucketing) -> None:
    """Diferentes buckets nao devem interferir entre si."""
    buckets.upload_file("bucket-a", "file.txt", b"alpha")
    buckets.upload_file("bucket-b", "file.txt", b"beta")
    assert buckets.download_file("bucket-a", "file.txt") == b"alpha"
    assert buckets.download_file("bucket-b", "file.txt") == b"beta"


# ==============================================================================
# utils/resources.py  ResourceGuard
# ==============================================================================


@pytest.mark.unit
def test_resource_guard_get_ram_usage_returns_valid_dict() -> None:
    """get_ram_usage deve retornar dicionario com campos total, available, percent."""
    ram = ResourceGuard.get_ram_usage()
    assert "total" in ram
    assert "available" in ram
    assert "percent" in ram
    assert ram["total"] > 0
    assert 0.0 <= ram["percent"] <= 100.0


@pytest.mark.unit
def test_resource_guard_get_vram_usage_without_cuda() -> None:
    """Sem CUDA disponivel, get_vram_usage deve retornar {'error': 'CUDA not available'}."""
    vram = ResourceGuard.get_vram_usage()
    # Ambiente CI nao tem GPU CUDA; valida o fallback
    assert isinstance(vram, dict)
    if "error" in vram:
        assert vram["error"] == "CUDA not available"
    else:
        # Se por acaso tiver GPU, valida a estrutura
        assert "total" in vram
        assert "allocated" in vram


@pytest.mark.unit
def test_resource_guard_check_health_returns_bool() -> None:
    """check_health deve retornar um booleano sem lancar excecoes."""
    result = ResourceGuard.check_health()
    assert isinstance(result, bool)


@pytest.mark.unit
def test_resource_guard_check_health_fails_with_zero_ram_reserve() -> None:
    """Com ram_reserve=0 e vram_limit enorme, check_health deve retornar True."""
    result = ResourceGuard.check_health(vram_limit=999.0, ram_reserve=0.0)
    assert result is True
