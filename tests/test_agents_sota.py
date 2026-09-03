"""
Testes SOTA para a governanca de autonomia (autonomy.py) do Nexus Orchestrator.
Focado em garantir 100% de cobertura nos branches de seguranca e isolamento.
"""
# pylint: disable=protected-access

import logging
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

import agents.autonomy as autonomy
import agents.context_builder as cb
import agents.execution as execution
import core.config
from core.schemas import Task
from database.queue_manager import QueueManager

logger = logging.getLogger(__name__)


@pytest.fixture(autouse=True)
def patch_valid_agents_sota(monkeypatch: pytest.MonkeyPatch) -> None:
    """Garante allowlist SOTA de agentes para testes."""
    monkeypatch.setattr(
        core.config, "VALID_AGENTS", ["@maverick", "@chico", "@gemma4", "@dispatcher", "@pesquisador", "@securitychief"]
    )


@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_autonomy_mode_normalizes_legacy() -> None:
    """Valida a normalizacao de modos de autonomia legados e invalidos."""
    mock_manager = MagicMock(spec=QueueManager)

    # Caso 1: Modo valido no banco
    mock_manager.get_system_state = AsyncMock(return_value="partial")
    # Limpa cache de TTL para forcar leitura
    autonomy._AUTONOMY_CACHE["timestamp"] = 0.0
    mode = await autonomy.get_autonomy_mode(mock_manager)
    assert mode == "partial"

    # Caso 2: Modo vazio no banco -> tenta ler json legado
    mock_manager.get_system_state = AsyncMock(return_value=None)
    mock_manager.set_system_state = AsyncMock()
    autonomy._AUTONOMY_CACHE["timestamp"] = 0.0

    with patch("agents.autonomy._read_legacy_autonomy_config", return_value="off"):
        mode = await autonomy.get_autonomy_mode(mock_manager)
        # "off" deve ser normalizado para "stop"
        assert mode == "stop"

    # Caso 3: Modo invalido -> reverte para stop
    mock_manager.get_system_state = AsyncMock(return_value="modo_hack_invalido")
    autonomy._AUTONOMY_CACHE["timestamp"] = 0.0
    mode = await autonomy.get_autonomy_mode(mock_manager)
    assert mode == "stop"


@pytest.mark.unit
def test_resolve_effective_mode() -> None:
    """Valida resolucao de tier de autonomia baseado em regras de negocio (VITOI 3.2)."""
    # Se global for stop ou default, mantem independente de ser Chico ou gemma4
    assert autonomy._resolve_effective_mode("stop", "@chico", ["@chico"], True) == "stop"
    assert autonomy._resolve_effective_mode("default", "@chico", ["@chico"], True) == "default"

    # Chico/gemma4 com privilegio de escrita (Tier 1 Bypass)
    assert autonomy._resolve_effective_mode("full", "@chico", ["@chico"], True) == "full"

    # Maverick especial
    assert autonomy._resolve_effective_mode("full", "@maverick", ["@chico"], True) == "full_restricted"

    # Agente nao-god com sandbox_default=True
    assert autonomy._resolve_effective_mode("full", "@implementor", ["@chico"], True) == "sandbox"
    # Agente nao-god com sandbox_default=False
    assert autonomy._resolve_effective_mode("full", "@implementor", ["@chico"], False) == "partial"


@pytest.mark.unit
def test_validate_command_forbidden_tokens() -> None:
    """Valida rejeicao de comandos destrutivos."""
    with pytest.raises(PermissionError, match="destrutivo"):
        autonomy._validate_command("rm -rf /", "full", "@chico")

    with pytest.raises(PermissionError, match="destrutivo"):
        autonomy._validate_command("del /s c:\\", "full", "@chico")


@pytest.mark.unit
def test_validate_command_chaining_blocking() -> None:
    """Valida bloqueio de encadeamento de comandos para agentes comuns."""
    # Permitido em full / full_restricted
    assert autonomy._validate_command("echo 1 && echo 2", "full", "@chico") is True

    # Bloqueado em partial ou default
    with pytest.raises(PermissionError, match="Encadeamento"):
        autonomy._validate_command("echo 1 && echo 2", "partial", "@implementor")

    with pytest.raises(PermissionError, match="Encadeamento"):
        autonomy._validate_command("echo 1; echo 2", "partial", "@implementor")


@pytest.mark.unit
def test_validate_command_state_changing_in_partial() -> None:
    """Valida interceptacao de comandos mutadores de estado no modo partial."""
    # Retorna False para interceptar e nao rodar nativamente
    assert autonomy._validate_command("npm install debug", "partial", "@implementor") is False
    assert autonomy._validate_command("pip install requests", "partial", "@implementor") is False
    # Outro comando comum eh permitido
    assert autonomy._validate_command("echo hello", "partial", "@implementor") is True


@pytest.mark.asyncio
@pytest.mark.unit
async def test_forge_files_sandbox_mode() -> None:
    """Valida que o modo sandbox nao materializa arquivos localmente."""
    res = await autonomy._forge_files("Path: `foo.txt````hello```", "sandbox", "@implementor")
    assert res == []


@pytest.mark.asyncio
@pytest.mark.unit
async def test_forge_files_validation_checks(tmp_path: Path) -> None:
    """Valida bloqueios contra path traversal, caracteres suspeitos e caminhos protegidos."""
    # Caminho com caracteres suspeitos
    res = await autonomy._forge_files("Path: `foo|bar.txt````hello```", "partial", "@implementor")
    assert res == []

    # Path traversal explicito (..)
    res = await autonomy._forge_files("Path: `../../foo.txt````hello```", "partial", "@implementor")
    assert res == []

    # Escrita fora da raiz
    with patch("agents.autonomy.Path.parent") as mock_parent:
        # Forca absolute/parent de forma que target nao fique abaixo da raiz
        mock_parent.parent.absolute.return_value = tmp_path / "root"
        res = await autonomy._forge_files(
            "Path: `C:\\windows\\system32\\cmd.exe````hello```", "partial", "@implementor"
        )
        assert res == []

    # Caminho protegido do Kernel - Rejeicao para nao-god
    protected_file = str(tmp_path / "task_executor.py")
    with patch("agents.autonomy.__file__", str(tmp_path / "agents" / "autonomy.py")):
        # Mock raiz do projeto
        base_path = tmp_path
        with patch("agents.autonomy.Path.parent") as mock_parent:
            mock_parent.parent.absolute.return_value = base_path

            # Agente nao privilegiado nao escreve em kernel path
            res = await autonomy._forge_files(
                f"Path: `{protected_file}`\n```python\nprint(1)\n```", "partial", "@implementor"
            )
            assert res == []

            # Agente privilegiado em Tier 1 (full) re-escreve kernel path
            with patch("aiofiles.open", MagicMock()):
                res = await autonomy._forge_files(
                    f"Path: `{protected_file}`\n```python\nprint(1)\n```", "full", "@chico"
                )
                assert len(res) == 1
                assert res[0] == "task_executor.py"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_run_native_command_success_and_failures() -> None:
    """Valida execucao de comando nativo e tratamento de erros de subprocesso."""
    mock_process = AsyncMock()
    mock_process.communicate.return_value = (b"stdout_msg", b"error_details")
    mock_process.wait.return_value = 0
    # FIX: Forcando assinaturas sincronas na classe do processo mockado
    mock_process.kill = MagicMock()
    mock_process.terminate = MagicMock()

    # Caso 1: Sucesso (returncode = 0)
    mock_process.returncode = 0
    with patch("asyncio.create_subprocess_exec", return_value=mock_process) as mock_exec:
        await autonomy._run_native_command("echo hello")
        assert mock_exec.called

    # Caso 2: Falha (returncode != 0)
    mock_process.returncode = 1
    with patch("asyncio.create_subprocess_exec", return_value=mock_process):
        with pytest.raises(RuntimeError, match="falhou"):
            await autonomy._run_native_command("echo hello")

    # Caso 3: Timeout
    async def _wait_for_timeout_side_effect(coro, *_args, **_kwargs):
        if hasattr(coro, "close"):
            coro.close()
        raise TimeoutError()

    with patch("asyncio.create_subprocess_exec", return_value=mock_process):
        with patch("asyncio.wait_for", new=_wait_for_timeout_side_effect):
            with pytest.raises(RuntimeError, match="excedeu o tempo limite"):
                await autonomy._run_native_command("echo hello")


@pytest.mark.asyncio
@pytest.mark.unit
async def test_run_sandboxed_command() -> None:
    """Valida execucao de comando em sandbox Docker contido."""

    class _FakeProcess:
        returncode = 0

        async def communicate(self) -> tuple[bytes, bytes]:
            return b"", b""

        def kill(self) -> None:
            pass

        def terminate(self) -> None:
            pass

    exec_calls: list[tuple] = []

    async def _fake_exec(*args, **_kwargs):
        exec_calls.append(args)
        return _FakeProcess()

    # Python 3.14: process.communicate() cria um coroutine antes de ser passado para wait_for.
    # Como wait_for e mockado, esse coroutine fica pendente -> GC emite RuntimeWarning.
    # O side_effect abaixo fecha o coroutine explicitamente antes de retornar.
    async def _wait_for_side_effect(coro, *_args, **_kwargs):
        if hasattr(coro, "close"):
            coro.close()
        return b"", b""

    with (
        patch("agents.autonomy.asyncio.create_subprocess_exec", new=_fake_exec),
        patch("agents.autonomy.asyncio.wait_for", new=_wait_for_side_effect),
    ):
        await autonomy._run_sandboxed_command("echo hello", "@maverick")
        assert len(exec_calls) == 1
        # Primeira string deve ser docker
        assert exec_calls[0][0] == "docker"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_apply_god_mode_orchestration() -> None:
    """Valida o orquestrador VITOI apply_god_mode sob diferentes tiers."""
    mock_manager = MagicMock(spec=QueueManager)
    mock_manager.get_tasks = AsyncMock(return_value=[])
    mock_manager.get_system_state = AsyncMock(return_value=None)

    # Config do cache de alavancas
    with patch("agents.autonomy._read_autonomy_levers", return_value=(["@chico"], True)):
        # W0 (Stop) -> Nenhuma mutacao
        with patch("agents.autonomy.get_autonomy_mode", return_value="stop"):
            res = await autonomy.apply_god_mode("Path: `x.txt````hello```", mock_manager, "@chico")
            assert res == []

        # W1 (Default) -> Apenas forge files, sem terminal
        with patch("agents.autonomy.get_autonomy_mode", return_value="default"):
            with patch("agents.autonomy._forge_files", return_value=["x.txt"]) as mock_forge:

                class _FakeProcess2:
                    returncode = 0

                    async def communicate(self) -> tuple[bytes, bytes]:
                        return b"stdout", b"stderr"

                    def kill(self) -> None:
                        pass

                    def terminate(self) -> None:
                        pass

                exec_cmd_calls: list = []

                async def _fake_execute_commands(*args, **_kwargs):
                    exec_cmd_calls.append(args)

                async def _fake_subprocess_exec2(*_args, **_kwargs):
                    return _FakeProcess2()

                with (
                    patch("agents.autonomy._execute_commands", new=_fake_execute_commands),
                    patch("agents.autonomy.asyncio.create_subprocess_exec", new=_fake_subprocess_exec2),
                ):
                    res = await autonomy.apply_god_mode("Path: `x.txt````hello```", mock_manager, "@chico")
                    assert res == ["x.txt"]
                    assert mock_forge.called
                    assert len(exec_cmd_calls) == 0  # W1: sem execucao de terminal


# ==============================================================================
# Testes do modulo Context Builder
# ==============================================================================
@pytest.mark.asyncio
@pytest.mark.unit
async def test_extract_task_file_mentions() -> None:
    """Valida extracao regex de arquivos e pastas markdown na descricao."""
    desc = "Analise o arquivo docs/tasks/step-1.md e a pasta docs/tasks/setup-plan"

    # Mock do filesystem para a pasta
    mock_exists = MagicMock(return_value=True)
    mock_isdir = MagicMock(return_value=True)
    mock_glob = MagicMock(return_value=[Path("docs/tasks/setup-plan/task-2.md")])

    with (
        patch("agents.context_builder.Path.exists", mock_exists),
        patch("agents.context_builder.Path.is_dir", mock_isdir),
        patch("agents.context_builder.Path.glob", mock_glob),
    ):
        mentions = await cb._extract_task_file_mentions(desc)
        assert Path("docs/tasks/step-1.md") in mentions
        assert Path("docs/tasks/setup-plan/task-2.md") in mentions


@pytest.mark.asyncio
@pytest.mark.unit
async def test_resolve_allowed_task_doc_path(tmp_path: Path) -> None:
    """Valida restricao de caminhos de arquivos markdown de tarefas."""
    # Caso 1: fora dos docs permitidos
    bad_file = tmp_path / "unsafe.md"
    bad_file.touch()
    assert await cb._resolve_allowed_task_doc_path(bad_file) is None

    # Caso 2: dentro de ALLOWED_TASK_DOC_ROOTS
    with patch("agents.context_builder.ALLOWED_TASK_DOC_ROOTS", [tmp_path]):
        ok_file = tmp_path / "task-1.md"
        ok_file.touch()
        res = await cb._resolve_allowed_task_doc_path(ok_file)
        assert res is not None
        assert res.name == "task-1.md"


@pytest.mark.unit
def test_needs_web_search() -> None:
    """Valida heuristica de acionamento de busca web por persona e score."""
    # Pesquisador sempre precisa de busca web
    assert cb._needs_web_search("@pesquisador", "qualquer coisa") is True

    # Chico com termos de orquestracao
    with patch("core.runtime._heuristic_terms", return_value={"orchestra": 10, "dag": 10}):
        assert cb._needs_web_search("@chico", "run orchestration and build a dag") is True
        assert cb._needs_web_search("@chico", "make coffee") is False


@pytest.mark.asyncio
@pytest.mark.unit
async def test_execute_web_search_cache_hit_and_miss() -> None:
    """Valida fluxo de execucao de busca externa com cache e rate limiting."""
    mock_manager = MagicMock(spec=QueueManager)
    mock_manager.record_key_usage_metric = AsyncMock()

    task = Task(
        id="T_SEARCH", description="poker strategies in 2026", agent="@pesquisador", timestamp="2026-05-26T17:27:00Z"
    )

    # Mock da sessao HTTP para evitar criar conexao real (e DeprecationWarning do aiohttp)
    mock_http_session = AsyncMock()

    # Mock do cache e chaves
    with (
        patch("agents.context_builder.TAVILY_KEYS", ["key1"]),
        patch("agents.context_builder.PERPLEXITY_KEYS", ["key2"]),
        patch("agents.context_builder._needs_web_search", return_value=True),
        patch("agents.context_builder.get_global_http_session", return_value=mock_http_session),
    ):
        # Caso 1: Cache Miss -> Chama API -> Sucesso
        with (
            patch("agents.context_builder.call_tavily_search", return_value="tavily result") as mock_tavily,
            patch("agents.context_builder._rank_keys_by_health", return_value=["key1"]),
        ):
            res_text, latency = await cb._execute_web_search(task, mock_manager)
            assert res_text == "tavily result"
            assert latency >= 0  # 0ms valido: mock retorna instantaneamente sem I/O real
            assert mock_tavily.called

            # Caso 2: Cache Hit -> Nao chama API de novo
            mock_tavily.reset_mock()
            res_text2, _ = await cb._execute_web_search(task, mock_manager)
            assert res_text2 == "tavily result"
            assert not mock_tavily.called


@pytest.mark.asyncio
@pytest.mark.unit
async def test_apply_context_compression_decision() -> None:
    """Valida gatilho e execucao de compressao de contexto."""
    mock_manager = MagicMock(spec=QueueManager)

    task = Task(id="T1", description="desc", agent="@maverick", timestamp="2026-05-26")

    # Caso 1: Contexto curto (< 6000 e < 4000) -> Sem compressao
    ctx, mem, latency = await cb._apply_context_compression("short project context", "short memory", task, mock_manager)
    assert ctx == "short project context"
    assert mem == "short memory"
    assert latency == 0

    # Caso 2: Contexto longo -> Comprime
    long_ctx = "A" * 7000
    long_mem = "B" * 5000
    with patch("agents.context_builder._compress_context", return_value="compressed result") as mock_compress:
        ctx, mem, latency = await cb._apply_context_compression(long_ctx, long_mem, task, mock_manager)
        assert "compressed result" in ctx
        assert "compressed result" in mem
        assert mock_compress.call_count == 2


@pytest.mark.asyncio
@pytest.mark.unit
async def test_assemble_prompt_structure() -> None:
    """Valida a composicao do system prompt e user prompt."""
    task = Task(id="T_PROMPT", description="test description", agent="@chico", timestamp="2026-05-26")

    with patch("agents.context_builder.get_agent_system_prompt", return_value="system directive"):
        sys_p, user_p = await cb._assemble_prompt(
            task,
            "project context content",
            "web results content",
            "retrieved memory content",
            "agent memory content",
            "task docs content",
            "chico",
            "default",
        )
        assert "system directive" in sys_p
        assert "project_context" in user_p
        assert "web_search_results" in user_p
        assert "retrieved_memory" in user_p
        assert "agent_memory" in user_p
        assert "task_documents" in user_p
        assert "HOMEOSTASE" in user_p  # Indica o modo default


# ==============================================================================
# Testes do modulo Execution
# ==============================================================================
@pytest.mark.asyncio
@pytest.mark.unit
async def test_create_system_task() -> None:
    """Valida criacao resiliente de tarefas de sistema."""
    mock_manager = MagicMock(spec=QueueManager)

    # Caso 1: Nao existe a tarefa -> Cria com sucesso
    mock_manager.get_task = AsyncMock(return_value=None)
    mock_manager.add_task = AsyncMock()

    created = await execution._create_system_task(mock_manager, "SYS_TASK_1", "description", "@chico")
    assert created is True
    assert mock_manager.add_task.called

    # Caso 2: Ja existe a tarefa -> Nao faz nada
    mock_manager.get_task = AsyncMock(return_value=MagicMock(spec=Task))
    mock_manager.add_task.reset_mock()
    created = await execution._create_system_task(mock_manager, "SYS_TASK_1", "description", "@chico")
    assert created is False
    assert not mock_manager.add_task.called


@pytest.mark.unit
def test_escalate_security_cognition() -> None:
    """Valida escalonamento de modelo cognitivo de seguranca para gemini-3.8-flash."""
    task = Task(
        id="T_SEC",
        description="security audit",
        agent="@securitychief",
        timestamp="2026-05-26",
        metadata={"priority": "critical"},
    )
    execution._escalate_security_cognition(task)
    assert task.metadata.get("model_override") == "gemini-3.8-flash"  # pylint: disable=no-member


@pytest.mark.asyncio
@pytest.mark.unit
async def test_process_agent_task_flow() -> None:
    """Valida fluxo de execucao de tarefa de agente com cache hit e budget ok."""
    mock_manager = MagicMock(spec=QueueManager)
    mock_manager.get_system_state = AsyncMock(return_value=None)

    task = Task(id="T_FLOW", description="description", agent="@maverick", timestamp="2026-05-26", metadata={})

    # Caso 1: Cache hit
    mock_manager.get_first_cached_response = AsyncMock(return_value="cached response")
    with (
        patch("agents.context_builder._read_agent_and_project_contexts", return_value=("mem", "proj")),
        patch("agents.context_builder._inject_task_docs", return_value="docs"),
        patch("agents.context_builder._execute_web_search", return_value=("web", 100)),
        patch("agents.context_builder._query_collective_memory", return_value=("rag", 50)),
        patch("agents.context_builder._apply_context_compression", return_value=("proj", "mem", 0)),
        patch("agents.context_builder._assemble_prompt", return_value=("sys", "user")),
        patch("agents.execution._prepare_routing_pipeline", return_value=(["model"], None, None)),
    ):
        res = await execution.process_agent_task(task, mock_manager, {})
        assert res == "cached response"

        # Caso 2: Cache miss, budget ok -> chama API LLM
        mock_manager.get_first_cached_response = AsyncMock(return_value=None)
        mock_manager.check_and_increment_usage = AsyncMock(return_value=True)

        with patch("agents.execution.call_llm_api", return_value="llm response") as mock_call_llm:
            res = await execution.process_agent_task(task, mock_manager, {})
            assert res == "llm response"
            assert mock_call_llm.called


@pytest.mark.asyncio
@pytest.mark.unit
async def test_process_dispatcher_output_retry_and_fallback() -> None:
    """Valida processamento de saida do dispatcher, incluindo retry e fallback."""
    mock_manager = MagicMock(spec=QueueManager)
    task = Task(id="T_DISP", description="description", agent="@dispatcher", timestamp="2026-05-26", metadata={})

    # Caso 1: Sucesso no parse da resposta JSON estrita
    response_text = '[{"description": "subtask 1", "agent": "@chico", "depends_on": []}]'
    with patch("agents.execution._enqueue_subtasks") as mock_enqueue:
        await execution._process_dispatcher_output(task, mock_manager, response_text)
        assert mock_enqueue.called

    # Caso 2: Resposta mal formatada -> ativa retry de schema
    bad_response = "texto mal formatado sem json"
    mock_subtasks = [MagicMock()]
    with (
        patch("agents.execution._retry_dispatcher_schema_once", return_value=mock_subtasks) as mock_retry,
        patch("agents.execution._enqueue_subtasks") as mock_enqueue,
    ):
        await execution._process_dispatcher_output(task, mock_manager, bad_response)
        assert mock_retry.called
        assert mock_enqueue.called


@pytest.mark.asyncio
@pytest.mark.unit
async def test_execute_task_workflow_local_delegation() -> None:
    """Valida redirecionamento de tarefas para motor local (Ollama/llama.cpp)."""
    mock_manager = MagicMock(spec=QueueManager)
    mock_manager.get_system_state = AsyncMock(return_value=None)

    task_gemma = Task(id="T_GEMMA", description="desc", agent="@gemma4", timestamp="2026-05-26")

    with patch("engine.cognitive.process_agent_task", return_value=AsyncMock()) as mock_local:
        await execution.execute_task_workflow(task_gemma, mock_manager)
        assert mock_local.called


@pytest.mark.asyncio
@pytest.mark.unit
async def test_handle_task_failures_and_autofix() -> None:
    """Valida comportamento sob excecoes, gerando autofix e logs."""
    mock_manager = MagicMock(spec=QueueManager)
    mock_manager.get_system_state = AsyncMock(return_value=None)
    mock_manager.update_task_status = AsyncMock()
    mock_manager.update_task_metadata = AsyncMock()
    mock_manager.db_path = "test.db"

    task = Task(id="T_FAIL", description="desc", agent="@maverick", timestamp="2026-05-26", metadata={})

    # Executa com erro
    err = ValueError("mock exception detail")
    with (
        patch("agents.execution.process_agent_task", side_effect=err),
        patch("agents.execution._create_system_task") as mock_sys_task,
    ):
        await execution.execute_task_workflow(task, mock_manager)
        # Deve ter atualizado para failed
        mock_manager.update_task_status.assert_any_call("T_FAIL", "failed")
        # Deve ter criado a tarefa AUTOFIX-T_FAIL
        assert mock_sys_task.called
