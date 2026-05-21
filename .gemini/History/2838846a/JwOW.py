# scripts/routines/stress_test.py
def funcao_entropica(x):
    # V(G) base = 1
    if x > 0: # +1
        for i in range(x): # +1
            if i % 2 == 0: # +1
                print("Par")
            else: # +1
                print("Ímpar")
    elif x < 0: # +1
        while x < 0: # +1
            if x == -5: # +1
                break
            x += 1
    else: # +1
        try:
            res = 10 / x
        except ZeroDivisionError: # +1
            print("Erro")
    return True
