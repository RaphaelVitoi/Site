# pylint: disable=missing-module-docstring, logging-fstring-interpolation, line-too-long

import logging
import sys

# CONFIGURAÇÃO DE AUDITORIA (LOGGING)
logging.basicConfig(
    filename=".vitoi_history.log",
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)


def processar_positivo(x: int) -> None:
    """Encapsula a lógica de iteração par/ímpar."""
    print(f"[VITOI] Iniciando Fluxo Positivo (n={x})")
    for i in range(x):
        status = "Par" if i % 2 == 0 else "Ímpar"
        print(f" -> Valor {i}: {status}")
    logger.info(f"Execução POSITIVA concluída para n={x}")


def processar_negativo(x: int) -> None:
    """Encapsula a lógica de decremento e break-point."""
    print(f"[VITOI] Iniciando Fluxo Negativo (x={x})")
    while x < 0:
        if x == -5:
            print(" [!] Break-point VITOI (-5) atingido.")
            break
        x += 1
    print(f" -> Estado final de x: {x}")
    logger.info(f"Execução NEGATIVA concluída. Estado final: {x}")


def processar_zero(x: int) -> float | None:
    """Tratamento de exceção para indeterminação matemática."""
    print("[VITOI] Analisando Divisão por Zero.")
    try:
        return 10.0 / x
    except ZeroDivisionError:
        print(" [X] Erro Crítico: Divisão por Zero detectada no Fluxo SOTA.")
        logger.error("Tentativa de divisão por zero abortada.")
        return None


def funcao_sota(x: int) -> bool:
    """
    Orquestrador de Fluxo SOTA (V(G) minimizado).
    Utiliza Despacho Estático Otimizado para erradicar a entropia condicional.
    """
    acoes = {
        True: lambda: processar_positivo(x),
        False: lambda: processar_negativo(x),
        None: lambda: processar_zero(x),
    }

    if x > 0:
        chave = True
        status_chave = "POSITIVO"
    elif x < 0:
        chave = False
        status_chave = "NEGATIVO"
    else:
        chave = None
        status_chave = "ZERO"

    print(f"--- PROTOCOLO ATIVADO: {status_chave} ---")
    acoes[chave]()

    return True


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # TRATAMENTO DE ENTROPIA: Remove comentários (#) colados ao input
        raw_input = sys.argv[1].split("#")[0].strip()

        try:
            val = int(raw_input)
            funcao_sota(val)
        except ValueError:
            print(f"[ERRO] '{raw_input}' não é um inteiro válido para o processamento.")
            logger.warning(f"Input inválido rejeitado: {sys.argv[1]}")
    else:
        print(
            "[VITOI] Uso: .\\.venv\\Scripts\\python.exe .\\scripts\\routines\\sota_refactor.py [valor]"
        )
