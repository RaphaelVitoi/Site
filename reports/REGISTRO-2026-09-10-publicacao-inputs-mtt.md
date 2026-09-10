---
id: registro-2026-09-10-publicacao-inputs-mtt
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-10'
classes: [interno, auditoria, publicacao]
caminhos:
  - frontend/package.json
  - package-lock.json
  - frontend/tsconfig.worker.json
  - frontend/src/lib/chipLedger.ts
  - frontend/src/lib/fieldModel.ts
  - frontend/src/lib/fieldCompletion.ts
  - frontend/src/lib/hrcArchive.ts
config_medida:
  baseline_head: 4715d51067a7239e746d4c3c842f1759e49dfeca
  branch: master
revisoes_de_ancora:
  - registro: registro-2026-09-09-mtt-contexto-completo-hh-hrc
    caminhos: [frontend/tsconfig.worker.json]
    parecer: Acrescentados chipLedger e fieldModel ao include pois sao dependencias transitivas de hrcFormat e tournamentContext. O projeto composto passa a conferir os contratos novos sem incluir fontes React no worker.
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos: [package-lock.json]
    parecer: Lock acrescenta somente fflate 0.8.3 e metadado hasInstallScript correspondente ao postinstall existente; nenhuma versao anterior ou fusao estrutural foi revertida.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos: [package-lock.json]
    parecer: Nova dependencia altera fingerprint do frontend. Certificado CWV historico nao e reutilizado como medicao desta publicacao; integridade fflate consta do lock.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos: [frontend/package.json]
    parecer: Acrescentado fflate para leitura local de saves HRC; hierarquia de agentes e configuracoes de modelos preservadas. Audit npm atual acompanha os gates.
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos: [package-lock.json]
    parecer: Versao corrigida de fast-uri preservada. fflate e dependencia adicional para descompactar settings HRC, sem transformar estrategia importada em evidencia empirica.
  - registro: registro-2026-09-08-adaptacao-gemini-flash-e-saneamento-amostragem
    caminhos: [frontend/package.json, package-lock.json]
    parecer: Acrescentado fflate 0.8.3 sem modificar roteamento, amostragem ou integracoes Gemini; metadado de script apenas reflete postinstall ja existente.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos: [frontend/package.json]
    parecer: Mudanca limitada a dependencia fflate; governanca e topologia descritas no registro permanecem intactas. Estado de vulnerabilidades e verificado novamente.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos: [frontend/package.json]
    parecer: Dependencia fflate adicionada para importacao HRC. Metricas quantitativas historicas nao sao promovidas a resultados atuais; controles desta publicacao sao separados.
  - registro: registro-2026-09-09-publicacao-bancadas-pmev
    caminhos:
      - frontend/src/components/simulator/panels/EquityCalculator.tsx
      - frontend/src/components/simulator/panels/IcmTransitionPanel.tsx
      - frontend/src/lib/counterfactualExperiment.ts
      - frontend/src/lib/icmTransitionExperiment.ts
    parecer: Bancadas passam a receber ledger opcional de fichas e proveniencia de field; conservacao exata e pagamentos unicos verificados. Contratos legados BB preservados; nao ha nova validacao empirica PMev.
verificado:
  - Baseline local e origin/master iguais apos fetch.
  - 381 testes frontend aprovados na fase funcional, com TypeScript audit e ESLint.
  - Revisao dos diffs e reconciliacao das ancoras afetadas.
nao_verificado:
  - Equivalencia com Auto Shape HRC e precisao estatistica da estimativa de restantes.
  - CWV, acessibilidade integral e CI remoto desta publicacao.
referencias_nao_resolviveis: []
---

# Publicacao dos inputs MTT e conservacao

Autorizacao de Raphael nesta conversa para relatorio, commit e push.

Entrega consolidada:
- Fichas inteiras como unidade canonica, BB visual, posicoes por botao e assentos.
- Payouts monetarios e conservacao da premiacao em centavos.
- Entradas HH e HRC visiveis; leitura local de settings.json em saves comprimidos.
- Field sugerido por estrutura + HH, distribuicao externa explicita e proveniencia.
- Materializacao conservativa de estimativas HRC fracionarias sem apagar a fonte.

Registros detalhados:
- [Fichas, posicoes e premiacao](REGISTRO-2026-09-10-fichas-posicoes-premiacao.md).
- [Importacao HH e HRC](REGISTRO-2026-09-10-importacao-visivel-hh-hrc.md).
- [Estimativa de field e capturas confirmadas](REGISTRO-2026-09-10-estimativa-field-estrutura-hh.md).

O preflight integrado detectou modulos novos ausentes no include do projeto
worker, nao detectados pelo typecheck audit. Incluidos chipLedger e fieldModel
no projeto worker. YAML invalido do registro de estimativa tambem foi corrigido.
O script npm Actionlint usa substituicao de shell incompativel com cmd; a mesma
lista de workflows sera expandida pelo PowerShell para executar a ferramenta.

Os dois arquivos preexistentes de reports/agent-calibration/daily de 09 e 10 de
setembro ficam fora do commit. Nenhuma assinatura externa foi reatribuida.

O recibo apos publicacao, com SHA e estado remoto, sera salvo em
reports/cwv/FECHAMENTO-INPUTS-MTT-2026-09-10.txt (pasta local ignorada pelo Git).

Continuacao: comparar dez otherstacks exportados do cenario de 19 restantes com
o gerador local, mantendo mesa, total e payouts fixos; investigar Auto Shape
0.53 sem inferir sua formula pela aparencia do grafico. Manter modelagem e
observacao distinguidas nos inputs, motores e outputs.

Assinatura tecnica e auditoria: Chat GPT-6 Astra <noreply@openai.com>.

## Resultado do preflight consolidado

A segunda execucao de npm run sota:full terminou com exit 0. Ruff, Pyright,
ESLint, Markdown e TypeScript composto aprovados; 381 testes frontend em 48
suites e 1077 testes Python aprovados. Um teste Python pulado porque nao ha
arvore declarada superada para excluir; nao conta como aprovacao. Pyright
informou disponibilidade de versao nova, sem erros de tipos.

Actionlint aprovado com os caminhos versionados expandidos pelo PowerShell.
Portao de registros aprovado para os 24 arquivos preparados. A primeira
tentativa integrada falhou no include worker e foi corrigida; nao se atribui
sucesso a essa tentativa.

Gate PowerShell de cinco fases com exit 0, zero erros e dois avisos, estado
FRAGIL. CWV e axe nao medidos por ausencia de CDP utilizavel; npm sem CVEs,
quatro aceites Python preexistentes, integridade SRI/SHA512 e higiene aprovadas.
Artefato desta medicao: reports/cwv/cwv_report_20260910_063545.md.

Hooks reais de commit e push serao executados sem bypass; o recibo posterior
com seus resultados e confirmacao remota fica no caminho de fechamento acima.

O primeiro hook de commit aprovou qualidade, mas barrou tres registros de classe
medido sem config_medida. Acrescentados baseline, branch e raiz aos tres; o
portao de ancoras passou em seguida. Nenhum codigo de produto mudou nessa correcao.
