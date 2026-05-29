"""Modulo de Arbitragem Universal (DAG) SOTA."""

import logging
import math
import time
from datetime import UTC, datetime
from typing import Any, ClassVar

from core.schemas import Task


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
            deps = task.metadata.get("depends_on", []) if task.metadata else []
            for dep_id in deps:
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

    @classmethod
    def extract_optimal_task(cls, pending_tasks: list[Task]) -> Task | None:
        """
        Orquestra a fila priorizada. Complexidade de tempo estrita O(V).
        """
        if not pending_tasks:
            return None

        try:
            dag_map = cls.build_dependency_map(pending_tasks)
        except CyclicDependencyError:
            logger.exception("Falha ao construir matriz de utilidade")
            return None  # Retorna ao Watchdog para quebra de ciclo

        optimal_task = None
        max_utility = -float("inf")

        for data in dag_map.values():
            if data["in_degree"] == 0 and data["total_utility"] > max_utility:
                max_utility = data["total_utility"]
                optimal_task = data["task"]

        if not optimal_task:
            logger.warning("[NEXUS ORCHESTRATOR] Deadlock Operacional: Nenhuma tarefa possui in_degree=0.")
            return None

        return optimal_task

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

        graph_definition = "graph TD\n"
        # Add nodes
        for node_def in mermaid_nodes.values():
            graph_definition += f"    {node_def}\n"
        # Add links and styles
        for link in mermaid_links:
            graph_definition += f"    {link}\n"

        return graph_definition
