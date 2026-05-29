# pylint: disable=missing-module-docstring, missing-function-docstring


def get_grid(pct):
    # Heuristic for poker ranges
    # pct is in [0, 100]
    total_combos = 1326
    target_combos = (pct / 100.0) * total_combos

    grid = [[0] * 13 for _ in range(13)]

    # Ranking of hands (roughly)
    # Pairs, Suited, Offsuit
    # This is a very basic ranking, but enough for a representative grid
    hands = []
    for i in range(13):
        for j in range(13):
            if i == j:  # Pair
                hands.append(
                    {
                        "name": f"{i},{j}",
                        "w": 6,
                        "r": i,
                        "c": j,
                        "type": "p",
                        "v": (12 - i) * 10 + 5,
                    }
                )
            elif i < j:  # Suited
                hands.append(
                    {
                        "name": f"{i},{j}",
                        "w": 4,
                        "r": i,
                        "c": j,
                        "type": "s",
                        "v": (12 - i) * 8 + (12 - j) * 2,
                    }
                )
            else:  # Offsuit
                hands.append(
                    {
                        "name": f"{i},{j}",
                        "w": 12,
                        "r": i,
                        "c": j,
                        "type": "o",
                        "v": (12 - j) * 6 + (12 - i) * 1,
                    }
                )

    hands.sort(key=lambda x: x["v"], reverse=True)

    current_combos = 0
    for h in hands:
        if current_combos + h["w"] <= target_combos:
            grid[h["r"]][h["c"]] = 100
            current_combos += h["w"]
        elif current_combos < target_combos:
            rem = target_combos - current_combos
            grid[h["r"]][h["c"]] = int((rem / h["w"]) * 100)
            current_combos += rem
            break

    return grid


btn_grid = get_grid(33.6)
bb_grid = get_grid(82.9)


def print_grid(name, grid):
    print(f"export const {name} = [")
    for row in grid:
        print(f"  [{', '.join(map(str, row))}],")
    print("];")


print_grid("BTN_FREQS", btn_grid)
print("")
print_grid("BB_FREQS", bb_grid)
