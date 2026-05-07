import re


def _calculate_heuristic_score(context: str, terms: dict[str, int]) -> int:
    score = 0
    for term, weight in terms.items():
        # Usando regex para encontrar palavras inteiras ou prefixos, case-insensitive
        # \b garante que seja uma fronteira de palavra no inicio.
        matches = re.findall(r"\b" + re.escape(term), context, re.IGNORECASE)
        score += len(matches) * weight
    return score
