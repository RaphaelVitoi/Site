"""
Guarda do contexto da aplicacao aiohttp: AppKey e string NAO sao a mesma chave.

`create_app` popula o contexto com AppKeys tipadas (`api/v1/keys.py`). Tres
handlers liam o mesmo contexto por string literal, e `web.AppKey("manager", ...)`
nao e igual a `"manager"` -- a leitura devolvia `None` em toda requisicao.

As tres consequencias medidas em 2026-09-09 eram distintas, e a terceira e a
pior porque nao aparece:

| handler | leitura | efeito |
| :--- | :--- | :--- |
| `handle_get_tournaments` | `app.get("lab_manager")` | HTTP 500 "LabManager nao inicializado" -- e ele ESTAVA |
| `handle_frontend_logs` | `app.get("audit_engine")` | HTTP 500; toda telemetria do frontend recusada |
| `handle_prometheus_metrics` | `app.get("manager")` | `if manager and ...` pula em silencio; `/metrics` publica zero |

Estes testes exercitam a ROTA REGISTRADA, e nao a tabela de rotas: verificar
que a rota existe so trocaria 404 por 500, que era exatamente o estado.
"""

import contextlib
import shutil
from pathlib import Path
from uuid import uuid4

import pytest

from api.v1 import middleware
from database.queue_manager import QueueManager

REPO_ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture
def dir_temporario():
    """Diretorio isolado dentro da raiz para nao acionar os fallbacks de seguranca."""
    caminho = REPO_ROOT / f"tmp_test_{uuid4().hex}"
    caminho.mkdir(parents=True, exist_ok=True)
    yield caminho
    with contextlib.suppress(Exception):
        shutil.rmtree(caminho, ignore_errors=True)


def _cliente(dir_temporario: Path, monkeypatch, nome_db: str):
    """TestClient sobre create_app() no modo local sem token (loopback confiavel)."""
    from aiohttp.test_utils import TestClient, TestServer

    from api.v1.server import create_app

    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", None)
    monkeypatch.delenv("SUPABASE_JWT_SECRET", raising=False)

    manager = QueueManager(queue_path=str(dir_temporario / nome_db))
    return TestClient(TestServer(create_app(manager)))


@pytest.mark.asyncio
@pytest.mark.unit
async def test_appkey_e_string_nao_sao_a_mesma_chave() -> None:
    """A premissa do guard, medida e nao suposta: a colisao que se esperava nao existe."""
    from aiohttp import web

    chave = web.AppKey("manager", QueueManager)
    app = web.Application()
    app[chave] = "instancia"

    assert app.get("manager") is None
    assert app.get(chave) == "instancia"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_rota_de_torneios_alcanca_o_lab_manager(dir_temporario: Path, monkeypatch) -> None:
    """`/lab/tournaments` nao pode responder 'LabManager nao inicializado' com ele inicializado."""
    async with _cliente(dir_temporario, monkeypatch, "torneios.db") as cliente:
        resposta = await cliente.get("/lab/tournaments")
        corpo = await resposta.json()

        assert resposta.status != 500, f"O DAO existe em create_app; 500 aqui e leitura errada: {corpo}"
        assert "nao inicializado" not in str(corpo)

        # Alcancado o DAO, aparece o achado B08: `Tournament` nao existe no
        # schema.prisma nem no banco. A resposta certa e 503 com diagnostico,
        # nunca 200/SUCCESS/[] -- que seria indistinguivel de "zero torneios".
        assert resposta.status == 503, f"persistencia ausente deve falhar alto, veio {resposta.status}: {corpo}"
        assert corpo.get("status") == "ERROR"
        assert "indisponivel" in corpo.get("error", "")


@pytest.mark.asyncio
@pytest.mark.unit
async def test_logs_do_frontend_alcancam_o_audit_engine(dir_temporario: Path, monkeypatch) -> None:
    """`/api/logs/frontend` recusava TODA telemetria do frontend com 500."""
    async with _cliente(dir_temporario, monkeypatch, "logs.db") as cliente:
        resposta = await cliente.post("/api/logs/frontend", json={"events": []})
        corpo = await resposta.json()

        assert resposta.status == 200, f"AuditEngine existe em create_app: {corpo}"
        assert corpo.get("status") == "SUCCESS"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_metrics_publica_o_banco_e_nao_zero_silencioso(dir_temporario: Path, monkeypatch) -> None:
    """A falha silenciosa: `if manager and ...` publicava zero sem nenhum sinal.

    O discriminante nao pode ser o VALOR (zero tarefas e um estado legitimo),
    entao o teste enfileira uma tarefa real e exige que ela apareca.
    """
    from datetime import UTC, datetime

    from core.schemas import Task

    caminho_db = dir_temporario / "metricas.db"
    manager = QueueManager(queue_path=str(caminho_db))
    await manager.add_task(
        Task(
            id=f"t_{uuid4().hex[:8]}",
            agent="@chico",
            description="tarefa de isca para a metrica de fila",
            status="pending",
            timestamp=datetime.now(UTC).isoformat(),
        )
    )

    from aiohttp.test_utils import TestClient, TestServer

    from api.v1.server import create_app

    monkeypatch.setattr(middleware, "API_SECRET_TOKEN", "")
    monkeypatch.setattr(middleware, "SUPABASE_JWT_SECRET", None)
    monkeypatch.delenv("SUPABASE_JWT_SECRET", raising=False)

    async with TestClient(TestServer(create_app(manager))) as cliente:
        resposta = await cliente.get("/metrics")
        texto = await resposta.text()

        assert resposta.status == 200
        assert 'nexus_tasks_total{status="pending"} 0' not in texto, (
            "A tarefa enfileirada nao chegou a /metrics: o manager foi lido por string e devolveu None."
        )
