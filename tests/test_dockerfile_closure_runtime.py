"""Guard: o Dockerfile cobre o fecho transitivo de imports do CMD.

A-02 (auditoria 2026-09-29): a lista de `COPY` do `Dockerfile` e uma
enumeracao manual de diretorios, e enumeracao manual diverge do codigo sem
avisar. Medido: `core/runtime.py` -> `worker/startup.py` importa
`monitoring.watchdog` e `task_executor`; `worker/loop.py` importa `agents` e
`task_executor`. Nenhum dos tres era copiado. A imagem de producao morria com
`ModuleNotFoundError` no primeiro segundo, e nenhum controle de container
declarado no proprio Dockerfile (usuario nao-root, healthcheck) jamais chegou a
ser exercitado.

Este guard deriva o fecho por AST a partir do modulo real do CMD e compara com
as linhas `COPY`. Um import novo entra no caminho de execucao -> o teste
reprova, e a divergencia aparece no CI em vez do primeiro deploy.
"""

from __future__ import annotations

import ast
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parent.parent
DOCKERFILE = RAIZ / "Dockerfile"
MODULO_DO_CMD = RAIZ / "core" / "runtime.py"

#: Pacotes que o `Dockerfile` NAO copia porque o container nunca os executa.
#:
#: `task_executor.py:695,702,709` importa `scripts.cli.nexus` e `cli.commands`
#: dentro de `if __name__ == "__main__":` (linha 654). O container roda
#: `python core/runtime.py` e nunca percorre esse caminho. Copiar `cli/` e
#: `scripts/` acrescentaria codigo executavel a uma imagem que nao precisa dele.
#:
#: Isto e a UNICA lista escrita a mao aqui, e e proposital: ela e uma decisao de
#: projeto, nao um espelho do Dockerfile. O resto do guard le o Dockerfile.
ACHADOS_NAO_RUNTIME = frozenset({"cli", "scripts"})


def _imports_de(caminho: Path) -> list[str]:
    """Nomes de modulo importados por um arquivo, em qualquer nivel do no.

    `ast.walk` inclui imports de funcao, e nao so do topo: `worker/loop.py`
    importa `task_executor` no escopo do modulo, mas `core/runtime.py` importa
    `worker.startup` DENTRO de `start_worker_and_api`. Um guard que so lesse o
    topo do arquivo veria a imagem como completa.
    """
    arvore = ast.parse(caminho.read_text(encoding="utf-8", errors="replace"))
    nomes: list[str] = []
    for no in ast.walk(arvore):
        if isinstance(no, ast.Import):
            nomes.extend(alias.name for alias in no.names)
        elif isinstance(no, ast.ImportFrom) and no.module and no.level == 0:
            nomes.append(no.module)
    return nomes


def _fecho_transitivo(entrada: Path) -> tuple[set[str], set[str]]:
    """Fecha imports a partir de `entrada`. Devolve (modulos_de_raiz, pacotes).

    Nao recebe lista de "ja copiados": percorrer a arvore inteiro e devolver
    TUDO que ela alcanca e o unico jeito de o guard nao ter segunda copia da
    verdade. Uma versao anterior aceitava um `PACOTES_COPIADOS` escrito a mao
    aqui, e a mutacao (remover `COPY monitoring`) passava verde: o pacote era
    filtrado pela lista do proprio teste antes de chegar a comparacao.

    A comparacao e por CAMINHO RELATIVO, nunca por nome de arquivo. O repositorio
    tem `engine/base.py` e `engine/solver_importers/base.py`, alem de outros
    homonimos: comparar por `name` faz `COPY engine ./engine` parecer que nao
    cobre `engine/solver_importers/`, e o guard passa a acusar o Dockerfile
    inteiro de omisso -- um guard que reprova sem defeito.
    """
    pendentes = [entrada]
    vistos: set[Path] = set()
    modulos: set[str] = set()
    pacotes: set[str] = set()

    while pendentes:
        atual = pendentes.pop()
        try:
            resolvido = atual.resolve()
            chave = resolvido.relative_to(RAIZ)
        except (OSError, ValueError):  # pragma: no cover - fora da arvore
            continue
        if chave in vistos or not resolvido.is_file():
            continue
        vistos.add(chave)

        for nome in _imports_de(resolvido):
            relativo = Path(*nome.split("."))
            candidatos = [RAIZ / f"{relativo}.py"]
            if (RAIZ / relativo).is_dir():
                candidatos.append(RAIZ / relativo / "__init__.py")
            achado = next((c for c in candidatos if c.is_file()), None)
            if achado is None:
                continue
            if achado.name == "__init__.py":
                pacotes.add(nome.split(".")[0])
            else:
                modulos.add(achado.relative_to(RAIZ).as_posix())
            pendentes.append(achado)

    return modulos, pacotes


def _copias_do_dockerfile() -> set[str]:
    """Destinos materializados pelas linhas `COPY` do Dockerfile."""
    copiados: set[str] = set()
    for linha in DOCKERFILE.read_text(encoding="utf-8").splitlines():
        partes = linha.split()
        if not partes or partes[0].upper() != "COPY":
            continue
        # `COPY --from=builder /app/.venv /app/.venv` nao materializa codigo do
        # repositorio: a origem esta num estagio anterior.
        if any(p.startswith("--from=") for p in partes):
            continue
        for origem in partes[1:-1]:
            copiados.add(Path(origem).name)
    return copiados


def _esta_copiado(caminho_relativo: str, copiados: set[str]) -> bool:
    """Diz se um caminho relativo cai sob algum destino de `COPY`.

    Um `COPY engine ./engine` cobre `engine/solver_importers/base.py` porque
    cobre o diretorio inteiro -- e e isso que o `COPY` significa.
    """
    partes = Path(caminho_relativo).parts
    return any(parte in copiados for parte in partes)


def _pertence_a_achado(caminho_relativo: str) -> bool:
    """Diz se o modulo vive sob um achado declarado (`cli/`, `scripts/`).

     Compara pelo PRIMEIRO segmento do caminho, e nao pelo nome do arquivo. Uma
     versao anterior comparava `Path(m).name` com `{"cli", "scripts"}`, o que
     nunca casa: `cli/commands.py` tem nome `commands.py`. O efeito era o
    baseline reprovando com achados que o proprio guard declara nao-runtime --
     guard que reprova sem defeito.
    """
    partes = Path(caminho_relativo).parts
    return bool(partes) and partes[0] in ACHADOS_NAO_RUNTIME


@pytest.fixture(scope="module")
def fecho() -> tuple[set[str], set[str]]:
    return _fecho_transitivo(MODULO_DO_CMD)


def test_cmd_do_dockerfile_e_o_modulo_que_o_guard_analisa() -> None:
    """O guard so protege o CMD real.

    Se o `CMD` deixar de ser `core/runtime.py`, o fecho medido passa a descrever
    um modulo que a imagem nao executa -- verde sobre auditoria de outro alvo.
    """
    linhas = DOCKERFILE.read_text(encoding="utf-8").splitlines()
    cmds = [linha for linha in linhas if linha.upper().startswith("CMD")]
    assert cmds, "Dockerfile sem CMD: o alvo de execucao da imagem desapareceu"
    assert any("core/runtime.py" in cmd for cmd in cmds), (
        f"O CMD mudou para fora de core/runtime.py e o guard precisa ser reapontado antes: {cmds}"
    )


def test_todo_modulo_do_fecho_e_copiado(fecho: tuple[set[str], set[str]]) -> None:
    modulos, pacotes = fecho
    copiados = _copias_do_dockerfile()

    faltando_pacotes = {p for p in pacotes if p not in ACHADOS_NAO_RUNTIME and p not in copiados}
    faltando_modulos = {m for m in modulos if not _esta_copiado(m, copiados) and not _pertence_a_achado(m)}

    assert not faltando_pacotes, (
        f"Pacote importado em tempo de execucao e ausente no Dockerfile: {sorted(faltando_pacotes)}. "
        f"O container morre com ModuleNotFoundError antes do primeiro request."
    )
    assert not faltando_modulos, (
        f"Modulo importado em tempo de execucao e ausente no Dockerfile: {sorted(faltando_modulos)}."
    )


def test_guard_declara_o_que_nao_e_dependencia_de_runtime() -> None:
    """A exclusao de `cli/` e `scripts/` e declarada, nao implícita.

    Sem esta assercao, quem lê o guard nao sabe se a ausência delas e esquecimento
    ou decisao -- e um `COPY cli ./cli` posterior passaria despercebido.
    """
    modulos, pacotes = _fecho_transitivo(MODULO_DO_CMD)
    assert not (ACHADOS_NAO_RUNTIME & pacotes), (
        "cli/ ou scripts/ passaram a ser dependencia de execucao do CMD. "
        "Se essa intencao e deliberada, inclua-os no Dockerfile e remova-os de "
        "ACHADOS_NAO_RUNTIME com a medicao que justifica."
    )


def test_healthcheck_do_dockerfile_ponta_para_rota_registrada() -> None:
    """O healthcheck consulta `/health`, e `/health` existe como rota.

    Um healthcheck apontando para rota inexistente falha sempre: o container e
    marcado unhealthy, o orquestrador o reinicia em laco, e o sintoma aparece
    como instabilidade de runtime -- nunca como "a rota nao existe".
    """
    conteudo = DOCKERFILE.read_text(encoding="utf-8")
    assert "HEALTHCHECK" in conteudo, "Dockerfile sem HEALTHCHECK"

    from api.v1.server import create_app  # import tardio: so o teste precisa

    app = create_app(_manager_falso())
    caminhos = {getattr(recurso, "canonical", None) for recurso in app.router.resources()}
    assert "/health" in caminhos, (
        f"O healthcheck do Dockerfile consulta /health, que nao esta entre as rotas "
        f"registradas: {sorted(c for c in caminhos if c)}"
    )


def _manager_falso():
    """QueueManager minimo: `create_app` so o guarda no dicionario de estado."""
    from unittest.mock import MagicMock

    from database.queue_manager import QueueManager

    return MagicMock(spec=QueueManager)
