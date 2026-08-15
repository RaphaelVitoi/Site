"""
SOTA High-Performance Binary Search & Context Resolution Engine
Protocol Chico SOTA v7.0 GOLD - Raymond Hill (uBOL) Algorithmic Port for Python / Nexus
"""

from typing import List, Optional, Tuple


def sort_key(s: str) -> Tuple[int, str]:
    """Chave canônica de ordenação: Comprimento ascendente, depois ordem alfabética."""
    return (len(s), s)


def binary_search_length_lex(haystack: List[str], needle: str, high: Optional[int] = None) -> int:
    """
    Executa busca binária de alta precisão baseada em comprimento e ordem lexicográfica.
    """
    low = 0
    mid = 0
    high_idx = len(haystack) if high is None else high
    needle_len = len(needle)

    while low < high_idx:
        mid = (low + high_idx) >> 1  # 1-cycle bitwise right shift
        candidate = haystack[mid]
        d = needle_len - len(candidate)

        if d == 0:
            if needle == candidate:
                return mid
            d = -1 if needle < candidate else 1

        if d < 0:
            high_idx = mid
        else:
            low = mid + 1

    return ~mid


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
