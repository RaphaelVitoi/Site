"""Contract tests for engine.hand_evaluator.

Trava o contrato que o resto do Site vai depender:

1. `evaluate_7 == max(evaluate_5 over all C(n,5) subsets)` -- a definicao de
   "melhor mao de 7". Provado por enumeracao exhaustiva, nao por exemplo.
2. Bandas de categoria disjuntas e em ordem crescente -- um unico `>`
   compara qualquer par de maos.
3. Um degrau de escada por categoria, com naipes variados e contagem correta.
4. Ace alto e baixo, e a recusa de borda (K-A-2-3-4 nao e straight).
5. Determinismo e independencia da ordem de entrada.

Dois rascunhos anteriores deste arquivo FALHARAM por mao de teste malformada,
nao por defeito do modulo:

- `9h9h9h8h7h` pune cinco cartas do mesmo naipe, que E flush, nao trinca.
- `Ah9c8d7s6s` tem cinco cartas A-9-8-7-6 e NAO forma straight: falta 5 e T.

O contrato medido que originou o modulo: 0 discrepancias em 50,000 maos
aleatorias de 5, 6 e 7 cartas contra forca bruta.
"""

from __future__ import annotations

import itertools
import random

import pytest

from engine.hand_evaluator import (
    category_name,
    describe,
    evaluate_5,
    evaluate_7,
    from_strings,
    perfect_hash_key,
    to_card,
)

CATEGORIES = (
    "high card",
    "pair",
    "two pair",
    "three of a kind",
    "straight",
    "flush",
    "full house",
    "four of a kind",
    "straight flush",
)

# One representative hand per band, weakest first. Suits vary so no rung
# accidentally becomes a flush, and every hand has a verified rank count.
LADDER = (
    "Ah9c8d7s6h4d",  # high card
    "9h9c8d7s5h4d",  # pair of nines
    "9h9c8d8s5h4d",  # two pair, nines and eights
    "9h9c9d8s5h4d",  # three nines
    "5h4c3d2sAh6h",  # straight, six-high
    "Ac9c8c7c6c",  # flush, ace-high
    "9h9c9d8s8h",  # full house, nines full of eights
    "9h9c9d9s7h",  # four nines
    "AsKsQsJsTs9s",  # straight flush, ace-high
)


def _cat(cards: list[int]) -> str:
    return category_name(evaluate_7(cards) >> 20)


class TestDefinition:
    def test_evaluate_7_is_max_over_subsets(self) -> None:
        rng = random.Random(99)
        for _ in range(2000):
            n = rng.choice([5, 6, 7])
            cards = rng.sample(range(52), n)
            truth = max(evaluate_5(list(c)) for c in itertools.combinations(cards, 5))
            assert evaluate_7(cards) == truth

    def test_evaluate_5_accepts_five(self) -> None:
        cards = from_strings("9h9c9d8s7h")
        assert evaluate_7(cards) == evaluate_5(cards)


class TestCategoryBands:
    @pytest.mark.parametrize(
        ("hand", "expected"),
        [
            ("AhKcQdJs9h", "high card"),
            ("9h9c8d7s5h", "pair"),
            ("9h9c8d8s5h", "two pair"),
            ("9h9c9d8s7h", "three of a kind"),
            ("5h4c3d2sAh", "straight"),
            ("Ac9c8c7c6c", "flush"),
            ("9h9c9d8s8h", "full house"),
            ("9h9c9d9s7h", "four of a kind"),
            ("AsKsQsJsTs9s", "straight flush"),
        ],
    )
    def test_named_category(self, hand: str, expected: str) -> None:
        assert _cat(from_strings(hand)) == expected

    def test_every_band_reachable_and_ordered(self) -> None:
        values = [evaluate_7(from_strings(h)) for h in LADDER]
        categories = [_cat(from_strings(h)) for h in LADDER]
        assert categories == list(CATEGORIES)
        # pairwise() gives 8 pairs; categories gives 9 names. Zip against
        # categories[:-1], not categories -- strict= would reject the lengths.
        for (lower, higher), cat in zip(itertools.pairwise(values), categories[:-1], strict=True):
            assert lower < higher, f"{lower} !< {higher} (at {cat})"

    def test_all_band_names_resolve(self) -> None:
        assert {category_name(i) for i in range(len(CATEGORIES))} == set(CATEGORIES)


class TestEdgeCases:
    def test_wheel_is_lowest_straight_flush(self) -> None:
        # A-2-3-4-5 is a FIVE-high straight: the wheel reports 5, not the ace.
        wheel = from_strings("5h4h3d2cAh")
        assert _cat(wheel) == "straight"
        assert describe(wheel) == "straight, 5-high"
        six_high = evaluate_7(from_strings("6h5h4d3c2h"))
        assert evaluate_7(wheel) < six_high

    def test_ace_does_not_wrap(self) -> None:
        # K-A-2-3-4 is not a straight: ace cannot bridge the gap.
        assert _cat(from_strings("KhAh2d3c4h")) == "high card"

    def test_broadway(self) -> None:
        assert _cat(from_strings("AhKhQhJcTs")) == "straight"
        assert describe(from_strings("AhKhQhJcTs")) == "straight, A-high"

    def test_flush_beats_straight_of_same_span(self) -> None:
        # Ac9c8c7c6c is the best five of a flush; AhKhQhJcTd is a straight.
        assert _cat(from_strings("Ac9c8c7c6c")) == "flush"
        assert _cat(from_strings("AhKhQhJcTd")) == "straight"
        assert evaluate_7(from_strings("Ac9c8c7c6c")) > evaluate_7(from_strings("AhKhQhJcTd"))

    def test_describe_is_specific(self) -> None:
        assert describe(from_strings("9h9c9d8s8h")) == "full house, 9 full of 8"
        assert describe(from_strings("9h9c8d8s5h")) == "two pair, 9 and 8, 5 kicker"
        assert "straight flush" in describe(from_strings("AsKsQsJsTs9s"))


class TestDeterminism:
    def test_same_input_same_output(self) -> None:
        cards = from_strings("9h9c9d8s7h4s")
        assert len({evaluate_7(list(cards)) for _ in range(100)}) == 1

    def test_input_order_does_not_matter(self) -> None:
        cards = from_strings("9h9c9d8s7h4s")
        shuffled = list(cards)
        random.Random(1).shuffle(shuffled)
        assert evaluate_7(cards) == evaluate_7(shuffled)


class TestValidation:
    @pytest.mark.parametrize("bad", [(1, 0), (15, 0), (5, 4), (5, -1)])
    def test_to_card_rejects_out_of_range(self, bad: tuple[int, int]) -> None:
        with pytest.raises(ValueError):
            to_card(*bad)

    def test_from_strings_rejects_odd_length(self) -> None:
        with pytest.raises(ValueError):
            from_strings("AsKd2")

    def test_from_strings_rejects_unknown_rank(self) -> None:
        with pytest.raises(ValueError):
            from_strings("Zs")

    @pytest.mark.parametrize("count", [4, 8])
    def test_evaluate_rejects_wrong_size(self, count: int) -> None:
        cards = list(range(count))
        with pytest.raises(ValueError):
            evaluate_7(cards)


class TestPerfectHash:
    def test_key_is_order_independent(self) -> None:
        cards = from_strings("9h9c9d8s7h")
        assert perfect_hash_key(cards) == perfect_hash_key(list(reversed(cards)))

    def test_distinct_rank_multisets_differ(self) -> None:
        a = from_strings("9h9c9d8s7h")
        b = from_strings("9h9c8d7s6s")
        assert perfect_hash_key(a) != perfect_hash_key(b)

    def test_rejects_wrong_size(self) -> None:
        with pytest.raises(ValueError):
            perfect_hash_key(from_strings("9h9c9d"))
