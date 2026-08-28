---
id: handoff-2026-08-28-calibracao-agentica-quantitativa
tipo: handoff
escopo: Site
autor: codex@gpt-5.6
criado_em: 2026-08-28T12:00:00-03:00
estado: parcial-com-evidencia
classes: [interno, auditavel, quantitativo]
commit: nao-criado
verificado:
  - "mecanismo de calibracao em microdose possui gate diario: tres feedbacks, duas sessoes identificadas e duas confirmacoes independentes do padrao"
  - "Monte Carlo puro Rust/WASM foi invocado pelo adaptador com AA contra KK, 10000 iteracoes e seed 424242, nos runtimes PowerShell 7+ e 5.1"
  - "CFR puro iterativo processou matriz de 169 celulas em 32 iteracoes, nos runtimes PowerShell 7+ e 5.1"
  - "ledger de outliers separado valida cadeias criadas em PowerShell 7+ e 5.1 nos dois runtimes, preservando timestamp ISO literal no hash canonico"
  - "fallbacks Monte Carlo ICM TypeScript e CFR unitario Python foram invocados com parametros declarados e permanecem rotulados como fallback"
  - "protocolo nexus agent handoff para chico executado; resultado parcial salvo em memoria de agente"
  - "npm run sota:full aprovado: 508 passed em 32.46s, zero erros e warnings"
  - "git diff --check aprovado"
nao_verificado:
  - "nenhum feedback real foi registrado no ledger; nao ha calibracao aplicada nem resultado longitudinal para validar"
  - "Monte Carlo e CFR nao sao modelos de evidencia comportamental e nao foram validados para inferir vieses do agente sem parametros e evidencia declarados"
  - "o launcher legado do.ps1 Handoff delega a uma rotina ausente; o protocolo funcional foi executado pelo CLI canonico"
  - "o handoff cognitivo canonico trouxe 1 de 4 fontes; tres fontes de governanca permanecem ausentes e nao foram criadas nesta subsessao"
---

# Handoff — calibração agêntica quantitativa

## Estado entregue

O mecanismo de calibração agêntica agora opera com três separações que não
podem ser colapsadas:

\[
\text{evidência observada}
\neq
\text{simulação quantitativa}
\neq
\text{decisão de calibrar}
\]

O ciclo diário observa recursivamente os feedbacks e o efeito anterior; audita
precursivamente uma hipótese bayesiano-preditiva; e só planeja uma única
microcalibração procedimental para o dia seguinte quando o portão de
suficiência for satisfeito. O ciclo posterior valida, ajusta ou reverte a
hipótese. Sem amostra, recorrência independente ou cadeia válida, o registro
obrigatório é `dados insuficientes — nenhuma calibração planejada`.

## Motores quantitativos integrados

| Prioridade | Motor | Fonte verificada | Papel na hipótese | Limite explícito |
|---:|---|---|---|---|
| 1 | Monte Carlo puro | `wasm-equity/lib.rs::calculate_equity_monte_carlo_binary` | Sensibilidade estocástica de ranges, board, `kappa`, seed e iterações declarados | Estima equidade de poker; não mede comportamento do agente nem produz evidência factual. |
| 1 | CFR puro iterativo | `frontend/src/components/simulator/workers/cfr.worker.ts` | Matriz de Regret Matching sobre a abstração, pot, stack, `kappa`, nós e iterações declarados | Não demonstra equilíbrio convergido, verdade causal ou adequação autônoma de uma calibração. |
| 2 | Monte Carlo ICM destilado | `frontend/src/lib/montecarlo.ts` | Fallback para cenários ICM declarados | Usa `Math.random` sem seed exposta; não é equivalente ao núcleo Rust/WASM. |
| 2 | CFR unitário destilado | `engine/math_sota.py::cfr_mock_strategy` | Fallback de normalização de regrets contrafactuais declarados | Uma etapa de normalização, não o worker CFR iterativo. |

O adaptador único é
`scripts/ops/Invoke-AgentCalibrationQuantitativeSupport.ps1`. Ele retorna
inputs, fonte, output e limitações em JSON. O relatório diário deve anexar esse
bloco integral quando utilizar um motor; nunca pode apresentar o output como
prova comportamental ou usar o output para abrir o portão de suficiência.

## Outliers: trilha de evidência independente

O outlier não é removido, reduzido a ruído ou anexado automaticamente ao índice
de padrões. `Record-AgentCalibrationOutlier.ps1` grava observação, referências
de origem, métricas, hipótese de origem e hash no ledger independente de
outliers. O estado inicial é
`retained-pending-deterministic-review` e `pattern_indexed: false`.

Monte Carlo e CFR podem filtrar a **incerteza do cenário** e comparar ações
contrafactuais declaradas, respectivamente. Eles não decidem a exclusão nem a
promoção do evento. Mesmo com amostra baixa, um outlier pode representar padrão
de origem específica; a única via de promoção é análise determinística
posterior, reprodutível, com origem, parâmetros e contraprovas, gerando registro
separado de padrão e preservando o outlier original como evidência.

O ledger de outliers foi verificado em matriz cruzada: uma cadeia iniciada em
PowerShell 7+ e uma cadeia iniciada em Windows PowerShell 5.1 foram ambas
validadas nos dois runtimes. O verificador preserva o timestamp ISO literal do
JSON, evitando que a conversão automática para `DateTime` altere o hash em uma
das versões. Os dois ledgers usados nessa prova foram temporários e removidos;
nenhum outlier fictício foi gravado no ledger real.

## Evidência de execução

| Verificação | Resultado observado |
|---|---|
| Monte Carlo puro em PowerShell 7+ | Executou, output de equidade no intervalo $[0,1]$; seed `424242` registrada. |
| Monte Carlo puro em PowerShell 5.1 | Executou com os mesmos parâmetros; o bridge normaliza board vazio para ambos os runtimes. |
| CFR puro em PowerShell 7+ | Executou 32 iterações; matriz de 169 células, mínimo `0`, máximo `1`. |
| CFR puro em PowerShell 5.1 | Executou com o mesmo contrato de matriz. |
| Fallback Monte Carlo ICM | Executou com vetores JSON explícitos; conservou a soma de premiações no cenário de teste. |
| Fallback CFR unitário | Executou; estratégia normalizada somou `1`. |
| Suíte SOTA | `508 passed in 32.46s`; zero erros e warnings. |

## Handoff canônico executado

Comando executado:

```text
.venv\Scripts\python.exe scripts\cli\nexus.py agent handoff --agent chico
```

Resultado: arquivo `.claude/agent-memory/chico/HANDOFF_LATEST.md` atualizado e
copiado ao clipboard. O CLI declarou corretamente **handoff parcial: 1 de 4
fontes**. A fonte disponível foi `MODUS OPERANDI v8.0 GOLD`; não foram
encontrados `GLOBAL_INSTRUCTIONS.md`, `.claude/COSMOVISAO.md` e
`.claude/ARCHITECTURAL_INVARIANTS.md`. Essas ausências permanecem declaradas,
sem criação especulativa nesta subsessão.

## Continuidade segura

1. Ao receber feedback real, registrá-lo exclusivamente com
   `Register-AgentCalibrationFeedback.ps1`, com nota inteira e texto recebido.
2. Às 23:59, validar o ledger e executar a evidência diária antes de qualquer
   análise. Sem gate completo, produzir somente a declaração de insuficiência.
3. Para hipótese quantitativa, declarar a cadeia evidência → parâmetros →
   motor → output → limitação. Usar o núcleo puro como padrão e fallback apenas
   quando o primário não atender ao domínio da hipótese.
4. Não converter a hipótese em fato. Validar a microcalibração no dia seguinte
   contra previsão e contraprova antes de mantê-la ou expandi-la.
5. Antes de novo commit, conferir `git status`, selecionar caminhos
   explicitamente, rodar `git diff --cached --check` e o portão obrigatório.

## Mudanças desta subsessão ainda sem commit

- `CLAUDE.md`
- `.claude/agent-memory/chico/HANDOFF_LATEST.md`
- `reports/agent-calibration/README.md`
- `reports/agent-calibration/RETROSPECTIVA_20260828_PROCESSO_AGENTICO.md`
- `reports/HANDOFF-2026-08-28-calibracao-agentica-quantitativa.md`
- `scripts/ops/New-AgentCalibrationDailyEvidence.ps1`
- `scripts/ops/Register-AgentCalibrationFeedback.ps1`
- `scripts/ops/Test-AgentCalibrationLedger.ps1`
- `scripts/ops/Invoke-AgentCalibrationQuantitativeSupport.ps1`
- `scripts/ops/Record-AgentCalibrationOutlier.ps1`

Nenhum commit ou push foi criado por esta subsessão.
