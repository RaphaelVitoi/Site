# pylint: disable=protected-access
"""Contrato da costura do.ps1 -> task_executor.py -> dispatch de 3 camadas.

Medido na Fase 5 da auditoria SOTA (2026-11-17): `do.ps1` invocava
`apply-god-mode`, comando que nao existia em nenhuma das 3 camadas
(_LOCAL_HANDLERS, nexus typer, _COMMAND_HANDLERS) — o fluxo -Ingest caia
no exit 2 "Comando desconhecido". E `_nexus_cmds` acumulava 15 aliases
planos da CLI anterior ao typer, todos rejeitados com "No such command".

Estes testes tornam a costura executavel: todo comando que o do.ps1
invoca precisa resolver de fato num handler, e todo nome roteado ao
nexus precisa existir na arvore typer real — nao numa lista paralela.
"""

from pathlib import Path
import re

from cli.commands import _COMMAND_HANDLERS
from scripts.cli.nexus import app as nexus_app
import task_executor

RAIZ = Path(__file__).resolve().parent.parent
DO_PS1 = RAIZ / "do.ps1"


def _comandos_invocados_pelo_do_ps1() -> dict[str, str]:
    """Extrai `task_executor.py <cmd>` do do.ps1. Devolve {cmd: linha}."""
    texto = DO_PS1.read_text(encoding="utf-8", errors="replace")
    encontrados: dict[str, str] = {}
    # Forma direta: & $PythonCmd (Join-Path $ScriptDirectory 'task_executor.py') <cmd>
    for m in re.finditer(r"task_executor\.py'\)\s+'?([a-z][a-z0-9-]*)'?", texto):
        encontrados.setdefault(m.group(1), m.group(0))
    # Forma via variavel: & $PythonCmd $ExecutorScript '<cmd>'
    for m in re.finditer(r"\$ExecutorScript\s+'?([a-z][a-z0-9-]*)'?", texto):
        encontrados.setdefault(m.group(1), m.group(0))
    return encontrados


def _comandos_top_level_nexus() -> set[str]:
    return {c.name for c in nexus_app.registered_commands if c.name}


def _comandos_de_grupo_nexus(nome: str) -> set[str]:
    for grupo in nexus_app.registered_groups:
        # Grupos adicionados sem `name=` expoe DefaultPlaceholder em `.name`;
        # o nome real resolve em typer_instance.info.name.
        nome_grupo = grupo.name if isinstance(grupo.name, str) else grupo.typer_instance.info.name
        if nome_grupo == nome:
            return {c.name for c in grupo.typer_instance.registered_commands if c.name}
    return set()


def _comandos_resolviveis() -> set[str]:
    """Uniao das 3 camadas de dispatch do task_executor."""
    return (
        set(task_executor._LOCAL_HANDLERS)
        | {"route-task"}
        | set(task_executor._NEXUS_DISPATCH)
        | set(_COMMAND_HANDLERS)
    )


def test_do_ps1_invoque_pelo_menos_um_comando() -> None:
    """Sanidade do parser: se o do.ps1 mudar de forma, o contrato falha aqui
    em vez de passar vazio."""
    comandos = _comandos_invocados_pelo_do_ps1()
    assert len(comandos) >= 5, f"Parser nao encontrou os comandos esperados: {comandos}"


def test_todo_comando_do_do_ps1_resolve_na_cadeia() -> None:
    """Todo `task_executor.py <cmd>` do do.ps1 precisa cair num handler real.

    Foi este teste que teria pego `apply-god-mode` (exit 2 silencioso).
    """
    resolviveis = _comandos_resolviveis()
    comandos = _comandos_invocados_pelo_do_ps1()
    orfaos = {cmd: trecho for cmd, trecho in comandos.items() if cmd not in resolviveis}
    assert not orfaos, f"do.ps1 invoca comandos sem handler: {orfaos}"


def test_nexus_cmds_existem_na_arvore_typer_real() -> None:
    """Todo nome em _NEXUS_CMDS precisa ser comando top-level registrado no
    app typer — nao basta estar na lista hardcoded do task_executor."""
    top_level = _comandos_top_level_nexus()
    faltando = task_executor._NEXUS_CMDS - top_level
    assert not faltando, f"_NEXUS_CMDS sem comando nexus correspondente: {faltando}"


def test_nexus_legacy_map_resolve_grupo_e_comando() -> None:
    """Cada alias legado precisa mapear para (grupo registrado, comando
    existente dentro do grupo) — ex.: sanitize -> (ops, sanitize)."""
    for alias, (grupo, comando) in task_executor._NEXUS_LEGACY_MAP.items():
        assert _comandos_de_grupo_nexus(grupo), f"alias '{alias}': grupo '{grupo}' nao existe no nexus"
        assert comando in _comandos_de_grupo_nexus(grupo), (
            f"alias '{alias}': comando '{comando}' nao existe em 'nexus {grupo}'"
        )


def test_nexus_dispatch_nao_tem_alias_zumbi() -> None:
    """Todo nome roteado ao nexus precisa resolver: top-level OU par
    (grupo, comando) do _NEXUS_LEGACY_MAP. Impede a volta dos 15 zumbis."""
    resolvidos: set[str] = set()
    top_level = _comandos_top_level_nexus()
    for alias, (grupo, comando) in task_executor._NEXUS_LEGACY_MAP.items():
        if comando in _comandos_de_grupo_nexus(grupo):
            resolvidos.add(alias)
    resolvidos |= task_executor._NEXUS_CMDS & top_level
    zumbis = task_executor._NEXUS_DISPATCH - resolvidos
    assert not zumbis, f"_NEXUS_DISPATCH com aliases que o nexus rejeita: {zumbis}"
