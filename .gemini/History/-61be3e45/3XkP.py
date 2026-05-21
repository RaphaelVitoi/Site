import os
import unicodedata
from pathlib import Path


def purify_text_to_ascii(text: str) -> str:
    """
    Aplica a Lei da Friccao Zero de encoding, neutralizando
    tanto caracteres UTF-8 regulares quanto corrompidos (Mojibake).
    """
    # 1. Correcao manual de entropia sistêmica conhecida (Mojibake Windows-1252)
    mojibake_map = {
        "ÃƒÂ¡": "a",
        "ÃƒÂ©": "e",
        "ÃƒÂ­": "i",
        "ÃƒÂ³": "o",
        "ÃƒÂº": "u",
        "ÃƒÂ¢": "a",
        "ÃƒÂª": "e",
        "ÃƒÂ®": "i",
        "ÃƒÂ´": "o",
        "ÃƒÂ»": "u",
        "ÃƒÂ£": "a",
        "ÃƒÂµ": "o",
        "ÃƒÂ§": "c",
        "ÃƒÂ": "A",
        "Ãƒâ€°": "E",
        "Ãƒâ€œ": "O",
        "ÃƒÅ¡": "U",
        "Ãƒâ€": "A",
        "ÃƒÅ": "E",
        "ÃƒÅ½": "I",
        "ÃƒÆ’": "A",
        "Ãƒâ€¢": "O",
        "Ãƒâ€¡": "C",
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
        "Aµ": "o",
        "A§": "c",
        "A£": "a",
        "A¡": "a",
        "A©": "e",
        "A­": "i",
    }

    for corrupted, clean in mojibake_map.items():
        text = text.replace(corrupted, clean)

    # 2. Purificacao universal para Pure ASCII (Lei 5)
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")

    return text


def purify_repo_memories():
    print("=== [CHICO] INICIANDO PROTOCOLO DE PURIFICACAO DE MEMORIAS (ASCII) ===")
    base_dir = Path(
        os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../.claude/agent-memory")
        )
    )

    if not base_dir.exists():
        print(f"[ERRO] Diretorio de memorias nao encontrado em: {base_dir}")
        return

    count = 0
    for filepath in base_dir.rglob("*.md"):
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        purified = purify_text_to_ascii(content)

        if content != purified:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(purified)
            print(f"[PURIFICADO] {filepath.parent.name}/{filepath.name}")
            count += 1

    print(f"=== SUCESSO: {count} memorias convertidas para Pure ASCII. ===")


if __name__ == "__main__":
    purify_repo_memories()
