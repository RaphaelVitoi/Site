# engine/solver_importers/__init__.py
"""
Modulo de Importacao Universal de Solvers de Poker (SOTA v8.0 GOLD).
Suporta: DeepSolver, GTOWizard, Monker Solver, HRC Pro e PioSolver.
"""

from engine.solver_importers.base import BaseSolverImporter
from engine.solver_importers.deep_solver import DeepSolverImporter
from engine.solver_importers.gtowizard import GTOWizardImporter
from engine.solver_importers.hrc_pro import HRCProImporter
from engine.solver_importers.monker import MonkerSolverImporter
from engine.solver_importers.pio_solver import PioSolverImporter
from engine.solver_importers.universal import UniversalSolverImporter

__all__ = [
    "BaseSolverImporter",
    "DeepSolverImporter",
    "GTOWizardImporter",
    "MonkerSolverImporter",
    "HRCProImporter",
    "PioSolverImporter",
    "UniversalSolverImporter",
]
