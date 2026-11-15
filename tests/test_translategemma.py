"""Testes de unidade e integracao SOTA para TranslateGemma, Laya PMev corpus e TimesFM 3.0."""

from __future__ import annotations

import base64
import json
from pathlib import Path
from typing import Any

from aiohttp.test_utils import make_mocked_request
import numpy as np
import pytest
from typer.testing import CliRunner

from api.v1.handlers import handle_translate
from engine.timesfm_engine import (
    TIMESFM_30_330M,
    ExecutionMode,
    TimesFMEngine,
    TimesFMGovernanceError,
    _build_3p0_covariates_arrays,
)
from llm import translategemma as tg
from llm.antigravity_sdk_bridge import LOCAL_OPTIMIZED_MODELS
from llm.laya_bridge import normalize_state_with_translategemma
from llm.system2_local import SYSTEM2_TIERS, resolve_model
from scripts.cli.nexus import app as nexus_cli_app
from scripts.ops.treinar_laya_s1_lora import (
    _build_calibration_pairs,
    carregar_dados_treinamento,
    seed_pmev_corpus_into_sqlite,
)

REPO_ROOT = Path(__file__).resolve().parents[1]


@pytest.mark.unit
def test_detect_source_language_and_normalize_lang_code() -> None:
    assert tg.detect_source_language("Qual o SPR e o MDF no turn quando o vilao faz overbet?") == "pt-BR"
    assert tg.detect_source_language("Cuando el villano hace 3-bet desde CO, cual es el rango?") == "es"
    assert tg.detect_source_language("Hero opens BTN 2.2bb and defends vs BB 3-bet on Kd Jc Ts.") == "en"
    assert tg.detect_source_language("ICMとPMevの計算を確認する") == "ja"

    assert tg.normalize_lang_code("pt_br") == ("pt-BR", "Portuguese")
    assert tg.normalize_lang_code("en") == ("en", "English")
    assert tg.normalize_lang_code("zh") == ("zh-CN", "Chinese")


@pytest.mark.unit
def test_build_translategemma_prompt_poker_glossary() -> None:
    prompt = tg.build_translategemma_prompt(
        "Defend BB with PMev on bubble",
        source_lang="en",
        target_lang="pt-BR",
        domain="poker",
        glossary_terms=["TrueICM", "HeroPool"],
    )
    assert "English (en) to Portuguese (pt-BR)" in prompt
    assert "PMev, ICMev, ICM, GTO" in prompt
    assert "TrueICM, HeroPool" in prompt
    assert prompt.endswith("\n\n\nDefend BB with PMev on bubble")


@pytest.mark.unit
def test_translate_text_same_language_noop_passthrough() -> None:
    res = tg.translate_text("ICM bubble pressure in BB", target_lang="en", source_lang="en", domain="poker")
    assert res.skipped is True
    assert res.latency_ms == 0.0
    assert res.provenia.cost_usd == 0.0
    assert res.provenia.engine_id == "translategemma-noop-passthrough"
    assert res.text == "ICM bubble pressure in BB"


@pytest.mark.unit
def test_translate_text_local_ollama_path_with_code_shield(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: list[dict[str, Any]] = []

    def _fake_post(
        url: str,
        payload: dict[str, Any],
        *,
        headers: dict[str, str],
        timeout_s: float,
        require_https: bool,
    ) -> tuple[int, dict[str, Any]]:
        _ = (headers, timeout_s, require_https)
        captured.append({"url": url, "payload": payload})
        return 200, {"message": {"content": "Traducao PMev e GTO com [[TG_CODE_0]] e [[TG_CODE_1]]"}}

    monkeypatch.setattr(tg, "_ollama_model_fits_ram", lambda _m: True)
    monkeypatch.setattr(tg, "ollama_online", lambda: True)
    monkeypatch.setattr(tg, "_post_json_endpoint", _fake_post)

    src = "Use PMev and GTO from https://trueicm.com:\n```python\nx = 1\n```"
    res = tg.translate_text(src, target_lang="pt-BR", source_lang="en", domain="tech")

    assert res.skipped is False
    assert res.provenia.engine_id == "translategemma-local-ollama"
    assert res.provenia.model_used == "translategemma:4b"
    assert res.provenia.fallback_used is False
    assert res.provenia.cost_usd == 0.0
    assert "https://trueicm.com" in res.text
    assert "```python\nx = 1\n```" in res.text
    assert "PMev" in res.preserved_terms
    assert "GTO" in res.preserved_terms
    assert captured[0]["url"].endswith("/api/chat")
    assert captured[0]["payload"]["options"]["temperature"] == pytest.approx(0.1)


@pytest.mark.unit
def test_translate_text_cloud_fallback_media_pool_gemini(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(tg, "_ollama_model_fits_ram", lambda _m: False)
    monkeypatch.setattr(tg, "ollama_online", lambda: False)
    monkeypatch.setenv("GEMINI_TRANSLATE_KEY", "AIzaDummyTranslateKey12345")
    monkeypatch.setenv("MEDIA_POOL_PROVIDER", "aistudio")
    monkeypatch.delenv("OPENROUTER_GEMINI_TRANSLATE_KEY", raising=False)
    monkeypatch.delenv("OPENROUTER_TRANSLATE_KEY", raising=False)
    tg.media_pool_manager.reload(read_registry=False)

    seen_headers: list[dict[str, str]] = []

    def _fake_post(
        url: str,
        payload: dict[str, Any],
        *,
        headers: dict[str, str],
        timeout_s: float,
        require_https: bool,
    ) -> tuple[int, dict[str, Any]]:
        _ = (url, payload, timeout_s)
        assert require_https is True
        seen_headers.append(headers)
        return 200, {"candidates": [{"content": {"parts": [{"text": "Pressao ICM alta no BTN."}]}}]}

    monkeypatch.setattr(tg, "_post_json_endpoint", _fake_post)
    try:
        res = tg.translate_text("High ICM pressure on BTN.", target_lang="pt-BR", source_lang="en", domain="poker")
    finally:
        monkeypatch.undo()
        tg.media_pool_manager.reload()

    assert res.skipped is False
    assert res.provenia.fallback_used is True
    assert res.provenia.engine_id == "media-pool-aistudio"
    assert seen_headers[0]["x-goog-api-key"] == "AIzaDummyTranslateKey12345"
    assert "ICM" in res.preserved_terms
    assert "BTN" in res.preserved_terms


@pytest.mark.unit
def test_translate_image_vision_payload_base64(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    img_path = tmp_path / "solver.png"
    raw_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    img_path.write_bytes(raw_png)

    captured_images: list[list[str]] = []

    def _fake_post(
        url: str,
        payload: dict[str, Any],
        *,
        headers: dict[str, str],
        timeout_s: float,
        require_https: bool,
    ) -> tuple[int, dict[str, Any]]:
        _ = (url, headers, timeout_s, require_https)
        captured_images.append(payload["messages"][0]["images"])
        return 200, {"message": {"content": "BTN 25bb shove vs BB call PMev"}}

    monkeypatch.setattr(tg, "_ollama_model_fits_ram", lambda _m: True)
    monkeypatch.setattr(tg, "ollama_online", lambda: True)
    monkeypatch.setattr(tg, "_post_json_endpoint", _fake_post)

    res = tg.translate_image(img_path, target_lang="pt-BR", source_lang="en", domain="poker")
    assert res.provenia.engine_id == "translategemma-vision-local-ollama"
    assert res.provenia.runtime_used == "ollama-vision"
    assert captured_images[0][0] == base64.b64encode(raw_png).decode("ascii")
    assert "PMev" in res.preserved_terms


@pytest.mark.unit
def test_system2_tier_and_manifest_consumers_harmonized() -> None:
    assert SYSTEM2_TIERS["translate"] == "translategemma_4b"
    assert resolve_model("translategemma_4b") == "translategemma:4b"
    assert LOCAL_OPTIMIZED_MODELS["translategemma"] == "translategemma:4b"

    manifest = json.loads((REPO_ROOT / "data" / "ollama_models.json").read_text(encoding="utf-8"))
    entry = next(m for m in manifest["models"] if m["alias"] == "translategemma_4b")
    assert entry["tag"] == "translategemma:4b"
    assert len(entry["consumers"]) >= 5
    for rel_path in entry["consumers"]:
        assert (REPO_ROOT / rel_path).is_file(), f"Consumidor ausente no disco: {rel_path}"


@pytest.mark.unit
def test_laya_bridge_normalize_state_with_translategemma(monkeypatch: pytest.MonkeyPatch) -> None:
    dict_state, meta_dict = normalize_state_with_translategemma({"pot": 12})
    assert dict_state == {"pot": 12}
    assert meta_dict["normalized"] is False

    monkeypatch.setattr(
        tg,
        "_call_ollama_translate",
        lambda **_kw: ("Hero is on BTN facing SB 3-bet in ICM bubble.", 12.5),
    )
    monkeypatch.setattr(tg, "_ollama_model_fits_ram", lambda _m: True)
    monkeypatch.setattr(tg, "ollama_online", lambda: True)

    text_out, meta_text = normalize_state_with_translategemma(
        "Hero esta no BTN enfrentando 3-bet do SB na bolha de ICM."
    )
    assert "Hero is on BTN" in str(text_out)
    assert meta_text["normalized"] is True
    assert meta_text["source_lang"] == "pt-BR"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_api_handle_translate_validation_and_success(monkeypatch: pytest.MonkeyPatch) -> None:
    bad_req = make_mocked_request("POST", "/api/v1/translate")

    async def _bad_json() -> Any:
        raise ValueError("invalid json")

    bad_req.json = _bad_json  # type: ignore[method-assign]
    resp_400 = await handle_translate(bad_req)
    assert resp_400.status == 400

    empty_req = make_mocked_request("POST", "/api/v1/translate")

    async def _empty_json() -> dict[str, Any]:
        return {"text": "   ", "domain": "poker"}

    empty_req.json = _empty_json  # type: ignore[method-assign]
    resp_empty = await handle_translate(empty_req)
    assert resp_empty.status == 400

    monkeypatch.setattr(tg, "_ollama_model_fits_ram", lambda _m: True)
    monkeypatch.setattr(tg, "ollama_online", lambda: True)
    monkeypatch.setattr(tg, "_call_ollama_translate", lambda **_kw: ("Pressao ICM no turn.", 9.4))

    ok_req = make_mocked_request("POST", "/api/v1/translate")

    async def _ok_json() -> dict[str, Any]:
        return {"text": "ICM pressure on turn.", "target_lang": "pt-BR", "source_lang": "en", "domain": "poker"}

    ok_req.json = _ok_json  # type: ignore[method-assign]
    resp_ok = await handle_translate(ok_req)
    assert resp_ok.status == 200
    body = json.loads(resp_ok.text or "{}")
    assert body["status"] == "SUCCESS"
    assert body["text"] == "Pressao ICM no turn."
    assert body["provenia"]["model_used"] == "translategemma:4b"


@pytest.mark.unit
def test_cli_nexus_translate_json(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(tg, "_ollama_model_fits_ram", lambda _m: True)
    monkeypatch.setattr(tg, "ollama_online", lambda: True)
    monkeypatch.setattr(tg, "_call_ollama_translate", lambda **_kw: ("Fold with negative PMev.", 8.1))

    runner = CliRunner()
    res = runner.invoke(nexus_cli_app, ["translate", "Foldar com PMev negativo.", "--tgt", "en", "--json"])
    assert res.exit_code == 0, res.output
    data = json.loads(res.stdout)
    assert data["text"] == "Fold with negative PMev."
    assert data["provenia"]["cost_usd"] == 0.0


@pytest.mark.unit
def test_timesfm_30_covariate_builder_and_license_gate() -> None:
    with pytest.raises(TimesFMGovernanceError):
        TimesFMEngine(mode=ExecutionMode.COMMERCIAL_PRODUCTION, preferred_model_key=TIMESFM_30_330M)

    po_arr, pf_arr = _build_3p0_covariates_arrays(
        history_len=16,
        horizon=4,
        past_covariates={"bb": [float(i) for i in range(16)], "past_only": [1.0] * 16},
        future_covariates={"bb": [float(16 + i) for i in range(4)], "fut_only": [2.0] * 4},
    )
    assert po_arr is not None
    assert po_arr.shape == (1, 16)
    assert pf_arr is not None
    assert pf_arr.shape == (2, 20)
    assert np.allclose(pf_arr[0], np.arange(20, dtype=np.float32))


@pytest.mark.unit
def test_seed_pmev_corpus_idempotent(tmp_path: Path) -> None:
    db_file = tmp_path / "dream_test.db"
    inserted_1 = seed_pmev_corpus_into_sqlite(db_path=db_file, data_dir=REPO_ROOT / "data")
    assert inserted_1 >= 50
    inserted_2 = seed_pmev_corpus_into_sqlite(db_path=db_file, data_dir=REPO_ROOT / "data")
    assert inserted_2 == 0

    dataset = carregar_dados_treinamento(db_path=str(db_file))
    pairs = _build_calibration_pairs(dataset)
    assert len(pairs) == inserted_1
    textures = {item["board_texture"] for item in dataset}
    assert {"dry", "wet", "monotone", "paired"} <= textures
    for _text, _qs, targets in pairs:
        assert len(targets["bubble_danger"]) == 2
        assert sum(targets["bubble_danger"]) == pytest.approx(1.0)
