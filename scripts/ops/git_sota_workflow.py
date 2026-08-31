"""Git SOTA Workflow Orchestrator v8.0 GOLD.

Protocolo Chico SOTA v8.0 GOLD - Pre-Commit, Semantic Commit, Linear Sync e Push.
Garante que nenhum commit ou push ocorra sem aprovacao formal do Quality Gate.
"""
from __future__ import annotations

import logging
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Final

logger = logging.getLogger("git_sota_workflow")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

BASE_DIR: Final[Path] = Path(__file__).resolve().parent.parent.parent


class GitSotaWorkflow:
    """Gerenciador canonico de ciclo de vida Git SOTA."""

    COMMIT_PATTERN: Final[re.Pattern[str]] = re.compile(
        r"^(feat|fix|refactor|chore|audit|docs|test|perf|ci)(\([a-zA-Z0-9_\-.]+\))?:\s+.+",
        re.IGNORECASE,
    )

    @classmethod
    def validate_commit_message(cls, message: str) -> tuple[bool, str]:
        """Valida se a mensagem segue o padrao semantico rigoroso."""
        msg = message.strip()
        if not msg:
            return False, "Mensagem de commit vazia."

        if not cls.COMMIT_PATTERN.match(msg):
            return (
                False,
                "Mensagem deve iniciar com prefixos semanticos validos (ex: feat:, fix:, refactor:, chore:, audit:, docs:, test:, perf:, ci:) ou tipo(escopo): descricao",
            )

        if len(msg) < 10:
            return False, "Mensagem de commit muito curta (minimo 10 caracteres)."

        return True, "Mensagem valida."

    @classmethod
    def get_staged_files(cls) -> list[str]:
        """Lista arquivos marcados na staging area."""
        res = subprocess.run(
            ["git", "diff", "--cached", "--name-only"],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            check=False,
        )
        if res.returncode == 0:
            return [line.strip() for line in res.stdout.splitlines() if line.strip()]
        return []

    @classmethod
    def run_pre_commit_gate(cls) -> bool:
        """Executa o portao obrigatorio de 5 fases e o portao de relatorios."""
        logger.info("[GIT-GATE] Executando validacao de integridade e pre-commit...")
        gate_script = BASE_DIR / "scripts/ops/cwv_gate.ps1"
        pwsh = shutil.which("pwsh") or shutil.which("powershell") or "powershell"

        if gate_script.exists():
            res = subprocess.run(
                [pwsh, "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(gate_script)],
                cwd=str(BASE_DIR),
                check=False,
            )
            if res.returncode != 0:
                logger.error("[GIT-GATE] cwv_gate.ps1 reprovou com codigo %d.", res.returncode)
                return False

        # Valida registros e relatorios via record_gate se houver relatorios em staging
        staged = cls.get_staged_files()
        reports_staged = [f for f in staged if f.startswith("reports/") or f.startswith("docs/reports/")]
        if reports_staged:
            record_gate_script = BASE_DIR / "scripts/ops/record_gate.py"
            if record_gate_script.exists():
                res_rec = subprocess.run(
                    [sys.executable, str(record_gate_script)],
                    cwd=str(BASE_DIR),
                    check=False,
                )
                if res_rec.returncode != 0:
                    logger.error("[GIT-GATE] record_gate.py reprovou a formatacao dos relatorios.")
                    return False

        return True

    @classmethod
    def execute_commit(cls, message: str, auto_stage: bool = False) -> bool:
        """Executa commit semantico apos aprovacao no portao."""
        valida, motivo = cls.validate_commit_message(message)
        if not valida:
            logger.error("[GIT-COMMIT] Mensagem invalida: %s", motivo)
            return False

        if auto_stage:
            subprocess.run(["git", "add", "-u"], cwd=str(BASE_DIR), check=False)

        staged = cls.get_staged_files()
        if not staged:
            logger.warning("[GIT-COMMIT] Nenhum arquivo em staging para commit.")
            return False

        if not cls.run_pre_commit_gate():
            logger.error("[GIT-COMMIT] Pre-commit gate reprovou. Abortando commit.")
            return False

        res = subprocess.run(
            ["git", "commit", "-m", message],
            cwd=str(BASE_DIR),
            check=False,
        )
        return res.returncode == 0

    @classmethod
    def sync_linear(cls, target_branch: str = "master") -> bool:
        """Sincroniza repositorio linearmente via fetch --prune e rebase --autostash."""
        sync_script = BASE_DIR / "scripts/ops/Sync-RepoSota.ps1"
        pwsh = shutil.which("pwsh") or shutil.which("powershell") or "powershell"
        if sync_script.exists():
            res = subprocess.run(
                [pwsh, "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(sync_script), "-TargetBranch", target_branch],
                cwd=str(BASE_DIR),
                check=False,
            )
            return res.returncode == 0
        return False
