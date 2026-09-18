# pylint: disable=invalid-name
"""Gera o subconjunto do Font Awesome Free que o frontend realmente usa.

Até 2026-09-17 o layout importava `all.min.css`: 2.715 classes e três webfonts
completas. Medido no build de produção, o artigo /biblioteca/geometria-do-risco
baixava `fa-solid-900.woff2` (117 KB) e `fa-brands-400.woff2` (113 KB) para
desenhar cerca de 140 ícones, três deles de marca.

Este gerador lê os ícones citados em `frontend/src`, recorta as fontes com
fontTools e escreve em `frontend/src/styles/fontawesome/`:

- `fontawesome-subset.css` -- núcleo do Font Awesome e só as regras dos ícones usados;
- `fa-solid-900.woff2`, `fa-regular-400.woff2`, `fa-brands-400.woff2` -- fontes recortadas;
- `manifest.json` -- a lista de ícones, que `src/tests/styles/fontawesomeSubset.test.ts`
  compara com o código. Ícone novo sem rodar este gerador reprova a suíte.

Uso, a partir da raiz do repositório:

    .venv/Scripts/python.exe frontend/scripts/fontawesome-subset.py

Depende de `fonttools` e `brotli` (hoje instalados no .venv como dependências
transitivas de matplotlib e geventhttpclient).
"""

from __future__ import annotations

import json
from pathlib import Path
import re
import sys

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
except ImportError:  # pragma: no cover - mensagem para quem roda sem o .venv
    sys.exit("fontTools ausente: rode com o .venv do projeto ou instale fonttools e brotli.")

ROOT = Path(__file__).resolve().parent.parent.parent
FRONTEND = ROOT / "frontend"
FA = ROOT / "node_modules" / "@fortawesome" / "fontawesome-free"
SAIDA = FRONTEND / "src" / "styles" / "fontawesome"

# Mesma regra de extração da guarda em src/tests/styles/fontawesomeSubset.test.ts.
EXTENSOES = {".ts", ".tsx", ".js", ".jsx", ".md", ".mdx"}
IGNORAR_DIRS = {"coverage", "tests", "interativo", "fontawesome"}
TOKEN = re.compile(r"(?<![\w-])fa-([a-z0-9]+(?:-[a-z0-9]+)*)")
BLOCO_ICONE = re.compile(r'^\.fa-([a-z0-9-]+) \{\n  --fa: "((?:\\.|[^"\\])+)";\n\}\n', re.MULTILINE)
FONTES = {"solid": "fa-solid-900", "regular": "fa-regular-400", "brands": "fa-brands-400"}


def codepoint(escape_css: str) -> int:
    """`\\f055` -> 0xf055; `\\+` -> ord('+'); `a` -> ord('a')."""
    if escape_css.startswith("\\"):
        corpo = escape_css[1:]
        return int(corpo, 16) if re.fullmatch(r"[0-9a-fA-F]+", corpo) else ord(corpo)
    return ord(escape_css)


def tokens_usados() -> set[str]:
    usados: set[str] = set()
    for arquivo in (FRONTEND / "src").rglob("*"):
        if arquivo.suffix not in EXTENSOES or ".test." in arquivo.name:
            continue
        if IGNORAR_DIRS.intersection(arquivo.relative_to(FRONTEND / "src").parts):
            continue
        usados.update(TOKEN.findall(arquivo.read_text(encoding="utf-8", errors="ignore")))
    return usados


def main() -> None:
    css = {
        nome: (FA / "css" / f"{nome}.css").read_text(encoding="utf-8")
        for nome in ("fontawesome", "brands", "regular", "solid")
    }

    icones_nucleo = {m.group(1): m.group(2) for m in BLOCO_ICONE.finditer(css["fontawesome"])}
    icones_marca = {m.group(1): m.group(2) for m in BLOCO_ICONE.finditer(css["brands"])}
    classes_nao_icone = set(re.findall(r"\.fa-([a-z0-9-]+)", BLOCO_ICONE.sub("", css["fontawesome"] + css["brands"])))

    usados = tokens_usados()
    inexistentes = sorted(usados - icones_nucleo.keys() - icones_marca.keys() - classes_nao_icone)
    if inexistentes:
        sys.exit(f"Tokens fa- que não existem no Font Awesome Free: {inexistentes}")

    nucleo = sorted(usados & icones_nucleo.keys())
    marcas = sorted(usados & icones_marca.keys())

    def filtrar(texto: str, manter: list[str]) -> str:
        return BLOCO_ICONE.sub(lambda m: m.group(0) if m.group(1) in manter else "", texto)

    SAIDA.mkdir(parents=True, exist_ok=True)
    partes = [
        "/* GERADO por frontend/scripts/fontawesome-subset.py -- nao editar a mao. */\n",
        filtrar(css["fontawesome"], nucleo),
        filtrar(css["brands"], marcas),
        css["regular"],
        css["solid"],
    ]
    folha = "\n".join(partes).replace('url("../webfonts/', 'url("./')
    (SAIDA / "fontawesome-subset.css").write_text(folha, encoding="utf-8", newline="\n")

    unicodes = {
        "solid": sorted({codepoint(icones_nucleo[n]) for n in nucleo}),
        "regular": sorted({codepoint(icones_nucleo[n]) for n in nucleo}),
        "brands": sorted({codepoint(icones_marca[n]) for n in marcas}),
    }
    relatorio = {}
    for estilo, arquivo in FONTES.items():
        origem = FA / "webfonts" / f"{arquivo}.woff2"
        # Sem recalcular head.modified: com o carimbo de agora, cada execução mudava os três binários
        # e o manifesto mesmo sem ícone novo.
        fonte = TTFont(origem, recalcTimestamp=False)
        cmap = fonte.getBestCmap() or {}
        presentes = [u for u in unicodes[estilo] if u in cmap]
        # name_IDs "*" preserva copyright e licença (SIL OFL 1.1).
        opcoes = subset.Options(flavor="woff2", layout_features=["*"], name_IDs=["*"])
        recorte = subset.Subsetter(opcoes)
        recorte.populate(unicodes=presentes)
        recorte.subset(fonte)
        destino = SAIDA / f"{arquivo}.woff2"
        fonte.flavor = "woff2"
        fonte.save(destino)
        relatorio[arquivo] = {
            "glifos": len(presentes),
            "bytes_origem": origem.stat().st_size,
            "bytes_recorte": destino.stat().st_size,
        }

    versao = json.loads((FA / "package.json").read_text(encoding="utf-8"))["version"]
    manifesto = {"fontawesome_free": versao, "icones": nucleo, "marcas": marcas, "fontes": relatorio}
    (SAIDA / "manifest.json").write_text(
        json.dumps(manifesto, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n"
    )

    print(f"{len(nucleo)} icones, {len(marcas)} marcas")
    for arquivo, dados in relatorio.items():
        print(
            f"  {arquivo}: {dados['bytes_origem'] // 1024} KB -> {dados['bytes_recorte'] // 1024} KB ({dados['glifos']} glifos)"
        )


if __name__ == "__main__":
    main()
