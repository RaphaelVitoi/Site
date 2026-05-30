"""Dashboard interativo SOTA para o ecossistema de Avatares - Poker Racional."""

import logging
import os
import socket
import sqlite3
import subprocess
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
    ("chico", "CHICO (Gerente SOTA)", "gemma4-31b-cloud", "Auditoria, seguranca, refatoracao"),
    ("maverick", "MAVERICK (Poker GTO)", "llama3.1-8b + gemma4b", "Ranges, equidade, GTO, visao"),
    ("historian", "HISTORIAN (Filosofia)", "gemma4-31b-cloud", "Historico, PRDs, hipoteses Vitoi"),
    ("gemma4", "GEMMA4 (Oraculo)", "gemma4-4b-local", "Borda, DirectML/Ollama, Nash-IA"),
]

PERSONA_MAP = {str(i + 1): av[0] for i, av in enumerate(AVATARS)}


# 
# HELPERS
# 
def clear_screen() -> None:
    os.system("cls" if os.name == "nt" else "clear")  # noqa: S605


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


def _status_badge(status: str) -> str:
    badges = {
        "completed": f"{C_GREEN}[OK]{C_RESET}   ",
        "failed": f"{C_RED}[FAIL]{C_RESET} ",
        "running": f"{C_YELLOW}[RUN]{C_RESET}  ",
        "pending": f"{C_BLUE}[FILA]{C_RESET} ",
        "cancelled": f"{C_DIM}[CANC]{C_RESET} ",
    }
    return badges.get(status.lower().strip(), f"{C_WHITE}[???]{C_RESET}  ")


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
        "counts": {"completed": 0, "running": 0, "pending": 0, "failed": 0},
        "by_agent": {},
        "history": [],  # last 20 tasks (all agents)
        "running_now": [],  # tasks currently running
        "api_usage": [],
    }
    db = _db_path()
    if not os.path.exists(db):
        return snap
    try:
        conn = sqlite3.connect(db)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        #  global counts 
        cur.execute("SELECT status, COUNT(*) as n FROM tasks GROUP BY status")
        for row in cur.fetchall():
            s = row["status"].lower().strip()
            if s in snap["counts"]:
                snap["counts"][s] = row["n"]

        #  per-agent counts 
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

        #  history: last 20 tasks 
        cur.execute(
            """
            SELECT id, agent, status, description, timestamp, completedAt
            FROM tasks
            ORDER BY timestamp DESC
            LIMIT 20
            """
        )
        snap["history"] = [dict(r) for r in cur.fetchall()]

        #  tasks running RIGHT NOW 
        cur.execute(
            """
            SELECT id, agent, description, timestamp
            FROM tasks
            WHERE status = 'running'
            ORDER BY timestamp ASC
            LIMIT 8
            """
        )
        snap["running_now"] = [dict(r) for r in cur.fetchall()]

        #  api usage 
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
    print(f"{C_DIM}{'' * width}{C_RESET}")


def print_header(subtitle: str = "") -> None:
    print(f"{C_CYAN}{C_BOLD}{'' * 64}")
    print(f"{'  DASHBOARD SOTA  AVATARES POKER RACIONAL':^64}")
    if subtitle:
        print(f"{subtitle:^64}")
    print(f"{'' * 64}{C_RESET}")
    now = datetime.now(UTC).astimezone().strftime("%d/%m/%Y %H:%M:%S")
    print(f"  {C_DIM}Diretriz Vitoi: Excelencia Tecnica  Latencia Otimizada  Simetria{C_RESET}")
    print(f"  {C_DIM}Timestamp: {now}{C_RESET}")
    _ruler()


#  PANEL 1: main menu 
def show_main_menu(snap: dict) -> None:
    running = snap["counts"]["running"]
    pending = snap["counts"]["pending"]

    print(f"\n  {C_BOLD}AVATARES DISPONIVEIS:{C_RESET}\n")
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
        print(f"  [{C_GREEN}{idx}{C_RESET}] {C_BOLD}{label}{C_RESET}")
        print(f"       Modelo : {C_YELLOW}{model}{C_RESET}")
        print(f"       Escopo : {scope}")
        print(f"       Status : {status_str}")
        print()

    print(f"  [{C_MAGENTA}5{C_RESET}] {C_BOLD}METRICAS, TELEMETRIA E HISTORICO SOTA{C_RESET}")
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
        print(f"  {C_YELLOW}[AVISO] {running} tarefa(s) em execucao agora!{C_RESET}")
    _ruler()


#  PANEL 2: full metrics 
def show_metrics(snap: dict) -> None:
    clear_screen()
    print_header("  METRICAS, TELEMETRIA E HISTORICO SOTA  ")

    #  2.1 live running tasks 
    print(f"\n{C_YELLOW}{C_BOLD}>>> TAREFAS EM EXECUCAO AGORA{C_RESET}")
    if snap["running_now"]:
        for t in snap["running_now"]:
            ag = (t.get("agent") or "?").replace("@", "").upper()[:12]
            desc = (t.get("description") or "")[:45]
            since = _fmt_ts(t.get("timestamp"))
            print(f"  {C_YELLOW}[RUN]{C_RESET}  {C_BOLD}{ag:<12}{C_RESET}  {desc:<45}  desde {since}")
    else:
        print(f"  {C_DIM}Nenhuma tarefa em execucao no momento.{C_RESET}")
    _ruler()

    #  2.2 global queue counters 
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

    #  2.3 per-avatar breakdown 
    print(f"\n{C_BOLD}STATUS POR AVATAR:{C_RESET}")
    print(f"  {'Avatar':<18} {'OK':>6} {'ERR':>6} {'RUN':>6} {'FILA':>6}  Desempenho")
    print(f"  {'' * 18} {'' * 6} {'' * 6} {'' * 6} {'' * 6}  {'' * 22}")
    for key, label, _, _ in AVATARS:
        ag = snap["by_agent"].get(key, {})
        ok = ag.get("completed", 0)
        fail = ag.get("failed", 0)
        run = ag.get("running", 0)
        pend = ag.get("pending", 0)
        sub = ok + fail
        rate = _bar(ok, sub or 1, width=14)
        name = label.split("(", 1)[0].strip()
        print(
            f"  {C_BOLD}{name:<18}{C_RESET}"
            f" {C_GREEN}{ok:>6}{C_RESET}"
            f" {C_RED}{fail:>6}{C_RESET}"
            f" {C_YELLOW}{run:>6}{C_RESET}"
            f" {C_BLUE}{pend:>6}{C_RESET}"
            f"  {rate}"
        )
    _ruler()

    #  2.4 task history (last 20) 
    print(f"\n{C_BOLD}HISTORICO DE TAREFAS (ultimas 20):{C_RESET}")
    print(f"  {'#':<3} {'Status':<8} {'Avatar':<12} {'Descricao':<38} {'Criado':<11} {'Concluido':<11}")
    print(f"  {'' * 3} {'' * 8} {'' * 12} {'' * 38} {'' * 11} {'' * 11}")
    if snap["history"]:
        for i, t in enumerate(snap["history"], 1):
            badge = _status_badge(t.get("status", "?"))
            ag = (t.get("agent") or "?").replace("@", "")[:12]
            desc = (t.get("description") or "")[:38]
            ts_in = _fmt_ts(t.get("timestamp"))
            ts_out = _fmt_ts(t.get("completedAt"))
            print(f"  {i:<3} {badge} {C_CYAN}{ag:<12}{C_RESET} {desc:<38} {ts_in:<11} {ts_out:<11}")
    else:
        print(f"  {C_DIM}Nenhuma tarefa registrada ainda.{C_RESET}")
    _ruler()

    #  2.5 token telemetry 
    print(f"\n{C_BOLD}TELEMETRIA DE TOKENS POR MODELO:{C_RESET}")
    if snap["api_usage"]:
        print(f"  {'Modelo':<38} {'Req':>6}  {'Prompt tk':>10}  {'Compl. tk':>10}")
        print(f"  {'' * 38} {'' * 6}  {'' * 10}  {'' * 10}")
        for u in snap["api_usage"]:
            m = (u.get("model") or "?")[:38]
            n = u.get("n", 0)
            pt = u.get("pt", 0) or 0
            ct = u.get("ct", 0) or 0
            print(f"  {C_YELLOW}{m:<38}{C_RESET} {n:>6}  {pt:>10}  {ct:>10}")
    else:
        print(f"  {C_DIM}Sem dados de api_usage registrados.{C_RESET}")
    _ruler()

    #  2.6 model justification matrix 
    print(f"\n{C_MAGENTA}{C_BOLD}JUSTIFICATIVAS ARQUITETURAIS DOS MODELOS{C_RESET}")
    matrix = [
        (
            "Gemma 4 31B Cloud  (Chico + Historian)",
            "Raciocinio analitico denso, contexto 65k, coerencia semantica maxima.",
            "Auditoria profunda de codigo e resgate de arquivos historicos via RAG.",
        ),
        (
            "Llama 3.1 8B Local (Maverick  GTO)",
            "Latencia ultrabaixa, tabelas estruturadas, zero custo de API.",
            "Calculo de ranges GTO pos-flop e RIO em tempo real no terminal.",
        ),
        (
            "Gemma 4 4B Local  (Gemma4  Borda)",
            "Leveza termodinamica, DirectML/Ollama, VRAM minima.",
            "Micro-decisoes locais e calibracao de heuristicas instantaneas.",
        ),
        (
            "Gemma 4B Vision   (Maverick Vision)",
            "Multimodal leve, OCR superior, base Gemma 2.",
            "Extrai layout visual da mesa de poker (board, stacks) para o Llama.",
        ),
    ]
    for title, forte, just in matrix:
        print(f"  {C_BOLD} {title}{C_RESET}")
        print(f"    {C_GREEN}Ponto Forte:{C_RESET} {forte}")
        print(f"    {C_GREEN}Justificativa:{C_RESET} {just}")
        print()
    _ruler()

    #  2.7 network telemetry 
    ollama = f"{C_GREEN}ONLINE (11434){C_RESET}" if is_port_open(11434) else f"{C_RED}OFFLINE (11434){C_RESET}"
    gemma_s = f"{C_GREEN}ONLINE (17043){C_RESET}" if is_port_open(17043) else f"{C_YELLOW}STANDBY (17043){C_RESET}"
    backend = f"{C_GREEN}ONLINE (8000){C_RESET}" if is_port_open(8000) else f"{C_RED}OFFLINE (8000){C_RESET}"
    print(f"{C_BOLD}TELEMETRIA DE REDE:{C_RESET}")
    print(f"  Ollama          {ollama}")
    print(f"  gemma_server    {gemma_s}")
    print(f"  FastAPI backend {backend}")
    _ruler()

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
def main() -> None:
    if os.name == "nt":  # noqa: S605
        os.system("")  # habilita sequencias ANSI no Windows

    while True:
        snap = get_db_snapshot()
        clear_screen()
        print_header()
        show_main_menu(snap)

        choice = (
            input(f"  Escolha ({C_GREEN}1-4{C_RESET}=Avatar  {C_MAGENTA}5{C_RESET}=Metricas  {C_RED}q{C_RESET}=Sair): ")
            .strip()
            .lower()
        )

        if choice == "q":
            print(f"\n  {C_CYAN}Encerrando Dashboard. Operando em Excelencia!{C_RESET}\n")
            break

        if choice == "5":
            show_metrics(snap)
            continue

        if choice not in PERSONA_MAP:
            print(f"\n  {C_RED}[ALERTA] Opcao invalida!{C_RESET}")
            time.sleep(1.2)
            continue

        persona_name = PERSONA_MAP[choice]
        print(f"\n  -> Selecionado: {C_BOLD}{persona_name.upper()}{C_RESET}")

        prompt = input("  Digite a sua pergunta/prompt: ").strip()
        if not prompt:
            print(f"  {C_RED}[ALERTA] Prompt nao pode ser vazio!{C_RESET}")
            time.sleep(1.2)
            continue

        image_path = ""
        if persona_name == "maverick":
            # Maverick suporta visao nativamente
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


if __name__ == "__main__":
    main()
