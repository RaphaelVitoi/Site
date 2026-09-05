import logging
from typing import Any, Optional
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
        "nexus.timesfm",
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
    # Verificacao NAO EXECUTADA nao e verificacao aprovada (CLAUDE.md SS5). Ate
    # 2026-09-01 este guard declarava erros e warnings e ficava calado sobre o
    # que nunca rodou: a suite dizia "9 skipped" numa linha do pytest e o
    # veredito SOTA impresso logo abaixo nao mencionava nenhum. Quem lesse so o
    # veredito -- que e o que a SS5 manda o agente repassar -- nao ficava sabendo
    # que havia cobertura ausente, nem por que.
    skips: list[dict[str, Any]] = []

    @classmethod
    def reset(cls) -> None:
        cls.errors.clear()
        cls.warnings_list.clear()
        cls.skips.clear()

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

    elif report.skipped and report.when == "call" or (report.skipped and report.when == "setup"):
        # longrepr de um skip e (arquivo, linha, "Skipped: <motivo>").
        motivo = "motivo nao declarado"
        origem = report.nodeid
        longrepr = getattr(report, "longrepr", None)
        if isinstance(longrepr, tuple) and len(longrepr) == 3:
            arquivo, linha, texto = longrepr
            motivo = str(texto).removeprefix("Skipped: ").strip() or motivo
            origem = f"{arquivo}:{linha}"
        SotaGuardState.skips.append(
            {
                "component": SotaGuardState.extract_component(report.nodeid, None),
                "nodeid": report.nodeid,
                "origem": origem,
                "motivo": motivo,
            }
        )


def pytest_collectreport(report: Any) -> None:
    """Erro de COLETA tambem e erro, e ate 2026-08-30 nao era.

    Medido com um modulo que nao importa: a suite parava com
    `Interrupted: 1 error during collection`, ZERO testes rodavam, e este guard
    imprimia

        Total de Erros:    0
        Status da Bateria: [SUCESSO (VERDE)] ... Homeostase Total Aprovada.
        Homeostase Total:  Nenhum erro ou warning detectado em toda a suite.

    O exit code continuava 2, entao o CI nunca passou em falso e o pre-commit
    nunca foi furado -- o estrago era no VEREDITO IMPRESSO, que e exatamente o
    que a §5 do CLAUDE.md manda o agente declarar. Um agente obediente repassava
    "verde" sobre uma bateria que nao existiu.

    A causa era de superficie, nao de logica: `pytest_runtest_logreport` so ve a
    fase de execucao. Um modulo que morre na coleta nunca chega la; ele sai por
    aqui. Faltava o gancho, nao o criterio.
    """
    if not report.failed:
        return

    comp = SotaGuardState.extract_component(report.nodeid, None)
    msg_str = str(report.longreprtext if hasattr(report, "longreprtext") else report.longrepr)
    first_line = msg_str.strip().rsplit("\n", maxsplit=1)[-1] if msg_str else "Falha de coleta"

    SotaGuardState.errors.append(
        {
            "type": "ERROR",
            "category": "CollectionError",
            "message": first_line,
            "nodeid": report.nodeid,
            "component": comp,
            # "collect" e literal de proposito: CollectReport nao tem `.when`,
            # e a fase e justamente a informacao que distingue este registro.
            "when": "collect",
            "recommendation": SotaGuardState.generate_recommendation("ERROR", "CollectionError", first_line, comp),
        }
    )


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
    tr.write_line(
        f" Nao Executados:    {len(SotaGuardState.skips)} (sem teto | NAO contam como aprovacao -- CLAUDE.md SS5)"
    )

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

    if SotaGuardState.skips:
        tr.write_sep(
            "-",
            f"COBERTURA NAO EXECUTADA ({len(SotaGuardState.skips)} TESTE(S) PULADO(S))",
            cyan=True,
        )
        tr.write_line(
            " Nenhum destes reprovou -- nenhum foi verificado. Declare isto junto com o veredito, nao no lugar dele.",
            cyan=True,
        )
        for idx, s in enumerate(sorted(SotaGuardState.skips, key=lambda x: x["nodeid"]), 1):
            tr.write_line(f"[{idx}] PULADO -> Componente: '{s['component']}' | Teste: {s['nodeid']}", cyan=True)
            tr.write_line(f"    Origem:  {s['origem']}")
            tr.write_line(f"    Motivo:  {s['motivo']}")

    tr.write_sep("=", "FIM DO SUMARIO SOTA", cyan=True, bold=True)
