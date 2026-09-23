---
id: auditoria-2026-09-23-calibracao-terra-e-gate-cwv
tipo: auditoria
escopo: Site — calibração de agentes e portão CWV/A11y
ecossistema: nexus-sota
autor: Codex GPT-6 Luna <noreply@openai.com>
criado_em: '2026-09-23T00:38:49-03:00'
atualizado_em: '2026-09-23T15:00:00-03:00'
classes: [interno, medido, governanca, calibracao, cwv, acessibilidade]
caminhos:
  - reports/agent-calibration/daily/2026-09-23.md
  - reports/agent-calibration/daily/2026-09-22.json
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/agent-calibration/outlier-evidence-ledger.jsonl
  - reports/HANDOFF-2026-09-17-interceptacao-da-reincidencia-e-uniao-da-evidencia.md
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/runtime_quality_probe.mjs
  - data/a11y_manual_review_baselines.json
  - reports/cwv/cwv_report_20260923_003655.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 461418a8a08b769f9cd8839741115effc7370598
  host: Windows; PowerShell 7; Python 3.13.15 isolated environment; Chrome 156 via CDP 9223
  data_das_medicoes: 2026-09-23
verificado:
  - ledger de feedback íntegro -- 82 registros, hash final 951222875bd3bc1c946134f72b64f5ba3d80a2f5489a3e347431ad2ddf8de5fd
  - ledger de outliers íntegro -- 14 registros, hash final dff3560fc2ffc4aee6aeebaf3f5ab02bb125f24ca60d7572ba2ba4424f1f560d
  - evidência diária confirma 2 sessões distintas elegíveis desde a calibração, abaixo do mínimo de 3; nenhuma calibração nova; três feedbacks nessas duas sessões
  - portão CWV executado contra frontend local ativo; cinco fases sem erros ou warnings
  - axe-core no DOM atual -- 0 violações e 1 incompleto; baseline humano Tier 0 aceito na janela de 30 dias
  - regressão de relatório Lighthouse ausente corrigida; 27 testes direcionados passaram e AST PowerShell validada
  - núcleo MCP verificado após sincronização -- três verificações consecutivas sem deriva
nao_verificado:
  - efeito causal da calibração registrada em 17/09
  - confirmação independente de padrão comum nos dois feedbacks elegíveis
  - origem do warning remanescente na execução integral final; não foi silenciado
  - job Python 3.12 do CI exato, cancelado por fail-fast após falha de 3.13
  - format-on-save e renderização da configuração dentro da janela aberta do Antigravity/VS Code; inventário CUA não expôs essa janela
  - axe em rotas além de http://localhost:3000/ e estados dinâmicos além da amostra medida
decisoes:
  - preservar o relatório original de GPT-5.6 Terra; registrar a avaliação em separado, sem reescrever sua autoria ou decisão
  - não renovar a data da aprovação humana enquanto a decisão de 15/09 permanece válida até 15/10
  - aprovação de revisão humana de itens incompletos não dispensa nem cacheia a execução do axe em commits futuros
  - nenhuma das cinco pendências ativas foi declarada resolvida
---

# Auditoria — relatório Terra 5.6 e gate CWV/A11y

## Parecer executivo

O relatório diário de 23/09 está substancialmente coerente com os ledgers e conclui corretamente **“dados insuficientes — nenhuma calibração planejada”**. Não encontrei base para promover uma nova microcalibração nem para encerrar as pendências técnicas listadas no handoff de 17/09. Preservei o documento original de Terra intacto; este parecer é um registro independente, não uma edição retroativa.

## Auditoria da evidência de calibração

| Afirmação do relatório | Verificação independente | Parecer |
| :--- | :--- | :--- |
| Feedback: cadeia válida, 81 registros | `Test-AgentCalibrationLedger.ps1`: status `valid`, 81; hash final igual ao relatório | Confirmada |
| Outliers: cadeia válida, 14 registros | Mesmo verificador contra `outlier-evidence-ledger.jsonl`: status `valid`, 14; hash igual | Confirmada |
| Há 2 sessões elegíveis desde a calibração de sequência 78 | `reports/agent-calibration/daily/2026-09-22.json` lista sequências/eventos 79 e 80; JSON válido | Confirmada; uma sessão ainda falta para o limiar de 3 |
| Os dois feedbacks são relacionados, mas não provam o mesmo padrão | Comentários mencionam proatividade/contextualização e também burocracia/latência | Interpretação prudente; sem agrupamento automático |
| Efeito causal da calibração de 17/09 ainda não pode ser julgado | Duas sessões, sem comparação direta suficiente com o comportamento-alvo `linear-reativo` | Confirmada como não verificada |
| Nenhum outlier novo no intervalo e os três citados seguem fora do índice | O relatório não altera o ledger; o hash-chain permanece íntegro | Sem mutação; não equivale a nova análise causal dos outliers |

**Tratamento:** manter o relatório Terra como evidência original, sem marcar qualquer pendência como resolvida, sem escrever evento de calibração e sem acrescentar feedback. O registro diário de 22/09 alterado contém a nota 9,8 já registrada na sequência 80; essa evidência é preservada e não é duplicada nesta auditoria.

## Aprovação humana e validade de 30 dias

O `axe-core` foi executado hoje sobre a página local: zero violações confirmadas e um item inconclusivo. O gate aceitou a revisão `a11y-color-contrast-downward-drift-20260901`, com autoridade `Tier 0 — Raphael Vitoi`, registrada em 15/09/2026. A janela de 30 dias ainda está vigente; portanto, **não alterei `reviewed_at` nem renovei artificialmente a decisão**. O teste de hoje renova a evidência de execução, não a data da revisão humana.

Distinção operacional importante: o registro de revisão humana resolve apenas a decisão sobre itens `axe` inconclusivos e cobre uma janela de validade; o `axe` ainda executa em cada gate. O projeto não tem atualmente certificado que reutilize resultados do `axe` por 30 dias. Para evitar varredura em todo commit sem abrir falso-verde, seria necessário um cache versionado por hash completo de inputs, rota, versão do axe e ambiente, com reexecução imediata quando qualquer dimensão mudar. Não o implementei nesta alteração.

## Defeito corrigido no relatório do gate

O artefato Lighthouse presente não contém `accessibility_score`, nem categoria Lighthouse de acessibilidade. O relatório anterior convertia o campo ausente em `0/100`, transformando “não medido” em um resultado numérico falso. `scripts/ops/cwv_gate.ps1` agora verifica a presença e o valor do campo antes de imprimir ou renderizar uma pontuação; campo ausente é mostrado como `NAO MEDIDO`. A medição `axe` do DOM continua independente. A regressão está coberta em `tests/test_cwv_gate_truthfulness.py`.

## Limites

- Feedback intrassessão do usuário: 6,5/10. Apontou lentidão/ineficiência, trabalho periférico/delegável, repetição integral de testes, rigidez e desperdício de tempo, energia cognitiva e tokens. O 9,8 anterior (seq. 80) e o 6,5 (seq. 81) são da mesma sessão e não constituem amostras independentes.
- A execução integral anterior reprovou em dois testes de `tests/test_dashboard_notifications.py`. Após os ajustes de recursos, a execução integral final terminou com saída zero: 1709 passaram, 5 foram pulados e 1 warning permaneceu; cobertura total de 71,79%. A origem do warning não ficou visível no resumo capturado e não é declarada resolvida. Não foi iniciada outra execução manual.

- O resultado local é uma amostra da rota `http://localhost:3000/`, não uma aprovação de todas as rotas ou da produção.
- O axe do DOM atual retornou um item incompleto, não uma violação confirmada; a autorização humana existente não torna o resultado geral uma certificação de acessibilidade de todo o site.
- O CI remoto do commit-base `461418a8` está vermelho: Python 3.13 reprovou a suíte por quatro `ResourceWarning`; Python 3.12 foi cancelado por fail-fast. A causa dos avisos permanece não isolada e nenhuma supressão foi adicionada.
- A identificação do autor do relatório diário foi preservada como foi recebida (`GPT-5.6 Terra`). A identidade correspondente no catálogo é `Codex GPT-5.6`, modelo `gpt-5.6-terra`, veículo `codex`; esta auditoria não reescreve a autoria do artefato de origem.

## Atualização da suíte integral — 23/09/2026

A suíte Python 3.13 foi executada uma vez nesta continuação após os ajustes de fechamento de conexões SQLite e isolamento dos processos auxiliares dos testes. Resultado observado: 1709 passed, 5 skipped, 1 warning, cobertura total 71,79%, saída zero. Os skips declarados correspondem à ausência de árvore supersedida, CUDA indisponível e extensão quantum não compilada. O warning remanescente requer diagnóstico; o resultado não foi convertido em afirmação de execução sem warnings. O CI remoto consultado anteriormente é do commit-base e não valida esta árvore.
