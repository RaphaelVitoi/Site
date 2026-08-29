import logging
from typing import Any, Dict, List, Optional
import pytest


class SotaTestLogFilter(logging.Filter):
    SILENCED_PATTERNS = [
        "Comando destrutivo bloqueado",
        "Encadeamento, sub-expressoes ou redirecionamento bloqueado",
        "O agente @implementor tentou mutar o estado",
        "Execute manualmente:",
        "Materializacao em disco nativo bloqueada no modo sandbox",
        "Bloqueio de escrita em arquivo protegido",
        "Override de Seguranca Absoluto",
        "Falha no comando",
        "O comando nativo excedeu o tempo limite",
        "W0 (Stop) ativo",
        "Falha ao interpretar matriz do Dispatcher",
        "ENTROPIA DETECTADA",
        "Caminho suspeito detectado",
        "Erro ao acessar Prisma DB",
        "Tentativa de Path Traversal bloqueada",
        "Caminho padrao resolve fora da raiz",
        "T-STUCK",
        "Model gate removeu",
        "Falha ao disparar Windows Toast",
        "sem rota declarada, usando primary_model",
        "Tarefa muito complexa detectada",
        "SOTA Harmonizer Error in failing_func",
        "modo_hack_invalido",
        "CRITICAL SEC",
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        msg = str(record.getMessage())
        for pattern in self.SILENCED_PATTERNS:
            if pattern in msg:
                return False
        return True


@pytest.fixture(autouse=True, scope="session")
def isolate_test_simulation_logs():
    root_logger = logging.getLogger()
    log_filter = SotaTestLogFilter()
    root_logger.addFilter(log_filter)
    for handler in root_logger.handlers:
        handler.addFilter(log_filter)

    target_loggers = [
        "agents.autonomy",
        "agents.execution",
        "core.config",
        "database.lab_manager",
        "database.queue_manager",
        "llm.routing",
        "utils.notifications",
        "utils.harmonizer",
        "task_executor",
        "root",
    ]
    for name in target_loggers:
        lg = logging.getLogger(name)
        lg.addFilter(log_filter)
        for h in lg.handlers:
            h.addFilter(log_filter)

    yield

    root_logger.removeFilter(log_filter)
    for name in target_loggers:
        logging.getLogger(name).removeFilter(log_filter)


class SotaGuardState:
    errors: list[dict[str, Any]] = []
    warnings_list: list[dict[str, Any]] = []

    @classmethod
    def reset(cls) -> None:
        cls.errors.clear()
        cls.warnings_list.clear()

    @classmethod
    def extract_component(cls, nodeid: Optional[str], filename: Optional[str]) -> str:
        if nodeid:
            parts = nodeid.replace("tests/", "").replace("tests\\", "").split("::")
            return parts[0].replace("test_", "").replace(".py", "")
        if filename:
            return filename.split("/")[-1].split("\\")[-1].replace(".py", "")
        return "core.unknown"

    @classmethod
    def generate_recommendation(cls, item_type: str, category: str, message: str, component: str) -> str:
        msg_lower = message.lower()
        if "deprecation" in category.lower() or "deprecated" in msg_lower:
            return f"[SOTA-REC] Atualizar a sintaxe/API depreciada no modulo '{component}' para o padrao canonico."
        if "resource" in category.lower() or "unclosed" in msg_lower:
            return f"[SOTA-REC] Fechar o recurso pendente em '{component}' utilizando context manager ('async with' / 'with')."
        if "assertion" in category.lower() or "assert" in msg_lower:
            return f"[SOTA-REC] Ajustar o contrato logico/matematico em '{component}' para satisfazer a invariante exigida."
        if "not found" in msg_lower or "no such" in msg_lower:
            return f"[SOTA-REC] Provisionar ou configurar fallback seguro de arquivos/tabelas em '{component}'."
        if item_type == "ERROR":
            return f"[SOTA-REC] Corrigir a falha de execucao no modulo '{component}', aplicando tipagem e tratamento defensivo."
        return f"[SOTA-REC] Inspecionar pontualmente o modulo '{component}' e aplicar o Padrao-Ouro SOTA v8.0."

    @classmethod
    def evaluate_tri_state(cls) -> tuple[str, str]:
        total_errors = len(cls.errors)
        total_warnings = len(cls.warnings_list)
        if total_errors == 0 and total_warnings == 0:
            return "SUCESSO", "green"
        elif total_errors == 0 and 1 <= total_warnings <= 2:
            return "FRAGIL", "yellow"
        else:
            return "FALHOU", "red"


def pytest_configure(config: Any) -> None:
    _ = config
    SotaGuardState.reset()


def pytest_warning_recorded(warning_message: Any, when: str, nodeid: str, location: Any) -> None:
    category_name = getattr(warning_message.category, "__name__", str(warning_message.category))
    msg_str = str(warning_message.message)
    comp = SotaGuardState.extract_component(nodeid, getattr(warning_message, "filename", None))

    rec = {
        "type": "WARNING",
        "category": category_name,
        "message": msg_str,
        "nodeid": nodeid or str(location),
        "component": comp,
        "when": when,
        "recommendation": SotaGuardState.generate_recommendation("WARNING", category_name, msg_str, comp),
    }
    SotaGuardState.warnings_list.append(rec)


def pytest_runtest_logreport(report: Any) -> None:
    if report.failed:
        comp = SotaGuardState.extract_component(report.nodeid, None)
        msg_str = str(report.longreprtext if hasattr(report, "longreprtext") else report.longrepr)
        first_line = msg_str.strip().rsplit("\n", maxsplit=1)[-1] if msg_str else "Falha de assercao / execucao"

        rec = {
            "type": "ERROR",
            "category": "TestFailure",
            "message": first_line,
            "nodeid": report.nodeid,
            "component": comp,
            "when": report.when,
            "recommendation": SotaGuardState.generate_recommendation("ERROR", "TestFailure", first_line, comp),
        }
        SotaGuardState.errors.append(rec)


def pytest_sessionfinish(session: Any, exitstatus: int) -> None:
    _ = exitstatus
    status, _ = SotaGuardState.evaluate_tri_state()
    # Guard intransponivel: FALHOU reprova imediatamente com ExitCode 1
    if status == "FALHOU":
        session.exitstatus = pytest.ExitCode.TESTS_FAILED


def pytest_terminal_summary(terminalreporter: Any, exitstatus: int, config: Any) -> None:
    _ = (exitstatus, config)
    total_errors = len(SotaGuardState.errors)
    total_warnings = len(SotaGuardState.warnings_list)
    status, _ = SotaGuardState.evaluate_tri_state()

    tr = terminalreporter
    tr.write_sep("=", "SOTA QUALITY & INTEGRITY GUARD  PROTOCOLO CHICO v8.0 GOLD", cyan=True, bold=True)
    tr.write_line(f" Total de Erros:    {total_errors} (Teto Maximo Permitido: 0 | Peso: CRITICO)")
    tr.write_line(f" Total de Warnings: {total_warnings} (Teto Maximo Permitido: 2 | Tolerancia: 0 para SUCESSO)")

    if status == "SUCESSO":
        tr.write_line(
            " Status da Bateria: [SUCESSO (VERDE)] Zero Erros e Zero Warnings. Homeostase Total Aprovada.",
            green=True,
            bold=True,
        )
    elif status == "FRAGIL":
        tr.write_line(
            f" Status da Bateria: [FRAGIL (AMARELO)] 0 Erros, mas presenca de {total_warnings} warning(s). Atencao: degradacao sob risco de entropia!",
            yellow=True,
            bold=True,
        )
    else:
        tr.write_line(
            f" Status da Bateria: [FALHOU (VERMELHO)] Bloqueio Termodinamico! ({total_errors} Erros, {total_warnings} Warnings). Erros possuem peso prioritario.",
            red=True,
            bold=True,
        )

    all_findings = SotaGuardState.errors + SotaGuardState.warnings_list
    if all_findings:
        tr.write_sep("-", f"SUMARIO INDIVIDUAL DE DETECCOES ({len(all_findings)} OCORRENCIAS)", yellow=True)
        for idx, item in enumerate(all_findings, 1):
            item_color = "red" if item["type"] == "ERROR" else "yellow"
            tr.write_line(
                f"[{idx}] {item['type']} -> Componente: '{item['component']}' | Teste: {item['nodeid']}",
                **{item_color: True, "bold": True},
            )
            tr.write_line(f"    Causa/Motivo: {item['message']}")
            tr.write_line(f"     Recomendacao: {item['recommendation']}", cyan=True)
            tr.write_line("")
    else:
        tr.write_line(" Homeostase Total:  Nenhum erro ou warning detectado em toda a suite.", green=True)

    tr.write_sep("=", "FIM DO SUMARIO SOTA", cyan=True, bold=True)
