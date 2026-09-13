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

import json
import os
from pathlib import Path
import shutil
import subprocess

import pytest

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
    assert SH is not None
    arquivo = tmp_path / "COMMIT_EDITMSG"
    arquivo.write_text(mensagem, encoding="utf-8")
    return subprocess.run(
        [SH, str(HOOK), str(arquivo)],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
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
    'Revert "feat(x): y"',
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


# ---------------------------------------------------------------------------
# IDENTIDADE DE AUTORIA -- a metade da SS7 que nao era executavel.
#
# Medido em 2026-09-12: dos seis commits daquele dia rotulados `Codex GPT-5`,
# CINCO eram do Gemini 3.8 Flash via Antigravity CLI, e havia uma unica entrada
# GPT. O rotulo estava errado em cinco de seis, e nada acusava -- a identidade
# do git e residual, sobrevive a sessao que a escreveu, e o veiculo que herdou
# nao a sobrescreve no comando.
#
# O autor entra por AMBIENTE, nao pela configuracao da maquina: `git var` honra
# GIT_AUTHOR_NAME, e sem isso o teste mediria a config de quem esta rodando --
# passaria ou falharia conforme o dia, que e o oposto de guard.


def _rodar_com_autor(mensagem: str, autor: str, tmp_path) -> subprocess.CompletedProcess:
    assert SH is not None
    arquivo = tmp_path / "COMMIT_EDITMSG"
    arquivo.write_text(mensagem, encoding="utf-8")
    ambiente = {
        **os.environ,
        "GIT_AUTHOR_NAME": autor,
        "GIT_AUTHOR_EMAIL": "noreply@exemplo.invalid",
    }
    return subprocess.run(
        [SH, str(HOOK), str(arquivo)],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
        env=ambiente,
    )


COERENTES = [
    ("Claude Opus 5", "Assinatura: Claude Opus 5 [Tier 1.B] -- sessao s1"),
    # A forma composta veiculo@modelo da SS7 e o nome do campo de autor sao a
    # MESMA identidade em duas convencoes. Comparacao literal reprovaria as duas.
    ("Gemini 3.8 Flash", "Assinatura: antigravity@gemini-3.8-flash -- sessao s2"),
    ("ChatGPT 5.6", "Assinatura: ChatGPT 5.6 [Tier 1.B]"),
    # Autor e committer distintos: o campo de autor e de quem PRODUZIU.
    ("Gemini 3.8 Flash", "Assinatura: Gemini 3.8 Flash via Claude Opus 5 como committer"),
]


@pytest.mark.parametrize("autor,linha", COERENTES)
def test_autor_que_concorda_com_a_assinatura_passa(autor, linha, tmp_path):
    r = _rodar_com_autor(f"feat(x): assunto\n\n{linha}\n", autor, tmp_path)
    assert r.returncode == 0, f"reprovou identidade coerente:\n{r.stdout}{r.stderr}"


def test_o_caso_medido_em_12_09_seria_barrado(tmp_path):
    """O commit do Gemini que saiu assinado `Codex GPT-5`, cinco vezes num dia."""
    r = _rodar_com_autor(
        "feat(theory): assunto\n\nAssinatura: antigravity@gemini-3.8-flash -- sessao s2\n",
        "Codex GPT-5",
        tmp_path,
    )
    assert r.returncode != 0, "identidade residual voltou a passar"
    saida = r.stdout + r.stderr
    assert "nao concorda" in saida, saida
    # A mensagem tem de entregar a correcao pronta. Regra que so acusa empurra o
    # operador para o `git config` global, que a SS7 proibe justamente por
    # empurrar a heranca para o proximo condutor.
    assert "git -c user.name=" in saida, saida
    assert "global" in saida, saida


def test_ausencia_de_assinatura_avisa_e_nao_bloqueia(tmp_path):
    """Bloquear aqui atingiria o Tier 0 commitando a mao, que nao e agente.

    E o hook nao consegue separar os dois sem confiar num campo que o proprio
    agente escolhe -- confiar nele daria ao agente o botao de se isentar.
    Promover a bloqueio e reducao material, e cabe ao Tier 0.
    """
    r = _rodar_com_autor("feat(x): sem assinatura nenhuma\n", "Codex GPT-5", tmp_path)
    assert r.returncode == 0, "aviso virou bloqueio sem decisao do Tier 0"
    assert "AVISO" in r.stdout + r.stderr, f"{r.stdout}{r.stderr}"


def test_merge_nao_precisa_declarar_identidade(tmp_path):
    """Mensagem gerada pelo git nao tem corpo de agente, e nao deve ganhar um."""
    r = _rodar_com_autor("Merge branch 'master'\n", "Codex GPT-5", tmp_path)
    assert r.returncode == 0, f"{r.stdout}{r.stderr}"


# ---------------------------------------------------------------------------
# CATALOGO CANONICO DE IDENTIDADE -- data/agent_identities.json.
#
# Medido em 2026-09-12: VINTE grafias de autor para cerca de cinco agentes. A
# checagem de coerencia nao alcanca isso, porque autor e assinatura erram juntos
# quando o condutor escreve a mesma variante nos dois. A fonte tem de ser externa
# a mensagem, e e por isso que existe catalogo.

CATALOGO = RAIZ / "data" / "agent_identities.json"


def _nomes_canonicos() -> set[str]:
    """Lido da fonte, nunca copiado -- catalogo copiado em teste diverge por padrao."""
    dados = json.loads(CATALOGO.read_text(encoding="utf-8"))
    return {i["nome"] for i in dados["canonicas"]}


def test_a_identidade_do_antigravity_esta_no_catalogo():
    """Determinada pelo Tier 0 em 2026-09-12: o CLI conduz o Gemini 3.8 Flash."""
    dados = json.loads(CATALOGO.read_text(encoding="utf-8"))
    gemini = [i for i in dados["canonicas"] if i["nome"] == "Gemini 3.8 Flash"]
    assert gemini, "a identidade determinada pelo Tier 0 saiu do catalogo"
    assert gemini[0]["veiculo"] == "antigravity"
    assert gemini[0]["email"] == "noreply@google.com"


def test_nenhuma_identidade_canonica_usa_e_mail_de_humano():
    """O incidente de 2026-08-30 em forma de guard."""
    dados = json.loads(CATALOGO.read_text(encoding="utf-8"))
    for item in dados["canonicas"]:
        email = item["email"]
        assert email.startswith("noreply@") or "users.noreply.github.com" in email, (
            f"{item['nome']} usa um e-mail que pode resolver para perfil humano: {email}"
        )


@pytest.mark.parametrize("nome", sorted(_nomes_canonicos()))
def test_todo_nome_do_catalogo_passa_sem_aviso(nome, tmp_path):
    r = _rodar_com_autor(f"feat(x): assunto\n\nAssinatura: {nome}\n", nome, tmp_path)
    assert r.returncode == 0, f"{r.stdout}{r.stderr}"
    assert "nao esta em" not in r.stdout + r.stderr, f"canonico avisado: {r.stdout}{r.stderr}"


@pytest.mark.parametrize(
    "nome",
    [
        # As duas grafias abaixo EXISTEM no historico deste repositorio.
        "Chico SOTA v8.0 GOLD",  # o grupo no campo do autor individual
        "Gemini 3.8 Flash High",  # variante que divide o historico do agente em dois
    ],
)
def test_variante_fora_do_catalogo_avisa_sem_bloquear(nome, tmp_path):
    r = _rodar_com_autor(f"feat(x): assunto\n\nAssinatura: {nome}\n", nome, tmp_path)
    assert r.returncode == 0, "o aviso de catalogo nunca bloqueia"
    assert "nao esta em" in r.stdout + r.stderr, f"variante passou calada:\n{r.stdout}{r.stderr}"


def test_o_aviso_casa_por_nome_exato_e_nao_por_substring(tmp_path):
    """'Claude' esta dentro de 'Claude Opus 5'. Casar por substring aceitaria a
    variante curta e derrotaria o proposito, que e justamente distinguir as duas."""
    assert "Claude" not in _nomes_canonicos(), "o catalogo nao deve trazer a forma curta"
    r = _rodar_com_autor("feat(x): assunto\n\nAssinatura: Claude\n", "Claude", tmp_path)
    assert "nao esta em" in r.stdout + r.stderr, f"substring aceita:\n{r.stdout}{r.stderr}"
