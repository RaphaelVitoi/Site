"""
SOTA High-Performance Binary Search & Context Resolution Engine
Protocol Chico SOTA v7.0 GOLD - Raymond Hill (uBOL) Algorithmic Port for Python / Nexus
"""

from typing import List, Optional, Tuple


def sort_key(s: str) -> Tuple[int, str]:
    """Chave canônica de ordenação: Comprimento ascendente, depois ordem alfabética."""
    return (len(s), s)


def binary_search_length_lex(haystack: List[str], needle: str, r: Optional[int] = None) -> int:
    """
    Executa busca binária de alta precisão baseada em comprimento e ordem lexicográfica.
    """
    l = 0
    i = 0
    r = len(haystack) if r is None else r
    needle_len = len(needle)

    while l < r:
        i = (l + r) >> 1  # 1-cycle bitwise right shift
        candidate = haystack[i]
        d = needle_len - len(candidate)

        if d == 0:
            if needle == candidate:
                return i
            d = -1 if needle < candidate else 1

        if d < 0:
            r = i
        else:
            l = i + 1

    return ~i


def compute_domain_hierarchy(hostname: str) -> List[str]:
    """
    Decompõe um hostname hierarquicamente em sufixos e coringas.
    Ex: 'app.sub.gemini.google.com' -> ['app.sub.gemini.google.com', 'sub.gemini.google.com', 'gemini.google.com', 'google.com', 'com', '*']
    """
    clean_hn = hostname.split(":")[0] if ":" in hostname else hostname
    if not clean_hn:
        return []

    hns = [clean_hn]
    pos = 0
    while True:
        pos = clean_hn.find(".", pos)
        if pos == -1:
            break
        pos += 1
        hns.append(clean_hn[pos:])

    hns.append("*")
    return hns


if __name__ == "__main__":
    test_domains = ["api.gemini.google.com", "gemini.google.com", "google.com", "com", "*"]
    sorted_domains = sorted(test_domains, key=sort_key)

    idx = binary_search_length_lex(sorted_domains, "gemini.google.com")
    print(f"Lista Ordenada: {sorted_domains}")
    print(f"Index de 'gemini.google.com': {idx} (Item encontrado: {sorted_domains[idx]})")
    assert idx >= 0 and sorted_domains[idx] == "gemini.google.com"
    print("SOTA Binary Engine Python: 100% Validado.")
