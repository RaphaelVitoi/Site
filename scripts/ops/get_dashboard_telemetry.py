"""
SOTA v8.0 GOLD: Nexus Dashboard Telemetry Engine.
Coleta e formata metricas de tarefas, modelos (Qwen 7B, Gemma 4B, Gemma 31B Cloud),
previsao de task, RUNNING & ETA e status das ultimas 5 tarefas.
"""

from __future__ import annotations

import json
import socket
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = BASE_DIR / "queue" / "tasks.db"
OLLAMA_MODELS_PATH = BASE_DIR / "data" / "ollama_models.json"


def is_port_open(port: int, host: str = "127.0.0.1") -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.15)
            return s.connect_ex((host, port)) == 0
    except Exception:
        return False


def get_model_status() -> dict:
    """Verifica presenca e disponibilidade dos modelos locais e cloud."""
    models_manifest = {}
    if OLLAMA_MODELS_PATH.exists():
        try:
            with open(OLLAMA_MODELS_PATH, "r", encoding="utf-8") as f:
                manifest_data = json.load(f)
                for m in manifest_data.get("models", []):
                    models_manifest[m.get("alias")] = m
        except Exception:
            pass

    ollama_dir = Path.home() / ".ollama" / "models" / "manifests" / "registry.ollama.ai" / "library"

    qwen_7b_installed = (ollama_dir / "qwen2.5-coder" / "7b").exists() or (
        ollama_dir / "qwen2.5-coder" / "7b-instruct-q5_K_M"
    ).exists()
    gemma_4b_installed = (ollama_dir / "gemma4" / "e4b").exists()
    gemma_31b_cloud_installed = (ollama_dir / "gemma4" / "31b-cloud").exists() or (
        ollama_dir / "gemma4" / "31b"
    ).exists()

    return {
        "qwen_7b": {
            "name": "Qwen 2.5 7B Coder",
            "tag": "qwen2.5-coder:7b",
            "tier": "local",
            "installed": qwen_7b_installed,
            "status": "READY (Local)" if qwen_7b_installed else "PENDING_PULL",
        },
        "gemma4_4b": {
            "name": "Gemma 4B (e4b)",
            "tag": "gemma4:e4b",
            "tier": "local",
            "installed": gemma_4b_installed,
            "status": "READY (Local)" if gemma_4b_installed else "PENDING_PULL",
        },
        "gemma4_31b_cloud": {
            "name": "Gemma 4 31B Cloud",
            "tag": "gemma4:31b-cloud",
            "tier": "cloud",
            "installed": gemma_31b_cloud_installed,
            "status": "ACCESSIBLE (Cloud / Local Sync)" if gemma_31b_cloud_installed else "CONFIGURED",
        },
    }


def classify_task_status(raw_status: str, metadata_raw: str | dict | None) -> tuple[str, str]:
    """
    Mapeia os 5 estados de operacao estritos:
    1. 'completa mas falhou' (soft_failure / warnings)
    2. 'completa mas requer revisao adicional' (review_required)
    3. 'failed' (falha dura)
    4. 'suspensa' (suspended / pausada)
    5. 'prevista e engatilhada' (pending / queued / triggered)
    """
    s = (raw_status or "").lower().strip()
    meta = {}
    if metadata_raw:
        if isinstance(metadata_raw, str):
            try:
                meta = json.loads(metadata_raw)
            except Exception:
                meta = {}
        elif isinstance(metadata_raw, dict):
            meta = metadata_raw

    if s == "completed_with_errors" or (
        s == "completed" and (meta.get("soft_failure") or meta.get("last_error_class"))
    ):
        return "completa_falhou", "Completa mas falhou"
    elif s == "review_required" or (s == "completed" and (meta.get("review_required") or meta.get("requires_review"))):
        return "completa_revisao", "Completa mas requer revisao adicional"
    elif s in ("failed", "error"):
        return "failed", "Failed (Falha Dura)"
    elif s in ("suspended", "paused", "holding"):
        return "suspensa", "Suspensa"
    elif s in ("pending", "queued", "triggered", "forecasted"):
        return "prevista_engatilhada", "Prevista e engatilhada (Fila)"
    elif s == "completed":
        return "completed", "Concluida com Sucesso"
    elif s == "running":
        return "running", "Em Execucao (RUNNING)"
    return "unknown", s.capitalize()


def collect_telemetry() -> dict:
    models_info = get_model_status()
    ports_info = {
        "ollama_11434": is_port_open(11434),
        "gemma_server_17043": is_port_open(17043),
        "backend_8000": is_port_open(8000),
        "vulkan_8080": is_port_open(8080),
    }

    counts: dict[str, Any] = {
        "completed": 0,
        "running": 0,
        "pending": 0,
        "failed": 0,
        "completa_falhou": 0,
        "completa_revisao": 0,
        "suspensa": 0,
        "prevista_engatilhada": 0,
        "total": 0,
    }

    running_tasks = []
    last_5_tasks = []
    forecast_tasks = []

    if DB_PATH.exists():
        try:
            conn = sqlite3.connect(str(DB_PATH))
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()

            # Coletar estatisticas
            cur.execute("SELECT status, metadata FROM tasks")
            for row in cur.fetchall():
                counts["total"] += 1
                cat_key, _ = classify_task_status(row["status"], row["metadata"])
                if cat_key in counts:
                    counts[cat_key] += 1
                if row["status"] in ("completed", "running", "pending", "failed"):
                    counts[row["status"]] += 1

            # Tarefas em execucao com ETA
            cur.execute(
                """
                SELECT id, agent, description, timestamp, metadata
                FROM tasks
                WHERE status = 'running'
                ORDER BY timestamp ASC
                LIMIT 5
                """
            )
            now_ts = datetime.now(UTC)
            for r in cur.fetchall():
                t_dict = dict(r)
                elapsed_sec = 0.0
                if t_dict.get("timestamp"):
                    try:
                        t_dt = datetime.fromisoformat(t_dict["timestamp"].replace("Z", "+00:00"))
                        elapsed_sec = max(0.0, (now_ts - t_dt).total_seconds())
                    except Exception:
                        elapsed_sec = 0.0

                # Estimativa de duracao padrao SOTA: ~45s
                avg_dur_sec = 45.0
                remaining_sec = max(2.0, avg_dur_sec - elapsed_sec)
                eta_pct = min(98, int((elapsed_sec / (elapsed_sec + remaining_sec)) * 100))

                running_tasks.append(
                    {
                        "id": t_dict.get("id"),
                        "agent": t_dict.get("agent", "@chico"),
                        "description": (t_dict.get("description") or "")[:60].replace("\n", " "),
                        "elapsed_sec": round(elapsed_sec, 1),
                        "eta_remaining_sec": round(remaining_sec, 1),
                        "progress_pct": eta_pct,
                    }
                )

            # Ultimas 5 tarefas com status detalhado
            cur.execute(
                """
                SELECT id, agent, description, status, timestamp, completedAt, metadata
                FROM tasks
                ORDER BY rowid DESC
                LIMIT 5
                """
            )
            for r in cur.fetchall():
                t_dict = dict(r)
                status_code, status_label = classify_task_status(t_dict["status"], t_dict.get("metadata"))
                last_5_tasks.append(
                    {
                        "id": t_dict.get("id"),
                        "agent": t_dict.get("agent", "@dispatcher"),
                        "description": (t_dict.get("description") or "")[:55].replace("\n", " "),
                        "raw_status": t_dict["status"],
                        "status_code": status_code,
                        "status_label": status_label,
                        "created_at": t_dict.get("timestamp"),
                        "completed_at": t_dict.get("completedAt"),
                    }
                )

            # Previsao de Task (Fila / Triggered)
            cur.execute(
                """
                SELECT id, agent, description, priority, timestamp
                FROM tasks
                WHERE status IN ('pending', 'queued', 'triggered')
                ORDER BY timestamp ASC
                LIMIT 5
                """
            )
            for r in cur.fetchall():
                t_dict = dict(r)
                forecast_tasks.append(
                    {
                        "id": t_dict.get("id"),
                        "agent": t_dict.get("agent", "@dispatcher"),
                        "description": (t_dict.get("description") or "")[:50].replace("\n", " "),
                        "priority": t_dict.get("priority", "normal"),
                        "estimated_start": "Proximo no pipeline",
                    }
                )

            conn.close()
        except Exception as e:
            counts["db_error"] = str(e)

    # Se nao houver forecast em fila, adicionar proxima prevista pelo ciclo de manutencao
    if not forecast_tasks:
        forecast_tasks.append(
            {
                "id": "FORECAST-OPS-MONTHLY-AUDIT",
                "agent": "@auditor",
                "description": "Auditoria Mensal Periodica de Modus Operandi e Roteamento",
                "priority": "normal",
                "estimated_start": "01 do proximo mes (09:00)",
            }
        )

    return {
        "timestamp": datetime.now(UTC).isoformat(),
        "models": models_info,
        "ports": ports_info,
        "counts": counts,
        "running_now": running_tasks,
        "last_5_tasks": last_5_tasks,
        "forecast_tasks": forecast_tasks,
    }


def main() -> None:
    telemetry_data = collect_telemetry()
    print(json.dumps(telemetry_data, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
