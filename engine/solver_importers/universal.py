# engine/solver_importers/universal.py
"""
Orquestrador e importador universal com auto-deteccao de formato e conversao para PMev.
"""

from typing import Any
from core.perspective_schemas import NormalizedGameTree, PerspectivaResult, SolverImportResponse, SolverType
from engine.solver_importers.base import BaseSolverImporter
from engine.solver_importers.deep_solver import DeepSolverImporter
from engine.solver_importers.gtowizard import GTOWizardImporter
from engine.solver_importers.hrc_pro import HRCProImporter
from engine.solver_importers.monker import MonkerSolverImporter
from engine.solver_importers.pio_solver import PioSolverImporter
from engine.vitoi_perspective_engine import VitoiPerspectiveEngine


class UniversalSolverImporter:
    """
    Importador Mestre Universal para Solvers de Poker.
    Identifica automaticamente a origem (DeepSolver, GTOWizard, Monker, HRC Pro, PioSolver)
    e normaliza para o grafo canônico da Perspectiva Matemática (PMev).
    """

    def __init__(self) -> None:
        self.importers: list[BaseSolverImporter] = [
            DeepSolverImporter(),
            GTOWizardImporter(),
            MonkerSolverImporter(),
            HRCProImporter(),
            PioSolverImporter(),
        ]

    def detect_solver_type(self, raw_content: str) -> SolverType:
        """Determina o solver de origem com base na assinatura sintatica do conteudo."""
        for importer in self.importers:
            if importer.detect_format(raw_content):
                return importer.solver_type
        return "deep_solver"  # Fallback padrao

    def import_tree(
        self,
        raw_content: str,
        solver_type: SolverType = "auto",
        tournament_context: dict[str, Any] | None = None,
        convert_to_pmev: bool = True,
    ) -> SolverImportResponse:
        """
        Executa o pipeline completo de importacao, normalizacao e projecao de PMev.
        """
        try:
            target_type = solver_type
            if target_type == "auto":
                target_type = self.detect_solver_type(raw_content)

            selected_importer: BaseSolverImporter | None = None
            for imp in self.importers:
                if imp.solver_type == target_type:
                    selected_importer = imp
                    break

            if not selected_importer:
                selected_importer = DeepSolverImporter()

            tree = selected_importer.parse_tree(raw_content, tournament_context)

            if convert_to_pmev and tree.nodes:
                self._enrich_with_pmev(tree, tournament_context or {})

            return SolverImportResponse(
                status="SUCCESS",
                solver_type=tree.solver_type,
                tree=tree,
                node_count=len(tree.nodes),
                error=None,
            )
        except Exception as e:
            return SolverImportResponse(
                status="ERROR",
                solver_type=solver_type,
                tree=None,
                node_count=0,
                error=f"Falha na importacao do solver ({solver_type}): {e!s}",
            )

    def _enrich_with_pmev(self, tree: NormalizedGameTree, tournament_context: dict[str, Any]) -> None:
        """Converte metricas de cada no do solver na Perspectiva Matematica (PMev)."""
        base_antes = float(tournament_context.get("base_antes", 1.0))
        time_to_blind = float(tournament_context.get("time_to_blind_minutes", 10.0))
        payjump = float(tournament_context.get("payjump_proximity_factor", 0.5))
        base_rio = float(tournament_context.get("base_rio", 0.0))

        for nid, node in tree.nodes.items():
            eq = node.range_equity if node.range_equity is not None else 0.50
            pos = node.player if node.player in ["UTG", "BTN", "SB", "BB", "CO", "MP"] else "BTN"
            num_opp = max(1, tree.num_players - 1)

            ev_fold_dyn = VitoiPerspectiveEngine.calculate_dynamic_ev_fold(
                base_antes=base_antes,
                time_to_blind_minutes=time_to_blind,
                payjump_proximity_factor=payjump,
                position=pos,
            )
            struct_liab = VitoiPerspectiveEngine.calculate_structural_liability(
                multiway_opponents=num_opp,
                base_rio=base_rio,
            )
            amort_edge = VitoiPerspectiveEngine.calculate_edge_amortization(
                stack_depth_bb=tree.stacks.get(node.player, 25.0),
                edge_base=0.05,
                aggression_factor=1.5,
            )

            # Calculo de utilidade prospectiva
            u_win = VitoiPerspectiveEngine.calculate_utility(node.pot * 0.5, 2.25)
            u_lose = VitoiPerspectiveEngine.calculate_utility(-node.pot * 0.5, 2.25)
            pmev_val = round((eq * u_win) + ((1.0 - eq) * u_lose) - ev_fold_dyn - struct_liab + amort_edge, 4)

            # Determinar acao recomendada a partir da estrategia do solver
            opt_act = "CALL"
            if node.strategy:
                opt_act = max(node.strategy.items(), key=lambda x: x[1])[0]

            tree.pmev_converted_nodes[nid] = PerspectivaResult(
                pmev=pmev_val,
                dynamic_ev_fold=ev_fold_dyn,
                structural_liability=struct_liab,
                amortized_edge=amort_edge,
                risk_advantage=round((1.0 - payjump) * 20.0, 2),
                required_equity=round(0.50 + (struct_liab * 0.02), 4),
                bubble_factor=round(1.0 + (payjump * 0.5), 2),
                utility_win=round(u_win, 4),
                utility_lose=round(u_lose, 4),
                optimal_action=opt_act,
                metadata={"source_solver": tree.solver_type, "original_node_id": nid},
            )
