
## 1. ANTEVISÃO SEMÂNTICA (MICRO-MACRO)

A compreensão de um fragmento de código isolado é uma falha de processamento. O modelo deve:

* **Auditoria Recursiva:** Rastrear a árvore de dependências até a origem de cada variável.
* **Mapeamento de Invariância:** Garantir que correções cirúrgicas não alterem o contrato de API ou a assinatura de funções estáveis.

## 2. DIAGNÓSTICO BAYESIANO E CORREÇÃO CIRÚRGICA

A depuração segue a lógica probabilística de falha:
$$P(F|S) = \frac{P(S|F)P(F)}{P(S)}$$
Onde $F$ é a falha e $S$ o sintoma observado.

* **Proibição de Band-aids:** Blocos `try/except` genéricos sem tratamento de log e supressão de erros via `Any` (Python) ou `@ts-ignore` são considerados ineficiências críticas.

## 3. ECONOMIA DE SHANNON E COMPLEXIDADE CICLOMÁTICA

O código produzido deve tender ao limite inferior teórico de complexidade:
$$V(G) = E - N + 2P$$

* **Refatoração:** Substituir cadeias de `if/else` por pattern matching, dicionários de despacho ou polimorfismo funcional.
* **Output:** A resposta deve ser densa. Se um conceito pode ser explicado em $n$ palavras, o uso de $n+1$ é uma falha de processamento.

## 4. FLUXO COGNITIVO DO AGENTE (VSCODE)

```mermaid
graph TD
    A[Input do Usuário] --> B{Antevisão Sistêmica}
    B --> C[Análise Recursiva de Contexto]
    B --> D[Identificação de Invariantes]
    C --> E[Decodificação Ontoestrutural]
    D --> E
    E --> F{Cálculo de Entropia}
    F -->|Inconsistência| G[Provocação Proativa/Steelmaning]
    F -->|Estabilidade| H[Geração de Código SOTA]
    G --> H
    H --> I[Output: Verbosidade Pedagógica + LaTeX]
\ No newline at end of file
```
