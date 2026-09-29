"""Matriz de defeitos: reintroduz cada um e exige que a guarda reprove.

Executar: .venv/Scripts/python.exe -m pytest tests/matriz_autonomia.py -q

Um guard que nunca falhou nao foi testado. Este arquivo reintroduz, um por
um, os seis defeitos que `test_autonomia_politica_declarada.py` existe para
caçar, e exige reprovacao. Medido em 2026-09-29, primeira rodada:

  1. quote de 'format ' removido ....... PEGOU
  2. lista do python divergiu .......... PEGOU
  3. import yaml no runtime ............ ESCAPOU  (guard lia string, nao uso)
  4. safe_load sem nomear o arquivo ... ESCAPOU  (idem)
  5. sandbox validando comando ......... ESCAPOU  (regex casou no branch errado)
  6. protected_paths com enforcement ... ESCAPOU  (procurava so em agents/)

Os quatro ESCAPOU viraram guard novo, agora por AST e por escopo explicito.
Reprovar sem defeito e falha do guard; **passar com defeito e pior** — e o
guard virado decoracao, e quem confia nele acredita numa medicao que nao
ocorreu.

O arquivo sob teste e restaurado com `try/finally` em cada caso: a primeira
versao disto vazou uma mutacao para `agents/autonomy.py` quando o run estourou
o timeout no meio, e o modulo de autonomia ficou com quatro linhas mortas ate
alguem reparar. Restaurar no `finally` nao depende de o run terminar.
"""

from __future__ import annotations

from pathlib import Path
import re
import subprocess
import sys

import pytest

RAIZ = Path(__file__).resolve().parent.parent
YAML_ALVO = RAIZ / "governance" / "autonomy.yaml"
CODIGO_ALVO = RAIZ / "agents" / "autonomy.py"
GUARDA = "tests/test_autonomia_politica_declarada.py"

# Cada caso: (rotulo, arquivo, transformacao, teste esperado a reprovar)
CASOS: tuple[tuple[str, Path, str, str, str], ...] = (
    (
        "quote de 'format ' removido",
        YAML_ALVO,
        "- 'format ' # espaco final e SEMANTICO: sem ele o token casa com `npm run format`",
        "- format ",
        "test_yaml_nao_perde_espaco_final_de_token",
    ),
    (
        "lista de state_changing divergiu",
        CODIGO_ALVO,
        '"git clone",',
        '"git clone",\n        "git filter-branch",',
        "test_lista_declarada_e_lista_aplicada_nao_divergem",
    ),
    (
        "runtime passou a importar yaml",
        CODIGO_ALVO,
        "import json",
        "import json\nimport yaml",
        "test_o_yaml_nao_e_consumido_e_por_iso_nao_pode_ser_tratado_como_politica",
    ),
    (
        "runtime carrega yaml sem nomear o arquivo",
        CODIGO_ALVO,
        "logger = logging.getLogger(__name__)",
        "logger = logging.getLogger(__name__)\n_POL = yaml.safe_load(open('g.yaml').read())",
        "test_o_yaml_nao_e_consumido_e_por_iso_nao_pode_ser_tratado_como_politica",
    ),
    (
        "sandbox passou a validar comando",
        CODIGO_ALVO,
        '        if effective_mode == "sandbox":\n'
        "            await _run_sandboxed_command(cmd, agent_name)\n"
        "            continue",
        '        if effective_mode == "sandbox":\n'
        "            _validate_command(cmd, effective_mode, agent_name)\n"
        "            await _run_sandboxed_command(cmd, agent_name)\n"
        "            continue",
        "test_o_modo_sandbox_nao_passa_pela_validacao_de_comando",
    ),
    (
        "full_restricted declarado no yaml",
        YAML_ALVO,
        "  sandbox:\n",
        "  full_restricted:\n    allow_native_commands: true\n  sandbox:\n",
        "test_full_restricted_e_retornado_mas_nao_declarado",
    ),
    (
        "protected_paths virou fonte de verdade",
        CODIGO_ALVO,
        "logger = logging.getLogger(__name__)",
        "logger = logging.getLogger(__name__)\n"
        "import yaml as _y\n"
        "_pol = _y.safe_load(open('governance/autonomy.yaml').read())\n"
        "def _bloqueia(path):\n"
        "    for _p in _pol['protected_paths']:\n"
        "        if path.startswith(_p):\n"
        "            raise PermissionError(path)\n"
        "    return True",
        "test_politica_declarada_e_nao_aplicada",
    ),
)


def _rodar(teste: str) -> subprocess.CompletedProcess[str]:
    # `--basetemp` isolado, e obrigatorio. A matriz lanca pytest aninhado, e
    # o pytest aninhado usa o mesmo `pytest-of-<user>/pytest-N` do processo
    # pai: ele rotaciona o diretorio numerado e os testes que dependem de
    # `tmp_path` no pai perdem a base no meio da execucao. Sintoma observado:
    # `FileNotFoundError: ...Temp\pytest-of-rapha\pytest-0` em
    # `test_forge_files_validation_checks` e `test_resolve_allowed_task_doc_path`,
    # que passam isolados. Um basetemp proprio nao interfere em ninguem.
    base = Path(RAIZ) / ".pytest_cache" / f"matriz_autonomia_{re.sub(r'[^a-z0-9]+', '_', teste.lower())[:60]}"
    return subprocess.run(
        [
            sys.executable,
            "-m",
            "pytest",
            f"{GUARDA}::{teste}",
            "-q",
            "--no-header",
            "-p",
            "no:cacheprovider",
            "--tb=no",
            f"--basetemp={base}",
        ],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        timeout=180,
    )


@pytest.mark.unit
def test_a_guarda_passa_no_estado_atual() -> None:
    """Sem isto, 'a guarda pegou' pode significar 'a guarda sempre reprova'."""
    r = subprocess.run(
        [
            sys.executable,
            "-m",
            "pytest",
            GUARDA,
            "-q",
            "--no-header",
            "-p",
            "no:cacheprovider",
            "--tb=no",
            f"--basetemp={Path(RAIZ) / '.pytest_cache' / 'matriz_autonomia_baseline'}",
        ],
        cwd=RAIZ,
        capture_output=True,
        text=True,
        timeout=180,
    )
    assert r.returncode == 0, f"a guarda ja falha antes de qualquer defeito:\n{r.stdout[-1500:]}"


@pytest.mark.unit
@pytest.mark.parametrize(
    ("rotulo", "arquivo", "antes", "depois", "teste"),
    CASOS,
    ids=[c[0] for c in CASOS],
)
def test_guarda_reprova_cada_defeito_reintroduzido(
    rotulo: str, arquivo: Path, antes: str, depois: str, teste: str
) -> None:
    original = arquivo.read_text(encoding="utf-8")
    assert antes in original, (
        f"o texto de ancoragem sumiu de {arquivo.name}; a mutacao nao seria "
        f"aplicada e este caso passaria sem provar nada.\n  ancora: {antes!r}"
    )
    try:
        arquivo.write_text(original.replace(antes, depois, 1), encoding="utf-8")
        r = _rodar(teste)
    finally:
        # `finally`, e nao o fim da funcao: um timeout no meio deixa a
        # mutacao aplicada, e codigo de autonomia adulterado e pior que um
        # teste que nao rodou.
        arquivo.write_text(original, encoding="utf-8")

    assert r.returncode != 0, (
        f"ESCAPOU: {rotulo}.\n"
        f"  o guard `{teste}` passou com o defeito reintroduzido — o guard "
        "esta decorativo. Passe a verificar uso (AST) em vez de grafia, e "
        "confirme que o escopo da busca cobre onde o enforcement apareceria."
    )
