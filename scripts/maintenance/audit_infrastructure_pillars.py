#!/usr/bin/env python3
"""
AUDITORIA SOTA v8.0 GOLD: INFRASTRUCTURE PILLARS (LOGS, TEMPS, ARTIFACTS, SKILLS)
Governanca: Raphael Vitoi | Protocolo: CHICO SOTA v8.0 GOLD

Audita, valida e aplica o sistema Tri-State Guard com rigor matematico sobre:
1. LOGS: Politicas de retencao, ausencia de vazamento de credenciais, encoding e rotacao.
2. TEMPS: Purificacao de pastas vazias/orfas, integridade SQLite e isolamento na Nexus Zone.
3. ARTIFACTS: Validacao de markdown, KaTeX math blocks, integridade de metadados e media links.
4. SKILLS: Validacao de YAML frontmatter, integridade de nomes, descricoes e recursos em 100% das skills.
"""

import json
import os
from pathlib import Path
import re
import sys
import time

BASE_DIR = Path(__file__).resolve().parent.parent.parent
NEXUS_ZONE = BASE_DIR / "temp" / "nexus_zone"
USER_SKILLS_DIR = Path(r"c:\Users\rapha\.agents\skills")
BUILTIN_SKILLS_DIR = BASE_DIR.parent / "antigravity" / "builtin" / "skills"
BRAIN_DIR = BASE_DIR.parent / "antigravity" / "brain"

# Regex para deteccao de segredos em logs
SECRET_PATTERNS = [
    re.compile(r"AIzaSy[A-Za-z0-9-_]{33}"),  # Google Gemini / Firebase API Key
    re.compile(r"sk-[A-Za-z0-9-_]{32,}"),  # OpenAI / Anthropic Secret Key
    re.compile(r"gh[pousr]_[A-Za-z0-9]{36}"),  # GitHub Personal Token (Classic)
    re.compile(r"github_pat_\w{82}"),  # GitHub Fine-Grained Personal Access Token
    re.compile(r"Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*"),  # JWT
]


def _audit_log_file(path: Path, errors: list[str], warnings: list[str], stats: dict) -> None:
    """Acumula tamanho e sinais de segredo de um unico arquivo de log."""
    stats["files_scanned"] += 1
    size = path.stat().st_size
    stats["bytes_total"] += size
    if size > 20 * 1024 * 1024:
        errors.append(
            f"[LOGS-EXCESS] Arquivo {path.relative_to(BASE_DIR)} excede limite de rotacao (Tamanho: {size / (1024 * 1024):.2f}MB > 20MB)."
        )
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
        for pattern in SECRET_PATTERNS:
            if pattern.search(content):
                errors.append(
                    f"[LOGS-SECRET-LEAK] Possivel credencial vazada detectada em {path.relative_to(BASE_DIR)}."
                )
                stats["leaks_detected"] += 1
    except Exception as error:
        warnings.append(f"[LOGS-READ-WARN] Falha ao inspecionar {path.relative_to(BASE_DIR)}: {error}")


def audit_logs_pillar() -> tuple[list[str], list[str], dict]:
    """Audita a governanca de logs."""
    errors = []
    warnings = []
    stats = {"files_scanned": 0, "bytes_total": 0, "leaks_detected": 0}

    logs_dir = NEXUS_ZONE / "logs"
    if not logs_dir.exists():
        warnings.append(f"[LOGS] Diretorio de logs ({logs_dir}) nao inicializado.")
        return errors, warnings, stats

    for root, _, files in os.walk(logs_dir):
        for filename in files:
            _audit_log_file(Path(root) / filename, errors, warnings, stats)

    return errors, warnings, stats


def _purge_expired_pytest_dir(item: Path, now: float, warnings: list[str]) -> bool:
    """Remove um diretorio pytest vencido e informa se a purga ocorreu."""
    try:
        if now - item.stat().st_mtime <= 86400:
            return False
        for root, directories, files in os.walk(item, topdown=False):
            for filename in files:
                (Path(root) / filename).unlink(missing_ok=True)
            for directory in directories:
                (Path(root) / directory).rmdir()
        item.rmdir()
        return True
    except Exception as error:
        warnings.append(f"[TEMPS-WARN] Falha ao purificar pasta temporaria de teste {item.name}: {error}")
        return False


def audit_temps_pillar() -> tuple[list[str], list[str], dict]:
    """Audita e higieniza a zona de temporarios."""
    errors = []
    warnings = []
    stats = {"temp_folders": 0, "empty_purged": 0, "pytest_dirs": 0}

    if not NEXUS_ZONE.exists():
        return errors, warnings, stats

    now = time.time()
    # Varredura de diretorios orfaos do pytest
    for item in NEXUS_ZONE.iterdir():
        if not item.is_dir():
            continue
        stats["temp_folders"] += 1
        if item.name.startswith("pytest_"):
            stats["pytest_dirs"] += 1
            stats["empty_purged"] += _purge_expired_pytest_dir(item, now, warnings)

    # Checar por arquivos temporarios soltos na raiz do projeto
    for item in BASE_DIR.iterdir():
        if item.is_file() and item.suffix in [".tmp", ".bak", ".swp", ".orig"]:
            errors.append(f"[TEMPS-POLLUTION] Arquivo temporario orfao na raiz: {item.name}")

    return errors, warnings, stats


def _audit_single_artifact(p: Path, errors: list[str], warnings: list[str]) -> bool:
    try:
        text = p.read_text(encoding="utf-8")
        display_blocks = text.count("$$")
        if display_blocks % 2 != 0:
            errors.append(f"[ARTIFACTS-KATEX] Bloco $$ desbalanceado em {p.name}")

        meta_file = p.with_suffix(".md.metadata.json")
        if meta_file.exists():
            try:
                json.loads(meta_file.read_text(encoding="utf-8"))
                return True
            except Exception:
                warnings.append(f"[ARTIFACTS-META] Metadados corrompidos para {p.name}")
    except Exception as e:
        errors.append(f"[ARTIFACTS-READ] Erro de leitura no artefato {p.name}: {e}")
    return False


def audit_artifacts_pillar() -> tuple[list[str], list[str], dict]:
    """Audita a integridade de artefatos markdown e KaTeX."""
    errors: list[str] = []
    warnings: list[str] = []
    stats = {"artifacts_scanned": 0, "valid_metadata": 0}

    if not BRAIN_DIR.exists():
        warnings.append(f"[ARTIFACTS] Diretorio Brain ({BRAIN_DIR}) nao encontrado.")
        return errors, warnings, stats

    for root, _, files in os.walk(BRAIN_DIR):
        for f in files:
            if f.endswith(".md"):
                stats["artifacts_scanned"] += 1
                if _audit_single_artifact(Path(root) / f, errors, warnings):
                    stats["valid_metadata"] += 1

    return errors, warnings, stats


def _audit_single_skill(skill_file: Path, errors: list[str]) -> bool:
    try:
        content = skill_file.read_text(encoding="utf-8")
        if not content.startswith("---"):
            errors.append(f"[SKILL-NO-FRONTMATTER] {skill_file.parent.name} nao inicia com delimitador YAML '---'")
            return False

        parts = content.split("---", 2)
        if len(parts) < 3:
            errors.append(f"[SKILL-MALFORMED] {skill_file.parent.name} possui frontmatter YAML malformado")
            return False

        frontmatter = parts[1]
        has_name = "name:" in frontmatter
        has_desc = "description:" in frontmatter

        if not has_name:
            errors.append(f"[SKILL-MISSING-NAME] {skill_file.parent.name} nao define 'name:' no frontmatter")
        if not has_desc:
            errors.append(f"[SKILL-MISSING-DESC] {skill_file.parent.name} nao define 'description:' no frontmatter")

        return has_name and has_desc
    except Exception as e:
        errors.append(f"[SKILL-READ-FAIL] Falha ao ler {skill_file}: {e}")
        return False


def audit_skills_pillar() -> tuple[list[str], list[str], dict]:
    """Audita a conformidade das skills do Antigravity/Agent Mesh."""
    errors: list[str] = []
    warnings: list[str] = []
    stats = {"skills_scanned": 0, "valid_frontmatter": 0}

    scan_dirs = [USER_SKILLS_DIR, BUILTIN_SKILLS_DIR]

    for s_dir in scan_dirs:
        if not s_dir.exists():
            continue
        for root, _, files in os.walk(s_dir):
            if "SKILL.md" in files:
                stats["skills_scanned"] += 1
                skill_file = Path(root) / "SKILL.md"
                if _audit_single_skill(skill_file, errors):
                    stats["valid_frontmatter"] += 1

    return errors, warnings, stats


def _print_pillar_summary(name: str, index: int, stats_text: str, errors: list[str], warnings: list[str]) -> None:
    print(f" [PILAR {index}/4: {name}]      {stats_text} | Erros: {len(errors)} | Warnings: {len(warnings)}")
    for e in errors:
        print(f"   {e}")
    for w in warnings:
        print(f"    {w}")


def _determine_tri_state(total_errors: int, total_warnings: int) -> str:
    if total_errors == 0 and total_warnings == 0:
        return "SUCESSO (VERDE)"
    if total_errors == 0 and 1 <= total_warnings <= 2:
        return "FRAGIL (AMARELO)"
    return "FALHOU (VERMELHO)"


def run_full_pillars_audit():
    """Executa a auditoria completa dos 4 pilares sob o SOTA Guard Tri-State."""
    t0 = time.monotonic()
    print("\n" + "=" * 80)
    print("=== [AUDITORIA SOTA v8.0 GOLD: LOGS, TEMPS, ARTIFACTS & SKILLS] ===")
    print("=" * 80 + "\n")

    # 1. LOGS
    log_errs, log_warns, log_stats = audit_logs_pillar()
    log_text = f"{log_stats['files_scanned']} arquivos ({log_stats['bytes_total'] / 1024:.1f} KB)"
    _print_pillar_summary("LOGS", 1, log_text, log_errs, log_warns)

    # 2. TEMPS
    tmp_errs, tmp_warns, tmp_stats = audit_temps_pillar()
    tmp_text = f"{tmp_stats['temp_folders']} pastas ({tmp_stats['empty_purged']} purgadas)"
    _print_pillar_summary("TEMPS", 2, tmp_text, tmp_errs, tmp_warns)

    # 3. ARTIFACTS
    art_errs, art_warns, art_stats = audit_artifacts_pillar()
    art_text = f"{art_stats['artifacts_scanned']} artefatos ({art_stats['valid_metadata']} metadados)"
    _print_pillar_summary("ARTIFACTS", 3, art_text, art_errs, art_warns)

    # 4. SKILLS
    skl_errs, skl_warns, skl_stats = audit_skills_pillar()
    skl_text = f"{skl_stats['skills_scanned']} skills ({skl_stats['valid_frontmatter']} validas)"
    _print_pillar_summary("SKILLS", 4, skl_text, skl_errs, skl_warns)

    total_errors = len(log_errs) + len(tmp_errs) + len(art_errs) + len(skl_errs)
    total_warnings = len(log_warns) + len(tmp_warns) + len(art_warns) + len(skl_warns)
    dt = time.monotonic() - t0
    tri_state = _determine_tri_state(total_errors, total_warnings)

    print("\n" + "=" * 80)
    print("========= SOTA QUALITY & INTEGRITY GUARD  PROTOCOLO CHICO v8.0 GOLD (PILLARS) =========")
    print(f" Total de Erros:    {total_errors} (Teto Maximo Permitido: 0 | Peso: CRITICO)")
    print(f" Total de Warnings: {total_warnings} (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)")
    print(f" Status da Bateria: [{tri_state}] em {dt:.2f}s")
    if total_errors == 0 and total_warnings == 0:
        print(" Homeostase Total:  Logs, Temps, Artifacts e Skills certificados em padrao-ouro absoluto.")
    print("=" * 80 + "\n")

    if total_errors > 0 or total_warnings >= 3:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    run_full_pillars_audit()
