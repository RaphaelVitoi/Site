"""Guarda dos patches dos submodulos de skills/.

Os 8 submodulos declaram `ignore = dirty` no .gitmodules, entao modificacao
dentro deles NAO aparece no `git status` -- arvore limpa por instrucao, nao por
fato. Em 2026-08-28 havia 62 fontes modificados nesse limbo, incluindo uma
correcao de argument injection do git com teste de regressao, e um
`git submodule update` de rotina apagaria tudo sem aviso.

Estes testes garantem que trabalho novo nao volte ao limbo: se um submodulo
ganhar modificacao de fonte sem patch correspondente, a suite reprova.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SKILLS = RAIZ / "skills"
PATCHES = RAIZ / "patches" / "skills"

# Espelham as exclusoes usadas na extracao. Artefato regeneravel nao e trabalho.
EXCLUSOES = (
    ":(exclude)dist/**",
    ":(exclude)build/**",
    ":(exclude)package-lock.json",
    ":(exclude)**/package-lock.json",
)


def _submodulos() -> list[Path]:
    if not SKILLS.is_dir():
        return []
    return sorted(d for d in SKILLS.iterdir() if (d / ".git").exists())


def _diff_de_fonte(sub: Path) -> str:
    try:
        r = subprocess.run(
            ["git", "diff", "--", ".", *EXCLUSOES],
            cwd=str(sub),
            capture_output=True,
            text=True,
            check=False,
            timeout=120,
        )
    except (OSError, subprocess.SubprocessError):
        pytest.skip(f"git indisponivel para {sub.name}")
    return r.stdout


@pytest.mark.skipif(not SKILLS.is_dir(), reason="skills/ ausente neste checkout")
def test_todo_submodulo_modificado_tem_patch():
    """O limbo nao pode voltar: fonte modificada sem patch e trabalho a um comando de sumir."""
    sem_patch = []
    for sub in _submodulos():
        if not _diff_de_fonte(sub).strip():
            continue
        if not (PATCHES / f"{sub.name}.patch").exists():
            sem_patch.append(sub.name)
    assert not sem_patch, (
        f"submodulo(s) com modificacao de fonte e sem patch: {sem_patch}. "
        f"Extraia com: cd skills/<nome> && git diff -- . {' '.join(EXCLUSOES)} > "
        f"../../patches/skills/<nome>.patch"
    )


@pytest.mark.skipif(not PATCHES.is_dir(), reason="patches/skills ausente")
def test_nenhum_patch_esta_vazio():
    """Patch vazio e pior que patch ausente: parece protecao e nao protege."""
    vazios = [p.name for p in PATCHES.glob("*.patch") if p.stat().st_size < 20]
    assert not vazios, f"patch(es) vazio(s), remova ou regenere: {vazios}"


@pytest.mark.skipif(not PATCHES.is_dir(), reason="patches/skills ausente")
def test_patch_nao_carrega_artefato_regeneravel():
    """dist/ bundlado levou o patch do supermemory de 18 KB a 1,5 MB.

    Patch que ninguem consegue revisar nao cumpre a funcao de tornar o trabalho
    visivel -- vira so um blob que sobrevive.
    """
    ofensores = []
    for p in PATCHES.glob("*.patch"):
        cabecalhos = [
            line
            for line in p.read_text(encoding="utf-8", errors="ignore").splitlines()
            if line.startswith("diff --git")
        ]
        for h in cabecalhos:
            if "/dist/" in h or "/build/" in h or "package-lock.json" in h:
                ofensores.append(f"{p.name}: {h[:80]}")
    assert not ofensores, "patch carrega artefato regeneravel:\n" + "\n".join(ofensores)


@pytest.mark.skipif(not PATCHES.is_dir(), reason="patches/skills ausente")
def test_readme_declara_as_exclusoes():
    """Exclusao nao declarada e omissao: quem reaplicar precisa saber que falta build."""
    readme = (PATCHES / "README.md").read_text(encoding="utf-8")
    for marca in ("dist/", "package-lock.json", "npm install"):
        assert marca in readme, f"README dos patches nao declara: {marca}"
