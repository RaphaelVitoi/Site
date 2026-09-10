---
id: registro-2026-09-10-fichas-posicoes-premiacao
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-10'
config_medida:
  baseline_head: 4715d51067a7239e746d4c3c842f1759e49dfeca
  branch: master
  raiz: C:/Users/rapha/.gemini/Site
classes: [interno, medido, contrato, simulador]
caminhos:
  - frontend/src/lib/chipLedger.ts
  - frontend/src/lib/counterfactualExperiment.ts
  - frontend/src/lib/icmTransitionExperiment.ts
  - frontend/src/lib/hrcFormat.ts
  - frontend/src/components/simulator/panels/EquityCalculator.tsx
  - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
  - frontend/src/components/simulator/panels/TournamentConditionsPanel.tsx
  - frontend/src/tests/simulator/chipLedger.test.ts
  - frontend/src/tests/simulator/equityCalculatorLedger.test.tsx
revisoes_de_ancora:
  - registro: registro-2026-09-09-mtt-contexto-completo-hh-hrc
    caminhos:
      - frontend/src/lib/hrcFormat.ts
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/components/simulator/panels/TournamentConditionsPanel.tsx
    parecer: Bancada passa a manter fichas fisicas e payouts monetarios; importacao converte uma vez e exportacao HRC usa ledger opcional com ordem de botao canonica. Contexto externo permanece integral. Contratos legados sem ledger preservados.
  - registro: registro-2026-09-09-adaptador-contrafactual-pmev
    caminhos:
      - frontend/src/lib/counterfactualExperiment.ts
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
    parecer: Contexto recebe ledger opcional, valida correspondencia por ID com projecao BB e conservacao monetaria em centavos. Utilidades hipoteticas continuam independentes do ICM.
  - registro: registro-2026-09-09-transicoes-icm-redistribuicao
    caminhos:
      - frontend/src/lib/icmTransitionExperiment.ts
      - frontend/src/lib/counterfactualExperiment.ts
      - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
    parecer: Modelo 1.1.0 usa fichas inteiras e igualdade exata quando recebe ledger. Mantem pagamentos uma unica vez, field completo, limites operacionais e valor medio por BB com escala correta. Clientes antigos sem ledger continuam em BB.
verificado:
  - Suite frontend completa com 46 suites e 372 testes aprovados durante a implementacao.
  - Regressao focal de cinco suites e 39 testes aprovada apos ajuste da exportacao.
  - TypeScript e ESLint aprovados; diff sem erros de whitespace.
  - Pagina local inspecionada por arvore de acessibilidade, com novos controles, fichas e posicoes.
nao_verificado:
  - Auditoria visual responsiva completa, WCAG e Core Web Vitals.
  - Importacao manual destes novos exports no aplicativo HRC; roundtrip automatizado verificado.
  - Commit, pre-push, push e CI desta fase.
referencias_nao_resolviveis: []
---

# Fichas, posições e conservação da premiação

Pedido de Raphael: posições explícitas, inputs em unidades físicas de fichas,
BB visual e conservação do montante do torneio; mesma regra para prize pool.

## Contrato executado

| Grandeza | Entrada | Invariante |
| :--- | :--- | :--- |
| Stacks | Fichas inteiras, inclusive field externo | Soma igual ao total declarado do cenário |
| BB | Blind inteiro positivo; toggle de exibição | Trocar exibição não reinterpreta nem altera stacks |
| Payouts | Valores monetários com até dois decimais | Soma em centavos igual ao pool restante |
| Premiação histórica | Total menos restante, explicitamente derivada | Total = já pago + restante |
| Eliminação | Stack zero e ordem resolvida pelo usuário | Fichas transferidas, prêmio pago uma vez, pool reduzido pelo pagamento |
| Posições | Ordem circular dos assentos e botão | HU BTN/SB; até 9 PokerStars e 8 GGPoker |

Totais são parâmetros explícitos do cenário. Editar um stack ou payout não
recalcula esses parâmetros. O usuário pode configurar outro total deliberadamente;
enquanto houver falta, excesso ou outra inconsistência, resultados e exports da
bancada são bloqueados. Não há normalização silenciosa. Novo jogador começa com
zero e exige distribuição; assento com fichas não pode ser removido.

Inputs de HH/HRC mantêm o material original. Botão ausente exige seleção; HRC usa
sua ordem implícita de posições, presets são sintéticos. Stacks fracionários que
não se reduzam a ruído numérico de conversão são recusados na bancada física,
incluindo estimativas externas HRC: nenhuma redistribuição é inventada.

Export HRC com ledger usa fichas canônicas, inclusive otherstacks, total e ordem
do botão; não reconstrói esses montantes a partir da exibição em BB. Dados de
bounty continuam fora da valoração por colocações.

## Limite conceitual

Conservar centavos se aplica ao dinheiro distribuível e aos pagamentos. Equidades
ICM e valores esperados permanecem números reais: arredondá-los por jogador antes
de somar criaria resíduos artificiais. Seus resíduos numéricos continuam
auditáveis. Essas garantias contábeis não comprovam hipóteses estratégicas PMev.

Os contratos anteriores sem chipLedger permanecem compatíveis com BB e tolerâncias
anteriores. A bancada modificada sempre envia o ledger; não se declara migração
global de todos os motores ou widgets independentes do website.

## Verificação e continuidade

Casos novos cobrem 20250 fichas, déficit/excesso de uma unidade, frações, limite de
precisão, um centavo em pools grandes, posições, liquidação de eliminados,
preservação de stacks externos, roundtrip HRC e edição real dos controles React.

A inspeção local encontrou estado antigo em BB preservado por Fast Refresh após
a alteração do componente. A versão da chave do editor foi atualizada para
reinicializar os inputs; o teste verifica stacks iniciais em fichas. O guard
impediu cálculo do estado antigo inconsistente antes dessa reinicialização.

Alterações permanecem locais para revisão e publicação posterior pelo protocolo
canônico. Os arquivos preexistentes em reports/agent-calibration/daily de 09 e 10
de setembro não fazem parte desta entrega.

Assinatura técnica e auditoria: **Chat GPT-6 Astra <noreply@openai.com>**.
