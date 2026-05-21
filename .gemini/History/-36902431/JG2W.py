import sys

def processar_positivo(x):
    """Encapsula a lógica de iteração par/ímpar."""
    for i in range(x):
        status = "Par" if i % 2 == 0 else "Ímpar"
        print(f"Valor {i}: {status}")

def processar_negativo(x):
    """Encapsula a lógica de decremento e break-point."""
    print(f"Iniciando decremento em {x}...")
    while x < 0:
        if x == -5:
            print("Break-point VITOI (-5) atingido.")
            break
        x += 1
    print(f"Estado final de x: {x}")

def processar_zero(x):
    """Encapsula o tratamento de exceção de divisão."""
    try:
        return 10 / x
    except ZeroDivisionError:
        print("Erro: Divisão por Zero detectada no Fluxo SOTA.")
        return None

def funcao_sota(x):
    """
    Orquestrador de Fluxo (V(G) reduzido).
    Minimiza a entropia através de Despacho Estático.
    """
    # Mapeamento de Intenção (Fatiamento)
    dispatch = {
        'positivo': lambda: x > 0,
        'negativo': lambda: x < 0,
        'zero':     lambda: x == 0
    }

    # Ações associadas
    acoes = {
        'positivo': lambda: processar_positivo(x),
        'negativo': lambda: processar_negativo(x),
        'zero':     lambda: processar_zero(x)
    }

    # Execução Cirúrgica
    for chave, condicao in dispatch.items():
        if condicao():
            acoes[chave]()
            break

    return True

if __name__ == "__main__":
    # Ponto de Entrada para evitar CommandNotFoundException no PowerShell
    if len(sys.argv) > 1:
        try:
            val = int(sys.argv[1])
            funcao_sota(val)
        except ValueError:
            print("[ERRO] Forneça um número inteiro como argumento.")
    else:
        print("[VITOI] Uso: .\\.venv\\Scripts\\python.exe .\\scripts\\routines\\sota_refactor.py [valor]")
