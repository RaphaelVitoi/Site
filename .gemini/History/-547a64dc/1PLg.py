from typing import List, Dict, Tuple
from datetime import datetime, timezone
from core.schemas import Task


class UniversalArbitrator:
    """
    Centraliza a inteligência de decisão sistêmica (PAB SOTA 8.0),
    desacoplando agentes de infraestrutura.
    """
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
    def _parse_priority(priority_str: str) -> int:
        mapping = {"critical": 100, "high": 75, "medium": 50, "low": 25}
        return mapping.get(priority_str.lower(), 50)

    @staticmethod
    def build_dependency_graphs(tasks: List[Task]) -> Tuple[Dict[str, List[str]], Dict[str, List[str]], Dict[str, Task]]:
        """
        Cria o grafo de dependencias (forward), o grafo reverso (dependentes) e um mapa de tarefas.
        O(N) para construir.
        """
        forward_graph: Dict[str, List[str]] = {task.id: task.metadata.get("depends_on", []) for task in tasks}
        reverse_graph: Dict[str, List[str]] = {task.id: [] for task in tasks}
        task_map: Dict[str, Task] = {task.id: task for task in tasks}

        for task_id, dependencies in forward_graph.items():
            for dep_id in dependencies:
                if dep_id in reverse_graph:
                    reverse_graph[dep_id].append(task_id)

        return forward_graph, reverse_graph, task_map

    @staticmethod
    def _get_all_transitive_descendants(task_id: str, reverse_graph: Dict[str, List[str]], task_map: Dict[str, Task]) -> List[Task]:
        """
        Encontra todos os descendentes (diretos e indiretos) de uma tarefa usando BFS/DFS.
        """
        descendants: List[Task] = []
        queue = [task_id]
        visited = {task_id}

        while queue:
            current_id = queue.pop(0) # BFS
            for dependent_id in reverse_graph.get(current_id, []):
                if dependent_id not in visited:
                    visited.add(dependent_id)
                    if dependent_id in task_map:
                        descendants.append(task_map[dependent_id])
                    queue.append(dependent_id)
        return descendants

    @staticmethod
    def generate_dependency_mermaid_graph(tasks: List[Task]) -> str:
        """
        Gera uma string de definição de grafo Mermaid para visualização das dependências.
        """
        if not tasks:
            return "graph TD\n    A[Nenhuma tarefa pendente]"

        # Reutiliza a logica de construcao de grafo para garantir consistencia
        forward_graph, _, _ = UniversalArbitrator.build_dependency_graphs(tasks)

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
        for task_id, dependencies in forward_graph.items():
            current_task_mermaid_id = task_id_to_node_id[task_id]
            for dep_id in dependencies:
                if dep_id in task_id_to_node_id:
                    dependent_task_mermaid_id = task_id_to_node_id[dep_id]
                    mermaid_links.append(f'{dependent_task_mermaid_id} --> {current_task_mermaid_id}')

        graph_definition = "graph TD\n"
        # Add nodes
        for node_def in mermaid_nodes.values():
            graph_definition += f"    {node_def}\n"
        # Add links and styles
        for link in mermaid_links:
            graph_definition += f"    {link}\n"

        return graph_definition

    @staticmethod
    def calculate_critical_path_utility(
        task: Task,
        reverse_graph: Dict[str, List[str]],
        task_map: Dict[str, Task],
        alpha: float = 1.0,
        beta: float = 1.5, # Proposta do auditor
        gamma: float = 0.5, # Proposta do auditor
        lambda_age: float = 0.01 # Proposta do auditor (renomeado de lambda_rate)
    ) -> float:
        """
        Implementação O(1) do Algoritmo "Critical Path Utility" (CPU) por tarefa.
        Calcula a "Dívida de Fluxo" (ΔΦ) de uma tarefa usando um mapa de dependentes pré-calculado.
        """
        p_base = UniversalArbitrator._parse_priority(task.metadata.get("priority", "medium"))

        # Fator de idade com decaimento exponencial (Evita Starvation)
        # ΔΦ(T) = α * P_base + β * Σ(D_descendentes) + γ * e^(λ * t_wait)
        created_at = datetime.fromisoformat(task.timestamp)
        wait_seconds = (datetime.now(timezone.utc) - created_at).total_seconds()
        # t em minutos, como sugerido na proposta
        aging_factor = 2.71828 ** (lambda_age * (wait_seconds / 60))
        age_bonus = gamma * aging_factor

        # Bônus de Criticidade por Dependência (Soberania do Grafo)
        # A proposta sugere "todos os descendentes diretos e indiretos"
        transitive_descendants = UniversalArbitrator._get_all_transitive_descendants(task.id, reverse_graph, task_map)
        descendant_score = sum(UniversalArbitrator._parse_priority(d.metadata.get("priority", "medium")) for d in transitive_descendants)

        return (alpha * p_base) + (beta * descendant_score) + age_bonus
