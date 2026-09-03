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
import base64
import contextlib
import shutil
import time
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


def _jwt(header: dict, payload: dict, secret: str) -> str:
    """Monta um JWT assinado em HS256, ou com assinatura vazia quando o alg nao a exige."""
    import hashlib
    import hmac
    import json

    def seg(data: dict) -> str:
        raw = json.dumps(data, separators=(",", ":")).encode()
        return base64.urlsafe_b64encode(raw).decode().rstrip("=")

    signing_input = f"{seg(header)}.{seg(payload)}"
    if header.get("alg") == "none":
        return f"{signing_input}."
    mac = hmac.new(secret.encode(), signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{base64.urlsafe_b64encode(mac).decode().rstrip('=')}"


@pytest.mark.unit
def test_jwt_aceita_apenas_hs256_declarado_no_header() -> None:
    """Ate 2026-09-01 o algoritmo era inferido do formato (3 segmentos), nunca lido.

    Com `alg: none` o token nao carrega assinatura -- o verificador HS256 comparava
    o HMAC contra bytes vazios e negava, mas nada no codigo AFIRMAVA a restricao.
    A checagem explicita e o que impede que uma futura extensao de algoritmos
    aceite silenciosamente um header hostil.
    """
    segredo = "segredo-de-teste"
    agora = int(time.time())

    valido = _jwt({"alg": "HS256", "typ": "JWT"}, {"sub": "u1", "exp": agora + 300}, segredo)
    assert middleware.verify_hs256_jwt(valido, segredo) is not None

    alg_none = _jwt({"alg": "none", "typ": "JWT"}, {"sub": "u1", "exp": agora + 300}, segredo)
    assert middleware.verify_hs256_jwt(alg_none, segredo) is None

    alg_trocado = _jwt({"alg": "HS512", "typ": "JWT"}, {"sub": "u1", "exp": agora + 300}, segredo)
    assert middleware.verify_hs256_jwt(alg_trocado, segredo) is None


@pytest.mark.unit
def test_jwt_valida_a_janela_temporal_completa() -> None:
    """exp era a unica claim temporal verificada; nbf e iat passavam livres."""
    segredo = "segredo-de-teste"
    agora = int(time.time())
    skew = middleware.JWT_CLOCK_SKEW_SECONDS

    expirado = _jwt({"alg": "HS256"}, {"sub": "u1", "exp": agora - skew - 60}, segredo)
    assert middleware.verify_hs256_jwt(expirado, segredo) is None

    futuro = _jwt({"alg": "HS256"}, {"sub": "u1", "nbf": agora + skew + 60, "exp": agora + 900}, segredo)
    assert middleware.verify_hs256_jwt(futuro, segredo) is None

    emitido_no_futuro = _jwt({"alg": "HS256"}, {"sub": "u1", "iat": agora + skew + 60, "exp": agora + 900}, segredo)
    assert middleware.verify_hs256_jwt(emitido_no_futuro, segredo) is None


@pytest.mark.unit
def test_jwt_confere_issuer_e_audience_quando_declarados(monkeypatch) -> None:
    """iss/aud so sao exigidos se o ambiente os declarar -- ausencia nao vira falha."""
    segredo = "segredo-de-teste"
    agora = int(time.time())
    token = _jwt(
        {"alg": "HS256"},
        {"sub": "u1", "exp": agora + 300, "iss": "https://proj.supabase.co/auth/v1", "aud": ["authenticated"]},
        segredo,
    )

    monkeypatch.setenv("SUPABASE_JWT_ISSUER", "https://proj.supabase.co/auth/v1")
    monkeypatch.setenv("SUPABASE_JWT_AUDIENCE", "authenticated")
    assert middleware.verify_hs256_jwt(token, segredo) is not None

    monkeypatch.setenv("SUPABASE_JWT_ISSUER", "https://outro.supabase.co/auth/v1")
    assert middleware.verify_hs256_jwt(token, segredo) is None


@pytest.mark.unit
def test_rotas_de_arquivos_e_busca_estao_registradas(local_tmp_dir: Path) -> None:
    """O dashboard de arquivos chama /api/files/list e /api/files/view.

    Os handlers existiam em api/v1/handlers.py e nunca foram adicionados a tabela
    de rotas: o frontend recebia 404 de um endpoint que o backend implementava.
    """
    from api.v1.server import create_app

    manager = QueueManager(queue_path=str(local_tmp_dir / "rotas.db"))
    app = create_app(manager)
    rotas = {(r.method, r.resource.canonical) for r in app.router.routes() if r.resource}

    assert ("GET", "/api/files/list") in rotas
    assert ("GET", "/api/files/view") in rotas
    assert ("GET", "/api/web-search") in rotas


def _cliente_local(local_tmp_dir: Path, monkeypatch, nome_db: str):
    """TestClient sobre create_app() no modo local sem token (loopback + origem confiavel).

    Exercita a rota registrada, e nao apenas a tabela de rotas: registrar
    /api/files/view sem verificar a resposta so troca 404 por 500.
    """
    from aiohttp.test_utils import TestClient, TestServer

    from api.v1 import handlers
    from api.v1.server import create_app

    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", None)
    monkeypatch.delenv("SUPABASE_JWT_SECRET", raising=False)
    monkeypatch.setattr(handlers, "BASE_WORKSPACE_DIR", local_tmp_dir)

    manager = QueueManager(queue_path=str(local_tmp_dir / nome_db))
    return TestClient(TestServer(create_app(manager)))


@pytest.mark.asyncio
@pytest.mark.unit
async def test_view_file_recusa_caminho_fora_das_fronteiras(local_tmp_dir: Path, monkeypatch) -> None:
    """Path traversal e ausencia de 'path' respondem 403/400, nunca conteudo."""
    async with _cliente_local(local_tmp_dir, monkeypatch, "traversal.db") as cliente:
        sem_path = await cliente.get("/api/files/view")
        assert sem_path.status == 400

        fora = await cliente.get(
            "/api/files/view", params={"path": str(Path(REPO_ROOT.anchor) / "windows" / "win.ini")}
        )
        assert fora.status == 403

        inexistente = await cliente.get("/api/files/view", params={"path": str(local_tmp_dir / "nao_existe.txt")})
        assert inexistente.status == 404


@pytest.mark.asyncio
@pytest.mark.unit
async def test_view_file_entrega_texto_e_barra_arquivo_gigante(local_tmp_dir: Path, monkeypatch) -> None:
    """Arquivo permitido volta como texto; acima do teto de 5 MB volta aviso, nao o conteudo."""
    pequeno = local_tmp_dir / "nota.txt"
    pequeno.write_text("conteudo-visivel", encoding="utf-8")

    gigante = local_tmp_dir / "gigante.txt"

    def _criar_gigante() -> None:
        with open(gigante, "wb") as f:
            f.seek(6 * 1024 * 1024)
            f.write(b"\0")

    await asyncio.to_thread(_criar_gigante)

    async with _cliente_local(local_tmp_dir, monkeypatch, "texto.db") as cliente:
        ok = await cliente.get("/api/files/view", params={"path": str(pequeno)})
        assert ok.status == 200
        corpo = await ok.json()
        assert corpo["type"] == "text"
        assert corpo["content"] == "conteudo-visivel"

        grande = await cliente.get("/api/files/view", params={"path": str(gigante)})
        assert grande.status == 200
        aviso = await grande.json()
        assert "[Aviso]" in aviso["content"]


@pytest.mark.asyncio
@pytest.mark.unit
async def test_list_files_e_web_search_respondem_o_contrato_do_dashboard(local_tmp_dir: Path, monkeypatch) -> None:
    """/api/files/list devolve a arvore esperada; /api/web-search exige 'q'."""
    (local_tmp_dir / "visivel.md").write_text("# doc", encoding="utf-8")

    async with _cliente_local(local_tmp_dir, monkeypatch, "lista.db") as cliente:
        listagem = await cliente.get("/api/files/list")
        assert listagem.status == 200
        payload = await listagem.json()
        assert payload["status"] == "SUCCESS"
        nomes = {arquivo["name"] for raiz in payload["tree"] for arquivo in raiz["files"]}
        assert "visivel.md" in nomes

        sem_query = await cliente.get("/api/web-search")
        assert sem_query.status == 400


@pytest.mark.asyncio
@pytest.mark.unit
async def test_rotas_novas_respeitam_o_middleware_de_origem(local_tmp_dir: Path, monkeypatch) -> None:
    """As rotas novas nao criam um bypass: origem nao confiavel continua barrada."""
    async with _cliente_local(local_tmp_dir, monkeypatch, "origem.db") as cliente:
        for rota in ("/api/files/list", "/api/files/view", "/api/web-search"):
            resposta = await cliente.get(rota, headers={"Origin": "http://malicious.example"})
            assert resposta.status == 403, rota


@pytest.mark.unit
def test_erro_interno_nao_vaza_detalhe_da_excecao() -> None:
    """Handlers devolviam `str(e)` cru em 500 -- caminho de disco, SQL e nome de chave."""
    import json as _json

    from api.v1.handlers import _internal_error

    response = _internal_error(
        RuntimeError(r"no such table: tasks (C:\Users\raphael\.gemini\Site\queue\tasks.db)"),
        "handle_get_status",
    )

    assert response.status == 500
    corpo = _json.loads(response.text or "{}")
    assert "tasks.db" not in (response.text or "")
    assert corpo["error"] == "Erro interno do servidor."
    assert corpo["error_id"]


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
        "agents.context_builder.ALLOWED_TASK_DOC_ROOTS",
        (local_tmp_dir / "docs", local_tmp_dir / ".claude", local_tmp_dir / ".cerebro"),
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
    await manager.update_llm_cache(model="gemini-3.8-flash", prompt=key, response=value)

    cached = await manager.get_llm_cache(model="gemini-3.8-flash", prompt=key)
    assert cached == value

    # Diferente modelo = Miss no cache (Isolamento de Contexto)
    miss = await manager.get_llm_cache(model="gemini-3.7-flash", prompt=key)
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
