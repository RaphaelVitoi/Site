"""Watchdog e monitor continuo de sessoes remotas do Google Jules na nuvem.

Captura o estado em tempo real das sessoes do Jules Cloud,
registra transicoes de status em JSONL/Log e consolida relatorios SOTA.
"""
from __future__ import annotations

import re
import shutil
import subprocess
from datetime import UTC, datetime
from pathlib import Path
from typing import Final

BASE_DIR: Final[Path] = Path(__file__).resolve().parent.parent.parent
LOGS_DIR: Final[Path] = BASE_DIR / "logs"
LOG_FILE: Final[Path] = LOGS_DIR / "jules_cloud_sessions.log"
REPORT_FILE: Final[Path] = BASE_DIR / "reports" / "REGISTRO-2026-08-29-jules-cloud-session-tracking.md"

LOGS_DIR.mkdir(parents=True, exist_ok=True)


def parse_jules_sessions() -> list[dict[str, str]]:
    """Executa 'jules remote list --session' e analisa a tabela de saida."""
    jules_bin = shutil.which("jules") or "jules"
    try:
        res = subprocess.run(
            [jules_bin, "remote", "list", "--session"],
            capture_output=True,
            text=True,
            shell=False,
            check=False,
        )
        output = res.stdout
    except Exception as e:
        return [{"error": str(e)}]

    sessions: list[dict[str, str]] = []
    lines = [line.strip() for line in output.splitlines() if line.strip()]

    for line in lines[1:]:  # Pula o cabecalho
        parts = re.split(r"\s{2,}", line)
        if len(parts) >= 4:
            sessions.append({
                "session_id": parts[0],
                "description": parts[1],
                "repo": parts[2],
                "last_active": parts[3] if len(parts) > 3 else "N/A",
                "status": parts[4] if len(parts) > 4 else "Unknown",
            })
    return sessions


def record_snapshot() -> None:
    """Grava snapshot atual das sessoes no log persistente e no relatorio."""
    sessions = parse_jules_sessions()
    now_iso = datetime.now(UTC).isoformat()

    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write(f"[{now_iso}] Snapshot: {len(sessions)} sessoes rastreadas\n")
        for s in sessions:
            f.write(f"  - ID: {s.get('session_id')} | Status: {s.get('status')} | Repo: {s.get('repo')} | Desc: {s.get('description')}\n")

    # Gera relatorio em Markdown
    content = f"""# REGISTRO DE MONITORAMENTO: GOOGLE JULES CLOUD SESSIONS
\n> **Protocolo Chico SOTA v8.0 GOLD * Rastreamento de Sessoes em Nuvem**
> **Ultima Atualizacao:** {now_iso}
> **Canal Oficial:** [jules.google.com](https://jules.google.com/)

---

## 1. Sessoes Remotas Identificadas

| ID da Sessao | Repositorio | Descricao da Tarefa | Ultima Atividade | Status na VM |
| :--- | :--- | :--- | :--- | :--- |
"""
    for s in sessions:
        sid = s.get("session_id", "")
        url = f"https://jules.google.com/session/{sid}"
        content += f"| [{sid}]({url}) | `{s.get('repo')}` | {s.get('description')} | `{s.get('last_active')}` | **{s.get('status')}** |\n"

    content += """
---
## 2. Acoes Operacionais Disponiveis

```bash
# Inspecionar detalhes ou diff da sessao:
jules remote pull --session <SESSION_ID>

# Disparar nova sessao com branch explicita:
jules new --repo RaphaelVitoi/Site "Descricao da Tarefa"
```
"""
    REPORT_FILE.write_text(content, encoding="utf-8")


if __name__ == "__main__":
    record_snapshot()
    print(f"Snapshot gravado em {LOG_FILE} e {REPORT_FILE}")
