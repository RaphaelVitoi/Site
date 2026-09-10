---
id: registro-2026-09-10-estimativa-field-estrutura-hh
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-10'
config_medida:
  baseline_head: 4715d51067a7239e746d4c3c842f1759e49dfeca
  branch: master
  raiz: C:/Users/rapha/.gemini/Site
classes: [interno, medido, contrato, hipotese, simulador]
caminhos:
  - frontend/src/lib/fieldModel.ts
  - frontend/src/lib/fieldCompletion.ts
  - frontend/src/lib/chipLedger.ts
  - frontend/src/lib/tournamentContext.ts
  - frontend/src/lib/hrcFormat.ts
  - frontend/src/components/simulator/panels/TournamentTableImport.tsx
  - frontend/src/components/simulator/panels/EquityCalculator.tsx
  - frontend/src/tests/simulator/fieldCompletion.test.ts
  - frontend/src/tests/simulator/tournamentTableImport.test.tsx
revisoes_de_ancora:
  - registro: registro-2026-09-09-mtt-contexto-completo-hh-hrc
    caminhos:
      - frontend/src/lib/tournamentContext.ts
      - frontend/src/lib/hrcFormat.ts
      - frontend/src/components/simulator/panels/TournamentTableImport.tsx
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/tests/simulator/tournamentTableImport.test.tsx
    parecer: Modelagem externa passa a ser uma acao explicita com proveniencia. Stacks recebidos nao sao descartados nem substituidos automaticamente. Estrutura completa define payouts apos a contagem escolhida.
  - registro: registro-2026-09-10-fichas-posicoes-premiacao
    caminhos:
      - frontend/src/lib/chipLedger.ts
      - frontend/src/lib/hrcFormat.ts
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
    parecer: Conservacao exata mantida. Valores originais HRC fracionarios sao preservados e usuario pode materializar explicitamente uma distribuicao inteira com o mesmo total. Ledger recebe proveniencia.
  - registro: registro-2026-09-10-importacao-visivel-hh-hrc
    caminhos:
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/components/simulator/panels/TournamentTableImport.tsx
    parecer: Importador agora oferece geracao de field a partir da estrutura e HH e materializacao de otherstacks HRC, preservando configuracao e diferenca entre modelo e observacao.
verificado:
  - Documentacao primaria do HRC confirma estimativa de restantes a partir dos stacks ativos e do total de fichas.
  - Dois saves reais da pasta Semi FT e Mid Resteal inspecionados sem alterar as fontes.
  - 48 suites e 381 testes frontend aprovados; TypeScript e ESLint aprovados.
  - Conservacao de fichas, payouts remanescentes, proveniencia, contagem editavel e aplicacao pela interface cobertos por testes.
nao_verificado:
  - Equivalencia com a formula proprietaria HRC de estimar restantes e distribuir stacks.
  - Precisao estatistica da contagem real de torneios; arquivos contêm cenarios, nao ground truth independente.
  - Paridade dos EVs com o solve HRC, WCAG, CWV, commit e push desta fase.
referencias_nao_resolviveis: []
---

# Estimativa de field com estrutura e HH

Raphael forneceu capturas do wizard HRC e pediu aproveitar os cenarios existentes
para preencher jogadores restantes e stacks externos com menos trabalho manual.

## Fontes e resultados

Documentacao primaria:
https://www.holdemresources.net/blog/2020-02-hrc-update/

A secao MTT Usage confirma a estimativa de restantes quando ha total de fichas
e stacks ativos. Nao publica formula nem taxa de erro da estimativa de contagem.
A alta precisao do modelo ICM para uma populacao dada nao certifica, por si,
a precisao de inferir essa populacao a partir de uma unica mesa.

Saves locais, pasta C:/Users/rapha/OneDrive/PANTS/Pantoja/Semi FT e Mid Resteal:

| Arquivo | Mesa | Externos | Restantes no save | Fichas da mesa | Total | Total / media da mesa |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mid Resteal 30 15.hrcz | 7 | 47 | 54 | 48783 | 378000 | 54.2402 |
| SemiFT Resteal BU 30 BB 15.hrcz | 6 | 7 | 13 | 179927 | 378000 | 12.6051 |

Ambos conservam o total a precisao numerica e possuem todos os stacks externos
fracionarios. Arredondar a estimativa pela media reproduz a contagem salva nos
dois casos. Isso e compatibilidade nesses casos, nao identificacao do algoritmo
HRC nem validacao empirica geral. A contagem do save e preservada na importacao.

Na captura enviada: soma da mesa 175672, total 378000, saldo externo 202328.
A segunda captura configura 10 restantes (9+1); o externo fica com todo o saldo.
Pela hipotese da media da mesa, seriam 19 apos arredondamento (19.366... antes).
A captura nao estabelece se 10 foi automatico, alterado manualmente ou herdado.

### Complemento confirmado por Raphael

Raphael esclareceu posteriormente que os 10 restantes haviam sido manipulados
manualmente. As novas capturas mostram a sugestao HRC de 19 restantes e a
distribuicao correspondente, encerrando essa incerteza para o caso apresentado.

| Grandeza | Outras mesas | Mesa ativa | Total |
| :--- | ---: | ---: | ---: |
| Jogadores | 10 | 9 | 19 |
| Fichas | 202328 | 175672 | 378000 |
| Media de fichas | 20232.80 | 19519.11 | 19894.74 |
| Media em BB | 28.90 | 27.88 | 28.42 |

Parametros visiveis no gerador: Randomize desativado, Auto Shape ativado,
Shape exibido como 0.53. O grafico mostra os stacks da mesa como pontos vermelhos
e os externos como marcadores azuis sobre a area preenchida, ordenados por
percentil de stack. A curva distribui o saldo entre dez externos, em vez de
concentra-lo em um unico jogador.

Fontes visuais fornecidas nesta conversa:
- C:/Users/rapha/AppData/Local/Temp/codex-clipboard-07861b1a-ae62-4512-9c00-c9bead410274.png
- C:/Users/rapha/AppData/Local/Temp/codex-clipboard-b7730c3b-b004-487d-8d7b-c6f22234a7b9.png

Esses caminhos temporarios nao garantem disponibilidade futura; os valores
legiveis e a confirmacao do usuario estao transcritos neste registro.
Correspondencia de contagem confirmada neste caso: 19. Ainda nao se estabelece
equivalencia entre o nosso gerador por quantis empiricos e o Auto Shape HRC,
nem o significado matematico de Shape 0.53. Nao foi inferida uma familia de
distribuicao apenas pela aparencia do grafico. O proximo comparativo deve manter
mesa, total e N fixos, confrontando os dez otherstacks exportados pelo HRC com
a nossa distribuicao e seus efeitos no ICM.

## Contrato implementado

1. Estrutura + HH: sugestao N = round(total / media da mesa), respeitando a
   presenca de saldo externo. O usuario pode informar o numero do lobby.
2. Geracao explicita: quantis empiricos interpolados dos stacks observados
   fornecem pesos dos stacks externos. Esses pesos sao ajustados ao saldo.
3. Alocacao inteira: reserva uma ficha por jogador vivo e distribui o restante
   proporcionalmente, usando maiores restos para fechar o total exato.
4. Payouts: recorta a estrutura completa para os restantes e recalcula o pool
   restante; dinheiro historico continua separado.
5. HRC com otherstacks: preserva a contagem e oferece materializacao explicita
   da distribuicao fracionaria, sem inferir novamente os restantes pela mesa.
6. Origem, metodo, IDs derivados e valores externos originais quando aplicavel
   acompanham snapshot, ledger enviado aos experimentos e exports JSON/HRC.

O gerador nao substitui stacks externos ja informados; exige total inteiro,
estrutura completa e saldo compativel. Ha um limite operacional de 10000 jogadores
para esta geracao local, independente do limite de 8/9 assentos analisados.

A distribuicao empirica e um primeiro molde deterministico. Uma mesa nao captura
necessariamente as caudas do field. Nenhuma margem de confianca ou superioridade
ao gerador HRC foi alegada. O usuario pode revisar N e regenerar; mudar N depois
da geracao impede aplicar o resultado anterior sem gerar novamente.

## Correcao da interpretacao anterior

Fracoes em otherstacks podem ser dados de modelo validos. A exigencia de fichas
inteiras nao deve impedir modelagem externa: deve controlar sua materializacao
e conservar o total. A nova acao torna a derivacao explicita, mantendo a fonte
original em vez de a reescrever como observacao de torneio.

Testes incluem os montantes das capturas, N=10 e N=19, field impossivel,
nao substituicao de externos conhecidos, distribuicoes extremas, conservacao,
materializacao do save real e operacao dos controles React. Nenhum arquivo
original, memoria externa, commit ou push foi alterado nesta fase.

Assinatura: Chat GPT-6 Astra <noreply@openai.com>.
