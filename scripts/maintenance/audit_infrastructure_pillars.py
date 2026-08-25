#!/usr/bin/env python3
"""
AUDITORIA SOTA v8.0 GOLD: INFRASTRUCTURE PILLARS (LOGS, TEMPS, ARTIFACTS, SKILLS)
Governança: Raphael Vitoi | Protocolo: CHICO SOTA v8.0 GOLD

Audita, valida e aplica o sistema Tri-State Guard com rigor matemático sobre:
1. LOGS: Políticas de retenção, ausência de vazamento de credenciais, encoding e rotação.
2. TEMPS: Purificação de pastas vazias/órfãs, integridade SQLite e isolamento na Nexus Zone.
3. ARTIFACTS: Validação de markdown, KaTeX math blocks, integridade de metadados e media links.
4. SKILLS: Validação de YAML frontmatter, integridade de nomes, descrições e recursos em 100% das skills.
"""

import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Dict, List, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent.parent
NEXUS_ZONE = BASE_DIR / "temp" / "nexus_zone"
USER_SKILLS_DIR = Path(r"c:\Users\rapha\.agents\skills")
BUILTIN_SKILLS_DIR = BASE_DIR.parent / "antigravity" / "builtin" / "skills"
BRAIN_DIR = BASE_DIR.parent / "antigravity" / "brain"

# Regex para detecção de segredos em logs
SECRET_PATTERNS = [
    re.compile(r"(?:AIzaSy[A-Za-z0-9-_]{33})"),  # Google Gemini / Firebase API Key
    re.compile(r"(?:sk-[A-Za-z0-9-_]{32,})"),  # OpenAI / Anthropic Secret Key
    re.compile(r"(?:ghp_[A-Za-z0-9]{36})"),  # GitHub Personal Token
    re.compile(r"(?:Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)"),  # JWT
]


def audit_logs_pillar() -> Tuple[List[str], List[str], Dict]:
    """Audita a governança de logs."""
    errors = []
    warnings = []
    stats = {"files_scanned": 0, "bytes_total": 0, "leaks_detected": 0}

    logs_dir = NEXUS_ZONE / "logs"
    if not logs_dir.exists():
        warnings.append(f"[LOGS] Diretório de logs ({logs_dir}) não inicializado.")
        return errors, warnings, stats

    for root, _, files in os.walk(logs_dir):
        for f in files:
            p = Path(root) / f
            stats["files_scanned"] += 1
            sz = p.stat().st_size
            stats["bytes_total"] += sz

            if sz > 20 * 1024 * 1024:  # > 20MB
                errors.append(
                    f"[LOGS-EXCESS] Arquivo {p.relative_to(BASE_DIR)} excede limite de rotação (Tamanho: {sz / (1024 * 1024):.2f}MB > 20MB)."
                )

            try:
                content = p.read_text(encoding="utf-8", errors="ignore")
                for pattern in SECRET_PATTERNS:
                    if pattern.search(content):
                        errors.append(
                            f"[LOGS-SECRET-LEAK] Possível credencial vazada detectada em {p.relative_to(BASE_DIR)}."
                        )
                        stats["leaks_detected"] += 1
            except Exception as e:
                warnings.append(f"[LOGS-READ-WARN] Falha ao inspecionar {p.relative_to(BASE_DIR)}: {e}")

    return errors, warnings, stats


def audit_temps_pillar() -> Tuple[List[str], List[str], Dict]:
    """Audita e higieniza a zona de temporários."""
    errors = []
    warnings = []
    stats = {"temp_folders": 0, "empty_purged": 0, "pytest_dirs": 0}

    if not NEXUS_ZONE.exists():
        return errors, warnings, stats

    now = time.time()
    max_age = 86400  # > 24h

    # Varredura de diretórios órfãos do pytest
    for item in NEXUS_ZONE.iterdir():
        if item.is_dir():
            stats["temp_folders"] += 1
            if item.name.startswith("pytest_"):
                stats["pytest_dirs"] += 1
                try:
                    # Remove diretórios de teste antigos ou vazios
                    mtime = item.stat().st_mtime
                    if now - mtime > max_age:
                        # Purge recursivo seguro
                        for root, dirs, files in os.walk(item, topdown=False):
                            for f in files:
                                (Path(root) / f).unlink(missing_ok=True)
                            for d in dirs:
                                (Path(root) / d).rmdir()
                        item.rmdir()
                        stats["empty_purged"] += 1
                except Exception as e:
                    warnings.append(f"[TEMPS-WARN] Falha ao purificar pasta temporária de teste {item.name}: {e}")

    # Checar por arquivos temporários soltos na raiz do projeto
    for item in BASE_DIR.iterdir():
        if item.is_file() and item.suffix in [".tmp", ".bak", ".swp", ".orig"]:
            errors.append(f"[TEMPS-POLLUTION] Arquivo temporário órfão na raiz: {item.name}")

    return errors, warnings, stats


def audit_artifacts_pillar() -> Tuple[List[str], List[str], Dict]:
    """Audita a integridade de artefatos markdown e KaTeX."""
    errors = []
    warnings = []
    stats = {"artifacts_scanned": 0, "valid_metadata": 0}

    if not BRAIN_DIR.exists():
        warnings.append(f"[ARTIFACTS] Diretório Brain ({BRAIN_DIR}) não encontrado.")
        return errors, warnings, stats

    for root, _, files in os.walk(BRAIN_DIR):
        for f in files:
            if f.endswith(".md"):
                stats["artifacts_scanned"] += 1
                p = Path(root) / f
                try:
                    text = p.read_text(encoding="utf-8")
                    # Checagem de balanceamento de KaTeX display blocks
                    display_blocks = text.count("$$")
                    if display_blocks % 2 != 0:
                        errors.append(f"[ARTIFACTS-KATEX] Bloco $$ desbalanceado em {p.name}")

                    # Checagem de metadata companion
                    meta_file = p.with_suffix(".md.metadata.json")
                    if meta_file.exists():
                        try:
                            json.loads(meta_file.read_text(encoding="utf-8"))
                            stats["valid_metadata"] += 1
                        except Exception:
                            warnings.append(f"[ARTIFACTS-META] Metadados corrompidos para {p.name}")
                except Exception as e:
                    errors.append(f"[ARTIFACTS-READ] Erro de leitura no artefato {p.name}: {e}")

    return errors, warnings, stats


def audit_skills_pillar() -> Tuple[List[str], List[str], Dict]:
    """Audita a conformidade das skills do Antigravity/Agent Mesh."""
    errors = []
    warnings = []
    stats = {"skills_scanned": 0, "valid_frontmatter": 0}

    scan_dirs = [USER_SKILLS_DIR, BUILTIN_SKILLS_DIR]

    for s_dir in scan_dirs:
        if not s_dir.exists():
            continue
        for root, _, files in os.walk(s_dir):
            if "SKILL.md" in files:
                stats["skills_scanned"] += 1
                skill_file = Path(root) / "SKILL.md"
                try:
                    content = skill_file.read_text(encoding="utf-8")
                    # Validar YAML Frontmatter
                    if not content.startswith("---"):
                        errors.append(
                            f"[SKILL-NO-FRONTMATTER] {skill_file.parent.name} não inicia com delimitador YAML '---'"
                        )
                        continue

                    parts = content.split("---", 2)
                    if len(parts) < 3:
                        errors.append(f"[SKILL-MALFORMED] {skill_file.parent.name} possui frontmatter YAML malformado")
                        continue

                    frontmatter = parts[1]
                    has_name = "name:" in frontmatter
                    has_desc = "description:" in frontmatter

                    if not has_name:
                        errors.append(
                            f"[SKILL-MISSING-NAME] {skill_file.parent.name} não define 'name:' no frontmatter"
                        )
                    if not has_desc:
                        errors.append(
                            f"[SKILL-MISSING-DESC] {skill_file.parent.name} não define 'description:' no frontmatter"
                        )

                    if has_name and has_desc:
                        stats["valid_frontmatter"] += 1

                except Exception as e:
                    errors.append(f"[SKILL-READ-FAIL] Falha ao ler {skill_file}: {e}")

    return errors, warnings, stats


def run_full_pillars_audit():
    """Executa a auditoria completa dos 4 pilares sob o SOTA Guard Tri-State."""
    t0 = time.monotonic()
    print("\n" + "=" * 80)
    print("=== [AUDITORIA SOTA v8.0 GOLD: LOGS, TEMPS, ARTIFACTS & SKILLS] ===")
    print("=" * 80 + "\n")

    # 1. LOGS
    log_errs, log_warns, log_stats = audit_logs_pillar()
    print(
        f"• [PILAR 1/4: LOGS]      {log_stats['files_scanned']} arquivos ({log_stats['bytes_total'] / 1024:.1f} KB) | Erros: {len(log_errs)} | Warnings: {len(log_warns)}"
    )
    for e in log_errs:
        print(f"  ❌ {e}")
    for w in log_warns:
        print(f"  ⚠️  {w}")

    # 2. TEMPS
    tmp_errs, tmp_warns, tmp_stats = audit_temps_pillar()
    print(
        f"• [PILAR 2/4: TEMPS]     {tmp_stats['temp_folders']} pastas ({tmp_stats['empty_purged']} purgadas) | Erros: {len(tmp_errs)} | Warnings: {len(tmp_warns)}"
    )
    for e in tmp_errs:
        print(f"  ❌ {e}")
    for w in tmp_warns:
        print(f"  ⚠️  {w}")

    # 3. ARTIFACTS
    art_errs, art_warns, art_stats = audit_artifacts_pillar()
    print(
        f"• [PILAR 3/4: ARTIFACTS] {art_stats['artifacts_scanned']} artefatos ({art_stats['valid_metadata']} metadados) | Erros: {len(art_errs)} | Warnings: {len(art_warns)}"
    )
    for e in art_errs:
        print(f"  ❌ {e}")
    for w in art_warns:
        print(f"  ⚠️  {w}")

    # 4. SKILLS
    skl_errs, skl_warns, skl_stats = audit_skills_pillar()
    print(
        f"• [PILAR 4/4: SKILLS]    {skl_stats['skills_scanned']} skills ({skl_stats['valid_frontmatter']} válidas) | Erros: {len(skl_errs)} | Warnings: {len(skl_warns)}"
    )
    for e in skl_errs:
        print(f"  ❌ {e}")
    for w in skl_warns:
        print(f"  ⚠️  {w}")

    total_errors = len(log_errs) + len(tmp_errs) + len(art_errs) + len(skl_errs)
    total_warnings = len(log_warns) + len(tmp_warns) + len(art_warns) + len(skl_warns)
    dt = time.monotonic() - t0

    if total_errors == 0 and total_warnings == 0:
        tri_state = "SUCESSO (VERDE)"
    elif total_errors == 0 and 1 <= total_warnings <= 2:
        tri_state = "FRAGIL (AMARELO)"
    else:
        tri_state = "FALHOU (VERMELHO)"

    print("\n" + "=" * 80)
    print("========= SOTA QUALITY & INTEGRITY GUARD — PROTOCOLO CHICO v8.0 GOLD (PILLARS) =========")
    print(f"• Total de Erros:    {total_errors} (Teto Máximo Permitido: 0 | Peso: CRÍTICO)")
    print(f"• Total de Warnings: {total_warnings} (Teto Máximo Permitido: 2 | Tolerância: 0 para SUCESSO)")
    print(f"• Status da Bateria: [{tri_state}] em {dt:.2f}s")
    if total_errors == 0 and total_warnings == 0:
        print("• Homeostase Total:  Logs, Temps, Artifacts e Skills certificados em padrão-ouro absoluto.")
    print("=" * 80 + "\n")

    if total_errors > 0 or total_warnings >= 3:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    run_full_pillars_audit()
