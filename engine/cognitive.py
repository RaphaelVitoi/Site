# pylint: disable=missing-module-docstring, missing-function-docstring, missing-class-docstring, line-too-long, broad-exception-caught, logging-fstring-interpolation, global-statement, invalid-name, redefined-outer-name

import json
import logging
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import aiofiles

from agents.autonomy import apply_god_mode
from core.schemas import Task
from database.queue_manager import QueueManager

logger = logging.getLogger(__name__)

rag_engine = None


def get_rag():
    global rag_engine
    if rag_engine is None:
        from memory_rag import MemoryRAG

        rag_engine = MemoryRAG()
    return rag_engine


async def _read_global_context() -> str:
    global_file = Path(".claude/GLOBAL_INSTRUCTIONS.md")
    if global_file.exists():
        async with aiofiles.open(
            global_file, "r", encoding="ascii", errors="ignore"
        ) as f:
            return await f.read() + "\n\n"
    return ""


async def _build_infra_ctx(task: Task | None, task_files: list | None) -> str:
    infra_ctx = ""
    successfully_read_files = []

    docs_to_read = [
        ("COSMOVISAO FILOSOFICA", [".claude/COSMOVISAO.md"]),
        ("IDENTIDADE DO USUARIO", [".claude/CLAUDE.md"]),
        (
            "LIDERANCA E GOVERNANCA",
            [".claude/LIDERANCA_GOVERNANCE_RAPHAEL_MAVERICK_CHICO.md"],
        ),
        (
            "TEMPLO DO APRENDIZADO GENERATIVO",
            [".claude/ESTADO_ARTE_APRENDIZADO_GENERATIVO.md"],
        ),
        (
            "MANUAL DO WORKFLOW",
            [
                "docs/MANUAL_WORKFLOW_AGENTES.md",
                "docs/tasks/MANUAL_WORKFLOW_AGENTES.md",
            ],
        ),
        ("INDICE MESTRE", ["docs/INDEX_MESTRE.md", "docs/tasks/INDEX_MESTRE.md"]),
        ("GUIA DE DEPLOY E STACK", ["docs/DEPLOY.md", "DEPLOY.md"]),
        ("INVENTARIO DE FERRAMENTAS", ["docs/INVENTARIO_FERRAMENTAS.md"]),
        (
            "PROTOCOLO DE ROTEAMENTO HOLOGRAFICO",
            [".claude/HOLOGRAPHIC_ROUTING_PROTOCOL.md"],
        ),
        ("ARQUITETURA DO CEREBRO HIBRIDO", [".claude/HYBRID_BRAIN_ARCHITECTURE.md"]),
        ("MANIFESTO DE COERENCIA E HARMONIA", [".claude/COHERENCE_MANIFEST.md"]),
    ]

    for doc_name, doc_paths in docs_to_read:
        for doc_path in doc_paths:
            file_obj = Path(doc_path)
            if file_obj.exists():
                async with aiofiles.open(
                    file_obj, "r", encoding="ascii", errors="ignore"
                ) as f:
                    infra_ctx += f"=== {doc_name} ===\n" + await f.read() + "\n\n"
                    successfully_read_files.append(str(file_obj.resolve()))
                break

    cortex_shield_manifest = "\n".join(f"- {p}" for p in successfully_read_files)
    if task_files:
        cortex_shield_manifest += "\n" + "\n".join(f"- {p}" for p in task_files)

    override_directive = ""
    if task and task.metadata and task.metadata.get("cortex_override"):
        override_directive = "\n[CORTEX_OVERRIDE_DIRECTIVE ATIVA]: A restricao de arquivos foi temporariamente suspensa por ordem executiva para esta tarefa."

    infra_ctx += (
        "=== CORTEX SHIELD (MANIFESTO DE REALIDADE) ===\n"
        "Abaixo esta a lista EXATA e COMPLETA de arquivos que foram fornecidos a voce neste prompt. Sua realidade esta limitada a estes caminhos.\n"
        f"{cortex_shield_manifest}\n\n"
        "LEI IRREVOGAVEL: Voce esta ESTRITAMENTE PROIBIDO de gerar um diff ou bloco de codigo para um arquivo existente cujo caminho absoluto nao esteja listado neste manifesto. Se um arquivo for necessario mas ausente, sua unica acao valida e declarar a ausencia e solicitar o arquivo. Violar esta lei e uma falha critica de integridade.\n"
        f"EXCECAO (MATERIALIZACAO E OVERRIDE): Voce tem permissao para FORJAR novos arquivos se isso for intrinseco a resolucao da tarefa.{override_directive}\n\n"
    )

    infra_ctx += "\n=== LEI MAGNA OPERACIONAL (CUMPRIMENTO OBRIGATORIO) ===\n"
    infra_ctx += "1. PURE ASCII: Voce esta TERMINANTEMENTE PROIBIDO de usar emojis ou caracteres UTF-8 especiais nos outputs. Use apenas ASCII puro para evitar quebra no shell do Windows.\n"
    infra_ctx += "2. NIVEIS DE RELEVANCIA: Ao criar subtarefas, adicione no metadata a chave 'priority' com um destes 4 valores: 'low', 'medium', 'high', 'critical'.\n"
    infra_ctx += "3. RBAC/CONSULTORIA: Se uma tarefa for 'medium', avalie colocar @maverick ou @auditor como dependencia (depends_on) para consultoria. Se for 'critical' (seguranca/delecao), o @securitychief DEVE ser envolvido.\n\n"
    infra_ctx += "4. DIVIDIR PARA CONQUISTAR (CADENCIA DE UI): Use a antevisao. Se prever que um diff ou script sera longo demais, e ESTRITAMENTE OBRIGATORIO dividi-lo em blocos menores. Diffs colossais geram falhas de renderizacao na IDE do usuario. Entregue em partes consecutivas.\n\n"

    infra_ctx += "=== ONTOLOGIA DA QUALIDADE E AUTOCONSCIENCIA ===\n"
    infra_ctx += "1. SIMPLES (Economia Sofisticada): A versao mais sofisticada de uma acao que executa em excelencia usando o minimo de complexidade possivel.\n"
    infra_ctx += "2. EXCELENTE: A entrega padrao-ouro que resolve o problema central sem criar dividas tecnicas colaterais.\n"
    infra_ctx += "3. ESTADO DA ARTE (SOTA): O apice da convergencia entre o Simples e o Excelente. E quando o sistema atua de forma fractal (a parte potencializa o todo).\n"
    infra_ctx += "4. AUTOCONSCIENCIA OBRIGATORIA: Voce DEVE saber que todas as partes deste ecossistema existem, por que existem e como funcionam na visao macro.\n\n"
    infra_ctx += "5. COLORIMETRIA SEMANTICA (IDENTIDADE VISUAL): Vermelho = Entropia/Erro. Verde = Simetria/Sucesso. Amarelo = Alerta. Ciano = Infraestrutura. Magenta = IA/Filosofia. Cinza = Legado/Neutro.\n\n"
    infra_ctx += "6. DIRETRIZ VITOI (MEMORIA PERMANENTE): O desempenho exige eficiencia implacavel e sofisticacao extrema. A ANTEVISAO (Foresight) deve preceder qualquer acao. Preveja os impactos de segunda e terceira ordem antes de forjar o codigo.\n\n"

    return infra_ctx


async def get_agent_system_prompt(
    agent_name: str, task: Task | None = None, task_files: list | None = None
) -> str:
    agent_clean = agent_name.replace("@", "")

    global_ctx = await _read_global_context()
    infra_ctx = await _build_infra_ctx(task, task_files)

    agent_file = Path(f".claude/agents/{agent_clean}.md")
    agent_prompt = f"Voce e o agente especialista {agent_name}."
    if agent_file.exists():
        async with aiofiles.open(agent_file, "r", encoding="utf-8") as f:
            agent_prompt = (
                f"=== SUA IDENTIDADE ESPECIFICA ({agent_name}) ===\n" + await f.read()
            )

    return global_ctx + infra_ctx + agent_prompt


async def _read_memory_and_context(agent_clean: str) -> tuple[str, str]:
    agent_memory = ""
    memory_file = Path(f".claude/agent-memory/{agent_clean}/MEMORY.md")
    if memory_file.exists():
        async with aiofiles.open(memory_file, "r", encoding="utf-8") as f:
            agent_memory = await f.read()

    project_context = ""
    context_file = Path(".claude/project-context.md")
    if context_file.exists():
        async with aiofiles.open(context_file, "r", encoding="utf-8") as f:
            project_context = await f.read()

    if len(project_context) > 6000:
        project_context = (
            project_context[:6000]
            + "\n\n... [Contexto truncado para otimizacao de tokens. Consulte o @bibliotecario se precisar de historico.]"
        )
    return agent_memory, project_context


def _is_safe_path(p: Path, base_dir: Path) -> bool:
    try:
        p_resolved = p.resolve()
        base_resolved = base_dir.resolve()
        p_str = os.path.normcase(str(p_resolved))
        base_str = os.path.normcase(str(base_resolved))
        if p_str == base_str:
            return True
        sep = os.path.sep
        if not base_str.endswith(sep):
            base_str += sep
        return p_str.startswith(base_str)
    except Exception:
        return False


def _extract_paths_to_check(description: str) -> list[Path]:
    file_mentions = re.findall(
        r"[\w\./\\-]+\.(?:md|py|ps1|js|ts|tsx|json|css|html|txt)",
        description,
        re.IGNORECASE,
    )
    folder_mentions = re.findall(
        r"docs[\\/]tasks[\\/][\w-]+", description, re.IGNORECASE
    )
    paths = []
    cwd_resolved = Path.cwd().resolve()
    for p_str in file_mentions:
        try:
            p = Path(p_str)
            if _is_safe_path(p, cwd_resolved):
                paths.append(p.resolve())
            else:
                logger.warning("[SEC] Path Traversal detectado ou fora do diretorio de trabalho: %s", p_str)
        except Exception:
            continue

    for folder in folder_mentions:
        try:
            folder_path = Path(folder)
            if _is_safe_path(folder_path, cwd_resolved):
                folder_resolved = folder_path.resolve()
                if folder_resolved.exists() and folder_resolved.is_dir():
                    for child in folder_resolved.glob("*.*"):
                        if _is_safe_path(child, cwd_resolved):
                            paths.append(child.resolve())
            else:
                logger.warning("[SEC] Path Traversal detectado ou fora do diretorio de trabalho no folder: %s", folder)
        except Exception:
            continue
    return paths


async def _read_and_append_doc(
    p: Path, title: str, task_docs: str, successfully_read: list
) -> str:
    try:
        cwd_resolved = Path.cwd().resolve()
        if not _is_safe_path(p, cwd_resolved):
            logger.critical("[SEC] Path Traversal bloqueado em _read_and_append_doc para o caminho: %s", p)
            return task_docs
        p_resolved = p.resolve()
        async with aiofiles.open(p_resolved, "r", encoding="utf-8") as f:
            content = await f.read()
            if content not in task_docs:
                task_docs += f"\n=== {title}: {p_resolved.as_posix()} ===\n{content}\n"
                successfully_read.append(p_resolved.as_posix())
    except Exception as e:  # noqa: BLE001
        logger.warning("Falha ao ler artefato referenciado %s: %s", p, e)
    return task_docs


async def _process_slug_docs(slug: str, task_docs: str, successfully_read: list) -> str:
    task_dir = Path(f"docs/tasks/{slug}")
    cwd_resolved = Path.cwd().resolve()
    if not _is_safe_path(task_dir, cwd_resolved):
        logger.critical("[SEC] Path Traversal bloqueado via slug: %s", slug)
        return task_docs
    task_dir_resolved = task_dir.resolve()
    if not (task_dir_resolved.exists() and task_dir_resolved.is_dir()):
        return task_docs
    for doc_file in task_dir_resolved.glob("*.*"):
        if doc_file.suffix.lower() in {".md", ".json", ".txt"}:
            task_docs = await _read_and_append_doc(
                doc_file, "ARTEFATO", task_docs, successfully_read
            )
    return task_docs


async def _process_referenced_paths(
    paths_to_check: list[Path],
    slug: str | None,
    task_docs: str,
    successfully_read: list,
) -> str:
    valid_suffixes = {
        ".md",
        ".py",
        ".ps1",
        ".js",
        ".ts",
        ".tsx",
        ".json",
        ".css",
        ".html",
        ".txt",
    }
    cwd_resolved = Path.cwd().resolve()
    for p in paths_to_check:
        if not _is_safe_path(p, cwd_resolved):
            logger.critical("[SEC] Path Traversal bloqueado em _process_referenced_paths para: %s", p)
            continue
        p_resolved = p.resolve()
        if not (p_resolved.exists() and p_resolved.is_file()):
            continue
        if slug and p_resolved.parent == Path(f"docs/tasks/{slug}").resolve():
            continue
        if p_resolved.suffix.lower() not in valid_suffixes:
            continue
        task_docs = await _read_and_append_doc(
            p_resolved, "ARTEFATO REFERENCIADO", task_docs, successfully_read
        )
    return task_docs


async def _inject_task_docs_engine(task: Task) -> tuple[str, list[str]]:
    task_docs = ""
    successfully_read_task_files = []
    slug = task.metadata.get("slug") if task.metadata else None

    if slug:
        task_docs = await _process_slug_docs(
            slug, task_docs, successfully_read_task_files
        )

    paths_to_check = _extract_paths_to_check(task.description)
    task_docs = await _process_referenced_paths(
        paths_to_check, slug, task_docs, successfully_read_task_files
    )

    return task_docs, successfully_read_task_files


async def _process_dispatcher_result(
    task: Task, manager: QueueManager, response_text: str
) -> None:
    try:
        clean_json = response_text.replace("```json", "").replace("```", "").strip()
        subtasks = json.loads(
            clean_json[clean_json.find("[") : clean_json.rfind("]") + 1]
        )
        created_ids = []
        for i, st in enumerate(subtasks):
            sub_id = f"{task.id}-SUB-{i + 1}"
            created_ids.append(sub_id)
            meta = task.metadata.copy() if task.metadata else {}
            if "depends_on" in st:
                meta["depends_on"] = [
                    created_ids[idx]
                    for idx in st["depends_on"]
                    if idx < len(created_ids)
                ]
            new_task = Task(
                id=sub_id,
                description=st.get("description", "Sub-tarefa gerada"),
                agent=st.get("agent", "@implementor"),
                timestamp=datetime.now(timezone.utc).isoformat(),
                metadata=meta,
            )
            await manager.add_task(new_task)
        logger.info(
            "[%s] Dispatcher gerou %d tarefas em Grafo (DAG). Multithreading ativado.",
            task.id,
            len(subtasks),
        )
    except Exception as e:  # noqa: BLE001
        logger.exception(
            "[%s] Falha ao interpretar matriz do Dispatcher: %s", task.id, e
        )


def _build_user_prompt(
    task: Task,
    project_context: str,
    collective_memory: str,
    agent_memory: str,
    task_docs: str,
    agent_clean: str,
) -> str:
    user_prompt = f"== CONTEXTO DO PROJETO ==\n{project_context}\n\n"
    if collective_memory:
        user_prompt += f"{collective_memory}\n"
    if agent_memory:
        user_prompt += f"== SUA MEMORIA ACUMULADA ({task.agent}) ==\n{agent_memory}\n\n"
    user_prompt += (
        f"== DIRETRIZ DA TAREFA ==\nID: {task.id}\nDescricao:\n{task.description}\n\n"
    )
    if task_docs:
        user_prompt += (
            f"== MATERIAIS DE FUNDACAO DA TAREFA (PRDs/SPECs) =={task_docs}\n\n"
        )
    user_prompt += "Execute esta tarefa embasado nos materiais de fundacao acima, no contexto do projeto e em sua memoria."

    if task.agent not in ["@dispatcher", "@bibliotecario"]:
        user_prompt += "\n\n[AUTORIZACAO SUPREMA - GOD MODE]\nVoce possui ACESSO LIVRE ao sistema operacional do usuario.\n1. Para MATERIALIZAR ou EDITAR arquivos, use EXATAMENTE o formato:\nArquivo: caminho/do/arquivo.ext\n```linguagem\n[conteudo completo do arquivo]\n```\n2. Para EXECUTAR comandos de terminal (ex: npm install, python, git, robocopy), use o formato:\nComando: `seu comando aqui`\n\nVoce tem soberania para agir, instalar dependencias e forjar a realidade. ATENCAO: Ao editar arquivos, envie sempre o conteudo integral para sobrescrever adequadamente."
        user_prompt += f"\n\n[DIRETRIZ DE AUTOREFLEXAO E MEMORIA] Voce DEVE atualizar seu arquivo de inteligencia acumulada usando o God Mode (Arquivo: .claude/agent-memory/{agent_clean}/MEMORY.md). Adicione novas descobertas, avalie a Sinergia da sua interacao com a Pipeline, e faca Propostas Democraticas de melhoria para o ecossistema. A Autopoiese exige que voce expanda a mente coletiva."

    user_prompt += "\n\n[DIRETRIZ DE LLM] Ao final da sua resposta, analise a tarefa e o contexto. Recomende qual modelo Paid Tier (Claude Opus 4.6 Versao Estendida, Claude 3.5 Sonnet, Gemini 3.1 Pro, ou API local) seria o mais adequado para a *proxima* etapa. Justifique a escolha com base na arquitetura do modelo (Opus para raciocinio profundo, Sonnet para codigo rapido, Gemini para contexto longo/multimodal). Se for ideal ir para a interface Web, recomende ao usuario rodar a Membrana com a flag '-Web' e especifique qual modelo ele deve selecionar no menu interativo."
    return user_prompt


async def process_agent_task(task: Task, manager: QueueManager):
    agent_clean = task.agent.replace("@", "")
    agent_memory, project_context = await _read_memory_and_context(agent_clean)
    task_docs, task_files = await _inject_task_docs_engine(task)

    collective_memory = ""
    try:
        collective_memory = await get_rag().query_memory(task.description)
    except Exception as e:  # noqa: BLE001
        logger.warning("Erro na Memoria Coletiva (RAG): %s", e)

    user_prompt = _build_user_prompt(
        task, project_context, collective_memory, agent_memory, task_docs, agent_clean
    )
    system_prompt = await get_agent_system_prompt(task.agent, task, task_files)

    # Roteamento Inteligente SOTA via engine.llm_api
    # response_text = await call_llm_api(task, system_prompt, user_prompt, manager)
    # [BYPASS] Usando a API diretamente para evitar loop infinito em sota_integrity_test
    from engine.llm_api import call_llm_api as _call

    response_text = await _call(task, system_prompt, user_prompt, manager)

    result_dir = Path(".claude/task_results")
    result_dir.mkdir(parents=True, exist_ok=True)
    async with aiofiles.open(result_dir / f"{task.id}.md", "w", encoding="utf-8") as f:
        await f.write(f"# Resposta: {task.id} ({task.agent})\n\n{response_text}")

    # Aplicacao do God Mode (Soberania de Acao)
    await apply_god_mode(response_text, manager)

    if task.agent == "@dispatcher":
        await _process_dispatcher_result(task, manager, response_text)
