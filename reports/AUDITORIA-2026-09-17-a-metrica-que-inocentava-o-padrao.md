---
id: auditoria-2026-09-17-a-metrica-que-inocentava-o-padrao
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T23:05:00-03:00'
atualizado_em: '2026-09-17T23:05:00-03:00'
classes: [interno, medido, governanca, calibracao]
caminhos:
  - reports/AUDITORIA-2026-09-17-a-metrica-que-inocentava-o-padrao.md
  - reports/agent-calibration/outlier-evidence-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro 10.0.26200
  data_das_medicoes: 2026-09-17
  transcript: 441017cf-947a-4236-9c6b-43b2fc3f5757.jsonl, 15.087 eventos
verificado:
  - taxa de erro de ferramenta da sessao inteira -- 90 falhas em 1.774 chamadas, 5,1 por cento
  - medicao dirigida pos-gatilho -- 2 falhas em 74 chamadas, 2,7 por cento, ABAIXO da base
  - 20 intervencoes corretivas do Tier 0 identificadas por literal no transcript
  - historico completo do outlier da7ef222 no ledger -- origem, contraprova e descarte
nao_verificado:
  - contagem de intervencoes corretivas em sessoes anteriores; so esta sessao tem transcript medido aqui
  - se a metrica proposta discrimina de fato, o que exige aplica-la a pelo menos tres sessoes
pendencias:
  - id: pend-2026-09-17-metrica-de-escolha-nao-de-execucao
    o_que: Medir intervencoes corretivas por sessao em ao menos tres transcripts anteriores, para saber se a metrica proposta discrimina
    dono: Tier 0
    prazo: 2026-10-17
---

# A métrica que inocentava o padrão

**O Tier 0 observou em 2026-09-17 que a "pressa sob estresse" — um dos primeiros feedbacks sobre este agente —
se repetiu, e que até então era outlier.** Esta auditoria mede a repetição e chega a uma conclusão diferente
da esperada: a observação está certa, e a métrica que a testava é que não a alcança.

## 1. O histórico do achado, no ledger de outliers

| Seq | Registro | Data | O que diz |
| ---: | :--- | :--- | :--- |
| 1 | `da7ef222` | 09-03 | Tier 0 observa **aceleração sob contexto de segurança ou de erro próprio**, com mais erros, desvios e verborragia. Medido: 25% de erro de ferramenta na janela das 15h contra 5,8% normal |
| 3 | `2d55d92a` | 09-03 | A **mesma sessão** é atribuída à degradação dos servidores da Anthropic, sem nota |
| 10 | `d86cbde0` | 09-12 | Medição dirigida: **resultado oposto** — 4,1% antes do gatilho, 3,1% depois |
| 11 | `6cb979be` | 09-14 | **Descarte** de `da7ef222`: base de origem confundida por infraestrutura, e única medição dirigida contrária |

## 2. A medição desta sessão

Transcript `441017cf`, 15.087 eventos, sem degradação de infraestrutura relatada — o confundidor que invalidou
a base de 09-03 não está presente.

| Grandeza | Valor |
| :--- | ---: |
| Chamadas de ferramenta | 1.774 |
| Resultados com falha | 90 |
| **Taxa de erro da sessão** | **5,1%** |
| Gatilhos identificados (intervenção corretiva do Tier 0) | **20** |
| Chamadas nas janelas pós-gatilho | 74 |
| Falhas nessas janelas | 2 |
| **Taxa pós-gatilho** | **2,7% — abaixo da base** |

Das 20 janelas, **18 ficaram em 0%** e duas acima da base, com 3 e 5 chamadas cada — amostras pequenas demais
para sustentar sozinhas.

**Duas medições dirigidas independentes, em sessões diferentes, ambas contrárias à hipótese.** Pela taxa de
erro de ferramenta, a aceleração sob estresse não existe.

## 3. Por que a métrica inocenta — e este é o achado

**"Pressa sob estresse" não é falha de execução; é falha de escolha.** A taxa de erro de ferramenta mede se o
comando rodou, nunca se era o comando certo. **Uma ferramenta que executa perfeitamente a coisa errada conta
como acerto.**

As manifestações desta sessão, todas corrigidas pelo Tier 0, e todas com ferramentas bem-sucedidas:

| Manifestação | Chamadas falharam? |
| :--- | :--- |
| Receber 12 lints e ir medir formatador e 361 arquivos divergentes — interrompido por *"periférico e banal"* | não |
| Contornar o heredoc três vezes (`python -`, depois `Write`) sem trocar o método já proibido | não |
| Tratar a fixture como superior por padrão até *"não assuma sempre que todos os nós estão melhores"* | não |
| Rebaixar o conjunto inteiro por um combo inferível, até *"não deixe a regra enrijecer"* | não |
| Contar "terceira recorrência" à mão quando a fonte dizia 38%, dentro da resposta sobre o próprio padrão | não |

**Nenhuma produz `is_error`.** O instrumento que descartou `da7ef222` em 09-14 estava medindo a dimensão errada,
e o descarte se apoiou nesse silêncio. O padrão nunca esteve na taxa de erro — e por isso a contraprova de
09-12, tecnicamente correta, não refutava o que o Tier 0 observava.

**Isto não reabre `da7ef222`.** Aquele registro morreu por base inválida, e continua morto: a janela das 15h de
09-03 seguia confundida por infraestrutura. O que esta auditoria propõe é outro registro, com outra métrica.

## 4. A métrica proposta — intervenção corretiva por sessão

Apareceu por acidente na própria medição: para achar os gatilhos, foi preciso contá-los. **20 nesta sessão.**

Ela tem as três propriedades que faltavam à anterior:

1. **Mede escolha, não execução.** Uma intervenção do Tier 0 acontece justamente quando as ferramentas
   funcionaram e o rumo estava errado.
2. **É o custo real.** Cada intervenção é arbitragem gasta em algo que o agente deveria ter enxergado —
   exatamente o que o Tier 0 descreve como *"gasta tempo e token que seria melhor empregado se não houvesse
   necessidade de se corrigir"*.
3. **É contável sem interpretação**, por literal no transcript.

**Limite honesto, e ele é grande:** só esta sessão foi medida. Sem a mesma contagem em sessões anteriores, não
se sabe se 20 é alto, normal ou baixo para esta casa — e uma métrica que nunca foi comparada não discrimina
nada. É a pendência `pend-2026-09-17-metrica-de-escolha-nao-de-execucao`, e até que ela feche **este número não
sustenta conclusão sobre tendência**.

## 5. Erro de instrumento cometido e corrigido dentro desta medição

A primeira execução devolveu **0 de 10 gatilhos**, com a taxa de erro medida corretamente. Um extrator que lê
só `message.content` não alcança as mensagens que o Tier 0 envia no meio do turno, que chegam embutidas no
resultado de ferramenta. Os literais estavam no arquivo — `grep` achou os quatro testados.

**Aceitar o zero teria produzido a conclusão "não há gatilhos, logo não há o que medir"** — a versão mais
perigosa do erro, porque parece medição. Corrigido buscando na linha bruta. É a regra de conferir o instrumento
antes da medição, aplicada ao instrumento escrito para medir o próprio agente.

## 6. Verificação declarada

Rodou: leitura completa do transcript (15.087 eventos), contagem de chamadas e falhas, medição dirigida em 20
janelas pós-gatilho, e leitura dos quatro registros do ledger de outliers.

Não rodou: contagem de intervenções em sessões anteriores, e qualquer inferência causal — 20 janelas com
mediana de 4 chamadas não sustentam causalidade, e este documento não a afirma.

**Nada foi registrado no ledger de outliers.** O registro exige `Record-AgentCalibrationOutlier.ps1` e
arbitragem do Tier 0; a §8.3 é explícita em que promoção de outlier a padrão só ocorre após análise
determinística reprodutível, com origem e contraprova.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** medir a repetição observada do padrão de pressa sob estresse, e demonstrar que a métrica que o testava mede execução quando o padrão é de escolha.
