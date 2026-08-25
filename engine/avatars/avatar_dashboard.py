"""Dashboard interativo SOTA para o ecossistema de Avatares - Poker Racional."""

import json
import logging
import os
import socket
import sqlite3
import subprocess  # noqa: S404
import sys
import time
from datetime import UTC, datetime

#
# PALETTE ANSI  Pure ASCII labels, rich ANSI color
#
C_BLUE = "\033[94m"
C_GREEN = "\033[92m"
C_YELLOW = "\033[93m"
C_RED = "\033[91m"
C_CYAN = "\033[96m"
C_MAGENTA = "\033[95m"
C_WHITE = "\033[97m"
C_DIM = "\033[2m"
C_RESET = "\033[0m"
C_BOLD = "\033[1m"

#
# AVATAR CATALOGUE  (key, display_label, model_tag, scope_tag)
#
AVATARS = [
    ("chico", "CHICO (Avatar Supremo)", "qwen-code-surgical:latest", "Target Lock, Orquestracao e Governanca W3"),
    (
        "maverick",
        "MAVERICK (Math Engineer)",
        "qwen-pmev-math:latest",
        "Perspectiva Matematica (PMev), Teoria dos Jogos",
    ),
    (
        "historian",
        "HISTORIAN (Arquivista Lirico)",
        "qwen-poetics:latest",
        "Prosa Poetica, Letras, Cadencia e Filosofia",
    ),
    (
        "validador",
        "VALIDADOR (Math & PMev Gate)",
        "qwen-pmev-math:latest",
        "Validacao Bayesiana, Teoremas Vitoi e Auditoria",
    ),
    (
        "implementor",
        "IMPLEMENTOR (Code & Refactor)",
        "qwen2.5-coder:7b",
        "Engenharia de Software, Search/Replace, AST",
    ),
    (
        "qwen2.5_7b",
        "QWEN 2.5 7B (Coder Local)",
        "qwen2.5-coder:7b",
        "Modelo Local Primario para Codificacao e Tools",
    ),
    (
        "gemma4_4b",
        "GEMMA 4B (Local Leve)",
        "gemma4:e4b",
        "Inferencia Rapida sob Pressao de Memoria RAM",
    ),
    (
        "gemma4",
        "GEMMA4 (Oraculo de Borda)",
        "gemma4:12b",
        "RAG LanceDB, Memoria Vetorial e Baixa Latencia",
    ),
    (
        "gemma4_31b_cloud",
        "GEMMA 31B CLOUD (Raciocinio Remoto)",
        "gemma4:31b-cloud",
        "Inferencia Remota sem Custo de Disco Local",
    ),
]

PERSONA_MAP = {str(i + 1): av[0] for i, av in enumerate(AVATARS)}


#
# HELPERS
#
def clear_screen() -> None:
    if os.name == "nt":
        subprocess.run(["cmd", "/c", "cls"], check=False)
    else:
        subprocess.run(["clear"], check=False)


def is_port_open(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.12)
        return s.connect_ex(("127.0.0.1", port)) == 0


def _db_path() -> str:
    return os.path.abspath(os.path.join(os.path.dirname(__file__), "../../queue/tasks.db"))


def _fmt_ts(iso: str | None) -> str:
    """Converte timestamp ISO para formato compacto local."""
    if not iso:
        return "  --:--  "
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        local = dt.astimezone()
        return local.strftime("%d/%m %H:%M")
    except Exception:
        return iso[:11]


def classify_task_status(raw_status: str, metadata_raw: str | dict | None) -> tuple[str, str, str]:
    """
    Mapeia os 5 estados de operacao:
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

    if s == "completed_with_errors" or (s == "completed" and (meta.get("soft_failure") or meta.get("last_error_class"))):
        return "completa_falhou", f"{C_YELLOW}[OK/AVISO]{C_RESET}", "Completa mas falhou (Soft-Fail)"
    elif s == "review_required" or (s == "completed" and (meta.get("review_required") or meta.get("requires_review"))):
        return "completa_revisao", f"{C_CYAN}[OK/REV]{C_RESET}  ", "Completa mas requer revisao"
    elif s in ("failed", "error"):
        return "failed", f"{C_RED}[FAILED]{C_RESET}  ", "Falha Dura (Erro de Execucao)"
    elif s in ("suspended", "paused", "holding"):
        return "suspensa", f"{C_MAGENTA}[SUSPENSA]{C_RESET}", "Suspensa / Aguardando"
    elif s in ("pending", "queued", "triggered", "forecasted"):
        return "prevista_engatilhada", f"{C_BLUE}[FILA]{C_RESET}     ", "Prevista e Engatilhada (Fila)"
    elif s == "completed":
        return "completed", f"{C_GREEN}[OK]{C_RESET}       ", "Concluida com Sucesso"
    elif s == "running":
        return "running", f"{C_YELLOW}[RUN]{C_RESET}      ", "Em Execucao (RUNNING)"
    return "unknown", f"{C_WHITE}[{s[:6]}]{C_RESET}   ", s.capitalize()


def _bar(value: int, total: int, width: int = 18) -> str:
    """Mini barra de progresso ASCII."""
    filled = 0 if total == 0 else min(width, int(width * value / total))
    progress_bar = "#" * filled + "-" * (width - filled)
    pct = int(100 * value / total) if total else 0
    return f"[{C_GREEN}{progress_bar}{C_RESET}] {pct:>3}%"


#
# DATABASE LAYER  (sync sqlite3  dashboard nao usa asyncio)
#
def get_db_snapshot() -> dict:
    """Extrai snapshot completo do banco de tarefas."""
    snap = {
        "counts": {
            "completed": 0, "running": 0, "pending": 0, "failed": 0,
            "completa_falhou": 0, "completa_revisao": 0, "suspensa": 0, "prevista_engatilhada": 0
        },
        "by_agent": {},
        "history": [],  # last 20 tasks (all agents)
        "last_5_detailed": [], # exact last 5 tasks
        "running_now": [],  # tasks currently running with ETA
        "forecast_tasks": [], # queued / triggered
        "api_usage": [],
    }
    db = _db_path()
    if not os.path.exists(db):
        return snap
    try:
        conn = sqlite3.connect(db)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # Global counts & classification
        cur.execute("SELECT status, metadata FROM tasks")
        for row in cur.fetchall():
            s = (row["status"] or "").lower().strip()
            cat, _, _ = classify_task_status(s, row["metadata"])
            if cat in snap["counts"]:
                snap["counts"][cat] += 1
            if s in snap["counts"]:
                snap["counts"][s] += 1

        # Per-agent counts
        cur.execute("SELECT agent, status, COUNT(*) as n FROM tasks GROUP BY agent, status")
        for row in cur.fetchall():
            ag = (row["agent"] or "").replace("@", "").lower().strip()
            if not ag:
                continue
            if ag not in snap["by_agent"]:
                snap["by_agent"][ag] = {"completed": 0, "running": 0, "pending": 0, "failed": 0}
            s = row["status"].lower().strip()
            if s in snap["by_agent"][ag]:
                snap["by_agent"][ag][s] = row["n"]

        # History: last 20 tasks
        cur.execute(
            """
            SELECT id, agent, status, description, timestamp, completedAt, metadata
            FROM tasks
            ORDER BY timestamp DESC
            LIMIT 20
            """
        )
        snap["history"] = [dict(r) for r in cur.fetchall()]

        # Last 5 detailed tasks
        cur.execute(
            """
            SELECT id, agent, status, description, timestamp, completedAt, metadata
            FROM tasks
            ORDER BY rowid DESC
            LIMIT 5
            """
        )
        for r in cur.fetchall():
            t_dict = dict(r)
            cat_code, badge, label = classify_task_status(t_dict["status"], t_dict.get("metadata"))
            t_dict["status_category"] = cat_code
            t_dict["status_badge"] = badge
            t_dict["status_label"] = label
            snap["last_5_detailed"].append(t_dict)

        # Tasks running right now with ETA calculation
        cur.execute(
            """
            SELECT id, agent, description, timestamp, metadata
            FROM tasks
            WHERE status = 'running'
            ORDER BY timestamp ASC
            LIMIT 8
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

            avg_dur_sec = 45.0
            remaining_sec = max(2.0, avg_dur_sec - elapsed_sec)
            progress_pct = min(98, int((elapsed_sec / (elapsed_sec + remaining_sec)) * 100))

            t_dict["elapsed_sec"] = round(elapsed_sec, 1)
            t_dict["eta_remaining_sec"] = round(remaining_sec, 1)
            t_dict["progress_pct"] = progress_pct
            snap["running_now"].append(t_dict)

        # Forecasted / Queued Tasks
        cur.execute(
            """
            SELECT id, agent, description, priority, timestamp
            FROM tasks
            WHERE status IN ('pending', 'queued', 'triggered')
            ORDER BY timestamp ASC
            LIMIT 5
            """
        )
        snap["forecast_tasks"] = [dict(r) for r in cur.fetchall()]
        if not snap["forecast_tasks"]:
            snap["forecast_tasks"].append({
                "id": "FORECAST-OPS-MONTHLY-AUDIT",
                "agent": "@auditor",
                "description": "Auditoria Mensal Periodica de Modus Operandi e Roteamento",
                "priority": "normal",
                "estimated_start": "01 do proximo mes (09:00)"
            })

        # API usage
        cur.execute(
            """
            SELECT model,
                   COUNT(*) as n,
                   SUM(prompt_tokens) as pt,
                   SUM(completion_tokens) as ct
            FROM api_usage
            GROUP BY model
            ORDER BY n DESC
            LIMIT 8
            """
        )
        snap["api_usage"] = [dict(r) for r in cur.fetchall()]

        conn.close()
    except Exception as e:
        logging.warning("Could not get DB snapshot for dashboard: %s", e)
    return snap


#
# PRINT BLOCKS
#
def _ruler(width: int = 66) -> None:
    print(f"{C_DIM}{'-' * width}{C_RESET}")


def print_header(subtitle: str = "") -> None:
    print(f"{C_CYAN}{C_BOLD}{'=' * 66}")
    print(f"{'DASHBOARD SOTA & TASK TRACKING - POKER RACIONAL':^66}")
    if subtitle:
        print(f"{subtitle:^66}")
    print(f"{'=' * 66}{C_RESET}")
    now = datetime.now(UTC).astimezone().strftime("%d/%m/%Y %H:%M:%S")
    print(f"  {C_DIM}Diretriz Vitoi: Excelencia Tecnica | Latencia Otimizada | Simetria{C_RESET}")
    print(f"  {C_DIM}Timestamp: {now}{C_RESET}")
    _ruler()


#  PANEL 1: main menu
def show_main_menu(snap: dict) -> None:
    running = snap["counts"]["running"]
    pending = snap["counts"]["pending"]

    print(f"\n  {C_BOLD}AVATARES E AGENTES ESPECIALIZADOS DISPONIVEIS:{C_RESET}\n")
    for idx, (key, label, model, scope) in enumerate(AVATARS, 1):
        ag = snap["by_agent"].get(key, {})
        ok = ag.get("completed", 0)
        fail = ag.get("failed", 0)
        run = ag.get("running", 0)
        pend = ag.get("pending", 0)

        # inline status summary
        status_str = (
            f"{C_GREEN}{ok}ok{C_RESET} "
            f"{C_RED}{fail}err{C_RESET} "
            f"{C_YELLOW}{run}run{C_RESET} "
            f"{C_BLUE}{pend}fila{C_RESET}"
        )
        print(f"  [{C_GREEN}{idx:>2}{C_RESET}] {C_BOLD}{label:<35}{C_RESET} [{status_str}]")
        print(f"       Modelo : {C_YELLOW}{model}{C_RESET}")
        print(f"       Escopo : {C_DIM}{scope}{C_RESET}")

    metric_idx = len(AVATARS) + 1
    print(f"\n  [{C_MAGENTA}{metric_idx:>2}{C_RESET}] {C_BOLD}METRICAS, TELEMETRIA, RUNNING & ETA, STATUS ULTIMAS 5 TASKS{C_RESET}")
    _ruler()

    # mini queue summary in menu
    total = sum(snap["counts"].values())
    print(
        f"  Fila global: "
        f"{C_GREEN}{snap['counts']['completed']} ok{C_RESET}  "
        f"{C_RED}{snap['counts']['failed']} err{C_RESET}  "
        f"{C_YELLOW}{running} run{C_RESET}  "
        f"{C_BLUE}{pending} fila{C_RESET}  "
        f"  Total:{total}"
    )
    if running > 0:
        print(f"  {C_YELLOW}[AVISO] {running} tarefa(s) em execucao ativa agora!{C_RESET}")
    _ruler()


#  PANEL 2: full metrics
def _print_running_tasks(snap: dict) -> None:
    print(f"\n{C_YELLOW}{C_BOLD}>>> [1] TAREFAS EM EXECUCAO (RUNNING & ETA){C_RESET}")
    if snap["running_now"]:
        for t in snap["running_now"]:
            ag = (t.get("agent") or "?").replace("@", "").upper()[:12]
            desc = (t.get("description") or "")[:40].replace("\n", " ")
            el = t.get("elapsed_sec", 0)
            eta = t.get("eta_remaining_sec", 0)
            pct = t.get("progress_pct", 0)
            print(f"  {C_YELLOW}[RUN]{C_RESET} {C_BOLD}{ag:<12}{C_RESET} {desc:<40} | {el}s decorridos | ETA: ~{eta}s ({pct}%)")
    else:
        print(f"  {C_DIM}Nenhuma tarefa em execucao ativa no momento (Standby / Pronto para despacho).{C_RESET}")
    _ruler()


def _print_last_5_tasks(snap: dict) -> None:
    print(f"\n{C_CYAN}{C_BOLD}>>> [2] STATUS DAS ULTIMAS 5 TAREFAS (RASTREIO DE OPERACAO){C_RESET}")
    print(f"  {'#':<3} {'Status da Operacao':<16} {'Agente':<12} {'Descricao':<35}")
    print(f"  {'-' * 3} {'-' * 16} {'-' * 12} {'-' * 35}")
    if snap["last_5_detailed"]:
        for i, t in enumerate(snap["last_5_detailed"], 1):
            badge = t.get("status_badge", "[???]")
            ag = (t.get("agent") or "?").replace("@", "")[:12]
            desc = (t.get("description") or "")[:35].replace("\n", " ")
            print(f"  {i:<3} {badge:<16} {C_CYAN}{ag:<12}{C_RESET} {desc:<35}")
    else:
        print(f"  {C_DIM}Nenhuma tarefa registrada no historico.{C_RESET}")
    _ruler()


def _print_forecast_tasks(snap: dict) -> None:
    print(f"\n{C_BLUE}{C_BOLD}>>> [3] PREVISAO DE TASK & FILA ENGATILHADA (FORECASTING){C_RESET}")
    if snap["forecast_tasks"]:
        for f in snap["forecast_tasks"]:
            ag = (f.get("agent") or "?").replace("@", "").upper()
            desc = (f.get("description") or "")[:45].replace("\n", " ")
            pri = f.get("priority", "normal")
            est = f.get("estimated_start", "Fila de despacho")
            print(f"  {C_BLUE}[PREVISTA]{C_RESET} {C_BOLD}{ag:<12}{C_RESET} {desc:<45} (Prioridade: {pri} | {est})")
    _ruler()


def _print_global_counters(snap: dict) -> None:
    total = sum(snap["counts"].values()) or 1
    print(f"\n{C_MAGENTA}{C_BOLD}STATUS GLOBAL DA FILA (NEXUS){C_RESET}")
    labels = [
        ("Concluidas", "completed", C_GREEN),
        ("Falhas", "failed", C_RED),
        ("Executando", "running", C_YELLOW),
        ("Pendentes", "pending", C_BLUE),
    ]
    for lbl, key, col in labels:
        n = snap["counts"].get(key, 0)
        progress_bar = _bar(n, total)
        print(f"  {col}{lbl:<12}{C_RESET}  {n:>5}  {progress_bar}")
    _ruler()


def _print_network_telemetry() -> None:
    ollama = f"{C_GREEN}ONLINE (11434){C_RESET}" if is_port_open(11434) else f"{C_RED}OFFLINE (11434){C_RESET}"
    gemma_s = f"{C_GREEN}ONLINE (17043){C_RESET}" if is_port_open(17043) else f"{C_YELLOW}STANDBY (17043){C_RESET}"
    backend = f"{C_GREEN}ONLINE (8000){C_RESET}" if is_port_open(8000) else f"{C_RED}OFFLINE (8000){C_RESET}"
    print(f"{C_BOLD}TELEMETRIA DE REDE:{C_RESET}")
    print(f"  Ollama          {ollama}")
    print(f"  gemma_server    {gemma_s}")
    print(f"  FastAPI backend {backend}")
    _ruler()


def show_metrics(snap: dict) -> None:
    clear_screen()
    print_header("  METRICAS, TELEMETRIA E RASTREIO DE OPERACAO SOTA  ")

    _print_running_tasks(snap)
    _print_last_5_tasks(snap)
    _print_forecast_tasks(snap)
    _print_global_counters(snap)
    _print_network_telemetry()

    input(f"\n  {C_DIM}Pressione ENTER para voltar ao menu...{C_RESET}")


#
# QUERY RUNNER
#
def run_query(persona_name: str, prompt: str, image_path: str = "") -> None:
    dir_path = os.path.dirname(__file__)
    runner_path = os.path.join(dir_path, "run_avatar.py")

    cmd = [sys.executable, runner_path, "--persona", persona_name, "--prompt", prompt]
    if image_path:
        cmd += ["--image", image_path]

    print(f"\n  {C_MAGENTA}[INICIANDO] Persona: {persona_name.upper()}{C_RESET}")
    print("  Aguardando resposta do motor de inferencia...\n")
    try:
        p = subprocess.Popen(cmd, text=True)  # noqa: S603
        p.wait()
    except Exception as e:
        print(f"\n  {C_RED}[ERRO] Falha ao executar o runner: {e}{C_RESET}")
    _ruler()
    input(f"\n  {C_DIM}Pressione ENTER para voltar ao menu...{C_RESET}")


#
# MAIN LOOP
#
def _execute_avatar_interaction(persona_name: str) -> None:
    print(f"\n  -> Selecionado: {C_BOLD}{persona_name.upper()}{C_RESET}")

    prompt = input("  Digite a sua pergunta/prompt: ").strip()
    if not prompt:
        print(f"  {C_RED}[ALERTA] Prompt nao pode ser vazio!{C_RESET}")
        time.sleep(1.2)
        return

    image_path = ""
    if persona_name == "maverick":
        image_path = input("  Caminho do arquivo de imagem (ou ENTER para ignorar): ").strip()
    else:
        opt = input("  Associar imagem? (s/n): ").strip().lower()
        if opt == "s":
            image_path = input("  Caminho do arquivo de imagem: ").strip()

    if image_path and not os.path.exists(image_path):
        print(f"  {C_RED}[ALERTA] Arquivo nao encontrado. Prosseguindo sem imagem.{C_RESET}")
        image_path = ""
        time.sleep(1.2)

    run_query(persona_name, prompt, image_path)


def main() -> None:
    if os.name == "nt":
        subprocess.run(["cmd", "/c", ""], check=False)

    metric_idx = str(len(AVATARS) + 1)
    while True:
        snap = get_db_snapshot()
        clear_screen()
        print_header()
        show_main_menu(snap)

        choice = (
            input(f"  Escolha ({C_GREEN}1-{len(AVATARS)}{C_RESET}=Avatar  {C_MAGENTA}{metric_idx}{C_RESET}=Metricas  {C_RED}q{C_RESET}=Sair): ")
            .strip()
            .lower()
        )

        if choice == "q":
            print(f"\n  {C_CYAN}Encerrando Dashboard. Operando em Excelencia!{C_RESET}\n")
            break

        if choice in (metric_idx, "m", "metricas"):
            show_metrics(snap)
            continue

        if choice not in PERSONA_MAP:
            print(f"\n  {C_RED}[ALERTA] Opcao invalida!{C_RESET}")
            time.sleep(1.2)
            continue

        _execute_avatar_interaction(PERSONA_MAP[choice])


if __name__ == "__main__":
    main()
