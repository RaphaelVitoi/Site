"""TEST SUITE FOR SOTA TRIAD MESH (EXA + STITCH + JULES).

Validates data schemas, DAG planning, bridges and Pure ASCII compliance.
ASCII-pure. Typed under PEP 585/604.
"""

from __future__ import annotations

import unittest
from pathlib import Path

from engine.sota_triad_mesh import (
    ExaKnowledgeBridge,
    ExaQueryRequest,
    ExaResearchResult,
    JulesCloudBridge,
    JulesTaskRequest,
    JulesTaskResult,
    SotaTriadOrchestrator,
    StitchDesignBridge,
    StitchScreenRequest,
    StitchScreenResult,
    TriadMeshReport,
)

ROOT_DIR = Path(__file__).resolve().parents[1]


class TestSotaTriadMesh(unittest.TestCase):
    """Tests for SOTA Triad Mesh orchestration components."""

    def setUp(self) -> None:
        self.orchestrator = SotaTriadOrchestrator(root_dir=ROOT_DIR)

    def test_exa_knowledge_bridge_builds_game_theory_query(self) -> None:
        topic = "ICM dynamic bubble factor in multiway pots"
        req = ExaKnowledgeBridge.build_game_theory_query(topic, math_density="high")
        self.assertIsInstance(req, ExaQueryRequest)
        self.assertEqual(req.topic, topic)
        self.assertTrue(req.require_latex)
        self.assertIn("CFR+", req.query_string)
        self.assertIn("arxiv.org", req.domain_filters)

    def test_exa_knowledge_bridge_extracts_latex_and_citations(self) -> None:
        sample_text = (
            "We define the EV under PMev as $$PMev(\\sigma) = \\int \\mathcal{V}(x) dx$$ "
            "where the discrete bound is $\\Delta \\leq 0.05$. "
            "See https://arxiv.org/abs/2301.00000 and https://trueicm.com/docs for details."
        )
        res = ExaKnowledgeBridge.parse_research_context(sample_text, topic="PMev")
        self.assertIsInstance(res, ExaResearchResult)
        self.assertEqual(res.topic, "PMev")
        self.assertEqual(len(res.extracted_formulas), 2)
        self.assertIn("PMev(\\sigma) = \\int \\mathcal{V}(x) dx", res.extracted_formulas)
        self.assertIn("\\Delta \\leq 0.05", res.extracted_formulas)
        self.assertEqual(len(res.citations), 2)
        self.assertIn("https://arxiv.org/abs/2301.00000", res.citations)

    def test_stitch_design_bridge_screen_prompt_generation(self) -> None:
        req = StitchDesignBridge.build_screen_prompt("PMev Heatmap Simulator")
        self.assertIsInstance(req, StitchScreenRequest)
        self.assertEqual(req.screen_name, "PMev Heatmap Simulator")
        self.assertIn("#090D16", req.prompt)
        self.assertIn("#D4AF37", req.prompt)
        self.assertIn("WCAG AAA", req.prompt)

    def test_stitch_extract_tailwind_classes(self) -> None:
        markup = '<div className="bg-slate-950 text-amber-400 p-6 flex flex-col"><button class="rounded-xl px-4 py-2"></button></div>'
        classes = StitchDesignBridge.extract_tailwind_classes(markup)
        self.assertIn("bg-slate-950", classes)
        self.assertIn("text-amber-400", classes)
        self.assertIn("rounded-xl", classes)
        self.assertIn("flex-col", classes)

    def test_jules_cloud_bridge_patch_metrics_parsing(self) -> None:
        sample_diff = (
            "--- a/engine/core.py\n"
            "+++ b/engine/core.py\n"
            "@@ -1,3 +1,4 @@\n"
            "-old_line\n"
            "+new_line_1\n"
            "+new_line_2\n"
            "--- a/tests/test_core.py\n"
            "+++ b/tests/test_core.py\n"
            "@@ -10,2 +10,3 @@\n"
            "+test_assertion\n"
        )
        metrics = JulesCloudBridge.parse_patch_metrics(sample_diff)
        self.assertEqual(metrics["files_count"], 2)
        self.assertEqual(metrics["insertions"], 3)
        self.assertEqual(metrics["deletions"], 1)
        self.assertIn("engine/core.py", metrics["files"])
        self.assertIn("tests/test_core.py", metrics["files"])

    def test_triad_orchestrator_planning_and_dag_generation(self) -> None:
        plan = self.orchestrator.plan_triad_workflow("Simulador de Equidade Flop PMev")
        self.assertIn("objective", plan)
        self.assertEqual(len(plan["dag_phases"]), 4)
        self.assertEqual(plan["dag_phases"][0]["agent"], "Exa (Neural Research)")
        self.assertEqual(plan["dag_phases"][1]["agent"], "Stitch (Generative UI)")
        self.assertEqual(plan["dag_phases"][2]["agent"], "Google Jules (Cloud VM)")
        self.assertEqual(plan["dag_phases"][3]["agent"], "Antigravity 2.0 (Local Gate)")

    def test_triad_orchestrator_dag_execution(self) -> None:
        report = self.orchestrator.execute_triad_dag("Validacao de Teoremas de Vitoi")
        self.assertIsInstance(report, TriadMeshReport)
        self.assertTrue(report.verified)
        self.assertEqual(report.convergence_rate, 1.0)
        self.assertGreater(report.total_latency_seconds, 0)

    def test_pure_ascii_in_triad_files(self) -> None:
        triad_file = ROOT_DIR / "engine" / "sota_triad_mesh.py"
        test_file = ROOT_DIR / "tests" / "test_sota_triad_mesh.py"
        for p in [triad_file, test_file]:
            self.assertTrue(p.is_file(), f"File {p} does not exist")
            text = p.read_text(encoding="utf-8")
            self.assertTrue(all(ord(c) < 128 for c in text), f"Non-ASCII character in {p}")


if __name__ == "__main__":
    unittest.main()
