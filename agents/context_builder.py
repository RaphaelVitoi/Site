# pylint: disable=line-too-long, broad-exception-caught, protected-access, import-outside-toplevel
"""
Context Builder -- Modulo especializado na construcao e compressao de contexto para agentes SOTA.
"""

import asyncio
import hashlib
import logging
import re
import time
from pathlib import Path

import core.runtime as te
from agents.prompts import get_agent_system_prompt
from core.schemas import Task
from database.queue_manager import QueueManager
from llm.budget import (
    _WEB_SEARCH_CACHE_MAX,
    COMPRESSION_CIRCUIT_BREAKER,
    PERPLEXITY_KEYS,
    TAVILY_KEYS,
    WEB_SEARCH_CACHE_TTL,
    _block_key,
    _is_key_blocked,
    _key_fingerprint,
    _key_identifier,
    _rank_keys_by_health,
    web_search_cache,
)
from llm.orchestrator import _compress_context
from llm.search import call_perplexity_search, call_tavily_search
from llm.session import get_global_http_session
from utils.cache import _read_file_with_cache
from utils.heuristics import _calculate_heuristic_score
from utils.text import enforce_pure_ascii

logger = logging.getLogger(__name__)

WORKSPACE_ROOT = Path.cwd().resolve()
ALLOWED_TASK_DOC_ROOTS = (
    WORKSPACE_ROOT / "docs",
    WORKSPACE_ROOT / ".claude",
)

# Constantes de Agentes (Sincronizadas com execution.py)
AGENT_MAVERICK = "@maverick"
AGENT_CHICO = "@chico"
AGENT_ARCHITECT = "@architect"
AGENT_PLANNER = "@planner"
AGENT_DISPATCHER = "@dispatcher"
AGENT_PESQUISADOR = "@pesquisador"
AGENT_BIBLIOTECARIO = "@bibliotecario"
AGENT_VALIDADOR = "@validador"
AGENT_VERIFIER = "@verifier"
AGENT_AUDITOR = "@auditor"


async def _extract_task_file_mentions(description: str) -> list[Path]:
    def sync_extract():
        md_mentions = re.findall(r"[\w\./\\-]+\.md", description, re.IGNORECASE)
        folder_mentions = re.findall(r"docs[\\/]tasks[\\/][\w-]+", description, re.IGNORECASE)

        paths_to_check = [Path(p) for p in md_mentions]
        for folder in folder_mentions:
            folder_path = Path(folder)
            if folder_path.exists() and folder_path.is_dir():
                paths_to_check.extend(list(folder_path.glob("*.md")))
        return paths_to_check

    return await asyncio.to_thread(sync_extract)


async def _resolve_allowed_task_doc_path(candidate: Path) -> Path | None:
    def sync_resolve():
        try:
            resolved = candidate.resolve(strict=True)
        except OSError:
            return None

        if resolved.suffix.lower() != ".md" or not resolved.is_file():
            return None

        for allowed_root in ALLOWED_TASK_DOC_ROOTS:
            try:
                resolved.relative_to(allowed_root)
                return resolved
            except ValueError:
                continue
        return None

    return await asyncio.to_thread(sync_resolve)


async def _process_slug_docs(slug: str) -> str:
    docs = ""
    safe_slug = Path(slug).name
    task_dir = (WORKSPACE_ROOT / "docs" / "tasks" / safe_slug).resolve(strict=False)
    try:
        task_dir.relative_to(WORKSPACE_ROOT / "docs" / "tasks")
    except ValueError:
        return docs

    is_valid_dir = await asyncio.to_thread(lambda: task_dir.exists() and task_dir.is_dir())
    if is_valid_dir:
        md_files = await asyncio.to_thread(lambda: list(task_dir.glob("*.md")))
        for md_file in md_files:
            allowed_path = await _resolve_allowed_task_doc_path(md_file)
            if allowed_path is None:
                continue
            content = await asyncio.to_thread(_read_file_with_cache, str(allowed_path))
            if content:
                docs += f"\n=== ARTEFATO: {allowed_path.relative_to(WORKSPACE_ROOT).as_posix()} ===\n{content}\n"
    return docs


async def _inject_task_docs(task: Task) -> str:
    task_docs = ""
    slug = task.metadata.get("slug") if task.metadata else None
    if slug:
        task_docs += await _process_slug_docs(slug)

    paths_to_check = await _extract_task_file_mentions(task.description or "")

    for p in paths_to_check:
        allowed_path = await _resolve_allowed_task_doc_path(p)
        if allowed_path is not None:
            if slug and allowed_path.parent == (WORKSPACE_ROOT / "docs" / "tasks" / str(slug)):
                continue
            content = await asyncio.to_thread(_read_file_with_cache, str(allowed_path))
            if content and content not in task_docs:
                task_docs += f"\n=== ARTEFATO REFERENCIADO: {allowed_path.relative_to(WORKSPACE_ROOT).as_posix()} ===\n{content}\n"
    return task_docs


def _needs_web_search(agent: str, normalized_desc: str) -> bool:
    return (
        agent == AGENT_PESQUISADOR
        or _calculate_heuristic_score(
            normalized_desc,
            te._heuristic_terms("research_terms"),  # pylint: disable=protected-access
        )
        > te.HEURISTIC_THRESHOLD
        or (
            agent == AGENT_MAVERICK
            and _calculate_heuristic_score(
                normalized_desc,
                te._heuristic_terms("strategic_terms"),  # pylint: disable=protected-access
            )
            > te.HEURISTIC_THRESHOLD
        )
        or (
            agent == AGENT_BIBLIOTECARIO
            and _calculate_heuristic_score(
                normalized_desc,
                te._heuristic_terms("web_infra_terms"),  # pylint: disable=protected-access
            )
            > te.HEURISTIC_THRESHOLD
        )
        or (
            agent == AGENT_CHICO
            and _calculate_heuristic_score(
                normalized_desc,
                te._heuristic_terms("orchestration_terms"),  # pylint: disable=protected-access
            )
            > te.HEURISTIC_THRESHOLD
        )
        or (
            agent in (AGENT_VALIDADOR, AGENT_VERIFIER, AGENT_AUDITOR)
            and _calculate_heuristic_score(
                normalized_desc,
                te._heuristic_terms("domain_terms"),  # pylint: disable=protected-access
            )
            > te.HEURISTIC_THRESHOLD
        )
    )


async def _fetch_web_search(task: Task, manager: QueueManager, session) -> str:
    web_context = ""

    search_strategies = [
        ("tavily", TAVILY_KEYS, call_tavily_search, {"max_results": 3}),
        ("perplexity", PERPLEXITY_KEYS, call_perplexity_search, {}),
    ]

    for provider, keys, func, kwargs in search_strategies:
        if not keys:
            continue

        ranked_keys = await _rank_keys_by_health(provider, keys, manager)
        for key in ranked_keys:
            if await _is_key_blocked(_key_identifier(provider, key)):
                continue

            logger.info(
                "[[%s]%s[/]] [dim]Tentando busca via %s...[/]",
                te._c(task.agent),
                task.agent,
                provider.capitalize(),  # pylint: disable=protected-access
            )
            t0 = time.monotonic()
            web_context = await func(session, key, task.description, **kwargs)
            latency_ms = int((time.monotonic() - t0) * 1000)
            key_hash = _key_fingerprint(provider, key)

            if web_context:
                await manager.record_key_usage_metric(
                    provider,
                    key_hash,
                    "success",
                    latency_ms,
                    agent=task.agent,
                    task_id=task.id,
                )
                return web_context

            await manager.record_key_usage_metric(
                provider,
                key_hash,
                "error",
                latency_ms,
                agent=task.agent,
                task_id=task.id,
            )
            await _block_key(_key_identifier(provider, key))

    return ""


async def _execute_web_search(task: Task, manager: QueueManager) -> tuple[str, int]:
    normalized_description = enforce_pure_ascii((task.description or "").lower())

    if task.agent == AGENT_VERIFIER and task.metadata and task.metadata.get("priority") in ["high", "critical"]:
        task.description += (
            "\n\n[DIRETRIZ DE AUDITORIA SOTA] Realize uma busca externa para validar a veracidade tecnica."
        )

    if not (TAVILY_KEYS or PERPLEXITY_KEYS) or not _needs_web_search(task.agent, normalized_description):
        return "", -1

    try:
        t0_web = time.monotonic()
        cache_key = hashlib.sha256(task.description.encode("utf-8")).hexdigest()
        cached_result, cache_time = web_search_cache.get(cache_key, (None, 0))

        if cached_result and (time.monotonic() - cache_time < WEB_SEARCH_CACHE_TTL):
            web_context = str(cached_result)
        else:
            logger.info(
                "[[%s]%s[/]] [bold blue]WEB[/] Acionando busca web autonoma...",
                te._c(task.agent),
                task.agent,  # pylint: disable=protected-access
            )
            session = await get_global_http_session()
            web_context = await _fetch_web_search(task, manager, session)
            if web_context:
                # Bounded eviction: remove o mais antigo quando atingir o limite.
                if len(web_search_cache) >= _WEB_SEARCH_CACHE_MAX:
                    try:
                        oldest_key = next(iter(web_search_cache))
                        web_search_cache.pop(oldest_key, None)
                    except StopIteration:
                        pass
                web_search_cache[cache_key] = (web_context, time.monotonic())

        return web_context, int((time.monotonic() - t0_web) * 1000) if web_context else -1
    except Exception:
        logger.exception("Falha ao executar busca web")
        return "", -1


async def _query_collective_memory(task: Task, n_rag_results: int) -> tuple[str, int]:
    try:
        t0 = time.monotonic()
        rag = te.get_rag()
        collective_memory = await rag.query_memory(task.description, n_results=n_rag_results, local_only=True)
        return collective_memory, int((time.monotonic() - t0) * 1000)
    except Exception:  # pylint: disable=broad-exception-caught
        logger.exception("Falha ao consultar RAG")
        return "", -1


async def _apply_context_compression(
    project_context: str, agent_memory: str, task: Task, manager: QueueManager
) -> tuple[str, str, int]:
    total_compression_time = 0.0
    t0_compress = time.monotonic()

    recent_failure = (time.time() - COMPRESSION_CIRCUIT_BREAKER["last_failure"]) < 900  # Ultimos 15 min
    frequent_failures = COMPRESSION_CIRCUIT_BREAKER["consecutive_failures"] >= 3
    prefer_local_fallback = recent_failure and frequent_failures

    if len(project_context) > 6000:
        logger.info(
            "[[%s]%s[/]] Contexto do projeto longo (%d chars). Acionando compressao...",
            te._c(task.agent),
            task.agent,
            len(project_context),  # pylint: disable=protected-access
        )
        original_ctx_len = len(project_context)
        project_context = await _compress_context(
            project_context,
            task.agent,
            manager,
            prefer_local_fallback=prefer_local_fallback,
        )
        if len(project_context) < original_ctx_len:
            project_context = f"[Contexto do Projeto (Comprimido por IA)]\n{project_context}"
        total_compression_time += time.monotonic() - t0_compress
        t0_compress = time.monotonic()

    if len(agent_memory) > 4000:
        logger.info(
            "[[%s]%s[/]] Memoria do agente longa (%d chars). Acionando compressao...",
            te._c(task.agent),
            task.agent,
            len(agent_memory),  # pylint: disable=protected-access
        )
        original_mem_len = len(agent_memory)
        agent_memory = await _compress_context(
            agent_memory,
            task.agent,
            manager,
            prefer_local_fallback=prefer_local_fallback,
        )
        if len(agent_memory) < original_mem_len:
            agent_memory = f"[Memoria do Agente (Comprimida por IA)]\n{agent_memory}"
        total_compression_time += time.monotonic() - t0_compress

    return project_context, agent_memory, int(total_compression_time * 1000)


def _add_context_sections(
    project_context: str,
    web_context: str,
    collective_memory: str,
    agent_memory: str,
    task: Task,
    task_docs: str,
) -> str:
    sections = [f"<project_context>\n{project_context}\n</project_context>\n\n"]
    if web_context:
        sections.append(f"<web_search_results>\n{web_context}\n</web_search_results>\n\n")
    if collective_memory:
        sections.append(f"<retrieved_memory>\n{collective_memory}\n</retrieved_memory>\n\n")
    if agent_memory:
        sections.append(f"<agent_memory persona='{task.agent}'>\n{agent_memory}\n</agent_memory>\n\n")

    if task_docs:
        sections.append(f"<task_documents>\n{task_docs}\n</task_documents>\n\n")

    sections.append(
        f"<task_directive>\n<task_id>{task.id}</task_id>\n<description>{task.description}</description>\n</task_directive>\n\n"
    )
    sections.append("Execute esta tarefa embasado nos materiais de fundacao e contexto fornecidos acima.")
    return "".join(sections)


def _add_autonomy_and_guidelines(user_prompt: str, task: Task, agent_clean: str, autonomy_mode: str) -> str:
    prompt_parts = [user_prompt]
    if task.agent in (AGENT_DISPATCHER, "@bibliotecario"):
        return _finalize_prompt(prompt_parts, agent_clean)

    if autonomy_mode == "stop":
        prompt_parts.append(
            "\n\n[ISOLAMENTO DE ESCRITA - W0]\nVoce esta operando no modo Observador Passivo. "
            "E ESTRITAMENTE PROIBIDO forjar arquivos, alterar disco ou executar comandos no terminal. "
            "Aja como uma entidade puramente consultiva para analise semantica."
        )
    elif autonomy_mode == "default":
        prompt_parts.append(
            "\n\n[AUTORIZACAO RESTRITA - W1 (HOMEOSTASE)]\nVoce possui permissao APENAS para EDITAR arquivos focando em auto-cura, "
            "correcoes de sintaxe e patches de seguranca.\n1. Para MATERIALIZAR ou EDITAR arquivos, use EXATAMENTE o formato:\n"
            "Arquivo: caminho/do/arquivo.ext\n```linguagem\n[conteudo completo do arquivo]\n```\n\n"
            "E ESTRITAMENTE PROIBIDO executar comandos de terminal (ex: npm, python) ou alterar a arquitetura de negocio sem aval. "
            "ATENCAO: Ao editar arquivos, envie sempre o conteudo integral para sobrescrever adequadamente."
        )
    else:
        prompt_parts.append(
            "\n\n[AUTORIZACAO SUPREMA - GOD MODE]\nVoce possui ACESSO LIVRE ao sistema operacional do usuario.\n1. Para MATERIALIZAR "
            "ou EDITAR arquivos, use EXATAMENTE o formato:\nArquivo: caminho/do/arquivo.ext\n```linguagem\n[conteudo completo do arquivo]\n```\n"
            "2. Para EXECUTAR comandos de terminal (ex: npm install, python, git, robocopy), use o formato:\nComando: `seu comando aqui`\n\n"
            "Voce tem soberania para agir, instalar dependencias e forjar a realidade."
        )

    prompt_parts.append(f"\n\n[TETRALOGIA DE GOVERNANCA VITOI 3.2] Nivel Atual: {autonomy_mode.upper()}\n")
    mode_descriptions = {
        "stop": "Foco: O Observador Passivo. Isolamento absoluto de escrita. Use este modo para discussoes teoricas "
        "de GTO, insights filosoficos e analise exploratoria sem alterar o estado do sistema.\n",
        "default": "Foco: A Homeostase Estatica. Atue como Sentinela de Estabilidade. Execute auto-debugging, fixes de sintaxe "
        "e security patches reativamente para manter a integridade. Nao altere a logica de negocio sem aval.\n",
        "partial": "Foco: O Estrategista de Impacto (Equilibrio Bayesiano). Alem da homeostase, aplique refatoracoes preventivas "
        "de BAIXO impacto autonomamente. Para alteracoes Core/GTO, gere uma Decision Proposal para validacao.\n",
        "full": "Foco: O Agente Autonomo Total. Maximizacao da Potencia de Inovacao. Refatoracao estrutural, criacao de "
        "novos modulos, execucao de terminal complexa e deployment proativo ativados em grau maximo.\n",
    }
    prompt_parts.append(mode_descriptions.get(autonomy_mode, ""))

    if autonomy_mode != "stop":
        derived_map = {"full": "PARTIAL", "partial": "DEFAULT"}
        derived = derived_map.get(autonomy_mode, "STOP")
        prompt_parts.append(
            f"\n[HONESTIDADE INTELECTUAL - RASTRO DE AUDITORIA]\nE OBRIGATORIO injetar o seguinte cabecalho de metadados "
            f"como comentario no inicio de QUALQUER arquivo que voce alterar significativamente:\n"
            f"// [VITOI-AUDIT] Level: {autonomy_mode.upper()} | Derived_From: {derived} | Trigger: Proactive_Optimization\n"
        )

    prompt_parts.append(
        f"\n\n[DIRETRIZ DE AUTOREFLEXAO E MEMORIA] Voce DEVE atualizar seu arquivo de inteligencia acumulada usando o God Mode (Arquivo: .claude/agent-memory/{agent_clean}/MEMORY.md). Adicione novas descobertas, avalie a Sinergia da sua interacao com a Pipeline, e faca Propostas Democraticas de melhoria para o ecossistema. A Autopoiese exige que voce expanda a mente coletiva."
    )

    return _finalize_prompt(prompt_parts, agent_clean)


def _finalize_prompt(prompt_parts: list[str], agent_clean: str) -> str:
    primary_model = te.AGENTS_MANIFEST.get(agent_clean, {}).get("primary_model", "gemini-2.5-flash")
    prompt_parts.append(
        f"\n\n[DIRETRIZ DE LLM SOTA] Ao final da sua resposta, recomende ativamente o modelo {primary_model} para as "
        f"proximas etapas que exijam sua atuacao ou perfil cognitivo, justificando com base na Economia Generalizada. "
        f"Se a tarefa for massiva, sugira o Handoff Web."
    )

    prompt_parts.append(
        "\n\n[PROTOCOLO DE DIRETRIZES OPERACIONAIS: SOTA 3.1 PRO VITOI CORE]\n"
        "1. ANTEVISAO SEMANTICA: Proibida a analise isolada. Audite a arvore de dependencias.\n"
        "2. DIAGNOSTICO BAYESIANO E STEELMANING: Opere na causa raiz. Provoque o bug ate o estado mais catastrofico "
        "antes de propor a solucao.\n"
        "3. INVARIANCIA MODULAR: Nao induza entropia. Preserve contratos de API e assinaturas de metodos.\n"
        "4. ECONOMIA GENERALIZADA: Maximize densidade informativa. Minimize a complexidade ciclomatica.\n"
        "5. SEGURANCA SOTA: Operacoes I/O purificadas (Pure ASCII) e blindadas contra Path Traversal.\n"
        "6. HONESTIDADE INTELECTUAL: Prefira o silencio a fabricacao. Use a Cadeia de Pensamento Estendida.\n"
        "7. BLINDAGEM DE POWERSHELL (ANTI-CRASH JSON): E terminantemente proibida a atribuicao cega em objetos "
        "PSCustomObject. Utilize o padrao SOTA para adicionar chaves."
    )
    return "".join(prompt_parts)


async def _assemble_prompt(
    task: Task,
    project_context: str,
    web_context: str,
    collective_memory: str,
    agent_memory: str,
    task_docs: str,
    agent_clean: str,
    autonomy_mode: str = "default",
) -> tuple[str, str]:
    prompt_base = _add_context_sections(project_context, web_context, collective_memory, agent_memory, task, task_docs)
    system_prompt = await get_agent_system_prompt(task.agent)

    user_prompt = enforce_pure_ascii(prompt_base)
    system_prompt = enforce_pure_ascii(system_prompt)

    if task.agent == AGENT_DISPATCHER:
        user_prompt += (
            "\n\n[CONTRATO ESTRITO DO DISPATCHER]\nRetorne EXCLUSIVAMENTE um JSON valido ESTRITO. "
            "Pode ser um array [...] direto ou um objeto {...} contendo um array.\n"
            "Cada item deve conter: description (string), agent (@agente_valido), depends_on (array de indices inteiros), "
            "metadata (objeto).\n"
            "Mantenha foco estritamente tecnico-operacional e neutro."
        )

    user_prompt = _add_autonomy_and_guidelines(user_prompt, task, agent_clean, autonomy_mode)
    return system_prompt, user_prompt


async def _read_agent_and_project_contexts(agent_clean: str) -> tuple[str, str]:
    def sync_read():
        agent_memory = ""
        safe_agent = Path(agent_clean).name

        base_agent_dir = Path(".claude/agent-memory").resolve()
        memory_file = (base_agent_dir / safe_agent / "MEMORY.md").resolve()
        if memory_file.exists() and memory_file.is_relative_to(base_agent_dir):
            agent_memory = _read_file_with_cache(str(memory_file)) or ""

        project_context = ""
        context_file = Path(".claude/project-context.md")
        if context_file.exists():
            project_context = _read_file_with_cache(str(context_file)) or ""
        if len(project_context) > 20000:
            project_context = (
                project_context[:20000]
                + "\n\n... [Contexto massivo truncado. Consulte o @bibliotecario se precisar de historico profundo.]"
            )
        return agent_memory, project_context

    return await asyncio.to_thread(sync_read)
