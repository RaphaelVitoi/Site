"""Guarda contra a divergencia requirements.txt x pyproject.toml.

Medido em 2026-11-17, na auditoria SOTA do monorepo: requirements.txt se
declarava "Fonte canonica: pyproject.toml" e mesmo assim havia derivado em
cinco pisos de versao (fastapi 0.162.4 vs 0.163.1, pydantic-settings 2.16.2
vs 2.16.3, onnxruntime 1.31.1 vs 1.32.0, playwright 1.65.0 vs 1.65.2,
regex 2026.11.9 vs 2026.11.15). O agravante: o comentario do pyproject
registra que `pip-audit -r requirements.txt` e o que mede CVEs -- ou seja,
a medicao de seguranca rodava sobre o arquivo defasado.

requirements.txt e o espelho "runtime only" mantido a mao para consumidores
pip; pyproject.toml e a fonte unica (uv.lock deriva dele). Enquanto este
guard existir, qualquer edicao de piso em um lado sem o outro reprova a
suite -- a mesma familia de defeito que
test_governanca_kernel_ponteiro.py trava para documentos de autoridade.
"""

from __future__ import annotations

from pathlib import Path
import re
import tomllib

import pytest

ROOT = Path(__file__).resolve().parent.parent
PYPROJECT = ROOT / "pyproject.toml"
REQUIREMENTS = ROOT / "requirements.txt"

_SPEC_RE = re.compile(r"^([A-Za-z0-9][A-Za-z0-9._-]*)(\[[^\]]*\])?\s*(.*)$")


def _canonical(spec: str) -> tuple[str, str]:
    """Normaliza um PEP 508 para (nome_minusculo_sem_extras, especificador)."""
    match = _SPEC_RE.match(spec.strip())
    assert match, f"especificacao nao parseada: {spec!r}"
    name = match.group(1).lower().replace("_", "-")
    return name, match.group(3).strip()


def _pyproject_deps() -> dict[tuple[str, str], str]:
    data = tomllib.loads(PYPROJECT.read_text(encoding="utf-8"))
    return {_canonical(dep): dep for dep in data["project"]["dependencies"]}


def _requirements_deps() -> dict[tuple[str, str], str]:
    deps: dict[tuple[str, str], str] = {}
    for raw in REQUIREMENTS.read_text(encoding="utf-8").splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line or set(line) <= {"\u2500", "-", "="}:
            continue
        deps[_canonical(line)] = line
    return deps


def test_requirements_txt_existe_e_nao_esta_vazio() -> None:
    assert REQUIREMENTS.is_file()
    assert _requirements_deps(), "requirements.txt sem nenhuma dependencia"


def test_pisos_sao_identicos_nos_dois_arquivos() -> None:
    pyproject = _pyproject_deps()
    requirements = _requirements_deps()

    so_no_pyproject = sorted(set(pyproject) - set(requirements))
    so_no_requirements = sorted(set(requirements) - set(pyproject))

    assert not so_no_pyproject, "dependencias em pyproject.toml ausentes de requirements.txt: " + ", ".join(
        pyproject[k] for k in so_no_pyproject
    )
    assert not so_no_requirements, "dependencias em requirements.txt ausentes de pyproject.toml: " + ", ".join(
        requirements[k] for k in so_no_requirements
    )


@pytest.mark.parametrize("side", ["pyproject", "requirements"])
def test_nomes_sao_unicos_em_cada_arquivo(side: str) -> None:
    deps = _pyproject_deps() if side == "pyproject" else _requirements_deps()
    nomes = [name for name, _ in deps]
    duplicados = sorted({n for n in nomes if nomes.count(n) > 1})
    assert not duplicados, f"dependencia duplicada em {side}: {duplicados}"
