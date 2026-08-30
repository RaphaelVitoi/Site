"""Testes de resolucao de intencao, sinonimos e consistencia para a Smart CLI v2.0."""

from __future__ import annotations

import json
import re
from pathlib import Path
import pytest


def test_intentmap_covers_all_agents():
    """Valida que todos os agentes possuem padroes no intentmap.json."""
    intent_file = Path("data/intentmap.json")
    assert intent_file.exists()

    data = json.loads(intent_file.read_text(encoding="utf-8"))
    assert len(data) >= 18
    assert "@implementor" in data
    assert "@maverick" in data
    assert "@planner" in data
    assert "@validador" in data


def test_aphorisms_exist_and_not_empty():
    """Valida a lista de aforismos do Maverick."""
    aphorisms_file = Path("data/aphorisms.json")
    assert aphorisms_file.exists()

    aphorisms = json.loads(aphorisms_file.read_text(encoding="utf-8"))
    assert isinstance(aphorisms, list)
    assert len(aphorisms) >= 5
    for a in aphorisms:
        assert isinstance(a, str) and len(a) > 0


def test_resolve_intent_heuristics():
    """Valida a precisao da resolucao de intencao heuristica."""
    intent_map = json.loads(Path("data/intentmap.json").read_text(encoding="utf-8"))
    synonyms = json.loads(Path("data/synonyms.json").read_text(encoding="utf-8"))

    def resolve(text: str) -> str:
        text = text.lower()
        # Short-circuit para mencao direta
        m = re.match(r"^(@[a-zA-Z0-9_-]+)", text)
        if m:
            agent = m.group(1)
            if agent in intent_map:
                return agent

        scores = {}
        for agent, cfg in intent_map.items():
            pat = cfg.get("pattern", "")
            agent_syns = synonyms.get(agent, [])
            combined_patterns = [pat] + agent_syns if agent_syns else [pat]

            score = 0
            for p in combined_patterns:
                if not p:
                    continue
                matches = re.findall(p, text, re.IGNORECASE)
                score += len(matches)
            if score > 0:
                scores[agent] = score

        if not scores:
            return "@maverick"
        return max(scores, key=scores.get)

    assert resolve("quero implementar uma tela no frontend") == "@implementor"
    assert resolve("qual o calculo de equity e icm desta mao?") == "@validador"
    assert resolve("estruturar o roadmap e as specs do projeto") == "@planner"
    assert resolve("@auditor verificar conformidade de seguranca") == "@auditor"
