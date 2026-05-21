# scripts/routines/sota_refactor.py

def processar_positivo(x):
    """Encapsula a lógica de iteração par/ímpar."""
    for i in range(x):
        status = "Par" if i % 2 == 0 else "Ímpar"
        print(status)

def processar_negativo(x):
    """Encapsula a lógica de decremento e break-point."""
    while x < 0:
        if x == -5: break
        x += 1

def processar_zero(x):
    """Encapsula o tratamento de exceção de divisão."""
    try:
        return 10 / x
    except ZeroDivisionError:
        print("Erro: Divisão por Zero.")

def funcao_sota(x):
    """
    Orquestrador de Fluxo (V(G) reduzido).
    Utiliza Despacho Estático para eliminar cadeias de if/elif/else.
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

    # Execução Cirúrgica: Identifica a chave e executa a ação
    for chave, condicao in dispatch.items():
        if condicao():
            acoes[chave]()
            break

    return True
