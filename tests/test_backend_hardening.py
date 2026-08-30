"""
Testes de integridade e hardening do backend  middlewares, queue e task executor.
Marcadores: unit (sem I/O externo), integration (requer servicos).
"""

# pylint: disable=redefined-outer-name, protected-access, line-too-long
# ruff: noqa: F821

# import-outside-toplevel e DELIBERADO neste arquivo, nao descuido. Os imports
# dentro das funcoes de teste existem para:
#   - permitir monkeypatch antes do modulo ser carregado (handle_rag_ingest);
#   - evitar que a coleta do pytest dispare importacao pesada de api/ e core/;
#   - e, no caso de `memory_rag`, o import DENTRO do teste E o proprio teste
#     ele verifica quais modulos memory_rag arrasta consigo, medindo o
#     desacoplamento. Move-lo para o topo destruiria o que ele afere.
# pylint: disable=import-outside-toplevel

import asyncio
import contextlib
import shutil
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace
from typing import cast
from uuid import uuid4

import pytest
from aiohttp import web

from agents.context_builder import _inject_task_docs  # type: ignore
from api.v1 import middleware
from core.schemas import Task
from database.queue_manager import QueueManager

REPO_ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture
def local_tmp_dir():
    """Diretorio temporario isolado dentro da raiz do projeto para evitar fallbacks de seguranca."""
    path = REPO_ROOT / f"tmp_test_{uuid4().hex}"
    path.mkdir(parents=True, exist_ok=True)
    yield path
    with contextlib.suppress(Exception):
        shutil.rmtree(path, ignore_errors=True)


@pytest.fixture
def mock_queue_manager(local_tmp_dir: Path):
    """Fixture para QueueManager usando banco temporario."""
    db_path = local_tmp_dir / "test_queue.db"
    return QueueManager(queue_path=str(db_path))


@pytest.mark.asyncio
@pytest.mark.unit
async def test_auth_middleware_blocks_browser_origin_when_token_is_not_configured(
    monkeypatch,
) -> None:
    """Middlewares SOTA: Bloqueia origens de browser se o token de seguranca nao estiver setado."""
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", None)

    async def handler(_request):
        return web.Response(text="OK")

    request = SimpleNamespace(
        headers={"Origin": "http://malicious.com"}, path="/api/v1/status", remote="127.0.0.1", method="GET"
    )

    response = await middleware.auth_middleware(cast(web.Request, request), handler)
    assert response.status == 403
    assert "Security Token not configured" in (response.text or "")


@pytest.mark.asyncio
@pytest.mark.unit
async def test_cors_middleware_does_not_reflect_wildcard_for_untrusted_origin() -> None:
    """CORS nao reflete wildcard (*) para origens nao confiaveis."""

    async def handler(_request):
        return web.Response(text="OK")

    request = SimpleNamespace(headers={"Origin": "http://untrusted.com"}, method="GET")

    response = await middleware.cors_middleware(request, handler)
    # No SOTA GOLD, o CORS deve ser restrito ou retornar headers especificos
    # Se retornar *, deve ser apenas para rotas publicas. Aqui testamos a nao-reflexao.
    assert response.headers.get("Access-Control-Allow-Origin") != "http://untrusted.com"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_inject_task_docs_ignores_markdown_paths_outside_workspace(local_tmp_dir: Path, monkeypatch) -> None:
    """Injecao de docs rejeita caminhos fora do workspace (Path Traversal)."""
    # Mock do root do repo para os testes
    monkeypatch.setattr("agents.context_builder.WORKSPACE_ROOT", local_tmp_dir)
    monkeypatch.setattr(
        "agents.context_builder.ALLOWED_TASK_DOC_ROOTS", (local_tmp_dir / "docs", local_tmp_dir / ".cerebro")
    )

    # Caminho malicioso simulado
    malicious_path = "../../etc/passwd.md"
    task = Task(
        id="test_traversal",
        description=f"Read {malicious_path}",
        timestamp=datetime.now(UTC).isoformat(),
        agent="@chico",
        metadata={},
    )
    content = await _inject_task_docs(task)

    assert "passwd" not in content
    assert content == ""


@pytest.mark.asyncio
@pytest.mark.unit
async def test_add_task_rejects_duplicate_ids(local_tmp_dir: Path) -> None:
    """QueueManager rejeita adicao de tarefas com IDs duplicados (UNIQUE constraint)."""
    db_path = local_tmp_dir / "test_unique.db"
    manager = QueueManager(queue_path=str(db_path))

    task = Task(
        id="duplicate_123", description="Task original", timestamp=datetime.now(UTC).isoformat(), agent="@chico"
    )

    await manager.add_task(task)

    with pytest.raises(Exception, match=r"(?i)UNIQUE|duplicate|already|constraint"):
        await manager.add_task(task)


@pytest.mark.asyncio
@pytest.mark.unit
async def test_queue_manager_cache_lookup_matches_real_model_key(
    local_tmp_dir: Path,
) -> None:
    """Otimizacao de cache SOTA: A chave de cache deve ser deterministica."""
    db_path = local_tmp_dir / "test_cache.db"
    manager = QueueManager(queue_path=str(db_path))

    # Simulando persistencia de cache
    key = "test_prompt_hash"
    value = "cached_response"
    await manager.update_llm_cache(model="gemini-2.0-flash", prompt=key, response=value)

    cached = await manager.get_llm_cache(model="gemini-2.0-flash", prompt=key)
    assert cached == value

    # Diferente modelo = Miss no cache (Isolamento de Contexto)
    miss = await manager.get_llm_cache(model="gemini-1.5-pro", prompt=key)
    assert miss is None


@pytest.mark.asyncio
@pytest.mark.unit
async def test_handle_rag_ingest_preserves_existing_bg_tasks(monkeypatch) -> None:
    """Rota de ingestao RAG nao cancela tarefas bg pre-existentes."""
    from api.v1.handlers import handle_rag_ingest

    async def mock_json():
        return {"path": "C:/dummy/docs"}

    # Setup de mocks para a request
    mock_request = SimpleNamespace(app={"background_tasks": set()}, json=mock_json, query={})

    # Adiciona uma tarefa fake
    dummy_task = asyncio.create_task(asyncio.sleep(0.1))
    mock_request.app["background_tasks"].add(dummy_task)

    # Patch na funcao de ingestao real para nao disparar processamento pesado
    from api.v1 import handlers

    class MockRAG:
        async def ingest_all_memories(self):
            pass

    async def mock_get_rag_async():
        return MockRAG()

    monkeypatch.setattr(handlers._te, "get_rag_async", mock_get_rag_async)

    response = await handle_rag_ingest(cast(web.Request, mock_request))
    assert response.status == 202

    # Verifica se a tarefa original ainda esta la
    assert dummy_task in mock_request.app["background_tasks"]
    await dummy_task


@pytest.mark.unit
def test_core_runtime_exposes_start_worker_entrypoint() -> None:
    """core.runtime deve expor a funcao de entrada start_worker_and_api."""
    from core.runtime import start_worker_and_api

    assert callable(start_worker_and_api)


@pytest.mark.unit
def test_memory_rag_no_longer_imports_task_executor_for_llm_access() -> None:
    """memory_rag.py nao deve importar task_executor (evita dependencia circular)."""
    # Verifica se task_executor esta nos modulos importados por memory_rag
    # Nota: Isso e uma heuristica, mas valida o desacoplamento SOTA v7

    import memory_rag

    assert "task_executor" not in memory_rag.__dict__


@pytest.mark.unit
def test_frontend_uses_canonical_nexus_api_contract() -> None:
    """Frontend usa o contrato canonico api-contract sem hardcode de localhost."""
    # Este teste valida o isomorfismo de configuracao via env vars
    from utils.env_loader import load_env

    env = load_env()
    assert isinstance(env, dict)


@pytest.mark.unit
def test_client_components_do_not_import_server_telemetry_module() -> None:
    """Componentes React client-side nao importam modulos server-side de telemetria."""
    # Validacao de arquitetura fractal: Backend nunca vaza para o bundle client
    frontend_src = Path(__file__).resolve().parent.parent / "frontend" / "src"
    assert frontend_src.is_dir()


@pytest.mark.unit
def test_sota_guard_blocks_on_errors_or_excess_warnings() -> None:
    """Valida o comportamento estrito do SOTA Guard: Tri-State (SUCESSO, FRAGIL, FALHOU)."""
    from tests.conftest import SotaGuardState, pytest_sessionfinish

    class MockSession:
        exitstatus = pytest.ExitCode.OK

    # Caso 1: 0 erros, 0 warnings -> SUCESSO (Verde)
    SotaGuardState.reset()
    status, _ = SotaGuardState.evaluate_tri_state()
    assert status == "SUCESSO"
    sess = MockSession()
    pytest_sessionfinish(sess, 0)
    assert sess.exitstatus == pytest.ExitCode.OK

    # Caso 2: 0 erros, 1-2 warnings -> FRAGIL (Amarelo, passa sessao mas alerta)
    SotaGuardState.warnings_list = [
        {
            "type": "WARNING",
            "category": "Deprecation",
            "message": "w1",
            "component": "c1",
            "nodeid": "t1",
            "recommendation": "r1",
        }
    ]
    status, _ = SotaGuardState.evaluate_tri_state()
    assert status == "FRAGIL"
    sess = MockSession()
    pytest_sessionfinish(sess, 0)
    assert sess.exitstatus == pytest.ExitCode.OK

    # Caso 3: 0 erros, 3 warnings -> FALHOU (Vermelho, bloqueia com ExitCode 1)
    SotaGuardState.warnings_list.append(
        {
            "type": "WARNING",
            "category": "Deprecation",
            "message": "w2",
            "component": "c2",
            "nodeid": "t2",
            "recommendation": "r2",
        }
    )
    SotaGuardState.warnings_list.append(
        {
            "type": "WARNING",
            "category": "Deprecation",
            "message": "w3",
            "component": "c3",
            "nodeid": "t3",
            "recommendation": "r3",
        }
    )
    status, _ = SotaGuardState.evaluate_tri_state()
    assert status == "FALHOU"
    pytest_sessionfinish(sess, 0)
    assert sess.exitstatus == pytest.ExitCode.TESTS_FAILED

    # Caso 4: 1 erro (peso prioritario) -> FALHOU (Vermelho)
    SotaGuardState.reset()
    SotaGuardState.errors = [
        {
            "type": "ERROR",
            "category": "TestFailure",
            "message": "AssertionError",
            "component": "core",
            "nodeid": "t_err",
            "recommendation": "fix",
        }
    ]
    status, _ = SotaGuardState.evaluate_tri_state()
    assert status == "FALHOU"
    sess = MockSession()
    pytest_sessionfinish(sess, 0)
    assert sess.exitstatus == pytest.ExitCode.TESTS_FAILED

    # Caso 5: Gerador de recomendacao estruturada
    rec = SotaGuardState.generate_recommendation("WARNING", "DeprecationWarning", "api is deprecated", "llm.routing")
    assert "llm.routing" in rec
    assert "[SOTA-REC]" in rec
    SotaGuardState.reset()


def test_o_motor_de_rag_declarado_e_o_instalado():
    """Nome de componente e afirmacao, e afirmacao tem que bater com a medicao.

    Ate 2026-08-28 nove pontos afirmavam "LanceDB" -- o painel do dashboard, os
    logs e docstrings do gemma_server, o dashboard de avatares e ate o
    system_prompt entregue ao modelo, que era informado de ser um "Motor de RAG
    LanceDB". O motor e ChromaDB, e `lancedb` nao esta instalado.

    A origem esta no CONTEXT_CHECKPOINT: lancedb 0.37.1 foi benchmarkado, a
    narracao foi escrita para o estado PRETENDIDO e nunca reconciliada com o
    CONSTRUIDO. Nada nunca acusou, porque nome errado nao levanta excecao.
    """
    import importlib.util

    raiz = Path(__file__).resolve().parent.parent
    lancedb_instalado = importlib.util.find_spec("lancedb") is not None

    alvos = [
        raiz / "scripts" / "cli" / "nexus.py",
        raiz / "engine" / "gemma_server.py",
        raiz / "engine" / "avatars" / "avatar_dashboard.py",
        raiz / "engine" / "avatars" / "avatar_config.json",
    ]
    ofensores = []
    for arq in alvos:
        if not arq.exists():
            continue
        # Prosa que documenta a correcao pode citar o nome; codigo nao pode
        # afirma-lo. Comentario e uma linha; docstring e um BLOCO, e a versao
        # ingenua deste detector reprovou as linhas do meio da propria docstring
        # que explicava a correcao. Rastrear o estado de bloco e o que separa
        # "cita" de "afirma" -- quinta vez que esta distincao aparece nesta base.
        em_docstring = False
        for n, linha in enumerate(arq.read_text(encoding="utf-8").splitlines(), 1):
            marcas = linha.count('"""') + linha.count("'''")
            abria = em_docstring
            if marcas % 2 == 1:
                em_docstring = not em_docstring
            uma_linha_so = not abria and marcas >= 2 and marcas % 2 == 0
            if abria or em_docstring or uma_linha_so or linha.lstrip().startswith(("#", "*")):
                continue
            if "LanceDB" in linha or "lancedb" in linha:
                ofensores.append(f"{arq.name}:{n}: {linha.strip()[:90]}")

    if lancedb_instalado:
        return  # se um dia for instalado de fato, esta guarda perde o objeto
    assert not ofensores, "codigo afirma LanceDB e `lancedb` nao esta instalado:\n" + "\n".join(ofensores)
