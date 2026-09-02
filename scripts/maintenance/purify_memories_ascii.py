import os
from pathlib import Path
import unicodedata


def purify_text_to_ascii(text: str) -> str:
    """
    Aplica a Lei da Friccao Zero de encoding, neutralizando
    tanto caracteres UTF-8 regulares quanto corrompidos (Mojibake).
    """
    # 1. Correcao manual de entropia sistemica conhecida (Mojibake Windows-1252)
    mojibake_map = {
        "A\u0192A\xa1": "a",
        "A\u0192A\xa9": "e",
        "A\u0192A\xad": "i",
        "A\u0192A\xb3": "o",
        "A\u0192A\xba": "u",
        "A\u0192A\xa2": "a",
        "A\u0192A\xaa": "e",
        "A\u0192A\xae": "i",
        "A\u0192A\xb4": "o",
        "A\u0192A\xbb": "u",
        "A\u0192A\xa3": "a",
        "A\u0192A\xb5": "o",
        "A\u0192A\xa7": "c",
        "A\u0192A": "A",
        "A\u0192a\u20ac\xb0": "E",
        "A\u0192a\u20ac\u0153": "O",
        "A\u0192\xc5\xa1": "U",
        "A\u0192a\u20ac": "A",
        "A\u0192\xc5": "E",
        "A\u0192\xc5\xbd": "I",
        "A\u0192\xc6\u2019": "A",
        "A\u0192a\u20ac\xa2": "O",
        "A\u0192a\u20ac\xa1": "C",
        # Corrupcoes de leitura hibrida mapeadas do contexto
        "ilusA3ria": "ilusoria",
        "resoluAAes": "resolucoes",
        "informaAAo": "informacao",
        "estAtico": "estatico",
        "prAtica": "pratica",
        "dinAmica": "dinamica",
        "ameaAa": "ameaca",
        "EsperanAa": "esperanca",
        "AntevisAo": "antevisao",
        "instAncia": "instancia",
        "SAntese": "sintese",
        "decisAo": "decisao",
        "A\xb5": "o",
        "A\xa7": "c",
        "A\xa3": "a",
        "A\xa1": "a",
        "A\xa9": "e",
        "A\xad": "i",
    }

    for corrupted, clean in mojibake_map.items():
        text = text.replace(corrupted, clean)

    # 2. Purificacao universal para Pure ASCII (Lei 5)
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")


def purify_repo_memories():
    print("=== [CHICO] INICIANDO PROTOCOLO DE PURIFICACAO DE MEMORIAS E RELATORIOS (ASCII) ===")

    # Lista de diretorios para purificar
    targets = ["../../.claude/agent-memory", "../../reports", "../../docs", "../../scripts/maintenance/docs"]

    count = 0
    for target in targets:
        base_dir = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), target)))
        if not base_dir.exists():
            continue

        for filepath in base_dir.rglob("*.md"):
            try:
                with open(filepath, encoding="utf-8", errors="replace") as f:
                    content = f.read()

                purified = purify_text_to_ascii(content)

                if content != purified:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(purified)
                    print(f"[PURIFICADO] {filepath.parent.name}/{filepath.name}")
                    count += 1
            except Exception as e:
                print(f"[ERRO] Falha ao processar {filepath}: {e}")

    print(f"=== SUCESSO: {count} documentos convertidos para Pure ASCII. ===")


if __name__ == "__main__":
    purify_repo_memories()
