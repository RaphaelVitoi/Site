---
id: validacao-2026-09-12-o-numero-que-faltava-ao-memo-do-perspective-chart
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T00:18:33-03:00'
atualizado_em: '2026-09-13T00:18:33-03:00'
classes: [interno, medido, performance, frontend]
caminhos:
  - frontend/src/tests/simulator/perspectiveChartRenders.test.tsx
pendencias_resolvidas:
  - pend-2026-09-12-render-desperdicado
verificado:
  - mexer na equity produz 2 renders por instancia do grafico, 0 efetivos, 2 desperdicados
  - mexer no kappa produz 2 renders por instancia, 1 efetivo, 1 desperdicado
  - o painel monta DUAS instancias do PerspectiveChart -- o efeito no DOM e o dobro da conta
  - winProb nao esta entre as 13 dependencias do useMemo de chartData -- lido na fonte
  - kappa esta entre elas, e por isso o primeiro render pos-interacao e legitimo
  - cada interacao dispara setWasmLogs duas vezes -- pelo efeito que posta ao worker e pela resposta
  - nenhuma das duas chamadas de setWasmLogs toca dependencia do useMemo
  - suite frontend integral 406 aprovados em 52 suites, zero erros e zero warnings
  - o instrumento foi corrigido durante a medicao -- a primeira versao nao conseguia ver mudanca alguma
nao_verificado:
  - nenhum numero de tempo de tela, layout thrash ou long task foi medido
  - nao foi medido em navegador real com CDP; a medicao e de contagem de render em jsdom
  - nao foi medido quanto custa UM render do LineChart do recharts
config_medida:
  instrumento: jest + @testing-library/react, mock sem memo do PerspectiveChart
  instancias_do_grafico: 2
  renders_por_interacao: 2
---

# O número que faltava ao `React.memo` do `PerspectiveChart`

## 1. A dívida

O commit `812c1c2f` embrulhou o `PerspectiveChart` em `React.memo` justificando
*"to prevent layout recalculations"*. A §10.1 é explícita: alteração de
performance exige **um número medido antes**. Não havia número — havia hipótese.

## 2. O contrafactual, e por que ele não é "contar renders"

Não dá para contar renders do componente memoizado: o memo justamente os impede,
e contar zero não prova ganho nenhum. O que se mede é o **mundo sem a
otimização** — um mock do `PerspectiveChart` sem `memo`, que registra a
referência de `chartData` a cada render do pai:

- **R** = renders que chegariam ao gráfico sem o memo, após a interação
- **E** = quantos trazem um `chartData` realmente novo
- **R − E** = renders que o memo evita

## 3. O número

| Interação | R | E | Desperdiçados | Taxa de acerto do memo |
| :--- | ---: | ---: | ---: | ---: |
| Equity (`winProb`) | 2 | 0 | **2** | **100%** |
| Kappa | 2 | 1 | **1** | **50%** |

O painel monta **duas** instâncias do gráfico, então em elementos de DOM o
efeito é o dobro: 4 e 2.

## 4. O memo se justifica — e a justificativa escrita estava errada

O ganho é real, e o contraste com o caso que a §10.3(2) registra explica por quê:
lá, o `React.memo` do `ActionRow` teria **zero** acertos, porque a prop era um
`onChange` inline cuja referência muda todo render. Aqui a prop vem de um
`useMemo` com 13 dependências — é estável por construção, e a taxa de acerto vai
de 50% a 100%.

**Mas o mecanismo não é o alegado.** Nada disso é recálculo de layout. Cada
interação dispara `setWasmLogs` **duas vezes** — uma no efeito que posta ao
worker, outra na resposta dele — e nenhuma das duas toca dependência do
`useMemo`. São renders **estruturalmente incapazes** de mudar o gráfico. O memo
não previne recálculo de layout; ele absorve uma cascata de log.

Registrar isso importa porque a próxima pessoa a ler o commit herdaria a
explicação errada e otimizaria o lugar errado.

## 5. O que NÃO foi medido, e por que não parto para a causa

A cascata de log é a fonte do desperdício, e mexer nela removeria a causa em vez
do sintoma. **Não fiz isso, e a razão é a própria §10.1:** o desperdício medido é
de 1 a 2 renders por interação, e não tenho número de tela — nem tempo, nem long
task, nem custo de um render do `LineChart`. Sem esse número, mexer no fluxo de
telemetria seria trocar risco de correção por ganho não quantificado, que é
exatamente o que a §10.3(1) proíbe.

O memo fica: barato, com acerto medido, e reversível.

## 6. O erro de instrumento, que vale mais que o resultado

A primeira versão do teste zerava o contador **antes** da interação e contava
referências distintas apenas depois dela. Com isso a linha de base sumia: mesmo
quando o `chartData` mudava de fato — o caso do kappa —, a contagem via uma
referência só e concluía "não mudou". O teste reprovou, e a reprovação era do
instrumento, não do código.

**Medição que não carrega o estado anterior mede a própria janela.** O guard
corrigido guarda a última referência antes da interação e compara contra ela.

**Assinatura:** `Claude Opus 5 [Tier 1.B]` — sessão `claude-opus5-site-2026-09-12-preludio`
