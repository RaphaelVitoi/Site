"""Guardas do executor isolado -- o caminho nao concorrente da suite.

Existe porque em 2026-08-28 duas sessoes trabalharam neste repositorio ao mesmo
tempo. A concorrencia produziu tres defeitos, e o terceiro nenhuma disciplina de
`git add` resolve: as baterias de sonda dos portoes ENCENAM violacoes -- criam
arquivo, dao `git add`, medem o portao e desfazem. Se a outra sessao commitar
dentro dessa janela, o commit dela leva a sonda sintetica junto.

A saida nao e coordenar as sessoes. E dar a cada execucao o seu proprio indice
git, via `git worktree`. Estes testes garantem que o executor faz isso e SO
isso: nada aqui pode escrever no repositorio de origem.
"""

from __future__ import annotations

# pylint: disable=wrong-import-position

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
if str(RAIZ) not in sys.path:
    sys.path.insert(0, str(RAIZ))

from scripts.ops import record_index, suite_isolada  # noqa: E402


def test_reconhece_o_proprio_repositorio():
    assert suite_isolada.raiz_do_repositorio(RAIZ) == RAIZ.resolve()


def test_nao_inventa_repositorio_onde_nao_ha(tmp_path):
    """Devolver None e o comportamento honesto: adivinhar a raiz de um caminho
    que nao e repositorio levaria o worktree para o lugar errado."""
    assert suite_isolada.raiz_do_repositorio(tmp_path) is None


def test_descobre_a_suite_deste_projeto():
    comando = suite_isolada.comando_padrao(RAIZ)
    assert comando and "pytest" in " ".join(comando)


def test_nao_adivinha_suite_onde_nao_ha_convencao(tmp_path):
    """Adivinhar comando errado e pior que nao adivinhar: uma suite inexistente
    devolve 'nenhum teste coletado' e sai 5, e 5 nao e 0 -- entao o silencio
    passaria por reprovacao."""
    assert suite_isolada.comando_padrao(tmp_path) is None


def test_o_executor_nunca_escreve_no_repositorio_de_origem():
    """A unica coisa que ele faz no repo de origem e criar/remover worktree.

    Qualquer `add`, `commit`, `checkout`, `reset` ou `stash` apontando para o
    repositorio de origem anularia a razao de existir deste executor.
    """
    fonte = Path(suite_isolada.__file__).read_text(encoding="utf-8")
    # So as chamadas reais: `_git("<sub>", ...)`. A prosa do docstring cita
    # `git add` para explicar o problema, e citar nao e chamar.
    subcomandos = set(re.findall(r'_git\(\s*"([a-z-]+)"', fonte))
    # Todos de LEITURA, menos `worktree`, que cria e remove a arvore isolada --
    # e nunca toca o working tree de origem. Esta guarda ja pagou: pegou um
    # `ls-files` acrescentado depois, e o subcomando so entrou aqui depois de
    # conferido que e leitura.
    permitidos = {"rev-parse", "worktree", "diff", "prune", "ls-files"}
    assert subcomandos <= permitidos, (
        f"o executor chama subcomando git fora do permitido: {sorted(subcomandos - permitidos)}"
    )


def test_o_worktree_recebe_nome_unico_por_execucao():
    """Nome com pid e relogio: duas execucoes simultaneas nao colidem, e o nome
    diz quem criou o diretorio quando alguem esquece um `--manter` para tras."""
    fonte = Path(suite_isolada.__file__).read_text(encoding="utf-8")
    assert "os.getpid()" in fonte and "time.time()" in fonte


def test_esta_ligado_ao_nexus_test():
    """Modulo que ninguem invoca nao e integracao."""
    nexus = (RAIZ / "scripts" / "cli" / "nexus.py").read_text(encoding="utf-8")
    assert "suite_isolada.py" in nexus, "nexus test --isolado nao chama o executor"
    assert '"--isolado"' in nexus, "a flag --isolado nao existe no comando test"


def test_o_indice_e_escrito_atomicamente(tmp_path):
    """Duas sessoes rodando `nexus index --rebuild` juntas podiam intercalar
    escritas e deixar JSON pela metade. Quem lesse no meio nao teria como saber
    que a causa foi concorrencia."""
    destino = tmp_path / "RECORD_INDEX.json"
    record_index.escrever({"totais": {"vigente": 0}}, destino)
    assert json.loads(destino.read_text(encoding="utf-8"))["totais"]["vigente"] == 0
    restos = list(tmp_path.glob(".*tmp"))
    assert not restos, f"temporario de escrita atomica ficou para tras: {restos}"
    fonte = Path(record_index.__file__).read_text(encoding="utf-8")
    assert "os.replace" in fonte, "a escrita deixou de ser atomica"
