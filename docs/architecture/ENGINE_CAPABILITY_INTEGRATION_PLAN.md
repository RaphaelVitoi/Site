# Plano padrão-ouro — integração de capacidades matemáticas e engines

**Governança e autoria conceitual:** Raphael Vitoi
**Estado:** execução iniciada em 2026-09-13
**Fonte única de capacidades:** `data/engine_capabilities.json`

## 1. Resultado arquitetural pretendido

Toda superfície matemática do Site deve atravessar a mesma cadeia verificável:

```text
entrada validada
  -> engine selecionada
  -> execução ou fallback explícito
  -> saída tipada
  -> proveniência de execução
  -> consumidor real em API, worker ou UI
```

O contrato preserva moldes úteis sem convertê-los semanticamente em sistemas que
ainda não implementam. Uma heurística inspirada em Pluribus continua disponível;
ela apenas não recebe o nível `full-solver` antes de realizar essa capacidade.

## 2. Invariantes

1. Configuração não prova runtime.
2. Modelo pretendido não é modelo executado.
3. Parâmetro causal altera o resultado; parâmetro reservado declara que ainda
   não altera.
4. Hipótese PMev permanece identificada como hipótese autoral operacional.
5. Python e TypeScript compartilham cenários, unidades e tolerâncias.
6. Fallback preserva a funcionalidade e declara a própria identidade.
7. Capacidade sem consumidor real não é integração concluída.
8. Input impossível é rejeitado; não é silenciosamente normalizado.

## 3. Ordem padrão-ouro

| Fase | Entrega | Dependência | Critério de conclusão | Estado |
| :--- | :--- | :--- | :--- | :--- |
| P0.1 | Manifesto único e registro tipado | nenhuma | Python e TypeScript validam a mesma fonte | concluída |
| P0.2 | Endpoint de descoberta | P0.1 | rota registrada, acessível ao produto e sem alegar probe | concluída |
| P0.3 | Consumidores e verdade semântica | P0.1 | painéis usam labels/limites do manifesto | concluída |
| P0.4 | Histórico CFR observado | P0.1 | worker emite métrica identificada; painel não sintetiza série | concluída |
| P0.5 | Gateway TimesFM | P0.4 | pesos, modelo pretendido, modelo usado e fallback visíveis | concluída |
| P0.6 | Proveniência em cada resposta HTTP de engine | P0.1 | toda resposta carrega identidade e nível | concluída |
| P1.1 | Corpus compartilhado de cenários | P0 | fixtures únicas para Python/TypeScript | concluída: seis famílias, nove cenários declarados |
| P1.2 | Paridade cruzada | P1.1 | resultados dentro de tolerância declarada | concluída no corpus: Python/TypeScript e Pluribus Rust/WASM verdes |
| P1.3 | Parâmetros causais | P1.1 | stacks e profundidade governam a engine ou seguem reservados | concluída no adaptador Pluribus: capital e horizonte causais |
| P1.4 | Gateway unificado local/API/WASM | P0.6 | seleção e fallback testados ponta a ponta | concluída: TypeScript, HTTP autenticado e Rust/WASM executáveis; fallback observável |
| P2.1 | Fronteira de autenticação por capacidade | P1.4 | cada rota classificada por risco e identidade | concluída: cálculo puro liberado por rota e método; operador permanece fechado |
| P2.2 | Auditoria visual e acessibilidade | P1.4 | desktop, tablet, mobile, A11y e CWV medidos | pendente |
| P3.1 | Field HRC externo | P1 | dez `otherstacks`, massa e unidades reconciliados | pendente |
| P3.2 | Framework PMev denso | P1 + P3.1 | implementação plugável e baseline comparável | pendente |

## 4. Contrato mínimo de proveniência

Toda saída executada deve declarar:

```text
engine_id
implementation_level
runtime_used
model_used
intended_model
weights_loaded
fallback_used
assumptions
limitations
units
```

Campos não aplicáveis permanecem explícitos (`null`, `false` ou lista vazia),
nunca inferidos pelo nome comercial da família teórica.

## 5. Régua de capacidade

| Nível | Afirmação permitida |
| :--- | :--- |
| `analytic` | solução fechada sob premissas declaradas |
| `heuristic` | regra operacional aproximada |
| `adapter` | tradução ou integração de uma linhagem externa |
| `primitive` | componente algorítmico reutilizável |
| `simulation` | amostragem com seed e protocolo declarados |
| `trained-model` | inferência com pesos realmente carregados |
| `full-solver` | árvore, informação, alcance e critério de solução realizados |

## 6. Estratégia de teste

Cada fase deve combinar:

- teste estrutural do manifesto;
- teste negativo de duplicidade e sobreposição de parâmetros;
- teste unitário da engine;
- teste de paridade quando houver mais de um runtime;
- teste da rota e da fronteira de autenticação;
- teste do consumidor frontend;
- typecheck principal e do worker;
- gate integral antes de qualquer commit autorizado.

## 7. Limite do incremento inicial

O incremento iniciado em 2026-09-13 não altera a formulação definitiva da PMev,
não promove adaptadores a solvers completos e não estabiliza outputs provisórios.
Ele cria a infraestrutura para que novos frameworks substituam ou componham os
moldes existentes com proveniência, paridade e rollback observáveis.

## 8. Continuação de 2026-09-13 — CI e fronteira de capacidades

O primeiro push revelou no Linux estrito um uso por ponto sobre
`Record<string, unknown>` que o typecheck local também reproduziu depois da
consulta ao CI. A correção preserva `noPropertyAccessFromIndexSignature`: o
validador passou a usar indexação explícita, sem afrouxar o compilador.

A mesma auditoria encontrou uma integração incompleta em P1.4: o executor HTTP
do gateway enviava JWT de produto para a rota Pluribus, mas a política de
autorização ainda classificava todas as novas rotas matemáticas como rotas de
operador. P2.1 passa a declarar a dupla exata `path × método`. As rotas de
Pluribus, DeepStack, ReBeL, Claudico, Chen/Ankenman e Janda aceitam apenas `POST`
de produto; descoberta de capacidades aceita apenas `GET`; disco, fila,
ingestão, estado global e oráculo continuam fora da faixa.

Isso concluiu a fronteira de identidade sem fingir a conclusão de P1.4. A etapa
seguinte portou o mesmo adaptador heurístico para um kernel Rust/WASM próprio,
sem reutilizar ou renomear o Monte Carlo de equidade. O binding recebe stacks,
posição, street, profundidade e iterações, rejeita estados impossíveis e devolve
uma ABI numérica fixa que o TypeScript reconstrói no contrato já existente.

O painel tenta o executor WASM real e cai observavelmente para TypeScript quando
a inicialização falha. O corpus compartilhado compara o binário gerado contra o
runtime TypeScript; isso prova paridade do molde, não aceleração, blueprint
self-play, busca de subjogo em tempo real ou equivalência ao sistema Pluribus.

A expansão do corpus para quatro regimes (flop profundo, flop short-stack, turn
em MP e river heads-up) revelou uma assimetria antes invisível: Python aplicava
o multiplicador `0,88` a MP, enquanto TypeScript e Rust/WASM aplicavam `1,00`.
O contrato foi unificado em `BTN/CO = 1,15`, `MP = 1,00` e
`UTG/SB/BB = 0,88`, com domínio comum de dois a dez jogadores. O teste Python
agora percorre todos os cenários, e o teste WASM executa o binário gerado em cada
um deles.

Separadamente, o script de benchmark gráfico dependia de Matplotlib e Seaborn
somente no `requirements.txt` interno do hybrid router, embora o próprio README
o execute pelo `.venv` raiz. As dependências foram promovidas ao `pyproject.toml`
e ao `uv.lock`; assim, uma sincronização bloqueada não volta a removê-las. O
Pyright do arquivo passa sem erros ou warnings no ambiente efetivo.
