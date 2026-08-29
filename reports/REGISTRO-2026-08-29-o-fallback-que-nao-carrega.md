---
id: registro-2026-08-29-o-fallback-que-nao-carrega
tipo: registro
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-29T10:05-03:00
classes: [interno]
decide: nada sobre a tabela -- instala o detector e devolve a escolha do modelo ao vertice
caminhos:
  - data/ESTADO_DE_ROTEAMENTO.json
  - tests/test_routing_policy.py
verificado:
  - "llm/routing_policy.py:425-426 lido -- decidir() consome rota.fallback sob Origem.FALLBACK desde 2026-08-27"
  - "busca por primario_indisponivel em todo *.py -- as unicas passagens True estao em tests/test_routing_policy.py linhas 442, 451 e 463; zero em producao"
  - "numeros lidos do repo, nao de memoria -- data/TETOS_DE_MEMORIA.json maquina_medida.vram_disponivel_ao_ollama_gib = 7.2; data/ollama_models.json gemma4:12b = 7.6 GB e gemma4:e4b = 9.6 GB"
  - "tres mutacoes exercitadas no detector, cada uma reprovando -- fallback trocado por modelo que cabe, teto de VRAM elevado a 10 GiB, e primario/fallback invertidos; restauracao volta a passar"
  - "suite completa executada com basetemp isolado"
nao_verificado:
  - "nao carreguei o gemma4:e4b para confirmar em execucao que ele nao entra na placa; a prova aqui e aritmetica sobre os dois JSON declarados"
  - "nao verifiquei se o Ollama faz offload parcial para RAM, o que mudaria carrega/nao-carrega para carrega-devagar; isso nao altera o defeito de degradar para algo MAIOR"
  - "nao escolhi modelo substituto -- a tabela e do operador"
---

# O aviso foi atravessado, nao respondido

## O que estava escrito

`data/ESTADO_DE_ROTEAMENTO.json` trazia, entre as pendencias que a decisao de
2026-08-27 nao resolveu:

> *"Rota.fallback continua sem consumidor. (...) Nao foi ligado nesta passagem
> de proposito: o fallback da classe LOCAL e gemma4:e4b, e ha medicao anterior
> de que o e4b e multimodal e nao cabe na VRAM desta maquina. Tornar o fallback
> alcancavel sem antes revisar essa entrada criaria um caminho para um modelo
> que nao carrega."*

Uma condicao explicita: **primeiro revisar a entrada LOCAL, depois ligar.**

## O que foi feito

O consumidor foi escrito, no mesmo dia, em `llm/routing_policy.py:425`:

```python
if primario_indisponivel:
    return Decisao(rota.fallback, Origem.FALLBACK, classe, rota)
```

A entrada LOCAL nao foi revisada. A ordem foi invertida.

O proprio docstring da funcao comemora o fechamento -- *"Ate esta data
`Rota.fallback` estava declarado e nao tinha um unico consumidor"* -- e dois
testes passam a cobrir o caminho, um deles chamado
`test_fallback_tem_caminho_de_execucao`.

## Por que o dano nao chegou

Porque o caminho esta **armado e desconectado**. `primario_indisponivel=True`
nao tem um unico chamador de producao: as tres unicas passagens do parametro
como verdadeiro estao em `tests/test_routing_policy.py`, linhas 442, 451 e 463.

O nome do teste diz "tem caminho de execucao". Ele prova que a **funcao
ramifica**, nao que algo a **executa**. E a mesma forma da pendencia 1 desta
semana, uma casa acima: o defeito "declarado sem leitor" foi resolvido criando
um leitor que so o teste invoca. O portao subiu um nivel e continuou solto.

## O numero que a entrada antiga nao tinha

O texto anterior dizia "nao cabe na VRAM" de memoria. Medido, dos dois JSON
declarados no repositorio:

| | GB | fonte |
| :--- | ---: | :--- |
| VRAM disponivel ao Ollama | **7,2** | `TETOS_DE_MEMORIA.json`, `maquina_medida` |
| `gemma4:12b` — **primario** LOCAL | 7,6 | `ollama_models.json` |
| `gemma4:e4b` — **fallback** LOCAL | 9,6 | `ollama_models.json` |

Duas coisas que ninguem tinha escrito:

1. **Nao e so o fallback.** O *primario* da classe LOCAL tambem estoura o teto
   declarado, por 0,4 GB. A rota LOCAL nao tem um degrau que caiba.
2. **A degradacao pede MAIS.** O fallback e 2 GB maior que o primario. Degradar
   e pedir menos; ali pede mais. O nome esconde a inversao -- `e4b` soa menor
   que `12b`, e a razao ja esta registrada: o e4b carrega visao e audio.

## O que este commit faz, e o que nao faz

**Nao toca a tabela.** Escolher o modelo da faixa LOCAL e decisao do operador, e
o cabecalho de `ROTAS` diz isso com todas as letras.

**Instala um detector**,
`test_nenhuma_rota_local_nova_estoura_a_vram_declarada`. Ele nao declara saude:
**fixa as duas violacoes conhecidas** -- computa, das duas fontes, o conjunto de
rotas de faixa LOCAL que estouram a VRAM, e exige que ele seja exatamente
`{"local": ["gemma4:12b", "gemma4:e4b"]}`. Disso decorrem tres coberturas com
uma assercao so:

- rota LOCAL **nova** com o mesmo defeito reprova;
- **correcao** de qualquer uma das duas tambem reprova, forcando a atualizacao
  deste registro no mesmo commit -- doenca conhecida nao some em silencio;
- mexer no teto de VRAM sem revisar as rotas reprova.

Uma segunda assercao trava a inversao `fallback > primario`.

Exercitado com tres mutacoes, cada uma reprovando: fallback trocado por um
modelo que cabe (4,7 GB), teto elevado a 10 GiB, e primario/fallback
invertidos. Restaurado, passa.

## A decisao que fica com o vertice

A faixa LOCAL precisa de um par que caiba em 7,2 GB. Da frota declarada em
`data/ollama_models.json`, cabem: `qwen2.5-coder:7b` (4,7), os tres derivados
`qwen-*` (5,4), `qwen2.5-coder:7b-instruct-q5_K_M` (5,4),
`qwen2.5-coder:1.5b` (0,98) e `qwen2.5-coder:0.5b` (0,39). Nao proponho um:
sao modelos de codigo onde hoje esta um generalista, e a troca muda o que a
faixa LOCAL sabe fazer.

Enquanto nao houver decisao, o estado seguro e o de hoje -- o caminho
desconectado. **A pergunta operacional nao e "qual modelo", e "quem vai ligar o
`primario_indisponivel`":** no dia em que alguem ligar, a classe LOCAL degrada
para um modelo maior que o que ja nao cabia.
