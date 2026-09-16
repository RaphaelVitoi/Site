"""TEST SUITE FOR SOTA TRIAD MESH (EXA + STITCH + JULES).

Validates data schemas, DAG planning, bridges and Pure ASCII compliance.
ASCII-pure. Typed under PEP 585/604.
"""

from __future__ import annotations

from pathlib import Path
import unittest

import pytest

from engine.sota_triad_mesh import (
    ExaKnowledgeBridge,
    ExaQueryRequest,
    ExaResearchResult,
    JulesCloudBridge,
    PhaseReceipt,
    SotaTriadOrchestrator,
    StitchDesignBridge,
    StitchScreenRequest,
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
        assert isinstance(req, ExaQueryRequest)
        assert req.topic == topic
        assert req.require_latex
        assert "CFR+" in req.query_string
        assert "arxiv.org" in req.domain_filters

    def test_exa_knowledge_bridge_extracts_latex_and_citations(self) -> None:
        sample_text = (
            "We define the EV under PMev as $$PMev(\\sigma) = \\int \\mathcal{V}(x) dx$$ "
            "where the discrete bound is $\\Delta \\leq 0.05$. "
            "See https://arxiv.org/abs/2301.00000 and https://trueicm.com/docs for details."
        )
        res = ExaKnowledgeBridge.parse_research_context(sample_text, topic="PMev")
        assert isinstance(res, ExaResearchResult)
        assert res.topic == "PMev"
        assert len(res.extracted_formulas) == 2
        assert "PMev(\\sigma) = \\int \\mathcal{V}(x) dx" in res.extracted_formulas
        assert "\\Delta \\leq 0.05" in res.extracted_formulas
        assert len(res.citations) == 2
        assert "https://arxiv.org/abs/2301.00000" in res.citations

    def test_stitch_design_bridge_screen_prompt_generation(self) -> None:
        req = StitchDesignBridge.build_screen_prompt("PMev Heatmap Simulator")
        assert isinstance(req, StitchScreenRequest)
        assert req.screen_name == "PMev Heatmap Simulator"
        assert "#090D16" in req.prompt
        assert "#D4AF37" in req.prompt
        assert "WCAG AAA" in req.prompt

    def test_stitch_extract_tailwind_classes(self) -> None:
        markup = '<div className="bg-slate-950 text-amber-400 p-6 flex flex-col"><button class="rounded-xl px-4 py-2"></button></div>'
        classes = StitchDesignBridge.extract_tailwind_classes(markup)
        assert "bg-slate-950" in classes
        assert "text-amber-400" in classes
        assert "rounded-xl" in classes
        assert "flex-col" in classes

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
        assert metrics["files_count"] == 2
        assert metrics["insertions"] == 3
        assert metrics["deletions"] == 1
        files = metrics["files"]
        assert isinstance(files, list)
        assert "engine/core.py" in files
        assert "tests/test_core.py" in files

    def test_triad_orchestrator_planning_and_dag_generation(self) -> None:
        plan = self.orchestrator.plan_triad_workflow("Simulador de Equidade Flop PMev")
        assert "objective" in plan
        dag_phases = plan["dag_phases"]
        assert isinstance(dag_phases, list)
        assert isinstance(dag_phases, list)
        assert len(dag_phases) == 4
        assert dag_phases[0]["agent"] == "Exa (Neural Research)"
        assert dag_phases[1]["agent"] == "Stitch (Generative UI)"
        assert dag_phases[2]["agent"] == "Google Jules (Cloud VM)"
        assert dag_phases[3]["agent"] == "Antigravity 2.0 (Local Gate)"

    def test_triad_dag_without_receipts_is_not_verified(self) -> None:
        """Negative test: planning is not execution. It used to report verified=True."""
        report = self.orchestrator.execute_triad_dag("Validacao de Teoremas de Vitoi")
        assert isinstance(report, TriadMeshReport)
        assert not report.verified
        assert report.convergence_rate == 0.0
        for status in (report.exa_status, report.stitch_status, report.jules_status):
            assert status.startswith("NOT_EXECUTED"), status
        assert report.total_latency_seconds >= 0

    def test_triad_dag_verified_only_with_three_success_receipts(self) -> None:
        receipts = {p: PhaseReceipt(succeeded=True, evidence=f"run-{p}-001") for p in ("exa", "stitch", "jules")}
        report = self.orchestrator.execute_triad_dag("objective", receipts=receipts)
        assert report.verified
        assert report.convergence_rate == 1.0
        assert "run-exa-001" in report.exa_status

    def test_triad_dag_partial_receipts_report_partial_convergence(self) -> None:
        receipts = {
            "exa": PhaseReceipt(succeeded=True, evidence="exa-session-7"),
            "jules": PhaseReceipt(succeeded=False, evidence="HTTP 500"),
        }
        report = self.orchestrator.execute_triad_dag("objective", receipts=receipts)
        assert not report.verified
        assert report.convergence_rate == pytest.approx(1 / 3)
        assert report.jules_status.startswith("FAILED")
        assert report.stitch_status.startswith("NOT_EXECUTED")

    def test_success_receipt_without_evidence_is_rejected(self) -> None:
        with pytest.raises(ValueError, match="must name its evidence"):
            PhaseReceipt(succeeded=True, evidence="   ")

    def test_unknown_pillar_receipt_is_rejected(self) -> None:
        with pytest.raises(ValueError, match="Unknown triad pillar"):
            self.orchestrator.execute_triad_dag("objective", receipts={"devin": PhaseReceipt(True, "x")})

    def test_pure_ascii_in_triad_files(self) -> None:
        triad_file = ROOT_DIR / "engine" / "sota_triad_mesh.py"
        test_file = ROOT_DIR / "tests" / "test_sota_triad_mesh.py"
        for p in [triad_file, test_file]:
            assert p.is_file(), f"File {p} does not exist"
            text = p.read_text(encoding="utf-8")
            assert all(ord(c) < 128 for c in text), f"Non-ASCII character in {p}"


if __name__ == "__main__":
    unittest.main()
