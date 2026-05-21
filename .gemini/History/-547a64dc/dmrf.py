from typing import List, Dict
from datetime import datetime
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
    def generate_dependency_mermaid_graph(tasks: List[Task]) -> str:
        """
        Gera uma string de definição de grafo Mermaid para visualização das dependências.
        """
        if not tasks:
            return "graph TD\n    A[Nenhuma tarefa pendente]"

        mermaid_nodes = {}
        mermaid_links = []
        task_id_to_node_id = {}

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
        for task in tasks:
            current_task_mermaid_id = task_id_to_node_id[task.id]
            dependencies = task.metadata.get("depends_on", [])
            for dep_id in dependencies:
                if dep_id in task_id_to_node_id: # A dependência é uma tarefa que também está na lista
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
    def build_dependency_map(tasks: List[Task]) -> Dict[str, List[Task]]:
        """
        Cria um mapa de dependentes (grafo reverso) em O(N) para consulta eficiente.
        Retorna um dicionario onde a chave e o ID de uma tarefa e o valor e uma lista
        de tarefas que dependem dela.
        """
        dependents_map: Dict[str, List[Task]] = {}
        task_map = {task.id: task for task in tasks} # O(N)

        for task in tasks:
            dependencies = task.metadata.get("depends_on", [])
            for dep_id in dependencies:
                if dep_id in task_map:
                    if dep_id not in dependents_map:
                        dependents_map[dep_id] = []
                    dependents_map[dep_id].append(task)
        return dependents_map

    @staticmethod
    def calculate_critical_path_utility(
        task: Task,
        dependents_map: Dict[str, List[Task]],
        alpha: float = 1.0,
        beta: float = 2.0,
        gamma: float = 1.5,
        lambda_rate: float = 0.2
    ) -> float:
        """
        Implementação O(1) do Algoritmo "Critical Path Utility" (CPU) por tarefa.
        Calcula a "Dívida de Fluxo" (ΔΦ) de uma tarefa usando um mapa de dependentes pré-calculado.
        """
        priority_map = {"critical": 100.0, "high": 50.0, "medium": 10.0, "low": 1.0}
        base_priority = priority_map.get(task.metadata.get("priority", "medium"), 10.0)

        # Fator de idade com decaimento exponencial (Evita Starvation)
        # ΔΦ(T) = α * P_base + β * Σ(D_descendentes) + γ * e^(λ * t_wait)
        wait_hours = (datetime.now() - datetime.fromisoformat(task.timestamp)).total_seconds() / 3600.0
        age_bonus = gamma * (2.71828 ** (lambda_rate * wait_hours))

        # Bônus de Criticidade por Dependência (Soberania do Grafo)
        descendants = dependents_map.get(task.id, [])
        descendant_bonus = sum(priority_map.get(d.metadata.get("priority", "medium"), 10.0) for d in descendants)

        return (alpha * base_priority) + (beta * descendant_bonus) + age_bonus
