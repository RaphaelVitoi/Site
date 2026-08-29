"""Os DOIS estados do portao de mensagem de commit.

Este portao existia, rodava, e a regra dele nao implementava a propria intencao
declarada. Descoberto em 2026-08-28 do jeito mais direto: ele rejeitou
`feat(frente-4): ...`, um escopo que a classe de caracteres explicitamente
tentava admitir.

A causa e de expressao regular POSIX: **dentro de colchetes a contrabarra e
literal**. `[a-zA-Z0-9_\\-\\.\\/]` nao diz "sublinhado, hifen, ponto, barra" --
diz "sublinhado, a faixa de contrabarra ate contrabarra, ponto, contrabarra,
barra". O hifen vira operador de faixa e **sai** do conjunto; a contrabarra
**entra**. Escopo com hifen reprovava, escopo com contrabarra passava.

Sobreviveu porque nenhum teste exercitava o portao -- so o commit exercitava, e
so no estado que passa. Portao cujo verde e o unico estado observado nao e
portao verificado: e portao com metade da evidencia. Este arquivo cobre a outra
metade.

Nao ha copia da regra aqui: o teste **executa o hook** com `sh`. Duas fontes
para uma regra divergem por construcao, e uma regra de portao duplicada num
teste e a forma mais silenciosa disso -- o lado esquecido continua aprovando.
"""

from __future__ import annotations

import shutil
import subprocess

import pytest

from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
HOOK = RAIZ / ".husky" / "commit-msg"


def _localizar_sh() -> str | None:
    encontrado = shutil.which("sh") or shutil.which("bash")
    if encontrado:
        return encontrado
    candidatos = [
        r"C:\Program Files\Git\bin\sh.exe",
        r"C:\Program Files\Git\bin\bash.exe",
        r"C:\Program Files\Git\usr\bin\sh.exe",
        r"C:\Program Files\Git\usr\bin\bash.exe",
        r"C:\Program Files (x86)\Git\bin\sh.exe",
    ]
    for c in candidatos:
        if Path(c).is_file():
            return c
    return None


SH = _localizar_sh()

pytestmark = pytest.mark.skipif(
    SH is None or not HOOK.exists(),
    reason="o hook e um script sh; sem interpretador POSIX nao ha o que exercitar",
)


def _rodar(mensagem: str, tmp_path) -> subprocess.CompletedProcess:
    arquivo = tmp_path / "COMMIT_EDITMSG"
    arquivo.write_text(mensagem, encoding="utf-8")
    return subprocess.run(
        [SH, str(HOOK), str(arquivo)],
        cwd=RAIZ, capture_output=True, text=True, encoding="utf-8", errors="replace",
    )


ACEITAS = [
    "feat(frente-4): escopo com hifen -- o caso que estava reprovando",
    "feat(engine): escopo simples",
    "fix(core/config): escopo com barra",
    "docs(a.b): escopo com ponto",
    "chore(scripts_ops): escopo com sublinhado",
    "refactor: sem escopo",
    "feat(api)!: mudanca incompativel",
    "ops(ci-cd): hifen no meio de um escopo composto",
]

REJEITADAS = [
    "mede a autoridade de roteamento",
    "feat mede sem os dois pontos",
    "feito(frente-4): tipo que nao existe",
    "feat(escopo com espaco): espaco nao e caractere de escopo",
    "feat(frente-4):",
    "",
]

DE_OPERACAO_DO_GIT = [
    "Merge branch 'master'",
    "Revert \"feat(x): y\"",
    "fixup! feat(x): y",
    "squash! feat(x): y",
    "WIP: rascunho",
]


@pytest.mark.parametrize("mensagem", ACEITAS)
def test_o_portao_aceita_o_que_a_regra_declara_aceitar(mensagem, tmp_path):
    r = _rodar(mensagem, tmp_path)
    assert r.returncode == 0, f"rejeitou indevidamente {mensagem!r}:\n{r.stdout}{r.stderr}"


@pytest.mark.parametrize("mensagem", REJEITADAS)
def test_o_portao_reprova_e_diz_por_que(mensagem, tmp_path):
    """Metade que faltava. E confere a MENSAGEM, nao so o codigo de saida:
    `returncode != 0` prova que ALGO reprovou, nunca que o alvo reprovou."""
    r = _rodar(mensagem, tmp_path)
    assert r.returncode != 0, f"aprovou indevidamente {mensagem!r}"
    assert "COMMIT-MSG REJEITADO" in r.stdout + r.stderr, (
        f"reprovou {mensagem!r} por outro motivo:\n{r.stdout}{r.stderr}"
    )


@pytest.mark.parametrize("mensagem", DE_OPERACAO_DO_GIT)
def test_mensagens_geradas_pelo_proprio_git_passam(mensagem, tmp_path):
    assert _rodar(mensagem, tmp_path).returncode == 0, mensagem


def test_a_contrabarra_nao_e_caractere_de_escopo(tmp_path):
    """O efeito colateral do defeito, fixado para nao voltar: a classe antiga
    admitia contrabarra em escopo, que ninguem pediu e ninguem quer."""
    mensagem = "feat(a" + chr(92) + "b): escopo com contrabarra"
    assert _rodar(mensagem, tmp_path).returncode != 0, (
        "a contrabarra voltou a ser aceita em escopo -- a classe de caracteres "
        "provavelmente voltou a escapar o hifen com contrabarra"
    )


def test_so_a_primeira_linha_decide(tmp_path):
    """Corpo de commit e prosa livre; a regra vale para o assunto. Sem isto,
    qualquer linha do corpo poderia salvar um assunto invalido."""
    r = _rodar("assunto invalido\n\nfeat(x): esta linha nao pode salvar o assunto\n", tmp_path)
    assert r.returncode != 0
    r_ok = _rodar("feat(x): assunto valido\n\n- item: com dois pontos\n- outro item\n", tmp_path)
    assert r_ok.returncode == 0, f"{r_ok.stdout}{r_ok.stderr}"


def test_comentarios_do_editor_sao_ignorados(tmp_path):
    """`git commit` sem -m entrega o arquivo com as linhas `#` do template."""
    r = _rodar("# comentario do git\nfeat(x): assunto depois do comentario\n", tmp_path)
    assert r.returncode == 0, f"{r.stdout}{r.stderr}"
