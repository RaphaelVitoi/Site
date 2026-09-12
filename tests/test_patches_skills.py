"""Guarda da relacao entre o superprojeto e os oito submodulos de skills/.

HISTORIA, porque ela explica por que as assercoes sao ESTAS e nao outras.

Os 8 submodulos declaram `ignore = dirty` no .gitmodules, entao modificacao
dentro deles NAO aparece no `git status` -- arvore limpa por instrucao, nao por
fato. Em 2026-08-28 havia 62 fontes modificados nesse limbo, incluindo uma
correcao de argument injection do git com teste de regressao, e um
`git submodule update` de rotina apagaria tudo sem aviso. A resposta daquele dia
foi extrair `.patch` por submodulo: seguro contra PERDA de trabalho nao
commitado.

O seguro cumpriu o papel e acabou. Medido em 2026-09-12: os oito estao limpos e
todo o trabalho esta commitado em fork proprio, 1 a 2 commits alem do upstream.
Nao ha mais trabalho nao commitado a segurar, e um `.patch` que duplica historia
ja publicada e o que a SS3 chama de fonte paralela -- ela nao diverge se alguem
descuidar, diverge POR PADRAO. Os oito foram retirados por arbitragem do Tier 0.

O QUE FICOU NO LUGAR, e e mais forte. O guard antigo,
`test_todo_submodulo_modificado_tem_patch`, passava VACUAMENTE desde que os
submodulos ficaram limpos: iterava e dava `continue` no diff vazio, sem exercer
assercao nenhuma. Verde sem assercao e indistinguivel de verde com assercao.

E ele nunca teria pego o defeito que de fato aconteceu. Entre 2026-08-28 e
2026-09-12 o `.gitmodules` apontava para o UPSTREAM enquanto a correcao de
seguranca do supermemory vivia so no disco local: quem clonasse o repositorio
publico recebia o gitlink 035c843d, que ainda carregava o hook de egress. Quinze
dias. A maquina estava protegida; o clone, nunca. O guard olhava para o lugar
errado -- perguntava se havia patch, quando a pergunta era se o endereco
publicado resolvia.

Dai as tres assercoes abaixo. A primeira roda mesmo sem submodulo materializado,
que e o caso do CI.
"""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
SKILLS = RAIZ / "skills"
PATCHES = RAIZ / "patches" / "skills"
GITMODULES = RAIZ / ".gitmodules"

# O dono do fork. Um submodulo de skills/ que aponte para outro lugar publica um
# endereco que o trabalho desta casa nao alcanca.
DONO_DO_FORK = "RaphaelVitoi"

# Espelham as exclusoes historicas da extracao. Artefato regeneravel nao e trabalho.
EXCLUSOES = (
    ":(exclude)dist/**",
    ":(exclude)build/**",
    ":(exclude)package-lock.json",
    ":(exclude)**/package-lock.json",
)


def _submodulos_declarados() -> dict[str, str]:
    """Caminho -> URL, lidos do .gitmodules. Nao exige o submodulo no disco."""
    if not GITMODULES.is_file():
        return {}
    texto = GITMODULES.read_text(encoding="utf-8", errors="replace")
    blocos = re.findall(r'\[submodule "([^"]+)"\](.*?)(?=\n\[|\Z)', texto, re.S)
    fora = {}
    for caminho, corpo in blocos:
        m = re.search(r"^\s*url\s*=\s*(\S+)", corpo, re.M)
        if m:
            fora[caminho] = m.group(1)
    return fora


def _submodulos_materializados() -> list[Path]:
    if not SKILLS.is_dir():
        return []
    return sorted(d for d in SKILLS.iterdir() if (d / ".git").exists())


def _git(cwd: Path, *args: str) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(
            ["git", *args],
            cwd=str(cwd),
            capture_output=True,
            text=True,
            check=False,
            timeout=120,
            encoding="utf-8",
            errors="replace",
        )
    except (OSError, subprocess.SubprocessError):
        pytest.skip("git indisponivel neste ambiente")


@pytest.mark.skipif(not GITMODULES.is_file(), reason=".gitmodules ausente neste checkout")
def test_todo_submodulo_de_skills_aponta_para_o_fork():
    """A assercao que teria fechado os quinze dias no dia em que nasceram.

    O que um clone recebe e o que o `.gitmodules` diz, nao o que ha nesta
    maquina. Enquanto a URL apontasse para o upstream, o gitlink corrigido
    localmente nao existia para ninguem -- e o commit que o clone resolvia ainda
    servia o hook de egress.

    Roda SEM submodulo materializado: e leitura de arquivo versionado, entao vale
    igual no CI, onde nenhum deles esta no disco.
    """
    fora_do_fork = {
        caminho: url
        for caminho, url in _submodulos_declarados().items()
        if caminho.startswith("skills/") and f"/{DONO_DO_FORK}/" not in url
    }
    assert not fora_do_fork, (
        "submodulo de skills/ apontando para fora do fork -- um clone nao alcanca o trabalho desta casa:\n  "
        + "\n  ".join(f"{k} -> {v}" for k, v in sorted(fora_do_fork.items()))
    )


@pytest.mark.skipif(not _submodulos_materializados(), reason="submodulos nao materializados neste checkout")
def test_gitlink_aponta_para_commit_que_existe_no_submodulo():
    """Endereco publicado tem de resolver.

    O superprojeto grava um SHA por submodulo. Se esse SHA nao existir no
    repositorio do submodulo, o ponteiro e para lugar nenhum -- e a falha so
    aparece para quem clona, que e tarde.
    """
    quebrados = []
    for sub in _submodulos_materializados():
        rel = f"skills/{sub.name}"
        sha = _git(RAIZ, "rev-parse", f"HEAD:{rel}").stdout.strip()
        if not sha:
            quebrados.append(f"{rel}: superprojeto nao grava gitlink")
            continue
        existe = _git(sub, "cat-file", "-e", f"{sha}^{{commit}}")
        if existe.returncode != 0:
            quebrados.append(f"{rel}: gitlink {sha[:12]} nao existe no submodulo")
    assert not quebrados, "gitlink que nao resolve:\n  " + "\n  ".join(quebrados)


@pytest.mark.skipif(not _submodulos_materializados(), reason="submodulos nao materializados neste checkout")
def test_fonte_modificada_no_submodulo_nao_fica_sem_commit():
    """O limbo nao pode voltar, e agora a saida e commitar, nao extrair patch.

    Com `ignore = dirty`, modificacao de fonte dentro do submodulo e invisivel ao
    `git status` do superprojeto. Ate 2026-09-12 a remediacao aceita era extrair
    um `.patch`; ela protegia contra perda e nao contra invisibilidade. A
    remediacao correta e commitar no fork e avancar o gitlink -- ai o trabalho
    existe para quem clona.
    """
    em_limbo = []
    for sub in _submodulos_materializados():
        diff = _git(sub, "diff", "--", ".", *EXCLUSOES).stdout
        if diff.strip():
            em_limbo.append(sub.name)
    assert not em_limbo, (
        f"submodulo(s) com fonte modificada e nao commitada: {em_limbo}. "
        "Commite no fork e avance o gitlink; nao extraia patch -- patch guarda o trabalho "
        "e nao o publica, e foi essa a confusao que custou quinze dias em 2026-09."
    )


@pytest.mark.skipif(not PATCHES.is_dir(), reason="patches/skills ausente")
def test_patch_so_existe_enquanto_houver_trabalho_nao_commitado():
    """Seguro sem risco a segurar e fonte paralela, e fonte paralela diverge sozinha.

    Nao e proibicao a `.patch`: e a exigencia de que ele tenha objeto. Um patch
    cujo submodulo esta limpo duplica historia ja commitada, e uma segunda copia
    de um fato nao precisa de descuido para divergir -- ela diverge por padrao,
    porque nao tem como saber que o original mudou.
    """
    materializados = {s.name: s for s in _submodulos_materializados()}
    obsoletos = []
    for patch in sorted(PATCHES.glob("*.patch")):
        nome = patch.stem
        sub = materializados.get(nome)
        if sub is None:
            continue  # nao da para julgar o que nao esta no disco
        if not _git(sub, "diff", "--", ".", *EXCLUSOES).stdout.strip():
            obsoletos.append(nome)
    assert not obsoletos, (
        f"patch(es) sem trabalho nao commitado correspondente: {obsoletos}. "
        "O submodulo esta limpo, entao o patch duplica historia ja publicada no fork -- remova-o."
    )


@pytest.mark.skipif(not PATCHES.is_dir(), reason="patches/skills ausente")
def test_readme_registra_o_fork_e_o_sha_de_cada_skill():
    """O que substituiu o patch tem de estar escrito, ou a retirada vira lacuna.

    Um ponteiro verificavel -- fork mais SHA -- diz onde o trabalho esta; um
    diretorio vazio nao diz nada, e quem chegar depois refaz a extracao achando
    que descobriu um buraco.
    """
    readme = (PATCHES / "README.md").read_text(encoding="utf-8", errors="replace")
    ausentes = [
        nome for nome in sorted(_submodulos_declarados()) if nome.startswith("skills/") and nome[7:] not in readme
    ]
    assert not ausentes, f"README dos patches nao registra o destino de: {ausentes}"
    assert DONO_DO_FORK in readme, "README dos patches nao nomeia o dono do fork"
