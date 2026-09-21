"""Modulo de Arbitragem Universal (DAG) SOTA."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import UTC, datetime
import json
import logging
import math
import time
from typing import Any, ClassVar

from core.schemas import Task

try:
    import nexus_core_rust  # type: ignore # pylint: disable=import-error

    RUST_CORE_AVAILABLE = True
except ImportError:
    nexus_core_rust = None  # type: ignore
    RUST_CORE_AVAILABLE = False


class CyclicDependencyError(ValueError):
    """Excecao levantada quando um ciclo irresolvivel e detectado no Grafo topologico."""


logger = logging.getLogger(__name__)


class UniversalArbitrator:
    """
    Centraliza a inteligencia de decisao sistemica (PAB SOTA 8.0),
    desacoplando agentes de infraestrutura.
    """

    # Coeficientes da Teoria de Filas SOTA
    PRIORITY_SCALARS: ClassVar[dict[str, float]] = {
        "critical": 10000.0,
        "high": 5000.0,
        "medium": 1000.0,
        "low": 100.0,
        "normal": 1000.0,
    }
    TIME_DECAY_ALPHA: ClassVar[float] = 1.5  # Multiplicador de segundos em espera
    PROPAGATION_GAMMA: ClassVar[float] = 0.8  # Desconto de profundidade topologica

    _dag_cache: ClassVar[dict[int, tuple[dict[str, dict[str, Any]], float]]] = {}
    CACHE_TTL_SECONDS: ClassVar[float] = 3.0

    @classmethod
    def _build_graph(cls, pending_tasks: list[Task]) -> dict[str, dict[str, Any]]:
        graph: dict[str, dict[str, Any]] = {}
        for task in pending_tasks:
            graph[task.id] = {
                "task": task,
                "in_degree": 0,
                "out_edges": [],
                "base_weight": cls._calculate_base_weight(task),
                "total_utility": 0.0,
            }
        task_ids = set(graph.keys())
        for task in pending_tasks:
            for dep_id in cls.dependency_ids(task):
                if dep_id in task_ids:
                    graph[dep_id]["out_edges"].append(task.id)
                    graph[task.id]["in_degree"] += 1
        return graph

    @classmethod
    def _compute_utilities(cls, graph: dict[str, dict[str, Any]]) -> None:
        memo: dict[str, float] = {}
        visited: set[str] = set()
        recursion_stack: set[str] = set()

        def dfs_utility(node_id: str) -> float:
            if node_id in memo:
                return memo[node_id]
            if node_id in recursion_stack:
                logger.critical(
                    "[SISTEMA] Entropia Detectada: Ciclo infinito no DAG envolvendo %s",
                    node_id,
                )
                raise CyclicDependencyError(f"Ciclo topologico detectado na tarefa {node_id}")

            recursion_stack.add(node_id)
            node_data = graph[node_id]

            inherited_weight = 0.0
            for child_id in node_data["out_edges"]:
                child_in_degree = graph[child_id]["in_degree"]
                child_utility = dfs_utility(child_id)
                inherited_weight += cls.PROPAGATION_GAMMA * (child_utility / max(1, child_in_degree))

            final_utility = node_data["base_weight"] + inherited_weight

            recursion_stack.remove(node_id)
            visited.add(node_id)
            memo[node_id] = final_utility

            return final_utility

        for t_id, data in graph.items():
            if t_id not in visited:
                try:
                    data["total_utility"] = dfs_utility(t_id)
                except CyclicDependencyError:
                    data["total_utility"] = -1.0  # Punicao severa para ciclos isolados

    @classmethod
    def build_dependency_map(cls, pending_tasks: list[Task]) -> dict[str, dict[str, Any]]:
        """
        Constroi o DAG de dependencias em O(V + E) e propaga a Funcao de Utilidade
        do Caminho Critico usando Busca em Profundidade (DFS) reversa com Memoization.
        """
        if not pending_tasks:
            return {}

        current_hash = hash(tuple(sorted([t.id for t in pending_tasks])))
        current_time = time.monotonic()

        if current_hash in cls._dag_cache:
            cache_map, cache_time = cls._dag_cache[current_hash]
            if (current_time - cache_time) < cls.CACHE_TTL_SECONDS:
                return cache_map

        graph = cls._build_graph(pending_tasks)
        cls._compute_utilities(graph)

        # Previne vazamento infinito de memoria no dicionario estatico
        if len(cls._dag_cache) >= 100:
            cls._dag_cache = {
                h: (g, t) for h, (g, t) in cls._dag_cache.items() if (current_time - t) < cls.CACHE_TTL_SECONDS
            }

        cls._dag_cache[current_hash] = (graph, current_time)

        return graph

    @classmethod
    def _calculate_base_weight(cls, task: Task) -> float:
        """Calcula a variavel isolada do vertice: P(v) + alpha * Delta T(v)"""
        priority_str = str(task.metadata.get("priority", "medium") if task.metadata else "medium").lower()
        base_prio = cls.PRIORITY_SCALARS.get(priority_str, 1000.0)

        try:
            created_dt = datetime.fromisoformat(task.timestamp)
            # SOTA: Normalizacao Absoluta para offset-aware, suprimindo o TypeError
            if created_dt.tzinfo is None:
                created_dt = created_dt.replace(tzinfo=UTC)
            now = datetime.now(UTC)

            wait_seconds = max(0, (now - created_dt).total_seconds())
            # SOTA: Crescimento Sublinear (Achatamento Logaritmico)
            # Evita inversao de prioridade: tarefas antigas de baixa utilidade nao
            # suplantarao tarefas criticas apenas por acumularem tempo de espera linear.
            time_bonus = math.log1p(wait_seconds) * (base_prio * 0.05) * cls.TIME_DECAY_ALPHA
        except Exception:  # pylint: disable=broad-exception-caught
            time_bonus = 0.0

        return base_prio + time_bonus

    #: Estados em que uma dependencia libera quem depende dela. Mesma regra de
    #: `QueueManager.get_next_task`, que ja a aplicava em SQL.
    DEPENDENCY_SATISFIED_STATES: ClassVar[frozenset[str]] = frozenset({"completed", "cancelled"})

    @staticmethod
    def dependency_ids(task: Task) -> list[str]:
        """Dependencias declaradas em `metadata.depends_on`, normalizadas para str."""
        deps_raw = task.metadata.get("depends_on", []) if task.metadata else []
        return [str(d) for d in deps_raw] if isinstance(deps_raw, list) else []

    @classmethod
    def external_dependency_ids(cls, pending_tasks: list[Task]) -> set[str]:
        """Dependencias que NAO estao na lista pendente -- o status delas tem de vir do banco."""
        pending_ids = {t.id for t in pending_tasks}
        return {dep for t in pending_tasks for dep in cls.dependency_ids(t) if dep not in pending_ids}

    @classmethod
    def _is_ready(cls, task: Task, pending_ids: set[str], dependency_status: Mapping[str, str | None]) -> bool:
        """Pronta so se toda dependencia fora da fila pendente estiver concluida ou cancelada.

        BK-04 (auditoria 2026-09-16): `_build_graph` so enxergava dependencias
        DENTRO da lista pendente. Dependencia running, failed ou inexistente era
        ignorada, e a tarefa saia com in_degree 0 -- rodando antes da predecessora.
        Status desconhecido falha FECHADO: esperar e reversivel, executar nao e.
        """
        for dep in cls.dependency_ids(task):
            if dep in pending_ids:
                continue  # coberta por in_degree
            if dependency_status.get(dep) not in cls.DEPENDENCY_SATISFIED_STATES:
                return False
        return True

    @classmethod
    def upstream_failed_tasks(
        cls, pending_tasks: list[Task], dependency_status: Mapping[str, str | None]
    ) -> list[Task]:
        """Tarefas pendentes que dependem de uma tarefa `failed` -- nunca ficarao prontas."""
        return [t for t in pending_tasks if any(dependency_status.get(d) == "failed" for d in cls.dependency_ids(t))]

    @classmethod
    def has_dependency_cycle(cls, pending_tasks: list[Task]) -> bool:
        """Kahn: sobra no grafo pendente algum no que nunca chega a in_degree 0?"""
        graph = cls._build_graph(pending_tasks)
        in_degree = {tid: data["in_degree"] for tid, data in graph.items()}
        queue = [tid for tid, deg in in_degree.items() if deg == 0]
        visited = 0
        while queue:
            tid = queue.pop()
            visited += 1
            for child in graph[tid]["out_edges"]:
                in_degree[child] -= 1
                if in_degree[child] == 0:
                    queue.append(child)
        return visited < len(graph)

    @classmethod
    def _try_rust_core(
        cls, pending_tasks: list[Task], pending_ids: set[str], statuses: Mapping[str, str | None]
    ) -> Task | None:
        """Tenta extrair via core Rust (Speedforce). Retorna Task ou None."""
        if not RUST_CORE_AVAILABLE or nexus_core_rust is None:
            return None
        try:
            tasks_json = json.dumps([t.model_dump() for t in pending_tasks])
            scalars_json = json.dumps(cls.PRIORITY_SCALARS)
            result_json = nexus_core_rust.extract_optimal_task_py(
                tasks_json, scalars_json, cls.TIME_DECAY_ALPHA, cls.PROPAGATION_GAMMA
            )
            if result_json:
                candidate = Task(**json.loads(result_json))
                if cls._is_ready(candidate, pending_ids, statuses):
                    cls._registrar_intencao_s1(candidate)
                    return candidate
        except Exception as e:
            logger.warning(f"[SPEEDFORCE] Falha no core Rust, acionando fallback Python: {e}")
        return None

    @classmethod
    def extract_optimal_task(
        cls,
        pending_tasks: list[Task],
        dependency_status: Mapping[str, str | None] | None = None,
    ) -> Task | None:
        """
        Orquestra a fila priorizada. Complexidade de tempo estrita O(V).

        `dependency_status` mapeia o id de cada dependencia EXTERNA a lista
        pendente para o status dela no banco. Ausente, toda dependencia externa
        conta como nao satisfeita.
        """
        if not pending_tasks:
            return None

        statuses: Mapping[str, str | None] = dependency_status or {}
        pending_ids = {t.id for t in pending_tasks}

        # SOTA: Aceleracao Speedforce (Rust)
        rust_candidate = cls._try_rust_core(pending_tasks, pending_ids, statuses)
        if rust_candidate is not None:
            return rust_candidate

        try:
            dag_map = cls.build_dependency_map(pending_tasks)
        except CyclicDependencyError:
            logger.exception("Falha ao construir matriz de utilidade")
            return None  # Retorna ao Watchdog para quebra de ciclo

        optimal_task = None
        max_utility = -float("inf")

        for data in dag_map.values():
            if (
                data["in_degree"] == 0
                and data["total_utility"] > max_utility
                and cls._is_ready(data["task"], pending_ids, statuses)
            ):
                max_utility = data["total_utility"]
                optimal_task = data["task"]

        if not optimal_task:
            # Sem tarefa pronta nao e deadlock por si: pode ser espera legitima por
            # dependencia em execucao. Quem distingue e `has_dependency_cycle`.
            logger.debug("[NEXUS ORCHESTRATOR] Nenhuma tarefa pronta para despacho neste ciclo.")
            return None

        cls._registrar_intencao_s1(optimal_task)
        return optimal_task

    @classmethod
    def _registrar_intencao_s1(cls, task: Task) -> None:
        """Enriquece Task.metadata com a classificacao System-1 zero-download da Laya.

        CONSUMIDOR REAL de laya (invariante de antientropia): llm.laya_bridge.
        Aditivo e observacional: NUNCA altera o despacho (o core Rust decide;
        aqui apenas anexa provenia S1 ao metadata para telemetria/teoria de
        sistemas). Nao afeta modelo ou custo $ (fonte-unica
        llm/routing_policy.py::avaliacao_uso_condicional_pro, Tier 0).
        Fallback HeuristicRouter preserva a funcionalidade; em caso de falha a
        classificacao e ignorada (passthrough). Desativavel via CHICO_S1_LAYA=0.
        """
        import os  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

        if os.environ.get("CHICO_S1_LAYA", "1") != "1":
            return
        try:
            if not getattr(task, "description", None):
                return
            meta = getattr(task, "metadata", None)
            if not isinstance(meta, dict):
                return
            from llm.laya_bridge import classificar_intencao  # noqa: PLC0415  # pylint: disable=import-outside-toplevel

            intent = classificar_intencao(task.description)
            meta["intencao_s1"] = intent.metadados_s1()
        except Exception:  # pylint: disable=broad-exception-caught
            logger.debug("[laya-s1] falha ao enriquecer intencao; ignora (passthrough).")

    @staticmethod
    async def get_search_provider(query: str) -> str:
        """
        Heuristica SOTA: Identifica o melhor provedor de busca por intencao,
        antes da falha, para roteamento semantico.
        """
        tech_terms = [
            "error",
            "docs",
            "api",
            "version",
            "syntax",
            "implementation",
            "python",
            "react",
            "next.js",
            "docker",
            "bug",
            "config",
        ]
        if any(t in query.lower() for t in tech_terms):
            return "perplexity"  # Superior em documentacao viva e tecnica
        return "tavily"  # Superior em crawling de superficie e mercado

    @staticmethod
    def should_compress(raw_text: str) -> bool:
        """
        Implementacao da Lei de Shannon. A compressao so ocorre se o ganho
        informacional justificar o custo computacional.
        Por enquanto, uma heuristica de volume e suficiente.
        """
        return len(raw_text) > 4000

    @staticmethod
    def _get_mermaid_node_details(task: Task) -> tuple[str, str, str]:
        node_id_mermaid = task.id.replace("-", "_")
        status_color = {
            "pending": "#FFC107",
            "running": "#03A9F4",
            "completed": "#4CAF50",
            "failed": "#F44336",
            "cancelled": "#9E9E9E",
        }.get(task.status, "#9E9E9E")

        description_display = task.description
        if len(description_display) > 50:
            description_display = description_display[:47] + "..."

        node_label = f"{task.id}<br/>@{task.agent}<br/>{description_display}"
        return node_id_mermaid, node_label, status_color

    @staticmethod
    def generate_dependency_mermaid_graph(tasks: list[Task]) -> str:
        """
        Gera uma string de definicao de grafo Mermaid para visualizacao das dependencias.
        """
        if not tasks:
            return "graph TD\n    A[Nenhuma tarefa pendente]"

        # SOTA: Usa o novo construtor de DAG para consistencia visual
        try:
            dag_map = UniversalArbitrator.build_dependency_map(tasks)
        except CyclicDependencyError:
            return "graph TD\n    A[ERRO: Ciclo de dependencia detectado!]"

        mermaid_nodes: dict[str, str] = {}
        mermaid_links: list[str] = []
        task_id_to_node_id: dict[str, str] = {}
        for task in tasks:
            node_id_mermaid, node_label, status_color = UniversalArbitrator._get_mermaid_node_details(task)
            task_id_to_node_id[task.id] = node_id_mermaid
            mermaid_nodes[node_id_mermaid] = f'{node_id_mermaid}("{node_label}")'
            mermaid_links.append(f"style {node_id_mermaid} fill:{status_color},stroke:#333,stroke-width:2px")

        # Criar links de dependencia
        for task_id, data in dag_map.items():
            dependencies = data["task"].metadata.get("depends_on", []) if data["task"].metadata else []
            for dep_id in dependencies:
                if dep_id in task_id_to_node_id and task_id in task_id_to_node_id:
                    mermaid_links.append(f"{task_id_to_node_id[dep_id]} --> {task_id_to_node_id[task_id]}")

        node_lines = "".join(f"    {node_def}\n" for node_def in mermaid_nodes.values())
        link_lines = "".join(f"    {link}\n" for link in mermaid_links)
        return f"graph TD\n{node_lines}{link_lines}"
