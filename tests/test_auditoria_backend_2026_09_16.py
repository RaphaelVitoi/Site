"""Guards da auditoria de backend de 2026-09-16 (reports/AUDITORIA-2026-09-16-backend-padrao-ouro.md).

Um teste por achado. Cada um foi escrito para falhar no codigo anterior a correcao:
o nome do teste diz o defeito, e o corpo reproduz a prova da auditoria.
"""

from __future__ import annotations

import base64
from datetime import UTC, datetime, timedelta
import hashlib
import hmac
import json
from pathlib import Path
import re
import time
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from aiohttp import web
from pydantic import ValidationError
import pytest

from agents import autonomy
from api.v1 import handlers, middleware
from api.v1.server import create_app
from core.arbitrator import UniversalArbitrator
from core.schemas import RAGQuery, Task
from database.queue_manager import QueueManager
from monitoring.audit_engine import AuditEngine
from worker import loop as worker_loop

SAFE_PATH_RE = re.compile(r"^[a-zA-Z0-9_/\\\-. :]+$")
SEGREDO = "s" * 40


def _task(tid: str, agent: str = "@chico", deps: list[str] | None = None, **meta) -> Task:
    metadata = dict(meta)
    if deps is not None:
        metadata["depends_on"] = deps
    return Task(id=tid, description="x", agent=agent, timestamp=datetime.now(UTC).isoformat(), metadata=metadata)


@pytest.fixture
async def manager():
    qm = QueueManager(":memory:")
    yield qm
    await qm.close()


# --- BK-01 --------------------------------------------------------------------


@pytest.mark.asyncio
async def test_bk01_apply_god_mode_recusa_chamada_sem_autor(manager) -> None:
    with pytest.raises(ValueError, match="agent_name"):
        await autonomy.apply_god_mode("texto", manager, "")


@pytest.mark.asyncio
async def test_bk01_resposta_aplicada_com_a_identidade_do_autor_e_nao_da_fila(manager) -> None:
    """A prova da auditoria: @chico running em paralelo nao empresta privilegio ao @curator."""
    await manager.add_task(_task("T-CHICO", "@chico"))
    assert await manager.claim_task("T-CHICO", "host:1")
    await manager.set_system_state("autonomy_mode", "full")
    autonomy._AUTONOMY_CACHE["timestamp"] = 0.0

    capturado: dict[str, tuple[str, str]] = {}

    async def forge(_text, mode, agent):
        capturado["forge"] = (mode, agent)
        return []

    async def execute(_text, mode, agent):
        capturado["exec"] = (mode, agent)

    with (
        patch.object(autonomy, "_forge_files", new=forge),
        patch.object(autonomy, "_execute_commands", new=execute),
        patch.object(autonomy, "_read_autonomy_levers", new=AsyncMock(return_value=(["@chico"], True))),
    ):
        await autonomy.apply_god_mode("resposta", manager, "@curator")

    assert capturado["forge"] == ("sandbox", "@curator")
    autonomy._AUTONOMY_CACHE["timestamp"] = 0.0


def test_bk01_chamadores_de_producao_passam_o_autor() -> None:
    raiz = Path(__file__).resolve().parent.parent
    for arquivo in ("agents/execution.py", "engine/cognitive.py"):
        fonte = (raiz / arquivo).read_text(encoding="utf-8")
        assert "apply_god_mode(response_text, manager, task.agent)" in fonte, arquivo


# --- BK-02 --------------------------------------------------------------------


@pytest.mark.parametrize(
    "caminho",
    [
        "autonomy.json",
        ".husky/pre-commit",
        ".claude/settings.json",
        ".vscode/tasks.json",
        ".github/workflows/ci.yml",
        "conftest.py",
        "tests/conftest.py",
        "package.json",
        "frontend/package.json",
        "pyproject.toml",
        ".env",
        ".env.local",
        "scripts/ops/cwv_gate.ps1",
        "AUTONOMY.JSON",
        # Windows descarta ponto/espaco final ao criar o arquivo (security-review 2026-09-16)
        "autonomy.json.",
        "conftest.py. ",
        "task_executor.py.",
        ".husky./pre-commit",
    ],
)
def test_bk02_superficie_de_execucao_protegida_para_agente_comum(caminho: str) -> None:
    ok, _ = autonomy._validate_forged_path(caminho, "default", "@curator", SAFE_PATH_RE)
    assert ok is False


@pytest.mark.parametrize("caminho", ["docs/nota.md", "frontend/src/scripts_x/a.ts", "reports/x.md", "env.md"])
def test_bk02_componente_e_nao_substring(caminho: str) -> None:
    """`scripts` protege o diretorio, nao qualquer nome que contenha a palavra."""
    ok, destino = autonomy._validate_forged_path(caminho, "default", "@curator", SAFE_PATH_RE)
    assert ok is True
    assert destino is not None


def test_bk02_caminho_relativo_resolve_na_raiz_e_nao_no_cwd(tmp_path, monkeypatch) -> None:
    monkeypatch.chdir(tmp_path)
    ok, destino = autonomy._validate_forged_path("docs/nota.md", "default", "@curator", SAFE_PATH_RE)
    assert ok is True
    assert destino == Path(autonomy.__file__).resolve().parent.parent / "docs" / "nota.md"


# --- BK-03 --------------------------------------------------------------------


def _jwt(payload: dict) -> str:
    def seg(d: dict) -> str:
        return base64.urlsafe_b64encode(json.dumps(d).encode()).rstrip(b"=").decode()

    entrada = f"{seg({'alg': 'HS256', 'typ': 'JWT'})}.{seg(payload)}"
    assinatura = base64.urlsafe_b64encode(hmac.new(SEGREDO.encode(), entrada.encode(), hashlib.sha256).digest())
    return f"{entrada}.{assinatura.rstrip(b'=').decode()}"


class _Req(dict):
    def __init__(self, path: str, method: str = "POST") -> None:
        super().__init__()
        self.path = path
        self.method = method


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload",
    [
        {"iss": "supabase", "ref": "p", "role": "anon"},  # formato da anon key publica
        {"iss": "supabase", "ref": "p", "role": "service_role"},
        {"sub": "u1", "role": "anon"},
        {"sub": "", "role": "authenticated"},
        {"role": "authenticated"},
    ],
)
async def test_bk03_jwt_sem_usuario_autenticado_e_recusado(monkeypatch, payload: dict) -> None:
    monkeypatch.setenv("SUPABASE_JWT_SECRET", SEGREDO)
    monkeypatch.delenv("SUPABASE_JWT_AUDIENCE", raising=False)
    monkeypatch.delenv("SUPABASE_JWT_ISSUER", raising=False)
    token = _jwt({**payload, "exp": int(time.time()) + 3600})
    handler = AsyncMock(return_value="ALCANCADO")

    resposta = await middleware._handle_jwt_token_auth(token, _Req("/api/v1/perspective/tree"), handler)

    handler.assert_not_called()
    assert resposta.status == 403


@pytest.mark.asyncio
async def test_bk03_usuario_autenticado_alcanca_rota_de_produto(monkeypatch) -> None:
    monkeypatch.setenv("SUPABASE_JWT_SECRET", SEGREDO)
    monkeypatch.delenv("SUPABASE_JWT_AUDIENCE", raising=False)
    token = _jwt({"sub": "u1", "role": "authenticated", "exp": int(time.time()) + 3600})
    requisicao = _Req("/api/v1/perspective/tree")

    resposta = await middleware._handle_jwt_token_auth(token, requisicao, AsyncMock(return_value="ALCANCADO"))

    assert resposta == "ALCANCADO"
    assert requisicao["user_id"] == "u1"


# --- BK-04 --------------------------------------------------------------------


@pytest.mark.parametrize("status", ["running", "failed", "pending", None])
def test_bk04_dependencia_externa_nao_concluida_bloqueia(status) -> None:
    filho = _task("B", deps=["A"])
    assert UniversalArbitrator.extract_optimal_task([filho], {"A": status}) is None


def test_bk04_sem_status_informado_falha_fechado() -> None:
    assert UniversalArbitrator.extract_optimal_task([_task("B", deps=["A"])]) is None


@pytest.mark.parametrize("status", ["completed", "cancelled"])
def test_bk04_dependencia_concluida_libera(status) -> None:
    filho = _task("B", deps=["A"])
    extraida = UniversalArbitrator.extract_optimal_task([filho], {"A": status})
    assert extraida is not None
    assert extraida.id == "B"


def test_bk04_espera_nao_e_ciclo_e_ciclo_e_detectado() -> None:
    assert UniversalArbitrator.has_dependency_cycle([_task("B", deps=["A"])]) is False
    ciclo = [_task("X", deps=["Y"]), _task("Y", deps=["X"])]
    assert UniversalArbitrator.has_dependency_cycle(ciclo) is True


@pytest.mark.asyncio
async def test_bk04_worker_falha_dependente_de_tarefa_falha_e_nao_despacha(manager) -> None:
    await manager.add_task(_task("A"))
    await manager.update_task_status("A", "failed")
    await manager.add_task(_task("B", deps=["A"]))
    semaforo = MagicMock()

    await worker_loop._dispatch_optimal_task(manager, semaforo, set())

    b = await manager.get_task("B")
    assert b.status == "failed"
    assert b.metadata["workflow_status"] == "upstream_failed"
    assert b.metadata["failed_dependencies"] == ["A"]
    semaforo.release.assert_called_once()


@pytest.mark.asyncio
async def test_bk04_espera_por_dependencia_running_nao_gera_alerta_de_deadlock(manager) -> None:
    await manager.add_task(_task("A"))
    assert await manager.claim_task("A", "host:1")
    await manager.add_task(_task("B", deps=["A"]))

    with patch.object(worker_loop.asyncio, "sleep", new=AsyncMock()):
        await worker_loop._dispatch_optimal_task(manager, MagicMock(), set())

    pendentes = await manager.get_tasks("pending")
    assert [t.id for t in pendentes] == ["B"]


# --- BK-05 --------------------------------------------------------------------


def test_bk05_teto_de_eventos_por_requisicao() -> None:
    with pytest.raises(ValidationError):
        handlers.FrontendLogsRequest.model_validate({"events": [{}] * (handlers.MAX_FRONTEND_EVENTS_PER_REQUEST + 1)})
    assert len(handlers.FrontendLogsRequest.model_validate({"events": [{}] * 100}).events) == 100


def test_bk05_evento_nao_dict_e_recusado_na_fronteira_e_mensagem_longa_truncada() -> None:
    with pytest.raises(ValidationError):
        handlers.FrontendLogsRequest.model_validate({"events": ["texto"]})
    evento = handlers.FrontendLogsRequest.model_validate({"events": [{"message": "a" * 10_000, "extra": 1}]}).events[0]
    assert len(evento.message) == 4000
    assert "extra" not in evento.model_dump()


@pytest.mark.asyncio
async def test_bk05_audit_engine_descarta_so_o_evento_invalido(tmp_path, monkeypatch) -> None:
    monkeypatch.chdir(tmp_path)
    engine = AuditEngine(manager=None)
    await engine.process_frontend_events(["texto", {"message": "ok", "level": 5}])
    assert [e["message"] for e in engine.active_buffer] == ["ok"]


@pytest.mark.asyncio
async def test_bk05_evento_que_chega_durante_a_gravacao_nao_se_perde(tmp_path, monkeypatch) -> None:
    monkeypatch.chdir(tmp_path)
    engine = AuditEngine(manager=None)
    engine.active_buffer = [{"message": "antes"}]
    original_to_thread = handlers.asyncio.to_thread

    async def to_thread_intercalado(fn, *args, **kwargs):
        engine.active_buffer.append({"message": "durante"})
        return await original_to_thread(fn, *args, **kwargs)

    with patch("monitoring.audit_engine.asyncio.to_thread", new=to_thread_intercalado):
        await engine.flush()

    assert engine.active_buffer == [{"message": "durante"}]


# --- BK-06 --------------------------------------------------------------------


def _headers_req(remote: str, headers: dict) -> SimpleNamespace:
    return SimpleNamespace(remote=remote, headers=headers)


def test_bk06_gateway_com_credencial_conta_por_visitante(monkeypatch) -> None:
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "servico")
    a = _headers_req("127.0.0.1", {"Authorization": "Bearer servico", "X-Nexus-Client-Id": "aaa"})
    b = _headers_req("127.0.0.1", {"Authorization": "Bearer servico", "X-Nexus-Client-Id": "bbb"})
    assert middleware._rate_limit_key(a) == "client:aaa"
    assert middleware._rate_limit_key(a) != middleware._rate_limit_key(b)


def test_bk06_client_id_sem_credencial_e_ignorado(monkeypatch) -> None:
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "servico")
    req = _headers_req("10.0.0.5", {"Authorization": "Bearer outro", "X-Nexus-Client-Id": "escolhido"})
    assert middleware._rate_limit_key(req) == "10.0.0.5"


def test_bk06_xff_usa_o_salto_anexado_pelo_proxy_e_nao_o_escrito_pelo_cliente(monkeypatch) -> None:
    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    req = _headers_req("127.0.0.1", {"X-Forwarded-For": "1.1.1.1, 203.0.113.9"})
    assert middleware._rate_limit_key(req) == "203.0.113.9"


# --- BK-07 --------------------------------------------------------------------


def test_bk07_dono_vivo_em_outro_host_ou_neste_host_nao_e_orfao() -> None:
    assert worker_loop._claim_owner_is_dead(None) is True
    assert worker_loop._claim_owner_is_dead("outro-host:1") is False
    import os
    import socket

    pai = os.getppid()
    assert worker_loop._claim_owner_is_dead(f"{socket.gethostname()}:{pai}") is False
    assert worker_loop._claim_owner_is_dead(f"{socket.gethostname()}:{os.getpid()}") is True


@pytest.mark.asyncio
async def test_bk07_recuperacao_nao_toma_tarefa_de_outro_worker_vivo(manager) -> None:
    for tid in ("VIVO", "SEM-DONO"):
        await manager.add_task(_task(tid))
    assert await manager.claim_task("VIVO", "outro-host:4242")
    assert await manager.claim_task("SEM-DONO", None)

    await worker_loop._recover_zombies(manager)

    assert (await manager.get_task("VIVO")).status == "running"
    assert (await manager.get_task("SEM-DONO")).status == "pending"


@pytest.mark.asyncio
async def test_bk07_encerramento_devolve_so_as_tarefas_deste_worker(manager) -> None:
    for tid in ("MINHA", "ALHEIA"):
        await manager.add_task(_task(tid))
    assert await manager.claim_task("MINHA", "eu:1")
    assert await manager.claim_task("ALHEIA", "outro:2")

    assert await manager.release_tasks_claimed_by("eu:1") == 1
    assert (await manager.get_task("MINHA")).status == "pending"
    assert (await manager.get_task("ALHEIA")).status == "running"


# --- BK-08 --------------------------------------------------------------------


@pytest.mark.asyncio
async def test_bk08_media_da_ultima_hora_exclui_registro_de_84_minutos(manager) -> None:
    agora = datetime.now(UTC)
    async with manager._get_async_db() as db:
        for minutos, latencia in ((84, 9000), (10, 100)):
            await db.execute(
                "INSERT INTO key_usage_metrics (provider, key_hash, status, latency_ms, timestamp) VALUES (?,?,?,?,?)",
                ("g", "h", "success", latencia, (agora - timedelta(minutes=minutos)).isoformat()),
            )
        await db.commit()
    metricas = await manager.get_realtime_metrics()
    assert metricas["avg_latency_ms_1h"] == 100


# --- BK-09 --------------------------------------------------------------------


@pytest.mark.asyncio
async def test_bk09_metrics_nao_publica_serie_sem_medicao(monkeypatch) -> None:
    monkeypatch.setattr(handlers, "psutil", None)
    app = web.Application()
    req = MagicMock()
    req.app = app
    resposta = await handlers.handle_prometheus_metrics(req)
    corpo = resposta.text or ""
    for serie in ("nexus_hardware_vram_used_bytes", "nexus_circuit_breaker_state", "nexus_hardware_cpu_load_percent"):
        assert serie not in corpo


# --- BK-10 --------------------------------------------------------------------


@pytest.mark.asyncio
async def test_bk10_conexao_de_trabalho_tem_busy_timeout_e_durabilidade_padrao(manager) -> None:
    """busy_timeout vale na conexao que faz o trabalho; synchronous segue FULL.

    NORMAL foi medido em 2026-09-16 e ganhou 1,7% -- nao paga a durabilidade.
    Quem quiser trocar precisa de medicao nova, e este teste falha para forcar isso.
    """
    async with manager._get_async_db() as db:
        async with db.execute("PRAGMA busy_timeout") as cursor:
            assert (await cursor.fetchone())[0] == 5000
        async with db.execute("PRAGMA synchronous") as cursor:
            assert (await cursor.fetchone())[0] == 2  # FULL


def test_bk10_init_nao_declara_pragma_inerte() -> None:
    fonte = Path(QueueManager.__module__.replace(".", "/") + ".py")
    texto = (Path(__file__).resolve().parent.parent / fonte).read_text(encoding="utf-8")
    for inerte in ("cache_size=-262144", "mmap_size=2147483648"):
        assert inerte not in texto


# --- BK-11 --------------------------------------------------------------------


@pytest.mark.asyncio
async def test_bk11_reserva_preserva_hora_de_criacao(manager) -> None:
    criacao = "2026-01-01T00:00:00+00:00"
    await manager.add_task(Task(id="T", description="x", agent="@chico", timestamp=criacao))
    assert await manager.claim_task("T", "w:1")
    assert (await manager.get_task("T")).timestamp == criacao


@pytest.mark.asyncio
async def test_bk11_tarefa_reservada_ha_pouco_nao_e_recuperada_como_travada(manager) -> None:
    await manager.add_task(Task(id="T", description="x", agent="@chico", timestamp="2026-01-01T00:00:00+00:00"))
    assert await manager.claim_task("T", "w:1")
    assert await manager.recover_stalled_tasks(max_running_minutes=15) == 0


@pytest.mark.parametrize(
    ("entrada", "esperado"),
    [
        ("2026-09-16T23:40:00-03:00", "2026-09-17T02:40:00+00:00"),
        ("2026-09-16T10:00:00Z", "2026-09-16T10:00:00+00:00"),
        ("2026-09-16T10:00:00", "2026-09-16T10:00:00+00:00"),
    ],
)
def test_bk11_timestamp_normalizado_para_utc(entrada: str, esperado: str) -> None:
    assert handlers.normalizar_timestamp_iso(entrada) == esperado


@pytest.mark.parametrize("entrada", ["9999x", "16/09/2026", ""])
def test_bk11_timestamp_invalido_recusado(entrada: str) -> None:
    with pytest.raises(ValueError, match="isoformat"):
        handlers.normalizar_timestamp_iso(entrada)


@pytest.mark.asyncio
async def test_bk11_status_invalido_nao_chega_ao_banco(manager) -> None:
    await manager.add_task(_task("T"))
    with pytest.raises(ValueError, match="Status de tarefa invalido"):
        await manager.update_task_status("T", "quebrado")
    assert (await manager.get_tasks())[0].status == "pending"


# --- BK-12 --------------------------------------------------------------------


@pytest.mark.parametrize("cmd", ["echo ok\nRemove-Item -Recurse x", "echo ok\r\ndel x", "Write-Output (Get-Item .)"])
def test_bk12_partial_recusa_encadeamento_por_quebra_de_linha(cmd: str) -> None:
    with pytest.raises(PermissionError):
        autonomy._validate_command(cmd, "partial", "@maverick")


def test_bk12_denylist_resiste_a_espaco_repetido() -> None:
    with pytest.raises(PermissionError):
        autonomy._validate_command("rm  -rf   /", "full", "@chico")


# --- BK-14 / BK-21 ------------------------------------------------------------


@pytest.mark.asyncio
async def test_bk14_call_gemini_sem_chave_nao_usa_credencial_de_servico(monkeypatch) -> None:
    from engine import llm_api

    monkeypatch.setenv("API_SECRET_TOKEN", "credencial-de-servico")
    sessao = MagicMock()
    with pytest.raises(ValueError, match="api_key"):
        await llm_api.call_gemini(sessao, "gemini-3.5-flash", "sys", "user")
    sessao.post.assert_not_called()


@pytest.mark.asyncio
async def test_bk21_chave_gemini_vai_no_header_e_nunca_na_url() -> None:
    from llm import gemini

    capturado: dict = {}

    async def primaria(_session, url, _data, headers, _kwargs):
        capturado["url"] = url
        capturado["headers"] = headers
        return "ok", {}

    limiter = MagicMock(tokens=10)
    limiter.consume = AsyncMock()
    with (
        patch.object(gemini, "_execute_primary_request", new=primaria),
        patch.object(gemini, "get_rate_limiter_for_model", return_value=limiter),
    ):
        await gemini.call_gemini(MagicMock(), "gemini-3.5-flash", "sys", "user", "AIzaCHAVE")

    assert "AIzaCHAVE" not in capturado["url"]
    assert "key=" not in capturado["url"]
    assert capturado["headers"]["x-goog-api-key"] == "AIzaCHAVE"


# --- BK-18 --------------------------------------------------------------------


@pytest.mark.parametrize(
    "dados", [{"query": "x", "top_k": 0}, {"query": "x", "top_k": 51}, {"query": ""}, {"query": "a" * 4001}]
)
def test_bk18_rag_query_com_limites(dados: dict) -> None:
    with pytest.raises(ValidationError):
        RAGQuery.model_validate(dados)


def test_bk18_cache_sem_persistencia_nao_escreve_em_disco(tmp_path) -> None:
    from utils.cache import SOTACache

    cache = SOTACache(cache_dir=str(tmp_path / "cache"))
    cache.set("rag_query:x:5", "resposta", persist=False)
    assert cache.get("rag_query:x:5") == "resposta"
    assert not (tmp_path / "cache").exists()


# --- BK-19 --------------------------------------------------------------------


@pytest.mark.parametrize(
    "relativo",
    [
        ".env",
        ".env.local",
        ".git/config",
        "chaves/servidor.pem",
        ".secrets/token",
        "x/.ssh/id_ed25519",
        ".npmrc",
        ".npmrc.",
    ],
)
def test_bk19_arquivo_sensivel_nao_e_servido(relativo: str) -> None:
    raiz = Path(handlers.__file__).resolve().parent.parent.parent
    assert handlers._is_file_access_allowed((raiz / relativo).resolve()) is False


def test_bk19_modelo_de_ambiente_continua_legivel() -> None:
    raiz = Path(handlers.__file__).resolve().parent.parent.parent
    assert handlers._is_file_access_allowed((raiz / ".env.example").resolve()) is True


# --- BK-20 --------------------------------------------------------------------


def test_bk20_headers_de_seguranca_sao_o_middleware_mais_externo() -> None:
    app = create_app(MagicMock(spec=QueueManager))
    assert app.middlewares[0] is middleware.security_headers_middleware


@pytest.mark.asyncio
async def test_bk20_recusa_do_rate_limit_sai_com_nosniff(monkeypatch) -> None:
    monkeypatch.setattr(middleware, "MAX_REQUESTS_PER_WINDOW", 0)
    monkeypatch.setattr(middleware, "_ip_blocks", {})
    req = MagicMock(remote="198.51.100.7", headers={})

    async def rate_limit(r):
        return await middleware.rate_limit_middleware(r, AsyncMock())

    resposta = await middleware.security_headers_middleware(req, rate_limit)

    assert resposta.status == 429
    assert resposta.headers["X-Content-Type-Options"] == "nosniff"
    assert resposta.headers["X-Frame-Options"] == "DENY"
