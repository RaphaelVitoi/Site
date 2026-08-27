---
id: postulado-002-roi-sem-peso-de-sensibilidade
tipo: decisao
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-27T14:40-03:00
commit: 4cce6758
classes: [interno]
verificado:
  - leitura integral de llm/routing_policy.py apos as alteracoes desta data
  - suite tests/test_routing_policy.py + tests/test_task_routing.py: 49 passed,
    identico a linha de base medida antes das alteracoes
  - rotas_suspeitas() exercitada em dois estados (0 hoje, 8 em 2027-01-01)
nao_verificado:
  - nao atribui peso de sensibilidade a nenhuma classe: e decisao do vertice
  - nao medi taxa de sucesso real por modelo por classe; nao ha serie historica
  - nao verifiquei se llm/routing.py (paradigma competitivo) tem lacuna analoga
supersede: null
---

# POSTULADO-002 — `estimar_roi` nao distingue ganho relevante de ganho irrelevante

**Destinatarios:** Raphael Vitoi (arbitro), Codex, Gemini, e qualquer agente que
altere `llm/routing_policy.py`.

**Status:** registrado sob M.O. 1.2. **Nada foi implementado.** Lacuna
identificada a partir de formulacao do proprio vertice em 2026-08-27.

---

## 1. Afirmacao

A funcao `estimar_roi` calcula `taxa_sucesso / (custo * latencia)`. Ela mede ROI
**absoluto por modelo** e nao consegue expressar a decisao que realmente importa
no roteamento: **se o ganho de um modelo sobre o outro compensa a diferenca de
custo, DADA a sensibilidade daquela classe de tarefa ao ganho.**

## 2. A distincao que falta

Formulacao do operador, verbatim:

> *"2% de ganho numa tarefa de importancia 10/10 pode ser extremamente alto.
> Entretanto, ganho 2% numa tarefa onde o efeito concreto vai variar pouco em
> qualidade (ou nada), mas ha um ganho significativo em questoes do tipo
> FINANCEIRA ou latencia, esse ganho +2% e de fato marginal e entao a
> economia/latencia o supera."*

| Cenario | Delta de ganho | Sensibilidade da classe | Decisao correta | O que `estimar_roi` enxerga |
| :--- | :--- | :--- | :--- | :--- |
| Classe critica | +2% | alta | modelo caro compensa | dois numeros de ROI |
| Classe de baixa variancia de efeito | +2% | ~zero | economia vence | os mesmos dois numeros |

Os dois cenarios produzem ROIs de mesma ordem. **O peso da classe nao entra na
conta.** Logo a formula nao pode, em principio, separar os casos.

## 3. O que a formula ja acerta

Registrado para nao subestimar o componente:

- **Latencia ja e custo.** O denominador e `custo * latencia`, o que corresponde
  a "tempo gasto tambem entra como custo".
- **Tokens de raciocinio ja sao corrigidos.** `multiplicador_raciocinio` existe
  porque tokens de raciocinio sao cobrados como saida e podem dominar o total —
  e e explicito em vez de default silencioso e otimista.
- **`economia_do_escalonamento` ja compara escalonar contra usar o caro em
  tudo**, e devolve `fracao_de_equilibrio`, que e o limiar onde escalonar deixa
  de compensar. Isso e analise de custo-beneficio real, so que sobre custo, sem
  o eixo de sensibilidade.

A lacuna e de **uma dimensao ausente**, nao de formula errada.

## 4. Forma proposta (nao implementada)

Introduzir sensibilidade por classe — quanto um ponto percentual de ganho vale
naquela classe — e passar a comparar **pares**, nao modelos isolados:

```
vantagem(caro, barato, classe) =
    (sucesso_caro - sucesso_barato) * sensibilidade[classe]
    ---------------------------------------------------------
    (custo_caro - custo_barato) + (latencia_caro - latencia_barato) * valor_do_tempo
```

Escolher o caro somente quando `vantagem > 1`. Duas propriedades desejaveis:

- Com `sensibilidade` baixa, qualquer delta de ganho e engolido pelo
  denominador — economia vence automaticamente, sem regra ad hoc.
- Com `sensibilidade` alta, um delta pequeno ainda justifica o caro.

## 5. Por que NAO implementei

Tres razoes, todas de escopo e nenhuma tecnica:

1. **`sensibilidade[classe]` e juizo do vertice, nao medicao minha.** Atribuir
   peso a GOVERNANCA contra OPERACIONAL e decisao de governanca. O proprio
   operador sinalizou que "merece analise e verificacao".
2. **`valor_do_tempo` e preferencia declarada**, nao constante fisica.
3. **`sucesso_caro`/`sucesso_barato` por classe nao existem medidos.** Sem serie
   historica, a formula rodaria sobre palpite — e numero medido nunca vira
   estrutura, muito menos numero palpitado (M.O. 13.A).

Implementar agora produziria uma formula que parece rigorosa e opera sobre
constantes inventadas. E o modo de falha recorrente desta casa: o mecanismo
existe, parece verde, e nao esta ligado a nada.

## 6. Relacao com a deriva de papeis

Este postulado e a contraparte quantitativa do problema qualitativo registrado
em `llm/routing_policy.py` (ancora de decaimento, campos `ancorado_em` e
`modelos_citados`, funcao `rotas_suspeitas`):

- A **ancora** impede que a rota continue valendo em silencio apos um release.
- A **sensibilidade** impediria que um modelo de fronteira absorvesse uma classe
  barata so por ter ficado "capaz o bastante".

Sem a segunda, a deriva direcional continua tendo apenas um freio documental
(M.O. 1.3, "desperdicio e falha de roteamento") e nenhum freio computavel.
