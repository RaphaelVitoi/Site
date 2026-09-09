"""Verify this internal curation package, not the product or PMev theory.

Usage: python verify.py [--originals]
Writes checks.json beside this file; --originals checks the supplied local files.
Author: Chat GPT-6 Astra <noreply@openai.com>
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def read(name: str) -> dict:
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def require(condition: bool, label: str) -> None:
    if not condition:
        raise ValueError(label)


def close(actual: float, expected: float) -> None:
    require(
        math.isfinite(actual) and math.isclose(actual, expected, abs_tol=1e-10),
        f"Numeric mismatch: {actual} != {expected}",
    )


def expected_value(outcomes: list[dict]) -> float:
    require(bool(outcomes), "Empty outcome distribution")
    for outcome in outcomes:
        for key in ("probability", "value"):
            value = outcome[key]
            require(type(value) in (int, float) and math.isfinite(value), "Nonfinite/non-numeric input")
        require(0 <= outcome["probability"] <= 1, "Probability out of range")
    close(sum(x["probability"] for x in outcomes), 1)
    return sum(x["probability"] * x["value"] for x in outcomes)


def verify(originals: bool) -> dict:
    source_data = read("sources.json")
    sources = {s["id"]: s for s in source_data["sources"]}
    require(len(sources) == len(source_data["sources"]), "Duplicate source ID")
    counts = {}
    original_count = 0
    for sid, source in sources.items():
        path = ROOT / source["text_path"]
        require(digest(path) == source["text_sha256"], f"Text digest: {sid}")
        lines = path.read_text(encoding="utf-8").splitlines()
        counts[sid] = len(lines)
        require(len(lines) == source["blocks"], f"Block count: {sid}")
        for index, line in enumerate(lines, 1):
            require(line.startswith(f"[{index:04}] "), f"Block numbering: {sid}:{index}")
        if originals:
            paths = [source["path"], *source.get("byte_identical_aliases", [])]
            for original in paths:
                require(digest(Path(original)) == source["sha256"], f"Original digest: {original}")
                original_count += 1
        if "same_extracted_text_as" in source:
            other = sources[source["same_extracted_text_as"]]
            require(source["text_sha256"] == other["text_sha256"], "Text deduplication mismatch")
    require(len({s["sha256"] for s in sources.values()}) == source_data["unique_file_hashes"], "Unique hashes")
    require(
        len({s["text_sha256"] for s in sources.values()}) == source_data["distinct_extracted_texts"], "Distinct texts"
    )
    claims = read("hypotheses.json")["claims"]
    ids = {c["id"] for c in claims}
    require(len(ids) == len(claims), "Duplicate claim ID")
    references = 0
    for claim in claims:
        require(claim["enabled_by_default"] is False, "Unexpected production activation")
        for ref in claim["source_refs"]:
            require(
                1 <= ref["first_block"] <= ref["last_block"] <= counts[ref["source_id"]], "Reference outside source"
            )
            references += 1
    for asset in source_data["assets"]:
        require(asset["source"] in sources and len(asset["sha256"]) == 64, "Invalid asset reference")
    experiments = read("experiments.json")
    for experiment in experiments["experiments"]:
        require(set(experiment["hypothesis_ids"]) <= ids, "Unknown experiment hypothesis")
        require(experiment["input_origin"] == "synthetic", "Wrong provenance")
    defense, fold, entry = experiments["experiments"]
    for variant in defense["variants"]:
        gain = variant["aggressor_gain_on_fold"]
        loss = variant["aggressor_loss_when_called"]
        win = variant["defender_gain_vs_bluff"]
        lose = variant["defender_loss_vs_value"]
        require(min(gain, loss, win, lose) > 0, "Interior toy requires positive gains/losses")
        d, b = gain / (gain + loss), lose / (win + lose)
        combos = defense["value_combos"] * b / (1 - b)
        close(d, variant["expected"]["defense_frequency"])
        close(b, variant["expected"]["bluff_fraction_when_betting"])
        close(combos, variant["expected"]["bluff_combos_bet"])
        require(combos <= defense["available_bluff_combos"], "Infeasible interior equilibrium")
        close((1 - d) * gain - d * loss, 0)
        close(b * win - (1 - b) * lose, 0)
    call = fold["call"]
    call_value = expected_value(
        [
            {"probability": call["probability_win"], "value": call["value_win"]},
            {"probability": 1 - call["probability_win"], "value": call["value_loss"]},
        ]
    )
    for variant in fold["variants"]:
        value = expected_value(variant["fold_outcomes"])
        delta = call_value - value
        threshold = (value - call["value_loss"]) / (call["value_win"] - call["value_loss"])
        for key, actual in {
            "fold_value": value,
            "call_value": call_value,
            "call_minus_fold": delta,
            "call_threshold": threshold,
        }.items():
            close(actual, variant["expected"][key])
        close((call_value + 1000) - (value + 1000), delta)
    delta = sum(entry["after_incumbents"]) - sum(entry["before_incumbents"])
    entrants = sum(entry["after_new_players"])
    close(delta, entry["expected"]["incumbent_delta"])
    close(entrants, entry["expected"]["new_player_value"])
    close(delta - (entry["pool_increase"] - entrants), entry["expected"]["residual"])
    diagnostics = experiments["diagnostics"]
    bf = diagnostics["bf_symmetric"]
    close(bf / (1 + bf), diagnostics["expected_required_equity"])
    close(100 * (bf / (1 + bf) - 0.5), diagnostics["expected_rp_pp"])
    close(
        diagnostics["source_reported_rp_bb_pp"] - diagnostics["source_reported_rp_btn_pp"],
        diagnostics["proposed_ra_btn_pp"],
    )
    close(1 - diagnostics["pot_sized_chipev_call_threshold"], diagnostics["one_minus_call_threshold_is_not_mdf"])
    require(
        not math.isclose(
            diagnostics["one_minus_call_threshold_is_not_mdf"], diagnostics["pot_sized_pure_bluff_defense_frequency"]
        ),
        "MDF conflation",
    )
    invalid_distributions = [
        [],
        [{"probability": 1.2, "value": 1}],
        [{"probability": 0.5, "value": 1}],
        [{"probability": 1, "value": float("nan")}],
    ]
    for invalid in invalid_distributions:
        try:
            expected_value(invalid)
        except ValueError:
            pass
        else:
            raise ValueError("Negative control was accepted")
    return {
        "status": "passed",
        "scope": "curation_integrity_and_synthetic_identities_only",
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "original_files_verified": original_count,
        "originals_requested": originals,
        "source_texts_verified": len(sources),
        "claims_verified": len(claims),
        "source_references_verified": references,
        "asset_entries_verified": len(source_data["assets"]),
        "synthetic_experiments_verified": len(experiments["experiments"]),
        "invalid_distributions_rejected": len(invalid_distributions),
        "solver_reproduction": False,
        "production_integration": False,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--originals", action="store_true")
    args = parser.parse_args()
    try:
        result = verify(args.originals)
    except (ValueError, KeyError, OSError) as error:
        result = {"status": "failed", "error": str(error)}
    (ROOT / "checks.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))
    raise SystemExit(0 if result["status"] == "passed" else 1)
