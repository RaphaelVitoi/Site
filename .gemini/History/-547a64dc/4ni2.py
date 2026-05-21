from typing import List
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
    def calculate_critical_path_utility(task: Task, pending_tasks: List[Task]) -> float:
        """
        Implementação do Algoritmo "Critical Path Utility" (CPU).
        Calcula a "Dívida de Fluxo" (ΔΦ) de uma tarefa.
        """
        priority_map = {"critical": 100.0, "high": 50.0, "medium": 10.0, "low": 1.0}
        base_priority = priority_map.get(task.metadata.get("priority", "medium"), 10.0)

        # Fator de idade com decaimento exponencial (Evita Starvation)
        # ΔΦ(T) = α * P_base + β * Σ(D_descendentes) + γ * e^(λ * t_wait)
        wait_hours = (datetime.now() - datetime.fromisoformat(task.timestamp)).total_seconds() / 3600.0
        age_bonus = 1.5 * (2.71828 ** (0.2 * wait_hours)) # γ=1.5, λ=0.2

        # Bônus de Criticidade por Dependência (Soberania do Grafo)
        # Tarefas que bloqueiam outras são mais críticas.
        descendant_bonus = 0
        if pending_tasks: # Evita O(N^2) em filas vazias
             descendants = [t for t in pending_tasks if task.id in t.metadata.get("depends_on", [])]
             descendant_bonus = sum(priority_map.get(d.metadata.get("priority", "medium"), 10.0) for d in descendants)

        alpha, beta = 1.0, 2.0 # Pesos de calibração

        return (alpha * base_priority) + (beta * descendant_bonus) + age_bonus
