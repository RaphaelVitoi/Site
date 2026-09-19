"""Regressoes de contagem e falhas de filesystem na auditoria refatorada."""

from pathlib import Path
import re
from unittest.mock import Mock

from scripts.maintenance import audit_infrastructure_pillars as audit


def test_log_counts_each_matching_pattern(tmp_path, monkeypatch):
    monkeypatch.setattr(audit, "BASE_DIR", tmp_path)
    monkeypatch.setattr(audit, "SECRET_PATTERNS", [re.compile("first"), re.compile("second")])
    log = tmp_path / "sample.log"
    log.write_text("first first second", encoding="utf-8")
    errors, warnings = [], []
    stats = {"files_scanned": 0, "bytes_total": 0, "leaks_detected": 0}

    audit._audit_log_file(log, errors, warnings, stats)

    assert stats == {"files_scanned": 1, "bytes_total": log.stat().st_size, "leaks_detected": 2}
    assert len(errors) == 2
    assert not warnings


def test_purge_stat_failure_warns_without_deleting():
    directory = Mock(spec=Path)
    directory.name = "pytest_sample"
    directory.stat.side_effect = PermissionError("denied")
    warnings = []

    assert not audit._purge_expired_pytest_dir(directory, 100000, warnings)

    directory.rmdir.assert_not_called()
    assert len(warnings) == 1
    assert "pytest_sample" in warnings[0]
    assert "denied" in warnings[0]
