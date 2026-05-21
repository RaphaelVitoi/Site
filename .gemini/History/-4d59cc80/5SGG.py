# pylint: disable=missing-module-docstring, missing-function-docstring, line-too-long, redefined-outer-name, invalid-name

RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"]


def _parse_dash_range(item: str) -> set:
    start, end = item.replace("s", "").replace("o", "").split("-")

    if item[-1] in ("s", "o"):
        idx1 = RANKS.index(start[0])
        i_min, i_max = sorted([RANKS.index(start[1]), RANKS.index(end[1])])
        return {
            (idx1, i) if item[-1] == "s" else (i, idx1) for i in range(i_min, i_max + 1)
        }

    i_min, i_max = sorted([RANKS.index(start[0]), RANKS.index(end[0])])
    return {(i, i) for i in range(i_min, i_max + 1)}


def _parse_plus_range(item: str) -> set:
    if item.endswith("+") and len(item) == 4 and item[2] in ("s", "o"):
        idx1, idx2 = RANKS.index(item[0]), RANKS.index(item[1])
        return {
            (idx1, i) if item[2] == "s" else (i, idx1)
            for i in range(idx1 + 1, idx2 + 1)
        }

    if item.endswith("+") and len(item) == 3:
        idx = RANKS.index(item[0])
        return {(i, i) for i in range(idx + 1)}

    return set()


def _parse_single_hand(item: str) -> set:
    hands = set()
    if len(item) == 2:
        idx = RANKS.index(item[0])
        hands.add((idx, idx))
    elif item.endswith("s"):
        idx1, idx2 = RANKS.index(item[0]), RANKS.index(item[1])
        hands.add((min(idx1, idx2), max(idx1, idx2)))
    elif item.endswith("o"):
        idx1, idx2 = RANKS.index(item[0]), RANKS.index(item[1])
        hands.add((max(idx1, idx2), min(idx1, idx2)))
    return hands


def parse_poker_range(range_str_list: list[str]) -> set:
    active_hands = set()
    for item in range_str_list:
        item = item.strip()
        if not item:
            continue

        if "-" in item:
            active_hands.update(_parse_dash_range(item))
        elif "+" in item:
            active_hands.update(_parse_plus_range(item))
        else:
            active_hands.update(_parse_single_hand(item))

    return active_hands


# SOURCE: Aula 1.2
BTN_RAISE_HANDS = [
    "22+",
    "A2s+",
    "K2s+",
    "Q2s+",
    "J4s+",
    "T6s+",
    "96s+",
    "86s+",
    "76s",
    "65s",
    "54s",
    "A7o+",
    "KTo+",
    "QJo",
]

BB_SHOVE_HANDS = ["22-77", "A2s-A5s", "A8s-A9s", "KJs-KTs", "QJs", "AJo-ATo"]
BB_RAISE_HANDS = ["88+", "AQs+", "KQs", "AKo", "AQo"]
BB_CALL_HANDS = [
    "A2s-A7s",
    "A9s",
    "K2s-K9s",
    "Q2s-QTs",
    "J2s-JTs",
    "T2s-T9s",
    "92s-98s",
    "82s-87s",
    "72s-76s",
    "62s-65s",
    "52s-54s",
    "42s-43s",
    "32s",
    "A2o-A9o",
    "K2o+",
    "Q5o+",
    "J7o+",
    "T7o+",
    "97o+",
    "87o",
    "76o",
]

btn_raise = parse_poker_range(BTN_RAISE_HANDS)
bb_shove = parse_poker_range(BB_SHOVE_HANDS)
bb_raise = parse_poker_range(BB_RAISE_HANDS)
bb_call = parse_poker_range(BB_CALL_HANDS)


def build_grid_string(name, grid):
    res = f"export const {name}: RangeCell[][] = [\n"
    for r in range(13):
        row_cells = []
        for c in range(13):
            cell = grid[r][c]
            cell_str = "{" + ", ".join([f"'{k}': {v}" for k, v in cell.items()]) + "}"
            row_cells.append(cell_str)
        res += "  [" + ", ".join(row_cells) + "],\n"
    res += "];\n"
    return res


btn_grid = [[{} for _ in range(13)] for _ in range(13)]
for r in range(13):
    for c in range(13):
        if (r, c) in btn_raise:
            btn_grid[r][c]["raise"] = 100.0
        else:
            btn_grid[r][c]["fold"] = 100.0

bb_grid = [[{} for _ in range(13)] for _ in range(13)]
for r in range(13):
    for c in range(13):
        if (r, c) in bb_shove:
            bb_grid[r][c]["shove"] = 100.0
        elif (r, c) in bb_raise:
            bb_grid[r][c]["raise"] = 100.0
        elif (r, c) in bb_call:
            bb_grid[r][c]["call"] = 100.0
        else:
            bb_grid[r][c]["fold"] = 100.0

template = """export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

/**
 * IDENTITY: Referencial SOTA v5.2 Gold — Dados de Calibragem Soberana
 * SOURCE: Aula 1.2 (Âncora Empírica)
 * CONTEXT: MTT $11 Vanilla, 126 Entradas, Final Table 9-Handed.
 */

export const BF_PLAYERS = ['UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
export const BF_STACKS = [9.25, 52.24, 22.08, 6.88, 44.16, 24.16, 39.88, 12.73, 53.88];

export const BF_MATRIX = [
  [1.00, 1.09, 1.19, 1.18, 1.06, 1.15, 1.19, 1.13, 1.20],
  [1.13, 1.00, 1.14, 1.14, 1.08, 1.13, 1.14, 1.13, 1.15],
  [1.14, 1.07, 1.00, 1.16, 1.05, 1.12, 1.19, 1.10, 1.22],
  [1.17, 1.08, 1.20, 1.00, 1.06, 1.15, 1.19, 1.12, 1.21],
  [1.10, 1.09, 1.11, 1.11, 1.00, 1.10, 1.11, 1.10, 1.12],
  [1.17, 1.09, 1.18, 1.17, 1.06, 1.00, 1.18, 1.14, 1.19],
  [1.15, 1.08, 1.21, 1.17, 1.05, 1.13, 1.00, 1.11, 1.27],
  [1.16, 1.10, 1.17, 1.16, 1.07, 1.16, 1.17, 1.00, 1.18],
  [1.12, 1.06, 1.18, 1.13, 1.04, 1.10, 1.15, 1.09, 1.00],
];

export const RP_MATRIX = [
  [0.0, 8.1, 15.9, 15.3, 5.5, 13.4, 15.6, 11.6, 16.6],
  [11.8, 0.0, 12.6, 12.0, 7.0, 11.5, 12.3, 11.3, 13.1],
  [12.2, 6.7, 0.0, 13.5, 4.5, 10.9, 15.7, 9.5, 18.3],
  [14.3, 7.7, 16.4, 0.0, 5.2, 12.7, 16.1, 11.0, 17.1],
  [9.5, 8.3, 10.1, 9.7, 0.0, 9.3, 9.9, 9.0, 10.5],
  [14.5, 8.6, 15.4, 14.7, 5.8, 0.0, 15.1, 12.3, 16.0],
  [13.1, 7.1, 17.1, 14.4, 4.8, 11.7, 0.0, 10.1, 21.4],
  [13.8, 9.2, 14.6, 14.0, 6.2, 13.5, 14.3, 0.0, 15.2],
  [10.4, 5.7, 14.9, 11.5, 3.9, 9.3, 12.9, 8.1, 0.0],
];

export const PRIZES = [
  { pos: '1º', val: 237.34, jump: 66.38 },
  { pos: '2º', val: 170.96, jump: 35.79 },
  { pos: '3º', val: 135.17, jump: 25.18 },
  { pos: '4º', val: 109.99, jump: 19.71 },
  { pos: '5º', val: 90.28, jump: 16.33 },
  { pos: '6º', val: 73.95, jump: 14.03 },
  { pos: '7º', val: 59.92, jump: 12.36 },
  { pos: '8º', val: 47.56, jump: 11.09 },
  { pos: '9º', val: 36.47, jump: 0 },
];

export const TOTAL_POOL = 1260;

export type RangeAction = 'raise' | 'call' | 'shove' | 'fold';
export type RangeCell = Partial<Record<RangeAction, number>>;

{btn_grid_ts}
{bb_grid_ts}

export const TABLE_PLAYERS = [
  { name: 'UTG', stack: 9.25, angle: 210, highlight: false },
  { name: 'EP', stack: 52.24, angle: 250, highlight: false },
  { name: 'MP1', stack: 22.08, angle: 290, highlight: false },
  { name: 'MP2', stack: 6.88, angle: 330, highlight: false },
  { name: 'HJ', stack: 44.16, angle: 10, highlight: false },
  { name: 'CO', stack: 24.16, angle: 50, highlight: false },
  { name: 'BTN', stack: 39.88, angle: 90, highlight: true },
  { name: 'SB', stack: 12.73, angle: 130, highlight: false },
  { name: 'BB', stack: 53.88, angle: 170, highlight: true },
];

export const BUBBLE_PLAYERS = ['UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
export const BUBBLE_STACKS = [32.5, 28.4, 22.8, 18.5, 14.5, 8.2, 65.4, 45.2, 38.1];
export const BUBBLE_BF_MATRIX = Array.from({length: 9}, (_, r) => Array.from({length: 9}, (_, c) => r === c ? 1 : 1.45));
export const BUBBLE_RP_MATRIX = BUBBLE_BF_MATRIX.map(row => row.map(val => val === 1 ? 0 : Math.round((1 - 1/val) * 1000) / 10));

export const EG_PLAYERS = ['UTG', 'EP', 'MP1', 'MP2', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
export const EG_STACKS = [30, 30, 30, 30, 30, 30, 30, 30, 30];
export const EG_BF_MATRIX = new Array(9).fill(0).map((_, r) => new Array(9).fill(0).map((_, c) => r === c ? 1 : 1.018));
export const EG_RP_MATRIX = EG_BF_MATRIX.map(row => row.map(val => val === 1 ? 0 : Math.round((1 - 1/val) * 1000) / 10));
"""

final_content = template.replace(
    "{btn_grid_ts}", build_grid_string("BTN_ACTION_GRID", btn_grid)
).replace("{bb_grid_ts}", build_grid_string("BB_ACTION_GRID", bb_grid))

with open(
    "frontend/src/components/simulator/ReferencialData.ts", "w", encoding="utf-8"
) as f:
    f.write(final_content)
