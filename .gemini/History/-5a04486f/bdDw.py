# scripts/routines/stress_test.py


def _processar_positivo(x):
    for i in range(x):
        print("Par" if i % 2 == 0 else "Ímpar")


def _processar_negativo(x):
    while x < 0:
        if x == -5:
            break
        x += 1


def _processar_zero(x):
    try:
        10 / x
    except ZeroDivisionError:
        print("Erro")


def funcao_entropica(x):
    """Refatorada sob Arquitetura SOTA para reduzir V(G)."""
    actions = {
        True: lambda: _processar_positivo(x),  # x > 0
        False: lambda: _processar_negativo(x),  # x < 0
        None: lambda: _processar_zero(x),  # x == 0
    }

    if x > 0:
        chave = True
    elif x < 0:
        chave = False
    else:
        chave = None
    actions[chave]()
    return True
