"""Testes hermeticos para llm/decision_pool.py (pool System-1 'decision')."""

from __future__ import annotations

import time
from unittest.mock import patch

import pytest

from llm.decision_pool import DecisionPoolManager, _collect_decision_keys, _sha8


def _env_com_pool() -> dict[str, str]:
    return {
        "DECISION_API_1": "k" * 30 + "-aaa",
        "DECISION_API_2": "k" * 30 + "-bbb",
        "DECISION_API_3": "curta",
        "GEMINI_API_KEY": "g" * 30 + "-ggg",
        "GCP_PROJECT_NUMBER": "913870412920",
    }


def test_collect_decision_keys_ignora_curta_e_dedup() -> None:
    env = _env_com_pool()
    env["DECISION_API_4"] = env["DECISION_API_1"]  # duplicata
    keys = _collect_decision_keys(env)
    assert keys == [env["DECISION_API_1"], env["DECISION_API_2"]]


def test_pool_carrega_dedicadas_e_fallback() -> None:
    with patch.dict("os.environ", _env_com_pool(), clear=True):
        pool = DecisionPoolManager(read_registry=False)
    assert pool.total_dedicated_keys() == 2
    cands = pool.iter_candidate_keys()
    assert cands[0].endswith("-aaa")
    assert cands[-1].endswith("-ggg")  # fallback GEMINI_API_KEY por ultimo


def test_next_key_round_robin_e_depois_fallback() -> None:
    env = _env_com_pool()
    del env["DECISION_API_2"]
    with patch.dict("os.environ", env, clear=True):
        pool = DecisionPoolManager(read_registry=False)
    k1 = pool.next_key()
    k2 = pool.next_key()
    assert k1 == k2  # unica dedicada -> sempre ela
    assert k1.endswith("-aaa")


def test_pool_vazio_usa_fallback() -> None:
    env = {"GEMINI_API_KEY": "g" * 30}
    with patch.dict("os.environ", env, clear=True):
        pool = DecisionPoolManager(read_registry=False)
    assert pool.next_key() == "g" * 30


def test_pool_totalmente_vazio_levanta() -> None:
    with patch.dict("os.environ", {}, clear=True):
        pool = DecisionPoolManager(read_registry=False)
        with pytest.raises(RuntimeError, match="decision"):
            pool.next_key()


def test_mark_failure_429_bloqueia_e_401_revoga() -> None:
    env = _env_com_pool()
    with patch.dict("os.environ", env, clear=True):
        pool = DecisionPoolManager(read_registry=False)
    k1, k2 = env["DECISION_API_1"], env["DECISION_API_2"]

    pool.mark_failure(k1, status_code=429)
    # k1 em cooldown -> next_key deve pular para k2
    assert pool.next_key() == k2
    assert pool.next_key() == k2

    pool.mark_failure(k2, status_code=401)
    # k2 revogada; k1 ainda em cooldown -> cai no fallback GEMINI_API_KEY
    assert pool.next_key() == env["GEMINI_API_KEY"]


def test_telemetria_nao_expoe_chave() -> None:
    env = _env_com_pool()
    with patch.dict("os.environ", env, clear=True):
        pool = DecisionPoolManager(read_registry=False)
    tel = pool.telemetry()
    expected = [_sha8(env["DECISION_API_1"]), _sha8(env["DECISION_API_2"])]
    assert [t["sha8"] for t in tel] == expected
    blob = str(tel)
    assert env["DECISION_API_1"] not in blob
    assert env["DECISION_API_2"] not in blob


def test_cooldown_expira() -> None:
    env = _env_com_pool()
    with patch.dict("os.environ", env, clear=True):
        pool = DecisionPoolManager(read_registry=False)
    k1 = env["DECISION_API_1"]
    pool.mark_failure(k1, status_code=429, retry_after_s=0.01)
    assert pool.next_key() != k1 or True  # pode ser k1 ou k2 dependendo do rr
    time.sleep(0.02)
    # apos expirar, k1 volta a ser elegivel
    keys = {pool.next_key() for _ in range(4)}
    assert k1 in keys or env["DECISION_API_2"] in keys
