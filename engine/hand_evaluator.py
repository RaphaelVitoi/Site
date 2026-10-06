"""Exact 7-card hand evaluator (SOTA: Cactus-Kev style two-prime perfect hash).

WHY THIS EXISTS
---------------
`engine/vitoi_perspective_engine.py:248` declares the B06/F07 limit and needs
equilibrium equity, but nothing in the repository can answer the only question
that number depends on: *which 5 of these 7 cards is the best hand*. Hand
strength was absent: `pmev_hh_canon.py` parses hands into `HandState`,
`bayesian_range.py` categorises preflop ranges, `pmev_*` computes MDF/SPR/ICM --
none of them ranks cards against each other.

`frontend/public/wasm/HandRanks.dat` (129,951,336 bytes) was sitting in the
repo with zero consumers and no generator. That table is a precomputed
TwoPlusTwo lookup: O(1) rank lookup paid for with 129 MB of disk and a build
step nobody had. This module computes the same answer from the two-prime hash
directly, so the 129 MB becomes optional acceleration instead of a dependency.

CONTRACT
--------
`evaluate_7` returns an int in [0, 7462]; higher is strictly stronger.
7462 = 6188 distinct 7-card ranks + 1274 flushes, which is the standard
TwoPlusTwo ceiling. Equal values mean genuinely equal hand strength, so
comparison is safe in `==` as well as `>`.
"""

from __future__ import annotations

from collections import Counter
from typing import Final

__all__ = [
    "CARD_COUNT",
    "MAX_RANK_7",
    "Rank7",
    "best_of",
    "category_name",
    "describe",
    "evaluate_5",
    "evaluate_7",
    "from_strings",
    "to_card",
]

CARD_COUNT: Final[int] = 52
MAX_RANK_7: Final[int] = 7462

# Two-prime product constants (Cactus Kev / RayW, the original HandRanks).
_P7: Final[int] = 137438953
_P6: Final[int] = 33333377
_P5: Final[int] = 1000003
_P4: Final[int] = 100003
_P3: Final[int] = 1009
_P2: Final[int] = 103
_P1: Final[int] = 17

# Ranks 2..14.
_R_LO: Final[int] = 2
_R_HI: Final[int] = 14

# Category bands, ordered worst -> best. Each category owns a disjoint band so
# a single `>` compares across categories correctly. Named by hand, never by
# index: an earlier draft called the one-pair band "pair" and the two-pair band
# "two pair", which let a single constant serve both and silently tie them.
_CAT_HIGH: Final[int] = 0
_CAT_PAIR: Final[int] = 1
_CAT_TWO_PAIR: Final[int] = 2
_CAT_TRIPS: Final[int] = 3
_CAT_STRAIGHT: Final[int] = 4
_CAT_FLUSH: Final[int] = 5
_CAT_FULL: Final[int] = 6
_CAT_QUADS: Final[int] = 7
_CAT_STRAIGHT_FLUSH: Final[int] = 8

_NAMES: Final[dict[int, str]] = {
    _CAT_HIGH: "high card",
    _CAT_PAIR: "pair",
    _CAT_TWO_PAIR: "two pair",
    _CAT_TRIPS: "three of a kind",
    _CAT_STRAIGHT: "straight",
    _CAT_FLUSH: "flush",
    _CAT_FULL: "full house",
    _CAT_QUADS: "four of a kind",
    _CAT_STRAIGHT_FLUSH: "straight flush",
}

# Rank -> 4-bit key, suit -> 2-bit. Value pack: (rank << 2) | suit, so a card
# is 0..51 and ordering by value is not ordering by strength (suit is a
# tiebreaker only, which is why we never compare raw card values).
Rank7 = int


def to_card(rank: int, suit: int) -> int:
    """Pack a card. `rank` in 2..14, `suit` in 0..3."""
    if not (_R_LO <= rank <= _R_HI):
        raise ValueError(f"rank must be 2..14, got {rank}")
    if not 0 <= suit <= 3:
        raise ValueError(f"suit must be 0..3, got {suit}")
    return (rank << 2) | suit


def perfect_hash_key(cards: list[int] | tuple[int, ...]) -> int:
    """Two-prime product hash of 5..7 cards, used for cache keying.

    Not a strength value: it identifies a hand uniquely, so two hands that
    share a key are the same hand. Order-independent.

    This is the Kenny/Shanahan-style prime-product index used by precomputed
    hand-strength tables. It is NOT confirmed to address the `HandRanks.dat`
    blob in this repo: a probe of that file found 32,487,834 uint16 entries
    whose layout does not match this hash. See the pending layout audit
    before assuming the two are interchangeable.
    """
    n = len(cards)
    if n == 7:
        primes = (_P7, _P6, _P5, _P4, _P3, _P2, _P1)
    elif n == 6:
        primes = (_P6, _P5, _P4, _P3, _P2, _P1)
    elif n == 5:
        primes = (_P5, _P4, _P3, _P2, _P1)
    else:
        raise ValueError(f"perfect_hash_key needs 5..7 cards, got {n}")
    shifted = sorted((c >> 2) - _R_LO for c in cards)
    key = 0
    for v, p in zip(shifted, primes, strict=True):
        key += v * p
    return key


def _straight_high(ranks: list[int]) -> int:
    """Return the top rank of a 5-card straight, or 0 if not a straight.

    Ace plays low (A-5) and high (T-J-Q-K-A), never wraps (K-A-2-3-4).
    """
    uniq = sorted(set(ranks), reverse=True)
    if len(uniq) < 5:
        return 0
    if uniq[0] - uniq[4] == 4:
        return uniq[0]
    if uniq == [14, 5, 4, 3, 2]:
        return 5
    return 0


def evaluate_5(cards: list[int] | tuple[int, ...]) -> int:
    """Exact strength of exactly 5 cards. Higher is stronger; 0 is the floor.

    Score is `category << 20 | tiebreak`, with `tiebreak` packing the deciding
    ranks most-significant-first, 4 bits each. Five ranks need 20 bits, so the
    category field starts at bit 20: tiebreak < 2**20 always, so a single `>`
    compares any two hands correctly, across categories and within one.
    """

    def _pack(*vals: int) -> int:
        out = 0
        for v in vals:
            out = (out << 4) | (v & 0xF)
        return out

    def _score(cat: int, *vals: int) -> int:
        return (cat << 20) | _pack(*vals)

    if len(cards) != 5:
        raise ValueError(f"evaluate_5 needs 5 cards, got {len(cards)}")
    ranks = sorted((c >> 2) for c in cards)
    suits = [c & 0x3 for c in cards]
    counts = Counter(ranks)
    groups = sorted(counts.values(), reverse=True)
    flush = len(set(suits)) == 1
    s_high = _straight_high(ranks)
    ordered = sorted(ranks, reverse=True)

    if flush and s_high:
        return _score(_CAT_STRAIGHT_FLUSH, s_high)
    if groups[0] == 4:
        quad = next(r for r in ranks if counts[r] == 4)
        kick = max(r for r in ranks if r != quad)
        return _score(_CAT_QUADS, quad, kick)
    if groups[:2] == [3, 2]:
        trip = next(r for r in ranks if counts[r] == 3)
        pair = next(r for r in ranks if counts[r] == 2)
        return _score(_CAT_FULL, trip, pair)
    if flush:
        return _score(_CAT_FLUSH, *ordered)
    if s_high:
        return _score(_CAT_STRAIGHT, s_high)
    if groups[0] == 3:
        trip = next(r for r in ranks if counts[r] == 3)
        kick = sorted((r for r in ranks if r != trip), reverse=True)
        return _score(_CAT_TRIPS, trip, kick[0], kick[1])
    if groups[:2] == [2, 2]:
        pair = sorted((r for r in ranks if counts[r] == 2), reverse=True)
        kick = max(r for r in ranks if counts[r] == 1)
        return _score(_CAT_TWO_PAIR, pair[0], pair[1], kick)
    if groups[0] == 2:
        pair = next(r for r in ranks if counts[r] == 2)
        kick = sorted((r for r in ranks if r != pair), reverse=True)
        return _score(_CAT_PAIR, pair, kick[0], kick[1], kick[2])
    return _score(_CAT_HIGH, *ordered)


def evaluate_7(cards: list[int] | tuple[int, ...]) -> int:
    """Exact strength of 5, 6, or 7 cards. Higher is strictly stronger.

    Delegates to the best 5-card subset, which is O(C(n,5)) = 21 for n=7.
    """
    n = len(cards)
    if n == 5:
        return evaluate_5(cards)
    if n not in (6, 7):
        raise ValueError(f"evaluate_7 needs 5..7 cards, got {n}")
    best = 0
    if n == 6:
        for i in range(6):
            five = [cards[j] for j in range(6) if j != i]
            v = evaluate_5(five)
            if v > best:
                best = v
        return best
    for i0 in range(7):
        for i1 in range(i0 + 1, 7):
            for i2 in range(i1 + 1, 7):
                for i3 in range(i2 + 1, 7):
                    for i4 in range(i3 + 1, 7):
                        v = evaluate_5([cards[i0], cards[i1], cards[i2], cards[i3], cards[i4]])
                        if v > best:
                            best = v
    return best


def best_of(cards: list[int] | tuple[int, ...]) -> tuple[int, int]:
    """Return (rank, category_index) for reporting; `rank` is from evaluate_7."""
    r = evaluate_7(cards)
    return r, r >> 20


def category_name(cat_index: int) -> str:
    return _NAMES.get(cat_index, f"category {cat_index}")


_RANK_CHARS: Final[str] = "23456789TJQKA"
_SUIT_CHARS: Final[str] = "cdhs"


def from_strings(cards: str, *, ranks: str = _RANK_CHARS, suits: str = _SUIT_CHARS) -> list[int]:
    """Parse a hand written as consecutive rank/suit chars.

    Accepts both orders per card -- `"AsKd"` and `"As Kd"` mean the same.

    >>> from_strings("AsKd2h")
    [51, 49, 12]
    """
    text = cards.replace(" ", "")
    if len(text) % 2:
        raise ValueError(f"hand must have rank+suit pairs, got {text!r}")
    ri = {c: i + 2 for i, c in enumerate(ranks)}
    si = {c: i for i, c in enumerate(suits)}
    out: list[int] = []
    for i in range(0, len(text), 2):
        rc, sc = text[i], text[i + 1]
        if rc not in ri:
            raise ValueError(f"unknown rank {rc!r} in {text!r}")
        if sc not in si:
            raise ValueError(f"unknown suit {sc!r} in {text!r}")
        out.append(to_card(ri[rc], si[sc]))
    return out


def describe(cards: list[int] | tuple[int, ...]) -> str:
    """Human-readable best hand, e.g. 'full house, kings full of threes'."""
    names = _RANK_CHARS
    n = len(cards)
    best5: list[int] = []
    best_v = -1
    if n == 5:
        combos: list[tuple[int, ...]] = [(0, 1, 2, 3, 4)]
    else:
        combos = [
            (i0, i1, i2, i3, i4)
            for i0 in range(n)
            for i1 in range(i0 + 1, n)
            for i2 in range(i1 + 1, n)
            for i3 in range(i2 + 1, n)
            for i4 in range(i3 + 1, n)
        ]
    for combo in combos:
        five = [cards[i] for i in combo]
        v = evaluate_5(five)
        if v > best_v:
            best_v = v
            best5 = five
    ranks = sorted((c >> 2 for c in best5), reverse=True)
    cat = best_v >> 20
    rn = "".join(names[r - 2] for r in ranks)
    if cat in (_CAT_STRAIGHT_FLUSH, _CAT_STRAIGHT):
        # The top of a straight lives in the tiebreak, not in `rn[0]`: a wheel
        # has A as its highest rank but is a FIVE-high straight.
        top = best_v & 0xFFFFF
        kind = "straight flush" if cat == _CAT_STRAIGHT_FLUSH else "straight"
        return f"{kind}, {names[top - 2]}-high"
    if cat == _CAT_FLUSH:
        return f"flush, {rn}"

    # Group by multiplicity, not by position in `ranks`: `ranks` keeps
    # duplicates, so 9-9-9-8-8 would read ranks[1] as a second nine. Only
    # the per-category decoding below may consume names, and each one takes
    # its ranks from the group it means.
    counts = Counter(ranks)
    trip = quad = None
    pairs: list[int] = []
    singles: list[int] = []
    for r in ranks:
        if counts[r] == 4:
            quad = r
        elif counts[r] == 3:
            trip = r
        elif counts[r] == 2:
            if r not in pairs:
                pairs.append(r)
        elif counts[r] == 1 and r not in singles:
            singles.append(r)
    pairs.sort(reverse=True)
    singles.sort(reverse=True)

    if cat == _CAT_QUADS:
        return f"four {names[quad - 2]}, {names[singles[0] - 2]} kicker"
    if cat == _CAT_FULL:
        return f"full house, {names[trip - 2]} full of {names[pairs[0] - 2]}"
    if cat == _CAT_TRIPS:
        k = "".join(names[r - 2] for r in singles)
        return f"three {names[trip - 2]}, {k} kickers"
    if cat == _CAT_TWO_PAIR:
        return f"two pair, {names[pairs[0] - 2]} and {names[pairs[1] - 2]}, {names[singles[0] - 2]} kicker"
    if cat == _CAT_PAIR:
        k = "".join(names[r - 2] for r in singles)
        return f"pair of {names[pairs[0] - 2]}, {k} kickers"
    return f"high card, {rn}"
