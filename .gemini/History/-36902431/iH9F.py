import sys
import logging
from datetime import datetime

# CONFIGURAÇÃO DE AUDITORIA (LOGGING)
logging.basicConfig(
    filename='.vitoi_history.log',
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def processar_positivo(x):
    """Encapsula a lógica de iteração par/ímpar."""
    print(f"[VITOI] Iniciando Fluxo Positivo (n={x})")
    for i in range(x):
        status = "Par" if i % 2 == 0 else "Ímpar"
        print(f" -> Valor {i}: {status}")
    logging.info(f"Execução POSITIVA concluída para n={x}")

def processar_negativo(x):
    """Encapsula a lógica de decremento e break-point."""
    print(f"[VITOI] Iniciando Fluxo Negativo (x={x})")
    while x < 0:
        if x == -5:
            print(" [!] Break-point VITOI (-5) atingido.")
            break
        x += 1
    print(f" -> Estado final de x: {x}")
    logging.info(f"Execução NEGATIVA concluída. Estado final: {x}")

def processar_zero(x):
    """Tratamento de exceção para indeterminação matemática."""
    print("[VITOI] Analisando Divisão por Zero.")
    try:
        resultado = 10 / x
        return resultado
    except ZeroDivisionError:
        print(" [X] Erro Crítico: Divisão por Zero detectada no Fluxo SOTA.")
        logging.error("Tentativa de divisão por zero abortada.")
        return None

def funcao_sota(x):
    """
    Orquestrador de Fluxo (V(G) reduzido).
    Minimiza a entropia através de Despacho Estático.
    """
    dispatch = {
        'positivo': lambda: x > 0,
        'negativo': lambda: x < 0,
        'zero':     lambda: x == 0
    }

    acoes = {
        'positivo': lambda: processar_positivo(x),
        'negativo': lambda: processar_negativo(x),
        'zero':     lambda: processar_zero(x)
    }

    # Execução Cirúrgica: Busca a chave e ativa a ação correspondente
    for chave, condicao in dispatch.items():
        if condicao():
            print(f"--- PROTOCOLO ATIVADO: {chave.upper()} ---")
            acoes[chave]()
            break

    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # TRATAMENTO DE ENTROPIA: Remove comentários (#) colados ao input
        raw_input = sys.argv[1].split('#')[0].strip()

        try:
            val = int(raw_input)
            funcao_sota(val)
        except ValueError:
            print(f"[ERRO] '{raw_input}' não é um inteiro válido para o processamento.")
            logging.warning(f"Input inválido rejeitado: {sys.argv[1]}")
    else:
        print("[VITOI] Uso: .\\.venv\\Scripts\\python.exe .\\scripts\\routines\\sota_refactor.py [valor]")
