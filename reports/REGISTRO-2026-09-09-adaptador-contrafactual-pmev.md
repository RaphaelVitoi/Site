---
id: registro-2026-09-09-adaptador-contrafactual-pmev
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-09'
classes:
  - interno
  - medido
  - contrato
caminhos:
  - frontend/src/lib/counterfactualExperiment.ts
  - frontend/src/app/api/sota/counterfactual/route.ts
  - frontend/src/components/simulator/panels/CounterfactualPanel.tsx
  - frontend/src/components/simulator/panels/EquityCalculator.tsx
  - frontend/src/tests/simulator/counterfactualExperiment.test.ts
  - frontend/src/tests/simulator/counterfactualPanel.test.tsx
config_medida:
  baseline_head: 6fa707ac921d72f6a263e9b22c9d6f86138ebbd1
  modelo: terminal-utility-binary
  versao: 1.0.0
  backend: Next.js Route Handler
  assinatura: Chat GPT-6 Astra, Tier 1
revisoes_de_ancora:
  - registro: registro-2026-09-09-mtt-contexto-completo-hh-hrc
    caminhos:
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
    parecer: Adicionado painel com population, selection, conditions, prizes e heroId existentes. Importacao, selecao e motor ICM preservados. Testes de importacao e contexto passaram na suite completa frontend.
verificado:
  - 42 suites frontend e 353 testes aprovados, incluindo 14 novos testes de contrato e interface.
  - Endpoint HTTP local retornou 200 com deltas -1, 2 e 5 e limiar 0.56; probabilidade 1.5 retornou 422.
  - TypeScript e ESLint aprovados; painel renderizado no navegador local na calculadora existente.
nao_verificado:
  - Utilidades derivadas de transicoes de stacks, solve de equilibrio, raises ou empates de showdown.
  - Fidelidade empirica das hipoteses, certificacao CWV ou auditoria WCAG completa.
  - Publicacao remota desta fase; nenhum commit ou push realizado.
referencias_nao_resolviveis: []
---

# Primeiro adaptador executavel da curadoria PMev

A fase anterior propunha comecar por uma matriz pequena de utilidades assumidas.
Este incremento implementa esse piloto no backend Next.js e na calculadora
compartilhada pelo simulador e pelas paginas da biblioteca. Nao ha necessidade
de encaminhar uma expectativa binaria deterministica ao servidor Python nem
de duplicar o algoritmo em duas linguagens.

## Contrato conceitual

Para o mesmo horizonte terminal, Q(call) = q U(win) + (1-q) U(loss),
Q(fold) = U(fold), delta = Q(call) - Q(fold). Fold e um contrafactual;
nao e um credito adicional. O limiar e (U(fold)-U(loss))/(U(win)-U(loss))
quando existe denominador e o resultado esta entre zero e um. Valores constantes
distinguem indiferenca global de dominancia. Comparacoes proximas de zero usam
tolerancia numerica relativa declarada no codigo.

Utilidades sao absolutas no horizonte, assumidas e em uma unidade de toy game.
Nao sao dolares nem conversao automatica de ICM. O contexto MTT e validado pelo
contrato existente e preservado no snapshot: field, todos os stacks, payouts,
selecao e heroi. Os payouts absolutos resolvidos tambem acompanham a resposta.
O adaptador nao estima essas utilidades a partir dos stacks. Essa capacidade
permanece explicitamente distinta do calculo ICM existente.

## Fonte e implementacao

O manifesto executavel declara versao, metodo, corpus, PM-CONTINUATION, PM-FOLD,
PM-MARGINAL-STABILITY e referencias ao molde TOY-FOLD e ao complemento curado.
S09 blocos 12 a 15 ancora a formulacao de continuacao. As formulas executaveis
sao codigo revisado; nenhum documento e avaliado como codigo.

O piloto exige valores finitos, probabilidades em [0,1], heroi com fichas e
contexto coerente. O limite de 21 valores restringe apenas a grade de
sensibilidade, nunca o field. Ha teste com 115 jogadores fora da mesa, alem dos
dois selecionados. A mesa respeita 9p PokerStars/8p GGPoker; stacks ausentes,
chip mass inconsistente e selecoes impossiveis sao recusados.

A UI oferece defaults editaveis, explicacoes visiveis e tooltips. Alterar
qualquer entrada ou contexto invalida a exibicao de resultados anteriores.
O JSON exportado contem snapshot, modelo, premissas, resultados e limites.
A amplitude entre probabilidades assumidas nao e intervalo de confianca.

## Validacao e limites

Os casos cobrem o exemplo sintetico (-1/+2/+5), mudanca do valor de continuacao,
invariancia por translacao comum de utilidades, casos degenerados, heroi
eliminado, field incompleto, massa de fichas, capacidade da sala, probabilidades
impossiveis e invalidacao de resultados na UI. A primeira verificacao de UI
detectou nome acessivel misturado com texto de ajuda; aria-labelledby separa
agora o rotulo da descricao. A suite completa passou apos a correcao.

O navegador confirmou a montagem do painel junto da calculadora ICM em
`/biblioteca/laboratorio-chipev-vs-icmev`. O fluxo React foi exercitado por teste
de componente; o endpoint foi exercitado por HTTP local. Isso nao e uma
certificacao de acessibilidade ou de desempenho de todas as paginas.

## Proxima fase

Adicionar transicoes explicitas de stacks para gerar utilidades ICM de cada
resultado com o mesmo field, premios e horizonte. Exigir conservacao de fichas
e contabilidade de pagamentos; permitir que o fold tenha continuacao propria.
Depois, conectar o molde de defesa bilateral e riscos separados. O campo
contextRole devera mudar apenas quando o valuation usar realmente o contexto.

**Assinatura:** Chat GPT-6 Astra <noreply@openai.com>, Tier 1, auditor e implementador.
