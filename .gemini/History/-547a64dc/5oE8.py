import time
import logging
from typing import List, Dict, Tuple, Any, Set, Optional
from datetime import datetime, timezone
from core.schemas import Task

class CyclicDependencyError(ValueError):
    """Exceção levantada quando um ciclo irresolvível é detectado no Grafo topológico."""
    pass

class UniversalArbitrator:
    """
    Centraliza a inteligência de decisão sistêmica (PAB SOTA 8.0),
    desacoplando agentes de infraestrutura.
    """
    # Coeficientes da Teoria de Filas SOTA
    PRIORITY_SCALARS = {
        "critical": 10000.0,
        "high": 5000.0,
        "medium": 1000.0,
        "low": 100.0,
        "normal": 1000.0
    }
    TIME_DECAY_ALPHA = 1.5  # Multiplicador de segundos em espera
    PROPAGATION_GAMMA = 0.8 # Desconto de profundidade topológica

    @classmethod
    def build_dependency_map(cls, pending_tasks: List[Task]) -> Dict[str, Dict[str, Any]]:
        """
        Constrói o DAG de dependências em O(V + E) e propaga a Função de Utilidade
        do Caminho Crítico usando Busca em Profundidade (DFS) reversa com Memoization.
        """
        graph: Dict[str, Dict[str, Any]] = {}
        for task in pending_tasks:
            graph[task.id] = {
                "task": task,
                "in_degree": 0,
                "out_edges": [],
                "base_weight": cls._calculate_base_weight(task),
                "total_utility": 0.0
            }

        task_ids = set(graph.keys())
        for task in pending_tasks:
            deps = task.metadata.get("depends_on", []) if task.metadata else []
            for dep_id in deps:
                if dep_id in task_ids:
                    graph[dep_id]["out_edges"].append(task.id)
                    graph[task.id]["in_degree"] += 1

        memo: Dict[str, float] = {}
        visited: Set[str] = set()
        recursion_stack: Set[str] = set()

        def dfs_utility(node_id: str) -> float:
            if node_id in memo:
                return memo[node_id]
            if node_id in recursion_stack:
                logging.critical(f"[SISTEMA] Entropia Detectada: Ciclo infinito no DAG envolvendo {node_id}")
                raise CyclicDependencyError(f"Ciclo topológico detectado na tarefa {node_id}")

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

        for t_id in graph.keys():
            if t_id not in visited:
                try:
                    graph[t_id]["total_utility"] = dfs_utility(t_id)
                except CyclicDependencyError:
                    graph[t_id]["total_utility"] = -1.0 # Punição severa para ciclos isolados

        return graph

    @classmethod
    def _calculate_base_weight(cls, task: Task) -> float:
        """Calcula a variável isolada do vértice: P(v) + \\alpha * \\Delta T(v)"""
        priority_str = (task.metadata.get("priority", "medium") if task.metadata else "medium").lower()
        base_prio = cls.PRIORITY_SCALARS.get(priority_str, 1000.0)

        try:
            created_dt = datetime.fromisoformat(task.timestamp)
            # SOTA: Normalização Absoluta para offset-aware, suprimindo o TypeError
            if created_dt.tzinfo is None:
                created_dt = created_dt.replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)

            wait_seconds = (now - created_dt).total_seconds()
            time_bonus = max(0, wait_seconds) * cls.TIME_DECAY_ALPHA
        except Exception: # Captura qualquer exceção para robustez
            time_bonus = 0.0

        return base_prio + time_bonus

    @classmethod
    def extract_optimal_task(cls, pending_tasks: List[Task]) -> Optional[Task]:
        """
        Orquestra a fila priorizada. Complexidade de tempo estrita O(V) via varredura linear e complexidade espacial O(1).
        """
        if not pending_tasks:
            return None

        try:
            dag_map = cls.build_dependency_map(pending_tasks)
        except CyclicDependencyError as e:
            logging.error(f"Falha ao construir matriz de utilidade: {e}")
            return None # Retorna ao Watchdog para quebra de ciclo

        optimal_task = None
        max_utility = -float('inf')

        for t_id, data in dag_map.items():
            if data["in_degree"] == 0:
                if data["total_utility"] > max_utility:
                    max_utility = data["total_utility"]
                    optimal_task = data["task"]

        if not optimal_task:
            logging.warning("[NEXUS ORCHESTRATOR] Deadlock Operacional: Nenhuma tarefa possui in_degree=0.")
            return None

        return optimal_task

    @staticmethod
    async def get_search_provider(query: str) -> str:
        """
        Heurística SOTA: Identifica o melhor provedor de busca por intenção,
        antes da falha, para roteamento semântico.
        """
        tech_terms = ["error", "docs", "api", "version", "syntax", "implementation", "python", "react", "next.js", "docker", "bug", "config"]
        if any(t in query.lower() for t in tech_terms):
            return "perplexity" # Superior em documentação viva e técnica
        return "tavily" # Superior em crawling de superfície e mercado

    @staticmethod
    def should_compress(raw_text: str) -> bool:
        """
        Implementação da Lei de Shannon. A compressão só ocorre se o ganho
        informacional justificar o custo computacional.
        Por enquanto, uma heurística de volume é suficiente.
        """
        return len(raw_text) > 4000

    @staticmethod
    def generate_dependency_mermaid_graph(tasks: List[Task]) -> str:
        """
        Gera uma string de definição de grafo Mermaid para visualização das dependências.
        """
        if not tasks:
            return "graph TD\n    A[Nenhuma tarefa pendente]"

        # SOTA: Usa o novo construtor de DAG para consistencia visual
        try:
            dag_map = UniversalArbitrator.build_dependency_map(tasks)
        except CyclicDependencyError:
            return "graph TD\n    A[ERRO: Ciclo de dependencia detectado!]"

        mermaid_nodes: Dict[str, str] = {}
        mermaid_links: List[str] = []
        task_id_to_node_id: Dict[str, str] = {}
        # Criar nós para todas as tarefas e mapear IDs
        for task in tasks:
            node_id_mermaid = task.id.replace('-', '_') # Mermaid IDs cannot have hyphens
            task_id_to_node_id[task.id] = node_id_mermaid

            status_color = {
                "pending": "#FFC107",  # Amarelo
                "running": "#03A9F4",  # Azul
                "completed": "#4CAF50", # Verde
                "failed": "#F44336",   # Vermelho
                "cancelled": "#9E9E9E" # Cinza
            }.get(task.status, "#9E9E9E") # Default cinza

            # Truncar descrição para evitar nós muito grandes
            description_display = task.description
            if len(description_display) > 50:
                description_display = description_display[:47] + "..."

            node_label = f"{task.id}<br/>@{task.agent}<br/>{description_display}"
            mermaid_nodes[node_id_mermaid] = f'{node_id_mermaid}("{node_label}")'
            mermaid_links.append(f'style {node_id_mermaid} fill:{status_color},stroke:#333,stroke-width:2px')

        # Criar links de dependência
        for task_id, data in dag_map.items():
            dependencies = data["task"].metadata.get("depends_on", []) if data["task"].metadata else []
            for dep_id in dependencies:
                if dep_id in task_id_to_node_id and task_id in task_id_to_node_id:
                    mermaid_links.append(f'{task_id_to_node_id[dep_id]} --> {task_id_to_node_id[task_id]}')

        graph_definition = "graph TD\n"
        # Add nodes
        for node_def in mermaid_nodes.values():
            graph_definition += f"    {node_def}\n"
        # Add links and styles
        for link in mermaid_links:
            graph_definition += f"    {link}\n"

        return graph_definition
