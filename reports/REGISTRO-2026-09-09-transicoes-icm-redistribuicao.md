---
id: registro-2026-09-09-transicoes-icm-redistribuicao
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-09'
classes:
  - interno
  - medido
  - contrato
  - hipotese
caminhos:
  - frontend/src/lib/icmTransitionExperiment.ts
  - frontend/src/lib/counterfactualExperiment.ts
  - frontend/src/app/api/sota/icm-transitions/route.ts
  - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
  - frontend/src/components/simulator/panels/EquityCalculator.tsx
  - frontend/src/tests/simulator/icmTransitionExperiment.test.ts
  - frontend/src/tests/simulator/icmTransitionPanel.test.tsx
config_medida:
  baseline_head: 6fa707ac921d72f6a263e9b22c9d6f86138ebbd1
  modelo: settled-table-icm-binary
  versao: 1.0.0
  limite_mesa: PokerStars 9p, GGPoker 8p
  monte_carlo_default: 2000 amostras por estado, seed 1
  orcamento_operacional: 100000000 operacoes estimadas por pedido, sem truncamento de field
revisoes_de_ancora:
  - registro: registro-2026-09-09-mtt-contexto-completo-hh-hrc
    caminhos:
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
    parecer: Painel de transicoes recebe population completa e selecao existente. Importadores e motor ICM anterior preservados; regressao frontend completa aprovada.
  - registro: registro-2026-09-09-adaptador-contrafactual-pmev
    caminhos:
      - frontend/src/lib/counterfactualExperiment.ts
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
    parecer: Extraidos schema de contexto, validacao comum e comparacao terminal sem alterar o contrato das utilidades assumidas. Testes anteriores continuam aprovados; nova valoração recebe unidade monetaria propria.
verificado:
  - Fonte original no Google Drive lida; conclusoes comparadas a S07 blocos 105 a 111 e pagina local.
  - Conservacao de fichas e premios, pagamentos individuais e valoração de todo o field em cada resultado.
  - Caso sintetico HTTP 200, limiar 4/7 e residual monetario zero; criacao de fichas recusada com HTTP 422.
  - 44 suites e 366 testes frontend aprovados; TypeScript e ESLint verificados.
nao_verificado:
  - Capacidade futura de pressao, politicas adversarias e realizacao estrategica do valuation.
  - Legalidade de uma sequencia de apostas, bounties, reentradas ou classificacao empatada.
  - Convergencia Monte Carlo e intervalo de confianca dos deltas.
  - Auditoria WCAG, Core Web Vitals, commit e push desta fase.
referencias_nao_resolviveis: []
---

# Transicoes monetarias e redistribuicao do valuation

O adaptador calcula o ICM do estado inicial e dos resultados de fold, call vence
e call perde, usando o field completo. Transicoes e probabilidades permanecem
hipoteses do usuario. A UI parte da identidade: mesmas stacks nos tres estados,
indiferenca, sem fabricar uma aposta ou resultado a partir de uma HH.

## Conceito original localizado por Raphael

Durante esta fase, Raphael apontou seu conceito de influencia sistemica do
valuation sobre todas as stacks, mencionando provisoriamente "Dissipacao do
Valuation". A fonte indicada foi localizada e lida pelo conector autenticado:

- Documento: [Entendendo o ICM e suas heuristicas](https://docs.google.com/document/d/1S5kufnSM5y15CxDjr_nLi1oQoOvndlV3imDRBl-SxfU/edit).
- ID: 1S5kufnSM5y15CxDjr_nLi1oQoOvndlV3imDRBl-SxfU.
- Metadado de modificacao: 2026-08-22T11:28:04.290Z.
- Texto retornado: 32671 caracteres, com artefatos de extracao de figuras.
- Correspondencia local: S07 blocos 105 a 111; tambem presente nas conclusoes da
  pagina `frontend/src/app/(public)/biblioteca/entendendo-o-icm-e-suas-heuristicas/page.tsx`.

O nome "Dissipacao do Valuation" nao foi encontrado no texto extraido. O conceito
esta expresso: uma parte da diferenca de valor se distribui pela mesa, incluindo
stacks ausentes da jogada; a nova distribuicao altera a capacidade futura de
pressionar, rivalizar e realizar valor. A pagina local sintetiza e intensifica
algumas formulacoes (por exemplo, "permanentemente"), enquanto o original usa
condicionantes. A pagina nao foi tratada como substituta integral do original.

A fonte sustenta duas dimensoes distintas: reavaliacao monetaria do estado e
mudanca das possibilidades estrategicas futuras. O incremento implementa a
primeira como baseline ICM e torna a segunda uma capacidade explicitamente
pendente. Isso nao reduz a teoria autoral ao baseline nem promove conclusoes
estrategicas qualitativas a coeficientes numericos.

## Contabilidade e causalidade

Para cada jogador, T_i(depois) = premio_pago_i + ICM_i(sobreviventes, premios_restantes).
O delta e T_i(depois) - ICM_i(antes). A soma dos deltas deve ser zero, dentro da
tolerancia numerica, quando o conjunto inclui todos os jogadores e os premios
pagos. A queda do pool restante apos uma eliminacao paga nao e destruicao de
dinheiro: a parcela foi liquidada. Nao se presume que todos os deltas individuais
sejam nao nulos ou tenham o mesmo sinal em qualquer transicao.

Eliminacoes recebem colocacao explicita: ordem da pior para a melhor, incluindo
eliminacoes sem premio. O motor nao passa stacks zeradas ao kernel que poderia
ratear os ultimos payouts por falta de ordem. Premios dos sobreviventes sao
preservados e o ICM de cada um e recalculado. Bounties estao fora deste contrato.

O diagnostico novo exibe antes/depois de cada jogador, delta, stack inalterada,
valor medio monetario por BB e ledger de pagamentos. Valor medio nao e valor
marginal; o denominador dos stacks eliminados e indisponivel, nao infinito.
Os efeitos sobre jogadores externos permanecem no JSON e na tabela do field.

## Exemplo sintetico verificado

Tres jogadores com 10 BB cada, premios restantes 5000/3000/2000. A elimina B;
C permanece com 10 BB. Valuation inicial: 3333.33 por jogador.

| Jogador | Stack depois | Valor depois, incluindo pago | Delta |
| :--- | ---: | ---: | ---: |
| A | 20 | 4333.33 | +1000.00 |
| B | 0 | 2000.00 | -1333.33 |
| C | 10 | 3666.67 | +333.33 |

O teste confere que C ganha valuation sem ganhar fichas, que B recebe 2000 uma
unica vez e que o total continua 10000. O exemplo e sintetico; nao reproduz as
figuras da aula nem prova as teses sobre pressao futura.

## Capacidade e verificacao

ICM exato ate 10 sobreviventes (limite do kernel de field, independente da mesa
9/8). Fields maiores usam Monte Carlo com amostras e seed declaradas. O limite
de trabalho considera numero de stacks, payouts, amostras e quatro estados;
pedidos acima do orcamento sao recusados sem truncar a populacao. Esse orcamento
e um limite de engenharia, nao um limiar estatistico de convergencia.

Testes incluem 115 stacks externos, reprodutibilidade, premios sem pagamento,
ordem de duas eliminacoes, conservacao e recusas. A interface invalida resultados
apos edicao e reinicia transicoes quando o contexto muda. HTTP local executou o
caso sintetico em 544 ms (uma requisicao de desenvolvimento, sem benchmark ou
alegacao de INP). O teste negativo criou uma ficha e recebeu 422.

## Continuacao

Conectar a defesa bilateral ao mesmo ledger, distinguindo risco do agressor e
do defensor. Para investigar a segunda dimensao do conceito de Raphael,
introduzir politicas e continuacoes explicitas e comparar oportunidades futuras
do mesmo estado; nao somar um bonus de pressao arbitrario ao ICM. Decidir o nome
definitivo de "Dissipacao do Valuation" permanece com o autor.

**Auditor e implementador:** Chat GPT-6 Astra <noreply@openai.com>, Tier 1.
